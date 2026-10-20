// Checks evidence bookkeeping and consumer compatibility, not clinical truth.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import zlib from "node:zlib";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const loaded = new Map();
function load(relative) {
  const file = path.resolve(root, relative);
  if (loaded.has(file)) return loaded.get(file);
  const exports = {};
  loaded.set(file, exports);
  const source = readFileSync(file, "utf8");
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  assert.equal(result.diagnostics?.length ?? 0, 0, `TypeScript syntax: ${relative}`);
  vm.runInNewContext(result.outputText, {
    exports,
    require: (target) => load(path.relative(root, path.resolve(path.dirname(file), `${target}.ts`))),
  }, { filename: file });
  return exports;
}

const atlas = load("src/lib/clinical/trigger-point-atlas.ts");
const evidence = load("src/lib/clinical/evidence-trigger.ts");
const ids = ["upper_trapezius", "levator_scapulae", "infraspinatus", "pec_minor", "lats_serratus", "quadratus_lumborum", "iliopsoas", "glute_med_piriformis", "tfl_vastus_lateralis", "soleus_gastroc"];
assert.equal(atlas.TRIGGER_POINT_MUSCLES.length, 10);
assert.equal(atlas.PAIN_SITE_CULPRIT_MAP.length, 8);
assert.deepEqual([...Object.keys(evidence.TRIGGER_POINT_EVIDENCE)].sort(), [...ids].sort());
assert.deepEqual(Array.from(atlas.TRIGGER_POINT_MUSCLES, (muscle) => muscle.id).sort(), [...ids].sort());
const records = [...Object.values(evidence.TRIGGER_POINT_EVIDENCE), evidence.TRIGGER_GENERAL_EVIDENCE];
for (const record of records) {
  assert.equal(record.reviewedBy, null);
  assert.ok(["limited", "literature-reviewed"].includes(record.status));
  assert.ok(record.supportedClaims.length > 0 && record.limitations.length > 0);
  assert.ok(record.limitations.some((text) => text.includes("chuyên môn") || text.includes("chuyên gia")));
  assert.ok(record.sources.length > 0);
  for (const source of record.sources) {
    assert.ok(source.title && source.access);
    assert.match(source.url, /^https:\/\//);
    assert.equal(source.checkedAt, "2026-10-19");
  }
}
for (const muscle of atlas.TRIGGER_POINT_MUSCLES) {
  assert.equal(atlas.getTriggerPointMuscle(muscle.id).id, muscle.id);
  assert.equal(muscle.chain.overloadedState, "Chưa xác định qua đánh giá trực tiếp");
  assert.ok(muscle.references.length > 0);
  for (const node of muscle.nodes) {
    assert.ok(node.id && node.locationLabel.includes("không"));
    assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
  }
  assert.ok(muscle.referredPain.every((zone) => zone.description.includes("minh họa")));
  assert.ok(muscle.protocol.step1Release.tool && muscle.protocol.step2Mobility && muscle.protocol.step3Activation && muscle.protocol.step4LoadCue);
}
for (const site of atlas.PAIN_SITE_CULPRIT_MAP) {
  assert.equal(atlas.getPainSite(site.id).id, site.id);
  assert.equal(atlas.culpritMusclesForSite(site).length, site.culprits.length);
  for (const candidate of site.culprits) assert.ok(ids.includes(candidate.muscleId));
}
// Silhouette/laterality check on the background plates. It catches overlays drawn off the body or on
// the wrong side; it cannot tell whether a point lies on the named muscle or layer.
function pngAlpha(file) {
  const buf = readFileSync(path.resolve(root, file));
  const width = buf.readUInt32BE(16), height = buf.readUInt32BE(20);
  assert.ok(buf[24] === 8 && buf[25] === 6 && buf[28] === 0, `${file}: expected 8-bit RGBA, non-interlaced`);
  const chunks = [];
  for (let at = 8; at < buf.length; at += buf.readUInt32BE(at) + 12) {
    if (buf.toString("latin1", at + 4, at + 8) === "IDAT") chunks.push(buf.subarray(at + 8, at + 8 + buf.readUInt32BE(at)));
  }
  const raw = zlib.inflateSync(Buffer.concat(chunks)), stride = width * 4, px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? px[y * stride + i - 4] : 0, b = y ? px[(y - 1) * stride + i] : 0, c = i >= 4 && y ? px[(y - 1) * stride + i - 4] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter];
      px[y * stride + i] = (row[i] + pred) & 255;
    }
  }
  return (x, y) => px[(Math.round(y) * width + Math.round(x)) * 4 + 3] > 0;
}
function polygon(d) {
  const tokens = d.match(/[MLCZ]|-?\d+(\.\d+)?/g), points = [];
  let command, cursor;
  for (let i = 0; i < tokens.length;) {
    if (/[MLCZ]/.test(tokens[i])) { command = tokens[i++]; continue; }
    const n = tokens.slice(i, i + (command === "C" ? 6 : 2)).map(Number);
    i += n.length;
    if (command === "C") {
      for (let t = 0.1; t <= 1.001; t += 0.1) {
        const k = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3];
        points.push([0, 1].map((j) => k[0] * cursor[j] + k[1] * n[j] + k[2] * n[2 + j] + k[3] * n[4 + j]));
      }
      cursor = n.slice(4);
    } else points.push((cursor = n));
  }
  return points;
}
function offBodyShare(onBody, d) {
  const pts = polygon(d), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  let inside = 0, off = 0;
  for (let y = Math.min(...ys); y <= Math.max(...ys); y += 3) {
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += 3) {
      let hit = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
      }
      if (hit) { inside++; if (!onBody(x, y)) off++; }
    }
  }
  return off / inside;
}
const plates = { anterior: pngAlpha("public/anatomy/muscles-anterior.png"), posterior: pngAlpha("public/anatomy/muscles-posterior.png") };
const explorer = readFileSync(path.resolve(root, "src/components/TriggerPointExplorer.tsx"), "utf8");
const lookupRegions = [...explorer.matchAll(/id: "([^"]+)",\s*muscleId: "[^"]+",\s*view: "(anterior|posterior)",\s*d: "([^"]+)"/g)];
assert.ok(lookupRegions.length >= 19, "lookup regions parsed");
const MAX_OFF_BODY = 0.15;
const zones = [
  ...lookupRegions.map(([, id, view, d]) => [`lookup ${id}`, view, d]),
  ...atlas.TRIGGER_POINT_MUSCLES.flatMap((m) => m.referredPain.map((z, i) => [`referral ${m.id}[${i}]`, z.view, z.d])),
  ...atlas.PAIN_SITE_CULPRIT_MAP.map((s) => [`pain site ${s.id}`, s.view, s.zoneD]),
];
for (const [label, view, d] of zones) {
  const share = offBodyShare(plates[view], d);
  assert.ok(share <= MAX_OFF_BODY, `${label}: ${Math.round(share * 100)}% outside the body silhouette`);
}
for (const muscle of atlas.TRIGGER_POINT_MUSCLES) {
  for (const node of muscle.nodes) assert.ok(plates[node.view](node.x, node.y), `${node.id} is off the body silhouette`);
  // Posterior plate: image-left is the subject's left; anterior plate: image-right is the subject's left.
  const sides = new Set(muscle.referredPain.flatMap((z) => {
    const xs = polygon(z.d).map((p) => p[0]);
    if (Math.min(...xs) < 450 && Math.max(...xs) > 450) return [];
    return [(z.view === "posterior") === Math.max(...xs) < 450 ? "subject-left" : "subject-right"];
  }));
  assert.ok(sides.size <= 1, `${muscle.id}: referral zones drawn on both body sides`);
}
const runtimeText =JSON.stringify([atlas.PALPATION_FUNDAMENTALS, atlas.TRIGGER_POINT_MUSCLES, atlas.PAIN_SITE_CULPRIT_MAP]);
assert.doesNotMatch(runtimeText, /28973518|18164338|30756327|21946988|17197231|20038718|16089175|23993790|20598206|27583147/);
assert.doesNotMatch(runtimeText, /VAS 5|VAS 4|45–90s|60–90s|trong 24 giờ|trong 5 phút|≤10%/);
console.log(`Trigger evidence bookkeeping: ${ids.length} muscles, ${atlas.PAIN_SITE_CULPRIT_MAP.length} pain sites, ${records.length} evidence records; all pending independent clinical/spatial review.`);
