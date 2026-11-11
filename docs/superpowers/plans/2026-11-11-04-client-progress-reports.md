# Task 04 — Báo cáo tiến triển học viên

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giúp PT xem kết quả tập đã ghi theo thời gian, so với bản chụp giáo án của từng buổi và mở lại dữ liệu gốc trước khi chỉnh giáo án.

**Architecture:** Tính báo cáo bằng hàm thuần từ `TrainingWorkout[]` đã tải trong workspace. Thêm mục tiến triển vào điều hướng hồ sơ; dùng bảng truy được về buổi gốc làm nội dung chính và đồ thị phụ trợ cho nhóm bài có dữ liệu so sánh được.

**Tech Stack:** React/TypeScript, dữ liệu chương trình hiện có, bảng HTML và SVG đơn giản, Node test runner. Không thêm thư viện biểu đồ trong bản đầu.

## Phạm vi và thứ tự

- Ưu tiên P2, triển khai sau một vòng kiểm chứng task 01 để dữ liệu nhập thực tế đủ tin cậy. Có thể phát triển module tính toán trước vì không phụ thuộc UI task 01.
- Báo cáo gồm khoảng ngày, số buổi hoàn thành/đang ghi, số hiệp được xác nhận, kết quả theo bài, so sánh với giáo án gốc và link mở lại buổi.
- Dùng ba khoảng nhanh 4 tuần, 12 tuần, toàn bộ và một khoảng ngày tùy chọn.
- Không tính tỷ lệ chuyên cần theo các buổi dự kiến chưa được lưu thành bản ghi. Lịch tuần hiện tại không tái dựng được lịch quá khứ sau nhiều lần đổi giáo án.
- Nhật ký độc lập cũ hiển thị thành nguồn dữ liệu riêng với thông số nó thật sự có; không tự chuyển thành các hiệp thuộc giáo án.
- Kết quả đầu ra là công cụ PT đánh giá dữ liệu, không tạo chẩn đoán, kết luận tăng cơ từ tải tập hay tự thay phiên bản giáo án.

## Căn cứ và file tham khảo

- `src/lib/training/program.ts` định nghĩa `TrainingWorkout`, `WorkoutSet`, đơn vị `kg/bodyweight/assisted` và snapshot `prescription`.
- `src/lib/training/workspace.ts` đã tải lịch sử và có `previousExerciseResult`; giữ hành vi caller hiện tại khi bổ sung nhóm so sánh chặt hơn cho báo cáo.
- `src/components/training/ClientTrainingOverview.tsx` đã có số buổi hoàn thành và buổi tiếp theo.
- `src/components/training/ClientTrainingWorkspace.tsx` giữ cùng model qua các mục; thêm báo cáo ở đây để không tạo lần tải lịch sử thứ hai.
- `src/app/clients/[id]/page.tsx` xác thực tên tab qua allowlist và giữ bản đang soạn khi đổi mục.
- Đọc `GLOSSARY.md`, `docs/training-program-storage.md`, chính sách bằng chứng và guide server/client/CSS của Next đang cài.

## Bản đồ file

| Thao tác | File | Trách nhiệm |
|---|---|---|
| Tạo | `src/lib/training/progress.ts` | Lọc ngày, nhóm kết quả so sánh được và tổng hợp |
| Tạo | `src/components/training/ClientProgressReport.tsx` | Bộ lọc, tổng hợp và bảng kết quả |
| Tạo | `src/components/training/ExerciseProgressChart.tsx` | Biểu đồ với bảng thay thế và liên kết dữ liệu gốc |
| Sửa | `src/components/training/ClientTrainingOverview.tsx` | Nút đi tới tiến triển và mở rộng `TrainingDestination` |
| Sửa | `src/components/training/ClientTrainingWorkspace.tsx` | Nối báo cáo với cùng state và mở lại buổi đã chọn |
| Sửa | `src/app/clients/[id]/page.tsx` | Thêm tab `progress`, tên tiếng Việt và focus khi điều hướng |
| Tạo | `scripts/check-training-progress.mjs` | Công thức, nhóm so sánh, ngày và dữ liệu cũ |
| Sửa | `scripts/check-training-program-ui.mjs` | Chuyển báo cáo và mở buổi mà không mất draft |

## Hợp đồng số liệu

