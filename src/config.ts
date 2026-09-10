/** Session timing, in seconds unless noted. */
export const TIMING = {
  /** Countdown before the first move. */
  prep: 5,
  /** Rest between moves. */
  transition: 5,
  /**
   * How often the session clock is sampled, in milliseconds. This paces the
   * on-screen counter only — the click is scheduled on the audio clock.
   */
  tickMs: 33,
  /** How far ahead clicks are handed to the audio clock, in seconds. */
  clickLookahead: 0.3,
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

/**
 * Speaking rates, where 1 is the engine's own normal speed. Separated because
 * a counted rep and a countdown number want different pacing — and because if
 * a device speaks too fast or too slow, this is the one place to change.
 */
export const SPEECH = {
  /** The move announcement at the start of a rest. */
  announce: 1,
  /** "3", "2", "1" and "Los" — a touch under normal so they read as beats. */
  countdown: 0.9,
  /** Rep numbers called out during a move. */
  count: 1,
} as const;

/** Background gradient, interpolated from night (start) to morning (finish). */
export const SKY = {
  topStart: [11, 22, 32],
  topEnd: [58, 74, 107],
  bottomStart: [18, 42, 44],
  bottomEnd: [200, 162, 78],
} as const;
