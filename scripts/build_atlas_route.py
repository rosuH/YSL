"""Build atlas route entries from crawler-downloaded sound files."""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import shutil
from pathlib import Path
from typing import Any
from urllib.parse import quote

AUDIO_SUFFIXES = {".mp3"}
IMAGE_SUFFIXES = {".jpg", ".jpeg"}
DEFAULT_SITE_URL = "https://ysl.rosuh.me"
FALLBACK_SOCIAL_IMAGE = "docs/assets/banner.png"
SITE_DESCRIPTION = "A quiet specimen archive of Yellowstone National Park sound recordings."
DISCOVERY_URL_PATHS = (
    "/about/",
    "/contact/",
    "/privacy/",
    "/docs/",
    "/developers/",
    "/index.md",
    "/llms.txt",
    "/llms-full.txt",
    "/pricing.md",
    "/openapi.json",
    "/.well-known/agent.json",
    "/.well-known/api-catalog",
    "/schema-map.xml",
    "/data/catalog.jsonld",
)
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


def _site_url_from_cname(root: Path) -> str:
    cname_path = root / "CNAME"
    if not cname_path.exists():
        return DEFAULT_SITE_URL
    cname = next((line.strip() for line in cname_path.read_text(encoding="utf-8").splitlines() if line.strip()), "")
    return f"https://{cname}" if cname else DEFAULT_SITE_URL


def _normalize_site_url(site_url: str) -> str:
    return site_url.rstrip("/")


def _absolute_site_url(site_url: str, path: str) -> str:
    return f"{_normalize_site_url(site_url)}/{quote(path.lstrip('/'), safe='/-._~')}"


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


def _is_excluded_dir_name(name: str) -> bool:
    return name.startswith(".") or name in EXCLUDED_DIRS


def _iter_audio_paths(root: Path):
    audio_paths: list[Path] = []
    for current_dir, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(name for name in dirnames if not _is_excluded_dir_name(name))
        for filename in sorted(filenames):
            if filename.startswith("."):
                continue
            audio_path = Path(current_dir) / filename
            if audio_path.is_file() and audio_path.suffix.lower() in AUDIO_SUFFIXES:
                audio_paths.append(audio_path)
    yield from sorted(audio_paths)


