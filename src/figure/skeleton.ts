import {
  BoxGeometry, CircleGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial,
  Object3D, SphereGeometry,
} from "three";

/** Warm skin, dark shorts and shoes — the app's own palette, worn. */
const SKIN = 0xe2d4bf;
const CLOTH = 0x1b2e34;
const HAIR = 0x33281e;
const EYE = 0x1c1c1c;
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

interface Segment {
  /** Rotate this to move the segment. */
  node: Group;
  /** Anchor at the far end, where the next segment attaches. */
  end: Object3D;
}

const skin = new MeshStandardMaterial({ color: SKIN, roughness: 0.72, metalness: 0 });
const cloth = new MeshStandardMaterial({ color: CLOTH, roughness: 0.95, metalness: 0 });
const hair = new MeshStandardMaterial({ color: HAIR, roughness: 0.85, metalness: 0 });
const eye = new MeshStandardMaterial({ color: EYE, roughness: 0.35, metalness: 0 });

/**
 * A limb segment: a tapered shaft with a rounded cap at each end, all in one
 * colour, so joints read as flesh rather than as separate balls.
 */
function segment(length: number, rTop: number, rBottom: number, material = skin): Segment {
  const node = new Group();
  const shaft = new Mesh(new CylinderGeometry(rTop, rBottom, length, 18, 1, true), material);
  shaft.position.y = -length / 2;
  node.add(shaft);
  node.add(new Mesh(new SphereGeometry(rTop, 18, 14), material));
  const tip = new Mesh(new SphereGeometry(rBottom, 18, 14), material);
  tip.position.y = -length;
  node.add(tip);
  const end = new Object3D();
  end.position.y = -length;
  node.add(end);
  return { node, end };
}

function anchor(x: number, y: number, z: number): Object3D {
  const o = new Object3D();
  o.position.set(x, y, z);
  return o;
}

function ellipsoid(rx: number, ry: number, rz: number, material = skin): Mesh {
  const m = new Mesh(new SphereGeometry(1, 24, 18), material);
  m.scale.set(rx, ry, rz);
  return m;
}

/** Left arm sits at +X, right arm at -X. */
function buildArm(chest: Object3D, sign: 1 | -1): { arm: Group; elbow: Group } {
  const shoulder = anchor(sign * 0.19, 0.25, 0);
  chest.add(shoulder);
  const upper = segment(0.29, 0.052, 0.044);
  shoulder.add(upper.node);
  const fore = segment(0.26, 0.042, 0.034);
  upper.end.add(fore.node);
  const hand = ellipsoid(0.042, 0.085, 0.024);
  hand.position.y = -0.055;
  fore.end.add(hand);
  return { arm: upper.node, elbow: fore.node };
}

/**
 * A shoe, not a block: heel behind the ankle, instep, and a rounded toe well
 * out in front. From any angle it says which way the figure is facing.
 */
function buildFoot(): Group {
  const foot = new Group();
  const sole = new Mesh(new BoxGeometry(0.085, 0.04, 0.19), cloth);
  sole.position.set(0, -0.02, 0.045);
  const toe = ellipsoid(0.042, 0.026, 0.055, cloth);
  toe.position.set(0, -0.016, 0.135);
  const heel = ellipsoid(0.04, 0.032, 0.04, cloth);
  heel.position.set(0, -0.012, -0.04);
  const instep = ellipsoid(0.043, 0.038, 0.06, cloth);
  instep.position.set(0, 0.006, 0.01);
  foot.add(sole, toe, heel, instep);
  return foot;
}

function buildLeg(root: Object3D, sign: 1 | -1): { hip: Group; knee: Group; foot: Object3D } {
  const socket = anchor(sign * 0.095, -0.05, 0);
  root.add(socket);
  const thigh = segment(0.44, 0.08, 0.062);
  socket.add(thigh.node);
  // Shorts: a cloth sleeve over the top of the thigh that turns with it.
  const shortsLeg = new Mesh(new CylinderGeometry(0.098, 0.088, 0.17, 18, 1, true), cloth);
  shortsLeg.position.y = -0.085;
  thigh.node.add(shortsLeg);
  const shin = segment(0.42, 0.058, 0.04);
  thigh.end.add(shin.node);
  const foot = buildFoot();
  shin.end.add(foot);
  return { hip: thigh.node, knee: shin.node, foot };
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

/** A figure of about 1.8m, in roughly seven-and-a-half heads. */
export function buildRig(): Rig {
  const carrier = new Object3D();
  const root = anchor(0, 0, 0);
  carrier.add(root);

  // Pelvis, in shorts.
  const pelvis = ellipsoid(0.165, 0.11, 0.115, cloth);
  pelvis.position.y = -0.01;
  root.add(pelvis);

  // Abdomen: narrow at the waist, filling out towards the ribs.
  const spine = anchor(0, 0.07, 0);
  root.add(spine);
  const abdomen = new Mesh(new CylinderGeometry(0.125, 0.115, 0.22, 20, 1, true), skin);
  abdomen.position.y = 0.11;
  abdomen.scale.z = 0.8;
  spine.add(abdomen);

  // Ribcage: widest at the shoulders, flattened front to back.
  const chest = anchor(0, 0.22, 0);
  spine.add(chest);
  const ribs = new Mesh(new CylinderGeometry(0.165, 0.13, 0.28, 20, 1, true), skin);
  ribs.position.y = 0.14;
  ribs.scale.z = 0.74;
  chest.add(ribs);
  const cap = ellipsoid(0.165, 0.06, 0.122);
  cap.position.y = 0.28;
  chest.add(cap);
  // Pectorals, proud of the ribcage: front and back stop being mirror images.
  for (const sign of [1, -1] as const) {
    const pec = ellipsoid(0.085, 0.038, 0.042);
    pec.position.set(sign * 0.071, 0.183, 0.079);
    chest.add(pec);
  }
  for (const sign of [1, -1] as const) {
    const shoulder = new Mesh(new SphereGeometry(0.062, 18, 14), skin);
    shoulder.position.set(sign * 0.19, 0.25, 0);
    chest.add(shoulder);
  }

  // Neck and head.
  const neck = anchor(0, 0.3, 0);
  chest.add(neck);
  const throat = new Mesh(new CylinderGeometry(0.05, 0.056, 0.1, 16, 1, true), skin);
  throat.position.y = 0.04;
  neck.add(throat);
  /**
   * The head carries the strongest cue for which way the figure is facing:
   * hair over the crown and back, a face on the front. The hair is a slightly
   * larger dome pushed backwards, so it only breaks the surface at the top,
   * sides and back and leaves the face bare — no cutting required.
   */
  const head = new Object3D();
  head.position.set(0, 0.2, 0.012);
  neck.add(head);
  head.add(ellipsoid(0.1, 0.125, 0.112));

  const mop = ellipsoid(0.106, 0.129, 0.114, hair);
  mop.position.set(0, 0.006, -0.024);
  head.add(mop);

  for (const sign of [1, -1] as const) {
    const iris = ellipsoid(0.016, 0.018, 0.011, eye);
    iris.position.set(sign * 0.037, 0.016, 0.102);
    head.add(iris);
  }

  const nose = ellipsoid(0.016, 0.021, 0.03);
  nose.position.set(0, -0.012, 0.108);
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
