/**
 * Lightweight spatial "flyby" using Web Audio API — no external assets.
 * Panner follows plane X mapped roughly to stereo space.
 */

export class FlybyAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private panner: StereoPannerNode | PannerNode | null = null;
  private useStereo = false;

  /** Call after first user gesture. */
  async unlock(): Promise<void> {
    if (typeof window === "undefined") return;
    const AC =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AC) return;

    if (!this.ctx) {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;

      const pannerSupported =
        typeof PannerNode !== "undefined" &&
        typeof this.ctx.createPanner === "function";

      if (pannerSupported) {
        const p = this.ctx.createPanner();
        p.panningModel = "HRTF";
        p.distanceModel = "linear";
        p.refDistance = 1;
        p.maxDistance = 10000;
        p.rolloffFactor = 0;
        p.coneInnerAngle = 360;
        p.coneOuterAngle = 0;
        p.positionZ.setValueAtTime(-0.8, this.ctx.currentTime);
        this.panner = p;
        this.master.connect(p);
        p.connect(this.ctx.destination);
      } else {
        this.useStereo = true;
        const s = this.ctx.createStereoPanner();
        this.panner = s;
        this.master.connect(s);
        s.connect(this.ctx.destination);
      }
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  /** nx in [-1, 1] from screen space (left / right). */
  setPanFromNormalizedX(nx: number) {
    if (!this.ctx || !this.panner) return;
    const t = Math.max(-1, Math.min(1, nx));
    const now = this.ctx.currentTime;

    if (this.useStereo && this.panner instanceof StereoPannerNode) {
      this.panner.pan.setTargetAtTime(t * 0.85, now, 0.03);
      return;
    }

    if (this.panner instanceof PannerNode) {
      this.panner.positionX.setTargetAtTime(t * 1.2, now, 0.03);
    }
  }

  /**
   * One-shot filtered noise burst; duration ~140–220 ms.
   * `speed01` in [0,1] scales perceived loudness.
   */
  playPass(speed01: number) {
    if (!this.ctx || !this.master) return;

    const duration = 0.18;
    const sampleRate = this.ctx.sampleRate;
    const n = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, n, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < n; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200 + speed01 * 800;
    bp.Q.value = 0.7;

    const gain = this.ctx.createGain();
    const g0 = 0.001;
    const peak = 0.55 + speed01 * 0.35;
    const t0 = this.ctx.currentTime;
    gain.gain.setValueAtTime(g0, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(g0, t0 + duration);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.master);

    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }

  dispose() {
    if (this.ctx) {
      void this.ctx.close();
    }
    this.ctx = null;
    this.master = null;
    this.panner = null;
  }
}
