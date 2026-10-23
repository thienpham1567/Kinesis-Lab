# Atlas regions and bilingual names

**Goal:** Extend the accepted Learning Studio to all six existing Atlas bundles and show Vietnamese alongside source English names.

**Design:** Keep the existing editorial anatomy classroom, cobalt selection and four-tab inspector. Use a visible region selector, reusable five-step viewing rail and region-specific source records. Full body groups the eight existing foundation regions; neck/upper/trunk/hip/lower use their relevant subsets. No new medical claims or inferred attachment landmarks. English identity remains exactly as the source; Vietnamese is an authored display translation, not an official FIPAT translation.

**Execution:** Continue the existing feature branch and uncommitted workspace. User explicitly requested this extension of the accepted design. Implement inline without a second design-approval gate. Do not add/run test suites, commit or merge.

- [x] Replace hip-only learning data with `region-learning.ts`: area metadata, source region IDs and existing catalog muscle examples selected by exact English name, only if present in the active bundle.
- [x] Generalize `HipLearningOverview.tsx` / `HipLearningRail.tsx` to region components; preserve claim-level source indices and actual dates/scopes. Reset inspector and visibility on region/step changes. Keep hip-only material controls scoped to hip.
- [x] Add `atlas-names.ts` and an exact-key Vietnamese terminology table for the existing muscular-layer inventory, including source-layer connective tissues. Preserve specific heads/parts and English strings; search matches both languages. Show paired names in callouts, search, stage and selected heading. Link terminology provenance with truthful translation limits.
- [x] Integrate all regions in `Atlas3DExplorer.tsx`, with prominent region switching and free-exploration toggle for every bundle. Keep existing evidence/actions and render lifecycle.
- [x] Run TypeScript, focused ESLint, build and React Doctor. Inspect representative regions, bilingual search/selection, step changes, mode/projection, keyboard tabs and phone wrapping in the browser; save screenshots and document actual coverage. Do not claim medical or per-mesh validation.

## Delivery record

Implemented on 2026-10-23. See [review and verification](../reviews/2026-10-23-atlas-all-regions-bilingual.md) for observations and limits. All six existing bundles use the studio; translation coverage is an inventory result, not a claim that all Vietnamese terms were externally verified. Changes remain uncommitted.
