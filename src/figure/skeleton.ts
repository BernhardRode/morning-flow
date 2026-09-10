import {
  BufferGeometry, CircleGeometry, CylinderGeometry, Group, LatheGeometry, Mesh,
  MeshStandardMaterial, Object3D, SphereGeometry, Vector2,
} from "three";

/** Warm skin, muted teal for shorts and shoes — the app's own palette, worn. */
const SKIN = 0xdcc8ad;
const CLOTH = 0x2b4650;
const HAIR = 0x3b2f24;
const EYE = 0x2a2320;
const FLOOR = 0x1a2b31;

/**
 * The joints a pose can rotate. Segments hang downwards from their joint, so
 * a rotation of 0 is the neutral standing pose.
 */
export interface Rig {
  /** Moves the whole figure in world space. */
  carrier: Object3D;
  /** Tilts and turns the body as a unit (pitch/roll). */
  root: Object3D;
  spine: Object3D;
  chest: Object3D;
  neck: Object3D;
  armL: Object3D; armR: Object3D;
  elbL: Object3D; elbR: Object3D;
  hipL: Object3D; hipR: Object3D;
  kneeL: Object3D; kneeR: Object3D;
  footL: Object3D; footR: Object3D;
}

const skin = new MeshStandardMaterial({ color: SKIN, roughness: 0.66, metalness: 0 });
const cloth = new MeshStandardMaterial({ color: CLOTH, roughness: 0.92, metalness: 0 });
const hair = new MeshStandardMaterial({ color: HAIR, roughness: 0.8, metalness: 0 });
const eye = new MeshStandardMaterial({ color: EYE, roughness: 0.4, metalness: 0 });

/** A profile point: how wide the body is (metres) at that height. */
type Profile = ReadonlyArray<readonly [number, number]>;

/**
 * Revolves a profile into one continuous surface, then flattens it front to
 * back. A torso built this way has no seams or steps in it — the stacked
 * cylinders it replaces read as a shop mannequin, however well proportioned.
 */
function lathe(profile: Profile, depth: number, segments = 28): BufferGeometry {
  const geometry = new LatheGeometry(profile.map(([r, y]) => new Vector2(Math.max(r, 0.0001), y)), segments);
  geometry.scale(1, 1, depth);
  return geometry;
}

/**
 * Pushes the front (or back) of a surface out over a band of height, most at
 * the centre line and fading to nothing at the sides and the band's edges.
 * This is how the chest and the seat get their shape: as part of the body,
 * rather than as separate masses stuck onto it.
 */
function swell(
  geometry: BufferGeometry,
  { from, to, amount, back = false }: { from: number; to: number; amount: number; back?: boolean },
): BufferGeometry {
  const position = geometry.attributes.position!;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const t = (y - from) / (to - from);
    if (t <= 0 || t >= 1) continue;
    const radius = Math.hypot(x, z);
    if (radius < 1e-6) continue;
    const facing = ((back ? -z : z) / radius) ** 2 * (((back ? -z : z) > 0) ? 1 : 0);
    if (facing <= 0) continue;
    position.setZ(i, z + (back ? -1 : 1) * amount * Math.sin(Math.PI * t) * facing);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function ellipsoid(rx: number, ry: number, rz: number, material = skin): Mesh {
  const m = new Mesh(new SphereGeometry(1, 26, 20), material);
  m.scale.set(rx, ry, rz);
  return m;
}

function anchor(x: number, y: number, z: number): Object3D {
  const o = new Object3D();
  o.position.set(x, y, z);
  return o;
}

interface Segment {
  /** Rotate this to move the segment. */
  node: Group;
  /** Anchor at the far end, where the next segment attaches. */
  end: Object3D;
}

/**
 * The outline of a limb: a rounded cap, a tapered shaft, another rounded cap,
 * as one polyline from the far end back up to the joint.
 */
function limbProfile(length: number, rTop: number, rBottom: number, steps = 7): [number, number][] {
  const points: [number, number][] = [];
  for (let i = steps; i >= 0; i--) {
    const a = (i / steps) * (Math.PI / 2);
    points.push([rBottom * Math.cos(a), -length - rBottom * Math.sin(a)]);
  }
  points.push([rTop, 0]);
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    points.push([rTop * Math.cos(a), rTop * Math.sin(a)]);
  }
  return points;
}

/**
 * A limb, revolved from one outline. Built as a shaft plus two spheres it
 * would carry a shading seam at every joint, which is most of what makes a
 * figure read as a jointed doll rather than a body.
 */
function segment(length: number, rTop: number, rBottom: number): Segment {
  const node = new Group();
  node.add(new Mesh(lathe(limbProfile(length, rTop, rBottom), 1, 22), skin));
  const end = new Object3D();
  end.position.y = -length;
  node.add(end);
  return { node, end };
}

/** Left arm sits at +X, right arm at -X. */
function buildArm(chest: Object3D, sign: 1 | -1): { arm: Group; elbow: Group } {
  const shoulder = anchor(sign * 0.175, 0.245, 0);
  chest.add(shoulder);
  const upper = segment(0.29, 0.058, 0.045);
  shoulder.add(upper.node);
  const fore = segment(0.26, 0.045, 0.034);
  upper.end.add(fore.node);
  const hand = ellipsoid(0.037, 0.072, 0.027);
  hand.position.y = -0.056;
  fore.end.add(hand);
  return { arm: upper.node, elbow: fore.node };
}

