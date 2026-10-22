# Movement: knowledge, sources and figures

Date: 2026-10-22. Scope: the four `/movement` tabs. Acceptance criterion: documented comparison with reputable sources, with truthful access scopes; independent professional signoff is optional and has not occurred.

## Audit of the previous page

The page already cited Bahr 2016 for screening; Parkinson 2021, Wellsandt 2017 and Barry 2014 for symmetry/function; CDC, JTSS 2023, Keogh 2019 and the i-Goni knee study for ROM; and Chua 2021 plus Cochrane CD012004 for control. These were genuine scholarly/public-health sources, but most links were grouped at the end, claim mappings were implicit, some access descriptions were inferred from labels, and the content needed important qualifications and newer contrary evidence. A PubMed record is a route to a paper, not an endorsement of the app.

## Delivered content

| Tab | Core points | Sources | Main emphasis |
| --- | ---: | ---: | --- |
| Mẫu chuyển động | 5 | 3 | Task and setup, multi-joint observation, distinction between observation/strength testing/injury prediction |
| Đối xứng | 5 | 3 | Formula and denominator, raw bilateral values, no universal threshold, limits of LSI and functional tests |
| Biên độ vận động | 5 | 8 | AROM/PROM, matched measurement protocols/populations, mean versus individual limits, reliability/error/important change |
| Kiểm soát chuyển động | 5 | 4 | Attention, performance/retention/transfer, conflicting evidence, scope of exercise for chronic low-back pain |

All four retain their existing tab IDs and deep links. Each includes adjacent numbered links, explanations, explicit app-authored examples, misconceptions, two native disclosure questions, and a source ledger with the exact title, evidence type, checked date and actual reading scope. Removed the prior unsupported global strong/moderate/weak grading. No universal expert-approval gate was added; reviewer metadata remains null.

There are **20 core points and 18 unique source records**. The shared source catalog is `src/lib/clinical/movement-sources.ts`; scientific blocks resolve IDs against each topic's own list. The clinical evidence integration derives titles, dates, access scopes and core claim references from the same data.

## Principal sources and interpretation corrections

