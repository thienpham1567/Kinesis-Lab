# NCSF Quiz Revision Implementation Plan

> **For agentic workers:** Use the established audit and isolated chapter ownership for parallel content work; parent integrates and reviews. User has authorized execution.

**Goal:** Correct the audited quiz, fill missing chapter-level practice and support real private figure questions without claiming complete clinical validation.

**Architecture:** Keep original private PDFs and stable question positions. Extend the existing quiz format with source/correction/pattern metadata and gated figure stimuli. Separate objective reference counts from semantic coverage notes.

**Tech Stack:** Next.js 16.4.1, React 19, TypeScript, Node test runner, private Supabase storage, local ignored JSON/PDF corpus.

- [x] Back up quiz, coverage map and objective inventories into private revision folder; verify current source hashes before editing.
- [x] Add failing runtime tests for schema, safe references and bounded figure keys. Implement policy helper and authenticated figure route; extend quiz UI with figures, source links and corrections after submission.
- [x] Chapters 1–3: resolve every flagged authored item, append missing core/application/visual questions and write per-objective status notes with sourced limitations. Own only ch1–3 JSON/status files and chapter change log.
- [x] Chapters 4–6: resolve every flagged authored item, append missing core/protocol/label/visual questions and objective notes. Own only ch4–6 JSON/status files and chapter change log.
- [x] Chapters 7–8: resolve every flagged authored item, append missing program/clinical-scope/visual questions and objective notes. Own only ch7–8 JSON/status files and chapter change log.
- [x] Update quiz checker and coverage generator: support references/figures and semantic notes; preserve quote checks and report errors without interpreting reference existence as mastery.
- [x] Render referenced figure pages into private assets. Validate every asset/path, source metadata, answer and coverage reference. Review all revised/new questions against audit and source scope.
- [x] Run focused tests, full data checks, TypeScript/build/lint, React Doctor; inspect browser figure/scoring/retry on desktop/mobile and logged-out asset denial.
- [x] Prepare a validated private release candidate with file hashes and preserve originals. Uploader supports rollback backup and downloaded hash verification.
- [ ] Publish paired code + private bank/figures to production. Deferred: this request was implemented and verified locally; the production app still needs the matching UI/API, so uploading only the bank would create questions without figures. No upload/deploy has been executed.
- [x] Write final revision report with before/after counts, changed items, residual source gaps and actual verification/publication status.
