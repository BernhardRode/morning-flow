/** Which demonstrator animation a move is drawn with. */
export type AnimName =
  | "bounces" | "waves" | "heart" | "side2side" | "altarms" | "zen" | "dead"
  | "hydrant" | "adductor" | "cossack" | "ninety";

/** 1 = left-side lead, -1 = right-side lead (mirrors the animation and the camera). */
export type Side = 1 | -1;

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
  anim: AnimName;
  /** Defaults to 1. */
  side?: Side;
}

export interface Routine {
  /** Shown on the home screen; may contain <br> and <em>. */
  title: string;
  lede: string;
  moves: Move[];
}
