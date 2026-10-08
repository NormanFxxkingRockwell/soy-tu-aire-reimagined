import test from "node:test";
import assert from "node:assert/strict";
import { clampToViewport } from "../dist/pointer-target.js";

test("pointer target can use the full viewport", () => {
  assert.deepEqual(clampToViewport(0, 0, 1000, 600), { x: 0, y: 0 });
  assert.deepEqual(clampToViewport(1000, 600, 1000, 600), { x: 1000, y: 600 });
  assert.deepEqual(clampToViewport(37, 421, 1000, 600), { x: 37, y: 421 });
});

test("pointer target still rejects coordinates outside the canvas", () => {
  assert.deepEqual(clampToViewport(-20, 650, 1000, 600), { x: 0, y: 600 });
  assert.deepEqual(clampToViewport(1100, -5, 1000, 600), { x: 1000, y: 0 });
});
