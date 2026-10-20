# PT Atlas verification — 2026-10-20

## User correction and delivered scope

The user rejected the procedural exercise mannequin as visually inadequate. It is removed from runtime; the rejected prototype is archived under ignored `.data/prototypes/rejected-motion-mannequin/` with disabled source extensions. The exercise workspace now uses the actual Z-Anatomy meshes already shipped with this app, rendered by the existing Three.js Atlas stage.

Delivered: exercise/muscle navigation, 13 exercise records and 11 muscle groups, qualitative roles and coaching, group anatomy/source cards, group-to-3D focus, four camera presets, quality and bone context controls, source-structure selection, client recording entry, local workout history, and shared evidence index/bounded AI context. Geometry is static and unmodified by exercise selection. Educational group links do not establish activation or verified attachment mapping.

## Automated verification

Fresh `npm run lint` and `npm run build` both exited 0 after the final viewer correction. Build compiled, completed TypeScript and generated all 17 routes, including `/api/training-log`.

Passed:

- `scripts/check-training-atlas.mjs`: search/selection/URLs, explicit mesh memberships, every target of all 13 exercises has source meshes in its linked region. Thumb/toe adductors and unrelated leg/arm muscles do not inherit legacy training groups.
- `scripts/check-training-log.mjs`: validation, errors, client isolation, migration of old local stores, disk persistence, deletion, corrupted store preservation; fake Supabase REST schema/persistence/isolation checks and no silent local fallback.
- `scripts/check-evidence-coverage.mjs`: 1,107 entries, bounded evidence retrieval and chat route injection/privacy/persistence checks.
- Lab extraction normalization; regional anatomy, muscle/exercise and trigger evidence consistency.
- Existing safety, ROM, Atlas render, study, tissue detail and evidence checks.

These checks establish software and evidence bookkeeping behavior, not medical or spatial validation.

## React Doctor

The broad changed-files scan reported 60/100 with no surfaced new diagnostics, but omitted untracked new components. A focused scan of five new PT/evidence components was therefore run separately. It finished with **0 errors and 3 warnings**: TrainingAtlasExplorer size and control-flow complexity (maintainability), and TrainingLog fetch-in-effect (architectural advisory). The history request is abortable, client scoped, and the component is keyed by client/exercise; local reload and client-isolation checks pass. These warnings were not suppressed. A redundant non-null assertion on a helper-filtered target was replaced with an explicit guard and the focused scan was repeated.

## Browser verification

CUA tested the app on desktop (1280×900; proof image at 1280×1100) and mobile (390×844):

- Real chest/shoulder source meshes loaded; changing the observed group and camera presets worked.
- Hip/gluteal source meshes loaded in the exercise workspace on mobile.
- Exercise catalog opens/collapses on mobile; unmatched search shows 0 results and reset restores the catalog.
- Muscle mode shows group anatomy and related exercise links. Its 3D link opens the hip group filter, retains bones and shows source-only versus literature evidence scope separately.
- Selected hip thrust opens the correct client workout form with that exercise prefilled.
- Saved a synthetic workout (3×8, 20 kg, RPE 7, explicit QA note) via the UI. The entry remained after a full reload and rendered correctly on mobile.
- Knowledge source search for “hip thrust” returns the relevant muscle/exercise records and pending expert review status.
- Measured document width on mobile was 375px within a 390px viewport for Atlas, workout and evidence index; no horizontal overflow.
- No captured browser warnings/errors after 03:10 UTC. Earlier HMR errors during the mannequin replacement were transient and did not reproduce after reload.

Recording UI QA used an isolated production server at localhost:3002 with its own temporary `.data` fixture, no real person data and no Cloud credentials. That server was stopped. The agent-created disposable Cloud QA client was removed successfully (HTTP 200); existing user records were untouched.

## Independent review

A focused independent read-only review of the source anatomy viewer, frame selection/camera lifecycle, helpers and route integration found no actionable high/medium issues. A minor stale selected-bone detail when bones are switched off was corrected by enforcing visible layer membership in the selected structure lookup.

## Remaining work and limits

- Anatomical exercise animation is not delivered. It needs an appropriate rig, deformation/movement data and qualified review; the rejected mannequin is not exposed as a substitute.
- Real Supabase `training_records` is missing. GET returned an explicit 503 schema error. `supabase/migrations/003_training_records.sql` is prepared, but no admin SQL connection was available. Real Cloud persistence has not been verified. Fake REST fixture success is not a real Cloud test.
- No AI provider key was configured; live model output was not tested. Source-context injection was exercised with synthetic adapters.
- Clinical content, translations and spatial mapping remain pending qualified expert approval. Existing tissue textures and mesh-derived thickness remain explicitly simulated/estimated.
- No commit, push or publication performed.

## Screenshots

- [Desktop actual source anatomy](assets/2026-10-20-pt-atlas/anatomy-desktop.png)
- [Mobile actual source anatomy](assets/2026-10-20-pt-atlas/anatomy-mobile.png)
- [Mobile persisted synthetic workout](assets/2026-10-20-pt-atlas/training-mobile.png)
