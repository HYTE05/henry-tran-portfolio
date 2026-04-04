import * as THREE from "three";

const MODE_DEAD = 0;
const MODE_SMOKE = 1;
const MODE_ATTRACT = 2;
const MODE_BLOOM = 3;
const MODE_STATIC = 4;

const SMOKE_MAX_LIFE = 2.1;

export class SmokeParticleEngine {
  readonly count: number;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;

  private positions: Float32Array;
  private velocities: Float32Array;
  private modes: Uint8Array;
  private smokeLife: Float32Array;
  private opacities: Float32Array;
  private sizes: Float32Array;
  private targetX: Float32Array;
  private targetY: Float32Array;
  private bloomX: Float32Array;
  private bloomY: Float32Array;

  private width = 1;
  private height = 1;

  private ro: globalThis.ResizeObserver | null = null;
  private host: HTMLElement;

  constructor(host: HTMLElement, particleCount: number) {
    this.host = host;
    this.count = particleCount;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -50, 50);

    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 2);
    this.modes = new Uint8Array(this.count);
    this.smokeLife = new Float32Array(this.count);
    this.opacities = new Float32Array(this.count);
    this.sizes = new Float32Array(this.count);
    this.targetX = new Float32Array(this.count);
    this.targetY = new Float32Array(this.count);
    this.bloomX = new Float32Array(this.count);
    this.bloomY = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      this.modes[i] = MODE_DEAD;
      this.opacities[i] = 0;
      this.sizes[i] = 1.8 + Math.random() * 2.4;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    this.geometry.setAttribute(
      "aOpacity",
      new THREE.BufferAttribute(this.opacities, 1).setUsage(THREE.DynamicDrawUsage),
    );
    this.geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(this.sizes, 1).setUsage(THREE.DynamicDrawUsage),
    );

    this.material = new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: THREE.NormalBlending,
      uniforms: {
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
      vertexShader: `
        uniform float uPixelRatio;
        attribute float aOpacity;
        attribute float aSize;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = aSize * uPixelRatio * 1.25;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.15, d) * vOpacity;
          gl_FragColor = vec4(0.95, 0.95, 0.98, a);
        }
      `,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    host.appendChild(this.renderer.domElement);
    this.styleCanvas();

    this.ro = new window.ResizeObserver(() => this.onResize());
    this.ro.observe(host);
    this.onResize();
  }

  private styleCanvas() {
    const c = this.renderer.domElement;
    c.style.position = "absolute";
    c.style.inset = "0";
    c.style.width = "100%";
    c.style.height = "100%";
    c.style.display = "block";
    c.style.pointerEvents = "none";
    /* Above section background, below copy / plane (z-10+) */
    c.style.zIndex = "5";
  }

  private onResize() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    const halfW = w / 2;
    const halfH = h / 2;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
  }

  /** Pixel coords: origin top-left of host → Three (center origin, Y up). */
  private toWorld(px: number, py: number, out: { x: number; y: number }) {
    out.x = px - this.width / 2;
    out.y = this.height / 2 - py;
  }

  private tmpWorld = { x: 0, y: 0 };

  emitSmoke(px: number, py: number, vx: number, vy: number, rate: number, dt: number) {
    const nSpawn = Math.min(14, Math.floor(rate * dt * 60) + (Math.random() < rate ? 1 : 0));
    let spawned = 0;
    for (let i = 0; i < this.count && spawned < nSpawn; i++) {
      if (this.modes[i] !== MODE_DEAD) continue;
      this.toWorld(px, py, this.tmpWorld);
      const i3 = i * 3;
      const i2 = i * 2;
      const jitter = 3;
      this.positions[i3] = this.tmpWorld.x + (Math.random() - 0.5) * jitter;
      this.positions[i3 + 1] = this.tmpWorld.y + (Math.random() - 0.5) * jitter;
      this.positions[i3 + 2] = 0;
      this.velocities[i2] = vx + (Math.random() - 0.5) * 30;
      this.velocities[i2 + 1] = vy + (Math.random() - 0.5) * 30;
      this.modes[i] = MODE_SMOKE;
      this.smokeLife[i] = 0;
      this.opacities[i] = 0.35 + Math.random() * 0.45;
      spawned++;
    }
  }

  /**
   * Snap all particles into attract mode toward screen-space targets (pairs px,py top-left).
   */
  beginFormation(screenTargets: Float32Array) {
    const pairs = Math.floor(screenTargets.length / 2);
    for (let i = 0; i < this.count; i++) {
      const tIdx = (i % pairs) * 2;
      const px = screenTargets[tIdx] ?? 0;
      const py = screenTargets[tIdx + 1] ?? 0;
      this.toWorld(px, py, this.tmpWorld);
      this.targetX[i] = this.tmpWorld.x;
      this.targetY[i] = this.tmpWorld.y;
      const i3 = i * 3;
      const spread = 220;
      this.positions[i3] = this.tmpWorld.x + (Math.random() - 0.5) * spread;
      this.positions[i3 + 1] = this.tmpWorld.y + (Math.random() - 0.5) * spread;
      this.positions[i3 + 2] = 0;
      this.velocities[i * 2] = 0;
      this.velocities[i * 2 + 1] = 0;
      this.modes[i] = MODE_ATTRACT;
      this.smokeLife[i] = 0;
      this.opacities[i] = 0.55 + Math.random() * 0.4;
    }
  }

  /** After letters settle: gentle outward bloom then caller sets STATIC. */
  beginBloom(strength: number) {
    let cx = 0;
    let cy = 0;
    let n = 0;
    for (let i = 0; i < this.count; i++) {
      if (this.modes[i] !== MODE_ATTRACT) continue;
      const i3 = i * 3;
      cx += this.positions[i3];
      cy += this.positions[i3 + 1];
      n++;
    }
    if (n === 0) return;
    cx /= n;
    cy /= n;

    for (let i = 0; i < this.count; i++) {
      if (this.modes[i] !== MODE_ATTRACT) continue;
      const i3 = i * 3;
      const x = this.positions[i3];
      const y = this.positions[i3 + 1];
      let dx = x - cx;
      let dy = y - cy;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const mag = strength * (0.65 + Math.random() * 0.85);
      this.bloomX[i] = x + dx * mag;
      this.bloomY[i] = y + dy * mag;
      this.modes[i] = MODE_BLOOM;
    }
  }

  freezeStatic() {
    for (let i = 0; i < this.count; i++) {
      if (this.modes[i] === MODE_BLOOM || this.modes[i] === MODE_ATTRACT) {
        this.modes[i] = MODE_STATIC;
        this.velocities[i * 2] = 0;
        this.velocities[i * 2 + 1] = 0;
      }
    }
  }

  attractSettled(epsilon: number): boolean {
    let found = false;
    let maxD2 = 0;
    for (let i = 0; i < this.count; i++) {
      if (this.modes[i] !== MODE_ATTRACT) continue;
      found = true;
      const i3 = i * 3;
      const dx = this.targetX[i] - this.positions[i3];
      const dy = this.targetY[i] - this.positions[i3 + 1];
      maxD2 = Math.max(maxD2, dx * dx + dy * dy);
    }
    return found && maxD2 < epsilon * epsilon;
  }

  bloomSettled(epsilon: number): boolean {
    let found = false;
    let maxD2 = 0;
    for (let i = 0; i < this.count; i++) {
      if (this.modes[i] !== MODE_BLOOM) continue;
      found = true;
      const i3 = i * 3;
      const dx = this.bloomX[i] - this.positions[i3];
      const dy = this.bloomY[i] - this.positions[i3 + 1];
      maxD2 = Math.max(maxD2, dx * dx + dy * dy);
    }
    return found && maxD2 < epsilon * epsilon;
  }

  update(dt: number) {
    const drag = Math.pow(0.88, dt * 60);
    const kAttract = 26;
    const dAttract = 5.2;
    const kBloom = 18;
    const dBloom = 6;

    for (let i = 0; i < this.count; i++) {
      const mode = this.modes[i];
      const i3 = i * 3;
      const i2 = i * 2;

      if (mode === MODE_DEAD) {
        this.opacities[i] = 0;
        continue;
      }

      if (mode === MODE_SMOKE) {
        this.velocities[i2] *= drag;
        this.velocities[i2 + 1] *= drag;
        this.positions[i3] += this.velocities[i2] * dt;
        this.positions[i3 + 1] += this.velocities[i2 + 1] * dt;
        this.smokeLife[i] += dt;
        const u = this.smokeLife[i] / SMOKE_MAX_LIFE;
        this.opacities[i] *= Math.pow(0.985, dt * 60);
        if (this.smokeLife[i] > SMOKE_MAX_LIFE || u > 1) {
          this.modes[i] = MODE_DEAD;
          this.opacities[i] = 0;
        }
        continue;
      }

      if (mode === MODE_ATTRACT) {
        const x = this.positions[i3];
        const y = this.positions[i3 + 1];
        const tx = this.targetX[i];
        const ty = this.targetY[i];
        const ax = (tx - x) * kAttract - this.velocities[i2] * dAttract;
        const ay = (ty - y) * kAttract - this.velocities[i2 + 1] * dAttract;
        this.velocities[i2] += ax * dt;
        this.velocities[i2 + 1] += ay * dt;
        this.positions[i3] += this.velocities[i2] * dt;
        this.positions[i3 + 1] += this.velocities[i2 + 1] * dt;
        continue;
      }

      if (mode === MODE_BLOOM) {
        const x = this.positions[i3];
        const y = this.positions[i3 + 1];
        const tx = this.bloomX[i];
        const ty = this.bloomY[i];
        const ax = (tx - x) * kBloom - this.velocities[i2] * dBloom;
        const ay = (ty - y) * kBloom - this.velocities[i2 + 1] * dBloom;
        this.velocities[i2] += ax * dt;
        this.velocities[i2 + 1] += ay * dt;
        this.positions[i3] += this.velocities[i2] * dt;
        this.positions[i3 + 1] += this.velocities[i2 + 1] * dt;
        continue;
      }

      if (mode === MODE_STATIC) {
        // hold
      }
    }

    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const opAttr = this.geometry.attributes.aOpacity as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    opAttr.needsUpdate = true;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.ro?.disconnect();
    this.ro = null;
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.host) {
      this.host.removeChild(this.renderer.domElement);
    }
  }
}
