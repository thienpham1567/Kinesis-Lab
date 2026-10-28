import assert from 'node:assert/strict';

/** CSV state machine: delimiters/newlines inside quoted fields are data. */
function semicolonRecords(text) {
  const records = [];
  let fields = [], field = '', quoted = false, closed = false;
  const endField = () => { fields.push(field); field = ''; closed = false; };
  const endRecord = () => { endField(); records.push(fields); fields = []; };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += char;
    } else if (char === ';') endField();
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      endRecord();
    } else if (char === '"') {
      assert(!field && !closed, 'Unexpected CSV quote');
      quoted = true;
    } else {
      assert(!closed, 'Unexpected text after closing CSV quote');
      field += char;
    }
  }
  assert(!quoted, 'Unclosed CSV quote');
  if (field || fields.length || closed) endRecord();
  return records;
}

/**
 * The pinned derivative wraps each entire semicolon record in quotes. Decode
 * that outer CSV layer, then parse the semicolon fields. Ordinary field-quoted
 * semicolon CSV is also accepted; no punctuation or qualifiers are discarded.
 */
export function parseUpstreamCsv(text) {
  const records = semicolonRecords(text.replace(/^\uFEFF/, '')).flatMap(fields =>
    fields.length === 1 && fields[0].includes(';') ? semicolonRecords(fields[0]) : [fields]);
  const populated = records.filter(fields => fields.some(field => field.trim()));
  const header = populated.shift();
  assert(header?.[0] === 'TA2ID' && header[1] === 'English' && header[2] === 'Latin', 'Unexpected upstream CSV header');
  const seen = new Set();
  return populated.map(fields => {
    assert.equal(fields.length, header.length, `CSV field count at row ${fields[0]}`);
    const [rowId, english, latin] = fields;
    const upstreamRowId = rowId || null;
    assert(upstreamRowId === null || /^\d+(?:\*\d+)?$/.test(upstreamRowId), `Invalid upstream row ID ${upstreamRowId}`);
    assert(english.trim(), `Missing English at upstream row ${upstreamRowId}`);
    assert(upstreamRowId === null || !seen.has(upstreamRowId), `Duplicate upstream row ID ${upstreamRowId}`);
    if (upstreamRowId !== null) seen.add(upstreamRowId);
    return { upstreamRowId, english, latin };
  });
}

/** Only compatibility/case/whitespace normalization; retain all name qualifiers. */
const norm = value => value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
const FIPAT_PART_2 = 'https://cdn.dal.ca/content/dam/dalhousie/pdf/library/FIPAT/TA2/FIPAT-TA2-Part-2.pdf';
// Explicit existing source comparisons, not IDs inferred from derivative keys.
const ORIGINAL_COMPARISONS = {
  'latin-flexor-digiti-minimi-pedis': { canonicalTa2Id: '2682', english: 'Flexor digiti minimi of foot', latin: 'Flexor digiti minimi pedis' },
  'latin-triceps-medial-head': { canonicalTa2Id: '2474', english: 'Medial head of triceps brachii', latin: 'Caput mediale musculi tricipitis brachii' },
};

function canonicalComparisons(manifest, corrections) {
  const result = new Map();
  for (const correction of corrections) {
    const known = ORIGINAL_COMPARISONS[correction.id];
    if (!known && correction.canonicalTa2Id == null) continue;
    assert(known && correction.canonicalTa2Id === known.canonicalTa2Id, `Unsupported canonical FIPAT mapping ${correction.id}`);
    assert(correction.basis === 'original-terminology-table', `Canonical mapping requires original FIPAT citation ${correction.id}`);
    assert(correction.expected.english === known.english && correction.changes.latin === known.latin, `Canonical identity guard drift ${correction.id}`);
    assert(correction.reviewedBy === null, `Canonical reviewer metadata ${correction.id}`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(correction.checkedAt), `Canonical comparison date ${correction.id}`);
    assert(correction.sources?.some(source => source.url === FIPAT_PART_2
      && source.title.includes('FIPAT') && source.checkedAt === correction.checkedAt
      && source.access.includes(`Bảng mục ${known.canonicalTa2Id}, trang PDF `)), `Canonical mapping requires actual FIPAT item citation ${correction.id}`);
    for (const id of correction.structureIds) {
      const structure = manifest.structures.find(row => row.id === id);
      assert(structure && structure.english === known.english && structure.latin === correction.expected.latin,
        `Canonical raw identity guard drift ${id}`);
      assert(!result.has(id), `Duplicate canonical mapping ${id}`);
      result.set(id, {
        canonicalTa2Id: known.canonicalTa2Id,
        canonicalComparison: {
          correctionId: correction.id, english: known.english, latin: known.latin,
          checkedAt: correction.checkedAt, sources: structuredClone(correction.sources),
          basis: correction.basis, reviewedBy: correction.reviewedBy,
        },
      });
    }
  }
  return result;
}

/** Compare the raw manifest only. Source string equality does not verify anatomy. */
export function compareCatalog(manifest, rows, corrections = []) {
  const names = new Map();
  for (const row of rows) {
    const key = norm(row.english);
    const list = names.get(key) ?? [];
    list.push(row); names.set(key, list);
  }
  const canonical = canonicalComparisons(manifest, corrections);
  const seen = new Set();
  return Object.fromEntries(manifest.structures.map(structure => {
    assert(!seen.has(structure.id), `Duplicate structure ID ${structure.id}`); seen.add(structure.id);
    const matches = names.get(norm(structure.english)) ?? [];
    return [structure.id, {
      englishMatch: matches.length > 0,
      latinMatches: Boolean(structure.latin && matches.some(row => norm(row.latin) === norm(structure.latin))),
      upstreamRowIds: matches.map(row => row.upstreamRowId),
      canonicalTa2Id: canonical.get(structure.id)?.canonicalTa2Id ?? null,
      canonicalComparison: canonical.get(structure.id)?.canonicalComparison ?? null,
    }];
  }));
}
