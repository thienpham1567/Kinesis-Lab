# Tissue surface detail and close inspection

The user approved the proposed next steps: independent normal/roughness maps for the hip prototype and close-view inspection of seams, blur and source edges. Keep the eight-structure scope, Original/Simulated comparison and source geometry.

## Design

Author four periodic numeric surface fields (muscle, tendon, bone, cartilage). Pack normal X/Y, roughness and normal Z into RGBA lossless PNGs; channels are independent of the AI albedo and use linear data color space. These are illustrative surface statistics, not measured anatomy or validated fiber directions. Store deterministic generation parameters, hashes and channel definitions.

Use a shared five-texture lazy batch (albedo plus four packed maps), committing only when the complete set loads. Any failure retains original materials and supports retry; dispose loaded/pending/late textures exactly once. Keep one request batch per stage.

Replace color-derived bump with a world-space surface-gradient normal blend. The four materials sample their own periodic map. Use full normal components for mip-filtered variance adjustment. Blend albedo across periodic offsets with explicit gradients, avoiding the mirrored image's edge discontinuities. Cap high-frequency normal detail by pixel footprint for distant/grazing views.

Add an accessible “Cận cảnh bề mặt” action next to existing focus controls. Raycast the selected structure from the current viewpoint to find an actual visible surface, then place camera/target near that hit. Whole-structure focus/reset restores normal framing. No subdivision, displacement, artificial cuts or anatomical correction.

Preserve all lighting, IDs, picking, opacity, quality policy, field heatmap and cleanup. No additional anatomical accuracy is claimed. Source silhouette faceting may still appear at high magnification because source geometry stays unchanged.

## Verification

Tests first: batch atomicity/failure/retry/late disposal, per-family sampler selection, signed gradient blending, mip/explicit-gradient shader construction, periodic fields and packed normal length/roughness/hash/budget. Browser: 1440×1000 and390×844, muscle/tendon/bone/cartilage close-ups, near/far and oblique views, A/B camera invariance, heatmap priority, opacity, missing-map retry and region/unmount cleanup. Compare source triangle counts and CPU submission/resource diagnostics; do not label these as physical phone FPS/GPU tests.
