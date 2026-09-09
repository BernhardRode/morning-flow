// Measures how far the figure actually travels over one loop of every move,
// using the app's own animations and rig, so "the animation doesn't move" can
// be answered in centimetres instead of impressions. Also checks that each
// loop closes — a jump between the end of a rep and the start of the next is
// exactly what makes an animation look broken.
//
//   node --experimental-strip-types scripts/pose-range.ts
import { Box3, Object3D, Vector3 } from "three";
import { ROUTINE } from "../src/data/routine";
import { sample, type FullPose } from "../src/figure/pose";
import { buildRig } from "../src/figure/skeleton";
import type { Move } from "../src/types";

const rig = buildRig();
const box = new Box3();

function apply(q: FullPose) {
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

function ground(move: Move) {
  rig.carrier.updateMatrixWorld(true);
  const mode = move.animation.ground ?? "feet";
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
const span = (v: number[]) => (Math.max(...v) - Math.min(...v)) * 100;
/** Largest distance any one point travels — samples alternate left/right. */
const travel = (v: Vector3[]) => {
  let max = 0;
  for (const side of [0, 1]) {
    const pts = v.filter((_, i) => i % 2 === side);
    for (const a of pts) for (const b of pts) max = Math.max(max, a.distanceTo(b));
  }
  return max * 100;
};

console.log("move                              head↕   hips↕   hand   foot   loop-gap");
for (const move of ROUTINE.moves) {
  const cycle = move.animation.cycle ?? 1;
  const head: number[] = [], hip: number[] = [], hand: Vector3[] = [], foot: Vector3[] = [];
  const steps = 48 * cycle;
  for (let i = 0; i < steps; i++) {
    apply(sample(move.animation, (i / steps) * cycle, move.side ?? 1));
    ground(move);
    head.push(world(rig.neck).y);
    hip.push(world(rig.root).y);
    // Whichever side is working — a mirrored move works the right.
    hand.push(world(rig.elbL).clone(), world(rig.elbR).clone());
    foot.push(world(rig.footL).clone(), world(rig.footR).clone());
  }
  // Does the loop close? Compare a hair before its end with a hair after its start.
  apply(sample(move.animation, cycle - 0.001, move.side ?? 1)); ground(move);
  const endHand = world(rig.elbL), endHead = world(rig.neck);
  apply(sample(move.animation, 0.001, move.side ?? 1)); ground(move);
  const gap = Math.max(endHand.distanceTo(world(rig.elbL)), endHead.distanceTo(world(rig.neck))) * 100;

  console.log(
    move.name.padEnd(32),
    (span(head).toFixed(1) + "cm").padStart(7),
    (span(hip).toFixed(1) + "cm").padStart(7),
    (travel(hand).toFixed(0) + "cm").padStart(6),
    (travel(foot).toFixed(0) + "cm").padStart(6),
    (gap.toFixed(1) + "cm").padStart(9),
    gap > 2 ? "  <- jumps" : "",
  );
}
