# Task 03 — Thẻ hướng dẫn bài tập cho PT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Từ Atlas hoặc một bài trong buổi tập, PT mở được cách chuẩn bị, điểm quan sát, câu hướng dẫn ngắn và minh họa có nguồn phù hợp.

**Architecture:** Bổ sung catalog hướng dẫn gắn với ID bài hiện có, tách nội dung được đối chiếu nguồn khỏi ví dụ lời hướng dẫn do app biên soạn. Một component thẻ dùng chung xuất hiện trong `TrainingAtlasExplorer` và trình ghi buổi tập, có dữ liệu trình bày rút gọn để task 06 sử dụng.

**Tech Stack:** Next.js/React/TypeScript, catalog bằng chứng hiện có, video HTML gốc với phụ đề VTT, Node test runner.

## Phạm vi và thứ tự

- Ưu tiên P1. Có thể triển khai độc lập với task 01 và task 02; phối hợp khi sửa chung `WorkoutExercise.tsx`.
- Bản đầu biên soạn sáu thẻ cho ID có sẵn `incline-db-press`, `cable-chest-fly`, `cable-lateral-raise`, `chest-supported-tbar-row`, `glute-bulgarian-split-squat`, `barbell-hip-thrust`.
- Mỗi thẻ có thiết bị/chuẩn bị, 3–5 bước thực hiện, 2–3 câu PT có thể nói, điểm quan sát, lựa chọn điều chỉnh và nguồn/giới hạn.
- Có hỗ trợ video với phụ đề, poster và ghi công. Tối thiểu một thẻ phải có clip được tự quay hoặc cấp phép phù hợp để kiểm tra đầy đủ luồng media trước khi nghiệm thu.
- Những bài chưa biên soạn thẻ tiếp tục mở tham chiếu Atlas hiện có; không tự tạo thẻ từ tên bài.
- Thẻ tập trung vào hướng dẫn động tác. Không thêm nhận định chẩn đoán, dự đoán chấn thương hay tải tập cá nhân từ hình thức thực hiện.

## Căn cứ trong repo

- `src/lib/clinical/muscle-hypertrophy-atlas.ts` có `HYPERTROPHY_EXERCISES`, tên Việt/Anh, thiết bị và mô tả setup.
- `src/lib/clinical/evidence-muscle.ts` có `EXERCISE_EVIDENCE` và giới hạn từng nguồn. Có nguồn cho một bài không có nghĩa mọi nhận định hướng dẫn mới đều được nguồn đó hỗ trợ.
- `src/components/training/TrainingAtlasExplorer.tsx` đã hỗ trợ Bài tập → Cơ và Cơ → Bài tập.
- `src/components/training/WorkoutExercise.tsx` đã có liên kết Atlas theo `exerciseId`.
- Đọc `docs/medical-evidence-policy.md`, `GLOSSARY.md`, `DESIGN.md`, `docs/impeccable.md` và guide CSS/server-client của Next đang cài trước khi viết UI.

## Bản đồ file

| Thao tác | File | Trách nhiệm |
|---|---|---|
| Tạo | `src/lib/clinical/exercise-instruction-types.ts` | Kiểu dữ liệu claim, ví dụ hướng dẫn và media |
| Tạo | `src/lib/clinical/exercise-instructions.ts` | Sáu thẻ đã biên soạn, lookup theo ID hiện có |
| Tạo | `src/components/training/ExerciseInstructionCard.tsx` | Thẻ PT đầy đủ, nguồn và các lựa chọn điều chỉnh |
| Tạo | `src/components/training/ExerciseInstructionMedia.tsx` | Video/phụ đề, poster, trạng thái lỗi và retry |
| Sửa | `src/components/training/TrainingAtlasExplorer.tsx` | Đặt thẻ vào phần tra cứu bài hiện tại |
| Sửa | `src/components/training/WorkoutExercise.tsx` | Mở/đóng thẻ tại chỗ, giữ dữ liệu hiệp và focus |
| Tạo | `public/exercise-instructions/SOURCES.md` | Nguồn media, license và đường dẫn asset cụ thể |
| Tạo | `docs/research/2026-11-11-exercise-instruction-scope.md` | Bảng đối chiếu claim, phạm vi đọc và khác biệt nguồn |
| Tạo | `scripts/check-exercise-instructions.mjs` | Kiểm tra ID, contract claim, metadata và media |

Tên file nghiên cứu dùng ngày bắt đầu thực sự nếu triển khai sau ngày của kế hoạch. Không lấy ngày kế hoạch làm ngày đã đọc nguồn.

## Hợp đồng nội dung

