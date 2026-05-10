# Dawn to Night Sound Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static `Yellowstone Sound Atlas: Dawn to Night` route exhibit with a stylized route map, stop cards, and one audio player using existing YSL MP3/JPG assets.

**Architecture:** Add a small static site in `atlas/` backed by one hand-authored JSON route file. Keep validation in Python tests so broken asset paths or malformed route data fail before browser QA. Use plain HTML/CSS/JavaScript and existing repository assets; do not change `spider.py` or existing asset folders.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, native `<audio>`, JSON, Python `pytest` for route-data/static-file validation.

---

## File Structure

- Create `atlas/dawn-to-night.json`: curated 6-8 stop route data.
- Create `atlas/index.html`: semantic static page shell and containers.
- Create `atlas/styles.css`: responsive visual styling for route map, stop panel, route cards, and player.
- Create `atlas/app.js`: load route JSON, render state, select stops, and control audio.
- Create `tests/test_atlas_data.py`: validate route JSON shape and referenced media files.
- Create `tests/test_atlas_static.py`: validate static HTML references and required UI anchors.
- Modify `README.md`: add a short link/usage note for the atlas page.

Do not stage or commit `.superpowers/`; it is a visual companion workspace artifact.

---

### Task 1: Route Data Contract

**Files:**
- Create: `tests/test_atlas_data.py`
- Create: `atlas/dawn-to-night.json`

- [ ] **Step 1: Write the failing route-data tests**

Create `tests/test_atlas_data.py`:

```python
"""Validation tests for the Dawn to Night sound atlas route data."""

import json
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


def load_route():
    with ROUTE_PATH.open(encoding="utf-8") as route_file:
        return json.load(route_file)


def test_route_file_exists():
    assert ROUTE_PATH.exists()


def test_route_has_first_version_stop_count():
    route = load_route()
    assert isinstance(route, list)
    assert 6 <= len(route) <= 8


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

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
pytest tests/test_atlas_data.py -v
```

Expected: FAIL because `atlas/dawn-to-night.json` does not exist yet.

- [ ] **Step 3: Create the first route JSON**

Create `atlas/dawn-to-night.json`:

```json
[
  {
    "id": "dawn-chorus",
    "title": "Dawn Chorus",
    "timeOfDay": "Dawn",
    "theme": "Birds",
    "zoneLabel": "Morning soundscape",
    "audioPath": "Dawn Chorus/Sound Library - Dawn Chorus.mp3",
    "imagePath": "Dawn Chorus/Sound Library - Dawn Chorus_NPS_Neal Herbert.jpg",
    "description": "The route opens with layered birdsong as the park wakes up.",
    "credit": "Audio and image courtesy of National Park Service."
  },
  {
    "id": "mountain-bluebird",
    "title": "Mountain Bluebird",
    "timeOfDay": "Morning",
    "theme": "Birds",
    "zoneLabel": "Open meadow",
    "audioPath": "Mountain Bluebird/Sound Library - Mountain Bluebird.mp3",
    "imagePath": "Mountain Bluebird/Sound Library - Mountain Bluebird_NPS _ Neal Herbert.jpg",
    "description": "A bright morning wildlife stop before the route reaches the thermal basins.",
    "credit": "Audio and image courtesy of National Park Service."
  },
  {
    "id": "old-faithful",
    "title": "Old Faithful",
    "timeOfDay": "Midday",
    "theme": "Thermal",
    "zoneLabel": "Upper Geyser Basin",
    "audioPath": "Old Faithful Geyser/Sound Library - Old Faithful.mp3",
    "imagePath": "Old Faithful Geyser/Sound Library - Old Faithful_NPS_Neal Herbert.jpg",
    "description": "The route moves into Yellowstone's iconic geothermal soundscape.",
    "credit": "Audio and image courtesy of National Park Service."
  },
  {
    "id": "black-growler-steam-vent",
    "title": "Black Growler Steam Vent",
    "timeOfDay": "Afternoon",
    "theme": "Thermal",
    "zoneLabel": "Norris Geyser Basin",
    "audioPath": "Black Growler Steam Vent/Sound Library - Black Growler Steam Vent.mp3",
    "imagePath": "Black Growler Steam Vent/Sound Library - Black Growler Steam Vent_NPS_Neal Herbert_2014-01-31.jpg",
    "description": "Steam and pressure add a harsher texture to the afternoon route.",
    "credit": "Audio and image courtesy of National Park Service."
  },
  {
    "id": "singing-lake",
    "title": "Singing Lake",
    "timeOfDay": "Late Afternoon",
    "theme": "Water",
    "zoneLabel": "Yellowstone Lake",
    "audioPath": "Yellowstone Lake (singing)/Sound Library - Singing Lake.mp3",
    "imagePath": "Yellowstone Lake (singing)/Sound Library - Singing Lake_NPS _ Jim Peaco_.jpg",
    "description": "The route opens out from thermal noise into lake atmosphere.",
    "credit": "Audio and image courtesy of National Park Service."
  },
  {
    "id": "elk",
    "title": "Elk",
    "timeOfDay": "Dusk",
    "theme": "Wildlife",
    "zoneLabel": "Evening meadow",
    "audioPath": "Elk/Sound Library - Elk.mp3",
    "imagePath": "Elk/Sound Library - Elk_NPS _ Neal Herbert_2016-09-13.jpg",
    "description": "A dusk wildlife encounter shifts the route toward evening.",
    "credit": "Audio and image courtesy of National Park Service."
  },
  {
    "id": "wolves",
    "title": "Wolves",
    "timeOfDay": "Night",
    "theme": "Wildlife",
    "zoneLabel": "Night soundscape",
    "audioPath": "Wolves/Sound Library - Wolves.mp3",
    "imagePath": "Wolves/Sound Library - Wolves_NPS _ Jacob Frank_2016-01-11.jpg",
    "description": "The journey closes with distant night wildlife.",
    "credit": "Audio and image courtesy of National Park Service."
  }
]
```