```ts
export type ProgressRange = { from: string | null; to: string | null };
export type ProgressSet = {
  workoutId: string;
  performedAt: string;
  exerciseId: string;
  name: string;
  loadUnit: "kg" | "bodyweight" | "assisted";
  reps: number;
  load: number | null;
};
export type ProgressSummary = {
  completedWorkouts: number;
  inProgressWorkouts: number;
  confirmedSets: number;
  completedWorkoutSets: ProgressSet[];
};
```

- `exerciseId` trong `ProgressSet` là ID dòng bài trong `prescription` của buổi, không phải ID catalog Atlas.
- Khoảng ngày là chuỗi ngày hợp lệ `YYYY-MM-DD`, hai đầu đều được tính. Giữ ngày thực hiện dạng date-only, không chuyển qua UTC gây lệch ngày.
- Tổng số buổi lấy từ status đã lưu. `confirmedSets` là hiệp `completed === true` trong tất cả buổi đã lưu thuộc khoảng lọc, kể cả buổi đang ghi; nhãn phải nói rõ phạm vi này.
- Chuỗi xu hướng bài chỉ dùng hiệp có `completed === true` từ buổi `completed`. Dữ liệu đang nhập hoặc chỉ số dự kiến trong giáo án không thành điểm xu hướng.
- `null` là chưa ghi, số 0 hợp lệ vẫn là số 0. Không lấp khoảng trống bằng 0, nội suy dữ liệu thiếu hoặc tính trung bình của trường không có.
- Tổng `kg × số lần` chỉ tính hiệp có đơn vị tải ngoài `kg` và load hữu hạn. Nhãn là “Tổng tải ngoài × số lần”, không diễn giải là toàn bộ công cơ học.
- Bodyweight hiển thị số hiệp/số lần. Assisted hiển thị mức trợ lực và số lần riêng, không cộng với tải ngoài hoặc tự đảo chiều thành thành tích.
- Nhóm so sánh cần cùng catalog ID hoặc cùng tên custom chuẩn hóa, cùng tên biến thể đã ghi, đơn vị, method và tempo. Không gộp tên gần giống, khác biến thể hay khác đơn vị.
- Chỉ nói “cùng thông số đã ghi”. Nếu vị trí máy/thiết bị thực tế không được lưu thì app không chứng minh các lần tập hoàn toàn tương đương.
- So sánh kế hoạch/thực tế phải dùng `workout.prescription` của chính buổi đó, không dùng giáo án hiện đang áp dụng.

## Task 1 — Tổng hợp có thể đối chiếu

