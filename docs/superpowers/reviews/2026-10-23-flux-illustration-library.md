# FLUX illustration workflow — implementation review

Date: 2026-10-23. Branch: `codex/flux-illustration-library`. User approved the preceding proposal: open a separate illustration tool from chat, generate/edit with FLUX 3 Image Klein, save a reusable library and explicitly attach selected images to Movement.

## Delivered workflow

1. `/consult` has a visible **Tạo hình FLUX** control. It opens a dedicated workspace with six authored task presets: squat, hinge, lunge, push, pull and carry. The image request does not automatically copy chat questions, model answers, client IDs, stored profiles or laboratory data.
2. Select an accompanying Movement topic, visual instructions, 1K/2K resolution and supported aspect ratio. A single optional reference can be chosen locally; a saved/generated image can also become the reference for an edit. The UI explains that the selected description/reference are sent to OpenRouter/BFL only on generation.
3. The server calls the dedicated OpenRouter Image API with `black-forest-labs/flux-3-image-klein`, provider `black-forest-labs`, `n: 1`, no automatic retry/fallback. It reuses the existing server API key. `.env.example` documents that reuse; no credentials were exposed or changed.
4. The returned image displays a real cost receipt when `usage.cost` exists, otherwise an explicit unknown-cost message. The estimate is a separate dated/public-catalog value. Title and caption can be edited before saving; the image can be downloaded or used for another edit.
5. IndexedDB stores saved images on the current browser, with original raster blob, SHA-256, prompt, model/provider, resolution, cost, source metadata, reference hash, generation parent ID and caption. Saving does not automatically attach the image. The library can export the image and provenance JSON, attach/remove an image from one Movement tab, and soft-delete/restore it.
6. Movement's supplemental AI section displays only explicitly attached, non-deleted images. Changes propagate across tabs through committed IndexedDB operations and BroadcastChannel. Its workspace remains mounted across Movement topic changes and collapse/expand; browsing the library also keeps an active generation mounted.

Source/original textbook and research figures remain separate. Each generated image retains its AI label and specific interpretation limit. Source links support the educational context, not a claim that the generated pixels are medically validated. Reviewer fields remain null; no independent expert gate was added.

## Main code units

- `src/lib/illustrations/catalog.ts`: exact model/provider, typed settings/presets, source-context extraction and prompt policy.
- `src/lib/illustrations/server.ts`, `src/app/api/illustrations/route.ts`: input validation, fixed upstream request, cost receipt and request controls.
- `src/lib/illustrations/library.ts`: IndexedDB transactions, soft delete/restore, cross-tab notifications and downloads.
- `src/components/illustrations/`: workspace, state hook, controls, preview, receipt/source details, library cards and Movement attachment view.
- Existing `ChatPanel.tsx` and `/movement/page.tsx`: narrow integration points.
- `scripts/check-illustration-workflow.mjs`: mocked upstream consistency/guard tests, no paid calls.

## Request and storage controls

- Same-origin POST required; rejects arbitrary client-context/model fields.
- Bounded request stream (3.9 MB), one inline raster reference, checked base64/MIME/signature; external image URLs are not fetched. Browser decodes selected rasters and checks size before sending. Server also bounds output parsing and computes its own hash.
- Provider/model are pinned; user input cannot change either or increase `n`. Supports only the small documented size/aspect allowlist.
- Two simultaneous generations and 30 attempts/hour per process; client also guards re-entry. Timeout/error messages preserve the result-checking context rather than silently retrying.
- Four temporary image responses are cached for ten minutes. A separate lightweight completed-ID map prevents a known completed request from being billed again after its image data expires/is evicted. The map refuses further new generations at 10,000 receipts rather than dropping IDs. These are process-local controls, not distributed authentication/billing infrastructure.
- Cached receipts are retained even if parsing a successful upstream output fails. Error bodies are translated without exposing raw upstream/private diagnostics.
- Local writes resolve only after transaction commit. Object URLs and decoded bitmap resources are released. Browser storage/quota errors offer image download rather than falsely reporting successful persistence.

## Verification actually performed

### Two bounded live image calls

No other paid generations were made during this implementation.

| Operation | Request/receipt ID | Output | API-reported cost |
| --- | --- | --- | ---: |
| Create hip-hinge task illustration | `8c7b030c-feb1-402b-b04a-0bdce12478b1` | JPEG, 1184×880, selected 1K/4:3 | $0.00900 |
| Edit using the first image as reference | `2209210c-ddbb-4f87-a56e-41389f7ed02c` | JPEG, 1184×880, selected 1K/4:3 | $0.00900 |
| **Total** | | | **$0.01800** |

