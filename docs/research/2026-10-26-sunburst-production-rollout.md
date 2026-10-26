# Sunburst chat image migration — 2026-10-26

Historical rollout. The user subsequently selected Seedream for all image generation; see [the current chat configuration](2026-10-26-seedream-chat-config.md).

User-selected target: `openai/gpt-image-2.5-sunburst`, through OpenRouter's dedicated Images API, pinned to provider `openai`. The subsequent user instruction replaces the former 1K default with automatic sizing.

Status: deployed and promoted to https://kinesis-lab.vercel.app. Source commit `ef3c87a`, pushed to `origin/feature/study-chat-illustrations`. Vercel deployment `dpl_6no2sRhvfWvivKJt3nD7drCQCWtw` is READY.

## Request contract

- `n: 1`, `quality: auto`, `aspect_ratio: auto`. Omit fixed `resolution` and `size`; the provider chooses dimensions. Preserve the exact user-selected model.
- Use `input_references` with the single owner-checked prior image for edits. Do not add unsupported provider-specific fidelity parameters.
- Use the default raster output (PNG by default for OpenAI Images); validate the actual PNG/JPEG/WebP bytes before storage. Keep existing response and storage size limits.
- Buffered response, no partial-image requests, no automatic paid retry or alternate model/provider fallback.
- Allow 140 seconds for image generation, 170 seconds total application budget, and a 180-second Vercel route ceiling. The prior 110-second image deadline could interrupt prompts taking up to two minutes.
- Auto dimensions and quality do not have a fixed per-image estimate. Return `estimateUsd: null`; expose the catalog output-token rate separately ($0.00003/token in the checked endpoint) and record actual `usage.cost` in receipts. Retain legacy receipt model labels and resolution values.

## Sources checked

- [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation): auto sizing/quality, default PNG, references, latency and token-based costs.
- [OpenAI Images API reference](https://developers.openai.com/api/reference/resources/images/methods/generate): Sunburst, auto quality and supported size constraints.
- [OpenRouter endpoint capabilities](https://openrouter.ai/api/v1/images/models/openai/gpt-image-2.5-sunburst/endpoints): provider `openai`, auto aspect ratio/quality, references and pricing. The endpoint does not advertise a resolution-tier parameter.
- [Vercel duration configuration](https://vercel.com/docs/functions/configuring-functions/duration): per-route maximum duration.

## Verification

- 36 image/chat tests, 23 text-chat/runtime tests, evidence coverage and the shared illustration workflow check passed.
- Production build (including TypeScript) and lint passed.
- A regression assertion first failed with the prior 110-second image budget, then passed after the Sunburst timing adjustment. Request tests verify auto parameters, no fixed size, owner-checked edit references, no duplicate billing, and nullable per-image estimates.
- React Doctor reported 15 warnings across the existing image/chat implementation and earlier test scripts. This model migration does not claim to resolve the previously documented recovery/viewer issues; no rules were suppressed.
- The deployed app's real create and reference-edit requests both returned HTTP 200 and `succeeded`, using the requested Sunburst model and automatic settings. No HTTP 429 occurred in these two requests.
- Create: 24.263 seconds, PNG 1774 × 887, 1,371,102 bytes, provider-reported cost $0.01513. Edit: 28.741 seconds, PNG 1774 × 887, 1,419,647 bytes, provider-reported cost $0.020754. These are observed sample costs, not fixed estimates for future requests.
- Both stored assets downloaded successfully with SHA-256 matching the receipt. Replaying each POST and polling preserved the original receipt rather than creating another image.
- Visual inspection found the Vietnamese title and three intended captions legible. The requested green accent appeared in the edit, but the model also redrew some icons/layout details; the smoke test does not establish exact edit fidelity.
- After promotion, the primary-domain image GET returned HTTP 200 with Sunburst, `resolution: auto`, `aspectRatio: auto`, `quality: auto` and `estimateUsd: null`. The successful create receipt was also replayed through the primary domain.
- No clinical validation is claimed by this migration. Samples contain generic learning graphics, not anatomical claims or personal information.
