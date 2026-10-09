import test from "node:test";
import assert from "node:assert/strict";
import { cameraView, cinematicSourceScale, localToScreen, screenToLocal } from "../dist/camera-view.js";

test("climax zooms out instead of enlarging the ink", () => {
  assert.ok(cinematicSourceScale(180, 1) > cinematicSourceScale(180, 0));
});

test("camera projection keeps pointer and brush coordinates inverse", () => {
  const view = cameraView({
    width: 1000, height: 600, worldWidth: 2500, worldHeight: 900,
    cameraX: 700, cameraY: 40, time: 180, climax: 1
  });
  const local = screenToLocal(view, 700, 923, 511);
  const screen = localToScreen(view, 700, local.x, local.y);
  assert.ok(Math.abs(screen.x - 923) < 1e-9);
  assert.ok(Math.abs(screen.y - 511) < 1e-9);
});

test("vertical camera drift stays inside the padded world", () => {
  const view = cameraView({
    width: 1000, height: 600, worldWidth: 2500, worldHeight: 900,
    cameraX: 0, cameraY: -1000, time: 200, climax: 1
  });
  assert.equal(view.sy, 0);
  assert.ok(view.sy + view.sh <= 900);
});
