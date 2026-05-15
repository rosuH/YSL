"""Static checks for the Dawn to Night atlas page."""

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ROOT_INDEX_PATH = ROOT / "index.html"
INDEX_PATH = ROOT / "atlas" / "index.html"
CSS_PATH = ROOT / "atlas" / "css" / "main.css"
JS_PATH = ROOT / "atlas" / "js" / "app.js"
MANIFEST_PATH = ROOT / "atlas" / "manifest.json"
ROBOTS_PATH = ROOT / "robots.txt"
SITEMAP_PATH = ROOT / "sitemap.xml"
LLMS_PATH = ROOT / "llms.txt"
LLMS_FULL_PATH = ROOT / "llms-full.txt"
MARKDOWN_INDEX_PATH = ROOT / "index.md"
PRICING_PATH = ROOT / "pricing.md"
OPENAPI_PATH = ROOT / "openapi.json"
AGENT_DISCOVERY_PATH = ROOT / ".well-known" / "agent.json"


def load_page():
    return BeautifulSoup(INDEX_PATH.read_text(encoding="utf-8"), "html.parser")


def assert_css_rule(css: str, selector: str, *declarations: str) -> None:
    target = re.sub(r"\s+", " ", selector).strip()
    normalized_declarations = [re.sub(r"\s+", " ", declaration).strip() for declaration in declarations]
    for match in re.finditer(r"(?P<selectors>[^{}]+)\{(?P<body>[^{}]*)\}", css, re.DOTALL):
        selectors = re.sub(r"\s+", " ", match.group("selectors")).strip()
        if selectors != target:
            continue
        body = re.sub(r"\s+", " ", match.group("body"))
        if all(declaration in body for declaration in normalized_declarations):
            return
    assert False, f"{selector} missing declarations: {declarations}"


def test_atlas_index_exists():
    assert INDEX_PATH.exists()


def test_root_index_exists_as_quiet_archive_entry_to_atlas():
    assert ROOT_INDEX_PATH.exists()
    page = BeautifulSoup(ROOT_INDEX_PATH.read_text(encoding="utf-8"), "html.parser")

    assert page.title.string == "Yellowstone Sound Atlas (YSL) - Public Sound Archive and Agent Resources"
    assert page.find("link", rel="canonical").get("href") == "https://ysl.rosuh.me/"
    assert page.find("meta", attrs={"http-equiv": "refresh"}) is None
    assert page.find("a", href="/atlas/")
    assert page.find("a", href="/developers/")
    assert page.find("link", rel="alternate", attrs={"href": "https://ysl.rosuh.me/llms.txt"})
    assert page.find("script", attrs={"type": "application/ld+json"})
    text = page.get_text(" ", strip=True)
    assert "61 audio stops" in text
    assert "OpenAPI file documents only public, read-only static resources" in text
    assert len(text) > 900


def test_root_discovery_files_reference_public_atlas_routes():
    assert ROBOTS_PATH.exists()
    assert SITEMAP_PATH.exists()

    robots = ROBOTS_PATH.read_text(encoding="utf-8")
    sitemap = SITEMAP_PATH.read_text(encoding="utf-8")

    assert "User-agent: *" in robots
    assert "User-agent: ChatGPT-User" in robots
    assert "User-agent: CCBot\nDisallow: /" in robots
    assert "Content-Signal: search=yes, ai-input=yes, ai-train=no" in robots
    assert "LLMs: https://ysl.rosuh.me/llms.txt" in robots
    assert "Schemamap: https://ysl.rosuh.me/schema-map.xml" in robots
    assert "Sitemap: https://ysl.rosuh.me/sitemap.xml" in robots
    assert "<loc>https://ysl.rosuh.me/atlas/</loc>" in sitemap
    assert "<loc>https://ysl.rosuh.me/developers/</loc>" in sitemap
    assert "<loc>https://ysl.rosuh.me/llms.txt</loc>" in sitemap
    assert "<loc>https://ysl.rosuh.me/openapi.json</loc>" in sitemap
    assert "<loc>https://ysl.rosuh.me/.well-known/agent.json</loc>" in sitemap
    assert "<loc>https://ysl.rosuh.me/atlas/share/american-coots/</loc>" in sitemap


