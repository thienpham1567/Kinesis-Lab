# Hip Material Study Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this approved study inline, with a focused independent code review at the end.

**Goal:** Deliver a clearly labeled simulated gluteus medius/hip-joint prototype with same-camera material comparison.

**Architecture:** A policy module owns the eligible IDs and sample selections. A per-stage resource owner lazily loads one shared texture and reports loading/fallback status. A shader module patches only eligible physical materials; React controls select a sample/appearance using existing visibility and camera commands.

**Tech Stack:** Next 16.4.1, React19, Three0.186.1, existing WebGL/Draco assets, synthetic albedo texture.

## Tasks

- [x] Save a baseline image; generate/inspect/persist one synthetic muscle albedo tile and its provenance. No photographic claims.
- [x] Add failing checks in scripts/check-hip-material-study.mjs: eight eligible IDs only, sample IDs, standard-profile restore, valid muscle-only scattering, no invalid/transparent scattering, lazy single load and late-load disposal, shader cache/heatmap priority.
- [x] Create hip-material-policy.ts and tissue-study-resources.ts; keep the shader patch in the cohesive tissue-materials.ts factory. Keep the existing base material unchanged when inactive; share one sampler/uniform set per stage. Report fallback and retain functional original materials on texture failure.
- [x] Integrate study feature gating into tissue-materials.ts/atlas-stage.ts/types.ts. Add a hip camera command targeting the left labrum plus contextual margin. Record bounded CPU submission/resource diagnostics on the canvas for actual browser checks.
- [x] Create HipMaterialStudyControls.tsx; wire into Atlas3DExplorer. Original/Simulated controls preserve camera; sample buttons use explicit stable IDs, existing visibility state and camera commands. Clear study when leaving hip; hide heatmap for sample navigation.
- [x] Run renderer/asset/study checks, lint/build and focused React Doctor. Inspect actual desktop/mobile output, sample switching, comparison, picking, quality/opacity, field priority and texture failure; save observed results and images.
- [x] Focused independent review, fix confirmed findings, rerun checks. Update attribution and verification report with limitations and performance evidence.
