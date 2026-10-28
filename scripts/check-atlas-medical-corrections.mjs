// Regression checks for sourced metadata corrections; not clinical geometry validation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const cache = new Map();
function load(relative) {
  let file = path.resolve(root, relative);
  if (!existsSync(file) && existsSync(`${file}.ts`)) file += '.ts';
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.mjs')) return require(file);
  if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
  const exports = {};
  cache.set(file, exports);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, { exports, URL, structuredClone, require(target) {
    if (target.startsWith('@/')) return load(path.resolve(root, 'src', target.slice(2)));
    return target.startsWith('.') ? load(path.resolve(path.dirname(file), target)) : require(target);
  } }, { filename: file });
  return exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const hash = value => createHash('sha256').update(value).digest('hex');
const assetDir = path.join(root, 'public/anatomy/3d');
const assetHashes = () => Object.fromEntries(readdirSync(assetDir).filter(name => name.endsWith('.glb') || name === 'manifest.json').map(name => [name, hash(readFileSync(path.join(assetDir, name)))]));
const beforeAssets = assetHashes();
const raw = load('public/anatomy/3d/manifest.json');
const beforeRaw = JSON.stringify(raw);
const modulePath = path.join(root, 'src/lib/clinical/atlas-catalog-corrections.mjs');
assert(existsSync(modulePath), 'guarded catalog correction applicator must exist');
const { applyAtlasCorrections } = await import(modulePath);
const corrections = load('src/lib/clinical/atlas-corrections.json');
const { resolveAtlasManifest, getAtlasCorrections } = load('src/lib/clinical/atlas-catalog.ts');
const resolved = resolveAtlasManifest(raw);
assert.deepEqual(plain(resolved), applyAtlasCorrections(raw, corrections));
assert.equal(JSON.stringify(raw), beforeRaw, 'raw catalog not mutated');
assert.equal(resolved.structures.length, 1031);
assert.deepEqual(plain(resolved.bundles), raw.bundles);
assert.deepEqual(plain(resolved.structures.map(s => s.id)), raw.structures.map(s => s.id));
const expectedChanges = [
  ['za-0594168bc7e0 za-a71914347fd5', 'latin', 'Flexor digiti minimi pedis'],
  ['za-f0a2b9e97a61 za-57697192a9ea', 'latin', 'Caput mediale musculi tricipitis brachii'],
  ['za-9df38dd0067f za-0ca27c38f6ab', 'latin', 'Os primum metacarpi'],
  ['za-a1dbeb10397d za-ed21d2eab363', 'latin', 'Os quartum metatarsi'],
  ['za-ad4d8464ab41 za-5e590f3614ed', 'side', 'left'],
  ['za-ef71d29b63c0', 'side', 'right'],
  ['za-0425424460a5 za-01cb75938da6 za-87ff24e3a85d za-3eade513dbf4 za-84c7d3654da9 za-bb19dc35992b', 'clinicalRegion', 'shoulder'],
  ['za-09d8674ed113 za-d64d3d420b6c', 'anatomicalTissueLabel', 'Gân trung gian cơ hai bụng'],
  ['za-76671b911ccb za-d7748ccf7a30', 'anatomicalTissueLabel', 'Đĩa sụn sợi'],
  ['za-119decb9d97f za-c50e8a3180cf', 'anatomicalTissueLabel', 'Dải chậu–chày · phần fascia lata'],
  ['za-9cf0878d5d75', 'anatomicalTissueLabel', 'Sụn giáp'],
];
const changedIds = new Set(expectedChanges.flatMap(([ids]) => ids.split(' ')));
for (const [ids, field, value] of expectedChanges) for (const id of ids.split(' ')) {
  assert.equal(resolved.structures.find(s => s.id === id)[field], value, `${id}/${field}`);
}
for (const [index, source] of raw.structures.entries()) {
  const corrected = resolved.structures[index];
  if (!changedIds.has(source.id)) { assert.deepEqual(plain(corrected), source); continue; }
  assert.deepEqual(plain(corrected.sourceMetadata), Object.fromEntries(['english', 'latin', 'side', 'clinicalRegion'].map(key => [key, source[key]])));
  const records = getAtlasCorrections(source.id);
  assert(records.length > 0);
  assert.deepEqual(Array.from(corrected.correctionIds), Array.from(records, c => c.id));
  for (const key of ['id', 'english', 'label', 'layer', 'areas', 'group', 'surfaces', 'thickness']) assert.deepEqual(plain(corrected[key] ?? null), source[key] ?? null, `${source.id}: preserve ${key}`);
}
assert.equal(getAtlasCorrections('unknown').length, 0);
const first = corrections[0];
const bad = (edit, error) => { const fixture = plain(corrections); edit(fixture); assert.throws(() => applyAtlasCorrections(raw, fixture), error); };
bad(c => c[0].structureIds[0] = 'unknown', /unknown/i);
bad(c => c[0].expected.english = 'changed upstream', /expected|drift/i);
bad(c => delete c[0].expected.latin, /expected|guard/i);
bad(c => c[0].sources = [], /source|citation/i);
bad(c => c[0].sources[0].access = '', /source|access/i);
bad(c => c[0].reviewedBy = 'invented', /review/i);
for (const field of ['id', 'english', 'label', 'layer', 'areas', 'bundles', 'surfaces', 'thickness']) {
  bad(c => c[0].changes[field] = 'forbidden', /field|disallowed/i);
}
bad(c => c[0].sources[0].url = 'file:///fabricated', /source|citation/i);
bad(c => c[0].checkedAt = '', /date/i);
bad(c => c[0].basis = '', /basis/i);
bad(c => c[0].expected.layer = 'bone', /field|disallowed/i);
bad(c => c.push(plain(first)), /duplicate/i);
bad(c => c[0].structureIds.push(c[0].structureIds[0]), /duplicate/i);
bad(c => c.push({ ...plain(first), id: 'conflicting', changes: { latin: 'Different' } }), /conflict|duplicate/i);
bad(c => delete c.find(c => c.changes.anatomicalTissueLabel).expected.surfaceKinds, /surface|guard/i);
const duplicateRaw = plain(raw); duplicateRaw.structures.push(plain(raw.structures[0]));
assert.throws(() => applyAtlasCorrections(duplicateRaw, corrections), /duplicate/i);
const driftRaw = plain(raw); driftRaw.structures.find(s => s.id === first.structureIds[0]).latin = 'Changed upstream';
assert.throws(() => applyAtlasCorrections(driftRaw, corrections), /expected|drift/i);
assert.throws(() => applyAtlasCorrections(resolved, corrections), /resolved|expected|drift/i);
const tissueDrift = plain(raw);
const tissueRecord = corrections.find(c => c.changes.anatomicalTissueLabel);
tissueDrift.structures.find(s => s.id === tissueRecord.structureIds[0]).surfaces[0].kind = 'bone';
assert.throws(() => applyAtlasCorrections(tissueDrift, corrections), /expected|drift/i);
const isolatedCopy = applyAtlasCorrections(raw, corrections);
isolatedCopy.structures[0].areas.push('invented');
isolatedCopy.structures[0].surfaces[0].sourceMaterials.push('invented');
isolatedCopy.bundles.full.bytes = 0;
assert.equal(JSON.stringify(raw), beforeRaw, 'nested consumer edits cannot mutate raw catalog');

