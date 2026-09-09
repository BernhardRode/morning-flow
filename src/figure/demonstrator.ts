import type { Animation, Side } from "./pose";
import { Figure } from "./figure";

/** What the screens need from the demonstrator. */
export interface Demonstrator {
  mount(host: HTMLElement): void;
  unmount(): void;
  show(animation: Animation, side?: Side): void;
  /** Supply the time within the current move, in reps (fractional, unbounded). */
  drive(phase: () => number): void;
  resize(): void;
}

/** A phase function that loops freely, one rep every `seconds`. */
export const idle = (seconds: number) => (): number => performance.now() / 1000 / seconds;

/**
 * The figure ships in the main bundle on purpose. It used to be a lazily
 * loaded chunk, and that broke on every deploy: the service worker updates
 * itself immediately, drops the previous build's chunks from its cache, and
 * a page that was already open then asks for a chunk that no longer exists
 * anywhere. One payload means a page always has all the code it will need.
 */
export function createFigure(): Demonstrator {
  return new Figure();
}
