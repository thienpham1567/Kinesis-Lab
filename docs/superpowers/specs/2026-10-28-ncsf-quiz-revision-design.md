# NCSF quiz revision design

User authorization: 2026-10-28 “làm đi”, continuing the 2026-10-27 audit and implementation order. Apply corrections and expand practice using the original two mock-exam patterns. No further approval gate is required for this authorized scope.

Keep original licensed PDFs unchanged/private. Preserve all existing question positions, rewrite flawed authored items/explanations, append original questions for missing objectives and procedural subskills, and attach claim-level current references where textbook teaching is corrected or supplemented. Do not invent official answer keys, clinical approval, precise anatomy or unsupported fixed clinical thresholds.

Each item retains q/options/answer/explain/page/evidence/obj. Additional fields: kind (recall, mechanism, numeric, calculation, scenario, figure), domain (one current NCSF domain slug), references (title,url,checkedAt,scope), correction (short specific erratum where needed), optional figure {page,alt}. Figure page belongs to the same chapter and is rendered from the original PDF to private PNG. Figures are actually visible in questions; source:image alone is not visual coverage. Reference scopes reflect actual reading, dates are actual access dates (27 or 28 October).

Show references and corrections after submitting. Show figure before answering with readable zoom and error fallback. Preserve current chapter/lesson selection, shuffling, scoring and retry-wrong. Protect figures by the existing password/session gate and private,no-store response; reject invalid chapters/pages before storage access.

Coverage uses the union of existing explicit references and item obj tags. Distinguish per-chapter coverage from cross-chapter references and count visual/scenario/calculation items separately. Per-objective status notes explain sampled/partial/source gaps; multiple-concept objectives are never automatically marked complete because one matching ID exists.

Back up private quiz data before mutations. Verify runtime/schema/security behavior first with failing tests, then implementation. Validate complete question inventory, source quotes, four unique options, answer indices, references/dates, figure assets, duplicate stems and coverage references. Semantically reread revised items and newly authored distractors. Build/type/lint + React Doctor + browser checks for quiz/figure/scoring/retry/mobile; tests establish behavior and data consistency, not medical truth.

Publishing private quiz data is separate from code deployment. Upload only quiz.json and newly rendered private figures after local checks and record hashes/backups; do not reupload or expose PDFs. Record actual publication/deployment status truthfully.