- [ ] **Step 4: Run route-data tests**

Run:

```bash
pytest tests/test_atlas_data.py -v
```

Expected: all tests PASS. If any image filename differs on disk, update only the `imagePath` value to an existing JPG and rerun.

- [ ] **Step 5: Commit**

```bash
git add atlas/dawn-to-night.json tests/test_atlas_data.py
git commit -m "feat: add dawn to night route data"
```

---

### Task 2: Static Page Shell

**Files:**
- Create: `tests/test_atlas_static.py`
- Create: `atlas/index.html`

- [ ] **Step 1: Write static HTML tests**

Create `tests/test_atlas_static.py`:

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


def test_index_references_local_css_and_javascript():
    page = load_page()

    stylesheet = page.find("link", rel="stylesheet")
    script = page.find("script", src=True)

    assert stylesheet["href"] == "styles.css"
    assert script["src"] == "app.js"


def test_index_contains_required_application_regions():
    page = load_page()

    for element_id in [
        "route-map",
        "route-list",
        "current-stop",
        "audio-player",
        "status-message",
    ]:
        assert page.find(id=element_id), element_id


def test_index_contains_accessible_navigation_buttons():
    page = load_page()

    previous_button = page.find("button", id="previous-stop")
    next_button = page.find("button", id="next-stop")

    assert previous_button
    assert previous_button.get("aria-label") == "Previous stop"
    assert next_button
    assert next_button.get("aria-label") == "Next stop"
```

- [ ] **Step 2: Run static tests to verify they fail**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: FAIL because `atlas/index.html` does not exist yet.

- [ ] **Step 3: Create the HTML shell**

Create `atlas/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Yellowstone Sound Atlas: Dawn to Night</title>
    <meta
      name="description"
      content="A guided Yellowstone sound route from dawn birdsong to night wildlife."
    >
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="atlas-shell">
      <section class="hero" aria-labelledby="atlas-title">
        <p class="eyebrow">Yellowstone Sound Atlas</p>
        <h1 id="atlas-title">Dawn to Night</h1>
        <p class="hero-copy">
          Follow a guided listening route through Yellowstone's public-domain
          sound library, from morning birdsong to night wildlife.
        </p>
      </section>

      <section class="atlas-grid" aria-label="Dawn to Night route">
        <div class="map-panel">
          <div class="map-header">
            <h2>Route Map</h2>
            <p id="status-message" role="status">Loading route...</p>
          </div>
          <div id="route-map" class="route-map" aria-label="Selectable route stops"></div>
        </div>

        <article id="current-stop" class="current-stop" aria-live="polite">
          <div class="image-frame" id="current-image-frame">
            <span id="current-image-fallback">Yellowstone</span>
          </div>
          <div class="stop-copy">
            <p class="stop-chapter" id="current-chapter">Dawn</p>
            <h2 id="current-title">Loading...</h2>
            <p id="current-description"></p>
            <p class="stop-meta" id="current-meta"></p>
            <p class="credit" id="current-credit"></p>
          </div>

          <div class="player-controls" aria-label="Audio controls">
            <button id="previous-stop" type="button" aria-label="Previous stop">Previous</button>
            <audio id="audio-player" controls preload="metadata"></audio>
            <button id="next-stop" type="button" aria-label="Next stop">Next</button>
          </div>
        </article>
      </section>

      <section class="route-list-section" aria-labelledby="route-list-heading">
        <h2 id="route-list-heading">Stops</h2>
        <div id="route-list" class="route-list"></div>
      </section>
    </main>

    <script src="app.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Run static tests**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add atlas/index.html tests/test_atlas_static.py
