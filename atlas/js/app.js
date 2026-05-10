const ROUTE_URL = "./dawn-to-night.json";

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

const state = {
  stops: [],
  index: 0,
  activeTheme: "Thermal",
  isPlaying: false,
  isDragging: false,
  autoPlayNext: false,
  isMinimized: false,
};

const descriptionOverrides = {
  "american-coots": "American Coots skitter through the wetland margin, their sharp calls cutting through the morning mist.",
  "american-robin": "The first light brings the robin to the forest edge, its song mapping the boundary between dark and day.",
  "birds---bird-chorus": "Before the sun clears the ridge, the entire valley fills with layered song, each species staking its claim in the chorus.",
  "bird---common-yellowthroat": "Hidden in dense shrub, the Common Yellowthroat delivers its witchity-witchity call with surprising force.",
  "dawn-chorus": "At first light, the soundscape swells: warblers, thrushes, and sparrows weaving a collective tapestry of territorial song.",
  "red-fox": "A Red Fox moves through the forest edge, its sharp bark cutting through the stillness, a territorial signal in the half-light.",
  "bird---red-winged-blackbird": "Perched on cattails, the Red-Winged Blackbird flashes its epaulets while delivering a liquid konk-la-reee across the marsh.",
  "sandhill-crane": "Sandhill Cranes pass overhead in loose formation, their rolling bugle calls carrying for miles across the wetland meadow.",
  "soundscapes": "This layered recording captures the full acoustic depth of the park: wind through lodgepole pines, distant water, and the continuous murmur of unseen life.",
  "american-dipper": "The American Dipper stands on a streamside rock, its clear bubbling song rising above the rush of mountain water.",
  "bald-eagle": "From a riverside perch, the Bald Eagle emits a series of high-pitched whistles, far more delicate than its fierce appearance suggests.",
  "canada-goose": "Canada Geese trumpet across the lake shore, their honking calls echoing off the water in the still morning air.",
  "bird---clarks-nutcracker": "In the pine forest, Clark's Nutcracker works through the cones with mechanical precision, its harsh kraaa calls bouncing between trunks.",
  "common-raven": "Ravens wheel above the canyon rim, their deep croaks and watery gurgles echoing off the basalt walls below.",
  "killdeer": "On the gravel bar, a Killdeer performs its broken-wing display while shouting its own name in sharp, insistent cries.",
  "mountain-bluebird": "The Mountain Bluebird's soft warble carries across the open meadow, a gentle counterpoint to the wind.",
  "red-squirrel": "A Red Squirrel chatters from a pine branch, its staccato alarm calls warning the forest of intruders.",
  "ruffed-grouse": "Deep in the deciduous forest, a Ruffed Grouse beats the air with its wings, producing a deep thumping that sounds like a distant engine starting.",
  "bird---savannah-sparrow": "From a grassland perch, the Savannah Sparrow delivers its thin, insect-like song with mechanical regularity.",
  "snowmobile": "The two-stroke whine of a snowmobile cuts across the winter trail, a sharp reminder of human presence in the white silence.",
  "townsends-solitaire": "On a sagebrush slope, Townsend's Solitaire pours out a long, flute-like song that seems to hang in the thin mountain air.",
  "uinta-ground-squirrel": "Uinta Ground Squirrels whistle from their burrows in the alpine meadow, a high-pitched alarm that sends the colony diving for cover.",
  "warbling-vireo": "Hidden in the cottonwood canopy, the Warbling Vireo delivers its endless, meandering song without apparent need for breath.",
  "western-meadow-lark": "The Western Meadowlark's rich, flute-like melody rises from the prairie grassland, one of the most complex songs in North America.",
  "geyser---anemone": "Anemone Geyser erupts in the Upper Basin, sending a column of steam and water into the air with a deep, pressurized roar.",
  "anemone-geysers": "The Anemone Geysers cycle through their eruption phases, each burst accompanied by a distinct change in pitch and intensity.",
  "artist-paint-pots": "At Artist Paint Pots, thick mud bubbles and pops with wet, organic sounds, like a giant cooking in a deep cauldron.",
  "beehive-geyser": "Beehive Geyser lives up to its name, sending a narrow, focused jet of water high into the air with a whistling shriek.",
  "geyser---beehive": "The cone of Beehive Geyser shapes its eruption into a focused column, the water cutting the air with a sharp hiss.",
  "beryl-spring": "Beryl Spring boils continuously, its deep turquoise surface disturbed by constant bubbling and the low rumble of underground pressure.",
  "bison-eating": "A Bison herd grazes through the grassland, the sound of tearing grass and heavy breathing filling the air between grunts.",
  "castle-geyser": "Castle Geyser's cone directs its eruption into a fan-shaped spray, the water crashing back to earth with a continuous thunder.",
  "geyser---cliff": "Cliff Geyser erupts from the edge of the Firehole River, its steam mingling with the mist rising from the water below.",
  "ear-spring": "Ear Spring bubbles gently in the Upper Basin, its clear water percolating with a sound like a slowly boiling kettle.",
  "fountain-paint-pot": "At Fountain Paint Pot, viscous clay mud burps and splatters, each burst producing a wet, satisfying plop.",
  "geyser---grand": "Grand Geyser erupts in towering bursts, the water reaching heights that seem impossible, each eruption accompanied by a deep, rolling thunder.",
  "grand-geyser": "Grand Geyser's eruption is one of the tallest in the world, the water column collapsing back with a continuous roar.",
  "horse-drawn-wagon": "The creak of a horse-drawn wagon traces the historic trail, wood and leather sounds that have echoed here for over a century.",
  "old-faithful-geyser": "Old Faithful delivers its predictable eruption, the water column rising with a steady, pressurized hiss before collapsing in a thunderous cascade.",
  "puff-n-stuff-geyser": "Puff 'n Stuff Geyser lives up to its name, emitting short, energetic bursts of steam and water with each cycle.",
  "geyser---sawmill": "Sawmill Geyser churns continuously, its pool boiling and surging with a sound like water about to break into a full eruption.",
  "spouter-geyser": "Spouter Geyser sends a constant stream of water from its vent in the Black Sand Basin, the sound a steady, rushing white noise.",
  "geyser---veteran": "Veteran Geyser erupts with irregular timing, each burst a surprise after hours of quiet bubbling.",
  "vixen-geyser": "Vixen Geyser's eruptions are small but frequent, the water dancing just above the vent with a playful, sputtering energy.",
  "black-growler-steam-vent": "Black Growler Steam Vent roars continuously in the Norris Basin, a deep, guttural sound that seems to come from the earth itself.",
  "black-sand-pool": "Black Sand Pool steams quietly in the Upper Basin, its surface disturbed only by the occasional bubble breaking through.",
  "fire": "A forest fire reshapes the acoustic landscape, the crackle and roar of burning timber replacing the usual birdsong with something primal.",
  "fumaroles": "At Roaring Mountain, Fumaroles vent steam with a continuous hiss, the sound varying with the wind and the pressure below.",
  "hurricane-vent": "Hurricane Vent lives up to its name, emitting a continuous stream of steam with a force that sounds like a gale trapped underground.",
  "scissors-springs": "Scissors Springs bubble and churn in the Norris Basin, the water shifting between pools with a sound of constant motion.",
  "the-dragons-mouth": "The Dragon's Mouth steams and hisses in Mammoth Hot Springs, the sound echoing from a cave-like opening that seems to breathe.",
  "thunder": "Summer thunder rolls across the park, the deep bass notes bouncing between canyon walls in a slow, reverberating cascade.",
  "bison-rut": "During the rut, Bison bulls bellow across the rutting ground, their deep, resonant calls competing for the attention of cows.",
  "common-loon": "A Common Loon calls across the lake surface, its tremolo and wails carrying for miles in the still evening air.",
  "yellowstone-lake-singing": "The surface of Yellowstone Lake sings with shifting ice and wave resonance, a haunting, ethereal sound that seems to come from nowhere and everywhere.",
  "boreal-chorus-frogs": "At dusk, Boreal Chorus Frogs fill the pond margin with a continuous, trilling chorus, each frog contributing to a collective wall of sound.",
  "elk": "An Elk bugles across the evening meadow, its high, whistling call carrying the raw tension of the rut through the cooling air.",
  "wilsons-snipe": "Wilson's Snipe performs its winnowing display high above the wetland marsh, the sound of its tail feathers producing an eerie, descending bleat.",
  "coyotes": "Coyotes yip and howl across the valley floor, their calls weaving together in a chorus that fills the night with wild sound.",
  "spadefoot-toad": "After rain, Spadefoot Toads emerge from their burrows around temporary pools, their nasal calls forming a loud, monotonous chorus.",
  "wolves": "Wolves howl across the night soundscape, their long, mournful calls carrying for miles, each note bending and fading into the dark.",
};

