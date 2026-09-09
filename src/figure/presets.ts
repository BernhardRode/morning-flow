/**
 * Building blocks for authoring an animation: stances and arm positions that
 * come up in most movements. Compose them into keyframes with spread syntax —
 * `{ ...arms.wide, ...dip(0.3) }` — and override whatever the move needs.
 */
import type { Pose } from "./pose";

const Q = Math.PI / 2;

export const arms = {
  /** Hanging, a little clear of the body. */
  hang: { armL: [0.05, 0, 0.12], armR: [0.05, 0, 0.12], elbL: 0.12, elbR: 0.12 },
  /** Loose in front, elbows bent — the warm-up carry. */
  lowFront: { armL: [-1.0, 0.2, 0.3], armR: [-1.0, 0.2, 0.3], elbL: 1.5, elbR: 1.5 },
  /** Straight up. */
  overhead: { armL: [-3.0, 0, 0.14], armR: [-3.0, 0, 0.14], elbL: 0.12, elbR: 0.12 },
  /** Out to the sides at shoulder height, thumbs back. */
  wide: { armL: [-0.1, -0.55, 1.5], armR: [-0.1, -0.55, 1.5], elbL: 0.15, elbR: 0.15 },
  /** Wrapped across the chest. */
  crossed: { armL: [-0.65, -0.55, 0.35], armR: [-0.65, -0.55, 0.35], elbL: 1.3, elbR: 1.3 },
  /** Straight out in front. */
  forward: { armL: [-1.6, 0, 0.16], armR: [-1.6, 0, 0.16], elbL: 0.2, elbR: 0.2 },
} satisfies Record<string, Pose>;

/**
 * Knees bend with the feet planted: the knee folds to twice the hip angle so
 * the shin mirrors the thigh and the foot stays under the hip. 0 is standing
 * tall; 0.6 is a springy dip; 1.0 a half squat.
 */
export const dip = (amount: number): Pose => ({
  hipL: [-amount, 0, 0], hipR: [-amount, 0, 0], kneeL: 2 * amount, kneeR: 2 * amount,
});

/** A soft standing base: knees unlocked, weight easy. */
export const soft: Pose = dip(0.05);

/** On hands and knees, back flat, looking a little forward. */
export const allFours: Pose = {
  pitch: -Q + 0.05, y: 0.62,
  spine: [0.04, 0, 0], chest: [0.02, 0, 0], neck: [-0.2, 0, 0],
  armL: [Q - 0.05, 0, 0.1], armR: [Q - 0.05, 0, 0.1], elbL: 0.05, elbR: 0.05,
  hipL: [Q, 0, 0.03], hipR: [Q, 0, 0.03], kneeL: -Q, kneeR: -Q,
};

/** Sitting on the floor with both knees at 90°, one leg in front, one to the side. */
export const seated9090: Pose = {
  y: 0.3, pitch: 0.14,
  spine: [-0.06, 0, 0], chest: [-0.04, 0, 0], neck: [-0.04, 0, 0],
  armL: [0.8, -0.3, 0.55], armR: [0.8, -0.3, 0.55], elbL: 0.3, elbR: 0.3,
  hipL: [-1.62, 0.55, 0.3], kneeL: 1.7,
  hipR: [-1.3, 0.55, 0.95], kneeR: 1.9,
};

/** Turn the whole upper body: root, chest and head share the rotation. */
export const turn = (yaw: number): Pose => ({
  yaw: 0.55 * yaw, chest: [0, 0.35 * yaw, 0], neck: [0, 0.1 * yaw, 0],
});
