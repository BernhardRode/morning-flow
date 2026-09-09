import type { AnimName, Side } from "../types";
import type { Figure } from "./figure";

/**
 * What the screens need from the demonstrator. Keeping it an interface lets
 * three.js stay out of the initial bundle — see `createLazyFigure` below.
 */
export interface Demonstrator {
  mount(host: HTMLElement): void;
  unmount(): void;
  show(anim: AnimName, side?: Side): void;
  drive(phase: () => number): void;
  resize(): void;
}

/** A phase function that loops freely, one cycle every `seconds`. */
export const idle = (seconds: number) => (): number =>
  ((performance.now() / 1000) % seconds) / seconds;

/**
 * Stands in for the real figure until it is needed. three.js is ~500 kB, and
 * the home screen doesn't draw anything, so the renderer is fetched on the
 * first mount and the calls made in the meantime are replayed onto it.
 */
export function createLazyFigure(): Demonstrator {
  let figure: Figure | null = null;
  let loading = false;
  let host: HTMLElement | null = null;
  let lastShow: [AnimName, Side] | null = null;
  let lastDrive: (() => number) | null = null;

  function load(): void {
    if (figure || loading) return;
    loading = true;
    void import("./figure")
      .then(({ Figure: Ctor }) => {
        loading = false;
        figure = new Ctor();
        if (lastShow) figure.show(lastShow[0], lastShow[1]);
        if (lastDrive) figure.drive(lastDrive);
        if (host) figure.mount(host);
      })
      .catch(() => {
        // No demonstrator, then. The session itself is unaffected.
        loading = false;
      });
  }

  return {
    mount(next) {
      host = next;
      if (figure) figure.mount(next);
      else load();
    },
    unmount() {
      host = null;
      figure?.unmount();
    },
    show(anim, side = 1) {
      lastShow = [anim, side];
      figure?.show(anim, side);
    },
    drive(phase) {
      lastDrive = phase;
      figure?.drive(phase);
    },
    resize() {
      figure?.resize();
    },
  };
}
