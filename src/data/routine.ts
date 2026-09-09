import type { Routine } from "../types";

/**
 * The routine. Everything about what you do is here — the rest of the app
 * only reads this file.
 *
 *   reps      total repetitions
 *   secPerRep pace in seconds per rep; this sets how long the move takes
 *   sayEvery  how often the voice calls a number out loud
 *   anim      which demonstrator animation draws the move (see figure/poses.ts)
 *   side      1 = left lead, -1 = right lead
 *
 * One flow, standing work first and floor work second, so you only get down
 * once. Rest between moves and the countdown before the first one live in
 * config.ts.
 */
export const ROUTINE: Routine = {
  title: "Morgen<br><em>Flow</em>",
  lede: "Dreizehn Übungen in einem Flow: sieben rhythmische Bewegungen im Stehen aus Jules Horns 30-Tage-Morgenroutine, dann vier Hüftöffner am Boden für äußere Hüfte, Innenschenkel, Leiste und Rotation. 820 Wiederholungen. Nichts wird erzwungen und nichts ist schwer — es geht um Rhythmus und Wiederholung, nicht um Anstrengung, und jede Hüft-Wiederholung ist bewusst langsam.",
  moves: [
    {
      name: "Federn", reps: 300, secPerRep: 0.39, sayEvery: 50, anim: "bounces",
      sub: "Hüfte wechselt links, rechts",
      why: "Das ganze Aufwärmen in einem Block, und der längste. Federndes Wippen aus den Knien, während die Hüfte von Seite zu Seite wechselt — die Arme bleiben locker und tief vorne.",
      cues: [
        "Füße hüftbreit, Knie weich, aus den Knien federn",
        "Fersen bleiben tief, heben kaum vom Boden ab",
        "Lass die Hüfte im Federn von Seite zu Seite wechseln",
        "Arme locker vorne, Schultern und Kiefer schwer",
      ],
    },
    {
      name: "Körperwellen", reps: 50, secPerRep: 1.4, sayEvery: 10, anim: "waves",
      sub: "Hoch beim Strecken, runter beim Beugen",
      why: "Eine Welle durch den ganzen Körper, nicht nur durch die Wirbelsäule. Die Arme schwingen über den Kopf, während du dich öffnest und aufrichtest, dann rollt die Welle wieder nach unten, wenn du nach vorne klappst.",
      cues: [
        "Beide Arme über den Kopf schwingen, Brust öffnet sich, Hüfte nach vorne",
        "Dann abtauchen: Knie beugen, Kinn sinkt, Wirbelsäule rollt ab",
        "Die Arme schwingen unten an den Beinen vorbei",
        "Eine Wiederholung ist eine komplette Welle hoch und runter",
      ],
    },
    {
      name: "Herzöffner", reps: 50, secPerRep: 1.15, sayEvery: 10, anim: "heart",
      sub: "Arme weit auf Schulterhöhe",
      why: "Die Arme öffnen weit auf Schulterhöhe, die Brust zieht auseinander, dann schließt sie wieder. Hier bekommt die Vorderseite ihre Länge zurück.",
      cues: [
        "Arme zur Seite auf Schulterhöhe, Daumen nach hinten",
        "Beim Einatmen die Arme weit nach hinten ziehen",
        "Beim Ausatmen vor der Brust kreuzen lassen",
        "Kinn waagerecht, den Nacken nicht überstrecken",
      ],
    },
    {
      name: "Seitwechsel", reps: 50, secPerRep: 1.0, sayEvery: 10, anim: "side2side",
      sub: "Drehen mit ausgestreckten Armen",
      why: "Rotation mit den Armen auf Schulterhöhe, das Gewicht wechselt von Fuß zu Fuß. Eine Wiederholung ist eine Seite.",
      cues: [
        "Arme zur Seite, etwa auf Schulterhöhe",
        "Den ganzen Oberkörper erst in die eine, dann in die andere Richtung drehen",
        "Das Gewicht wandert auf den Fuß, zu dem du dich drehst",
        "Die Arme laufen nur mit — sie folgen der Drehung, sie führen sie nicht",
      ],
    },
    {
      name: "Arme abwechselnd hoch und tief", reps: 100, secPerRep: 1.3, sayEvery: 25, anim: "altarms",
      sub: "Ein Arm hoch, einer tief",
      why: "Ein Arm streckt sich gerade nach oben, während der andere fällt, dann wechseln sie. Weckt die Schultern und die ganze seitliche Kette.",
      cues: [
        "Einen Arm lang nach oben strecken, der andere bleibt tief",
        "Im gleichmäßigen Takt wechseln, rhythmisch bleiben",
        "Rippen und Taille bei jedem Strecken mitziehen lassen",
        "Eine Wiederholung ist ein kompletter Wechsel hoch und runter",
      ],
    },
    {
      name: "Zen-Schwung", reps: 100, secPerRep: 0.85, sayEvery: 25, anim: "zen",
      sub: "Die Arme herumschwingen lassen",
      why: "Drehung aus der Taille, die Arme peitschen um den Körper und steigen auf Schulter- und Kopfhöhe. Schnell, locker, ohne Muskeleinsatz.",
      cues: [
        "Aus der Taille drehen, die Arme um dich herumpeitschen lassen",
        "Eine Hand kommt vorne hoch, die andere schwingt hinten vorbei",
        "Die Fersen heben beim Drehen, die Knie bleiben weich",
        "Das Tempo kommt aus der Drehung, nie aus den Armen",
      ],
    },
    {
      name: "Tote Arme", reps: 100, secPerRep: 1.1, sayEvery: 25, anim: "dead",
      sub: "Arme völlig locker",
      why: "Der Abschluss. Die Arme sind komplett tot, du drehst von Seite zu Seite, die Hände landen auf Brust und Rücken.",
      cues: [
        "Aus der Taille drehen, die Arme hängen leblos",
        "Die Hände auf Brust und unteren Rücken klatschen lassen",
        "Die Fersen dürfen beim Drehen abheben",
        "Schultern, Nacken und Kiefer bleiben weich",
      ],
    },

    // Floor work from here down.
    {
      name: "Feuerhydrant — links", reps: 10, secPerRep: 3, sayEvery: 2, anim: "hydrant", side: 1,
      sub: "Knie zur Seite anheben",
      why: "Äußere Hüfte und Gluteus medius — der Muskel, der aufhört zu arbeiten, wenn man den ganzen Tag darauf sitzt. Langsam heben, noch langsamer senken.",
      cues: [
        "Vierfüßlerstand, Hände unter den Schultern, Knie unter der Hüfte",
        "Das Knie im 90°-Winkel halten und zur Seite anheben",
        "Auf Hüfthöhe stoppen — Rippen und Rücken drehen nicht mit",
        "Kontrolliert senken, zwei Sekunden nach unten",
      ],
    },
    {
      name: "Feuerhydrant — rechts", reps: 10, secPerRep: 3, sayEvery: 2, anim: "hydrant", side: -1,
      sub: "Knie zur Seite anheben",
      why: "Dasselbe auf der anderen Seite. Die schwächere Seite meldet sich hier meistens von selbst.",
      cues: [
        "Das Gewicht bleibt gleichmäßig auf beiden Händen",
        "Knie im 90°-Winkel, nach außen und leicht nach hinten heben",
        "Der Bauch bleibt fest, damit die Wirbelsäule nicht mitdreht",
        "Langsam senken, nicht fallen lassen",
      ],
    },
    {
      name: "Adduktoren-Wippe — links", reps: 10, secPerRep: 3, sayEvery: 2, anim: "adductor", side: 1,
      sub: "Zurückwippen, Innenschenkel spüren",
      why: "Innenschenkel und Leiste. Wippen wirkt besser als Halten — das Gewebe gibt bei langsamer Bewegung mehr nach als bei statischem Dehnen.",
      cues: [
        "Aus dem Vierfüßlerstand das linke Bein gestreckt zur Seite ausstrecken",
        "Fuß flach, Zehen zeigen nach vorne, Knie gestreckt",
        "Die Hüfte zur Ferse zurückwippen, dann wieder nach vorne",
        "Brust lang, der Rücken rundet nicht",
      ],
    },
    {
      name: "Adduktoren-Wippe — rechts", reps: 10, secPerRep: 3, sayEvery: 2, anim: "adductor", side: -1,
      sub: "Zurückwippen, Innenschenkel spüren",
      why: "Andere Seite. Vergleiche, wie weit du zurückkommst — genau darum geht es.",
      cues: [
        "Rechtes Bein gestreckt zur Seite, Zehen nach vorne",
        "Langsam bis zum ersten Widerstand zurückwippen",
        "Beim Zurückwippen ausatmen",
        "Am Ende der Bewegung nie federn",
      ],
    },
    {
      name: "Kosaken-Kniebeuge", reps: 10, secPerRep: 4, sayEvery: 2, anim: "cossack",
      sub: "Eine Wiederholung ist eine Seite, im Wechsel",
      why: "Die tiefe Übung: Leiste, Adduktoren und Sprunggelenk in einer Position. Die Tiefe kommt über Wochen, nicht heute.",
      cues: [
        "Füße weit, Zehen leicht nach außen",
        "Auf ein Bein absinken, das andere bleibt gestreckt, Zehen zeigen hoch",
        "Brust aufrecht, die Ferse des gebeugten Beins bleibt unten",
        "Auf die andere Seite schieben — das ist eine Wiederholung",
        "Halt dich an einem Stuhl oder der Wand fest, wenn das Gleichgewicht die Grenze ist",
      ],
    },
    {
      name: "90/90-Hüftwechsel", reps: 20, secPerRep: 3, sayEvery: 5, anim: "ninety",
      sub: "Eine Wiederholung ist ein Wechsel · 10 pro Seite",
      why: "Innen- und Außenrotation, der Bereich, der beim Sitzen zuerst verschwindet. Hier klicken und setzen sich die Hüften.",
      cues: [
        "Im Sitzen beide Knie im 90°-Winkel, ein Bein vorne, eins zur Seite",
        "Beide Knie kontrolliert auf die andere Seite ablegen",
        "Die Brust bleibt aufrecht, die Hände liegen leicht hinten am Boden",
        "Mit den Knien führen, nicht mit einem Schwung aus der Hüfte",
      ],
    },
  ],
};
