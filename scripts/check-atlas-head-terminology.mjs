// Software/provenance checks only; these do not establish clinical validation.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
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
  const exports = {};
  cache.set(file, exports);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  vm.runInNewContext(outputText, { exports, require(target) { return target.startsWith('.') ? load(path.resolve(path.dirname(file), target)) : require(target); } }, { filename: file });
  return exports;
}
const names = load('src/lib/clinical/atlas-names.ts');
const fixture = (english, layer = 'bone', side = null) => ({ id: 'fixture', english, label: english, latin: 'Original Latin', layer, side, areas: ['head'], clinicalRegion: null, group: null });
assert.equal(names.atlasVietnameseName(fixture('Frontal bone')), 'Xương trán', 'core skull names have compared Vietnamese labels');
const head = load('src/lib/clinical/atlas-head-terminology.ts');
const terminology = load('src/lib/clinical/atlas-terminology-evidence.ts');
const atlas = load('src/lib/clinical/atlas-3d.ts');
const expected = {
  'Frontal bone': 'Xương trán', 'Parietal bone': 'Xương đỉnh', 'Temporal bone': 'Xương thái dương',
  'Occipital bone': 'Xương chẩm', 'Sphenoid bone': 'Xương bướm', 'Ethmoid bone': 'Xương sàng',
  'Maxilla': 'Xương hàm trên', 'Mandible': 'Xương hàm dưới', 'Zygomatic bone': 'Xương gò má',
  'Nasal bone': 'Xương mũi', 'Lacrimal bone': 'Xương lệ', 'Palatine bone': 'Xương khẩu cái',
  'Inferior nasal concha bone': 'Xương xoăn mũi dưới', 'Vomer': 'Xương lá mía', 'Hyoid bone': 'Xương móng',
  'Bucinator': 'Cơ mút', 'Temporalis muscle': 'Cơ thái dương',
  'Superficial part of masseter': 'Cơ cắn · phần nông', 'Deep part of masseter': 'Cơ cắn · phần sâu',
  'Medial pterygoid muscle': 'Cơ chân bướm trong',
  'Superior head of lateral pterygoid muscle': 'Cơ chân bướm ngoài · đầu trên',
  'Inferior head of lateral pterygoid muscle': 'Cơ chân bướm ngoài · đầu dưới',
};
assert.deepEqual(Object.keys(head.ATLAS_HEAD_TERMS).sort(), Object.keys(expected).sort());
for (const [english, vietnamese] of Object.entries(expected)) {
  const structure = fixture(english, english.includes('bone') || ['Maxilla', 'Mandible', 'Vomer'].includes(english) ? 'bone' : 'muscle', 'left');
  const before = JSON.stringify(structure);
  assert.equal(names.atlasVietnameseName(structure), vietnamese);
  assert.ok(names.atlasSourceName(structure).includes(english));
  for (const query of [vietnamese, english, structure.latin, `${vietnamese} trái`]) assert.equal(atlas.searchStructures([structure], query, 'full').length, 1, `${english} is searchable by ${query}`);
  assert.equal(JSON.stringify(structure), before, 'display/search never rewrites source fields');
  const record = head.getAtlasHeadTerminologyComparison(english);
  assert.equal(record.reviewedBy, null);
  assert.equal(record.checkedAt, '2026-11-05');
  assert.equal(record.status, 'matched');
  assert.ok(record.references.length);
  for (const ref of record.references) {
    const source = terminology.ATLAS_TERMINOLOGY_SOURCES[ref.sourceId];
    assert.equal(source.checkedAt, '2026-11-05');
    assert.ok(source.access && source.hostNote && ref.sourceTerm);
    assert.match(terminology.atlasTerminologyReferenceUrl(ref), /^https:\/\//);
    assert.ok(ref.page === null ? ref.locator : Number.isInteger(ref.page) && ref.page > 0);
  }
  assert.equal(terminology.getAtlasTerminologyComparison(english), record);
}
for (const english of ['Anterior cells of ethmoid bone', 'Temporoparietalis muscle', '__proto__', 'unknown']) {
  assert.equal(head.getAtlasHeadTerminologyComparison(english), null);
  assert.equal(names.atlasVietnameseName(fixture(english)), null, 'unsupported head parts retain source English');
}
assert.equal(head.getAtlasHeadTerminologyComparison('Buccinator'), head.getAtlasHeadTerminologyComparison('Bucinator'), 'raw and corrected spelling share the bounded comparison');
assert.equal(names.atlasVietnameseName(fixture('Buccinator', 'muscle')), 'Cơ mút');
const old = Object.values(terminology.ATLAS_TERMINOLOGY_COMPARISONS);
assert.equal(old.length, 216);
assert.deepEqual(Object.fromEntries(['matched', 'partial', 'unresolved'].map(status => [status, old.filter(record => record.status === status).length])), { matched: 193, partial: 22, unresolved: 1 });
const corrections = JSON.parse(readFileSync(path.join(root, 'src/lib/clinical/atlas-corrections.json')));
const correction = corrections.find(record => record.id === 'english-buccinator-spelling');
assert.ok(correction, 'spelling correction is explicit provenance');
const ids = ['Bucinator.l', 'Bucinator.r'].map(name => `za-${createHash('sha256').update(name).digest('hex').slice(0, 12)}`);
assert.deepEqual(correction.structureIds, ids);
assert.deepEqual(correction.expected, { english: 'Bucinator' });
assert.deepEqual(correction.changes, { english: 'Buccinator' });
const { applyAtlasCorrections } = await import('../src/lib/clinical/atlas-catalog-corrections.mjs');
const raw = { structures: ids.map((id, i) => ({ ...fixture('Bucinator', 'muscle', i ? 'right' : 'left'), id })) };
const original = JSON.stringify(raw);
const resolved = applyAtlasCorrections(raw, [correction]);
assert.equal(JSON.stringify(raw), original);
for (const structure of resolved.structures) {
  assert.equal(structure.english, 'Buccinator');
  assert.equal(structure.sourceMetadata.english, 'Bucinator');
  assert.ok(names.atlasSourceName(structure).includes('Bucinator'), 'source formatter retains raw spelling');
  for (const query of ['Buccinator', 'Bucinator', 'cơ mút', structure.latin]) assert.equal(atlas.searchStructures([structure], query, 'full').length, 1);
}
const drift = structuredClone(raw); drift.structures[0].english = 'unexpected';
assert.throws(() => applyAtlasCorrections(drift, [correction]), /drift|expected/i);
console.log('Head terminology: 22 bounded names, source scopes/dates, bilingual search, fallbacks, historical counts and guarded spelling correction passed.');
