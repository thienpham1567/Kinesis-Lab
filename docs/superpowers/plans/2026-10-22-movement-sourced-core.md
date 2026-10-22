# Movement: sourced core knowledge plan

## User request and design

Audit the four current Movement tabs, enrich their essential educational knowledge for PTs, expose direct source links next to each scientific claim, and include useful reputable images when their reuse license is confirmed. Keep the existing four tabs, Vietnamese product typography/colors, deep links, readable mobile layout and individual-treatment limits.

Chosen structure: each tab starts with four or five essential points, then explains concepts/measurement, offers explicit app-authored practice examples, addresses misconceptions and provides self-check questions. Every sourced block links to numbered sources. A readable source ledger shows exact title, evidence type, date actually checked and access scope. Original licensed figures have their own attribution, source page, original image link and interpretation limits; do not use protected clinical-test figures without permission or invent patient/measurement photos.

This follows the user's explicit request to apply the changes. No new approval, independent professional signoff, commit, publication or cloud data action is required. Reviewer metadata remains truthful. Software checks are not medical validation. No expert gate is introduced.

## Ownership and files

- Research agents: read-only evidence comparison for patterns/control and symmetry/ROM.
- Root: primary image/license research, source catalog, handbook content/types, page rendering and citation links, four handbook evidence entries, integration checks and UI proof.
- Expected files: `src/lib/clinical/movement-sources.ts`, `movement-handbook.ts`, `evidence-assessment.ts`, `src/app/movement/page.tsx`, focused handbook components under `src/components/movement/`, licensed assets and provenance under `public/movement/`, and a final review document.
- Preserve all existing dirty Atlas, NCSF and other concurrent workspace edits. No source index exists in this repository; do not create one.

## Execution checklist

- [x] Read current page/data/evidence mapping and medical policy; inventory existing four tabs and their sources.
- [x] Reopen sources and document actual support, stale claims, reading boundaries and updated contrary evidence.
- [x] Confirm original figure provenance/license, inspect downloaded figures and keep original labels.
- [x] Implement one shared source catalog; attach resolvable source IDs to each core fact and scientific explanation; identify authored examples explicitly.
- [x] Enrich all four tabs, distinguish CDC passive ROM from JTSS active ROM, and revise claims based on actual retrieved evidence.
- [x] Render concise core points, adjacent citations, source ledger and appropriate original source figures, preserving navigation/keyboard behavior.
- [x] Review source mappings and relevant consistency checks; lint/build/React Doctor after React edits; desktop and compact browser verification. Actual 390-pixel phone width could not be applied by the browser capability; recorded that limit rather than claiming it passed.
- [x] Record exact inventory, fixes, sources, licenses, checks and limits in `docs/superpowers/reviews/2026-10-22-movement-sourced-core.md`; save screenshots and reset browser viewport.
