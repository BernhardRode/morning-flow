import {
  BoxGeometry, CircleGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial,
  Object3D, SphereGeometry,
} from "three";

const BONE = 0xebe3d4;
const JOINT = 0xd8b15c;
const SKIN = 0xdcd2c0;
const FLOOR = 0x1a2b31;

/**
 * The joints a pose can rotate. Segments hang downwards from their joint, so a
 * rotation of 0 is the neutral standing pose.
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

/** A bone: a tapered cylinder hanging from a ball joint. */
function segment(length: number, radius: number): Segment {
  const node = new Group();
  const bone = new Mesh(
    new CylinderGeometry(radius * 0.82, radius, length, 14),
    new MeshStandardMaterial({ color: BONE, roughness: 0.8, metalness: 0.02 }),
  );
  bone.position.y = -length / 2;
  node.add(bone);
  node.add(new Mesh(
    new SphereGeometry(radius * 1.12, 14, 12),
    new MeshStandardMaterial({ color: JOINT, roughness: 0.55, metalness: 0.15 }),
  ));
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

function flesh(color = SKIN, roughness = 0.85): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness });
}

/** Left arm sits at +X, right arm at -X. */
function buildArm(chest: Object3D, sign: 1 | -1): { arm: Group; elbow: Group } {
  const shoulder = anchor(sign * 0.185, 0.235, 0);
  chest.add(shoulder);
  const upper = segment(0.29, 0.052);
  shoulder.add(upper.node);
  const fore = segment(0.27, 0.045);
  upper.end.add(fore.node);
  const hand = new Mesh(new SphereGeometry(0.055, 12, 10), flesh());
  hand.scale.set(0.8, 1.1, 0.55);
  fore.end.add(hand);
  return { arm: upper.node, elbow: fore.node };
}

function buildLeg(root: Object3D, sign: 1 | -1): { hip: Group; knee: Group; foot: Object3D } {
  const socket = anchor(sign * 0.105, -0.06, 0);
  root.add(socket);
  const thigh = segment(0.44, 0.075);
  socket.add(thigh.node);
  const shin = segment(0.42, 0.058);
  thigh.end.add(shin.node);
  const foot = new Mesh(new BoxGeometry(0.09, 0.05, 0.19), flesh(SKIN, 0.9));
  foot.position.set(0, -0.025, 0.055);
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

export function buildRig(): Rig {
  const carrier = new Object3D();
  const root = anchor(0, 0, 0);
  carrier.add(root);

  const pelvis = new Mesh(new SphereGeometry(0.13, 16, 12), flesh());
  pelvis.scale.set(1.25, 0.8, 0.9);
  root.add(pelvis);

  const spine = anchor(0, 0.05, 0);
  root.add(spine);
  const lumbar = new Mesh(new CylinderGeometry(0.115, 0.135, 0.24, 14), flesh());
  lumbar.position.y = 0.12;
  lumbar.scale.z = 0.78;
  spine.add(lumbar);

  const chest = anchor(0, 0.26, 0);
  spine.add(chest);
  const ribs = new Mesh(new CylinderGeometry(0.155, 0.12, 0.26, 14), flesh());
  ribs.position.y = 0.13;
  ribs.scale.z = 0.72;
  chest.add(ribs);

  const neck = anchor(0, 0.28, 0);
  chest.add(neck);
  const head = new Mesh(new SphereGeometry(0.115, 18, 14), flesh(SKIN, 0.8));
  head.position.y = 0.11;
  head.scale.set(0.92, 1.12, 1);
  neck.add(head);

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
