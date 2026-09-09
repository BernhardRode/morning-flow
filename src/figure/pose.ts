/**
 * Poses and how they are animated.
 *
 * A pose is a sparse set of joint angles (radians) plus the root placement.
 * Anything left out falls back to NEUTRAL. The right arm and leg mirror the
 * left when applied, so a symmetric pose describes each side once.
 *
 * An animation is a cyclic list of keyframe poses, spaced evenly over one
 * loop, joined by a closed Catmull-Rom spline. Being a closed loop is what
 * guarantees the figure never jumps at a rep boundary: the spline through the
 * last key back to the first is as smooth as any other segment.
 */

export type Vec3 = [number, number, number];

/** 1 = as authored, -1 = mirrored left-to-right. */
export type Side = 1 | -1;

export interface Pose {
  /** Root placement, metres. */
  x?: number; y?: number; z?: number;
  /** Root turn (yaw), lean forward (pitch) and sideways (roll). */
  yaw?: number; pitch?: number; roll?: number;
  /** Bends, each [forward, turn, side]. */
  spine?: Vec3; chest?: Vec3; neck?: Vec3;
  /** Shoulders, each [swing forward, twist, out to the side]; elbows bend. */
  armL?: Vec3; armR?: Vec3; elbL?: number; elbR?: number;
  /** Hips, each [swing forward, twist, out to the side]; knees bend. */
  hipL?: Vec3; hipR?: Vec3; kneeL?: number; kneeR?: number;
}

export type FullPose = Required<Pose>;

/** Standing easy: arms hanging just clear of the body. */
export const NEUTRAL: FullPose = {
  x: 0, y: 0.96, z: 0,
  yaw: 0, pitch: 0, roll: 0,
  spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0],
  armL: [0.05, 0, 0.12], armR: [0.05, 0, 0.12], elbL: 0.12, elbR: 0.12,
  hipL: [0, 0, 0], hipR: [0, 0, 0], kneeL: 0, kneeR: 0,
};

/** Later layers win. */
export function merge(...layers: Pose[]): Pose {
  return Object.assign({}, ...layers) as Pose;
}

/** Swap left and right, and flip every turn and side-lean with them. */
export function mirror(p: Pose): Pose {
  const flip = (v: Vec3 | undefined): Vec3 | undefined => (v ? [v[0], -v[1], -v[2]] : undefined);
  const out: Pose = { ...p };
  if (p.x !== undefined) out.x = -p.x;
  if (p.yaw !== undefined) out.yaw = -p.yaw;
  if (p.roll !== undefined) out.roll = -p.roll;
  if (p.spine) out.spine = flip(p.spine);
  if (p.chest) out.chest = flip(p.chest);
  if (p.neck) out.neck = flip(p.neck);
  out.armL = p.armR; out.armR = p.armL;
  out.elbL = p.elbR; out.elbR = p.elbL;
  out.hipL = p.hipR; out.hipR = p.hipL;
  out.kneeL = p.kneeR; out.kneeR = p.kneeL;
  for (const k of Object.keys(out) as (keyof Pose)[]) if (out[k] === undefined) delete out[k];
  return out;
}

/** What has to stay on the floor: the feet, the whole body, or nothing. */
export type Grounding = "feet" | "all" | "none";

/** Where the camera sits and what it looks at. */
export const VIEWS = {
  front:        { pos: [1.6, 1.5, 3.7] as Vec3,   aim: [0, 1.0, 0] as Vec3 },
  threeQuarter: { pos: [2.4, 1.6, 3.4] as Vec3,   aim: [0, 1.0, 0] as Vec3 },
  wide:         { pos: [0.15, 1.15, 3.7] as Vec3, aim: [0, 0.62, 0] as Vec3 },
  floor:        { pos: [1.5, 1.55, 2.7] as Vec3,  aim: [0, 0.45, 0] as Vec3 },
  floorSide:    { pos: [1.5, 1.35, 2.9] as Vec3,  aim: [-0.15, 0.4, 0] as Vec3 },
  floorLow:     { pos: [1.7, 1.45, 3.1] as Vec3,  aim: [0, 0.55, 0] as Vec3 },
} as const;
export type ViewName = keyof typeof VIEWS;

export interface Animation {
  /** Keyframes, evenly spaced around one loop. The loop closes back to the first. */
  keys: Pose[];
  /** How many reps one loop spans. 2 for moves that alternate sides. Default 1. */
  cycle?: number;
  /** Merged under every key — the stance the move happens in. */
  base?: Pose;
  /** Default "feet". */
  ground?: Grounding;
  /** Default "front". */
  view?: ViewName;
}

/* ---------- sampling ---------- */

const SCALARS = ["x", "y", "z", "yaw", "pitch", "roll", "elbL", "elbR", "kneeL", "kneeR"] as const;
const VECTORS = ["spine", "chest", "neck", "armL", "armR", "hipL", "hipR"] as const;

function flatten(p: FullPose): number[] {
  const out: number[] = [];
  for (const k of SCALARS) out.push(p[k]);
  for (const k of VECTORS) out.push(...p[k]);
  return out;
}

function unflatten(v: readonly number[]): FullPose {
  const p = {} as Record<string, number | Vec3>;
  let i = 0;
  for (const k of SCALARS) p[k] = v[i++]!;
  for (const k of VECTORS) p[k] = [v[i++]!, v[i++]!, v[i++]!];
  return p as unknown as FullPose;
}

const catmullRom = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

const compiled = new WeakMap<Animation, number[][]>();

/** Keys with base and NEUTRAL folded in, flattened once per animation. */
function keysOf(anim: Animation): number[][] {
  let keys = compiled.get(anim);
  if (!keys) {
    keys = anim.keys.map((k) => flatten({ ...NEUTRAL, ...anim.base, ...k } as FullPose));
    compiled.set(anim, keys);
  }
  return keys;
}

/**
 * The pose at `repTime` reps into the move (fractional, may exceed 1 — it
 * keeps counting across reps so alternating moves alternate).
 */
export function sample(anim: Animation, repTime: number, side: Side = 1): FullPose {
  const keys = keysOf(anim);
  const n = keys.length;
  if (n === 0) return NEUTRAL;
  const cycle = anim.cycle ?? 1;
  const u = (((repTime / cycle) % 1) + 1) % 1;
  const s = u * n;
  const i = Math.floor(s);
  const t = s - i;
  const k0 = keys[(i - 1 + n) % n]!, k1 = keys[i % n]!, k2 = keys[(i + 1) % n]!, k3 = keys[(i + 2) % n]!;
  const v = k1.map((_, c) => catmullRom(k0[c]!, k1[c]!, k2[c]!, k3[c]!, t));
  const pose = unflatten(v);
  return side < 0 ? ({ ...NEUTRAL, ...mirror(pose) } as FullPose) : pose;
}
