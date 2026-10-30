# Kinesis Lab Impeccable refinement implementation plan

**Goal:** Improve five existing workspaces equally across learning and consultation using the upstream playbooks, while preserving product identity and evidence.

**Architecture:** Keep existing routes, state owners and semantic CSS tokens. Use native disclosure and controls. Add only reading-position logic that can be tested separately. No new dependency or backend behavior.

**Tech Stack:** Installed Next 16.4.1 documentation, React 19, Tailwind/CSS, node:test hook fixtures.

- [x] Record command applicability and independent UX/technical findings before editing UI.
- [x] Extend actual handler regression tests: consultation starters fill/focus without a request and preserve drafts; closing a client form preserves input and returns focus; reading-position calculations use the visible nested scroller and select the current heading.
- [x] Refine shared CSS: 44px principal controls, 16px mobile text entry, preserve existing palettes and keyboard outlines. Atlas gets collapsed advanced settings and direct model navigation, without renderer changes.
- [x] Refine consultation and clients in their current components; no new writes during verification.
- [x] Refine movement reading navigation, measure and position wording. Keep claim-level links and source dates unchanged.
- [x] Refine NCSF signed-out orientation/loading and pending form semantics; preserve private routes and mounted quiz state.
- [x] Run focused regressions plus `npm run check:ui`, TypeScript, ESLint, production build, source detector and rendered detector for five routes at desktop/mobile. Inspect actual UI, keyboard, focus and 13 theme selections.
- [x] Review diff and record remaining findings, checks and hardware/browser coverage limits. Deliver the applicability document and concrete implemented results.

No deployment, push, authentication changes, real profile mutations, AI requests or source-content changes are part of this plan. Work is implemented in the current clean checkout so it remains directly reviewable by the user.
