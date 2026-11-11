# Task 02 — Lộ trình học và ôn cá nhân cho PT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lưu tiến độ làm bài, chỉ ra chủ đề cần ôn và cho PT tiếp tục một phiên học qua các ngày trên cùng trình duyệt.

**Architecture:** Giữ ngân hàng NCSF sau lớp đăng nhập hiện có. Sinh định danh theo nội dung đã tải có quyền truy cập, lưu metadata tiến độ trong IndexedDB và tính lịch ôn bằng module thuần; `NcsfQuiz` và `NcsfMockExams` tiếp tục sở hữu nội dung được cấp quyền trong bộ nhớ.

**Tech Stack:** Next.js/React/TypeScript đang cài, Web Crypto, IndexedDB, Node test runner và fixture Chrome.

## Phạm vi và thứ tự

- Ưu tiên P1. Triển khai độc lập với task 01 và task 03. Task 05 sẽ dùng lại kho metadata sau khi task này hoàn thành.
- Bao gồm tiến độ theo chương/chủ đề, lịch sử lần nộp, phiên đang học, câu đến hạn ôn và liên kết về trang giáo trình.
- Chế độ học ngắn có tối đa 10 câu, ưu tiên câu đến hạn rồi đến câu chưa học. Đây là giới hạn sản phẩm có thể điều chỉnh sau dùng thử.
- Lịch sử là của trình duyệt này. NCSF hiện dùng mật khẩu chung trong `src/lib/ncsf-auth.ts`, chưa có danh tính PT để đồng bộ giữa thiết bị.
- Hiển thị “Tiến độ trên trình duyệt này” và thao tác xóa tiến độ có xác nhận. Đăng xuất chỉ đóng quyền xem tài liệu; không tự xóa metadata học đã lưu.
- Nội dung câu hỏi, đáp án dạng chữ, giải thích, PDF, hình và phản hồi nhập tự do không được lưu vào IndexedDB hoặc cache service worker.

## Căn cứ và file tham khảo

- `src/components/NcsfQuiz.tsx` có làm lại câu sai nhưng state chỉ tồn tại trong component.
- `src/components/NcsfMockExams.tsx` giữ quy tắc xáo lại khi mở đề thi thử. Lần học tiếp phải là thao tác riêng, không thay quy tắc nút mở đề hiện tại.
- `src/lib/ncsf-quiz.ts` đã có `obj`, `kind`, `domain`, `page` và nguồn; không dùng vị trí mảng làm danh tính lâu dài.
- `src/app/knowledge/page.tsx` giữ quiz khi mở trích dẫn; mở rộng cơ chế này thay vì gắn một owner tiến độ thứ hai.
- `src/lib/chat/study-library-store.ts` là tham khảo cách báo lỗi lưu rõ ràng. Kho mới dùng IndexedDB để ghi lần nộp và cập nhật draft trong transaction.
- Đọc `GLOSSARY.md`, `PRODUCT.md`, chính sách y khoa và guide server/client components trong `node_modules/next/dist/docs/` trước triển khai.

## Bản đồ file

| Thao tác | File | Trách nhiệm |
|---|---|---|
| Tạo | `src/lib/learning/types.ts` | Contract câu đã định danh, draft, lần nộp và hàng đợi ôn |
| Tạo | `src/lib/learning/ncsf-identity.ts` | Hash câu và option từ ngân hàng đã tải có quyền |
| Tạo | `src/lib/learning/schedule.ts` | Lịch ôn và tổng hợp theo chủ đề |
| Tạo | `src/lib/learning/progress-store.ts` | IndexedDB, transaction, phiên bản schema và thông báo thay đổi |
| Tạo | `src/components/learning/LearningDashboard.tsx` | Tiếp tục học, đến hạn ôn và chủ đề cần luyện |
| Tạo | `src/components/learning/useLearningProgress.ts` | Hydrate, xử lý lỗi kho và nối sự kiện UI |
| Sửa | `src/components/NcsfQuiz.tsx` | Lưu draft theo lựa chọn, nộp kết quả một lần và mở phiên ôn |
| Sửa | `src/components/NcsfMockExams.tsx` | Ghi lần nộp và cho tiếp tục phiên đã chọn rõ ràng |
| Sửa | `src/app/knowledge/page.tsx` | Thêm mục “Tiến độ học”, giữ vị trí đọc và quay lại bài |
| Tạo | `scripts/check-learning-progress.mjs` | Identity, lịch ôn, thống kê và idempotence qua adapter giả lập |
| Sửa | `scripts/check-ncsf-study-continuity.mjs` | Nối progress mà vẫn giữ attempt khi xem trích dẫn |

