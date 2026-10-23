# FLUX illustration library implementation plan

**Goal:** Implement the user-approved chat → create/edit image → save library → attach to Movement workflow with FLUX 3 Image Klein.

**Architecture:** A bounded server-only proxy calls the dedicated OpenRouter Image API with one image per explicit click. A reusable client workspace provides generation/editing and a device-local IndexedDB library. Movement renders only explicitly attached library entries, separate from sourced original figures. Existing chat reasoning and client records are not passed to the image service.

**Tech stack:** Installed Next 16.4 route handlers, React 19, existing CSS tokens, native IndexedDB and dialog/image APIs. No database migration, dependencies or deployment required. Existing branch/workspace is reused for live app integration; no commit is requested. The preceding conversational design was approved by “ok làm đi”; do not add a second approval or spec-review gate.

## Design decisions

- Existing editorial lab style: white panels, cobalt actions, quiet borders, Be Vietnam Pro/IBM Plex Mono. Primary anchor: a large image workspace with a clearly labeled AI caption and compact cost receipt.
- Chat gets a visible “Tạo hình FLUX” entry beside consultation controls. It opens an independent panel, with six authored movement presets and a topic selector; no automatic copying of questions, messages, client profiles or lab content.
- Optional user-selected reference image and explicit edit of the current result; show what will be sent. Files and prompts only go to OpenRouter/BFL when the generation button is pressed.
- Default 1K, optional 2K, 1:1 / 4:3 / 3:4 / 16:9. Pin exact model/provider, n=1, no automatic retry, short timeout, bounded inputs/output, no external-reference URL fetching. Validate raster signatures and MIME. Show current estimate separately from actual cost (or “API chưa trả chi phí”).
- Saved images persist in the current browser, including blob/hash/prompt/model/references/source metadata/parent ID/cost. Library survives reload and can download image plus JSON provenance. Attachment to one of the four Movement tabs is explicit; removing attachment does not delete the image. Deletion has ordinary recovery via a soft-delete/trash entry.
- Source links support the accompanying educational text, not the pixels or a clinical validation claim. AI label and specific simulation limits remain visible. No professional approval is invented or required. Clinical 3D/source figures are preserved.
- Generation has an in-flight guard; server rejects cross-origin mutations, concurrent/replayed requests and oversized inputs. A bounded temporary idempotency receipt avoids duplicate paid calls after client retries without publishing image data. No public arbitrary image URL proxy.

## Tasks

- [x] Implement typed presets/source context and request validation; fixed model, provider and supported settings.
- [x] Implement server proxy with bounded parsing, raster validation, timeout/error translation, usage/provenance and duplicate/concurrency controls.
- [x] Implement IndexedDB save/list/update/soft-delete/restore and source/image export; object URL lifecycle and cross-tab refresh.
- [x] Implement compact generation controls/result card/library and integrate into chat and Movement.
- [x] Check the requested workflow: invalid requests/errors, source metadata, no client-context forwarding, actual bounded generation/edit, save/reload/attach/remove/download, desktop and 390px layout and keyboard behavior. Exactly two live 1K images were requested; API-reported total cost $0.018. The edit did not clearly achieve the requested blue-wall change; recorded that semantic limit.
- [x] Run focused checks, lint/build and React Doctor; fix two reviewed P2 issues, record limitations/screenshots, reset viewport and retain a result tab. Work remains uncommitted and undeployed.
