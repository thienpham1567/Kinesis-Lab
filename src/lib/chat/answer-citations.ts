import type { EvidenceSource } from "@/lib/clinical/evidence-types";

export type ChatAnswerCitation = { id: string; label: string; sources: EvidenceSource[] };

export function answerCitationsFromEvidence(records: readonly {
  id: string; label: string; evidence: { sources: EvidenceSource[] };
}[]): ChatAnswerCitation[] {
  return records.map((record) => ({ id: `APP:${record.id}`, label: record.label, sources: record.evidence.sources }));
}

/** Session storage is untrusted; preserve only bounded source display metadata. */
export function parseAnswerCitations(raw: unknown): ChatAnswerCitation[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 6).flatMap((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" ||
        !/^APP:[a-z0-9:_-]{1,160}$/i.test(item.id) || typeof item.label !== "string" || !Array.isArray(item.sources)) return [];
    const sources = item.sources.slice(0, 30).flatMap((source: Record<string, unknown>) => {
      if (!source || typeof source !== "object" || typeof source.title !== "string" ||
          typeof source.url !== "string" || !/^https?:\/\//i.test(source.url) ||
          typeof source.checkedAt !== "string" || typeof source.access !== "string") return [];
      return [{ title: source.title.slice(0, 500), url: source.url.slice(0, 2000), checkedAt: source.checkedAt.slice(0, 40), access: source.access.slice(0, 1200) }];
    });
    return [{ id: item.id, label: item.label.slice(0, 300), sources }];
  });
}
