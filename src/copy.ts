/**
 * Every piece of text the app builds at runtime. Labels that never change sit
 * in index.html; anything assembled from a number or a move name is here, so
 * the wording can be read and revised in one place.
 *
 * The app is German. Numbers are formatted for German too — a decimal comma,
 * and "Wdh." where a full "Wiederholungen" would not fit.
 */

/** One decimal place, with a decimal comma: 1.5714 → "1,6". */
const seconds = (value: number): string =>
  value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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
  /** The dose line on the learn screen. */
  dose: (reps: number, secPerRep: number, time: string) =>
    `${reps} Wiederholungen à ca. ${seconds(secPerRep)} s — ${time}.`,

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

  learn: {
    next: "Weiter",
    start: "Flow starten",
  },

  done: {
    title: (reps: number) => `${reps} geschafft.`,
    line: (reps: number, time: string) =>
      `${reps} Wiederholungen in ${time}. Die Routine funktioniert nur, wenn morgen genauso aussieht.`,
  },
} as const;
