import { DURATION, scoreAt } from "./timeline.js";
import { PARAMS, CUES } from "./choreography.js";
import { createRecording, recordSample, sampleAt } from "./replay.js";

const $ = selector => document.querySelector(selector);
const paper = $("#paper");
const canvas = $("#ink");
const fx = $("#fx");
const paperCtx = paper.getContext("2d");
const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
const fxCtx = fx.getContext("2d", { alpha: true });
const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d", { alpha: true });

const ui = {
  experience: $("#experience"), intro: $("#intro"), playStart: $("#playStart"),
  scrubber: $("#scrubber"), fill: $("#scrubberFill"), dot: $("#scrubberDot"),
  credits: $("#creditsButton"), dialog: $("#aboutDialog"),
  replayBadge: $("#replayBadge"), endUrl: $("#endUrl"),
  endRestart: $("#endRestart"), endReplay: $("#endReplay")
};

// Fixed 120 Hz simulation; canvas-stamping overlays run at 60 Hz so their
// density is identical on any display refresh rate.
const FIXED_DT = 1 / 120;
const OVERLAY_DT = 1 / 60;
const MAX_STEPS_PER_FRAME = 8;
const INK = [18, 18, 20];
const INK_CORE = [10, 10, 12];
const LIGHT = [216, 214, 208];
const BLUE_WASH = [96, 138, 164];
const RED_INK = [178, 40, 44];

// ---------------------------------------------------------------------------
// Sprites recovered from the reference build (see README asset notes).
// ---------------------------------------------------------------------------

const CREATURE_ASSETS = {
  photoFigure: "assets/words/chica.jpg", birds: "assets/creatures/pajaros.png",
  koi: "assets/creatures/pezmancha.png", minnows: "assets/creatures/pececillo.png",
  surco: "assets/words/surcos.jpg", wax: "assets/creatures/cera.png",
  zipper: "assets/creatures/cremallera.png", tickles: "assets/words/cosquillas.jpg",
  bigO: "assets/creatures/Ogrande.png", bubbles: "assets/creatures/burbuja.png",
  waterRings: "assets/creatures/Ondasagua.png", splash: "assets/creatures/salpico.png",
  memories: "assets/creatures/recuerdo_b.png", teardrop: "assets/creatures/lagrima.png",
  lips: "assets/creatures/labios.png", butterflies: "assets/creatures/mariposa.png",
  dandelions: "assets/creatures/dandelion.png", holeIn: "assets/creatures/Entradaagujero.png",
  holeOut: "assets/creatures/Salidaagujero.png", wire: "assets/creatures/alambre.png",
  uno: "assets/creatures/uno.png"
};
const WORD_ASSETS = {
  aire: "aire.jpg", surco: "surcos.jpg", surcos: "surcos.jpg", pequenitos: "pequenitos.jpg",
  derretida: "derretida.jpg", cosquillas: "cosquillas.jpg", cosquilla: "cosquillas.jpg",
  acomodo: "acomodo.jpg", rias: "rias.jpg", cuelo: "cuelo.jpg", enredo: "enredo.jpg",
  avisar: "avisar.jpg", agua: "agua.jpg", bebes: "bebes.jpg", atraganto: "atraganto.jpg",
  respiras: "respiras.jpg", tragas: "tragas.jpg", enaguas: "enaguas.jpg",
  fantasias: "fantasias.jpg", memoria: "memoria.jpg", imposible: "imposible.jpg",
  construyo: "construyo.jpg", futuro: "futuro.jpg", improvisado: "improvisado.jpg",
  unoyuno: "unoyuno.jpg"
};
// size: fraction of viewport width · hold: brush pauses while the mark lands
// print: stamp once with a fade-in (ink print); otherwise light moving stamps
const CREATURE_CONFIG = {
  photoFigure: { size: .16, life: 3, hold: .3, print: true }, birds: { size: .045, life: 6 },
  koi: { size: .24, life: 3.2, hold: .3, print: true }, minnows: { size: .03, life: 2.6 },
  surco: { size: .12, life: 3, hold: .3, print: true }, wax: { size: .3, life: 3.4, hold: .32, print: true },
  zipper: { size: .13, life: 3, print: true }, tickles: { size: .14, life: 3, hold: .3, print: true },
  bigO: { size: .14, life: 3, hold: .3, print: true }, bubbles: { size: .035, life: 3.4, rise: .12 },
  waterRings: { size: .18, life: 3.2, hold: .3, print: true }, splash: { size: .16, life: 2.6, hold: .3, burst: true, print: true },
  memories: { size: .06, life: 2.4, print: true }, teardrop: { size: .07, life: 3, hold: .3, print: true },
  lips: { size: .22, life: 4.5, hold: .35, print: true }, butterflies: { size: .055, life: 4.5 },
  dandelions: { size: .05, life: 6, print: true }, holeIn: { size: .13, life: 2.6, hold: .25, print: true },
  holeOut: { size: .13, life: 2.6, hold: .25, print: true }, wire: { size: .16, life: 3, print: true },
  uno: { size: .08, life: 3, print: true }, word: { size: .13, life: 3, hold: .35, print: true }
};

