import { DURATION, scoreAt, cuesBetween } from "./timeline.js";

const $ = selector => document.querySelector(selector);
const paper = $("#paper");
const canvas = $("#ink");
const paperCtx = paper.getContext("2d");
const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d", { alpha: true });

const ui = {
  intro: $("#intro"), start: $("#startButton"), player: $("#player"),
  play: $("#playButton"), sound: $("#soundButton"), restart: $("#restartButton"),
  endRestart: $("#endRestartButton"), progress: $("#progress"), fill: $("#progressFill"),
  time: $("#timeLabel"), hint: $("#gestureHint"), end: $("#endCard"),
  about: $("#aboutButton"), dialog: $("#aboutDialog")
};

const state = {
  width: innerWidth, height: innerHeight, dpr: 1, running: false, paused: false,
  muted: false, startedAt: 0, pausedAt: 0, time: 0, previousTime: 0,
  pointer: { x: innerWidth * .52, y: innerHeight * .52, active: false, moved: false },
  brush: { x: innerWidth * .48, y: innerHeight * .52, vx: 0, vy: 0, px: innerWidth * .48, py: innerHeight * .52 },
  particles: [], figures: [], raf: 0, lastFrame: performance.now(), seed: Math.random() * 1000
  , shiftCarry: 0
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const noise = n => Math.sin(n * 12.9898 + state.seed) * .5 + Math.sin(n * 3.171 + 4.2) * .5;
const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

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
  update(time, energy) {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(state.muted ? 0 : .06 + energy * .08, now, .18);
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
  for (const target of [paper, canvas, buffer]) {
    target.width = Math.floor(state.width * state.dpr);
    target.height = Math.floor(state.height * state.dpr);
    if (target.style) { target.style.width = `${state.width}px`; target.style.height = `${state.height}px`; }
  }
  paperCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  bufferCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  makePaper();
}

function makePaper() {
  paperCtx.clearRect(0, 0, state.width, state.height);
  const gradient = paperCtx.createRadialGradient(state.width * .54, state.height * .45, 0, state.width * .5, state.height * .5, Math.max(state.width, state.height));
  gradient.addColorStop(0, "#f1eee7"); gradient.addColorStop(.62, "#e8e4dc"); gradient.addColorStop(1, "#d9d5cd");
  paperCtx.fillStyle = gradient; paperCtx.fillRect(0, 0, state.width, state.height);
  paperCtx.save(); paperCtx.globalAlpha = .08;
  for (let y = 0; y < state.height; y += 3) {
    paperCtx.strokeStyle = y % 9 ? "#6b655d" : "#fff";
    paperCtx.lineWidth = .45; paperCtx.beginPath();
    for (let x = -10; x <= state.width + 10; x += 20) {
      const yy = y + Math.sin(x * .025 + y * .11) * 1.2 + Math.random() * .8;
      x === -10 ? paperCtx.moveTo(x, yy) : paperCtx.lineTo(x, yy);
    }
    paperCtx.stroke();
  }
  paperCtx.restore();
}

function energyAt(t) {
  const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 116 / 60)), 7);
  const phrase = .5 + .5 * Math.sin(t * .21 - 1.2);
  return clamp(.22 + beat * .5 + phrase * .28, 0, 1);
}

function updateBrush(dt, score, energy) {
  const p = state.pointer; const b = state.brush;
  const autoX = state.width * (.52 + Math.sin(state.time * .19) * .24);
  const autoY = state.height * (.5 + Math.sin(state.time * .31 + 1.7) * .2);
  const targetX = p.active || p.moved ? p.x : autoX;
  const targetY = p.active || p.moved ? p.y : autoY;
  const selfLife = score.drift * (10 + energy * 20);
  const tx = targetX + noise(state.time * .8) * selfLife;
  const ty = targetY + noise(state.time * .91 + 8) * selfLife;
  const spring = 13 + (1 - score.drift) * 6;
  const damping = Math.pow(.0008, dt);
  b.vx = (b.vx + (tx - b.x) * spring * dt) * damping;
  b.vy = (b.vy + (ty - b.y) * spring * dt) * damping;
  const maxVelocity = 1500;
  const magnitude = Math.hypot(b.vx, b.vy);
  if (magnitude > maxVelocity) { b.vx *= maxVelocity / magnitude; b.vy *= maxVelocity / magnitude; }
  b.px = b.x; b.py = b.y;
  b.x += b.vx * dt; b.y += b.vy * dt;
  b.x = clamp(b.x, -80, state.width + 80); b.y = clamp(b.y, -80, state.height + 80);
}

