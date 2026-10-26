// Presentation checks against every catalog structure; not anatomy validation.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const loaded = new Map();
function load(relative) {
  let file = path.resolve(root, relative);
  if (!existsSync(file) && existsSync(`${file}.ts`)) file += ".ts";
  if (loaded.has(file)) return loaded.get(file);
  const exports = {};
  loaded.set(file, exports);
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  vm.runInNewContext(
    outputText,
    {
      exports,
      require: (target) =>
        target.startsWith("@/")
          ? load(`src/${target.slice(2)}`)
          : target.startsWith(".")
            ? load(
                path.relative(root, path.resolve(path.dirname(file), target)),
              )
            : require(target),
    },
    { filename: file },
  );
  return exports;
}
const names = load("src/lib/clinical/atlas-names.ts");
assert.equal(
  typeof names.atlasShortEnglishName,
  "function",
  "short English formatter is available",
);
const manifest = JSON.parse(
  readFileSync(path.join(root, "public/anatomy/3d/manifest.json")),
);
const original = JSON.stringify(manifest);
const find = (english) => {
  const s = manifest.structures.find((s) => s.english === english);
  assert.ok(s, english);
  return s;
};
const examples = [
  [
    "Sternocostal head of pectoralis major muscle",
    "Pectoralis major · sternocostal head",
  ],
  [
    "Clavicular head of pectoralis major muscle",
    "Pectoralis major · clavicular head",
  ],
  [
    "Abdominal part of pectoralis major muscle",
    "Pectoralis major · abdominal part",
  ],
  ["Infraspinatus muscle", "Infraspinatus"],
  ["Anterior belly of digastric muscle", "Digastric · anterior belly"],
  [
    "Dorsal parts of lateral intertransversarii lumborum muscles",
    "Lateral intertransversarii lumborum muscles · dorsal parts",
  ],
];
for (const [source, expected] of examples)
  assert.equal(names.atlasShortEnglishName(find(source)), expected);
for (const structure of manifest.structures) {
  const display = names.atlasDisplayNames(structure);
  assert.ok(display.english.trim());
  assert.ok(
    !/\.\.\.|…/.test(display.english),
    `${structure.id}: no semantic truncation`,
  );
  assert.ok(
    display.english.length <= structure.english.length,
    `${structure.english}: compact English`,
  );
  assert.equal(display.vietnamese, names.atlasVietnameseName(structure));
  assert.ok(
    names.atlasSourceName(structure).includes(structure.english),
    "original source identity remains accessible",
  );
}
for (const namesInGroup of [
  examples.slice(0, 3).map(([source]) => source),
  ["Abductor digiti minimi of foot", "Abductor digiti minimi of hand"],
  ["Extensor carpi radialis brevis", "Extensor carpi radialis longus"],
  ["Long head of biceps brachii", "Short head of biceps brachii"],
]) {
  const short = namesInGroup.map((english) =>
    names.atlasShortEnglishName(find(english)),
  );
  assert.equal(
    new Set(short).size,
    short.length,
    "parts, length and hand/foot stay distinct",
  );
}
const identities = new Map();
for (const structure of manifest.structures) {
  const short = names.atlasShortEnglishName(structure);
  const previous = identities.get(short);
  assert.ok(
    !previous || previous === structure.english,
    `English display collision: ${previous}/${structure.english}`,
  );
  identities.set(short, structure.english);
}
const atlas = load("src/lib/clinical/atlas-3d.ts");
const pec = find(examples[0][0]);
for (const query of [
  pec.english,
  pec.latin,
  names.atlasDisplayNames(pec).english,
  names.atlasVietnameseName(pec),
]) {
  assert.ok(
    atlas.searchStructures([pec], query, "full").some((s) => s.id === pec.id),
    `search preserves ${query}`,
  );
}
assert.equal(
  JSON.stringify(manifest),
  original,
  "source catalog fields are unchanged",
);
const { AtlasStructureName, AtlasSourceNames } = load(
  "src/components/atlas3d/AtlasStructureName.tsx",
);
const paired = renderToStaticMarkup(
  createElement(AtlasStructureName, { structure: pec }),
);
assert.doesNotMatch(paired, /Trái|Phải/);
assert.match(paired, /lang="vi"/);
assert.match(paired, /lang="en"/);
assert.match(paired, /Pectoralis major · sternocostal head/);
assert.match(paired, /Cơ ngực lớn · đầu ức–sườn/);
assert.ok(paired.includes(pec.english), "full English remains in the tooltip");
const sourceHtml = renderToStaticMarkup(
  createElement(AtlasSourceNames, { structure: pec }),
);
assert.ok(sourceHtml.includes(pec.english));
assert.ok(sourceHtml.includes(pec.latin));
console.log(
  `Atlas names: ${manifest.structures.length} structures; concise English, preserved Vietnamese/source names, distinctions and bilingual search passed.`,
);
