import type { AnimName, Side } from "../types";

export type Vec3 = [number, number, number];

/**
 * A pose is a sparse set of joint angles (radians) plus the root placement.
 * Anything left out falls back to the neutral standing pose in figure.ts.
 * The right arm/leg mirror their y and z rotations when the pose is applied,
 * so a symmetric move only has to describe one side twice.
 */
export interface Pose {
  x?: number; y?: number; z?: number;
  yaw?: number; pitch?: number; roll?: number;
  spine?: Vec3; chest?: Vec3; neck?: Vec3;
  armL?: Vec3; armR?: Vec3; elbL?: number; elbR?: number;
  hipL?: Vec3; hipR?: Vec3; kneeL?: number; kneeR?: number;
}

/** `p` runs 0..1 across one repetition. */
export type PoseFn = (p: number, side: Side) => Pose;

const { PI, sin, cos, abs } = Math;

/** Smoothstep. */
const ss = (u: number): number => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
/** +1 → -1 across one rep. */
const tri = (p: number): number => cos(PI * p);
/** 0 → 1 → 0 across one rep. */
const bell = (p: number): number => (1 - cos(2 * PI * p)) / 2;

type Limb = "L" | "R";
const lead = (side: Side): Limb => (side > 0 ? "L" : "R");
const other = (side: Side): Limb => (side > 0 ? "R" : "L");
const hip = (o: Pose, limb: Limb, v: Vec3): void => { if (limb === "L") o.hipL = v; else o.hipR = v; };
const knee = (o: Pose, limb: Limb, v: number): void => { if (limb === "L") o.kneeL = v; else o.kneeR = v; };

