# Streamdown migration review

Adopted Streamdown 2.7.1 for the shared answer renderer after the approved trial. Study chat and the general chat retain the existing product wrapper, source disclosure, TSV table copy, theme typography and bounded local math rendering. The study answer loads its renderer through `next/dynamic`. React Markdown remains a development dependency for the comparison fixture only; application source no longer imports it.

## Integration and correctness

Streamdown receives real Markdown blocks. A shared AST traversal assigns source numbers for the full answer; the per-block remark plugin is seeded with that plan. Stable component/plugin identities preserve completed blocks between ordinary token updates. A changed source plan invalidates the renderer, including late metadata or a newly resolved reference link. Tests verify that blocks do not duplicate the entire answer and citations retain global order.

Kept explicit URL filtering because Streamdown's URL transform differs from the previous renderer. Untrusted raw HTML and model-controlled images remain inert. Math rendering still uses `trust: false`, bounded expansion/size and KaTeX 0.19.1 with the existing override. Optional Mermaid and code-highlighting plugins were not enabled. Native semantic elements preserve existing typography and code behavior instead of adopting the library's default appearance.

## Measured comparison

Local browser fixture: 6,721 synthetic characters, 18 sections with repeated citations, lists, formulas and tables. Each renderer received the same 71 growing prefixes followed by completion. One warmup per renderer and three alternating measured runs at each viewport. Totals below are average React Profiler render time, including completion, in a development build on this computer.

| Viewport | Previous renderer | Streamdown | Reduction |
| --- | ---: | ---: | ---: |
| 1280px | 706.4ms | 304.1ms | 57.0% |
| 390px | 686.3ms | 293.1ms | 57.3% |

This measures React rendering work, not API/model latency, page-load duration, a physical phone or production user experience. The comparison preserves the old renderer component and uses the same current citation helper for both. A repeated-source workload favors block reuse; answers that continually introduce new sources may invalidate more blocks. No universal 57% speed claim is warranted.

The isolated minified renderer bundle grows from 142,773 to 252,025 gzip bytes (React externalized; includes async code in a single bundle). The first eager migration increased the JavaScript referenced by the `/knowledge` HTML from 351,045 to 455,165 gzip bytes. Splitting the study renderer reduced those initial HTML-referenced scripts to 251,876 gzip bytes; the renderer is still downloaded separately when rendered. This is a build artifact comparison, not a measured network waterfall or a reduction in total feature code.

Reproduce the synthetic comparison with `node scripts/bench-study-markdown.mjs`, then open its printed localhost URL and run both viewport sizes. It requires the preserved baseline at `.data/artifacts/streamdown-review/MarkdownAnswer.baseline.tsx`. Results, bundle sizes, route script sizes and component hashes are saved under `.data/artifacts/streamdown-review/`; `summary.json` records the measurement method.

## Verification

- `npm run check:markdown`: passed; existing security/math/copy fixtures plus Streamdown block, reference-definition, footnote and code cases.
- `npm run check:study-chat`: 55 passed.
- `npm run check:chat`: 25 passed and evidence coverage passed.
- `npm run check:ui`: 33 passed.
- `node --test scripts/check-study-chat-images.mjs`: 3 passed.
- TypeScript, scoped ESLint, clean production build and `git diff --check` passed.
- React Doctor reported no issues in the changed React files (project score 82/100).
- Production dependency audit reported zero advisories; this does not assert the existing development audit is clean.

Browser lifecycle checks passed: adding source metadata after unchanged text creates the citation control; changing a source label updates the source entry; appending a new paragraph preserves the DOM node of the completed first paragraph. A real streamed Gemini 3.8 Flash answer rendered its cited table and formulas through Streamdown. After the final lazy-loading build, restoring saved messages briefly displayed the loading state and then rendered all three saved answers through Streamdown. Table copy produced TSV with displayed source numbers. Enter on a citation opened and focused the correct source. At 390px the three-column table has a 432px scroll width in a 337px region; document width remains 390px. Table-region keyboard focus worked. Browser error logs were empty. Touch gestures, screen-reader operation and physical mobile devices were not tested.

Screenshot: `.data/artifacts/streamdown-review/mobile-drawer.jpg`. The benchmark tab/server was closed, the browser viewport override was reset, and the app preview remains on port 3200.

## Remaining design findings

The source detector still reports the existing 3px blockquote-border finding and 25 design-system advisories. The `/knowledge` scan at 390×844 reports one existing contrast finding and one short-last-line advisory. This independent scan does not reproduce the authenticated open drawer; the drawer was inspected in the live browser. These findings remain outside this renderer migration.

Logs use `/tmp/kinesis-streamdown-*.log`. The generated pre-migration and eager-build `.next` outputs were retained in `/tmp` for the comparison; source files were not removed.

## References

- [Streamdown migration](https://streamdown.ai/docs/migrate)
- [Streamdown memoization](https://streamdown.ai/docs/memoization)
- [Streamdown configuration](https://streamdown.ai/docs/configuration)

No knowledge-catalog or medical-evidence claims changed. Rendering, source-link behavior and performance checks do not constitute clinical validation.
