# PT observation refinement — 2026-10-20

## Delivered

Continued the approved visual upgrade with actual, static Z-Anatomy geometry. The PT exercise viewer now has a reversible dark/light anatomical plate, front/back three-quarter camera views, a display preference for posterior views of back/gluteal educational groups, source-structure selection, focus, isolate and restore controls. The source selector includes English names so long/short heads with the same Vietnamese label and side remain distinguishable. Source materials, coordinates, texture ownership and medical evidence claims were preserved.

The white clinical workspace, cobalt controls and existing typography remain. No new visual assets, paid assets, anatomy textures or UI library were added. The dark plate and existing warm/cool studio lighting provide the visual anchor; aesthetic improvement remains subjective.

## Defects found and corrected

- Detailed postprocessing used a renderer clear color that could be copied as sRGB into a linear composer target. Reproduced by switching Fast/Detailed on the same 390px canvas. Source inspection of local Three r186 `RenderPass`, `WebGLBackground` and `OutputPass` explained the different clear paths. A scene background now clears in the active target color space. Tone mapping can still affect the final background appearance; no numerical color equivalence claim is made.
- Isolation could outlive a hidden layer and leave an empty viewer. Visibility reconciliation now clears hidden isolation and restores the group view.
- Masking state by context allowed old isolation to reappear when returning to exercise A after B. State reconciliation now actually replaces the stored context, selection and camera command before children commit, while valid state keeps command identity.

## Verification

- `npm run lint`: exit 0, no lint diagnostics.
- `npm run build`: exit 0, compiled and completed TypeScript and all 17 routes.
- `npm run check:training-observation`: passing. Palette/default view/source labels, layer/region/isolation guards, active-target background regression and state A→B→A regression. Background and duplicate-label failures were observed before the corrections; state check initially failed because its new module was absent.
- Training Atlas helper checks: all 13 exercises/11 groups have source structures in linked regions.
- Atlas render, material study, tissue detail and evidence checks: passing.
- Focused React Doctor: no errors, two maintainability warnings (component size and control-flow complexity). They were reviewed and not suppressed; focused state logic was separated into `observation-state.ts`.
- Independent read-only review initially reported the two state bugs above. Both fixed; re-review found no remaining high/medium issues in the focused changes.

CUA browser checks at 1280×900 and 390×844:

- Gluteal exercise initially opens a posterior oblique view; chest opens anterior oblique.
- Source selection, focus/isolate/restore work by keyboard, including distinguishing biceps femoris source heads.
- Switching dark → light → dark retained the exact camera dataset and texture count (12 before/after). This is a resource-count observation, not a GPU/frame-rate benchmark.
- Isolate a clicked humerus, disable bones: isolation exits, focus clears, group muscles remain visibly rendered.
- Isolate chest structure in A, switch to another exercise B, return to A: no stale isolation or selection returns.
- Mobile source names truncate inside the native select; the selected structure card retains the full English name. Controls wrap and remain usable; document width 375px in a 390px viewport, no horizontal overflow.
- Mobile selection/isolation/restore repeated after the final state correction. No captured browser errors. Temporary viewport override reset.

## Limits

The models are static. This is an observation workflow and presentation refinement, not anatomical exercise animation or increased mesh accuracy. Rigging, deformation and qualified medical/spatial review remain outstanding. No reviewer approval was fabricated. Existing Cloud training table migration and missing AI provider key are unchanged; neither was exercised in this visual refinement. No commit, push or publication performed.

## Proof

- [Desktop](assets/2026-10-20-pt-observation/desktop.png)
- [Mobile model](assets/2026-10-20-pt-observation/mobile-model.png)
- [Mobile controls](assets/2026-10-20-pt-observation/mobile-controls.png)
