/** The event Chromium fires when the app is installable. Not in lib.dom yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Home-screen install, where the browser offers it. Chromium hands us an
 * event we can replay from a button; Safari has no equivalent, so there the
 * button simply never appears and installing stays in the Share menu.
 */
export class InstallPrompt {
  private event: BeforeInstallPromptEvent | null = null;
  private listener: ((available: boolean) => void) | null = null;

  constructor() {
    window.addEventListener("beforeinstallprompt", (event) => {
      // Keep the browser's own mini-infobar from taking over the page.
      event.preventDefault();
      this.event = event as BeforeInstallPromptEvent;
      this.listener?.(true);
    });
    window.addEventListener("appinstalled", () => {
      this.event = null;
      this.listener?.(false);
    });
  }

  /** Called with whether an install can be offered right now. */
  onAvailable(listener: (available: boolean) => void): void {
    this.listener = listener;
    listener(this.event !== null);
  }

  async prompt(): Promise<void> {
    const event = this.event;
    if (!event) return;
    // An install prompt can only be shown once per event.
    this.event = null;
    this.listener?.(false);
    await event.prompt();
  }
}
