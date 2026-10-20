# Gluteus Fiber Study Implementation Plan

**Goal:** Deliver source-linked gluteus medius anatomy, source-region labels and a mesh audit under the user’s medical-accuracy requirement.
**Architecture:** Structured claim/source records; source-surface label projection and DOM controller; AtlasStage bindings and React toggle. Geometry-inferred fiber rendering is withheld pending validated data and expert review.
**Tech Stack:** Next16, React19, Three r186, existing Node assert checks and local Draco decoder.

- [x] Decode and audit both source gluteus meshes; save counts, edge/normal findings and hashes.
- [x] Investigate fan-field feasibility; withhold it after the user requires medically verified spatial anatomy. Keep experiment outside runtime.
- [x] Replace speculative shader work with source-linked anatomy evidence and honest review/fiber status; test scope and source resolution.
- [x] Write failing projection tests (onscreen, behind, offscreen, occlusion); implement two source-region label buttons and disposal.
- [x] Add “Nhãn cơ–gân trên mô hình” with accessible native checkbox; explicitly distinguish simulated appearance from fiber anatomy.
- [x] Inspect actual source-region labels, tendon close focus, hidden/ineligible state, both sides, Original, heatmap, keyboard, 390px, source links and unmount/remount. Existing texture fallback/retry lifecycle regression tests remain passing.
- [x] Run old/new checks, lint/build, React Doctor and focused independent review; update attribution/provenance and verification report.

Test entry: `node scripts/check-atlas-evidence.mjs`. Pure modules import from `src/components/atlas3d/`. Geometry auditing reads bundled GLB and local decoder only; it never changes the source assets.

Revised by user requirement: strict medical accuracy supersedes geometry-inferred fiber rendering. No expert validation has occurred.

Verification: `docs/superpowers/reviews/2026-10-19-gluteus-evidence.md`. No measured fiber overlay was released. Independent clinical review remains pending.
