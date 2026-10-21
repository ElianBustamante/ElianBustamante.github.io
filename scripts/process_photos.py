import argparse
import os
import glob
import re
import json
import math
import sys
from PIL import Image, ImageOps, ImageCms
from PIL.ExifTags import TAGS, IFD

def get_id(filename):
    name, _ = os.path.splitext(filename)
    name = name.lower()
    name = re.sub(r'[^a-z0-9]+', '-', name)
    return name.strip('-')

def _non_empty_str(val):
    if isinstance(val, str):
        if val.strip():
            return val
    return None

def resolve_caption(caption, idx):
    if not isinstance(caption, dict):
        caption = {}

    raw_title = caption.get("title")
    if not isinstance(raw_title, dict):
        raw_title = {}

    raw_alt = caption.get("alt")
    if not isinstance(raw_alt, dict):
        raw_alt = {}

    title = {
        "es": _non_empty_str(raw_title.get("es")),
        "en": _non_empty_str(raw_title.get("en"))
    }
    alt = {
        "es": _non_empty_str(raw_alt.get("es")) or f"Fotografía de paisaje {idx}",
        "en": _non_empty_str(raw_alt.get("en")) or f"Landscape photograph {idx}"
    }
    return title, alt

def parse_exif(exif):
    data = {
        "camera": None,
        "lens": None,
        "focalLength": None,
        "aperture": None,
        "shutter": None,
        "iso": None
    }
    if not exif:
        return data

    make = exif.get(271)
    model = exif.get(272)
    if make and model:
        make = str(make).strip()
        model = str(model).strip()
        if model.startswith(make):
            data["camera"] = model
        else:
            data["camera"] = f"{make} {model}"
    elif model:
        data["camera"] = str(model).strip()
    elif make:
        data["camera"] = str(make).strip()

    if 34665 in exif:
        exif_ifd = exif.get_ifd(34665)
        lens = exif_ifd.get(42036)
        if lens:
            data["lens"] = str(lens).strip()

        focal = exif_ifd.get(37386)
        if focal is not None:
            data["focalLength"] = f"{round(float(focal))} mm"

        fnum = exif_ifd.get(33437)
        if fnum is not None:
            fnum_val = float(fnum)
            if fnum_val == int(fnum_val):
                data["aperture"] = f"f/{int(fnum_val)}"
            else:
                formatted = f"f/{fnum_val:.1f}"
                if formatted.endswith(".0"):
                    formatted = formatted[:-2]
                data["aperture"] = formatted

        shutter = exif_ifd.get(33434)
        if shutter is not None:
            t = float(shutter)
            if t < 1 and t > 0:
                data["shutter"] = f"1/{round(1/t)} s"
            else:
                if t.is_integer():
                    data["shutter"] = f"{int(t)} s"
                else:
                    data["shutter"] = f"{t} s"

        iso = exif_ifd.get(34855)
        if iso is not None:
            try:
                if isinstance(iso, tuple):
                    iso = iso[0]
                data["iso"] = int(iso)
            except (ValueError, TypeError):
                pass
                
    return data

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="photos-originals")
    parser.add_argument("--output", default="public/photos")
    parser.add_argument("--data", default="src/data/photos.json")
    parser.add_argument("--captions", default="photos-originals/captions.json")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input directory {args.input} does not exist.")
        sys.exit(1)

    all_files = sorted(os.listdir(args.input))
    valid_exts = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
    
    images_to_process = []
    for f in all_files:
        path = os.path.join(args.input, f)
        if not os.path.isfile(path):
            continue
        ext = os.path.splitext(f)[1].lower()
        if ext in valid_exts:
            images_to_process.append(f)
        elif ext != ".json" and ext != "":
            print(f"Warning: Skipping {f} (unsupported format).")

    if not images_to_process:
        print("Error: No valid images found in input directory.")
        sys.exit(1)

    captions = {}
    if os.path.exists(args.captions):
        try:
            with open(args.captions, "r", encoding="utf-8") as f:
                loaded_captions = json.load(f)
        except Exception as e:
            print(f"Error: Could not parse captions file '{args.captions}' as valid JSON: {e}")
            sys.exit(1)
        if not isinstance(loaded_captions, dict):
            print(f"Error: Captions file '{args.captions}' must contain a JSON object.")
            sys.exit(1)
        captions = loaded_captions

    os.makedirs(args.output, exist_ok=True)
    data_dir = os.path.dirname(args.data)
    if data_dir:
        os.makedirs(data_dir, exist_ok=True)

    for f in glob.glob(os.path.join(args.output, "*.webp")):
        try:
            os.remove(f)
        except OSError:
            pass

    photos_data = []
    processed_files = []
    untitled_es = []
    large_warnings = 0
    
    for idx, filename in enumerate(images_to_process, start=1):
        filepath = os.path.join(args.input, filename)
        try:
            with Image.open(filepath) as img:
                exif = img.getexif()
                exif_data = parse_exif(exif)

                img = ImageOps.exif_transpose(img)

                icc = img.info.get("icc_profile")
                if icc:
                    try:
                        from io import BytesIO
                        icc_io = BytesIO(icc)
                        src_profile = ImageCms.ImageCmsProfile(icc_io)
                        dst_profile = ImageCms.createProfile("sRGB")
                        img = ImageCms.profileToProfile(img, src_profile, dst_profile)
                    except Exception as e:
                        pass
                img = img.convert("RGB")

                img_id = get_id(filename)
                
                thumb_w = min(img.width, 800)
                thumb_h = int(img.height * (thumb_w / img.width))
                thumb_img = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                thumb_name = f"{img_id}-thumb.webp"
                thumb_path = os.path.join(args.output, thumb_name)
                thumb_img.save(thumb_path, format="WebP", quality=78, method=6)

                max_dim = max(img.width, img.height)
                if max_dim > 2400:
                    scale = 2400 / max_dim
                    large_w = int(img.width * scale)
                    large_h = int(img.height * scale)
                else:
                    large_w = img.width
                    large_h = img.height
                    
                large_img = img.resize((large_w, large_h), Image.Resampling.LANCZOS)
                large_name = f"{img_id}-large.webp"
                large_path = os.path.join(args.output, large_name)
                large_img.save(large_path, format="WebP", quality=85, method=6)
                
                if os.path.getsize(large_path) > 900 * 1024:
                    large_warnings += 1

                title, alt = resolve_caption(captions.get(filename), idx)
                if title["es"] is None:
                    untitled_es.append(filename)

                photos_data.append({
                    "id": img_id,
                    "thumb": {
                        "src": f"/photos/{thumb_name}",
                        "width": thumb_w,
                        "height": thumb_h
                    },
                    "large": {
                        "src": f"/photos/{large_name}",
                        "width": large_w,
                        "height": large_h
                    },
                    "alt": alt,
                    "title": title,
                    "exif": exif_data
                })
                processed_files.append(filename)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    with open(args.data, "w", encoding="utf-8") as f:
        json.dump(photos_data, f, ensure_ascii=False, indent=2)

    new_keys = sorted([f for f in processed_files if f not in captions])
    if new_keys:
        for f in new_keys:
            captions[f] = {
                "title": {"es": "", "en": ""},
                "alt": {"es": "", "en": ""}
            }
        captions_dir = os.path.dirname(args.captions)
        if captions_dir:
            os.makedirs(captions_dir, exist_ok=True)
        with open(args.captions, "w", encoding="utf-8") as f:
            json.dump(captions, f, ensure_ascii=False, indent=2)
            f.write("\n")

    total_bytes = sum(os.path.getsize(os.path.join(args.output, f)) for f in os.listdir(args.output) if f.endswith(".webp"))
    total_mb = total_bytes / (1024 * 1024)

    print(f"Processed {len(images_to_process)} photos.")
    print(f"Total output size: {total_mb:.2f} MB")
    print(f"Entradas nuevas agregadas a captions: {len(new_keys)}")

    if untitled_es:
        print(f"Fotos sin título (ES): {', '.join(untitled_es)}")
        print("Rellénalos en captions.json y vuelve a correr `npm run photos`.")
    
    if large_warnings > 0:
        print(f"Warning: {large_warnings} large images exceed 900 KB.")
    if total_mb > 15:
        print(f"Warning: Total output size exceeds 15 MB.")

if __name__ == "__main__":
    main()
