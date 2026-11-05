import { answerCitationsFromStudySources, citationNumbering } from "./answer-citations";
import type { StudyChatMessage } from "./illustration-types";

const UNKNOWN_MARKER = /\[(?:APP|RAG|PMID):[^\]\n]+\]/g;

export function studyAnswerClipboard(message: StudyChatMessage) {
  const citations = message.citations ?? [];
  const known = new Set(citations.map((item) => item.id));
  const numbering = citationNumbering([
    ...citations,
    ...answerCitationsFromStudySources(message.study?.sources ?? []).filter((item) => !known.has(item.id)),
  ]);
  // Same short reference numbers as the rendered answer; unmatched IDs are flagged.
  const content = numbering.split(message.content)
    .map((part) => typeof part === "string" ? part.replace(UNKNOWN_MARKER, "(nguồn chưa đối chiếu)") : ` [${part.join(",")}]`)
    .join("");
  const cited = numbering.refs().map(({ n, label, sources }) =>
    [`[${n}] ${label}`, ...sources.map((source) => `${source.title}\n${source.url}\nPhạm vi: ${source.access}`)].join("\n"));
  // Mirrors the rendered answer: cited sources only; retrieval notice only when nothing is cited.
  return [
    content,
    message.study?.warning ?? "",
    cited.length ? `Nguồn trích dẫn:\n${cited.join("\n\n")}` : message.study?.sourceNotice ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
