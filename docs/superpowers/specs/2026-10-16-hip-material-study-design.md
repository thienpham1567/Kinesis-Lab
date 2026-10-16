# Hip material study — approved simulated prototype

The user approved a focused gluteus medius/hip-joint study, then explicitly chose simulated surfaces after the open-asset search did not establish a suitable licensed human tissue photograph set.

## Direction

Keep the existing clinical editorial UI, cobalt controls, type and layout. The visual anchor is the existing red muscle/ivory tendon boundary with restrained moist highlights and thickness-dependent backlighting. Preserve source shape and material face boundaries. Clearly label the prototype as simulated; texture detail and optical parameters are artistic, not anatomical measurements.

## Approach and alternatives

Extend the installed Three WebGL physical material with a small optional shader patch. Keep the existing fast/detailed quality policy. This preserves the current deployment/browser compatibility and allows same-camera comparison with the original material. A WebGPU migration would expand the scope and require a second fallback path; a photographic atlas pipeline is deferred until usable source assets exist.

## Scope and interaction

A small hip-only study panel opens either isolated left gluteus medius or an assembly of left hip bone, femur and acetabular labrum. A binary Original/Simulated appearance choice changes materials without moving the camera or changing shape. Only those eight bilateral structures are eligible for the new treatment. All six regional bundles, source IDs, picking, opacity, isolation and the estimated thickness heatmap remain usable. The heatmap has visual priority over the material study.

Generate one synthetic, unlit muscle albedo tile, store it in the project and document its origin/prompt/hash. Load it lazily once per stage, only on enabling the study; use a neutral fallback while loading or on failure. Triplanar sampling avoids re-exporting or inventing source UVs. Add restrained derived bump/roughness detail. This is cosmetic detail and does not claim measured muscle fiber directions.

Use the existing thickness and validity fields for approximate muscle backlighting, based on the installed Three subsurface example. Suppress the effect on invalid vertices and transparent muscle. Bone, cartilage and tendon receive separate restrained optical profiles. No calibrated SSS, clinical thickness or additional anatomical validation is claimed.

## Validation

Test shader feature gating, profile restoration, heatmap priority, valid/invalid thickness and lazy resource cleanup. Keep asset URL/version hashes and all existing checks passing. Check desktop 1440×1000/mobile 390×844 with actual UI controls, both study samples, same-camera A/B, quality and opacity, unsupported structures, retry/fallback, and unmount/remount. Capture before/after images and measured CPU render submission/resource counts during drag; distinguish those from GPU/FPS measurements and physical-device testing.

Reference-only anatomy cross-check: OpenStax Anatomy and Physiology 2e sections 11.6 (gluteal region) and 9.6 (hip joint). These support comparison of gross relationships; they do not certify this mesh or any texture. No third-party photographic material is shipped.
