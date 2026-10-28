import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { parseUpstreamCsv, compareCatalog } from './lib/catalog-evidence-audit.mjs';

const args = process.argv.slice(2);
if (args.length > 1 || args.some(arg => !['--check', '--apply'].includes(arg))) {
  console.error('Usage: node scripts/audit-catalog-evidence.mjs [--check | --apply]. Default: read-only comparison.');
  process.exit(2);
}
const root = new URL('../', import.meta.url);
const readJson = relative => JSON.parse(fs.readFileSync(new URL(relative, root), 'utf8'));
const reportUrl = new URL('src/lib/clinical/catalog-evidence.json', root);
try {
  const manifest = readJson('public/anatomy/3d/manifest.json');
  const bytes = fs.readFileSync(new URL('.data/z-anatomy/TA2.csv', root));
  const csvSha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  const historicalAudits = readJson('src/lib/clinical/catalog-evidence-history.json');
  const baseline = historicalAudits[0];
  assert.equal(csvSha256, baseline.csvSha256, 'Pinned upstream CSV SHA-256 drift');
  assert.deepEqual(manifest.source, baseline.source, 'Pinned manifest provenance drift');
  const current = fs.existsSync(reportUrl) ? JSON.parse(fs.readFileSync(reportUrl, 'utf8')) : null;
  const rows = parseUpstreamCsv(bytes.toString('utf8'));
  const structures = compareCatalog(manifest, rows, readJson('src/lib/clinical/atlas-corrections.json'));
  const records = Object.values(structures);
  // Read-only replay retains the date recorded by --apply; it does not claim a
  // new source reading. --apply records the actual UTC date of the local replay.
  const checkedAt = args[0] === '--apply' ? new Date().toISOString().slice(0, 10) : current?.checkedAt;
  assert(/^\d{4}-\d{2}-\d{2}$/.test(checkedAt ?? ''), 'Missing replay date; run --apply to generate the report');
  const report = {
    checkedAt,
    algorithm: 'upstream-row-exact-names-v2',
    provenanceCheckedAt: baseline.checkedAt,
    source: manifest.source,
    csvSha256,
    scope: 'Local replay against pinned upstream derivative TA2.csv, retaining numeric and suffixed upstream row IDs. Exact NFKC/case/whitespace-normalized English/Latin string comparison only; parenthetical and synonym qualifiers are preserved. Upstream row IDs are derivative provenance, not verified canonical TA2 IDs. Separate canonical comparisons reuse only the two explicitly cited original-FIPAT correction records with their actual source-reading dates. No new source reading, Vietnamese translation, mesh identity, geometry, attachment, measurement or clinical validation.',
    historicalAudits,
    counts: {
      structures: records.length,
      upstreamRows: rows.length,
      upstreamSuffixedRows: rows.filter(row => row.upstreamRowId?.includes('*')).length,
      upstreamUnkeyedRows: rows.filter(row => row.upstreamRowId === null).length,
      englishMatches: records.filter(row => row.englishMatch).length,
      latinMatches: records.filter(row => row.latinMatches).length,
      unmatchedPairs: records.filter(row => !row.latinMatches).length,
      canonicalComparedStructures: records.filter(row => row.canonicalTa2Id !== null).length,
    },
    structures,
  };
  if (args[0] === '--apply') {
    fs.writeFileSync(reportUrl, `${JSON.stringify(report)}\n`);
    console.log(`Applied catalog evidence report: ${JSON.stringify(report.counts)}`);
  } else {
    if (!isDeepStrictEqual(current, report)) {
      console.error(`Catalog evidence report is stale. Recomputed counts: ${JSON.stringify(report.counts)}. Use --apply intentionally to update it.`);
      process.exitCode = 1;
    } else console.log(`Catalog evidence report matches (read-only): ${JSON.stringify(report.counts)}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
