# Impeccable UI fixes

**Goal:** Apply the three fixes approved after the baseline audit: evidence-label contrast, theme-picker keyboard/focus, and small functional text. Preserve the existing identity, content, fonts and 13 themes.

**Scope:** Narrow refinement using the existing implementation as design authority. The user approved execution on 2026-10-30. No new page, medical claim, dependency, deployment or design-system replacement.

## Tasks

- [x] Reconfirm the baseline evidence in `docs/superpowers/reviews/2026-10-30-impeccable-audit.md`: native focus fails on the custom listbox; functional text is 10px; evidence labels have 3.5308:1 contrast.
- [x] Replace the custom listbox in `src/components/ThemePicker.tsx` with a labeled native `select`, retaining the conic-gradient circular trigger and all 13 options. Use `THEMES` as the option source and `setTheme` for selection. Remove CSS only used by the retired popup. Browser verification must cover Arrow keys, Enter/Escape, retained focus, selecting an option and persistence after reload.
- [x] Update `src/app/globals.css`: eyebrow and section-number roles to 11px. Update mobile nav in `src/components/AppShell.tsx` to `text-xs`; movement authored-content attribution and consult evidence metadata to `text-xs`. Change “Cách đọc bằng chứng” to `text-ink`; preserve all text and source links.
- [x] Verify the existing ThemeProvider lint error separately. Fix theme hydration/persistence only if required for the picker checks; otherwise report the pre-existing error explicitly.
- [x] Run TypeScript, targeted ESLint and React Doctor. Run the Impeccable source detector and rendered scans for the five original routes at 1280×800 and 390×844. Compare warnings by category, without suppressing intentional styles.
- [x] Inspect Atlas/mobile and picker visually, measure changed label contrast across the 13 themes, save review screenshots, and write a follow-up verification report. Preserve the original audit as historical evidence.

## Verification policy

These are reversible presentation and native-control changes. Use rendered before/after measurements and actual browser interaction; do not add tests that only assert class strings or mirror the implementation. The baseline already reproduces the failures. No clinical claims are being changed and UI verification does not validate medical content.
