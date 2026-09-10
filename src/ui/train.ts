import { SKY, SPEECH, TIMING } from "../config";
import { COPY } from "../copy";
import { clock } from "../core/format";
import type { Session, SessionEvents } from "../core/session";
import { idle, type Demonstrator } from "../figure/demonstrator";
import type { Metronome } from "../audio/metronome";
import type { Voice } from "../audio/voice";
import { currentScreen } from "./screens";
import { el } from "./dom";

const PLAY_PATH = '<path d="M8 5v14l11-7z"/>';
const PAUSE_PATH = '<path d="M7 5h4v14H7zm6 0h4v14h-4z"/>';

/** Slowest the demonstrator idles at during a rest phase. */
const MIN_DEMO_SECONDS = 1.1;

const mix = (from: readonly number[], to: readonly number[], r: number): string =>
  `rgb(${from.map((v, i) => Math.round(v + ((to[i] ?? v) - v) * r)).join(",")})`;

export interface TrainScreen {
  /** Subscribe to a session and start it. */
  run(session: Session): void;
}

export function createTrainScreen(opts: {
  figure: Demonstrator;
  voice: Voice;
  metronome: Metronome;
  onEnd(): void;
  onFinish(result: SessionEvents["finish"]): void;
}): TrainScreen {
  const { figure, voice, metronome } = opts;
  const ttLeft = el("ttLeft");
  const ttRight = el("ttRight");
  const phaseLabel = el("phase");
  const moveName = el("moveName");
  const count = el("count");
  const target = el("target");
  const sub = el("sub");
  const playIcon = el("playIcon");
  const playBtn = el<HTMLButtonElement>("playBtn");

  let session: Session | null = null;
  let unsubscribe: Array<() => void> = [];
  /** Reps whose click is already on the audio clock, for the current move. */
  let clicked = new Set<number>();

  function beat(n: number): void {
    count.textContent = String(n);
    count.classList.remove("beat");
    void count.offsetWidth; // restart the animation
    count.classList.add("beat");
  }

  function restLabel(isFirst: boolean): string {
    return isFirst ? COPY.phase.starting : COPY.phase.next;
  }

  /**
   * Hand every beat inside the lookahead window to the audio clock, once:
   * the reps of a move, and the 3-2-1 before it starts.
   */
  function scheduleClicks(active: Session): void {
    for (const r of active.upcomingReps(TIMING.clickLookahead)) {
      if (clicked.has(r.rep)) continue;
      clicked.add(r.rep);
      metronome.clickAt(r.at, r.spoken || r.last);
    }
    // Only when the voice is off. With speech on, the number is already the
    // beat, and a click landing on the same instant reads as a second voice.
    if (voice.enabled) return;
    for (const c of active.upcomingCountdown(TIMING.clickLookahead)) {
      if (clicked.has(-c.secondsLeft)) continue;
      clicked.add(-c.secondsLeft);
      metronome.clickAt(c.at, false);
    }
  }

  /** Anything skipped or paused must not click late. */
  function dropClicks(): void {
    metronome.cancel();
    clicked = new Set();
  }

  function bind(active: Session): void {
    unsubscribe = [
      active.on("phase", ({ phase, isFirst }) => {
        // No bare cancel here: sayNow() clears and then speaks on the next
        // task, so nothing is ever handed to the engine while it is still
        // shutting down the line before it.
        dropClicks();
        moveName.textContent = phase.move.name;
        figure.show(phase.move.animation, phase.move.side ?? 1);
        count.style.animationDuration = `${Math.min(0.4, phase.move.secPerRep * 0.7)}s`;

        if (phase.kind === "ready") {
          figure.drive(idle(Math.max(phase.move.secPerRep, MIN_DEMO_SECONDS)));
          phaseLabel.textContent = restLabel(isFirst);
          target.textContent = "";
          sub.textContent = COPY.restSub(phase.move.reps, phase.move.sub);
          // The very first announcement queues instead of clearing: the only
          // thing ahead of it is the silent primer that unlocked speech, and
          // on iOS cancelling that is not worth the risk.
          const announce = COPY.spoken.announce(phase.move.name, phase.move.reps);
          if (isFirst) voice.say(announce, SPEECH.announce);
          else voice.sayNow(announce, SPEECH.announce);
        } else {
          figure.drive(() => active.repTime());
          phaseLabel.textContent = "";
          target.textContent = COPY.target(phase.move.reps);
          sub.textContent = phase.move.sub;
          voice.sayNow(COPY.spoken.go, SPEECH.countdown);
          scheduleClicks(active);
        }
      }),

      active.on("countdown", ({ secondsLeft }) => {
        count.textContent = String(secondsLeft);
        if (secondsLeft > 3 || secondsLeft <= 0) return;
        // Clear the announcement once, at "3" — three seconds from the move,
        // where a cut can't be heard against a beat. "2" and "1" then queue
        // behind a word that is long finished.
        if (secondsLeft === 3) voice.sayNow(String(secondsLeft), SPEECH.countdown);
        else voice.say(String(secondsLeft), SPEECH.countdown);
      }),

      active.on("rep", ({ rep, spoken, last }) => {
        beat(rep);
        if (spoken && !last) voice.say(String(rep), SPEECH.count);
        if (last) voice.say(COPY.spoken.lastOne);
      }),

      active.on("progress", ({ done, total, ratio, phase }) => {
        scheduleClicks(active);
        el("progress").style.width = `${ratio * 100}%`;
        ttLeft.textContent = COPY.moveOf(phase.moveIndex + 1, active.moves.length);
        ttRight.textContent = `${clock(done)} / ${clock(total)}`;
        document.body.style.setProperty("--sky-top", mix(SKY.topStart, SKY.topEnd, ratio));
        document.body.style.setProperty("--sky-bottom", mix(SKY.bottomStart, SKY.bottomEnd, ratio));
      }),

      active.on("pause", ({ paused }) => {
        if (paused) dropClicks();
        playIcon.innerHTML = paused ? PLAY_PATH : PAUSE_PATH;
        playBtn.setAttribute("aria-label", paused ? COPY.controls.resume : COPY.controls.pause);
        phaseLabel.textContent = paused
          ? COPY.phase.paused
          : active.phase.kind === "ready"
            ? restLabel(active.phase.moveIndex === 0)
            : "";
      }),

      active.on("finish", (result) => {
        dropClicks();
        voice.say(COPY.spoken.done);
        opts.onFinish(result);
      }),
    ];
  }

  playBtn.addEventListener("click", () => session?.setPaused(!session.isPaused));
  el("nextBtn").addEventListener("click", () => {
    voice.cancel();
    session?.next();
  });
  el("prevBtn").addEventListener("click", () => {
    voice.cancel();
    session?.previous();
  });
  el("endBtn").addEventListener("click", () => {
    session?.stop();
    voice.cancel();
    dropClicks();
    opts.onEnd();
  });

  document.addEventListener("keydown", (event) => {
    if (currentScreen() !== "train" || !session) return;
    if (event.code === "Space") {
      event.preventDefault();
      session.setPaused(!session.isPaused);
    }
    if (event.code === "ArrowRight") {
      voice.cancel();
      session.next();
    }
    if (event.code === "ArrowLeft") {
      voice.cancel();
      session.previous();
    }
  });

  return {
    run(next) {
      for (const off of unsubscribe) off();
      unsubscribe = [];
      dropClicks();
      session = next;
      playIcon.innerHTML = PAUSE_PATH;
      playBtn.setAttribute("aria-label", COPY.controls.pause);
      count.textContent = "";
      bind(next);
      next.start();
    },
  };
}
