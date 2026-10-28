# Atlas geometry candidate comparison — 2026-10-28

This investigation follows the 2026-10-27 audit. Source comparison is educational acceptance evidence, not clinical validation. No independent professional review occurred (`reviewedBy: null`). No candidate below has been substituted into production.

## Pinned Z-Anatomy source actually recovered

Repository: <https://github.com/Z-Anatomy/Models-of-human-anatomy>, commit `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`. [Downloaded archive](https://raw.githubusercontent.com/Z-Anatomy/Models-of-human-anatomy/0dd2329622c42b4fdcaabbf5ff6ad234df49b659/Z-Anatomy.zip), read 2026-10-28.

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| Z-Anatomy.zip | 86,734,957 | `e029688545627bd0214b269e1063143abb580aad72b2c2445d6d8a9a0d9da736` |
| Startup.blend | 306,838,281 | `9f08a17ea0115fed80b2a73ecdf0a1bc2ab2f6956f37c593ce23d513ea35afcd` |

The archive Git blob SHA-1 is `f43cabc6f366b2a6058dd2ed4a2b3c7b9b2492cb`. Local ignored artifacts: `.data/z-anatomy/`, including `source.json`, `inspect_pilot.py` and `pilot-source-inspection.json`. Inspected using Blender **5.2.2 LTS**, with embedded Python auto-execution disabled:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --disable-autoexec .data/z-anatomy/Startup.blend --python .data/z-anatomy/inspect_pilot.py
```

The existing exporter copies base mesh data without the modifier stack. All ten pilot structures have upstream Solidify modifiers with an authored thickness of about **0.0005 m**. This is a display construction parameter, **not measured tissue thickness**. ATFL/CFL also have subdivision (viewport 1, render 2); acromioclavicular and sternoclavicular discs have subdivision 2; distal radioulnar discs have no subdivision. Solidify offset is +1 for ATFL/CFL and −1 for the discs. These modifiers can restore the author's intended display but do not establish a more accurate anatomical volume or attachment footprint. Original source collections also distinguish the pilot left/right objects.

No wholesale re-export is accepted solely because it adds polygons. Current assets remain schematic where appropriate. A source-faithful display variant requires isolated export, registration/bounds/side checks and comparative browser QA before default use.

The original stacks were evaluated in memory without changing their viewport settings. [Reproducible script](assets/2026-10-28-atlas-geometry/evaluate_pilot.py), [actual result](assets/2026-10-28-atlas-geometry/pilot-modifier-evaluation.json), and [source hashes](assets/2026-10-28-atlas-geometry/source.json) are retained. Each ATFL/CFL goes from 2 to 32 triangles; each acromioclavicular/sternoclavicular disc from 4 to 176; each distal radioulnar disc from 7 to 28. All evaluated pilot polygon edges have two incident faces. This proves a change in authored topology only. It does not establish medical superiority or justify presenting the new closed surfaces as measured anatomical volumes. The evaluated variant is therefore retained as research, rather than replacing production meshes in this batch. Blender emitted one dependency-cycle warning for the excluded oesophagus objects; pilot evaluation completed for all ten objects, with source scripts skipped.

## Independent replacement candidates

All sources below were accessed 2026-10-28. Candidate research examined actual availability and license/coverage, rather than assuming an article's illustrations provide reusable meshes.

| Candidate and actual access | License / coverage / finding | Decision |
|---|---|---|
| [Hamze forearm model, Zenodo](https://doi.org/10.5281/zenodo.3728255): official record/API and downloaded `forearm_model.zip` | CC BY 4.0. Actual `discs/disc_pt609.ply`: 1,204 vertices, 1,146 triangles, finite positions; 54 index-boundary edges, no edge with >2 incident faces (unwelded). No README resolving units, side, acquisition or validation. [Related framework](https://arxiv.org/html/2003.11025) approximates ligaments from insertion points; it does not validate this disc. | Research candidate for distal radioulnar disc only; insufficient identity/registration evidence for replacement. |
| [University of Denver Visible Human](https://digitalcommons.du.edu/visiblehuman/): official repository descriptions | CC BY 4.0; knee ACL/PCL/MCL/LCL, no target ankle ligaments or upper-limb pilot discs established. | Reject for current pilot coverage. |
| [University of Malaya dataset](https://doi.org/10.22452/RD/5T6TZ7): official record, README and actual ZIP directory | CC0; ACL/LCL/MCL/Patella/PCL entries, no ATFL/CFL or upper-limb discs. | Reject for current pilot coverage. |
| [Shanghai Jiao Tong ankle modelling article](https://pmc.ncbi.nlm.nih.gov/articles/PMC10166853/): full article | Article CC BY; separately downloadable distributable meshes not established. CFL represented as 1D truss in the model. | Reject as an immediately reusable anatomical replacement. |
| [Lyon acromioclavicular model/video](https://anatomytool.org/content/3d-anatomy-lyon-acromioclavicular-joint-video-3d-model): repository entry | CC BY-NC-ND; no reusable disc mesh established; modification/distribution restrictions incompatible with intended integration. | Reject. |

Downloaded Zenodo ZIP SHA-256: `9e88aaf7a87722019f8f947ccfc3fdf84d259715936d00ddd2ba2f713c436ee3`; ZIP MD5 matches the record `2ed767686667e5faeb8c04726776c786`. The examined disc SHA-256 is `9e4ae74cf522071dfcb8e63902c4fdddb661497a7fa157bfbd4161d0d946d201`.

No external candidate currently qualifies for production replacement. Retaining and clearly labeling the current schematic representation is an explicit permitted outcome of the geometry plan. Increasing polygon count, closing a membrane, or adding AI fibers cannot by itself satisfy anatomical acceptance. The pinned Z-Anatomy derivative retains its recorded license chain; later changes to BodyParts3D licensing do not silently relicense these assets.

## Production inventory and accepted scope

The [engineering inventory](../../public/anatomy/3d/geometry-quality.json) was intentionally generated from the distributed full GLB using [the audit](../../scripts/audit-atlas-geometry-quality.mjs), then compared read-only. Full GLB SHA-256: `bb1a7269cabab3b86112962777bb4509527dda79bae6094324e266a9145c1b1f`; source asset version remains 2. Manifest bytes have SHA-256 `cbb63c4ce44d4119d8da1c6e49a74b44adf18f38a4a1d1710d23e580082eb984`.

The actual baseline is 1,031 structures, 1,411 primitives, 2,368,785 triangles and 1,393,895 decoded position slots. All position components and their world transforms are finite. There are 154 structures with at most ten triangles and 58 with exactly two. These are engineering counts, not a medical quality score. The audit rejects a changed asset hash/version or baseline count until that difference is explicitly investigated; `--apply` does not bypass the baseline.

Topology uses a world-position grid of 1e-7 m per structure across all material primitives: each component maps to `Math.round(component / 1e-7)`, and identical integer triples share one vertex. This is quantization rather than a distance-based weld; adjacent grid cells do not merge. Undirected edges with one incident triangle are boundaries and those with more than two are nonmanifold. Triangles whose vertices collapse together are reported and excluded from edge incidence. The resulting 76,058 boundary and 9,578 nonmanifold edges, and 60 triangles collapsed by this weld, describe this specific algorithm. They are not evidence of pathological anatomy, tissue thickness, orientability, or defective intentional membranes.

All ten exact pilot IDs match the original Blender evaluation names and sides. Each ATFL/CFL has 2 production triangles and 4 boundary edges; each AC/SC disc has 4 triangles and 6 boundary edges; each distal radioulnar disc has 7 triangles and 7 boundary edges. None of these ten has a nonmanifold edge under the recorded algorithm. Each is marked `schematic-open-surface`, with unverified anatomical volume and tissue thickness. Only those ten knowledge cards receive the small schematic annotation through the shared curated ID module; the full inventory is not imported into the application runtime.

Completed scope: inventory, source/candidate comparison and honest schematic annotation. Geometry replacement is **not done**: production GLBs, exporter, source evidence, whole-body search and rendering are retained. Independent reviewer metadata stays null. The audit's default and `--check` modes do not write the inventory; intentional regeneration requires `--apply`. Regression checks cover finite positions, seam welding, open/closed/nonmanifold fixtures, exact manifest/pilot identity and no-write behavior, including missing/stale inventories. These tests establish software consistency, not clinical validation.
