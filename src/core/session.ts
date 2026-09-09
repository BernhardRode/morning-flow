import { TIMING } from "../config";
import type { Move, Routine } from "../types";
import { Emitter } from "./emitter";
import { moveSeconds, sessionSeconds, totalReps } from "./format";

export type PhaseKind = "ready" | "work";

export interface Phase {
  kind: PhaseKind;
  move: Move;
  /** Index of the move within the routine. */
  moveIndex: number;
  seconds: number;
}

export type SessionEvents = {
  /** A new phase started — either the rest before a move, or the move itself. */
  phase: { phase: Phase; isFirst: boolean };
  /** Whole seconds left in a "ready" phase. */
  countdown: { secondsLeft: number };
  /** A rep landed. `spoken` means the voice should call this number. */
  rep: { rep: number; move: Move; spoken: boolean; last: boolean };
  progress: { done: number; total: number; ratio: number; phase: Phase };
  pause: { paused: boolean };
  finish: { totalReps: number; totalSeconds: number };
};

/** Rest phase, then work phase, for every move in the routine. */
function buildQueue(moves: readonly Move[]): Phase[] {
  return moves.flatMap((move, moveIndex) => [
    { kind: "ready" as const, move, moveIndex, seconds: moveIndex === 0 ? TIMING.prep : TIMING.transition },
    { kind: "work" as const, move, moveIndex, seconds: moveSeconds(move) },
  ]);
}

/**
 * Runs a routine on the clock and reports what is happening. It owns no DOM
 * and makes no sound — screens subscribe and do that themselves.
 */
export class Session extends Emitter<SessionEvents> {
  readonly moves: readonly Move[];
  readonly totalReps: number;
  readonly totalSeconds: number;

  private readonly queue: Phase[];
  private index = 0;
  private phaseStart = 0;
  private pausedAt = 0;
  private paused = false;
  private timer: ReturnType<typeof setInterval> | undefined;
  private lastRep = 0;
  private lastCountdown = -1;

  constructor(routine: Routine) {
    super();
    this.moves = routine.moves;
    this.queue = buildQueue(routine.moves);
    this.totalReps = totalReps(routine.moves);
    this.totalSeconds = sessionSeconds(routine.moves);
  }

  get phase(): Phase {
    return this.queue[this.index]!;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  /** Seconds into the current phase. */
  elapsed(): number {
    return ((this.paused ? this.pausedAt : performance.now()) - this.phaseStart) / 1000;
  }

  /**
   * Time into the current move measured in reps — 2.5 is halfway through the
   * third rep. Unbounded, so an animation that alternates sides can tell odd
   * reps from even ones. Drives the demonstrator.
   */
  repTime(): number {
    return this.elapsed() / this.phase.move.secPerRep;
  }

  /**
   * Reps that will begin within the next `seconds`, with the page-clock time
   * each lands on, so the click can be handed to the audio clock ahead of
   * time. Empty while resting or paused.
   */
  upcomingReps(seconds: number): Array<{ rep: number; at: number; spoken: boolean; last: boolean }> {
    const phase = this.phase;
    if (phase.kind !== "work" || this.paused) return [];
    const { move } = phase;
    const now = performance.now();
    const horizon = now + seconds * 1000;
    const out: Array<{ rep: number; at: number; spoken: boolean; last: boolean }> = [];
    // Rep k (1-based) begins (k-1) paces after the move started.
    let rep = Math.floor((now - this.phaseStart) / (move.secPerRep * 1000)) + 1;
    for (; rep <= move.reps; rep++) {
      const at = this.phaseStart + (rep - 1) * move.secPerRep * 1000;
      if (at > horizon) break;
      if (at < now - 1) continue; // already begun
      out.push({ rep, at, spoken: rep % move.sayEvery === 0, last: rep === move.reps });
    }
    return out;
  }

  start(): void {
    this.index = 0;
    this.paused = false;
    this.enterPhase();
    this.stopClock();
    this.timer = setInterval(() => this.tick(), TIMING.tickMs);
  }

  /** Leave the session where it is and stop the clock. */
  stop(): void {
    this.stopClock();
  }

  setPaused(paused: boolean): void {
    if (paused === this.paused) return;
    this.paused = paused;
    if (paused) this.pausedAt = performance.now();
    else this.phaseStart += performance.now() - this.pausedAt;
    this.emit("pause", { paused });
  }

  /** Skip ahead: the next phase, or the end of the session. */
  next(): void {
    if (this.index < this.queue.length - 1) {
      this.index++;
      this.enterPhase();
    } else {
      this.finish();
    }
  }

  /** Back to the start of this move, or to the move before it. */
  previous(): void {
    const startOfMove = this.queue.findIndex(
      (p) => p.moveIndex === this.phase.moveIndex && p.kind === "ready",
    );
    this.index = this.index === startOfMove && startOfMove > 0 ? startOfMove - 1 : Math.max(startOfMove, 0);
    this.enterPhase();
  }

  private stopClock(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
  }

  private enterPhase(): void {
    this.phaseStart = performance.now();
    this.lastRep = 0;
    this.lastCountdown = -1;
    this.emit("phase", { phase: this.phase, isFirst: this.index === 0 });
    this.emitProgress();
  }

  private tick(): void {
    if (this.paused) return;
    const phase = this.phase;
    const t = this.elapsed();

    if (phase.kind === "ready") {
      const left = Math.ceil(phase.seconds - t);
      if (left !== this.lastCountdown) {
        this.lastCountdown = left;
        this.emit("countdown", { secondsLeft: Math.max(left, 0) });
      }
    } else {
      const rep = Math.min(phase.move.reps, Math.floor(t / phase.move.secPerRep) + 1);
      if (rep !== this.lastRep && t < phase.seconds) {
        this.lastRep = rep;
        this.emit("rep", {
          rep,
          move: phase.move,
          spoken: rep % phase.move.sayEvery === 0,
          last: rep === phase.move.reps,
        });
      }
    }

    this.emitProgress();
    if (t >= phase.seconds) this.next();
  }

  private emitProgress(): void {
    const elapsedBefore = this.queue.slice(0, this.index).reduce((sum, p) => sum + p.seconds, 0);
    const done = elapsedBefore + Math.min(this.elapsed(), this.phase.seconds);
    this.emit("progress", {
      done,
      total: this.totalSeconds,
      ratio: Math.max(0, Math.min(1, done / this.totalSeconds)),
      phase: this.phase,
    });
  }

  private finish(): void {
    this.stopClock();
    this.emit("finish", { totalReps: this.totalReps, totalSeconds: this.totalSeconds });
  }
}
