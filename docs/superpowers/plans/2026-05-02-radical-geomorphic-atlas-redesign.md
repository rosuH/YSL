# Radical Geomorphic Atlas Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Yellowstone Sound Atlas UI with the approved radical geomorphic design system: rupture nav, fault-line hero, listening slab, specimen fragment, and strata deck.

**Architecture:** Keep the static vanilla stack and existing `atlas/dawn-to-night.json` route contract. Rewrite the document structure first, update static tests to lock the new required regions, then replace render logic around the same `selectedIndex` state. CSS owns the radical component language through theme tokens, clipped fracture shapes, inline SVG paths, and responsive strata navigation.

**Tech Stack:** Static HTML, CSS custom properties, inline SVG, vanilla JavaScript, native `<audio>`, JSON fetch, `pytest` + BeautifulSoup static checks.

---

## File Structure

- Modify `tests/test_atlas_static.py`: update required anchors from the old map/current-stop/list regions to the radical regions.
- Modify `atlas/index.html`: replace the old shell with semantic regions for rupture nav, rupture hero, listening slab, strata deck, specimen fragment, and source status.
- Modify `atlas/app.js`: preserve fetch/validation/selected-stop state while rendering the new regions.
- Modify `atlas/styles.css`: replace old earth-tone panel styling with the radical geomorphic design system.
- Keep `atlas/dawn-to-night.json` unchanged in Phase 1.

---

### Task 1: Lock The New Static Contract

**Files:**
- Modify: `tests/test_atlas_static.py`

- [ ] **Step 1: Replace the static HTML tests**

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


def test_index_references_local_css_and_javascript():
    page = load_page()

    stylesheet_hrefs = [
        stylesheet["href"] for stylesheet in page.find_all("link", rel="stylesheet")
    ]
    script_sources = [script["src"] for script in page.find_all("script", src=True)]

    assert "styles.css" in stylesheet_hrefs
    assert "app.js" in script_sources


def test_index_contains_radical_geomorphic_regions():
    page = load_page()

    for element_id in [
        "rupture-nav",
        "rupture-hero",
        "fault-lines",
        "listening-slab",
        "audio-player",
        "strata-deck",
        "specimen-fragment",
        "source-status",
    ]:
        assert page.find(id=element_id), element_id


def test_index_contains_accessible_audio_navigation_buttons():
    page = load_page()

    previous_button = page.find("button", id="previous-stop")
    next_button = page.find("button", id="next-stop")

    assert previous_button
    assert previous_button.get("aria-label") == "Previous stop"
    assert next_button
    assert next_button.get("aria-label") == "Next stop"


def test_strata_deck_and_specimen_fragment_are_labelled():
    page = load_page()

    strata_deck = page.find(id="strata-deck")
    specimen_fragment = page.find(id="specimen-fragment")

    assert strata_deck
    assert strata_deck.get("aria-label") == "Dawn to Night strata deck"
    assert specimen_fragment
    assert specimen_fragment.get("aria-labelledby") == "specimen-heading"
```

- [ ] **Step 2: Run the static tests to verify they fail**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: FAIL because the current `atlas/index.html` still exposes `route-map`, `route-list`, and `current-stop`, not the new radical geomorphic regions.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/test_atlas_static.py
git commit -m "test: update atlas static contract"
```

---

