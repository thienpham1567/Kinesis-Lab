# Floating study chat: prompt actions, citations and image failures

Date: 2026-10-26. This record describes local verification before the subsequent [Seedream release request](2026-10-26-seedream-chat-config.md).

## Learner flow

- Each submitted user prompt has a **Tạo hình** action. It opens the existing image tab with the exact stored prompt, including quoted study text. Switching from a draft question also carries that draft. Opening the tab does not submit a paid image request.
- Selecting an earlier prompt replaces a stale image draft with that selected prompt. An assistant answer can still be illustrated. Image edit/retry restores its submitted instruction separately from the original answer's context and evidence.
- Input accepts the text-chat limit of 20,000 characters, without the former silent 1,600-character truncation. The existing image-copy/output limits stay in force.
- Known APP markers render as source labels with expandable URLs, checked dates and reading scopes. Qualified markers such as `[APP:handbook:patterns:Quy ước của app]` retain the qualifier. Metadata stays on each originating answer and survives session reload. Raw answer content and server citation audits are retained. Unknown markers are not assigned invented sources; older stored answers without citation metadata cannot be relabeled reliably.

## Reproduced failures and changes

1. **HTTP 403 on a valid local origin.** A browser at `127.0.0.1` was compared against Next's internally reconstructed `localhost` URL. Compare the browser origin/referer to the actual Host authority; do not trust forwarded-host headers. Foreign origins still fail.
2. **Cards stuck preparing after a request failure.** A failed session preflight now ends as failed. A lost POST response or failed status check becomes unknown, with explicit recovery and no automatic paid resubmission. Recovery errors are handled. Cached disabled status no longer permanently locks the composer.
3. **Unrelated evidence blocks a simple learning graphic.** A real book-card request selected movement studies from generic wording such as “Đọc bài”, “Tự kiểm tra”, “rõ ràng” and “hình”. Gemini returned an empty claim selection, correctly declining those unrelated claims, and the brief guard rejected it. Exclude generic learning/composer wording from fallback matching; preserve “hình lê” as the anatomical topic piriformis. Existing named-reference fallback limitations are not upgraded or silently remapped.
4. **A generated image was discarded at the upload stage.** A real request reached raster generation but exceeded the fixed 10-second storage wait. Storage may now use up to 60 seconds of the remaining overall 170-second budget. The route ceiling and image-model selection remain unchanged. Upload timers are cleared on completion. A storage outage/timeout can deliver the intact raster inline when it is at most 3 MB, so the existing browser library/viewer/download workflow remains usable. The receipt marks `browser-only`, the UI explains missing server storage and withholds reference-editing that requires a server copy. Larger inline responses remain excluded to respect hosting response limits; an oversized timed-out upload stays unknown rather than automatically billing again.

## Positional terminology source comparison

The user's supplied terminology topic now has a bounded, dedicated pack in `src/lib/chat/positional-evidence.ts`, with claim-level source IDs and actual access date **2026-10-26**. An explicit terminology lesson takes precedence over incidental region examples so its claims are not crowded out of the 12-claim cap.

- [OpenStax A&P 2e §1.6](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology): read Anatomical Position, Directional Terms and Body Planes. Scope: reference directions and planes.
- [UNLV School of Medicine, terminology page 10](https://som-anatomy-tables.faculty.unlv.edu/resources/terminology/term10.html): read the laterality definitions and examples.
- [Loyola University Chicago, chest reference lines](https://www.meddean.luc.edu/lumen/meded/medicine/pulmonar/apd/lines.htm): read the textual descriptions of axillary lines.

These are terminology comparisons, not independent professional approval, measured geometry, validation of AI pixels or procedural guidance. No reviewer identity or clinical certification has been invented.

## Verification

- Production build, TypeScript and lint passed. The build retains the preexisting `metadataBase` warning.
- All 56 image/chat regression checks passed, covering exact prompt selection, long inputs, edit/retry context, HTTP failures, no duplicate billing, source selection, per-answer citation storage, slow uploads and browser-only delivery during a storage outage.
- Shared Markdown checks cover readable markers and qualifiers, literal code, unresolved IDs, inert images and unsafe links.
- The existing 23 text-chat/runtime tests and finite evidence-coverage check passed.
- Browser checks confirmed exact prompt transfer, selecting an earlier prompt, focus in the image composer, readable citations, source disclosure and session reload.
- Read-only bucket metadata succeeded; a disposable tiny upload and its cleanup succeeded. A 2 MB upload probe timed out after 20 seconds. This isolates a large-upload transport problem on the local connection rather than a missing bucket; no bucket permissions, project credentials or production settings were changed.

## Final live result

A real Sunburst request generated the Vietnamese **Học chủ động** book card. Cloud storage remained slow, so the size-bounded browser-only path delivered the actual raster to the chat. The thumbnail opened in the large viewer, the original PNG downloaded successfully, and after a full reload the browser library restored a complete **1254 × 1254** image without another generation request. This sample contains no anatomical diagram or personal information and does not establish medical accuracy.

Ignored QA screenshots: `.data/qa/study-chat-readable-citations.png` and `.data/qa/study-chat-image-success.png`. The test download was saved as `~/Downloads/Hình minh họa AI.png`.
