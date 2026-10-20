# Cable curl clip implementation plan

**Goal:** Deliver the approved single cable-curl source-anatomy pilot, highlight and video export.
**Architecture:** Audit/bake a dedicated source-derived arm asset; a separate Three player and React controls; pure animation/export policy helpers and provenance. Preserve static Atlas runtime/assets.
**Verification:** Unit/asset consistency checks before implementation, actual animation and export UI checks, lint/build and focused code review. No commit/publish.

- [x] Audit Z-Biomechanics rig/weights/action inventory, source license and bone/mesh mapping; inspect pose feasibility before choosing asset strategy.
- [x] Record exact provenance and claim-level elbow-flexor sources/check dates and pending expert review.
- [x] Write failing asset/player policy checks, implement deterministic motion/export helpers and derive animation asset with documented display choices.
- [x] Build isolated source-anatomy player, controls, highlighting and one-cycle video export with cancellation and cleanup.
- [x] Connect only the approved cable-curl variant in the exercise workspace; preserve static observation and other exercises.
- [x] Test start/mid/end geometry and exported video, desktop/mobile controls, initially paused behavior, synthetic error/cleanup paths, static regression; lint/build/review and proof. See `../reviews/2026-10-20-cable-curl-clip.md` for evidence and limits.
- [ ] External validation: qualified anatomy/biomechanics review of rig, spatial mapping and complete exercise technique. OS reduced-motion emulation, real network failure/retry and other browser codec engines remain unexercised.
