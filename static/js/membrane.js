/*
 * Ideal circular membrane, clamped at the rim.
 *
 * Mode shapes: u_mn(r, θ, t) = J_m(j_mn r) [A cos mθ + B sin mθ] sin(ω_mn t) e^{-t/τ_mn}
 * with j_mn the n-th positive zero of the Bessel function J_m and ω_mn ∝ j_mn
 * (Rayleigh, The Theory of Sound, vol. I, §200–206; Fletcher & Rossing,
 * The Physics of Musical Instruments, 2nd ed., §3.5 and §18.1).
 * Zeros j_mn from Abramowitz & Stegun, Handbook of Mathematical Functions, Table 9.5.
 *
 * A strike at (r0, θ0) is modelled as a velocity impulse; each mode is excited
 * in proportion to its shape at the strike point divided by its norm.
 * No air loading or stiffness: these are ideal-membrane ratios, not measurements.
 */
(function () {
  "use strict";

  const ZEROS = [
    [2.40483, 5.52008, 8.65373],
    [3.83171, 7.01559, 10.17347],
    [5.13562, 8.41724, 11.61984],
    [6.38016, 9.76102],
    [7.58834, 11.06471],
    [8.77148],
    [9.93611],
    [11.08637],
  ];

  // J_m(x) via Bessel's integral, J_m(x) = (1/π) ∫_0^π cos(mτ − x sin τ) dτ (A&S 9.1.21)
  function besselJ(m, x) {
    const N = 96;
    const h = Math.PI / N;
    let s = 0;
    for (let k = 0; k <= N; k++) {
      const t = k * h;
      const w = k === 0 || k === N ? 1 : k % 2 ? 4 : 2;
      s += w * Math.cos(m * t - x * Math.sin(t));
    }
    return (s * h) / 3 / Math.PI;
  }

  const MODES = [];
  ZEROS.forEach((row, m) =>
    row.forEach((j, i) => MODES.push({ m, n: i + 1, j, ratio: j / ZEROS[0][0] }))
  );
  MODES.forEach((md) => {
    const jm1 = besselJ(md.m + 1, md.j);
    md.norm = (md.m === 0 ? Math.PI : Math.PI / 2) * jm1 * jm1;
  });

  const LUT_N = 2048;
  const X_MAX = 11.7;
  const LUT = [];
  for (let m = 0; m < ZEROS.length; m++) {
    const a = new Float32Array(LUT_N + 1);
    for (let i = 0; i <= LUT_N; i++) a[i] = besselJ(m, (i / LUT_N) * X_MAX);
    LUT.push(a);
  }
  const J = (m, x) => {
    const f = (x / X_MAX) * LUT_N;
    const i = Math.min(LUT_N - 1, Math.floor(f));
    const t = f - i;
    return LUT[m][i] * (1 - t) + LUT[m][i + 1] * t;
  };

  class Membrane {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.res = opts.res || 220;
      this.visualHz = opts.visualHz || 0.55;
      this.visualTau = opts.visualTau || 7;
      this.colors = opts.colors;
      this.onStrike = opts.onStrike || (() => {});
      canvas.width = canvas.height = this.res;
      this.img = this.ctx.createImageData(this.res, this.res);
      this.state = MODES.map(() => ({ cr: 0, ci: 0, sr: 0, si: 0 }));
      this.scale = 1e-3;
      this.peak = 0;
      this._precompute();
      this._last = performance.now();
      this.running = false;
      this._scaleDecay = 1;
    }

    _precompute() {
      const R = this.res;
      const P = R * R;
      this.inside = new Uint8Array(P);
      this.cosm = [];
      this.sinm = [];
      for (let m = 0; m < ZEROS.length; m++) {
        this.cosm.push(new Float32Array(P));
        this.sinm.push(new Float32Array(P));
      }
      this.radial = MODES.map(() => new Float32Array(P));
      this.idx = [];
      for (let y = 0; y < R; y++) {
        for (let x = 0; x < R; x++) {
          const p = y * R + x;
          const dx = ((x + 0.5) / R) * 2 - 1;
          const dy = ((y + 0.5) / R) * 2 - 1;
          const r = Math.hypot(dx, dy);
          if (r > 1) continue;
          this.inside[p] = 1;
          this.idx.push(p);
          const th = Math.atan2(dy, dx);
          for (let m = 0; m < ZEROS.length; m++) {
            this.cosm[m][p] = Math.cos(m * th);
            this.sinm[m][p] = Math.sin(m * th);
          }
          MODES.forEach((md, k) => (this.radial[k][p] = J(md.m, md.j * r)));
        }
      }
      this.idx = Uint32Array.from(this.idx);
      this.u = new Float32Array(P);
    }

    // r0 in [0,1), th0 in radians. Returns per-mode excitation for the audio engine.
    strike(r0, th0, force = 1) {
      r0 = Math.min(0.97, Math.max(0, r0));
      const stick = 0.045; // finite contact width, attenuates high modes
      const exc = MODES.map((md, k) => {
        const shape = J(md.m, md.j * r0) * Math.exp(-((md.j * stick) ** 2));
        const a = (force * shape) / md.norm;
        const w = md.ratio;
        const st = this.state[k];
        // velocity impulse → displacement amplitude a/ω
        st.cr += (a * Math.cos(md.m * th0)) / w;
        st.sr += (a * Math.sin(md.m * th0)) / w;
        return { m: md.m, n: md.n, ratio: md.ratio, amp: Math.abs(a) };
      });
      this.peak = 0;
      this.ref = this.magnitude();
      this.onStrike(exc, r0, th0);
      if (!this.running) this.start();
      return exc;
    }

    magnitude() {
      let t = 0;
      this.state.forEach((s) => (t += Math.abs(s.cr) + Math.abs(s.ci) + Math.abs(s.sr) + Math.abs(s.si)));
      return t;
    }

    energies() {
      return MODES.map((md, k) => {
        const s = this.state[k];
        const e = (s.cr * s.cr + s.ci * s.ci + s.sr * s.sr + s.si * s.si) * md.ratio * md.ratio;
        return { m: md.m, n: md.n, ratio: md.ratio, e };
      });
    }

    step(dt) {
      MODES.forEach((md, k) => {
        const s = this.state[k];
        const w = 2 * Math.PI * this.visualHz * md.ratio;
        const decay = Math.exp(-dt / (this.visualTau / Math.pow(md.ratio, 1.15)));
        const c = Math.cos(w * dt) * decay;
        const sn = Math.sin(w * dt) * decay;
        let a = s.cr, b = s.ci;
        s.cr = a * c - b * sn;
        s.ci = a * sn + b * c;
        a = s.sr; b = s.si;
        s.sr = a * c - b * sn;
        s.si = a * sn + b * c;
      });
    }

    render() {
      const R = this.res, u = this.u, idx = this.idx;
      u.fill(0);
      MODES.forEach((md, k) => {
        const s = this.state[k];
        const C = s.ci, S = s.si; // imaginary part = sin(ωt) term
        if (Math.abs(C) + Math.abs(S) < 1e-7) return;
        const rad = this.radial[k], cm = this.cosm[md.m], sm = this.sinm[md.m];
        if (md.m === 0) {
          for (let q = 0; q < idx.length; q++) { const p = idx[q]; u[p] += rad[p] * C; }
        } else {
          for (let q = 0; q < idx.length; q++) { const p = idx[q]; u[p] += rad[p] * (C * cm[p] + S * sm[p]); }
        }
      });
      let mx = 0;
      for (let q = 0; q < idx.length; q++) { const v = Math.abs(u[idx[q]]); if (v > mx) mx = v; }
      // colour scale is fixed per strike so the pattern fades as the head decays
      this.peak = Math.max(this.peak * this._scaleDecay, mx);
      const scale = Math.max(this.peak, 1e-3);
      const vis = Math.min(1, mx / scale * 3);

      const d = this.img.data;
      const [bg, neg, pos, line] = this.colors;
      for (let q = 0; q < idx.length; q++) {
        const p = idx[q];
        let t = u[p] / scale;
        t = Math.max(-1, Math.min(1, t));
        const a = Math.abs(t);
        const tgt = t < 0 ? neg : pos;
        const mix = Math.pow(a, 0.55);
        let rr = bg[0] + (tgt[0] - bg[0]) * mix;
        let gg = bg[1] + (tgt[1] - bg[1]) * mix;
        let bb = bg[2] + (tgt[2] - bg[2]) * mix;
        // isolines of displacement
        // isolines of displacement (the zero level is skipped: it smears along the clamped rim)
        const lv = t * 7;
        const f = Math.abs(((lv + 100.5) % 1) - 0.5);
        const iso = f < 0.07 && Math.abs(lv) > 0.5 ? (1 - f / 0.07) * 0.6 * vis : 0;
        rr += (line[0] - rr) * iso; gg += (line[1] - gg) * iso; bb += (line[2] - bb) * iso;
        const o = p * 4;
        d[o] = rr; d[o + 1] = gg; d[o + 2] = bb; d[o + 3] = 255;
      }
      for (let p = 0; p < R * R; p++) if (!this.inside[p]) d[p * 4 + 3] = 0;
      this.ctx.putImageData(this.img, 0, 0);
    }

    start() {
      this.running = true;
      this._last = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.05, (now - this._last) / 1000);
        this._last = now;
        this.step(dt);
        this._scaleDecay = Math.exp(-dt / (this.visualTau * 2.5));
        this.render();
        if (this.magnitude() < (this.ref || 1) * 0.004) { this.running = false; return; }
        if (this.running) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    stop() { this.running = false; }
  }

  // Modal synthesis: one decaying sinusoid per membrane mode, plus a short noise burst for the stick.
  class DrumVoice {
    constructor() { this.ctx = null; this.f0 = 120; this.enabled = true; }
    _ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        const comp = this.ctx.createDynamicsCompressor();
        this.master.connect(comp).connect(this.ctx.destination);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        comp.connect(this.analyser);
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    }
    play(exc, force = 1) {
      if (!this.enabled) return;
      const ctx = this._ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + 0.005;
      const maxA = Math.max(...exc.map((e) => e.amp)) || 1;
      exc.forEach((e) => {
        const f = this.f0 * e.ratio;
        if (f > ctx.sampleRate / 2.2) return;
        const g = (e.amp / maxA) * 0.32 * force / Math.sqrt(e.ratio);
        if (g < 0.004) return;
        const tau = 0.55 / Math.pow(e.ratio, 1.3);
        const o = ctx.createOscillator();
        const a = ctx.createGain();
        o.frequency.value = f;
        a.gain.setValueAtTime(0, t0);
        a.gain.linearRampToValueAtTime(g, t0 + 0.002);
        a.gain.exponentialRampToValueAtTime(0.0001, t0 + tau * 7);
        o.connect(a).connect(this.master);
        o.start(t0);
        o.stop(t0 + tau * 7 + 0.05);
      });
      const len = Math.floor(ctx.sampleRate * 0.03);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1800;
      const ng = ctx.createGain();
      ng.gain.value = 0.12 * force;
      src.connect(hp).connect(ng).connect(this.master);
      src.start(t0);
    }
  }

  window.Membrane = Membrane;
  window.DrumVoice = DrumVoice;
  window.MEMBRANE_MODES = MODES;
})();
