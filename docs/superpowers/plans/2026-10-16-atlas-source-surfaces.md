# Source surface materials and estimated thickness

Approved scope: restore source per-face tissue boundaries across the Atlas, then bake an estimated thickness field for the ten previously audited hip samples. Preserve source shape and stable structure IDs. Keep all submeshes of one structure selectable/hideable/isolatable together. The field is derived from mesh geometry, not measured tissue data.

## Implementation

- [x] Add asset checks that fail on current flattened bundles: a femur must contain bone and cartilage primitives; gluteus medius must contain muscle and tendon; stable parent IDs cover every structure; sampled thickness is a valid scalar vertex attribute.
- [x] Add a Blender helper for tissue classification and inward-normal cone ray casting. Validate it on a known closed cube and reject open meshes.
- [x] Export clean PBR tissue families while retaining source face assignments; keep source material names and face counts in metadata. Bake a scalar thickness and validity field for audited hip samples only. Export custom attributes through Draco and version bundle URLs by content hash.
- [x] Respect the primitive's tissue family in the renderer. Preserve opacity, selection and cleanup across all child meshes. Add an optional selected-structure thickness view with explicit estimation labels and a fixed 0–100+ mm qualitative scale.
- [x] Add inspector labels for source surface families and thickness availability, without exposing raw internal IDs or implementation details to the user.
- [x] Run asset checks, renderer checks, lint/build, independent review and actual desktop/mobile browser interactions, including picking on a tendon/cartilage child, isolate/hide/opacity, quality switching, heatmap reset, deep links and navigation cleanup. Save screenshots and actual results.

The thickness algorithm samples the opposite surface along a narrow cone around inward vertex normals. A separate validity attribute marks failures; unsupported topology or low ray coverage yields no field. Do not fill missing samples with invented measurements. Keep the original polygons, source coordinates and material boundaries intact.
