import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import remarkStringify from "remark-stringify";
import type { Root, Text } from "mdast";
import type { Node } from "unist";
import { citationNumbering, type ChatAnswerCitation } from "./answer-citations";

type AnswerNode = {
  type: string;
  value?: string;
  children?: AnswerNode[];
  data?: Record<string, unknown>;
};
interface CitationReference extends Node {
  type: "citationRef";
  value: string;
  children: Text[];
}
declare module "mdast" {
  interface RootContentMap {
    citationRef: CitationReference;
  }
  interface PhrasingContentMap {
    citationRef: CitationReference;
  }
}
const excluded = new Set(["code", "inlineCode", "link", "linkReference", "image", "imageReference", "html", "math", "inlineMath"]);
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkBreaks)
  .use(remarkStringify, { handlers: {
    // Copy keeps short source numbers literal, instead of escaping them as Markdown.
    citationRef: (node: unknown) => ` ${(node as AnswerNode).value}`,
  } });

function applyAnswerCitations(tree: Root, numbering: ReturnType<typeof citationNumbering>) {
  function visit(node: AnswerNode) {
    if (excluded.has(node.type) || !node.children) return;
    node.children = node.children.flatMap((child) => child.type !== "text" || !child.value ? [child]
      : numbering.split(child.value).map((part): AnswerNode => typeof part === "string" ? { type: "text", value: part } : {
          type: "citationRef", value: `[${part.join(",")}]`,
          data: { hName: "sup", hProperties: { "data-citation-numbers": part.join(",") } },
          children: [{ type: "text", value: `[${part.join(",")}]` }],
        }));
    node.children.forEach(visit);
  }
  visit(tree as AnswerNode);
}

/** One AST traversal controls both the display and clipboard source numbering. */
export function prepareAnswerMarkdown(text: string, citations: readonly ChatAnswerCitation[]) {
  const tree = processor.runSync(processor.parse(text)) as Root;
  const numbering = citationNumbering(citations);
  applyAnswerCitations(tree, numbering);
  return { tree, cited: numbering.refs(), snapshot: numbering.snapshot() };
}

/** Streamdown parses blocks independently; seed each processor with the answer's plan. */
export function remarkAnswerCitations({ citations, snapshot }: {
  citations: readonly ChatAnswerCitation[];
  snapshot: string;
}) {
  const numbering = citationNumbering(citations, JSON.parse(snapshot));
  return (tree: Root) => applyAnswerCitations(tree, numbering);
}

export function answerMarkdownClipboard(text: string, citations: readonly ChatAnswerCitation[]) {
  const { tree, cited } = prepareAnswerMarkdown(text, citations);
  function flagUnknown(node: AnswerNode) {
    if (excluded.has(node.type)) return;
    if (node.type === "text" && node.value)
      node.value = node.value.replace(/\[(?:APP|RAG|PMID):[^\]\n]+\]/g, "(nguồn chưa đối chiếu)");
    node.children?.forEach(flagUnknown);
  }
  flagUnknown(tree as AnswerNode);
  return { content: processor.stringify(tree).trimEnd(), cited };
}
