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
  assert.ok(record.limitations.some((text) => /nguồn|phạm vi|mô phỏng|đối chiếu|Đối chiếu|sơ đồ/.test(text)), 'specific source/application limits required');
  assert.ok(record.sources.length > 0);
  for (const source of record.sources) {
    assert.ok(source.title && source.access);
    assert.match(source.url, /^https:\/\//);
    assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
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
  assert.ok(muscle.referredPain.every((zone) => zone.description.includes("minh họa") && zone.description.includes("chưa xác minh")));
  assert.ok(muscle.components.length > 0, `${muscle.id}: components`);
  for (const component of muscle.components) {
    assert.ok(component.name && component.latin && component.trpStudy, `${muscle.id}: component fields`);
    assert.match(component.layer, /\[OpenStax §11\.[456]\]|không mô tả lớp/, `${muscle.id}/${component.latin}: layer must cite OpenStax or say it is undescribed`);
    assert.match(component.trpStudy, /\[[^\]]+\]|^Chưa có nghiên cứu/, `${muscle.id}/${component.latin}: study coverage must cite or state no checked study`);
  }
  assert.ok(muscle.plateViews.length > 0, `${muscle.id}: sourced plate views`);
  for (const view of muscle.plateViews) {
    const plate = atlas.SOURCE_PLATES[view.plate];
    const [x, y, w, h] = view.crop;
    assert.ok(plate && view.labels.length > 0 && x >= 0 && y >= 0 && x + w <= plate.width && y + h <= plate.height, `${muscle.id}: plate crop within ${view.plate}`);
  }
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
const MAX_OFF_BODY = 0.15;
const zones = [
  // Legacy point/referral data is retained for compatibility but withheld from the UI.
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
// General red flags beyond the emergency list (P0 task 6, sources read 2026-10-23). The card names
// reasons to stop and get assessed; sources do not give a diagnostic rule for any single sign.
const general = evidence.TRIGGER_GENERAL_EVIDENCE;
const generalSource = (fragment) => {
  const index = general.sources.findIndex((entry) => entry.url.includes(fragment));
  assert.ok(index >= 0, `general record: source ${fragment} missing`);
  const entry = general.sources[index];
  assert.equal(entry.checkedAt, "2026-10-23", `${fragment}: newly read source keeps its real read date`);
  return [index, entry];
};
assert.ok(general.sources.length >= 22, "new sources are appended, not inserted");
assert.match(general.sources[18].url, /111\.wales\.nhs\.uk/, "existing source order (heelSafety at index 18) must not shift");
const [, finucane] = generalSource("32438853");
assert.match(finucane.access, /abstract/i);
assert.match(finucane.access, /not read/i, "Finucane access must say the full framework was not read");
const [, downie] = generalSource("PMC3898572");
assert.match(downie.access, /Full text/);
const [, infection] = generalSource("PMC6911279");
assert.match(infection.access, /Full text/);
const [, nhsBack] = generalSource("nhs.uk/conditions/back-pain");
assert.match(nhsBack.access, /night/i, "NHS back pain access must mention the non-urgent list that was read");
const redFlagCard = atlas.PALPATION_FUNDAMENTALS.differentials.find((card) => /toàn thân|đêm/.test(card.name));
assert.ok(redFlagCard, "handbook needs a general red-flag card");
for (const [label, pattern] of [
  ["night/rest pain", /đau về đêm|nặng hơn về đêm/],
  ["pain not easing with rest", /không đỡ khi nghỉ/],
  ["unexplained weight loss", /sụt cân không chủ ý/],
  ["history of cancer", /tiền sử ung thư/],
  ["fever or systemic illness", /sốt/],
  ["feeling generally unwell", /khó chịu toàn thân|ớn lạnh/],
  ["immunosuppression", /suy giảm miễn dịch/],
]) assert.match(redFlagCard.vs, pattern, `red-flag card: ${label}`);
assert.match(redFlagCard.vs, /dừng/, "card must say to stop loading/SMR");
assert.match(redFlagCard.vs, /đánh giá y tế|khám/, "card must direct to medical assessment");
assert.match(redFlagCard.vs, /không (là|phải) chẩn đoán/, "single sign is not a diagnosis");
// NHS Back pain has two tiers: "See a GP" (non-urgent: weight loss, no easing with rest/worse at night) and
// "urgent GP appointment or 111" (hot/cold/shivery/generally unwell). Cancer history (Downie) and immunosuppression
// (Yusuf) are not NHS items.
const urgentIdx = redFlagCard.vs.indexOf("Khám khẩn trong ngày"), routineIdx = redFlagCard.vs.indexOf("Nên đi khám"), endIdx = redFlagCard.vs.indexOf("Các dấu hiệu này");
assert.ok(urgentIdx >= 0 && routineIdx > urgentIdx && endIdx > routineIdx, "card has urgent tier, then routine tier, then caveats");
assert.match(redFlagCard.vs.slice(0, urgentIdx), /Với đau lưng\/cột sống/, "back/spine qualifier opens the whole list");
const urgentTier = redFlagCard.vs.slice(urgentIdx, routineIdx), routineTier = redFlagCard.vs.slice(routineIdx, endIdx);
assert.match(urgentTier, /hẹn khám khẩn hoặc gọi 111/, "urgent tier carries NHS urgent wording");
assert.match(urgentTier, /sốt, ớn lạnh hoặc khó chịu toàn thân/);
assert.match(urgentTier, /suy giảm miễn dịch/);
assert.match(urgentTier, /Yusuf 2019/, "immunosuppression is attributed to Yusuf, not NHS");
assert.doesNotMatch(urgentTier, /sụt cân|về đêm|không đỡ khi nghỉ|ung thư/, "non-urgent items must not sit in the urgent tier");
for (const pattern of [/về đêm/, /không đỡ khi nghỉ/, /sụt cân không chủ ý/, /tiền sử ung thư/]) assert.match(routineTier, pattern, `routine tier: ${pattern}`);
assert.doesNotMatch(routineTier, /khẩn|111|trong ngày/, "weight-loss/night-pain/cancer-history items carry no urgent wording");
assert.doesNotMatch(redFlagCard.vs, /\bhay\b đang suy giảm|hay đang suy giảm/, "use 'hoặc', not 'hay'");
for (const tag of ["NHS Back pain", "NICE NG59", "Downie 2013", "Yusuf 2019", "Finucane 2020"]) assert.ok(redFlagCard.vs.includes(tag), `red-flag card cites ${tag}`);
for (const key of ["downie", "spinalInfection", "finucane", "backSafety", "lowBackGuidance"]) {
  assert.ok(general.supportedClaims.some((claim) => new RegExp(`^\\[[^\\]]*\\b${key}\\b`).test(claim) && /đêm|sụt cân|ung thư|sốt|miễn dịch/.test(claim)), `general claim mapping for ${key}`);
}
assert.ok(general.limitations.some((text) => /độ chính xác/.test(text) && /Finucane/.test(text)), "limitations must say red-flag accuracy evidence is limited and the Finucane full text was not read");

console.log(`Trigger evidence bookkeeping: ${ids.length} groups, ${atlas.PAIN_SITE_CULPRIT_MAP.length} symptom sites, ${records.length} source-scope records; no invented reviewer.`);
