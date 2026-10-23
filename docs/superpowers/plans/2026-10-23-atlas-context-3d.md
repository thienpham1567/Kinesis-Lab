# Atlas contextual 3D implementation plan

> **For agentic workers:** Execute in the attached worktree, with test-first pure adapters, focused integration, independent spec/code review, and final browser verification.

**Goal:** Reuse the anatomy tab's real 3D renderer across the three other Atlas tabs, synchronized with each tab's educational selection.

**Architecture:** A pure contextual data adapter selects real source structures and complete bundles. A compact shared React controller mounts the existing Atlas3DCanvas. Existing tab controllers supply selected topics and receive supported mesh-selection callbacks.

**Tech Stack:** Next 16.4.1, React 19, TypeScript, Three.js, existing source GLB bundles; native Node test runner.

## Task 1 — Catalog adapter and regression tests

Files: create `src/lib/clinical/contextual-anatomy.ts`, `scripts/check-contextual-anatomy.mjs`.

- [ ] Write executable tests against the actual manifest for ten exact trigger memberships, all training groups, eight regions, bilateral filters, minimum complete bundle and unsupported IDs. Example: `assert.equal(triggerForStructure(infraspinatus), 'infraspinatus')`; assert both infraspinatus and teres minor appear in that teaching entry, and lower-limb components cannot select an upper bundle.
- [ ] Run `node --test scripts/check-contextual-anatomy.mjs` and observe the missing-module failure before implementation.
- [ ] Implement explicit source-name membership, region/group adapters, reverse lookup and side filter. Bundle choice is the minimum-byte bundle containing every requested structure; unknown topics yield no matches.
- [ ] Run adapter and existing training/trigger checks; inspect all memberships and commit.

## Task 2 — Shared contextual viewer

Files: create `src/components/atlas3d/ContextualAnatomyViewer.tsx`; reuse `Atlas3DCanvas.tsx`, `types.ts`, `training/observation-state.ts`.

- [ ] Implement `ContextualAnatomyViewer({ context, title, onNavigate })`, with `context: {kind:'trigger'|'training'|'region'; id:string}` and callback `(id:string)=>void` for supported topics only.
- [ ] Fetch manifest abortably; provide loading/error/retry states. Keep topic-specific title and provenance/limits visible.
- [ ] Use minimum complete bundle, related structures by default, optional surrounding anatomy, bone toggle, side filter, native structure picker, camera presets, focus/isolate/reset and optional broader Atlas link. State resets on context change; hidden selections and isolation clear using tested reconciliation.
- [ ] Mount the exact existing Canvas with measurement/material-study features disabled, bounded responsive height and no invented overlays. Verify lint/typecheck before integration.

## Task 3 — Three tab integrations

Files: modify `TrainingAtlasExplorer.tsx`, `TriggerPointExplorer.tsx`, `BodyMapExplorer.tsx`, `app/atlas/page.tsx`.

- [ ] Add training-group viewer before MuscleStudyCard; retain exercise/curl viewers and navigation.
- [ ] Replace trigger muscle illustration position with shared viewer and source-plate disclosure. Symptom lookup uses neutral region mapping from selected site and keeps its locator; do not turn mesh selection into diagnosis.
- [ ] Add opt-in `showAnatomy3D` to BodyMapExplorer only from Atlas, default 3D mode with existing 2D view available. Keep region controls and existing clinical/client knowledge, and allow only valid catalog region callbacks.
- [ ] Run trigger SSR/evidence, new adapter, training observation and Atlas regressions. Have an independent reviewer first assess spec coverage, then code quality; resolve actionable findings.

## Task 4 — Verify and deliver

- [ ] Run production build, lint and relevant regressions. Inspect modified Next APIs against bundled docs before using them.
- [ ] Start isolated preview. Verify all three tabs with loaded WebGL; muscle/region changes, supported selection callbacks, side/layer/isolation reset, keyboard and 390px/1440px width. Check original anatomy tab.
- [ ] Record screenshot evidence and verification limits in `docs/superpowers/reviews/2026-10-23-atlas-context-3d.md`; commit implementation; deliver local preview and branch. Do not deploy or merge this new feature without a new instruction.