- Patterns: [Bahr 2016](https://pubmed.ncbi.nlm.nih.gov/27095747/), [Lorenzetti 2018](https://link.springer.com/article/10.1186/s13102-018-0103-7), [Hollman 2014](https://pubmed.ncbi.nlm.nih.gov/24467971/). Read Lorenzetti's methods/results/limits and its [2020 correction](https://doi.org/10.1186/s13102-020-0160-6). Findings in healthy participants do not establish a universally safe stance. Hollman's abstract reports 41 physically active women; it cannot turn an observed knee position into a diagnosis of weak gluteal muscles. Corrected the author label to Hollman.
- Symmetry: [Parkinson 2021](https://www.jssm.org/volume20/iss4/cap/jssm-20-594.pdf), [Wellsandt 2017](https://pubmed.ncbi.nlm.nih.gov/28355978/), [Barry 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC3924230/). Read Parkinson's abstract and introduction, not all 24 pages. The ACL LSI findings are population-specific. Barry concerns TUG and fall prediction, not the Berg scale or a direct asymmetry index. Arithmetic training examples are explicitly authored.
- ROM: [CDC reference table](https://archive.cdc.gov/www_cdc_gov/ncbddd/jointrom/index.html), [Soucie 2011](https://pubmed.ncbi.nlm.nih.gov/21070485/), [CDC protocol/data description](https://stacks.cdc.gov/view/cdc/153156), [JTSS 2023](https://jtss.org/articles/normative-values-for-cervical-and-lumbar-range-of-motion-in-healthy-young-adults/doi/jtss.galenos.2023.33042), [Keogh 2019](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0215806), [Mehta 2017](https://pubmed.ncbi.nlm.nih.gov/27894147/), [de Vet 2006](https://pubmed.ncbi.nlm.nih.gov/16925807/), and [OpenStax movement terminology](https://openstax.org/books/anatomy-and-physiology/pages/9-5-types-of-body-movements). CDC limb values are **passive ROM**, while JTSS spine values are **active ROM**. The CDC mean's 95% CI is not a range containing 95% of individuals. CDC dorsiflexion uses at least 30 degrees of knee flexion. JTSS publishes neck lateral flexion/rotation separately by side: the app's rounded representative 42/71 degrees are not a pooled mean reported by the authors. Numerical values/calculations were preserved; interpretation labels were corrected. Mehta's i-Goni v1.1 findings in OA/post-TKR knees do not validate every tool or the app's form. de Vet supports a measurement principle, not a universal ROM MCID.
- Control: [Chua 2021](https://pubmed.ncbi.nlm.nih.gov/34843301/), [McKay 2024](https://pubmed.ncbi.nlm.nih.gov/39480294/), [Cochrane CD012004](https://www.cochrane.org/evidence/CD012004_motor-control-exercise-chronic-non-specific-low-back-pain), and [WHO 2023 quick reference guide](https://www.who.int/publications/i/item/9789240081789). Chua's average external-focus advantage is presented alongside McKay's reporting-bias reanalysis, rather than as a universal cue rule. Cochrane's search ends in April 2015; its public summary/abstract was read, not the full paid review. WHO's official two-page quick guide supports structured exercise as a conditional recommendation with low-certainty evidence for chronic primary low-back pain; it does not validate every cue or app protocol.

Checked dates are 2026-10-22 for these source comparisons, not a claim that every source is recent or that all full texts were accessible. CDC PDF reading was limited to relevant protocol passages on pages 1–3; tables on pages 4–5 were not all read. Abstract-only access is explicitly recorded where applicable. Source-level reading boundaries are visible in the app.

## Original figures and reuse

Two useful original figures were downloaded, visually inspected and retained without pixel or label edits:

1. Lorenzetti 2018 Figure 1: experimental squat setup, 896×857 PNG, CC BY 4.0. Publisher rights, figure credit and participant-publication-consent text checked. The caption describes the research setup rather than presenting an ideal-form prescription.
2. OpenStax College / Tonye Ogele CNX flexion/extension illustration, existing Doc James crop (2017), 2430×1377 JPEG, CC BY-SA 3.0 from the historical Commons file record. The older figure's own provenance/license is used; the current OpenStax website license is not assumed to apply to it. Supports gross movement names/directions, not goniometer landmarks or normal angles.

Each displayed figure links its source page, license and full original image, with author and modification statement. Exact source URLs, historical record and SHA-1 hashes are in `public/movement/SOURCES.md`. The original English labels remain. A separate CDC page photo was excluded because its asset-specific reuse rights were not established. No AI-generated anatomy or invented measurement photography was used. Figures are included where relevant, rather than forcing an image into all four tabs.

## Verification

- New `scripts/check-movement-sources.mjs`: observed failures before core-source coverage and passive-ROM labels were implemented, then passed. Checks every scientific block's source IDs or explicit authored status, source dates/access scope, exact four IDs, source uniqueness, figure files/dimensions/licenses/hashes, active/passive labels and honest reviewer metadata. It also renders all four actual `MovementTopic` components with React DOM server and verifies their source URLs, visible core content, disclosure questions, dates and figure attribution. This is a consistency check, not medical validation.
- `npm run lint`: passed.
- `npm run build`: passed, including TypeScript and static generation in the shared current workspace.
- `npm run check:rom`: passed; numerical reference logic preserved.
- `node scripts/check-evidence-coverage.mjs`: passed, 1,107 integrated entries including 1,031 source-only structures.
- `git diff --check`: passed.
- Focused React Doctor: removed unsafe non-null lookup and unstable cell index keys. One remaining `no-giant-component` maintainability warning concerns the presentational topic renderer; no functional finding was reported in the focused files. The broader changed-workspace scan also reported four unrelated warnings in concurrently edited `src/app/knowledge/page.tsx`; these are outside this task.
- Desktop browser: all four tabs show five core points and 3/3/8/4 source cards respectively, no document overflow; keyboard Enter selects tabs and expands native self-check questions. Source links appear next to the relevant text.
- Directly clicked a Lorenzetti claim citation: opened the correct publisher article and title in a new tab. Directly clicked the research figure: original PNG loaded at 896×857. The second figure also loaded successfully in the ROM tab. Auxiliary tabs were closed.
- Compact browser layout: repeated all four tab/quiz/source-count checks, source figures/captions readable, no document overflow. **The viewport override did not produce the requested 390-pixel phone size**: actual observed `innerWidth` was 838 and document width 823. Narrow-phone behavior and actual narrow-table scrolling are therefore not claimed as verified. Temporary viewport override was reset and the dedicated Movement result tab retained; original user tab left intact.
- Browser log review found no error entry and one Next image LCP loading advisory after restoring a scrolled ROM page; the single main figure per selected topic now uses `loading="eager"` following the installed Next image guide. This is not a performance benchmark.

Screenshots: `assets/2026-10-22-movement-sourced-core/desktop-patterns.png`, `desktop-sources.png`, `compact-rom-figure.png`.

## Limits and workspace

Source comparison, source counts, code checks and visual inspection do not establish clinical validation. Source findings retain population, method, date and access limits. Examples/cues are app-authored educational aids, not individually validated diagnostic tests, return-to-sport clearance or treatment plans. No professional approval was invented. Existing unrelated Atlas/NCSF/workspace changes were preserved. No commit, deployment, publication or cloud data mutation was performed.
