# Exercise instruction media

Asset directory for the optional video, caption (`.vtt`) and poster files used by
`ExerciseInstructionMedia`. Files are referenced from `src/lib/clinical/exercise-instructions.ts`
as `/exercise-instructions/<name>`.

## Status (2026-11-12)

| Card | Video | Captions | Poster | Credit / license |
|---|---|---|---|---|
| `incline-db-press` | none | none | none | — |
| `cable-chest-fly` | none | none | none | — |
| `cable-lateral-raise` | none | none | none | — |
| `chest-supported-tbar-row` | none | none | none | — |
| `glute-bulgarian-split-squat` | none | none | none | — |
| `barbell-hip-thrust` | none | none | none | — |

**No clip has been added.** No self-recorded or licensed footage was available in the repository
and no video was downloaded from an external platform without a verified license. All cards therefore
show “Chưa có video cho thẻ này”. The media contract and player are implemented and covered by checks
against a fixture, but the acceptance criterion “at least one clip with permission and captions” is **not yet met**.

## Adding a clip

1. Record it yourself, or obtain footage whose license allows redistribution in this app. Do not
   re-host platform videos without permission.
2. Place `*.mp4` (H.264, web-optimised, `faststart`), `*.vtt` (Vietnamese captions) and `*.jpg` poster here.
3. Add a row above with: exercise ID, setup shown, credit, license, source URL and the exact file paths.
4. Fill `media` in the card. `scripts/check-exercise-instructions.mjs` then verifies that the three files exist.
5. If the file is large, host it on read-only storage with byte-range support instead of committing it,
   and record the URL and the license conditions here.
