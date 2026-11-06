"use client";

import { useCallback, useId, useMemo, useRef } from "react";
import { Streamdown, type Components } from "streamdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import type { PluggableList } from "unified";
import remend from "remend";
import { prepareAnswerMarkdown, remarkAnswerCitations } from "@/lib/chat/answer-markdown";
import type { ChatAnswerCitation } from "@/lib/chat/answer-citations";
import { MarkdownTable } from "./MarkdownTable";

const EMPTY_CITATIONS: ChatAnswerCitation[] = [];
const REMEND_OPTIONS = { inlineKatex: true };
const REHYPE_PLUGINS: PluggableList = [[rehypeKatex, { trust: false, maxExpand: 1000, maxSize: 20, strict: "ignore", output: "htmlAndMathml" }]];
function safeAnswerUrl(url: string) {
  try {
    const protocol = new URL(url, "https://kinesis.invalid").protocol;
    return ["http:", "https:", "mailto:", "tel:"].includes(protocol) ? url : "";
  } catch {
    return "";
  }
}
// Keep the product's typography and plain code blocks; optional Streamdown
// diagram/highlighting features are outside this migration.
const nativeComponents: Components = {
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  del: ({ children }) => <del>{children}</del>,
  p: ({ children }) => <p>{children}</p>,
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  h4: ({ children }) => <h4>{children}</h4>,
  h5: ({ children }) => <h5>{children}</h5>,
  h6: ({ children }) => <h6>{children}</h6>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children, start }) => <ol start={start}>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  hr: () => <hr />,
  pre: ({ children }) => <pre>{children}</pre>,
  code: ({ children, className }) => <code className={className}>{children}</code>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children, style }) => <th scope="col" style={style}>{children}</th>,
  td: ({ children, style }) => <td style={style}>{children}</td>,
};

export function MarkdownAnswer({
  text,
  className = "",
  citations = EMPTY_CITATIONS,
  uncitedNotice,
  streaming = false,
}: {
  text: string;
  className?: string;
  citations?: ChatAnswerCitation[];
  uncitedNotice?: string;
  streaming?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  // Repair display syntax only. Persisted model content is never rewritten.
  const prepared = useMemo(() => prepareAnswerMarkdown(
    streaming ? remend(text, REMEND_OPTIONS) : text, citations,
  ), [text, citations, streaming]);
  const showSource = useCallback((n: number) => {
    if (!disclosure.current) return;
    disclosure.current.open = true;
    const target = root.current?.querySelector<HTMLElement>(`[data-source-number="${n}"]`);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, []);
  const components: Components = useMemo(() => ({
    ...nativeComponents,
    // Never request model-controlled images, including hidden tracking URLs.
    img: ({ alt }) => <span>{alt}</span>,
    a: ({ href, children }) => streaming || !href ? <span>{children}</span> : (
      <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>
    ),
    table: ({ children }) => <MarkdownTable streaming={streaming}>{children}</MarkdownTable>,
    sup: ({ node, children }) => {
      const numbers = String(node?.properties?.["data-citation-numbers"] ?? node?.properties?.dataCitationNumbers ?? "").split(",").map(Number).filter(n => Number.isInteger(n) && n > 0);
      if (!numbers.length) return <sup>{children}</sup>;
      return <sup className="md-citation">[{numbers.map((n, index) => (
        <span key={n}>{index > 0 && ","}<button type="button" aria-label={`Xem nguồn ${n}`} aria-controls={`${id}-source-${n}`} onClick={() => showSource(n)}>{n}</button></span>
      ))}]</sup>;
    },
  }), [id, showSource, streaming]);
  const { cited, snapshot } = prepared;
  const remarkPlugins: PluggableList = useMemo(() => [
    remarkGfm, remarkMath, remarkBreaks, [remarkAnswerCitations, { citations, snapshot }],
  ], [citations, snapshot]);
  return (
    <div ref={root} className={`md-answer ${className}`}>
      <Streamdown
        // Streamdown memoizes blocks; reset only if source numbering/metadata changes.
        key={snapshot}
        data-answer-renderer="streamdown"
        className="md-stream space-y-0"
        mode={streaming ? "streaming" : "static"}
        isAnimating={streaming}
        parseIncompleteMarkdown={streaming}
        remend={REMEND_OPTIONS}
        controls={false}
        remarkPlugins={remarkPlugins}
        rehypePlugins={REHYPE_PLUGINS}
        components={components}
        urlTransform={safeAnswerUrl}
        skipHtml
      >
        {text}
      </Streamdown>
      {cited.length === 0 && uncitedNotice && !streaming && (
        <p className="mt-2 text-xs leading-5 text-slate">{uncitedNotice}</p>
      )}
      {cited.length > 0 && (
        <details ref={disclosure} className="md-sources mt-2 text-xs leading-5 text-slate">
          <summary className="cursor-pointer font-medium">Nguồn đối chiếu trong câu trả lời</summary>
          {cited.map(({ n, label, sources }) => (
            <div key={n} id={`${id}-source-${n}`} data-source-number={n} tabIndex={-1} className="md-source mt-2 space-y-1">
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
