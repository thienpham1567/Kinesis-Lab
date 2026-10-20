# Cable curl source-anatomy pilot

User approved on 2026-10-20: one cable-curl pilot using actual Z-Anatomy geometry, moving elbow/forearm, qualitative muscle highlighting, playback/scrub/speed/view controls and video export. Expand only after quality review. This is an explicitly unvalidated educational simulation; no clinical or per-vertex activation certification.

## Asset gate

Audit the already downloaded upstream Z-Biomechanics Blender source for armature bones, weights, constraints and animations with embedded script auto-execution disabled. Reuse source rig/weights if functional. Do not generate a primitive mannequin, infer verified attachment footprints or claim mesh-derived rig parameters are measured anatomy. Keep any authored motion range/timing and any necessary rig repair explicitly listed as display conventions with `reviewedBy: null`.

## Implementation

Create a dedicated derived single-arm animation asset with source IDs/material tissue parts and a provenance/limits sidecar. Keep the static atlas assets intact. Use a separate viewer/player so animation cannot mutate the static Atlas stage. Clip depicts an explicitly named single-arm low-cable curl example; motion does not set personal training ROM/load. Highlight the source biceps brachii/brachialis/brachioradialis as elbow-flexor teaching structures with claim-level OpenStax section 11.5 support; no %EMG or phase-varying strength inference. Deep muscles may be occluded unless isolated.

Player supports play/pause, scrub, replay, speed, oblique/front/side view, highlight toggle and individual source muscle isolation if available. Export one complete labeled cycle to a browser-supported video format; detect codec support, show progress/cancel/errors, release stream tracks and blob URLs. Include simulation/review and source attribution inside exported content. No automatic audio recording, external upload or private client data.

## Acceptance

Source geometry visibly moves through a cycle, rests and loops without snapping; exact muscle structures can be highlighted; joint/tendon artifacts are visually inspected at start/mid/end poses. Visible source/limit card differentiates literature facts from source rig and authored animation. Export produces a playable nonempty video containing the labels. Test desktop/mobile, keyboard and reduced-motion (paused initially), asset/load/export errors, cleanup and static-view regression. If source rig/deformation is unusable, document the concrete defect; do not replace anatomical movement with a camera-only clip or label a mock animation as finished.
