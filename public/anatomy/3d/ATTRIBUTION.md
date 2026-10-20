# Kinesis Lab anatomy assets

## Source and attribution

- **Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0**.
  Source: https://github.com/Z-Anatomy/Models-of-human-anatomy
  Revision: `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`.
  Original files: `Z-Anatomy.zip` (`Startup.blend`) and `TA2.csv`.
- **BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan**.
  Original model database: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/
- The upstream credits and license notice are preserved in [SOURCE-LICENSE.txt](./SOURCE-LICENSE.txt).
- These adapted model bundles and anatomy metadata are distributed under **Creative Commons Attribution-ShareAlike 4.0 International**:
  https://creativecommons.org/licenses/by-sa/4.0/

## Changes by Kinesis Lab

Exported the source musculoskeletal meshes into glTF 2.0 GLB bundles, compressed with Draco; separated regional bundles; added stable structure IDs, selected Vietnamese display labels, search metadata, and mappings to the existing Kinesis Lab PT library. Source English and available Latin names are retained. Full physical mesh geometry is retained within each selected structure; regional bundles do not create artificial cut surfaces.

Asset version 2 retains the source polygon assignments to seven simplified tissue families: bone, muscle, joint, cartilage, tendon, ligament and fat. Functional muscle colors and numbered bone materials are consolidated within their tissue family. Original material names and face counts are retained in manifest metadata. All 380 structures with multiple tissue families preserve their boundaries. These are source material regions, not independently segmented or validated tissue layers.

The subset excludes the Head collection, viscera, insertion overlays and source label meshes. The upstream notice includes separate credits for organs and head structures that are outside this subset. The selection rule is documented in `scripts/export_z_anatomy.py`; this is a provenance description, not independent anatomical or licensing certification of every upstream mesh.

## Web presentation refinement

Kinesis Lab renders the source meshes with tissue-specific PBR colors/roughness, studio environment lighting, soft shadows, and optional ambient occlusion. A subtle procedural surface grain is cosmetic; it is not a scan, measurement, or anatomical fiber map. Source shape is unchanged. Selected structures receive a subtle blue tint while retaining tissue differences. No additional anatomical accuracy or photorealistic tissue validation is claimed.

## Derived geometric thickness

Ten audited closed meshes (left/right acetabular labrum, femur, hip bone, gluteus maximus and gluteus medius) include custom scalar vertex attributes `_THICKNESS` and `_THICKNESS_VALID`. The method `inward-normal-cone-median-v1` casts five rays around each inward vertex normal, takes the median projected exit distance, and accepts at least three exits. Values use source world coordinates in metres (source scene scale length 1). Open/non-manifold meshes and coverage below 95% are rejected. Invalid vertices carry zero value plus zero validity; they are not filled. Metadata statistics exclude invalid samples. Coverage is 99.94–100% for these ten meshes.

The optional heatmap uses a fixed qualitative 0–100+ mm scale, with invalid/interpolated invalid areas shown gray. This estimates distance across the whole mesh, not cortical bone thickness or individual cartilage/tendon layer thickness. It is neither measured tissue data nor optical/clinical calibration. The optional simulated hip material study uses this estimate for an artistic backlighting approximation, not calibrated optical subsurface scattering. The method is sensitive to mesh shape, normals and concavity. No photographic tissue maps are added. Implementation and synthetic checks are in `scripts/z_anatomy_surfaces.py` and `scripts/check_thickness_bake.py`.

## Scope and limitations

This is an educational musculoskeletal subset, not a complete body atlas or a diagnostic tool. Vietnamese names cover selected common structures; other structures retain their source English names. Regional and muscle-group mappings are navigation aids. The source model and translations have not been clinically validated by Kinesis Lab. Existing PT notes are regional context, not newly authored claims about each mesh.

No Z-Anatomy Blender add-on code is executed or included in the web app. Mesh and metadata licensing is described above; it is separate from the application's source code.

## Runtime dependencies

- Three.js: MIT, notice in [draco/THREE-LICENSE.txt](./draco/THREE-LICENSE.txt).
- Draco decoder: Apache License 2.0, notice in [draco/DRACO-LICENSE.txt](./draco/DRACO-LICENSE.txt).
  Decoder files are copied from the installed Three.js package, not loaded from a CDN.

## Reproduction

Use Blender 4.5.9 with the source revision above. Put `Startup.blend`, `TA2.csv`, and `source.json` containing repository and commit fields in ignored `.data/z-anatomy/`, then run from the project root:

```sh
blender --background --factory-startup --disable-autoexec .data/z-anatomy/Startup.blend --python-exit-code 1 --python scripts/export_z_anatomy.py
```

Copy the upstream license to `SOURCE-LICENSE.txt` and the decoder files from `node_modules/three/examples/jsm/libs/draco/gltf/` to `draco/`, preserving the notices. The source `.blend` is not needed by the browser.

## Simulated hip material study (2026-10-16)

Eight eligible bilateral structures (gluteus medius, femur, hip bone and acetabular labrum) have an optional Original/Simulated material comparison. Both use the same studio lights, background and camera. The study preserves geometry and source tissue assignments.

