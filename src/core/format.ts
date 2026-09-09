import type { Move } from "../types";

/** Seconds a move takes at its own pace. */
export const moveSeconds = (m: Move): number => Math.round(m.reps * m.secPerRep);

/** Seconds as m:ss. */
export const clock = (seconds: number): string =>
  Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");

export const totalReps = (moves: readonly Move[]): number =>
  moves.reduce((sum, m) => sum + m.reps, 0);
