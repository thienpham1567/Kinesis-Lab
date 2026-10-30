# Kinesis Lab

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Vietnamese-speaking Personal Trainers using the app to study anatomy/exercise science and to organize client information and evidence-informed consultation. User decision 2026-10-30: give learning (Atlas/NCSF) and consultation/client workflows equal priority when making interface tradeoffs.

## Product Purpose

Connect anatomy and movement learning, cited educational material, private NCSF study tools and the PT's client workspace. Successful use includes finding a structure and its sources, studying/reviewing an answer without losing progress, opening the intended client record and recognizing loading, error and recovery states.

## Operating Context

The web app uses Vietnamese on desktop and mobile. `/` enters `/atlas`; other main workspaces are `/consult`, `/clients`, `/movement` and `/knowledge`. Atlas includes 3D learning, training, trigger-point reference and joint-related records. The movement handbook carries linked evidence. NCSF materials require access authentication. Consultation uses available evidence and AI services with explicit source/coverage limits.

## Capabilities and Constraints

- Existing Next.js/React app; framework APIs must follow the installed Next documentation.
- Preserve all existing workflows and 13 selectable themes during refinement.
- Keep NCSF banks, PDFs and images private; never move them into public assets or repository fixtures.
- Do not create client records, send consultations to AI, or upload/delete real lab records as a design verification step. Use synthetic fixtures and mocked network responses.
- Source-specific review/access dates and limits remain truthful. `reviewedBy` stays null when no independent review occurred. Reputable-source comparison is the Atlas content acceptance criterion; independent expert signoff is optional.

## Brand Commitments

Kinesis Lab and the established Clinical Field Notes identity. The user confirmed retaining the existing typography, themes and interface identity on 2026-10-30. DESIGN.md records their implementation; this file does not prescribe screen composition.

## Evidence on Hand

Existing claim/source records and `docs/medical-evidence-policy.md` establish content requirements and scopes. Attribution accompanies anatomical assets. UI tests, detector scores and visually realistic 3D assets do not establish clinical validity, measured anatomy or diagnostic accuracy. No professional approval or commercial proof should be invented.

## Product Principles

- Give learning and consultation equal access and practical attention.
- Make current state, next action and recovery clear.
- Preserve a reader's context and study progress.
- Keep sources and limitations findable at the point they matter.
- Prefer familiar, accessible interactions over decorative complexity.

## Accessibility & Inclusion

Preserve Vietnamese diacritics, browser zoom, visible keyboard focus and semantic control names. Aim for readable text/contrast across themes and workable layouts on mobile/tablet/desktop; report actual checks and remaining coverage rather than claiming universal conformance.
