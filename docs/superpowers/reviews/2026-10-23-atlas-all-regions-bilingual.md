# Atlas: all regions and bilingual structure names

Date: 2026-10-23. Continues the uncommitted `codex/atlas-learning-studio` work.

## Changes

- Replaced the hip-specific learning modules with `region-learning.ts`, `RegionLearningRail.tsx` and `RegionLearningOverview.tsx`.
- All six existing bundles now support the five-step studio: full body, neck, upper limb, trunk, hip and lower limb. A visible region selector and the exploration toggle are available for all bundles.
- Each area uses its relevant existing foundation records. Full body groups all eight foundation regions; trunk groups thoracic/lumbar; lower limb groups thigh/knee/ankle. Upper-limb reading explicitly describes its current shoulder scope.
- Exact source English keys select a left-side example when available: gluteus medius, sternocleidomastoid, supraspinatus, rectus abdominis and tibialis anterior. No target is fabricated when absent from a bundle.
- Added 216 exact-key Vietnamese translations covering the current 429 muscular-layer structures. This layer also contains connective tissues; translated names retain the appropriate tendon/ligament/retinaculum names. The inventory comparison found no missing or extra keys.
- Display names pair Vietnamese with verbatim English in the list, selected heading, stage heading and 3D callouts. Search matches Vietnamese, English, Latin and side. Part/head distinctions are retained. Long names wrap; callout prioritization favors visible prominent muscles over tiny hand bones, while anchors still require unobscured mesh hits.
- Replaced the explorer's PT note inferred from `clinicalRegion` with explicitly area-scoped, cited foundation reading. Browser inspection exposed a supraspinatus record classified as thoracic by the prior export heuristic; the new studio does not use that classification to assign clinical reading. The underlying source manifest was not relabeled or clinically validated.
- Hip material studies remain limited to their existing supported hip assets.

## Sources and limits

Foundation text, claim-level source indices and actual 2026-10-22 reading dates are reused from existing records. No additional clinical facts or treatment claims were authored.

[Public terminology provenance](../../../public/anatomy/3d/TERMINOLOGY.md) records 2026-10-23 access and limited comparison with the Central Rehabilitation Hospital PDF. Most additional Vietnamese labels are authored translations from source English, with no individual Vietnamese comparison record. They are not presented as an official FIPAT translation, independent anatomical validation or professional approval. FIPAT access limitations are recorded explicitly; no inaccessible full text is claimed as read. The existing source-only catalog evidence remains source-only.

## Verification

- TypeScript: `npx tsc --noEmit --incremental false` passed.
- ESLint: Atlas components and the three changed/new clinical naming modules passed.
- Production build: `npm run build` passed on final implementation.
- `git diff --check`: passed.
- React Doctor changed-file scan: 7 tracked changed files, no reported issues, score 92/100. A new non-null assertion warning was removed.
- React Doctor full scan: 147 files, 52 warnings, score 55/100; same warning count as the preceding studio review. Existing explorer size/state, canvas effect, training and other repository warnings remain. Logs: `/tmp/kinesis-atlas-regions-react-doctor-final.log` and `/tmp/kinesis-atlas-regions-react-doctor-full.log`.
- No automated test suites were added or run.

### Browser observations

- Opened all six bundles. Neck, upper, trunk and lower example steps selected the expected source muscle; hip and full body were also opened with the shared controls.
- Lower-limb bone step displayed its skeleton. Full-body overview loaded the actual GLB and showed bilingual external-oblique/sartorius callouts.
- Vietnamese search `dạng dài ngón cái` returned both abductor pollicis longus sides; the right side could be selected. English search for the superficial head of flexor pollicis brevis returned both sides; selecting the left side updated the heading and 3D label.
- Regional overview/source panes showed their corresponding existing OpenStax links and reading scopes. Keyboard End/Home switched inspector focus and selection between Sources/Overview.
- At 1280px, stage and inspector occupied separate columns, orthographic projection and detailed rendering were observed, document width was 1265px.
- At 390px, long names wrapped in search results and callouts; document width was 375px with no horizontal page overflow. Fast rendering and orthographic/perspective switching were observed. Region controls, step rail and inspector stacked vertically.
- Free exploration at upper limb restored legacy controls and retained the paired names. Direct full-body and upper-limb URLs were opened. Viewport override was reset after inspection.

These observations do not establish clinical validity, verify every mesh label, audit all 216 Vietnamese translations, benchmark GPU performance or exhaustively inspect other Atlas tabs. Loading was observed; network failures were not injected. Reduced-motion/disposal behavior is inherited from the previous implementation and was not re-emulated in the browser.

## Screenshots

- [Desktop full-body studio](assets/2026-10-23-atlas-regions/desktop-full.png)
- [Phone bilingual name list](assets/2026-10-23-atlas-regions/mobile-names.png)
- [Phone long 3D callout](assets/2026-10-23-atlas-regions/mobile-stage.png)

No commit, merge, deployment, new dependency or paid generation was performed.