## Hợp đồng dữ liệu

```ts
export type LearningSource = "ncsf-quiz" | "ncsf-mock";
export type LearningItemResult = {
  itemId: string;
  selectedOptionId: string | null;
  correct: boolean;
  domain: string | null;
};
export type LearningSubmission = {
  id: string;
  source: LearningSource;
  submittedAt: string;
  items: LearningItemResult[];
};
export type LearningDraft = {
  id: string;
  source: LearningSource;
  revision: number;
  updatedAt: string;
  items: {
    itemId: string;
    optionOrder: string[];
    selectedOptionId: string | null;
  }[];
  currentItemId: string | null;
};
```

- SHA-256 câu gồm namespace nguồn, chương/đề, đề bài, options đã canonical hóa, đáp án đúng, giải thích, trang và metadata hình. Chuẩn hóa Unicode NFC và khoảng trắng; không hạ chữ hay bỏ dấu.
- Hash option dựa vào nội dung option. Hoán đổi thứ tự option/câu giữ identity; sửa đáp án, nội dung hoặc giải thích tạo identity mới và không thừa kế kết quả cũ.
- Hai câu trùng canonical content được gộp lịch ôn, nhưng vẫn giữ vị trí hiện tại khi hiển thị bài. Metadata học không được dùng như nguồn đáp án cho ngân hàng mới.
- IndexedDB có hai object store `drafts` và `submissions`, key là `id`. Giao dịch nộp bài ghi submission bất biến và xóa draft tương ứng trong cùng transaction.
- `saveDraft(draft, expectedRevision)` phải từ chối ghi đè nếu revision đã thay đổi ở tab khác. UI giữ bản trong bộ nhớ và cho tải lại hoặc tạo phiên mới.
- `submitAttempt(submission)` nhận lại cùng ID là idempotent khi payload giống nhau; cùng ID khác nội dung phải báo xung đột.
- BroadcastChannel chỉ báo dữ liệu đã thay đổi. Khi không hỗ trợ, refresh khi window lấy focus; không phụ thuộc kênh này để bảo đảm transaction.

## Task 1 — Định danh và lịch ôn

