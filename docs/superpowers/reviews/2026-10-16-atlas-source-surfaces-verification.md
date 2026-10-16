# Source surfaces and estimated thickness — verification

Date: 2026-10-16. Implemented plan: `../plans/2026-10-16-atlas-source-surfaces.md`.

## Delivered

- Source assignments retained for 1,031 structures, including all 380 structures with multiple tissue families. Seven simplified PBR families preserve source face boundaries, shape and stable structure IDs.
- Ten hip samples carry a geometry-derived thickness scalar and a separate validity scalar through Draco. Coverage is 99.94–100%; no failed sample is filled with a synthetic measurement.
- Inspector shows source tissue families, estimated statistics and supported/unsupported field state. Optional heatmap uses a fixed qualitative 0–100+ mm scale and identifies invalid values in gray. Changing selection or area clears the field view; hiding the selected structure hides its legend.
- Clearly distinguishes whole-mesh geometric distance from actual tissue measurements and individual cartilage/tendon layers. No photo textures, calibrated SSS or measured layer thickness are claimed.
- Full bundle is 9,720,004 bytes; hip bundle is 441,312 bytes. Bundle URLs use content hashes to avoid old flattened assets in cache.

## Checks run

1. Blender 4.5.9: `--background --factory-startup --python-exit-code 1 --python scripts/check_thickness_bake.py` — passed tissue classification, known 2 m slab distance, closed cube sampling and rejection of open geometry. Initial run failed before the bake helper existed.
2. `node scripts/check-atlas-surfaces.mjs` — passed all six bundles, stable roots, source tissue families, scalar types/counts and ten supported samples. Initial run failed against the previous flattened assets.
3. `npm run check:atlas-render` — passed 27 assertions: quality policy, opacity shader lifecycle, source family lookup/selection restoration, field uniform and shader construction. New checks initially failed before runtime support existed.
4. `npm run lint` — passed.
5. `npm run build` — passed Next.js production compilation, TypeScript and static generation.
6. Focused React Doctor scan of both React Atlas components — no errors; existing promise-chain catch warning is a false positive (the chain has `.catch`). Explorer complexity and size remain maintainability warnings. Changed-file scan also reported existing Atlas page complexity. No rules were suppressed.
7. Independent source/asset review — no actionable findings. Reviewer also decoded every field-bearing hip primitive and confirmed finite scalar arrays, 0/1 validity and expected invalid vertices.
8. Actual in-app browser at 1440×1000 and 390×844 — 24 checks passed, including all six region bundles, muscle/tendon and bone/cartilage presentation, picking on a cartilage child selecting the parent femur, isolate/hide/show, opacity and fast/detailed switching, supported/unsupported field states, mode reset, mobile overflow, deep links, and unmount/remount. Console had no errors or warnings. Two initial immediate assertions ran before async content mounted; both passed when retested with explicit waits for the selected heading/canvas.

## Local browser artifacts

Ignored `.data/artifacts/`:

- `atlas-source-surfaces-desktop.jpg`
- `atlas-thickness-desktop.jpg`
- `atlas-thickness-mobile.jpg`
- `atlas-source-surfaces-ui-checks.json` — all 24 results, including retest notes.

Source/license/method details: `public/anatomy/3d/ATTRIBUTION.md`.

Changes remain local and uncommitted. The thickness field supports educational inspection of source geometry; it has not been validated against measured anatomy.
