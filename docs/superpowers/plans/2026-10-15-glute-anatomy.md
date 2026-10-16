# Gluteal anatomy plates

Goal: replace the missing intact gluteus maximus view with a detailed, attributed textbook illustration and retain access to deeper layers.

Design: use the unmodified public-domain scans of Johannes Sobotta's 1909 atlas, plates 294 (intact maximus) and 295 (maximus cut/reflected, medius exposed). Keep the existing OpenStax plate as the deep view, explicitly naming its cut maximus/medius. Only the glutes group receives additional plates. The existing viewer selects one plate at a time and opens its full-resolution local asset in a separate tab when requested.

Files: two PNG assets and a source manifest under `public/anatomy`; plate metadata in `src/lib/clinical/muscle-hypertrophy-atlas.ts`; layer controls and matching lightbox metadata in `src/components/MuscleHypertrophyExplorer.tsx`.

- [x] Inspect source metadata, rights statements and both Sobotta images in Browser.
- [x] Confirm the existing Mông view has only the OpenStax cut-muscle plate and no layer controls.
- [x] Download original PNGs and verify dimensions and published SHA-1 values. Also fetch the unmodified 1713 × 2175 OpenStax JPEG for the deep view.
- [x] Add three labeled views, descriptions, source links and the full-resolution image link.
- [x] Verify all layers, lightbox, Escape, source links, original-resolution links and reset on muscle selection in Browser; verify another muscle remains usable.
- [x] Run lint, TypeScript and production build; inspect final diff.

Scope: image selection/presentation and provenance. This change does not certify the rest of the atlas or exercise-science copy.
