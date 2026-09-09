/**
 * Keeps the screen on during a session. Unsupported browsers and rejected
 * requests are non-events — the session just runs with the screen timeout.
 */
export class ScreenWakeLock {
  private sentinel: WakeLockSentinel | null = null;

  async acquire(): Promise<void> {
    if (!("wakeLock" in navigator)) return;
    try {
      this.sentinel = await navigator.wakeLock.request("screen");
    } catch {
      this.sentinel = null;
    }
  }

  release(): void {
    void this.sentinel?.release().catch(() => {});
    this.sentinel = null;
  }
}
