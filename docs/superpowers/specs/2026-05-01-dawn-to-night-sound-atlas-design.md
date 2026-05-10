# Dawn to Night Sound Atlas Design

## Context

YSL currently collects Yellowstone National Park public-domain sound assets as repository files, with `spider.py` handling crawl/download behavior and tests covering naming and duplicate cleanup. The repository has dozens of MP3 and JPG assets, but the user-facing experience is still mainly a file collection plus README.

The selected direction is a first-version static exhibit called `Yellowstone Sound Atlas: Dawn to Night`. It should turn existing assets into a shareable guided route through a day in Yellowstone, with a stylized route map and a single audio player.

## Goals

- Create a static sound exhibit suitable for GitHub Pages or a local static server.
- Make the first screen feel like a map-based route, not a plain file list.
- Use only existing repository MP3/JPG assets for the first version.
- Keep the data structure simple enough to hand-author now and expand later.
- Avoid changing the crawler or current asset layout during this phase.

## Non-Goals

- No real GIS map or exact coordinate research in Phase 1.
- No full-library search, faceting, or download bundle system.
- No generated manifest for the whole repository.
- No automatic audio feature analysis, waveform generation, or spectrograms.
- No external frontend framework unless implementation proves plain static files insufficient.

## Product Shape

The exhibit is a single static page centered on one guided route: Dawn to Night. The route starts with morning bird and chorus sounds, moves through thermal/geyser and lake or weather ambience, then ends with dusk or night wildlife atmosphere.

The page should present:

- A stylized Yellowstone route graphic with clickable stops.
- A current-stop panel with title, time of day, theme, zone label, image when available, and short description.
- A single audio player with play/pause, previous, next, and progress.
- Stop cards or a compact route list that mirrors the map nodes.
- National Park Service credit/source text for each stop.

The first version should contain 6-8 stops. This is enough to feel like a composed journey while keeping data curation and QA bounded.

## Route Data

Add one hand-authored data file:

`atlas/dawn-to-night.json`

Each stop should include:

- `id`: stable kebab-case identifier.
- `title`: human-readable sound title.
- `timeOfDay`: route chapter label, such as Dawn, Morning, Midday, Dusk, or Night.
- `theme`: broad sound type, such as Birds, Thermal, Water, Weather, or Wildlife.
- `zoneLabel`: approximate place or landscape label. This is descriptive, not a verified coordinate.
- `audioPath`: relative path to an existing MP3 asset.
- `imagePath`: optional relative path to an existing JPG asset.
- `description`: one short sentence explaining why this stop belongs in the route.
- `credit`: credit/source text, expected to reference National Park Service where appropriate.

The route data should not claim exact coordinates. If a later phase adds coordinates, they can be added as optional fields without changing the first-version UI contract.

## Static Site Structure

Add a small static site under `atlas/`:

- `atlas/index.html`: semantic document structure, audio element, route/map containers, and fallback text.
- `atlas/styles.css`: visual design, responsive layout, route map styling, stop cards, and player states.
- `atlas/app.js`: JSON loading, render logic, selected-stop state, audio controls, and error handling.
- `atlas/dawn-to-night.json`: curated route data.

The site should use relative paths so it works from GitHub Pages and from a local static server such as `python -m http.server`. It does not need to support direct `file://` opening because the JSON route data is loaded by browser JavaScript. It should not alter the existing asset folders.

## Components

### Route Map

The map is a stylized route rather than a literal geographic map. It should show the journey as connected nodes with readable labels. Clicking a node selects the corresponding stop.

The visual design should communicate Yellowstone through restrained natural imagery and existing asset photos, not through decorative abstractions alone.

### Current Stop Panel

The panel shows the selected stop's title, chapter, zone label, description, image fallback, and credit. It should remain legible on mobile and desktop.

### Audio Player

The player uses one native `audio` element controlled by custom buttons or native controls plus previous/next route navigation. Changing stops updates the same audio element.

### Route List

The list gives users a non-map way to browse the route. It mirrors the map state and supports keyboard/mouse selection.

## Data Flow

1. `index.html` loads `app.js`.
2. `app.js` fetches `dawn-to-night.json`.
3. The first stop becomes the default selected stop.
4. The app renders map nodes, route cards, current-stop content, and audio source.
5. Selecting a map node, route card, previous, or next updates the selected index.
6. Updating the selected index refreshes visible state and the single audio element source.

## Error Handling

- If the JSON file fails to load, show a visible error message and keep the page stable.
- If a stop has a missing image, use a text/color fallback for the image area.
- If a stop audio file fails to load, disable playback for that stop and show a concise error.
- If the route JSON is empty or malformed, show an error rather than rendering broken controls.

## Validation

Add a focused validation path for route data. The implementation may use either a small test or script, but it must verify:

- Every stop has required fields.
- Every `audioPath` resolves to an existing MP3 file.
- Every non-empty `imagePath` resolves to an existing JPG file.
- Stop IDs are unique.
- The route contains between 6 and 8 stops for the first version.

Browser acceptance criteria:

- Opening the atlas page through GitHub Pages or a local static server selects the first stop by default.
- Play/pause, previous, next, map node clicks, and route card clicks update the same selected stop state.
- Missing image fallback does not break layout.
- The page is usable on mobile and desktop without overlapping text or controls.
- Credit/source text is visible for the selected stop.

## Phase 2 Expansion Path

After the route exhibit works, the project can expand in three directions:

- Add more routes, such as Thermal Basin Walk, Wildlife Encounters, and Wild Yellowstone Mix.
- Introduce a generated full-library manifest from the crawler or a separate scanner.
- Add richer atlas features, such as approximate zones, exact coordinates where verified, search, filters, and audio-derived metadata.

These are intentionally outside Phase 1 so the first version ships as a complete guided sound route.
