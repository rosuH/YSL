# Yellowstone Frequency Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current geomorphic atlas with a premium warm-mineral-metal Yellowstone Frequency Console: channel-scoped playback, tactile controls, and slow-breathing natural life-frequency backgrounds.

**Architecture:** Keep the atlas as a static browser experience with no build step. Split channel/playback rules into a pure ES module that can be tested with Node's built-in test runner, then have `atlas/app.js` import that module and bind it to the DOM/audio player. Replace the HTML shell and CSS visual system around one central console object, while preserving existing route JSON and media paths.

**Tech Stack:** Static HTML/CSS/JavaScript, ES modules in the browser, Node `--test` for pure state tests, existing `pytest` + BeautifulSoup static checks, Playwright browser verification via the locally available global Playwright package.

---

## File Structure

- Create `atlas/frequency-console-state.mjs`: pure channel mapping and playback helpers. No DOM access. This is where `AIR`, `HEAT`, `WATER`, `ANIMAL`, `NIGHT`, `ALL`, `SEQ`, `SHUFFLE`, and `HOLD` semantics live.
- Modify `atlas/app.js`: browser orchestration only. It loads route data, decorates stops with channel metadata, keeps UI state, renders controls/screen/background, handles audio events, and calls pure helpers.
- Replace `atlas/index.html`: the Frequency Console shell. It should contain the central console, embedded screen, channel keys, mode switch, knob controls, background field, audio player, and status/live regions.
- Replace `atlas/styles.css`: warm mineral metal console styling, mechanical controls, channel-specific background fields, responsive layout, and reduced-motion rules.
- Modify `tests/test_atlas_static.py`: static contract for the new shell, script type/module references, labelled regions, controls, and rejection of previous layouts.
- Create `tests/frequency-console-state.test.mjs`: Node unit tests for channel mapping, scoped next/previous, shuffle scope, hold behavior, and single-specimen channel looping.

## Commit Plan

Commit after each task:

1. `test: add frequency console state contract`
2. `feat: add frequency console state helpers`
3. `test: update frequency console static contract`
4. `feat: add frequency console shell`
5. `feat: implement frequency console playback`
6. `style: add frequency console visual system`
7. `test: verify frequency console browser behavior`

---

### Task 1: Pure Playback State Contract

**Files:**
- Create: `tests/frequency-console-state.test.mjs`
- Create later in Task 2: `atlas/frequency-console-state.mjs`

- [ ] **Step 1: Write the failing Node tests**

Create `tests/frequency-console-state.test.mjs`:

