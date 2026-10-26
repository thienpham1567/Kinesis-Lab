# Shared contextual Atlas 3D — verification

## Delivered behavior

Branch `codex/atlas-context-3d`, isolated worktree. The existing `Atlas3DCanvas`/`AtlasStage` now also powers the compact contextual viewer in training muscle lookup, Trigger Point muscle/symptom lookup, and Atlas rehab. Existing exercise/curl views are preserved. Other consumers of BodyMapExplorer retain their existing 2D behavior.

Exact catalog-name adapters cover the ten existing trigger teaching entries, all eleven training groups, and eight clinicalRegion classifications. Grouped cards preserve all their named components. Bundle choice proves every requested ID is in the catalog and selects the smallest complete regional bundle, with the full bundle available across areas. Source region/name associations are navigation metadata, not clinical validation.

Native structure selection, side/layer controls, camera views, focus/isolation/reset and surrounding-anatomy toggle operate on the original source renderer. Context changes remount local controls; hidden selected/isolated structures reconcile without reappearing later. All click-selectable visible structures are also available through the native selector. Rehab defaults to regional bones/joints and places region buttons before the viewer in both DOM and visual order. Muscle layer and 2D source illustrations remain available.

Manifest fetch/JSON has a 15-second deadline and model/stage startup a 30-second deadline. Expired stages are disposed, late startup cannot create a new stage, and retry remains available. The source renderer still owns geometry disposal and source-model loading.

## Automated verification

- `npm run build`: passed after the final functional change, including TypeScript and 19 generated routes. Existing local metadataBase warning remains because the isolated preview has no public SITE_URL.
- `npm run lint`, `npx tsc --noEmit`, `git diff --check`: passed.
- `npm run check:atlas-context`: passed. Actual catalog tests cover ten trigger entries, eleven training groups, eight regions, exact/excluded component membership, bilateral/midline filtering, unknown mappings, complete-bundle fallback, and hidden state resets. Deadline checks exercise a genuinely unresolved Promise, success, rejection and timer cleanup.
- Both adapter and full-bundle fallback were observed failing before their implementation/fix. Deadline check first failed for the absent helper, then passed after implementation.
- Trigger presentation/evidence checks, training observation, Atlas learning/render/study/detail/evidence, evidence coverage, landing and Markdown security checks: passed. Atlas learning reports 8 tests, 0 failures.
- Initial typecheck before Next generation lacked RouteContext/LayoutProps; the production build generated those types and subsequent typecheck passed.

## Browser verification

Production preview on port 3102, tested with the in-app browser. Real WebGL canvas loaded. Desktop viewport 1440x1000 and mobile 390x844; observed client/scroll widths were 1429/1429 and 379/379 respectively. Browser scrollbar accounts for the remaining width. No document horizontal overflow observed in any of the three tabs.

- All ten trigger topic buttons update the context and source structures. Source muscle components and right-side infraspinatus can be selected through the native control.
- Actual pointer click on the right infraspinatus mesh updated the selection to `za-3eade513dbf4`, the native selector and side readout. This is interaction verification, not anatomy validation.
- Isolation followed by switching to the opposite side cleared hidden selection/isolation; focus/isolation became disabled until another visible structure was selected.
- Training exercise viewer remains present. Muscle mode loads the contextual model. With surrounding structures enabled, selecting an acromial deltoid in the native control changes route to `tab=hypertrophy&muscle=deltoids` and updates the teaching card.
- All eight rehab region buttons synchronize model context and the existing knowledge heading. Selecting patella from surrounding lower-limb anatomy switches to the knee region. 2D mode restores the existing body illustrations and view controls.
- Rehab region selection works with Enter. Native select ArrowDown/Enter selects an actual structure and enables focus/isolation. Region selector precedes the viewer in the final DOM as well as visually.
- Trigger symptom lookup keeps the symptom locator and a neutral regional model; choosing lateral-knee symptoms opens region/knee without asserting a painful muscle. No coordinate/referral overlays were added. Handbook remains available.
- Original anatomy tab still loads one orthographic WebGL canvas with no observed model error. Switching contexts/tabs leaves one canvas, rather than accumulating visible canvases.
- Final mobile rehab default was rechecked with muscle layer off, region picker before the viewer, and no diagnostic overlays. Mobile training source labels wrap below the native select.

Screenshots in `assets/2026-10-23-atlas-context-3d/`: trigger desktop/mobile, rehab mobile, training mobile. They show actual source models, not generated illustrations.

## Independent review and limits

Separate spec and code-quality reviews completed with no remaining actionable findings. Review findings addressed complete-bundle fallback, load deadlines, keyboard parity and DOM order. These were code reviews, not clinical review; no professional reviewer identity or medical approval metadata was created.

Existing educational claims, citations, access/check dates, referral guidance and reviewedBy fields are unchanged. No source was newly represented as read. No trigger coordinates, referral heatmaps, measured fiber paths, tissue measurements or personal treatment recommendations were introduced.

Not tested: actual screen-reader software, other browser engines, GPU performance, slow-network/WebGL failure injection in the browser. Deadline settlement was tested in Node. Successful real model loading was exercised in the browser; stalled-load/error recovery was not exercised end to end there. Preview uses no copied AI/cloud credentials; no AI submissions, client writes, paid image calls, deployment or remote merge occurred. NCSF textbook-data validation is outside this feature and still requires its absent ignored local dataset.