### Task 2: Rewrite The Static HTML Shell

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
    <title>Yellowstone Sound Atlas: Dawn to Night</title>
    <meta
      name="description"
      content="A radical Yellowstone listening terrain from dawn birdsong to night wildlife."
    >
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#rupture-hero">Skip to listening terrain</a>

    <main class="geomorphic-atlas" aria-labelledby="atlas-title">
      <aside id="rupture-nav" class="rupture-nav" aria-label="Route chapters">
        <div class="nav-sigil" aria-hidden="true"></div>
        <div class="nav-chapters" id="nav-chapters"></div>
        <div class="nav-location">Yellowstone acoustic terrain</div>
      </aside>

      <section id="rupture-hero" class="rupture-hero">
        <div class="hero-backdrop" id="hero-backdrop" aria-hidden="true"></div>
        <div class="hero-topline">
          <p class="site-label">not a map, a listening fault line</p>
          <p class="coordinate-block" id="hero-meta">Loading route...</p>
        </div>

        <div class="hero-title">
          <p class="chapter-kicker" id="current-chapter">Dawn to Night</p>
          <h1 id="atlas-title">The day cracks open in sound.</h1>
          <p id="current-description">
            Yellowstone is treated as a living cross-section.
          </p>
        </div>

        <div class="crack-field" aria-hidden="true">
          <svg
            id="fault-lines"
            class="fault-lines"
            viewBox="0 0 1080 620"
            role="img"
            aria-label="Abstract acoustic fault lines"
          >
            <path class="fault strong" d="M48 346 C124 178 290 125 452 198 C596 263 682 69 858 124 C1008 171 1035 382 868 482 C710 577 562 464 420 532 C264 606 93 516 48 346 Z"></path>
            <path class="fault" d="M130 352 C196 225 314 186 444 239 C560 286 650 141 802 178 C914 205 943 357 824 421 C691 492 564 398 442 463 C318 530 180 470 130 352 Z"></path>
            <path class="fault" d="M222 354 C281 270 358 239 452 274 C548 310 633 219 733 232 C815 243 835 339 750 380 C648 429 566 358 462 410 C370 455 259 424 222 354 Z"></path>
            <path class="fault faint" d="M31 178 C184 115 300 178 436 128 C574 77 720 89 1016 34"></path>
            <path class="fault faint" d="M94 530 C272 438 432 548 599 472 C753 402 868 440 1038 348"></path>
            <path class="sound-fissure" d="M15 431 C144 372 214 441 353 388 C486 338 527 233 661 263 C775 289 831 214 1062 248"></path>
          </svg>
          <div class="fracture-node bird">Bird</div>
          <div class="fracture-node heat">Heat</div>
          <div class="fracture-node lake">Lake</div>
        </div>

        <article id="listening-slab" class="listening-slab" aria-live="polite">
          <div class="slab-meta">
            <span>Now sounding</span>
            <span id="current-zone">Route specimen</span>
          </div>
          <h2 id="current-title">Loading...</h2>
          <p id="current-summary">Loading the first Yellowstone sound specimen.</p>
          <div id="wave-lattice" class="wave-lattice" aria-hidden="true"></div>
          <div class="slab-controls" aria-label="Audio controls">
            <button id="previous-stop" class="slab-button" type="button" aria-label="Previous stop">‹</button>
            <audio id="audio-player" controls preload="metadata"></audio>
            <button id="next-stop" class="slab-button" type="button" aria-label="Next stop">›</button>
          </div>
        </article>
      </section>

      <section class="specimen-section">
        <h2 id="specimen-heading">Specimen notes interrupt the terrain.</h2>
        <article
          id="specimen-fragment"
          class="specimen-fragment"
          aria-labelledby="specimen-heading"
        >
          <p id="current-specimen-note">
            Source details and habitat notes will appear after the route loads.
          </p>
          <p class="credit" id="current-credit"></p>
        </article>
      </section>

      <section
        id="strata-deck"
        class="strata-deck"
        aria-label="Dawn to Night strata deck"
      ></section>

      <footer class="source-footer">
        <p id="source-status" role="status">Loading route...</p>
      </footer>
    </main>

    <script src="app.js"></script>
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

```bash
git add atlas/index.html tests/test_atlas_static.py
git commit -m "feat: add geomorphic atlas shell"
```

---

### Task 3: Rewrite Rendering Around The Radical Regions

**Files:**
- Modify: `atlas/app.js`
- Test: `tests/test_atlas_data.py`
- Test: `tests/test_atlas_static.py`

