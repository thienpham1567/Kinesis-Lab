# Landing upgrade verification — 22/10/2026

## Result

Implemented the approved landing audit in the existing feature checkout. Atlas is the primary entry; headline, fonts and blue/green identity are retained. Replaced the static book image with a framed screenshot of the actual anatomy study UI, with visible attribution and model limits. The shipped WebP is approximately 20KB; the former JPEG was 1,672,454 bytes. This comparison concerns the hero asset, not total page performance.

Removed fake LIVE angles, numeric ROM references, animated counters, scroll/proximity state, continuous decorative animations and universal source promises. The landing is a server component with one bounded client region selector. Main/skip link, visible mobile anchor navigation and native FAQ/source disclosures replace the previous patterns.

Five educational previews reuse existing `REGION_FOUNDATIONS` text and the corresponding source URLs, checked dates and access scopes. No new anatomical facts or professional review status were created. Provenance-only model records remain distinct from educational source comparison. These checks are not clinical validation.

## Automated checks

- `npm run build`: passed; production compilation, TypeScript and static page generation completed.
- `npx tsc --noEmit`: passed after regeneration of stale route types during build.
- `npm run lint`: passed. Excluded the unrelated nested `.claude/worktrees/**` checkout, whose generated JS/dependencies had been included by the root lint command. TypeScript also excludes that checkout. No files inside it were edited.
- `node scripts/check-evidence-coverage.mjs`: passed — 1,107 entries including 1,031 source-only structures; existing source/reviewer/retrieval consistency retained.
- `npm run check:landing`: passed — five unique real structure destinations in the right areas/regions, exact existing foundation text, unchanged source URLs/dates/scopes and existing exercise destinations.
- `git diff --check`: passed.

The first independent typecheck encountered obsolete `.next/types` entries for three previously removed routes; production build regenerated these and the subsequent typecheck passed. The dev server initially served stale compiled CSS; restarting that server loaded the updated stylesheet. The other checkout's dev server was left running.

## Browser checks

Tested with the in-app browser on localhost. Standard scrollbar consumes about 15px of each viewport.

| Viewport width | Document width / scroll width | Hero height | Page height |
| --- | --- | --- | --- |
| 320px | 305 / 305px | 1,063px | 7,902px |
| 390px | 375 / 375px | 934px | 6,971px |
| 768px | 753 / 753px | 650px | 4,902px |
| 1440px | 1425 / 1425px | 725px | 4,360px |

No horizontal document overflow at these widths. At 390px, compared with the preceding audit's 8,165px page and 1,353px hero, the page is about 15% shorter and hero about 31% shorter, despite adding explicit source information. These are local layout measurements, not conversion evidence.

- All five region buttons work with Enter and update the selected state, heading, fact, source and destinations.
- Clicked the ankle destination into the actual Atlas: URL retained `area=lower&structure=za-80a3138971d3`; the selected-structure panel displayed **Xương sên / Talus / Os tali**. Did not claim full WebGL/model-load verification from this navigation check.
- Source fragment for the ankle preview lands at roughly y=130px, below the 107px mobile header. Source access-scope disclosure opens with Enter.
- FAQ opens with Enter; closed answers are absent from the observed accessibility tree. Native disclosure supports more than one open answer.
- Skip link focuses `#landing-main`. Fixed sticky-header overlap by applying scroll margins to IDs including main.
- Desktop and mobile screenshots visually inspected; real product image loads and the nav remains visible at each breakpoint.
- Social title/description, OG dimensions/alt and Twitter large-image card appear in the DOM.

Screenshots: [desktop](assets/2026-10-22-landing-upgrade/desktop.jpg), [mobile](assets/2026-10-22-landing-upgrade/mobile.jpg).

## Independent review and deployment configuration

Independent static review covered deep links, claim/source metadata, accessibility structure, source grouping and metadata. Reported metadata-base and skip-link issues were addressed; follow-up found no new actionable issues.

For self-hosted production, set **`SITE_URL` to the actual public HTTPS origin before building**. Vercel production hostname is used when supplied by that platform. No deployment domain was provided, so none was invented. Local build currently emits Next's localhost metadata-base warning; `.env.example` and README document the required production setting. Canonical is omitted until an origin is configured.

No deploy, commit, account changes, AI message submission or client-data mutations were performed. No pricing was invented. No new analytics service was added. Lighthouse, production network/Core Web Vitals, real screen-reader output and reduced-motion emulation were not tested; CSS gates the only entrance animation on `no-preference`, with no landing animation loop or animation-driven JS remaining.
