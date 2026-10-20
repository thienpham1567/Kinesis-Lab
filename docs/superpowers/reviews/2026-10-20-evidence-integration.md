# Evidence integration — 2026-10-20

## Scope and state

This integrates the research already recorded in the domain modules; it adds no new anatomical, treatment or diagnostic claims. Source checked dates and access scopes remain those of the underlying source review. Integration work, software checks and source comparison are not clinical validation. All reviewer identities remain null; independent content, translation and spatial review is pending.

The registry includes 1,107 unique prefixed IDs: 8 regional anatomy records, 11 muscle groups, 13 exercises, 10 trigger-point muscle entries plus 1 general protocol, 8 illustrative pain sites, 4 handbook lessons, 17 ROM movements, 4 workflow records (screening, medication, lab extraction and assistant), and 1,031 source-only catalog structures. Pain-site records combine the general limits with sources for the linked muscle entries; they do not establish individually validated pain maps. The regression inventory is explicit so changed counts require review rather than silently passing.

`src/lib/clinical/evidence-registry.ts` exports:

- `EVIDENCE_INDEX`: `{ id, label, domain, evidence }` entries; domain prefixes avoid collisions.
- `getCatalogEvidence(structureId)`: provenance and string-comparison bookkeeping only; unknown or prototype IDs return undefined.
- `selectCuratedEvidence(query, limit = 4)`: local name/ID and controlled-topic matching; no public search; at most 6 records and only records that fit the formatted context.
- `formatCuratedEvidence(records)`: at most 24,000 characters and 6 records, complete source URLs, source numbering, checked/access notes, scoped claims and limitations. Formatting may omit later records to preserve the bound; the selector already excludes such omissions from its returned metadata.
- Domain labels and query normalization shared by the source index.

## Catalog limits

Catalog provenance comes from the existing `catalog-evidence.json` audit and the current manifest. All 1,031 structure IDs get `source-only` status. The 884 matching English/Latin pairs are string matches against the derivative TA2.csv, with the audited CSV hash and Z-Anatomy commit preserved. The other 147 entries do not receive inferred names or a reviewed status. Original FIPAT terminology, Vietnamese translations, mesh labels, attachment geometry, fiber direction, thickness, measurements and source-to-mesh mappings remain unvalidated.

## User access and assistant integration

The knowledge page includes a searchable index by label/ID/source, domain and source scope. Results are paged in groups of 12 to keep the initial interface manageable. Each item exposes its claim mapping, limitations, source links, checked date and actual access scope using the shared evidence panel. Scoped educational/workflow records and source-only catalog records are described separately. Uploaded PDFs and live PubMed results do not inherit the app's recorded source-comparison status.

The actual chat route now supplies curated records in the model system context. Existing `rag`, `pubmed` and `model` metadata/citation fields remain; `curated` and `publicSearch` are additive in the NDJSON meta event and Supabase assistant citation context. These fields describe supplied sources, not an audit of generated claims. Existing local consultation persistence is unchanged because the route did not implement it previously.

Public PubMed retrieval uses fixed topic strings selected locally from the current question, up to two matching topics. Raw questions, client profiles, lab values, medication lists and uploaded document text are not forwarded as public queries. Topics outside the fixed vocabulary skip PubMed rather than send free text; retrieval breadth is consequently limited. RAG retains the existing private knowledge-search behavior. Model output can still be wrong or fail to follow prompts; independent review of individual answers remains necessary.

## Checks performed

- `node scripts/check-evidence-coverage.mjs` passes for all 1,107 IDs. It verifies finite domain inventory equality, no duplicates/missing records, source metadata, pending experts, provenance and unknown/prototype-ID rejection; relevant medication/lab/ROM/trigger/gluteus selection; empty/unrelated queries; record/character bounds; exact URL preservation; and metadata/context agreement.
- The same script executes the actual chat route with synthetic model/network/storage adapters. It confirms curated medication sources enter the actual system prompt and response metadata, existing metadata fields remain, sources persist to the assistant citation context, the fixed public query excludes synthetic private profile/lab text, and an unrelated topic skips public search. This performs no live model request or external literature search.
- Targeted ESLint for the registry, source index, knowledge page, chat route and regression script passes.
- Full `npx tsc --noEmit` passes after the root agent corrected unrelated concurrent files.
- React Doctor completed successfully on the changed repository files: score 62/100, output reported “No issues found”. That score is not a claim of complete project quality or medical accuracy. It also reported the old `--diff` flag as deprecated in favor of `--scope changed`.
- Browser/device review and production build are coordinated by the root agent; they are not claimed by this integration note.

No expert approval, certification, measured anatomy or personal treatment safety is established by these checks.