```js
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CHANNELS,
  MODES,
  decorateStops,
  getAutoAdvanceStopId,
  getChannelScope,
  getNextStopId,
  getScopePosition,
  getShuffleStopId,
} from "../atlas/frequency-console-state.mjs";

const route = [
  { id: "dawn-chorus", title: "Dawn Chorus", timeOfDay: "Dawn", theme: "Birds" },
  { id: "mountain-bluebird", title: "Mountain Bluebird", timeOfDay: "Morning", theme: "Birds" },
  { id: "old-faithful", title: "Old Faithful", timeOfDay: "Midday", theme: "Thermal" },
  { id: "black-growler-steam-vent", title: "Black Growler Steam Vent", timeOfDay: "Afternoon", theme: "Thermal" },
  { id: "singing-lake", title: "Singing Lake", timeOfDay: "Late Afternoon", theme: "Water" },
  { id: "elk", title: "Elk", timeOfDay: "Dusk", theme: "Wildlife" },
  { id: "wolves", title: "Wolves", timeOfDay: "Night", theme: "Wildlife" },
];

describe("frequency console state", () => {
  it("defines the approved natural frequency channels and modes", () => {
    assert.deepEqual(CHANNELS.map((channel) => channel.id), [
      "AIR",
      "HEAT",
      "WATER",
      "ANIMAL",
      "NIGHT",
      "ALL",
    ]);
    assert.deepEqual(MODES, ["SEQ", "SHUFFLE", "HOLD"]);
  });

  it("maps Dawn to Night route stops into natural frequency channels", () => {
    const decorated = decorateStops(route);
    assert.deepEqual(
      decorated.map((stop) => [stop.id, stop.channel]),
      [
        ["dawn-chorus", "AIR"],
        ["mountain-bluebird", "AIR"],
        ["old-faithful", "HEAT"],
        ["black-growler-steam-vent", "HEAT"],
        ["singing-lake", "WATER"],
        ["elk", "ANIMAL"],
        ["wolves", "NIGHT"],
      ],
    );
  });

  it("scopes next and previous tuning to the active channel", () => {
    const stops = decorateStops(route);
    assert.equal(getNextStopId(stops, "dawn-chorus", "AIR", 1), "mountain-bluebird");
    assert.equal(getNextStopId(stops, "mountain-bluebird", "AIR", 1), "dawn-chorus");
    assert.equal(getNextStopId(stops, "old-faithful", "HEAT", 1), "black-growler-steam-vent");
    assert.equal(getNextStopId(stops, "old-faithful", "HEAT", -1), "black-growler-steam-vent");
  });

  it("uses ALL as a full-spectrum scan across every stop", () => {
    const stops = decorateStops(route);
    assert.equal(getNextStopId(stops, "wolves", "ALL", 1), "dawn-chorus");
    assert.equal(getNextStopId(stops, "dawn-chorus", "ALL", -1), "wolves");
    assert.deepEqual(getChannelScope(stops, "ALL").map((stop) => stop.id), route.map((stop) => stop.id));
  });

  it("reports queue position inside the current channel", () => {
    const stops = decorateStops(route);
    assert.deepEqual(getScopePosition(stops, "mountain-bluebird", "AIR"), {
      index: 2,
      total: 2,
    });
    assert.deepEqual(getScopePosition(stops, "singing-lake", "WATER"), {
      index: 1,
      total: 1,
    });
  });

  it("keeps shuffle inside the active channel and avoids the current stop when possible", () => {
    const stops = decorateStops(route);
    assert.equal(getShuffleStopId(stops, "dawn-chorus", "AIR", () => 0), "mountain-bluebird");
    assert.equal(getShuffleStopId(stops, "old-faithful", "HEAT", () => 0), "black-growler-steam-vent");
    assert.equal(getShuffleStopId(stops, "singing-lake", "WATER", () => 0), "singing-lake");
  });

  it("advances according to SEQ, SHUFFLE, and HOLD modes", () => {
    const stops = decorateStops(route);
    assert.equal(getAutoAdvanceStopId(stops, "dawn-chorus", "AIR", "SEQ", () => 0), "mountain-bluebird");
    assert.equal(getAutoAdvanceStopId(stops, "dawn-chorus", "AIR", "SHUFFLE", () => 0), "mountain-bluebird");
    assert.equal(getAutoAdvanceStopId(stops, "dawn-chorus", "AIR", "HOLD", () => 0), null);
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
node --test tests/frequency-console-state.test.mjs
```

Expected: FAIL with an import error for `../atlas/frequency-console-state.mjs`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/frequency-console-state.test.mjs
git commit -m "test: add frequency console state contract"
```

---

### Task 2: Pure Playback State Helpers

**Files:**
- Create: `atlas/frequency-console-state.mjs`
- Test: `tests/frequency-console-state.test.mjs`

- [ ] **Step 1: Implement the pure helper module**

Create `atlas/frequency-console-state.mjs`:

```js
export const CHANNELS = [
  { id: "AIR", label: "Air", visual: "feather-flight" },
  { id: "HEAT", label: "Heat", visual: "steam-pressure" },
  { id: "WATER", label: "Water", visual: "refraction-rings" },
  { id: "ANIMAL", label: "Animal", visual: "body-tracks" },
  { id: "NIGHT", label: "Night", visual: "distant-sonar" },
  { id: "ALL", label: "All", visual: "full-spectrum-scan" },
];

export const MODES = ["SEQ", "SHUFFLE", "HOLD"];

export const STOP_CHANNELS = {
  "dawn-chorus": "AIR",
  "mountain-bluebird": "AIR",
  "old-faithful": "HEAT",
  "black-growler-steam-vent": "HEAT",
  "singing-lake": "WATER",
  elk: "ANIMAL",
  wolves: "NIGHT",
};

export const CHANNEL_VISUALS = {
  AIR: {
    title: "Feather current",
    primary: "feather traces",
    secondary: "fine spectrum lines",
    accent: "air",
  },
  HEAT: {
    title: "Thermal pressure",
    primary: "steam columns",
    secondary: "pressure rings",
    accent: "heat",
  },
  WATER: {
    title: "Liquid refraction",
    primary: "lake wave rings",
    secondary: "sonar contours",
    accent: "water",
  },
  ANIMAL: {
    title: "Body signal",
    primary: "tracks and silhouettes",
    secondary: "low-frequency pulses",
    accent: "animal",
  },
  NIGHT: {
    title: "Night ecology",
    primary: "distant animal outline",
    secondary: "subdued sonar field",
    accent: "night",
  },
  ALL: {
    title: "Full-spectrum scan",
    primary: "layered natural traces",
    secondary: "range sweep",
    accent: "all",
  },
};

