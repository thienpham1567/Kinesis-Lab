import assert from "node:assert/strict";
import test from "node:test";
import { applyAtlasCorrections } from "../src/lib/clinical/atlas-catalog-corrections.mjs";
import { createAppLoader } from "./lib/load-app-module.mjs";

// Synthetic catalog/citation fixtures exercise metadata guards, not medical facts.
const row = side => ({
  id: `fixture-${side}`, english: "Bucinator", latin: "Fixture Latin",
  label: "Bucinator", side, layer: "muscle", areas: ["head"],
  clinicalRegion: null,
});
const raw = { structures: [row("left"), row("right")] };
const correction = {
  id: "fixture-english-spelling",
  structureIds: raw.structures.map(row => row.id),
  expected: { english: "Bucinator" }, changes: { english: "Buccinator" },
  sources: [{ title: "Fixture source", url: "https://example.org/fixture", checkedAt: "2026-11-05", access: "Synthetic test fixture" }],
  checkedAt: "2026-11-05", access: "Synthetic test fixture", basis: "Test exact metadata correction guards", reviewedBy: null,
};
const copy = value => structuredClone(value);

test("an English correction changes only exact IDs while preserving raw source English", () => {
  const before = JSON.stringify(raw);
  const untouched = { ...row("left"), id: "fixture-unlisted" };
  const input = { structures: [...raw.structures, untouched] };
  const result = applyAtlasCorrections(input, [correction]);
  for (const [index, corrected] of result.structures.slice(0, 2).entries()) {
    assert.equal(corrected.english, "Buccinator");
    assert.equal(corrected.sourceMetadata.english, "Bucinator");
    assert.equal(corrected.label, "Bucinator");
    assert.equal(corrected.latin, raw.structures[index].latin);
    assert.equal(corrected.side, raw.structures[index].side);
    assert.equal(corrected.clinicalRegion, null);
    assert.deepEqual(corrected.correctionIds, [correction.id]);
  }
  assert.deepEqual(result.structures[2], untouched);
  assert.equal(JSON.stringify(raw), before);
});

test("English changes require a nonempty exact original English guard", () => {
  for (const english of [undefined, "", " ", "Changed upstream"]) {
    const candidate = copy(correction);
    candidate.expected.english = english;
    assert.throws(() => applyAtlasCorrections(raw, [candidate]), /English guard|metadata drift/);
  }
  const drift = copy(raw);
  drift.structures[1].english = "Buccinator";
  assert.throws(() => applyAtlasCorrections(drift, [correction]), /fixture-right\/english/);
});

test("English support still rejects forbidden fields, unknown IDs, invalid values and conflicting writes", () => {
  for (const field of ["id", "label", "layer", "areas", "bundles", "surfaces", "thickness", "unexpectedField"]) {
    const candidate = copy(correction);
    candidate.changes[field] = "forbidden";
    assert.throws(() => applyAtlasCorrections(raw, [candidate]), /disallowed change field/);
  }
  for (const english of ["", " ", null, 42]) {
    const candidate = copy(correction);
    candidate.changes.english = english;
    assert.throws(() => applyAtlasCorrections(raw, [candidate]), /invalid english value/);
  }
  assert.throws(() => applyAtlasCorrections(raw, [{ ...correction, structureIds: ["unknown"] }]), /unknown structure ID/);
  assert.throws(() => applyAtlasCorrections(raw, [correction, { ...correction, id: "duplicate-write" }]), /conflicting\/duplicate/);
});

test("English support retains side and clinical-region guards", () => {
  for (const field of ["side", "clinicalRegion"]) {
    const candidate = copy(correction);
    candidate.changes[field] = field === "side" ? "right" : "cervical";
    assert.throws(() => applyAtlasCorrections(raw, [candidate]), new RegExp(`missing expected field guard ${field}`));
    candidate.expected[field] = "unexpected raw value";
    assert.throws(() => applyAtlasCorrections(raw, [candidate]), /metadata drift/);
  }
});

test("both raw and corrected English remain searchable after a guarded spelling correction", () => {
  const { structures } = applyAtlasCorrections(raw, [correction]);
  const { resolveAtlasSearch } = createAppLoader()("src/lib/clinical/atlas-3d.ts");
  for (const query of ["Bucinator", "Buccinator"]) {
    const result = resolveAtlasSearch(structures, query, "head");
    assert.equal(result.kind, "match", query);
    assert.deepEqual(Array.from(result.targets, row => row.id), raw.structures.map(row => row.id));
  }
});
