# Kinesis movement atlas 3D

The user confirmed upgrading Atlas within Kinesis Lab using Z-Anatomy. Deliver a working musculoskeletal web atlas with real source geometry, not a general replacement for every Z-Anatomy feature or a claim of superior clinical accuracy.

## Experience

Add an Atlas 3D tab in the established Clinical Field Notes workspace. A large pale 3D stage supports orbit, zoom, front/back/side views, reset, picking and focusing a selected structure. A searchable accessible list provides an equivalent to pointer picking. Layer controls show bones, muscles and joint structures; users can isolate or hide a structure and restore visibility. A selected-structure inspector displays source names, translated labels where curated, side, layer, related existing clinical region, exercises and a draft consultation link. Share links restore region and selected structure. Explicit loading/error/WebGL fallback states link back to the existing 2D atlas.

## Assets and architecture

Pin Z-Anatomy source commit `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`. Export physical skeletal/muscular/joint meshes to clean Draco GLB bundles; omit source scripts, labels, insertion overlays and visceral/ear models. Keep source coordinates and geometry intact, replace Blender-specific shaders with restrained web materials. Include generated metadata, attribution and CC BY-SA 4.0 notices alongside assets. Original GPL add-on code is not copied into app code.

Three.js stays behind a dynamically loaded client component. The renderer owns camera, picking, resizing, render scheduling and GPU cleanup. React owns region, selection, hidden structures and controls. Metadata and pure visibility/search helpers are independent of WebGL with explicit state precedence. Existing safety rules and medical content are reused without inventing new diagnoses or simulation claims.

## Acceptance

Real meshes render and can be selected from canvas and keyboard list. Region/layer/isolate/hide controls agree with the scene and labels. Focusing and reset fit visible geometry; clicking after orbit does not select accidentally. Stale loads cannot overwrite a newly selected region; unmount releases renderer/controls/resources. Search handles Vietnamese accents, source English names and Latin where supplied. Desktop and 390px have no page overflow. Build, lint, source/asset inspection and a real browser render are required. No automated test suite is added or run without a user request. AI generation remains dependent on existing credentials.
