# Task 06 — Chế độ giải thích và hướng dẫn cho học viên

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho PT trình bày một bài hoặc một buổi bằng hình lớn, lời hướng dẫn ngắn và bản in mang về chỉ chứa nội dung PT đã chọn.

**Architecture:** Tạo projection dữ liệu theo allowlist từ thẻ hướng dẫn và giáo án/bản chụp buổi đã lưu. Render projection trong một dialog trình bày độc lập, tái sử dụng media của task 03 và tạo bản in cùng payload bằng CSS print.

**Tech Stack:** React/TypeScript, native dialog, React portal, Fullscreen API tùy hỗ trợ và CSS print trong Next.js hiện có.

## Phạm vi và thứ tự

- Ưu tiên P2. Phụ thuộc task 03 cho thẻ hướng dẫn có nguồn và media. Không phụ thuộc task 04.
- Hai entry point là thẻ bài ở Atlas và buổi/giáo án đã lưu trong hồ sơ học viên.
- Chế độ bài đơn trình bày mục đích, bước chuẩn bị/thực hiện, tối đa ba lời nhắc và minh họa của đúng bài.
- Chế độ buổi trình bày danh sách bài và thông số dự kiến từ bản đã lưu mà PT chọn. Một nút in dùng cơ chế in của trình duyệt để in hoặc lưu PDF.
- PT có thể thêm một lời nhắc riêng tối đa 500 ký tự và xem trước toàn bộ bản in. Lời nhắc nằm trong state phiên, không tự ghi vào hồ sơ hoặc đổi giáo án.
- Bản đầu không có đường dẫn chia sẻ công khai, cổng học viên hoặc tự gửi file. Tác vụ in chỉ bắt đầu sau khi PT bấm.

## Căn cứ và file tham khảo

- `ExerciseInstructionCard` và `ExerciseInstructionMedia` do task 03 cung cấp nội dung hướng dẫn đã đối chiếu.
- `TrainingPlan` có revision và sessions bất biến; `TrainingWorkout.prescription` giữ nội dung gốc của một buổi.
- `ClientTrainingWorkspace` đã giữ dữ liệu và draft qua điều hướng, vì vậy entry point phải dùng cùng state thay vì tải lại rồi lấy giáo án active khác.
- `Client` chứa nhiều trường lâm sàng không cần cho giảng giải động tác. Component trình bày không nhận cả object `Client` hoặc `TrainingPlan`.
- Đọc `GLOSSARY.md`, `docs/medical-evidence-policy.md`, `DESIGN.md`, `docs/impeccable.md` và guide server/client/CSS của Next đang cài trước sửa UI.

## Bản đồ file

| Thao tác | File | Trách nhiệm |
|---|---|---|
| Tạo | `src/lib/training/teaching-view.ts` | Allowlist, nguồn phiên bản và kiểm tra payload trình bày |
| Tạo | `src/components/teaching/TeachingDialog.tsx` | Dialog, bàn phím, fullscreen và trả focus |
| Tạo | `src/components/teaching/TeachingExercise.tsx` | Nội dung một bài dễ đọc khi đứng lớp |
| Tạo | `src/components/teaching/TeachingHandout.tsx` | Preview và nội dung in cùng payload |
| Sửa | `src/components/training/ExerciseInstructionCard.tsx` | Nút mở trình bày một bài |
| Sửa | `src/components/training/WorkoutRunner.tsx` | Nút trình bày đúng bản chụp buổi đang xem |
| Sửa | `src/components/training/ProgramEditor.tsx` | Nút trình bày buổi của một phiên bản đã lưu |
| Sửa | `src/app/globals.css` | CSS phạm vi dialog và bản in |
| Tạo | `scripts/check-teaching-view.mjs` | Allowlist, nguồn phiên bản và bài custom/thiếu thẻ |
| Sửa | `scripts/check-training-program-ui.mjs` | Đóng trình bày giữ draft và entry point đúng phiên bản |

## Hợp đồng dữ liệu trình bày

