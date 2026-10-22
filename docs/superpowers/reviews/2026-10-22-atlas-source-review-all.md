# Atlas source review — integration, 2026-10-22

## Decision and delivery

Reputable-source comparison is the acceptance criterion for Atlas educational content. Independent expert signoff is optional and no longer appears as a universal product gate. Reviewer metadata remains truthful and null; no certification, clinical validation, measured anatomy or personal treatment approval is claimed.

The complete finite knowledge inventory of the four Atlas tabs was compared with the source portions documented in the domain ledgers. This is a targeted source comparison, not an exhaustive systematic review. Some papers were accessible only as abstracts or indexed publisher passages; those access boundaries remain visible with actual checked dates.

| Domain | Reviewed inventory | Detailed ledger |
| --- | --- | --- |
| Regional anatomy and joint rehabilitation | 8 regions, 24 structure summaries, 16 activity-adjustment pairs, 42 annotations on 13 plates, 25 broad body lookup zones | [Anatomy audit](2026-10-22-atlas-anatomy-source-audit.md) |
| PT training | 11 groups, 27 subdivision cards, 13 exercise records, 32 qualitative target roles; training viewers and curl explanatory text | [Training audit](2026-10-22-atlas-training-source-audit.md) |
| Trigger Point | 10 groups, 19 components, 8 symptom explanations and handbook | [Trigger audit](2026-10-22-atlas-trigger-source-audit.md) |
| 3D/source identity | 1,031 exact catalog IDs and provenance records; bilateral gluteus medius detailed facts and architectural-source scopes | Anatomy audit above |

## Concrete corrections

- Corrected knee collateral-ligament/capsule relationships, the distinction between four abdominal muscle groups and three lateral-wall layers, ambiguous shoulder proportions, unsupported pectoralis-minor associations, and overbroad deep-neck annotations. All 42 plate notes now resolve to individual regional source links.
- Corrected the triceps reference, the deltoid heading's promised coverage, and missing pectineus/tibialis-anterior teaching memberships. Added [ACSM's 2026 position stand](https://pubmed.ncbi.nlm.nih.gov/41843416/) with healthy-adult scope, direct 2025/2026 curl evidence and a hip-angle leg-extension trial. Trial configurations and outcomes remain distinct; no universal best exercise, measured activation percentage or head isolation was inferred.
- Corrected psoas-study labeling and the unsupported QL superficial/deep qualifier. Used the [final Heel Pain CPG 2023](https://www.orthopt.org/uploads/content_files/files/koc_et_al_2023_heel_pain_plantar_fasciitis_revision_2023.pdf) for first-step plantar-heel-pain and secondary calf-trial context. Added direct support for isolated-SLR and non-classic pain-distribution cautions and precise symptom-referral guidance.
- Replaced expert-approval gates in the shared source panel, index, Atlas cards/viewers, sample prompts and assistant context. Persistent AGENTS/policy now records the user's decision. Replaced visible implementation field labels with readable section labels.
- Final UI review renamed handbook headings to “Giới hạn tiếp xúc và dấu hiệu cần dừng” and “Foam roll: bằng chứng và giới hạn cơ chế” to avoid implying a validated safe pressure scale or proven mechanism. A regression was observed failing before this correction and passing afterward. The universal-gate regression likewise failed before the shared-panel change and passed afterward.

## What the source records establish

The 1,031 catalog entries remain **source-only**. The previous derivative TA2.csv comparison contains 884 matching English/Latin pairs and 147 without such a pair; it was not rerun or promoted into original-FIPAT verification, mesh-label verification or translation approval. Eight Latin fields are empty. Catalog completeness checks are bookkeeping, not anatomical validation.

Source texts describe gross anatomy. The app's material textures, geometry-derived thickness, authored curl rig/weights, six-second cycle and 10–110° display range are simulations. No measured tissue texture/thickness, fascicle-to-mesh mapping or individual motion data were added. Unsupported trigger-point/referral coordinates remain withheld for missing source-to-location evidence, independently of reviewer availability. Symptom lookup colors remain broad authored navigation regions.

Source comparison and automated tests do not establish clinical validation. General exercise cues remain authored educational options; source populations, interventions and access limits must be read before applying a result. Existing symptom-based medical referral guidance remains.

## Software verification

All commands below exited successfully after integration; lint/build/React Doctor were repeated after the final handbook wording correction:

1. `node scripts/check-atlas-source-presentation.mjs`
2. `node scripts/check-trigger-presentation.mjs`
3. `node scripts/check-trigger-evidence.mjs`
4. `node scripts/check-muscle-evidence.mjs`
5. `node scripts/check-training-atlas.mjs`
6. `node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-anatomy-regions-evidence.mjs`
7. `node scripts/check-evidence-coverage.mjs` — exact 1,107 entries, including 1,031 source-only IDs; bounded retrieval/context checks.
8. `npm run check:atlas-evidence`
9. `npm run check:atlas-render`
10. `npm run check:training-observation`
11. `node scripts/check-curl-asset.mjs` — exact GLB identity, skin weights, actual sampled motion, anchored upper arm and loop closure.
12. `npm run lint`
13. `npm run build` — compilation, TypeScript and static generation succeeded. The shared workspace also contained concurrent NCSF changes outside this task; these were preserved.
14. `npx -y react-doctor@latest . --verbose --scope changed --no-telemetry --no-supply-chain` — 29 files, no issues. No numeric score was emitted.
15. `git diff --check`

Tests retain exact finite inventories, truthful null reviewer fields, source indexes, source dates/access, unknown-ID behavior, source-asset identity and simulation limits. Date assertions now accept actual ISO checked dates instead of forcing old October 19/20 dates. A study note can cite a source without a misleading mandatory “Có:” prefix. New checks cover every plate-note source reference, the two corrected teaching memberships and the absence of expert gates. None of these checks prove medical truth.

Domain diffs and shared policy/context changes were manually inspected by the integrating agent. An additional final reviewer agent could not start because of the account usage limit; no independent code-review completion is claimed.

## Actual browser verification

Used the existing local in-app browser. Desktop testing used 1280×900; mobile used 390×844. Temporary viewport overrides were reset. A stale browser view after reconnection was explicitly reloaded; the current view then showed updated source labels and authored-example text.

- Selected all 8 rehabilitation regions and checked the corresponding heading and annotation-source links.
- Selected all 11 muscle cards and all 13 exercise records, waiting for each expected heading rather than assuming the click had completed.
- Selected all 10 trigger groups and verified the corresponding source-anatomy heading. The SVG image elements point to the attributed original anatomy images; no unverified trigger overlays were restored.
- Selected all 8 symptom lookup categories with the keyboard; no page-width overflow or universal expert gate appeared.
- Checked handbook, all four mobile tabs, updated calf/heel passages, source-panel readability, gluteus-medius gross-anatomy facts, separate source-only catalog state and material/measurement limits.
- Played the actual curl viewer: the phase advanced and the pause control appeared; stopped it afterward.
- Checked the shared knowledge index: 76 scoped records plus 1,031 source-only structures, source-policy badge, no universal pending-review gate.

Proof images are in [assets/2026-10-22-atlas-source-review-all](assets/2026-10-22-atlas-source-review-all/): desktop knee sources, desktop curl, mobile calf, mobile rehabilitation source panel, mobile PT guidance and mobile 3D source state. The browser is returned to Atlas. No commit, push, publication, cloud migration or third-party message was performed for this task.
