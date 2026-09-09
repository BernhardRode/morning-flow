/** Session timing, in seconds unless noted. */
export const TIMING = {
  /** Countdown before the first move. */
  prep: 5,
  /** Rest between moves. */
  transition: 5,
  /** How often the session clock is sampled, in milliseconds. */
  tickMs: 60,
} as const;

/** Background gradient, interpolated from night (start) to morning (finish). */
export const SKY = {
  topStart: [11, 22, 32],
  topEnd: [58, 74, 107],
  bottomStart: [18, 42, 44],
  bottomEnd: [200, 162, 78],
} as const;
