import type { Routine } from "../types";

/**
 * Restates a routine at a different pace. Every rep is stretched by 1/speed,
 * so a speed of 0.7 runs 30% slower; rep counts never change.
 *
 * Scaling the data once, here, means the session clock, the move durations on
 * the home screen, the learn screen's dose line and the demonstrator all read
 * the same pace without any of them knowing a pace setting exists.
 */
export function atSpeed(routine: Routine, speed: number): Routine {
  if (speed === 1) return routine;
  return {
    ...routine,
    moves: routine.moves.map((move) => ({ ...move, secPerRep: move.secPerRep / speed })),
  };
}
