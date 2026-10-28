// Source-string/provenance regressions only; these checks do not validate anatomy.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { applyAtlasCorrections } from '../src/lib/clinical/atlas-catalog-corrections.mjs';

const root = path.resolve(import.meta.dirname, '..');
const moduleFile = path.join(root, 'scripts/lib/catalog-evidence-audit.mjs');
const audit = existsSync(moduleFile) ? await import(moduleFile) : {};
const json = file => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const raw = json('public/anatomy/3d/manifest.json');
const corrections = json('src/lib/clinical/atlas-corrections.json');
const csv = readFileSync(path.join(root, '.data/z-anatomy/TA2.csv'), 'utf8');
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const parse = text => { assert.equal(typeof audit.parseUpstreamCsv, 'function', 'pure parser must exist'); return audit.parseUpstreamCsv(text); };
const compare = (manifest, rows, records = []) => { assert.equal(typeof audit.compareCatalog, 'function', 'pure comparison must exist'); return audit.compareCatalog(manifest, rows, records); };

test('retains numeric and derivative suffix row IDs from the actual outer-quoted BOM format', () => {
  const rows = parse('\uFEFF\r\n"TA2ID;English;Latin;Other"\r\n"1265;Metacarpal bone;Os metacarpi;"\r\n"1265*1;First metacarpal bone;Os primum metarcapi;"\r\n";;;"\r\n";Unkeyed term;Latin;"\r\n');
  assert.deepEqual(rows, [
    { upstreamRowId: '1265', english: 'Metacarpal bone', latin: 'Os metacarpi' },
    { upstreamRowId: '1265*1', english: 'First metacarpal bone', latin: 'Os primum metarcapi' },
    { upstreamRowId: null, english: 'Unkeyed term', latin: 'Latin' },
  ]);
  const found = compare({ structures: [{ id: 'first', english: 'First metacarpal bone', latin: 'Os primum metarcapi' }] }, rows).first;
  assert.deepEqual(found.upstreamRowIds, ['1265*1']);
  assert.equal(found.canonicalTa2Id, null, 'never derive canonical 1265 by cutting the suffix');
  assert.equal(compare({ structures: [{ id: 'base', english: 'Metacarpal bone', latin: 'Os metacarpi' }] }, rows).base.canonicalTa2Id, null, 'digits alone do not verify original FIPAT');
});

test('parses quoted semicolons, escaped quotes and multiline fields, including outer-line encoding', () => {
  const plain = 'TA2ID;English;Latin;Other\n10;"Name; synonym (part)";"Latin ""quoted""";x\n11;"Two\nlines";Latin;x\n';
  const rows = parse(plain);
  assert.deepEqual(rows, [
    { upstreamRowId: '10', english: 'Name; synonym (part)', latin: 'Latin "quoted"' },
    { upstreamRowId: '11', english: 'Two\nlines', latin: 'Latin' },
  ]);
  const wrapped = '"TA2ID;English;Latin;Other"\n"10;""Name; synonym (part)"";""Latin """"quoted"""""";x"\n';
  assert.deepEqual(parse(wrapped), [rows[0]]);
  assert.throws(() => parse('TA2ID;English;Latin\n1;"Unclosed;Latin'), /quote/i);
  assert.throws(() => parse('TA2ID;English;Latin\n1;Name;Latin\n1;Other;Alius'), /duplicate/i);
});

test('exact name normalization preserves parenthetical and synonym qualifiers', () => {
  const rows = parse('TA2ID;English;Latin\n10;"Name; synonym (part)";Latin (part)\n');
  const structures = [
    { id: 'exact', english: '  NAME;  synonym (part) ', latin: ' LATIN (part) ' },
    { id: 'parent', english: 'Name; synonym', latin: 'Latin (part)' },
    { id: 'synonym', english: 'Name', latin: 'Latin' },
    { id: 'latin', english: 'Name; synonym (part)', latin: 'Latin' },
  ];
  const found = compare({ structures }, rows);
  assert.equal(found.exact.latinMatches, true);
  assert.equal(found.parent.englishMatch, false);
  assert.equal(found.synonym.englishMatch, false);
  assert.equal(found.latin.englishMatch, true);
  assert.equal(found.latin.latinMatches, false);
  assert.throws(() => compare({ structures: [structures[0], structures[0]] }, rows), /duplicate/i);
});

test('known erroneous raw Latin strings match derivative CSV while runtime corrections stay separate', () => {
  const rows = parse(csv);
  const before = JSON.stringify(raw);
  const source = compare(raw, rows, corrections);
  const resolved = compare(applyAtlasCorrections(raw, corrections), rows);
  for (const id of ['za-0594168bc7e0', 'za-f0a2b9e97a61', 'za-9df38dd0067f', 'za-a1dbeb10397d']) {
    assert.equal(source[id].latinMatches, true, `${id}: upstream error is still a raw string match`);
    assert.equal(resolved[id].latinMatches, false, `${id}: corrected name is not misreported as raw match`);
  }
  assert.equal(source['za-0594168bc7e0'].canonicalTa2Id, '2682');
  assert.equal(source['za-f0a2b9e97a61'].canonicalTa2Id, '2474');
  assert.equal(source['za-9df38dd0067f'].canonicalTa2Id, null);
  assert.equal(JSON.stringify(raw), before);
});

