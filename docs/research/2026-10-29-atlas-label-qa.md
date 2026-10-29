# Atlas selected-structure callout regression QA — 2026-10-29

## Reproduction and cause

On `/atlas?tab=3d`, select the right sternocostal head of pectoralis major, then click the visible acromial part of deltoid. The heading and highlighted mesh changed to deltoid, but the in-scene label still showed pectoralis major with no selected deltoid callout.

The label anchor used only a ray through the structure's bounding-box center. That ray can miss a curved mesh or hit an occluded portion while another part remains visible. In free exploration, selected structures also did not enable callouts. At 390 px viewport width, clamping a long label into the canvas could place it over its own anchor and obscure the connecting line.

## Fix

- Keep the center-ray fast path; for a selected structure, fall back to a bounded sample of source triangle centroids. Verify each candidate with the active camera and the nearest visible mesh intersection.
- Allow a visible source surface to anchor a selected label when the bounding-box center is outside view. Fully covered or hidden surfaces still have no callout.
- Display selected-structure callouts in free exploration when labels are enabled.
- Try both horizontal sides and positions above/below the anchor, avoiding occupied labels and leaving clearance around the pointer.
- Draw a blue connecting line with a visible surface dot. These anchors position the UI; they are not measured anatomical landmarks.

## Verification

- Regression tests failed before the fixes for curved and partly covered geometry in both orthographic and perspective cameras, plus the mobile anchor-overlap case.
- `node --test scripts/check-atlas-callouts.mjs scripts/check-atlas-learning-studio.mjs scripts/check-atlas-search-highlight.mjs`: **29 passed, 0 failed**. Nine new tests cover actual mesh hits, occlusion, narrow-screen placement, camera projections, viewport changes, transformed/non-indexed geometry, and partially off-screen structures.
- Targeted ESLint and `git diff --check`: passed.
- TypeScript: passed standalone and during `npm run build`.
- Production build: passed. Existing unrelated warning: `metadataBase` is unset for social images.
- React Doctor: 100/100, no issues in changed files.

Browser checks on localhost using actual source meshes: select pectoralis major → acromial deltoid; orbit selected deltoid; switch orthographic/perspective; toggle labels off/on; reset to full-body view; select rectus femoris; switch to free exploration; select pectoralis major there; resize to 390 × 844; verify long labels no longer cover their pointers. Repeated deltoid selection after reload and saved desktop/mobile screenshots.

Local screenshots: `output/atlas-label-qa/deltoid-desktop.png` and `output/atlas-label-qa/deltoid-mobile.png`.

Scope: source/UI changes tested locally; no deployment performed. Source geometry and anatomical/medical claims were not changed. Sampling is bounded and does not promise a label for every arbitrarily small exposed fragment.
