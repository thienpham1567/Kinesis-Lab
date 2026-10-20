# Tissue Surface Detail Implementation Plan

**Goal:** Add independent simulated normal/roughness detail for four tissue families and a surface-aware close camera without changing anatomy.
**Architecture:** Deterministic data-map generator/config; atomic lazy resource batch; extracted shader string module; selected-surface camera helper and one existing-style UI action.

- [x] Save current close-view baseline; write failing resource/shader and packed-data tests.
- [x] Author periodic fields and generate four packed PNGs with channel/provenance hashes. Verify repeatability, finite unit normals, roughness range and transfer budget.
- [x] Extend TissueStudyResources to a five-image atomic batch with flat data placeholders, linear filtering/mipmaps, retry and complete disposal. Update old single-image checks for the new documented batch.
- [x] Extract study surface shader into a focused .mjs module, replace shared albedo-derived bump with family-specific surface gradients, periodic albedo and explicit-gradient/mip filtering. Preserve base material and heatmap output priority.
- [x] Add a tested pure surface-ray helper and “detail” camera command; expose “Cận cảnh bề mặt” for selected visible structures. Keep whole-structure focus/reset and keyboard access.
- [x] Verify actual desktop/mobile close, oblique, far, fallback/retry, quality/opacity/heatmap and unmount behavior. Record real diagnostics and screenshots.
- [x] Independent review, lint/build, existing/new checks, focused React Doctor. Update attribution and verification report, leave local work reviewable.

Verification: `docs/superpowers/reviews/2026-10-19-tissue-detail-verification.md`.
