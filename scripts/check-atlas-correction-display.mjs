import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import { applyAtlasCorrections } from "../src/lib/clinical/atlas-catalog-corrections.mjs";
import { createAppLoader } from "./lib/load-app-module.mjs";

const require = createRequire(import.meta.url);
const load = createAppLoader({ mocks: { "./atlas-catalog-corrections.mjs": { applyAtlasCorrections } } });
const raw = JSON.parse(readFileSync(new URL("../public/anatomy/3d/manifest.json", import.meta.url)));
const corrections = JSON.parse(readFileSync(new URL("../src/lib/clinical/atlas-corrections.json", import.meta.url)));
const { structures } = applyAtlasCorrections(raw, corrections);
function render(file, exportName, structure) {
  const ts = require("typescript");
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: target => target.startsWith("@/") ? load(`src/${target.slice(2)}`) : require(target),
  }, { filename: file });
  return require("react-dom/server").renderToStaticMarkup(
    require("react").createElement(exports[exportName], { structure }),
  );
}

test("English correction details show the source spelling and corrected spelling under a Vietnamese label", () => {
  const structure = structures.find(row => row.id === "za-13ac05d8d27f");
  const html = render("src/components/atlas3d/AtlasCatalogCorrectionDetails.tsx", "AtlasCatalogCorrectionDetails", structure);
  assert.match(html, /Tên tiếng Anh/);
  assert.match(html, /Dữ liệu nguồn nguyên bản<\/dt><dd[^>]*>Bucinator<\/dd>/);
  assert.match(html, /Hiển thị sau hiệu chỉnh<\/dt><dd[^>]*>Buccinator<\/dd>/);
  assert.match(html, /05\/11\/2026/);
});

test("full source-name details retain original catalog English and Latin after corrections", () => {
  for (const id of ["za-13ac05d8d27f", "za-0594168bc7e0"]) {
    const structure = structures.find(row => row.id === id);
    const html = render("src/components/atlas3d/AtlasStructureName.tsx", "AtlasSourceNames", structure);
    assert.ok(html.includes(`<dd lang="en">${structure.sourceMetadata.english}</dd>`), id);
    assert.ok(html.includes(`>${structure.sourceMetadata.latin}</dd>`), id);
  }
});

test("uncorrected structures still expose their original English and Latin names", () => {
  const structure = raw.structures.find(row => row.english === "Mandible");
  const html = render("src/components/atlas3d/AtlasStructureName.tsx", "AtlasSourceNames", structure);
  assert.ok(html.includes(`>${structure.english}</dd>`));
  assert.ok(html.includes(`>${structure.latin}</dd>`));
});
