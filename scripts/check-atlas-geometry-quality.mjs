// Engineering regressions: these checks do not establish anatomical accuracy.
import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync, statSync, mkdtempSync, mkdirSync, cpSync, symlinkSync, writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import vm from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";

const auditUrl = new URL("./audit-atlas-geometry-quality.mjs", import.meta.url);
const audit = existsSync(auditUrl) ? await import(auditUrl) : {};
const curatedUrl = new URL("../src/lib/clinical/atlas-geometry-pilots.mjs", import.meta.url);
const curated = existsSync(curatedUrl) ? await import(curatedUrl) : {};
const json = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));

function mesh(positions, indices, offset = [0, 0, 0]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions.flat(), 3));
  if (indices) geometry.setIndex(indices);
  const object = new THREE.Mesh(geometry);
  object.position.fromArray(offset);
  object.updateMatrixWorld(true);
  return object;
}
function measure(meshes) {
  assert.equal(typeof audit.measureStructureGeometry, "function");
  return audit.measureStructureGeometry(meshes);
}

test("welds duplicate material/normal seam slots across primitives in world space", () => {
  // The two triangles form a square, including a duplicated diagonal seam.
  const result = measure([
    mesh([[0, 0, 0], [1, 0, 0], [1, 1, 0]], [0, 1, 2], [3, 4, 5]),
    mesh([[0, 0, 0], [1, 1, 0], [0, 1, 0]], null, [3, 4, 5]),
  ]);
  assert.equal(result.primitives, 2);
  assert.equal(result.triangles, 2);
  assert.equal(result.vertexSlots, 6);
  assert.equal(result.weldedVertices, 4);
  assert.equal(result.boundaryEdges, 4);
  assert.equal(result.nonmanifoldEdges, 0);
  assert.deepEqual(result.worldBounds, [[3, 4, 5], [4, 5, 5]]);
});

test("distinguishes a closed tetrahedron from a three-face shared nonmanifold edge", () => {
  const vertices = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const tetrahedron = measure([mesh(vertices, [0, 2, 1, 0, 1, 3, 1, 2, 3, 2, 0, 3])]);
  assert.equal(tetrahedron.boundaryEdges, 0);
  assert.equal(tetrahedron.nonmanifoldEdges, 0);
  const branch = measure([mesh([...vertices, [0, -1, 0]], [0, 1, 2, 1, 0, 3, 0, 1, 4])]);
  assert.equal(branch.boundaryEdges, 6);
  assert.equal(branch.nonmanifoldEdges, 1);
});

test("grid welding is documented rounding, not an unrestricted distance weld", () => {
  const result = measure([mesh([[0, 0, 0], [0.00000004, 0, 0], [0, 1, 0]], [0, 1, 2])]);
  assert.equal(result.weldedVertices, 2);
  assert.equal(result.degenerateTrianglesAfterWeld, 1);
  assert.equal(result.boundaryEdges, 0, "collapsed triangle is excluded from edge incidence");
});

test("counts invalid components without laundering them into valid bounds or topology", () => {
  const result = measure([mesh([[0, 0, 0], [NaN, Infinity, 0], [1, 1, 0]], [0, 1, 2])]);
  assert.equal(result.nonfinitePositionComponents, 2);
  assert.ok(result.nonfiniteWorldPositionComponents > 0);
  assert.equal(result.invalidPositionTriangles, 1);
  assert.deepEqual(result.worldBounds, [[0, 0, 0], [1, 1, 0]]);
  assert.equal(result.boundaryEdges, 0);
  assert.throws(() => measure([mesh([[0, 0, 0]], [0, 1, 0])]), /index/i);
});