git commit -m "feat: add sound atlas page shell"
```

---

### Task 3: Route Rendering And Audio State

**Files:**
- Create: `atlas/app.js`

- [ ] **Step 1: Add app JavaScript**

Create `atlas/app.js`:

```javascript
const ROUTE_URL = "dawn-to-night.json";

const state = {
  stops: [],
  selectedIndex: 0,
};

const elements = {
  routeMap: document.querySelector("#route-map"),
  routeList: document.querySelector("#route-list"),
  currentStop: document.querySelector("#current-stop"),
  imageFrame: document.querySelector("#current-image-frame"),
  imageFallback: document.querySelector("#current-image-fallback"),
  chapter: document.querySelector("#current-chapter"),
  title: document.querySelector("#current-title"),
  description: document.querySelector("#current-description"),
  meta: document.querySelector("#current-meta"),
  credit: document.querySelector("#current-credit"),
  audio: document.querySelector("#audio-player"),
  previous: document.querySelector("#previous-stop"),
  next: document.querySelector("#next-stop"),
  status: document.querySelector("#status-message"),
};

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.dataset.state = isError ? "error" : "ready";
}

function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function createButton(className, text, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function selectStop(index) {
  if (!state.stops[index]) {
    return;
  }

  state.selectedIndex = index;
  renderCurrentStop();
  renderActiveState();
}

function renderMap() {
  clearChildren(elements.routeMap);

  const path = document.createElement("div");
  path.className = "route-path";
  elements.routeMap.append(path);

  state.stops.forEach((stop, index) => {
    const node = createButton("map-node", `${index + 1}. ${stop.timeOfDay}`, () => selectStop(index));
    node.dataset.stopId = stop.id;
    node.style.setProperty("--node-index", index);
    node.setAttribute("aria-label", `Select ${stop.title}`);
    elements.routeMap.append(node);
  });
}

function renderRouteList() {
  clearChildren(elements.routeList);

  state.stops.forEach((stop, index) => {
    const card = createButton("stop-card", "", () => selectStop(index));
    card.dataset.stopId = stop.id;
    card.innerHTML = `
      <span class="stop-card-time">${stop.timeOfDay}</span>
      <strong>${stop.title}</strong>
      <span>${stop.theme} · ${stop.zoneLabel}</span>
    `;
    elements.routeList.append(card);
  });
}

function renderCurrentStop() {
  const stop = state.stops[state.selectedIndex];

  elements.chapter.textContent = `${stop.timeOfDay} · ${stop.theme}`;
  elements.title.textContent = stop.title;
  elements.description.textContent = stop.description;
  elements.meta.textContent = stop.zoneLabel;
  elements.credit.textContent = stop.credit;

  elements.audio.src = encodeURI(`../${stop.audioPath}`);
  elements.audio.load();
  elements.audio.removeAttribute("aria-disabled");

  if (stop.imagePath) {
    elements.imageFrame.style.backgroundImage = `linear-gradient(rgba(12, 22, 18, 0.12), rgba(12, 22, 18, 0.35)), url("${encodeURI(`../${stop.imagePath}`)}")`;
    elements.imageFallback.textContent = "";
  } else {
    elements.imageFrame.style.backgroundImage = "";
    elements.imageFallback.textContent = stop.title;
  }

  elements.previous.disabled = state.selectedIndex === 0;
  elements.next.disabled = state.selectedIndex === state.stops.length - 1;
}

function renderActiveState() {
  document.querySelectorAll("[data-stop-id]").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.stopId === state.stops[state.selectedIndex].id);
  });
}

function validateRoute(stops) {
  if (!Array.isArray(stops) || stops.length === 0) {
    throw new Error("Route data is empty.");
  }
}

