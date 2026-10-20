# Gluteus medius pilot: evidence and implementation review

Checked 2026-10-19. This document records literature correspondence and software checks, **not independent clinical/anatomical approval**.

## User-directed change of scope

The user approved a gluteus medius pilot, then required medical accuracy grounded in reputable sources. The geometry-inferred fan-field experiment was excluded from runtime because a plausible visual field does not establish fascicle anatomy. No new fiber map, compartment boundaries or anatomical attachment markers are shipped. Existing synthetic surface color remains explicitly cosmetic. A visible statement now distinguishes it from measured fiber direction.

## Applied knowledge

`src/lib/clinical/anatomy-evidence.mjs` stores four educational facts, the checking date, per-claim source IDs, source access scope, an unavailable-fiber-mapping status and a null clinician-review field. Both source gluteus medius IDs resolve to it; other structures return no record. The UI displays these facts with citations and an explicit pending independent-review statement.

| Claim | Source correspondence |
|---|---|
| Origin on ilium between anterior/posterior gluteal lines | McGraw Hill, Gross Anatomy 2e, chapter 35, table 35-1 |
| Greater-trochanter attachment, lateral/superior-posterior regions | UW Radiology Muscle Atlas and Tsutsumi 2019 abstract |
| Superior gluteal nerve, L4/L5/S1 | UW Radiology and StatPearls superior gluteal nerve introduction |
| Hip abduction and contribution to pelvic support during unilateral stance | McGraw Hill table 35-1; UW corroborates abduction |

References read:

1. [McGraw Hill · Gluteal Region and Hip](https://accessmedicine.mhmedical.com/Content.aspx?bookid=2478&sectionid=202021783): publicly exposed chapter/table excerpt, not a claim to have read the entire textbook.
2. [University of Washington · Gluteus Medius](https://rad.uw.edu/muscle-atlas/gluteus-medius): reference text. No atlas illustration copied.
3. [StatPearls · Superior Gluteal Nerve](https://www.ncbi.nlm.nih.gov/books/NBK535408/): public introduction/structure-function text, last update 2023-08-14. NCBI hosting is not app endorsement.
4. [Flack, Nicholson & Woodley 2014](https://pubmed.ncbi.nlm.nih.gov/23625344/), DOI 10.1002/ca.22248: abstract. It reports differing architectural/innervation regions; it does not provide a validated mapping to our mesh. Access metadata matches the abstract’s cadaver-sampling wording.
5. [Tsutsumi, Nimura & Akita 2019](https://pubmed.ncbi.nlm.nih.gov/30653048/), DOI 10.2106/JBJS.18.00602: abstract. Describes posterior and anterolateral tendon regions with different attachment facets. No numerical tendon thickness is transferred to the app.

The different regional descriptions are preserved as study context. No fixed three-/four-compartment partition or inferred fan field is declared anatomically correct on this model. No diagnostic, exercise prescription or surgical guidance was added.

## Geometry and labels

`node scripts/audit-gluteus-geometry.mjs` decodes the original local GLB using its bundled Draco decoder and writes `2026-10-19-gluteus-geometry.json`. Each side has 4,374 muscle and 802 tendon triangles. Both had zero nonfinite positions, non-unit normals (>0.01 tolerance), degenerate triangles, or open/nonmanifold edges after 20 µm distance welding. The largest triangle edge is approximately 29.96 mm. Welding is audit-only and does not modify geometry. Normal length and topology checks do not prove anatomical correctness, normal orientation or adequate clinical detail.

The “Thân cơ” / “Vùng gân” buttons target actual camera-facing triangles in the source material regions. They are not origin/insertion landmarks. Labels hide when occluded, outside view, too close to edges or colliding. The same on-demand renderer lifecycle owns their DOM events and removes them on dispose.

Independent software review found that clamping a label into the viewport could place it over a different tissue. The fix keeps the true projected anchor and hides labels that cannot fit; collision handling also hides rather than displaces. A regression first failed with the old 320 px clamped position and then passed. The reviewer rechecked the fix and found no remaining actionable issue; source correspondence checking was explicitly not clinical validation.

## Verification

- `npm run check:atlas-evidence`: evidence scope, source URLs, explicit pending clinical review/unavailable fiber map; onscreen, hidden, behind-camera, occluded and near-edge label cases.
- Existing detail, study, render-policy and all-six-bundle source surface checks remain required/passing in the final verification run.
- Lint and production build/TypeScript passed after integration; final command results are recorded in the task.
- React Doctor against 2fb02bc: 6 files scanned, 91/100, no issues reported. This scan is not evidence of medical correctness.
- Actual browser checks and screenshots are saved under `.data/artifacts/anatomy-evidence-*`; the JSON checklist distinguishes observed UI behavior from clinical review.

## Review still required

A qualified anatomist/clinician must independently assess both translated claims and spatial 3D source-region/landmark mapping before those are described as clinically validated. Any future fascicle overlay requires a traceable, licensed quantitative architecture dataset and matching spatial registration, with expert review. The rest of the app has not received a full medical-content audit from this pilot; see `docs/medical-evidence-policy.md`.

Final browser run: **15/15 final checks passed** on desktop 1440×1000 and mobile 390×844. One immediate pre-cleanup observation was repeated with an explicit detached-DOM wait; the label group and canvas were removed after React effect cleanup, and no duplicate group appeared on remount. No fresh console warning/error was recorded. The temporary viewport override was reset. UI checks: `.data/artifacts/anatomy-evidence-ui-checks.json`.
