import {
  LOCALE_LABELS,
  localeFromUrl,
  localizeStop,
  localizeThemeName,
  localizedCredit,
  normalizeLocale,
  setStoredLocale,
  shareHashtags,
  shareText,
  uiText,
} from "./i18n.js";

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
  locale: localeFromUrl(),
  isPlaying: false,
  isDragging: false,
  isMinimized: false,
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
  shareDock: getEl("#share-dock"),
  stage: getEl("#stage"),
  audioControls: getEl("#audio-controls"),
  expandedFace: document.querySelector(".stamp-expanded"),
  miniStamp: getEl("#mini-stamp"),
  miniExpand: getEl("#mini-expand-btn"),
  languageSwitcher: getEl("#language-switcher"),
  languageMenuButton: getEl("#language-menu-button"),
  languageMenu: getEl("#language-menu"),
  languageCurrentLabel: getEl("#language-current-label"),
  eyebrow: getEl("#eyebrow"),
  volumeMark: getEl("#volume-mark"),
  miniVolumeMark: getEl("#mini-volume-mark"),
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
  archiveSlipSummaryText: getEl("#archive-slip-summary-text"),
  archiveSlipKicker: getEl("#archive-slip-kicker"),
  archiveSlipTitle: getEl("#archive-slip-title"),
  archiveSlipBody: getEl("#archive-slip-body"),
  archiveRepositoryLabel: getEl("#archive-repository-label"),
  archiveFullLabel: getEl("#archive-full-label"),
  archiveSourceLabel: getEl("#archive-source-label"),
  archiveSlipFine: getEl("#archive-slip-fine"),
  stampSourceLabel: getEl("#stamp-source-label"),
  stampArchiveLabel: getEl("#stamp-archive-label"),
  keyboardSpaceLabel: getEl("#keyboard-space-label"),
  keyboardPrevLabel: getEl("#keyboard-prev-label"),
  keyboardNextLabel: getEl("#keyboard-next-label"),
  keyboardMinimizeLabel: getEl("#keyboard-minimize-label"),
};

if (!ui.playerCard) throw new Error("Missing element: .player-card");
if (!ui.expandedFace) throw new Error("Missing element: .stamp-expanded");

