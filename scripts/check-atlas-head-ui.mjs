import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const require = createRequire(import.meta.url);
const load = createAppLoader();
const atlas = load("src/lib/clinical/atlas-3d.ts");
const learning = load("src/components/atlas3d/region-learning.ts");
const mandible = {
  id: "head-mandible", english: "Mandible", latin: "Mandibula",
  label: "Mandible", side: null, layer: "bone", areas: ["head"],
  group: null, clinicalRegion: null,
};
const neck = {
  ...mandible, id: "neck-example", english: "Cervical vertebra",
  latin: "Vertebra cervicalis", label: "Cervical vertebra", areas: ["neck"],
  clinicalRegion: "cervical",
};

test("head is a selectable learning area with source-only scope and no borrowed clinical card", () => {
  assert.equal(atlas.ATLAS_AREAS.find(area => area.id === "head")?.label, "Đầu & mặt");
  assert.ok(learning.LEARNING_REGIONS.head);
  assert.equal(learning.LEARNING_REGIONS.head.regions.length, 0);
  assert.equal(learning.LEARNING_REGIONS.head.example, "Mandible");
  assert.ok(learning.LEARNING_REGIONS.head.scope);
  assert.match(learning.LEARNING_REGIONS.head.scope, /nguồn/);
});

test("head navigation is reloadable and removes selections from the previous area", () => {
  const url = new URL(learning.atlasAreaHref(
    "http://localhost:3000/atlas?tab=3d&area=neck&structure=old&group=old&exercise=old",
    "head",
  ), "http://localhost:3000");
  assert.equal(url.pathname, "/atlas");
  assert.equal(url.searchParams.get("area"), "head");
  assert.equal(url.searchParams.get("tab"), "3d");
  assert.equal(url.hash, "#atlas-learning-studio");
  for (const key of ["structure", "group", "exercise"])
    assert.equal(url.searchParams.has(key), false);
});

test("head filtering and whole-body search retain the source structure without cervical substitution", () => {
  const structures = [mandible, neck];
  assert.deepEqual(Array.from(atlas.searchStructures(structures, "", "head"), row => row.id), [mandible.id]);
  assert.equal(atlas.searchStructures(structures, "", "full").length, 2);
  for (const area of ["head", "neck", "full"]) {
    const result = atlas.resolveAtlasSearch(structures, "Mandible", area);
    assert.equal(result.kind, "match");
    assert.equal(result.area, "full");
    assert.deepEqual(Array.from(result.targets, row => row.id), [mandible.id]);
    assert.equal(result.targets[0].clinicalRegion, null);
  }
});

test("head overview renders its source scope without an empty foundation heading or inherited review date", () => {
  const ts = require("typescript");
  const file = "src/components/atlas3d/RegionLearningOverview.tsx";
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: target => {
      if (target === "./region-learning") return learning;
      if (target === "./AtlasTerminologySources") return { AtlasTerminologySources: () => null };
      if (target === "@/components/ClinicalEvidencePanel") return { ClinicalEvidencePanel: () => null };
      if (target === "@/lib/clinical/evidence-registry") return { getCatalogEvidence: () => null };
      if (target.startsWith("@/")) return load(`src/${target.slice(2)}`);
      return require(target);
    },
  }, { filename: file });
  const html = require("react-dom/server").renderToStaticMarkup(
    require("react").createElement(exports.RegionLearningOverview, { area: "head", areaLabel: "Đầu & mặt" }),
  );
  assert.ok(html.replaceAll("&amp;", "&").includes(learning.LEARNING_REGIONS.head.scope));
  assert.doesNotMatch(html, /Kiến thức nền có nguồn|22\/10\/2026|Cột sống cổ/);
});
