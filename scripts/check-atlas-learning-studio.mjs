import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import test from "node:test";
import * as THREE from "three";
import { surfaceLabelPoint } from "../src/components/atlas3d/surface-label-layout.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
let now = 0;
let nextFrame = 0;
const frames = new Map();
function load(relative) {
  let file = path.resolve(root, relative);
  if (!existsSync(file) && existsSync(`${file}.ts`)) file += ".ts";
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const { outputText, diagnostics } = ts.transpileModule(
    readFileSync(file, "utf8"),
    {
      fileName: file,
      reportDiagnostics: true,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    },
  );
  assert.equal(diagnostics?.length ?? 0, 0, `syntax: ${file}`);
  vm.runInNewContext(
    outputText,
    {
      exports,
      URL,
      require: (target) =>
        target.startsWith("@/")
          ? load(`src/${target.slice(2)}`)
          : target.startsWith(".")
            ? load(
                path.relative(root, path.resolve(path.dirname(file), target)),
              )
            : target === "three"
              ? THREE
              : require(target),
      performance: { now: () => now },
      requestAnimationFrame: (callback) => {
        const id = ++nextFrame;
        frames.set(id, callback);
        return id;
      },
      cancelAnimationFrame: (id) => frames.delete(id),
    },
    { filename: file },
  );
  return exports;
}
function tick(time) {
  now = time;
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((callback) => callback(time));
}
const manifest = JSON.parse(
  readFileSync(path.join(root, "public/anatomy/3d/manifest.json")),
);
const names = load("src/lib/clinical/atlas-names.ts");
const { ATLAS_MUSCULAR_NAMES_VI } = load(
  "src/lib/clinical/atlas-muscular-names.vi.ts",
);
const atlas = load("src/lib/clinical/atlas-3d.ts");
const learning = load("src/components/atlas3d/region-learning.ts");
const { CameraTransition, setOrthographicSpan } = load(
  "src/components/atlas3d/atlas-camera.ts",
);

test("changing region produces a reloadable URL and removes stale source selections", () => {
  assert.equal(typeof learning.atlasAreaHref, "function");
  const href = learning.atlasAreaHref(
    "http://localhost:3000/atlas?tab=3d&area=hip&structure=old&group=glutes&exercise=old#atlas-learning-studio",
    "upper",
  );
  const url = new URL(href, "http://localhost:3000");
  assert.equal(url.pathname, "/atlas");
  assert.equal(url.searchParams.get("area"), "upper");
  assert.equal(url.searchParams.get("tab"), "3d");
  for (const key of ["structure", "group", "exercise"])
    assert.equal(url.searchParams.has(key), false);
  assert.equal(url.hash, "#atlas-learning-studio");
});

test("all muscular-layer source names have paired display names and both-language search", () => {
  const structures = manifest.structures.filter((s) => s.layer === "muscle");
  assert.equal(structures.length, 429);
  assert.equal(new Set(structures.map((s) => s.english)).size, 216);
  assert.equal(Object.keys(ATLAS_MUSCULAR_NAMES_VI).length, 216);
  for (const structure of structures) {
    const vi = names.atlasVietnameseName(structure);
    assert.equal(typeof vi, "string");
    assert.ok(vi.length > 0 && vi !== structure.english);
    assert.equal(
      names.atlasStructureName(structure),
      `${vi} · ${names.atlasShortEnglishName(structure)}`,
    );
    for (const query of [vi, structure.english])
      assert.ok(
        atlas
          .searchStructures([structure], query, "full")
          .some((s) => s.id === structure.id),
      );
  }
  const unknown = {
    english: "Future unmapped structure",
    label: "Future unmapped structure",
  };
  assert.equal(names.atlasVietnameseName(unknown), null);
  assert.equal(names.atlasStructureName(unknown), unknown.english);
});

