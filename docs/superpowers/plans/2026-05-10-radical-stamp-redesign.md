# Radical Stamp Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current geomorphic glass-card atlas with a source-faithful, theme-first postage-stamp specimen player.

**Architecture:** Keep the static vanilla stack and the current split asset layout (`atlas/css/main.css`, `atlas/js/app.js`). Preserve the public element IDs listed in the design spec so the current audio/progress/keyboard wiring can be migrated safely. Use one `view-transition-name: player` wrapper for the player, with expanded and minimized stamp faces inside it, and generate the bottom navigation from the real `theme` field instead of editorial `timeOfDay`.

**Tech Stack:** Static HTML, CSS custom properties, CSS masks, `@property`, View Transitions API, vanilla JavaScript modules, native `<audio>`, `pytest`, BeautifulSoup, local `python3 -m http.server`.

---

## Current Baseline

- Branch: `radical-geomorphic-atlas-redesign`.
- Dirty checkout already moved from flat `atlas/app.js` / `atlas/styles.css` to `atlas/js/app.js` / `atlas/css/main.css`.
- `atlas/dawn-to-night.json` already contains 61 stops.
- `pytest -v` currently reports 18 passed and 5 failed:
  - `tests/test_atlas_data.py::test_route_has_first_version_stop_count` still expects 6-8 stops.
  - `tests/test_atlas_static.py::test_index_references_local_css_and_javascript` still expects `styles.css` and `app.js`.
  - `tests/test_atlas_static.py::test_index_contains_radical_geomorphic_regions` expects the old geomorphic shell.
  - `tests/test_atlas_static.py::test_index_contains_accessible_audio_navigation_buttons` expects `previous-stop` / `next-stop`.
  - `tests/test_atlas_static.py::test_strata_deck_and_specimen_fragment_are_labelled` expects the old geomorphic sections.

## File Structure

- Modify `tests/test_atlas_data.py`: update data expectations from first-version 6-8 stops to exact 61-stop theme counts.
- Modify `tests/test_atlas_static.py`: lock the stamp shell, split CSS/JS paths, preserved element IDs, and theme navigation containers.
- Modify `atlas/index.html`: replace the current glass-card shell with expanded and mini stamp faces while preserving required IDs.
- Modify `atlas/js/app.js`: add theme-first state, theme tabs, filtered chip carousel, mini stamp interactions, and View Transition-safe minimize behavior.
- Replace `atlas/css/main.css`: implement bone-paper stamps, edge-only perforations, theme tabs, chip stamps, responsive layout, and reduced-motion behavior.
- Keep `atlas/dawn-to-night.json` unchanged in this plan.

---

### Task 1: Lock Data And Static Contracts

**Files:**
- Modify: `tests/test_atlas_data.py`
- Modify: `tests/test_atlas_static.py`

- [ ] **Step 1: Replace the route data tests**

Replace `tests/test_atlas_data.py` with:

```python
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
EXPECTED_THEME_COUNTS = {
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


def test_route_has_all_sound_library_stops():
    route = load_route()
    assert isinstance(route, list)
    assert len(route) == 61


def test_route_theme_counts_match_theme_navigation():
    route = load_route()
    assert Counter(stop["theme"] for stop in route) == EXPECTED_THEME_COUNTS


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
```

- [ ] **Step 2: Replace the static HTML tests**

Replace `tests/test_atlas_static.py` with:

```python
"""Static checks for the Dawn to Night atlas page."""

from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "atlas" / "index.html"


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
```

- [ ] **Step 3: Run the tests to verify the contract fails for the current shell**

Run:

```bash
pytest tests/test_atlas_data.py tests/test_atlas_static.py -v
```

Expected: data tests PASS, static tests FAIL until `atlas/index.html` is replaced with the stamp shell.

- [ ] **Step 4: Commit the updated test contract**

Run:

```bash
git add tests/test_atlas_data.py tests/test_atlas_static.py
git commit -m "test: lock stamp atlas contract"
```

---

### Task 2: Replace The Static Stamp Shell

**Files:**
- Modify: `atlas/index.html`
- Test: `tests/test_atlas_static.py`

- [ ] **Step 1: Replace `atlas/index.html`**

Replace `atlas/index.html` with:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Yellowstone Sound Atlas - Specimen Stamps</title>
  <meta name="description" content="A theme-first specimen collection of Yellowstone National Park sound recordings.">
  <meta name="theme-color" content="#eee6cf">
  <meta name="color-scheme" content="light">
  <link rel="manifest" href="manifest.json">
  <link rel="preload" href="css/main.css" as="style">
  <link rel="preload" href="js/app.js" as="script">
  <link rel="preload" href="dawn-to-night.json" as="fetch" crossorigin="anonymous">
  <link rel="stylesheet" href="css/main.css?v=6">