def test_agent_discovery_resources_describe_real_static_capabilities():
    for path in [
        LLMS_PATH,
        LLMS_FULL_PATH,
        MARKDOWN_INDEX_PATH,
        PRICING_PATH,
        OPENAPI_PATH,
        AGENT_DISCOVERY_PATH,
    ]:
        assert path.exists(), path

    llms = LLMS_PATH.read_text(encoding="utf-8")
    assert "YSL has no account system" in llms
    assert "OpenAPI file documents only public, read-only static resources" in llms

    openapi = json.loads(OPENAPI_PATH.read_text(encoding="utf-8"))
    assert openapi["openapi"] == "3.1.0"
    assert "/atlas/dawn-to-night.json" in openapi["paths"]
    assert "/.well-known/agent.json" in openapi["paths"]
    assert "write operations" in openapi["info"]["description"]

    agent = json.loads(AGENT_DISCOVERY_PATH.read_text(encoding="utf-8"))
    assert agent["type"] == "static-archive"
    assert agent["authentication"]["required"] is False
    assert agent["limitations"]["mcpServer"] is False
    assert agent["limitations"]["a2aEndpoint"] is False


def test_manifest_declares_installable_atlas_icon():
    manifest = MANIFEST_PATH.read_text(encoding="utf-8")

    assert '"icons": [' in manifest
    assert '"src": "icons/ysa-icon.svg"' in manifest
    assert '"sizes": "any"' in manifest
    assert (ROOT / "atlas" / "icons" / "ysa-icon.svg").exists()


def test_index_references_split_css_and_javascript_assets():
    page = load_page()

    stylesheet_hrefs = [stylesheet["href"].split("?", 1)[0] for stylesheet in page.find_all("link", rel="stylesheet")]
    script_sources = [script["src"].split("?", 1)[0] for script in page.find_all("script", src=True)]

    assert "css/main.css" in stylesheet_hrefs
    assert "js/app.js" in script_sources


def test_i18n_module_preload_matches_cache_busted_import():
    page = load_page()
    script = JS_PATH.read_text(encoding="utf-8")

    modulepreload_hrefs = [link["href"] for link in page.find_all("link", rel="modulepreload")]

    assert "js/i18n.js?v=18" in modulepreload_hrefs
    assert 'from "./i18n.js?v=18"' in script


def test_module_entry_opts_out_of_cloudflare_rocket_loader():
    page = load_page()
    module_script = page.find("script", src="js/app.js?v=18")

    assert module_script
    assert module_script.get("type") == "module"
    assert module_script.get("data-cfasync") == "false"


def test_index_preloads_default_lcp_photo_with_high_priority():
    page = load_page()

    photo_preload = page.find("link", rel="preload", attrs={"as": "image"})
    scene_photo = page.find(id="scene-photo")

    assert photo_preload
    assert photo_preload.get("href") == "media/photos/american-coots.webp"
    assert photo_preload.get("type") == "image/webp"
    assert photo_preload.get("fetchpriority") == "high"
    assert scene_photo
    assert scene_photo.get("fetchpriority") == "high"


def test_index_contains_accessible_language_menu():
    page = load_page()

    switcher = page.find(id="language-switcher")
    trigger = page.find(id="language-menu-button")
    menu = page.find(id="language-menu")

    assert switcher
    assert switcher.get("aria-label") == "Language"
    assert trigger
    assert trigger.get("aria-haspopup") == "menu"
    assert trigger.get("aria-expanded") == "false"
    assert trigger.get("aria-controls") == "language-menu"
    icon = trigger.find("svg", attrs={"data-icon": "languages"})
    assert icon
    assert "A/A" not in trigger.get_text("", strip=True)
    assert menu
    assert menu.get("role") == "menu"
    assert menu.has_attr("hidden")
    assert [button.get("data-locale") for button in menu.find_all("button")] == [
        "en",
        "zh",
        "ja",
        "ko",
    ]
    assert {button.get("role") for button in menu.find_all("button")} == {"menuitemradio"}