- [ ] **Step 1: Replace element lookup and rendering helpers**

Replace the top of `atlas/app.js` through `createButton()` with:

```javascript
const ROUTE_URL = "dawn-to-night.json";

const state = {
  stops: [],
  selectedIndex: 0,
};

const elements = {
  body: document.body,
  navChapters: document.querySelector("#nav-chapters"),
  heroBackdrop: document.querySelector("#hero-backdrop"),
  heroMeta: document.querySelector("#hero-meta"),
  chapter: document.querySelector("#current-chapter"),
  title: document.querySelector("#current-title"),
  description: document.querySelector("#current-description"),
  summary: document.querySelector("#current-summary"),
  zone: document.querySelector("#current-zone"),
  credit: document.querySelector("#current-credit"),
  specimenNote: document.querySelector("#current-specimen-note"),
  waveLattice: document.querySelector("#wave-lattice"),
  strataDeck: document.querySelector("#strata-deck"),
  audio: document.querySelector("#audio-player"),
  previous: document.querySelector("#previous-stop"),
  next: document.querySelector("#next-stop"),
  status: document.querySelector("#source-status"),
};

const chapterTone = {
  Dawn: "moss",
  Morning: "moss",
  Midday: "clay",
  Afternoon: "clay",
  "Late Afternoon": "lake",
  Dusk: "dusk",
  Night: "night",
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
```

- [ ] **Step 2: Replace route rendering functions**

Replace `selectStop()`, `renderMap()`, `renderRouteList()`, `renderCurrentStop()`, and `renderActiveState()` with:

```javascript
function selectStop(index) {
  if (!state.stops[index]) {
    return;
  }

  state.selectedIndex = index;
  renderCurrentStop();
  renderActiveState();
}

function renderNavChapters() {
  clearChildren(elements.navChapters);

  state.stops.forEach((stop, index) => {
    const chapter = createButton("nav-chapter", stop.timeOfDay, () => selectStop(index));
    chapter.dataset.stopId = stop.id;
    chapter.setAttribute("aria-label", `Select ${stop.title}`);
    elements.navChapters.append(chapter);
  });
}

function getStrataRise(index) {
  const rises = [102, 128, 184, 204, 146, 172, 112, 136];
  return rises[index % rises.length];
}

function renderStrataDeck() {
  clearChildren(elements.strataDeck);

  state.stops.forEach((stop, index) => {
    const piece = createButton("strata-piece", "", () => selectStop(index));
    piece.dataset.stopId = stop.id;
    piece.style.setProperty("--rise", `${getStrataRise(index)}px`);
    piece.dataset.tone = chapterTone[stop.timeOfDay] || "moss";
    piece.setAttribute("aria-label", `Select ${stop.title}`);

    const time = document.createElement("small");
    time.textContent = stop.timeOfDay;

    const title = document.createElement("strong");
    title.textContent = stop.title;

    const theme = document.createElement("span");
    theme.textContent = stop.theme;

    piece.append(time, title, theme);
    elements.strataDeck.append(piece);
  });
}

function renderWaveLattice(stop) {
  clearChildren(elements.waveLattice);

  const seed = stop.id.length + state.selectedIndex;
  for (let index = 0; index < 18; index += 1) {
    const trace = document.createElement("span");
    const height = 28 + ((seed * (index + 3)) % 66);
    trace.style.setProperty("--trace-height", `${height}%`);
    trace.style.setProperty("--trace-delay", `${index * 38}ms`);
    elements.waveLattice.append(trace);
  }
}

function renderCurrentStop() {
  const stop = state.stops[state.selectedIndex];
  const chapterClass = (chapterTone[stop.timeOfDay] || "moss").toLowerCase();

  elements.body.dataset.chapter = chapterClass;
  elements.heroMeta.textContent = `${state.selectedIndex + 1}/${state.stops.length} · ${stop.theme} · ${stop.zoneLabel}`;
  elements.chapter.textContent = `${stop.timeOfDay} · ${stop.theme}`;
  elements.title.textContent = stop.title;
  elements.description.textContent = stop.description;
  elements.summary.textContent = stop.description;
  elements.zone.textContent = stop.zoneLabel;
  elements.specimenNote.textContent = `${stop.zoneLabel}. ${stop.description}`;
  elements.credit.textContent = stop.credit;

  elements.audio.disabled = false;
  elements.audio.src = encodeURI(`../${stop.audioPath}`);
  elements.audio.load();
  elements.audio.removeAttribute("aria-disabled");

  if (stop.imagePath) {
    elements.heroBackdrop.style.backgroundImage = `linear-gradient(105deg, rgba(22, 18, 13, 0.82), rgba(22, 18, 13, 0.34) 46%, transparent), url("${encodeURI(`../${stop.imagePath}`)}")`;
    elements.heroBackdrop.dataset.fallback = "false";
  } else {
    elements.heroBackdrop.style.backgroundImage = "";
    elements.heroBackdrop.dataset.fallback = "true";
  }

  renderWaveLattice(stop);

  elements.previous.disabled = state.selectedIndex === 0;
  elements.next.disabled = state.selectedIndex === state.stops.length - 1;
}

function renderActiveState() {
  const activeStop = state.stops[state.selectedIndex];
  document.querySelectorAll("[data-stop-id]").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.stopId === activeStop.id);
  });
}
```

