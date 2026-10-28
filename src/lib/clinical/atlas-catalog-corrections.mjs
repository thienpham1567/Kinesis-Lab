/**
 * @typedef {{ title: string, url: string, checkedAt: string, access: string }} CorrectionSource
 * @typedef {{
 *   id: string, structureIds: string[],
 *   expected: { english: string, latin?: string, side?: string | null, clinicalRegion?: string | null, surfaceKinds?: string[] },
 *   changes: { latin?: string, side?: string | null, clinicalRegion?: string | null, anatomicalTissueLabel?: string },
 *   sources: CorrectionSource[], checkedAt: string, access: string, basis: string, reviewedBy: null
 * }} AtlasCorrection
 */
const CHANGE_FIELDS = new Set(['latin', 'side', 'clinicalRegion', 'anatomicalTissueLabel']);
const EXPECTED_FIELDS = new Set(['english', 'latin', 'side', 'clinicalRegion', 'surfaceKinds']);
const text = value => typeof value === 'string' && value.trim().length > 0;
const date = value => text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fail = message => { throw new Error(`Atlas correction: ${message}`); };

/**
 * Apply evidence-backed catalog metadata only. Always compare guards to the raw
 * row, never another correction. Reject drift/conflicts before returning data.
 * The returned manifest is a deep copy, so subsequent consumer edits cannot alter
 * the raw source. This does not certify mesh anatomy or modify source assets.
 * @template {{ structures: { id: string, english: string, latin: string, side: string | null, clinicalRegion: string | null, surfaces?: { kind: string }[], sourceMetadata?: object, correctionIds?: string[] }[] }} T
 * @param {T} raw Raw source manifest (not an already resolved catalog).
 * @param {readonly AtlasCorrection[]} corrections Traceable correction records.
 * @returns {T} Copy with canonical fields, original metadata and correction IDs.
 */
export function applyAtlasCorrections(raw, corrections) {
  const rows = new Map();
  for (const row of raw.structures) {
    if (rows.has(row.id)) fail(`duplicate structure ID ${row.id}`);
    if (row.sourceMetadata || row.correctionIds) fail(`already resolved structure ${row.id}`);
    rows.set(row.id, row);
  }
  const recordIds = new Set();
  const writes = new Map();
  for (const correction of corrections) {
    const { id, structureIds, expected, changes, sources } = correction;
    if (!text(id) || recordIds.has(id)) fail(`duplicate or missing correction ID ${id}`);
    recordIds.add(id);
    if (!date(correction.checkedAt) || !text(correction.access) || !text(correction.basis)) fail(`missing date/access/basis for ${id}`);
    if (correction.reviewedBy !== null) fail(`reviewedBy must remain null for ${id}`);
    if (!Array.isArray(sources) || !sources.length) fail(`missing citation sources for ${id}`);
    for (const source of sources) {
      if (!text(source.title) || !text(source.access) || !date(source.checkedAt)) fail(`missing source title/access/date for ${id}`);
      try { if (new URL(source.url).protocol !== 'https:') fail(`source URL for ${id}`); }
      catch { fail(`invalid citation source URL for ${id}`); }
    }
    if (!expected || !text(expected.english)) fail(`missing expected English guard for ${id}`);
    for (const field of Object.keys(expected)) if (!EXPECTED_FIELDS.has(field)) fail(`disallowed expected field ${field}`);
    if (!changes || !Object.keys(changes).length) fail(`missing change fields for ${id}`);
    for (const [field, value] of Object.entries(changes)) {
      if (!CHANGE_FIELDS.has(field)) fail(`disallowed change field ${field}`);
      if (field === 'side' ? !['left', 'right', null].includes(value) : !text(value)) fail(`invalid ${field} value for ${id}`);
      if (field === 'anatomicalTissueLabel') {
        if (!Array.isArray(expected.surfaceKinds) || !expected.surfaceKinds.length || expected.surfaceKinds.some(kind => !text(kind))) fail(`missing expected surfaceKinds guard for ${id}`);
      } else if (!Object.hasOwn(expected, field)) fail(`missing expected field guard ${field} for ${id}`);
    }
    if (!Array.isArray(structureIds) || !structureIds.length || new Set(structureIds).size !== structureIds.length) fail(`duplicate or missing structure IDs for ${id}`);
    for (const structureId of structureIds) {
      const row = rows.get(structureId);
      if (!row) fail(`unknown structure ID ${structureId}`);
      for (const [field, value] of Object.entries(expected)) {
        const actual = field === 'surfaceKinds' ? [...new Set((row.surfaces ?? []).map(surface => surface.kind))].sort() : row[field];
        const guard = field === 'surfaceKinds' ? [...value].sort() : value;
        if (!same(actual, guard)) fail(`expected metadata drift at ${structureId}/${field}`);
      }
      const fields = writes.get(structureId) ?? new Set();
      for (const field of Object.keys(changes)) {
        if (fields.has(field)) fail(`conflicting/duplicate correction at ${structureId}/${field}`);
        fields.add(field);
      }
      writes.set(structureId, fields);
    }
  }
  const resolved = structuredClone(raw);
  const resolvedRows = new Map(resolved.structures.map(row => [row.id, row]));
  for (const correction of corrections) for (const id of correction.structureIds) {
    const row = resolvedRows.get(id);
    row.sourceMetadata ??= Object.fromEntries(['english', 'latin', 'side', 'clinicalRegion'].map(field => [field, row[field]]));
    row.correctionIds ??= [];
    Object.assign(row, correction.changes);
    row.correctionIds.push(correction.id);
  }
  return resolved;
}
