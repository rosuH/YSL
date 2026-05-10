"""Tests for generating atlas route entries from crawler output."""

import json
import subprocess
import sys
from pathlib import Path

from scripts.build_atlas_route import discover_media, merge_route

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "build_atlas_route.py"


def test_discover_media_pairs_audio_with_same_folder_image_and_ignores_site_files(tmp_path):
    (tmp_path / "American Coots").mkdir()
    (tmp_path / "American Coots" / "American Coots.mp3").write_bytes(b"audio")
    (tmp_path / "American Coots" / "American Coots_NPS.jpg").write_bytes(b"image")
    (tmp_path / "atlas").mkdir()
    (tmp_path / "atlas" / "ignored.mp3").write_bytes(b"not sound library media")
    (tmp_path / ".git").mkdir()
    (tmp_path / ".git" / "ignored.mp3").write_bytes(b"not sound library media")

    media = discover_media(tmp_path)

    assert len(media) == 1
    assert media[0]["audioPath"] == "American Coots/American Coots.mp3"
    assert media[0]["imagePath"] == "American Coots/American Coots_NPS.jpg"
    assert media[0]["title"] == "American Coots"


def test_merge_route_preserves_curated_stops_and_appends_publishable_entries(tmp_path):
    existing_route = [
        {
            "id": "american-coots",
            "title": "American Coots",
            "timeOfDay": "Dawn",
            "theme": "Birds",
            "zoneLabel": "Wetland Margin",
            "audioPath": "American Coots/American Coots.mp3",
            "description": "A curated field note.",
            "credit": "Audio and image courtesy of National Park Service.",
            "imagePath": "American Coots/American Coots_NPS.jpg",
        }
    ]
    (tmp_path / "American Coots").mkdir()
    (tmp_path / "American Coots" / "American Coots.mp3").write_bytes(b"audio")
    (tmp_path / "New Spring").mkdir()
    (tmp_path / "New Spring" / "Sound Library - New Spring.mp3").write_bytes(b"new audio")
    (tmp_path / "New Spring" / "Sound Library - New Spring_NPS.jpg").write_bytes(b"new image")

    merged = merge_route(existing_route, discover_media(tmp_path))

    assert merged[0] == existing_route[0]
    assert len(merged) == 2
    generated = merged[1]
    assert generated["id"] == "new-spring"
    assert generated["title"] == "New Spring"
    assert generated["theme"] == "Thermal"
    assert generated["timeOfDay"] == "Midday"
    assert generated["zoneLabel"] == "Sound library specimen"
    assert generated["audioPath"] == "New Spring/Sound Library - New Spring.mp3"
    assert generated["imagePath"] == "New Spring/Sound Library - New Spring_NPS.jpg"
    assert "draft" not in generated
    assert "review" not in generated["description"].lower()


def test_builder_output_can_be_serialized_as_route_json(tmp_path):
    (tmp_path / "New Spring").mkdir()
    (tmp_path / "New Spring" / "Sound Library - New Spring.mp3").write_bytes(b"new audio")

    merged = merge_route([], discover_media(tmp_path))
    encoded = json.dumps(merged, ensure_ascii=False, indent=2)

    assert '"audioPath": "New Spring/Sound Library - New Spring.mp3"' in encoded


def test_default_cli_updates_the_live_route_without_a_draft_file(tmp_path):
    (tmp_path / "atlas").mkdir()
    (tmp_path / "New Spring").mkdir()
    (tmp_path / "New Spring" / "Sound Library - New Spring.mp3").write_bytes(b"new audio")
    (tmp_path / "atlas" / "dawn-to-night.json").write_text("[]\n", encoding="utf-8")

    result = subprocess.run(
        [
            sys.executable,
            str(SCRIPT_PATH),
            "--root",
            str(tmp_path),
            "--route",
            "atlas/dawn-to-night.json",
        ],
        check=False,
        capture_output=True,
        text=True,
    )

    route = json.loads((tmp_path / "atlas" / "dawn-to-night.json").read_text(encoding="utf-8"))
    assert result.returncode == 0
    assert route[0]["audioPath"] == "New Spring/Sound Library - New Spring.mp3"
    assert "draft" not in route[0]
    assert not (tmp_path / "atlas" / "dawn-to-night.draft.json").exists()


def test_check_mode_does_not_write_output(tmp_path):
    (tmp_path / "atlas").mkdir()
    (tmp_path / "New Spring").mkdir()
    (tmp_path / "New Spring" / "Sound Library - New Spring.mp3").write_bytes(b"new audio")
    route = [
        {
            "id": "new-spring",
            "title": "New Spring",
            "timeOfDay": "Dawn",
            "theme": "Ambient",
            "zoneLabel": "New sound library specimen",
            "audioPath": "New Spring/Sound Library - New Spring.mp3",
            "description": "Reviewed.",
            "credit": "Audio courtesy of National Park Service.",
        }
    ]
    (tmp_path / "atlas" / "dawn-to-night.json").write_text(json.dumps(route), encoding="utf-8")

    result = subprocess.run(
        [
            sys.executable,
            str(SCRIPT_PATH),
            "--root",
            str(tmp_path),
            "--route",
            "atlas/dawn-to-night.json",
            "--check",
        ],
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0
    assert not (tmp_path / "atlas" / "dawn-to-night.draft.json").exists()
