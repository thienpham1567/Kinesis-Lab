# PT anatomy observation refinement

**Authorization:** Continue the user's approved 3D visual upgrade and UI testing. Keep actual static source anatomy; no generated anatomy or exercise deformation. No commit/publish.

**Design:** Clinical workspace around a matte dark anatomical plate, with a reversible light background. Preserve source material/geometry. Use front/back three-quarter presets, select a useful initial side per educational group, and allow exact source-structure selection, focus/isolation and restoration. All controls must work by keyboard and on a 390px display. Background changes retain camera/model resources. Group framing restores after isolation. Existing full Atlas defaults remain light.

**Files:** `render-policy.ts` provides the presentation palette; `studio-renderer.ts` applies it; optional canvas presentation flows through `types.ts`/`atlas-stage.ts`; `training-observation.ts` owns pure default view/selection helpers; `TrainingAnatomyViewer.tsx` exposes controls. Add focused checks in `scripts/check-training-observation.mjs`.

- [x] Write/run failing checks: palette, front/back group view, source structure selection/side labels, cross-region selection reset.
- [x] Implement pure helpers and renderer presentation; maintain on-demand rendering and no resource reload for theme changes.
- [x] Add oblique presets and preferred initial view; retain manual view when choosing structures.
- [x] Implement keyboard source selector, close focus/isolation/restore and background controls; source metadata and limits stay visible.
- [x] Run helper/render/evidence checks, lint/build and focused React Doctor; review findings.
- [x] Test desktop/mobile with CUA: posterior initial view, themes retain camera, structure selection/isolation/reset, no horizontal overflow. Save proof and record limitations.

Review found hidden isolation and A→B→A state revival; both fixed with pure state reconciliation and covered by automated/browser regression. Background color-space regression was reproduced in detailed mode, corrected with a scene background and checked on both paths. No clinical facts or source geometry changed. Verification: `docs/superpowers/reviews/2026-10-20-pt-observation.md`.
