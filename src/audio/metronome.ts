/**
 * The pace click: a short blip on every rep, brighter on counted reps.
 *
 * Clicks are placed on the audio clock ahead of time rather than fired from
 * the session tick, so they land sample-accurately whatever the main thread
 * is doing. A tick-driven click would wander by up to a whole tick, which at
 * a rhythmic pace is audible unevenness.
 */
export class Metronome {
  enabled = true;
  private context: AudioContext | null = null;
  private readonly pending = new Set<OscillatorNode>();

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

  /**
   * Schedule a click for a moment on the page's clock (`performance.now()`,
   * ms). Moments already past play immediately.
   */
  clickAt(pageMs: number, strong: boolean): void {
    const ctx = this.context;
    if (!this.enabled || !ctx) return;
    // Both clocks are read "now", so the difference maps page time onto the
    // audio timeline to within the call's own latency.
    const at = Math.max(ctx.currentTime, ctx.currentTime + (pageMs - performance.now()) / 1000);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = strong ? 900 : 620;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(strong ? 0.3 : 0.13, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.09);

    this.pending.add(osc);
    osc.onended = () => {
      this.pending.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };
  }

  /** Silence anything scheduled but not yet played — on pause or skip. */
  cancel(): void {
    for (const osc of this.pending) {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    }
    this.pending.clear();
  }
}