test("six lesson configurations select actual local source examples and reset layer presets", () => {
  for (const { id: area } of atlas.ATLAS_AREAS) {
    const steps = learning.regionLearningSteps(area, manifest.structures);
    assert.equal(steps.length, 5);
    assert.equal(new Set(steps.map((s) => s.id)).size, 5);
    const target = manifest.structures.find(
      (s) => s.id === steps[3].structureId,
    );
    assert.ok(target && (area === "full" || target.areas.includes(area)), area);
    assert.equal(target.english, learning.LEARNING_REGIONS[area].example);
    assert.equal(target.side, "left");
    assert.equal(steps[1].layers.bone, true);
    assert.equal(steps[1].layers.muscle, false);
    assert.equal(steps[2].layers.muscle, true);
    assert.equal(steps[4].layers.joint, false);
    const empty = learning.regionLearningSteps(area, []);
    assert.equal(empty[3].structureId, undefined);
    assert.equal(empty[3].camera, "reset");
  }
});

test("every translated term has scoped evidence without hiding partial or unresolved names", () => {
  const evidence = load("src/lib/clinical/atlas-terminology-evidence.ts");
  const comparisons = evidence.ATLAS_TERMINOLOGY_COMPARISONS;
  assert.deepEqual(Object.keys(comparisons).sort(), Object.keys(ATLAS_MUSCULAR_NAMES_VI).sort());
  assert.equal(evidence.ATLAS_TERMINOLOGY_CHECKED_AT, "2026-10-28");
  assert.equal(evidence.ATLAS_TERMINOLOGY_REVIEWED_BY, null);
  const counts = { matched: 0, partial: 0, unresolved: 0 };
  for (const [english, comparison] of Object.entries(comparisons)) {
    counts[comparison.status]++;
    assert.equal(evidence.getAtlasTerminologyComparison(english), comparison);
    assert.ok(evidence.ATLAS_TERMINOLOGY_STATUS_LABELS[comparison.status]);
    if (comparison.status === "unresolved") {
      assert.equal(comparison.references.length, 0);
      assert.ok(comparison.note);
    } else {
      assert.ok(comparison.references.length);
      if (comparison.status === "partial") assert.ok(comparison.note);
    }
    for (const reference of comparison.references) {
      const source = evidence.ATLAS_TERMINOLOGY_SOURCES[reference.sourceId];
      assert.ok(source.title && source.authors && source.access && source.hostNote);
      assert.ok(source.checkedAt && source.format);
      if (source.format === "pdf") assert.ok(Number.isInteger(reference.page) && reference.page > 0);
      else {
        assert.equal(reference.page, null);
        assert.equal(reference.locator, "SNOMED CT 244872002");
      }
      assert.ok(reference.sourceTerm);
      const url = new URL(evidence.atlasTerminologyReferenceUrl(reference));
      assert.equal(url.protocol, "https:");
      assert.equal(url.hash, source.format === "pdf" ? `#page=${reference.page}` : "");
      const pageCount = { "hmu-2004": 329, phcn: 55, "pnt-2025": 11, "byt-2427-2025": 1441 };
      if (source.format === "pdf") assert.ok(reference.page <= pageCount[reference.sourceId]);
    }
  }
  assert.deepEqual(counts, { matched: 193, partial: 22, unresolved: 1 });
  const structureCounts = { matched: 0, partial: 0, unresolved: 0 };
  for (const structure of manifest.structures)
    if (structure.layer === "muscle") structureCounts[comparisons[structure.english].status]++;
  assert.deepEqual(structureCounts, { matched: 383, partial: 44, unresolved: 2 });
  for (const unknown of ["Future unmapped structure", "toString", "__proto__"])
    assert.equal(evidence.getAtlasTerminologyComparison(unknown), null);
  assert.notEqual(ATLAS_MUSCULAR_NAMES_VI["Longissimus capitis muscle"], ATLAS_MUSCULAR_NAMES_VI["Longus capitis muscle"]);
  assert.notEqual(ATLAS_MUSCULAR_NAMES_VI["Longissimus colli muscle"], ATLAS_MUSCULAR_NAMES_VI["Longus colli muscle"]);
  for (const place of ["hand", "foot"]) {
    const key = `Flexor digiti minimi of ${place}`;
    assert.match(ATLAS_MUSCULAR_NAMES_VI[key], /gấp ngắn ngón út/);
    assert.equal(comparisons[key].status, "partial", "brevis mismatch stays explicit");
    assert.match(comparisons[key].note, /brevis/);
  }
  const readingRecord = readFileSync(path.join(root, "public/anatomy/3d/TERMINOLOGY.md"), "utf8");
  for (const english of Object.keys(comparisons)) assert.ok(readingRecord.includes(english), english);
});