def test_app_imports_i18n_module():
    script = JS_PATH.read_text(encoding="utf-8")

    assert 'from "./i18n.js?v=18"' in script


def test_app_localizes_accessibility_landmarks():
    script = JS_PATH.read_text(encoding="utf-8")

    assert 'stage: getEl("#stage")' in script
    assert 'shareDock: getEl("#share-dock")' in script
    assert 'audioControls: getEl("#audio-controls")' in script
    assert 'ui.stage.setAttribute("aria-label", text.siteLabel);' in script
    assert 'ui.shareDock.setAttribute("aria-label", text.shareDock);' in script
    assert 'ui.audioControls.setAttribute("aria-label", text.audioControls);' in script


def test_language_menu_focus_recovers_from_trigger_reentry():
    script = JS_PATH.read_text(encoding="utf-8")

    assert "const currentIndex = items.indexOf(document.activeElement);" in script
    assert "if (currentIndex === -1)" in script
    assert "activeLanguageItem()?.focus();" in script


def test_language_switcher_has_accessible_interaction_styles():
    css = CSS_PATH.read_text(encoding="utf-8")

    assert ".language-switcher" in css
    assert ".language-menu-button" in css
    assert ".language-menu" in css
    assert ".language-menu[hidden]" in css
    assert '.language-menu button[aria-checked="true"]' in css
    assert ".language-menu-button:focus-visible" in css


def test_mobile_language_switcher_moves_out_of_bottom_strip():
    css = CSS_PATH.read_text(encoding="utf-8")

    assert "top: max(14px, calc(env(safe-area-inset-top) + 14px))" in css
    assert "right: max(14px, calc(env(safe-area-inset-right) + 14px))" in css
    assert "top: calc(100% + 8px)" in css
    assert "bottom: auto" in css


def test_index_exposes_site_level_social_preview_metadata():
    page = load_page()

    def meta_content(**attrs):
        tag = page.find("meta", attrs=attrs)
        assert tag, attrs
        return tag.get("content")

    canonical = page.find("link", rel="canonical")
    assert canonical
    assert canonical.get("href") == "https://ysl.rosuh.me/atlas/"

    assert meta_content(property="og:title") == "Yellowstone Sound Atlas"
    assert meta_content(property="og:type") == "website"
    assert meta_content(property="og:url") == "https://ysl.rosuh.me/atlas/"
    assert meta_content(property="og:image") == "https://ysl.rosuh.me/docs/assets/banner.png"
    assert meta_content(property="og:image:width") == "3148"
    assert meta_content(property="og:image:height") == "1673"
    assert meta_content(name="twitter:card") == "summary_large_image"
    assert meta_content(name="twitter:title") == "Yellowstone Sound Atlas"
    assert meta_content(name="twitter:image") == "https://ysl.rosuh.me/docs/assets/banner.png"


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
        "archive-slip",
        "archive-slip-summary",
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

    assert "requestIdleCallback" in script
    assert "function scheduleImagePalette" in script
    assert "derivePaletteFromImage" in script
    assert "semanticPaletteForStop" in script
    assert "applyDerivedPalette" in script
    assert "setBackdropImage" in script
    assert "OPTIMIZED_PHOTO_DIR" in script
    assert "THUMBNAIL_DIR" in script
    assert "imageLoadCache" in script
    assert "ui.audio.load()" not in script


