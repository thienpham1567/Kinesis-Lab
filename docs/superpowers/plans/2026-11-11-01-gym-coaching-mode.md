# Task 01 — Chế độ PT hướng dẫn tại phòng tập

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giúp PT mở buổi theo lịch, ghi kết quả từng hiệp, theo dõi nghỉ và lưu buổi ngay trên điện thoại trong lúc hướng dẫn học viên.

**Architecture:** Mở rộng `WorkoutRunner` và `WorkoutExercise`, giữ `TrainingWorkspaceModel` làm chủ dữ liệu. Thêm chế độ hiển thị gọn và đồng hồ nghỉ ở phía trình duyệt, dùng nguyên API lưu buổi hiện có và bản chụp nội dung giáo án của buổi.

**Tech Stack:** Next.js App Router đang cài, React, TypeScript, Tailwind, Node test runner và Chrome với dữ liệu giả lập.

## Phạm vi và thứ tự

- Ưu tiên P1. Có thể triển khai ngay, độc lập với năm kế hoạch còn lại.
- Luồng chính là hồ sơ học viên → tổng quan → mở buổi theo lịch → chế độ phòng tập → ghi hiệp → lưu tiến độ hoặc lưu hoàn thành.
- Bản đầu có ghi số lần và tải, xem kết quả trước, đồng hồ nghỉ, ghi chú cả buổi, trạng thái lưu và điều hướng về hiệp chưa hoàn thành.
- Ghi chú kỹ thuật dùng trường `WorkoutInput.notes` hiện có, PT ghi kèm tên bài khi cần. Kế hoạch này không thêm trường ghi chú riêng cho từng bài.
- Việc lưu vẫn do PT bấm rõ ràng. Đồng hồ và thao tác chuyển chế độ không tự xác nhận hoàn thành hay gửi buổi tập.

## Căn cứ trong repo

- `src/components/training/ClientTrainingOverview.tsx` đã có nút mở buổi theo lịch.
- `src/components/training/WorkoutRunner.tsx` đã giữ nguyên bản ghi khi mở lại lịch sử, có lưu tiến độ và lưu hoàn thành.
- `src/components/training/WorkoutExercise.tsx` đã có kết quả lần trước, đơn vị tải và liên kết Atlas.
- `src/lib/training/workspace.ts` sở hữu bản đang ghi, cờ dữ liệu chưa lưu và chặn thao tác khi đang gửi.
- `src/lib/training/program.ts` yêu cầu kết quả thực tế để hoàn thành. Số liệu dự kiến không phải kết quả thực hiện.
- Đọc `GLOSSARY.md`, `docs/training-program-storage.md`, `docs/medical-evidence-policy.md` và `docs/impeccable.md` trước khi triển khai.
- Trước khi sửa React/CSS, đọc `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` và `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`.

## Bản đồ file

| Thao tác | File | Trách nhiệm |
|---|---|---|
| Tạo | `src/lib/training/coaching.ts` | Tính thời gian nghỉ còn lại và xác định hiệp chưa hoàn thành |
| Tạo | `src/components/training/RestTimer.tsx` | Bắt đầu, dừng, tiếp tục và đặt lại đồng hồ |
| Tạo | `src/components/training/WorkoutActionBar.tsx` | Trạng thái lưu và các thao tác chính trong chế độ phòng tập |
| Sửa | `src/components/training/WorkoutRunner.tsx` | Mở phần ghi hiệp theo ID buổi |
| Tạo | `src/components/training/WorkoutEntry.tsx` | Giữ chế độ và đồng hồ trong buổi đang mở, nối thanh thao tác |
| Sửa | `src/components/training/WorkoutExercise.tsx` | Biến thể hiển thị gọn, kết quả trước và neo từng hiệp |
| Sửa | `src/app/globals.css` | Chỉ thêm CSS phạm vi buổi tập khi utility hiện có không đủ |
| Tạo | `scripts/check-gym-coaching.mjs` | Kiểm tra thời gian, chọn hiệp và trạng thái lưu |
| Sửa | `scripts/check-training-program-ui.mjs` | Hồi quy giữ dữ liệu khi đổi chế độ, lỗi lưu và đổi học viên |

## Hợp đồng hành vi

```ts
export type RestClock =
  | { state: "idle" }
  | { state: "running"; endsAtMs: number }
  | { state: "paused"; remainingMs: number };

export function remainingRestSeconds(clock: RestClock, nowMs: number): number {
  if (clock.state === "idle") return 0;
  if (clock.state === "paused") return Math.ceil(clock.remainingMs / 1000);
  return Math.max(0, Math.ceil((clock.endsAtMs - nowMs) / 1000));
}
```