const spriteCache = new Map();
function loadSprite(src) {
  if (spriteCache.has(src)) return spriteCache.get(src);
  const image = new Image();
  image.src = src;
  spriteCache.set(src, image);
  return image;
}
for (const src of Object.values(CREATURE_ASSETS)) loadSprite(src);
for (const file of Object.values(WORD_ASSETS)) loadSprite(`assets/words/${file}`);
const paperTexture = loadSprite("assets/textures/paper.jpg");

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  width: innerWidth, height: innerHeight, dpr: 1, scale: 1,
  running: false, paused: false, muted: false,
  time: 0, previousTime: 0, accumulator: 0, overlayAcc: 0,
  beatPhase: 0, beatFlash: 0, energy: .2, score: null,
  pointer: { x: innerWidth * .55, y: innerHeight * .5, lastMove: -1e9, blend: 0 },
  brush: { x: innerWidth * .55, y: innerHeight * .5, vx: 0, vy: 0, px: innerWidth * .55, py: innerHeight * .5, nibT: 0, previousSpeed: 0, dirAngle: 0, widthEMA: 0, prevWidth: 0 },
  wavePhase: 0, particles: [], figures: [], pools: [],
  dropTimer: 0, holdUntil: 0, holdPoint: null,
  recording: null, replay: null,
  raf: 0, lastFrame: performance.now(), seed: Math.random() * 1000, rng: null,
  shiftCarry: 0
};
const resetRng = () => { state.rng = mulberry32((state.seed * 7919) | 0); };
const rand = () => (state.rng ? state.rng() : Math.random());

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const noise = n => Math.sin(n * 12.9898 + state.seed) * .5 + Math.sin(n * 3.171 + 4.2) * .5;
const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

// Recovered choreography: interpolate pressure / velocity / climax keyframes.
function paramAt(seconds) {
  if (!PARAMS.length) return { presion: .5, velocidad: 1, climax: 0 };
  const t = clamp(seconds, PARAMS[0].t, PARAMS[PARAMS.length - 1].t);
  let lo = 0, hi = PARAMS.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (PARAMS[mid].t <= t) lo = mid; else hi = mid;
  }
  const a = PARAMS[lo], b = PARAMS[hi];
  const k = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0;
  return {
    presion: lerp(a.presion, b.presion, k),
    velocidad: lerp(a.velocidad, b.velocidad, k),
    climax: lerp(a.climax, b.climax, k)
  };
}

function cuesBetween(from, to) {
  if (to < from) return [];
  return CUES.filter(cue => cue.at > from && cue.at <= to);
}

class Soundscape {
  constructor() { this.context = null; this.master = null; this.nodes = []; }
  async start() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = state.muted ? 0 : .12;
      this.master.connect(this.context.destination);
      this.build();
    }
    if (this.context.state === "suspended") await this.context.resume();
  }
  build() {
    const ctxA = this.context;
    const pad = ctxA.createOscillator();
    const fifth = ctxA.createOscillator();
    const filter = ctxA.createBiquadFilter();
    const gain = ctxA.createGain();
    pad.type = "sine"; fifth.type = "triangle";
    pad.frequency.value = 110; fifth.frequency.value = 164.81;
    filter.type = "lowpass"; filter.frequency.value = 520; filter.Q.value = .7;
    gain.gain.value = .22;
    pad.connect(filter); fifth.connect(filter); filter.connect(gain); gain.connect(this.master);
    pad.start(); fifth.start();
    this.nodes.push(pad, fifth, filter, gain);
  }
  thump(intensity = .5) {
    if (!this.context || !this.master) return;
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + .14);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(.02, intensity * .5), t + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, t + .2);
    osc.connect(gain); gain.connect(this.master);
    osc.start(t); osc.stop(t + .24);
  }
  update(time, energy) {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(state.muted ? 0 : .05 + energy * .08, now, .18);
    const [pad, fifth, filter] = this.nodes;
    pad.frequency.setTargetAtTime(98 + Math.sin(time * .071) * 12, now, .3);
    fifth.frequency.setTargetAtTime(146.83 + Math.sin(time * .043) * 18, now, .4);
    filter.frequency.setTargetAtTime(320 + energy * 1150, now, .12);
  }
  suspend() { if (this.context?.state === "running") this.context.suspend(); }
  resume() { if (this.context?.state === "suspended") this.context.resume(); }
}
const soundscape = new Soundscape();

function resize() {
  state.width = innerWidth; state.height = innerHeight;
  state.dpr = Math.min(devicePixelRatio || 1, 2);
  state.scale = state.width / 640;
  for (const target of [paper, canvas, fx, buffer]) {
    target.width = Math.floor(state.width * state.dpr);
    target.height = Math.floor(state.height * state.dpr);
    if (target.style) { target.style.width = `${state.width}px`; target.style.height = `${state.height}px`; }
  }
  paperCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  fxCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  bufferCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  makePaper();
}

function makePaper() {
  paperCtx.clearRect(0, 0, state.width, state.height);
  paperCtx.fillStyle = "#e1dfda";
  paperCtx.fillRect(0, 0, state.width, state.height);
  if (paperTexture.complete && paperTexture.naturalWidth) {
    paperCtx.save();
    paperCtx.globalAlpha = .95;
    paperCtx.globalCompositeOperation = "multiply";
    const ratio = Math.max(state.width / paperTexture.naturalWidth, state.height / paperTexture.naturalHeight);
    const w = paperTexture.naturalWidth * ratio, h = paperTexture.naturalHeight * ratio;
    paperCtx.drawImage(paperTexture, (state.width - w) / 2, (state.height - h) / 2, w, h);
    paperCtx.restore();
  }
  // warm stain + soft dark blooms + grain, in the manner of the reference paper
  paperCtx.save();
  paperCtx.globalCompositeOperation = "multiply";
  paperCtx.fillStyle = "rgba(214,205,188,.14)";
  paperCtx.fillRect(0, 0, state.width, state.height);
  for (const [bx, by, bw, bh, alpha] of [
    [.12, .2, .3, .38, .045], [.72, .62, .34, .3, .04], [.9, .16, .2, .5, .035], [.35, .85, .4, .22, .03]
  ]) {
    const g = paperCtx.createRadialGradient(state.width * bx, state.height * by, 0, state.width * bx, state.height * by, state.width * bw);
    g.addColorStop(0, `rgba(150,146,138,${alpha})`);
    g.addColorStop(1, "rgba(150,146,138,0)");
    paperCtx.fillStyle = g;
    paperCtx.fillRect(0, 0, state.width, state.height);
  }
  const grain = 140;
  for (let i = 0; i < grain; i++) {
    const x = Math.random() * state.width, y = Math.random() * state.height;
    paperCtx.fillStyle = `rgba(96,92,84,${.02 + Math.random() * .035})`;
    paperCtx.beginPath();
    paperCtx.arc(x, y, .7 + Math.random() * 2.6, 0, Math.PI * 2);
    paperCtx.fill();
  }
  paperCtx.restore();
}

