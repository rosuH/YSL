# Theme-First Yellowstone Sound Atlas Redesign

## Context

The current atlas is a functional static page with a hero, route map, current stop panel, native audio player, and stop-card list. It validates the curated `atlas/dawn-to-night.json` route and loads audio/image assets from the existing Yellowstone sound library.

The new direction intentionally rejects the previous layout and the earlier external design-reference folder. The design system must come from the project theme itself: Yellowstone sound, terrain, water, thermal movement, wildlife activity, and the day moving from dawn to night. Technology is not the visual skeleton. It is a restrained delight layer that appears as signal traces, sonogram threads, listening ripples, and subtle state feedback.

## Design Thesis

Yellowstone is the interface.

The page should feel like listening across a living landscape, not browsing a route database. The core structure is an A+C hybrid:

- **Topographic drift** provides the first-screen and primary interaction surface.
- **Animal hours** provides the route structure and chapter model.
- **Technology flavor** appears only as a quiet enhancement, never as a dashboard, futuristic shell, or generic AI aesthetic.

## Goals

- Fully replace the current `map panel + stop panel + cards` layout.
- Build a theme-born design system rooted in Yellowstone materials and sound behavior.
- Make the route feel like a habitat clock across dawn, morning, midday, afternoon, late afternoon, dusk, and night.
- Keep audio central while preserving the native audio element for accessibility and reliability.
- Preserve the existing route JSON contract and media assets where practical.
- Keep the first implementation vanilla HTML/CSS/JavaScript.

## Non-Goals

- Do not use `/Users/rosu/Downloads/design_references` as a visual source.
- Do not create a generic technology dashboard, SaaS layout, or AI glassmorphism interface.
- Do not keep the existing two-column atlas grid as the organizing layout.
- Do not introduce a frontend framework for this redesign.
- Do not research or claim exact GIS coordinates in this phase.

## Visual System

### Theme Tokens

The system should define new CSS custom properties around Yellowstone material roles:

- `--soil`: deep brown/black for text and night contrast.
- `--lichen`: muted green for living terrain and selected natural states.
- `--mineral`: warm cream for page and field-note surfaces.
- `--steam`: pale translucent highlight for thermal and mist layers.
- `--lake`: blue-green accent for water and signal traces.
- `--clay`: warm rust for thermal or alert accents.
- `--dusk`: dark green/charcoal for evening sections.
- `--paper`: aged off-white for readable panels.

Technology flavor should use derived signal variables, not a separate futuristic palette:

- `--signal`: a restrained lake/blue-green line.
- `--signal-soft`: a low-opacity signal trace.
- `--ripple`: translucent active-state ring.

### Typography

Use a readable system stack with a serif display face fallback for large editorial moments. The typographic hierarchy should feel field-guide/editorial, not product dashboard:

- Display: large serif for the main landscape statement.
- Section headings: serif or semibold sans depending on scale.
- Interface labels: compact sans with moderate weight.
- Data-like details, such as stop count or source note, may use tabular numeric styling.

### Surfaces

Avoid generic cards as the core language. Use surfaces that feel like landscape layers:

- Full-bleed terrain hero.
- Field-note panels for detail and credits.
- Habitat-hour tokens for route chapters.
- Embedded listening station for the audio player.
- Thin contour and signal lines instead of heavy borders.

## Information Architecture

The page becomes four major regions:

1. **Terrain Hero**
   - Full-width first viewport.
   - Background uses selected stop imagery when available.
   - Overlaid topographic contour system represents the route and selected stop.
   - Main copy introduces the current chapter and selected sound.
   - The player is embedded as a listening station, not separated into a generic control block.

2. **Habitat Clock**
   - Replaces the old route-card list.
   - Displays the seven stops as time-based habitat hours.
   - Each chapter is a selectable token with time, sound title, theme, and short note.
   - The active chapter updates hero image, title, metadata, player source, source note, and terrain state.

3. **Field Notes**
   - Replaces the old current-stop detail panel.
   - Shows description, zone label, credit, and a small source/specimen treatment.
   - Can include a subtle technology-flavor detail such as a generated sonogram thread or signal ticks.

4. **Source Footer**
   - Keeps National Park Service/source credit visible.
   - Provides a stable place for fallback/error messaging if route data or media fails.

## Components

### Terrain Hero

The hero is the visual anchor. It should contain:

