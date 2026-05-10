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
        "backdrop-deck",
        "backdrop-print",
        "backdrop-print-photo",
        "backdrop-print-caption",
        "backdrop-note",
        "backdrop-note-title",
        "backdrop-note-meta",
        "backdrop-note-body",
        "share-dock",
        "share-instagram-btn",
        "share-x-link",
        "share-copy-btn",
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
    assert "--backdrop-image-blur: 18px" in css
    assert "--backdrop-image-opacity: 0.34" in css
    assert "--backdrop-overlay-opacity: 0.74" in css
    assert "transition: opacity 520ms" in css
    assert "filter: blur(var(--backdrop-image-blur))" in css
    assert "repeating-linear-gradient(0deg" not in css
    assert "repeating-linear-gradient(90deg" not in css


def test_minimized_player_uses_bounded_polaroid_backdrop_print():
    page = load_page()
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    print_layer = page.find(id="backdrop-print")
    assert print_layer
    assert page.find(id="backdrop-print-photo")
    assert page.find(id="backdrop-print-caption")

    assert "--backdrop-print-opacity" in css
    assert ".backdrop-print" in css
    assert "body.player-is-minimized .backdrop-print" in css
    assert "opacity: 1" in css
    assert "width: min(42vw, 520px)" in css
    assert "object-fit: cover" in css
    assert "box-shadow:" in css
    assert "backdropPrintPhoto" in script
    assert "setBackdropPrint" in script


def test_minimized_player_shows_curated_field_note_next_to_print():
    page = load_page()
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    assert page.find(id="backdrop-note")
    assert page.find(id="backdrop-note-title")
    assert page.find(id="backdrop-note-meta")
    assert page.find(id="backdrop-note-body")

    assert ".backdrop-note" in css
    assert "body.player-is-minimized .backdrop-note" in css
    assert "left: calc(" in css
    assert "max-width: min(28vw, 360px)" in css
    assert page.find(class_="backdrop-note-kicker").get_text(strip=True) == "FIELD NOTE"
    assert "descriptionForStop" in script
    assert "ui.backdropNoteBody.textContent = descriptionForStop(stop);" in script
    assert "ui.desc.textContent = descriptionForStop(stop);" in script


def test_field_note_uses_postal_card_style_and_selectable_text():
    page = load_page()
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    assert page.find(id="item-backdrop").get("aria-hidden") is None
    assert page.find(id="backdrop-print").get("aria-hidden") == "true"
    assert page.find(id="backdrop-note").get("aria-hidden") == "true"

    assert ".backdrop-deck" in css
    assert ".stage {\n  pointer-events: none;" in css
    assert ".stamp-player {\n  --hole: 1.6px;" in css
    assert "pointer-events: auto" in css
    assert "user-select: text" in css
    assert "-webkit-user-select: text" in css
    assert ".backdrop-note::before" in css
    assert ".backdrop-note::after" in css
    assert "ui.backdropNote.setAttribute(\"aria-hidden\", String(!state.isMinimized));" in script
    assert "linear-gradient(90deg, color-mix(in oklch, var(--backdrop-shadow) 52%, transparent), transparent)" not in css


def test_minimized_player_exposes_lightweight_share_controls():
    page = load_page()
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    share_dock = page.find(id="share-dock")
    share_ig = page.find(id="share-instagram-btn")
    share_x = page.find(id="share-x-link")
    share_copy = page.find(id="share-copy-btn")

    assert share_dock
    assert share_dock.get("role") == "group"
    assert share_ig
    assert share_ig.get("type") == "button"
    assert "Instagram" in share_ig.get("aria-label")
    assert share_x
    assert share_x.get("target") == "_blank"
    assert share_x.get("rel") == ["noopener"]
    assert share_copy
    assert share_copy.get("type") == "button"

    assert ".share-dock" in css
    assert ".share-btn" in css
    assert "body.player-is-minimized .share-btn" in css
    assert "navigator.share" in script
    assert "https://twitter.com/intent/tweet" in script
    assert "navigator.clipboard.writeText" in script
    assert "shareUrlForStop" in script
    assert "updateShareTargets(stop);" in script
    assert "platform.twitter.com/widgets.js" not in page.decode()


def test_player_previous_next_and_autoplay_follow_active_theme_queue():
    script = JS_PATH.read_text(encoding="utf-8")

    assert "function activePlaybackStops()" in script
    assert "function activePlaybackPosition()" in script
    assert "function adjacentPlaybackStopIndex(direction)" in script
    assert "function selectAdjacentStop(direction, autoPlay)" in script
    assert "ui.prev.disabled = position <= 0;" in script
    assert "ui.next.disabled = position < 0 || position >= stops.length - 1;" in script
    assert "if (!selectAdjacentStop(1, true))" in script
    assert "selectAdjacentStop(-1, !ui.audio.paused)" in script
    assert "selectAdjacentStop(1, !ui.audio.paused)" in script
    assert "selectStop(state.index + 1" not in script
    assert "selectStop(Math.min(state.stops.length - 1, state.index + 1)" not in script


def test_minimized_backdrop_has_quiet_hover_delight_with_reduced_motion_guard():
    css = CSS_PATH.read_text(encoding="utf-8")

    assert ".backdrop-print {" in css
    assert "pointer-events: auto;" in css
    assert ".backdrop-print-frame" in css
    assert "body.player-is-minimized .backdrop-print:hover .backdrop-print-frame" in css
    assert "body.player-is-minimized .backdrop-print:hover #backdrop-print-photo" in css
    assert "body.player-is-minimized .backdrop-note:hover" in css
    assert "body.player-is-minimized .backdrop-note:hover::before" in css
    assert "transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1)" in css
    assert "@media (prefers-reduced-motion: reduce)" in css
    assert ".backdrop-print:hover .backdrop-print-frame" in css
    assert ".backdrop-note:hover::before" in css


def test_progress_bar_uses_animation_frame_for_smooth_playback_motion():
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    assert "--progress-ratio" in css
    assert "--progress-x" in css
    assert "scaleX(var(--progress-ratio, 0))" in css
    assert "translate(calc(var(--progress-x, 0px) - 50%), -50%) rotate(45deg)" in css
    assert "let progressFrame = 0;" in script
    assert "function startProgressAnimation()" in script
    assert "function stopProgressAnimation()" in script
    assert "requestAnimationFrame(tickProgress)" in script
    assert "cancelAnimationFrame(progressFrame)" in script
    assert "ui.audio.addEventListener(\"play\", () => {" in script
    assert "startProgressAnimation();" in script
    assert "ui.audio.addEventListener(\"pause\", () => {" in script
    assert "stopProgressAnimation();" in script
