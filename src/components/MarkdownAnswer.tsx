import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Model answers are untrusted text: react-markdown never renders raw HTML,
// and links always open in a new tab without referrer. remark-breaks keeps
// single newlines (e.g. one source per line) as line breaks, like a chat.
const components: Components = {
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
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`md-answer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