test('canonical IDs require explicit original-source citation and guarded identity, never normalization alone', () => {
  const rows = parse(csv);
  const original = compare(raw, rows, corrections);
  assert.equal(Object.values(original).filter(row => row.canonicalTa2Id !== null).length, 4);
  assert.equal(original['za-0594168bc7e0'].canonicalComparison.checkedAt, '2026-10-27');
  assert.match(original['za-0594168bc7e0'].canonicalComparison.sources[0].access, /2682/);
  for (const change of [
    records => records[0].sources = [],
    records => records[0].sources[0].access = 'Generic normalized-name comparison',
    records => records[0].sources[0].url = 'https://example.com/not-fipat',
    records => records[0].expected.english = 'Flexor digiti minimi',
    records => records[0].changes.latin = 'Flexor digiti minimi',
    records => records[0].canonicalTa2Id = '1265',
    records => records[0].basis = 'normalization',
  ]) {
    const invalid = structuredClone(corrections); change(invalid);
    assert.throws(() => compare(raw, rows, invalid), /canonical|citation|guard|FIPAT/i);
  }
});

function fixture() {
  const dir = mkdtempSync(path.join(tmpdir(), 'catalog-audit-'));
  for (const relative of ['scripts/audit-catalog-evidence.mjs', 'public/anatomy/3d/manifest.json', '.data/z-anatomy/TA2.csv', 'src/lib/clinical/catalog-evidence.json', 'src/lib/clinical/atlas-corrections.json', 'src/lib/clinical/catalog-evidence-history.json']) {
    mkdirSync(path.dirname(path.join(dir, relative)), { recursive: true }); cpSync(path.join(root, relative), path.join(dir, relative));
  }
  if (existsSync(moduleFile)) { mkdirSync(path.join(dir, 'scripts/lib'), { recursive: true }); cpSync(moduleFile, path.join(dir, 'scripts/lib/catalog-evidence-audit.mjs')); }
  return dir;
}
const run = (dir, args) => spawnSync(process.execPath, [path.join(dir, 'scripts/audit-catalog-evidence.mjs'), ...args], { encoding: 'utf8' });

test('CLI default/check/invalid modes never write, check rejects stale report, apply is explicit', () => {
  const dir = fixture();
  try {
    const reportFile = path.join(dir, 'src/lib/clinical/catalog-evidence.json');
    const historical = json('src/lib/clinical/catalog-evidence.json');
    writeFileSync(reportFile, JSON.stringify({ ...historical, scope: 'deliberately stale fixture' }));
    const before = hash(reportFile);
    const stale = run(dir, ['--check']);
    assert.equal(stale.status, 1, `check must fail stale data: ${stale.stdout} ${stale.stderr}`);
    assert.equal(hash(reportFile), before, 'check cannot repair or rewrite the report');
    for (const args of [[], ['--check', '--apply'], ['--unknown']]) {
      const result = run(dir, args);
      assert.equal(hash(reportFile), before, `no-write ${args}`);
      if (args.length) assert.notEqual(result.status, 0);
    }
    const applied = run(dir, ['--apply']);
    assert.equal(applied.status, 0, applied.stderr);
    const after = hash(reportFile);
    assert.notEqual(after, before);
    assert.equal(run(dir, ['--check']).status, 0);
    assert.equal(hash(reportFile), after);
    const report = JSON.parse(readFileSync(reportFile, 'utf8'));
    assert.equal(report.checkedAt, new Date().toISOString().slice(0, 10));
    assert.equal(report.provenanceCheckedAt, '2026-10-19');
    assert.deepEqual(report.historicalAudits[0].counts, { structures: 1031, englishMatches: 884, latinMatches: 884 });
    assert.equal(report.csvSha256, '0f9092a328b27dcd15d696d9f9a4087deb229a1aad21b75876657622de835974');
    assert(!JSON.stringify(report.structures).includes('"ta2Ids"'));
    assert.deepEqual(report.counts, { structures: 1031, upstreamRows: 7298, upstreamSuffixedRows: 105, upstreamUnkeyedRows: 1, englishMatches: 1023, latinMatches: 1023, unmatchedPairs: 8, canonicalComparedStructures: 4 });
    assert.equal(report.historicalAudits[0].checkedAt, '2026-10-19');
    assert.equal(report.historicalAudits[0].algorithm, 'numeric-only-upstream-rows-v1');
    const csvFile = path.join(dir, '.data/z-anatomy/TA2.csv');
    writeFileSync(csvFile, `${readFileSync(csvFile, 'utf8')}\n`);
    assert.notEqual(run(dir, ['--apply']).status, 0, 'pinned CSV drift rejects apply');
    assert.equal(hash(reportFile), after, 'failed apply cannot rewrite report');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
