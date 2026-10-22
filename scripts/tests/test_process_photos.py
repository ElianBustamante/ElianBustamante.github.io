import os
import json
import pytest
import subprocess
import sys
from PIL import Image
from PIL.TiffImagePlugin import IFDRational

def run_script(input_dir, output_dir, data_file, captions_file, *extra_args):
    return subprocess.run([
        sys.executable, "scripts/process_photos.py", 
        "--input", str(input_dir), 
        "--output", str(output_dir), 
        "--data", str(data_file),
        "--captions", str(captions_file),
        *extra_args
    ], capture_output=True)

def test_1_horizontal(env):
    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (3000, 2000), color='red')
    img.save(input_dir / "01-horizontal.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['file'] == '01-horizontal.jpg'
    assert 'title' not in data[0]
    assert 'alt' not in data[0]
    assert data[0]['thumb']['width'] == 800
    assert data[0]['large']['width'] == 2400

def test_2_vertical(env):
    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (2000, 3000), color='green')
    img.save(input_dir / "01-vertical.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['large']['height'] == 2400

def test_3_small(env):
    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (1000, 700), color='blue')
    img.save(input_dir / "01-small.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['large']['width'] == 1000
    assert data[0]['large']['height'] == 700

def test_4_gps(env):
    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (2000, 2000), color='yellow')
    exif = img.getexif()
    gps_ifd = exif.get_ifd(34853)
    gps_ifd[2] = (IFDRational(33, 1), IFDRational(26, 1), IFDRational(15, 1))
    img.save(input_dir / "01-gps.jpg", exif=exif)
    
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    e_data = data[0]
    assert 'gps' not in e_data
    assert 'latitude' not in e_data
    assert 'longitude' not in e_data
    
    webp_img = Image.open(output_dir / "01-gps-large.webp")
    assert not dict(webp_img.getexif())

def test_5_exif(env):
    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (2000, 2000), color='yellow')
    exif = img.getexif()
    exif[271] = "Nikon" 
    exif[272] = "Nikon D3200" 
    exif_ifd = exif.get_ifd(34665)
    exif_ifd[42036] = "35mm f/1.8" 
    exif_ifd[37386] = 35.0 
    exif_ifd[33437] = 8.0 
    exif_ifd[33434] = 0.004 
    exif_ifd[34855] = 100 
    img.save(input_dir / "01-exif.jpg", exif=exif)
    
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    e_data = data[0]
    
    assert e_data['exif']['camera'] == "Nikon D3200"
    assert e_data['exif']['lens'] == "35mm f/1.8"
    assert e_data['exif']['focalLength'] == "35 mm"
    assert e_data['exif']['aperture'] == "f/8"
    assert e_data['exif']['shutter'] == "1/250 s"
    assert e_data['exif']['iso'] == 100
    
    # Test without EXIF
    img2 = Image.new('RGB', (2000, 2000), color='black')
    img2.save(input_dir / "02-noexif.jpg")
    run_script(*env)
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[1]['exif']['camera'] is None
    assert data[1]['exif']['lens'] is None

def test_5_1_shutter_format(env):
    input_dir, output_dir, data_file, captions_file = env
    from PIL.ExifTags import IFD
    img = Image.new('RGB', (200, 200), color='white')
    exif = img.getexif()
    exif_ifd = exif.get_ifd(34665)
    exif_ifd[33434] = 30.0
    img.save(input_dir / '01-s30.jpg', exif=exif)

    img2 = Image.new('RGB', (200, 200), color='white')
    exif2 = img2.getexif()
    exif2_ifd = exif2.get_ifd(34665)
    exif2_ifd[33434] = 2.5
    img2.save(input_dir / '02-s25.jpg', exif=exif2)

    run_script(*env)
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Sort by id to ensure order matches
    data.sort(key=lambda x: x['id'])
    assert data[0]['exif']['shutter'] == '30 s'
    assert data[1]['exif']['shutter'] == '2.5 s'

def test_6_default_captions(env):
    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (2000, 2000), color='red')
    img.save(input_dir / "01-cap.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['file'] == "01-cap.jpg"
    assert 'alt' not in data[0]
    assert 'title' not in data[0]

    with open(captions_file, 'r', encoding='utf-8') as f:
        caps = json.load(f)
    assert "01-cap.jpg" in caps
    assert caps["01-cap.jpg"]["title"] == {"es": "", "en": ""}
    assert caps["01-cap.jpg"]["alt"] == {"es": "", "en": ""}

def test_7_empty_dir(env):
    input_dir, output_dir, data_file, captions_file = env
    result = run_script(*env)
    assert result.returncode != 0
    assert not os.path.exists(data_file)

def test_8_idempotent_and_orphans(env):
    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (2000, 2000), color='red')
    img.save(input_dir / "01-idem.jpg")
    
    run_script(*env)
    with open(data_file, 'r', encoding='utf-8') as f:
        data1 = json.load(f)
        
    os.makedirs(output_dir, exist_ok=True)
    with open(output_dir / "orphan.webp", "wb") as f:
        f.write(b"dummy")
        
    run_script(*env)
    with open(data_file, 'r', encoding='utf-8') as f:
        data2 = json.load(f)
        
    assert data1 == data2
    assert not os.path.exists(output_dir / "orphan.webp")

def test_9_guard_repo_captions_untouched(env):
    import hashlib
    repo_captions = os.path.join('src', 'data', 'captions.json')
    existed_before = os.path.exists(repo_captions)
    hash_before = None
    mtime_before = None
    if existed_before:
        mtime_before = os.path.getmtime(repo_captions)
        with open(repo_captions, 'rb') as f_repo:
            hash_before = hashlib.sha256(f_repo.read()).hexdigest()

    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (100, 100), color='purple')
    img.save(input_dir / '01-guard.jpg')

    result = run_script(*env)
    assert result.returncode == 0

    existed_after = os.path.exists(repo_captions)
    assert existed_after == existed_before

    if existed_before:
        mtime_after = os.path.getmtime(repo_captions)
        with open(repo_captions, 'rb') as f_repo:
            hash_after = hashlib.sha256(f_repo.read()).hexdigest()
        assert mtime_after == mtime_before
        assert hash_after == hash_before


def test_10_default_captions_and_repo_untouched(env):
    import hashlib
    import sys
    scripts_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)
    from process_photos import build_parser

    parser = build_parser()
    assert parser.get_default('captions') == 'src/data/captions.json'
    assert parser.parse_args([]).captions == 'src/data/captions.json'

    paths = [
        os.path.join('photos-originals', 'captions.json'),
        os.path.join('src', 'data', 'captions.json')
    ]
    before_state = {}
    for p in paths:
        existed = os.path.exists(p)
        mtime = os.path.getmtime(p) if existed else None
        h = hashlib.sha256(open(p, 'rb').read()).hexdigest() if existed else None
        before_state[p] = (existed, mtime, h)

    input_dir, output_dir, data_file, captions_file = env
    img = Image.new('RGB', (100, 100), color='orange')
    img.save(input_dir / '01-isolated.jpg')

    result = run_script(*env)
    assert result.returncode == 0

    for p in paths:
        existed_after = os.path.exists(p)
        mtime_after = os.path.getmtime(p) if existed_after else None
        h_after = hashlib.sha256(open(p, 'rb').read()).hexdigest() if existed_after else None
        assert (existed_after, mtime_after, h_after) == before_state[p], f'File {p} state changed!'
