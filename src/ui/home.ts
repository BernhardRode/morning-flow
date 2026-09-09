import { SPEEDS, type Speed } from "../config";
import { atSpeed } from "../core/pace";
import { clock, moveSeconds, sessionSeconds } from "../core/format";
import type { Routine } from "../types";
import { el } from "./dom";

export interface Settings {
  voice: boolean;
  click: boolean;
}

export interface HomeScreen {
  /** `routine` is already scaled to the chosen pace. */
  render(routine: Routine, speed: Speed): void;
  settings(): Settings;
  /** Show or hide the install button. */
  setInstallAvailable(available: boolean): void;
}

export function createHomeScreen(opts: {
  /** The routine at its own pace — pace options are priced off this. */
  routine: Routine;
  onSpeed(speed: Speed): void;
  onLearn(): void;
  onStart(): void;
  onInstall(): void;
}): HomeScreen {
  const pace = el("pace");
  const title = el("homeTitle");
  const lede = el("homeLede");
  const list = el<HTMLUListElement>("moveList");
  const voiceOn = el<HTMLInputElement>("voiceOn");
  const clickOn = el<HTMLInputElement>("clickOn");

  const installBtn = el<HTMLButtonElement>("installBtn");

  installBtn.addEventListener("click", opts.onInstall);
  el("learnBtn").addEventListener("click", opts.onLearn);
  el("startBtn").addEventListener("click", opts.onStart);

  function render(routine: Routine, speed: Speed): void {
    pace.replaceChildren(...SPEEDS.map((option) => {
      const button = document.createElement("button");
      button.className = option === speed ? "pace-opt sel" : "pace-opt";
      button.setAttribute("aria-pressed", String(option === speed));
      const multiplier = document.createElement("span");
      multiplier.className = "m";
      multiplier.textContent = `${option}×`;
      const length = document.createElement("span");
      length.className = "t";
      length.textContent = clock(sessionSeconds(atSpeed(opts.routine, option).moves));
      button.append(multiplier, length);
      button.addEventListener("click", () => opts.onSpeed(option));
      return button;
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
