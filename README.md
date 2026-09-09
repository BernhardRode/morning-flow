# morning-flow

A single-file web app for two movement routines:

- **Morning Flow · 750** — seven rhythmic movements, 750 reps, just under eleven minutes (Jules Horn's 30-day morning routine).
- **Hip Reset** — four slow hip openers for outer hip, inner thigh, groin and rotation, about four minutes on the floor.

Everything lives in [`index.html`](index.html): no build step, no dependencies to install. Open the file in a browser, or serve the folder (`python3 -m http.server`) and visit it on your phone.

## What it does

- **Learn screen** — every move with the why, the cues, and the dose, plus an animated 3D demonstrator.
- **Guided session** — spoken move announcements, a pace click on the beat, live rep counter, and a background that warms from night to morning as you progress.
- **Controls** — pause/resume (space), skip forward/back (arrow keys), and a screen wake-lock so the phone doesn't sleep mid-flow.

## Editing the routines

The routines are data at the top of the second `<script>` block in `index.html`:

```js
{ name:"Body bounces", reps:300, secPerRep:0.39, sayEvery:50, sub:"Hips switch left, right", ... }
```

- `reps` — total repetitions
- `secPerRep` — pace in seconds per rep; this sets how long the move takes
- `sayEvery` — how often the voice calls a number out loud

`TRANSITION` and `PREP` (just below the routines) control the rest between moves and the countdown before the first one. New moves map to a demonstrator animation through `ANIM_MAP`.

## Notes

The 3D demonstrator loads three.js r128 from cdnjs, so the animations need network access on first load; the rest of the app works offline.
