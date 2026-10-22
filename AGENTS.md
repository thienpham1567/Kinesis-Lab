<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Medical accuracy

The user requires medically accurate knowledge grounded in reputable sources. Follow `docs/medical-evidence-policy.md` for new anatomical/medical content. Keep claim-level citations and access/review dates. Source comparison, code tests and visual realism do not establish clinical validation. Do not present mesh-derived or AI-generated fiber directions, landmarks or tissue measurements as verified anatomy. Keep reviewer metadata truthful; do not invent professional approval.

User decision 2026-10-22: use reputable-source comparison as the Atlas content acceptance criterion. Independent expert signoff is optional and is not a product/release gate. Do not show a universal “waiting for expert approval” badge or withhold supported educational knowledge for that reason. Keep reviewer metadata truthful (`reviewedBy: null` when no review occurred), and retain specific source, simulation, measurement and personal-treatment limits. This does not remove symptom-based medical referral guidance.
