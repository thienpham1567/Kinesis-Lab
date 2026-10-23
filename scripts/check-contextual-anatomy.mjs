// Catalog navigation consistency only; these checks do not validate anatomy or pain causality.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const loaded = new Map();
function load(relative) {
  const file = path.resolve(root, relative);
  if (loaded.has(file)) return loaded.get(file);
  const exports = {};
  loaded.set(file, exports);
  const result = ts.transpileModule(readFileSync(file, 'utf8'), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  assert.equal(result.diagnostics?.length ?? 0, 0, `Syntax: ${relative}`);
  vm.runInNewContext(result.outputText, { exports, require(target) {
    if (!target.startsWith('.')) return require(target);
    const base = path.resolve(path.dirname(file), target);
    const resolved = [base, `${base}.ts`, `${base}.mjs`].find(existsSync);
    assert(resolved, `Resolve ${target}`);
    return load(resolved);
  } }, { filename: file });
  return exports;
}

const adapterFile = 'src/lib/clinical/contextual-anatomy.ts';
const adapter = existsSync(path.join(root, adapterFile)) ? load(adapterFile) : {};
assert.equal(typeof adapter.contextStructures, 'function', 'context catalog adapter must exist');
const { contextStructures, contextForStructure, completeContextBundle, contextSideStructures, triggerPainRegion } = adapter;
const manifest = JSON.parse(readFileSync(path.join(root, 'public/anatomy/3d/manifest.json'), 'utf8'));
const { structures } = manifest;
const ids = list => Array.from(list, s => s.id).sort();
const triggerNames = {
  upper_trapezius: ['Descending part of trapezius muscle'],
  levator_scapulae: ['Levator scapulae'],
  infraspinatus: ['Infraspinatus muscle', 'Teres minor muscle'],
  pec_minor: ['Pectoralis minor muscle', 'Abdominal part of pectoralis major muscle', 'Clavicular head of pectoralis major muscle', 'Sternocostal head of pectoralis major muscle'],
  lats_serratus: ['Latissimus dorsi muscle', 'Serratus anterior muscle'],
  quadratus_lumborum: ['Quadratus lumborum muscle'],
  iliopsoas: ['Psoas major', 'Iliacus muscle'],
  glute_med_piriformis: ['Gluteus medius muscle', 'Gluteus minimus muscle', 'Piriformis muscle'],
  tfl_vastus_lateralis: ['Tensor fasciae latae', 'Vastus lateralis muscle'],
  soleus_gastroc: ['Soleus muscle', 'Lateral head of gastrocnemius', 'Medial head of gastrocnemius', 'Tibialis anterior muscle'],
};
const trigger = load('src/lib/clinical/trigger-point-atlas.ts');
assert.deepEqual(Object.keys(triggerNames).sort(), Array.from(trigger.TRIGGER_POINT_MUSCLES, m => m.id).sort());
for (const [id, names] of Object.entries(triggerNames)) {
  const selected = contextStructures(structures, { kind: 'trigger', id });
  assert.deepEqual(ids(selected), ids(structures.filter(s => s.layer === 'muscle' && names.includes(s.english))), `${id}: exact source names`);
  for (const name of names) {
    for (const side of ['left', 'right']) assert(selected.some(s => s.english === name && s.side === side), `${id}/${name}: ${side} source mesh`);
  }
  for (const s of selected) {
    assert.equal(contextForStructure(s, 'trigger'), id, `${s.english}: reverse trigger link`);
    assert.equal(contextForStructure({ ...s, layer: 'bone' }, 'trigger'), null, 'trigger membership requires muscle layer');
  }
}
const trapezius = contextStructures(structures, { kind: 'trigger', id: 'upper_trapezius' });
assert(trapezius.every(s => !/Ascending|Transverse/.test(s.english)), 'upper trapezius excludes other source parts');
assert.deepEqual(ids(contextStructures([trapezius[0], { ...trapezius[0], id: 'wrong-layer', layer: 'bone' }], { kind: 'trigger', id: 'upper_trapezius' })), [trapezius[0].id], 'trigger source selection requires muscle layer');

const training = load('src/lib/clinical/training-atlas.ts');
const { MUSCLE_GROUP_ATLAS } = load('src/lib/clinical/muscle-hypertrophy-atlas.ts');
assert.equal(MUSCLE_GROUP_ATLAS.length, 11);
for (const { id } of MUSCLE_GROUP_ATLAS) {
  const selected = contextStructures(structures, { kind: 'training', id });
  assert(selected.length > 0, `${id}: training context has source structures`);
  assert.deepEqual(ids(selected), ids(training.matchingGroupStructures(structures, id)));
  for (const s of selected) assert.equal(contextForStructure(s, 'training'), id);
}
const { ANATOMY_REGIONS } = load('src/lib/clinical/anatomy-atlas.ts');
assert.equal(ANATOMY_REGIONS.length, 8);
for (const { id } of ANATOMY_REGIONS) {
  const selected = contextStructures(structures, { kind: 'region', id });
  assert(selected.length > 0, `${id}: regional context has source structures`);
  assert.deepEqual(ids(selected), ids(structures.filter(s => s.clinicalRegion === id)));
  for (const s of selected) assert.equal(contextForStructure(s, 'region'), id);
}
for (const kind of ['trigger', 'training', 'region']) {
  for (const id of ['missing', '__proto__', 'constructor', '']) assert.equal(contextStructures(structures, { kind, id }).length, 0);
  assert.equal(contextForStructure({ ...structures[0], english: 'Unknown source structure', clinicalRegion: 'invented', layer: 'muscle' }, kind), null);
}
assert.equal(contextStructures(structures, { kind: 'invented', id: 'hip_pelvis' }).length, 0);
assert.equal(contextForStructure(structures[0], 'invented'), null);

for (const side of ['left', 'right']) {
  assert.deepEqual(ids(contextSideStructures(structures, side)), ids(structures.filter(s => s.side === null || s.side === side)));
  assert(contextSideStructures(structures, side).some(s => s.side === null), `${side}: retain midline structures`);
}
assert.deepEqual(ids(contextSideStructures(structures, 'both')), ids(structures));

for (const context of [
  ...Object.keys(triggerNames).map(id => ({ kind: 'trigger', id })),
  ...Array.from(MUSCLE_GROUP_ATLAS, ({ id }) => ({ kind: 'training', id })),
  ...Array.from(ANATOMY_REGIONS, ({ id }) => ({ kind: 'region', id })),
]) {
  const selected = contextStructures(structures, context);
  const candidates = Object.entries(manifest.bundles).filter(([area]) => selected.every(s => s.areas.includes(area))).sort((a, b) => a[1].bytes - b[1].bytes);
  assert(candidates.length > 0, `${context.kind}/${context.id}: complete bundle exists`);
  assert.equal(completeContextBundle(manifest, selected), candidates[0][0], `${context.kind}/${context.id}: smallest complete bundle`);
}
assert.equal(completeContextBundle(manifest, []), null, 'empty matches must not choose an unrelated bundle');
assert.equal(completeContextBundle(manifest, [{ ...structures[0], id: 'unknown' }]), null, 'unknown catalog ID cannot prove complete coverage');
const fixture = {
  bundles: { full: { bytes: 100 }, hip: { bytes: 20 }, lower: { bytes: 10 } },
  structures: [
    { id: 'a', areas: ['full', 'hip', 'lower'] },
    { id: 'b', areas: ['full', 'hip'] },
  ],
};
assert.equal(completeContextBundle(fixture, fixture.structures), 'hip', 'cheaper partial bundle must not clip requested context');
assert.equal(completeContextBundle(fixture, [{ id: 'a' }]), 'lower', 'choose by bytes rather than area order');
assert.equal(completeContextBundle({ ...fixture, bundles: { lower: { bytes: 10 } } }, fixture.structures), null);

const painRegions = {
  anterior_shoulder: 'shoulder', neck_temple: 'cervical', between_scapulae: 'thoracic_core',
  low_back: 'lumbar', glute_posterior_thigh: 'hip_pelvis', lateral_knee: 'knee',
  heel_foot: 'ankle_foot', anterior_hip: 'hip_pelvis',
};
assert.deepEqual(Object.keys(painRegions).sort(), Array.from(trigger.PAIN_SITE_CULPRIT_MAP, site => site.id).sort());
for (const [site, region] of Object.entries(painRegions)) assert.equal(triggerPainRegion(site), region);
for (const site of ['unknown', '__proto__', 'constructor', '']) assert.equal(triggerPainRegion(site), null);

const stateHelpers = load('src/components/training/observation-state.ts');
const selectedId = trapezius[0].id;
const initial = { ...stateHelpers.initialObservation('trigger/upper_trapezius/both', 'front-oblique'), selectedId, isolatedId: selectedId };
const hidden = stateHelpers.reconcileObservation(initial, initial.context, 'front-oblique', new Set());
assert.equal(hidden.selectedId, null);
assert.equal(hidden.isolatedId, null);
const changed = stateHelpers.reconcileObservation(initial, 'trigger/infraspinatus/both', 'front-oblique', new Set([selectedId]));
assert.equal(changed.selectedId, null);
assert.equal(changed.isolatedId, null);
console.log('Contextual anatomy: 10 trigger teaching groups, 11 training groups, 8 regions, exact source membership, bilateral navigation, smallest complete bundles and hidden selection resets passed.');
