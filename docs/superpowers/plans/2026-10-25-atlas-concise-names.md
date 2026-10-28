# Concise bilingual anatomy names

User direction: Vietnamese plus short English throughout 3D, following readable source nomenclature. User clarified and authorized implementation in chat; no language-switch feature is requested.

**Goal:** Eliminate concatenated long source names and ellipsized overlay identities while preserving every structure's distinguishing head/part/side and access to original names.

**Architecture:** Keep manifest English/Latin keys and Vietnamese terminology evidence unchanged. Add a conservative English display formatter and reusable paired-name component; integrate all 3D surfaces with those helpers. Short English is display wording, not a replacement for source-catalog keys.

## Design and source comparison

- IMAIOS separates the named structure heading, Latin heading and children such as Clavicular head/Sternocostal head. IFAA's TA98 partonomic list likewise lists Pectoralis major with subordinate heads/parts. Adapt that hierarchy rather than displaying a whole catalog sentence repeatedly.
- Existing Vietnamese translations and their per-term evidence remain intact. Source BVPHCNTW PDF 32 uses Cơ ngực lớn and the subdivisions phần đòn/ức sườn/bụng; source English uses heads for two parts. Retain the app's recorded head/part distinction and its evidence note.
- Pair Vietnamese with shorter English on separate lines in cards/headings and overlay buttons. Native options use the same concise pair in plain text. Overlay names wrap, including qualifiers and side; no forced ellipsis. Full original English/Latin remains in source details/tooltips.
- Apply to all catalog structures through shared formatting, including untranslated structures that keep their English fallback. Do not invent Vietnamese terminology where no translation exists or infer new anatomical equivalences from mesh geometry.

## Tasks

- [x] Add tests of full catalog coverage, unchanged source fields, head/part/hand/foot/long-short distinction, English compaction and original/compact search. Observe expected failure before implementing.
- [x] Add `atlasShortEnglishName`, `atlasDisplayNames` and preserve full-source helper in `atlas-names.ts`. Remove only redundant terminal muscle and reorder explicit head/part/belly-of grammar; unknown grammar stays unchanged.
- [x] Add paired React display component and use in anatomy headings/lists, selected labels, contextual readout, training selection/curl; native option text uses concise plain helper. Preserve source details and annotations.
- [x] Update actual Three.js DOM callouts to show Vietnamese + short English as wrapped lines, maintain full accessible name/tooltip and fit measured bounds safely. Retain bounded candidate count and occlusion.
- [x] Record checked sources and dates with actual access scopes; retain prior medical review metadata truthfully. Run new naming tests and existing Atlas, contextual, training/evidence, lint/type/build checks. Independently review changes.
- [x] Browser-test the attached pectoralis-head case, other divided muscles and nonmuscle names; all 3D consumers, desktop/mobile, callout click behavior, full-source access and overflow. Save screenshots/report and deliver local preview.