const ui = {
  body: document.body,
  playerCard: document.querySelector(".player-card"),
  stage: getEl("#stage"),
  expandedFace: document.querySelector(".stamp-expanded"),
  miniStamp: getEl("#mini-stamp"),
  miniExpand: getEl("#mini-expand-btn"),
  eyebrow: getEl("#eyebrow"),
  title: getEl("#track-title"),
  meta: getEl("#track-meta"),
  desc: getEl("#track-desc"),
  credit: getEl("#track-credit"),
  waveform: getEl("#waveform"),
  audio: getEl("#audio-player"),
  prev: getEl("#prev-btn"),
  next: getEl("#next-btn"),
  play: getEl("#play-btn"),
  iconPlay: getEl("#icon-play"),
  iconPause: getEl("#icon-pause"),
  track: getEl("#progress-track"),
  fill: getEl("#progress-fill"),
  thumb: getEl("#progress-thumb"),
  timeCurrent: getEl("#time-current"),
  timeTotal: getEl("#time-total"),
  status: getEl("#status"),
  scenePhoto: getEl("#scene-photo"),
  keyboardHints: getEl("#keyboard-hints"),
  minimizeBtn: getEl("#minimize-btn"),
  miniEyebrow: getEl("#mini-eyebrow"),
  miniTitle: getEl("#mini-track-title"),
  miniMeta: getEl("#mini-track-meta"),
  miniPlay: getEl("#mini-play-btn"),
  miniIconPlay: getEl("#mini-icon-play"),
  miniIconPause: getEl("#mini-icon-pause"),
  miniScenePhoto: getEl("#mini-scene-photo"),
  themeTabs: getEl("#theme-tabs"),
  chipCarousel: getEl("#chip-carousel"),
  strip: getEl("#specimen-strip"),
};