- Brand/title treatment: `Yellowstone Sound Atlas`.
- Current chapter label, such as `Late afternoon · Water`.
- Large selected-stop title.
- One sentence of contextual copy.
- Terrain contours rendered with CSS/SVG-like divs or pseudo-elements.
- Active signal dot for the selected stop.
- Listening station with previous, native audio, next, and status.

The terrain should not be a literal map. It is a sound-landscape surface.

### Habitat Clock

The route list becomes a horizontal habitat clock:

- Seven selectable time chapters.
- Variable-height stems or organic tokens to avoid identical cards.
- Active chapter gets a natural selected state, such as lichen fill, ripple ring, or brighter mineral surface.
- On desktop, it can run horizontally below the hero.
- On mobile, it becomes a horizontal scroll strip beneath the player.

### Listening Station

The player should feel embedded in the landscape:

- Native audio remains present.
- Previous/next buttons are compact and clear.
- Audio error state disables playback and shows direct copy.
- Optional CSS-only signal trace can animate when a stop is selected, without pretending to be real waveform data.

### Field Note Panel

The detail area uses a field-note metaphor:

- Description.
- Zone label.
- Credit/source.
- Optional stop image thumbnail or text fallback.
- No modal for basic details.

### Technology Delight

Technology is a flavor, not the structural style. Use only small touches:

- Hover over a habitat hour reveals a thin sonogram-like thread.
- Selecting or playing a stop sends a soft ripple through the terrain surface.
- Listened-to stops can receive a small mineral mark in a later phase.
- Night chapters can slightly darken the terrain and make signal dots feel more star-like.

These effects must not block playback or reduce readability.

## Data Flow

The existing route-loading model can remain:

1. `app.js` fetches `dawn-to-night.json`.
2. Route data is validated in JS before rendering.
3. The first stop becomes the default selected stop.
4. Rendering creates:
   - terrain hero state,
   - habitat clock tokens,
   - listening station,
   - field note content,
   - footer/source status.
5. Selecting a habitat hour, contour signal, previous, or next updates `selectedIndex`.
6. Updating `selectedIndex` refreshes the hero, active state, field notes, and the single audio source.

## Error Handling

- If route JSON fails to load, show a stable source/footer error and keep the layout from collapsing.
- If a stop image is missing, use a theme-colored terrain fallback with the stop title.
- If audio fails, disable playback for that stop, keep previous/next usable, and show `Audio unavailable for this stop.`
- If route data is malformed, avoid rendering partial broken controls.
- Focus states must remain visible on all custom buttons and selectable habitat tokens.

## Responsive Behavior

Desktop:

- Full-bleed terrain hero with listening station and selected-stop copy.
- Habitat clock below hero, horizontally arranged.
- Field notes below or beside the lower content depending on available width.

Tablet:

- Hero remains dominant, but player and field notes stack.
- Habitat clock becomes horizontally scrollable.

Mobile:

- Hero becomes compact but still image/terrain-led.
- Player appears immediately after selected title.
- Habitat clock is a touch-friendly horizontal strip.
- Field notes follow in a single column.
- No text or controls may overlap at 360px width.

## Implementation Scope

Expected product files:

- `atlas/index.html`: rewrite page structure around terrain hero, habitat clock, listening station, field notes, source footer.
- `atlas/styles.css`: replace the current design system and layout with theme-first tokens and components.
- `atlas/app.js`: rewrite render functions around the new DOM structure while preserving route loading and selected-stop state.
- `tests/test_atlas_static.py`: update static anchors to match the new required regions.

Route data can remain in `atlas/dawn-to-night.json` unless implementation needs optional presentation fields. If presentation fields are added later, they should be optional and covered by tests.

## Validation

Automated checks:

- Existing route-data tests must continue to pass.
- Static tests must verify the new required regions:
  - terrain hero,
  - habitat clock,
  - listening station/audio player,
  - field notes,
  - source/status area.

Browser acceptance:

- The first stop is selected by default.
- Previous/next and habitat-hour selection update the same selected state.
- Audio source updates correctly for every stop.
- Credit/source text remains visible.
- Missing image fallback preserves layout.
- Desktop and mobile layouts have no overlapping text or controls.
- Keyboard focus is visible for all interactive elements.

## Phase 1 Decisions

- Terrain contours ship as CSS/pseudo-element geometry, not inline SVG.
- Listened-to mineral marks remain a Phase 2 enhancement.
- Hover sonogram threads ship as static CSS decorative traces, not generated audio analysis.
- The implementation will not add new route-data fields unless required by responsive layout or accessibility copy.
