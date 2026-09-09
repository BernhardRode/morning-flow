import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./style.css";

import { Metronome } from "./audio/metronome";
import { Voice } from "./audio/voice";
import { Session } from "./core/session";
import { ROUTINES } from "./data/routines";
import { createLazyFigure } from "./figure/demonstrator";
import { InstallPrompt } from "./system/install";
import { ScreenWakeLock } from "./system/wake-lock";
import { createDoneScreen } from "./ui/done";
import { el } from "./ui/dom";
import { createHomeScreen } from "./ui/home";
import { createLearnScreen } from "./ui/learn";
import { currentScreen, onScreen, showScreen } from "./ui/screens";
import { createTrainScreen } from "./ui/train";

const figure = createLazyFigure();
const voice = new Voice();
const metronome = new Metronome();
const wakeLock = new ScreenWakeLock();
const install = new InstallPrompt();

let routineIndex = 0;
let session: Session | null = null;

const routine = () => ROUTINES[routineIndex]!;

// The demonstrator follows the visible screen.
onScreen((screen) => {
  if (screen === "train") figure.mount(el("trainStage"));
  else if (screen === "learn") figure.mount(el("learnStage"));
  else figure.unmount();
});
window.addEventListener("resize", () => figure.resize());

const home = createHomeScreen({
  routines: ROUTINES,
  onSelect(index) {
    routineIndex = index;
    home.render(routineIndex);
  },
  onLearn() {
    showScreen("learn");
    learn.open(routine().moves);
  },
  onStart: () => startSession(),
  onInstall: () => void install.prompt(),
});

install.onAvailable((available) => home.setInstallAvailable(available));

const learn = createLearnScreen({
  figure,
  onExit: () => showScreen("home"),
  onStart: () => startSession(),
});

const train = createTrainScreen({
  figure,
  voice,
  metronome,
  onEnd() {
    endSession();
    showScreen("home");
  },
  onFinish(result) {
    session = null;
    wakeLock.release();
    done.render(result);
    showScreen("done");
  },
});

const done = createDoneScreen({
  onAgain: () => startSession(),
  onHome: () => showScreen("home"),
});

function startSession(): void {
  const settings = home.settings();
  voice.enabled = settings.voice;
  metronome.enabled = settings.click;
  // Both need a user gesture to come alive, and we are inside a click here.
  metronome.resume();
  voice.unlock();
  void wakeLock.acquire();

  session = new Session(routine());
  showScreen("train");
  train.run(session);
}

function endSession(): void {
  session?.stop();
  session = null;
  wakeLock.release();
}

// Re-acquire the wake lock when coming back to a running session — the browser
// drops it whenever the page is hidden.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (session && !session.isPaused && currentScreen() === "train") void wakeLock.acquire();
});

home.render(routineIndex);
showScreen("home");
