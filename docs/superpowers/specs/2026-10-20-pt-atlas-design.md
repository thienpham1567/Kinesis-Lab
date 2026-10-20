# PT Atlas workspace

User approved on 2026-10-20 the proposed priorities: exercise to joint motion/participating muscle groups, muscle to attachments/function/exercises, interactive 3D layers, coaching options, and recording load/reps/RPE/feedback. This is an implementation of those approved flows within Kinesis Lab. Existing medical accuracy requirements and pending changes are preserved.

## Direction

Use the existing clean clinical workspace: white surfaces, cobalt actions, dark ink, measured spacing and existing fonts. The anchor is an exercise header followed by a static source anatomy viewer and muscle roles. A second mode starts from muscle anatomy. It adapts to 390px without horizontal page scrolling. No new commercial assets or copied interfaces.

## Architecture

- New TrainingAtlasExplorer replaces the old hypertrophy view as the PT entry point, retaining tab=hypertrophy URLs. Support exercise and muscle deep links and browser history.
- Pure training-atlas helpers select by exercise, muscle, query and pattern, map existing qualitative roles and construct explicit 3D group links. Preserve old clinical IDs and reviewed evidence. No invented activation percentages.
- Actual Z-Anatomy meshes provide static source anatomy in the exercise workspace. Group memberships are educational, not per-structure measured activation. No anatomical exercise animation is delivered; rigging, deformation and qualified spatial review remain outstanding. The procedural mannequin was rejected by the user and removed from runtime.
- Existing real Atlas gains group focus from links and a selected-group anatomy/exercise card using reviewed group records, with source limits. No precise attachment pins without reviewed mesh mappings.
- Training logs persist per client via dedicated API and local store, with Supabase persistence when configured through an explicit migration. Capture date, exercise, load/unit, sets/reps, RPE scale/feedback; no automatic medical clearance or prescribed loading. Validate ranges; support errors, history and deletion.
- Finish previously authorized evidence integration: source coverage index, bounded relevant AI context, catalog provenance for all structures, and accurate policy scope. Source comparison remains distinct from clinician review.

## Acceptance

Exercise and muscle searches work; changing exercise updates qualitative roles/source anatomy; selecting a group reveals anatomy and related exercise links. 3D links focus the appropriate catalog groups, with view/layer controls retained. No playback or synthetic exercise animation is exposed. Existing on-demand rendering and resource disposal remain in use. Client logs save/reload/delete and remain isolated by client. Old routes remain valid. Domain checks, lint/build, React Doctor and desktop/mobile keyboard UI checks are reported with honest outstanding limitations.

## User correction during UI review

On 2026-10-20 user rejected the procedural mannequin as visually inadequate. Replace it with the actual Z-Anatomy anatomical meshes in the exercise workspace. Provide anatomical group filtering, bone context, source-structure selection and camera control. All geometry stays static; anatomical exercise animation remains unavailable pending appropriate rig/assets and qualified review. The rejected prototype is removed from runtime.
