# Seedream anatomy illustration switch

**Goal:** Apply the user's selected Seedream 5.0 Flash to the existing image workspace, focused on anatomy of the body.

**Architecture:** Keep the existing explicit create/edit and local-library flow. Pin the new model/provider server-side; read both per-resolution and flat per-image pricing. Use authored anatomical region briefs and linked textbook context. Read historical model labels from each immutable receipt, preserving old FLUX records and attachments.

**Tech stack:** Installed Next 16.4 route handlers, React 19, IndexedDB. Read the installed Route Handlers guide before edits. Reuse the current branch and dirty work. Existing selection and anatomy scope are approved in conversation; no further approval gate or commit is needed.

- [x] Pin Seedream model/provider, fallback estimate $0.018 for 1K and 2K, support flat provider pricing.
- [x] Replace exercise choices with anatomical regions and anatomy prompts. Retain legacy receipt preset IDs, sources, hashes and models; new edits use current model and anatomy presets.
- [x] Update create controls, privacy notice, preview captions and entry labels. Historical detail labels derive from receipt.model. Preserve explicit Movement attachment and local-library storage.
- [x] Update existing workflow fixtures for model/provider, flat prices and anatomy context so the existing check remains usable.
- [x] Inspect the changed code and run static TypeScript/ESLint and React Doctor diagnostics. No new paid generation needed; the selected Seedream endpoint has already returned an anatomy sample. Record actual verification scope and any limitations.

Verification: TypeScript, focused ESLint and git diff --check exit 0. Browser UI visibly shows Seedream, default 2K, live $0.018 estimate and seven anatomy presets. Full React Doctor has 52 warnings across 139 files; the new eager initializer warning was fixed, while ImageControls retains its prior component-size/complexity warning. Existing mocked workflow fixtures were updated but not executed in this turn. No paid request was sent.
