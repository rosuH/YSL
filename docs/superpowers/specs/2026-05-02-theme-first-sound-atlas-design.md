# Theme-First Yellowstone Sound Atlas Redesign

## Context

The current atlas is a functional static page with a hero, route map, current stop panel, native audio player, and stop-card list. It validates the curated `atlas/dawn-to-night.json` route and loads audio/image assets from the existing Yellowstone sound library.

The new direction intentionally rejects the previous layout and the earlier external design-reference folder. The design system must come from the project theme itself: Yellowstone sound, terrain, water, thermal movement, wildlife activity, and the day moving from dawn to night. Technology is not the visual skeleton. It is a restrained delight layer that appears as signal traces, sonogram threads, listening ripples, and subtle state feedback.

## Design Thesis

Yellowstone is the interface.

The page should feel like listening across a living landscape, not browsing a route database. The core structure is an A+C hybrid pushed into a radical geomorphic component language:

- **Geomorphic rupture** provides the first-screen and primary interaction surface.
- **Strata deck** provides the route structure and chapter model.
- **Specimen fragments** provide detail, credit, and source surfaces.
- **Technology flavor** appears only as a quiet enhancement, never as a dashboard, futuristic shell, or generic AI aesthetic.

## Goals

- Fully replace the current `map panel + stop panel + cards` layout.
- Build a theme-born design system rooted in Yellowstone materials, sound behavior, geological cuts, and habitat time.
- Make the route feel like a habitat-time strata deck across dawn, morning, midday, afternoon, late afternoon, dusk, and night.
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

Avoid generic cards, rectangular panels, and ordinary route lists as the core language. Use surfaces that feel like landscape layers, ruptures, and field specimens:

- Full-bleed rupture hero.
- Fault-line SVG paths for the primary terrain graphic.
- Acoustic fissure line as the active selected-stop trace.
- Listening slab for the audio player.
- Specimen fragment for detail and credits.
- Strata deck pieces for route chapters.
- Fracture, cut, and strata edges instead of generic rectangles.

### Component Geometry

The confirmed visual direction uses a single radical component grammar:

- **Rupture nav:** a narrow vertical navigation rail with chapter labels and a geomorphic sigil.
- **Fault lines:** irregular SVG paths that cross the hero like a geological section.
- **Acoustic fissure:** a stronger signal path that marks the active selected route state.
- **Listening slab:** a clipped, asymmetric audio surface containing title, context, waveform-like trace, native audio slot, previous, and next.
- **Specimen fragment:** a torn/cut field-note surface for description, source, and validation/status copy.
- **Strata deck:** bottom chapter navigation where each stop is a geological layer piece, with variable mass/height and active fracture trace.

Every major component should share this fracture grammar. The UI should not mix this language with conventional cards, pills, or centered SaaS panels.

## Information Architecture

The page becomes five major regions:

1. **Rupture Navigation**
   - Vertical rail on desktop.
   - Contains atlas mark, time chapter labels, and short location/system label.
   - Collapses into a compact top treatment on mobile.

2. **Rupture Hero**
   - Full-width first viewport.
   - Background uses selected stop imagery when available.
   - Overlaid fault-line system represents the route and selected stop.
   - Main copy introduces the current chapter and selected sound.
   - The player is embedded as a listening slab, not separated into a generic control block.

3. **Strata Deck**
   - Replaces the old route-card list.
   - Displays the seven stops as time-based geological/habitat pieces.
   - Each chapter is a selectable stratum with time, sound title, theme, and active trace.
   - The active chapter updates hero image, title, metadata, player source, source note, and terrain state.

4. **Specimen Fragment**
   - Replaces the old current-stop detail panel.
   - Shows description, zone label, credit, and a small source/specimen treatment.
   - Can include a subtle technology-flavor detail such as a generated sonogram thread or signal ticks.

5. **Source Footer**
   - Keeps National Park Service/source credit visible.
   - Provides a stable place for fallback/error messaging if route data or media fails.

## Components

### Rupture Hero

The hero is the visual anchor. It should contain:

- Brand/title treatment: `Yellowstone Sound Atlas`.
- Current chapter label, such as `Late afternoon · Water`.
- Large selected-stop title.
- One sentence of contextual copy.
- Fault lines rendered with inline SVG.
- Active acoustic fissure path for the selected stop.
- Fracture nodes for a small number of route categories or chapter anchors.
- Listening slab with previous, native audio, next, and status.