test("regional foundation references resolve to their own source records", () => {
  const { REGION_FOUNDATIONS } = load("src/lib/clinical/anatomy-atlas.ts");
  const { ANATOMY_REGION_EVIDENCE } = load(
    "src/lib/clinical/evidence-anatomy.ts",
  );
  for (const config of Object.values(learning.LEARNING_REGIONS))
    for (const region of config.regions) {
      assert.ok(REGION_FOUNDATIONS[region].length);
      for (const fact of REGION_FOUNDATIONS[region])
        for (const ref of fact.sourceRefs) {
          const source = ANATOMY_REGION_EVIDENCE[region].sources[ref - 1];
          assert.ok(source?.title && source.access && source.checkedAt);
          assert.equal(new URL(source.url).protocol, "https:");
        }
    }
});

test("camera easing completes finitely, cancels and replaces pending transitions", () => {
  frames.clear();
  now = 0;
  const transition = new CameraTransition();
  const progress = [];
  transition.run((value) => progress.push(value), false);
  assert.equal(frames.size, 1);
  tick(0);
  tick(140);
  tick(280);
  assert.equal(progress[0], 0);
  assert.equal(progress[1], 0.875);
  assert.equal(progress.at(-1), 1);
  assert.equal(frames.size, 0, "no idle animation loop");
  transition.run(() => assert.fail("cancelled callback ran"), false);
  transition.cancel();
  tick(400);
  assert.equal(frames.size, 0);
  transition.run(() => assert.fail("replaced callback ran"), false);
  let immediate;
  transition.run((value) => (immediate = value), true);
  assert.equal(immediate, 1);
  assert.equal(
    frames.size,
    0,
    "immediate/reduced-motion path schedules no RAF",
  );
  transition.run(() => transition.cancel(), false);
  tick(416);
  assert.equal(
    frames.size,
    0,
    "input/disposal during update stops rescheduling",
  );
});

test("orthographic sizing and visible anchors survive wide/narrow projections", () => {
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  camera.position.set(0, 0, 3);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
  );
  cube.updateMatrixWorld(true);
  for (const [width, height] of [
    [640, 420],
    [333, 480],
  ]) {
    setOrthographicSpan(camera, 1, width / height);
    assert.equal(camera.zoom, 1);
    assert.ok(Math.abs(camera.right / camera.top - width / height) < 1e-10);
    const point = surfaceLabelPoint([cube], [cube], camera, width, height);
    assert.ok(point);
    assert.ok(Math.abs(point.x - width / 2) < 1e-8);
    assert.ok(Math.abs(point.y - height / 2) < 1e-8);
  }
  const front = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
  );
  front.position.z = 1.3;
  front.updateMatrixWorld(true);
  assert.equal(
    surfaceLabelPoint([cube], [cube, front], camera, 333, 480),
    null,
  );
  for (const mesh of [cube, front]) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
});