- [ ] **Step 3: Update `loadRoute()` render calls**

Inside `loadRoute()`, replace:

```javascript
renderMap();
renderRouteList();
selectStop(0);
setStatus(`${stops.length} stops loaded`);
```

with:

```javascript
renderNavChapters();
renderStrataDeck();
selectStop(0);
setStatus(`${stops.length} sound specimens loaded`);
```

- [ ] **Step 4: Update audio error handling copy**

Keep the existing listener but ensure it reads:

```javascript
elements.audio.addEventListener("error", () => {
  elements.audio.disabled = true;
  elements.audio.setAttribute("aria-disabled", "true");
  setStatus("Audio unavailable for this stop.", true);
});
```

- [ ] **Step 5: Run data and static tests**

Run:

```bash
pytest tests/test_atlas_data.py tests/test_atlas_static.py -v
```

Expected: PASS.

- [ ] **Step 6: Commit the JS renderer**

```bash
git add atlas/app.js
git commit -m "feat: render geomorphic atlas state"
```

---

### Task 4: Replace The Visual System

**Files:**
- Modify: `atlas/styles.css`
- Test: `tests/test_atlas_static.py`

- [ ] **Step 1: Replace the CSS tokens and base layout**

Replace the current `:root`, reset, body, and shell styles with:

```css
:root {
  color-scheme: dark;
  --night-soil: oklch(15% 0.034 92);
  --char: oklch(20% 0.03 78);
  --wet-bark: oklch(28% 0.05 126);
  --moss: oklch(43% 0.085 139);
  --mineral: oklch(91% 0.052 83);
  --bone: oklch(96% 0.028 88);
  --hot-clay: oklch(58% 0.12 48);
  --cold-lake: oklch(58% 0.102 198);
  --line: oklch(93% 0.04 86 / 0.58);
  --line-soft: oklch(93% 0.04 86 / 0.22);
  --signal: oklch(67% 0.12 192);
  --shadow-heavy: 0 44px 110px oklch(15% 0.035 80 / 0.34);
  --font-display: Georgia, "Times New Roman", serif;
  --font-ui: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-family: var(--font-ui);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--night-soil);
  color: var(--bone);
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
  opacity: 0.42;
}

button:focus-visible,
audio:focus-visible,
.skip-link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 4px;
}

.skip-link {
  position: absolute;
  left: 16px;
  top: 16px;
  z-index: 20;
  transform: translateY(-150%);
  background: var(--bone);
  color: var(--night-soil);
  padding: 10px 14px;
}

.skip-link:focus {
  transform: translateY(0);
}

.geomorphic-atlas {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(circle at 76% 18%, oklch(58% 0.102 198 / 0.18), transparent 19%),
    radial-gradient(circle at 12% 82%, oklch(58% 0.12 48 / 0.14), transparent 24%),
    linear-gradient(117deg, var(--night-soil) 0 57%, var(--mineral) 57.2% 100%);
}
```

