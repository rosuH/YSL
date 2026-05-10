"""Checks for the local atlas preview helper."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "scripts" / "serve_atlas.py"
MAKEFILE_PATH = ROOT / "Makefile"
WORKFLOW_PATH = ROOT / ".github" / "workflows" / "spider_action.yml"


def test_preview_server_suppresses_cancelled_audio_tracebacks():
    script = SERVER_PATH.read_text(encoding="utf-8")

    assert "BrokenPipeError" in script
    assert "ConnectionResetError" in script
    assert "copyfile" in script


def test_preview_server_enables_address_reuse_before_binding():
    script = SERVER_PATH.read_text(encoding="utf-8")

    assert "class QuietAtlasServer(http.server.ThreadingHTTPServer):" in script
    assert "allow_reuse_address = True" in script
    assert "server = QuietAtlasServer" in script
    assert "server.allow_reuse_address = True" not in script


def test_makefile_exposes_atlas_preview_target():
    makefile = MAKEFILE_PATH.read_text(encoding="utf-8")

    assert "preview-atlas:" in makefile
    assert "scripts/serve_atlas.py 4173" in makefile


def test_makefile_uses_one_python_interpreter_variable():
    makefile = MAKEFILE_PATH.read_text(encoding="utf-8")

    assert "PYTHON ?= python3" in makefile
    assert "\t$(PYTHON) spider.py" in makefile
    assert "\t$(PYTHON) scripts/serve_atlas.py 4173" in makefile
    assert "\t$(PYTHON) scripts/build_atlas_route.py" in makefile
    assert "\tpython " not in makefile
    assert "\tpython3 " not in makefile


def test_makefile_exposes_atlas_route_builder_target():
    makefile = MAKEFILE_PATH.read_text(encoding="utf-8")

    assert "build-atlas-route:" in makefile
    assert "scripts/build_atlas_route.py" in makefile


def test_spider_action_updates_atlas_route_after_crawling_before_commit():
    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")

    spider_step = workflow.index("name: Run Spider")
    route_step = workflow.index("name: Update atlas route")
    commit_step = workflow.index("name: Commit and push changes")

    assert spider_step < route_step < commit_step
    assert "make build-atlas-route" in workflow
    assert "make check-atlas-route" in workflow
