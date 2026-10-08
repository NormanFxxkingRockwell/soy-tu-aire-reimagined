import test from "node:test";
import assert from "node:assert/strict";
import { paramAt } from "../dist/params.js";

const SAMPLE = [
  { t: 168.2, presion: .1, velocidad: 1, climax: 0 },
  { t: 169, presion: 0, velocidad: 1, climax: 0 },
  { t: 172.7, presion: 1.3, velocidad: 1.3, climax: 1 },
  { t: 174, presion: 1.3, velocidad: 1.3, climax: 0 },
  { t: 178, presion: 1.3, velocidad: 1.3, climax: 1 }
];

test("pressure and velocity still interpolate between timeline events", () => {
  const p = paramAt(170.85, SAMPLE);
  assert.ok(p.presion > 0 && p.presion < 1.3);
  assert.ok(p.velocidad > 1 && p.velocidad < 1.3);
});

test("climax is a short event pulse rather than a multi-second interpolation", () => {
  assert.equal(paramAt(172.6, SAMPLE).climax, 0);
  assert.equal(paramAt(172.7, SAMPLE).climax, 1);
  assert.ok(Math.abs(paramAt(172.9, SAMPLE).climax - .5) < 1e-9);
  assert.equal(paramAt(173.1, SAMPLE).climax, 0);
  assert.equal(paramAt(177.9, SAMPLE).climax, 0);
  assert.equal(paramAt(178, SAMPLE).climax, 1);
});
