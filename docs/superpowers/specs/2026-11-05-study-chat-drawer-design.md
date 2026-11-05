# Study assistant right drawer

Date: 2026-11-05. Status: user approved docked desktop / fullscreen mobile on 2026-11-05.

## Job and visual direction
Replace the floating study chat card/bubble with a right-side drawer for Vietnamese PT learners. Use the existing Clinical Field Notes world: theme-bound paper and ink, Be Vietnam Pro, quiet dividers, restrained primary accents, existing icon vocabulary. Operate/Read mode; comprehension and convenient switching between material and questions are the priority.

## Recommended interaction
- A labeled assistant toggle in the workspace toolbar replaces the floating launcher. On small screens retain a clear icon button with accessible name; preserve space for route title and theme selection.
- At wide desktop widths, the assistant occupies a dedicated right column below the toolbar, approximately 500–520px wide. The document/workspace and drawer can both scroll independently and remain interactive. Closing restores the full reading area and focus to the launcher.
- On narrower screens, a right drawer overlays the workspace; on mobile it fills the viewport, with a dismissible backdrop where any background remains visible. This variant is modal: background inert, focus contained, Escape/close dismiss and restore focus. It must not lose conversation/draft or abort a response just because it is closed.
- Header: assistant title, current page context, close control; separate compact model selector and new-conversation action. Two clear destinations for Q&A and library. Comfortable answer typography, restrained question bubbles, source disclosure and fixed composer with contextual suggestions.
- A short horizontal slide indicates opening/closing, with an intentional reduced-motion alternative. Keep loading, errors, source notices, saved history, copy and selected Atlas context behavior.

## Alternatives considered
1. Recommended: docked drawer on wide desktop, modal overlay on smaller viewports. Best for reading and asking together; needs careful responsive checks of the existing reader/Atlas layout.
2. Modal overlay everywhere. Smaller layout change, but blocks interactions with the study material while open.
3. Resizable multi-pane workspace. Flexible but adds controls and scope not needed for this request.

## Scope
Shared study assistant UI on routes where it already exists; consultation keeps its dedicated chat. Preserve all prior evidence/retrieval changes, private NCSF content, browser storage keys, model choices and nine themes. No new medical content, backend/model changes, paid model evaluation or deployment for this UI work.

## Acceptance checks
Open/close buttons work, Escape restores focus, closed drawer has no tabbable hidden controls, modal variant traps focus and prevents background interaction, docked variant permits reading/selection, selected text still reaches the composer, draft/history survives closing/reopening, source/copy/library remain available, reader scroll is preserved. Check desktop/tablet/mobile, short viewport, theme contrast, reduced motion, loading/error and long answers. Run existing chat regression tests, targeted lint/TypeScript, React Doctor, design source/page scans and production build. Record unresolved findings.
