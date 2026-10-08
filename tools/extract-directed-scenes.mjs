import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.resolve(repoRoot, "..", ".refs", "pablo", "engine.pretty.js");
const sourcePath = path.resolve(process.argv[2] || defaultSource);
const outputPath = path.resolve(process.argv[3] || path.join(repoRoot, "tools", "directed-scenes.json"));

const source = fs.readFileSync(sourcePath, "utf8");
const startMarker = "let u = [";
const start = source.indexOf(startMarker);
if (start === -1) throw new Error(`Directed scene table not found in ${sourcePath}`);

const arrayStart = start + startMarker.length - 1;
const resolverStart = source.indexOf("function p(", arrayStart);
const end = resolverStart === -1 ? -1 : source.lastIndexOf("];", resolverStart);
if (end === -1) throw new Error(`Directed scene table end not found in ${sourcePath}`);

// The recovered bundle stores this table as a data-only JS literal. Evaluate
// only the isolated literal in an empty VM context; never execute the bundle.
const literal = source.slice(arrayStart, end + 1)
  .replaceAll("!0", "true")
  .replaceAll("!1", "false");
const scenes = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
if (!Array.isArray(scenes) || scenes.length < 20) throw new Error("Directed scene extraction produced an incomplete table");

fs.writeFileSync(outputPath, `${JSON.stringify(scenes, null, 2)}\n`, "utf8");
console.log(`directed scenes: ${scenes.length} -> ${outputPath}`);