if (!ui.playerCard) throw new Error("Missing element: .player-card");
if (!ui.expandedFace) throw new Error("Missing element: .stamp-expanded");

function getEl(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

function fmtTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function showStatus(msg, isError = false) {
  ui.status.textContent = msg;
  ui.status.classList.toggle("error", isError);
  ui.status.classList.add("visible");
  clearTimeout(showStatus._timer);
  showStatus._timer = setTimeout(() => ui.status.classList.remove("visible"), 3000);
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

let keyboardHintTimer;
function showKeyboardHints() {
  ui.keyboardHints.classList.add("visible");
  clearTimeout(keyboardHintTimer);
  keyboardHintTimer = setTimeout(() => {
    ui.keyboardHints.classList.remove("visible");
  }, 4000);
}

function buildWaveform(seed) {
  clearNode(ui.waveform);
  const count = 48;

  for (let i = 0; i < count; i++) {
    const bar = document.createElement("span");
    bar.className = "wave-bar";
    const height = 18 + ((seed * (i * 7 + 13)) % 72);
    bar.style.setProperty("--h", `${height}%`);
    bar.style.setProperty("--d", `${i * 35}ms`);
    bar.dataset.index = i;
    ui.waveform.appendChild(bar);
  }
}

function updateWaveform(percent) {
  const bars = ui.waveform.children;
  const index = Math.floor((percent / 100) * bars.length);
  for (let i = 0; i < bars.length; i++) {
    bars[i].classList.toggle("played", i < index);
  }
}

function getThemeMeta(theme) {
  return THEME_META[theme] || THEME_META.Thermal;
}

function getStopNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyTheme(theme) {
  const meta = getThemeMeta(theme);
  ui.body.dataset.theme = meta.token;
  ui.body.style.setProperty("--theme-color", meta.color);
  ui.body.style.setProperty("--photo-tint", meta.color);
  ui.playerCard.style.setProperty("--theme-color", meta.color);
  ui.strip.style.setProperty("--theme-color", meta.color);
  ui.strip.style.setProperty("--photo-tint", meta.color);
}

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
    const meta = getThemeMeta(theme);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-tab";
    button.id = `theme-tab-${meta.token}`;
    button.style.setProperty("--theme-color", meta.color);
    button.dataset.theme = meta.token;
    button.dataset.themeName = theme;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "chip-carousel");
    button.setAttribute("aria-selected", String(theme === state.activeTheme));
    button.setAttribute("aria-label", `${theme}, ${themeCount(theme)} specimens`);
    button.addEventListener("click", () => setActiveTheme(theme, true));

    const swatch = document.createElement("span");
    swatch.className = "theme-swatch";
    swatch.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "theme-name";
    name.textContent = theme;

    const count = document.createElement("span");
    count.className = "theme-count";
    count.textContent = themeCount(theme);

    button.append(swatch, name, count);
    ui.themeTabs.appendChild(button);
  });
}