export const POSES: Record<AnimName, PoseFn> = {
  bounces(p) {
    const b = abs(sin(PI * p)), sw = tri(p);
    // The knee bends to twice the hip angle, so the shin mirrors the thigh and
    // the foot stays under the hip: the leg compresses instead of swinging, and
    // grounding turns that into a real dip. Hip and knee in a 1:2 ratio are what
    // make this a bounce rather than a march in place. 0.62 gives ~9.5cm of
    // travel — deliberately larger than a real bounce, because at this canvas
    // size an anatomically honest 2cm dip is invisible.
    const dip = 0.62 * b;
    return {
      y: 0.95 - 0.085 * b, roll: sw * 0.1, yaw: sw * 0.22, x: sw * 0.035,
      hipL: [-dip, 0, 0], hipR: [-dip, 0, 0], kneeL: 2 * dip, kneeR: 2 * dip,
      spine: [0.05 * b, 0, -sw * 0.05], chest: [0, sw * 0.12, 0],
      armL: [-1.0, 0.2, 0.3], armR: [-1.0, 0.2, 0.3], elbL: 1.5, elbR: 1.5,
    };
  },
  waves(p) {
    if (p < 0.45) {
      const u = ss(p / 0.45);
      return {
        y: 0.93 + 0.05 * u, spine: [-0.22 * u, 0, 0], chest: [-0.18 * u, 0, 0], neck: [-0.15 * u, 0, 0],
        armL: [-3.05 * u, 0, 0.28 - 0.12 * u], armR: [-3.05 * u, 0, 0.28 - 0.12 * u],
        elbL: 0.25 * (1 - u), elbR: 0.25 * (1 - u),
        hipL: [-0.1 * u, 0, 0], hipR: [-0.1 * u, 0, 0], kneeL: 0.18 * (1 - u), kneeR: 0.18 * (1 - u),
      };
    }
    const d = ss((p - 0.45) / 0.55);
    return {
      y: 0.93 - 0.16 * d, spine: [-0.22 + 1.25 * d, 0, 0], chest: [-0.18 + 0.55 * d, 0, 0], neck: [-0.15 + 0.35 * d, 0, 0],
      armL: [-3.05 + 3.2 * d, 0, 0.16], armR: [-3.05 + 3.2 * d, 0, 0.16], elbL: 0.3 * d, elbR: 0.3 * d,
      hipL: [-0.1 + 0.55 * d, 0, 0], hipR: [-0.1 + 0.55 * d, 0, 0], kneeL: 0.5 * d, kneeR: 0.5 * d,
    };
  },
  heart(p) {
    const o = (1 + cos(2 * PI * p)) / 2; // 1 = wide open
    return {
      spine: [-0.1 * o + 0.06 * (1 - o), 0, 0], chest: [-0.16 * o + 0.14 * (1 - o), 0, 0], neck: [-0.1 * o, 0, 0],
      armL: [-0.1 - 0.55 * (1 - o), -0.55 + 1.0 * o, 1.5 - 1.15 * (1 - o)],
      armR: [-0.1 - 0.55 * (1 - o), -0.55 + 1.0 * o, 1.5 - 1.15 * (1 - o)],
      elbL: 0.15 + 1.15 * (1 - o), elbR: 0.15 + 1.15 * (1 - o),
      hipL: [-0.04, 0, 0], hipR: [-0.04, 0, 0], kneeL: 0.12, kneeR: 0.12,
    };
  },
  side2side(p) {
    const t = tri(p);
    return {
      yaw: 0.8 * t, x: 0.05 * t, roll: -0.05 * t,
      chest: [0, 0.3 * t, 0], neck: [0, 0.12 * t, 0],
      armL: [-0.1, -0.15 * t, 1.45], armR: [-0.1, -0.15 * t, 1.45], elbL: 0.35, elbR: 0.35,
      hipL: [-0.06, 0, 0], hipR: [-0.06, 0, 0], kneeL: 0.2 + 0.12 * t, kneeR: 0.2 - 0.12 * t,
    };
  },
  altarms(p) {
    const a = (1 + cos(2 * PI * p)) / 2; // 1 = left up
    return {
      roll: 0.1 * (2 * a - 1), spine: [0, 0, -0.09 * (2 * a - 1)],
      armL: [-3.0 * a - 0.15 * (1 - a), 0, 0.14], armR: [-3.0 * (1 - a) - 0.15 * a, 0, 0.14],
      elbL: 0.12, elbR: 0.12, hipL: [-0.05, 0, 0], hipR: [-0.05, 0, 0], kneeL: 0.14, kneeR: 0.14,
    };
  },
  zen(p) {
    const t = tri(p), l = cos(PI * p - 0.55); // arms lag the twist
    return {
      yaw: 0.95 * t, roll: 0.05 * t,
      chest: [0, 0.45 * t, 0], neck: [0, 0.18 * t, 0],
      armL: [-1.35 - 0.75 * l, -0.3 * l, 0.55 + 0.25 * l], armR: [-1.35 + 0.75 * l, 0.3 * l, 0.55 - 0.25 * l],
      elbL: 0.95 - 0.35 * l, elbR: 0.95 + 0.35 * l,
      hipL: [-0.05, 0, 0], hipR: [-0.05, 0, 0], kneeL: 0.16, kneeR: 0.16, y: 0.94,
    };
  },
  dead(p) {
    const t = tri(p), l = cos(PI * p - 0.7);
    return {
      yaw: 0.62 * t, chest: [0, 0.34 * t, 0], neck: [0, 0.14 * t, 0],
      armL: [-0.55 * l - 0.15, -0.25 * l, 0.16], armR: [0.55 * l - 0.15, 0.25 * l, 0.16],
      elbL: 0.55 + 0.35 * l, elbR: 0.55 - 0.35 * l,
      hipL: [-0.04, 0, 0], hipR: [-0.04, 0, 0], kneeL: 0.12, kneeR: 0.12,
    };
  },
  hydrant(p, side) {
    const q = PI / 2, lift = bell(p), W = lead(side), O = other(side);
    const o: Pose = {
      pitch: -q + 0.05, yaw: 0.25 * side, y: 0.62,
      spine: [0.04, 0, 0], chest: [0.02, 0, 0], neck: [-0.2, 0, 0],
      armL: [q - 0.05, 0, 0.1], armR: [q - 0.05, 0, 0.1], elbL: 0.05, elbR: 0.05,
    };
    hip(o, O, [q, 0, 0.03]); knee(o, O, -q);
    hip(o, W, [q - 0.08 * lift, 0, 1.2 * lift]); knee(o, W, -q + 0.25 * lift);
    return o;
  },
  adductor(p, side) {
    const q = PI / 2, rock = bell(p), W = lead(side), O = other(side);
    const o: Pose = {
      pitch: -q + 0.55 - 0.5 * rock, yaw: q - 0.75, y: 0.6,
      spine: [0.08, 0, 0], chest: [0.05, 0, 0], neck: [-0.22, 0, 0],
      armL: [q - 0.45 + 0.4 * rock, 0, 0.22], armR: [q - 0.45 + 0.4 * rock, 0, 0.22],
      elbL: 0.1, elbR: 0.1,
    };
    hip(o, O, [q - 0.55 + 0.45 * rock, 0, 0.05]); knee(o, O, -q - 0.25);
    hip(o, W, [q - 0.35 + 0.25 * rock, 0, 1.42]); knee(o, W, -0.04);
    return o;
  },
  cossack(p) {
    const t = (1 + cos(PI * p)) / 2, dir: Side = t > 0.5 ? 1 : -1;
    const low = 1 - abs(2 * t - 1);
    const W = lead(dir), O = other(dir);
    const a = 0.45 + 0.2 * low; // stance width
    const o: Pose = {
      y: 0.95 - 0.86 * (1 - cos(a)) - 0.4 * low,
      x: 0.16 * dir * low, roll: -0.05 * dir * low,
      spine: [-0.36 * low, 0, 0.12 * dir * low], chest: [-0.1 * low, 0, 0], neck: [0.28 * low, 0, 0],
      armL: [-1.6 - 0.15 * low, 0, 0.3], armR: [-1.6 - 0.15 * low, 0, 0.3], elbL: 0.7, elbR: 0.7,
    };
    hip(o, W, [-0.3 * low, 0, a - 0.3 * low]); knee(o, W, 1.85 * low);
    hip(o, O, [-0.02, 0, a + 0.3 * low]); knee(o, O, 0.02);
    return o;
  },
  ninety(p) {
    const t = tri(p), u = 0.55 * t;
    return {
      y: 0.3, pitch: 0.14, yaw: 0.3 * t,
      spine: [-0.06, 0, 0], chest: [-0.04, 0, 0], neck: [-0.04, 0, 0],
      armL: [0.8, -0.3, 0.55], armR: [0.8, -0.3, 0.55], elbL: 0.3, elbR: 0.3,
      hipL: [-1.62, 0.55 + u, 0.3], kneeL: 1.7,
      hipR: [-1.3, -(u - 0.55), 0.95], kneeR: 1.9,
    };
  },
};

