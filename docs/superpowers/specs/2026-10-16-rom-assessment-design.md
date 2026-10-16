# Joint ROM Assessment Tab

Approved in chat on 2026-10-16. Evidence base: `reports/Bốn nền tảng đánh giá vận động.md` (ROM section).

Trainers record joint range of motion for a client, compare each value with the age/sex mean of healthy people, see left/right differences, and see whether a change since the last session exceeds measurement error.

## Storage

Reuse `biomarker_records` with a new `kind: "rom"`; one record per measuring session. `metrics` holds `{ instrument, entries: [{ movement, side, value }] }`, where `instrument` is `goniometer | smartphone | inclinometer`, `side` is `L | R | C` (C = midline movement such as lumbar flexion) and `value` is degrees. Migration `002` widens the `kind` check constraint. No new API route; the existing biomarker POST/DELETE and client GET are used. The Labs tab shows only `blood_lab`/`inbody` records.

## Reference data (`src/lib/clinical/rom-norms.ts`)

- 11 CDC normal ROM movements (Soucie et al. 2011): mean by age band (2–8, 9–19, 20–44, 45–69) × sex. Knee/elbow extension are hyperextension degrees (negative = lacking extension).
- 6 spine movements from JTSS 2023 (300 healthy young adults), no age/sex split, labelled as young-adult reference.
- SEM only where sourced: knee flexion (goniometer 3.41°, smartphone 2.72°), knee extension (1.62°, 1.18°). MDC95 = 2.77 × SEM.
- Every movement carries a source URL.

Pure functions: `normFor(movement, age, sex)` → mean + population label or null; `sideGap(L, R)`; `changeVsPrevious(movement, instrument, prev, curr)` → delta and `beyondError` (null when no SEM).

## Rules

- Never label a value normal/abnormal; show mean and signed deviation in degrees.
- Missing age or unrecognised sex → no comparison, prompt to complete profile. Age > 69 uses 45–69 with an "outside study range" note; age < 2 → no comparison.
- Instrument differs from previous session → warning (Keogh 2019: do not switch devices for one client).
- Footnote: the mean is a reference, not a diagnostic threshold.

## Out of scope

Percentile ranges, AAOS values, functional milestones, charts, movements without norms.

## Acceptance

`npm run check:rom` passes (norm lookup, age bands, MDC flag, side gap). Lint and build pass. In the browser: add a session for a seed client, see norms and deviations; add a second session and see change flags; delete a session; Labs tab unaffected; layout works at 390px.