</head>
<body>
  <main class="stage" id="stage" aria-label="Yellowstone Sound Atlas">
    <article class="player-card stamp-player">
      <section class="stamp-face stamp-expanded" aria-label="Active sound specimen">
        <header class="stamp-rule stamp-rule-top">
          <p class="eyebrow" id="eyebrow">YELLOWSTONE - 01</p>
          <p class="volume-mark">VOL 61</p>
          <button id="minimize-btn" class="minimize-btn" type="button" aria-label="Minimize player">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10l5 5 5-5"></path>
            </svg>
          </button>
        </header>

        <figure class="stamp-photo-frame">
          <img id="scene-photo" class="scene-photo" alt="" decoding="async">
        </figure>

        <section class="stamp-copy">
          <h1 class="track-title" id="track-title">Loading...</h1>
          <p class="track-meta" id="track-meta">Route specimen</p>
          <p class="track-desc" id="track-desc">Loading the first Yellowstone sound specimen.</p>
          <p class="track-credit" id="track-credit"></p>
        </section>

        <div class="waveform" id="waveform" aria-hidden="true"></div>

        <div class="controls" role="group" aria-label="Audio controls">
          <button id="prev-btn" class="ctrl-btn" type="button" aria-label="Previous stop">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 6l-6 6 6 6"></path>
            </svg>
          </button>

          <button id="play-btn" class="ctrl-btn play-btn" type="button" aria-label="Play">
            <svg id="icon-play" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z"></path>
            </svg>
            <svg id="icon-pause" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z"></path>
            </svg>
          </button>

          <button id="next-btn" class="ctrl-btn" type="button" aria-label="Next stop">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6l6 6-6 6"></path>
            </svg>
          </button>
        </div>

        <div class="progress-area">
          <div class="time-row">
            <span id="time-current">0:00</span>
            <span id="time-total">0:00</span>
          </div>
          <div
            class="progress-track"
            id="progress-track"
            role="slider"
            aria-label="Playback position"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
            tabindex="0"
          >
            <div class="progress-fill" id="progress-fill"></div>
            <div class="progress-thumb" id="progress-thumb"></div>
          </div>
        </div>

        <footer class="stamp-rule stamp-rule-bottom">
          <span>National Park Service source</span>
          <span>Specimen archive</span>
        </footer>
      </section>

      <section
        class="stamp-face stamp-mini"
        id="mini-stamp"
      >
        <div class="mini-rule">
          <span id="mini-eyebrow">YELLOWSTONE - 01</span>
          <span>VOL 61</span>
        </div>
        <figure class="mini-photo-frame">
          <img id="mini-scene-photo" alt="" decoding="async">
          <button id="mini-play-btn" class="mini-play-btn" type="button" aria-label="Play">
            <svg id="mini-icon-play" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z"></path>
            </svg>
            <svg id="mini-icon-pause" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z"></path>
            </svg>
          </button>
        </figure>
        <div class="mini-copy">
          <p id="mini-track-title">Loading...</p>
          <p id="mini-track-meta">Route specimen</p>
        </div>
        <button id="mini-expand-btn" class="mini-expand-btn" type="button" aria-label="Expand player"></button>
      </section>

      <audio id="audio-player" preload="metadata"></audio>
    </article>
  </main>

  <nav class="specimen-strip" id="specimen-strip" aria-label="Theme specimen navigation">
    <div class="theme-tabs" id="theme-tabs" role="tablist" aria-label="Specimen themes"></div>
    <div class="chip-carousel" id="chip-carousel" aria-label="Theme specimens"></div>
  </nav>

  <p class="status" id="status" role="status" aria-live="polite"></p>

  <div class="keyboard-hints" id="keyboard-hints" aria-hidden="true">
    <kbd>Space <span>Play/Pause</span></kbd>
    <kbd>Alt + Left <span>Prev</span></kbd>
    <kbd>Alt + Right <span>Next</span></kbd>
    <kbd>M <span>Minimize</span></kbd>
  </div>

  <noscript>
    <div class="noscript-notice">
      <p>This experience requires JavaScript to load the sound specimens.</p>
    </div>
  </noscript>

  <script src="js/app.js?v=6" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: Run the static tests**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: PASS.

- [ ] **Step 3: Commit the HTML shell**

Run:

```bash
git add atlas/index.html tests/test_atlas_static.py
git commit -m "feat: add stamp atlas shell"
```

---

### Task 3: Implement Theme-First JavaScript Behavior

**Files:**
- Modify: `atlas/js/app.js`
- Test: `tests/test_atlas_data.py`

- [ ] **Step 1: Add theme metadata near the top of `atlas/js/app.js`**

Insert this after `const ROUTE_URL = "./dawn-to-night.json";` and remove `chapterTone`:

```javascript
const THEME_ORDER = ["Thermal", "Birds", "Wildlife", "Human", "Weather", "Ambient", "Water"];

const THEME_META = {
  Thermal: { token: "thermal", color: "oklch(58% 0.12 48)" },
  Birds: { token: "birds", color: "oklch(56% 0.10 130)" },
  Wildlife: { token: "wildlife", color: "oklch(48% 0.07 70)" },
  Human: { token: "human", color: "oklch(46% 0.04 80)" },
  Weather: { token: "weather", color: "oklch(54% 0.08 240)" },
  Ambient: { token: "ambient", color: "oklch(60% 0.04 95)" },
  Water: { token: "water", color: "oklch(54% 0.10 200)" },
};
```

Update `state` to include the active theme:

```javascript
const state = {
  stops: [],
  index: 0,
  activeTheme: "Thermal",
  isPlaying: false,
  isDragging: false,
  autoPlayNext: false,
  isMinimized: false,
};
```

- [ ] **Step 2: Replace the `ui` object**

Replace the current `ui` object with:

