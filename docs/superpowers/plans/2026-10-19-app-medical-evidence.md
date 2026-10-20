# App-wide Medical Evidence Implementation Plan

**Goal:** Research and apply traceable medical evidence across every existing clinical content domain and AI workflow.
**Architecture:** Independent domain data revisions/evidence modules, shared evidence presentation and catalog coverage audit, scoped AI context. Keep expert review status separate from literature checks.
**Tech Stack:** Next16/React19/TypeScript, existing Node checks, browser QA.

- [ ] Inventory all built-in medical records and numeric/diagnostic claims; preserve baseline changes.
- [ ] Research/revise8 anatomy regions; add ANATOMY_REGION_EVIDENCE and research log.
- [ ] Research/revise11 muscle groups and all exercises; add per-record evidence and remove unsupported activation percentages from presentation.
- [ ] Research/revise10 trigger-point records/general protocol with explicit limited evidence and safe scope.
- [ ] Audit/revise4 movement lessons and17 ROM references/population/error behavior.
- [ ] Research/revise pre-exercise screening/medication notes, assistant citation behavior and lab extraction constraints.
- [ ] Audit all1,031catalog IDs/nomenclature/provenance; avoid inventing unsupported structure-level anatomical facts.
- [ ] Add shared evidence panels and a coverage/source index; integrate every clinical feature and bounded AI context.
- [ ] Write failing coverage/behavior regressions, fix, then run domain checks, lint/build and software review.
- [ ] Actual browser checks for each primary feature on desktop and390px; save artifacts/report with honest clinical-review limits.

Independent agents own disjoint domain data files. Main owns shared UI, handbook/ROM/safety/AI, inventory and integration. Existing pending gluteus and detail changes remain intact. No commit/publish or invented expert approval is part of this task.
