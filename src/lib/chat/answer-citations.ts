import type { EvidenceSource } from "@/lib/clinical/evidence-types";

export type ChatAnswerCitation = { id: string; label: string; sources: EvidenceSource[] };

export function answerCitationsFromStudySources(sources: readonly (EvidenceSource & { id: string })[]): ChatAnswerCitation[] {
  let fullText = 0;
  let pubmed = 0;
  return sources.filter(source => /^(RAG|PMID):/.test(source.id)).map(({ id, ...source }) => ({
    id, label: id.startsWith("RAG:") ? `Toàn văn ${++fullText}` : `PubMed ${++pubmed}`, sources: [source],
  }));
}

export function answerCitationsFromEvidence(records: readonly {
  id: string; label: string; evidence: { sources: EvidenceSource[] };
}[]): ChatAnswerCitation[] {
  return records.map((record) => ({ id: `APP:${record.id}`, label: record.label, sources: record.evidence.sources }));
}

export type CitedRef = { n: number; label: string; sources: EvidenceSource[] };

// Leading spaces/tabs belong to the marker so "gối [APP:x:1]" renders "gối¹".
const MARKER = /[ \t]*\[((?:APP|RAG|PMID):[^\]\n]{1,300})\]/g;
const ID_START = /\s*[,;]\s*(?=(?:APP|RAG|PMID):)/;

/**
 * Turns model source markers into short reference numbers, one per cited
 * source, in order of first appearance. Handles "[APP:rec:2]", merged
 * "[APP:rec:2, APP:rec:7]", "[APP:rec:2,7]" and adjacent markers (one group).
 * Unknown IDs stay literal so unsupported citations remain visible.
 */
export function citationNumbering(citations: readonly ChatAnswerCitation[], seed: readonly (readonly [string, CitedRef])[] = []) {
  const sorted = [...citations].sort((a, b) => b.id.length - a.id.length);
  const refs = new Map<string, CitedRef>(seed);
  const number = (key: string, label: string, sources: EvidenceSource[]) => {
    const ref = refs.get(key) ?? { n: refs.size + 1, label, sources };
    refs.set(key, ref);
    return ref.n;
  };
  function resolve(id: string): number[] | null {
    const citation = sorted.find((item) =>
      id === item.id || (id.startsWith(item.id) && /^[:;,\s]/.test(id.slice(item.id.length))));
    if (!citation) return null;
    const qualifier = id.slice(citation.id.length).replace(/^[:;,\s]+/, "").trim();
    const indexes = /^(?:nguồn\s*)?\d+(?:\s*[,;]\s*\d+)*$/iu.test(qualifier) ? qualifier.match(/\d+/g)!.map(Number) : [];
    if (indexes.length && indexes.every((i) => citation.sources[i - 1]))
      return indexes.map((i) => number(`${citation.id}:${i}`, citation.label, [citation.sources[i - 1]]));
    return [number(`${citation.id} ${qualifier}`, qualifier && !indexes.length ? `${citation.label} · ${qualifier}` : citation.label, citation.sources)];
  }
  /** Splits prose into text and reference-number groups. */
  function split(value: string): (string | number[])[] {
    const out: (string | number[])[] = [];
    let last = 0;
    for (const match of value.matchAll(MARKER)) {
      const before = new Map(refs);
      const resolved = match[1].split(ID_START).map(resolve);
      if (resolved.some((item) => !item)) {
        refs.clear();
        before.forEach((ref, key) => refs.set(key, ref));
        continue;
      }
      const prev = out.at(-1);
      const group = match.index === last && Array.isArray(prev) ? prev : [];
      if (group !== prev) {
        if (match.index > last) out.push(value.slice(last, match.index));
        out.push(group);
      }
      for (const n of resolved.flat() as number[]) if (!group.includes(n)) group.push(n);
      group.sort((a, b) => a - b);
      last = match.index + match[0].length;
    }
    if (last < value.length) out.push(value.slice(last));
    return out;
  }
  return { split, refs: () => [...refs.values()], snapshot: () => JSON.stringify([...refs]) };
}

/** Session storage is untrusted; preserve only bounded source display metadata. */
export function parseAnswerCitations(raw: unknown): ChatAnswerCitation[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 24).flatMap((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" ||
        !/^(APP|RAG|PMID):[a-z0-9:_-]{1,160}$/i.test(item.id) || typeof item.label !== "string" || !Array.isArray(item.sources)) return [];
    const sources = item.sources.slice(0, 30).flatMap((source: Record<string, unknown>) => {
      if (!source || typeof source !== "object" || typeof source.title !== "string" ||
          typeof source.url !== "string" || !/^https?:\/\//i.test(source.url) ||
          typeof source.checkedAt !== "string" || typeof source.access !== "string") return [];
      return [{ title: source.title.slice(0, 500), url: source.url.slice(0, 2000), checkedAt: source.checkedAt.slice(0, 40), access: source.access.slice(0, 1200) }];
    });
    return [{ id: item.id, label: item.label.slice(0, 300), sources }];
  });
}
