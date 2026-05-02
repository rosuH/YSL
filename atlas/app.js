if (document.querySelector("#route-map")) {
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

    const time = document.createElement("span");
    time.className = "stop-card-time";
    time.textContent = stop.timeOfDay;

    const title = document.createElement("strong");
    title.textContent = stop.title;

    const details = document.createElement("span");
    details.textContent = `${stop.theme} · ${stop.zoneLabel}`;

    card.append(time, title, details);
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

  elements.audio.disabled = false;
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
  elements.audio.disabled = true;
  elements.audio.setAttribute("aria-disabled", "true");
  setStatus("Audio unavailable for this stop.", true);
});

loadRoute();
}