function getEl(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

function copy() {
  return uiText(state.locale);
}

function displayStop(stop) {
  return localizeStop(stop, state.locale);
}

function languageMenuItems() {
  return Array.from(ui.languageMenu.querySelectorAll("[data-locale]"));
}

function activeLanguageItem() {
  return ui.languageMenu.querySelector(`[data-locale="${state.locale}"]`) || languageMenuItems()[0];
}

function isLanguageMenuOpen() {
  return !ui.languageMenu.hidden;
}

function setLanguageMenuOpen(open, options = {}) {
  ui.languageMenu.hidden = !open;
  ui.languageSwitcher.classList.toggle("is-open", open);
  ui.languageMenuButton.setAttribute("aria-expanded", String(open));

  if (open && options.focusActive) {
    activeLanguageItem()?.focus();
  } else if (!open && options.returnFocus) {
    ui.languageMenuButton.focus();
  }
}

function renderLanguageSwitcher() {
  const text = copy();
  const activeButton = activeLanguageItem();

  ui.languageSwitcher.setAttribute("aria-label", text.language);
  ui.languageMenuButton.setAttribute("aria-label", text.chooseLanguage);
  ui.languageMenuButton.title = text.chooseLanguage;
  ui.languageMenuButton.setAttribute("aria-expanded", String(isLanguageMenuOpen()));
  ui.languageCurrentLabel.textContent =
    activeButton?.querySelector(".language-menu-code")?.textContent?.trim() || state.locale.toUpperCase();
  languageMenuItems().forEach((button) => {
    const locale = normalizeLocale(button.dataset.locale);
    const active = locale === state.locale;
    button.setAttribute("aria-checked", String(active));
    button.setAttribute("aria-label", text.languageOption(LOCALE_LABELS[locale]));
  });
}

function syncLocaleUrl() {
  if (!window.history || typeof window.history.replaceState !== "function") return;

  const url = new URL(window.location.href);
  url.searchParams.set("lang", state.locale);
  window.history.replaceState(null, "", url);
}

function renderStaticCopy() {
  const text = copy();

  document.documentElement.lang = state.locale;
  document.title = text.documentTitle;
  ui.stage.setAttribute("aria-label", text.siteLabel);
  ui.shareDock.setAttribute("aria-label", text.shareDock);
  ui.audioControls.setAttribute("aria-label", text.audioControls);
  ui.volumeMark.textContent = text.volume;
  ui.miniVolumeMark.textContent = text.volume;
  ui.backdropNote.querySelector(".backdrop-note-kicker").textContent = text.fieldNote;
  ui.shareInstagram.setAttribute("aria-label", text.shareInstagram);
  ui.shareInstagram.title = text.shareInstagramTitle;
  ui.shareX.setAttribute("aria-label", text.postToX);
  ui.shareX.title = text.postToXTitle;
  ui.shareCopy.setAttribute("aria-label", text.copyLink);
  ui.shareCopy.title = text.copyLinkTitle;
  ui.prev.setAttribute("aria-label", text.previous);
  ui.next.setAttribute("aria-label", text.next);
  ui.track.setAttribute("aria-label", text.playbackPosition);
  ui.strip.setAttribute("aria-label", text.stripLabel);
  ui.themeTabs.setAttribute("aria-label", text.themeTabs);
  ui.chipCarousel.setAttribute("aria-label", text.themeSpecimens);
  ui.archiveSlipSummary.setAttribute("aria-label", text.archiveSlipSummary);
  ui.archiveSlipSummaryText.textContent = text.archiveSlip;
  ui.archiveSlip.querySelector(".archive-slip-card").setAttribute("aria-label", text.archiveCardLabel);
  ui.archiveSlipKicker.textContent = text.colophon;
  ui.archiveSlipTitle.textContent = text.archiveTitle;
  ui.archiveSlipBody.textContent = text.archiveBody;
  ui.archiveRepositoryLabel.textContent = text.repository;
  ui.archiveFullLabel.textContent = text.fullArchive;
  ui.archiveSourceLabel.textContent = text.sourceLabel;
  ui.archiveSlipFine.textContent = text.archiveFine;
  ui.stampSourceLabel.textContent = text.source;
  ui.stampArchiveLabel.textContent = text.archive;
  ui.keyboardSpaceLabel.textContent = text.keyboardSpace;
  ui.keyboardPrevLabel.textContent = text.keyboardPrev;
  ui.keyboardNextLabel.textContent = text.keyboardNext;
  ui.keyboardMinimizeLabel.textContent = text.keyboardMinimize;
  renderLanguageSwitcher();
  updatePlayIcon();
  applyMinimized(state.isMinimized);
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

function currentStop() {
  return state.stops[state.index] || null;
}

function setBackdropNote(stop) {
  const localized = displayStop(stop);
  ui.backdropNoteTitle.textContent = localized.title;
  ui.backdropNoteMeta.textContent = copy().noteMeta(localized.theme, localized.zoneLabel, localized.timeOfDay);
  ui.backdropNoteBody.textContent = localized.fieldNote || localized.description;
}

function setBackdropPrint(stop, src) {
  const expectedId = stop.id;
  const localized = displayStop(stop);
  const caption = copy().printCaption(localized.title, localized.theme, localized.timeOfDay);

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

function atlasBaseUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  if (url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.replace(/index\.html$/, "");
  } else if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url;
}

function shareUrlForStop(stop) {
  const url = new URL(`share/${encodeURIComponent(stop.id)}/`, atlasBaseUrl());
  url.searchParams.set("lang", state.locale);
  return url.toString();
}

function shareTextForStop(stop) {
  return shareText(stop, state.locale);
}

function sharePayloadForStop(stop) {
  const localized = displayStop(stop);
  return {
    title: copy().shareTitle(localized.title),
    text: shareTextForStop(stop),
    url: shareUrlForStop(stop),
  };
}

function xIntentForStop(stop) {
  const intent = new URL("https://twitter.com/intent/tweet");
  intent.searchParams.set("text", shareTextForStop(stop));
  intent.searchParams.set("url", shareUrlForStop(stop));
  intent.searchParams.set("hashtags", shareHashtags(state.locale));
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

async function copyShareLink(message = copy().copied) {
  const stop = currentStop();
  if (!stop) return;

  try {
    await copyText(shareUrlForStop(stop));
    confirmShareButton(ui.shareCopy);
    showStatus(message);
  } catch {
    showStatus(copy().copyUnavailable, true);
  }
}

async function shareToInstalledApps() {
  const stop = currentStop();
  if (!stop) return;

  const payload = sharePayloadForStop(stop);
  if (!navigator.share) {
    await copyShareLink(copy().instagramCopied);
    return;
  }

  try {
    await navigator.share(payload);
    confirmShareButton(ui.shareInstagram);
  } catch (err) {
    if (!err || err.name !== "AbortError") {
      await copyShareLink(copy().shareUnavailableCopied);
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
  const localized = displayStop(stop);

  applyDerivedPalette(fallbackPalette);
  setBackdropImage(imageSrc, localized.title);
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
    const themeLabel = localizeThemeName(theme, state.locale);
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
    button.setAttribute("aria-label", copy().selectTheme(themeLabel, themeCount(theme)));
    button.addEventListener("click", () => setActiveTheme(theme, true));

    const swatch = document.createElement("span");
    swatch.className = "theme-swatch";
    swatch.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "theme-name";
    name.textContent = themeLabel;

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
    const localized = displayStop(stop);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "specimen-chip stamp-chip";
    chip.dataset.index = String(stop.index);
    chip.style.setProperty("--theme-color", meta.color);
    chip.setAttribute("aria-label", copy().selectStop(localized.title));
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
    label.textContent = `${getStopNumber(stop.index)} - ${localized.timeOfDay}`;

    const title = document.createElement("strong");
    title.textContent = localized.title;

    const theme = document.createElement("span");
    theme.textContent = localized.theme;

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

function updateLocalizedSurface() {
  renderStaticCopy();
  if (!state.stops.length) return;

  buildThemeTabs();
  buildChipCarousel();
  const stop = currentStop();
  if (stop) {
    const imageSrc = stop.imagePath ? encodeURI(`../${stop.imagePath}`) : "";
    const localized = displayStop(stop);
    const stopNumber = getStopNumber(state.index);
    ui.eyebrow.textContent = copy().eyebrow(stopNumber);
    ui.miniEyebrow.textContent = copy().eyebrow(stopNumber);
    ui.title.textContent = localized.title;
    ui.miniTitle.textContent = localized.title;
    ui.meta.textContent = copy().noteMeta(localized.theme, localized.zoneLabel, localized.timeOfDay);
    ui.miniMeta.textContent = `${localized.theme} - ${localized.timeOfDay}`;
    ui.desc.textContent = localized.fieldNote || localized.description;
    ui.credit.textContent = creditForStop(stop);
    setBackdropImage(imageSrc, localized.title);
    setBackdropNote(stop);
    setBackdropPrint(stop, imageSrc);
    updateScenePhoto(stop);
    updateShareTargets(stop);
  }
  updateThemeNav();
}

function setLocale(locale) {
  const nextLocale = normalizeLocale(locale);
  if (nextLocale === state.locale) return;

  state.locale = nextLocale;
  setStoredLocale(nextLocale);
  syncLocaleUrl();
  updateLocalizedSurface();
}

function selectLanguage(locale) {
  setLocale(locale);
  setLanguageMenuOpen(false, { returnFocus: true });
}

function moveLanguageFocus(direction) {
  const items = languageMenuItems();
  if (!items.length) return;

  const currentIndex = items.indexOf(document.activeElement);
  if (currentIndex === -1) {
    activeLanguageItem()?.focus();
    return;
  }

  const nextIndex = (currentIndex + direction + items.length) % items.length;
  items[nextIndex].focus();
}

function onLanguageMenuKeydown(e) {
  const target = e.target instanceof Element ? e.target.closest("[data-locale]") : null;

  if (e.key === "Escape") {
    e.preventDefault();
    setLanguageMenuOpen(false, { returnFocus: true });
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!isLanguageMenuOpen()) {
      setLanguageMenuOpen(true, { focusActive: true });
    } else {
      moveLanguageFocus(1);
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!isLanguageMenuOpen()) {
      setLanguageMenuOpen(true, { focusActive: true });
    } else {
      moveLanguageFocus(-1);
    }
  } else if (e.key === "Home" && isLanguageMenuOpen()) {
    e.preventDefault();
    languageMenuItems()[0]?.focus();
  } else if (e.key === "End" && isLanguageMenuOpen()) {
    e.preventDefault();
    languageMenuItems().at(-1)?.focus();
  } else if ((e.key === "Enter" || e.key === " ") && target) {
    e.preventDefault();
    selectLanguage(target.dataset.locale);
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

function setPhoto(img, frame, imagePath, sourceTitle, displayTitle = sourceTitle) {
  const expectedPath = imagePath || "";
  const matchesSelectedStop = () => {
    const selected = state.stops[state.index];
    return selected && selected.title === sourceTitle && (selected.imagePath || "") === expectedPath;
  };

  img.alt = displayTitle || "";
  frame.dataset.fallbackLabel = displayTitle || copy().routeSpecimen;
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
  const localized = displayStop(stop);
  setPhoto(ui.scenePhoto, ui.sceneFrame, stop.imagePath, stop.title, localized.title);
  setPhoto(ui.miniScenePhoto, ui.miniFrame, stop.imagePath, stop.title, localized.title);
}

function creditForStop(stop) {
  return localizedCredit(stop, state.locale);
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
    state.isMinimized ? copy().expand : copy().minimize,
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
  const localized = displayStop(stop);
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
  ui.eyebrow.textContent = copy().eyebrow(stopNumber);
  ui.miniEyebrow.textContent = copy().eyebrow(stopNumber);
  ui.title.textContent = localized.title;
  ui.miniTitle.textContent = localized.title;
  ui.meta.textContent = copy().noteMeta(localized.theme, localized.zoneLabel, localized.timeOfDay);
  ui.miniMeta.textContent = `${localized.theme} - ${localized.timeOfDay}`;
  ui.desc.textContent = localized.fieldNote || localized.description;
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
      showStatus(copy().autoPlayFailed);
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
  ui.play.setAttribute("aria-label", playing ? copy().pause : copy().play);
  ui.miniPlay.setAttribute("aria-label", playing ? copy().pause : copy().play);
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
ui.languageMenuButton.addEventListener("click", (e) => {
  e.stopPropagation();
  setLanguageMenuOpen(!isLanguageMenuOpen(), { focusActive: !isLanguageMenuOpen() });
});
ui.languageMenu.addEventListener("click", (e) => {
  const button = e.target instanceof Element ? e.target.closest("[data-locale]") : null;
  if (!button) return;
  selectLanguage(button.dataset.locale);
});
ui.languageSwitcher.addEventListener("keydown", onLanguageMenuKeydown);
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
  showStatus(copy().audioUnavailable, true);
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

  if (e.code === "Escape" && isLanguageMenuOpen()) {
    e.preventDefault();
    setLanguageMenuOpen(false, { returnFocus: true });
  } else if (e.code === "Escape" && ui.archiveSlip.open) {
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
  if (isLanguageMenuOpen() && !ui.languageSwitcher.contains(e.target)) setLanguageMenuOpen(false);
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
    showStatus(copy().statusLoaded(stops.length));
  } catch (err) {
    showStatus(err.message, true);
    ui.title.textContent = copy().routeLoadFailed;
    ui.desc.textContent = err.message;
  }
}

syncLocaleUrl();
renderStaticCopy();
applyMinimized(false);
updatePlayIcon();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadRoute);
} else {
  loadRoute();
}
