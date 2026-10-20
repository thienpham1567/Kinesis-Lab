# Tissue surface detail — verification

Verified 2026-10-19; initial implementation and close-view visual checks on 2026-10-16.

## Delivered

- Independent packed normal/roughness maps for muscle, tendon, bone and cartilage; four 256×256 PNGs, **228,976 bytes** combined. Existing illustrative muscle color remains separate. Five-image batch totals 446,928 bytes before HTTP compression.
- Atomic lazy loading, original-material fallback, retry, mip filtering and complete late-arrival/disposal handling.
- Periodic triplanar color crossfade; independently authored surface gradients, restrained cosmetic relief and footprint filtering. No displacement or modification of anatomy geometry.
- Surface-aware close camera, accessible **Cận cảnh bề mặt** button, and double-click on a real triangle. Existing whole-structure focus remains available.
- Provenance in `public/anatomy/3d/ATTRIBUTION.md` and `textures/DETAIL-MAPS.json`; UI explicitly labels the material study as simulated.

## Verification on 2026-10-19

All commands completed successfully:

- `npm run lint`
- `npm run build` — TypeScript and production route generation passed.
- `npm run check:atlas-detail` — atomic batch lifecycle, all four family shader bindings, upload orientation, normal/roughness bounds, periodicity, texture hashes, generator hash, exact pixel reproduction, image dimensions and surface-focus geometry checks.
- `npm run check:atlas-study` — eight-structure scope, source materials, scattering suppression, heatmap priority, texture ownership/provenance and transfer budget.
- `npm run check:atlas-render` — 27 render, transparency and thickness assertions.
- `node scripts/check-atlas-surfaces.mjs` — all six bundles; 1,031 stable structures, material regions and geometric thickness fields retained.
- `npx -y react-doctor@latest . --verbose --scope changed --base 8524ed8` — 13 files scanned, score 91/100, no issues reported. A narrower scan of this continuation’s script changes scored 100; neither score is a frame-rate measurement.

Fresh manual browser results: **13 checks passed**, recorded in `.data/artifacts/tissue-detail-ui-checks.json`. Desktop 1440×1000 and mobile 390×844 were checked, then the viewport override was reset. Original/Simulated preserve the close camera; mobile has no horizontal overflow, buttons wrap, keyboard focus is visible, Auto uses Fast, Detailed also renders, and heatmap replaces the tissue material. Switching regions disables study outside hip; leaving 3D removes the canvas and remount restores resources. The cartilage close view retains its distinct blue-white surface. No fresh runtime errors or warnings were recorded.

CPU-side render diagnostics from the fresh muscle close view: desktop Detailed 0.30 ms, 7 calls, 17 textures, 8,753 triangles; mobile Auto/Fast 0.30 ms, 1 call, 7 textures, 4,374 triangles. These are individual renderer submission samples in the desktop browser, **not GPU frame time, sustained FPS or physical-phone performance**.

## Review and fixes

An independent review on 2026-10-16 found that TextureLoader’s vertical flip reflected data-map rows without reflecting their Y gradient. The loader now sets `flipY=false` for packed maps; a regression assertion first failed on the default setting and passed after the fix. The reviewer found no additional confirmed issue in resource generations/disposal, signed triplanar gradients, mip variance, cache behavior, focus fallback or heatmap priority.

On2026-10-19 the provenance audit found that spreading the surface parameters replaced image `height:256` with the cosmetic height amplitude. The regression check reproduced `0.000006 !== 256`. The generator now writes a separate `heightAmplitudeMetres`, preserves pixel dimensions and refreshes the field-generator hash. Each generated packed pixel is compared against the deterministic field output; the four PNG hashes and sizes did not change.

## Earlier visual/failure checks (2026-10-16)

- Saved original-material baseline and close views of muscle, white tendon, ivory bone and blue-white cartilage.
- Reduced excessive relief and replaced regular muscle/bone sine interference with periodic smooth noise after a close-view comparison exposed a woven highlight pattern. Diagnostic normal/roughness bypass was restored; final maps are active.
- Checked close, oblique and whole-structure views; no hard tile boundary was observed in inspected views. Source polygon silhouettes and tissue-region boundaries remain visible.
- Temporarily withheld `cartilage-detail-v1.png`: UI showed original-material fallback and retry; restoring the file and retrying loaded all five images without changing camera. The file was restored.
- Double-click on the white tendon focused the actual child surface while retaining the parent muscle selection. Bone double-click selected hip bone correctly.
- Muscle opacity 15% remained transparent; hiding the selected structure disabled close focus.

## Evidence

Ignored local screenshots in `.data/artifacts/`:

- `tissue-detail-before.jpg`
- `tissue-detail-final-close.jpg`
- `tissue-detail-tendon-close.jpg`
- `tissue-detail-bone-close.jpg`
- `tissue-detail-final-cartilage.jpg`
- `tissue-detail-final-mobile.jpg`
- `tissue-detail-final-controls.jpg`

## Practical limits

The detail maps are mathematical illustrations. Color is AI-generated, not photographed human tissue. Apparent fiber direction, cosmetic height, roughness and scattering settings are not measured or clinically validated. Thickness is an estimate across the whole mesh, not measured cartilage/tendon layer thickness. Study scope remains the eight eligible bilateral hip structures. Source faceting and region boundaries remain visible at strong magnification; no photorealism or additional anatomical accuracy is claimed. Physical device performance and expert anatomical review remain outside these checks.
