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
  itemBackdrop: getEl("#item-backdrop"),
  backdropDeck: getEl("#backdrop-deck"),
  backdropPrint: getEl("#backdrop-print"),
  backdropPrintPhoto: getEl("#backdrop-print-photo"),
  backdropPrintCaption: getEl("#backdrop-print-caption"),
  backdropNote: getEl("#backdrop-note"),
  backdropNoteTitle: getEl("#backdrop-note-title"),
  backdropNoteMeta: getEl("#backdrop-note-meta"),
  backdropNoteBody: getEl("#backdrop-note-body"),
  shareInstagram: getEl("#share-instagram-btn"),
  shareX: getEl("#share-x-link"),
  shareCopy: getEl("#share-copy-btn"),
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
  sceneFrame: getEl("#scene-photo-frame"),
  scenePhoto: getEl("#scene-photo"),
  miniFrame: getEl("#mini-photo-frame"),
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
  archiveSlip: getEl("#archive-slip"),
  archiveSlipSummary: getEl("#archive-slip-summary"),
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
let progressFrame = 0;

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

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function semanticPaletteForStop(stop) {
  const seed = hashString(`${stop.title}|${stop.theme}|${stop.zoneLabel}`);
  const hue = seed % 360;
  const saturation = stop.theme === "Weather" || stop.theme === "Water" ? 64 : 56;

  return {
    accent: `hsl(${hue} ${saturation}% 45%)`,
    backdrop: `hsl(${hue} ${Math.max(42, saturation - 12)}% 27%)`,
    shadow: `hsl(${hue} 34% 11%)`,
  };
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;

  if (max === min) {
    return [0, 0, lightness];
  }

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue;

  if (max === rn) {
    hue = (gn - bn) / delta + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    hue = (bn - rn) / delta + 2;
  } else {
    hue = (rn - gn) / delta + 4;
  }

  return [hue * 60, saturation, lightness];
}

function hslPalette(hue, saturation, lightness) {
  const sat = Math.round(Math.max(34, Math.min(78, saturation * 100)));
  const light = Math.round(Math.max(34, Math.min(54, lightness * 100)));
  const backdropLight = Math.max(18, light - 18);

  return {
    accent: `hsl(${Math.round(hue)} ${sat}% ${light}%)`,
    backdrop: `hsl(${Math.round(hue)} ${Math.max(32, sat - 12)}% ${backdropLight}%)`,
    shadow: `hsl(${Math.round(hue)} 34% 10%)`,
  };
}

function derivePaletteFromImage(src, fallbackPalette) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(fallbackPalette);
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0, size, size);
        const pixels = context.getImageData(0, 0, size, size).data;
        let x = 0;
        let y = 0;
        let weightTotal = 0;
        let saturationTotal = 0;
        let lightnessTotal = 0;

        for (let i = 0; i < pixels.length; i += 16) {
          const alpha = pixels[i + 3] / 255;
          if (alpha < 0.6) continue;

          const [hue, saturation, lightness] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
          if (lightness < 0.16 || lightness > 0.86) continue;

          const weight = alpha * (0.22 + saturation) * (1 - Math.abs(lightness - 0.48));
          const radians = (hue * Math.PI) / 180;
          x += Math.cos(radians) * weight;
          y += Math.sin(radians) * weight;
          saturationTotal += saturation * weight;
          lightnessTotal += lightness * weight;
          weightTotal += weight;
        }

        if (!weightTotal) {
          resolve(fallbackPalette);
          return;
        }

        const hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        resolve(hslPalette(hue, saturationTotal / weightTotal, lightnessTotal / weightTotal));
      } catch {
        resolve(fallbackPalette);
      }
    };
    image.onerror = () => resolve(fallbackPalette);
    image.src = src;
  });
}

function applyDerivedPalette(palette) {
  [ui.body, ui.playerCard, ui.strip].forEach((node) => {
    node.style.setProperty("--theme-color", palette.accent);
    node.style.setProperty("--photo-tint", palette.accent);
    node.style.setProperty("--backdrop-color", palette.backdrop);
    node.style.setProperty("--backdrop-shadow", palette.shadow);
  });
  ui.itemBackdrop.style.setProperty("--theme-color", palette.accent);
  ui.itemBackdrop.style.setProperty("--backdrop-color", palette.backdrop);
  ui.itemBackdrop.style.setProperty("--backdrop-shadow", palette.shadow);
}