// ---- gesture target: blend user pointer with the choreographed S-wave ----

function brushTarget() {
  if (state.replay) {
    const s = sampleAt(state.replay, state.time);
    return s ? { x: s.x, y: s.y } : { x: state.width * .55, y: state.height * .5 };
  }
  if (state.holdPoint) return state.holdPoint;
  const score = state.score ?? scoreAt(state.time);
  const amp = .17 + score.wave * .13;
  const autoX = state.width * (.58 + Math.sin(state.wavePhase * .9) * .17);
  const autoY = state.height * (.47 + Math.sin(state.wavePhase) * amp + Math.sin(state.wavePhase * 2.3 + 1.3) * .05);
  const k = state.pointer.blend;
  return { x: lerp(autoX, state.pointer.x, k), y: lerp(autoY, state.pointer.y, k) };
}

function updatePointerBlend(dt) {
  const active = performance.now() - state.pointer.lastMove < 1600;
  state.pointer.blend += ((active ? 1 : 0) - state.pointer.blend) * Math.min(1, dt * 2.6);
}

function updateBrush(dt, score) {
  const b = state.brush;
  state.wavePhase += dt * (1.2 + score.wave * 1.3);
  const target = brushTarget();
  const selfLife = (1 - score.wave) * 8 + 6;
  const tx = target.x + noise(state.time * .8) * selfLife;
  const ty = target.y + noise(state.time * .91 + 8) * selfLife;
  const spring = state.holdPoint ? 40 : 15 + score.wave * 9;
  const damping = Math.pow(state.holdPoint ? .00001 : .0004, dt);
  b.vx = (b.vx + (tx - b.x) * spring * dt) * damping;
  b.vy = (b.vy + (ty - b.y) * spring * dt) * damping;
  const maxVelocity = 2800;
  const magnitude = Math.hypot(b.vx, b.vy);
  if (magnitude > maxVelocity) { b.vx *= maxVelocity / magnitude; b.vy *= maxVelocity / magnitude; }
  b.px = b.x; b.py = b.y;
  b.x += b.vx * dt; b.y += b.vy * dt;
  b.x = clamp(b.x, -80, state.width + 80); b.y = clamp(b.y, -80, state.height + 80);
  b.nibT += dt;
  if (!state.replay && state.recording) recordSample(state.recording, state.time, target.x, target.y);
}