test("the curated ten pilots are the exact bilateral source objects, excluding nearby names", () => {
  assert.ok(Array.isArray(curated.ATLAS_GEOMETRY_PILOTS));
  const expected = json("../docs/research/assets/2026-10-28-atlas-geometry/pilot-modifier-evaluation.json").records;
  const manifest = json("../public/anatomy/3d/manifest.json");
  assert.equal(curated.ATLAS_GEOMETRY_PILOTS.length, 10);
  assert.deepEqual(curated.ATLAS_GEOMETRY_PILOTS.map((s) => s.id).sort(), expected.map((s) => s.id).sort());
  for (const pilot of curated.ATLAS_GEOMETRY_PILOTS) {
    const entry = manifest.structures.find((s) => s.id === pilot.id);
    assert.equal(entry.english, pilot.english);
    assert.equal(entry.side, pilot.side);
    assert.equal(curated.isSchematicGeometryPilot(pilot.id), true);
    assert.equal(expected.find((s) => s.id === pilot.id).sourceName, `${entry.english}.${entry.side === "left" ? "l" : "r"}`);
  }
  for (const entry of manifest.structures) {
    assert.equal(curated.isSchematicGeometryPilot(entry.id), expected.some((s) => s.id === entry.id));
  }
  assert.equal(curated.isSchematicGeometryPilot("unknown"), false);
});

test("saved inventory covers the exact manifest with pinned baseline and truthful pilot limits", () => {
  const saved = json("../public/anatomy/3d/geometry-quality.json");
  const manifest = json("../public/anatomy/3d/manifest.json");
  assert.deepEqual(saved.structures.map((s) => s.id).sort(), manifest.structures.map((s) => s.id).sort());
  assert.equal(saved.summary.structures, 1031);
  assert.equal(saved.summary.primitives, 1411);
  assert.equal(saved.summary.triangles, 2368785);
  assert.equal(saved.summary.structuresAtMost10Triangles, 154);
  assert.equal(saved.summary.structuresExactly2Triangles, 58);
  assert.equal(saved.summary.nonfinitePositionComponents, 0);
  assert.equal(saved.summary.nonfiniteWorldPositionComponents, 0);
  assert.equal(saved.bundle.sha256, "bb1a7269cabab3b86112962777bb4509527dda79bae6094324e266a9145c1b1f");
  assert.equal(saved.source.assetVersion, 2);
  assert.equal(saved.reviewedBy, null);
  for (const row of saved.structures.filter((s) => s.representation)) {
    assert.equal(row.representation, "schematic-open-surface");
    assert.equal(row.verifiedAnatomicalVolume, false);
    assert.equal(row.verifiedTissueThickness, false);
    assert.ok(row.boundaryEdges > 0);
  }
  assert.equal(saved.structures.filter((s) => s.representation).length, 10);
  assert.equal(typeof audit.assertGeometryBaseline, "function");
  assert.throws(() => audit.assertGeometryBaseline({ ...saved, bundle: { ...saved.bundle, sha256: "changed" } }), /hash|version/i);
  assert.throws(() => audit.assertGeometryBaseline({ ...saved, summary: { ...saved.summary, triangles: 2368786 } }), /baseline/i);
  assert.throws(() => audit.assertGeometryBaseline({ ...saved, summary: { ...saved.summary, nonfinitePositionComponents: 1 } }), /finite/i);
});

test("rejects missing, extra and duplicate manifest IDs and pilot identity drift", () => {
  assert.equal(typeof audit.buildGeometryInventory, "function");
  const manifest = json("../public/anatomy/3d/manifest.json");
  const meshes = manifest.structures.map((entry) => {
    const object = mesh([[0, 0, 0], [1, 0, 0], [0, 1, 0]], [0, 1, 2]);
    object.userData.structureId = entry.id;
    return object;
  });
  assert.throws(() => audit.buildGeometryInventory(meshes.slice(1), manifest, {}), /IDs.*match/i);
  const extra = mesh([[0, 0, 0], [1, 0, 0], [0, 1, 0]], [0, 1, 2]);
  extra.userData.structureId = "unknown";
  assert.throws(() => audit.buildGeometryInventory([...meshes, extra], manifest, {}), /IDs.*match/i);
  assert.throws(() => audit.buildGeometryInventory(meshes, { ...manifest, structures: [...manifest.structures, manifest.structures[0]] }, {}), /IDs.*match/i);
  const changed = structuredClone(manifest);
  changed.structures.find((entry) => entry.id === "za-acb77fda82d0").english = "Posterior talofibular ligament";
  assert.throws(() => audit.buildGeometryInventory(meshes, changed, {}), /pilot.*identity/i);
});