test("source raycast acceleration preserves geometry, nearest hits and cleanup", async () => {
  const file = path.join(
    root,
    "src/components/atlas3d/raycast-acceleration.mjs",
  );
  assert.ok(
    existsSync(file),
    "exact source-surface picking needs an acceleration path",
  );
  const {
    accelerateSourceMesh,
    releaseSourceAcceleration,
    prepareSourceAcceleration,
  } = await import(file);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 32),
    new THREE.MeshBasicMaterial(),
  );
  mesh.updateMatrixWorld(true);
  const positions = mesh.geometry.attributes.position.array.slice();
  const indices = mesh.geometry.index.array.slice();
  const ray = new THREE.Raycaster();
  const rays = [-0.7, -0.3, 0, 0.3, 0.7].map(
    (x) => new THREE.Vector3(x, 0.2, -3),
  );
  const expected = rays.map((origin) => {
    ray.set(origin, new THREE.Vector3(0, 0, 1));
    return ray.intersectObject(mesh, false)[0];
  });
  assert.equal(accelerateSourceMesh(mesh), true);
  assert.ok(mesh.geometry.boundsTree);
  assert.deepEqual(mesh.geometry.attributes.position.array, positions);
  assert.deepEqual(
    mesh.geometry.index.array,
    indices,
    "indirect BVH leaves source triangle indices intact",
  );
  ray.firstHitOnly = true;
  rays.forEach((origin, index) => {
    ray.set(origin, new THREE.Vector3(0, 0, 1));
    const actual = ray.intersectObject(mesh, false)[0];
    assert.ok(actual.point.distanceTo(expected[index].point) < 1e-7);
    assert.ok(Math.abs(actual.distance - expected[index].distance) < 1e-7);
    assert.equal(actual.faceIndex, expected[index].faceIndex);
  });
  releaseSourceAcceleration(mesh);
  assert.equal(mesh.geometry.boundsTree, undefined);
  assert.equal(
    mesh.raycast,
    THREE.Mesh.prototype.raycast,
    "other canvases keep the native prototype",
  );
  assert.equal(
    await prepareSourceAcceleration([mesh], () => true),
    false,
    "cancel before allocating a stale tree",
  );
  assert.equal(mesh.geometry.boundsTree, undefined);
  mesh.geometry.dispose();
  mesh.material.dispose();
});