function buildLeg(root: Object3D, sign: 1 | -1): { hip: Group; knee: Group; foot: Object3D } {
  const socket = anchor(sign * 0.095, -0.05, 0);
  root.add(socket);
  const thigh = segment(0.44, 0.082, 0.062);
  socket.add(thigh.node);
  // The leg of the shorts, standing a little off the thigh and turning with it.
  const shortsLeg = new Mesh(new CylinderGeometry(0.094, 0.086, 0.2, 24), cloth);
  shortsLeg.position.y = -0.075;
  thigh.node.add(shortsLeg);
  const shin = segment(0.42, 0.058, 0.038);
  thigh.end.add(shin.node);
  const foot = buildFoot();
  shin.end.add(foot);
  return { hip: thigh.node, knee: shin.node, foot };
}

/**
 * A shoe: heel behind the ankle, instep, and a rounded toe well out in front,
 * so which way the figure faces is legible even from straight above.
 */
function buildFoot(): Group {
  const foot = new Group();
  const body = ellipsoid(0.046, 0.034, 0.112, cloth);
  body.position.set(0, -0.016, 0.048);
  const toe = ellipsoid(0.04, 0.026, 0.055, cloth);
  toe.position.set(0, -0.021, 0.126);
  const heel = ellipsoid(0.043, 0.035, 0.046, cloth);
  heel.position.set(0, -0.01, -0.032);
  foot.add(body, toe, heel);
  return foot;
}

/** The ground disc the figure stands on. */
export function buildFloor(): Mesh {
  const floor = new Mesh(
    new CircleGeometry(2.6, 48),
    new MeshStandardMaterial({ color: FLOOR, roughness: 1, transparent: true, opacity: 0.85 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.001;
  return floor;
}

/** A figure of about 1.8m, in roughly seven and a half heads. */
export function buildRig(): Rig {
  const carrier = new Object3D();
  const root = anchor(0, 0, 0);
  carrier.add(root);

  // Hips, in shorts: one surface from the waist to the top of the legs, with
  // a seat at the back — which is half of telling front from behind.
  const hips = new Mesh(swell(lathe([
    [0, -0.15], [0.10, -0.145], [0.16, -0.115], [0.182, -0.065],
    [0.185, -0.01], [0.176, 0.035], [0.148, 0.068], [0.09, 0.088], [0, 0.092],
  ], 0.82), { from: -0.115, to: 0.015, amount: 0.032, back: true }), cloth);
  root.add(hips);

  // Abdomen: waist pulled in, widening towards the ribs.
  const spine = anchor(0, 0.07, 0);
  root.add(spine);
  spine.add(new Mesh(lathe([
    [0, -0.10], [0.085, -0.09], [0.128, -0.05], [0.134, 0], [0.126, 0.07],
    [0.128, 0.13], [0.134, 0.18], [0.130, 0.21], [0.09, 0.24], [0, 0.25],
  ], 0.78), skin));

  // Ribcage, carrying the chest as part of its own surface.
  const chest = anchor(0, 0.22, 0);
  spine.add(chest);
  chest.add(new Mesh(swell(lathe([
    [0, -0.10], [0.095, -0.08], [0.148, -0.02], [0.166, 0.06], [0.178, 0.15],
    [0.176, 0.22], [0.160, 0.27], [0.128, 0.31], [0.082, 0.345], [0.045, 0.36], [0, 0.365],
  ], 0.74), { from: 0.05, to: 0.25, amount: 0.03 }), skin));
  for (const sign of [1, -1] as const) {
    const cap = ellipsoid(0.062, 0.058, 0.056);
    cap.position.set(sign * 0.175, 0.245, 0);
    chest.add(cap);
  }

  // Neck and head.
  const neck = anchor(0, 0.3, 0);
  chest.add(neck);
  const throat = new Mesh(new CylinderGeometry(0.049, 0.058, 0.11, 20, 1, true), skin);
  throat.position.y = 0.04;
  neck.add(throat);

  /**
   * Hair is a slightly larger dome pushed back and up, so it only breaks the
   * surface at the crown, sides and back and leaves the forehead and face
   * bare. It is the cue for which way the figure faces that survives being
   * small, so it does the work the eyes are too few pixels to do.
   */
  const head = new Object3D();
  head.position.set(0, 0.2, 0.012);
  neck.add(head);
  head.add(ellipsoid(0.1, 0.125, 0.112));

  const mop = ellipsoid(0.107, 0.118, 0.115, hair);
  mop.position.set(0, 0.022, -0.02);
  head.add(mop);

  for (const sign of [1, -1] as const) {
    const iris = ellipsoid(0.013, 0.015, 0.009, eye);
    iris.position.set(sign * 0.036, 0.018, 0.104);
    head.add(iris);
  }

  const nose = ellipsoid(0.014, 0.018, 0.026);
  nose.position.set(0, -0.008, 0.106);
  head.add(nose);

  const left = buildArm(chest, 1);
  const right = buildArm(chest, -1);
  const legL = buildLeg(root, 1);
  const legR = buildLeg(root, -1);

  return {
    carrier, root, spine, chest, neck,
    armL: left.arm, armR: right.arm, elbL: left.elbow, elbR: right.elbow,
    hipL: legL.hip, hipR: legR.hip, kneeL: legL.knee, kneeR: legR.knee,
    footL: legL.foot, footR: legR.foot,
  };
}
