# Yellowstone Sound Atlas (YSL)

Yellowstone Sound Atlas is a public static listening atlas for Yellowstone National Park sound recordings. It organizes 61 public sound specimens into a playable route with specimen notes, themes, direct audio paths, source credits, social share pages, and a browser-based stamp player.

## Canonical Links

- Site: https://ysl.rosuh.me/
- Atlas: https://ysl.rosuh.me/atlas/
- Route JSON: https://ysl.rosuh.me/atlas/dawn-to-night.json
- Full agent documentation: https://ysl.rosuh.me/llms-full.txt
- Developer resources: https://ysl.rosuh.me/developers/
- GitHub repository: https://github.com/rosuH/YSL
- Source sound library: https://www.nps.gov/yell/learn/photosmultimedia/soundlibrary.htm
- Full archive: https://archive.org/details/YSL.7z

## Contents

The route covers thermal features, birds, wildlife, water, weather, human traces, and ambient soundscapes. Example specimens include American Coots, American Robin, Bird Chorus, Red Fox, Sandhill Crane, Soundscapes, American Dipper, Old Faithful, Fountain Paint Pot, Wolves, Elk, Thunder, and Yellowstone Lake Singing.

Each route item includes a stable `id`, title, time-of-day label, theme, zone label, description, credit, audio path, and often an image path plus a field note.

## Agent Guidance

Agents should fetch `/llms.txt` for a short overview and `/llms-full.txt` for complete context. Use `/atlas/dawn-to-night.json` when the user needs structured metadata, specimen names, or audio paths. Use `/atlas/` when the user wants to listen or browse visually.

YSL has no account system, OAuth flow, private data, write API, MCP server, A2A endpoint, payment flow, or webhook system. The OpenAPI description documents only public, read-only static GET resources.

## Attribution

This is not an official National Park Service product. Source labels identify the sound and image files as National Park Service materials. Downstream users should verify rights and third-party restrictions for their own use.

