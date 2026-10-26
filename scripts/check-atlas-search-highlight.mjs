import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const { structures } = JSON.parse(readFileSync(new URL("../public/anatomy/3d/manifest.json", import.meta.url)));
const load = createAppLoader();
const atlas = load("src/lib/clinical/atlas-3d.ts");
const names = load("src/lib/clinical/atlas-names.ts");
const ids = rows => Array.from(rows, row => row.id).sort();
const internal = structures.filter(row => row.english === "Internal abdominal oblique muscle");

test("Internal Oblique resolves to both source sides and excludes External Oblique", () => {
  assert.equal(typeof atlas.resolveAtlasSearch, "function");
  const result = atlas.resolveAtlasSearch(structures, "Internal Oblique", "full");
  assert.equal(result.kind, "match");
  assert.deepEqual(ids(result.targets), ids(internal));
  assert.equal(result.targets.length, 2);
  assert.equal(result.area, "full");
});

test("Vietnamese, unaccented Vietnamese and Latin identify the same catalog structures", () => {
  for (const query of ["Cơ chéo bụng trong", "co cheo bung trong", "Musculus obliquus internus abdominis", "  INTERNAL   OBLIQUE  "]) {
    const result = atlas.resolveAtlasSearch(structures, query, "full");
    assert.equal(result.kind, "match", query);
    assert.deepEqual(ids(result.targets), ids(internal), query);
  }
});

test("side-qualified searches highlight only the requested side", () => {
  for (const [query, side] of [["Internal Oblique right", "right"], ["Cơ chéo bụng trong trái", "left"]]) {
    const result = atlas.resolveAtlasSearch(structures, query, "full");
    assert.equal(result.kind, "match");
    assert.deepEqual(ids(result.targets), ids(internal.filter(row => row.side === side)));
  }
});

test("search can leave the current region and load a bundle containing its targets", () => {
  const result = atlas.resolveAtlasSearch(structures, "Internal Oblique", "upper");
  assert.equal(result.kind, "match");
  assert.equal(result.area, "trunk");
  assert.ok(result.targets.every(row => row.areas.includes(result.area)));
});

test("source-named heads of one muscle can be highlighted together", () => {
  const result = atlas.resolveAtlasSearch(structures, "Pectoralis major", "full");
  assert.equal(result.kind, "match");
  assert.equal(result.targets.length, 6);
  assert.ok(result.targets.every(row => /of pectoralis major muscle$/.test(row.english)));
});

test("ambiguous names require a choice rather than selecting an unrelated muscle", () => {
  for (const query of ["Oblique", "biceps", "internal"]) {
    const result = atlas.resolveAtlasSearch(structures, query, "full");
    assert.equal(result.kind, "ambiguous", query);
    assert.ok(result.results.length > 2);
    assert.equal(result.targets.length, 0);
  }
});

test("every displayed muscle name takes priority over incidental substring matches", () => {
  for (const structure of structures.filter(row => row.layer === "muscle")) {
    for (const query of [names.atlasShortEnglishName(structure), names.atlasVietnameseName(structure)].filter(Boolean)) {
      const result = atlas.resolveAtlasSearch(structures, query, "full");
      assert.equal(result.kind, "match", query);
      assert.ok(result.targets.some(target => target.id === structure.id), query);
      const family = names.atlasShortEnglishName(structure).split(" · ")[0];
      assert.ok(result.targets.every(target => names.atlasShortEnglishName(target).split(" · ")[0] === family), query);
      if (structure.side) {
        const sideQuery = `${query} ${structure.side === "left" ? "trái" : "phải"}`;
        const sided = atlas.resolveAtlasSearch(structures, sideQuery, "full");
        assert.equal(sided.kind, "match", sideQuery);
        assert.ok(sided.targets.some(target => target.id === structure.id), sideQuery);
        assert.ok(sided.targets.every(target => target.side === structure.side && names.atlasShortEnglishName(target).split(" · ")[0] === family), sideQuery);
      }
    }
  }
});

test("exact-name priority also honors Vietnamese side qualifiers", () => {
  for (const query of ["Brachialis trái", "trái Brachialis", "trai Brachialis", "Cơ cánh tay phải", "Cơ bán gân phải"]) {
    const result = atlas.resolveAtlasSearch(structures, query, "full");
    assert.equal(result.kind, "match", query);
    assert.equal(result.targets.length, 1, query);
    assert.equal(result.targets[0].side, /trái|trai/.test(query) ? "left" : "right", query);
  }
});

test("missing and blank queries do not retain search targets or invent catalog entries", () => {
  const before = JSON.stringify(structures);
  const missing = atlas.resolveAtlasSearch(structures, "NoSuchMuscle98765", "trunk");
  assert.equal(missing.kind, "missing");
  assert.equal(missing.results.length, 0);
  assert.equal(missing.targets.length, 0);
  const idle = atlas.resolveAtlasSearch(structures, "  ", "trunk");
  assert.equal(idle.kind, "idle");
  assert.equal(idle.targets.length, 0);
  assert.ok(idle.results.every(row => row.areas.includes("trunk")));
  assert.equal(JSON.stringify(structures), before);
});

test("search reveals target tissues fully while keeping surrounding anatomy faint", () => {
  assert.equal(typeof atlas.atlasSearchAppearance, "function");
  const targetIds = new Set(internal.map(row => row.id));
  for (const target of internal) {
    const result = atlas.atlasSearchAppearance(target, null, targetIds, 0);
    assert.equal(result.highlighted, true);
    assert.equal(result.opacity, 1, "even when the muscle slider had hidden the target");
  }
  for (const layer of ["muscle", "bone", "joint"]) {
    const result = atlas.atlasSearchAppearance({ id: "context", layer }, "context", targetIds, 1);
    assert.equal(result.highlighted, false, "old selection must not stay highlighted");
    assert.ok(result.opacity > 0 && result.opacity < 0.15);
  }
  assert.equal(atlas.atlasSearchAppearance(internal[0], null, new Set(), 0.4).opacity, 0.4);
  assert.equal(atlas.atlasSearchAppearance({ id: "bone", layer: "bone" }, null, new Set(), 0.4).opacity, 1);
});

