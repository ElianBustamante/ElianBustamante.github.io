import os
import subprocess
import sys
import pytest

class TestEnv:
    def __init__(self, input_dir, output_dir, data_file, captions_file):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.data_file = data_file
        self.captions_file = captions_file

    def __iter__(self):
        return iter((self.input_dir, self.output_dir, self.data_file, self.captions_file))

    def run(self, *extra_args):
        return subprocess.run([
            sys.executable, "scripts/process_photos.py",
            "--input", str(self.input_dir),
            "--output", str(self.output_dir),
            "--data", str(self.data_file),
            "--captions", str(self.captions_file),
            *extra_args
        ], capture_output=True)

@pytest.fixture
def env(tmp_path):
    input_dir = tmp_path / "photos-originals"
    output_dir = tmp_path / "public/photos"
    data_file = tmp_path / "src/data/photos.json"
    captions_file = tmp_path / "src/data/captions.json"

    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir.parent, exist_ok=True)
    os.makedirs(data_file.parent, exist_ok=True)
    os.makedirs(captions_file.parent, exist_ok=True)

    return TestEnv(input_dir, output_dir, data_file, captions_file)

def run_script(input_dir, output_dir, data_file, captions_file, *extra_args):
    return subprocess.run([
        sys.executable, "scripts/process_photos.py",
        "--input", str(input_dir),
        "--output", str(output_dir),
        "--data", str(data_file),
        "--captions", str(captions_file),
        *extra_args
    ], capture_output=True)
