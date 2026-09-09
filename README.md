# morning-flow

A guided movement web app for one routine: **Morgen-Flow**, thirteen movements and 820 reps.

The app's interface and routine are in German. Code, comments and this README are in English.

Seven rhythmic standing movements from Jules Horn's 30-day morning routine, then four hip openers on the floor for outer hip, inner thigh, groin and rotation. Standing work first and floor work second, so you only get down once.

The session announces the moves, clicks the pace, counts the reps, and draws a 3D figure demonstrating the movement. The background warms from night to morning as you work through it.

The routine's own numbers are quick — "Federn" at 0.39s a rep is 154 bounces a minute — so the home screen has a pace control: 0.7×, 0.85× or 1× of that speed, showing what each does to the session length. It starts at 0.7×. Rep counts never change, only how long each one gets; the rests between moves stay fixed.

## Running it

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
npm run typecheck
```

`dist/` is a static bundle with relative asset URLs, so it can be served from any host or subpath. Fonts and three.js are bundled — the app needs no network at runtime.

## Install and offline

The build is a progressive web app: a service worker precaches every asset — HTML, JS, CSS, fonts and the three.js chunk — so once it has been opened with a connection it runs with no network at all. Updates are picked up silently on the next load.

On Chromium the home screen shows an **Install on this device** button when the browser reports the app is installable; on iOS use Share → Add to Home Screen, which Safari offers instead. Installed, it launches standalone in portrait with no browser chrome.

Icons are generated from a single SVG source by `node scripts/generate-icons.mjs` (favicon, `.ico`, apple-touch, and 192/512/maskable PWA icons). The outputs live in `public/` and are committed, so the script only needs re-running if the mark changes.

## Layout

```
index.html            markup only — the shell every screen lives in
public/               generated icons, copied to the site root
scripts/
  generate-icons.mjs  renders the whole icon set from one SVG
  pose-range.ts       measures how far the figure travels per rep, in cm
src/
  main.ts             wiring: builds the screens, owns the session lifecycle
  config.ts           session timing and the sky gradient
  types.ts            Move and Routine
  style.css
  copy.ts             every string the app builds at runtime
  data/routine.ts     the routine — reps, pace, cues. Edit this to change the workout.
  core/
    session.ts        the clock: phases, reps, pause, progress. Emits events, touches no DOM.
    pace.ts           restates the routine at a chosen speed
    emitter.ts        small typed event emitter
    format.ts         rep/duration maths and m:ss
  audio/
    voice.ts          spoken move names and rep counts
    metronome.ts      the pace click
  system/
    wake-lock.ts      keeps the screen awake during a session
    install.ts        the home-screen install prompt, where the browser offers one
  figure/
    demonstrator.ts   the interface the screens use, plus the lazy loader
    figure.ts         the three.js renderer and animation loop
    skeleton.ts       builds the figure's rig
    poses.ts          one function per movement: joint angles across a rep
  ui/
    screens.ts        which screen is visible
    home.ts learn.ts train.ts done.ts
    dom.ts
```

The session engine and the UI are separate: `Session` runs the clock and reports what happened; the train screen listens and turns that into text, sound and animation. Nothing outside `figure/` knows three.js exists — it is imported dynamically on the first mount, so the app shell stays around 18 kB and the 480 kB renderer only loads when a figure is actually drawn.

## Editing the routine

Everything about what you do is in `src/data/routine.ts` — one flat list of moves, in the order you do them:

```ts
{
  name: "Federn", reps: 300, secPerRep: 0.39, sayEvery: 50, anim: "bounces",
  sub: "Hüfte wechselt links, rechts",
  why: "...",            // shown on the learn screen
  cues: ["...", "..."],  // form cues
}
```

- `reps` — total repetitions
- `secPerRep` — pace in seconds per rep; this sets how long the move takes
- `sayEvery` — how often the voice calls a number out loud
- `anim` — which demonstrator animation draws it; add `side: -1` to mirror it

Rest between moves (`transition`), the countdown before the first move (`prep`) and the pace options are in `src/config.ts`.

If you change a pose, check it still reads on screen: `node --experimental-strip-types scripts/pose-range.ts` prints how far the head, hips, hands and feet travel over one rep of every movement. Anything with only a couple of centimetres of travel will look frozen at this canvas size. A brand new movement needs a pose function in `src/figure/poses.ts` plus an entry in the `GROUNDING` and `CAMERAS` maps there.

## Wording

Labels that never change are German in `index.html`. Anything assembled from a number or a move name goes through `src/copy.ts`, which also formats seconds the German way — a decimal comma, one decimal place. Spoken cues are `de-DE`.

## Controls

Space pauses and resumes, arrow keys skip between moves. Voice and pace click can each be switched off on the home screen before you start.