```ts
import type { EvidenceSource } from "@/lib/clinical/evidence-types";

export type InstructionText =
  | { kind: "sourced"; text: string; sources: EvidenceSource[] }
  | { kind: "coaching-example"; text: string };

export type ExerciseInstruction = {
  exerciseId: string;
  version: number;
  setup: InstructionText[];
  execution: InstructionText[];
  cues: InstructionText[];
  observations: InstructionText[];
  adjustments: {
    context: string;
    suggestion: InstructionText;
    alternativeExerciseId: string | null;
  }[];
  limitations: string[];
  reviewedBy: null;
  media: {
    src: string;
    poster: string;
    captions: string;
    credit: string;
    license: string;
    sourceUrl: string;
  } | null;
};
```

- `exerciseId` phải tồn tại trong `HYPERTROPHY_EXERCISES`. Không đổi ID, tên bài trong giáo án đã lưu hoặc bản chụp buổi cũ.
- Claim mới về cấu trúc, chức năng hoặc tác động tập phải có nguồn ở chính dòng đó, kèm `checkedAt` và phạm vi `access` đã đọc thực tế.
- Ví dụ lời PT nói được đánh dấu `coaching-example`. Dòng có khẳng định y khoa không được chuyển thành ví dụ để bỏ qua yêu cầu nguồn.
- Không dùng trường tỷ lệ kích hoạt cơ hoặc mô phỏng 3D làm bằng chứng cho lời hướng dẫn. Không biến điểm quan sát thành khẳng định nguyên nhân bệnh hoặc “cơ yếu”.
- Lựa chọn điều chỉnh ghi rõ hoàn cảnh như thiết bị hoặc mức độ thực hiện; PT quyết định áp dụng. Một lựa chọn không tự thay bài trong giáo án đang áp dụng.
- Nếu catalog gộp nhiều biến thể, bản thẻ phải nêu thiết lập đang mô tả. Mở rộng biến thể sau này cần định danh riêng, không chuyển kết quả tập cũ giữa các biến thể.

## Task 1 — Biên soạn và đối chiếu sáu thẻ

- [ ] Lập bảng sáu ID, nội dung có thể tái sử dụng, nguồn gốc từng nhận định và phần cần đọc thêm từ `EXERCISE_EVIDENCE`.
- [ ] Với mỗi nguồn cần bổ sung, mở tài liệu gốc phù hợp và ghi title, URL, ngày đọc, phần đã đọc cùng giới hạn. Không suy từ abstract sang một quy trình kỹ thuật không được mô tả.
- [ ] Viết nội dung thẻ bằng tiếng Việt, tách các lời hướng dẫn minh họa khỏi mô tả có nguồn. Giữ thuật ngữ nhất quán với tên bài và Atlas.
- [ ] Tự rà những câu tuyệt đối như “đúng cho mọi người”, “ngăn chấn thương”, “cô lập hoàn toàn” và chỉ giữ khi nguồn hỗ trợ đúng phạm vi. Ghi rõ bất đồng nguồn nếu có.
- [ ] Dùng `reviewedBy: null` khi chưa có người đánh giá. Đối chiếu nguồn uy tín là tiêu chí nội dung; không thêm cổng chờ chuyên gia duyệt chung cho mọi thẻ.

## Task 2 — Catalog và kiểm tra contract