- Đồng hồ bắt đầu theo số giây nghỉ trong giáo án sau khi PT chọn bắt đầu. Bỏ đánh dấu hiệp không chạy đồng hồ mới.
- `endsAtMs` là mốc thời gian tuyệt đối. Khi quay lại tab sau khi trình duyệt giảm tần suất timer, số giây được tính lại từ mốc này.
- Khi tạm dừng, giữ số mili giây còn lại để không cộng thêm thời gian sau nhiều lần tạm dừng. Khi tiếp tục, tạo `endsAtMs` mới từ thời điểm tiếp tục.
- Chuyển chế độ gọn/đầy đủ giữ nguyên số liệu, focus và đồng hồ. Đổi ID buổi hoặc học viên đặt lại đồng hồ.
- Khi gửi API, khóa các ô nhập giống cơ chế `fieldset disabled` hiện có. Chỉ báo đã lưu sau phản hồi thành công.
- Lỗi mạng giữ bản đang ghi và ID buổi để bấm thử lại. Không giữ dữ liệu học viên trong `localStorage` hay `sessionStorage`.
- Âm báo chỉ phát khi PT bật và trình duyệt cho phép. Mặc định dùng thông báo nhìn thấy, không đọc số giây liên tục qua `aria-live`.

## Task 1 — Quy tắc đồng hồ và hiệp kế tiếp

- [x] Tạo `scripts/check-gym-coaching.mjs` bằng `createAppLoader` từ `scripts/lib/load-app-module.mjs`. Bổ sung kiểm tra dưới đây trước khi tạo module mới.

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader();
const { remainingRestSeconds } = load("src/lib/training/coaching.ts");

