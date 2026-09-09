/** Session timing, in seconds unless noted. */
export const TIMING = {
  /** Countdown before the first move. */
  prep: 5,
  /** Rest between moves. */
  transition: 5,
  /** How often the session clock is sampled, in milliseconds. */
  tickMs: 60,
} as const;

/**
 * Pace options, as a multiplier on the routine's own speed: 1 is the pace the
 * routine data describes, and anything below it stretches every rep. The
 * routine's raw numbers are quick (body bounces at 0.39s is 154 a minute), so
 * the default starts gentler and the home screen can dial it back up.
 */
export const SPEEDS = [0.7, 0.85, 1] as const;
export const DEFAULT_SPEED = 0.7;

export type Speed = (typeof SPEEDS)[number];

/** Background gradient, interpolated from night (start) to morning (finish). */
export const SKY = {
  topStart: [11, 22, 32],
  topEnd: [58, 74, 107],
  bottomStart: [18, 42, 44],
  bottomEnd: [200, 162, 78],
} as const;
