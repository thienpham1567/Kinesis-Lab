# Hip material study — verification

Date: 2026-10-16. User approved a simulated prototype after the asset search did not establish a usable human tissue photo set.

## Delivered

- Optional hip-only panel: Original/Simulated material comparison, isolated left gluteus medius sample and a three-structure hip assembly (hip bone, femur, acetabular labrum).
- Eight eligible bilateral source structures only. Source geometry, source tissue boundaries, IDs and six regional bundles are unchanged. Other isolated structures retain their original appearance.
- AI-generated illustrative albedo, 1024×1024 WebP, 217,952 bytes. No photographic or measured muscle-fiber claim. Nominal 30mm art scale, mirrored repeat, triplanar projection; inferred bump/roughness. No added dependency or asset account required. Asset hash, origin, prompt and processing are in public/anatomy/3d/textures/PROVENANCE.json.
- Muscle-only backlighting approximation with geometry-derived thickness and validity; invalid/zero thickness and translucent muscle suppress this contribution. Art parameters are not calibrated optical properties. Heatmap output takes priority.
- Per-tissue optical profiles, fixed shared studio lights/background for A/B. A/B does not change camera: verified from diagnostic camera/target coordinates on desktop and mobile.
- Lazy texture load shared per stage, original appearance during load/failure, visible retry, and late-arrival disposal after unmount.

## Checks

- `npm run check:atlas-study`: passed eligibility/sample policy, lazy loading, profile restore, scalar validity/opacity attenuation gating, shader patch/cache/heatmap priority, single-owner disposal and late arrival, fallback/retry, asset hash and <256KiB transfer budget. The initial check failed because the new modules were absent.
- `npm run check:atlas-render`: existing 27 assertions passed.
- `node scripts/check-atlas-surfaces.mjs`: all six bundles passed.
- `npm run lint`, `npm run build`, `git diff --check`: passed.
- Focused React Doctor on Explorer/new controls: no errors, two existing Explorer size/complexity warnings; controls have no findings. No rules suppressed.
- Independent review identified global lighting changes and missing provenance. Removed conditional scene-light changes, gated study by visible eligible meshes, and added provenance/updated attribution. Follow-up review found no remaining actionable issues.
- `package.json` contained committed conflict markers from an overlapping stash operation during this work. Resolved them preserving all existing safety/ROM/renderer commands, then added `check:atlas-study`.

## Actual browser verification

20 checks passed at 1440×1000 and 390×844, with a final capture at 1440×1100. Cases cover both samples, same-camera keyboard A/B, muscle/tendon and cartilage presentation, opacity and quality switching, heatmap priority, whole-structure hide/show, unsupported isolated structure, leaving/re-entering hip, disclosure, one-canvas unmount/remount and final clean console.

Texture failure was exercised by temporarily moving only the newly generated asset, reloading, observing original-material fallback/retry, restoring the file and retrying successfully. The file is restored. Final fresh runtime had no console errors/warnings.

Artifacts in ignored .data/artifacts/:

- hip-study-muscle-before.jpg / hip-study-muscle-after.jpg
- hip-study-joint-desktop.jpg / hip-study-muscle-mobile.jpg
- hip-study-final.jpg
- hip-study-ui-checks.json (20 results and raw diagnostics)

## Performance observations and limits

During repeated actual drag interactions, a rolling 32-sample median CPU submission time was recorded. This is CPU time around renderer/composer submission, not GPU timing or FPS. Counts include all composer passes.

| Viewport / policy | Original CPU median | Simulated CPU median | Calls | Triangles | GPU textures after load |
| --- | ---: | ---: | ---: | ---: | ---: |
| 390px / Auto→Fast | 0.20ms | 0.20ms | 2 | 5,176 | 4 |
| 1440px / Auto→Detailed | 0.40ms | 0.30ms | 9 | 10,357 | 14 |

Small timing differences are noise, not evidence that the simulated material is faster. Geometry and draw-call counts are unchanged by A/B. The high-quality mode uses the existing additional shadows/AO passes. Mobile results are a narrow browser viewport on this machine; no physical phone or GPU/FPS benchmark was performed.

OpenStax sections 11.6 and 9.6 were used as gross anatomical references. The source surfaces and joints were visually inspected, but no qualified expert has certified anatomical fidelity or optical realism. The UI, provenance and attribution explicitly identify these limits. Work remains local/uncommitted.
