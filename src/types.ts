import type { Animation, Side } from "./figure/pose";

export type { Animation, Side };

export interface Move {
  name: string;
  /** Total repetitions. */
  reps: number;
  /** Pace, in seconds per rep — this is what sets how long the move takes. */
  secPerRep: number;
  /** The voice calls the count out loud every N reps. */
  sayEvery: number;
  /** One-line reminder shown under the counter. */
  sub: string;
  /**
   * Why the move is in the routine, and how to hold the form. Kept as the
   * written reference for each movement; nothing renders these since the
   * learn screen was removed.
   */
  why: string;
  cues: string[];
  /** How the demonstrator performs it — keyframes, see figure/pose.ts. */
  animation: Animation;
  /** -1 mirrors the animation for the right-side version of a move. Default 1. */
  side?: Side;
}

export interface Routine {
  /** Shown on the home screen; may contain <br> and <em>. */
  title: string;
  lede: string;
  moves: Move[];
}