def test_image_preload_cache_retries_after_total_load_failure():
    script = JS_PATH.read_text(encoding="utf-8")

    preload_image = script[script.index("function preloadImage") : script.index("function originalImageSrc")]

    assert "imageLoadCache.set(cacheKey, promise);" in preload_image
    assert "if (!loaded) imageLoadCache.delete(cacheKey);" in preload_image
    assert "return loaded;" in preload_image


def test_locale_refresh_keeps_fallback_aware_backdrop_loading():
    script = JS_PATH.read_text(encoding="utf-8")

    update_localized_surface = script[script.index("function updateLocalizedSurface()") : script.index("function setLocale")]

    assert "updateAtmosphere(stop);" in update_localized_surface
    assert "setBackdropImage(activeImageForStop(stop)" not in script


def test_app_loads_chip_thumbnails_instead_of_full_size_strip_images():
    script = JS_PATH.read_text(encoding="utf-8")

    assert "thumbnailPhotoSrc(stop)" in script
    assert 'photo.setAttribute("fetchpriority", "low");' in script
    assert "photo.dataset.fallbackSrc = originalImageSrc(stop.imagePath);" in script
    assert "photo.dataset.src = thumbnailPhotoSrc(stop);" in script
    assert "photo.src = thumbnailPhotoSrc(stop);" in script
    assert "function hydrateDeferredChipImages()" in script
    assert "buildChipCarousel({ deferImages: true });" in script
    assert "onChipPhotoError" in script


def test_chip_thumbnail_error_handler_stays_active_for_fallback_failure():
    script = JS_PATH.read_text(encoding="utf-8")

    build_chip_carousel = script[script.index("function buildChipCarousel") : script.index("function updateThemeNav")]

    assert 'photo.addEventListener("error", onChipPhotoError);' in build_chip_carousel
    assert 'photo.addEventListener("error", onChipPhotoError, { once: true });' not in build_chip_carousel
    assert 'img.removeAttribute("data-fallback-src");' in script
    assert 'img.removeAttribute("data-src");' in script
    assert "img.remove();" in script


def test_app_indexes_theme_stops_once_before_navigation_renders():
    script = JS_PATH.read_text(encoding="utf-8")

    assert "stopsByTheme: new Map()" in script
    assert "function indexStops(stops)" in script
    assert "function groupStopsByTheme(stops)" in script
    assert "state.stops = indexStops(stops);" in script
    assert "state.stopsByTheme = groupStopsByTheme(state.stops);" in script
    assert "return state.stopsByTheme.get(theme) || [];" in script


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
    assert "descriptionForStop" not in script
    assert "ui.backdropNoteBody.textContent = localized.fieldNote || localized.description;" in script
    assert "ui.desc.textContent = localized.fieldNote || localized.description;" in script


def test_field_note_uses_postal_card_style_and_selectable_text():
    page = load_page()
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    assert page.find(id="item-backdrop").get("aria-hidden") is None
    assert page.find(id="backdrop-print").get("aria-hidden") == "true"
    assert page.find(id="backdrop-note").get("aria-hidden") == "true"

    assert ".backdrop-deck" in css
    assert_css_rule(css, ".stage", "pointer-events: none;")
    assert_css_rule(css, ".stamp-player", "--hole: 1.6px;")
    assert "pointer-events: auto" in css
    assert "user-select: text" in css
    assert "-webkit-user-select: text" in css
    assert ".backdrop-note::before" in css
    assert ".backdrop-note::after" in css
    assert 'ui.backdropNote.setAttribute("aria-hidden", String(!state.isMinimized));' in script
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
    assert "share/${encodeURIComponent(stop.id)}/" in script
    assert 'url.searchParams.set("lang", state.locale);' in script
    assert "updateShareTargets(stop);" in script
    assert "platform.twitter.com/widgets.js" not in page.decode()


