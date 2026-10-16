# Atlas rendering refinement

**Approved direction:** Keep Three.js and the Kinesis Lab workspace. Use a restrained anatomy studio presentation: warm ivory skeletal structures, deeper red muscles, muted joint structures, neutral pale background, soft studio lighting and a clear blue selection. Preserve source mesh geometry and the existing clinical content.

**Architecture:** Extract material creation and rendering policy from AtlasStage. Build local environment lighting with Three.js RoomEnvironment/PMREM, use a shadow-casting key light, and add bounded-resolution GTAO in detailed mode. Render on demand and dispose materials, render targets, passes, lighting resources and listeners when changing regions. Use cosmetic micro-roughness without inventing muscle fiber directions or new anatomy.

**Quality:** Auto chooses Fast for narrow/coarse-pointer devices. Fast retains PBR materials and environment lighting, with lower pixel ratio and no AO/shadow pass. Detailed uses soft shadows, ambient occlusion and multisampled output. Disable AO and muscle shadow casting when viewing translucent muscles so invisible tissue does not leave opaque shadows. An explicit user choice overrides Auto.

## Implementation

- [x] Record a baseline browser screenshot of the same hip bundle and rear view.
- [x] Add focused render-policy tests for mobile/desktop choice, explicit overrides and transparency, observe failure then implement the policy.
- [x] Implement tissue materials and studio pipeline in separate modules; integrate updates, resizing, bounds and cleanup in AtlasStage.
- [x] Add accessible quality controls with concise help and preserve existing layer/selection actions.
- [x] Run lint/build, render-policy tests, React Doctor and independent code review.
- [x] Exercise UI in the real browser: model loading, camera views, picking, list selection, focus, isolate/hide/restore, opacity, quality changes, regional/deep links, loading/fallback, keyboard focus, desktop and 390px layout. Save after screenshots and actual observations, including limits.

No new anatomical details, clinical validation or measured photorealism are claimed. Geometry fidelity is unchanged. The cosmetic roughness is not tissue measurement. Real tissue texture authoring and thickness-map-based subsurface scattering remain separate asset work requiring appropriate source data.

## Results

- Tissue-specific physical materials, procedural micro-roughness, local studio environment lighting, PCF shadows and capped-resolution GTAO are implemented. No new dependencies or remote texture requests were added.
- Fast mode releases detailed postprocessing/shadow targets. Independent review confirmed disposal and recreation are sound.
- Fixed transparency shader recompilation after a browser test showed that 15% opacity was still visually opaque. Regression coverage checks material program version at transparent/opaque boundaries.
- Added a visible 3px canvas keyboard focus indicator after checking the mobile focus state.
- Replaced deprecated PCFSoftShadowMap with the installed r186 PCFShadowMap API and radius setting. Clean browser reload produced no new rendering warnings/errors.
- 17 focused assertions passed via `npm run check:atlas-render`.
- 28 browser checks passed, including all six bundles, direct picking, drag versus click, Vietnamese search, keyboard selection/focus, layers, isolate/hide/restore, opacity, quality overrides, share/deep links, exercise navigation, unmount, and load failure/retry.
- Desktop: 1440 × 1000. Mobile: 390 × 844, measured page width 375 (scrollbar included in viewport), no horizontal overflow; quality select height 44px. Auto chose Detailed on desktop and Fast at 390px. These are viewport checks in the available browser, not a benchmark on physical phones.
- Screenshots and browser check details are saved in ignored `.data/artifacts/atlas-studio-*.jpg` and `atlas-studio-ui-checks.json`. Failure injection temporarily moved the local hip bundle; the file was restored and retry succeeded.
- React Doctor full scan remains 52/100 with 39 advisory findings across the app, matching the prior scan. No broad unrelated refactor or diagnostic suppression was made.
- No measured FPS, actual tissue texture maps or thickness-based subsurface scattering are claimed. The grain is cosmetic; source geometry remains unchanged.
