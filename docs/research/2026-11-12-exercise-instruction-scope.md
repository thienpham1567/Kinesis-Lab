# Exercise instruction cards — source scope (2026-11-12)

Plan: `docs/superpowers/plans/2026-11-11-03-exercise-instruction-cards.md`.
This is the actual implementation date; it is not a source-reading date.

## What was read

**No new source document was opened for this work.** The `sourced` lines reuse source records that
already exist in `src/lib/clinical/evidence-muscle.ts`, each with its original checked date (2026-10-22)
and reading scope. Each line was reworded only within what the matching `EXERCISE_EVIDENCE` claim already
states. Nothing here extends those reading scopes.

## Claim table

| Exercise | Sourced line | Sources (keys in `MUSCLE_EVIDENCE_SOURCES`) | Basis in existing record | Not supported |
|---|---|---|---|---|
| `incline-db-press` | Ngực lớn/delta trước vận động vai, tam đầu duỗi khuỷu | `upper` | `EXERCISE_EVIDENCE` role claim [1] | Góc 30° tối ưu; tạ đơn; khác biệt theo đầu cơ. `chaves` is listed only as a limitation (Smith machine 0°/44°) |
| `cable-chest-fly` | Ngực lớn khép cánh tay; delta trước phối hợp | `pectoral`, `upper` | Role claim [1,2], labelled inference | Cable fly ngồi cụ thể; lực căng không đổi; tay cắt chéo |
| `cable-lateral-raise` | Delta dạng vai, thang phối hợp bả vai | `deltoid`, `upper` | Role claim [1,2] | Vị trí cáp tối ưu |
| `cable-lateral-raise` (adjustment) | Cáp ≈ tạ đơn về tăng độ dày delta giữa (8 tuần, 24 người đã tập, ROM chuẩn hóa) | `lateralRaise` | Claim [3]; abstract only | Mọi vị trí cáp; phòng đau vai |
| `chest-supported-tbar-row` | Thang/trám vận động bả vai; delta sau/lưng rộng; gập khuỷu phối hợp | `muscles`, `upper` | Role claim [1,2]; EMG study `lehman` excluded because it examined seated rows | Góc khuỷu; phì đại thang dưới; tựa ngực là điều trị |
| `glute-bulgarian-split-squat` | Mông + khép duỗi háng, tứ đầu duỗi gối | `hip`, `thigh` | Role claim [1,2] | Thử nghiệm phì đại biến thể này; ưu tiên mông/bó cụ thể |
| `barbell-hip-thrust` | Mông lớn + gân kheo duỗi háng | `hip`, `thigh` | Role claim [1,2] | Đỉnh mô-men 0–20°; giữ 2 giây bắt buộc |
| `barbell-hip-thrust` | Hip thrust ≈ squat về tăng mông lớn (9 tuần, 34 người chưa tập) | `plotkin` | Claim [3]; abstract only | Máy; mọi bó mông |

## Not sourced (coaching examples)

Setup, execution steps, spoken cues, observation prompts and adjustment suggestions that do not make
a structure/function/effect claim are labelled `coaching-example`. They are app-written teaching wording.
The existing Atlas fields `setupAndExecution` and `commonMistake` were the starting point; they carry the same status.

## Source differences and limits

- Study protocols differ from the cards' variants (see each card's `limitations`). Sources are context for
  muscle roles or comparison outcomes, not validation of the technique wording.
- `reviewedBy: null` on every card. No professional review occurred; this is not a release gate.
- Activation percentages and 3D models are not used as evidence. Activation data in the catalog is a zero sentinel.
- Software checks (`scripts/check-exercise-instructions.mjs`) verify structure, IDs, URLs, dates and wording rules only,
  not medical truth.

## Open

- Re-reading original documents to broaden any claim would need new checked dates and reading scopes.
- Media: see `public/exercise-instructions/SOURCES.md`; none added.
