/** Spoken move announcements, countdown and rep counts. */
export class Voice {
  enabled = true;

  private chosen: SpeechSynthesisVoice | null = null;
  /** Bumped by anything that invalidates a pending utterance. */
  private generation = 0;

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
   * A specific German voice rather than whatever the engine picks from `lang`.
   * Voices load asynchronously, so this keeps looking until one turns up.
   * Preferring a device-local voice also avoids the pauses a network voice
   * introduces mid-countdown.
   */
  private pick(): SpeechSynthesisVoice | null {
    if (this.chosen) return this.chosen;
    const voices = this.api?.getVoices() ?? [];
    if (!voices.length) return null;
    this.chosen =
      voices.find((v) => v.lang === "de-DE" && v.localService)
      ?? voices.find((v) => v.lang === "de-DE")
      ?? voices.find((v) => v.lang.startsWith("de"))
      ?? null;
    return this.chosen;
  }

  /** Queue a line behind whatever is already speaking. */
  say(text: string, rate = 1): void {
    const api = this.api;
    if (!this.enabled || !api) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 0.95;
    utterance.lang = "de-DE";
    const voice = this.pick();
    if (voice) utterance.voice = voice;
    api.speak(utterance);
  }

  /**
   * Clear anything still going, then speak. cancel() only takes effect on the
   * engine's own schedule, so the new line is handed over on the next task
   * rather than in the same one: speaking immediately after cancel() is what
   * produces clipped, garbled or double-sounding output.
   *
   * Used once per move, three seconds ahead of it, so no line is ever cut
   * mid-word close to the beat it belongs to.
   */
  sayNow(text: string, rate = 1): void {
    const api = this.api;
    if (!this.enabled || !api) return;
    const mine = ++this.generation;
    api.cancel();
    setTimeout(() => {
      if (mine === this.generation) this.say(text, rate);
    }, 0);
  }

  cancel(): void {
    this.generation++;
    this.api?.cancel();
  }
}
