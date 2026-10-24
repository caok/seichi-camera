# Seichi Camera · 聖地巡礼カメラ

A mobile web app (PWA-style) for tourists visiting Tokyo anime spots:
pick a scene → walk there → line up the shot with an outline overlay → get an
"anime ↔ reality" card to share.

## Run

```bash
npm install
npm run dev
```

The camera requires HTTPS (or localhost). To test on an iPhone, expose the dev server through a tunnel:

```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:5173
```

Open the printed `https://….trycloudflare.com` URL on the phone.

## Structure

```
src/
  data/scenes.ts        scene list (coords, heading, frame/outline paths, tips)
  pages/                Home (list + map) → Scene → Camera → Result
  components/Guidance   distance + compass hints
  hooks/                useGeolocation, useCompass (iOS permission handled)
  lib/camera.ts         getUserMedia + crop exactly what the viewfinder shows
  lib/compose.ts        canvas "anime vs reality" card + Web Share / download
  lib/store.ts          last shot (memory) + stamps (localStorage)
scripts/
  make_outline.py       real screenshot → transparent outline PNG (OpenCV)
public/scenes/<id>/     frame + outline + pose (characters) per scene
```

## Adding a real scene frame

```bash
python3 -m venv .venv && .venv/bin/pip install opencv-python-headless numpy
.venv/bin/python scripts/import_frame.py <id> path/to/screenshot.png   # -> frame.jpg + outline.png
# hand-draw the characters as <ellipse>/<path> shapes in public/scenes/<id>/pose.svg, then:
.venv/bin/python scripts/mask_outline.py <id>                           # remove characters from the outline layer
```

Then point `frame` / `outline` / `pose` in `src/data/scenes.ts` at the new files, add the `credit`
(copyright notice) and calibrate `spot` / `heading` on site. `scripts/stitch_quads.py` joins four
quadrant screenshots into one full-resolution frame.
