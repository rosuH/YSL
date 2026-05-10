"""Build atlas route entries from crawler-downloaded sound files."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

AUDIO_SUFFIXES = {".mp3"}
IMAGE_SUFFIXES = {".jpg", ".jpeg"}
EXCLUDED_DIRS = {
    "__pycache__",
    "atlas",
    "docs",
    "scripts",
    "tests",
}
THEME_KEYWORDS = (
    (
        "Birds",
        (
            "bird",
            "chorus",
            "coot",
            "crane",
            "dipper",
            "eagle",
            "grouse",
            "nutcracker",
            "raven",
            "robin",
            "snipe",
            "vireo",
            "yellowthroat",
        ),
    ),
    (
        "Wildlife",
        (
            "bison",
            "coyote",
            "elk",
            "frog",
            "pronghorn",
            "toad",
            "wolf",
            "wolves",
        ),
    ),
    (
        "Thermal",
        (
            "fumarole",
            "geyser",
            "growler",
            "hot spring",
            "mud",
            "paint pot",
            "spring",
            "steam",
            "thermal",
            "vent",
        ),
    ),
    ("Water", ("creek", "falls", "lake", "river", "water", "waterfall")),
    ("Weather", ("rain", "storm", "thunder", "weather", "wind")),
    ("Human", ("boardwalk", "car", "human", "people", "road", "visitor")),
)

TIME_KEYWORDS = (
    ("Dawn", ("dawn", "sunrise")),
    ("Morning", ("morning",)),
    ("Afternoon", ("afternoon",)),
    ("Dusk", ("dusk", "sunset")),
    ("Evening", ("evening",)),
    ("Night", ("night", "nocturnal")),
)


def _is_sound_library_path(path: Path) -> bool:
    return not any(part.startswith(".") or part in EXCLUDED_DIRS for part in path.parts)


def _relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def _title_from_audio(audio_path: Path) -> str:
    title = audio_path.stem
    title = re.sub(r"^Sound Library\s*-\s*", "", title)
    return title.strip()


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "sound-specimen"


def _unique_id(title: str, used_ids: set[str]) -> str:
    base = _slugify(title)
    candidate = base
    index = 2
    while candidate in used_ids:
        candidate = f"{base}-{index}"
        index += 1
    used_ids.add(candidate)
    return candidate


def _image_for_audio(audio_path: Path) -> Path | None:
    images = sorted(path for path in audio_path.parent.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES)
    return images[0] if images else None


def discover_media(root: Path) -> list[dict[str, str]]:
    root = root.resolve()
    media: list[dict[str, str]] = []
    for audio_path in sorted(path for path in root.rglob("*") if path.is_file() and path.suffix.lower() in AUDIO_SUFFIXES):
        relative_audio = audio_path.relative_to(root)
        if not _is_sound_library_path(relative_audio):
            continue

        entry = {
            "title": _title_from_audio(audio_path),
            "audioPath": _relative(audio_path, root),
        }
        image_path = _image_for_audio(audio_path)
        if image_path:
            entry["imagePath"] = _relative(image_path, root)
        media.append(entry)
    return media


def _classification_text(media_entry: dict[str, str]) -> str:
    return f"{media_entry.get('title', '')} {media_entry.get('audioPath', '')}".lower()


def _infer_theme(media_entry: dict[str, str]) -> str:
    text = _classification_text(media_entry)
    for theme, keywords in THEME_KEYWORDS:
        if any(keyword in text for keyword in keywords):
            return theme
    return "Ambient"


def _infer_time_of_day(media_entry: dict[str, str]) -> str:
    text = _classification_text(media_entry)
    for time_of_day, keywords in TIME_KEYWORDS:
        if any(keyword in text for keyword in keywords):
            return time_of_day
    return "Midday"


def _description_for(media_entry: dict[str, str], theme: str) -> str:
    title = media_entry["title"]
    descriptions = {
        "Birds": f"{title} threads through the atlas as a living signal of Yellowstone's bird life.",
        "Human": f"{title} preserves a human trace within Yellowstone's wider acoustic record.",
        "Thermal": f"{title} carries the hiss, pulse, and mineral breath of Yellowstone's thermal landscape.",
        "Water": f"{title} follows the movement of water through Yellowstone's acoustic terrain.",
        "Weather": f"{title} records weather passing across Yellowstone's open soundscape.",
        "Wildlife": f"{title} marks the presence and movement of wildlife across the park.",
    }
    return descriptions.get(theme, f"{title} enters the atlas as a Yellowstone sound library specimen.")


def _generated_stop(media_entry: dict[str, str], used_ids: set[str]) -> dict[str, Any]:
    theme = _infer_theme(media_entry)
    stop: dict[str, Any] = {
        "id": _unique_id(media_entry["title"], used_ids),
        "title": media_entry["title"],
        "timeOfDay": _infer_time_of_day(media_entry),
        "theme": theme,
        "zoneLabel": "Sound library specimen",
        "audioPath": media_entry["audioPath"],
        "description": _description_for(media_entry, theme),
        "credit": "Audio courtesy of National Park Service.",
    }
    if "imagePath" in media_entry:
        stop["imagePath"] = media_entry["imagePath"]
        stop["credit"] = "Audio and image courtesy of National Park Service."
    return stop


def merge_route(existing_route: list[dict[str, Any]], media: list[dict[str, str]]) -> list[dict[str, Any]]:
    existing_audio_paths = {stop["audioPath"] for stop in existing_route if isinstance(stop.get("audioPath"), str)}
    used_ids = {stop["id"] for stop in existing_route if isinstance(stop.get("id"), str)}
    merged = [dict(stop) for stop in existing_route]

    for media_entry in media:
        if media_entry["audioPath"] in existing_audio_paths:
            continue
        merged.append(_generated_stop(media_entry, used_ids))

    return merged


def load_route(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as route_file:
        route = json.load(route_file)
    if not isinstance(route, list):
        raise ValueError(f"Route file must contain a JSON array: {path}")
    return route


def write_route(path: Path, route: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(route, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the Yellowstone atlas route from downloaded media.")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Repository root to scan.")
    parser.add_argument("--route", type=Path, default=Path("atlas/dawn-to-night.json"), help="Existing curated route JSON.")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Route output path. Defaults to --route, updating the live atlas data.",
    )
    parser.add_argument("--check", action="store_true", help="Exit non-zero when downloaded media is missing from the route.")
    args = parser.parse_args()

    root = args.root.resolve()
    route_path = args.route if args.route.is_absolute() else root / args.route
    output_arg = args.output or args.route
    output_path = output_arg if output_arg.is_absolute() else root / output_arg

    existing_route = load_route(route_path)
    media = discover_media(root)
    merged = merge_route(existing_route, media)
    added_count = len(merged) - len(existing_route)

    if args.check:
        if added_count:
            print(f"{added_count} downloaded sound file(s) are missing from {route_path.relative_to(root)}.")
            return 1
        print(f"All {len(media)} downloaded sound file(s) are represented in {route_path.relative_to(root)}.")
        return 0

    write_route(output_path, merged)
    print(f"Wrote {len(merged)} atlas stop(s) to {output_path.relative_to(root)}; {added_count} stop(s) added.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