The terrain should not be a literal map. It is a geological listening surface.

### Strata Deck

The route list becomes a horizontal strata deck:

- Seven selectable time chapters.
- Variable-height geological masses to avoid identical cards.
- Active chapter gets a fracture trace and darker living-terrain state.
- On desktop, it can run horizontally below the hero.
- On mobile, it becomes a horizontal scroll strip beneath the player.

### Listening Slab

The player should feel embedded in a cut piece of terrain:

- Native audio remains present.
- Previous/next buttons are compact and clear.
- Audio error state disables playback and shows direct copy.
- CSS-only waveform lattice can animate when a stop is selected, without pretending to be real waveform data.
- The audio control container uses the same clipped fracture shape as the rest of the component system.

### Specimen Fragment

The detail area uses a field-note metaphor:

- Description.
- Zone label.
- Credit/source.
- Optional stop image thumbnail or text fallback.
- No modal for basic details.
- It should not look like a standard sidebar card.

### Technology Delight

Technology is a flavor, not the structural style. Use only small touches:

- Hover over a strata piece reveals a thin sonogram-like thread.
- Selecting or playing a stop intensifies the acoustic fissure and waveform lattice.
- Listened-to stops can receive a small mineral mark in a later phase.
- Night chapters can slightly darken the terrain and make signal dots feel more star-like.

These effects must not block playback or reduce readability.

## Data Flow

The existing route-loading model can remain:

1. `app.js` fetches `dawn-to-night.json`.
2. Route data is validated in JS before rendering.
3. The first stop becomes the default selected stop.
4. Rendering creates:
   - rupture hero state,
   - strata deck pieces,
   - listening slab,
   - specimen fragment content,
   - footer/source status.
5. Selecting a strata piece, fracture node, previous, or next updates `selectedIndex`.
6. Updating `selectedIndex` refreshes the rupture hero, active state, specimen fragment, and the single audio source.

## Error Handling

- If route JSON fails to load, show a stable source/footer error and keep the layout from collapsing.
- If a stop image is missing, use a theme-colored terrain fallback with the stop title.
- If audio fails, disable playback for that stop, keep previous/next usable, and show `Audio unavailable for this stop.`
- If route data is malformed, avoid rendering partial broken controls.
- Focus states must remain visible on all custom buttons and selectable strata pieces.

## Responsive Behavior

Desktop:

- Vertical rupture navigation rail.
- Full-bleed rupture hero with listening slab and selected-stop copy.
- Strata deck anchored below the hero, horizontally arranged.
- Specimen fragment sits beside or below the rupture hero depending on available width.

Tablet:

- Hero remains dominant, but player and specimen fragment stack.
- Strata deck becomes horizontally scrollable.

Mobile:

- Hero becomes compact but still image/terrain-led.
- Player appears immediately after selected title.
- Strata deck is a touch-friendly horizontal strip.
- Specimen fragment follows in a single column.
- No text or controls may overlap at 360px width.

## Implementation Scope

Expected product files:

- `atlas/index.html`: rewrite page structure around rupture nav, rupture hero, listening slab, strata deck, specimen fragment, source footer.
- `atlas/styles.css`: replace the current design system and layout with theme-first tokens and components.
- `atlas/app.js`: rewrite render functions around the new DOM structure while preserving route loading and selected-stop state.
- `tests/test_atlas_static.py`: update static anchors to match the new required regions.

Route data can remain in `atlas/dawn-to-night.json` unless implementation needs optional presentation fields. If presentation fields are added later, they should be optional and covered by tests.

## Validation

Automated checks:

- Existing route-data tests must continue to pass.
- Static tests must verify the new required regions:
  - rupture nav,
  - rupture hero,
  - listening slab/audio player,
  - strata deck,
  - specimen fragment,
  - source/status area.

Browser acceptance:

- The first stop is selected by default.
- Previous/next and strata-piece selection update the same selected state.
- Audio source updates correctly for every stop.
- Credit/source text remains visible.
- Missing image fallback preserves layout.
- Desktop and mobile layouts have no overlapping text or controls.
- Keyboard focus is visible for all interactive elements.

## Phase 1 Decisions

- Hero fault lines ship as inline SVG paths so the fracture language is controllable and cohesive.
- Listened-to mineral marks remain a Phase 2 enhancement.
- Hover sonogram/fissure threads ship as static CSS/SVG decorative traces, not generated audio analysis.
- The implementation will not add new route-data fields unless required by responsive layout or accessibility copy.