`textures/muscle-simulated-v1.webp` is an AI-generated, unlit illustrative albedo tile, not a human tissue photograph. It was generated for Kinesis Lab and optimized to 1024×1024 WebP (217,952 bytes). Origin, prompt, hash and processing are recorded in [textures/PROVENANCE.json](./textures/PROVENANCE.json). Included illustrative asset distribution: CC BY-SA 4.0; this is not a claim of exclusive copyright in an AI-generated image. No third-party meat/food asset was incorporated. Triplanar color sampling uses a nominal 30 mm art scale. A periodic four-offset crossfade, explicit texture gradients and mip filtering soften mismatched illustration edges. Apparent fine striations are cosmetic and do not represent validated muscle fiber directions. The illustration supplies color only; it no longer supplies bump or roughness.

Four independent 256×256 packed data maps (`muscle-detail-v1.png`, `tendon-detail-v1.png`, `bone-detail-v1.png`, `cartilage-detail-v1.png`) supply simulated normal and roughness detail. They are generated from deterministic periodic mathematical fields in `scripts/tissue-detail-fields.mjs`, not photographs, tissue scans or measured material channels. Muscle and bone use smooth periodic noise to avoid a regular woven pattern; tendon has subtle illustrative striations and cartilage a restrained smooth profile. `R/G/A` encode normal X/Y/Z and `B` encodes linear roughness. Data maps are uploaded without vertical flipping or color conversion; alpha is a data channel, not opacity. Surface-gradient projection blends the three world-space projections. Mip filtering, footprint attenuation and mean-normal variance reduce distant shimmer. The four maps total 228,976 bytes; origin, parameters and hashes are recorded in [textures/DETAIL-MAPS.json](./textures/DETAIL-MAPS.json). Regenerate with `node scripts/build-tissue-detail-maps.mjs` (requires Sharp). These Kinesis Lab illustrative maps are distributed under CC BY-SA 4.0.

Nominal surface periods (6–12 mm), cosmetic height amplitudes (2–8 µm), roughness and orientation are art settings, not measured tissue properties. The maps load only when the study is requested, as one atomic five-image batch with the existing color illustration. A missing image keeps the original material and offers retry. Close-up camera controls target actual source triangles; they do not subdivide, displace or smooth the source geometry. Existing polygon silhouettes, tissue-region boundaries and geometry limitations remain visible when magnified.

Muscle-only backlighting follows the technique illustrated by the installed Three.js SubsurfaceScatteringShader (MIT), using the existing per-vertex thickness/validity. The 9 mm attenuation length, color, distortion and strength are art settings. Invalid/zero thickness and transparent muscle suppress this contribution. Heatmap output takes priority. This is a real-time translucency approximation; no measured optical coefficients or tissue-specific scattering validation is claimed. Tendon, cartilage and bone retain separate surface profiles without this muscle scattering term.

Gross-shape reference comparison: OpenStax Anatomy and Physiology 2e [11.6](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs) and [9.6](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints). Reference links do not certify the source mesh or synthetic texture; no OpenStax image is redistributed by this study.

## Source-region labels and anatomy evidence (2026-10-19)

Bilateral gluteus medius has optional “muscle belly” and “tendon region” labels. Each label is placed at a camera-facing ray hit in the corresponding source material region. It is hidden when occluded, outside the view or lacking enough display space; its text position is not moved onto another tissue to fit the viewport. These are navigation labels, not measured anatomical attachment landmarks.

The accompanying educational fact record links each statement to its source (UW Radiology Muscle Atlas, McGraw Hill Gross Anatomy table 35-1, StatPearls superior gluteal nerve, and anatomical studies PMID 23625344 and 30653048). The source comparison date is recorded separately from independent clinical/anatomical review, which has not occurred. No third-party illustration is included. A geometry-inferred fan field was investigated and withheld after the requirement for verified medical accuracy; no new fiber direction map is shipped. The existing synthetic material remains explicitly cosmetic.


## Experimental cable-curl arm study (2026-10-20)

`motion/cable-curl-left.glb` derives its 44 left upper-limb source structures from the pinned Z-Anatomy / BodyParts3D meshes above. This derivative asset and exported anatomy videos remain CC BY-SA 4.0 with the attribution chain preserved. `motion/cable-curl-left.json` records source IDs, commit, sources and review limits.

The two-bone display rig uses rest reference coordinates from Z-Biomechanics; muscle skin weights, animation timing/range and cable/handle drawing are authored for this prototype. They are not source muscle attachment weights, measured fascicle paths, EMG data, motion capture or a clinically validated cable-curl demonstration. Full-body technique and grip are not modeled or validated. No independent clinician/anatomist has approved this animation or its mapping. Original static Atlas assets remain separate.

Elbow-flexor teaching claim: OpenStax Anatomy and Physiology 2e §11.5, “Muscles That Move the Forearm”, full section checked 2026-10-20: https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs . This supports the stated gross function of biceps brachii, brachialis and brachioradialis; it does not validate the authored movement or deformation.
