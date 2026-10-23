# Atlas Learning Studio Implementation Plan

> Execute in this session using the subagent-driven-development workflow where responsibilities are independent. The user explicitly asked for a plan followed by implementation; the preceding hip-region proposal is accepted. Do not add a second approval gate.

**Goal:** Deliver a working hip-region Atlas learning studio inspired by the reference site's large interactive model, readable callouts and guided lessons.

**Architecture:** Keep Next/React, Three r186, existing GLB bundles and evidence records. Add optional teaching props to the shared canvas so existing training viewers retain their current defaults. The hip workspace gets a large stage, a compact tool row, collapsible tabbed inspector and source-linked authored viewing steps. Geometry and evidence identities stay unchanged.

**Tech stack:** Installed Next16.4 client-component boundaries and Three addons, React19, existing cobalt/neutral CSS variables and Vietnamese fonts. No new packages or paid image generation. Create branch codex/atlas-learning-studio in the current clean checkout so the running localhost project shows changes.

## Design

- Direction: editorial anatomy classroom. Stage and a small numbered learning rail form the anchor; cobalt denotes selection and progress. Use existing fonts/colors, avoid borrowing the reference's branding or source code.
- Hip starts in teaching view with a prominent model, visible toggle back to existing exploration, optional orthographic/perspective projection and selection outline. Other regions keep the existing explorer controls and can be selected normally.
- Use a compact inspector with four tabs: Overview, Structures, Knowledge, Sources. Existing per-structure evidence, source scope, detailed thickness limits, share and assistant actions stay reachable. On small screens stack the inspector below the stage; no fixed overlay or hidden essential controls.
- Guided steps change existing visibility groups/camera only: regional overview, bones, muscles, selected source example, self-check. They do not claim a validated superficial/deep segmentation, exact insertion positions or muscle activation. Show existing source-supported hip foundation text with its existing citation mapping.
- Callouts label whole source structures and hide when offscreen/occluded. Camera-facing mesh hits are display anchors, never origin/insertion landmarks. No invented medical facts, approvals or per-mesh clinical verification.
- Camera transitions are cancellable on user input, respect reduced motion, dispose on unmount and do not run a perpetual loop while idle. Outline is selective and bounded in fast/mobile mode.

## Task 1 — Rendering (delegate with exclusive file ownership)

Files: types.ts, atlas-stage.ts, studio-renderer.ts, surface-label-layout.mjs, surface-labels.mjs; create camera helper/callout modules under src/components/atlas3d/ as needed.

- [x] Add optional props `projection?: "perspective" | "orthographic"`, `learningMode?: boolean`, `showStructureLabels?: boolean` to AtlasCanvasProps. Missing props preserve all existing callers.
- [x] Support perspective/orthographic cameras with a matching field of view on switching, correct resize/zoom/picking/label projection, shared OrbitControls and updated postprocessing camera references. Teaching mode may add a subtle selection-only outline using installed Three addons.
- [x] Animate focus/view commands with a short easing transition; cancel RAF on wheel/pointer/dispose and bypass for reduced motion. Preserve initial fit, framing and source geometry.
- [x] Add named structure callouts in teaching mode, using source labels and real visible mesh hits; suppress occluded/offscreen labels and overlap. Retain gluteus-medius material-region labels and their existing caveats.

## Task 2 — Hip learning state and stage UI (primary agent)

Files: Atlas3DExplorer.tsx; create hip-learning.ts and HipLearningRail.tsx; app globals only for narrowly scoped stage styling if needed.

- [x] Define five authored viewing steps with existing layer flags, camera command and optional supported source-example ID. Select source IDs only when present in the hip manifest; offer normal exploration at any time.
- [x] Introduce teaching mode only for area=hip, orthographic default in that mode, callout toggle and compact stage controls. Existing controls move into a disclosure in teaching mode; model remains prominent instead of pushed below settings.
- [x] Provide a clear entry from the normal full-body view to hip lessons, stage heading and selected-structure context, previous/next/direct step actions, deterministic visibility reset per step and honest source-mesh wording.

## Task 3 — Compact inspector and sourced reading (primary agent)

Files: new AtlasLearningInspector.tsx / HipLearningOverview.tsx as appropriate; Atlas3DExplorer.tsx integration. Reuse ClinicalEvidencePanel, AnatomyEvidenceCard, MuscleStudyCard and source records rather than duplicating anatomical claims.

- [x] Compose Overview / Structures / Knowledge / Sources panes from existing search, selection and evidence UI. Retain search keyboard access, isolate/hide, links, thickness limits, empty states and source attribution.
- [x] Overview reuses REGION_FOUNDATIONS.hip_pelvis with ANATOMY_REGION_EVIDENCE.hip_pelvis source indices. Existing dates and reading scopes remain truthful. Any new instructional text describes UI operations only.
- [x] Add a simple self-check about layer visibility versus source comparison, with answer revealed on explicit action; no clinical diagnosis or treatment advice.

## Task 4 — Review and delivery

- [x] Inspect spec compliance and rendering lifecycle, then code quality; use a separate review agent per the execution skill once implementation is ready.
- [x] Run static TypeScript, focused ESLint, production build and React Doctor. Do not add or run automated test suites under the session's developer constraint unless requested. Inspect actual browser interaction and save screenshots of the stage/inspector at desktop and narrow width when available.
- [x] Review loading/error paths, switching region/mode/projection/steps/selection, keyboard reachability, reduced-motion code path and disposal. Report observations separately from unverified medical or performance claims.
- [x] Record actual work/limits in a review document. Leave the implementation uncommitted; the preceding commit/merge instruction was completed for the previous feature, not a standing request to auto-merge new work.

## Execution record

Implemented and inspected on 2026-10-23. The separate spec-review agent was requested but could not run due account usage limits; the primary agent performed the review. Browser checks and source inspection have different coverage; see [implementation review](../reviews/2026-10-23-atlas-learning-studio.md) for actual results and limits. No automated tests, commit, merge or deployment were performed.