const atlas = load('src/lib/clinical/atlas-3d.ts');
for (const [id, side] of [['za-ad4d8464ab41', 'left'], ['za-5e590f3614ed', 'left'], ['za-ef71d29b63c0', 'right']]) {
  const s = resolved.structures.find(s => s.id === id);
  assert(atlas.resolveAtlasSearch(resolved.structures, `${s.english} ${side}`, 'full').targets.some(target => target.id === id));
}
for (const [ids] of expectedChanges.filter(([, field]) => field === 'latin')) for (const id of ids.split(' ')) {
  const s = resolved.structures.find(s => s.id === id);
  for (const term of [s.latin, s.sourceMetadata.latin]) assert(atlas.resolveAtlasSearch(resolved.structures, term, 'full').targets.some(target => target.id === id), `canonical/source alias ${term}`);
}
const canonical = resolved.structures.find(s => s.id === 'za-0594168bc7e0');
const aliasOnly = { ...canonical, id: 'alias-only', english: 'Different name', latin: 'Different Latin', label: 'Different label', sourceMetadata: { ...canonical.sourceMetadata, latin: canonical.latin } };
assert.deepEqual(Array.from(atlas.resolveAtlasSearch([canonical, aliasOnly], canonical.latin, 'full').targets, s => s.id), [canonical.id], 'canonical exact name takes priority over an incidental source alias');
const context = load('src/lib/clinical/contextual-anatomy.ts');
const cuffNames = ['Supraspinatus muscle', 'Infraspinatus muscle', 'Subscapularis muscle', 'Teres minor muscle'];
const shoulder = context.contextStructures(resolved.structures, { kind: 'region', id: 'shoulder' });
const cuff = shoulder.filter(s => cuffNames.includes(s.english));
assert.equal(cuff.length, 8);
for (const s of cuff) assert.equal(context.contextForStructure(s, 'region'), 'shoulder');
const registry = load('src/lib/clinical/evidence-registry.ts');
for (const id of changedIds) {
  const evidence = registry.getCatalogEvidence(id);
  assert.equal(evidence.status, 'source-only');
  assert.equal(evidence.reviewedBy, null);
  assert(evidence.supportedClaims.some(claim => claim.includes('CSV gốc')), 'raw CSV comparison kept distinct');
  assert(evidence.supportedClaims.some(claim => claim.includes('Hiệu chỉnh')), 'correction scope recorded');
  assert(evidence.sources.length > 1);
  assert(!evidence.limitations.some(text => text.startsWith('Chưa đối chiếu độc lập tài liệu FIPAT gốc')), 'no blanket denial of correction sources');
}
assert.equal(registry.getCatalogEvidence('unknown'), undefined);
assert.deepEqual(assetHashes(), beforeAssets, 'raw manifest and GLB hashes unchanged');
console.log(`Atlas medical corrections: ${corrections.length} guarded records, ${changedIds.size} structures, immutable assets, source aliases, laterality, shoulder cuff context and evidence passed.`);
