# Study assistant right drawer — 2026-11-05

Implemented user-approved direction with Impeccable and frontend-design: Clinical Field Notes drawer beside reading material on wide desktop, native modal/fullscreen on smaller screens. No deployment or model configuration/retrieval changes in this UI pass. Prior uncommitted evidence improvements are preserved.

## Delivered

- Toolbar “Trợ lý” launcher, explicit close control, model selector and new-conversation action. Removed floating bubble/card CSS.
- Docked right column from 1280px; modal overlay on tablet, fullscreen below 640px. Header/composer stay in place; answers/library scroll independently.
- Theme-bound paper/ink/dividers, 14px answer text, 16px mobile fields, quieter source labels and three wrapping suggestion controls. Existing nine themes and Vietnamese fonts retained.
- Native dialog background protection, responsive modal/nonmodal switching, exact close/Escape/backdrop handling and focus return. Modal Tab wrapping includes native source summaries; docked mode permits reading interaction.
- Closed drawer stays mounted/inert: draft, conversation, library and in-flight stream survive close/reopen. Source/copy/save remain available.
- Local container query adapts NCSF chapter/lesson controls to the actual reading width. PDF resize restoration now retains an unfinished page jump and uses instant alignment rather than inheriting CSS smooth scrolling; pointer/wheel/scrolling-key input cancels the pending target. The reading viewport is explicitly keyboard-focusable.

## Observed verification

Used the actual production UI through a localhost-only synthetic chat proxy for stream/error scenarios. Fixture replies were explicitly labeled as UI test data, not medical evidence. No paid model requests, client consultation writes or private textbook uploads in this UI task.

- Desktop 1280×720 and 1440×900: drawer sits beside the document, no horizontal overflow, reader remains interactive. At 1440px the drawer measured about 518px, below the 64px toolbar.
- Mobile 390×844: native modal rectangle 0,0,390,844; model select and composer both 16px; heading receives initial focus without opening a mobile keyboard. Fifteen successive Tabs stayed inside; source-summary Shift+Tab moved to the preceding source disclosure. Modal↔docked transitions were also checked by independent review.
- 390×400: close button and composer remained visible, no horizontal overflow. Physical mobile keyboard and native mobile Safari were not simulated.
- Tablet 900×800: backdrop click dismissed the drawer without navigating the underlying link and returned focus to the launcher.
- Close button/Escape: draft survived reopen. Escape closed an open theme menu first and kept the drawer open. Closed controls are inert.
- Synthetic long stream: closed while aria-busy=true, reopened with the complete response. Copy included source URL; saved-answer search matched unaccented Vietnamese. Synthetic 502 preserved the draft, displayed a recoverable error, and a subsequent valid submission worked.
- PDF regression: before the fix, requesting page 8 then opening the drawer showed page 9; repeated toggles could drift 8→7→6. After instant resize restoration and pending-target handling, the immediate-open case and four close/open cycles all retained page 8. This verifies page identity, not an identical within-page pixel offset after resizing.
- Navy sampled contrast: heading 13.99:1 and subtitle 8.14:1 against drawer paper. Linen was also visually inspected. These samples do not certify every element/theme/state.

## Checks and review

- `npm run check:study-chat`: 53 passing, including six new drawer regression cases.
- `npm run check:chat`: 25 passing plus evidence coverage; `npm run check:ui`: 33 passing; Markdown check passed. Total 111 Node tests.
- Targeted ESLint, TypeScript, production build and `git diff --check`: passed.
- Independent review identified source-summary keyboard order and keyboard cancellation of pending PDF jumps; both were reproduced/reviewed and fixed. No remaining actionable finding in that focused review.
- React Doctor reported no changed-file issues; its project score is not an accessibility or clinical certificate.
- `npm run design:check`: existing 3px side-border finding at globals.css:1090 and 25 advisories retained. Changed-component scan reported the existing 15px brand label as an advisory. These are contextual findings, not proof of a new usability defect. Page scan exited 0 without a detailed finding report; manual open-drawer checks supplement the closed-page scan.
- Initial warm build used stale generated CSS. The generated `.next` directory was moved to a temporary backup and rebuilt; subsequent warm builds emitted the updated drawer styles. No cache configuration or source permissions were changed.

## Scope and limits

This is an interface change, not medical validation. Existing claim/source dates, warnings, retrieval policy, storage keys and reviewer metadata remain governed by the medical evidence policy. No new medical claims or clinician signoff were added. No merge, push or deployment performed. Preview uses the real local production app; the synthetic proxy is stopped after verification.