- [ ] Tạo kiểm tra thất bại cho `summarizeProgress(workouts, range)`, `exerciseComparisonKey(exercise, unit)` và `externalLoadRepetitions(sets)`.

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader();
const { externalLoadRepetitions } = load("src/lib/training/progress.ts");
test("external load excludes assisted, unconfirmed and missing loads", () => {
  const sets = [
    { completed: true, reps: 10, load: 20, loadUnit: "kg" },
    { completed: true, reps: 8, load: 30, loadUnit: "assisted" },
    { completed: false, reps: 10, load: 100, loadUnit: "kg" },
    { completed: true, reps: 10, load: null, loadUnit: "kg" },
  ];
  assert.equal(externalLoadRepetitions(sets), 200);
});
```

- [ ] Chạy `node --test scripts/check-training-progress.mjs` trước khi thêm module; xác nhận thiếu hành vi rồi triển khai ba hàm cùng contract ở trên.
- [ ] Thêm fixture có buổi đang ghi, hoàn thành, số 0, null, sửa tên bài, đổi đơn vị và hai giáo án có snapshot khác nhau.
- [ ] Kiểm tra mốc ngày đầu/cuối, khoảng rỗng, thứ tự ngày không hợp lệ và ngày tương lai. Ngày ngoài khoảng bị loại, không tự hiệu chỉnh đầu vào sai.
- [ ] Mỗi dòng tổng hợp giữ `workoutId` và ID dòng bài để mở được bản ghi gốc; không chỉ trả một con số mất nguồn.

## Task 2 — Bảng báo cáo và biểu đồ

- [ ] Tạo `ClientProgressReport` nhận `workouts`, `onOpenWorkout` và trạng thái tải từ workspace hiện có. Không fetch thêm hồ sơ lâm sàng hoặc gửi dữ liệu sang AI.
- [ ] Đặt khoảng ngày và bộ chọn bài trước bảng dữ liệu. Hiển thị rõ ngày báo cáo, số bản ghi và phạm vi từng chỉ số.
- [ ] Bảng theo bài có ngày, tên/đơn vị, số hiệp và kết quả đã ghi. Mỗi dòng có nút mở đúng buổi trong lịch sử.
- [ ] Biểu đồ dùng một nhóm so sánh tại một thời điểm. Tải ngoài thể hiện theo từng hiệp hoặc một thống kê được ghi rõ, không nối các thiết lập khác nhau bằng một đường.
- [ ] SVG có tiêu đề, mô tả, tick đơn vị và bảng tương đương; màu không là cách phân biệt duy nhất. Không vẽ giá trị giả khi chỉ có một điểm.
- [ ] Empty state phân biệt chưa có buổi, có buổi nhưng chưa có hiệp phù hợp và bộ lọc không có dữ liệu. Lỗi tải có retry dùng model hiện tại.
- [ ] Giữ ghi chú của PT dưới dạng dữ liệu gốc, không tự suy diễn cảm nhận thành chỉ số tiến triển. Không thêm dữ liệu InBody/xét nghiệm vào báo cáo này.

## Task 3 — Điều hướng và tính liên tục

- [ ] Thêm `progress` vào `TrainingDestination` và allowlist tab hồ sơ. Dùng URL `/clients/<id>?tab=progress` và nút “Xem tiến triển” từ tổng quan.
- [ ] Khi mở buổi từ báo cáo, gọi `model.openWorkout`. Nếu đang có thay đổi chưa lưu, dùng cùng quyết định giữ/bỏ bản đang ghi như `WorkoutRunner`.
- [ ] Quay lại báo cáo giữ bộ lọc trong cùng phiên hồ sơ. Đổi học viên reset bộ lọc/bài đã chọn và không để request cũ ghi sang hồ sơ mới.
- [ ] Kiểm tra học viên đã xóa, plan bị lưu trữ, bài custom và snapshot cũ vẫn truy được đúng dữ liệu đã lưu.

## Kiểm tra và nghiệm thu

```sh
node --test scripts/check-training-progress.mjs scripts/check-training-program-ui.mjs
npm run check:programs
npm run check:ui
npx tsc --noEmit
npx eslint src/lib/training/progress.ts src/components/training/ClientProgressReport.tsx src/components/training/ExerciseProgressChart.tsx src/components/training/ClientTrainingOverview.tsx src/components/training/ClientTrainingWorkspace.tsx 'src/app/clients/[id]/page.tsx'
npx -y react-doctor@latest . --verbose --scope changed
npm run design:check
```

- [ ] Chạy app ở port 3051. Trong Chrome fixture, chặn `/api/clients/synthetic-client`, `/api/training-plans` và `/api/training-workouts` bằng Playwright, trả sáu tuần dữ liệu tổng hợp. Mở `/clients/synthetic-client?tab=progress` ở 390/768/1440px và zoom 200%.
- [ ] Mở Chrome fixture với `--remote-debugging-port=9222`, đặt viewport 390×844 và quét `npm run design:check:page -- --cdp 9222 --target /clients/` để giữ đúng dữ liệu mock và tab báo cáo.
- [ ] Đối chiếu bằng tay ít nhất hai dòng bảng với JSON fixture và bản chụp giáo án gốc; ghi công thức tính vào giao diện tại chỗ xem chi tiết chỉ số.
- [ ] Kiểm tra keyboard mở buổi từ bảng, quay lại, thay bộ lọc và không mất bản đang soạn.
- [ ] Ghi rõ cảnh báo detector và phạm vi dữ liệu chưa có. Commit riêng sau các kiểm tra liên quan đạt.

**Hoàn thành khi** PT đọc được số liệu đúng phạm vi, truy về buổi gốc và giữ nguyên dữ liệu thiếu/khác đơn vị; không có kết quả dự kiến bị tính thành kết quả thực tế.

## Phụ thuộc và bàn giao

- Không cần migration vì báo cáo suy ra từ dữ liệu hiện có. Không thay `previousExerciseResult` để tránh đổi hành vi nhập buổi ngoài phạm vi.
- Thống kê chuyên cần theo lịch hẹn, mục tiêu cân nặng và so sánh thiết bị cần mô hình dữ liệu riêng nếu được yêu cầu sau này.
- Task 06 có thể dùng báo cáo khi có một kế hoạch xuất bản riêng; payload hướng dẫn học viên của task 06 hiện chỉ gồm nội dung buổi và hướng dẫn đã chọn.
