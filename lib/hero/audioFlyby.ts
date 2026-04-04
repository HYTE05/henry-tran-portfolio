/**
 * Lightweight spatial "flyby" using Web Audio API.
 * Panner follows plane X mapped roughly to stereo space.
 *
 * AUDIO SWAP INSTRUCTIONS (Phase 5):
 * ===================================
 * The synthesized noise below works as a placeholder, but for launch:
 *
 * 1. Find a CC0 aerobatic flyby sound:
 *    - Go to https://freesound.org
 *    - Search: "aerobatic flyby" or "jet flyby"
 *    - Filter by License: "Creative Commons 0"
 *    - Download as MP3 + OGG (for fallback)
 *    - Max file size: ~200kb each
 *
 * 2. Add files to the project:
 *    - /public/audio/flyby.mp3
 *    - /public/audio/flyby.ogg (optional fallback)
 *
 * 3. Replace the `playPass()` method below with the commented code at the bottom.
 *    The panner/gain routing will remain identical — only the source changes.
 *
 * 4. Test in the browser and adjust gain/EQ as needed.
 */

export class FlybyAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private panner: StereoPannerNode | PannerNode | null = null;
  private useStereo = false;
  private audioBuffer: AudioBuffer | null = null;

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
   * CURRENT: One-shot filtered noise burst; duration ~140–220 ms.
   * `speed01` in [0,1] scales perceived loudness.
   *
   * TODO: Replace with the commented code below once CC0 audio is added.
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

/*
 * ============================================================================
 * REPLACEMENT CODE FOR playPass() — Use after adding CC0 audio files
 * ============================================================================
 *
 * async playPassWithAudio(speed01: number) {
 *   if (!this.ctx || !this.master) return;
 *
 *   // Load audio buffer once
 *   if (!this.audioBuffer) {
 *     try {
 *       const response = await fetch("/audio/flyby.mp3");
 *       const arrayBuffer = await response.arrayBuffer();
 *       this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
 *     } catch (err) {
 *       console.error("Failed to load flyby audio:", err);
 *       return;
 *     }
 *   }
 *
 *   const src = this.ctx.createBufferSource();
 *   src.buffer = this.audioBuffer;
 *   src.playbackRate.value = 0.8 + speed01 * 0.4; // Vary pitch slightly
 *
 *   const gain = this.ctx.createGain();
 *   const g0 = 0.001;
 *   const peak = 0.4 + speed01 * 0.3;
 *   const t0 = this.ctx.currentTime;
 *   gain.gain.setValueAtTime(g0, t0);
 *   gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.05);
 *   gain.gain.exponentialRampToValueAtTime(g0, t0 + this.audioBuffer.duration);
 *
 *   src.connect(gain);
 *   gain.connect(this.master);
 *
 *   src.start(t0);
 * }
 */