function setBackdropImage(src, title) {
  ui.itemBackdrop.dataset.fallbackLabel = title || "";
  ui.itemBackdrop.classList.toggle("has-image", Boolean(src));
  if (src) {
    ui.itemBackdrop.style.backgroundImage = `url("${src.replace(/"/g, '\\"')}")`;
  } else {
    ui.itemBackdrop.style.removeProperty("background-image");
  }
}

function descriptionForStop(stop) {
  return descriptionOverrides[stop.id] || stop.description;
}

function currentStop() {
  return state.stops[state.index] || null;
}

function setBackdropNote(stop) {
  ui.backdropNoteTitle.textContent = stop.title;
  ui.backdropNoteMeta.textContent = `${stop.theme} - ${stop.zoneLabel} - ${stop.timeOfDay}`;
  ui.backdropNoteBody.textContent = descriptionForStop(stop);
}

function setBackdropPrint(stop, src) {
  const expectedId = stop.id;
  const caption = `${stop.title} - ${stop.theme} - ${stop.timeOfDay}`;

  ui.backdropPrintCaption.textContent = caption;
  ui.backdropPrintPhoto.alt = "";
  ui.backdropDeck.classList.remove("has-print");

  if (!src) {
    ui.backdropPrintPhoto.removeAttribute("src");
    return;
  }

  preloadImage(src).then((loaded) => {
    const selected = state.stops[state.index];
    if (!selected || selected.id !== expectedId) return;

    if (loaded) {
      ui.backdropPrintPhoto.src = loaded;
      ui.backdropDeck.classList.add("has-print");
    } else {
      ui.backdropPrintPhoto.removeAttribute("src");
      ui.backdropDeck.classList.remove("has-print");
    }
  });
}

function shareUrlForStop(stop) {
  const url = new URL(window.location.href);
  url.hash = stop.id;
  return url.toString();
}

function shareTextForStop(stop) {
  return `Yellowstone Sound Atlas: ${stop.title} - ${stop.theme}, ${stop.timeOfDay}.`;
}

function sharePayloadForStop(stop) {
  return {
    title: `${stop.title} - Yellowstone Sound Atlas`,
    text: shareTextForStop(stop),
    url: shareUrlForStop(stop),
  };
}

function xIntentForStop(stop) {
  const intent = new URL("https://twitter.com/intent/tweet");
  intent.searchParams.set("text", shareTextForStop(stop));
  intent.searchParams.set("url", shareUrlForStop(stop));
  intent.searchParams.set("hashtags", "Yellowstone,Soundscape");
  return intent.toString();
}

function updateShareTargets(stop) {
  ui.shareX.href = xIntentForStop(stop);
}

function confirmShareButton(button) {
  button.classList.add("is-confirming");
  clearTimeout(confirmShareButton._timer);
  confirmShareButton._timer = setTimeout(() => {
    button.classList.remove("is-confirming");
  }, 850);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea path for stricter browser permissions.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command failed.");
}

async function copyShareLink(message = "Specimen link copied.") {
  const stop = currentStop();
  if (!stop) return;

  try {
    await copyText(shareUrlForStop(stop));
    confirmShareButton(ui.shareCopy);
    showStatus(message);
  } catch {
    showStatus("Copy unavailable in this browser.", true);
  }
}

async function shareToInstalledApps() {
  const stop = currentStop();
  if (!stop) return;

  const payload = sharePayloadForStop(stop);
  if (!navigator.share) {
    await copyShareLink("Link copied for Instagram.");
    return;
  }

  try {
    await navigator.share(payload);
    confirmShareButton(ui.shareInstagram);
  } catch (err) {
    if (!err || err.name !== "AbortError") {
      await copyShareLink("Share unavailable. Link copied.");
    }
  }
}

function syncLocationHash(stop) {
  if (!window.history || typeof window.history.replaceState !== "function") return;

  const url = new URL(window.location.href);
  if (url.hash === `#${stop.id}`) return;

  url.hash = stop.id;
  window.history.replaceState(null, "", url);
}

function initialStopIndex(stops) {
  const requestedId = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!requestedId) return 0;

  const index = stops.findIndex((stop) => stop.id === requestedId);
  return index >= 0 ? index : 0;
}

