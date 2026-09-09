/**
 * Every piece of text the app builds at runtime. Labels that never change sit
 * in index.html; anything assembled from a number or a move name is here, so
 * the wording can be read and revised in one place.
 *
 * The app is German, and "Wdh." stands in where a full "Wiederholungen" would
 * not fit.
 */

export const COPY = {
  /** Small tracking label above the move name during a session. */
  phase: {
    starting: "los geht's",
    next: "als nächstes",
    paused: "pausiert",
  },

  moveOf: (index: number, total: number) => `Übung ${index} von ${total}`,
  /** Under the counter while resting before a move. */
  restSub: (reps: number, sub: string) => `${reps} Wdh. · ${sub}`,
  /** Next to the rep counter during a move. */
  target: (reps: number) => `von ${reps}`,
  /** Duration column in the move list on the home screen. */
  moveDose: (reps: number, time: string) => `${reps} \u00d7\u00a0${time}`,
  spoken: {
    announce: (name: string, reps: number) => `${name}. ${reps} Wiederholungen.`,
    go: "Los",
    lastOne: "Letzte",
    done: "Fertig.",
  },

  controls: {
    pause: "Pause",
    resume: "Weiter",
  },

  done: {
    title: (reps: number) => `${reps} geschafft.`,
    line: (reps: number, time: string) =>
      `${reps} Wiederholungen in ${time}. Die Routine funktioniert nur, wenn morgen genauso aussieht.`,
  },
} as const;
