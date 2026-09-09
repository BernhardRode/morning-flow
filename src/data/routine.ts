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
  title: "Morning<br><em>Flow</em>",
  lede: "Thirteen movements in one flow: seven rhythmic standing movements from Jules Horn's 30-day morning routine, then four hip openers on the floor for outer hip, inner thigh, groin and rotation. 820 reps, just over fifteen minutes. Nothing is forced and nothing is heavy — the point is rhythm and repetition, not effort, and every hip rep is deliberately slow.",
  moves: [
    {
      name: "Body bounces", reps: 300, secPerRep: 0.39, sayEvery: 50, anim: "bounces",
      sub: "Hips switch left, right",
      why: "The whole warm-up in one block, and the longest. Springy bouncing from the knees while the hips switch side to side — arms stay soft and low in front.",
      cues: [
        "Feet hip-width, knees soft, bounce from the knees",
        "Heels stay low, barely leaving the floor",
        "Let the hips switch side to side with the bounce",
        "Arms loose in front, shoulders and jaw heavy",
      ],
    },
    {
      name: "Body waves", reps: 50, secPerRep: 1.4, sayEvery: 10, anim: "waves",
      sub: "Up on the reach, down on the fold",
      why: "A full-body wave, not just a spinal one. Arms sweep overhead as you open and rise, then the wave rolls back down as you fold forward.",
      cues: [
        "Sweep both arms up overhead, chest opens, hips push forward",
        "Then dive: knees bend, chin drops, spine rolls down",
        "Arms swing down past the legs at the bottom",
        "One rep is one full up-and-down wave",
      ],
    },
    {
      name: "Heart opener", reps: 50, secPerRep: 1.15, sayEvery: 10, anim: "heart",
      sub: "Arms wide at shoulder height",
      why: "Arms open wide to shoulder height, chest pulls apart, then closes. This is where the front of the body gets its length back.",
      cues: [
        "Arms out to the sides at shoulder height, thumbs back",
        "Pull the arms wide and back on the inhale",
        "Let them swing across the chest on the exhale",
        "Chin level, no cranking the neck back",
      ],
    },
    {
      name: "Side to side switch", reps: 50, secPerRep: 1.0, sayEvery: 10, anim: "side2side",
      sub: "Turn with the arms out",
      why: "Rotation with the arms held out at shoulder height, weight switching from foot to foot. One rep is one side.",
      cues: [
        "Arms out to the sides, roughly shoulder height",
        "Turn the whole torso one way, then the other",
        "Weight shifts onto the foot you turn towards",
        "Let the arms trail — they follow the turn, they don't lead it",
      ],
    },
    {
      name: "Alternate arms up and down", reps: 100, secPerRep: 1.3, sayEvery: 25, anim: "altarms",
      sub: "One arm up, one down",
      why: "One arm reaches straight overhead while the other drops, then they swap. Wakes the shoulders and the whole side chain.",
      cues: [
        "Reach one arm long overhead, the other stays low",
        "Swap on a steady beat, keep it rhythmic",
        "Let the ribs and waist stretch with each reach",
        "One rep is one full swap up and down",
      ],
    },
    {
      name: "Zen swing", reps: 100, secPerRep: 0.85, sayEvery: 25, anim: "zen",
      sub: "Whip the arms around",
      why: "Twisting from the waist with the arms whipping around the body, rising towards shoulder and head height. Fast, loose, no muscle.",
      cues: [
        "Turn from the waist, let the arms whip around you",
        "One hand comes up in front, the other swings behind",
        "Heels lift as you turn, knees stay soft",
        "Speed comes from the twist, never from the arms",
      ],
    },
    {
      name: "Dead arms", reps: 100, secPerRep: 1.1, sayEvery: 25, anim: "dead",
      sub: "Arms completely limp",
      why: "The finisher. Arms totally dead, twisting side to side, hands landing on the chest and the back.",
      cues: [
        "Turn from the waist, arms hang lifeless",
        "Let the hands slap the chest and the low back",
        "Heels can lift as you turn",
        "Shoulders, neck and jaw stay soft",
      ],
    },

    // Floor work from here down.
    {
      name: "Fire hydrant — left", reps: 10, secPerRep: 3, sayEvery: 2, anim: "hydrant", side: 1,
      sub: "Lift the knee out to the side",
      why: "Outer hip and glute medius — the muscle that stops working when you sit on it all day. Slow lift, slower return.",
      cues: [
        "All fours, hands under shoulders, knees under hips",
        "Keep the knee bent at 90° and lift it out to the side",
        "Stop at hip height — don't let the ribs or back rotate",
        "Lower under control, two seconds down",
      ],
    },
    {
      name: "Fire hydrant — right", reps: 10, secPerRep: 3, sayEvery: 2, anim: "hydrant", side: -1,
      sub: "Lift the knee out to the side",
      why: "Same on the other side. The weaker side usually announces itself here.",
      cues: [
        "Weight stays even in both hands",
        "Knee at 90°, lift out and slightly back",
        "Belly stays braced so the spine doesn't twist",
        "Lower slowly, no dropping",
      ],
    },
    {
      name: "Adductor rock — left", reps: 10, secPerRep: 3, sayEvery: 2, anim: "adductor", side: 1,
      sub: "Rock back, feel the inner thigh",
      why: "Inner thigh and groin. Rocking beats holding — the tissue gives more to slow movement than to a static stretch.",
      cues: [
        "From all fours, extend the left leg straight out to the side",
        "Foot flat, toes pointing forward, knee straight",
        "Rock the hips back towards the heel, then forward",
        "Chest long, back doesn't round",
      ],
    },
    {
      name: "Adductor rock — right", reps: 10, secPerRep: 3, sayEvery: 2, anim: "adductor", side: -1,
      sub: "Rock back, feel the inner thigh",
      why: "Other side. Compare how far back you get — the difference is the point.",
      cues: [
        "Right leg straight out to the side, toes forward",
        "Rock back slowly to the first resistance",
        "Breathe out as you rock back",
        "Never bounce at the end range",
      ],
    },
    {
      name: "Cossack squat", reps: 10, secPerRep: 4, sayEvery: 2, anim: "cossack",
      sub: "One rep is one side, alternating",
      why: "The deep one: groin, adductors and ankle in one shape. Depth comes over weeks, not today.",
      cues: [
        "Feet wide, toes turned slightly out",
        "Sink onto one leg, the other stays straight with the toes up",
        "Chest tall, heel of the bent leg stays down",
        "Push across to the other side — that is one rep",
        "Hold a chair or the wall if balance is the limit",
      ],
    },
    {
      name: "90/90 hip switches", reps: 20, secPerRep: 3, sayEvery: 5, anim: "ninety",
      sub: "One rep is one switch · 10 per side",
      why: "Internal and external rotation, the range that disappears first from sitting. This is where the hips click and settle.",
      cues: [
        "Sit with both knees bent at 90°, one leg in front, one to the side",
        "Lower both knees over to the other side under control",
        "Chest stays tall, hands lightly on the floor behind",
        "Lead with the knees, not with a throw of the hips",
      ],
    },
  ],
};