- [ ] **Step 2: Add radical region styles**

Add styles for:

```css
.rupture-nav
.nav-sigil
.nav-chapters
.nav-chapter
.nav-location
.rupture-hero
.hero-backdrop
.hero-topline
.site-label
.coordinate-block
.hero-title
.chapter-kicker
.crack-field
.fault-lines
.fault
.sound-fissure
.fracture-node
.listening-slab
.slab-meta
.wave-lattice
.slab-controls
.slab-button
.specimen-section
.specimen-fragment
.strata-deck
.strata-piece
.source-footer
```

Use the prototype geometry rules from the approved radical direction:

```css
.rupture-nav {
  position: fixed;
  inset: 0 auto 0 0;
  width: clamp(72px, 9vw, 132px);
  z-index: 7;
  display: grid;
  grid-template-rows: 130px 1fr 210px;
  border-right: 1px solid oklch(94% 0.04 86 / 0.16);
  background: linear-gradient(180deg, oklch(13% 0.03 92 / 0.88), oklch(18% 0.038 120 / 0.38));
}

.rupture-hero {
  position: relative;
  min-height: 790px;
  padding: clamp(30px, 5vw, 70px) clamp(26px, 5vw, 72px) 280px clamp(108px, 14vw, 188px);
}

.listening-slab {
  position: absolute;
  z-index: 5;
  right: clamp(22px, 5vw, 74px);
  top: clamp(232px, 31vw, 340px);
  width: min(440px, 38vw);
  min-height: 390px;
  padding: 28px;
  clip-path: polygon(0 18%, 18% 0, 78% 6%, 100% 31%, 88% 100%, 10% 90%);
  background: linear-gradient(136deg, oklch(95% 0.04 86 / 0.97), oklch(78% 0.055 88 / 0.84));
  color: var(--night-soil);
  box-shadow: 0 42px 96px oklch(10% 0.03 80 / 0.45);
}

.strata-deck {
  position: relative;
  z-index: 7;
  display: grid;
  grid-template-columns: repeat(7, minmax(118px, 1fr));
  min-height: 238px;
  overflow-x: auto;
  background: oklch(14% 0.03 88 / 0.84);
  border-top: 1px solid oklch(94% 0.04 86 / 0.2);
}
```

The implementation must not reintroduce `.map-panel`, `.current-stop`, `.route-list-section`, `.route-map`, or `.stop-card`.

- [ ] **Step 3: Add responsive styles**

Add a `max-width: 1080px` media query that:

```css
@media (max-width: 1080px) {
  .rupture-nav {
    position: relative;
    width: auto;
    min-height: auto;
    grid-template-rows: none;
    grid-template-columns: auto 1fr;
  }

  .nav-location {
    display: none;
  }

  .nav-chapters {
    display: flex;
    overflow-x: auto;
  }

  .nav-chapter {
    writing-mode: horizontal-tb;
    transform: none;
    min-width: max-content;
  }

  .rupture-hero {
    min-height: auto;
    padding: 28px 28px 320px;
  }

  .hero-topline {
    grid-template-columns: 1fr;
  }

  .coordinate-block {
    text-align: left;
  }

  .listening-slab {
    position: relative;
    top: auto;
    right: auto;
    width: min(100%, 460px);
    margin-top: 34px;
  }

  .crack-field {
    inset: 160px -28% 260px -8%;
    opacity: 0.72;
  }

  .specimen-section {
    grid-template-columns: 1fr;
    padding: 36px 28px;
  }

  .strata-deck {
    grid-template-columns: repeat(7, minmax(132px, 1fr));
  }
}
```

