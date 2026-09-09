import {
  Box3, DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer,
} from "three";
import { COPY } from "../copy";
import { NEUTRAL, VIEWS, sample, type Animation, type FullPose, type Side } from "./pose";
import { buildFloor, buildRig, type Rig } from "./skeleton";

/** How fast the camera slides to a new animation's viewpoint. */
const CAMERA_EASE = 0.06;

/** Something to show before any move has been chosen. */
const IDLE: Animation = { keys: [{}] };

/**
 * The figure that demonstrates each move. It renders into whichever element
 * it is mounted on, and reads its own timing from a phase function so it can
 * follow the session's rep clock or idle at its own pace.
 *
 * If WebGL is unavailable the figure is simply absent — nothing else breaks.
 */
export class Figure {
  private renderer: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private rig: Rig | null = null;
  private host: HTMLElement | null = null;
  private running = false;
  private failed = false;

  private animation: Animation = IDLE;
  private side: Side = 1;
  private phase: () => number = () => performance.now() / 1400;

  private readonly camPos = new Vector3(...VIEWS.front.pos);
  private readonly camAim = new Vector3(...VIEWS.front.aim);
  private readonly camPosGoal = this.camPos.clone();
  private readonly camAimGoal = this.camAim.clone();
  private readonly box = new Box3();

  /** Attach to a container and start rendering. */
  mount(host: HTMLElement): void {
    if (!this.init()) {
      // Say so on screen. A blank stage looks like a bug in the app rather
      // than a limit of the device, and a silent one is impossible to report.
      host.replaceChildren();
      const note = document.createElement("p");
      note.className = "stage-note";
      note.textContent = COPY.figureUnavailable;
      host.appendChild(note);
      return;
    }
    const canvas = this.renderer!.domElement;
    this.host = host;
    host.replaceChildren();
    host.appendChild(canvas);
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    this.resize();
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.frame);
    }
  }

  unmount(): void {
    this.running = false;
    this.renderer?.domElement.remove();
    this.host = null;
  }

  /** Show an animation, mirrored for a right-side move. */
  show(animation: Animation, side: Side = 1): void {
    this.animation = animation;
    this.side = side;
    const view = VIEWS[animation.view ?? "front"];
    this.camPosGoal.set(view.pos[0] * (side < 0 ? -1 : 1), view.pos[1], view.pos[2]);
    this.camAimGoal.set(...view.aim);
  }

  /** Supply the time within the current move, in reps (fractional, unbounded). */
  drive(phase: () => number): void {
    this.phase = phase;
  }

  resize(): void {
    if (!this.host || !this.renderer || !this.camera) return;
    const width = this.host.clientWidth || 300;
    const height = this.host.clientHeight || 240;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private init(): boolean {
    if (this.renderer) return true;
    if (this.failed) return false;
    try {
      this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch (error) {
      console.warn("Demonstrator: WebGL unavailable", error);
      this.failed = true;
      return false;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera = new PerspectiveCamera(34, 1, 0.1, 50);

    const scene = new Scene();
    scene.add(new HemisphereLight(0xa9c6be, 0x141f26, 0.85 * Math.PI));
    const key = new DirectionalLight(0xffe9c0, 1.15 * Math.PI);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new DirectionalLight(0x8fb3a6, 0.5 * Math.PI);
    rim.position.set(-4, 2, -3);
    scene.add(rim);
    scene.add(buildFloor());

    this.rig = buildRig();
    scene.add(this.rig.carrier);
    this.scene = scene;
    this.apply(NEUTRAL);
    return true;
  }

  private readonly frame = (): void => {
    if (!this.running || !this.renderer || !this.scene || !this.camera) return;
    requestAnimationFrame(this.frame);

    try {
      this.apply(sample(this.animation, this.phase(), this.side));
      this.ground();
    } catch {
      /* a bad pose must not kill the render loop */
    }

    this.camPos.lerp(this.camPosGoal, CAMERA_EASE);
    this.camAim.lerp(this.camAimGoal, CAMERA_EASE);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camAim);
    this.renderer.render(this.scene, this.camera);
  };

  private apply(q: FullPose): void {
    const rig = this.rig;
    if (!rig) return;

    rig.carrier.position.set(q.x, q.y, q.z);
    rig.carrier.rotation.set(0, q.yaw, 0);
    rig.root.rotation.set(q.pitch, 0, q.roll);
    rig.spine.rotation.set(...q.spine);
    rig.chest.rotation.set(...q.chest);
    rig.neck.rotation.set(...q.neck);

    // The right limbs mirror the left, so twist and side rotations flip.
    rig.armL.rotation.set(q.armL[0], q.armL[1], q.armL[2]);
    rig.armR.rotation.set(q.armR[0], -q.armR[1], -q.armR[2]);
    rig.elbL.rotation.set(q.elbL, 0, 0);
    rig.elbR.rotation.set(q.elbR, 0, 0);
    rig.hipL.rotation.set(q.hipL[0], q.hipL[1], q.hipL[2]);
    rig.hipR.rotation.set(q.hipR[0], -q.hipR[1], -q.hipR[2]);
    rig.kneeL.rotation.set(q.kneeL, 0, 0);
    rig.kneeR.rotation.set(q.kneeR, 0, 0);
  }

  /** Drop the figure onto the floor so it never floats or sinks. */
  private ground(): void {
    const rig = this.rig;
    if (!rig) return;
    rig.carrier.updateMatrixWorld(true);
    const mode = this.animation.ground ?? "feet";
    if (mode === "none") return;
    if (mode === "all") {
      this.box.setFromObject(rig.carrier);
    } else {
      this.box.setFromObject(rig.footL);
      this.box.union(new Box3().setFromObject(rig.footR));
    }
    rig.carrier.position.y -= this.box.min.y;
    rig.carrier.updateMatrixWorld(true);
  }
}
