// Source/data presentation consistency; not clinical validation.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const require = createRequire(import.meta.url),
  ts = require("typescript");
const root = path.resolve(import.meta.dirname, ".."),
  cache = new Map();
function load(relative) {
  let file = path.resolve(root, relative);
  if (!path.extname(file)) file += existsSync(`${file}.ts`) ? ".ts" : ".tsx";
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  vm.runInNewContext(
    ts.transpileModule(readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      require: (id) =>
        // WebGL viewer is browser-only; this check renders text and sources.
        id.endsWith("/ContextualAnatomyViewer")
          ? { ContextualAnatomyViewer: () => null }
          : id.startsWith(".")
          ? load(path.relative(root, path.resolve(path.dirname(file), id)))
          : id.startsWith("@/")
            ? load(`src/${id.slice(2)}`)
            : require(id),
    },
    { filename: file },
  );
  return exports;
}
const { HANDBOOK } = load("src/lib/clinical/movement-handbook.ts");
const { HANDBOOK_EVIDENCE } = load("src/lib/clinical/evidence-assessment.ts");
assert.deepEqual(
  Array.from(HANDBOOK, (t) => t.id),
  ["posture", "patterns", "symmetry", "rom", "control"],
);
for (const topic of HANDBOOK) {
  const record = HANDBOOK_EVIDENCE[topic.id];
  assert.equal(record.reviewedBy, null);
  assert.equal(record.sources.length, topic.sources.length);
  for (const claim of record.supportedClaims) {
    for (const match of claim.matchAll(/\[(\d+(?:,\d+)*)\]/g))
      for (const number of match[1].split(',').map(Number))
        assert.ok(number > 0 && number <= record.sources.length);
  }
  assert.ok(
    Array.isArray(topic.keyPoints) && topic.keyPoints.length >= 4,
    `${topic.id}: core knowledge with adjacent sources required`,
  );
  const ids = topic.sources.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, `${topic.id}: unique sources`);
  for (const s of topic.sources) {
    assert.ok(s.id && s.title && s.kind && s.access);
    assert.equal(new URL(s.url).protocol, "https:");
    assert.match(s.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
  function cited(block, label) {
    assert.ok(
      block.authored || block.sourceIds?.length,
      `${topic.id}/${label}: cite or label as authored`,
    );
    for (const id of block.sourceIds ?? [])
      assert.ok(ids.includes(id), `${topic.id}: missing source ${id}`);
  }
  cited(topic, "intro");
  topic.keyPoints.forEach((p) => cited(p, "core"));
  for (const part of topic.parts) {
    cited(part, "section");
    for (const item of part.items ?? []) cited(item, "item");
    for (const guide of part.guides ?? []) {
      cited(guide, "guide");
      assert.ok(guide.id && guide.title && guide.summary);
      assert.ok(guide.items.length >= 4, "regional guides must connect assessment, action and reassessment");
      for (const item of guide.items) cited(item, "guide/item");
    }
    for (const row of part.table?.rows ?? []) cited(row, "row");
    if (part.illustration) {
      const { src, alt, caption, width, height } = part.illustration;
      assert.ok(existsSync(path.join(root, "public", src)), src);
      assert.ok(alt && caption && width > 0 && height > 0);
    }
  }
  for (const group of ["myths", "apply", "quiz"])
    topic[group].forEach((p) => cited(p, group));
  if (topic.figure) {
    const f = topic.figure;
    assert.ok(existsSync(path.join(root, "public", f.src)));
    assert.ok(
      f.author &&
        f.license &&
        f.licenseUrl &&
        f.sourceUrl &&
        f.caption &&
        f.alt,
    );
    assert.ok(f.width > 0 && f.height > 0);
  }
}
const text = JSON.stringify(HANDBOOK);
assert.ok(
  text.includes("thụ động") && text.includes("chủ động"),
  "distinguish CDC PROM and spine AROM",
);
assert.ok(
  text.includes("McKay"),
  "external-focus claim must include contrary reanalysis",
);
assert.ok(!/chờ chuyên gia|Chờ chuyên gia/.test(text));
const { normFor } = load("src/lib/clinical/rom-norms.ts");
assert.match(
  normFor("knee_flexion", 42, "Nam").population,
  /thụ động|PROM/,
  "CDC means must identify passive ROM",
);
assert.doesNotMatch(
  normFor("cervical_rotation", 24, "Nam").population,
  /Trung bình gộp/,
  "rounded two-side value is not a reported pooled mean",
);
const { MovementTopic } = load("src/components/movement/MovementTopic.tsx");
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const topic of HANDBOOK) {
  const html = renderToStaticMarkup(createElement(MovementTopic, { topic }));
  assert.ok(
    html.includes("Kiến thức trọng tâm") &&
      html.includes("Nguồn và phạm vi đã đọc"),
  );
  for (const source of topic.sources) {
    assert.ok(
      html.includes(`href="${escape(source.url)}"`),
      `${topic.id}: real rendered source URL`,
    );
    assert.ok(html.includes(source.checkedAt));
  }
  for (const point of topic.keyPoints)
    assert.ok(
      html.includes(escape(point.title)),
      `${topic.id}: visible core point`,
    );
  assert.ok(html.includes("<details"), "native self-check disclosure");
  assert.ok(!/Chờ chuyên gia|chờ chuyên gia/.test(html));
  if (topic.id === "posture") {
    const guides = topic.parts.find(part => part.id === "regions")?.guides ?? [];
    assert.deepEqual(Array.from(guides, guide => guide.id), ["head-neck", "shoulder", "thoracic", "pelvis", "knee", "foot"], "posture needs a finite regional assessment-to-action inventory");
    for (const guide of guides) {
      assert.ok(html.includes(escape(guide.title)) && html.includes(escape(guide.summary)), "regional guidance must actually render");
      for (const item of guide.items) assert.ok(html.includes(escape(item.text)), "regional action/source text must be visible in the rendered disclosure");
    }
    const illustrations = topic.parts.flatMap(p => p.illustration ? [p.illustration] : []);
    assert.ok(illustrations.length >= 2, "posture requires standing and movement figures");
    for (const figure of illustrations) {
      assert.ok(html.includes(escape(figure.alt)) && html.includes(escape(figure.caption)));
    }
    for (const id of ["screening", "standing", "tasks", "adjust", "record"]) {
      assert.ok(html.includes(`id="movement-posture-${id}"`));
    }
  }
  if (topic.figure)
    assert.ok(
      html.includes(escape(topic.figure.licenseUrl)) &&
        html.includes(escape(topic.figure.sourceUrl)),
    );
}
for (const [name, sha] of [
  [
    "flexion-extension-openstax.jpg",
    "eb7db76eeb39bf10dfaaaed3dfc51cfcd5387bd5",
  ],
])
  assert.equal(
    createHash("sha1")
      .update(readFileSync(path.join(root, "public/movement", name)))
      .digest("hex"),
    sha,
    "retain exact licensed original asset",
  );
console.log(
  "Movement sources: posture-first inventory, visible figures, sourced claims and scope/date/license checks passed.",
);
