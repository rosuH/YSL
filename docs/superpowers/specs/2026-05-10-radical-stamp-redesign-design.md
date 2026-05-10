# Radical Stamp Redesign — Yellowstone Sound Atlas

**Date**: 2026-05-10
**Branch**: `radical-geomorphic-atlas-redesign`
**Status**: Design, awaiting plan

## Problem

The current player has three problems traceable to the same root: it's organized like a generic streaming app instead of a curated specimen collection.

1. **Minimized state is a smaller card-on-card.** Violates "no card stacking" anti-principle. Doesn't honor "UI as backdrop".
2. **Animation jumps.** Position context switches from `relative` (centered grid item) to `fixed` (corner) — uninterpolatable. Even with View Transitions API, the source/target shapes share no visual language.
3. **Bottom strip's category interaction is weak.** Vertical-text labels separated only by hairlines. No way to jump between time-of-day groups. 60+ chips force horizontal scroll across the whole route.

There is also a **data honesty problem** uncovered during brainstorming: the `timeOfDay` field that the entire "Dawn to Night" route is built on is editorial, not real. The Yellowstone NPS source recordings are not timestamped. Building a "day arc" visualization on invented time data violates the "地质诚实" brand principle.

## Reframing

The real, source-faithful classification axis in the data is `theme`:

| Theme    | Count | Notes                                   |
|----------|------:|-----------------------------------------|
| Thermal  |    24 | Geysers, fumaroles, mud pots, springs   |
| Birds    |    21 | All species recordings                  |
| Wildlife |    10 | Mammals, frogs, toads                   |
| Human    |     2 | Snowmobile, horse-drawn wagon           |
| Weather  |     2 | Thunder, fire                           |
| Ambient  |     1 | Park-wide soundscape                    |
| Water    |     1 | Yellowstone Lake singing                |

Three meaningful clusters (Thermal / Birds / Wildlife = 55 of 61) plus four edge cases. This matches what the park is actually known for: geothermal features and wildlife. `timeOfDay` and `zoneLabel` remain on each stop as **secondary metadata** (small captions), not as primary axes.

The product framing changes from "a journey from Dawn to Night" to "a specimen collection from Yellowstone". The route name in code remains `dawn-to-night.json` for now (rename is a separate task).

## Design

### Visual language: postage stamps

The whole product becomes a collection of **scientific specimen postage stamps**. One large stamp is the active player; many small mini-stamps are the navigation chips; the minimized state is a small stamp in the corner.

Three sizes of the same shape. Same paper, same perforations, same typography.

**Paper & perforations.** Bone-white background (`oklch(94% 0.03 88)`). Edge-only perforations via four CSS mask layers composited with `mask-composite: intersect` — each layer punches half-circles only along one edge. Hole radius is animatable via `@property --hole`, allowing perforations to fade in/out continuously during morphs.

**Typography.**
- `'Iowan Old Style', Charter, Georgia, serif` — common name (italic when active)
- `ui-monospace, JetBrains Mono, Menlo, monospace` — codes, dates, labels (uppercase, letter-spacing 0.08-0.12em)
- All text is **dark on bone** (`oklch(15% 0.034 92)` for primary, `oklch(28% 0.05 80)` for caps), reversed from current dark-mode card

### Component A — Big stamp (expanded player)

Replaces the current dark-glass `.player-card`.

**Dimensions:** `min(560px, 92vw)` wide, height fits content (~640px max), centered in stage above the strip.

**Structure (top to bottom):**
1. Top rule, mono caps: `YELLOWSTONE · 03` ··· `VOL 61`
2. Photo with thin black scientific frame (1px `oklch(28% 0.05 80 / 0.65)`)
3. Caption block: serif italic title, mono uppercase secondary line `BIRDS · WETLAND MARGIN · DAWN`
4. Description paragraph (existing copy, dark text on bone)
5. Waveform — drawn as ink hairlines on paper (no glow); played portion goes solid black, unplayed is 25% gray
6. Controls row: prev / play / next as bone buttons with thin black border; play is a black-filled circle with bone triangle; the controls sit *outside* the stamp's perforated frame (aesthetically: like control marks below a museum specimen card)
7. Progress bar: 1px hairline; played portion solid black; thumb is a 10px black diamond
8. Bottom rule with credit + small minimize chevron at right

**Minimize trigger:** chevron at top-right (current button repurposed). Same `id="minimize-btn"` for backward compat.

### Component B — Mini stamp (minimized state)

The current `.is-minimized` design (rounded smaller dark card) is removed entirely.

**Dimensions:** 116×144 (desktop), scales to 96×120 on `(max-width: 560px)`.

**Position:** `fixed; right: 18px; bottom: calc(strip-height + 16px);` — anchored to bottom-right of viewport, above the bottom strip.

**Structure (top to bottom):**
1. Top rule (same as big): `YELLOWSTONE · 03` ··· `VOL 61` (mono ~0.42rem)
2. Photo with thin frame; in the photo's bottom-left corner, a 22px circular play badge (dark fill, bone triangle, click toggles play/pause)
3. Caption: serif title (~0.62rem) + mono caps secondary line (`THEME · TIME-OF-DAY`)

**Interactions:**
- Click anywhere on stamp body → expand (full morph)
- Click play badge → play/pause without expanding
- Hover/focus → no controls reveal (clean default; per **D1** decision)
- Skip prev/next while minimized: only via keyboard (`⌥+→` / `⌥+←`, already wired) or by expanding first

### Component C — Bottom strip (category navigation)

Two-tier: theme tabs on top, mini-stamp chips below.