def discover_media(root: Path) -> list[dict[str, str]]:
    root = root.resolve()
    media: list[dict[str, str]] = []
    for audio_path in _iter_audio_paths(root):
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
    description = _description_for(media_entry, theme)
    stop: dict[str, Any] = {
        "id": _unique_id(media_entry["title"], used_ids),
        "title": media_entry["title"],
        "timeOfDay": _infer_time_of_day(media_entry),
        "theme": theme,
        "zoneLabel": "Sound library specimen",
        "audioPath": media_entry["audioPath"],
        "description": description,
        "fieldNote": description,
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


def _meta(content: str) -> str:
    return html.escape(content, quote=True)


def _display_path(path: Path, root: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return path.as_posix()


def _share_page_url(site_url: str, stop_id: str) -> str:
    return f"{_normalize_site_url(site_url)}/atlas/share/{quote(stop_id, safe='-._~')}/"


def _target_page_url(site_url: str, stop_id: str) -> str:
    return f"{_normalize_site_url(site_url)}/atlas/#{quote(stop_id, safe='-._~')}"


def _social_image_url(site_url: str, stop: dict[str, Any]) -> str:
    image_path = stop.get("imagePath") if isinstance(stop.get("imagePath"), str) else FALLBACK_SOCIAL_IMAGE
    return _absolute_site_url(site_url, image_path)


def _social_image_alt(stop: dict[str, Any]) -> str:
    if isinstance(stop.get("imagePath"), str):
        return f"{stop['title']} source image."
    return "Yellowstone Sound Atlas banner."


def _display_description(stop: dict[str, Any]) -> str:
    field_note = stop.get("fieldNote")
    if isinstance(field_note, str) and field_note.strip():
        return field_note
    description = stop.get("description")
    if isinstance(description, str) and description.strip():
        return description
    return f"{stop['title']} is part of the Yellowstone Sound Atlas."


def _local_atlas_target(stop_id: str) -> str:
    return f"../../#{quote(stop_id, safe='-._~')}"


def _share_page_html(stop: dict[str, Any], site_url: str) -> str:
    title = f"{stop['title']} - Yellowstone Sound Atlas"
    description = _display_description(stop)
    share_url = _share_page_url(site_url, stop["id"])
    target_url = _local_atlas_target(stop["id"])
    image_url = _social_image_url(site_url, stop)
    redirect_script = json.dumps(target_url)

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{_meta(title)}</title>
  <meta name="description" content="{_meta(description)}">
  <link rel="canonical" href="{_meta(share_url)}">
  <meta property="og:site_name" content="YSL">
  <meta property="og:title" content="{_meta(title)}">
  <meta property="og:description" content="{_meta(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{_meta(share_url)}">
  <meta property="og:image" content="{_meta(image_url)}">
  <meta property="og:image:alt" content="{_meta(_social_image_alt(stop))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{_meta(title)}">
  <meta name="twitter:description" content="{_meta(description)}">
  <meta name="twitter:image" content="{_meta(image_url)}">
  <script>
    window.location.replace({redirect_script});
  </script>
</head>
<body>
  <main>
    <h1>{_meta(title)}</h1>
    <p>{_meta(description)}</p>
    <p><a href="{_meta(target_url)}">Open this specimen in Yellowstone Sound Atlas</a></p>
  </main>
</body>
</html>
"""


def _share_page_id(stop: dict[str, Any]) -> str:
    stop_id = stop["id"]
    if not isinstance(stop_id, str) or "/" in stop_id or stop_id.startswith("."):
        raise ValueError(f"Invalid share page id: {stop_id}")
    return stop_id


def write_share_pages(root: Path, route: list[dict[str, Any]], site_url: str) -> None:
    share_root = root / "atlas" / "share"
    if share_root.exists():
        shutil.rmtree(share_root)
    share_root.mkdir(parents=True, exist_ok=True)

    for stop in route:
        stop_id = _share_page_id(stop)
        page_dir = share_root / stop_id
        page_dir.mkdir(parents=True, exist_ok=True)
        (page_dir / "index.html").write_text(_share_page_html(stop, site_url), encoding="utf-8")


def _sitemap_url(url: str) -> str:
    return f"  <url>\n    <loc>{_meta(url)}</loc>\n  </url>"


def write_discovery_files(root: Path, route: list[dict[str, Any]], site_url: str) -> None:
    normalized_site = _normalize_site_url(site_url)
    urls = [
        f"{normalized_site}/",
        f"{normalized_site}/atlas/",
        *[f"{normalized_site}{path}" for path in DISCOVERY_URL_PATHS],
        *[_share_page_url(normalized_site, _share_page_id(stop)) for stop in route],
    ]
    sitemap = "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            *[_sitemap_url(url) for url in urls],
            "</urlset>",
            "",
        ]
    )
    robots = "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "",
            "User-agent: ChatGPT-User",
            "Allow: /",
            "",
            "User-agent: ClaudeBot",
            "Allow: /",
            "",
            "User-agent: Google-Extended",
            "Allow: /",
            "",
            "User-agent: PerplexityBot",
            "Allow: /",
            "",
            "User-agent: DeepSeekBot",
            "Allow: /",
            "",
            "User-agent: GPTBot",
            "Allow: /",
            "",
            "User-agent: CCBot",
            "Disallow: /",
            "",
            "User-agent: ByteSpider",
            "Disallow: /",
            "",
            "Content-Signal: search=yes, ai-input=yes, ai-train=no",
            f"LLMs: {normalized_site}/llms.txt",
            f"Schemamap: {normalized_site}/schema-map.xml",
            f"Sitemap: {normalized_site}/sitemap.xml",
            "",
        ]
    )
    (root / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (root / "robots.txt").write_text(robots, encoding="utf-8")


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
    parser.add_argument(
        "--site-url",
        default=None,
        help="Public site URL for generated social share pages. Defaults to CNAME or ysl.rosuh.me.",
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
            print(f"{added_count} downloaded sound file(s) are missing from {_display_path(route_path, root)}.")
            return 1
        print(f"All {len(media)} downloaded sound file(s) are represented in {_display_path(route_path, root)}.")
        return 0

    site_url = args.site_url or _site_url_from_cname(root)
    write_route(output_path, merged)
    write_share_pages(root, merged, site_url)
    write_discovery_files(root, merged, site_url)
    print(
        f"Wrote {len(merged)} atlas stop(s) to {_display_path(output_path, root)}; "
        f"{added_count} stop(s) added; generated {len(merged)} share page(s).",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
