/** The pace click: a short blip on every rep, brighter on counted reps. */
export class Metronome {
  enabled = true;
  private context: AudioContext | null = null;

  /** Create or resume the audio context — must run inside a user gesture. */
  resume(): void {
    if (!this.enabled) return;
    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.context = new Ctor();
      } catch {
        return;
      }
    }
    if (this.context.state === "suspended") void this.context.resume();
  }

  click(strong: boolean): void {
    const ctx = this.context;
    if (!this.enabled || !ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = strong ? 900 : 620;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(strong ? 0.3 : 0.13, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }
}