**Theme tabs row:**
- 7 themes ordered by count desc: Thermal · Birds · Wildlife · Human · Weather · Ambient · Water
- Each tab has a 8×8 colored swatch + theme name + count (mono ~0.5rem)
- Inactive tabs: mono caps, 50% bone color
- Active tab: serif italic, full bone, theme color underline (2px), swatch with subtle shadow
- Theme color tokens (geological palette):

  | Token        | Value                          |
  |--------------|--------------------------------|
  | `--t-thermal`  | `oklch(58% 0.12 48)` — hot clay |
  | `--t-birds`    | `oklch(56% 0.10 130)` — moss     |
  | `--t-wildlife` | `oklch(48% 0.07 70)` — bark      |
  | `--t-human`    | `oklch(46% 0.04 80)` — gray-warm |
  | `--t-weather`  | `oklch(54% 0.08 240)` — sky-water|
  | `--t-ambient`  | `oklch(60% 0.04 95)` — mineral   |
  | `--t-water`    | `oklch(54% 0.10 200)` — lake     |

**Chip carousel:**
- Shows only chips for currently active theme (M1-style filter)
- Each chip is a 78×100 mini-stamp (same perforation tech, smaller `--r: 1.8px, --s: 6px`)
- Top: photo (cover, frame 0.5px); bottom: serif title + mono caps `INDEX · TIME-OF-DAY`
- Inactive chip: photo `filter: grayscale(0.5) brightness(0.85)`
- Active chip: full color, `transform: translateY(-3px)`, `box-shadow` outer ring in theme color
- Switching themes fades chip row out and back in (~250ms)

**What is not here (intentional):**
- No day-arc visualization
- No fake clock-time labels
- No continuous chip scroll across themes (use tabs to switch — keeps each view clean)

### Component D — Morph animation

The minimize/expand transition between Big stamp and Mini stamp.

**Approach:** Use the View Transitions API to handle the FLIP (size + position) interpolation, with custom keyframes on the pseudo-elements for content cross-fade and squash. Both states share visual language (paper, perforations, photo frame, serif title), so the morph is a continuous size + content-density change rather than an aesthetic switch.

**Timing:** Total 720ms. Single curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutQuint).

**What animates continuously (no discontinuities):**
- Width / height
- Top / left (anchored from bottom-right when minimized; centered when expanded)
- `border-radius` via `@property --br` (16 → 2)
- Perforation hole radius via `@property --hole` (0 → 1.6 / desktop, 0 → 1.2 / mobile mini)
- Background color (bone tone is consistent — no glass-to-paper jump)
- Border color
- Subtle squash via `transform: scale(x, y)` — max 2.5% deformation at impact, max 1% at overshoot

**Content cross-fade (synced to shape, same timing function):**
- Old content (whichever was visible): opacity 1 → 0, blur 0 → 8px, scale 1 → 0.55
- New content: opacity 0 → 1, blur 8px → 0, scale 0.5 → 1
- Both during the same 720ms window, blurring peaks at midpoint

**Reduced motion:** when `prefers-reduced-motion: reduce`, skip the View Transition entirely; class toggle is instantaneous.

**Implementation notes:**
- The View Transitions API is supported in all browsers Claude is targeting (Chrome 111+, Safari 18+, Firefox 142+). Fallback for older browsers: instantaneous toggle.
- Use `@property` to make `--hole` and `--br` interpolatable in keyframes (Chrome/Safari ✓; Firefox 128+ ✓).
- Set `view-transition-name` on a single wrapper that contains both old and new content; let the API snapshot.
- Override `::view-transition-group(player)`, `::view-transition-old(player)`, `::view-transition-new(player)` in CSS for timing/easing/blur/scale.

## Out of scope for this spec

- **Latin names** (`Fulica americana`, etc.) — would enrich captions but require a new data field. Tracked as a follow-up task.
- **Renaming the route file** from `dawn-to-night.json`. Behavior change has user-facing implications; deferred.
- **Search / filter beyond theme tabs.** Not needed for 61 stops.
- **Multiple routes / playlists.** Only one route exists today.
- **Audio waveform analysis.** Existing pseudo-random bar pattern is kept (it's decorative, not data-derived).

## Migration / breaking changes

This is a near-total rewrite of `atlas/css/main.css` and significant changes to `atlas/js/app.js`. The HTML structure stays mostly the same (same element IDs for backward compat with JS), but the CSS is replaced and `app.js` gets new state for theme filtering + new minimize/expand behavior.

The `index.html` element IDs preserved: `#minimize-btn`, `#audio-player`, `#play-btn`, `#prev-btn`, `#next-btn`, `#progress-track`, `#progress-fill`, `#progress-thumb`, `#time-current`, `#time-total`, `#waveform`, `#scene-photo`, `#status`, `#track-title`, `#track-meta`, `#track-desc`, `#track-credit`, `#eyebrow`, `#specimen-strip`, `#keyboard-hints`.

## Acceptance criteria

1. Minimized state is a 116×144 bone-paper stamp with perforated edges only (verifiable: zoom screenshot of corner shows half-circle scallops on all 4 sides, no holes in interior).
2. Expanded → minimized morph completes in 700–750ms with single timing function. Mid-flight inspection (~360ms) shows blurry continuous shape, not two discrete elements.
3. `prefers-reduced-motion: reduce` short-circuits the View Transition; layout still updates.
4. Bottom strip shows 7 theme tabs with correct counts (24 / 21 / 10 / 2 / 2 / 1 / 1). Clicking a tab swaps the chip carousel.
5. All 61 stops are reachable: 7 themes × selecting each + scrolling its carousel covers everything.
6. Keyboard `Space` (play/pause), `⌥+→` / `⌥+←` (next/prev), `M` (minimize) all still work — both expanded and minimized states.
7. No regressions in audio: track changes, time updates, ended → next, error handling all intact.