```ts
export type TeachingOrigin =
  | { kind: "exercise"; exerciseId: string; instructionVersion: number }
  | { kind: "plan"; planId: string; revision: number; sessionId: string }
  | { kind: "workout"; workoutId: string; planId: string; sessionId: string; performedAt: string };

export type TeachingExercise = {
  id: string;
  name: string;
  exerciseId: string | null;
  planned: {
    sets: number;
    repMin: number;
    repMax: number;
    load: number | null;
    loadUnit: "kg" | "bodyweight" | "assisted";
    restSeconds: number;
    rir: number | null;
    tempo: string;
    method: "straight" | "superset";
    supersetGroup: string;
  } | null;
};
export type TeachingView = {
  origin: TeachingOrigin;
  title: string;
  exercises: TeachingExercise[];
  personalReminder: string;
};
```

- Chỉ copy trường allowlist. Loại tên học viên, mục tiêu sức khỏe, bệnh lý, thuốc, xét nghiệm, sàng lọc, chat, ghi chú buổi và source-context của AI khỏi projection mặc định.
- Tiêu đề tạo theo tên buổi/bài được chọn. Trước khi trình bày, PT được sửa tiêu đề nếu tên đã lưu có thông tin cá nhân; UI nhắc xem trước nội dung trước khi in.
- Nguồn `plan` lấy đúng session từ phiên bản đã lưu được chọn. Không có bản đã lưu thì hướng dẫn PT lưu phiên bản trước.
- Nguồn `workout` lấy `workout.prescription`, kể cả khi giáo án active đã đổi. Nhãn ghi “Nội dung theo bản chụp buổi đã lưu”; không tự gắn revision mới nếu không tra được đúng plan ID.
- Thông số phải giữ đủ đơn vị, RIR/tempo và nhóm superset để bản mang về không làm mất cách đọc buổi gốc. Load null hiển thị “PT hướng dẫn trực tiếp”, không điền 0 hoặc đề xuất tải mới.
- Thông số trong bản trình bày ghi rõ “Theo giáo án đã lưu”. Chúng không chứng minh học viên đã tập hoặc được xác nhận phù hợp y khoa.
- Hướng dẫn/nguồn lấy trực tiếp từ lookup task 03 và đúng `exerciseId`. Bài custom thiếu thẻ vẫn hiện tên và thông số được chọn, kèm thông báo PT sẽ hướng dẫn trực tiếp.

## Task 1 — Projection có thể kiểm tra

