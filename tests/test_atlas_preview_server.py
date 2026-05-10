"""Checks for the local atlas preview helper."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "scripts" / "serve_atlas.py"
MAKEFILE_PATH = ROOT / "Makefile"


def test_preview_server_suppresses_cancelled_audio_tracebacks():
    script = SERVER_PATH.read_text(encoding="utf-8")

    assert "BrokenPipeError" in script
    assert "ConnectionResetError" in script
    assert "copyfile" in script


def test_makefile_exposes_atlas_preview_target():
    makefile = MAKEFILE_PATH.read_text(encoding="utf-8")

    assert "preview-atlas:" in makefile
    assert "scripts/serve_atlas.py 4173" in makefile