test("rest clock catches up after an inactive tab", () => {
  const clock = { state: "running", endsAtMs: 90_000 };
  assert.equal(remainingRestSeconds(clock, 31_000), 59);
  assert.equal(remainingRestSeconds(clock, 95_000), 0);
  assert.equal(remainingRestSeconds({ state: "idle" }, 0), 0);
  assert.equal(remainingRestSeconds({ state: "paused", remainingMs: 16_999 }, 95_000), 17);
});
```

- [x] Chạy `node --test scripts/check-gym-coaching.mjs`. Xác nhận lỗi vì module chưa tồn tại, sau đó thêm module và chạy lại đến khi đạt.
- [x] Thêm `nextIncompleteSet(session, sets)` nhận `ProgramSession` và mảng `WorkoutSet`, trả `{ exerciseId, setNumber } | null`. Duyệt bài theo `session.exercises`, rồi số hiệp tăng dần; hiệp thiếu bản ghi cũng là chưa hoàn thành. Kiểm tra sets bị đảo thứ tự, mảng rỗng, đủ hiệp và một bài có nhiều hiệp.
- [x] Kiểm tra số giây nghỉ 0 không tự sinh nhịp đếm. Giới hạn đầu vào giữ theo validator hiện có, không diễn giải là khuyến nghị về liều tập.

## Task 2 — Điều khiển buổi tập trên điện thoại

- [x] Thêm nút “Chế độ phòng tập” trong phần buổi đang mở của `WorkoutRunner`, dùng `aria-pressed`. Bản đầu vào chế độ này chỉ khi PT chọn.
- [x] Tạo `RestTimer` nhận `clock`, `onChange` và số giây theo giáo án. State nằm ở `WorkoutEntry` theo ID buổi. Interval phục vụ hiển thị và được dọn khi unmount.
- [x] Thêm biến thể `compact` cho `WorkoutExercise`. Tái sử dụng `NumberField`, `UnitField`, dữ liệu trước đó và handler hiện tại; không nhân đôi logic lưu.
- [x] Dùng lưới một hoặc hai cột phù hợp chiều rộng thực tế. Chạm vào ô nhập không nhảy scroll bất ngờ; nút chạm tối thiểu 44px và nhãn đọc được cả tên bài lẫn số hiệp.
- [x] Tạo `WorkoutActionBar` với “Lưu tiến độ”, “Lưu và hoàn thành buổi”, trạng thái chưa lưu/đang lưu/đã lưu/lưu lỗi và nút đến hiệp chưa hoàn thành.
- [x] Đặt thanh thao tác sát đáy vùng làm việc, tính cả điều hướng mobile và `safe-area-inset-bottom`. Thêm khoảng đệm cuối vùng nhập để thanh không che ô cuối.
- [x] Khi validation chặn hoàn thành, giữ thông báo lỗi và chuyển focus đến hiệp thiếu dữ liệu. Không điền tải hoặc số lần từ giáo án vào kết quả thực tế.

## Task 3 — Tính liên tục và lỗi

- [x] Mở rộng kiểm tra UI cho nhập một hiệp → chuyển chế độ hai lần → dữ liệu không đổi; lưu lỗi → thử lại cùng ID; đổi học viên → không lộ buổi trước.
- [x] Kiểm tra đồng hồ vẫn đúng sau khi đổi tab 60 giây, tạm dừng, đặt lại, đổi bài và quay lại chế độ đầy đủ.
- [x] Kiểm tra nhấp đúp lưu chỉ gửi một request đang xử lý; phản hồi lưu đến sau khi rời học viên không cập nhật workspace mới.
- [x] Giữ cảnh báo rời trang khi có thay đổi chưa lưu theo khả năng trình duyệt. Các lần đổi mục trong cùng hồ sơ giữ cơ chế mount hiện có.

## Nghiệm thu và kiểm tra

```sh
node --test scripts/check-gym-coaching.mjs scripts/check-training-program-ui.mjs
npm run check:programs
npm run check:ui
npx tsc --noEmit
npx eslint src/lib/training/coaching.ts src/components/training/RestTimer.tsx src/components/training/WorkoutActionBar.tsx src/components/training/WorkoutRunner.tsx src/components/training/WorkoutExercise.tsx
npx -y react-doctor@latest . --verbose --scope changed
npm run design:check
```

- [x] Chạy app bằng `npm run dev -- --hostname 127.0.0.1 --port 3051`. Trong Chrome fixture, dùng Playwright `page.route` chặn `/api/clients/synthetic-client`, `/api/training-plans` và `/api/training-workouts` trước khi điều hướng; GET trả fixture, PUT ghi vào Map bộ nhớ với cùng ID và snapshot. Không đọc/ghi `.data` thật để tạo fixture.
- [ ] Kiểm tra `/clients/synthetic-client?tab=workouts` ở 320, 390, 768 và 1440px, bàn phím mở, zoom trình duyệt 200%, theme Linen và Slate.
- [x] Mở Chrome fixture với `--remote-debugging-port=9222`, đặt viewport 390×844 và quét chính trang đang mock bằng `npm run design:check:page -- --cdp 9222 --target /clients/`. Quét URL trực tiếp chỉ dùng khi fixture API đã được phục vụ bởi server riêng.
- [ ] PT dùng dữ liệu giả lập để mở buổi và ghi ít nhất ba hiệp. Ghi số thao tác, lỗi nhập và thời gian trước/sau, coi đây là kiểm chứng thao tác.
- [ ] Ghi kết quả kiểm tra, cảnh báo còn lại và các phép kiểm tra chưa chạy vào ghi chú giao việc. Chỉ commit các file của task sau khi kiểm tra đạt.

**Hoàn thành khi** kết quả từng hiệp và ghi chú được lưu/mở lại đúng, đồng hồ theo đúng thời gian thực, chuyển chế độ không mất dữ liệu và thanh điều khiển không che phần đang nhập.

## Bàn giao cho task khác

- Task 04 đọc cùng `TrainingWorkout` hiện có, không cần đồng hồ hay trạng thái UI của task này.
- Task 03 có thể thêm nút xem thẻ hướng dẫn vào `WorkoutExercise` sau khi thư viện có dữ liệu.
- Không cần migration hay triển khai dịch vụ ngoài cho phạm vi này.

## Kết quả triển khai ngày 2026-11-11

- Luồng Chrome với dữ liệu giả lập đi từ tổng quan đến chế độ phòng tập, ghi ba hiệp, lưu lỗi, thử lại cùng ID, hoàn thành và mở lại sau reload. Đã kiểm tra dữ liệu buổi cũ thiếu hiệp, điều hướng bằng Tab, mốc hết giờ, tạm dừng/tiếp tục, đổi buổi, âm báo bật theo yêu cầu và cách ly khi đổi học viên.
- Giao diện đã được xem ở 320, 390, 768 và 1440px với Linen và thêm lượt Slate ở 390px. Ở vùng hiển thị thấp, thanh lưu nằm trong luồng cuộn để dành chỗ cho ô nhập. Đã mô phỏng vùng hiển thị thấp và khung tương đương zoom 200%. Kiểm tra bàn phím ảo trên thiết bị thật và buổi dùng thử với PT còn cần thực hiện.
- 67 kiểm tra chương trình, UI và chế độ phòng tập đạt. TypeScript, ESLint phạm vi thay đổi và React Doctor đạt.
- Impeccable còn hai cảnh báo đường viền trong CSS dùng chung. Ở trang hồ sơ giả lập, detector ghi nhận thẻ lồng và một dòng chữ lẻ trong phần thông tin hồ sơ hiện có.
