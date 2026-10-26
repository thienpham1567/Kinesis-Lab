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
  assert.equal(evidence.ATLAS_TERMINOLOGY_CHECKED_AT, "2026-10-23");
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
      assert.ok(Number.isInteger(reference.page) && reference.page > 0);
      assert.ok(reference.sourceTerm);
      const url = new URL(evidence.atlasTerminologyReferenceUrl(reference));
      assert.equal(url.protocol, "https:");
      assert.equal(url.hash, `#page=${reference.page}`);
      const pageCount = { "hmu-2004": 329, phcn: 55, "pnt-2025": 11 };
      assert.ok(reference.page <= pageCount[reference.sourceId]);
    }
  }
  assert.deepEqual(counts, { matched: 173, partial: 35, unresolved: 8 });
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
