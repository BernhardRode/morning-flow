import { clock, moveSeconds } from "../core/format";
import type { Routine } from "../types";
import { el } from "./dom";

export interface Settings {
  voice: boolean;
  click: boolean;
}

export interface HomeScreen {
  render(activeIndex: number): void;
  settings(): Settings;
  /** Show or hide the install button. */
  setInstallAvailable(available: boolean): void;
}

export function createHomeScreen(opts: {
  routines: readonly Routine[];
  onSelect(index: number): void;
  onLearn(): void;
  onStart(): void;
  onInstall(): void;
}): HomeScreen {
  const picker = el("picker");
  const title = el("homeTitle");
  const lede = el("homeLede");
  const list = el<HTMLUListElement>("moveList");
  const voiceOn = el<HTMLInputElement>("voiceOn");
  const clickOn = el<HTMLInputElement>("clickOn");

  const installBtn = el<HTMLButtonElement>("installBtn");

  installBtn.addEventListener("click", opts.onInstall);
  el("learnBtn").addEventListener("click", opts.onLearn);
  el("startBtn").addEventListener("click", opts.onStart);

  function render(activeIndex: number): void {
    const routine = opts.routines[activeIndex];
    if (!routine) return;

    picker.replaceChildren(...opts.routines.map((r, i) => {
      const pill = document.createElement("button");
      pill.className = i === activeIndex ? "pill sel" : "pill";
      pill.textContent = r.label;
      pill.addEventListener("click", () => opts.onSelect(i));
      return pill;
    }));

    // The title carries its own line break and emphasis.
    title.innerHTML = routine.title;
    lede.textContent = routine.lede;

    list.replaceChildren(...routine.moves.map((move, i) => {
      const row = document.createElement("li");
      const number = document.createElement("span");
      number.className = "n";
      number.textContent = String(i + 1);
      const name = document.createElement("span");
      name.textContent = move.name;
      const dose = document.createElement("span");
      dose.className = "d";
      dose.textContent = `${move.reps} ×  ${clock(moveSeconds(move))}`;
      row.append(number, name, dose);
      return row;
    }));
  }

  return {
    render,
    settings: () => ({ voice: voiceOn.checked, click: clickOn.checked }),
    setInstallAvailable(available) {
      installBtn.hidden = !available;
    },
  };
}
