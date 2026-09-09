import { allFours, arms, dip, seated9090, soft, turn } from "../figure/presets";
import type { Animation, Routine } from "../types";

/**
 * The routine. Everything about what you do is here — the rest of the app
 * only reads this file.
 *
 *   reps       total repetitions
 *   secPerRep  pace in seconds per rep; this sets how long the move takes
 *   sayEvery   how often the voice calls a number out loud
 *   animation  keyframes the demonstrator loops through — see figure/pose.ts.
 *              `cycle: 2` means one loop spans two reps, for moves that
 *              alternate sides. Keys are evenly spaced around the loop and
 *              the loop closes, so the figure never jumps between reps.
 *   side       -1 mirrors the animation for a right-side variant
 *
 * To add a move, add an entry. To remove one, delete it. Nothing else knows
 * how many there are or what they're called.
 *
 * One flow, standing work first and floor work second, so you only get down
 * once. Rest between moves and the countdown before the first one live in
 * config.ts.
 */

const Q = Math.PI / 2;

/** Shared by the left and right versions; `side: -1` mirrors it. */
const HYDRANT: Animation = {
  ground: "all", view: "floor",
  base: { ...allFours, yaw: 0.25 },
  keys: [
    {},
    { hipL: [Q - 0.08, 0, 1.2], kneeL: -Q + 0.25 },
  ],
};

const ADDUCTOR: Animation = {
  ground: "all", view: "floorSide",
  base: {
    ...soft, y: 0.6, yaw: 0.82,
    spine: [0.08, 0, 0], chest: [0.05, 0, 0], neck: [-0.22, 0, 0],
    elbL: 0.1, elbR: 0.1,
    kneeR: -Q - 0.25, kneeL: -0.04,
  },
  keys: [
    { pitch: -Q + 0.55, armL: [Q - 0.45, 0, 0.22], armR: [Q - 0.45, 0, 0.22], hipR: [Q - 0.55, 0, 0.05], hipL: [Q - 0.35, 0, 1.42] },
    { pitch: -Q + 0.05, armL: [Q - 0.05, 0, 0.22], armR: [Q - 0.05, 0, 0.22], hipR: [Q - 0.1, 0, 0.05], hipL: [Q - 0.1, 0, 1.42] },
  ],
};

