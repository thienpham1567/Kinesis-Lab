# Per-client training log

Implementation/review date: 2026-10-20. This is a record of software behavior; it does not establish medical validation. The Atlas's existing pending qualified expert review status is unchanged.

## Integration

Named export `TrainingLog` from `src/components/training/TrainingLog.tsx` accepts `{ clientId: string; initialExerciseId?: string | null }`. The caller adds the client tab and obtains the optional exercise ID from its URL. The component resets its private workspace when either prop changes, aborts the initial fetch on unmount and uses the existing exercise catalog for IDs and display names. Atlas links use `/atlas?tab=hypertrophy&exercise=<id>`.

- `GET /api/training-log?client_id=<client>` returns `{ records, mode: "local" | "supabase" }`, newest recorded date first, then newest creation time. Responses disable caching.
- `POST /api/training-log` returns HTTP 201 `{ record }`. Input: `client_id`, `recorded_at` (valid YYYY-MM-DD date), `exercise_id` (existing catalog), integer `sets` 1–100, integer `reps` 1–1000, `load_unit` (`kg`, `bodyweight`, `assisted`), `load` (0–2000 kg, or null for bodyweight), optional `rpe` (finite 0–10 or null), optional `feedback` (up to 2,000 characters).
- `DELETE /api/training-log?client_id=<client>&id=<record UUID>` returns `{ ok: true }`. Both client and record must match. A nonexistent client/record returns 404; invalid input/JSON returns 400; unavailable storage returns an explicit error.

These ranges are storage validation bounds, not recommendations. Sets/reps/load/RPE start blank. RPE is labeled self-reported session effort on the displayed 0–10 scale. No claim is made that this field implements a validated clinical instrument. The log does not prescribe loading or infer exercise clearance. Each entry records one exercise; for a session with multiple exercises, the user adds multiple entries. Assistance is the entered kg of assistance, not a computed effective load. Feedback can record the machine/configuration for later comparison.

## Persistence and migration

Local storage adds optional `training_records` to `.data/clinical-store.json`. An older store without that array reads as an empty history, and the first write persists the array. Existing client/biomarker/document arrays and unknown top-level keys are retained. Malformed JSON or invalid array shapes throw; they are never silently replaced with seed data. Writes use a unique temporary file plus atomic rename to reduce truncated-file risk. This remains the application's local single-process file store, without a distributed transaction/locking layer.

When both Supabase variables exist, the API uses `training_records` through the existing server-only service-role client. Apply `supabase/migrations/003_training_records.sql` to the configured database. It creates the table, client foreign key/cascade, validation constraints, date index and row level security. No public policies are added. A partial configuration fails with 503. A missing table fails with 503 naming the migration. Remote failures do not fall back to local/in-memory records.

Only built-in demo seed notes/AI summaries were edited to remove unsupported exercise clearance, Zone 2/RPE conversion, vitamin/CK conclusions and automatic food/exercise advice, with explicit demo labeling. Existing user `.data` contents are not migrated or rewritten by that copy correction. No new medical or anatomical claims were added.

## Verification

- `node scripts/check-training-log.mjs`: passed. The script transpiles into an OS temporary folder, creates two synthetic clients and uses a temporary `.data` file. It covers strict finite-number/date/catalog validation, malformed JSON, unknown clients, old-store migration, original/unknown data preservation, scoped history/deletion, disk persistence across a fresh route import, deletion persistence, and preservation of corrupt files. A localhost PostgREST fixture exercises the real Supabase REST client for missing-table errors, configured save/list/delete, client isolation and absence of local fallback. It never reads or mutates the workspace `.data` file or uses hosted credentials.
- Scoped ESLint for training log code, local store and check script: passed after renaming the storage selector to `shouldUseSupabase` so it is not treated as a React Hook.
- Focused React Doctor scan of `TrainingLog.tsx`: one `no-fetch-in-effect` advisory. Reviewed as an intentional bounded client fetch within this existing client-rendered application: an AbortController handles unmounts, the workspace is keyed by client, and explicit loading/error states are provided. No rule was suppressed. A cache/query framework was not added for this single form.
- Full build/type checks and live desktop/mobile/keyboard integration are coordinated by the parent task. No hosted PostgreSQL migration was run by this subtask; the REST fixture is not a PostgreSQL/schema execution test.

The responsive layout uses shrinking grid columns, full-width inputs and wrapping history cards, with no fixed-width history table. Keyboard labels and status/error announcements are present; the parent task verifies the composed client page at 390px.
