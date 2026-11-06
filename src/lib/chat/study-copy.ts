import { answerCitationsFromStudySources } from "./answer-citations";
import { answerMarkdownClipboard } from "./answer-markdown";
import type { StudyChatMessage } from "./illustration-types";

export function studyAnswerCitations(message: StudyChatMessage) {
  const citations = message.citations ?? [];
  const known = new Set(citations.map((item) => item.id));
  return [
    ...citations,
    ...answerCitationsFromStudySources(message.study?.sources ?? []).filter((item) => !known.has(item.id)),
  ];
}

export function studyAnswerClipboard(message: StudyChatMessage) {
  const prepared = answerMarkdownClipboard(message.content, studyAnswerCitations(message));
  const cited = prepared.cited.map(({ n, label, sources }) =>
    [`[${n}] ${label}`, ...sources.map((source) => `${source.title}\n${source.url}\nKiểm tra: ${source.checkedAt}\nPhạm vi: ${source.access}`)].join("\n"));
  // Mirrors the rendered answer: cited sources only; retrieval notice only when nothing is cited.
  return [
    prepared.content,
    message.study?.warning ?? "",
    cited.length ? `Nguồn trích dẫn:\n${cited.join("\n\n")}` : message.study?.sourceNotice ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