- [x] Viết `createSessionTeachingView(origin, session)` nhận origin dạng plan/workout cùng `ProgramSession`; chỉ trả các trường allowlist. Viết `createExerciseTeachingView(exerciseId)` trả projection từ thẻ hoặc null.
- [x] Thêm kiểm tra chống copy lan trường thừa trước khi triển khai.

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader();
const { createSessionTeachingView } = load("src/lib/training/teaching-view.ts");
test("a teaching handout contains selected prescription fields only", () => {
  const session = {
    id: "s1", name: "Buổi A", weekday: 1,
    exercises: [{ id: "e1", exerciseId: null, name: "Bài custom", sets: 2,
      repMin: 8, repMax: 10, load: null, loadUnit: "kg", restSeconds: 60,
      rir: 2, tempo: "", method: "straight", supersetGroup: "", notes: "PRIVATE_NOTE" }],
    medical_conditions: ["PRIVATE_MEDICAL"],
  };
  const view = createSessionTeachingView({ kind: "plan", planId: "p1", revision: 2, sessionId: "s1" }, session);
  assert.equal(view.origin.revision, 2);
  assert.equal(view.exercises[0].planned.load, null);
  assert.equal(view.exercises[0].planned.rir, 2);
  assert.equal(JSON.stringify(view).includes("PRIVATE_"), false);
});
```

- [x] Chạy `node --test scripts/check-teaching-view.mjs`, xác nhận thiếu module/hành vi, rồi triển khai projection theo phép copy field tường minh, không dùng spread object nguồn.
- [x] Kiểm tra session ID không khớp origin bị từ chối; tập bài empty/unknown có thông báo; bản workout dùng snapshot dù active plan đã đổi.
- [x] Thêm fixture superset, bodyweight, assisted, null load, bài custom và tên/tiêu đề dài. Không dùng tên người thật trong test.

## Task 2 — Chế độ trình bày

- [x] Tạo `TeachingDialog` bằng native `dialog.showModal()` và React portal. Render con chỉ nhận `TeachingView`; nguồn thẻ hướng dẫn được lookup riêng theo ID.
- [x] Tiêu đề, bước chính và minh họa có thứ bậc đọc rõ. Desktop cho một bài/slide, mobile xếp dọc; dùng nút bài trước/sau cùng bộ đếm.
- [x] Cho PT bật/tắt các mục minh họa và nguồn chi tiết trong trình bày; credit media và đường dẫn nguồn vẫn đi vào phần tham khảo của bản in.
- [x] Fullscreen là lựa chọn của PT. Nếu API không hỗ trợ hoặc bị từ chối, giữ dialog hoạt động và hiển thị thông báo ngắn.
- [x] Esc đóng theo hành vi native và trả focus về nút mở, không làm mất draft giáo án/buổi. Arrow keys chỉ đổi bài khi focus ở vùng trình bày, không chiếm phím khi đang gõ lời nhắc.
- [x] Mở dialog không phát video tự động, không gửi dữ liệu đến dịch vụ ngoài. Dừng playback khi chuyển bài hoặc đóng.

## Task 3 — Preview và bản in

- [x] `TeachingHandout` render từ cùng payload đang preview. Có tên buổi/bài, nguồn phiên bản, thông số dự kiến, lời nhắc và nguồn/credit cần giữ.
- [x] In chỉ phần root trình bày bằng CSS `@media print`; ẩn app shell, thanh chat, button và dialog backdrop trong bản in. Tránh `break-inside` cắt dòng bài hoặc credit khỏi media.
- [x] Trong bản in, video thay bằng poster và URL nguồn/credit dạng chữ, không đưa một player rỗng vào trang.
- [x] Đặt control “In / Lưu PDF”, gọi `window.print()` từ click. Không tự upload, lưu server, mở email hoặc phát hành URL chia sẻ.
- [x] Bản in không gán “đã hoàn thành”, “an toàn” hay “đã được chuyên gia duyệt” từ trạng thái giáo án. Giới hạn quan trọng từ thẻ vẫn hiển thị đúng nơi liên quan.
- [x] Khi media chưa tải hoặc lỗi, bản in vẫn có hướng dẫn chữ. Preview phải cho PT thấy chính xác phần nào thiếu hình trước khi in.

## Task 4 — Nối entry point và kiểm tra

- [x] Trong thẻ task 03, thêm “Giải thích cho học viên”. Trong `WorkoutRunner`, thêm “Trình bày buổi này” dùng snapshot của buổi đã lưu; buổi mới chưa lưu có hướng dẫn lưu trước.
- [x] Trong trình soạn, entry point chỉ lấy saved revision đang được xem. Nếu bản đang soạn khác bản đã lưu, nhãn nói rõ phiên bản sẽ trình bày và cho PT quay lại lưu trước.
- [x] Giữ nguyên nội dung đang soạn khi mở/đóng dialog và khi hủy hộp thoại in. Không đánh dấu đã lưu từ việc tạo preview.

```sh
node --test scripts/check-teaching-view.mjs scripts/check-exercise-instructions.mjs scripts/check-training-program-ui.mjs
npm run check:programs
npx tsc --noEmit
npx eslint src/lib/training/teaching-view.ts src/components/teaching src/components/training/ExerciseInstructionCard.tsx src/components/training/WorkoutRunner.tsx src/components/training/ProgramEditor.tsx
npx -y react-doctor@latest . --verbose --scope changed
npm run design:check
```

- [x] Chạy app ở port 3051. Trước khi mở `/clients/synthetic-client?tab=workouts`, dùng Playwright chặn `/api/clients/synthetic-client`, `/api/training-plans` và `/api/training-workouts`, trả học viên/giáo án/buổi giả lập trong bộ nhớ. Kiểm tra thêm entry point `/atlas?tab=hypertrophy&exercise=incline-db-press` ở 390/768/1440px.
- [x] Quét trạng thái dialog đã mở bằng `npm run design:check:page -- --cdp 9222 --target /clients/` trên Chrome fixture có cổng debugging 9222; nếu dùng cổng khác, thay bằng đúng cổng đang chạy.
- [x] Kiểm tra focus, Esc, fullscreen bị từ chối, bài custom, media lỗi, giảm chuyển động và theme Linen/Slate.
- [x] Xuất PDF A4 bằng Chrome fixture, render từng trang để xem khoảng trắng, tiếng Việt, cắt bảng, nguồn và credit. Chỉ dùng dữ liệu tổng hợp; nếu chỉnh artifact PDF bằng tay phải áp dụng skill PDF.
- [x] Đặt giá trị canary `PRIVATE_NOTE`/`PRIVATE_MEDICAL` trong fixture gốc rồi xác nhận projection, phần trình bày và PDF không chứa chúng. Việc này kiểm tra allowlist, không biến dialog thành cơ chế phân quyền tài khoản.
- [x] Ghi kiểm tra chưa chạy và cảnh báo detector còn lại, rồi commit riêng phạm vi task.

**Hoàn thành khi** PT trình bày đúng bài/buổi/phiên bản, đọc và in được tiếng Việt, giữ các thông số quan trọng và không đưa các trường hồ sơ bị loại vào payload hoặc bản in.

## Kết quả triển khai — 2026-11-13

- PT mở chế độ trình bày từ thẻ Atlas, buổi tập đã lưu hoặc buổi trong phiên bản giáo án đang xem. Phần chỉnh tiêu đề và lời nhắc nằm trong bản xem trước. Mở, đóng và in giữ nguyên bản đang soạn.
- Kiểm tra chương trình qua 33/33, thẻ hướng dẫn qua 7/7 và UI qua 44/44. TypeScript và ESLint phần thay đổi đều qua.
- Playwright qua ở 390, 768 và 1440 px với Linen và Slate. Đã kiểm tra phím mũi tên, Esc, trả focus, toàn màn hình thật ở 1440 px và mô phỏng yêu cầu bị từ chối ở kích thước còn lại. App thử nghiệm dùng port 3053 vì 3051 đang được sử dụng.
- Chrome xuất hai PDF A4 với dữ liệu giả lập, một bản chữ và một bản có poster/credit giả lập. Đã xem ảnh render của từng trang và kiểm tra phần văn bản trích xuất có tiếng Việt, nguồn và các thông số đã chọn. Các trường đánh dấu `PRIVATE_` không xuất hiện trong nội dung trình bày hoặc PDF.
- Kiểm tra video bằng fixture có phụ đề. Mô phỏng lỗi tải, thử lại thành công và dừng khi đổi bài. Kiểm tra trạng thái poster lỗi và vẫn in được hướng dẫn chữ. Sáu thẻ hiện chưa có clip đủ quyền sử dụng nên vòng kiểm tra với video hướng dẫn thực còn mở.
- Impeccable dùng CDP 9224 để quét bản xem trước ở 390 px. Phát hiện còn lại nằm ở nội dung hồ sơ và nhập hiệp phía sau dialog. Quét source còn hai cảnh báo đường viền CSS chung. React Doctor còn hai cảnh báo về độ dài dialog và độ phức tạp của trình soạn giáo án.

## Phụ thuộc và bàn giao

- Cần task 03 hoàn thành ít nhất một thẻ và media có quyền để kiểm tra vòng trình bày → video → in.
- Task 01 không cần hoàn thành để mở từ `WorkoutRunner` hiện có; nếu cả hai cùng sửa file này, triển khai nối tiếp và chạy lại kiểm tra giữ draft.
- Cổng học viên, gửi qua Zalo/email và liên kết có token cần thiết kế danh tính/quyền riêng sau này. Quyền truy cập app tiếp tục theo mô hình triển khai hiện có.