```javascript
const ui = {
  body: document.body,
  playerCard: document.querySelector(".player-card"),
  stage: getEl("#stage"),
  expandedFace: document.querySelector(".stamp-expanded"),
  miniStamp: getEl("#mini-stamp"),
  miniExpand: getEl("#mini-expand-btn"),
  eyebrow: getEl("#eyebrow"),
  miniEyebrow: getEl("#mini-eyebrow"),
  title: getEl("#track-title"),
  miniTitle: getEl("#mini-track-title"),
  meta: getEl("#track-meta"),
  miniMeta: getEl("#mini-track-meta"),
  desc: getEl("#track-desc"),
  credit: getEl("#track-credit"),
  waveform: getEl("#waveform"),
  strip: getEl("#specimen-strip"),
  themeTabs: getEl("#theme-tabs"),
  chipCarousel: getEl("#chip-carousel"),
  audio: getEl("#audio-player"),
  prev: getEl("#prev-btn"),
  next: getEl("#next-btn"),
  play: getEl("#play-btn"),
  miniPlay: getEl("#mini-play-btn"),
  iconPlay: getEl("#icon-play"),
  iconPause: getEl("#icon-pause"),
  miniIconPlay: getEl("#mini-icon-play"),
  miniIconPause: getEl("#mini-icon-pause"),
  track: getEl("#progress-track"),
  fill: getEl("#progress-fill"),
  thumb: getEl("#progress-thumb"),
  timeCurrent: getEl("#time-current"),
  timeTotal: getEl("#time-total"),
  status: getEl("#status"),
  scenePhoto: getEl("#scene-photo"),
  miniScenePhoto: getEl("#mini-scene-photo"),
  keyboardHints: getEl("#keyboard-hints"),
  minimizeBtn: getEl("#minimize-btn"),
};
```

- [ ] **Step 3: Replace time-of-day strip grouping with theme helpers**

Delete `buildStrip`, `groupStopsByTimeOfDay`, and `updateStrip`. Add:

```javascript
function themeStops(theme) {
  return state.stops
    .map((stop, index) => ({ ...stop, index }))
    .filter((stop) => stop.theme === theme);
}

function themeCount(theme) {
  return themeStops(theme).length;
}

function buildThemeTabs() {
  clearNode(ui.themeTabs);

  THEME_ORDER.forEach((theme) => {
    const meta = THEME_META[theme];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-tab";
    button.id = `theme-tab-${meta.token}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.activeTheme === theme));
    button.style.setProperty("--theme-color", meta.color);
    button.dataset.theme = theme;

    const swatch = document.createElement("span");
    swatch.className = "theme-swatch";
    swatch.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "theme-name";
    name.textContent = theme;

    const count = document.createElement("span");
    count.className = "theme-count";
    count.textContent = String(themeCount(theme));

    button.append(swatch, name, count);
    button.addEventListener("click", () => setActiveTheme(theme, true));
    ui.themeTabs.appendChild(button);
  });
}

function buildChipCarousel() {
  clearNode(ui.chipCarousel);
  ui.chipCarousel.classList.remove("is-switching");

  themeStops(state.activeTheme).forEach((stop) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "specimen-chip stamp-chip";
    chip.dataset.index = String(stop.index);
    chip.style.setProperty("--theme-color", THEME_META[stop.theme].color);
    chip.setAttribute("aria-label", `Select ${stop.title}`);
    chip.addEventListener("click", () => selectStop(stop.index, !ui.audio.paused));

    const frame = document.createElement("span");
    frame.className = "chip-photo-frame";
    if (stop.imagePath) {
      const img = document.createElement("img");
      img.src = encodeURI(`../${stop.imagePath}`);
      img.alt = "";
      img.decoding = "async";
      frame.appendChild(img);
    }

    const title = document.createElement("strong");
    title.textContent = stop.title;

    const meta = document.createElement("small");
    meta.textContent = `${String(stop.index + 1).padStart(2, "0")} - ${stop.timeOfDay}`;

    chip.append(frame, title, meta);
    ui.chipCarousel.appendChild(chip);
  });
}