- [ ] Thêm kiểm tra identity không đổi khi đảo options nhưng đổi khi sửa đáp án; dùng câu tổng hợp, không đưa ngân hàng riêng tư vào fixture repo.
- [ ] Viết `nextReviewAt(nowIso, streak, correct)` và kiểm tra trước khi thêm thuật toán.

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader();
const { nextReviewAt } = load("src/lib/learning/schedule.ts");
test("review scheduling uses a fixed instant and resets after an error", () => {
  assert.equal(nextReviewAt("2026-11-11T08:00:00.000Z", 0, true), "2026-11-12T08:00:00.000Z");
  assert.equal(nextReviewAt("2026-11-11T08:00:00.000Z", 3, false), "2026-11-12T08:00:00.000Z");
});
```

- [ ] Chạy `node --test scripts/check-learning-progress.mjs` và xác nhận kiểm tra mới thất bại vì thiếu module/hành vi.
- [ ] Dùng dãy khoảng nghỉ `[1, 3, 7, 14, 30]` ngày cho các lần đúng liên tiếp, sai thì về một ngày. `streak` là số lần đúng trước lần nộp hiện tại, được chặn ở đầu/cuối dãy.
- [ ] Lịch dùng timestamp UTC; “hôm nay” và nhãn ngày hiển thị theo timezone trình duyệt. Khoảng ôn là lựa chọn sản phẩm, không gọi là lịch tối ưu đã được xác nhận cho PT.
- [ ] Thống kê hiển thị số lần thử, tỷ lệ đúng lần đầu, lần gần nhất và số câu từng gặp. Câu thiếu domain vào nhóm “Chưa phân loại”; tỷ lệ không tự đổi thành đánh giá năng lực nghề nghiệp.

## Task 2 — Kho tiến độ có thể phục hồi

- [ ] Viết adapter kho nhận IndexedDB factory để test bằng kho giả lập; kiểm tra transaction nộp lại, lỗi ghi, payload hỏng và schema mới hơn app.
- [ ] Giới hạn đầu vào là 300 item cho một draft, 3.000 submissions và 2MB metadata một lần ghi. Khi chạm giới hạn, thông báo cần xóa lịch sử; không báo lưu thành công hoặc tự xóa lịch sử.
- [ ] Khi kho không khả dụng hoặc hết quota, vẫn cho làm bài trong bộ nhớ, hiển thị rõ “Chưa lưu được tiến độ” và nút thử lưu lại.
- [ ] Dùng bộ kiểm tra contract ở điểm đọc để loại bản ghi không hợp lệ khỏi dashboard, giữ thông báo khôi phục; không âm thầm reset toàn bộ database.
- [ ] Kiểm tra IndexedDB thật trên Chrome cho rollback, tab ghi cũ, reload và xóa tiến độ; mock adapter không thay thế kiểm tra trình duyệt.

## Task 3 — Nối quiz, đề thi thử và dashboard

- [ ] Sau khi nhận ngân hàng có quyền, định danh một lần rồi lập ánh xạ từ hash về câu/options hiện tại. Không ghi nội dung vào cache bền vững.
- [ ] Lưu draft có debounce sau lựa chọn; lần nộp dùng transaction và ID attempt ổn định. Nhấp nộp nhiều lần không tăng số lần luyện.
- [ ] Khôi phục thứ tự options theo hash. Câu đã đổi hoặc bị xóa được đánh dấu không còn khả dụng, loại khỏi phiên tiếp tục và giải thích số câu bị loại.
- [ ] Thêm màn hình tiến độ với ba hành động “Tiếp tục”, “Ôn đến hạn”, “Học theo chủ đề”; mỗi action đi vào bộ câu hiện có và giữ nút quay lại.
- [ ] Khi hết phiên NCSF, đóng bài/đáp án và yêu cầu đăng nhập lại theo cơ chế hiện có. Dashboard metadata không mở được câu riêng tư cho đến khi tải lại ngân hàng hợp lệ.
- [ ] Tiếp tục trang PDF vẫn dùng `PdfReader` và lưu vị trí hiện có; không biến phần trăm cuộn thành phần trăm kiến thức đã nắm.

## Kiểm tra và nghiệm thu

```sh
node --test scripts/check-learning-progress.mjs scripts/check-ncsf-study-continuity.mjs
npm run check:ncsf-runtime
npm run check:ncsf-mocks
npx tsc --noEmit
npx eslint src/lib/learning src/components/learning src/components/NcsfQuiz.tsx src/components/NcsfMockExams.tsx src/app/knowledge/page.tsx
npx -y react-doctor@latest . --verbose --scope changed
npm run design:check
```

- [ ] Chạy `npm run dev -- --hostname 127.0.0.1 --port 3051`. Dùng Playwright `page.route` chặn `/api/ncsf/session`, `/api/ncsf/quiz`, `/api/ncsf/mock-exams`, `/api/ncsf/mock-answers` và PDF trước khi mở `/knowledge`; responses dùng fixture tổng hợp đúng parser hiện có. Kiểm tra 390/768/1440px, bàn phím, reduced motion và reload giữa phiên.
- [ ] Quét `npm run design:check:page -- --viewport 390x844 http://127.0.0.1:3051/knowledge` trên phiên fixture đã đăng nhập; dùng CDP nếu route interception chỉ nằm trong trình duyệt test.
- [ ] Xác nhận IndexedDB chỉ có metadata được allowlist; logout/401 không hiển thị câu và nguồn riêng tư còn trong UI.
- [ ] Nộp một bài giả lập, tải lại, mở danh sách cần ôn và tiếp tục câu còn dở. Lịch sử giữ đúng số lần nộp và thứ tự câu.
- [ ] Ghi kiểm tra chưa chạy, lỗi kho và cảnh báo detector còn lại. Commit riêng phạm vi task sau kiểm tra.

**Hoàn thành khi** lịch sử và phiên NCSF đang dở khôi phục đúng sau reload, nộp lặp không tăng kết quả, lịch ôn truy được lần nộp gốc và kho bền vững chỉ chứa metadata được phép.

## Phụ thuộc và bàn giao

- Task 05 mở rộng `LearningSource` thêm `pt-case` và dùng metadata store này, nhưng giữ riêng kết quả rubric tình huống với tỷ lệ đúng câu NCSF.
- Bản đầu chưa cần Supabase migration hay cơ chế tài khoản mới. Đồng bộ nhiều thiết bị là phạm vi có thể lập kế hoạch tiếp sau khi có danh tính người dùng.
- Đường dẫn nghiên cứu về tự nhớ lại và ôn cách quãng đã được tra cứu ngày 2026-11-11. Khi biên soạn phần giải thích phương pháp học, đọc nguồn và ghi đúng phạm vi truy cập; hiệu quả thuật toán app cần kiểm chứng sản phẩm riêng. [Spaced retrieval](https://pubmed.ncbi.nlm.nih.gov/21574747/)
