/**
 * Dev-only: renders the figure from eight angles at once, so it is obvious
 * whether the model reads as facing towards or away from the camera.
 *
 *   npm run dev  →  http://localhost:5173/turntable.html
 *
 * Not part of the production build: Vite only bundles index.html.
 */
import {
  Box3, DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer,
} from "three";
import { ROUTINE } from "../data/routine";
import { sample, type FullPose } from "../figure/pose";
import { buildFloor, buildRig } from "../figure/skeleton";
import type { Move } from "../types";

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const W = 168, H = 250;

const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(2);
renderer.setSize(W, H, false);

const scene = new Scene();
scene.add(new HemisphereLight(0xa9c6be, 0x141f26, 0.85 * Math.PI));
const key = new DirectionalLight(0xffe9c0, 1.15 * Math.PI);
key.position.set(3, 5, 4);
scene.add(key);
const rim = new DirectionalLight(0x8fb3a6, 0.5 * Math.PI);
rim.position.set(-4, 2, -3);
scene.add(rim);
scene.add(buildFloor());
const rig = buildRig();
scene.add(rig.carrier);

const camera = new PerspectiveCamera(34, W / H, 0.1, 50);
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

const row = document.getElementById("row")!;
const cells = ANGLES.map((deg) => {
  const figure = document.createElement("figure");
  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  const caption = document.createElement("figcaption");
  caption.textContent = deg === 0 ? "0° vorne" : deg === 180 ? "180° hinten" : `${deg}°`;
  figure.append(canvas, caption);
  row.appendChild(figure);
  return { deg, ctx: canvas.getContext("2d")! };
});

const select = document.getElementById("move") as HTMLSelectElement;
ROUTINE.moves.forEach((m, i) => select.add(new Option(m.name, String(i))));
const slider = document.getElementById("t") as HTMLInputElement;
const readout = document.getElementById("tv")!;

function draw() {
  const move = ROUTINE.moves[Number(select.value)]!;
  const cycle = move.animation.cycle ?? 1;
  const t = (Number(slider.value) / 100) * cycle;
  readout.textContent = t.toFixed(2);
  apply(sample(move.animation, t, move.side ?? 1));
  ground(move);
  // Frame the whole figure, then orbit around it.
  box.setFromObject(rig.carrier);
  const centre = box.getCenter(new Vector3());
  const radius = 3.4;
  for (const cell of cells) {
    const a = (cell.deg * Math.PI) / 180;
    camera.position.set(centre.x + Math.sin(a) * radius, centre.y + 0.55, centre.z + Math.cos(a) * radius);
    camera.lookAt(centre);
    renderer.render(scene, camera);
    cell.ctx.clearRect(0, 0, W * 2, H * 2);
    cell.ctx.drawImage(renderer.domElement, 0, 0, W * 2, H * 2);
  }
}

select.addEventListener("change", draw);
slider.addEventListener("input", draw);
draw();