- [ ] Viết kiểm tra lookup ID hợp lệ/không tồn tại, số lượng sáu thẻ, ID không trùng, version dương, nguồn thiếu phạm vi và alternative ID sai.

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader();
const { getExerciseInstruction } = load("src/lib/clinical/exercise-instructions.ts");
test("only authored cards resolve and their source scope stays visible", () => {
  const card = getExerciseInstruction("incline-db-press");
  assert.equal(card.exerciseId, "incline-db-press");
  assert.equal(card.reviewedBy, null);
  assert.ok(card.limitations.length > 0);
  assert.equal(getExerciseInstruction("unknown-exercise"), null);
});
```

- [ ] Chạy `node --test scripts/check-exercise-instructions.mjs`, xác nhận thất bại trước khi tạo lookup rồi triển khai contract và catalog.
- [ ] Tạo `getExerciseInstruction(exerciseId): ExerciseInstruction | null`. Không fallback sang một bài khác hoặc một nhóm cơ rộng hơn.
- [ ] Kiểm tra mọi `sourced` item có ít nhất một `EvidenceSource` với URL HTTPS, ngày thật và access không rỗng. Kiểm tra phần biên soạn y khoa bằng đọc nguồn riêng, vì schema không xác nhận tính đúng.

## Task 3 — Media có quyền sử dụng

- [ ] Chuẩn bị một clip tự quay hoặc có license tương thích cho một trong sáu bài; ghi rõ động tác/thiết lập, credit và điều kiện sử dụng trong `SOURCES.md`.
- [ ] Tạo phụ đề tiếng Việt `.vtt`, poster và file video tối ưu cho web. Không tải lại video có bản quyền từ nền tảng ngoài khi chưa có quyền.
- [ ] Thêm `controls`, `preload="none"`, `playsInline` và `track` phụ đề. Không autoplay; không buộc tải video để đọc các bước thực hiện.
- [ ] Khi media thiếu, hiển thị “Chưa có video cho thẻ này” cùng phần chữ. Khi lỗi tải, giữ nội dung và nút thử lại; không ghi nhận đã xem hoặc nắm kỹ thuật chỉ từ việc play.
- [ ] Nếu dùng asset lớn trên storage, chọn URL phát chỉ đọc phù hợp license và chính sách triển khai, kiểm tra byte-range. Không nhét dữ liệu video vào JSON catalog.

## Task 4 — Nối Atlas và buổi tập

- [ ] Thêm thẻ vào phần nội dung bài đã chọn ở `TrainingAtlasExplorer`, ưu tiên bước chuẩn bị/thực hiện trước phần giải thích dài.
- [ ] Trong `WorkoutExercise`, thêm “Xem hướng dẫn” khi lookup có thẻ. Mở nội dung tại chỗ bằng button với `aria-expanded`, đóng trả focus về nút.
- [ ] Bài custom hoặc chưa có thẻ vẫn dùng liên kết Atlas/ghi chú giáo án hiện tại và thông báo đúng phạm vi; không tự ghép tên gần giống.
- [ ] Đọc Impeccable context và craft-floor trước sửa UI. Dùng token/font hiện có, ảnh/video giữ tỷ lệ ổn định để không đẩy vị trí ô đang nhập.
- [ ] Cung cấp component media và contract thẻ có thể nhập lại ở task 06, không phụ thuộc hồ sơ học viên.

## Kiểm tra và nghiệm thu

```sh
node --test scripts/check-exercise-instructions.mjs
node scripts/check-training-atlas.mjs
node scripts/check-muscle-evidence.mjs
npm run check:programs
npx tsc --noEmit
npx eslint src/lib/clinical/exercise-instruction-types.ts src/lib/clinical/exercise-instructions.ts src/components/training/ExerciseInstructionCard.tsx src/components/training/ExerciseInstructionMedia.tsx src/components/training/TrainingAtlasExplorer.tsx src/components/training/WorkoutExercise.tsx
npx -y react-doctor@latest . --verbose --scope changed
npm run design:check
```

- [ ] Xác minh scripts có lệnh chạy phù hợp với phiên bản Node hiện tại trước khi thực thi; dùng module loader hiện có nếu script cần alias TypeScript.
- [ ] Chạy app ở port 3051. Trong Chrome fixture, chặn `/api/clients/synthetic-client`, `/api/training-plans` và `/api/training-workouts` bằng Playwright trước khi mở hồ sơ; fixture học viên và buổi chỉ ở bộ nhớ. Kiểm tra `/atlas?tab=hypertrophy&exercise=incline-db-press` và `/clients/synthetic-client?tab=workouts`, 390/768/1440px, bàn phím và mạng chậm.
- [ ] Quét route Atlas đã render bằng `npm run design:check:page -- --viewport 390x844 'http://127.0.0.1:3051/atlas?tab=hypertrophy&exercise=incline-db-press'`.
- [ ] Kiểm tra xem clip, bật phụ đề, lỗi video, mở/đóng thẻ khi đã nhập hiệp và chuyển bài không khớp ID.
- [ ] Đối chiếu từng nhận định mới với bảng nguồn; tách kết quả phần mềm, quyền media và đối chiếu nội dung trong ghi chú bàn giao.

**Hoàn thành khi** sáu thẻ đúng ID, nội dung có phạm vi nguồn rõ ràng, ít nhất một clip có quyền/phụ đề hoạt động, và mở hướng dẫn không làm mất số liệu đang ghi.

## Phụ thuộc và bàn giao

- Task 06 phụ thuộc contract và ít nhất một thẻ đã hoàn thiện của task này.
- Task 05 có thể dẫn đến thẻ bằng `exerciseId`, nhưng không sử dụng việc xem thẻ làm bằng chứng đạt kỹ năng.
- Chỉ thêm asset hoặc nội dung đã xác minh quyền và nguồn vào commit. Tài liệu NCSF riêng tư giữ nguyên kho riêng.