def test_specimen_strip_exposes_colophon_archive_slip():
    page = load_page()
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    archive = page.find(id="archive-slip")
    summary = page.find(id="archive-slip-summary")
    card = page.find(class_="archive-slip-card")

    assert archive
    assert archive.name == "details"
    assert summary
    assert summary.name == "summary"
    assert "archive slip" in summary.get_text(" ", strip=True).lower()
    assert card
    assert "Yellowstone Sound Atlas" in card.get_text(" ", strip=True)
    assert page.find("a", href="https://github.com/rosuH/YSL")
    assert page.find("a", href="https://archive.org/details/YSL.7z")
    assert page.find("a", href="https://www.nps.gov/yell/learn/photosmultimedia/soundlibrary.htm")
    assert page.find("a", href="https://github.com/rosuH/YSL/issues")

    assert ".archive-slip" in css
    assert ".archive-slip-card" in css
    assert "grid-template-columns: minmax(0, 1fr) auto" in css
    assert "grid-column: 1 / -1" in css
    assert "max-height: calc(100dvh - var(--strip-height) - 28px)" in css
    assert "archiveSlip" in script
    assert "syncArchiveSlipState" in script
    assert 'e.code === "Escape" && ui.archiveSlip.open' in script
    assert "!ui.archiveSlip.contains(e.target)" in script


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


def test_mobile_minimized_deck_reserves_bottom_strip_safe_area():
    css = CSS_PATH.read_text(encoding="utf-8")

    assert "@media (max-width: 700px)" in css
    assert "body.player-is-minimized .backdrop-deck" in css
    assert "--mobile-deck-gap" in css
    assert "grid-template-rows: auto minmax(0, auto)" in css
    assert "calc(var(--strip-height) + 14px + env(safe-area-inset-bottom))" in css
    assert "max-height: calc(100dvh - var(--strip-height)" in css
    assert "overscroll-behavior: contain" in css
    assert "--strip-height: clamp(126px, 19dvh, 142px)" in css
    assert "body.player-is-minimized .stage" in css
    assert ".player-card.is-minimized .mini-rule" in css
    assert ".player-card.is-minimized .mini-copy" in css
    assert ".player-card.is-minimized .mini-play-btn" in css
    assert "grid-template-rows: 44px minmax(0, 1fr)" in css


def test_mobile_theme_tabs_use_compact_full_labels_without_ellipsis():
    css = CSS_PATH.read_text(encoding="utf-8")

    assert "@media (max-width: 560px)" in css
    assert_css_rule(
        css,
        ".theme-tab",
        "flex-basis: auto;",
        "min-width: max-content;",
    )
    assert ".theme-name" in css
    assert ".theme-count" in css
    assert_css_rule(
        css,
        ".theme-name,\n  .theme-count",
        "text-overflow: clip;",
        "overflow: visible;",
        "white-space: nowrap;",
    )


def test_progress_bar_uses_animation_frame_for_smooth_playback_motion():
    css = CSS_PATH.read_text(encoding="utf-8")
    script = JS_PATH.read_text(encoding="utf-8")

    assert "--progress-ratio" in css
    assert "--progress-x" in css
    assert "scaleX(var(--progress-ratio, 0))" in css
    assert "left: 0" in css
    assert "translate(calc(var(--progress-x, 0px) - 50%), -50%) rotate(45deg)" in css
    assert "let progressTrackWidth = 0;" in script
    assert "ResizeObserver" in script
    assert "let progressFrame = 0;" in script
    assert "function startProgressAnimation()" in script
    assert "function stopProgressAnimation()" in script
    assert "requestAnimationFrame(tickProgress)" in script
    assert "cancelAnimationFrame(progressFrame)" in script
    assert "getBoundingClientRect().width" not in script
    assert "clientWidth" in script
    assert 'ui.audio.addEventListener("play", () => {' in script
    assert "startProgressAnimation();" in script
    assert 'ui.audio.addEventListener("pause", () => {' in script
    assert "stopProgressAnimation();" in script
