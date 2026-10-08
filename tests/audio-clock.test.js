import test from "node:test";
import assert from "node:assert/strict";
import { mediaTimelineSeconds } from "../dist/audio-clock.js";

test("media time remains the canonical clock while the song plays", () => {
  const song = { currentTime: 91.25, duration: 233.7, ended: false };
  assert.equal(mediaTimelineSeconds(song, 4, 500, null), 95.25);
});

test("visual outro continues after the shorter audio file ends", () => {
  const song = { currentTime: 233.7, duration: 233.7, ended: true };
  assert.ok(Math.abs(mediaTimelineSeconds(song, 4, 1006.3, 1000) - 244) < 1e-9);
});
