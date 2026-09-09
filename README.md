# morning-flow

A guided movement web app for two routines:

- **Morning Flow · 750** — seven rhythmic movements, 750 reps, just under eleven minutes (Jules Horn's 30-day morning routine).
- **Hip Reset** — four slow hip openers for outer hip, inner thigh, groin and rotation, about four minutes on the floor.

Each session announces the moves, clicks the pace, counts the reps, and draws a 3D figure demonstrating the movement. The background warms from night to morning as you work through it.

## Running it

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
npm run typecheck
```

`dist/` is a static bundle with relative asset URLs, so it can be served from any host or subpath. Fonts and three.js are bundled — the app needs no network at runtime.

## Layout

```
index.html            markup only — the shell every screen lives in
src/
  main.ts             wiring: builds the screens, owns the session lifecycle
  config.ts           session timing and the sky gradient
  types.ts            Move and Routine
  style.css
  data/routines.ts    the routines — reps, pace, cues. Edit this to change a workout.
  core/
    session.ts        the clock: phases, reps, pause, progress. Emits events, touches no DOM.
    emitter.ts        small typed event emitter
    format.ts         rep/duration maths and m:ss
  audio/
    voice.ts          spoken move names and rep counts
    metronome.ts      the pace click
  system/wake-lock.ts keeps the screen awake during a session
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

## Editing a routine

Everything about what you do is in `src/data/routines.ts`:

```ts
{
  name: "Body bounces", reps: 300, secPerRep: 0.39, sayEvery: 50, anim: "bounces",
  sub: "Hips switch left, right",
  why: "...",            // shown on the learn screen
  cues: ["...", "..."],  // form cues
}
```

- `reps` — total repetitions
- `secPerRep` — pace in seconds per rep; this sets how long the move takes
- `sayEvery` — how often the voice calls a number out loud
- `anim` — which demonstrator animation draws it; add `side: -1` to mirror it

Rest between moves (`transition`) and the countdown before the first move (`prep`) are in `src/config.ts`. A brand new movement needs a pose function in `src/figure/poses.ts` plus an entry in the `GROUNDING` and `CAMERAS` maps there.

## Controls

Space pauses and resumes, arrow keys skip between moves. Voice and pace click can each be switched off on the home screen before you start.
