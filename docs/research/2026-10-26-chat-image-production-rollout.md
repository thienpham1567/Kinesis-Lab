# Chat image production rollout — 2026-10-26

Status: build ready; primary domain promotion pending database migration.

- Source: commit `0ffdd3b`, branch `feature/study-chat-illustrations`, pushed to origin.
- Vercel production-target deployment: `dpl_i5RYVdAce5Skcpzc3iYijf8HZHVY`, READY, created with `--prod --skip-domain`.
- Deployment URL: https://kinesis-ihza6o2gl-thienphamuser-1935s-projects.vercel.app
- Primary domain https://kinesis-lab.vercel.app remains on the previous deployment; its image endpoint still returns 404.

## Completed

- 36 image/chat checks, 23 chat runtime checks, evidence coverage, illustration workflow checks, production build, and lint passed.
- New deployment image GET returns HTTP 200, `google/gemini-nano-banana-2.1`, `1K`, `4:3`, and a live output-image estimate of $0.0336.
- Created private Supabase bucket `chat-illustrations` with a 12 MiB limit and PNG/JPEG/WebP MIME allowlist.
- Added sensitive production `CRON_SECRET` in Vercel. Unauthenticated cleanup requests return HTTP 401. No secret values are recorded here.

## Remaining prerequisite

Supabase project `udtvdqupxlgflsmdgflw` does not yet have `public.chat_image_jobs` or `claim_chat_image_job`. Read-only REST checks returned schema-cache 404. A synthetic POST to the new deployment returns HTTP 503 (`unavailable`) before contacting the brief/image providers.

The available service-role key can create the private bucket and operate on existing tables, but does not provide a database SQL execution interface. The Supabase dashboard requires interactive sign-in. The user was asked to sign in so migration `supabase/migrations/004_chat_image_jobs.sql` can be applied. It explicitly grants the table operations and claim function to `service_role`, with no public/anon/authenticated access.

After sign-in: apply migration, verify the service-role claim/update/read flow, create one generic image through the deployed app, verify storage/receipt/ownership, then promote the ready deployment to the primary domain and repeat the public checks. Preserve the prior deployment until the feature works.

## Provider smoke test

One direct call through the application's raster provider requested Nano Banana 2.1, 1K, 4:3, with a generic Vietnamese learning infographic and no personal/medical information. OpenRouter returned HTTP 429. No image was obtained; no automatic retry or alternate model was used. This does not validate image quality or medical accuracy.

The previously reported QA findings in `2026-10-26-study-chat-image-qa.md` remain separate outstanding improvements; this deployment task did not claim to resolve them.
