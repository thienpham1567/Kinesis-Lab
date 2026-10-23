import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Data integrity only. Passing this check does not validate medical accuracy.
const importData = async (relativePath) => {
  const content = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
};

const { MUSCLE_GROUP_ATLAS, HYPERTROPHY_EXERCISES } = await importData("../src/lib/clinical/muscle-hypertrophy-atlas.ts");
const { MUSCLE_GROUP_EVIDENCE, EXERCISE_EVIDENCE, MUSCLE_EVIDENCE_REVIEW, TRAINING_GENERAL_GUIDANCE } = await importData("../src/lib/clinical/evidence-muscle.ts");

for (const [items, evidence, count] of [
  [MUSCLE_GROUP_ATLAS, MUSCLE_GROUP_EVIDENCE, 11],
  [HYPERTROPHY_EXERCISES, EXERCISE_EVIDENCE, 13],
]) {
  assert.equal(items.length, count, "Expected audited dataset coverage");
  assert.equal(new Set(items.map(item => item.id)).size, items.length, "Duplicate IDs");
  assert.deepEqual(Object.keys(evidence).sort(), items.map(item => item.id).sort(), "Evidence must cover exactly the live IDs");
  for (const item of items) {
    const entry = evidence[item.id];
    assert.equal(entry.reviewedBy, null, `${item.id}: do not invent a reviewer`);
    assert.ok(["limited", "literature-reviewed"].includes(entry.status));
    assert.ok(entry.sources.length && entry.supportedClaims.length && entry.limitations.length);
    assert.ok(entry.limitations.some(limit => /nguồn|phạm vi|mô phỏng|sơ đồ|EMG|mesh|cá nhân/.test(limit)), `${item.id}: retain specific source/application limits`);
    for (const source of entry.sources) {
      assert.match(source.url, /^https:\/\//);
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(source.title && source.access);
    }
    for (const claim of entry.supportedClaims) {
      assert.match(claim, /\[\d+(?:,\d+)*\]/, `${item.id}: claim needs a source index`);
      for (const match of claim.matchAll(/\[(\d+(?:,\d+)*)\]/g)) {
        for (const index of match[1].split(",").map(Number)) {
          assert.ok(index >= 1 && index <= entry.sources.length, `${item.id}: source index ${index} is missing`);
        }
      }
    }
    for (const reference of item.references ?? []) {
      assert.ok(entry.sources.some(source => source.title === reference.title && source.url === reference.url), `${item.id}: reference must match checked source title and URL`);
      if (reference.pmid) assert.equal(reference.url, `https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`);
    }
    for (const subdivision of item.subdivisions ?? []) {
      assert.ok(entry.supportedClaims.some(claim => claim.includes(subdivision.id)), `${subdivision.id}: missing explicit claim mapping`);
    }
    for (const target of item.targets ?? []) {
      assert.equal(target.activationPct, 0, `${item.id}: fabricated activation percentage`);
      assert.ok(["primary", "synergist", "stabilizer"].includes(target.role));
      assert.ok(MUSCLE_GROUP_EVIDENCE[target.muscleId], `${item.id}: unknown target`);
    }
  }
}
// Lehman 2004 (PMID 15228624) abstract, read 2026-10-23: no biceps difference; highest lats:biceps ratio in wide-grip pulldown
// and seated row; highest middle trapezius/rhomboid in seated row. "Small changes" is the authors' conclusion, not a finding.
const lehmanClaim = MUSCLE_GROUP_EVIDENCE.lats_teres.supportedClaims.find(claim => claim.includes("[3]"));
assert.ok(lehmanClaim, "lats_teres keeps a Lehman claim");
assert.equal(MUSCLE_GROUP_EVIDENCE.lats_teres.sources.find(entry => entry.url.includes("15228624")).checkedAt, "2026-10-23", "Lehman abstract was re-read 2026-10-23");
for (const required of [/wide-grip pulldown/i, /seated row/i, /lats:biceps/i, /biceps[^.;]*không khác/i, /thang giữa\/trám/i]) {
  assert.match(lehmanClaim, required, `Lehman claim must state the reported result: ${required}`);
}
assert.ok(!/khác biệt điện cơ nhỏ/.test(lehmanClaim), "do not assert 'small differences' as a study finding");
assert.ok(!/nhỏ/.test(lehmanClaim) || /tác giả[^.;]*nhỏ/i.test(lehmanClaim), "any 'small' wording must be attributed to the authors' conclusion");
// ACSM 2026 position stand (PMID 41843416, PMC12965823 open-access full text), read 2026-10-23: abstract, primary recommendation,
// Results (strength/hypertrophy), Table 6 and the variable definitions. Kubo 2019 (PMID 31230110) abstract re-read 2026-10-23.
const guidance = TRAINING_GENERAL_GUIDANCE;
assert.equal(guidance.reviewedBy, null, "general guidance: do not invent a reviewer");
assert.equal(guidance.sources.length, 1);
assert.ok(guidance.sources[0].url.endsWith("/41843416/"), "general guidance cites the ACSM 2026 position stand");
assert.equal(guidance.sources[0].checkedAt, "2026-10-23", "ACSM source was re-read 2026-10-23");
assert.match(guidance.sources[0].access, /PMC12965823/, "access states the full-text scope that was read");
assert.match(guidance.sources[0].access, /not read/i, "access states what was not read");
const guidanceClaim = pattern => {
  const claim = guidance.supportedClaims.find(text => pattern.test(text));
  assert.ok(claim, `general guidance claim missing: ${pattern}`);
  assert.match(claim, /\[1\]/, `general guidance claim must cite the ACSM source: ${pattern}`);
  return claim;
};
guidanceClaim(/nỗ lực cao[^.;]*hai/i);
guidanceClaim(/phì đại[^.;]*≥\s?10 hiệp\/nhóm cơ\/tuần/i);
guidanceClaim(/phì đại[^.;]*ly tâm/i);
guidanceClaim(/sức mạnh[^.;]*≥\s?80% 1RM/i);
guidanceClaim(/phì đại[^.;]*30% 1RM[^.;]*100% 1RM[^.;]*không/i);
for (const claim of guidance.supportedClaims) {
  assert.match(claim, /\[1\]/, "every general-guidance claim carries an ACSM reference");
  assert.ok(!/chờ chuyên gia/i.test(claim));
}
assert.ok(guidance.limitations.some(limit => /không phải[^.;]*cá nhân|cá nhân hóa|chưa cá nhân/i.test(limit)), "general guidance keeps the personal-prescription limit");
// ACSM 2026 Methods, Eligibility Criteria / Table 1: healthy adults are humans >=18 yr with no defined disease; RT interventions
// of at least 6 wk (minimum 12 exposures). The scope limitation must keep both, and the access note must say Methods was read.
assert.ok(guidance.limitations.some(limit => /≥18 tuổi/.test(limit) && /ít nhất 6 tuần/.test(limit)), "ACSM scope limitation states the adult >=18 and >=6-week eligibility");
assert.match(guidance.sources[0].access, /Methods|Eligibility/i, "ACSM access note says the eligibility passage was read");
const explorer = readFileSync(new URL("../src/components/training/TrainingAtlasExplorer.tsx", import.meta.url), "utf8");
assert.match(explorer, /import\s*\{[^}]*\bTRAINING_GENERAL_GUIDANCE\b[^}]*\}\s*from\s*"@\/lib\/clinical\/evidence-muscle"/, "TrainingAtlasExplorer imports TRAINING_GENERAL_GUIDANCE");
const guidanceAt = explorer.indexOf("<TrainingGuidancePanel");
assert.ok(guidanceAt > 0 && explorer.includes("guidance={TRAINING_GENERAL_GUIDANCE}"), "explorer renders the guidance block");
assert.ok(guidanceAt < explorer.indexOf('aria-label="Cách tra cứu PT"'), "guidance block sits at the top of the tab, before the lookup controls");
// Server-render the real component with the real data.
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const loaded = new Map();
const nodeRequire = createRequire(import.meta.url);
function load(file) {
  file = path.resolve(file);
  if (loaded.has(file)) return loaded.get(file);
  const mod = {};
  loaded.set(file, mod);
  const out = ts.transpileModule(readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(out, { exports: mod, require: target => {
    if (!target.startsWith(".") && !target.startsWith("@/")) return nodeRequire(target);
    const base = target.startsWith("@/") ? path.resolve(root, "src", target.slice(2)) : path.resolve(path.dirname(file), target);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
    assert(resolved, `Resolve ${target}`);
    return load(resolved);
  } }, { filename: file });
  return mod;
}
const { TrainingGuidancePanel } = load(path.join(root, "src/components/training/TrainingGuidancePanel.tsx"));
const guidanceHtml = renderToStaticMarkup(createElement(TrainingGuidancePanel, { guidance }));
assert.ok(guidanceHtml.includes("Nguyên tắc chung (ACSM 2026)"), "guidance block title");
assert.match(guidanceHtml, /<details[^>]*\sopen=""/, "guidance block is open by default");
for (const claim of guidance.supportedClaims) assert.ok(guidanceHtml.includes(claim), "guidance claim is rendered");
assert.ok(guidanceHtml.includes("https://pubmed.ncbi.nlm.nih.gov/41843416/"), "guidance links to the ACSM source");
assert.ok(guidanceHtml.includes("2026-10-23") && guidanceHtml.includes("PMC12965823"), "guidance shows source access scope");
assert.ok(!/Chờ chuyên gia|chờ chuyên gia/.test(guidanceHtml), "no expert-approval gate badge");
assert.ok(!/text-\[(?:[0-9]|1[01])px\]/.test(readFileSync(path.join(root, "src/components/training/TrainingGuidancePanel.tsx"), "utf8")), "text floor of text-xs");
// Kubo 2019 (PMID 31230110) abstract, re-read 2026-10-23: gluteus maximus +6.7 +/- 3.5% (full) vs +2.2 +/- 2.6% (half), p = 0.008;
// adductors +6.2 +/- 2.6% vs +2.7 +/- 3.1%, p = 0.026; 17 men, 10 weeks, 2 days/week.
const kuboSource = group => MUSCLE_GROUP_EVIDENCE[group].sources.find(entry => entry.url.includes("31230110"));
for (const group of ["glutes", "quads_adductors"]) assert.equal(kuboSource(group).checkedAt, "2026-10-23", `${group}: Kubo abstract re-read 2026-10-23`);
const kuboIndex = group => MUSCLE_GROUP_EVIDENCE[group].sources.indexOf(kuboSource(group)) + 1;
const gluteKubo = MUSCLE_GROUP_EVIDENCE.glutes.supportedClaims.find(claim => claim.includes(`[${kuboIndex("glutes")}]`) && /squat/.test(claim));
for (const required of [/full squat/i, /half squat/i, /6,7/, /2,2/, /p\s?=\s?0,008/, /17 nam/]) assert.match(gluteKubo, required, `glutes Kubo claim: ${required}`);
const adductorKubo = MUSCLE_GROUP_EVIDENCE.quads_adductors.supportedClaims.find(claim => claim.includes(`[${kuboIndex("quads_adductors")}]`) && /khép/.test(claim));
assert.ok(adductorKubo, "quads_adductors states the Kubo adductor result");
for (const required of [/6,2/, /2,7/, /p\s?=\s?0,026/, /full squat/i, /half squat/i]) assert.match(adductorKubo, required, `adductor Kubo claim: ${required}`);
const gluteCard = MUSCLE_GROUP_ATLAS.find(group => group.id === "glutes").hypertrophyScience;
assert.ok(/Kubo/.test(gluteCard) && /6,7/.test(gluteCard) && /2,2/.test(gluteCard), "glute card states the Kubo full vs half squat result");
const quadCard = MUSCLE_GROUP_ATLAS.find(group => group.id === "quads_adductors").hypertrophyScience;
assert.ok(/khép/.test(quadCard) && /6,2/.test(quadCard) && /2,7/.test(quadCard), "quad/adductor card states the Kubo adductor result");
assert.equal(MUSCLE_GROUP_ATLAS.flatMap(group => group.subdivisions).length, 27);
assert.equal(HYPERTROPHY_EXERCISES.flatMap(exercise => exercise.targets).length, 32);
assert.equal(MUSCLE_EVIDENCE_REVIEW.reviewedBy, null);
assert.equal(MUSCLE_EVIDENCE_REVIEW.reviewedAt, null);
assert.equal(MUSCLE_EVIDENCE_REVIEW.spatialMappingStatus, "source-model-unverified");
console.log("Muscle evidence integrity: 11 groups, 27 subdivisions, 13 exercises, 32 qualitative targets covered; source scope and truthful reviewer metadata checked.");
