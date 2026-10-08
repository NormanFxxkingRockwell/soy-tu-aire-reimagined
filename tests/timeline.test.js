import test from "node:test";
import assert from "node:assert/strict";
import { DURATION, SCORE, scoreAt } from "../dist/timeline.js";
import { PARAMS, CUES } from "../dist/choreography.js";

test("timeline covers the full experience without gaps", () => {
  assert.equal(SCORE[0].start, 0);
  assert.equal(SCORE.at(-1).end, DURATION);
  for (let i = 1; i < SCORE.length; i++) assert.equal(SCORE[i - 1].end, SCORE[i].start);
});

test("scoreAt clamps invalid and out-of-range times", () => {
  assert.equal(scoreAt(-20).mode, "off");
  assert.equal(scoreAt(Number.NaN).mode, "off");
  assert.equal(scoreAt(999).mode, "fadeout");
});

test("score interpolation remains finite", () => {
  for (let t = 0; t <= DURATION; t += .25) {
    const score = scoreAt(t);
    for (const key of ["scroll", "wave", "splat", "wet", "bpm", "fade"]) assert.ok(Number.isFinite(score[key]), `${key} at ${t}`);
  }
});

test("every segment declares a drawing mode and sane parameters", () => {
  const modes = new Set(["off", "stroke", "blackout", "drops", "fadeout"]);
  for (const segment of SCORE) {
    assert.ok(modes.has(segment.mode), `${segment.start}s has unknown mode ${segment.mode}`);
    assert.ok(segment.scroll >= 0 && segment.scroll <= 7, `${segment.start}s scroll out of range`);
    assert.ok(segment.wet >= 0 && segment.wet <= 1, `${segment.start}s wet out of range`);
    assert.ok(segment.bpm >= 0 && segment.bpm < 300, `${segment.start}s bpm out of range`);
  }
});

test("section modes occur where transcribed from the video", () => {
  assert.equal(scoreAt(41.5).mode, "blackout");
  assert.equal(scoreAt(149).mode, "drops");
  assert.equal(scoreAt(240).mode, "fadeout");
  assert.equal(scoreAt(30).mode, "stroke");
});

test("recovered choreography keyframes are ordered and sane", () => {
  assert.ok(PARAMS.length > 100, "expected the full recovered storyboard");
  for (let i = 0; i < PARAMS.length; i++) {
    const p = PARAMS[i];
    assert.ok(Number.isFinite(p.t) && p.t >= 0 && p.t <= DURATION, `param t ${p.t}`);
    assert.ok(p.presion >= 0 && p.presion <= 1.5, `presion ${p.presion} at ${p.t}`);
    assert.ok(p.velocidad >= 0 && p.velocidad <= 2, `velocidad ${p.velocidad} at ${p.t}`);
    assert.ok(p.climax >= 0 && p.climax <= 1, `climax ${p.climax} at ${p.t}`);
    if (i) assert.ok(p.t >= PARAMS[i - 1].t, `params not sorted at ${p.t}`);
  }
});

test("recovered cues stay inside the song and carry counts", () => {
  const known = new Set(["word", "photoFigure", "birds", "koi", "minnows", "surco", "wax", "zipper", "tickles", "bigO", "bubbles", "waterRings", "splash", "memories", "teardrop", "lips", "butterflies", "dandelions", "holeIn", "holeOut", "wire", "uno"]);
  for (const cue of CUES) {
    assert.ok(cue.at > 4 && cue.at < DURATION, `${cue.type} at ${cue.at} outside video time`);
    assert.ok(known.has(cue.type), `unknown cue type ${cue.type}`);
    if (cue.type !== "word") assert.ok(Number.isInteger(cue.count) && cue.count >= 1, `${cue.type} count`);
  }
  // anchor checks against the original recording
  const lips = CUES.filter(c => c.type === "lips")[0];
  assert.ok(Math.abs(lips.at - 91) < 1.5, `lips expected near video 91s, got ${lips.at}`);
  const splash = CUES.filter(c => c.type === "splash")[0];
  assert.ok(Math.abs(splash.at - 70.5) < 1.5, `splash expected near video 70.5s, got ${splash.at}`);
  const climaxParams = PARAMS.filter(p => p.climax >= 1);
  assert.ok(Math.abs(climaxParams[0].t - 172.7) < 1.5, "climax expected near video 172.7s");
});
