// Check real destinations and claim provenance, not clinical validity.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
function load(relative) {
  let file = path.resolve(root, relative);
  if (!existsSync(file) && !path.extname(file)) file += ".ts";
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"));
  const exports = {};
  cache.set(file, exports);
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  vm.runInNewContext(
    outputText,
    {
      exports,
      URLSearchParams,
      require: (target) =>
        load(
          target.startsWith("@/")
            ? `src/${target.slice(2)}`
            : path.relative(root, path.resolve(path.dirname(file), target)),
        ),
    },
    { filename: file },
  );
  return exports;
}

const { LANDING_PREVIEWS } = load("src/lib/landing-data.ts");
const { REGION_FOUNDATIONS } = load("src/lib/clinical/anatomy-atlas.ts");
const { ANATOMY_REGION_EVIDENCE } = load(
  "src/lib/clinical/evidence-anatomy.ts",
);
const { HYPERTROPHY_EXERCISES } = load(
  "src/lib/clinical/muscle-hypertrophy-atlas.ts",
);
const manifest = load("public/anatomy/3d/manifest.json");
assert.equal(LANDING_PREVIEWS.length, 5);
assert.equal(new Set(LANDING_PREVIEWS.map((p) => p.id)).size, 5);
for (const preview of LANDING_PREVIEWS) {
  const url = new URL(preview.atlasHref, "https://test.local");
  const structure = manifest.structures.find(
    (s) => s.id === url.searchParams.get("structure"),
  );
  assert.ok(
    structure,
    `${preview.id}: destination must select a real structure`,
  );
  assert.ok(
    structure.areas.includes(url.searchParams.get("area")),
    `${preview.id}: structure must belong to destination area`,
  );
  assert.equal(
    structure.clinicalRegion,
    preview.id,
    `${preview.id}: destination must keep selected region`,
  );
  const claim = REGION_FOUNDATIONS[preview.id].find(
    (f) => f.text === preview.fact,
  );
  assert.ok(
    claim,
    `${preview.id}: reuse the sourced claim without marketing alterations`,
  );
  const evidence = ANATOMY_REGION_EVIDENCE[preview.id];
  assert.equal(preview.sources.length, claim.sourceRefs.length);
  claim.sourceRefs.forEach((ref, i) => {
    const original = evidence.sources[ref - 1];
    assert.equal(preview.sources[i].url, original.url);
    assert.equal(preview.sources[i].checkedAt, original.checkedAt);
    assert.equal(preview.sources[i].access, original.access);
  });
  const exerciseUrl = new URL(preview.exerciseHref, "https://test.local");
  const exercise = HYPERTROPHY_EXERCISES.find(
    (e) => e.id === exerciseUrl.searchParams.get("exercise"),
  );
  assert.ok(exercise, `${preview.id}: exercise link must resolve`);
  assert.equal(preview.exerciseName, exercise.vietnameseName);
  assert.equal(exerciseUrl.searchParams.get("tab"), "hypertrophy");
}
console.log(
  "Landing: 5 region destinations, source claims/dates/scopes and exercise links verified. Not clinical validation.",
);
