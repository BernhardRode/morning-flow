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
      el("doneTitle").textContent = `${totalReps} done.`;
      el("doneLine").textContent =
        `${totalReps} reps in ${clock(totalSeconds)}. The routine only works if tomorrow looks the same.`;
    },
  };
}
