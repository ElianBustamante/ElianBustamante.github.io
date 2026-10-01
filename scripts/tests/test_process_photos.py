import os
import json
import pytest
import subprocess
from PIL import Image
from PIL.TiffImagePlugin import IFDRational

@pytest.fixture
def env(tmp_path):
    input_dir = tmp_path / "photos-originals"
    output_dir = tmp_path / "public/photos"
    data_file = tmp_path / "src/data/photos.json"
    os.makedirs(input_dir)
    os.makedirs(output_dir.parent, exist_ok=True)
    os.makedirs(data_file.parent, exist_ok=True)
    return input_dir, output_dir, data_file

def run_script(input_dir, output_dir, data_file):
    return subprocess.run([
        "python", "scripts/process_photos.py", 
        "--input", str(input_dir), 
        "--output", str(output_dir), 
        "--data", str(data_file)
    ], capture_output=True)

def test_1_horizontal(env):
    input_dir, output_dir, data_file = env
    img = Image.new('RGB', (3000, 2000), color='red')
    img.save(input_dir / "01-horizontal.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['thumb']['width'] == 800
    assert data[0]['large']['width'] == 2400

def test_2_vertical(env):
    input_dir, output_dir, data_file = env
    img = Image.new('RGB', (2000, 3000), color='green')
    img.save(input_dir / "01-vertical.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['large']['height'] == 2400

def test_3_small(env):
    input_dir, output_dir, data_file = env
    img = Image.new('RGB', (1000, 700), color='blue')
    img.save(input_dir / "01-small.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['large']['width'] == 1000
    assert data[0]['large']['height'] == 700

def test_4_gps(env):
    input_dir, output_dir, data_file = env
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
    input_dir, output_dir, data_file = env
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

def test_6_default_captions(env):
    input_dir, output_dir, data_file = env
    img = Image.new('RGB', (2000, 2000), color='red')
    img.save(input_dir / "01-cap.jpg")
    run_script(*env)
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data[0]['alt']['es'] == "Fotografía de paisaje 1"

def test_7_empty_dir(env):
    input_dir, output_dir, data_file = env
    result = run_script(*env)
    assert result.returncode != 0
    assert not os.path.exists(data_file)

def test_8_idempotent_and_orphans(env):
    input_dir, output_dir, data_file = env
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
