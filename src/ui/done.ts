import { COPY } from "../copy";
import { clock } from "../core/format";
import { el } from "./dom";

export interface DoneScreen {
  render(result: { totalReps: number; totalSeconds: number }): void;
}

export function createDoneScreen(opts: {
  onAgain(): void;
  onHome(): void;
}): DoneScreen {
  el("againBtn").addEventListener("click", opts.onAgain);
  el("homeBtn").addEventListener("click", opts.onHome);

  return {
    render({ totalReps, totalSeconds }) {
      el("doneTitle").textContent = COPY.done.title(totalReps);
      el("doneLine").textContent = COPY.done.line(totalReps, clock(totalSeconds));
    },
  };
}