function shiftInk(distance) {
  state.shiftCarry += distance * state.dpr;
  const devicePixels = Math.floor(state.shiftCarry);
  if (devicePixels < 1) return;
  state.shiftCarry -= devicePixels;
  bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
  bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
  bufferCtx.drawImage(canvas, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(buffer, -devicePixels, 0);
  ctx.restore();
}

function drawStroke(score, energy, dt) {
  const b = state.brush;
  const speed = Math.hypot(b.vx, b.vy);
  const speedShape = clamp(1.18 - speed / 1900, .45, 1.18);
  const width = Math.max(1.3, score.width * (.72 + energy * .55) * speedShape);
  const midX = (b.px + b.x) * .5; const midY = (b.py + b.y) * .5;
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.globalCompositeOperation = "multiply";
  for (let layer = 0; layer < 4; layer++) {
    const jitter = (layer - 1.5) * width * .045;
    ctx.beginPath(); ctx.moveTo(b.px, b.py + jitter);
    ctx.quadraticCurveTo(midX, midY + noise(state.time * 3 + layer) * width * .08, b.x, b.y + jitter);
    ctx.lineWidth = Math.max(.7, width * (1 - layer * .13));
    ctx.strokeStyle = `rgba(16,16,14,${score.alpha * (.2 - layer * .025)})`;
    ctx.stroke();
  }
  ctx.restore();
  if (Math.random() < score.splatter * dt * 10 * (0.4 + energy)) spawnSplatter(b.x, b.y, width, energy);
}

function spawnSplatter(x, y, width, energy) {
  const count = 2 + Math.floor(Math.random() * (4 + energy * 8));
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2; const force = width * (1 + Math.random() * 3.4);
    state.particles.push({ x, y, vx: Math.cos(angle) * force, vy: Math.sin(angle) * force, radius: .5 + Math.random() * width * .11, life: .7 + Math.random() * 1.8, alpha: .18 + Math.random() * .45 });
  }
}

