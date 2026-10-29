# Shuffle NCSF mock exams

User request supersedes the previous fixed-order presentation. On each click of “Đề thi thử”, shuffle both exams; clicking a bộ selector reshuffles that exam, and “Làm lại” clears and reshuffles only that exam. Preserve existing answers when navigating the library or switching exam selectors, using source question/option indices so choices and figures never detach. Keep a generated order stable while answering or completing the exam. Ensure each new question order differs from its preceding order.

Source bank, original text, image keys and authentication remain unchanged. Render sequential question numbers and A/B/C/D labels for the shuffled view, stripping only source numbering prefixes. All 300 source items have consistent prefixes and no option references that depend on letter/relative ordering. Three-option questions remain three-option questions. No official keys or scoring are added.

Plan:
1. Add failing tests for complete, immutable permutations; repeated shuffles; stable original answer/image mapping; three choices and label formatting.
2. Implement pure presentation helpers and per-exam order state. Connect tab entry through a component handle, maintaining mounted attempts.
3. Verify question/choice changes on entry/selector/restart; answering does not reshuffle; selected content remains selected across reshuffles; source images stay attached; completion/restart mouse and keyboard still work.
4. Run NCSF tests, lint, type/build and React Doctor. Review, fetch/rebase current master, release, verify production and capture screenshot.
