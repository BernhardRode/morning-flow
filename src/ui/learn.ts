import { clock, moveSeconds } from "../core/format";
import { idle, type Demonstrator } from "../figure/demonstrator";
import type { Move } from "../types";
import { el } from "./dom";

export interface LearnScreen {
  open(moves: readonly Move[]): void;
}

/** How slowly the demonstrator loops while you read the cues. */
const MIN_DEMO_SECONDS = 1.3;

export function createLearnScreen(opts: {
  figure: Demonstrator;
  onExit(): void;
  onStart(): void;
}): LearnScreen {
  const position = el("learnPos");
  const name = el("learnName");
  const why = el("learnWhy");
  const cues = el("learnCues");
  const dose = el("learnDose");
  const prev = el<HTMLButtonElement>("learnPrev");
  const next = el<HTMLButtonElement>("learnNext");

  let moves: readonly Move[] = [];
  let index = 0;

  function render(): void {
    const move = moves[index];
    if (!move) return;

    position.textContent = `Move ${index + 1} of ${moves.length}`;
    name.textContent = move.name;
    why.textContent = move.why;
    cues.replaceChildren(...move.cues.map((cue) => {
      const row = document.createElement("div");
      const dash = document.createElement("span");
      dash.textContent = "—";
      row.append(dash, document.createTextNode(cue));
      return row;
    }));
    dose.textContent = `${move.reps} reps at about ${move.secPerRep}s each — ${clock(moveSeconds(move))}.`;

    opts.figure.show(move.anim, move.side ?? 1);
    opts.figure.drive(idle(Math.max(move.secPerRep, MIN_DEMO_SECONDS)));

    prev.style.visibility = index ? "visible" : "hidden";
    next.textContent = index === moves.length - 1 ? "Start the flow" : "Next";
  }

  prev.addEventListener("click", () => {
    if (index > 0) {
      index--;
      render();
    }
  });
  next.addEventListener("click", () => {
    if (index < moves.length - 1) {
      index++;
      render();
    } else {
      opts.onStart();
    }
  });
  el("learnExit").addEventListener("click", opts.onExit);

  return {
    open(list) {
      moves = list;
      index = 0;
      render();
    },
  };
}
