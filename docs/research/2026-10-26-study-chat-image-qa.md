# Floating chat illustrations: quick QA

Tested 2026-10-26 on the local working tree. No application code was changed during this review.

## Checks completed

- All 34 checks in the eight new image/chat check scripts passed.
- `npm run build` and `npm run lint` passed.
- One real Seedream generation succeeded: a generic learning infographic, 2048 × 1536, with a Vietnamese title and three captions rendered directly in the image. The text was legible in this sample.
- Browser checks passed: thumbnail, enlarge, zoom buttons, Escape, focus return, original download, and image restoration after reload (natural size remained 2048 × 1536).
- This sample does not validate anatomical or medical accuracy. Mobile gestures and all six proposed anatomy pilot cases were not tested.

## Findings

### P1: RAG references are dropped when creating an illustration from an answer

`StudyChatWidget.tsx:269` filters selected source IDs against `catalogChatImageSources()`. RAG references use chunk UUIDs; the catalog contains anatomy/movement source IDs. The RAG IDs therefore fail the filter, and the server resolves an empty source list while still receiving the selected answer text. The client-side `sources` field does not restore server-side evidence grounding.

Preserve and resolve registered RAG references on the server, including their source text/metadata, rather than filtering them into the unrelated catalog. Add an integration case from a RAG answer to its image brief.

### P1: Interrupted jobs can exhaust the global queue indefinitely

`supabase/migrations/004_chat_image_jobs.sql:55` counts every `preparing`/`generating` job without a lease or stale-job transition. A process killed during generation cannot update its state. Two such jobs keep the global concurrency limit full. The cleanup path targets expired jobs with assets, so it cannot repair these jobs.

Reproduced with the actual in-memory ledger: claim two jobs, advance the clock six hours, and a new owner's claim still returns `busy`. The SQL contains the same unbounded active-state predicate; actual deployed SQL concurrency was not exercised.

Use an atomic lease/timeout transition to `unknown` and release capacity, preserving request tombstones to avoid automatic duplicate billing.

### P2: Recovery polling does not handle HTTP failures or persist recovered images

`useStudyChatImages.ts:147` parses responses without checking `res.ok`. A 401, 404, or 503 response has no job state and can keep the two-second polling loop running. The exported recovery callback also launches the promise without handling network rejection.

On successful polling, `hydrateImage()` creates a preview but does not save the recovered blob/brief/receipt to IndexedDB. The direct POST-success path does save them. Reload recovery only checks local images and does not resume unfinished server jobs.

Use a shared success finalizer for POST and polling; handle terminal HTTP responses and bounded retries; restore pending jobs through GET after reload. These findings are from source inspection, separate from the successful direct POST/reload browser case.

### P2: Expired assets still receive fresh signed URLs until cleanup runs

`image-api.ts:307` checks expiry only when `storagePath` is absent. A normal succeeded job with a stored asset therefore returns a new signed URL after its expiry and before cron cleanup. A mocked storage integration reproduction confirmed HTTP 200 and a signed URL for an expired job.

Enforce expiry before signing in both GET and POST replay paths, and cap signed-URL duration to the remaining retention window.

### P2: Viewer “100%” is the same scale as fit-to-screen

`StudyChatImageViewer.tsx:32` and `:57` both use zoom 100. Browser reproduction: an image with natural width 2048 rendered at approximately 791 px after pressing “100%”. Plus/minus zoom works, but “100%” does not show native resolution. Calculate native pixel scale separately from the fitted scale. Consider pinch zoom as a later mobile usability check.

## Production preflight

- The production `/api/chat/illustrations` endpoint returned 404 during this review; the feature is not available on that deployment yet.
- Read-only preflight against the configured local Supabase credentials returned “Bucket not found” for `chat-illustrations`. Confirm the migration and private bucket exist on the actual production project before rollout.
- Local development uses the memory ledger/local asset path, so successful local generation does not verify production database claims, RLS, or remote storage.

No deployment, schema migration, or production configuration change was performed as part of this review.
