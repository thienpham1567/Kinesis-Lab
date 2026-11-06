# Streamdown migration implementation plan

**Goal:** Trial and adopt Streamdown after checking equivalent behavior and measured rendering work.

**Architecture:** Keep MarkdownAnswer as the product wrapper; replace its Markdown renderer with Streamdown. Share the citation AST walker with clipboard formatting and apply it per Streamdown block against globally assigned reference numbers.

1. Preserve the current renderer under `.data/artifacts/streamdown-review/` for an exact comparison. Inspect the installed Streamdown API/source, particularly block memoization, plugin merging and sanitization.
2. Add regression fixtures for multi-block reference order, omitted contexts, late metadata, reference definitions and actual Streamdown use. Observe failures before changing production code.
3. Extract the reusable citation tree transform from `answer-markdown.ts`. Integrate Streamdown with stable components/plugins, bounded math, disabled raw HTML/images and the existing table/source controls. Configure only required Tailwind styles.
4. Build a local, synthetic benchmark harness using the preserved old renderer and new renderer. Measure React rendering work across identical streaming prefixes with multiple alternating runs at desktop/mobile viewport sizes. The harness is an artifact, not an application route.
5. Run Markdown/study/UI checks, TypeScript, scoped lint, build, React Doctor and source/render design scans. Exercise a real answer, source navigation, table copying and narrow layouts. Save screenshot proof and a review with measured results and limitations.

Execution continues inline on the existing feature branch, preserving prior approved uncommitted formatting work. No further permission is needed for this approved trial.
