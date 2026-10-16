# Clinical Field Notes verification

Verified locally on 2026-10-16. Changes remain on `codex/clinical-workspace-ui` in the project checkout.

## Automated checks

- `npm run lint`: exit 0, no diagnostics.
- `npm run build`: exit 0; TypeScript and all 16 generated routes completed.
- `npm run check:safety`: `ok`, exit 0. Existing Node module-type warning remains.
- `git diff --check`: exit 0.
- React Doctor, changed-file scope: 56/100, six warnings. Two complexity warnings (client detail and PDF library), one large-page warning (clients), two effect-based-fetch warnings, one conversation index-key warning. These are advisory findings, not a clean-tool claim. Fetches retain ignore guards; conversation history only appends or removes its final failed exchange. No suppression or data-fetching framework migration was added.

## Browser observations

- Desktop 1440×1000: consultation, clients and evidence library render within page width; consultation composer is visible in the initial viewport.
- Mobile 390×844: consultation, client list/detail, evidence library and all three Atlas tabs fit the page width. Fixed intrinsic grid sizing and long reference links found during inspection. Mobile navigation remains available; PubMed appears before PDF upload on narrow screens.
- Selecting a sample question fills and focuses the composer. Shift+Enter inserts a newline. Sending with no AI credentials shows an actionable error. New session clears conversation; failed-question recovery removes its incomplete turn and source metadata.
- Selecting a client displays its safety context. Client search shows a distinct no-match state; clearing the filter restores records. “Thêm học viên” focuses the creation form.
- Client detail section switching displays the PAR-Q+ form. Atlas tabs update the URL; selecting Mông updates the selected muscle content.
- PubMed preset search completed with eight returned articles and moved focus to the results heading. This verifies UI/network flow, not the clinical relevance of search results.
- Skip navigation moves focus to `main-content`. Keyboard focus on an anatomy selector has a visible 3px outline. Native labeled PDF input remains keyboard accessible.
- Text token contrast ratios: ink/sheet 14.06, slate/sheet 5.74, slate/canvas 5.35; colored text on its semantic soft surface ranges from 5.51 to 6.06.
- Independent static reviews found and resolved a PDF reload/delete race, disabled focus target and incomplete chat retry context. Final extraction review found no remaining actionable regressions.

## Limits

Live AI response generation and PDF processing need configured OpenRouter/Supabase credentials. Existing client data was read without creating, updating or deleting records during browser verification. Upload and delete controls were reviewed statically; no personal document was uploaded or removed. Screen-reader use, reduced-motion emulation and a full accessibility audit were not performed.
