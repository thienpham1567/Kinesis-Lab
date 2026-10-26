# Landing upgrade implementation plan

Approved direction: implement the 22/10 landing audit following the user's “ok vậy làm đi”. Keep the existing Vietnamese headline, fonts and blue/green identity. Atlas is the primary entry. No pricing, endorsement, medical measurements or analytics are invented.

## Implementation

- [x] Build a bounded server-side preview dataset from existing REGION_FOUNDATIONS, source records, manifest structures and exercise catalog. Preserve source dates/access scopes. Check actual deep links resolve to the selected region and existing exercise.
- [x] Replace the animated client landing with a server component and one small client region selector. Use ordinary pressed buttons, native FAQ details, main/skip link and mobile anchor navigation. Remove fake LIVE/angles and universal source promises.
- [x] Use a cropped existing screenshot of the actual anatomy study interface, with image dimensions, responsive optimization, provenance and source limits. Avoid downloading or inventing anatomy imagery.
- [x] Add a directly accessible source section with claim-level links, access scopes and dates. Explain catalog provenance separately from educational content. Explain existing AI, NCSF and storage requirements without invented pricing/security guarantees.
- [x] Replace unused landing CSS with scoped responsive styles. Keep content visible without JS; reduce motion to a short CSS entrance and hover states. Add social metadata without inventing a deployment domain.
- [x] Verify dataset integrity, lint, typecheck/build and relevant evidence checks. Exercise region selection, exact destination, FAQ, source anchors, mobile navigation and overflow at 320/390/768/1440px. Review the final diff and record actual results.

## Files

`src/lib/landing-data.ts`: bounded preview source adapter, used only by server landing.
`src/components/LandingPage.tsx`: main landing content and native disclosure controls.
`src/components/LandingRegionPreview.tsx`: interactive preview using serialized bounded data.
`src/app/globals.css`: replace the landing-specific block only.
`src/app/page.tsx`: route metadata.
`public/landing/atlas-study.webp`, `public/landing/SOURCES.md`: actual product image and attribution.
`scripts/check-landing.mjs`: data/link/source regression checks.

Existing checkout is a feature branch with the running preview. Retain this checkout, preserve unrelated `.claude/worktrees/` and audit document. No branch switch, commit, push or deployment is necessary for the requested local upgrade.
