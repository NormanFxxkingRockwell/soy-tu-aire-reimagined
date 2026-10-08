import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CREATURE_ASSETS, PAPER_TEXTURE } from "../dist/assets.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const referenced = [...new Set([...Object.values(CREATURE_ASSETS), PAPER_TEXTURE])];

test("every runtime raster asset exists and has a real image signature", () => {
  for (const relative of referenced) {
    const filename = path.join(root, relative);
    assert.ok(fs.existsSync(filename), `missing ${relative}`);
    const bytes = fs.readFileSync(filename);
    const png = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    assert.ok(png || jpeg, `${relative} is not a decodable PNG/JPEG payload`);
  }
});

test("no HTML error response is stored under dist/assets", () => {
  const pending = [path.join(root, "assets")];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const filename = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(filename);
      else assert.notEqual(fs.readFileSync(filename, "utf8").slice(0, 15).toLowerCase(), "<!doctype html>", filename);
    }
  }
});