test("renders the brief schematic note for exactly the ten pilots and imports no inventory", () => {
  const require = createRequire(import.meta.url);
  const ts = require("typescript");
  const file = new URL("../src/components/atlas3d/AtlasGeometryNote.tsx", import.meta.url);
  const source = readFileSync(file, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(compiled.outputText, { exports, require: (name) => name === "@/lib/clinical/atlas-geometry-pilots.mjs" ? curated : require(name) });
  for (const entry of json("../public/anatomy/3d/manifest.json").structures) {
    const html = renderToStaticMarkup(exports.AtlasGeometryNote({ structureId: entry.id }));
    assert.equal(html.includes(curated.SCHEMATIC_GEOMETRY_NOTE), curated.isSchematicGeometryPilot(entry.id));
    if (!curated.isSchematicGeometryPilot(entry.id)) assert.equal(html, "");
  }
  const explorer = readFileSync(new URL("../src/components/atlas3d/Atlas3DExplorer.tsx", import.meta.url), "utf8");
  assert.match(explorer, /<AtlasGeometryNote structureId=\{selected\.id\}/);
  assert.doesNotMatch(source + explorer, /geometry-quality\.json/);
});

test("default and --check decode actual assets without writing the saved inventory or GLB", () => {
  const files = ["../public/anatomy/3d/geometry-quality.json", "../public/anatomy/3d/full.glb", "../public/anatomy/3d/manifest.json"];
  const snapshots = () => files.map((file) => {
    const url = new URL(file, import.meta.url);
    return { hash: createHash("sha256").update(readFileSync(url)).digest("hex"), mtimeMs: statSync(url).mtimeMs };
  });
  const before = snapshots();
  for (const args of [[], ["--check"]]) {
    const run = spawnSync(process.execPath, [auditUrl.pathname, ...args], { encoding: "utf8", timeout: 120000 });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.deepEqual(snapshots(), before);
    assert.match(run.stdout, /1031 structures.*1411 primitives.*2368785 triangles/);
  }
});

test("--check refuses missing/stale files without creating or repairing them", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "atlas-geometry-check-"));
  try {
    for (const file of [
      "scripts/audit-atlas-geometry-quality.mjs", "scripts/load-atlas-audit.mjs",
      "src/lib/clinical/atlas-geometry-pilots.mjs", "public/anatomy/3d/manifest.json",
      "public/anatomy/3d/full.glb", "public/anatomy/3d/draco/draco_decoder.js",
    ]) {
      const target = path.join(dir, file);
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(new URL(`../${file}`, import.meta.url), target);
    }
    symlinkSync(new URL("../node_modules", import.meta.url).pathname, path.join(dir, "node_modules"));
    const target = path.join(dir, "public/anatomy/3d/geometry-quality.json");
    const run = (flag) => spawnSync(process.execPath, [path.join(dir, "scripts/audit-atlas-geometry-quality.mjs"), flag], { encoding: "utf8", timeout: 120000 });
    const missing = run("--check");
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /ENOENT/);
    assert.equal(existsSync(target), false);
    writeFileSync(target, "stale sentinel\n");
    const before = statSync(target).mtimeMs;
    const stale = run("--check");
    assert.equal(stale.status, 1);
    assert.match(stale.stderr, /stale/i);
    assert.equal(readFileSync(target, "utf8"), "stale sentinel\n");
    assert.equal(statSync(target).mtimeMs, before);
    const invalid = run("--unknown");
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /usage/i);
    assert.equal(readFileSync(target, "utf8"), "stale sentinel\n");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