export const ROUTINE: Routine = {
  title: "Morgen<br><em>Flow</em>",
  lede: "Dreizehn Übungen in einem Flow: sieben rhythmische Bewegungen im Stehen aus Jules Horns 30-Tage-Morgenroutine, dann vier Hüftöffner am Boden für äußere Hüfte, Innenschenkel, Leiste und Rotation. 820 Wiederholungen. Nichts wird erzwungen und nichts ist schwer — es geht um Rhythmus und Wiederholung, nicht um Anstrengung, und jede Hüft-Wiederholung ist bewusst langsam.",
  moves: [
    {
      name: "Federn", reps: 300, secPerRep: 0.39, sayEvery: 50,
      sub: "Hüfte wechselt links, rechts",
      why: "Das ganze Aufwärmen in einem Block, und der längste. Federndes Wippen aus den Knien, während die Hüfte von Seite zu Seite wechselt — die Arme bleiben locker und tief vorne.",
      cues: [
        "Füße hüftbreit, Knie weich, aus den Knien federn",
        "Fersen bleiben tief, heben kaum vom Boden ab",
        "Lass die Hüfte im Federn von Seite zu Seite wechseln",
        "Arme locker vorne, Schultern und Kiefer schwer",
      ],
      // One dip per rep; the hips swing left on odd reps and right on even.
      animation: {
        cycle: 2, view: "threeQuarter",
        base: arms.lowFront,
        keys: [
          { yaw: 0.22, roll: 0.1, x: 0.035, chest: [0, 0.12, 0], spine: [0, 0, -0.05] },
          { ...dip(0.62), spine: [0.05, 0, 0] },
          { yaw: -0.22, roll: -0.1, x: -0.035, chest: [0, -0.12, 0], spine: [0, 0, 0.05] },
          { ...dip(0.62), spine: [0.05, 0, 0] },
        ],
      },
    },
    {
      name: "Körperwellen", reps: 50, secPerRep: 1.4, sayEvery: 10,
      sub: "Hoch beim Strecken, runter beim Beugen",
      why: "Eine Welle durch den ganzen Körper, nicht nur durch die Wirbelsäule. Die Arme schwingen über den Kopf, während du dich öffnest und aufrichtest, dann rollt die Welle wieder nach unten, wenn du nach vorne klappst.",
      cues: [
        "Beide Arme über den Kopf schwingen, Brust öffnet sich, Hüfte nach vorne",
        "Dann abtauchen: Knie beugen, Kinn sinkt, Wirbelsäule rollt ab",
        "Die Arme schwingen unten an den Beinen vorbei",
        "Eine Wiederholung ist eine komplette Welle hoch und runter",
      ],
      // Rise and open, then fold and roll down; the spline carries it back up.
      animation: {
        view: "threeQuarter",
        keys: [
          { ...arms.hang, ...dip(0.1), spine: [0.1, 0, 0] },
          { ...arms.overhead, spine: [-0.22, 0, 0], chest: [-0.18, 0, 0], neck: [-0.15, 0, 0], hipL: [-0.1, 0, 0], hipR: [-0.1, 0, 0] },
          { ...arms.forward, ...dip(0.35), spine: [0.5, 0, 0], chest: [0.25, 0, 0], neck: [0.2, 0, 0] },
          { armL: [0.15, 0, 0.16], armR: [0.15, 0, 0.16], elbL: 0.3, elbR: 0.3, ...dip(0.5), spine: [1.03, 0, 0], chest: [0.37, 0, 0], neck: [0.2, 0, 0] },
        ],
      },
    },
    {
      name: "Herzöffner", reps: 50, secPerRep: 1.15, sayEvery: 10,
      sub: "Arme weit auf Schulterhöhe",
      why: "Die Arme öffnen weit auf Schulterhöhe, die Brust zieht auseinander, dann schließt sie wieder. Hier bekommt die Vorderseite ihre Länge zurück.",
      cues: [
        "Arme zur Seite auf Schulterhöhe, Daumen nach hinten",
        "Beim Einatmen die Arme weit nach hinten ziehen",
        "Beim Ausatmen vor der Brust kreuzen lassen",
        "Kinn waagerecht, den Nacken nicht überstrecken",
      ],
      animation: {
        base: dip(0.06),
        keys: [
          { ...arms.wide, spine: [-0.1, 0, 0], chest: [-0.16, 0, 0], neck: [-0.1, 0, 0] },
          { ...arms.crossed, spine: [0.06, 0, 0], chest: [0.14, 0, 0] },
        ],
      },
    },
    {
      name: "Seitwechsel", reps: 50, secPerRep: 1.0, sayEvery: 10,
      sub: "Drehen mit ausgestreckten Armen",
      why: "Rotation mit den Armen auf Schulterhöhe, das Gewicht wechselt von Fuß zu Fuß. Eine Wiederholung ist eine Seite.",
      cues: [
        "Arme zur Seite, etwa auf Schulterhöhe",
        "Den ganzen Oberkörper erst in die eine, dann in die andere Richtung drehen",
        "Das Gewicht wandert auf den Fuß, zu dem du dich drehst",
        "Die Arme laufen nur mit — sie folgen der Drehung, sie führen sie nicht",
      ],
      // One rep is one side, so a loop is two reps: left, then right.
      animation: {
        cycle: 2,
        base: { hipL: [-0.06, 0, 0], hipR: [-0.06, 0, 0] },
        keys: [
          { yaw: 0.8, x: 0.05, roll: -0.05, chest: [0, 0.3, 0], neck: [0, 0.12, 0], armL: [-0.1, -0.15, 1.45], armR: [-0.1, -0.15, 1.45], elbL: 0.35, elbR: 0.35, kneeL: 0.32, kneeR: 0.08 },
          { yaw: -0.8, x: -0.05, roll: 0.05, chest: [0, -0.3, 0], neck: [0, -0.12, 0], armL: [-0.1, 0.15, 1.45], armR: [-0.1, 0.15, 1.45], elbL: 0.35, elbR: 0.35, kneeL: 0.08, kneeR: 0.32 },
        ],
      },
    },
    {
      name: "Arme abwechselnd hoch und tief", reps: 100, secPerRep: 1.3, sayEvery: 25,
      sub: "Ein Arm hoch, einer tief",
      why: "Ein Arm streckt sich gerade nach oben, während der andere fällt, dann wechseln sie. Weckt die Schultern und die ganze seitliche Kette.",
      cues: [
        "Einen Arm lang nach oben strecken, der andere bleibt tief",
        "Im gleichmäßigen Takt wechseln, rhythmisch bleiben",
        "Rippen und Taille bei jedem Strecken mitziehen lassen",
        "Eine Wiederholung ist ein kompletter Wechsel hoch und runter",
      ],
      animation: {
        base: { ...dip(0.07), elbL: 0.12, elbR: 0.12 },
        keys: [
          { roll: 0.1, spine: [0, 0, -0.09], armL: [-3.0, 0, 0.14], armR: [-0.15, 0, 0.14] },
          { roll: -0.1, spine: [0, 0, 0.09], armL: [-0.15, 0, 0.14], armR: [-3.0, 0, 0.14] },
        ],
      },
    },
    {
      name: "Zen-Schwung", reps: 100, secPerRep: 0.85, sayEvery: 25,
      sub: "Die Arme herumschwingen lassen",
      why: "Drehung aus der Taille, die Arme peitschen um den Körper und steigen auf Schulter- und Kopfhöhe. Schnell, locker, ohne Muskeleinsatz.",
      cues: [
        "Aus der Taille drehen, die Arme um dich herumpeitschen lassen",
        "Eine Hand kommt vorne hoch, die andere schwingt hinten vorbei",
        "Die Fersen heben beim Drehen, die Knie bleiben weich",
        "Das Tempo kommt aus der Drehung, nie aus den Armen",
      ],
      // The arms trail the twist: at each end they are still swinging in.
      animation: {
        cycle: 2,
        base: { ...dip(0.08), y: 0.94 },
        keys: [
          { ...turn(1.7), armL: [-1.99, -0.26, 0.76], armR: [-0.71, 0.26, 0.34], elbL: 0.65, elbR: 1.25 },
          { armL: [-1.73, -0.15, 0.68], armR: [-0.98, 0.15, 0.43], elbL: 0.78, elbR: 1.13 },
          { ...turn(-1.7), armL: [-0.71, 0.26, 0.34], armR: [-1.99, -0.26, 0.76], elbL: 1.25, elbR: 0.65 },
          { armL: [-0.98, 0.15, 0.43], armR: [-1.73, -0.15, 0.68], elbL: 1.13, elbR: 0.78 },
        ],
      },
    },
    {
      name: "Tote Arme", reps: 100, secPerRep: 1.1, sayEvery: 25,
      sub: "Arme völlig locker",
      why: "Der Abschluss. Die Arme sind komplett tot, du drehst von Seite zu Seite, die Hände landen auf Brust und Rücken.",
      cues: [
        "Aus der Taille drehen, die Arme hängen leblos",
        "Die Hände auf Brust und unteren Rücken klatschen lassen",
        "Die Fersen dürfen beim Drehen abheben",
        "Schultern, Nacken und Kiefer bleiben weich",
      ],
      animation: {
        cycle: 2,
        base: dip(0.06),
        keys: [
          { ...turn(1.1), armL: [-0.57, -0.19, 0.16], armR: [0.27, 0.19, 0.16], elbL: 0.82, elbR: 0.28 },
          { armL: [-0.4, -0.11, 0.16], armR: [0.1, 0.11, 0.16], elbL: 0.71, elbR: 0.39 },
          { ...turn(-1.1), armL: [0.27, 0.19, 0.16], armR: [-0.57, -0.19, 0.16], elbL: 0.28, elbR: 0.82 },
          { armL: [0.1, 0.11, 0.16], armR: [-0.4, -0.11, 0.16], elbL: 0.39, elbR: 0.71 },
        ],
      },
    },

    // Floor work from here down.
    {
      name: "Feuerhydrant — links", reps: 10, secPerRep: 3, sayEvery: 2, side: 1,
      sub: "Knie zur Seite anheben",
      why: "Äußere Hüfte und Gluteus medius — der Muskel, der aufhört zu arbeiten, wenn man den ganzen Tag darauf sitzt. Langsam heben, noch langsamer senken.",
      cues: [
        "Vierfüßlerstand, Hände unter den Schultern, Knie unter der Hüfte",
        "Das Knie im 90°-Winkel halten und zur Seite anheben",
        "Auf Hüfthöhe stoppen — Rippen und Rücken drehen nicht mit",
        "Kontrolliert senken, zwei Sekunden nach unten",
      ],
      animation: HYDRANT,
    },
    {
      name: "Feuerhydrant — rechts", reps: 10, secPerRep: 3, sayEvery: 2, side: -1,
      sub: "Knie zur Seite anheben",
      why: "Dasselbe auf der anderen Seite. Die schwächere Seite meldet sich hier meistens von selbst.",
      cues: [
        "Das Gewicht bleibt gleichmäßig auf beiden Händen",
        "Knie im 90°-Winkel, nach außen und leicht nach hinten heben",
        "Der Bauch bleibt fest, damit die Wirbelsäule nicht mitdreht",
        "Langsam senken, nicht fallen lassen",
      ],
      animation: HYDRANT,
    },
    {
      name: "Adduktoren-Wippe — links", reps: 10, secPerRep: 3, sayEvery: 2, side: 1,
      sub: "Zurückwippen, Innenschenkel spüren",
      why: "Innenschenkel und Leiste. Wippen wirkt besser als Halten — das Gewebe gibt bei langsamer Bewegung mehr nach als bei statischem Dehnen.",
      cues: [
        "Aus dem Vierfüßlerstand das linke Bein gestreckt zur Seite ausstrecken",
        "Fuß flach, Zehen zeigen nach vorne, Knie gestreckt",
        "Die Hüfte zur Ferse zurückwippen, dann wieder nach vorne",
        "Brust lang, der Rücken rundet nicht",
      ],
      animation: ADDUCTOR,
    },
    {
      name: "Adduktoren-Wippe — rechts", reps: 10, secPerRep: 3, sayEvery: 2, side: -1,
      sub: "Zurückwippen, Innenschenkel spüren",
      why: "Andere Seite. Vergleiche, wie weit du zurückkommst — genau darum geht es.",
      cues: [
        "Rechtes Bein gestreckt zur Seite, Zehen nach vorne",
        "Langsam bis zum ersten Widerstand zurückwippen",
        "Beim Zurückwippen ausatmen",
        "Am Ende der Bewegung nie federn",
      ],
      animation: ADDUCTOR,
    },
    {
      name: "Kosaken-Kniebeuge", reps: 10, secPerRep: 4, sayEvery: 2,
      sub: "Eine Wiederholung ist eine Seite, im Wechsel",
      why: "Die tiefe Übung: Leiste, Adduktoren und Sprunggelenk in einer Position. Die Tiefe kommt über Wochen, nicht heute.",
      cues: [
        "Füße weit, Zehen leicht nach außen",
        "Auf ein Bein absinken, das andere bleibt gestreckt, Zehen zeigen hoch",
        "Brust aufrecht, die Ferse des gebeugten Beins bleibt unten",
        "Auf die andere Seite schieben — das ist eine Wiederholung",
        "Halt dich an einem Stuhl oder der Wand fest, wenn das Gleichgewicht die Grenze ist",
      ],
      // Deep on the left, up through the middle, deep on the right, up again.
      animation: {
        cycle: 2, ground: "none", view: "wide",
        base: { armL: [-1.6, 0, 0.3], armR: [-1.6, 0, 0.3], elbL: 0.7, elbR: 0.7 },
        keys: [
          { y: 0.376, x: 0.16, roll: -0.05, spine: [-0.36, 0, 0.12], chest: [-0.1, 0, 0], neck: [0.28, 0, 0], armL: [-1.75, 0, 0.3], armR: [-1.75, 0, 0.3], hipL: [-0.3, 0, 0.35], kneeL: 1.85, hipR: [-0.02, 0, 0.95], kneeR: 0.02 },
          { y: 0.864, hipL: [0, 0, 0.45], kneeL: 0, hipR: [-0.02, 0, 0.45], kneeR: 0.02 },
          { y: 0.376, x: -0.16, roll: 0.05, spine: [-0.36, 0, -0.12], chest: [-0.1, 0, 0], neck: [0.28, 0, 0], armL: [-1.75, 0, 0.3], armR: [-1.75, 0, 0.3], hipR: [-0.3, 0, 0.35], kneeR: 1.85, hipL: [-0.02, 0, 0.95], kneeL: 0.02 },
          { y: 0.864, hipL: [-0.02, 0, 0.45], kneeL: 0.02, hipR: [0, 0, 0.45], kneeR: 0 },
        ],
      },
    },
    {
      name: "90/90-Hüftwechsel", reps: 20, secPerRep: 3, sayEvery: 5,
      sub: "Eine Wiederholung ist ein Wechsel · 10 pro Seite",
      why: "Innen- und Außenrotation, der Bereich, der beim Sitzen zuerst verschwindet. Hier klicken und setzen sich die Hüften.",
      cues: [
        "Im Sitzen beide Knie im 90°-Winkel, ein Bein vorne, eins zur Seite",
        "Beide Knie kontrolliert auf die andere Seite ablegen",
        "Die Brust bleibt aufrecht, die Hände liegen leicht hinten am Boden",
        "Mit den Knien führen, nicht mit einem Schwung aus der Hüfte",
      ],
      // Knees over to one side, lifted through the middle, over to the other.
      animation: {
        cycle: 2, ground: "all", view: "floorLow",
        base: seated9090,
        keys: [
          { yaw: 0.3, hipL: [-1.62, 1.1, 0.3], hipR: [-1.3, 0, 0.95] },
          { hipL: [-1.4, 0.55, 0.3], hipR: [-1.1, 0.55, 0.95] },
          { yaw: -0.3, hipL: [-1.62, 0, 0.3], hipR: [-1.3, 1.1, 0.95] },
          { hipL: [-1.4, 0.55, 0.3], hipR: [-1.1, 0.55, 0.95] },
        ],
      },
    },
  ],
};