export function getStopChannel(stop) {
  return STOP_CHANNELS[stop.id] || "ALL";
}

export function decorateStops(stops) {
  return stops.map((stop) => ({
    ...stop,
    channel: getStopChannel(stop),
  }));
}

export function getChannelScope(stops, channel) {
  if (channel === "ALL") {
    return stops;
  }
  return stops.filter((stop) => stop.channel === channel);
}

export function getScopePosition(stops, currentId, channel) {
  const scope = getChannelScope(stops, channel);
  const index = Math.max(0, scope.findIndex((stop) => stop.id === currentId));
  return {
    index: index + 1,
    total: scope.length,
  };
}

export function getNextStopId(stops, currentId, channel, direction = 1) {
  const scope = getChannelScope(stops, channel);
  if (scope.length === 0) {
    return currentId;
  }

  const currentIndex = scope.findIndex((stop) => stop.id === currentId);
  const index = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = (index + direction + scope.length) % scope.length;
  return scope[nextIndex].id;
}

export function getShuffleStopId(stops, currentId, channel, random = Math.random) {
  const scope = getChannelScope(stops, channel);
  if (scope.length === 0) {
    return currentId;
  }
  if (scope.length === 1) {
    return scope[0].id;
  }

  const candidates = scope.filter((stop) => stop.id !== currentId);
  const index = Math.floor(random() * candidates.length);
  return candidates[Math.min(index, candidates.length - 1)].id;
}

export function getAutoAdvanceStopId(stops, currentId, channel, mode, random = Math.random) {
  if (mode === "HOLD") {
    return null;
  }
  if (mode === "SHUFFLE") {
    return getShuffleStopId(stops, currentId, channel, random);
  }
  return getNextStopId(stops, currentId, channel, 1);
}

export function getVisualProfile(channel) {
  return CHANNEL_VISUALS[channel] || CHANNEL_VISUALS.ALL;
}
```

- [ ] **Step 2: Run the state tests**

Run:

```bash
node --test tests/frequency-console-state.test.mjs
```

Expected: PASS with 7 subtests.

- [ ] **Step 3: Run the existing repository tests**

Run:

```bash
pytest -v
```

Expected: all existing Python tests pass.

- [ ] **Step 4: Commit the helpers**

```bash
git add atlas/frequency-console-state.mjs tests/frequency-console-state.test.mjs
git commit -m "feat: add frequency console state helpers"
```

---

### Task 3: Static Console Shell Contract

**Files:**
- Modify: `tests/test_atlas_static.py`
- Later task modifies: `atlas/index.html`

- [ ] **Step 1: Replace the static HTML contract tests**

Replace the console-specific tests in `tests/test_atlas_static.py` with:

```python
def test_index_contains_frequency_console_regions():
    page = load_page()

    for element_id in [
        "frequency-console",
        "life-field",
        "console-screen",
        "channel-controls",
        "mode-controls",
        "tuning-knob",
        "play-toggle",
        "audio-player",
        "source-status",
    ]:
        assert page.find(id=element_id), element_id


def test_index_contains_channel_and_mode_controls():
    page = load_page()

    channel_controls = page.select("#channel-controls button[data-channel]")
    mode_controls = page.select("#mode-controls button[data-mode]")

    assert [button["data-channel"] for button in channel_controls] == [
        "AIR",
        "HEAT",
        "WATER",
        "ANIMAL",
        "NIGHT",
        "ALL",
    ]
    assert [button["data-mode"] for button in mode_controls] == [
        "SEQ",
        "SHUFFLE",
        "HOLD",
    ]
    for button in channel_controls + mode_controls:
        assert button.get("aria-pressed") in {"true", "false"}


def test_frequency_console_screen_and_life_field_are_labelled():
    page = load_page()

    console = page.find(id="frequency-console")
    screen = page.find(id="console-screen")
    life_field = page.find(id="life-field")
    status = page.find(id="source-status")

    assert console
    assert console.get("aria-labelledby") == "atlas-title"
    assert screen
    assert screen.get("aria-labelledby") == "screen-heading"
    assert life_field
    assert life_field.get("aria-hidden") == "true"
    assert status
    assert status.get("role") == "status"


