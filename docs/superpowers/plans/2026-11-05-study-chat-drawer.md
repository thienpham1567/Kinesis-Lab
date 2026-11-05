# Study assistant drawer implementation plan

**Goal:** replace the floating assistant with an accessible right drawer, docked beside study material on wide desktop and modal/fullscreen on mobile.
**Architecture:** AppShell owns visibility and a toolbar launcher. A focused native-dialog shell handles wide nonmodal vs small modal behavior, focus return and dismissal; StudyChatWidget keeps conversation, streaming, source, selection and browser-storage logic. The NCSF reader adapts to its actual available width through a local container query.
**Tech stack:** existing Next.js 16.4, React 19, TypeScript and CSS; no new package.
**Execution:** inline in the existing shared workspace/branch, preserving prior uncommitted evidence work. User approved the design; no deployment or paid AI calls in this UI task.

- [x] Add failing SSR accessibility-contract checks for the toolbar launcher and hidden native drawer. Use the Node test runner and existing TypeScript/React packages; browser interactions will exercise actual native dialog behavior.
- [x] Add StudyChatDrawer shell under src/components/study-chat. Use show() on wide desktop, showModal() below the same breakpoint, native background inert/focus containment, explicit Escape/backdrop/close behavior, and focus return without losing content/draft.
- [x] Lift open state to AppShell, put the launcher beside the theme control, and arrange the reading scroller and drawer in a responsive workspace row. Keep assistant unavailable on the existing consultation route.
- [x] Update StudyChatWidget header, model controls, Q&A/library navigation, empty state, answer readability and fixed composer; retain source/history/stream behavior and storage keys. Remove old floating panel/launcher CSS.
- [x] Add theme-bound drawer styles, short slide/fade transitions and reduced-motion behavior. Adapt NCSF chapter/lesson controls when the actual page width becomes narrow; preserve the mounted reader and scroll position.
- [x] Build, then verify actual production UI through a localhost-only synthetic chat proxy: open/close/Escape/focus, modal vs docked layout, draft and response continuity, library/source/copy, reader selection and scrolling, desktop/tablet/mobile, narrow/short viewport, themes and reduced motion. No real AI requests.
- [x] Run existing chat/reading/UI regressions, targeted lint, TypeScript, React Doctor, production build, source/page design checks. Perform focused independent code review and fix actionable issues; record remaining findings and screenshots/check limits.
