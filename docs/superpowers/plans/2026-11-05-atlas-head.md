# Atlas Head Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for bounded source/UI work and independent review.

**Goal:** Restore source head anatomy in whole-body 3D and a dedicated Đầu & mặt area.

**Architecture:** Preserve existing stable IDs/meshes, add an explicit source-head selection policy and head bundle, integrate the existing area/search/focus flow. Extend provenance inventories using actual generated assets, retaining historical baselines rather than silently rewriting them.

**Tech Stack:** Blender Python, Draco GLB, Next.js/React/Three.js, Node test runner.

- [ ] Capture baseline manifest/full bundle and a failing source-head inventory regression in `scripts/check-atlas-head.mjs`: assert `head` area/bundle exists, source skull/mandible/masseter/TMJ IDs are present and match decoded bundle, old IDs remain unchanged.
- [ ] In `scripts/export_z_anatomy.py` and a small importable selection policy, replace the blanket Head exclusion with bounded musculoskeletal head inclusion; preserve source transforms/IDs. Inspect attribution exceptions and exclude separately credited restricted/uncertain inner-ear content. Export only changed full/head bundles so other regional hashes remain intact.
- [ ] Add `head` to AtlasArea/ATLAS_AREAS and region reading config; keep head clinicalRegion null, area camera framing driven by source bounds. Retain selection/search/hide/isolate and existing Clinical Field Notes controls.
- [ ] Add separately sourced core head names and truthful source information; retain raw source names/English/Latin and fallback names where no reviewed translation exists. Do not assign cervical clinical knowledge to head structures.
- [ ] Rebuild catalog and geometry inventories for the actual additive asset version; compare every old ID and preserve historical baseline provenance and review dates. Update attribution/copy/tests with actual counts.
- [ ] Verify relevant Node Atlas tests, TypeScript/lint/build, Impeccable source/page scans, rendered full/head desktop/mobile and interaction. Request independent spec/code review, fix findings, record actual limits and screenshots.
