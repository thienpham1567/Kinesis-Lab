# Shared contextual anatomy across Atlas tabs

User authorization: on 2026-10-23 the user approved assessing and implementing reuse of the existing anatomy 3D component in all three remaining Atlas tabs. This extends the compact Trigger Point design discussed in chat; no additional approval round is needed.

## Product behavior

Use the existing Atlas3DCanvas/AtlasStage and licensed source bundles, with a compact contextual controller rather than a second rendering engine. Keep the established Kinesis typography, blue selection, neutral panels and clear source limits. Purpose: select a topic, inspect its structures, and read the corresponding existing knowledge.

- Training: retain the existing exercise viewer and curl simulation; add the shared viewer to muscle-group lookup. Clicking a supported muscle can open its teaching group.
- Trigger Point: the muscle lookup shows the actual catalog muscle components, a side selector, readable structure selector, front/back/side views, isolation and optional surrounding anatomy. Selecting another supported source muscle opens the matching knowledge. Keep source plates in a disclosure. Symptom lookup keeps its symptom locator and displays neutral regional 3D context; it never infers a painful muscle from a mesh hit. Handbook remains text.
- Rehab: default to the shared regional viewer in the Atlas tab, synchronized with the eight existing region buttons and knowledge panel. Clicking catalog structures with a supported clinicalRegion navigates to that region. Keep the existing 2D illustrations as an alternate view. Other consumers of BodyMapExplorer keep their current behavior.

## Data and boundaries

A pure adapter maps trigger teaching entries to exact existing English catalog names, training to existing group membership, and rehab to existing catalog clinicalRegion. The smallest bundle containing all requested structures is selected; never silently omit a component because one regional bundle lacks it. Unmatched structures do not invent a knowledge mapping. These are navigation associations using source metadata, not new clinical assertions or validated spatial maps.

The shared viewer owns its manifest fetch, bounded loading/retry, local view/layer/side/isolation state and canvas lifecycle. Context changes reset transient state, and toggling a hidden structure clears selection/isolation so stale state cannot return. Keyboard users can select the same structures through native controls. Loading/WebGL failure leaves the existing knowledge and source images available.

## Medical limits

Retain existing claim-level citations, access/review dates, referral guidance and truthful reviewedBy metadata. No trigger coordinates, referral heatmaps, measured fibers, tissue measurements or treatment animations are added. Explicitly distinguish source model provenance from educational evidence. Expert review is optional under the user's evidence policy; no new universal review gate.

## Acceptance

Actual catalog tests cover all 10 trigger entries, 11 training groups and 8 rehab regions, bilateral selection, smallest complete bundles, unknown mappings and stale isolation resets. Run existing trigger presentation/evidence, training observation, Atlas rendering/learning/evidence, lint, typecheck and production build. Browser-check actual WebGL, topic changes, keyboard controls, 390px/1440px layouts and the original anatomy tab. Record actual results and limitations. No AI submission, client mutation or deployment is needed.