function buildChipCarousel() {
  clearNode(ui.chipCarousel);

  themeStops(state.activeTheme).forEach((stop) => {
    const meta = getThemeMeta(stop.theme);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "specimen-chip stamp-chip";
    chip.dataset.index = String(stop.index);
    chip.style.setProperty("--theme-color", meta.color);
    chip.setAttribute("aria-label", `Select ${stop.title}`);
    chip.addEventListener("click", () => {
      selectStop(stop.index, !ui.audio.paused, { keepActiveTheme: true });
    });

    if (stop.imagePath) {
      const photo = document.createElement("img");
      photo.className = "chip-photo";
      photo.alt = "";
      photo.loading = "lazy";
      photo.decoding = "async";
      photo.src = encodeURI(`../${stop.imagePath}`);
      chip.appendChild(photo);
    }

    const label = document.createElement("small");
    label.textContent = `${getStopNumber(stop.index)} - ${stop.timeOfDay}`;

    const title = document.createElement("strong");
    title.textContent = stop.title;

    const theme = document.createElement("span");
    theme.textContent = stop.theme;

    chip.append(label, title, theme);
    ui.chipCarousel.appendChild(chip);
  });
}

function updateThemeNav() {
  ui.themeTabs.querySelectorAll("[role='tab']").forEach((tab) => {
    const isActive = tab.id === `theme-tab-${getThemeMeta(state.activeTheme).token}`;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  const chips = ui.chipCarousel.querySelectorAll(".specimen-chip");
  let activeChip = null;
  chips.forEach((chip) => {
    const isActive = Number(chip.dataset.index) === state.index;
    chip.classList.toggle("is-active", isActive);
    if (isActive) {
      chip.setAttribute("aria-current", "true");
      activeChip = chip;
    } else {
      chip.removeAttribute("aria-current");
    }
  });

  if (activeChip) {
    activeChip.scrollIntoView({
      behavior: isReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }
}

function focusActiveThemeTab() {
  const activeTab = ui.themeTabs.querySelector(`#theme-tab-${getThemeMeta(state.activeTheme).token}`);
  if (activeTab) activeTab.focus();
}

function onThemeTabsKeydown(e) {
  if (!(e.target instanceof Element)) return;

  const tab = e.target.closest("[role='tab']");
  if (!tab || !ui.themeTabs.contains(tab)) return;

  const currentIndex = THEME_ORDER.indexOf(tab.dataset.themeName);
  if (currentIndex < 0) return;

  let nextIndex;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    nextIndex = (currentIndex + 1) % THEME_ORDER.length;
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    nextIndex = (currentIndex - 1 + THEME_ORDER.length) % THEME_ORDER.length;
  } else if (e.key === "Home") {
    nextIndex = 0;
  } else if (e.key === "End") {
    nextIndex = THEME_ORDER.length - 1;
  } else {
    return;
  }

  e.preventDefault();
  setActiveTheme(THEME_ORDER[nextIndex], true);
  focusActiveThemeTab();
}

function setActiveTheme(theme, selectFirst = false) {
  if (!THEME_META[theme]) return;

  state.activeTheme = theme;
  applyTheme(theme);
  ui.chipCarousel.classList.add("is-switching");
  buildThemeTabs();
  buildChipCarousel();
  updateThemeNav();

  if (selectFirst) {
    const firstStop = themeStops(theme)[0];
    if (firstStop) {
      selectStop(firstStop.index, !ui.audio.paused, { keepActiveTheme: true });
    }
  }

  requestAnimationFrame(() => {
    ui.chipCarousel.classList.remove("is-switching");
  });
}

function setPhoto(img, imagePath, title) {
  const expectedPath = imagePath || "";
  const matchesSelectedStop = () => {
    const selected = state.stops[state.index];
    return selected && selected.title === title && (selected.imagePath || "") === expectedPath;
  };

  img.alt = title || "";
  img.classList.remove("is-loaded");

  if (!imagePath) {
    if (matchesSelectedStop()) {
      img.removeAttribute("src");
      img.classList.add("is-fallback");
    }
    return;
  }

  img.classList.remove("is-fallback");
  const src = encodeURI(`../${imagePath}`);
  preloadImage(src).then((loaded) => {
    if (!matchesSelectedStop()) return;

    if (loaded) {
      img.src = loaded;
      img.classList.remove("is-fallback");
      img.classList.add("is-loaded");
    } else {
      img.removeAttribute("src");
      img.classList.remove("is-loaded");
      img.classList.add("is-fallback");
    }
  });
}

function updateScenePhoto(stop) {
  setPhoto(ui.scenePhoto, stop.imagePath, stop.title);
  setPhoto(ui.miniScenePhoto, stop.imagePath, stop.title);
}

function applyMinimized(nextValue) {
  state.isMinimized = Boolean(nextValue);
  ui.playerCard.classList.toggle("is-minimized", state.isMinimized);
  ui.body.classList.toggle("player-is-minimized", state.isMinimized);
  ui.minimizeBtn.setAttribute(
    "aria-label",
    state.isMinimized ? "Expand player" : "Minimize player",
  );
  ui.miniExpand.disabled = !state.isMinimized;
}

function setMinimized(nextValue) {
  const nextState = Boolean(nextValue);
  if (state.isMinimized === nextState) {
    applyMinimized(nextState);
    return;
  }

  if (!isReducedMotion() && typeof document.startViewTransition === "function") {
    document.startViewTransition(() => applyMinimized(nextState));
  } else {
    applyMinimized(nextState);
  }
}

function toggleMinimize() {
  setMinimized(!state.isMinimized);
}

function resetProgress() {
  ui.timeCurrent.textContent = "0:00";
  ui.timeTotal.textContent = "0:00";
  ui.fill.style.width = "0%";
  ui.thumb.style.left = "0%";
  ui.track.setAttribute("aria-valuenow", "0");
  updateWaveform(0);
}

function setPlayDisabled(disabled) {
  ui.play.disabled = disabled;
  ui.miniPlay.disabled = disabled;
}

function selectStop(index, autoPlay = false, options = {}) {
  if (!state.stops[index]) return;

  const stop = state.stops[index];
  const previousTheme = state.activeTheme;
  const themeMeta = getThemeMeta(stop.theme);

  state.index = index;
  state.autoPlayNext = autoPlay;
  if (!options.keepActiveTheme) {
    state.activeTheme = stop.theme;
  }

  applyTheme(state.activeTheme);
  ui.playerCard.style.setProperty("--theme-color", themeMeta.color);
  ui.body.classList.add("is-switching");

  const stopNumber = getStopNumber(index);
  ui.eyebrow.textContent = `YELLOWSTONE - ${stopNumber}`;
  ui.miniEyebrow.textContent = `YELLOWSTONE - ${stopNumber}`;
  ui.title.textContent = stop.title;
  ui.miniTitle.textContent = stop.title;
  ui.meta.textContent = `${stop.theme} - ${stop.zoneLabel} - ${stop.timeOfDay}`;
  ui.miniMeta.textContent = `${stop.theme} - ${stop.timeOfDay}`;
  ui.desc.textContent = descriptionOverrides[stop.id] || stop.description;
  ui.credit.textContent = stop.credit;

  ui.audio.src = encodeURI(`../${stop.audioPath}`);
  ui.audio.load();
  setPlayDisabled(false);
  resetProgress();
  buildWaveform(stop.id.length + index);
  updateWaveform(0);
  updateScenePhoto(stop);

  if (!autoPlay) {
    state.isPlaying = false;
    updatePlayIcon();
  }

  updateNav();
  if (previousTheme !== state.activeTheme) {
    buildThemeTabs();
    buildChipCarousel();
  }
  updateThemeNav();

  requestAnimationFrame(() => {
    ui.body.classList.remove("is-switching");
  });
}

function updateNav() {
  ui.prev.disabled = state.index === 0;
  ui.next.disabled = state.index === state.stops.length - 1;
}

function togglePlay() {
  if (ui.play.disabled) return;

  if (ui.audio.paused) {
    ui.audio.play().catch(() => updatePlayIcon());
  } else {
    ui.audio.pause();
  }
}

function updatePlayIcon() {
  const playing = !ui.audio.paused;
  state.isPlaying = playing;
  ui.iconPlay.style.display = playing ? "none" : "block";
  ui.iconPause.style.display = playing ? "block" : "none";
  ui.miniIconPlay.style.display = playing ? "none" : "block";
  ui.miniIconPause.style.display = playing ? "block" : "none";
  ui.play.setAttribute("aria-label", playing ? "Pause" : "Play");
  ui.miniPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
  ui.waveform.classList.toggle("playing", playing);
}

function paintProgressFromAudio() {
  if (!ui.audio.duration) return;
  const pct = Math.max(0, Math.min(100, (ui.audio.currentTime / ui.audio.duration) * 100));
  ui.fill.style.width = `${pct}%`;
  ui.thumb.style.left = `${pct}%`;
  ui.track.setAttribute("aria-valuenow", Math.round(pct));
  ui.timeCurrent.textContent = fmtTime(ui.audio.currentTime);
  updateWaveform(pct);
}

function onTimeUpdate() {
  if (state.isDragging) return;
  paintProgressFromAudio();
}

function onLoadedMeta() {
  setPlayDisabled(false);
  ui.timeTotal.textContent = fmtTime(ui.audio.duration || 0);
  if (state.autoPlayNext) {
    state.autoPlayNext = false;
    ui.audio.play().catch(() => {
      updatePlayIcon();
      showStatus("Playback could not start automatically.");
    });
  }
}

function onEnded() {
  if (state.index < state.stops.length - 1) {
    selectStop(state.index + 1, true);
  } else {
    updatePlayIcon();
  }
}

function seekFromEvent(e) {
  const rect = ui.track.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const x = clientX - rect.left;
  const pct = Math.max(0, Math.min(1, x / rect.width));
  if (ui.audio.duration) {
    ui.audio.currentTime = pct * ui.audio.duration;
    paintProgressFromAudio();
  }
}

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
  paintProgressFromAudio();
});

document.addEventListener("touchend", () => {
  if (!state.isDragging) return;
  state.isDragging = false;
  ui.track.classList.remove("dragging");
  paintProgressFromAudio();
});

ui.track.addEventListener("keydown", (e) => {
  if (!ui.audio.duration) return;
  const step = ui.audio.duration * 0.05;
  if (e.key === "ArrowLeft") {
    ui.audio.currentTime = Math.max(0, ui.audio.currentTime - step);
    paintProgressFromAudio();
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    ui.audio.currentTime = Math.min(ui.audio.duration, ui.audio.currentTime + step);
    paintProgressFromAudio();
    e.preventDefault();
  }
});

ui.themeTabs.addEventListener("keydown", onThemeTabsKeydown);
ui.play.addEventListener("click", togglePlay);
ui.miniPlay.addEventListener("click", (e) => {
  e.stopPropagation();
  togglePlay();
});
ui.miniExpand.addEventListener("click", (e) => {
  e.stopPropagation();
  setMinimized(false);
});
ui.prev.addEventListener("click", () => selectStop(Math.max(0, state.index - 1), !ui.audio.paused));
ui.next.addEventListener("click", () => selectStop(Math.min(state.stops.length - 1, state.index + 1), !ui.audio.paused));
ui.minimizeBtn.addEventListener("click", toggleMinimize);

ui.audio.addEventListener("play", updatePlayIcon);
ui.audio.addEventListener("pause", updatePlayIcon);
ui.audio.addEventListener("timeupdate", onTimeUpdate);
ui.audio.addEventListener("loadedmetadata", onLoadedMeta);
ui.audio.addEventListener("ended", onEnded);
ui.audio.addEventListener("error", () => {
  state.autoPlayNext = false;
  ui.audio.pause();
  setPlayDisabled(true);
  updatePlayIcon();
  showStatus("Audio unavailable for this specimen.", true);
});

function isTextEntryTarget(target) {
  return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable]"));
}

