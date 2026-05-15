# Agent Instructions for Yellowstone Sound Atlas

## Project Boundary

Yellowstone Sound Atlas (YSL) is a static public listening atlas for Yellowstone National Park sound recordings. Treat it as a read-only archive and browser experience.

Do not describe this project as an official National Park Service product. Do not invent OAuth, MCP, A2A, payment, webhook, private API, or account capabilities. The public OpenAPI file documents static GET resources only.

## Useful Entry Points

- Homepage: `index.html`
- Atlas app: `atlas/index.html`
- Atlas styles: `atlas/css/main.css`
- Atlas runtime: `atlas/js/app.js`
- Localization: `atlas/js/i18n.js`
- Route data: `atlas/dawn-to-night.json`
- Route builder: `scripts/build_atlas_route.py`
- Agent docs: `llms.txt`, `llms-full.txt`, `index.md`, `openapi.json`, `.well-known/agent.json`
- Tests: `tests/`

## Verification Commands

Run the smallest relevant set for the change:

```bash
make test
make check-atlas-route
black --check spider.py tests/
flake8 spider.py tests/
git diff --check
```

Use `make preview-atlas` for local browser checks of the atlas experience.

## Data And Rights

Source sound and image materials come from the National Park Service Yellowstone sound library. NPS labels these audio files as public domain, but downstream rights and credits should still be verified for each use.

If a file, credit, or source claim is challenged, prefer removing or correcting the disputed item promptly and record the reason in the relevant issue or commit.

