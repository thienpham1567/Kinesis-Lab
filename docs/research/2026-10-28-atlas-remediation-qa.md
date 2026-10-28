# Atlas remediation verification log

## Scope and evidence

Software checks establish consistency, not medical validation. Source comparison and limits are recorded separately in the catalog corrections and research reports. No professional reviewer is claimed. Baseline commit: `8fa995f79170bec73052418271f01d4ec4e52ad5`.

### Render and catalog batch

- `03c8314`: source FrontSide/BackSide/DoubleSide retained through material replacement, selection and opacity; real factory regression reproduced the original DoubleSide failure before correction. Independent spec and quality reviews passed.
- `c0a13eb`: 14 guarded records / 24 structures, immutable resolution in all three viewers, raw Latin aliases, corrected cuff context, truthful source-only geometry. Independent spec and quality reviews passed. Full Next build passed.
- `6e79da2`: source-group labels, correction provenance cards, null-side wording, unchanged Vietnamese terminology statuses, persistent search legend. Independent spec and quality reviews passed. TypeScript, scoped ESLint, corrections, names, evidence/coverage and 18 search/learning tests passed. Full Next build passed; the existing metadataBase warning remains.

### Browser observations (local production build, 2026-10-28)

In-app browser, actual viewport 687×877. The tool exposes no viewport-setting capability, so **390px and 1280px layouts have not been verified**. Do not describe those as tested.

- ATFL right (`za-975efd6a59c5`) remained visible from left and right camera directions in isolate mode after each camera transition settled. The canvas reported two triangles and the target ID; both faces visibly rendered. CFL right (`za-95cebea24bd4`) also rendered from both sides: [left camera](assets/2026-10-28-atlas-qa/cfl-left.png), [right camera](assets/2026-10-28-atlas-qa/cfl-right.png).
- Searching `Internal Oblique` returned both expected IDs (`za-11e8ab43abc3`, `za-6ac590756567`), retained the surrounding opaque whole body, and displayed the on-canvas positioning legend. Isolate remained off. Canvas diagnostic: 1,016 draw calls / 2,210,267 rendered triangles. No horizontal document overflow at this viewport. Timings are local observations, not cross-device benchmarks.
- Searching `Thyroid cartilage` and opening Kiến thức showed the source display group Hệ xương, a distinct sourced Sụn giáp identity, a source link and actual access date, and null-side wording that does not assert midline.
- Searching `Flexor digiti minimi pedis` returned both structures and displayed the corrected Latin. The provenance card retained `Flexor digiti minimi pedis pedis` as the original, linked FIPAT, and the Vietnamese terminology comparison remained partial with its own limits.
- Searching `Iliocostalis colli left` showed Bên trái, the original unspecified side, and a limitation that this was paired-source placement rather than independent anatomical validation.

[Whole-body Internal Oblique evidence](assets/2026-10-28-atlas-qa/internal-oblique-whole-body.png). Additional screenshots are retained locally in ignored `.data/qa/`. Final release evidence and deployment verification will be added after integration.

### Individual knowledge batch

- `07bc172`: seven new exact-ID families / 14 mesh IDs / 35 claims; original bilateral gluteus medius adapted without duplicating its facts. Independent spec and quality reviews passed.
- `bb1042c`: individual card before distinct group context; eight educational family records in the index, while all 1,031 catalog records remain source-only. Independent spec and quality reviews passed. Structure regression 6/6, learning/search 18/18, evidence/coverage 1,115 entries, scoped lint and TypeScript passed. Full build passed after merging upstream `9fc469b`.
- Browser at 687×877: IO, EO, TA, supraspinatus, infraspinatus, subscapularis and teres minor each displayed its own named card and five fields with correct adjacent source URLs. Gluteus medius retained four original facts, source URLs and its architecture details. No horizontal overflow in these views. Right-sided Internal Oblique retained its correct individual card and showed Bên phải.
- Keyboard Tab moved between actual claim citation links with a visible focus outline. [Individual IO card](assets/2026-10-28-atlas-qa/individual-internal-oblique.png) shows the card, dated source scope, citations and distinct group heading.
- Actual rendered regional foundation links now resolve cervical [10], thoracic [11] and lumbar [11] movement clauses to OpenStax §9.6. Thoracic mixed structural clauses additionally retain §7.3 [1].

### Terminology batch

- `e6de839`: 20 supported upgrades, resulting in 193 matched / 22 partial / 1 unresolved keys (383 / 44 / 2 structures). Independent spec and quality reviews passed. Learning 10/10 and names/SSR checks passed, including exact research rows, preserved historical dates and the Rotatores HTML locator without a fabricated PDF page. Final browser verification follows in the release sweep.

### Final local verification

- `e2b6b4d` source audit and `d230944` geometry inventory passed independent spec and quality reviews. The holistic integration review found no actionable defects. The source replay reproduces 1,023 derivative string pairs / eight unmatched, with 105 suffixed rows responsible for 139 newly matched catalog structures; these are bookkeeping comparisons, not medical acceptance rates.
- Fresh root verification after all application changes: 32 combined data/search/learning/individual/audit regressions and 10 decoded-geometry regressions passed, along with catalog corrections, names/terminology rendering, evidence/coverage, regional citations, surfaces, contextual membership, loading deadlines, sidedness/material/texture/detail checks and both read-only audit replays. Full ESLint with zero warnings and production Next build passed. Existing Next metadataBase and native-Node module-type notices remain unrelated to this change.
- Browser confirmed Rotatores' new record date 28/10, BYT link with PDF page 489, same-concept Virginia Tech HTML link without fabricated page, actual source access dates/scopes and retained historical note. CFL selected card displayed the schematic-surface note. A deliberately unknown query displayed a small no-result message without inventing a structure.
- Curl training view loaded and visibly rendered the arm, with 91 draw calls / 86,759 triangles; play advanced phase and pause stopped it. [Curl screenshot](assets/2026-10-28-atlas-qa/curl-render.png). Whole-body IO also provided the closed-muscle render check.
- Geometry remains unchanged: no GLB, source manifest, exporter or thickness-map replacement. The modifier-evaluated candidates stay research, with no measured-volume claim. Full inventory is public source documentation, not imported into the runtime bundle.
- Final browser sweep explicitly exercised all eight corrected Latin mesh IDs, all three side corrections, all eight bilateral cuff meshes and all seven corrected tissue identities. Each query returned its expected exact canvas target and correct card. The six corrected cuff meshes displayed the shoulder-region correction; all eight showed their own sourced anatomy. The original/raw provenance remained visible separately.
- Pinned source archive, Blender file, CSV and inspection scripts have also been preserved in the primary checkout's ignored `.data/z-anatomy/` before managed-worktree cleanup.

Production push/deploy and main-domain verification are recorded after release. The recorded local checks do not claim the unsupported 390px/1280px browser runs.
