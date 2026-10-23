# Atlas stability and interaction regression review

Date: 2026-10-23. Scope: Atlas Learning Studio and smoke inspection of its sibling Atlas tabs. Changes remain uncommitted on `codex/atlas-learning-studio`.

## Findings fixed

### Region selection did not update the address

Observed a full-body workspace while the address still contained `area=upper`. The region handler only updated React state, so reload could restore the previous URL's region.

Added `atlasAreaHref` and native history synchronization using the installed Next documentation. Changing regions clears stale structure/group/exercise query targets. An applied-route ref prevents the local history update from causing a second manifest request that could overwrite a subsequent selection. Verified region URLs during the six-region matrix and verified `upper` remained selected after reload.

### Source-label raycasts blocked interaction

Instrumentation showed that the existing renderer-only timing excluded callout raycasts and layout. Added bounded DOM diagnostics for total frame CPU elapsed work, label work and a frame counter. These do not measure GPU time or FPS.

Before acceleration, a whole-body drag produced a 168.50 ms rolling median, a 194.00 ms P95 and 187.70 ms label work in the final sampled frame. The same drag after acceleration produced an 18.30 ms rolling median and 7.00 ms final label work. The latter short window still included cold initialization samples.

Added the pinned `three-mesh-bvh@0.9.16` dependency. Its [documented BVH and first-hit raycast support](https://github.com/gkjohnson/three-mesh-bvh) accelerates source-surface queries. The implementation uses per-mesh overrides and indirect trees, preserves source indices/positions, yields between geometry builds, checks cancellation during region replacement, and clears tree references on disposal. No global Three prototype is changed. Labels continue to follow the camera; they were not deferred or removed during interaction.

## Automated verification — passed

- `npm run check:atlas-learning`: 7 new regression groups covering region URLs, all 429 muscular-layer records/216 bilingual keys and both-language lookup, six regional lesson configurations, regional source references, finite/cancellable camera transitions, orthographic anchors/occlusion, exact accelerated hits, unchanged geometry and tree cleanup/cancellation.
- Existing render, hip study, tissue detail, Atlas evidence, asset surfaces, source presentation, region evidence, evidence coverage, training Atlas, trigger evidence, trigger presentation and muscle evidence checks: all 12 passed again after the fixes.
- `npx tsc --noEmit --incremental false`, full `npm run lint`, `npm run build` and `git diff --check`: passed.
- Full React Doctor: 52 existing warnings, score 55/100. No reduction to zero is claimed. Log: `/tmp/kinesis-atlas-stability-react-doctor.log`.
- Dependency audit reported five high-severity findings in the existing ESLint dependency chain (`eslint-config-next` → plugin/glob/micromatch/braces). None was attributed to the new BVH package. No force-upgrade or unrelated dependency migration was performed.

## Browser matrix

- **Development:** all 5 lesson steps in each of 6 areas — 30 successful step checks, one canvas, correct active step, no model error. Every self-check could reveal its answer and had Next disabled at the last step.
- **Local production:** built app started on loopback port 3001; repeated all 30 step checks across all 6 areas. Correct region addresses and no captured warning/error console entries. Temporary server/tab were stopped/closed after inspection.
- Eight projection switches: correct orthographic/perspective state, finite camera coordinates, one canvas and unchanged sampled texture count across the switches.
- Eight rapid region replacements, including full-body loads: final hip bundle loaded correctly, one canvas, no captured warning/error entries.
- Hide the isolated example: empty-state recovery appeared. Restore made geometry visible again. Clicking the bilingual brachioradialis label selected its structure; isolation rendered 21,948 triangles. Free exploration restored perspective/search, and reopening the lesson restored its viewing preset.
- Repeated fast/detailed/auto changes: modes switched correctly and sampled texture counts returned to the same values. Muscle opacity 15% disabled AO and 100% restored it.
- Idle frame counter stayed at 13 across the intervening checks; no continuous rendering was observed while stationary.
- Inspector Home/End navigation changed selected tab and focus together.
- All six areas at 390px: one canvas, fast mode, no model error and no horizontal page overflow. Additional 320/768/1280px resize checks produced finite views and no horizontal overflow.
- Training tab loaded the shared canvas in perspective mode with no model error. Trigger Point and clinical rehabilitation tabs rendered in a smoke inspection. No training record, patient data, chat request or paid image generation was submitted.

### Local production frame CPU samples

Recorded after the lesson sequence, using the rolling last 32 rendered samples at a 1280px viewport with automatic detailed quality. Units are milliseconds. These are CPU elapsed work including labels, **not measured GPU FPS**.

| Area | Median | P95 | Last label work |
| --- | ---: | ---: | ---: |
| Full body | 9.20 | 14.50 | 2.80 |
| Neck | 2.50 | 3.20 | 1.60 |
| Upper limb | 3.90 | 4.70 | 1.80 |
| Trunk | 4.90 | 6.20 | 2.60 |
| Hip | 1.80 | 2.20 | 1.40 |
| Lower limb | 3.90 | 4.70 | 1.60 |

Cold asset decode, BVH construction and shader compilation can take longer and are not represented by these warm-window numbers. Desktop viewport emulation is not a benchmark on physical phone hardware. GPU context loss, real network failure/retry and OS reduced-motion emulation were not injected in the browser; scheduler cancellation/immediate mode and resource failure paths have narrower automated checks. No prolonged memory soak or clinical validation is claimed.

## Evidence

- [Verified desktop workspace](assets/2026-10-23-atlas-stability/desktop-verified.png)
- [Verified phone layout](assets/2026-10-23-atlas-stability/mobile-verified.png)

The existing public anatomy assets and medical evidence records were not changed by these fixes. Temporary viewport overrides were reset, and the development server on port 3000 is retained. No commit, merge or deployment was performed.
