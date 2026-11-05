# Study chat evidence implementation plan

Goal: repair the demonstrated missing-source and irrelevant-query failures while preserving model choice and source privacy.
Architecture: reuse the allowlisted full-text corpus, isolate fixed public-topic selection, and centralize source identity auditing. Extend existing source metadata rather than add a parallel retrieval stack.
Tech stack: Next.js 16.4 route handlers, TypeScript, React 19, Node test runner.
Execution: inline in the current workspace on `codex/study-chat-evidence`; baseline 45 tests and evidence coverage pass. User approved design and implementation.

- [x] Add failing route regressions: study mode includes registered full-text results and source metadata; WHO/EMG/diabetes queries are specific fixed vocabulary; invalid APP/PMID/RAG citations warn. Keep existing privacy, Atlas and failure tests.
- [x] Add failing PubMed regressions: preserve labeled conclusion after 1,200 characters; disclose a bounded abstract; exclude identified retractions and retain publication types.
- [x] Repair route retrieval, source metadata, fixed-topic selection and source-only prompt instructions. Keep existing registered-corpus checks and current-question privacy boundaries.
- [x] Implement source identity audit and readable RAG/PMID citations with browser persistence and clipboard references. No claim-level entailment certification.
- [x] Run targeted regressions, both existing chat suites, storage/markdown tests, TypeScript and lint. Repair real failures, preserve unrelated behavior.
- [x] Repeat the six synthetic live questions against both real model choices. Compare full outputs with supplied sources and reputable references; record errors and latency, not an invented medical-quality score.
- [x] Verify real `/knowledge` chat model selection, streamed reply, source links and narrow layout when available. Run design checks, React Doctor and production build. Record unresolved findings and no deployment.