function drawParticles(dt) {
  ctx.save(); ctx.globalCompositeOperation = "multiply";
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .982; p.vy *= .982;
    if (p.life <= 0) { state.particles.splice(i, 1); continue; }
    ctx.fillStyle = `rgba(14,14,12,${p.alpha * clamp(p.life, 0, 1)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function triggerCue(cue) {
  const base = { x: state.brush.x, y: state.brush.y, age: 0, life: cue.type === "letters" ? 5 : 8, type: cue.type };
  const count = cue.type === "birds" ? 7 : cue.type === "butterflies" ? 5 : cue.type === "bubbles" ? 9 : 1;
  for (let i = 0; i < count; i++) state.figures.push({ ...base, delay: i * .12, seed: Math.random() * 100, scale: .55 + Math.random() * 1.15 });
}

function drawFigures(dt) {
  ctx.save(); ctx.globalCompositeOperation = "multiply";
  for (let i = state.figures.length - 1; i >= 0; i--) {
    const f = state.figures[i]; f.age += dt;
    if (f.age < f.delay) continue;
    const age = f.age - f.delay; const alpha = clamp(Math.min(age * 1.8, (f.life - age) * .55), 0, .72);
    if (age > f.life) { state.figures.splice(i, 1); continue; }
    const x = f.x + age * (28 + f.seed % 25) - state.time % 1 * 2;
    const y = f.y + Math.sin(age * 2.3 + f.seed) * (18 + f.seed % 32) - age * 5;
    ctx.save(); ctx.translate(x, y); ctx.scale(f.scale, f.scale); ctx.fillStyle = `rgba(18,18,16,${alpha})`; ctx.strokeStyle = `rgba(18,18,16,${alpha})`;
    if (f.type === "birds") {
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-7, -10, 0, 0); ctx.quadraticCurveTo(8, -11, 16, 0); ctx.stroke();
    } else if (f.type === "butterflies") {
      ctx.beginPath(); ctx.ellipse(-6, 0, 7, 12, -.65, 0, Math.PI * 2); ctx.ellipse(6, 0, 7, 12, .65, 0, Math.PI * 2); ctx.fill();
    } else if (f.type === "bubbles") {
      ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 8 + (f.seed % 19), 0, Math.PI * 2); ctx.stroke();
    } else if (f.type === "lips") {
      ctx.beginPath(); ctx.moveTo(-28, 0); ctx.quadraticCurveTo(-10, -18, 0, -3); ctx.quadraticCurveTo(12, -18, 29, 0); ctx.quadraticCurveTo(10, 19, 0, 8); ctx.quadraticCurveTo(-12, 19, -28, 0); ctx.fill();
    } else {
      ctx.font = "italic 24px Georgia"; ctx.fillText("soy del aire · soy del agua", -120, 0);
    }
    ctx.restore();
  }
  ctx.restore();
}

function fadeInk(amount) {
  if (amount <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = `rgba(0,0,0,${clamp(amount, 0, .18)})`; ctx.fillRect(0, 0, state.width, state.height); ctx.restore();
}

function drawCursor(score, energy) {
  const b = state.brush; const radius = 13 + score.width * .32 + energy * 11;
  ctx.save(); ctx.globalCompositeOperation = "multiply";
  const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
  g.addColorStop(0, "rgba(20,20,18,.17)"); g.addColorStop(.66, "rgba(20,20,18,.06)"); g.addColorStop(1, "rgba(20,20,18,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function render(now) {
  if (!state.running || state.paused) return;
  const dt = Math.min(.033, Math.max(.001, (now - state.lastFrame) / 1000)); state.lastFrame = now;
  state.previousTime = state.time; state.time = (now - state.startedAt) / 1000;
  if (state.time >= DURATION) { finish(); return; }
  const score = scoreAt(state.time); const energy = energyAt(state.time);
  shiftInk(score.speed * dt); fadeInk(score.fade * dt * 60);
  updateBrush(dt, score, energy); drawStroke(score, energy, dt); drawParticles(dt); drawFigures(dt); drawCursor(score, energy);
  for (const cue of cuesBetween(state.previousTime, state.time)) triggerCue(cue);
  soundscape.update(state.time, energy); updateUi();
  state.raf = requestAnimationFrame(render);
}

function updateUi() {
  const pct = clamp(state.time / DURATION, 0, 1) * 100;
  ui.fill.style.width = `${pct}%`; ui.progress.setAttribute("aria-valuenow", String(Math.floor(state.time)));
  ui.time.textContent = `${format(state.time)} / 04:04`;
}

async function start() {
  cancelAnimationFrame(state.raf); clearInk(); ui.intro.classList.add("is-hidden"); ui.end.classList.remove("is-visible");
  ui.player.classList.add("is-visible"); ui.hint.classList.add("is-visible");
  setTimeout(() => ui.hint.classList.remove("is-visible"), 4200);
  state.running = true; state.paused = false; state.time = 0; state.previousTime = 0;
  state.startedAt = performance.now(); state.lastFrame = state.startedAt; state.pointer.moved = false;
  state.brush.x = state.width * .45; state.brush.y = state.height * .52; state.brush.vx = state.brush.vy = 0;
  ui.play.textContent = "Ⅱ"; ui.play.setAttribute("aria-label", "暂停");
  await soundscape.start(); state.raf = requestAnimationFrame(render);
}

function togglePause() {
  if (!state.running) return;
  if (!state.paused) {
    state.paused = true; state.pausedAt = performance.now(); cancelAnimationFrame(state.raf); soundscape.suspend();
    ui.play.textContent = "▶"; ui.play.setAttribute("aria-label", "继续");
  } else {
    state.paused = false; state.startedAt += performance.now() - state.pausedAt; state.lastFrame = performance.now(); soundscape.resume();
    ui.play.textContent = "Ⅱ"; ui.play.setAttribute("aria-label", "暂停"); state.raf = requestAnimationFrame(render);
  }
}

function finish() {
  state.running = false; cancelAnimationFrame(state.raf); soundscape.suspend(); ui.player.classList.remove("is-visible"); ui.end.classList.add("is-visible");
}

function clearInk() {
  ctx.clearRect(0, 0, state.width, state.height); state.particles.length = 0; state.figures.length = 0; state.shiftCarry = 0; updateUi();
}

function pointerMove(event) {
  const rect = canvas.getBoundingClientRect(); state.pointer.x = event.clientX - rect.left; state.pointer.y = event.clientY - rect.top; state.pointer.moved = true;
}

canvas.addEventListener("pointerdown", event => { state.pointer.active = true; canvas.setPointerCapture?.(event.pointerId); pointerMove(event); });
canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("pointerup", event => { state.pointer.active = false; canvas.releasePointerCapture?.(event.pointerId); });
canvas.addEventListener("pointercancel", () => { state.pointer.active = false; });
ui.start.addEventListener("click", start); ui.restart.addEventListener("click", start); ui.endRestart.addEventListener("click", start);
ui.play.addEventListener("click", togglePause);
ui.sound.addEventListener("click", () => { state.muted = !state.muted; ui.sound.textContent = state.muted ? "静" : "声"; ui.sound.setAttribute("aria-label", state.muted ? "打开声音" : "关闭声音"); });
ui.about.addEventListener("click", () => ui.dialog.showModal());
ui.dialog.addEventListener("close", () => { if (state.running && state.paused) togglePause(); });
ui.dialog.addEventListener("cancel", event => event.stopPropagation());
ui.progress.addEventListener("click", event => {
  if (!state.running) return;
  const rect = ui.progress.getBoundingClientRect(); const next = clamp((event.clientX - rect.left) / rect.width, 0, 1) * DURATION;
  state.time = next; state.previousTime = next; state.startedAt = performance.now() - next * 1000; clearInk(); updateUi();
});
addEventListener("resize", resize, { passive: true });
document.addEventListener("visibilitychange", () => { if (document.hidden && state.running && !state.paused) togglePause(); });

resize();