async function loadRoute() {
  try {
    const response = await fetch(ROUTE_URL);
    if (!response.ok) {
      throw new Error(`Route request failed: ${response.status}`);
    }

    const stops = await response.json();
    validateRoute(stops);
    state.stops = stops;

    renderMap();
    renderRouteList();
    selectStop(0);
    setStatus(`${stops.length} stops loaded`);
  } catch (error) {
    setStatus("Unable to load the Dawn to Night route.", true);
    elements.currentStop.classList.add("has-error");
    elements.description.textContent = error.message;
    elements.audio.removeAttribute("src");
    elements.audio.setAttribute("aria-disabled", "true");
  }
}

elements.previous.addEventListener("click", () => {
  selectStop(Math.max(0, state.selectedIndex - 1));
});

elements.next.addEventListener("click", () => {
  selectStop(Math.min(state.stops.length - 1, state.selectedIndex + 1));
});

elements.audio.addEventListener("error", () => {
  setStatus("Audio unavailable for this stop.", true);
});

loadRoute();
```

- [ ] **Step 2: Run existing tests**

Run:

```bash
pytest -v
```

Expected: all Python tests PASS. There is no JavaScript test runner in this repository, so browser QA happens in Task 5.

- [ ] **Step 3: Commit**

```bash
git add atlas/app.js
git commit -m "feat: render sound atlas route"
```

---

### Task 4: Visual Design And Responsive Layout

**Files:**
- Create: `atlas/styles.css`

- [ ] **Step 1: Add CSS**

Create `atlas/styles.css`:

```css
:root {
  color-scheme: light;
  --ink: #17211d;
  --muted: #5d6b63;
  --paper: #f7f4ed;
  --panel: #fffaf0;
  --line: #c6b99d;
  --forest: #2f5d46;
  --thermal: #b96f3d;
  --lake: #416f7d;
  --night: #28334d;
  --shadow: 0 18px 50px rgba(36, 31, 22, 0.14);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
}

button,
audio {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.atlas-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 40px 0;
}

.hero {
  min-height: 32vh;
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 56px 0 28px;
}

.eyebrow,
.stop-chapter,
.stop-card-time {
  color: var(--thermal);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  max-width: 820px;
  margin: 0;
  font-size: clamp(3rem, 10vw, 8rem);
  line-height: 0.9;
  letter-spacing: 0;
}

h2,
p {
  margin-top: 0;
}

.hero-copy {
  max-width: 620px;
  margin: 20px 0 0;
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1.6;
}

.atlas-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
  gap: 20px;
  align-items: stretch;
}

.map-panel,
.current-stop,
.route-list-section {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.map-panel {
  padding: 24px;
  min-height: 560px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: start;
}

#status-message {
  color: var(--muted);
  font-size: 0.9rem;
}

#status-message[data-state="error"] {
  color: #9d2d20;
}

.route-map {
  position: relative;
  min-height: 460px;
  margin-top: 16px;
  overflow: hidden;
  border-radius: 8px;
  background:
    radial-gradient(circle at 18% 18%, rgba(185, 111, 61, 0.16), transparent 28%),
    radial-gradient(circle at 82% 78%, rgba(65, 111, 125, 0.18), transparent 30%),
    linear-gradient(135deg, #efe5cf, #e6eddc);
}

.route-path {
  position: absolute;
  inset: 14%;
  border-left: 5px solid rgba(47, 93, 70, 0.55);
  border-bottom: 5px solid rgba(47, 93, 70, 0.55);
  border-radius: 46% 20% 42% 24%;
  transform: rotate(-16deg);
}

.map-node {
  position: absolute;
  left: calc(12% + (var(--node-index) * 11%));
  top: calc(78% - (var(--node-index) * 9%));
  max-width: 130px;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid rgba(23, 33, 29, 0.18);
  border-radius: 999px;
  background: rgba(255, 250, 240, 0.92);
  color: var(--ink);
  box-shadow: 0 8px 20px rgba(23, 33, 29, 0.12);
}

.map-node.is-active,
.stop-card.is-active {
  border-color: var(--forest);
  background: #e7f0df;
  color: var(--forest);
}

.current-stop {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-frame {
  min-height: 260px;
  display: grid;
  place-items: center;
  background-color: #28334d;
  background-position: center;
  background-size: cover;
  color: #fffaf0;
  font-weight: 800;
}

.stop-copy {
  padding: 24px;
}

.stop-copy h2 {
  margin-bottom: 12px;
  font-size: 2rem;
}

#current-description {
  color: var(--muted);
  line-height: 1.6;
}

.stop-meta,
.credit {
  color: var(--muted);
  font-size: 0.92rem;
}

.player-controls {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-top: auto;
  padding: 20px 24px 24px;
}

.player-controls button,
.stop-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fffdf8;
  color: var(--ink);
}

