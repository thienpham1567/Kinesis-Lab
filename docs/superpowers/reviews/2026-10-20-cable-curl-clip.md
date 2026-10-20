# Source-anatomy elbow-flexion clip pilot — 2026-10-20

## Delivered scope

Atlas → Huấn luyện PT → Cuốn Tay Trước Bằng Cáp / Ghế Nghiêng now opens a separate experimental left-arm animation study. Only exercise `bayesian-incline-curl` receives this player. Other exercise viewers remain static. The study can switch back to the original static source anatomy.

The dedicated GLB contains 44 source structures, a two-bone authored skin rig and one six-second cyclic animation. Controls provide play/pause/replay, phase scrubbing, 0.5/1/1.5 playback speeds, three camera presets, qualitative highlighting and individual source-muscle isolation. MP4/WebM export captures one composited cycle locally, including simulation, source/license and qualitative-color labels. It preserves the current view/isolation/highlight and uses the original cycle speed.

## Provenance and medical limits

- Source: [Z-Anatomy Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy), pinned commit `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`; upstream license CC BY-SA 4.0. Checked 2026-10-20. Attribution is in `public/anatomy/3d/ATTRIBUTION.md` and the exported frames.
- Geometry: the actual left-arm source meshes in `Startup.blend`, keeping source IDs and bone/muscle/tendon material families. Existing static GLBs are not modified.
- Rest-coordinate references: Z-Biomechanics `LeftArm` and `LeftForeArm`. The source does not provide complete muscle skin weights for this motion. These coordinates are source metadata, not independently verified anatomical landmarks.
- Claim: biceps brachii, brachialis and brachioradialis contribute to elbow flexion. [OpenStax Anatomy and Physiology 2e §11.5, forearm-flexor paragraphs](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs), accessed/compared 2026-10-20. This supports the gross action only, not this spatial rig, exercise technique or quantitative activation. The two source biceps heads make four highlighted structures total.
- Authored choices: two-bone longitudinal mesh-bound skin weights; cosine display timing, 6 seconds, 10–110° offset from source rest pose; schematic cable/handle placement. None is measured kinematics, personal ROM, prescribed ROM, verified attachments or physically validated tissue deformation.
- Orange marks source structures qualitatively. Tendon parts remain ivory. No EMG percentage or predicted force is displayed.
- This is an elbow-flexion study, not a complete cable-curl demonstration: the hand remains in its source open pose; grip, full-body position/stabilization, shoulder configuration and cable mechanics are not established.
- `reviewedBy` remains **null**. Qualified anatomy/biomechanics review of the mapping, weights, joint axis, movement and technique is still pending. Build/tests and visual inspection do not establish clinical validation or photorealism.

## Reproduce the asset

Use the pinned upstream `Startup.blend` and `Biomechanics.blend` in ignored `.data/z-anatomy/`, plus `.data/z-anatomy/source.json` recording the repository and commit. The existing static catalog `public/anatomy/3d/manifest.json` provides stable structure IDs. Blender 4.5.9 was run from the official read-only disk image, with embedded scripts disabled. From the repository root:

```sh
/Volumes/Blender/Blender.app/Contents/MacOS/Blender --background --factory-startup --disable-autoexec .data/z-anatomy/Biomechanics.blend --python-exit-code 1 --python scripts/audit_curl_rig.py > .data/z-anatomy/curl-objects.log 2>&1
/Volumes/Blender/Blender.app/Contents/MacOS/Blender --background --factory-startup --disable-autoexec .data/z-anatomy/Startup.blend --python-exit-code 1 --python scripts/export_curl_pilot.py > .data/z-anatomy/curl-export.log 2>&1
```

The first durable script creates the ignored rest-coordinate audit consumed by the second. The second writes the public GLB and JSON sidecar; it does not edit the source blends. GLB SHA-256 is recorded in the sidecar and checked against the actual bytes. Generated GLB is about 2.6 MB, below the 8 MiB pilot budget. Bone meshes use rigid segment weights; crossing muscles use explicitly authored smooth longitudinal weights. Do not relabel those weights as source-provided or verified insertions.

## Verification completed

- `node scripts/check-curl-asset.mjs` — exact SHA, source IDs, four flexor structures, pending review, provenance, byte budget, GLTF skin/animation attributes. Actual Three GLTF parsing and CPU skin deformation show forearm/hand movement, anchored upper arm, normalized finite weights and loop closure at 0/6 seconds.
- `node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-curl-policy.mjs` — phase clamping, loop/speed/timing validation, phase labels and export aspect preservation.
- `node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-curl-capture.mjs` — **39 synthetic checks**, including unsupported APIs/codecs, prefilled fresh canvas, startup/stop deadlines, cancellation, callback/encoder errors, final frame hold and present-but-suspended animation-frame callbacks. Timeout never returns a successful partial clip. Tracks/listeners/timers are released.
- `npm run check:training-observation`, `npm run check:atlas-render`, `npm run check:atlas-evidence`, `node scripts/check-evidence-coverage.mjs` — passed. Coverage remains 1,107 entries with pending review preserved.
- `npm run lint` and `npm run build` — passed, Next 16.4.1 production output includes all 17 generated pages.
- Focused React Doctor scanned the two React integration files: two warnings were inspected as false positives. The async loading effect checks its AbortSignal before each state update and disposes the stage on cleanup. Object URLs are revoked on replacement and unmount through `videoUrlRef`; no suppression added. Diagnostics are not a medical review.
- Independent code review found an unbounded final-rAF wait; fixed with a bounded final repaint deadline and regression check. Follow-up review confirmed that fix and the projected-box camera math; no remaining concrete high/medium finding in the inspected pilot changes.

## Real browser proof

CUA operated the localhost UI at desktop 1280×900 and mobile 390×844. Mobile document scroll/client width both measured 375 px (no horizontal overflow). Observed: initially paused; play changes pose/phase, pause stops it, keyboard phase seeking, speed selection, view presets, highlight off/on, source-muscle isolation/show-all and successful static ↔ motion switch. Both modes mount one renderer at a time. During export, play is disabled and the canvas is inert. Cancel displayed “Đã hủy xuất video” and re-enabled controls.

The final exported MP4 was downloaded through the native “Tải video” link, then decoded with ffprobe/ffmpeg:

- H.264, 1280×720, **6.101967 s**, **570,939 bytes**.
- Average frame rate `2415000/91421` (~26.4 fps); 30 fps is requested, not guaranteed.
- Start/peak/end frames show actual source geometry moving and the closing frame says **“Kết thúc”**. Source, license and experimental-review labels are readable.
- Evidence: `assets/2026-10-20-curl-pilot/cable-curl-left-prototype.mp4`, `start.png`, `peak.png`, `final.png`, `desktop.png`, `mobile.png`, `static-fallback.png`.

All playback begins paused regardless of motion preference; the OS reduced-motion preference was not separately emulated. Unsupported API/encoder and lifecycle errors were tested synthetically; a real network-load failure/retry and additional browser codec engines were not exercised. Browser QA is not a clinical usability study.

## Next validation gate

Before expanding to more exercises or describing this as medically validated: have a qualified anatomy/biomechanics reviewer assess the spatial mapping, elbow axis, muscle attachments/deformation and grip/shoulder/full-body technique. Replace authored weights/kinematics with reviewed data where required. Preserve experimental labeling until that review is actually recorded.
