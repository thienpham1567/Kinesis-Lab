import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";
import { citationNumbering, type ChatAnswerCitation } from "@/lib/chat/answer-citations";

type MdNode = { type: string; value?: string; children?: MdNode[]; data?: Record<string, unknown> };
type Numbering = ReturnType<typeof citationNumbering>;

// Source markers in prose become small superscript numbers; the full source
// labels live in the list below. Code and existing links stay literal.
function remarkReadableCitations({ numbering }: { numbering: Numbering }) {
  return (tree: Root) => {
    function visit(node: MdNode) {
      if (["code", "inlineCode", "link", "linkReference"].includes(node.type) || !node.children) return;
      node.children = node.children.flatMap((child) => child.type !== "text" || !child.value ? [child]
        : numbering.split(child.value).map((part): MdNode => typeof part === "string" ? { type: "text", value: part } : {
            type: "citationRef",
            data: { hName: "sup", hProperties: { className: "ml-0.5 text-[0.7em] font-medium text-cobalt" } },
            children: [{ type: "text", value: `[${part.join(",")}]` }],
          }));
      node.children.forEach(visit);
    }
    visit(tree as MdNode);
  };
}

// Model answers are untrusted text: react-markdown never renders raw HTML,
// and links always open in a new tab without referrer. remark-breaks keeps
// single newlines (e.g. one source per line) as line breaks, like a chat.
const components: Components = {
  // Model-controlled image URLs must never trigger requests with private data.
  img: ({ alt }) => <span>{alt}</span>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="md-table-scroll">
      <table>{children}</table>
    </div>
  ),
};

export function MarkdownAnswer({
  text,
  className = "",
  citations = [],
  uncitedNotice,
}: {
  text: string;
  className?: string;
  citations?: ChatAnswerCitation[];
  /** Explains missing sources; shown only when the answer cites nothing. */
  uncitedNotice?: string;
}) {
  const numbering = citationNumbering(citations);
  // Number in reading order before rendering so the list matches the
  // superscripts; code spans are skipped exactly as the remark plugin does.
  numbering.split(text.replace(/```[\s\S]*?```|`[^`\n]*`/g, ""));
  const cited = numbering.refs();
  return (
    <div className={`md-answer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, [remarkReadableCitations, { numbering }]]}
        components={components}
      >
        {text}
      </ReactMarkdown>
      {cited.length === 0 && uncitedNotice && (
        <p className="mt-2 text-xs leading-5 text-slate">{uncitedNotice}</p>
      )}
      {cited.length > 0 && (
        <details className="mt-2 text-xs leading-5 text-slate">
          <summary className="cursor-pointer font-medium text-cobalt">Nguồn đối chiếu trong câu trả lời</summary>
          {cited.map(({ n, label, sources }) => (
            <div key={n} className="mt-2 space-y-1">
              <p className="font-medium text-ink">[{n}] {label}</p>
              {sources.map((source, index) => (
                <p key={`${source.url}:${index}`}>
                  {sources.length > 1 && `${index + 1}. `}{/^https?:\/\//i.test(source.url)
                    ? <a href={source.url} target="_blank" rel="noreferrer noopener">{source.title}</a>
                    : <span>{source.title}</span>}
                  {" · kiểm tra "}{source.checkedAt}<br />{source.access}
                </p>
              ))}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