.player-controls button {
  min-height: 44px;
  padding: 0 14px;
}

audio {
  width: 100%;
}

.route-list-section {
  margin-top: 20px;
  padding: 24px;
}

.route-list {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}

.stop-card {
  min-height: 132px;
  padding: 14px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.stop-card span:last-child {
  color: var(--muted);
  font-size: 0.88rem;
}

.has-error {
  border-color: #9d2d20;
}

@media (max-width: 900px) {
  .atlas-grid {
    grid-template-columns: 1fr;
  }

  .route-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .atlas-shell {
    width: min(100% - 20px, 1180px);
    padding: 20px 0;
  }

  .hero {
    min-height: 24vh;
  }

  .map-panel {
    min-height: 460px;
    padding: 16px;
  }

  .route-map {
    min-height: 380px;
  }

  .map-node {
    max-width: 112px;
    font-size: 0.82rem;
  }

  .player-controls {
    grid-template-columns: 1fr 1fr;
  }

  audio {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .route-list {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Run validation tests**

Run:

```bash
pytest tests/test_atlas_data.py tests/test_atlas_static.py -v
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add atlas/styles.css
git commit -m "feat: style sound atlas exhibit"
```

---

### Task 5: README Link And Browser Acceptance

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add README atlas section**

Add this section after the English "Download" section in `README.md`:

```markdown
## Sound Atlas

The repository includes a static guided listening route:

- `atlas/index.html` — Yellowstone Sound Atlas: Dawn to Night
- `atlas/dawn-to-night.json` — curated route metadata

To preview it locally, run a static server from the repository root:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/atlas/>.
```
```

Add this section after the Chinese "下载" section:

```markdown
## 声音图谱

本仓库包含一个静态引导式聆听路线：

- `atlas/index.html` — Yellowstone Sound Atlas: Dawn to Night
- `atlas/dawn-to-night.json` — 路线元数据

本地预览时，请在仓库根目录启动静态服务器：

```bash
python -m http.server 8000
```

然后打开 <http://localhost:8000/atlas/>。
```
```

- [ ] **Step 2: Run full Python test suite**

Run:

```bash
pytest -v
```

Expected: all tests PASS.

- [ ] **Step 3: Start local static server**

Run from the repository root:

```bash
python -m http.server 8000
```

Expected: terminal shows `Serving HTTP on :: port 8000` or equivalent. If port 8000 is occupied, use `python -m http.server 8001` and open `/atlas/` on that port.

- [ ] **Step 4: Browser acceptance check**

Open:

```text
http://localhost:8000/atlas/
```

Verify manually:

- First stop is selected by default.
- Status says `7 stops loaded`.
- Previous is disabled on the first stop.
- Next changes the selected stop.
- Clicking a map node updates the current stop panel.
- Clicking a stop card updates the same current stop panel.
- The audio control source changes when the selected stop changes.
- Credit text is visible.
- On a narrow viewport, controls and text do not overlap.

- [ ] **Step 5: Commit**

Stop the local server, then run:

```bash
git add README.md
git commit -m "docs: document sound atlas preview"
```

---

### Task 6: Final Verification

**Files:**
- No new files expected.

- [ ] **Step 1: Check git status**

Run:

```bash
git status --short
```

Expected: only intentional untracked `.superpowers/` may remain from brainstorming. No atlas, test, or README changes should be unstaged.

- [ ] **Step 2: Run full tests**

Run:

```bash
pytest -v
```

Expected: all tests PASS.

- [ ] **Step 3: Review implementation diff**

Run:

```bash
git log --oneline -6
git show --stat --oneline HEAD
```

Expected: recent commits include route data, page shell, route renderer, styling, and README preview documentation.

- [ ] **Step 4: Prepare handoff summary**

In the final implementation response, include:

- Local preview URL used during QA.
- Test command result.
- Any known limitation, especially that the route map is stylized and not exact GIS.
- Reminder that `.superpowers/` is not part of the feature.

---

## Self-Review Notes

- Spec coverage: route JSON, static site files, map/player/list components, error handling, route-data validation, browser acceptance, and README usage are covered.
- Red-flag scan: no incomplete instruction markers remain.
- Type/property consistency: route fields match the design spec and tests: `id`, `title`, `timeOfDay`, `theme`, `zoneLabel`, `audioPath`, `imagePath`, `description`, `credit`.
- Scope check: full-library manifest, exact coordinates, search, downloads, waveform/spectrogram, and generated audio analysis remain out of Phase 1.
