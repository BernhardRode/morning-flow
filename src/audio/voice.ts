/** Spoken move announcements and rep counts. */
export class Voice {
  enabled = true;

  private get api(): SpeechSynthesis | null {
    return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  }

  /**
   * iOS and some desktop browsers only allow speech that follows a user
   * gesture, so the first utterance is a silent one from the start button.
   */
  unlock(): void {
    const api = this.api;
    if (!api) return;
    const utterance = new SpeechSynthesisUtterance(" ");
    utterance.volume = 0;
    api.speak(utterance);
  }

  say(text: string, rate = 1): void {
    const api = this.api;
    if (!this.enabled || !api) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 0.95;
    utterance.lang = "en-GB";
    api.speak(utterance);
  }

  cancel(): void {
    this.api?.cancel();
  }
}