Both completed images were saved as distinct library entries. The edit receipt records the original parent ID and reference SHA-256. Downloaded edit bytes match the exported receipt hash. The source array contains the three original patterns-topic sources, with their actual checked/access metadata; `reviewedBy` remains null. Example export: `assets/2026-10-23-flux-illustration-library/live-edit-receipt.json`; actual image: `live-edit.jpg`.

Visual inspection confirmed that an image and a reference-based edit were returned, with full person/equipment visible and no added labels. **The requested change to a light-blue wall was not clearly achieved.** The test establishes the edit transport/provenance flow, not prompt-perfect editing or medically correct posture. The UI therefore preserves preview/manual selection rather than automatically publishing a successful API response.

### Browser interactions

- Opened the workspace from chat with keyboard Enter; observed estimate, configuration, presets and reference controls.
- Generated, saved, downloaded an image and its JSON metadata through the actual UI.
- Reloaded `/consult`: both saved images and the original attachment remained in IndexedDB.
- Attached the original to Mẫu chuyển động. A separate Movement tab displayed the image and AI/source details. Detaching removed it there, and reattaching restored it through cross-tab refresh.
- Soft-deleted and restored the edited image; two active library entries retained.
- Switched Movement from patterns to symmetry with a draft description, then back: the description/workspace survived. Source-figure content and per-topic attachments still changed independently.
- Selected 2K and observed the estimate update from $0.009 to $0.014 without generating another image.
- Selected an intentionally malformed PNG file; browser decoding rejected it with an actionable error before any generation call.
- Desktop observed `innerWidth: 1280`, document width 1265: no horizontal page overflow. Mobile observed **390×844**, document width 375: one-column workspace/library, images loaded and action controls wrapped without page overflow. Temporary viewport override reset after checking. During viewport transitions, some observations still showed the previous size; only actual DOM-observed dimensions are claimed.
- Browser warning/error log query for the consultation QA tab returned an empty list during the check. This is a bounded log observation, not proof that every browser/path is error-free.

Screenshots under `assets/2026-10-23-flux-illustration-library/`: `library-two-versions.png`, `movement-attached.png`, `mobile-library.png`, `compact-workspace.png`, `movement-sources-expanded.png`, and `movement-final.png`. Some transition captures do not frame the final attached image. The clearest attachment proofs are `movement-attached.png` (desktop) and `movement-final.png` (390px phone layout).

### Automated checks and review

- `npm run lint`: passed after fixing synchronous URL-state updates and a cleanup-ref warning. Stored images now decode asynchronously before creating display URLs.
- `npm run build`: passed, including TypeScript and static generation.
- `node scripts/check-illustration-workflow.mjs`: passed. Mocked tests cover source context, fixed provider/model/n, rejection of profile/extra fields and arbitrary reference URLs, malformed/mismatched MIME, bounds, real-versus-unknown cost, parent/reference hash, same-ID replay, completed-response eviction, concurrent duplicates/two-request limit, insufficient credits and missing key. No actual upstream network is used by this script.
- `node scripts/check-movement-sources.mjs`: passed.
- `node scripts/check-evidence-coverage.mjs`: passed for 1,107 entries including 1,031 source-only structures.
- `git diff --check`: passed.
- React Doctor: split the large generator into a state hook, controls and preview. Remaining output: one maintainability complexity advisory in new `ImageControls.tsx` and four warnings in the pre-existing `ChatPanel` function (size, complexity, response parsing order and index key). These were read; no false claim of a warning-free global scan or invented score is made.
- Read-only code review found two P2 issues: topic-key remount discarded in-flight images, and image cache eviction could allow another paid request with an old ID. Both were corrected and reviewer inspection confirmed resolution. The eviction mock first failed (`200` versus required `409`), then passed with no extra upstream call. Software review is separate from clinical review.

## Practical limits

- Library is **browser-local**, not Supabase Cloud/shared-device storage. Clearing browser data removes it; downloads provide a backup. A newly saved active entry is limited when there are already 50 active images; soft-deleted images remain recoverable.
- Save an image before leaving the consultation/page. Movement tab switches preserve the mounted workspace, but a full page reload/navigation during generation can still lose the unsaved browser response. The UI asks to keep the tab open. No claim of background job recovery is made.
- Request/concurrency/receipt guards are per running process and reset on restart. Multi-instance public deployment needs shared durable receipts, authentication and spend limits before treating this as an organizational billing system. Existing app authentication was not expanded by this local feature.
- Native model features not exposed through the chosen OpenRouter endpoint (such as additional mask/bounding-box controls) are not advertised in the UI. One reference image is exposed in this first version.
- Image sources/citations, tests and realistic appearance do not clinically validate generated posture, landmarks, joint angles, muscle activation or tissue properties. Numeric labels/arrows are intentionally excluded from the generated image prompt; existing sourced diagrams remain available.
- No database migration, new dependency, commit, push or deployment was performed. The development server was started locally because port 3000 was initially not running.