// Expected pairs and locators transcribed from the bounded 2026-10-28 research report.
const terminologyBatch = [
  ["Levatores breves costarum", "unresolved", "325", "6108535", "368051000", "Toàn bộ cơ nâng sườn ngắn", "Entire levator costae brevis muscle"],
  ["Levatores longi costarum", "unresolved", "325", "6108536", "368050004", "Toàn bộ cơ nâng sườn dài", "Entire levator costae longus muscle"],
  ["Rotatores", "unresolved", "489", "6112778", "244872002", "Toàn bộ cơ xoay", "Entire rotator muscle"],
  ["Spinalis capitis muscle", "unresolved", "1289", "6132695", "50200003", "Cấu trúc cơ gai đầu", "Structure of spinalis capitis muscle"],
  ["Spinalis colli muscle", "unresolved", "1289", "6132696", "90411004", "Cơ gai cổ", "Structure of spinalis cervicis muscle"],
  ["Superficial transverse metacarpal ligament", "unresolved", "566", "6114727", "15324007", "Toàn bộ dây chằng ngang gan tay nông", "Entire superficial transverse metacarpal ligament"],
  ["Superficial transverse metatarsal ligament", "unresolved", "566", "6114728", "42009009", "Toàn bộ dây chằng ngang nông bàn chân", "Entire superficial transverse metatarsal ligament"],
  ["Humeral head of extensor carpi ulnaris", "partial", "258", "6106797", "368527004", "Toàn bộ đầu cánh tay của cơ duỗi cổ tay trụ", "Entire humeral head of extensor carpi ulnaris muscle"],
  ["Ulnar head of extensor carpi ulnaris", "partial", "629", "6116352", "368528009", "Toàn bộ đầu trụ của cơ duỗi cổ tay trụ", "Entire ulnar head of extensor carpi ulnaris muscle"],
  ["Iliocostalis lumborum muscle", "partial", "978", "6125231", "49178001", "Cấu trúc cơ chậu - sườn thắt lưng", "Structure of iliocostalis lumborum muscle"],
  ["Iliocostalis thoracis muscle", "partial", "978", "6125233", "10921009", "Cấu trúc cơ chậu-sườn ngực", "Structure of iliocostalis thoracis muscle"],
  ["Interspinales colli muscles", "partial", "282", "6107407", "246011001", "Cơ gian gai cổ", "Entire interspinalis cervicis muscle"],
  ["Interspinales lumborum muscles", "partial", "282", "6107408", "246021009", "Toàn bộ cơ gian gai thắt lưng", "Entire interspinalis lumborum muscle"],
  ["Interspinales thoracis muscles", "partial", "282", "6107410", "134197004", "Toàn bộ cơ gian gai ngực", "Entire interspinalis thoracis muscle"],
  ["Longissimus capitis muscle", "partial", "1071", "6127470", "61134003", "Cấu trúc cơ longissimus đầu", "Structure of longissimus capitis muscle"],
  ["Longissimus colli muscle", "partial", "1071", "6127471", "50059002", "Cấu trúc cơ dài cổ bên", "Structure of longissimus cervicis muscle"],
  ["Longissimus thoracis muscle", "partial", "1071", "6127473", "24796008", "Cấu trúc cơ dài ngực", "Structure of longissimus thoracis muscle"],
  ["Semispinalis colli muscle", "partial", "1266", "6132146", "44222009", "Cấu trúc cơ bán gai cổ", "Structure of semispinalis cervicis muscle"],
  ["Semispinalis thoracis muscle", "partial", "1266", "6132148", "29385000", "Cấu trúc cơ bán gai ngực", "Structure of semispinalis thoracis muscle"],
  ["Spinalis thoracis muscle", "partial", "1289", "6132698", "88769007", "Cơ gai ngực", "Structure of spinalis thoracis muscle"],
];
const remainingPartialTerms = [
  "Acromial part of deltoid muscle",
  "Clavicular part of deltoid muscle",
  "Scapular spinal part of deltoid muscle",
  "Ascending part of trapezius muscle",
  "Descending part of trapezius muscle",
  "Transverse part of trapezius muscle",
  "Deep head of pronator teres",
  "Superficial head of pronator teres",
  "Dorsal parts of lateral intertransversarii lumborum muscles",
  "Ventral parts of lateral intertransversarii lumborum muscles",
  "Ary-epiglottic part of oblique arytenoid muscle",
  "Thyro-epiglottic part of thyro-arytenoid muscle",
  "External part of thyro-arytenoid muscle",
  "Flexor digiti minimi of foot",
  "Flexor digiti minimi of hand",
  "Iliocostalis colli muscle",
  "Multifidus colli muscle",
  "Multifidus lumborum muscle",
  "Multifidus thoracis muscle",
  "Splenius capitis muscle",
  "Splenius colli muscle",
  "Tendon of extensor digitorum longus",
];
const preservedTerminologyReferences = {
  "Humeral head of extensor carpi ulnaris": [117, "Cơ duỗi cổ tay-trụ (m. extensor carpi ulnaris)"],
  "Ulnar head of extensor carpi ulnaris": [117, "Cơ duỗi cổ tay-trụ (m. extensor carpi ulnaris)"],
  "Iliocostalis lumborum muscle": [90, "Cơ chậu sườn-thắt lưng"],
  "Iliocostalis thoracis muscle": [90, "Cơ chậu sườn-ngực"],
  "Interspinales colli muscles": [91, "Các cơ gian gai (musculi interspinales)"],
  "Interspinales lumborum muscles": [91, "Các cơ gian gai (musculi interspinales)"],
  "Interspinales thoracis muscles": [91, "Các cơ gian gai (musculi interspinales)"],
  "Longissimus capitis muscle": [90, "Cơ dài đầu"],
  "Longissimus colli muscle": [90, "Cơ dài cổ"],
  "Longissimus thoracis muscle": [90, "Cơ dài ngực"],
  "Semispinalis colli muscle": [90, "Cơ bán gai cổ"],
  "Semispinalis thoracis muscle": [90, "Cơ bán gai ngực"],
  "Spinalis thoracis muscle": [90, "Cơ gai ngực"],
};

