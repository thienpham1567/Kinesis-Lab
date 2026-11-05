# Floating study chat: source retrieval and answer reliability

Date: 2026-11-05. Status: approved by user on 2026-11-05; baseline live evaluation completed (12 requests).

## Goal
Improve the existing floating chat on `/knowledge` for Vietnamese PT learners. Keep the two configured choices, Gemini 2.5 Flash and Gemini 3.8 Flash, the Clinical Field Notes UI, browser history and medical evidence policy. Evaluate real responses rather than infer factual quality from unit tests.

## Observed problem
Baseline WHO question: both models received no PubMed results and unrelated curated records despite the registered licensed full-text corpus containing the WHO 2020 guideline summary. Gemini 2.5 incorrectly denied that WHO 2020 has general adult activity guidance; Gemini 3.8 correctly disclosed missing context but could not answer. Current study mode explicitly skips all full-text retrieval. Existing tests pass while preserving this limitation. The historical model evaluation uses obsolete models and source snapshots.

## Alternatives
1. Recommended: repair retrieval and citation transparency, retain both models, compare before/after with the same synthetic cases.
2. Prompt-only changes: small scope but cannot supply absent relevant evidence.
3. Replace a model now: changes cost/latency without resolving the demonstrated missing-source cause.

## Design
- Allow study chat to retrieve from the existing registered, licensed reputable-source corpus. This corpus has three registered research/guideline articles, not the private NCSF textbook or exam bank. Preserve the existing namespace, completeness and source registration checks. Never claim that arbitrary private curriculum was searched.
- Extract bounded server-owned literature topics from Vietnamese/English questions. Add basic activity guidance and EMG interpretation coverage; recognize Vietnamese diabetes terminology. Resolve explicit new topics before local topic history. Raw questions/history, profiles and private textbook passages never go to PubMed. Atlas names remain server-resolved with existing muscle-name relevance filtering.
- Preserve enough abstract text to include conclusions, label reading scope and truncation honestly, retain publication types when available and exclude identified retracted papers/notices. Article type is context, not a universal medical-quality score. Failure of a source service remains visible and does not become invented evidence.
- Centralize citation identity checking across APP, PMID, RAG and supplied URLs. Resolve only actual supplied identifiers and source indices. Show a specific warning for invented references, and clearly separate a missing source from a claim that no evidence exists. Citation identity checks do not establish whether a source entails a generated claim.
- Explain supported educational knowledge clearly: main answer, short explanation or example, relevant source adjacent to the claim. Distinguish lack of retrieved evidence from absence of evidence in medicine. Keep safety referrals, medication limits and source-only mesh limits.
- Keep source provenance in streamed metadata, source links, copy and browser persistence. Sources are supplied context, not proof that every generated claim is supported. Preserve actual access dates and null reviewer metadata.

## Verification
- Baseline and post-change live requests to both model choices: WHO activity, EMG versus hypertrophy, metformin versus insulin, explicit anatomy topic switch, fabricated references, acute warning symptoms. Use synthetic questions, no client IDs, no patient data or database consultation writes.
- Regressions for Vietnamese topic selection/privacy, study full-text inclusion, citation identity including invalid APP indices, source-service failures, abstract conclusion retention/truncation and identified retraction exclusion.
- Existing study/chat checks, TypeScript, targeted lint, production build, React Doctor when React changes, design detector and rendered `/knowledge` scan when available.
- Inspect floating chat source disclosure and model selection in a real browser. Report model/service errors and unresolved findings honestly. No deployment in this scope.

## Acceptance limits
Finite source comparison is the acceptance criterion. No expert signoff gate. Neither prompt changes, citation audits nor finite live cases guarantee every future response or provide clinical validation. Keep original evaluation artifacts locally and record source-backed manual review outcomes and measured latency.

## Implemented refinements

Independent code review found and verified fixes for alternate APP source-number syntax and explicit two-muscle topic switching. Study-only RAG aliases are exact, collision-checked mappings to retained chunk IDs; they reduce UUID transcription length without fuzzy source repair. Focused free questions keep at most two supporting curated records. Final outcomes and remaining wording/entailment limits are recorded in `docs/research/2026-11-05-study-chat-review.md`.
