import type { StudyChatMessage } from "./illustration-types";

export function studyAnswerClipboard(message: StudyChatMessage) {
  const content = message.content.replace(
    /\[((?:APP|PMID):[^\]\n]+)\]/g,
    (_marker, id: string) => {
      const source = message.study?.sources.find((item) => item.id === id);
      const record = [...(message.citations ?? [])]
        .sort((a, b) => b.id.length - a.id.length)
        .find(
          (item) =>
            id === item.id ||
            (id.startsWith(item.id) &&
              /^[:;,\s]/.test(id.slice(item.id.length))),
        );
      return source
        ? `(${source.title})`
        : record
          ? `(${record.label})`
          : "(nguồn chưa đối chiếu)";
    },
  );
  const references = message.study?.sources
    .map(
      (source) => `${source.title}\n${source.url}\nPhạm vi: ${source.access}`,
    )
    .join("\n\n");
  return [
    content,
    references ? `Nguồn cung cấp cho lượt trả lời:\n${references}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
