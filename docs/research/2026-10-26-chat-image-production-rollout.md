# Chat image production rollout — 2026-10-26

Historical Nano Banana rollout. The user subsequently switched to Sunburst with automatic settings; see [the current rollout](2026-10-26-sunburst-production-rollout.md).

Status: promoted to the primary domain. Application/database/storage checks passed; the image provider is currently rate-limiting generation (HTTP 429).

- Source: commit `0ffdd3b`, branch `feature/study-chat-illustrations`, pushed to origin.
- Vercel production-target deployment: `dpl_i5RYVdAce5Skcpzc3iYijf8HZHVY`, READY, created with `--prod --skip-domain`.
- Deployment URL: https://kinesis-ihza6o2gl-thienphamuser-1935s-projects.vercel.app
- Primary domain https://kinesis-lab.vercel.app now points to this deployment after a successful `vercel promote`.

## Completed

- 36 image/chat checks, 23 chat runtime checks, evidence coverage, illustration workflow checks, production build, and lint passed.
- New deployment image GET returns HTTP 200, `google/gemini-nano-banana-2.1`, `1K`, `4:3`, and a live output-image estimate of $0.0336.
- Created private Supabase bucket `chat-illustrations` with a 12 MiB limit and PNG/JPEG/WebP MIME allowlist.
- Added sensitive production `CRON_SECRET` in Vercel. Unauthenticated cleanup requests return HTTP 401. No secret values are recorded here.

## Database migration and production verification

After the user signed in through Brave, applied `supabase/migrations/004_chat_image_jobs.sql` in the SQL Editor for project `udtvdqupxlgflsmdgflw`, inside a transaction, then notified PostgREST to reload its schema. The result confirmed `chat_image_jobs` and `claim_function_exists = true`. The migration grants the intended table operations and claim function to `service_role`, with no public/anon/authenticated access.

- Actual service-role RPC checks returned `claimed`, then `existing` for the same request, and `forbidden` for a different owner. The synthetic job was finalized as `failed` with a preflight marker so it holds no concurrency slot.
- Uploaded a synthetic 1-pixel PNG to the private bucket, fetched it by a short-lived signed URL (HTTP 200, matching SHA-256), confirmed the public object URL was blocked, and removed the test file.
- A real create request through the deployed app successfully passed the database claim and brief stages, then received upstream HTTP 429. Its persisted state is `failed` / `rate-limited`; polling returns that state, and polling without the owner cookie returns 401. This is no longer the missing-schema HTTP 503.
- After promotion, the primary-domain image GET returned HTTP 200 with the exact model and 1K default. The floating chat's create-image mode is visible and usable in the deployed UI.
- Authorized production cleanup returned HTTP 200 with `removed: 0`.
- A generic WHO activity question through the primary-domain text-chat API returned HTTP 200, model `google/gemini-2.5-flash`, token events, and a final `done` event.

Local ignored QA artifacts include screenshots of the applied migration and the production chat image mode. No personal profile or patient data was used.

## Provider smoke test

The earlier direct call and the later deployed-app request both requested Nano Banana 2.1, 1K, 4:3, with a generic Vietnamese learning infographic and no personal/medical information. OpenRouter returned HTTP 429. No model image or successful generation receipt was obtained; no automatic retry or alternate model was used. A successful image-quality check remains pending provider availability. This does not validate image quality or medical accuracy.

The previously reported QA findings in `2026-10-26-study-chat-image-qa.md` remain separate outstanding improvements; this deployment task did not claim to resolve them.

## Root-cause diagnosis of HTTP 429

Follow-up checks on 2026-10-26 used only a simple book illustration prompt. No production settings or application behavior were changed.

- OpenRouter key inspection returned HTTP 200, paid-tier status, and no key spending limit. The credits endpoint confirmed a remaining balance greater than $1; exact balances and credentials are not recorded.
- The Images API returned HTTP 429 from `Google AI Studio`, with a quota-exceeded message.
- The same model/provider, 1K and 4:3, through Chat Completions also returned HTTP 429. Its metadata explicitly reported `is_byok: false`, provider error 429, and that `google/gemini-nano-banana-2.1` is temporarily rate-limited upstream. One eligible endpoint was available in the routing summary.
- Neither response included `Retry-After`; no recovery time was established.

Conclusion for this incident: the shared upstream Google AI Studio capacity used by OpenRouter is rate-limiting this model. Changing from Images to Chat Completions does not resolve it. Evidence does not point to the application's request format, a missing database migration, or exhausted OpenRouter credits as the cause of these 429 responses. Keep the selected model; recovery depends on upstream availability, or a separately configured Google provider key with usable quota. No alternate model, provider key, billing setting, or automatic retry was introduced.
