# Study Answer Formatting Implementation Plan

**Goal:** Implement the five formatting improvements approved in chat.

**Architecture:** Keep react-markdown; share a Markdown AST citation walker with the clipboard formatter. Add bounded math rendering, stream-only syntax completion and small source/table controls.

**Tech stack:** React 19, Next 16, unified, remark, KaTeX, Remend.

1. Add regression tests to `scripts/check-markdown-answer.mjs` for code/link exclusions, source buttons, streaming and formulas. Add display/copy parity fixtures to `scripts/check-study-chat.mjs`. Run the tests and confirm expected failures.
2. Add `src/lib/chat/answer-markdown.ts` for parsing and the shared citation traversal. Replace raw regex prescanning in `MarkdownAnswer.tsx` and raw-text clipboard numbering in `study-copy.ts`. Verify using `npm run check:markdown` and `npm run check:study-chat`.
3. Add math/stream dependencies. Parse formulas with remark-math and render with rehype-katex using trust=false and bounded expansion. Apply Remend only to the in-flight display string and pass `busy` from StudyAnswer. Add local KaTeX styles and bounded overflow.
4. Add `MarkdownTable.tsx` for accessible scrolling and TSV copy. Add per-answer source targets and citation buttons, with source disclosure focus/scroll. Keep streamed links inert. Verify actions in the local browser.
5. Run `npx tsc --noEmit`, scoped ESLint, `npm run build`, study/Markdown/chat tests and React Doctor. Run design source and page scans. Save screenshot proof and a review note documenting any remaining findings.

Execution is inline in the current workspace on `codex/study-answer-format`, keeping the user's local preview usable. User approval already covers this implementation; no additional approval checkpoint is needed.
