# Clinical Workspace UI Implementation Plan

> **For agentic workers:** Execute the approved design task by task. Use focused implementation and independent code review for the final diff.

**Goal:** Apply Clinical Field Notes consistently across consultation, Atlas, client records and the evidence library.

**Architecture:** Keep existing Next.js server/client boundaries and API contracts. Add a small shared UI vocabulary (icons, page headings, empty states) and semantic CSS classes; compose them into existing screens. Preserve clinical atlases and safety logic.

**Tech Stack:** Next.js 16.4.1, React 19.3, TypeScript, Tailwind 4.

- [x] Create shared UI primitives and design tokens in `src/components/WorkspaceUI.tsx` and `src/app/globals.css`; use semantic controls and visible focus.
- [x] Update `AppShell.tsx`, `app/page.tsx` and `ChatPanel.tsx`: recognizable navigation, explicit connections, client context, sample prompts and composer hierarchy.
- [x] Update `app/clients/page.tsx` and `app/knowledge/page.tsx`: consistent headings/forms, searchable clients, loading/empty/error feedback and keyboard-accessible file upload.
- [x] Align `app/atlas/page.tsx`, atlas controls and `app/clients/[id]/page.tsx` with the shared workspace; ensure tab/selection state is announced.
- [x] Run `npm run lint`, `npm run build`, `npm run check:safety`, and React Doctor. Inspect desktop and 390px route layouts plus key interactions; review the diff and fix regressions.

No implementation-mirroring test suite is added for this visual change. Verification exercises existing safety checks and real browser workflows. Credentials are not added or modified.

Verification evidence: `docs/superpowers/specs/2026-10-16-clinical-workspace-ui-verification.md`.