def test_previous_layout_regions_are_not_reintroduced():
    page = load_page()

    for rejected_id in [
        "rupture-nav",
        "rupture-hero",
        "fault-lines",
        "strata-deck",
        "specimen-fragment",
        "route-map",
    ]:
        assert not page.find(id=rejected_id), rejected_id
```

Keep `test_atlas_index_exists()` and `test_index_references_local_css_and_javascript()`, but update `test_index_references_local_css_and_javascript()` in Task 4 to expect a module script.

- [ ] **Step 2: Run static tests and verify failure**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: FAIL because `atlas/index.html` still contains the geomorphic layout.

- [ ] **Step 3: Commit the failing static contract**

```bash
git add tests/test_atlas_static.py
git commit -m "test: update frequency console static contract"
```

---

### Task 4: Frequency Console HTML Shell

**Files:**
- Replace: `atlas/index.html`
- Modify: `tests/test_atlas_static.py`

- [ ] **Step 1: Replace `atlas/index.html` with the console shell**

Use this complete structure:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Yellowstone Frequency Console</title>
    <meta
      name="description"
      content="Tune Yellowstone sound specimens through a warm mineral-metal frequency console."
    >
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#frequency-console">Skip to frequency console</a>

    <main class="frequency-atlas" aria-labelledby="atlas-title">
      <section id="life-field" class="life-field" aria-hidden="true">
        <div class="life-field__essence"></div>
        <div class="life-field__analysis"></div>
        <div class="life-field__labels"></div>
      </section>

      <section
        id="frequency-console"
        class="frequency-console"
        aria-labelledby="atlas-title"
      >
        <div
          id="console-screen"
          class="console-screen"
          aria-labelledby="screen-heading"
          aria-live="polite"
        >
          <p class="screen-kicker" id="screen-heading">Yellowstone frequency</p>
          <h1 id="atlas-title">Frequency Console</h1>
          <dl class="screen-readout">
            <div>
              <dt>Channel</dt>
              <dd id="current-channel">ALL</dd>
            </div>
            <div>
              <dt>Specimen</dt>
              <dd id="current-title">Loading...</dd>
            </div>
            <div>
              <dt>Field phase</dt>
              <dd id="current-phase">Loading</dd>
            </div>
            <div>
              <dt>Habitat</dt>
              <dd id="current-zone">Route specimen</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd id="current-mode">SEQ</dd>
            </div>
            <div>
              <dt>Queue</dt>
              <dd id="current-position">0/0</dd>
            </div>
          </dl>
          <p id="current-note" class="screen-note">Loading route data.</p>
        </div>

        <div class="console-speaker" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span><span></span>
        </div>

        <div class="console-controls">
          <div id="channel-controls" class="channel-controls" aria-label="Frequency channels">
            <button type="button" data-channel="AIR" aria-pressed="false">AIR</button>
            <button type="button" data-channel="HEAT" aria-pressed="false">HEAT</button>
            <button type="button" data-channel="WATER" aria-pressed="false">WATER</button>
            <button type="button" data-channel="ANIMAL" aria-pressed="false">ANIMAL</button>
            <button type="button" data-channel="NIGHT" aria-pressed="false">NIGHT</button>
            <button type="button" data-channel="ALL" aria-pressed="true">ALL</button>
          </div>

          <button
            id="tuning-knob"
            class="tuning-knob"
            type="button"
            aria-label="Tune to next specimen"
          >
            <span class="knob-indicator"></span>
          </button>

          <div id="mode-controls" class="mode-controls" aria-label="Playback mode">
            <button type="button" data-mode="SEQ" aria-pressed="true">SEQ</button>
            <button type="button" data-mode="SHUFFLE" aria-pressed="false">SHUFFLE</button>
            <button type="button" data-mode="HOLD" aria-pressed="false">HOLD</button>
          </div>
        </div>

        <div class="console-transport" aria-label="Playback controls">
          <button id="previous-stop" type="button" aria-label="Previous specimen">Prev</button>
          <button id="play-toggle" type="button" aria-label="Play current specimen">Play</button>
          <button id="next-stop" type="button" aria-label="Next specimen">Next</button>
          <audio id="audio-player" preload="metadata"></audio>
        </div>

        <footer class="console-status">
          <p id="source-status" role="status">Loading route...</p>
          <p id="current-credit"></p>
        </footer>
      </section>
    </main>

    <script type="module" src="app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Update the script-reference test to expect a module script**

In `tests/test_atlas_static.py`, update `test_index_references_local_css_and_javascript()`:

```python
def test_index_references_local_css_and_javascript():
    page = load_page()

    stylesheet_hrefs = [
        stylesheet["href"] for stylesheet in page.find_all("link", rel="stylesheet")
    ]
    module_scripts = [
        script["src"]
        for script in page.find_all("script", src=True)
        if script.get("type") == "module"
    ]

    assert "styles.css" in stylesheet_hrefs
    assert "app.js" in module_scripts