/** What has to stay on the floor: the feet, the whole body, or nothing. */
export const GROUNDING: Record<AnimName, "feet" | "all" | "none"> = {
  bounces: "feet", waves: "feet", heart: "feet", side2side: "feet", altarms: "feet",
  zen: "feet", dead: "feet",
  hydrant: "all", adductor: "all", ninety: "all",
  cossack: "none",
};

/** Where the camera sits and what it looks at, per animation. */
export const CAMERAS: Record<AnimName, { pos: Vec3; aim: Vec3 }> = {
  bounces:   { pos: [2.3, 1.5, 3.5],  aim: [0, 0.95, 0] },
  waves:     { pos: [2.4, 1.5, 3.6],  aim: [0, 0.95, 0] },
  heart:     { pos: [1.4, 1.5, 3.8],  aim: [0, 1.05, 0] },
  side2side: { pos: [1.2, 1.5, 3.9],  aim: [0, 1.0, 0] },
  altarms:   { pos: [2.4, 1.6, 3.4],  aim: [0, 1.05, 0] },
  zen:       { pos: [1.4, 1.5, 3.9],  aim: [0, 1.0, 0] },
  dead:      { pos: [1.6, 1.5, 3.7],  aim: [0, 1.0, 0] },
  hydrant:   { pos: [1.5, 1.55, 2.7], aim: [0, 0.45, 0] },
  adductor:  { pos: [1.5, 1.35, 2.9], aim: [-0.15, 0.4, 0] },
  cossack:   { pos: [0.15, 1.15, 3.7], aim: [0, 0.62, 0] },
  ninety:    { pos: [1.5, 1.35, 2.7], aim: [0, 0.33, 0] },
};