function isSpaceShortcutTarget(target) {
  return target instanceof Element && Boolean(target.closest(
    "button, a[href], input, textarea, select, summary, [role='button'], [role='tab'], [role='slider'], .specimen-chip, [contenteditable]",
  ));
}

document.addEventListener("keydown", (e) => {
  if (e.defaultPrevented) return;
  if (isTextEntryTarget(e.target)) return;

  if (e.code === "Space") {
    if (isSpaceShortcutTarget(e.target)) return;
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
  }
});

function validateStops(stops) {
  if (!Array.isArray(stops) || stops.length === 0) {
    throw new Error("Route data is empty.");
  }

  const required = ["id", "title", "timeOfDay", "theme", "zoneLabel", "audioPath", "description", "credit"];

  stops.forEach((stop, i) => {
    if (!stop || typeof stop !== "object" || Array.isArray(stop)) {
      throw new Error(`Stop ${i + 1} is malformed.`);
    }
    required.forEach((field) => {
      if (typeof stop[field] !== "string" || stop[field].trim() === "") {
        throw new Error(`Stop ${i + 1} missing field: ${field}.`);
      }
    });
    if (!THEME_META[stop.theme]) {
      throw new Error(`Stop ${i + 1} has unknown theme: ${stop.theme}.`);
    }
    if ("imagePath" in stop && typeof stop.imagePath !== "string") {
      throw new Error(`Stop ${i + 1} has invalid image path.`);
    }
  });
}

async function loadRoute() {
  try {
    const res = await fetch(ROUTE_URL);
    if (!res.ok) throw new Error(`Route request failed: ${res.status}`);

    const stops = await res.json();
    validateStops(stops);

    state.stops = stops;
    state.activeTheme = "Thermal";
    applyTheme(state.activeTheme);
    buildThemeTabs();
    buildChipCarousel();
    setMinimized(false);
    selectStop(0);
    showStatus(`${stops.length} sound specimens loaded`);
  } catch (err) {
    showStatus(err.message, true);
    ui.title.textContent = "Unable to load route";
    ui.desc.textContent = err.message;
  }
}

applyMinimized(false);
updatePlayIcon();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadRoute);
} else {
  loadRoute();
}
