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

  /**
   * Speech is queued by the browser, so a line spoken while another is still
   * going comes out late. Anything that has to land on a beat — a countdown
   * number, "Los" — passes `interrupt` and cuts whatever is still talking.
   */
  say(text: string, { rate = 1, interrupt = false } = {}): void {
    const api = this.api;
    if (!this.enabled || !api) return;
    if (interrupt) api.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 0.95;
    utterance.lang = "de-DE";
    api.speak(utterance);
  }

  cancel(): void {
    this.api?.cancel();
  }
}
