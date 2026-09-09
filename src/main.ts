import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./style.css";

import { DEFAULT_SPEED, type Speed } from "./config";
import { atSpeed } from "./core/pace";
import { Metronome } from "./audio/metronome";
import { Voice } from "./audio/voice";
import { Session } from "./core/session";
import { ROUTINE } from "./data/routine";
import { createLazyFigure } from "./figure/demonstrator";
import { InstallPrompt } from "./system/install";
import { ScreenWakeLock } from "./system/wake-lock";
import { createDoneScreen } from "./ui/done";
import { el } from "./ui/dom";
import { createHomeScreen } from "./ui/home";
import { currentScreen, onScreen, showScreen } from "./ui/screens";
import { createTrainScreen } from "./ui/train";

const figure = createLazyFigure();
const voice = new Voice();
const metronome = new Metronome();
const wakeLock = new ScreenWakeLock();
const install = new InstallPrompt();

let speed: Speed = DEFAULT_SPEED;
let session: Session | null = null;

/** The routine as it will actually be run, at the chosen pace. */
const routine = () => atSpeed(ROUTINE, speed);

// The demonstrator follows the visible screen.
onScreen((screen) => {
  if (screen === "train") figure.mount(el("trainStage"));
  else figure.unmount();
});
window.addEventListener("resize", () => figure.resize());

const home = createHomeScreen({
  routine: ROUTINE,
  onSpeed(next) {
    speed = next;
    home.render(routine(), speed);
  },
  onStart: () => startSession(),
  onInstall: () => void install.prompt(),
});

install.onAvailable((available) => home.setInstallAvailable(available));

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

home.render(routine(), speed);
showScreen("home");
