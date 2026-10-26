# Seedream for study-chat images

User decision: 2026-10-26, replace Sunburst with `bytedance-seed/seedream-5-0-flash` for image generation, push the completed chat fixes to `master` and update Vercel.

## Request contract

- Model `bytedance-seed/seedream-5-0-flash`, provider `seed`, one image, no automatic provider fallback or paid retry.
- Resolution `2K` for readable study labels; `aspect_ratio: auto` keeps automatic layout. The shared anatomy image workspace already uses this model.
- Omit `quality`: it is not advertised for this Seedream endpoint. Reference edits use the existing owner-checked image reference path.
- Retain the source-grounded medical prompt, brief validation, prompt/receipt hashes, source reading scopes and truthful reviewer fields.
- Pricing is per output image, not Sunburst's token pricing. The checked endpoint reports $0.018 per image; fetch live pricing where available and retain an explicitly dated estimate when unavailable.

## Source checked

Read the [OpenRouter Seedream Images endpoint catalog](https://openrouter.ai/api/v1/images/models/bytedance-seed/seedream-5-0-flash/endpoints) on 2026-10-26 through a public HTTP GET. It returned HTTP 200 with provider `seed`, resolutions `1K`/`2K`, automatic aspect ratio, one output, reference input support and output-image pricing. The `quality` parameter is absent from supported parameters. No credentials were needed for this catalog check.

## Release scope

Include the completed prompt-to-image actions, readable source labels, positional terminology source pack, HTTP/session failure handling, long-prompt support and cloud-storage fallback described in [the learning-flow verification record](2026-10-26-study-chat-learning-fixes.md). Existing Sunburst receipts and historical visual checks keep their original model labels; they are not relabeled as Seedream samples.

Model contract tests cover generation and reference edits, absence of unsupported quality fields, live/fallback image pricing and API receipt metadata. Source comparison and software tests do not clinically validate generated images.