```

- [ ] **Step 3: Run static tests**

Run:

```bash
pytest tests/test_atlas_static.py -v
```

Expected: PASS.

- [ ] **Step 4: Commit the shell**

```bash
git add atlas/index.html tests/test_atlas_static.py
git commit -m "feat: add frequency console shell"
```

---

### Task 5: Browser Playback Orchestration

**Files:**
- Replace: `atlas/app.js`
- Uses: `atlas/frequency-console-state.mjs`
- Test: `tests/frequency-console-state.test.mjs`

- [ ] **Step 1: Replace `atlas/app.js` with DOM orchestration**

Use this structure and keep all function names stable for browser QA:

```js
import {
  CHANNELS,
  MODES,
  decorateStops,
  getAutoAdvanceStopId,
  getNextStopId,
  getScopePosition,
  getVisualProfile,
} from "./frequency-console-state.mjs";

const ROUTE_URL = "dawn-to-night.json";

const state = {
  stops: [],
  currentId: "",
  channel: "ALL",
  mode: "SEQ",
  isPlaying: false,
  knobTurn: 0,
};

function getRequiredElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required atlas element: ${selector}`);
  }
  return element;
}

const elements = {
  body: getRequiredElement("body"),
  lifeField: getRequiredElement("#life-field"),
  currentChannel: getRequiredElement("#current-channel"),
  currentTitle: getRequiredElement("#current-title"),
  currentPhase: getRequiredElement("#current-phase"),
  currentZone: getRequiredElement("#current-zone"),
  currentMode: getRequiredElement("#current-mode"),
  currentPosition: getRequiredElement("#current-position"),
  currentNote: getRequiredElement("#current-note"),
  currentCredit: getRequiredElement("#current-credit"),
  sourceStatus: getRequiredElement("#source-status"),
  audio: getRequiredElement("#audio-player"),
  previous: getRequiredElement("#previous-stop"),
  next: getRequiredElement("#next-stop"),
  playToggle: getRequiredElement("#play-toggle"),
  tuningKnob: getRequiredElement("#tuning-knob"),
  channelControls: getRequiredElement("#channel-controls"),
  modeControls: getRequiredElement("#mode-controls"),
};

function setStatus(message, isError = false) {
  elements.sourceStatus.textContent = message;
  elements.sourceStatus.dataset.state = isError ? "error" : "ready";
}

function getCurrentStop() {
  return state.stops.find((stop) => stop.id === state.currentId) || state.stops[0];
}

function setPressed(container, attribute, activeValue) {
  container.querySelectorAll(`button[${attribute}]`).forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset[attribute.replace("data-", "")] === activeValue));
  });
}

function renderLifeField(stop) {
  const visual = getVisualProfile(state.channel === "ALL" ? stop.channel : state.channel);
  elements.body.dataset.channel = state.channel;
  elements.body.dataset.visual = visual.accent;
  elements.lifeField.dataset.channel = state.channel;
  elements.lifeField.dataset.stop = stop.id;
  elements.lifeField.querySelector(".life-field__labels").textContent = `${visual.title} / ${visual.primary} / ${visual.secondary}`;
}

function render() {
  const stop = getCurrentStop();
  const position = getScopePosition(state.stops, stop.id, state.channel);

  elements.currentChannel.textContent = state.channel;
  elements.currentTitle.textContent = stop.title;
  elements.currentPhase.textContent = stop.timeOfDay;
  elements.currentZone.textContent = stop.zoneLabel;
  elements.currentMode.textContent = state.mode;
  elements.currentPosition.textContent = `${position.index}/${position.total}`;
  elements.currentNote.textContent = stop.description;
  elements.currentCredit.textContent = stop.credit;
  elements.audio.src = encodeURI(`../${stop.audioPath}`);
  elements.audio.load();
  elements.audio.disabled = false;
  elements.audio.removeAttribute("aria-disabled");
  elements.playToggle.textContent = state.isPlaying ? "Pause" : "Play";
  elements.playToggle.setAttribute("aria-label", `${state.isPlaying ? "Pause" : "Play"} current specimen`);
  elements.tuningKnob.style.setProperty("--knob-turn", `${state.knobTurn}deg`);
  setPressed(elements.channelControls, "data-channel", state.channel);
  setPressed(elements.modeControls, "data-mode", state.mode);
  renderLifeField(stop);
  setStatus(`${state.channel} channel mounted`);
}

function setCurrentStop(id, knobDirection = 0) {
  if (!state.stops.some((stop) => stop.id === id)) {
    return;
  }
  state.currentId = id;
  state.knobTurn += knobDirection * 32;
  render();
}

async function togglePlayback() {
  if (state.isPlaying) {
    elements.audio.pause();
    state.isPlaying = false;
    render();
    return;
  }

  try {
    await elements.audio.play();
    state.isPlaying = true;
    render();
  } catch (error) {
    state.isPlaying = false;
    setStatus("Playback blocked until user interaction.", true);
  }
}

function tune(direction) {
  const nextId = getNextStopId(state.stops, state.currentId, state.channel, direction);
  setCurrentStop(nextId, direction);
}

function setChannel(channel) {
  if (!CHANNELS.some((item) => item.id === channel)) {
    return;
  }
  state.channel = channel;
  const nextId = getNextStopId(state.stops, state.currentId, channel, 0);
  setCurrentStop(nextId, 0);
}

function setMode(mode) {
  if (!MODES.includes(mode)) {
    return;
  }
  state.mode = mode;
  render();
}

async function loadRoute() {
  try {
    const response = await fetch(ROUTE_URL);
    if (!response.ok) {
      throw new Error(`Route request failed: ${response.status}`);
    }
    state.stops = decorateStops(await response.json());
    state.currentId = state.stops[0].id;
    render();
  } catch (error) {
    setStatus("Unable to load the Dawn to Night route.", true);
    elements.currentNote.textContent = error.message;
    elements.audio.removeAttribute("src");
    elements.audio.setAttribute("aria-disabled", "true");
  }
}

elements.previous.addEventListener("click", () => tune(-1));
elements.next.addEventListener("click", () => tune(1));
elements.tuningKnob.addEventListener("click", () => tune(1));
elements.playToggle.addEventListener("click", togglePlayback);
elements.channelControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-channel]");
  if (button) {
    setChannel(button.dataset.channel);
  }
});
elements.modeControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mode]");
  if (button) {
    setMode(button.dataset.mode);
  }
});
elements.audio.addEventListener("ended", () => {
  const nextId = getAutoAdvanceStopId(state.stops, state.currentId, state.channel, state.mode);
  if (!nextId) {
    state.isPlaying = false;
    render();
    return;
  }
  setCurrentStop(nextId, 1);
  if (state.isPlaying) {
    elements.audio.play().catch(() => {
      state.isPlaying = false;
      setStatus("Playback blocked until user interaction.", true);
    });
  }
});
elements.audio.addEventListener("error", () => {
  state.isPlaying = false;
  elements.audio.disabled = true;
  elements.audio.setAttribute("aria-disabled", "true");
  elements.audio.removeAttribute("src");
  setStatus("Audio unavailable for this specimen.", true);
});
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    tune(1);
  }
  if (event.key === "ArrowLeft") {
    tune(-1);
  }
  if (event.key === " ") {
    event.preventDefault();
    togglePlayback();
  }
});

loadRoute();
```

