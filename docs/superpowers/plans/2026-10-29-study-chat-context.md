# Contextual floating study chat implementation plan

User-approved scope: reader-controlled scrolling, response copy, contextual research questions, selected Atlas structure context, trusted application actions, and persistent searchable knowledge.

Architecture: retain the existing Kinesis sheet/cobalt visual language and floating panel. Publish Atlas selection through a small client external store. Send only the stable structure ID to the server; resolve names and evidence there. Floating study chat uses curated reputable-source records plus PubMed metadata/abstracts, bypassing curriculum RAG. Never fabricate multiple-source coverage when retrieval fails. Preserve source metadata with saved responses. Store a bounded personal library and conversation history in browser localStorage with explicit location/error feedback.

- [x] Add failing tests for server-owned context, curriculum exclusion, bounded trusted app actions and source-aware prompt. Implement server context/retrieval/meta events and run route regressions.
- [x] Add failing tests for scroll decisions, validated persistent library/history, Vietnamese search and source/action round trips. Implement pure helpers and a live Atlas-selection store.
- [x] Add widget source cards, context chip and research question suggestions. Add copy/save actions, searchable saved/history view and conversation restore. Bind autoscroll only while near bottom; expose new-content button otherwise.
- [x] Browser verification: real Atlas selection updates chip; contextual send supplies reputable-source metadata; copy/save/search/restore/action works; scrolling up stays stable during stream; keyboard and 390px layout remain usable.
- [x] Run targeted tests, existing chat regressions, ESLint, TypeScript, React Doctor and production build. Review final diff and record observed limits.

Files: src/components/StudyChatWidget.tsx; new focused components under src/components/study-chat/; src/components/atlas3d/Atlas3DExplorer.tsx; src/lib/chat/study-context.ts, study-library.ts, study-scroll.ts and study-types.ts; src/lib/chat/study-context-server.ts; src/app/api/chat/route.ts; src/lib/ai/prompts/clinical-pt-system.ts; scripts/check-study-chat*.mjs.

Acceptance: no token-driven scroll while user reads above; copy feedback; selected name and side reflect Atlas, including deselection/unmount; suggestions ask source-comparison questions rather than teaching unsupported facts; links resolve real catalog/group IDs; saved answers retain question, source scopes, date and context after reload; search covers Vietnamese with/without diacritics; failures do not silently report saved or sourced success.
