import test from "node:test";
import assert from "node:assert/strict";
import { DURATION, SCORE, scoreAt, cuesBetween } from "../dist/timeline.js";

test("timeline covers the full experience without gaps", () => {
  assert.equal(SCORE[0].start, 0);
  assert.equal(SCORE.at(-1).end, DURATION);
  for (let i = 1; i < SCORE.length; i++) assert.equal(SCORE[i - 1].end, SCORE[i].start);
});

test("scoreAt clamps invalid and out-of-range times", () => {
  assert.equal(scoreAt(-20).mood, "breath");
  assert.equal(scoreAt(Number.NaN).mood, "breath");
  assert.equal(scoreAt(999).mood, "vanish");
});

test("score interpolation remains finite", () => {
  for (let t = 0; t <= DURATION; t += .25) {
    const score = scoreAt(t);
    for (const key of ["width", "alpha", "drift", "splatter", "speed", "fade"]) assert.ok(Number.isFinite(score[key]), `${key} at ${t}`);
  }
});

test("cuesBetween is inclusive only at the upper bound", () => {
  assert.deepEqual(cuesBetween(34.9, 35).map(c => c.type), ["butterflies"]);
  assert.deepEqual(cuesBetween(35, 35.1), []);
  assert.deepEqual(cuesBetween(40, 30), []);
});
