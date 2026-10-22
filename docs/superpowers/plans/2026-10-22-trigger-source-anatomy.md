# Trigger Point source anatomy repair

**Goal:** Complete the approved review fixes while retaining the working tree's existing terminology, source records and per-muscle layer notes.
**Architecture:** Show existing attributed OpenStax crops as the primary muscle illustrations. Stop drawing unverified trigger coordinates, referral shapes and muscle footprints. Keep the separately labeled symptom-region locator and eight region buttons for navigation only. No new medical technique or validated spatial claim is introduced.
**Stack:** Existing Next 16 / React 19, SVG source framing, TypeScript data, Node assertion scripts, CUA UI checks.

- [x] Add a failing server-render regression check: muscle mode uses the sourced plate and no simplified body/trigger overlays; symptom mode preserves eight region choices and no trigger markers; handbook and neutral terminology remain present.
- [x] Move the already authored source-plate frames into the main illustration panel, retain original labels/attribution and add a full-resolution link. Remove the obsolete trigger/referral renderer and duplicate clinical-panel images. Keep per-component layer/evidence notes.
- [x] Check source figure identity, framing and current source access. Preserve `limited` / null reviewer; record this follow-up date without changing earlier source access dates.
- [x] Run presentation/evidence/coverage checks, lint, build and focused React Doctor. Review code and UI at desktop/mobile, all ten group image states, eight symptom selections, handbook and keyboard operation. Save proof and a verification report.

The design follows the four findings and repair order accepted by the user. Earlier uncommitted component/source improvements are part of the baseline and must be preserved. Expert clinical/anatomical approval remains external and pending.