- [ ] **Step 2: Run JS and state tests**

Run:

```bash
node --check atlas/app.js
node --test tests/frequency-console-state.test.mjs
```

Expected: syntax check passes and state tests pass.

- [ ] **Step 3: Run Python tests**

Run:

```bash
pytest -v
```

Expected: all Python tests pass.

- [ ] **Step 4: Commit playback orchestration**

```bash
git add atlas/app.js
git commit -m "feat: implement frequency console playback"
```

---

### Task 6: Warm Mineral Metal Visual System

**Files:**
- Replace: `atlas/styles.css`

- [ ] **Step 1: Replace `atlas/styles.css` with the visual system**

Implement these required selectors and responsibilities:

```css
:root {
  color-scheme: dark;
  --mineral-bg: #d0c7b5;
  --mineral-shadow: #8d8272;
  --console-metal: #b8ad9b;
  --console-dark: #1d1b19;
  --screen: #10120f;
  --screen-green: #b7d88a;
  --rubber: #121212;
  --copper: #b96f3f;
  --sulfur: #d8b84c;
  --oxide: #5796a1;
  --bone: #f4efe4;
  --line: rgba(29, 27, 25, 0.22);
  --font-display: Georgia, "Times New Roman", serif;
  --font-ui: "Avenir Next", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, ui-monospace, monospace;
}

body[data-visual="air"] { --field-accent: #c9d89a; }
body[data-visual="heat"] { --field-accent: #d9824a; }
body[data-visual="water"] { --field-accent: #5fa9b4; }
body[data-visual="animal"] { --field-accent: #b98b5e; }
body[data-visual="night"] { --field-accent: #7786b8; }
body[data-visual="all"] { --field-accent: #d8b84c; }
```

