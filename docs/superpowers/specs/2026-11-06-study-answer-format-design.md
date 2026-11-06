# Study answer formatting

User approved implementation of the five improvements proposed in chat on 2026-11-06. Keep react-markdown and the Clinical Field Notes identity.

Use a shared Markdown AST traversal for citation numbering and clipboard conversion. Only prose text is eligible; code, existing links, images, HTML and math are excluded. Unknown markers remain visible in the UI and are explicitly flagged in prose copies. Preserve original Markdown semantics in copied code and links. Source numbers must agree across rendered text, source list and copy.

Add remark-math and rehype-katex with local CSS/fonts, MathML accessibility, trust disabled and bounded expansion. Invalid math falls back visibly without breaking the answer. Stream-only Markdown completion uses Remend; original model text and stored messages stay unchanged. Disable answer-body navigation and table copy while streaming. Both study and general chat retain safe raw HTML and image handling.

Citation controls open the source disclosure, focus and scroll to the matching source within the drawer. Use unique per-answer IDs and keyboard-operable buttons. Each source retains its title, access scope and check date. No new evidence claims are introduced.

Tables retain native semantics, gain a labelled keyboard-focusable horizontal scroll region and a copy button. Copy table values as tab-separated text with displayed citation numbers; copy failures provide a visible recovery message. Long formulas and wide tables scroll within the answer, never widening the drawer.

Acceptance: regression fixtures for excluded citation contexts, displayed/copied numbering, math errors/unsafe commands, incomplete streaming syntax and unsafe URLs/images. Browser checks cover source navigation, table copy, narrow viewport and completed streaming response. Run scoped tests, study-chat suite, TypeScript/lint/build, React Doctor and design source/render scans. Record actual unresolved detector findings separately from functional failures.
