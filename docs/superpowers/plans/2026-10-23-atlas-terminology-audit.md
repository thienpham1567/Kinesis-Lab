# Atlas Vietnamese Terminology Audit Implementation Plan

> **For agentic workers:** Execute inline in the existing Atlas feature branch. The user authorized item 1 (terminology research and corrections); retain the current uncommitted work and do not commit or merge.

**Goal:** Compare all 216 translated muscular-layer names against accessible Vietnamese institutional anatomy material, preserve English/Latin identities, and expose term-specific evidence and remaining uncertainty.

**Architecture:** Keep display names separate from a typed evidence registry. Every translated key receives an explicit audit result; direct term matches, parent-only matches and unavailable evidence remain distinct. The selected structure opens its specific sources without changing catalog/mesh evidence.

**Tech Stack:** TypeScript, existing Next.js/React Atlas components, public institutional PDF/HTML sources, Poppler for PDF text and page inspection.

## Tasks

- [ ] Read hospital anatomy lecture and university teaching/research sources. Record author, URL, PDF page (one-based), exact scope and access date. Check ambiguous lists against rendered pages. Exclude inconsistent name pairs and unverified editorial atlases.
- [ ] Audit the 216 existing English keys. Correct only supported discrepancies; retain authored translations and explicit gaps where full-term evidence is unavailable. Distinguish longissimus/longus, hand/foot and named heads/parts.
- [ ] Create `src/lib/clinical/atlas-terminology-evidence.ts` with typed sources, per-term results and truthful null reviewer metadata. Add a reusable selected-term source panel and integrate with the inspector Sources tab. Read installed Next component guidance before UI edits.
- [ ] Update `public/anatomy/3d/TERMINOLOGY.md` with the complete term table, source pages, coverage counts, excluded sources and limits. Add a review record under `docs/superpowers/reviews/`.
- [ ] Use the previously authorized Atlas verification workflow: check registry coverage against all dictionary keys, TypeScript, affected-file ESLint, existing Atlas learning check and inspect selected examples in the browser. Record actual results and remaining evidence gaps; do not equate software checks with medical validation.