Required layout rules:

- `.frequency-atlas`: first-viewport stage, `min-height: 100dvh`, radial mineral background, no card grid.
- `.life-field`: fixed or absolute behind console, responsive to `data-channel`.
- `.life-field__essence`: large natural form using gradients, masks, or pseudo-elements.
- `.life-field__analysis`: spectrum/sonar/coordinate layer, visually secondary.
- `.frequency-console`: central wide flat object, low height, warm metal, real shadow, `display: grid`.
- `.console-screen`: left embedded dark screen with green/mineral text.
- `.console-speaker`: center vent/grille using repeating linear gradients.
- `.console-controls`: right controls area.
- `.tuning-knob`: large circular mechanical knob using radial gradients, tick marks, and `--knob-turn`.
- `.channel-controls button[aria-pressed="true"]`: physical active state.
- `.mode-controls button[aria-pressed="true"]`: separate active mode state.
- `.console-transport`: lower strip with player controls.
- `@media (max-width: 760px)`: stack console internals while keeping controls usable.
- `@media (prefers-reduced-motion: reduce)`: stop breathing animations.

Required background animation:

```css
@keyframes field-breathe {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.72;
  }
  50% {
    transform: translate3d(0, -1.5%, 0) scale(1.035);
    opacity: 0.9;
  }
}
```

Do not include these old selectors:

```css
.geomorphic-atlas
.rupture-nav
.rupture-hero
.strata-deck
.specimen-fragment
.route-map
.stop-card
```

- [ ] **Step 2: Run static checks**

Run:

```bash
rg -n "geomorphic-atlas|rupture-nav|rupture-hero|strata-deck|specimen-fragment|route-map|stop-card" atlas tests
pytest tests/test_atlas_static.py -v
```

Expected: `rg` finds no product-code matches except the rejection test strings in `tests/test_atlas_static.py`; static tests pass.

- [ ] **Step 3: Run full tests and JS checks**

Run:

```bash
node --check atlas/app.js
node --test tests/frequency-console-state.test.mjs
pytest -v
git diff --check
```

Expected: all commands pass.

- [ ] **Step 4: Commit visual system**

```bash
git add atlas/styles.css
git commit -m "style: add frequency console visual system"
```

---

### Task 7: Browser Runtime Verification

**Files:**
- No product-code changes expected unless verification finds issues.
- Optional fixes: `atlas/index.html`, `atlas/app.js`, `atlas/styles.css`, tests that cover any issue found.

- [ ] **Step 1: Start the static server**

Run from repo root:

```bash
python -m http.server 8000
```

Expected: server prints `Serving HTTP` and remains running.

- [ ] **Step 2: Run browser verification with Playwright**

In a second terminal, run:

