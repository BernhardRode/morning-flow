// Measures how far the figure actually travels over one repetition, using the
// app's own pose functions and rig, so "the animation doesn't move" can be
// answered in centimetres instead of impressions.
import { Box3, Object3D, Vector3 } from "three";
import { GROUNDING, POSES, type Pose } from "../src/figure/poses.ts";
import { buildRig } from "../src/figure/skeleton.ts";
import type { AnimName } from "../src/types.ts";

const NEUTRAL = {
  x: 0, y: 0.95, z: 0, yaw: 0, pitch: 0, roll: 0,
  spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0],
  armL: [0, 0, 0], armR: [0, 0, 0], elbL: 0, elbR: 0,
  hipL: [0, 0, 0], hipR: [0, 0, 0], kneeL: 0, kneeR: 0,
} as const;

const rig = buildRig();
const box = new Box3();

function apply(pose: Pose) {
  const q = { ...NEUTRAL, ...pose } as Required<Pose>;
  rig.carrier.position.set(q.x, q.y, q.z);
  rig.carrier.rotation.set(0, q.yaw, 0);
  rig.root.rotation.set(q.pitch, 0, q.roll);
  rig.spine.rotation.set(...q.spine);
  rig.chest.rotation.set(...q.chest);
  rig.neck.rotation.set(...q.neck);
  rig.armL.rotation.set(q.armL[0], q.armL[1], q.armL[2]);
  rig.armR.rotation.set(q.armR[0], -q.armR[1], -q.armR[2]);
  rig.elbL.rotation.set(q.elbL, 0, 0);
  rig.elbR.rotation.set(q.elbR, 0, 0);
  rig.hipL.rotation.set(q.hipL[0], q.hipL[1], q.hipL[2]);
  rig.hipR.rotation.set(q.hipR[0], -q.hipR[1], -q.hipR[2]);
  rig.kneeL.rotation.set(q.kneeL, 0, 0);
  rig.kneeR.rotation.set(q.kneeR, 0, 0);
}

function ground(anim: AnimName) {
  rig.carrier.updateMatrixWorld(true);
  const mode = GROUNDING[anim];
  if (mode === "none") return;
  if (mode === "all") box.setFromObject(rig.carrier);
  else {
    box.setFromObject(rig.footL);
    box.union(new Box3().setFromObject(rig.footR));
  }
  rig.carrier.position.y -= box.min.y;
  rig.carrier.updateMatrixWorld(true);
}

const world = (o: Object3D) => o.getWorldPosition(new Vector3());

console.log("anim        headY(cm)  hipY(cm)  handL travel(cm)  footL travel(cm)");
for (const anim of Object.keys(POSES) as AnimName[]) {
  const head: number[] = [], hip: number[] = [];
  const hand: Vector3[] = [], foot: Vector3[] = [];
  for (let i = 0; i < 48; i++) {
    apply(POSES[anim](i / 48, 1));
    ground(anim);
    head.push(world(rig.neck).y);
    hip.push(world(rig.root).y);
    hand.push(world(rig.elbL).clone());
    foot.push(world(rig.footL).clone());
  }
  const span = (v: number[]) => (Math.max(...v) - Math.min(...v)) * 100;
  const travel = (v: Vector3[]) => {
    let max = 0;
    for (const a of v) for (const b of v) max = Math.max(max, a.distanceTo(b));
    return max * 100;
  };
  console.log(
    anim.padEnd(11),
    span(head).toFixed(1).padStart(8),
    span(hip).toFixed(1).padStart(9),
    travel(hand).toFixed(1).padStart(16),
    travel(foot).toFixed(1).padStart(16),
  );
}