test("the twenty sourced terminology upgrades retain exact bilingual pairs and source history", () => {
  const evidence = load("src/lib/clinical/atlas-terminology-evidence.ts");
  const comparisons = evidence.ATLAS_TERMINOLOGY_COMPARISONS;
  const sources = evidence.ATLAS_TERMINOLOGY_SOURCES;
  assert.equal(terminologyBatch.length, 20);
  assert.equal(terminologyBatch.filter((row) => row[1] === "unresolved").length, 7);
  const bytUrl = "https://hscv.dienbien.gov.vn/qlvb/vbpq.nsf/3d0f058120469ad34725726600365420/958EDD2F2512480F47258CD500065A0B/%24file/03%20Phu%20luc%2001%20%28Danh%20muc%20Cau%20truc%20co%20the%29.signed.pdf";
  assert.ok(sources["byt-2427-2025"], "new BYT source is recorded");
  assert.equal(sources["byt-2427-2025"].url, bytUrl);
  assert.equal(sources["byt-2427-2025"].checkedAt, "2026-10-28");
  assert.match(sources["byt-2427-2025"].hostNote, /không.*mọi dòng/);
  for (const [english, , page, rowId, snomedCt, sourceTerm, sourceEnglishTerm] of terminologyBatch) {
    const record = comparisons[english];
    assert.equal(record.status, "matched", english);
    assert.equal(record.checkedAt, "2026-10-28", english);
    const ref = record.references.find((ref) => ref.sourceId === "byt-2427-2025");
    assert.ok(ref, english);
    assert.equal(ref.page, Number(page), english);
    assert.equal(ref.rowId, rowId, english);
    assert.equal(ref.snomedCt, snomedCt, english);
    assert.equal(ref.sourceTerm, sourceTerm, english);
    assert.equal(ref.sourceEnglishTerm, sourceEnglishTerm, english);
    assert.equal(evidence.atlasTerminologyReferenceUrl(ref), `${bytUrl}#page=${page}`);
    if (preservedTerminologyReferences[english]) {
      const [oldPage, oldTerm] = preservedTerminologyReferences[english];
      assert.ok(record.references.some((ref) => ref.sourceId === "hmu-2004" && ref.page === oldPage && ref.sourceTerm === oldTerm), english);
      assert.match(record.note, /2004/);
    }
  }
  const updatedKeys = new Set(terminologyBatch.map(([key]) => key));
  for (const [key, record] of Object.entries(comparisons))
    assert.equal(record.checkedAt, updatedKeys.has(key) ? "2026-10-28" : "2026-10-23", key);
  assert.deepEqual(Object.entries(comparisons).filter(([, record]) => record.status === "partial").map(([key]) => key).sort(), remainingPartialTerms.sort());
  assert.deepEqual(Object.entries(comparisons).filter(([, record]) => record.status === "unresolved").map(([key]) => key), ["Adductor minimus"]);
  for (const id of ["hmu-2004", "phcn", "pnt-2025"]) assert.equal(sources[id].checkedAt, "2026-10-23");
  assert.match(comparisons["Longissimus capitis muscle"].note, /longissimus đầu/);
  assert.match(comparisons["Longissimus colli muscle"].note, /dài cổ bên/);
  assert.match(comparisons["Longissimus thoracis muscle"].note, /dài ngực/);
  assert.match(comparisons["Spinalis colli muscle"].note, /colli.*cervicis/);
  assert.match(comparisons["Levatores breves costarum"].note, /số ít.*số nhiều/);
  assert.match(comparisons["Superficial transverse metacarpal ligament"].note, /ngang gan tay nông/);
});

test("Rotatores uses the same SNOMED concept through a scoped HTML synonym bridge", () => {
  const evidence = load("src/lib/clinical/atlas-terminology-evidence.ts");
  const record = evidence.getAtlasTerminologyComparison("Rotatores");
  const ref = record.references.find((ref) => ref.sourceId === "vt-sct-244872002");
  assert.ok(ref, "Rotatores requires the HTML concept bridge");
  const source = evidence.ATLAS_TERMINOLOGY_SOURCES[ref.sourceId];
  assert.equal(source.format, "html");
  assert.equal(source.checkedAt, "2026-10-28");
  assert.equal(ref.page, null);
  assert.equal(ref.locator, "SNOMED CT 244872002");
  assert.equal(ref.snomedCt, record.references.find((ref) => ref.sourceId === "byt-2427-2025").snomedCt);
  assert.equal(ref.sourceTerm, "Entire rotator muscle (body structure) / Entire Rotatores");
  const url = new URL(evidence.atlasTerminologyReferenceUrl(ref));
  assert.equal(url.hostname, "vtsl.vetmed.vt.edu");
  assert.equal(url.searchParams.get("SCT_ConceptID"), "244872002");
  assert.equal(url.hash, "");
  assert.match(source.hostNote, /thú y/);
  assert.match(source.hostNote, /không.*giải phẫu người/);
});
