# Mobile navigation spacing

Reviewed 2026-11-06. The four navigation links occupied a fixed five-column grid. Updated the grid to create equally sized columns from its actual children.

Verification:
- `npm run build` passed.
- `git diff --check` passed.
- Browser at 390px: four 90.5px columns; document width matches viewport.
- Browser at 1000px: four 243px columns, 4px gaps and 8px outer padding.
- Desktop navigation remains hidden at 1280px.
- Screenshot: `.data/artifacts/mobile-nav-even-columns.jpg`.

Design checks ran; they are not clean. The source detector still reports the existing border finding and 25 advisories. The rendered clinical rehabilitation route at 1000×720 reports 35 findings (contrast, small text, long lines and nested cards) and 10 contrast advisories. These broader visual findings remain unresolved by this spacing-only change. Logs: `/tmp/kinesis-mobile-nav-design.log` and `/tmp/kinesis-mobile-nav-page-check.log`. No medical content changed.
