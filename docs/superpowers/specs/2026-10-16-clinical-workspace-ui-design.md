# Clinical Field Notes

Approved in chat on 2026-10-16 for all main screens.

The interface helps Vietnamese personal trainers review client context, identify safety concerns, consult anatomy and ask an evidence-informed training question. Use a calm editorial clinical workspace: off-white canvas, white panels, cobalt actions, deep green context, and distinct amber/red safety states. Preserve Be Vietnam Pro and IBM Plex Mono. Numbered section labels and ruled dividers are the visual anchor; use a consistent 4px spacing rhythm and sparse color transitions with reduced-motion support.

## Scope

- Shared navigation, connection status, skip link, mobile navigation, footer and page headings.
- Consultation: clear client selection, compact anatomy controls, concise sample cases, readable conversation and a prominent composer with pending/error feedback.
- Atlas: consistent heading and tab controls, generous drawing area, usable controls on small screens; keep existing diagrams, sources and clinical content.
- Clients: readable risk labels, search, honest loading/empty states, clear create form and detail navigation.
- Knowledge: separate PDF library and PubMed search, readable document/results lists, keyboard-accessible upload, explicit empty/pending/error states.
- Client details: align heading, section navigation and feedback with shared design.

## Boundaries

Keep API contracts, storage, safety rules and medical guidance intact. Existing assets remain local; add no font, animation or UI library. Do not invent statistics or service availability. Treat missing credentials as a visible connection state.

## Acceptance

All main routes render at desktop and 390px without horizontal page scrolling. Primary controls are labeled and focus is visible; navigation announces the current route. Clinical warnings remain visible. Sample questions populate the composer, Atlas tabs remain shareable, client search filters existing records, PDF/PubMed errors are recoverable. Run lint, production build, existing safety check and React Doctor; inspect responsive layouts and key interactions in a browser. External AI success requires configured credentials and is outside local UI verification.
