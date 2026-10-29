# NCSF mock exams

Add “Đề thi thử” beside the existing mini quiz tab. Two independent exams contain exactly 150 source questions each. Preserve source text, option order, numbering anomalies and all 13 original illustrations. Never import Google account details, draft selections, or infer official answer keys. Source checked 2026-10-29 through authenticated read-only DOM and page asset capture.

The interface uses the existing cobalt, ink, slate and sheet tokens, typography and restrained spacing. Purpose: take either original mock exam and revisit selected answers. Design direction: functional, quiet study workspace; the existing tab bar is the visual anchor. Each exam retains selections while switching between the two or consulting another library tab, reports answered count and offers completion and restart. No correctness score without an official key. Original question order is fixed; mini quizzes retain their existing shuffle.

Licensed content stays in ignored .data and the private ncsf storage bucket. Authenticated, private/no-store API routes serve a validated bank and bounded PNG image keys. Public Git contains only generic runtime and import/release tools.

Implementation steps:
1. Test exact bank structure, original ordering, three-option questions, duplicate printed labels, missing keys, bounded image routing, and auth/cache/error policy; observe failure before implementation.
2. Build/validate a private bank from all 300 live source questions and 13 captured images, recording hashes and source comparison.
3. Add parser, authenticated routes and native exam component; integrate the third tab.
4. Run runtime tests, type/build/lint checks and browser interaction/responsive checks. Verify all original text/options/images and existing mini quiz behavior.
5. Upload private assets with backup and hash verification; rebase on latest master, push release, wait for deployment, and verify production with screenshots. Record exact release evidence privately.

Limit: the two forms expose questions and choices, not an official answer key. Cloning preserves source wording and does not establish clinical validation or correct known source errors.

Review: an independent code reviewer verified source fidelity, private storage and API boundaries. A reproduced tab-unmount bug was fixed by lazily mounting the mock component once and hiding it while consulting other library tabs. Attempts remain in memory until the library page is left or reloaded. React Doctor’s preventDefault warning is intentional client form handling; tiny fixed key arrays are not a material performance issue. Async fetch state is guarded by AbortController.
