# Atlas search and 3D highlighting

User request: searching a muscle such as Internal Oblique should identify and highlight that muscle in 3D; a missing structure gets a small notice.

The existing catalog already contains bilateral Internal abdominal oblique entries and Vietnamese/Latin names. The current search only filters the list. Reuse catalog names and source IDs; do not invent anatomy, geometry, aliases with uncertain equivalence or clinical approval.

- Resolve typed terms globally across the catalog. A unique named muscle family, including its source-named parts and sides, selects after a short typing delay or Enter. A side-qualified query narrows to that side. An ambiguous query presents choices.
- Prefer an exact catalog/display name over incidental substring matches. Check all 432 distinct displayed muscle names in Vietnamese/English, including their available side qualifiers, rather than relying on the Internal Oblique example alone.
- User clarification: retain the complete opaque body in its normal tissue colours. Highlight only matching IDs in blue. Deep targets draw over covering surfaces without fading surrounding anatomy; this is a search UI overlay, not a claim that an inner muscle is on the skin surface.
- Search opens the whole-body bundle and frames the entire body, preserving query and selection. Zoom and isolation remain explicit user controls.
- A missing query clears stale highlights and gets a concise inline status. Clear/reset/region changes cancel pending search work and restore normal rendering.
- Keep source geometry and medical evidence records unchanged. Callout points remain display anchors rather than measured anatomical landmarks.

Verification: real-manifest resolver tests for Internal Oblique, both languages and Latin, left/right, named heads, ambiguous/missing inputs and cross-region focus; opacity regression checks; browser checks of actual loaded meshes, blue highlighting, labels, camera changes and reset behavior.

Verified locally on 2026-10-27: production build and lint; ten search tests; Atlas render, learning, contextual anatomy, load-deadline and 1,031-name checks; 79 chat/image regression tests after the shared test-loader resolution fix. Browser QA confirmed the two actual Internal Oblique mesh IDs, a Vietnamese right-side query moving from upper to trunk with input focus retained, missing/ambiguous/cleared queries, isolation on/off and cancellation of a pending replacement search. Search clearance also restores surrounding geometry after isolation. No new medical claims or professional review metadata were added.

Clarification revision verified: ten search tests, rendering checks, learning checks, production build and lint pass. Browser QA shows the complete opaque body with only Internal Oblique blue; replacing it with Brachialis keeps the same whole-body camera pose. Searching from upper opens full body with focus retained, and an unknown name clears the overlay. Camera search command fits all visible body geometry rather than searched muscle bounds.
