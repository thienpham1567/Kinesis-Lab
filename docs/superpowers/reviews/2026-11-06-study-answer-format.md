# Study answer formatting review

The renderer was subsequently migrated to Streamdown after a separate approved comparison. See [the migration review](2026-11-06-study-streamdown.md) for the current engine and measurements; this document records the preceding formatting work.

Implemented the five changes approved in chat on 2026-11-06, retaining react-markdown and existing theme tokens.

## Behavior

- Display and clipboard now share a Markdown AST citation traversal. Code fences (including tildes), inline code, existing links, images and math do not create prose citations. A mixed group containing an unknown ID does not leak partially resolved sources. Legacy saved messages use the same combined source set for display and copy.
- Each source number is keyboard-operable and opens, focuses and scrolls to its matching source entry. Targets are unique per answer. Source title, check date and reading scope remain available; copies retain the check date too.
- Math uses remark-math + rehype-katex with local KaTeX CSS/fonts, accessible MathML, trust disabled and bounded expansion/size. Invalid syntax remains visible without crashing the answer. Remend repairs only in-flight display syntax; stored model text is unchanged and answer-body links remain inert while streaming.
- Tables retain table semantics, gain a labelled focusable scrolling region and a TSV copy action. Math copies its TeX once rather than duplicating accessible and visual markup. Copy failure states explain how to recover. Columns have a 144px minimum to avoid excessive wrapping.
- Updated the obsolete floating-chat prompt that prohibited tables. The study prompt now permits compact comparison tables and requests inline/block LaTeX while retaining the existing evidence rules.

## Verification

- `npm run check:markdown`: passed, including the previously failing tilde-fence and mixed-unknown-group cases, display/copy parity, source controls, unsafe HTML/URLs/images, math errors and streaming prefixes.
- `npm run check:study-chat`: 55 passed.
- `npm run check:chat`: 25 passed plus the evidence coverage check.
- `npm run check:ui`: 33 passed. `node --test scripts/check-study-chat-images.mjs`: 3 passed after removing assertions tied to the retired floating menu and inline renderer. The initial failure referenced an unchanged widget file; image isolation and text-only API checks remain covered.
- TypeScript and scoped ESLint passed; `git diff --check` passed.
- Final clean `npm run build` passed. An incremental build initially emitted the old 96px column CSS despite the changed source; moving generated `.next` output to `/tmp/kinesis-format-next-stale-20261106` and rebuilding produced the correct 144px rule. The running preview was restarted with this output.
- React Doctor: no issues reported in changed React files (reported project score 82/100).
- `npm audit --omit=dev`: zero production advisories. KaTeX is unified at 0.19.1 with an npm override, avoiding vulnerable transitive 0.16.x copies and ensuring renderer/CSS versions agree. This does not claim that the existing development dependency audit is clean.

Live browser verification used two actual streamed responses from Gemini 3.8 Flash: one with inline/block formulas and one with a cited comparison table. This verifies formatting and interaction, not medical correctness. The second model was not separately exercised in this formatting pass.

At 390px, the four-column table has a 576px scroll width inside a 337px region; the document stays 390px wide. Arrow-key scrolling worked. Table copy produced TSV with displayed source numbers and nonduplicated math. Enter on a citation opened the disclosure and focused the correct numbered source; source targets were unique. These actions also worked after reloading the saved conversation. Browser error log was empty. Desktop table copying/source clicking was exercised before the final CSS-only column-width adjustment; the final width was checked on mobile and in emitted build CSS. Touch gestures and a physical device were not tested.

Screenshot: `.data/artifacts/study-answer-format-mobile.jpg`. The browser viewport override was reset and the preview remains at `http://127.0.0.1:3200/knowledge`.

## Remaining design findings

`npm run design:check` still reports the existing 3px blockquote border finding and 25 advisories elsewhere in the design system. The `/knowledge` page scan at 390×844 reports one contrast finding (3.5:1) and one short-last-line advisory. The independent page scanner does not reproduce the authenticated open drawer state; drawer behavior and layout were inspected in the live browser instead. These detector findings remain unresolved by this scoped formatting change.

Logs: `/tmp/kinesis-format-{build,study,chat,design,page-check,react-doctor}.log`.

## Library references

- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Remark math](https://github.com/remarkjs/remark-math)
- [KaTeX options](https://katex.org/docs/options.html)
- [Remend](https://github.com/vercel/streamdown/tree/main/packages/remend)
- [KaTeX advisory and patched versions](https://github.com/advisories/GHSA-238p-pmpm-9mq7)

No new anatomical or clinical content was added to the knowledge catalog. Source comparison and rendering tests do not constitute clinical validation.
