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

The build is a progressive web app: a service worker precaches every asset — HTML, JS, CSS and fonts — so once it has been opened with a connection it runs with no network at all. Updates are picked up silently on the next load.

The whole app, three.js included, is one JavaScript file on purpose. It used to lazy-load the 3D figure as a separate chunk, and that broke on every deploy: the service worker updates itself immediately and drops the previous build's chunks, so a page that was already open would ask for a chunk that no longer existed and lose its figure until the next open. One payload means an open page always has all the code it will need. `public/assets/figure-C29d5iuX.js` is the last lazy chunk, kept for one deploy so pages open during the switch still find it — delete it in the deploy after.

On Chromium the home screen shows an **Install on this device** button when the browser reports the app is installable; on iOS use Share → Add to Home Screen, which Safari offers instead. Installed, it launches standalone in portrait with no browser chrome.

Icons are generated from a single SVG source by `node scripts/generate-icons.mjs` (favicon, `.ico`, apple-touch, and 192/512/maskable PWA icons). The outputs live in `public/` and are committed, so the script only needs re-running if the mark changes.

## Layout

```
index.html            markup only — the shell every screen lives in
public/               generated icons, copied to the site root
scripts/
  generate-icons.mjs  renders the whole icon set from one SVG
  pose-range.ts       measures how far the figure travels per move, and that each loop closes
  run.mjs             runs a script through Vite's loader, so it resolves imports like the app
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
    skeleton.ts       builds the figure — a body in shorts, about 1.8 m
    pose.ts           poses, keyframe animations and the spline between them
    presets.ts        stances and arm positions to build keyframes from
  ui/
    screens.ts        which screen is visible
    home.ts train.ts done.ts
    dom.ts
```

The session engine and the UI are separate: `Session` runs the clock and reports what happened; the train screen listens and turns that into text, sound and animation. Nothing outside `figure/` knows three.js exists — it is imported dynamically on the first mount, so the app shell stays around 18 kB and the 480 kB renderer only loads when a figure is actually drawn.

## Editing the routine

Everything about what you do is in `src/data/routine.ts` — one flat list of moves, in the order you do them. Adding a move means adding an entry; removing one means deleting it. Nothing else knows how many there are or what they're called.

```ts
{
  name: "Federn", reps: 300, secPerRep: 0.39, sayEvery: 50,
  sub: "Hüfte wechselt links, rechts",
  why: "...",            // written reference, not currently displayed
  cues: ["...", "..."],  // form cues, likewise
  animation: {
    cycle: 2,                       // one loop spans two reps: hips left, then right
    base: arms.lowFront,            // the stance under every keyframe
    keys: [
      { yaw: 0.22, roll: 0.1 },     // rep starts: up, hips swung left
      dip(0.62),                    // halfway: down
      { yaw: -0.22, roll: -0.1 },   // next rep starts: up, hips swung right
      dip(0.62),                    // and down again
    ],
  },
}
```

- `reps` — total repetitions
- `secPerRep` — pace in seconds per rep; this sets how long the move takes
- `sayEvery` — how often the voice calls a number out loud
- `side: -1` — mirrors the animation, for the right-hand version of a one-sided move

### How the demonstrator animates a move

An animation is a list of **keyframes** — sparse poses — spaced evenly around one loop, joined by a closed spline. Because the loop closes, the figure can never jump between reps: the last key flows back into the first as smoothly as any other segment. `cycle` says how many reps one loop spans — `1` for a move that repeats identically, `2` for one that alternates sides. The session hands the figure its time in reps, so the animation is always exactly in step with the counter.

A pose is joint angles in radians — hips, knees, shoulders, elbows, spine, chest, neck — plus where the root sits; anything left out is the neutral standing pose. `src/figure/presets.ts` has the stances and arm positions most moves are built from (`arms.wide`, `dip(0.6)`, `allFours`, `seated9090`, `turn(1.5)`…); spread them into a key and override what the move needs. `ground` says what stays on the floor (`"feet"`, the whole body, or nothing) and `view` picks the camera.

After writing or changing an animation, run

```bash
node scripts/run.mjs scripts/pose-range.ts
```

It prints how far the head, hips, hands and feet travel over one loop of every move, and whether the loop closes. Anything with only a couple of centimetres of travel will look frozen at this canvas size; anything flagged `jumps` will visibly snap once a rep.

Rest between moves (`transition`), the countdown before the first move (`prep`) and the pace options are in `src/config.ts`.

## Wording

Labels that never change are German in `index.html`. Anything assembled from a number or a move name goes through `src/copy.ts`, and spoken cues go out as `de-DE`.

## Controls

Space pauses and resumes, arrow keys skip between moves. Voice and pace click can each be switched off on the home screen before you start.
