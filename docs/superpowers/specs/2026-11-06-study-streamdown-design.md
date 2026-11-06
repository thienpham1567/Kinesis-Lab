# Study Streamdown migration

Approved in chat: trial Streamdown for the answer renderer, preserve source behavior and compare it with the current implementation before adopting it.

Replace the rendering engine inside MarkdownAnswer, shared by the study drawer and general chat. Preserve MarkdownTable, keyboard source navigation, clipboard behavior, local math assets, themes and inert model-controlled images/raw HTML. No model, retrieval, medical-content or storage changes.

Streamdown must receive actual Markdown blocks, not the entire prepared answer tree injected into each block. Prepare global source numbering with the shared AST logic, then apply an eligible-prose citation transformer independently to each rendered block. Existing numbering must stay stable across blocks, streaming and reload. Late metadata or reference definitions must invalidate stale blocks when needed. Avoid resetting all completed blocks merely because new tokens arrive.

Retain bounded untrusted math rendering and safe links; no Mermaid/code-highlighting plugins are needed for this migration. Enable streaming parsing only for in-flight answers and disable answer-body navigation/table copying until complete. Completed content must retain original Markdown semantics.

Acceptance: existing regression tests plus multi-block citations, late metadata, footnotes/reference links and renderer identity. Compare the old and new renderer on the same synthetic long answer in a local browser harness, including a mobile viewport. Record measurements as synthetic test results, never as real-device performance claims. Adopt only after correctness and browser checks pass. Keep API and source-quality behavior unchanged.
