import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";
import type { ChatAnswerCitation } from "@/lib/chat/answer-citations";

const APP_MARKER = /\[(APP:[^\]\n]{1,300})\]/g;

function resolveCitation(value: string, citations: ChatAnswerCitation[]) {
  const citation = [...citations].sort((a, b) => b.id.length - a.id.length).find((item) =>
    value === item.id || (value.startsWith(item.id) && /^[:;,\s]/.test(value.slice(item.id.length))));
  if (!citation) return null;
  return { citation, qualifier: value.slice(citation.id.length).replace(/^[:;,\s]+/, "").trim() };
}

// Resolve source markers only in prose. Code and existing links stay literal.
function remarkReadableCitations({ citations }: { citations: ChatAnswerCitation[] }) {
  return (tree: Root) => {
    function visit(node: { type: string; value?: string; children?: unknown[] }) {
      if (["code", "inlineCode", "link", "linkReference"].includes(node.type)) return;
      if (node.type === "text" && node.value)
        node.value = node.value.replace(APP_MARKER, (marker, value) => {
          const resolved = resolveCitation(value, citations);
          return resolved ? `【${resolved.citation.label}${resolved.qualifier ? ` · ${resolved.qualifier}` : ""}】` : marker;
        });
      for (const child of node.children ?? []) visit(child as Parameters<typeof visit>[0]);
    }
    visit(tree);
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
}: {
  text: string;
  className?: string;
  citations?: ChatAnswerCitation[];
}) {
  const citedIds = new Set([...text.matchAll(APP_MARKER)].map((match) => resolveCitation(match[1], citations)?.citation.id));
  const cited = citations.filter((citation) => citedIds.has(citation.id));
  return (
    <div className={`md-answer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, [remarkReadableCitations, { citations }]]}
        components={components}
      >
        {text}
      </ReactMarkdown>
      {cited.length > 0 && (
        <details className="mt-2 text-xs leading-5 text-slate">
          <summary className="cursor-pointer font-medium text-cobalt">Nguồn đối chiếu trong câu trả lời</summary>
          {cited.map((citation) => (
            <div key={citation.id} className="mt-2 space-y-1">
              <p className="font-medium text-ink">{citation.label}</p>
              {citation.sources.map((source, index) => (
                <p key={`${source.url}:${index}`}>
                  {index + 1}. {/^https?:\/\//i.test(source.url)
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
