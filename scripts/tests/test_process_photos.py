import os
import json
import pytest
import subprocess
from PIL import Image, ExifTags

def test_process_photos(tmp_path):
    input_dir = tmp_path / "photos-originals"
    output_dir = tmp_path / "public/photos"
    data_file = tmp_path / "src/data/photos.json"
    
    os.makedirs(input_dir)
    os.makedirs(output_dir.parent)
    os.makedirs(data_file.parent)
    
    # 1. Horizontal image 3000x2000
    img1 = Image.new('RGB', (3000, 2000), color='red')
    img1.save(input_dir / "01-horizontal.jpg")
    
    # 2. Vertical image 2000x3000
    img2 = Image.new('RGB', (2000, 3000), color='green')
    img2.save(input_dir / "02-vertical.jpg")
    
    # 3. Small image 1000x700
    img3 = Image.new('RGB', (1000, 700), color='blue')
    img3.save(input_dir / "03-small.jpg")
    
    # 4. GPS and camera EXIF
    img4 = Image.new('RGB', (2000, 2000), color='yellow')
    exif = img4.getexif()
    exif[271] = "Nikon" # Make
    exif[272] = "Nikon D3200" # Model (starts with Make)
    # create IFD for Exif
    exif_ifd = exif.get_ifd(34665)
    exif_ifd[42036] = "35mm f/1.8" # LensModel
    exif_ifd[37386] = 35.0 # FocalLength
    exif_ifd[33437] = 8.0 # FNumber
    exif_ifd[33434] = 0.004 # ExposureTime (1/250)
    exif_ifd[34855] = 100 # ISO
    
    from PIL.TiffImagePlugin import IFDRational
    # add GPS
    gps_ifd = exif.get_ifd(34853)
    gps_ifd[2] = (IFDRational(33, 1), IFDRational(26, 1), IFDRational(15, 1)) # Latitude
    
    img4.save(input_dir / "04-exif.jpg", exif=exif)
    
    # 7. Test empty directory
    empty_dir = tmp_path / "empty"
    os.makedirs(empty_dir)
    result = subprocess.run(["python", "scripts/process_photos.py", "--input", str(empty_dir), "--output", str(output_dir), "--data", str(data_file)], capture_output=True)
    assert result.returncode != 0
    assert not os.path.exists(data_file)
    
    # Run the script normally
    result = subprocess.run(["python", "scripts/process_photos.py", "--input", str(input_dir), "--output", str(output_dir), "--data", str(data_file)], capture_output=True)
    assert result.returncode == 0
    
    assert os.path.exists(data_file)
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    assert len(data) == 4
    
    # 1. horizontal
    h_data = data[0]
    assert h_data['thumb']['width'] == 800
    assert h_data['large']['width'] == 2400
    
    # 2. vertical
    v_data = data[1]
    assert v_data['large']['height'] == 2400
    
    # 3. small
    s_data = data[2]
    assert s_data['large']['width'] == 1000
    assert s_data['large']['height'] == 700
    
    # 4. EXIF & GPS
    e_data = data[3]
    # Verify no GPS in JSON
    assert 'gps' not in e_data
    assert 'latitude' not in e_data
    assert 'longitude' not in e_data
    
    # Verify EXIF format
    assert e_data['exif']['camera'] == "Nikon D3200"
    assert e_data['exif']['lens'] == "35mm f/1.8"
    assert e_data['exif']['focalLength'] == "35 mm"
    assert e_data['exif']['aperture'] == "f/8"
    assert e_data['exif']['shutter'] == "1/250 s"
    assert e_data['exif']['iso'] == 100
    
    # Verify webp has no EXIF
    webp_img = Image.open(output_dir / "04-exif-large.webp")
    assert not dict(webp_img.getexif())
    
    # 6. Default captions
    assert h_data['alt']['es'] == "Fotografía de paisaje 1"
    
    # 8. Idempotent and no orphans
    # Add a dummy webp to output
    with open(output_dir / "orphan.webp", "wb") as f:
        f.write(b"dummy")
        
    result = subprocess.run(["python", "scripts/process_photos.py", "--input", str(input_dir), "--output", str(output_dir), "--data", str(data_file)], capture_output=True)
    assert result.returncode == 0
    
    assert not os.path.exists(output_dir / "orphan.webp")
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data2 = json.load(f)
    assert data == data2
