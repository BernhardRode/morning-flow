export type ScreenName = "home" | "learn" | "train" | "done";

const listeners = new Set<(screen: ScreenName) => void>();
let current: ScreenName = "home";

export const currentScreen = (): ScreenName => current;

export function onScreen(listener: (screen: ScreenName) => void): void {
  listeners.add(listener);
}

export function showScreen(screen: ScreenName): void {
  current = screen;
  for (const section of document.querySelectorAll<HTMLElement>(".screen")) {
    section.classList.toggle("on", section.id === screen);
  }
  for (const listener of listeners) listener(screen);
}