function shiftInk(distance) {
  state.shiftCarry += distance * state.dpr;
  const devicePixels = Math.floor(state.shiftCarry);
  if (devicePixels < 1) return;
  state.shiftCarry -= devicePixels;
  const cssShift = devicePixels / state.dpr;
  for (const p of state.pools) p.x -= cssShift;
  for (const p of state.particles) p.x -= cssShift;
  for (const f of state.figures) f.x -= cssShift;
  bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
  bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
  bufferCtx.drawImage(canvas, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(buffer, -devicePixels, 0);
  ctx.restore();
}

// ---- brush model ported from the recovered engine: nib, pressure, dryness ----

function brushMetrics(score, dt) {
  const b = state.brush;
  const params = paramAt(state.time);
  const pressure = clamp(.6 * params.presion + .6 * state.energy, 0, 1);
  const climax = clamp(params.climax + .4 * state.beatFlash, 0, 1);
  const speed = Math.hypot(b.vx, b.vy);
  const speedNorm = clamp(speed / state.width, 0, 1);
  const decel = clamp((b.previousSpeed - speed) / (state.width * .45), 0, 1);
  const hold = state.holdPoint ? 1 : 0;
  const headPool = clamp((1 - speed / (state.width * .26)) * .5 + .3 * decel + .6 * hold, 0, 1);
  const dryness = clamp(.7 * speedNorm + .34 - .5 * headPool, 0, 1);
  // the nib angle follows the smoothed velocity direction; the per-step delta
  // would jitter on 120 Hz micro-segments and shatter the ribbon into blobs
  let delta = Math.atan2(b.vy, b.vx) - b.dirAngle;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  b.dirAngle += delta * Math.min(1, dt * 9);
  const nib = .7 + .85 * Math.sin(.085 * b.nibT * 60);
  const nibFactor = (.28 + .72 * Math.abs(Math.sin(b.dirAngle - nib))) / (.28 + .72 * .637);
  b.previousSpeed = speed;
  const base = state.width * .024;
  const rawWidth = Math.max(base * .3, base * (.22 + 1.46 * pressure + 1.34 * headPool + .42 * climax)
    * (1.24 - .88 * speedNorm) * nibFactor);
  b.widthEMA = b.widthEMA ? b.widthEMA + (rawWidth - b.widthEMA) * Math.min(1, dt * 7) : rawWidth;
  const alpha = clamp(.12 + .58 * pressure + .28 * headPool + .08 * climax, 0, 1);
  return { width: b.widthEMA, alpha, dryness, speed, speedNorm, headPool, climax, pressure };
}

function drawStroke(score, dt) {
  const b = state.brush;
  const m = brushMetrics(score, dt);
  const width = m.width;
  const w0 = b.prevWidth || width;
  // smoothed normal from the nib direction: consecutive quads share edges, so
  // short segments tile into one continuous ribbon instead of round-cap beads
  const nx = Math.cos(b.dirAngle + Math.PI / 2), ny = Math.sin(b.dirAngle + Math.PI / 2);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";

  const ribbon = (offMul, wMul, style) => {
    const w0e = w0 * wMul, w1e = width * wMul;
    if (w1e < .5 && w0e < .5) return;
    ctx.fillStyle = style;
    ctx.beginPath();
    ctx.moveTo(b.px + nx * (offMul * w0 + w0e * .5), b.py + ny * (offMul * w0 + w0e * .5));
    ctx.lineTo(b.x + nx * (offMul * width + w1e * .5), b.y + ny * (offMul * width + w1e * .5));
    ctx.lineTo(b.x + nx * (offMul * width - w1e * .5), b.y + ny * (offMul * width - w1e * .5));
    ctx.lineTo(b.px + nx * (offMul * w0 - w0e * .5), b.py + ny * (offMul * w0 - w0e * .5));
    ctx.closePath();
    ctx.fill();
    // single round cap at the leading edge keeps the head alive between steps
    ctx.beginPath();
    ctx.arc(b.x + nx * offMul * width, b.y + ny * offMul * width, Math.max(.3, w1e * .5), 0, Math.PI * 2);
    ctx.fill();
  };

  // wet bleed underlay
  if (score.wet > .5 && width > 6) ribbon(0, 1.3, rgba(INK, m.alpha * .09 * score.wet));
  // organic tonal drift keeps the ribbon from reading as a flat plastic tube
  const tone = .8 + noise(state.time * 2.7) * .2;
  // main body
  ribbon(0, .94, rgba(INK, m.alpha * .38 * tone));
  // dark core, offset to one side like a loaded nib
  ribbon(-.11, .48, rgba(INK_CORE, m.alpha * .3));
  // dry highlight streaks along the direction of travel
  if (m.speedNorm > .06) {
    ribbon(.06, Math.max(.02, .05), rgba(LIGHT, Math.min(.2, m.alpha * m.speedNorm * .8)));
    ribbon(.16, Math.max(.02, .04), rgba(LIGHT, Math.min(.15, m.alpha * m.speedNorm * .6)));
  }
  // bristle split when the brush runs dry (spatial noise gates the streaks)
  if (m.dryness > .42 && width > 1.6) {
    const streaks = 2 + Math.round(m.dryness * 3);
    for (let i = 0; i < streaks; i++) {
      const gate = Math.abs(Math.sin(.017 * b.x + .031 * b.y + .73 * i * 2.1));
      if (gate < .62) continue;
      const off = -.28 + (i / Math.max(1, streaks - 1)) * .56;
      ribbon(off, Math.max(.02, .03), rgba(LIGHT, m.alpha * m.dryness * .2));
    }
    for (let i = 0; i < 2; i++) {
      ribbon((rand() - .5) * .5, Math.max(.02, .05), rgba(INK_CORE, m.alpha * m.dryness * .18));
    }
  }
  // paper-grain speckles inside the fresh ink keep it from reading as vector
  if (width > 3) {
    const speckles = 3;
    for (let i = 0; i < speckles; i++) {
      const t = rand();
      const sx = lerp(b.px, b.x, t) + nx * (rand() - .5) * width * .8;
      const sy = lerp(b.py, b.y, t) + ny * (rand() - .5) * width * .8;
      ctx.fillStyle = rand() < .5 ? rgba(LIGHT, m.alpha * .07) : rgba(INK_CORE, m.alpha * .06);
      ctx.beginPath(); ctx.arc(sx, sy, .5 + rand() * width * .05, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  b.prevWidth = width;

  // a dwelling brush pools ink outward
  if (m.speed < 150 * state.scale && score.wet > .5 && width > 6) {
    const last = state.pools[state.pools.length - 1];
    if (!last || Math.hypot(last.x - b.x, last.y - b.y) > width * 2.4) {
      if (state.pools.length > 40) state.pools.shift();
      state.pools.push({
        x: b.x, y: b.y, r: width * .5,
        maxR: width * (2 + rand() * 2),
        growth: width * .55, alpha: .05 + score.wet * .05
      });
    }
  }
  const splatColor = INK;
  if (rand() < score.splat * 10 * (.4 + state.energy) * dt) spawnSplatter(b.x, b.y, width, state.energy, splatColor);
}

function stepPools(dt) {
  if (!state.pools.length) return;
  const b = state.brush;
  const speed = Math.hypot(b.vx, b.vy);
  ctx.save(); ctx.globalCompositeOperation = "multiply";
  for (let i = state.pools.length - 1; i >= 0; i--) {
    const p = state.pools[i];
    const near = Math.hypot(b.x - p.x, b.y - p.y) < p.maxR * 1.6;
    if (speed > 260 * state.scale || !near || p.r >= p.maxR) { state.pools.splice(i, 1); continue; }
    const grow = Math.min(p.growth * dt, p.maxR - p.r);
    ctx.strokeStyle = rgba(INK, p.alpha);
    ctx.lineWidth = Math.max(.6, grow * 2);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + grow * .5, 0, Math.PI * 2); ctx.stroke();
    p.r += grow;
  }
  ctx.restore();
}

function spawnSplatter(x, y, width, energy, color = INK, boost = 1) {
  const count = Math.floor((2 + rand() * (4 + energy * 8)) * boost);
  // two or three preferred directions with jitter — ink bursts are lopsided
  const baseAngle = rand() * Math.PI * 2;
  const fanCount = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (i % fanCount) * (Math.PI * 2 / fanCount) + (rand() - .5) * 1.1;
    const force = width * (.5 + Math.pow(rand(), 1.6) * 4.2);
    state.particles.push({ x, y, vx: Math.cos(angle) * force, vy: Math.sin(angle) * force, radius: (.4 + Math.pow(rand(), 2) * 1.6) * width * .12, life: .7 + rand() * 1.8, alpha: .18 + rand() * .45, color });
  }
}

function stepParticles(dt) {
  const decay = Math.pow(.982, dt * 60);
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= decay; p.vy *= decay;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function drawParticles() {
  if (!state.particles.length) return;
  ctx.save(); ctx.globalCompositeOperation = "multiply";
  for (const p of state.particles) {
    const a = p.alpha * clamp(p.life, 0, 1);
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 260) {
      // fast drops streak along their flight direction
      const k = clamp(speed / 900, 0, 1.6);
      ctx.strokeStyle = rgba(p.color ?? INK, a);
      ctx.lineWidth = p.radius * 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * .016 * k, p.y - p.vy * .016 * k);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      ctx.fillStyle = rgba(p.color ?? INK, a);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// ---- semantic figures: sprites stamped onto the ink like real marks ----

function triggerCue(cue) {
  const b = state.brush;
  if (cue.type === "word") {
    const file = WORD_ASSETS[cue.text];
    if (!file) return;
    spawnFigure("word", `assets/words/${file}`, b.x, b.y, { count: 1 });
    return;
  }
  const config = CREATURE_CONFIG[cue.type];
  const asset = CREATURE_ASSETS[cue.type];
  if (!config || !asset) return;
  if (config.hold) {
    state.holdUntil = state.time + config.hold;
    state.holdPoint = { x: b.x, y: b.y };
  }
  if (config.burst) {
    // organic cluster bursts: several origins, big mixed drops, not a radial fan
    for (let cluster = 0; cluster < 4; cluster++) {
      spawnSplatter(b.x + (rand() - .5) * state.width * .14, b.y + (rand() - .5) * state.height * .12,
        state.width * (.018 + rand() * .026), state.energy, INK, 2.6);
    }
  }
  spawnFigure(cue.type, asset, b.x, b.y, { count: cue.count ?? 1, ...config });
}

function spawnFigure(type, src, x, y, { count = 1, size = .12, life = 3, rise = 0, halo = false, print = false }) {
  for (let i = 0; i < count; i++) {
    const img = loadSprite(src);
    state.figures.push({
      type, img, halo, print, x: x + (rand() - .5) * state.width * .18,
      y: y + (rand() - .5) * state.height * .16,
      age: 0, delay: Math.min(i * .09, 1.6), life,
      longSide: size * state.width * (.85 + rand() * .3),
      rot: (rand() - .5) * .7, rise,
      drift: (rand() - .5) * 30, seed: rand() * 100
    });
  }
}

function stepFigures(dt) {
  for (let i = state.figures.length - 1; i >= 0; i--) {
    const f = state.figures[i];
    f.age += dt;
    if (f.age - f.delay > f.life) state.figures.splice(i, 1);
  }
  if (state.holdPoint && state.time > state.holdUntil) state.holdPoint = null;
}

function drawFigures() {
  if (!state.figures.length) return;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (const f of state.figures) {
    if (f.age < f.delay) continue;
    if (f.type === "drip") { drawDrip(f); continue; }
    const img = f.img;
    if (!img.complete || !img.naturalWidth) continue;
    const age = f.age - f.delay;
    // prints land once with a fade-in; movers keep leaving light stamps
    const stampWindow = f.print ? .3 : f.life;
    if (age > stampWindow) continue;
    const alpha = f.print ? clamp(age / .3, 0, 1) * .9 : clamp(age * 4, 0, 1) * .13;
    const scale = f.longSide / Math.max(img.naturalWidth, img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    const x = f.x + f.drift * age - state.time % 1 * 2;
    const y = f.y - (f.rise ? f.rise * state.height * age : 0) + Math.sin(age * 2 + f.seed) * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(f.rot);
    if (f.halo && age < .25) {
      const r = Math.max(w, h) * .85;
      const g = ctx.createRadialGradient(0, 0, r * .3, 0, 0, r);
      g.addColorStop(0, rgba(RED_INK, .07)); g.addColorStop(1, rgba(RED_INK, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();
}

// ---- ephemeral fx layer: brush halo + the blackout silhouette scene ----

function drawFx() {
  fxCtx.clearRect(0, 0, state.width, state.height);
  const mode = state.score?.mode;
  if (mode === "blackout" || (state.time >= 41.8 && state.time <= 42.8)) drawSilhouette();
  if (mode === "stroke" || mode === "drops") drawCursorHalo();
}

function drawCursorHalo() {
  const b = state.brush;
  // the halo ring appears only after the brush has lingered for a moment
  const slow = Math.hypot(b.vx, b.vy) < 220 * state.scale;
  state.cursorDwell = slow ? (state.cursorDwell ?? 0) + OVERLAY_DT : 0;
  if (state.cursorDwell < .35) return;
  const radius = (30 + paramAt(state.time).presion * 26) * state.scale + 12;
  fxCtx.save();
  fxCtx.strokeStyle = "rgba(120,118,112,.16)";
  fxCtx.lineWidth = Math.max(1, 1.2 * state.scale);
  fxCtx.beginPath(); fxCtx.arc(b.x, b.y, radius, 0, Math.PI * 2); fxCtx.stroke();
  fxCtx.fillStyle = "rgba(140,138,132,.045)";
  fxCtx.beginPath(); fxCtx.arc(b.x, b.y, radius, 0, Math.PI * 2); fxCtx.fill();
  fxCtx.restore();
}

// 40-41.8s: black frame with a lit organic window (tree + small figure);
// 41.8-42.8s: back to paper, large hat-man silhouette with branch splatter.
function drawSilhouette() {
  const t = state.time;
  const s = state.scale;
  fxCtx.save();
  if (t < 41.8) {
    const cx = state.width * .44, cy = state.height * .5;
    const w = 330 * s, h = 250 * s;
    // irregular ink-washed window carved out of the black (smooth blob edge)
    const g = fxCtx.createRadialGradient(cx, cy, 20, cx, cy, w * .8);
    g.addColorStop(0, "rgba(238,235,228,.98)"); g.addColorStop(.62, "rgba(233,229,221,.92)"); g.addColorStop(.85, "rgba(226,222,213,.55)"); g.addColorStop(1, "rgba(226,222,213,0)");
    fxCtx.fillStyle = g;
    fxCtx.shadowColor = "rgba(240,237,230,.9)";
    fxCtx.shadowBlur = 26 * s;
    fxCtx.beginPath();
    const lobes = 12;
    const points = [];
    for (let i = 0; i < lobes; i++) {
      const a = i / lobes * Math.PI * 2;
      const r = .58 + .1 * Math.sin(a * 3 + 1.2) + .06 * Math.sin(a * 5 + .4);
      points.push({ x: cx + Math.cos(a) * w * r, y: cy + Math.sin(a) * h * r });
    }
    fxCtx.moveTo((points[0].x + points[lobes - 1].x) / 2, (points[0].y + points[lobes - 1].y) / 2);
    for (let i = 0; i < lobes; i++) {
      const p = points[i], q = points[(i + 1) % lobes];
      fxCtx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
    }
    fxCtx.closePath(); fxCtx.fill();
    fxCtx.shadowBlur = 0;
    fxCtx.fillStyle = "#141412"; fxCtx.strokeStyle = "#141412";
    // tree with canopy strokes
    fxCtx.lineWidth = 4.5 * s; fxCtx.lineCap = "round";
    fxCtx.beginPath();
    fxCtx.moveTo(cx - 48 * s, cy + 78 * s);
    fxCtx.quadraticCurveTo(cx - 55 * s, cy - 30 * s, cx - 10 * s, cy - 62 * s);
    fxCtx.moveTo(cx - 42 * s, cy);
    fxCtx.quadraticCurveTo(cx - 8 * s, cy + 12 * s, cx + 28 * s, cy - 34 * s);
    fxCtx.moveTo(cx - 8 * s, cy - 45 * s);
    fxCtx.quadraticCurveTo(cx + 18 * s, cy - 66 * s, cx + 44 * s, cy - 58 * s);
    fxCtx.stroke();
    fxCtx.lineWidth = 2.4 * s;
    fxCtx.beginPath();
    fxCtx.moveTo(cx - 24 * s, cy - 38 * s); fxCtx.lineTo(cx - 34 * s, cy - 58 * s);
    fxCtx.moveTo(cx + 8 * s, cy - 58 * s); fxCtx.lineTo(cx + 4 * s, cy - 74 * s);
    fxCtx.stroke();
    // small figure beneath the tree
    fxCtx.beginPath(); fxCtx.arc(cx + 52 * s, cy + 52 * s, 6.5 * s, 0, Math.PI * 2); fxCtx.fill();
    fxCtx.beginPath();
    fxCtx.moveTo(cx + 46 * s, cy + 82 * s);
    fxCtx.quadraticCurveTo(cx + 45 * s, cy + 56 * s, cx + 52 * s, cy + 57 * s);
    fxCtx.quadraticCurveTo(cx + 59 * s, cy + 56 * s, cx + 58 * s, cy + 82 * s);
    fxCtx.closePath(); fxCtx.fill();
    // black ink splatter framing the window
    for (const [bx, by, n] of [[.08, .12, 7], [.92, .16, 6], [.06, .86, 5], [.9, .88, 7]]) {
      for (let i = 0; i < n; i++) {
        const a = i * 2.4 + bx * 9;
        const rr = (3 + (i % 4) * 3.4) * s;
        fxCtx.beginPath();
        fxCtx.arc(state.width * bx + Math.cos(a) * 26 * s, state.height * by + Math.sin(a) * 20 * s, rr, 0, Math.PI * 2);
        fxCtx.fill();
      }
    }
  } else {
    const cx = state.width * .3, cy = state.height * .56;
    fxCtx.fillStyle = "#141412"; fxCtx.strokeStyle = "#141412";
    const px = cx, py = cy, a = 1.35 * s;
    // organic hat-man silhouette: rounded head, sloped shoulders, long coat
    fxCtx.beginPath();
    fxCtx.arc(px, py - 98 * a, 14.5 * a, 0, Math.PI * 2); fxCtx.fill();
    fxCtx.beginPath();
    fxCtx.moveTo(px - 19 * a, py + 46 * a);
    fxCtx.bezierCurveTo(px - 21 * a, py + 6 * a, px - 15 * a, py - 80 * a, px, py - 82 * a);
    fxCtx.bezierCurveTo(px + 15 * a, py - 80 * a, px + 21 * a, py + 6 * a, px + 19 * a, py + 46 * a);
    fxCtx.bezierCurveTo(px + 8 * a, py + 50 * a, px - 8 * a, py + 50 * a, px - 19 * a, py + 46 * a);
    fxCtx.closePath(); fxCtx.fill();
    // hat with a curved brim
    fxCtx.beginPath();
    fxCtx.moveTo(px - 30 * a, py - 106 * a);
    fxCtx.quadraticCurveTo(px, py - 116 * a, px + 31 * a, py - 105 * a);
    fxCtx.quadraticCurveTo(px + 26 * a, py - 98 * a, px + 12 * a, py - 99 * a);
    fxCtx.quadraticCurveTo(px, py - 112 * a, px - 12 * a, py - 99 * a);
    fxCtx.quadraticCurveTo(px - 25 * a, py - 99 * a, px - 30 * a, py - 106 * a);
    fxCtx.closePath(); fxCtx.fill();
    // arm carrying a bag
    fxCtx.lineWidth = 9 * a; fxCtx.lineCap = "round";
    fxCtx.beginPath();
    fxCtx.moveTo(px + 16 * a, py - 46 * a);
    fxCtx.quadraticCurveTo(px + 34 * a, py - 20 * a, px + 33 * a, py + 18 * a);
    fxCtx.stroke();
    fxCtx.beginPath();
    fxCtx.moveTo(px + 24 * a, py + 18 * a);
    fxCtx.quadraticCurveTo(px + 33 * a, py + 12 * a, px + 42 * a, py + 18 * a);
    fxCtx.lineTo(px + 44 * a, py + 44 * a);
    fxCtx.quadraticCurveTo(px + 33 * a, py + 50 * a, px + 22 * a, py + 44 * a);
    fxCtx.closePath(); fxCtx.fill();
    // branches and ink splatter at the corners
    fxCtx.lineWidth = 3.4 * s; fxCtx.lineCap = "round";
    fxCtx.beginPath();
    fxCtx.moveTo(state.width * .78, state.height * .16);
    fxCtx.quadraticCurveTo(state.width * .88, state.height * .1, state.width * .96, state.height * .2);
    fxCtx.moveTo(state.width * .82, state.height * .15);
    fxCtx.quadraticCurveTo(state.width * .87, state.height * .22, state.width * .95, state.height * .24);
    fxCtx.moveTo(state.width * .8, state.height * .84);
    fxCtx.quadraticCurveTo(state.width * .88, state.height * .9, state.width * .96, state.height * .82);
    fxCtx.stroke();
    for (const [bx, by, n] of [[.82, .1, 6], [.93, .26, 5], [.84, .86, 6]]) {
      for (let i = 0; i < n; i++) {
        const a2 = i * 2.1 + bx * 7;
        fxCtx.beginPath();
        fxCtx.arc(state.width * bx + Math.cos(a2) * 22 * s, state.height * by + Math.sin(a2) * 18 * s, (2.5 + (i % 3) * 3) * s, 0, Math.PI * 2);
        fxCtx.fill();
      }
    }
  }
  fxCtx.restore();
}

// ---- drop mode (148-151s): ink drips falling from above with thin trails ----

function stepDrops(dt) {
  state.dropTimer -= dt;
  if (state.dropTimer > 0) return;
  state.dropTimer = .16 + rand() * .18;
  const x = state.width * (.12 + rand() * .76);
  state.figures.push({
    type: "drip", img: null, x, y: state.height * (.06 + rand() * .1),
    age: 0, delay: 0, life: 1.5 + rand() * .8,
    vy: 90 + rand() * 130, longSide: (2.2 + rand() * 3.4) * state.scale,
    rot: 0, rise: 0, drift: 0, seed: rand() * 100
  });
}

function drawDrip(f) {
  const age = f.age;
  const y = f.y + f.vy * age + 120 * age * age;
  const tail = Math.min(170 * state.scale, age * 400 * state.scale);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.strokeStyle = rgba(INK, .2);
  ctx.lineWidth = Math.max(.5, f.longSide * .26);
  ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, y - f.longSide); ctx.stroke();
  ctx.fillStyle = rgba(INK, .5);
  ctx.beginPath(); ctx.arc(f.x, y, f.longSide, 0, Math.PI * 2); ctx.fill();
  // splash when the drop lands
  if (!f.splashed && age > f.life * .75) {
    f.splashed = true;
    spawnSplatter(f.x, y, 2.4 * state.scale, .2, INK, 1.6);
  }
  ctx.restore();
}

function fadeInk(amount) {
  if (amount <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = `rgba(0,0,0,${clamp(amount, 0, .18)})`; ctx.fillRect(0, 0, state.width, state.height); ctx.restore();
}

// ---- fixed-timestep loop ----

function step(dt) {
  state.previousTime = state.time;
  state.time += dt;
  if (state.time >= DURATION) { finish(); return; }
  const score = scoreAt(state.time);
  state.score = score;
  const params = paramAt(state.time);

  if (score.bpm > 1) {
    state.beatPhase += dt * score.bpm / 60;
    if (state.beatPhase >= 1) {
      state.beatPhase -= 1;
      state.beatFlash = 1;
      soundscape.thump(clamp(.25 + score.splat * .85, 0, 1));
      if (score.splat > .18) spawnSplatter(state.brush.x, state.brush.y, Math.max(6, state.width * .014), state.energy, score.blue ? BLUE_WASH : INK);
    }
  }
  state.beatFlash = Math.max(0, state.beatFlash - dt * 2.6);
  const phrase = .5 + .5 * Math.sin(state.time * .21 - 1.2);
  state.energy = clamp(.16 + state.beatFlash * .5 + phrase * .26, 0, 1);

  updatePointerBlend(dt);
  updateBrush(dt, score);

  // camera scroll: base % per segment × choreography velocity × energy/climax
  const pointerBias = state.pointer.blend * (state.pointer.x / state.width - .5) * 2;
  const scrollRate = score.scroll / 100 * params.velocidad
    * (1 + .3 * state.energy + .6 * params.climax) * (1 + .4 * pointerBias);

  if (score.mode === "stroke") {
    shiftInk(scrollRate * state.width * dt);
    fadeInk(score.fade * dt * 60);
    if (!state.holdPoint) drawStroke(score, dt);
    stepPools(dt);
  } else if (score.mode === "drops") {
    shiftInk(scrollRate * state.width * dt);
    fadeInk(score.fade * dt * 60);
    stepDrops(dt);
  } else if (score.mode === "fadeout") {
    fadeInk(score.fade * dt * 60);
    if (!state.holdPoint) drawStroke(score, dt);
  }
  stepParticles(dt);
  stepFigures(dt);
  // during the drop interlude the falling drips carry the scene alone
  if (score.mode !== "drops") {
    for (const cue of cuesBetween(state.previousTime, state.time)) triggerCue(cue);
  }
}

function frame() {
  if (!state.running || state.paused) return;
  state.raf = requestAnimationFrame(frame);
  // Single clock: rAF timestamps can carry an offset vs performance.now() in
  // embedded webviews, which would inflate every elapsed delta.
  const now = performance.now();
  let elapsed = (now - state.lastFrame) / 1000;
  state.lastFrame = now;
  if (elapsed < 0) elapsed = 0;
  if (elapsed > .25) elapsed = .25;
  state.accumulator += elapsed;
  let steps = 0;
  while (state.accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
    step(FIXED_DT);
    state.accumulator -= FIXED_DT;
    steps++;
    if (!state.running) break;
  }
  if (steps === MAX_STEPS_PER_FRAME) state.accumulator = 0;
  if (!state.running) return;
  state.overlayAcc += elapsed;
  if (state.overlayAcc >= OVERLAY_DT) {
    drawParticles();
    drawFigures();
    drawFx();
    state.overlayAcc = 0;
  }
  updateChrome();
  soundscape.update(state.time, state.energy);
}

function updateChrome() {
  const mode = state.score?.mode;
  const cl = ui.experience.classList;
  cl.toggle("is-black", mode === "blackout");
  cl.toggle("is-fading", mode === "fadeout");
  cl.toggle("is-end", mode === "fadeout" && state.time >= 233);
  const pct = clamp(state.time / DURATION, 0, 1) * 100;
  ui.fill.style.width = `${pct}%`;
  ui.dot.style.left = `${pct}%`;
  ui.scrubber.setAttribute("aria-valuenow", String(Math.floor(state.time)));
  ui.scrubber.title = `${format(state.time)} / ${format(DURATION)}`;
}

async function start() {
  cancelAnimationFrame(state.raf); clearInk();
  ui.intro.classList.add("is-hidden");
  ui.experience.classList.remove("is-end");
  ui.replayBadge.classList.remove("is-visible");
  ui.endRestart.classList.remove("is-visible"); ui.endReplay.classList.remove("is-visible");
  state.running = true; state.paused = false; state.replay = null;
  state.time = 0; state.previousTime = 0; state.accumulator = 0; state.overlayAcc = 0;
  state.beatPhase = 0; state.beatFlash = 0; state.energy = .2; state.wavePhase = 0;
  state.pointer.blend = 0;
  state.seed = Math.random() * 1000; resetRng();
  state.recording = createRecording({ noise: state.seed }, 1 / FIXED_DT);
  state.dropTimer = 0;
  state.holdUntil = 0; state.holdPoint = null;
  const t = brushTarget();
  state.brush.x = state.brush.px = t.x; state.brush.y = state.brush.py = t.y;
  state.brush.vx = state.brush.vy = 0;
  state.lastFrame = performance.now();
  await soundscape.start(); state.raf = requestAnimationFrame(frame);
}

async function replayRecording() {
  if (!state.recording || state.recording.count === 0) return;
  cancelAnimationFrame(state.raf); clearInk();
  ui.experience.classList.remove("is-end");
  ui.endRestart.classList.remove("is-visible"); ui.endReplay.classList.remove("is-visible");
  ui.replayBadge.classList.add("is-visible");
  state.running = true; state.paused = false;
  state.replay = state.recording;
  state.seed = state.replay.seed.noise; resetRng();
  state.time = 0; state.previousTime = 0; state.accumulator = 0; state.overlayAcc = 0;
  state.beatPhase = 0; state.beatFlash = 0; state.energy = .2; state.wavePhase = 0;
  state.dropTimer = 0;
  state.holdUntil = 0; state.holdPoint = null;
  const s = sampleAt(state.replay, 0);
  state.brush.x = state.brush.px = s.x; state.brush.y = state.brush.py = s.y;
  state.brush.vx = state.brush.vy = 0;
  state.lastFrame = performance.now();
  await soundscape.start(); state.raf = requestAnimationFrame(frame);
}

function togglePause() {
  if (!state.running) return;
  if (!state.paused) {
    state.paused = true; cancelAnimationFrame(state.raf); soundscape.suspend();
  } else {
    state.paused = false; state.lastFrame = performance.now(); soundscape.resume();
    state.raf = requestAnimationFrame(frame);
  }
}

function finish() {
  state.running = false; state.replay = null;
  cancelAnimationFrame(state.raf); soundscape.suspend();
  ui.replayBadge.classList.remove("is-visible");
  setTimeout(() => {
    if (state.recording && state.recording.count > 0) ui.endReplay.classList.add("is-visible");
    ui.endRestart.classList.add("is-visible");
  }, 1400);
}

function clearInk() {
  ctx.clearRect(0, 0, state.width, state.height);
  fxCtx.clearRect(0, 0, state.width, state.height);
  state.particles.length = 0; state.figures.length = 0; state.pools.length = 0; state.shiftCarry = 0;
}

function pointerMove(event) {
  const rect = canvas.getBoundingClientRect();
  state.pointer.x = event.clientX - rect.left;
  state.pointer.y = event.clientY - rect.top;
  state.pointer.lastMove = performance.now();
}

canvas.addEventListener("pointermove", pointerMove, { passive: true });
canvas.addEventListener("pointerdown", pointerMove, { passive: true });
ui.playStart.addEventListener("click", start);
ui.endRestart.addEventListener("click", start);
ui.endReplay.addEventListener("click", replayRecording);
ui.credits.addEventListener("click", () => ui.dialog.showModal());
ui.credits.addEventListener("keydown", event => { if (event.key === "Enter") ui.dialog.showModal(); });
addEventListener("keydown", event => {
  if (event.code === "Space" && state.running) { event.preventDefault(); togglePause(); }
  if (event.key === "m" || event.key === "M") {
    state.muted = !state.muted;
    if (soundscape.master && soundscape.context) soundscape.master.gain.setTargetAtTime(state.muted ? 0 : .1, soundscape.context.currentTime, .1);
  }
});
ui.scrubber.addEventListener("click", event => {
  if (!state.running || state.replay) return;
  const rect = ui.scrubber.getBoundingClientRect();
  const next = clamp((event.clientX - rect.left) / rect.width, 0, 1) * DURATION;
  state.time = next; state.previousTime = next; state.accumulator = 0;
  state.recording = null; // a seeked timeline can't be replayed as one gesture
  state.holdUntil = 0; state.holdPoint = null;
  clearInk();
  state.score = scoreAt(state.time);
  const t = brushTarget();
  state.brush.x = state.brush.px = t.x; state.brush.y = state.brush.py = t.y;
  state.brush.vx = state.brush.vy = 0;
  updateChrome();
});
addEventListener("resize", resize, { passive: true });
document.addEventListener("visibilitychange", () => { if (document.hidden && state.running && !state.paused) togglePause(); });

resize();
window.__inkState = state; // manual testing handle for the canvas experience
