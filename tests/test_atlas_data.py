"""Validation tests for the Dawn to Night sound atlas route data."""

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTE_PATH = ROOT / "atlas" / "dawn-to-night.json"
REQUIRED_FIELDS = {
    "id",
    "title",
    "timeOfDay",
    "theme",
    "zoneLabel",
    "audioPath",
    "description",
    "credit",
}
BASELINE_THEME_COUNTS = {
    "Thermal": 24,
    "Birds": 21,
    "Wildlife": 10,
    "Human": 2,
    "Weather": 2,
    "Ambient": 1,
    "Water": 1,
}


def load_route():
    with ROUTE_PATH.open(encoding="utf-8") as route_file:
        return json.load(route_file)


def test_route_file_exists():
    assert ROUTE_PATH.exists()


def test_route_keeps_the_current_curated_baseline():
    route = load_route()
    assert isinstance(route, list)
    assert len(route) >= 61


def test_route_theme_counts_cover_the_current_curated_baseline():
    route = load_route()
    counts = Counter(stop["theme"] for stop in route)
    for theme, expected_count in BASELINE_THEME_COUNTS.items():
        assert counts[theme] >= expected_count


def test_route_stops_have_required_fields_and_unique_ids():
    route = load_route()
    stop_ids = [stop.get("id") for stop in route]

    assert len(stop_ids) == len(set(stop_ids))
    for stop in route:
        assert REQUIRED_FIELDS <= set(stop)
        for field in REQUIRED_FIELDS:
            assert isinstance(stop[field], str)
            assert stop[field].strip()


def test_route_audio_paths_resolve_to_existing_mp3_files():
    for stop in load_route():
        audio_path = ROOT / stop["audioPath"]
        assert audio_path.exists(), stop["audioPath"]
        assert audio_path.suffix.lower() == ".mp3"


def test_route_image_paths_resolve_to_existing_jpg_files_when_present():
    for stop in load_route():
        image_path_value = stop.get("imagePath", "")
        if not image_path_value:
            continue

        image_path = ROOT / image_path_value
        assert image_path.exists(), image_path_value
        assert image_path.suffix.lower() in {".jpg", ".jpeg"}