```bash
node -e 'const { chromium } = require("/Users/rosu/n/lib/node_modules/playwright"); (async () => { const browser = await chromium.launch({ headless: true }); async function verifyViewport(name, width, height) { const page = await browser.newPage({ viewport: { width, height } }); const errors = []; page.on("pageerror", err => errors.push(err.message)); page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); }); const response = await page.goto("http://localhost:8000/atlas/", { waitUntil: "load" }); await page.waitForSelector("#frequency-console"); await page.waitForSelector("#current-title"); const firstTitle = await page.locator("#current-title").innerText(); await page.locator("[data-channel=HEAT]").click(); await page.locator("#next-stop").click(); const heatTitle = await page.locator("#current-title").innerText(); await page.locator("[data-mode=SHUFFLE]").click(); const mode = await page.locator("#current-mode").innerText(); await page.locator("[data-channel=ALL]").click(); await page.locator("#tuning-knob").click(); const tunedTitle = await page.locator("#current-title").innerText(); const metrics = await page.evaluate(() => ({ title: document.title, status: document.querySelector("#source-status")?.textContent?.trim(), channel: document.querySelector("#current-channel")?.textContent?.trim(), mode: document.querySelector("#current-mode")?.textContent?.trim(), pressedChannels: [...document.querySelectorAll("#channel-controls [aria-pressed=true]")].map((node) => node.dataset.channel), pressedModes: [...document.querySelectorAll("#mode-controls [aria-pressed=true]")].map((node) => node.dataset.mode), scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, consoleBox: document.querySelector("#frequency-console")?.getBoundingClientRect().toJSON?.() || null })); await page.screenshot({ path: `/private/tmp/ysl-frequency-console-${name}.png`, fullPage: true }); await page.close(); return { name, status: response && response.status(), firstTitle, heatTitle, mode, tunedTitle, metrics, errors }; } const desktop = await verifyViewport("desktop", 1440, 1000); const mobile = await verifyViewport("mobile", 390, 844); await browser.close(); console.log(JSON.stringify({ desktop, mobile }, null, 2)); })().catch(err => { console.error(err); process.exit(1); });'
```

Expected:

- `status` is `200` for both viewports.
- `errors` is empty for both viewports.
- `heatTitle` is either `Old Faithful` or `Black Growler Steam Vent`.
- `mode` is `SHUFFLE`.
- exactly one channel button and one mode button are `aria-pressed=true`.
- `scrollWidth <= clientWidth` for both viewports.
- screenshots exist at `/private/tmp/ysl-frequency-console-desktop.png` and `/private/tmp/ysl-frequency-console-mobile.png`.

- [ ] **Step 3: Stop the static server**

Send Ctrl-C to the server process.

Expected: server exits. Do not leave the session running.

- [ ] **Step 4: Fix any browser issues with tests**

If the browser check finds overlap, missing active state, broken channel filtering, or console errors, make the smallest product-code fix and add or adjust a test that would catch the regression. Then rerun:

```bash
node --check atlas/app.js
node --test tests/frequency-console-state.test.mjs
pytest -v
git diff --check
```

Expected: all commands pass.

- [ ] **Step 5: Commit browser verification fixes if needed**

If files changed during this task:

```bash
git add atlas/index.html atlas/app.js atlas/styles.css tests/test_atlas_static.py tests/frequency-console-state.test.mjs
git commit -m "fix: verify frequency console browser behavior"
```

If no files changed, do not create an empty commit.

---

## Final Verification Checklist

- [ ] `node --check atlas/app.js`
- [ ] `node --test tests/frequency-console-state.test.mjs`
- [ ] `pytest -v`
- [ ] `git diff --check`
- [ ] Browser desktop screenshot at `/private/tmp/ysl-frequency-console-desktop.png`
- [ ] Browser mobile screenshot at `/private/tmp/ysl-frequency-console-mobile.png`
- [ ] `git status --short` shows only intended changes or is clean after commits
- [ ] The product page at `http://localhost:8000/atlas/` shows a central warm mineral-metal console, not the old geomorphic or HLE one-screen experiment

## Spec Coverage Map

- Product goal: Tasks 4, 5, 6 replace playlist/page structure with an instrument-like console.
- Warm mineral metal control console: Task 6.
- Left embedded screen: Task 4 HTML, Task 5 render, Task 6 styling.
- Center acoustic grille: Task 4 HTML, Task 6 styling.
- Right tuning knob: Task 4 HTML, Task 5 behavior, Task 6 styling.
- Channel keys AIR/HEAT/WATER/ANIMAL/NIGHT/ALL: Tasks 1, 2, 4, 5.
- Scoped autoplay and random behavior: Tasks 1, 2, 5, 7.
- `SEQ`/`SHUFFLE`/`HOLD`: Tasks 1, 2, 4, 5.
- Background life-frequency field: Task 4 shell, Task 5 channel state, Task 6 visual system.
- Natural essence as primary, scientific layer as secondary: Task 6.
- Slow breathing motion and reduced-motion support: Task 6.
- Existing route mapping: Tasks 1 and 2.
- Accessibility and labelled regions: Tasks 3 and 4.
- Static and runtime verification: Tasks 1, 3, 7 and final checklist.
