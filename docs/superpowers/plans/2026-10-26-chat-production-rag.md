# Production chat and evidence retrieval implementation plan

**Goal:** Deploy the approved Gemini Embedding 2 / Haiku 5.5 setup with source-backed retrieval and truthful source status on the existing Kinesis Lab Vercel project.

**Architecture:** Keep the existing server-only OpenRouter client, Supabase 1536-dimensional vector tables and chat route. Namespace evidence documents by embedding model, dimension and query/document formatting version; fail closed if incompatible vectors exist. Seed a bounded selection of full-text, CC BY research articles through Europe PMC's fullTextXML API, preserving provenance and section labels. Keep NCSF as the existing separate textbook library.

**Tech stack:** Next.js 16.4.1, TypeScript, React 19, Supabase pgvector, OpenRouter, Vercel CLI. Read the bundled Next route-handler/environment guides before changes. User approved the previously discussed design and production update in this chat; no additional design gate is needed.

## Work and verification

- [x] Write failing behavioral checks for embedding dimensions, query/document formatting, independent batch outputs, malformed vectors and Haiku model selection. Implement the OpenRouter changes and update local/example configuration and README. Run `node --test scripts/check-ai-runtime.mjs`.
- [x] Implement an idempotent corpus importer with explicit source/license metadata, text-only JATS parsing, bounded section chunks, deterministic IDs, and a model namespace. The importer must never ingest credentials, client data or protected NCSF PDFs. Use the existing `knowledge_documents.source_type` for the namespace and `filename` for the canonical source URL; source content hashes and version metadata remain in the source registry/ingestion receipt and chunk provenance. Before any database mutation, preview exact source and chunk counts. Never overwrite existing incompatible corpus rows.
- [x] Test and implement RAG namespace checks and source metadata. The current RPC searches all stored vectors; therefore refuse mixed namespaces before calling it. Preserve the 1536-dimensional schema and use only a homogeneous collection. Return empty/no-match/error statuses explicitly, with safe user-facing notices.
- [x] Validate chat request roles and size, preserve source matching across bounded recent user turns, render curated/RAG/PubMed sources, clear conversation when changing client, and handle truncated/error streams honestly. Keep public PubMed queries restricted to fixed topic vocabulary. Add focused regression checks for cross-client reset, malformed input, provider stream errors and source metadata.
- [x] Tighten prompt wording around unsupported citations, truthful reading scope, experimental muscle damage and insulin symptoms without claiming clinical validation. Preserve source-based educational acceptance and truthful null reviewer metadata.
- [x] Run the focused checks plus existing evidence/safety/lab checks, TypeScript, lint, production build and React Doctor. Inspect the actual UI using a synthetic consultation.
- [x] Smoke-test the real Gemini Embedding 2 endpoint for multiple independent 1536-dimensional vectors. Import the approved initial corpus, verify stored counts, and test Vietnamese queries against that same namespace.
- [x] Update the shared Vercel model variables (`OPENROUTER_MODEL_CLINICAL`, `OPENROUTER_MODEL_FAST`, `OPENROUTER_MODEL_EMBEDDING`) to the chosen values. Keep other credentials unchanged. Deploy the verified source to production and confirm readiness, domain alias, response model and RAG/source metadata through the production API. Do not call completion until these checks succeed or a concrete external blocker is identified.

## Initial source scope

Select open full-text articles with explicit CC BY metadata: the BJSM article describing WHO 2020 activity guidelines (PMC7719906), the WHO-commissioned exercise/low-back-pain review (PMC10684665), and the Frontiers dumbbell/cable lateral-raise trial (DOI 10.3389/fphys.2025.1611468). Retrieve each article's exact PMCID/license/body and preserve its actual metadata. These sources provide a small starting collection, not full coverage of anatomy, medication, rehabilitation or nutrition. The app's existing curated evidence and bounded PubMed search remain supplementary. If a source lacks a compatible license or a complete body, exclude it rather than substituting an abstract as full text.

## Release constraints

No sensitive values in repository or build logs. No universal expert-approval badge. No claims that embedding, tests or source comparison establish clinical validation. No changes to private NCSF access. Production deployment is explicitly authorized by the user; use the already linked project `kinesis-lab` and verify its returned alias.

## Completion record

Deployed and verified after merging `origin/master` at `4bdeb35`. See [release verification](../reviews/2026-10-26-chat-production-rag.md). Production runtime source commit: `ac2438d`.
