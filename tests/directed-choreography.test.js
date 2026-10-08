import test from "node:test";
import assert from "node:assert/strict";
import { DIRECTED_CUES, buildDirectedCues, sceneRuleFor } from "../dist/directed-choreography.js";

test("scene rules prefer time-ranged variants", () => {
  assert.equal(sceneRuleFor("pececillo", 30).key, "pececillo-intro");
  assert.equal(sceneRuleFor("pececillo", 140).key, "pececillo-preclimax");
  assert.equal(sceneRuleFor("pececillo", 180).key, "pececillo-climax");
});

test("the first migrated scene preserves hold, attachment and reveal timing", () => {
  const [hold, spawn] = DIRECTED_CUES.filter(cue => cue.name === "chica");
  assert.equal(hold.kind, "brushHold");
  assert.equal(hold.at, 23.34);
  assert.equal(hold.paint, false);
  assert.equal(spawn.kind, "spawn");
  assert.equal(spawn.at, 23.42);
  assert.equal(spawn.spawn.attachment, "brushHead");
  assert.equal(spawn.spawn.reveal, "brushDraw");
});

test("labios keeps its brush-drawn entry, hold and anchored exit", () => {
  const cues = buildDirectedCues(["labios"]);
  const hold = cues.find(cue => cue.kind === "brushHold");
  const spawn = cues.find(cue => cue.kind === "spawn");
  assert.ok(hold);
  assert.ok(spawn);
  assert.equal(spawn.spawn.attachment, "brushHead");
  assert.equal(spawn.spawn.reveal, "brushDraw");
  assert.equal(spawn.spawn.revealDuration, .7);
  assert.ok(spawn.at > hold.at);
  assert.ok(spawn.at < hold.at + hold.duration);
});

test("directed cue expansion preserves stagger instead of merging bursts", () => {
  const birds = buildDirectedCues(["pajaros"]);
  const flying = birds.filter(cue => cue.name === "pajarosVolando");
  assert.equal(flying.length, 3);
  assert.deepEqual(flying.map(cue => Number(cue.at.toFixed(2))), [26.58, 26.7, 26.82]);
});
