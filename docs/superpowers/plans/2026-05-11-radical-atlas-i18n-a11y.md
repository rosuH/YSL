# Radical Atlas I18n And Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English, Simplified Chinese, Japanese, and Korean support to the existing radical Yellowstone Sound Atlas without replacing its specimen-stamp visual system.

**Architecture:** Preserve `atlas/index.html`, `atlas/css/main.css`, `atlas/js/app.js`, and the curated 61+ stop data contract. Add `atlas/js/i18n.js` as a small translation layer that localizes UI strings, themes, times, common zones, and generated stop prose at render time, with English data as the source of truth and safe fallback for proper nouns.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript modules, native audio, JSON fetch, `pytest`, BeautifulSoup static checks, and local Playwright browser QA.

---

## File Structure

- Create `atlas/js/i18n.js`: supported locale constants, UI copy, title/theme/time/zone dictionaries, stop localization helpers, URL/localStorage locale helpers.
- Modify `atlas/js/app.js`: import i18n helpers, add `state.locale`, render localized copy, preserve selected stop/theme, and include current locale in share URLs.
- Modify `atlas/index.html`: add an accessible language switcher and stable IDs for static copy that should update by locale.
- Modify `atlas/css/main.css`: style the language switcher to match the stamp UI, with focus-visible, touch-safe sizing, and mobile behavior.
- Modify `tests/test_atlas_static.py`: lock the language switcher, i18n module reference, and CSS accessibility contract.
- Modify `README.md`: document atlas language support and preview workflow.

---

### Task 1: Lock The Correct Radical I18n Contract

**Files:**
- Modify: `tests/test_atlas_static.py`

- [ ] Add a static test requiring `atlas/index.html` to include `#language-switcher`, four buttons with `data-locale` values `en`, `zh`, `ja`, `ko`, and `aria-label="Language"`.
- [ ] Add a static test requiring `atlas/js/app.js` to import `./i18n.js`.
- [ ] Add a static test requiring `atlas/css/main.css` to include `.language-switcher`, `.language-switcher button[aria-pressed="true"]`, and `.language-switcher button:focus-visible`.
- [ ] Run `pytest tests/test_atlas_static.py -v`; expect failure because the radical page has no language switcher yet.

### Task 2: Add The I18n Module

**Files:**
- Create: `atlas/js/i18n.js`

- [ ] Export `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_LABELS`, `normalizeLocale`, `localeFromUrl`, `setStoredLocale`, `uiText`, `localizeStop`, `shareText`, `shareHashtags`, and `localizedCredit`.
- [ ] Keep English as exact source-of-truth copy.
- [ ] Localize themes, times, common zones, major proper names, archive/slip UI, controls, status, and generated field-note prose for Chinese, Japanese, and Korean.
- [ ] Run `node --check atlas/js/i18n.js`; expect pass.

### Task 3: Wire Runtime Locale State

**Files:**
- Modify: `atlas/index.html`
- Modify: `atlas/js/app.js`

- [ ] Add the language switcher to the stamp header without changing the stamp/card hierarchy.
- [ ] Import i18n helpers in `app.js`.
- [ ] Add `state.locale`, derive it from `?lang=` or localStorage, and update `document.documentElement.lang`.
- [ ] Render localized labels in player, mini player, backdrop note, theme tabs, chips, archive slip, share dock, status messages, keyboard hints, and aria labels.
- [ ] Re-render route UI on locale switch without changing selected stop or active theme.
- [ ] Run `pytest tests/test_atlas_static.py -v`; expect pass.

### Task 4: Style Language Controls In The Existing Design

**Files:**
- Modify: `atlas/css/main.css`

- [ ] Style the language switcher as compact stamp controls, not a new card.
- [ ] Ensure every language button is at least 34px high on desktop and 44px high on touch layouts.
- [ ] Add active, hover, active-press, disabled-safe, and focus-visible states.
- [ ] Add mobile layout rules so the switcher does not collide with stamp metadata.

### Task 5: Verify

**Files:**
- Modify: `README.md`

- [ ] Document the four-language atlas in English and Chinese README sections.
- [ ] Run `pytest -v`, `node --check atlas/js/app.js`, `node --check atlas/js/i18n.js`, and `git diff --check`.
- [ ] Run browser QA on `http://127.0.0.1:8000/atlas/`: default English, switch zh/ja/ko, selected stop preserved, theme tabs/chips/player text update, share URL includes `lang`, no console/page errors, no mobile horizontal overflow.
