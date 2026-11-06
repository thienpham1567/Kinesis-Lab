# Training programs: storage and verification

Local mode adds optional `training_plans` and `training_workouts` arrays to the existing `.data/clinical-store.json`; old `training_records`, other arrays and unknown keys remain intact. No conversion or deletion of the old standalone log is required. Local mutations run synchronously from read through atomic file replacement; as with the existing local store, operate one application process against a store. Multiple processes writing the same local file are unsupported. Tests inject a synthetic store or use a temporary directory and never access the user's `.data`.

Supabase mode requires both server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Partial configuration and database errors produce explicit failures; there is no fallback to the local store. With migrations 001–003 already present, apply `supabase/migrations/004_training_programs.sql` through your normal database migration procedure or paste the whole file into the Supabase SQL editor. This change does not apply it remotely. Back up the database before your normal migration procedure. Restart/reload the app after the schema cache updates.

Migration 004 creates `training_plans`, `training_workouts`, and the `save_training_plan`, `set_training_plan_status`, `save_training_workout` RPCs. Client-row locks serialize revision allocation and activation; a partial unique index enforces one active revision. Saved program content is immutable. Workouts retain a prescription snapshot and reject owner/plan/session changes for an existing ID. Client deletion cascades both new tables. RLS is enabled and public/anonymous/authenticated table access and RPC execution are revoked; only the existing server service-role path is granted access. This retains the application's current deployment/authentication model; client association checks are not a new end-user authentication system.

The normal manual path needs no AI key. Explicit AI proposal requests supply curated source records with their original access/review dates and null reviewer identity, along with a bounded factual training summary. Model context is not verified entailment or personal clinical clearance. Submitted source contexts must match the curated catalog; invented review identities, URLs, dates or claims are rejected. AI never persists or activates plans. Invalid output is retryable; missing decision-critical information returns HTTP 422 with up to six questions. The provider call has a 50-second timeout and follows request cancellation.

Run domain/repository/API/AI and chat checks:

```sh
node --test scripts/check-training-programs.mjs scripts/check-chat-route.mjs
```

The optional SQL check runs actual PostgreSQL code in an isolated in-memory PGlite instance. It verifies migration syntax, revision immutability, one-active constraint, RPC ownership, snapshot/reference conflicts, retry idempotence, reopen/completion rules, grants and cascade. It does not connect to Supabase or establish production deployment/concurrency behavior. Install its runtime outside the repository, then run:

```sh
npm install --prefix /tmp/pt-program-sql-tests --no-audit --no-fund @electric-sql/pglite
TRAINING_SQL_PGLITE_MODULE=/tmp/pt-program-sql-tests/node_modules/@electric-sql/pglite/dist/index.js node --test scripts/check-training-programs-sql.mjs
```

Numeric ranges and editable setup defaults are storage/setup limits, not safe-dose recommendations. Software tests and source comparison do not establish clinical validation or professional approval.
