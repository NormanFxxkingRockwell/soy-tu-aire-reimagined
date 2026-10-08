import test from "node:test";
import assert from "node:assert/strict";
import { createRecording, recordSample, sampleAt } from "../dist/replay.js";

function recordingFrom(points, rate = 10, t0 = 0, seed = 42) {
  const recording = createRecording(seed, rate, t0);
  for (const [t, x, y] of points) recordSample(recording, t, x, y);
  return recording;
}

test("sampleAt returns null for an empty recording", () => {
  assert.equal(sampleAt(createRecording(1, 120), 5), null);
});

test("a single sample is returned for any time", () => {
  const recording = recordingFrom([[0, 7, 9]]);
  assert.deepEqual(sampleAt(recording, 0), { x: 7, y: 9 });
  assert.deepEqual(sampleAt(recording, 100), { x: 7, y: 9 });
});

test("interpolates linearly between samples", () => {
  const recording = recordingFrom([[0, 0, 0], [.1, 10, 20], [.2, 20, 40]]);
  assert.deepEqual(sampleAt(recording, .05), { x: 5, y: 10 });
  assert.deepEqual(sampleAt(recording, .1), { x: 10, y: 20 });
  assert.deepEqual(sampleAt(recording, .15), { x: 15, y: 30 });
});

test("clamps to the first and last captured samples", () => {
  const recording = recordingFrom([[0, 3, 4], [.1, 13, 14]]);
  assert.deepEqual(sampleAt(recording, -1), { x: 3, y: 4 });
  assert.deepEqual(sampleAt(recording, .5), { x: 13, y: 14 });
});

test("supports recordings that start later than zero", () => {
  const recording = recordingFrom([[5, 50, 60], [5.1, 60, 70]], 10, 5);
  assert.deepEqual(sampleAt(recording, 5), { x: 50, y: 60 });
  assert.deepEqual(sampleAt(recording, 5.05), { x: 55, y: 65 });
  assert.deepEqual(sampleAt(recording, 3), { x: 50, y: 60 });
});
