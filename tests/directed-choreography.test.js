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

test("alambre and uno are migrated to deterministic directed cues", () => {
  const wire = DIRECTED_CUES.filter(cue => cue.name === "alambre");
  assert.equal(wire.length, 1);
  assert.equal(wire[0].at, 154.05);
  assert.equal(wire[0].spawn.reveal, "strokeEmbedded");

  const uno = DIRECTED_CUES.filter(cue => cue.name === "uno");
  assert.equal(uno.length, 2);
  assert.equal(uno[0].kind, "brushHold");
  assert.equal(uno[0].paint, false);
  assert.equal(uno[1].kind, "spawn");
  assert.equal(Number(uno[1].at.toFixed(2)), 161.35);
  assert.equal(uno[1].spawn.reveal, "brushDraw");
  assert.equal(uno[1].spawn.revealDuration, .5);
});

test("directed cue expansion preserves stagger instead of merging bursts", () => {
  const birds = buildDirectedCues(["pajaros"]);
  const flying = birds.filter(cue => cue.name === "pajarosVolando");
  assert.equal(flying.length, 3);
  assert.deepEqual(flying.map(cue => Number(cue.at.toFixed(2))), [26.58, 26.7, 26.82]);
});