function updateThemeNav() {
  ui.themeTabs.querySelectorAll(".theme-tab").forEach((tab) => {
    const isActive = tab.dataset.theme === state.activeTheme;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  ui.chipCarousel.querySelectorAll(".specimen-chip").forEach((chip) => {
    const isActive = Number(chip.dataset.index) === state.index;
    chip.classList.toggle("is-active", isActive);
  });

  const activeChip = ui.chipCarousel.querySelector(".specimen-chip.is-active");
  if (activeChip) {
    activeChip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function setActiveTheme(theme, selectFirst = false) {
  if (!THEME_META[theme]) return;
  state.activeTheme = theme;
  ui.body.dataset.theme = THEME_META[theme].token;
  ui.chipCarousel.classList.add("is-switching");

  window.setTimeout(() => {
    buildThemeTabs();
    buildChipCarousel();
    updateThemeNav();

    if (selectFirst) {
      const first = themeStops(theme)[0];
      if (first && first.index !== state.index) {
        selectStop(first.index, !ui.audio.paused, { keepActiveTheme: true });
      }
    }
  }, 120);
}
```

- [ ] **Step 4: Replace image and minimize helpers**

Replace `updateScenePhoto` and `toggleMinimize` with:

```javascript
function setPhoto(img, imagePath, title) {
  img.classList.remove("is-fallback");
  img.alt = imagePath ? `${title} source photograph` : "";

  if (!imagePath) {
    img.removeAttribute("src");
    img.classList.add("is-fallback");
    return;
  }

  const src = encodeURI(`../${imagePath}`);
  preloadImage(src).then((loaded) => {
    if (loaded && state.stops[state.index]?.imagePath === imagePath) {
      img.src = loaded;
      img.classList.add("is-loaded");
    } else if (!loaded) {
      img.removeAttribute("src");
      img.classList.add("is-fallback");
    }
  });
}

function updateScenePhoto(stop) {
  setPhoto(ui.scenePhoto, stop.imagePath, stop.title);
  setPhoto(ui.miniScenePhoto, stop.imagePath, stop.title);
}

function setMinimized(nextValue) {
  const apply = () => {
    state.isMinimized = nextValue;
    ui.playerCard.classList.toggle("is-minimized", state.isMinimized);
    ui.body.classList.toggle("player-is-minimized", state.isMinimized);
    ui.minimizeBtn.setAttribute(
      "aria-label",
      state.isMinimized ? "Expand player" : "Minimize player",
    );
    ui.miniExpand.disabled = !state.isMinimized;
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && typeof document.startViewTransition === "function") {
    document.startViewTransition(apply);
  } else {
    apply();
  }
}

function toggleMinimize() {
  setMinimized(!state.isMinimized);
}
```

- [ ] **Step 5: Update `selectStop` and icon state**

Replace `selectStop` with:

```javascript
function selectStop(index, autoPlay = false, options = {}) {
  if (!state.stops[index]) return;

  state.index = index;
  state.autoPlayNext = autoPlay;
  const stop = state.stops[index];
  const themeMeta = THEME_META[stop.theme] || THEME_META.Thermal;

  if (!options.keepActiveTheme) {
    state.activeTheme = stop.theme;
  }

  ui.body.classList.add("is-switching");
  ui.body.dataset.theme = themeMeta.token;
  ui.playerCard.style.setProperty("--theme-color", themeMeta.color);

  window.setTimeout(() => {
    const specimenNumber = String(state.index + 1).padStart(2, "0");
    const eyebrowText = `YELLOWSTONE - ${specimenNumber}`;
    const metaText = `${stop.theme} - ${stop.zoneLabel} - ${stop.timeOfDay}`;

    ui.eyebrow.textContent = eyebrowText;
    ui.miniEyebrow.textContent = eyebrowText;
    ui.title.textContent = stop.title;
    ui.miniTitle.textContent = stop.title;
    ui.meta.textContent = metaText;
    ui.miniMeta.textContent = `${stop.theme} - ${stop.timeOfDay}`;
    ui.desc.textContent = descriptionOverrides[stop.id] || stop.description;
    ui.credit.textContent = stop.credit;

    ui.audio.src = encodeURI(`../${stop.audioPath}`);
    ui.audio.load();

    ui.timeCurrent.textContent = "0:00";
    ui.timeTotal.textContent = "0:00";
    ui.fill.style.width = "0%";
    ui.thumb.style.left = "0%";
    ui.track.setAttribute("aria-valuenow", "0");
    updateWaveform(0);

    updateScenePhoto(stop);

    if (!autoPlay) {
      state.isPlaying = false;
      updatePlayIcon();
    }

    updateNav();
    buildThemeTabs();
    buildChipCarousel();
    updateThemeNav();
    buildWaveform(stop.id.length + index);

    requestAnimationFrame(() => {
      ui.body.classList.remove("is-switching");
    });
  }, 160);
}
```

Replace `updatePlayIcon` with:

```javascript
function updatePlayIcon() {
  const playing = !ui.audio.paused;
  ui.iconPlay.style.display = playing ? "none" : "block";
  ui.iconPause.style.display = playing ? "block" : "none";
  ui.miniIconPlay.style.display = playing ? "none" : "block";
  ui.miniIconPause.style.display = playing ? "block" : "none";
  ui.play.setAttribute("aria-label", playing ? "Pause" : "Play");
  ui.miniPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
  ui.waveform.classList.toggle("playing", playing);
}
```

- [ ] **Step 6: Update initialization and event listeners**

Replace the bottom event listener block with:

```javascript
ui.track.addEventListener("click", seekFromEvent);
ui.track.addEventListener("mousedown", (e) => {
  state.isDragging = true;
  ui.track.classList.add("dragging");
  seekFromEvent(e);
});

ui.track.addEventListener("touchstart", (e) => {
  state.isDragging = true;
  ui.track.classList.add("dragging");
  seekFromEvent(e);
  e.preventDefault();
}, { passive: false });

document.addEventListener("mousemove", (e) => {
  if (!state.isDragging) return;
  seekFromEvent(e);
});

document.addEventListener("touchmove", (e) => {
  if (!state.isDragging) return;
  seekFromEvent(e);
  e.preventDefault();
}, { passive: false });

document.addEventListener("mouseup", () => {
  if (!state.isDragging) return;
  state.isDragging = false;
  ui.track.classList.remove("dragging");
});

document.addEventListener("touchend", () => {
  if (!state.isDragging) return;
  state.isDragging = false;
  ui.track.classList.remove("dragging");
});

ui.track.addEventListener("keydown", (e) => {
  if (!ui.audio.duration) return;
  const step = ui.audio.duration * 0.05;
  if (e.key === "ArrowLeft") {
    ui.audio.currentTime = Math.max(0, ui.audio.currentTime - step);
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    ui.audio.currentTime = Math.min(ui.audio.duration, ui.audio.currentTime + step);
    e.preventDefault();
  }
});

ui.play.addEventListener("click", togglePlay);
ui.miniPlay.addEventListener("click", (e) => {
  e.stopPropagation();
  togglePlay();
});
ui.prev.addEventListener("click", () => selectStop(Math.max(0, state.index - 1), !ui.audio.paused));
ui.next.addEventListener("click", () => selectStop(Math.min(state.stops.length - 1, state.index + 1), !ui.audio.paused));
ui.minimizeBtn.addEventListener("click", toggleMinimize);
ui.miniExpand.addEventListener("click", () => {
  setMinimized(false);
});

ui.audio.addEventListener("play", updatePlayIcon);
ui.audio.addEventListener("pause", updatePlayIcon);
ui.audio.addEventListener("timeupdate", onTimeUpdate);
ui.audio.addEventListener("loadedmetadata", onLoadedMeta);
ui.audio.addEventListener("ended", onEnded);
ui.audio.addEventListener("error", () => {
  ui.audio.pause();
  showStatus("Audio unavailable for this specimen.", true);
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, [contenteditable]")) return;

  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
    showKeyboardHints();
  } else if (e.code === "ArrowLeft" && e.altKey) {
    e.preventDefault();
    selectStop(Math.max(0, state.index - 1), !ui.audio.paused);
    showKeyboardHints();
  } else if (e.code === "ArrowRight" && e.altKey) {
    e.preventDefault();
    selectStop(Math.min(state.stops.length - 1, state.index + 1), !ui.audio.paused);
    showKeyboardHints();
  } else if (e.code === "KeyM") {
    e.preventDefault();
    toggleMinimize();
    showKeyboardHints();
  }
});
```

Update `loadRoute` so it initializes theme tabs before selecting the first stop:

```javascript
async function loadRoute() {
  try {
    const res = await fetch(ROUTE_URL);
    if (!res.ok) throw new Error(`Route request failed: ${res.status}`);

    const stops = await res.json();
    validateStops(stops);

    state.stops = stops;
    state.activeTheme = "Thermal";
    buildThemeTabs();
    buildChipCarousel();
    selectStop(0);
    showStatus(`${stops.length} sound specimens loaded`);
  } catch (err) {
    showStatus(err.message, true);
    ui.title.textContent = "Unable to load route";
    ui.desc.textContent = err.message;
  }
}
```

- [ ] **Step 7: Run tests and commit JavaScript behavior**

Run:

```bash
pytest tests/test_atlas_data.py tests/test_atlas_static.py -v
```

Expected: PASS.

Run:

```bash
git add atlas/js/app.js tests/test_atlas_data.py
git commit -m "feat: add theme stamp navigation"
```

---

### Task 4: Replace CSS With Stamp System

**Files:**
- Modify: `atlas/css/main.css`
- Test: browser visual inspection

- [ ] **Step 1: Replace the root, reset, and stamp foundation**

Replace the beginning of `atlas/css/main.css` through the current `.player-card` block with:

```css
@property --hole {
  syntax: "<length>";
  inherits: true;
  initial-value: 1.6px;
}

@property --br {
  syntax: "<length>";
  inherits: true;
  initial-value: 2px;
}

:root {
  color-scheme: light;
  --ink: oklch(15% 0.034 92);
  --ink-soft: oklch(28% 0.05 80);
  --bone: oklch(94% 0.03 88);
  --bone-deep: oklch(88% 0.04 82);
  --field: oklch(24% 0.035 90);
  --field-dark: oklch(13% 0.026 88);
  --line: oklch(28% 0.05 80 / 0.65);
  --line-soft: oklch(28% 0.05 80 / 0.22);
  --t-thermal: oklch(58% 0.12 48);
  --t-birds: oklch(56% 0.10 130);
  --t-wildlife: oklch(48% 0.07 70);
  --t-human: oklch(46% 0.04 80);
  --t-weather: oklch(54% 0.08 240);
  --t-ambient: oklch(60% 0.04 95);
  --t-water: oklch(54% 0.10 200);
  --theme-color: var(--t-thermal);
  --strip-height: 156px;
  --font-display: "Iowan Old Style", Charter, Georgia, serif;
  --font-mono: ui-monospace, "JetBrains Mono", Menlo, monospace;
  --font-body: Charter, Georgia, serif;
}

body[data-theme="thermal"] { --theme-color: var(--t-thermal); }
body[data-theme="birds"] { --theme-color: var(--t-birds); }
body[data-theme="wildlife"] { --theme-color: var(--t-wildlife); }
body[data-theme="human"] { --theme-color: var(--t-human); }
body[data-theme="weather"] { --theme-color: var(--t-weather); }
body[data-theme="ambient"] { --theme-color: var(--t-ambient); }
body[data-theme="water"] { --theme-color: var(--t-water); }

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
  min-height: 100dvh;
  display: grid;
  grid-template-rows: 1fr auto;
  overflow: hidden;
  background:
    linear-gradient(180deg, oklch(19% 0.035 92), var(--field-dark)),
    var(--field);
  color: var(--bone);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

button {
  font: inherit;
}

svg {
  width: 1em;
  height: 1em;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: clamp(14px, 2.2vw, 28px);
  padding-bottom: calc(var(--strip-height) + 18px);
}

.stamp-player {
  --hole: 1.6px;
  --br: 2px;
  position: relative;
  width: min(560px, 92vw);
  color: var(--ink);
  view-transition-name: player;
  z-index: 2;
}

.stamp-face {
  background:
    radial-gradient(circle at 15% 8%, oklch(100% 0 0 / 0.5), transparent 28%),
    linear-gradient(180deg, var(--bone), var(--bone-deep));
  border: 1px solid var(--line);
  color: var(--ink);
  mask:
    radial-gradient(circle var(--hole) at 50% 0, transparent 98%, #000 101%) top left / 10px 100% repeat-x,
    radial-gradient(circle var(--hole) at 50% 100%, transparent 98%, #000 101%) bottom left / 10px 100% repeat-x,
    radial-gradient(circle var(--hole) at 0 50%, transparent 98%, #000 101%) top left / 100% 10px repeat-y,
    radial-gradient(circle var(--hole) at 100% 50%, transparent 98%, #000 101%) top right / 100% 10px repeat-y;
  mask-composite: intersect;
  -webkit-mask:
    radial-gradient(circle var(--hole) at 50% 0, transparent 98%, #000 101%) top left / 10px 100% repeat-x,
    radial-gradient(circle var(--hole) at 50% 100%, transparent 98%, #000 101%) bottom left / 10px 100% repeat-x,
    radial-gradient(circle var(--hole) at 0 50%, transparent 98%, #000 101%) top left / 100% 10px repeat-y,
    radial-gradient(circle var(--hole) at 100% 50%, transparent 98%, #000 101%) top right / 100% 10px repeat-y;
  -webkit-mask-composite: source-in;
  box-shadow: 0 34px 90px oklch(4% 0.02 85 / 0.46);
}

.stamp-expanded {
  display: grid;
  gap: clamp(10px, 1.7vh, 16px);
  padding: clamp(18px, 2.8vw, 30px);
  max-height: min(720px, calc(100dvh - var(--strip-height) - 48px));
  overflow: hidden;
}

.stamp-mini {
  display: none;
}
```

- [ ] **Step 2: Add expanded stamp typography, photo, controls, progress, and waveform CSS**

Append this after the foundation block:

```css
.stamp-rule {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-block: 1px solid var(--line-soft);
  padding-block: 7px;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stamp-rule-top {
  position: relative;
  padding-right: 42px;
}

.volume-mark {
  margin: 0;
}

.eyebrow {
  margin: 0;
}

.minimize-btn {
  position: absolute;
  top: 50%;
  right: 0;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}

.stamp-photo-frame,
.mini-photo-frame,
.chip-photo-frame {
  background: oklch(20% 0.025 82);
  border: 1px solid var(--line);
  overflow: hidden;
}

.stamp-photo-frame {
  margin: 0;
  aspect-ratio: 1.45 / 1;
}

.scene-photo,
#mini-scene-photo,
.chip-photo-frame img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: saturate(0.95) contrast(1.04);
}

.scene-photo.is-fallback,
#mini-scene-photo.is-fallback {
  background:
    radial-gradient(circle at 35% 25%, color-mix(in oklch, var(--theme-color) 28%, transparent), transparent 38%),
    linear-gradient(135deg, oklch(42% 0.04 86), oklch(23% 0.03 82));
}

.stamp-copy {
  display: grid;
  gap: 6px;
}

.track-title {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 4.2rem);
  font-style: italic;
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: 0;
}

.track-meta,
.track-credit,
.time-row {
  margin: 0;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.track-desc {
  margin: 6px 0 0;
  max-width: 58ch;
  color: var(--ink);
  font-size: clamp(0.92rem, 1.6vw, 1.05rem);
  line-height: 1.42;
}

.waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 52px;
  border-block: 1px solid var(--line-soft);
  padding-block: 8px;
}

.wave-bar {
  flex: 1;
  min-width: 2px;
  height: var(--h, 40%);
  background: oklch(15% 0.034 92 / 0.25);
  transform-origin: bottom;
  transition: background 160ms ease;
}

.wave-bar.played {
  background: var(--ink);
}

.waveform.playing .wave-bar {
  animation: wave-breathe 700ms ease-in-out infinite alternate;
  animation-delay: var(--d, 0ms);
}

@keyframes wave-breathe {
  from { transform: scaleY(0.68); }
  to { transform: scaleY(1.16); }
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.ctrl-btn {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bone);
  color: var(--ink);
  cursor: pointer;
}

.play-btn {
  width: 56px;
  height: 56px;
  background: var(--ink);
  color: var(--bone);
  border-color: var(--ink);
}

#icon-pause,
#mini-icon-pause {
  display: none;
}

.ctrl-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.progress-area {
  display: grid;
  gap: 7px;
}

.time-row {
  display: flex;
  justify-content: space-between;
}

.progress-track {
  position: relative;
  height: 16px;
  cursor: pointer;
}

.progress-track::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: oklch(15% 0.034 92 / 0.25);
  transform: translateY(-50%);
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 50%;
  width: 0%;
  height: 1px;
  background: var(--ink);
  transform: translateY(-50%);
}

.progress-thumb {
  position: absolute;
  top: 50%;
  left: 0%;
  width: 10px;
  height: 10px;
  background: var(--ink);
  transform: translate(-50%, -50%) rotate(45deg);
}
```

- [ ] **Step 3: Add minimized stamp, theme tabs, chip carousel, View Transition, and responsive CSS**

Append this after the expanded stamp section:

```css
.player-card.is-minimized {
  position: fixed;
  right: 18px;
  bottom: calc(var(--strip-height) + 16px);
  width: 116px;
  z-index: 20;
}

.player-card.is-minimized .stamp-expanded {
  display: none;
}

.player-card.is-minimized .stamp-mini {
  --hole: 1.25px;
  display: grid;
  gap: 5px;
  width: 116px;
  min-height: 144px;
  padding: 8px;
  cursor: pointer;
}

.mini-rule {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 0.42rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-block: 1px solid var(--line-soft);
  padding-block: 3px;
}

.mini-photo-frame {
  position: relative;
  margin: 0;
  aspect-ratio: 1 / 0.76;
}

.mini-play-btn {
  position: absolute;
  left: 5px;
  bottom: 5px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: var(--bone);
  cursor: pointer;
}

.mini-copy {
  display: grid;
  gap: 2px;
}

.mini-copy p {
  margin: 0;
}

#mini-track-title {
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-style: italic;
  line-height: 1;
}

#mini-track-meta {
  font-family: var(--font-mono);
  font-size: 0.44rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.specimen-strip {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: grid;
  gap: 10px;
  height: var(--strip-height);
  padding: 12px clamp(14px, 3vw, 32px);
  background: oklch(12% 0.026 88 / 0.92);
  border-top: 1px solid oklch(94% 0.03 88 / 0.16);
}

.theme-tabs {
  display: flex;
  align-items: end;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}

.theme-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 0 0 7px;
  background: transparent;
  color: oklch(94% 0.03 88 / 0.5);
  font-family: var(--font-mono);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.theme-tab.is-active {
  color: var(--bone);
  border-bottom-color: var(--theme-color);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-style: italic;
  letter-spacing: 0;
  text-transform: none;
}

.theme-swatch {
  width: 8px;
  height: 8px;
  background: var(--theme-color);
  box-shadow: 0 0 12px color-mix(in oklch, var(--theme-color) 65%, transparent);
}

.theme-count {
  opacity: 0.72;
}

.chip-carousel {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-color: var(--theme-color) transparent;
  transition: opacity 180ms ease, transform 180ms ease;
}

.chip-carousel.is-switching {
  opacity: 0;
  transform: translateY(4px);
}

.stamp-chip {
  --hole: 0.9px;
  flex: 0 0 78px;
  display: grid;
  gap: 4px;
  width: 78px;
  min-height: 100px;
  padding: 6px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, var(--bone), var(--bone-deep));
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}

.stamp-chip:not(.is-active) img {
  filter: grayscale(0.5) brightness(0.85);
}

.stamp-chip.is-active {
  transform: translateY(-3px);
  box-shadow: 0 0 0 2px var(--theme-color), 0 10px 22px oklch(4% 0.02 85 / 0.3);
}

.chip-photo-frame {
  display: block;
  aspect-ratio: 1 / 0.72;
}

.stamp-chip strong {
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 400;
  font-style: italic;
  line-height: 1;
}

.stamp-chip small {
  font-family: var(--font-mono);
  font-size: 0.43rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

::view-transition-group(player) {
  animation-duration: 720ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

::view-transition-old(player),
::view-transition-new(player) {
  animation-duration: 720ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

::view-transition-old(player) {
  animation-name: stamp-old;
}

::view-transition-new(player) {
  animation-name: stamp-new;
}

@keyframes stamp-old {
  from { opacity: 1; filter: blur(0); transform: scale(1); }
  50% { opacity: 0.45; filter: blur(8px); transform: scale(0.98, 1.025); }
  to { opacity: 0; filter: blur(8px); transform: scale(0.55); }
}

@keyframes stamp-new {
  from { opacity: 0; filter: blur(8px); transform: scale(0.5); }
  50% { opacity: 0.55; filter: blur(8px); transform: scale(1.025, 0.98); }
  to { opacity: 1; filter: blur(0); transform: scale(1); }
}

button:focus-visible,
.stamp-mini:focus-visible,
.progress-track:focus-visible,
.stamp-chip:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 3px;
}

.status {
  position: fixed;
  left: 50%;
  bottom: calc(var(--strip-height) + 8px);
  z-index: 30;
  margin: 0;
  padding: 5px 10px;
  transform: translateX(-50%);
  border: 1px solid oklch(94% 0.03 88 / 0.2);
  background: oklch(12% 0.026 88 / 0.88);
  color: var(--bone);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}

.status.visible {
  opacity: 1;
}

.status.error {
  color: oklch(68% 0.16 35);
}

.keyboard-hints {
  position: fixed;
  right: 16px;
  bottom: calc(var(--strip-height) + 12px);
  z-index: 12;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}

.keyboard-hints.visible {
  opacity: 0.72;
}

.keyboard-hints kbd {
  display: inline-flex;
  gap: 6px;
  padding: 3px 7px;
  border: 1px solid oklch(94% 0.03 88 / 0.18);
  background: oklch(12% 0.026 88 / 0.78);
  color: var(--bone);
  font-family: var(--font-mono);
  font-size: 0.58rem;
}

.noscript-notice {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--field-dark);
}

@media (max-width: 560px) {
  :root {
    --strip-height: 148px;
  }

  .stage {
    padding-inline: 10px;
  }

  .stamp-expanded {
    padding: 14px;
  }

  .track-title {
    font-size: 2rem;
  }

  .player-card.is-minimized {
    right: 12px;
    width: 96px;
  }

  .player-card.is-minimized .stamp-mini {
    width: 96px;
    min-height: 120px;
  }

  .stamp-chip {
    flex-basis: 72px;
    width: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Run static tests and commit CSS**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: PASS.

Run:

```bash
git add atlas/css/main.css
git commit -m "feat: style stamp atlas player"
```

---

### Task 5: Browser Verification And Runtime Fixes

**Files:**
- Modify only files touched above if browser verification exposes a defect.
- Test: local static server and browser inspection.

- [ ] **Step 1: Run the full Python test suite**

Run:

```bash
pytest -v
```

Expected: 23 passed.

- [ ] **Step 2: Start a local static server**

Run:

```bash
python3 -m http.server 4173
```

Expected: the server logs `Serving HTTP on :: port 4173` or `Serving HTTP on 0.0.0.0 port 4173`.

- [ ] **Step 3: Open the atlas in a browser**

Open:

```text
http://localhost:4173/atlas/
```

Expected on first load:
- The expanded player is a bone-paper stamp, not a dark glass card.
- The stamp has scalloped perforations on all four edges and no holes in the interior.
- The first selected stop is American Coots, while the active tab becomes Birds because `selectStop(0)` follows the data.
- The bottom strip shows seven tabs with counts `Thermal 24`, `Birds 21`, `Wildlife 10`, `Human 2`, `Weather 2`, `Ambient 1`, `Water 1`.

- [ ] **Step 4: Verify theme navigation reachability**

Manual browser actions:
1. Click `Thermal`, scroll the chip carousel, click the last Thermal chip.
2. Click `Birds`, scroll the chip carousel, click the last Birds chip.
3. Repeat for `Wildlife`, `Human`, `Weather`, `Ambient`, and `Water`.

Expected:
- Each tab swap fades the chip row.
- Each chip click updates title, metadata, description, image, audio source, and active chip state.
- No tab leaves an empty carousel.

- [ ] **Step 5: Verify player controls**

Manual browser actions:
1. Click play.
2. Click pause.
3. Drag or click the progress track.
4. Click previous and next.
5. Press `Space`, `Alt+Right`, `Alt+Left`, and `M`.

Expected:
- Play/pause icons update in both expanded and mini faces.
- Progress fill and diamond thumb update while audio plays.
- Previous and next change stops and preserve audio autoplay when audio was already playing.
- `Space`, `Alt+Right`, `Alt+Left`, and `M` work when the player is expanded and minimized.

- [ ] **Step 6: Verify minimize and reduced motion**

Manual browser actions:
1. Click the minimize chevron.
2. Inspect the mini player at the bottom-right above the strip.
3. Click the mini play badge.
4. Click the mini stamp body.
5. Emulate `prefers-reduced-motion: reduce` in browser dev tools and repeat minimize/expand.

Expected:
- Expanded to minimized morph lasts roughly 720ms.
- The mini player is `116x144` on desktop and `96x120` on mobile width.
- Clicking the mini play badge toggles playback without expanding.
- Clicking the mini body expands.
- Reduced motion skips View Transition animation and still toggles layout.

- [ ] **Step 7: Commit runtime fixes after verification**

If any runtime fixes were needed, run:

```bash
pytest -v
git add atlas/index.html atlas/js/app.js atlas/css/main.css tests/test_atlas_data.py tests/test_atlas_static.py
git commit -m "fix: verify stamp atlas runtime"
```

Expected: only commit after tests pass and browser verification is complete.

---

### Task 6: Final Review Gate

**Files:**
- Read: `docs/superpowers/specs/2026-05-10-radical-stamp-redesign-design.md`
- Read: git diff

- [ ] **Step 1: Run final automated verification**

Run:

```bash
pytest -v
```

Expected: 23 passed.

- [ ] **Step 2: Review changed files**

Run:

```bash
git diff --stat HEAD~4..HEAD
git diff HEAD~4..HEAD -- tests/test_atlas_data.py tests/test_atlas_static.py atlas/index.html atlas/js/app.js atlas/css/main.css
```

Expected:
- Data file is unchanged by this plan.
- Static tests assert split asset paths and stamp structure.
- JavaScript uses `theme`, not `timeOfDay`, for bottom navigation grouping.
- CSS contains `@property --hole`, View Transition `player`, and reduced-motion override.

- [ ] **Step 3: Check acceptance criteria manually**

Confirm:
- Minimized state is a perforated bone stamp and not a nested card.
- Morph duration is controlled by 720ms View Transition CSS.
- Reduced motion bypasses animated View Transition.
- Seven theme tabs show counts `24 / 21 / 10 / 2 / 2 / 1 / 1`.
- All 61 stops are reachable through theme tabs and chip carousel.
- `Space`, `Alt+Right`, `Alt+Left`, and `M` work in expanded and minimized states.
- Audio load, time update, ended-next, and error status behavior still works.

---

## Self-Review Notes

**Spec coverage:**
- Big stamp: Task 2 creates expanded stamp HTML; Task 4 styles bone paper, photo frame, typography, waveform, controls, progress, and bottom rule.
- Mini stamp: Task 2 creates mini stamp face; Task 3 wires expand and mini play; Task 4 sets desktop/mobile size and fixed bottom-right placement.
- Bottom strip: Task 2 creates theme shell; Task 3 generates theme tabs and filtered chips from real `theme`; Task 4 styles tabs and mini-stamp chips.
- Morph animation: Task 3 uses `document.startViewTransition`; Task 4 sets `view-transition-name: player`, 720ms timing, blur/scale cross-fade, and reduced-motion behavior.
- Data honesty: Task 1 locks exact theme counts and Task 3 uses `theme` as the primary navigation axis.
- Audio regression guard: Task 3 preserves existing audio, progress, keyboard, ended-next, and error handlers; Task 5 verifies them manually.

**Known implementation risks:**
- CSS edge-only perforations must be inspected in browser because mask-composite behavior is visual and not covered by pytest.
- Browser timing should be checked with dev tools because pytest cannot verify the 700-750ms morph window.
- The first data stop is Birds, while the spec tab order starts Thermal by count. This plan lets `selectStop(0)` set the active tab to Birds on load so the active tab always matches the active specimen.
