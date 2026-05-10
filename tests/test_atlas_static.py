"""Static checks for the Dawn to Night atlas page."""

from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "atlas" / "index.html"
CSS_PATH = ROOT / "atlas" / "css" / "main.css"
JS_PATH = ROOT / "atlas" / "js" / "app.js"


def load_page():
    return BeautifulSoup(INDEX_PATH.read_text(encoding="utf-8"), "html.parser")


def test_atlas_index_exists():
    assert INDEX_PATH.exists()


def test_index_references_split_css_and_javascript_assets():
    page = load_page()

    stylesheet_hrefs = [
        stylesheet["href"].split("?", 1)[0]
        for stylesheet in page.find_all("link", rel="stylesheet")
    ]
    script_sources = [
        script["src"].split("?", 1)[0]
        for script in page.find_all("script", src=True)
    ]

    assert "css/main.css" in stylesheet_hrefs
    assert "js/app.js" in script_sources


def test_index_preserves_player_runtime_ids():
    page = load_page()

    required_ids = [
        "minimize-btn",
        "audio-player",
        "play-btn",
        "prev-btn",
        "next-btn",
        "progress-track",
        "progress-fill",
        "progress-thumb",
        "time-current",
        "time-total",
        "waveform",
        "scene-photo",
        "status",
        "track-title",
        "track-meta",
        "track-desc",
        "track-credit",
        "eyebrow",
        "specimen-strip",
        "keyboard-hints",
        "item-backdrop",
        "scene-photo-frame",
        "mini-photo-frame",
    ]
    for element_id in required_ids:
        assert page.find(id=element_id), element_id


def test_index_contains_stamp_player_structure():
    page = load_page()

    player = page.find(class_="player-card")
    assert player
    assert "stamp-player" in player.get("class", [])

    expanded = page.find(class_="stamp-expanded")
    mini = page.find(id="mini-stamp")

    assert expanded
    assert mini
    assert page.find(id="mini-play-btn")
    assert page.find(id="mini-expand-btn")


def test_index_contains_theme_first_navigation_shell():
    page = load_page()

    strip = page.find(id="specimen-strip")
    theme_tabs = page.find(id="theme-tabs")
    chip_carousel = page.find(id="chip-carousel")

    assert strip
    assert strip.get("aria-label") == "Theme specimen navigation"
    assert theme_tabs
    assert theme_tabs.get("role") == "tablist"
    assert chip_carousel


def test_index_uses_lazy_audio_loading_for_quieter_local_preview():
    page = load_page()

    audio = page.find(id="audio-player")

    assert audio
    assert audio.get("preload") == "none"


def test_stamp_layout_contract_avoids_expanded_view_scrolling():
    css = CSS_PATH.read_text(encoding="utf-8")

    assert "--player-available-height" in css
    assert "height: var(--player-available-height)" in css
    assert "overflow: hidden" in css
    assert "grid-template-rows: auto minmax(0, 1fr) auto auto auto auto" in css


def test_app_derives_item_palette_and_backdrop_from_selected_specimen():
    script = JS_PATH.read_text(encoding="utf-8")

    assert "derivePaletteFromImage" in script
    assert "semanticPaletteForStop" in script
    assert "applyDerivedPalette" in script
    assert "setBackdropImage" in script
    assert "ui.audio.load()" not in script


def test_player_expand_and_minimize_use_bounded_crossfade_blur():
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    assert ".player-card.is-minimized" in css
    assert "height: auto" in css
    assert "--stamp-transition-blur" in css
    assert "filter: blur(var(--stamp-transition-blur))" in css
    assert "::view-transition-image-pair(player)" in css
    assert "overflow: clip" in css
    assert "clip-path: inset(0 round 2px)" in css
    assert "const isExpanding = state.isMinimized && !nextState;" not in script
    assert "document.startViewTransition(() => applyMinimized(nextState));" in script


def test_minimized_player_reveals_clearer_animated_backdrop():
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    assert "player-is-minimized" in script
    assert "--backdrop-image-blur" in css
    assert "--backdrop-overlay-opacity" in css
    assert "body.player-is-minimized" in css
    assert "--backdrop-image-blur: 0px" in css
    assert "--backdrop-image-scale: 1" in css
    assert "--backdrop-image-saturation: 1" in css
    assert "--backdrop-image-contrast: 1" in css
    assert "--backdrop-image-opacity: 1" in css
    assert "--backdrop-overlay-opacity: 0.38" in css
    assert "transition: opacity 520ms" in css
    assert "filter: blur(var(--backdrop-image-blur))" in css
    assert "repeating-linear-gradient(0deg" not in css
    assert "repeating-linear-gradient(90deg" not in css