function updateAtmosphere(stop) {
  const fallbackPalette = semanticPaletteForStop(stop);
  const imageSrc = stop.imagePath ? encodeURI(`../${stop.imagePath}`) : "";
  const expectedId = stop.id;

  applyDerivedPalette(fallbackPalette);
  setBackdropImage(imageSrc, stop.title);
  setBackdropNote(stop);
  setBackdropPrint(stop, imageSrc);

  derivePaletteFromImage(imageSrc, fallbackPalette).then((palette) => {
    const selected = state.stops[state.index];
    if (!selected || selected.id !== expectedId) return;
    applyDerivedPalette(palette);
  });
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

function activePlaybackTheme() {
  const stop = currentStop();
  if (stop && stop.theme !== state.activeTheme) return stop.theme;
  return state.activeTheme;
}

function activePlaybackStops() {
  return themeStops(activePlaybackTheme());
}

function activePlaybackPosition() {
  return activePlaybackStops().findIndex((stop) => stop.index === state.index);
}

function adjacentPlaybackStopIndex(direction) {
  const stops = activePlaybackStops();
  const position = activePlaybackPosition();
  if (position < 0) return null;

  const adjacent = stops[position + direction];
  return adjacent ? adjacent.index : null;
}

function selectAdjacentStop(direction, autoPlay) {
  const index = adjacentPlaybackStopIndex(direction);
  if (index === null) return false;

  state.activeTheme = activePlaybackTheme();
  selectStop(index, autoPlay, { keepActiveTheme: true });
  return true;
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

function closeArchiveSlip() {
  if (ui.archiveSlip.open) ui.archiveSlip.open = false;
}

function syncArchiveSlipState() {
  ui.archiveSlipSummary.setAttribute("aria-expanded", String(ui.archiveSlip.open));
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

function setPhoto(img, frame, imagePath, title) {
  const expectedPath = imagePath || "";
  const matchesSelectedStop = () => {
    const selected = state.stops[state.index];
    return selected && selected.title === title && (selected.imagePath || "") === expectedPath;
  };

  img.alt = title || "";
  frame.dataset.fallbackLabel = title || "Sound specimen";
  img.classList.remove("is-loaded");

  if (!imagePath) {
    if (matchesSelectedStop()) {
      img.removeAttribute("src");
      img.alt = "";
      img.classList.add("is-fallback");
      frame.classList.add("has-fallback");
    }
    return;
  }

  img.classList.remove("is-fallback");
  frame.classList.remove("has-fallback");
  const src = encodeURI(`../${imagePath}`);
  preloadImage(src).then((loaded) => {
    if (!matchesSelectedStop()) return;

    if (loaded) {
      img.src = loaded;
      img.classList.remove("is-fallback");
      img.classList.add("is-loaded");
      frame.classList.remove("has-fallback");
    } else {
      img.removeAttribute("src");
      img.alt = "";
      img.classList.remove("is-loaded");
      img.classList.add("is-fallback");
      frame.classList.add("has-fallback");
    }
  });
}

function updateScenePhoto(stop) {
  setPhoto(ui.scenePhoto, ui.sceneFrame, stop.imagePath, stop.title);
  setPhoto(ui.miniScenePhoto, ui.miniFrame, stop.imagePath, stop.title);
}

function creditForStop(stop) {
  if (stop.imagePath) return stop.credit;
  return stop.credit.replace("Audio and image", "Audio");
}

function applyMinimized(nextValue) {
  state.isMinimized = Boolean(nextValue);
  ui.playerCard.classList.toggle("is-minimized", state.isMinimized);
  ui.body.classList.toggle("player-is-minimized", state.isMinimized);
  ui.backdropNote.setAttribute("aria-hidden", String(!state.isMinimized));
  ui.shareInstagram.tabIndex = state.isMinimized ? 0 : -1;
  ui.shareX.tabIndex = state.isMinimized ? 0 : -1;
  ui.shareCopy.tabIndex = state.isMinimized ? 0 : -1;
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

  if (isReducedMotion() || typeof document.startViewTransition !== "function") {
    applyMinimized(nextState);
    return;
  }

  document.startViewTransition(() => applyMinimized(nextState));
}

function toggleMinimize() {
  setMinimized(!state.isMinimized);
}

function resetProgress() {
  ui.timeCurrent.textContent = "0:00";
  ui.timeTotal.textContent = "0:00";
  setProgressVisual(0);
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
  ui.desc.textContent = descriptionForStop(stop);
  ui.credit.textContent = creditForStop(stop);
  updateShareTargets(stop);
  syncLocationHash(stop);

  updateAtmosphere(stop);
  ui.audio.src = encodeURI(`../${stop.audioPath}`);
  setPlayDisabled(false);
  resetProgress();
  buildWaveform(stop.id.length + index);
  updateWaveform(0);
  updateScenePhoto(stop);

  if (!autoPlay) {
    state.isPlaying = false;
    updatePlayIcon();
  } else {
    ui.audio.play().catch(() => {
      updatePlayIcon();
      showStatus("Playback could not start automatically.");
    });
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
  const stops = activePlaybackStops();
  const position = activePlaybackPosition();
  ui.prev.disabled = position <= 0;
  ui.next.disabled = position < 0 || position >= stops.length - 1;
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

function setProgressVisual(ratio) {
  const normalized = Math.max(0, Math.min(1, ratio || 0));
  const trackWidth = ui.track.getBoundingClientRect().width || 0;
  ui.track.style.setProperty("--progress-ratio", normalized.toFixed(4));
  ui.track.style.setProperty("--progress-x", `${normalized * trackWidth}px`);
}

function paintProgressFromAudio() {
  if (!ui.audio.duration) return;
  const ratio = Math.max(0, Math.min(1, ui.audio.currentTime / ui.audio.duration));
  const pct = ratio * 100;
  setProgressVisual(ratio);
  ui.track.setAttribute("aria-valuenow", Math.round(pct));
  ui.timeCurrent.textContent = fmtTime(ui.audio.currentTime);
  updateWaveform(pct);
}

function tickProgress() {
  progressFrame = 0;
  if (ui.audio.paused || ui.audio.ended) return;
  if (!state.isDragging) paintProgressFromAudio();
  progressFrame = requestAnimationFrame(tickProgress);
}

function startProgressAnimation() {
  if (progressFrame) return;
  progressFrame = requestAnimationFrame(tickProgress);
}

function stopProgressAnimation() {
  if (!progressFrame) return;
  cancelAnimationFrame(progressFrame);
  progressFrame = 0;
}

function onTimeUpdate() {
  if (state.isDragging) return;
  paintProgressFromAudio();
}

function onLoadedMeta() {
  setPlayDisabled(false);
  ui.timeTotal.textContent = fmtTime(ui.audio.duration || 0);
}

function onEnded() {
  stopProgressAnimation();
  if (!selectAdjacentStop(1, true)) {
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
ui.shareInstagram.addEventListener("click", () => {
  shareToInstalledApps();
});
ui.shareX.addEventListener("click", () => {
  confirmShareButton(ui.shareX);
});
ui.shareCopy.addEventListener("click", () => {
  copyShareLink();
});
ui.archiveSlip.addEventListener("toggle", syncArchiveSlipState);
syncArchiveSlipState();
ui.prev.addEventListener("click", () => selectAdjacentStop(-1, !ui.audio.paused));
ui.next.addEventListener("click", () => selectAdjacentStop(1, !ui.audio.paused));
ui.minimizeBtn.addEventListener("click", toggleMinimize);

ui.audio.addEventListener("play", () => {
  updatePlayIcon();
  startProgressAnimation();
});
ui.audio.addEventListener("pause", () => {
  updatePlayIcon();
  stopProgressAnimation();
});
ui.audio.addEventListener("timeupdate", onTimeUpdate);
ui.audio.addEventListener("loadedmetadata", onLoadedMeta);
ui.audio.addEventListener("ended", onEnded);
ui.audio.addEventListener("error", () => {
  ui.audio.pause();
  stopProgressAnimation();
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

  if (e.code === "Escape" && ui.archiveSlip.open) {
    e.preventDefault();
    closeArchiveSlip();
    ui.archiveSlipSummary.focus();
  } else if (e.code === "Space") {
    if (isSpaceShortcutTarget(e.target)) return;
    e.preventDefault();
    togglePlay();
    showKeyboardHints();
  } else if (e.code === "ArrowLeft" && e.altKey) {
    e.preventDefault();
    selectAdjacentStop(-1, !ui.audio.paused);
    showKeyboardHints();
  } else if (e.code === "ArrowRight" && e.altKey) {
    e.preventDefault();
    selectAdjacentStop(1, !ui.audio.paused);
    showKeyboardHints();
  } else if (e.code === "KeyM") {
    e.preventDefault();
    toggleMinimize();
  }
});

document.addEventListener("click", (e) => {
  if (!(e.target instanceof Node)) return;
  if (ui.archiveSlip.open && !ui.archiveSlip.contains(e.target)) closeArchiveSlip();
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
    const startingIndex = initialStopIndex(stops);
    state.activeTheme = stops[startingIndex].theme;
    applyTheme(state.activeTheme);
    buildThemeTabs();
    buildChipCarousel();
    setMinimized(false);
    selectStop(startingIndex);
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
