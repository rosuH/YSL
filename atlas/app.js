const ROUTE_URL = "dawn-to-night.json";

const state = {
  stops: [],
  selectedIndex: 0,
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
  navChapters: getRequiredElement("#nav-chapters"),
  heroBackdrop: getRequiredElement("#hero-backdrop"),
  heroMeta: getRequiredElement("#hero-meta"),
  chapter: getRequiredElement("#current-chapter"),
  title: getRequiredElement("#current-title"),
  description: getRequiredElement("#current-description"),
  summary: getRequiredElement("#current-summary"),
  zone: getRequiredElement("#current-zone"),
  credit: getRequiredElement("#current-credit"),
  specimenNote: getRequiredElement("#current-specimen-note"),
  waveLattice: getRequiredElement("#wave-lattice"),
  strataDeck: getRequiredElement("#strata-deck"),
  audio: getRequiredElement("#audio-player"),
  previous: getRequiredElement("#previous-stop"),
  next: getRequiredElement("#next-stop"),
  status: getRequiredElement("#source-status"),
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
  setStatus(`${state.stops.length} sound specimens loaded`);

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

function updateActiveNodes(container, activeStop) {
  container.querySelectorAll("[data-stop-id]").forEach((node) => {
    const isActive = node.dataset.stopId === activeStop.id;
    node.classList.toggle("is-active", isActive);
    if (isActive) {
      node.setAttribute("aria-current", "true");
    } else {
      node.removeAttribute("aria-current");
    }
  });
}

function renderActiveState() {
  const activeStop = state.stops[state.selectedIndex];
  updateActiveNodes(elements.navChapters, activeStop);
  updateActiveNodes(elements.strataDeck, activeStop);
}

function validateRoute(stops) {
  if (!Array.isArray(stops) || stops.length === 0) {
    throw new Error("Route data is empty.");
  }

  const requiredStringFields = [
    "id",
    "title",
    "timeOfDay",
    "theme",
    "zoneLabel",
    "audioPath",
    "description",
    "credit",
  ];

  stops.forEach((stop, index) => {
    if (!stop || typeof stop !== "object" || Array.isArray(stop)) {
      throw new Error(`Route stop ${index + 1} is malformed.`);
    }

    requiredStringFields.forEach((field) => {
      if (typeof stop[field] !== "string" || stop[field].trim() === "") {
        throw new Error(`Route stop ${index + 1} is missing ${field}.`);
      }
    });

    if ("imagePath" in stop && typeof stop.imagePath !== "string") {
      throw new Error(`Route stop ${index + 1} has an invalid imagePath.`);
    }
  });
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

    renderNavChapters();
    renderStrataDeck();
    selectStop(0);
    setStatus(`${stops.length} sound specimens loaded`);
  } catch (error) {
    setStatus("Unable to load the Dawn to Night route.", true);
    elements.description.textContent = error.message;
    elements.summary.textContent = error.message;
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
  elements.audio.disabled = true;
  elements.audio.setAttribute("aria-disabled", "true");
  setStatus("Audio unavailable for this stop.", true);
  elements.audio.removeAttribute("src");
  elements.audio.load();
});

loadRoute();
