import type { EvidenceIndexEntry } from "@/lib/clinical/evidence-registry";
import type { PubMedPaper, RagHit } from "@/lib/types";

/** Checks source identity only. It cannot establish factual entailment. */
export function auditAnswerCitations(answer: string, supplied: {
  rag: readonly RagHit[]; pubmed: readonly PubMedPaper[]; curated: readonly EvidenceIndexEntry[];
}) {
  const canonical = (url: string) => url.replace(/[.,;:!?]+$/, "").replace(/\/$/, "");
  const urls = new Set([
    ...supplied.rag.flatMap(hit => [hit.url, hit.licenseUrl]),
    ...supplied.pubmed.map(paper => paper.url),
    ...supplied.curated.flatMap(record => record.evidence.sources.map(source => source.url)),
  ].filter((url): url is string => Boolean(url)).map(canonical));
  const pmids = new Set([
    ...supplied.pubmed.map(paper => paper.pmid),
    ...[...urls].flatMap(url => url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/)?.[1] ?? []),
  ]);
  const ragIds = new Set(supplied.rag.map(hit => hit.citationId ?? hit.id));
  const app = supplied.curated.map(record => ({ id: `APP:${record.id}`, count: record.evidence.sources.length }))
    .sort((a, b) => b.id.length - a.id.length);
  const invalid = new Set<string>();
  for (const match of answer.matchAll(/\b(?:APP|PMID|RAG):[^\s\],;)]+/g)) {
    const marker = match[0].replace(/[.*:]+$/, "");
    if (marker.startsWith("PMID:")) {
      if (!pmids.has(marker.slice(5))) invalid.add(marker);
    } else if (marker.startsWith("RAG:")) {
      if (!ragIds.has(marker.slice(4))) invalid.add(marker);
    } else {
      const record = app.find(item => marker === item.id || marker.startsWith(`${item.id}:`));
      const suffix = record ? marker.slice(record.id.length) : "";
      const tail = answer.slice((match.index ?? 0) + match[0].length);
      const qualified = tail.match(/^(?:\]\s*\[|[\s,;]+(?:nguồn\s*)?\[?)(\d+(?:\s*[,;]\s*\d+)*)/iu)?.[1];
      const numbers = [suffix.slice(1), qualified].filter(Boolean).flatMap(value => value!.split(/\s*[,;]\s*/));
      if (!record || numbers.some(number => !/^\d+$/.test(number) || Number(number) < 1 || Number(number) > record.count)) invalid.add(marker);
    }
  }
  for (const match of answer.matchAll(/https?:\/\/[^\s<>"\]\)]+/g)) {
    if (!urls.has(canonical(match[0]))) invalid.add(match[0]);
  }
  return {
    unsupportedReferences: [...invalid],
    unsupportedRagReferences: [...invalid].filter(marker => marker.startsWith("RAG:")).length,
  };
}
