# Client Training Programs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a persistent, editable training-program and workout workflow in the client workspace, with an explicit AI draft path and preserved in-session drafts.

**Architecture:** Add validated program/workout domain records and server storage that follows local/Supabase selection. Keep immutable plan revisions and atomic activation; use idempotent workout saves. Isolate planner, workout execution, overview and clinical navigation components rather than growing the large client detail page.

**Tech Stack:** Installed Next 16.4.1 App Router, React 19, TypeScript, Supabase/Postgres, existing local JSON store and OpenRouter adapter; Node test runner with TypeScript module hooks/component-handler harnesses.

## Task 1 — domain, durable storage and AI proposal
Files: create `src/lib/training/{program,repository,proposal}.ts`, `src/app/api/training-plans/route.ts`, `src/app/api/training-plans/propose/route.ts`, `src/app/api/training-workouts/route.ts`, `supabase/migrations/004_training_programs.sql`, `scripts/check-training-programs.mjs`; modify `src/lib/local-store.ts`, client DELETE cascade and bounded chat training context.

- [ ] Write tests exercising real validation and temporary local storage: malformed enums/numbers/dates, orphan superset groups, custom versus known exercise identity, immutable revisions, one-active-plan semantics, unknown/cross-client access, idempotent workout saves, completion validation. Run tests and observe expected missing-feature failure.
- [ ] Implement exported `TrainingPlanInput`, `TrainingPlan`, `TrainingWorkout`, labels and initial editable defaults; strict validation (unknown objects, lengths, finite numbers, identifiers, unique days/session/exercise IDs). Numeric storage limits are not safe-dose recommendations.
- [ ] Implement local/Supabase repository CRUD with no silent partial-configuration or missing-table fallback. POST plan creates immutable draft; PATCH activates/archives existing plan. Add transaction RPC/unique active constraint and RLS, service-role-only execution. Add workout GET/PUT with stable record ID, client-scoped ownership and validated plan snapshot; complete only accounted sets. Local reads preserve old-store compatibility and rejects malformed new arrays.
- [ ] Implement generation POST with explicit missing-key error, bounded intake/history, existing evidence with truthful metadata, JSON-only output validated before returning `{plan, ...sourceContext}`. No automatic persistence/activation, no raw upstream errors. Mock provider in tests including malformed outputs and preserved manual path.
- [ ] Supply bounded recent completed workout/legacy log summary to clinical chat. Add checks for actual context inclusion and no public-literature query of client data. Run domain/route and existing chat tests, TypeScript, then commit.

## Task 2 — program editor, workout execution and overview
Files: create `src/components/training/{ClientTrainingWorkspace,ProgramEditor,WorkoutRunner,ClientTrainingOverview}.tsx` and small focused helpers as needed; `scripts/check-training-program-ui.mjs`.

- [ ] Add failing behavior checks for failed save preserving draft, AI failure preserving manually edited plan, client-switch isolation, completed workout requirements and start/save/reopen flows.
- [ ] Implement data loading with abort/error/retry, parent-scoped selected revision/draft/workout state, empty/loading/error feedback and no optimistic false save. Use repository public types and existing `.panel`, `.field`, button and focus conventions. No new CSS system.
- [ ] Build goal/schedule intake and session editor with exercise variant names, set/reps/rest/load/RIR/method/group/progression, custom entry and Atlas links; each repeated input has a unique visible label. Add/remove/edit sessions/exercises without resetting other input. Show source-context limits for AI drafts. Explicit save-new-revision/activate and clear unsaved feedback.
- [ ] Build actual workout entry from a selected saved session and date, individual sets, previous comparable results, plan snapshot, session RPE, feedback, in-progress/completed save, reopen existing history with stable ID. Keep incomplete draft on failure, prevent duplicate submission.
- [ ] Build overview with goal, active-plan/empty state, next scheduled session and real completed-workout counts/history. Deep links/actions select program or session without discarding drafts. Commit after tests/type/lint.

## Task 3 — client navigation, continuity and verification
Files: modify `src/app/clients/[id]/page.tsx`, `src/components/ChatPanel.tsx`, small scoped global styles if necessary, `package.json` scripts, README/design/review docs; extend `scripts/check-client-workflows.mjs` or focused continuity tests.

- [ ] Add failing regression for training/profile/chat drafts across tab changes. Preserve existing direct query links and clinical tool behavior.
- [ ] Integrate Overview default and clear primary destinations; move the existing medical tools into secondary navigation, retain safety notes and legacy log deep links. Mount visited editing panels once per client, stable keys; update externally requested chat drafts without clearing messages. Keep goals visible and remove redundant eyebrow. Preserve URL tab navigation/back behavior and focus semantics.
- [ ] Run `node --test scripts/check-training-programs.mjs scripts/check-training-program-ui.mjs scripts/check-client-workflows.mjs scripts/check-client-status.mjs`, affected chat/log tests, `npx tsc --noEmit`, targeted ESLint, and `npx -y react-doctor@latest . --verbose --diff`.
- [ ] Run `npm run design:check`; inspect findings in context. Start a synthetic-only isolated local fixture app, CUA inspect overview/program/workout/clinical tab retention at desktop/mobile, run `npm run design:check:page -- <url>` for affected views, verify no horizontal overflow, useful loading/errors and keyboard labels. Do not run real AI/client mutations.
- [ ] Obtain independent spec then quality review, fix important issues and rerun affected checks. Record migration requirements, evidence/simulation/validation limits, test results and unresolved detector findings. Stop fixtures and clean temporary data.
- [ ] Integrate commits into the user's source workspace without dropping untracked review artifacts. Report delivered behavior, checks and any actual deployment dependency.
