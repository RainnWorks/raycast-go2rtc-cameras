# go2rtc Cameras artwork

`render.py` is the source of truth for the README artwork. It writes `hero.svg` and `how-it-works.svg` here and their PNGs to `../`. It also renders the hand-authored `icon.svg` to `../icon.png` (512 px, the icon Raycast uses) and `../icon-1024.png` (the README icon).

## Rebuild

You need Python 3 and `rsvg-convert` (librsvg).

```sh
python3 assets/src/render.py
```

The script points fontconfig at `fonts/` only, so the result does not depend on the fonts installed on the computer. No image model was used. Every shape, arrow and word is SVG.

## Outputs

- `../hero.png`: 1600 × 900. Raycast Root Search with "front" typed and Front Door Camera selected, then the go2rtc player.
- `../how-it-works.png`: 1800 × 620. go2rtc → Sync Camera Shortcuts → the Script folder → Root Search → Open Camera → the go2rtc player or a preferred app.
- `../icon-1024.png` and `../icon.png`: the same icon at two sizes.

Colours: black background, white line art, grey `#8A8F8C` for secondary text, and the icon's green `#37E7A2` as the one accent.

## Fonts

Bundled under their SIL Open Font Licenses, which sit beside the font files:

- Instrument Sans: https://github.com/google/fonts/tree/main/ofl/instrumentsans
- IBM Plex Mono: https://github.com/google/fonts/tree/main/ofl/ibmplexmono
