import test from "node:test";
import assert from "node:assert/strict";
import { TimelineClock } from "../dist/timeline-clock.js";

test("timeline clock follows its canonical source without rAF assumptions", () => {
  let sourceTime = 120;
  const clock = new TimelineClock(() => sourceTime);
  clock.reset(0);
  sourceTime = 127.25;
  assert.equal(clock.now(), 7.25);
});

test("timeline clock can seek while preserving the source clock", () => {
  let sourceTime = 50;
  const clock = new TimelineClock(() => sourceTime);
  clock.reset(0);
  clock.seek(65);
  sourceTime = 52.5;
  assert.equal(clock.now(), 67.5);
});
