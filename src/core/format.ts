import { TIMING } from "../config";
import type { Move } from "../types";

/** Seconds a move takes at its own pace. */
export const moveSeconds = (m: Move): number => Math.round(m.reps * m.secPerRep);

/** Seconds as m:ss. */
export const clock = (seconds: number): string =>
  Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");

export const totalReps = (moves: readonly Move[]): number =>
  moves.reduce((sum, m) => sum + m.reps, 0);

/** Wall-clock length of a whole session: the work, the rests and the countdown. */
export const sessionSeconds = (moves: readonly Move[]): number =>
  moves.reduce((sum, m) => sum + moveSeconds(m), 0)
  + TIMING.prep
  + TIMING.transition * Math.max(0, moves.length - 1);