- [ ] **Step 4: Run static tests**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit CSS**

```bash
git add atlas/styles.css
git commit -m "style: add radical geomorphic atlas system"
```

---

### Task 5: Full Automated Verification

**Files:**
- Test: `tests/test_atlas_data.py`
- Test: `tests/test_atlas_static.py`

- [ ] **Step 1: Run all tests**

Run:

```bash
pytest -v
```

Expected: all tests PASS, including crawler tests, route-data tests, and static atlas tests.

- [ ] **Step 2: Inspect for forbidden old layout selectors**

Run:

```bash
rg -n "map-panel|route-map|current-stop|route-list-section|stop-card|atlas-grid" atlas tests
```

Expected: no output.

- [ ] **Step 3: Inspect for rejected design-reference dependency**

Run:

```bash
rg -n "design_references|Cofounder|Night Sky|glassmorphism|SaaS" atlas docs/superpowers/plans docs/superpowers/specs
```

Expected: only the spec non-goal line may mention `design_references`; product files must not mention any of these.

- [ ] **Step 4: Commit verification-only adjustments if needed**

If Tasks 5.1 to 5.3 reveal small issues, fix them and commit:

```bash
git add atlas tests docs/superpowers/plans docs/superpowers/specs
git commit -m "fix: verify geomorphic atlas redesign"
```

If no issues are found, do not create an empty commit.

---

### Task 6: Browser QA

**Files:**
- Manual verification: `atlas/index.html`
- Manual verification: `atlas/app.js`
- Manual verification: `atlas/styles.css`

- [ ] **Step 1: Start a local static server**

Run:

```bash
python -m http.server 8000
```

Expected: server starts and serves the repository root.

- [ ] **Step 2: Open the atlas**

Open:

```text
http://localhost:8000/atlas/
```

- [ ] **Step 3: Verify desktop behavior**

At a desktop viewport, verify:

- The first stop is selected by default.
- The vertical rupture nav is visible.
- The rupture hero has a selected-stop image or stable fallback.
- The listening slab contains the selected title, summary, audio, previous, and next.
- The strata deck contains every route stop.
- Clicking a strata piece updates selected state, title, hero metadata, specimen fragment, credit, and audio source.
- Previous and next update the same state.
- Credit/source text remains visible.
- Focus rings are visible when tabbing through nav chapters, strata pieces, previous, next, and audio.

- [ ] **Step 4: Verify mobile behavior**

At a 360px-wide viewport, verify:

- No text or controls overlap.
- The rupture nav adapts into a compact top treatment.
- The listening slab is reachable without horizontal page scroll.
- The strata deck scrolls horizontally as a contained component.
- Previous, next, and audio controls remain usable.

- [ ] **Step 5: Stop the local server**

Stop the server with `Ctrl-C`.

If any QA issue requires code changes, fix it, rerun `pytest -v`, and commit:

```bash
git add atlas tests
git commit -m "fix: polish geomorphic atlas qa"
```

---

## Self-Review

Spec coverage:

- Full layout replacement: Tasks 1-4 remove the old map/current-stop/card shell.
- Theme-born radical component system: Task 4 implements rupture/fault/slab/specimen/strata grammar.
- Existing route contract: Task 3 keeps `dawn-to-night.json` and route validation.
- Accessibility and native audio: Tasks 2-4 keep native audio, accessible labels, and focus states.
- Error handling: Task 3 keeps route/audio error status paths.
- Validation: Tasks 5-6 cover automated and browser acceptance checks.

Placeholder scan:

- No placeholder markers or unspecified “add handling later” instructions.
- CSS geometry selectors and JS function names are explicit.

Type/name consistency:

- Static test IDs match `atlas/index.html`.
- JS element IDs match `atlas/index.html`.
- CSS region names match `atlas/index.html` and JS-rendered class names.
