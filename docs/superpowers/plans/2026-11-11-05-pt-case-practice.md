# Task 05 — Luyện tình huống thực hành cho PT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho PT luyện hỏi thêm thông tin, chọn cách hướng dẫn và giải thích quyết định qua tình huống giả lập có phản hồi và nguồn đọc tiếp.

**Architecture:** Dùng bốn tình huống do app biên soạn, có các điểm quyết định và rubric xác định trước. Engine thuần trả phản hồi theo lựa chọn; lưu metadata lần hoàn thành vào kho của task 02, không dùng hồ sơ học viên thật hoặc AI để tự chấm năng lực.

**Tech Stack:** Next.js/React/TypeScript, IndexedDB metadata từ task 02, catalog bằng chứng và Node test runner.

## Phạm vi và thứ tự

- Ưu tiên P2. Phụ thuộc task 02 để lưu lịch sử. Task 03 là phụ thuộc tùy chọn cho liên kết thẻ hướng dẫn; Atlas hiện tại vẫn làm đích đọc tiếp được.
- Mục “Luyện tình huống” nằm trong `/knowledge`, cùng nhóm học tập với giáo trình và đề. Tình huống đầu vào được gắn nhãn giả lập rõ ràng.
- Bản đầu có bốn tình huống, mỗi tình huống 3–5 điểm quyết định, hoàn thành khoảng 5–10 phút là mục tiêu dùng thử.
- Tình huống gồm tiếp nhận còn thiếu thông tin, điều chỉnh khi thiếu thiết bị, hướng dẫn thực hiện một bài có nguồn và trao đổi về một buổi chưa ghi kết quả.
- Cho PT chọn hành động, xem hệ quả trong kịch bản và giải thích ngắn để tự đối chiếu với rubric. Phần giải thích tự do chỉ ở bộ nhớ trong phiên; tiến độ bền vững lưu mã lựa chọn và tiêu chí cần ôn.
- Thư viện tình huống được biên soạn riêng. Không sao chép câu đề thi hoặc PDF NCSF riêng tư vào source/public.

## Căn cứ trong repo

- `src/lib/ncsf-quiz.ts` đã phân loại `scenario` và các domain học tập; dùng lại domain keys cho lọc nội dung, không đổi rubric tình huống thành câu trắc nghiệm có một đáp án duy nhất.
- `src/lib/clinical/evidence-types.ts`, `evidence-assessment.ts`, `evidence-muscle.ts` có nguồn, ngày đối chiếu, phạm vi và giới hạn.
- `/movement` đã có bài học quy trình quan sát tư thế với giới hạn và nguồn, có thể dẫn đến bài học đã phù hợp khi kịch bản yêu cầu.
- `src/app/knowledge/page.tsx` giữ các panel đã mở để xem trích dẫn không mất bài đang làm.
- Đọc `docs/medical-evidence-policy.md`, `GLOSSARY.md`, `PRODUCT.md`, guide server/client và CSS của Next đang cài.

## Bản đồ file

| Thao tác | File | Trách nhiệm |
|---|---|---|
| Tạo | `src/lib/learning/case-types.ts` | Contract tình huống, lựa chọn, rubric và kết quả |
| Tạo | `src/lib/learning/pt-cases.ts` | Bốn kịch bản giả lập có phiên bản và nguồn |
| Tạo | `src/lib/learning/case-engine.ts` | Chuyển checkpoint và tổng hợp phản hồi |
| Tạo | `src/components/learning/CasePracticeLibrary.tsx` | Danh mục theo mục tiêu và tiến độ riêng |
| Tạo | `src/components/learning/CasePracticeRunner.tsx` | Đọc bối cảnh, chọn, ghi suy nghĩ và xem phản hồi |
| Tạo | `src/components/learning/CasePracticeFeedback.tsx` | Tiêu chí đã xử lý/cần ôn và nguồn đọc tiếp |
| Sửa | `src/lib/learning/types.ts` | Bổ sung namespace `pt-case` và payload metadata riêng |
| Sửa | `src/lib/learning/progress-store.ts` | Ghi case submission bất biến bằng transaction hiện có |
| Sửa | `src/components/learning/LearningDashboard.tsx` | Tiến độ tình huống tách riêng tỷ lệ đúng NCSF |
| Sửa | `src/app/knowledge/page.tsx` | Thêm mục luyện tình huống, giữ phiên khi mở nguồn |
| Tạo | `scripts/check-pt-case-practice.mjs` | Branch, rubric, source, state và lưu idempotent |

Các file `learning/types.ts`, `progress-store.ts` và `LearningDashboard.tsx` do task 02 tạo. Nếu chúng chưa có, triển khai task 02 trước khi nối persistence.

## Hợp đồng tình huống

```ts
import type { EvidenceSource } from "@/lib/clinical/evidence-types";
import type { NcsfDomain } from "@/lib/ncsf-quiz";

export type CaseChoice = {
  id: string;
  label: string;
  feedback: string;
  criterionIds: string[];
  nextCheckpointId: string | null;
};
export type PtCase = {
  id: string;
  version: number;
  title: string;
  domain: NcsfDomain;
  fictionalContext: string;
  entryCheckpointId: string;
  checkpoints: {
    id: string;
    prompt: string;
    criterionIds: string[];
    choices: CaseChoice[];
  }[];
  criteria: {
    id: string;
    description: string;
    sources: EvidenceSource[];
    basis: "sourced" | "authored-workflow";
  }[];
  limitations: string[];
  reviewedBy: null;
};
export type CaseEvaluation = {
  addressedCriterionIds: string[];
  revisitCriterionIds: string[];
  unpracticedCriterionIds: string[];
  nextCheckpointId: string | null;
};
export type CaseSubmission = {
  id: string;
  source: "pt-case";
  submittedAt: string;
  caseId: string;
  caseVersion: number;
  choiceIds: string[];
  evaluation: CaseEvaluation;
};
```

- Tình huống có stable ID và version. Sửa bối cảnh, branch hoặc rubric tăng version; metadata cũ giữ phiên bản đã làm và không tự đổi kết quả.
- Mỗi lựa chọn có phản hồi cụ thể về thông tin/hành động trong kịch bản, có thể nhiều lựa chọn cùng đạt một tiêu chí.
- `nextCheckpointId: null` là nhánh kết thúc. Kiểm tra toàn bộ checkpoint có thể đi tới từ entry, không có nhánh mồ côi hoặc vòng lặp.
- Engine trả danh sách `addressedCriterionIds` và `revisitCriterionIds`. Không quy đổi thành giấy chứng nhận, mức an toàn hay kết luận đủ năng lực hành nghề.
- Khi đi nhánh kết thúc sớm, các tiêu chí chưa có cơ hội làm được ghi “Chưa thực hành”, tách khỏi “Cần xem lại”.
- Tiêu chí về kiến thức y khoa phải có nguồn claim-level phù hợp. Tiêu chí về thao tác sản phẩm có thể dùng `authored-workflow` và giải thích đây là rubric của app.
- Trong `learning/types.ts`, import type `CaseSubmission` từ `./case-types`, đổi tên contract `LearningSubmission` cũ thành `NcsfSubmission` và giữ source của nó là literal union `"ncsf-quiz" | "ncsf-mock"`. Xuất `type LearningSubmission = NcsfSubmission | CaseSubmission` và `type LearningSource = LearningSubmission["source"]`. Các hàm lịch ôn lọc source NCSF trước khi đọc `items`; store kiểm tra payload theo discriminant `source`.
- Đổi kiểu `LearningDraft.source` thành `NcsfSubmission["source"]` để draft của task 02 tiếp tục chỉ dành cho NCSF. Case đang làm giữ trong state của panel đến khi PT kết thúc hoặc rời trang; bản đầu không hứa khôi phục case đang dở sau reload.

## Task 1 — Viết bốn kịch bản và rubric

- [ ] Tạo case `intake-missing-information` về việc hỏi tiếp dữ liệu còn thiếu trước khi chọn hướng tập. Phản hồi dựa trên policy và nguồn sàng lọc đang dùng, không thêm ngưỡng triệu chứng chưa đối chiếu.
- [ ] Tạo case `equipment-change` về nhận biết khác biệt thiết bị/biến thể, trao đổi với học viên và ghi lại lựa chọn. Nếu có kiến thức về tác động bài tập, đối chiếu nguồn đúng bài/thiết lập.
- [ ] Tạo case `explain-an-exercise` về giải thích mục đích, đưa lời hướng dẫn ngắn và hỏi lại sự hiểu của học viên. Ví dụ lời nói là nội dung biên soạn, không khẳng định là phương pháp sửa lỗi có hiệu quả đã xác nhận.
- [ ] Tạo case `review-an-unrecorded-session` về phân biệt lịch dự kiến với kết quả chưa ghi, hỏi học viên và quyết định bước tiếp theo. Không đánh dấu đã tập chỉ để lấp lịch.
- [ ] Với mỗi case, viết 3–5 checkpoint và một đường đi mẫu đầy đủ; giữ ít nhất một nhánh chấp nhận nhiều lựa chọn phù hợp.
- [ ] Đối chiếu nguồn thực sự đã đọc, giữ ngày và phạm vi gốc; thêm ngày đọc mới chỉ khi đã mở nguồn. Để `reviewedBy: null` nếu chưa có review.

## Task 2 — Engine có thể kiểm tra

- [ ] Viết `evaluateCaseChoices(caseDefinition: PtCase, choiceIds: string[]): CaseEvaluation` nhận danh sách choice ID theo thứ tự và trả ba nhóm tiêu chí cùng checkpoint tiếp theo. Dùng `checkpoint.criterionIds` để phân biệt tiêu chí đã được hỏi nhưng chưa đạt với tiêu chí chưa đi đến; mọi criterion của choice phải thuộc checkpoint đó.
- [ ] Bổ sung kiểm tra bằng một case hoàn chỉnh giả lập trước khi viết engine.

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader();
const { evaluateCaseChoices } = load("src/lib/learning/case-engine.ts");
const example = {
  id: "workflow", version: 1, entryCheckpointId: "start",
  title: "Quy trình giả lập", domain: "professionalism-risk",
  fictionalContext: "Một buổi chưa có đủ dữ liệu trong app.",
  limitations: ["Rubric thao tác do app biên soạn."], reviewedBy: null,
  criteria: [{ id: "ask", description: "Hỏi dữ liệu còn thiếu", sources: [], basis: "authored-workflow" }],
  checkpoints: [{ id: "start", prompt: "Chọn bước tiếp theo", criterionIds: ["ask"], choices: [
    { id: "ask-first", label: "Hỏi thêm", feedback: "Đã ghi nhận dữ liệu còn thiếu.", criterionIds: ["ask"], nextCheckpointId: null },
    { id: "ask-and-note", label: "Hỏi và ghi lại", feedback: "Đã hỏi và ghi nhận.", criterionIds: ["ask"], nextCheckpointId: null },
  ] }],
};
test("different authored choices can address the same criterion", () => {
  assert.deepEqual(evaluateCaseChoices(example, ["ask-first"]).addressedCriterionIds, ["ask"]);
  assert.deepEqual(evaluateCaseChoices(example, ["ask-and-note"]).addressedCriterionIds, ["ask"]);
});
```

- [ ] Chạy `node --test scripts/check-pt-case-practice.mjs`, xác nhận fail vì engine chưa có rồi triển khai.
- [ ] Kiểm tra lựa chọn không thuộc checkpoint hiện tại, ID không tồn tại, nhánh kết thúc sớm, lặp choice và case version cũ.
- [ ] Nếu PT đổi câu trả lời trước đó, xóa các lựa chọn downstream không còn thuộc nhánh mới; không giữ rubric đạt từ nhánh đã bỏ.
- [ ] Metadata kết thúc lưu case ID/version, các choice ID, tiêu chí theo ba nhóm và timestamp. Không lưu bối cảnh, phần tự luận hoặc hồ sơ người dùng nhập.

## Task 3 — Giao diện luyện và phản hồi

- [ ] Tạo danh mục bốn case với mục tiêu, thời lượng dự kiến và nguồn đọc trước. Thời lượng là ước lượng sản phẩm, điều chỉnh sau dùng thử.
- [ ] `CasePracticeRunner` hiển thị bối cảnh và một checkpoint tại một thời điểm, cho quay lại và sửa lựa chọn. Radio có legend, chuyển checkpoint chuyển focus vào tiêu đề mới.
- [ ] Cho ô “Lý do lựa chọn” tùy chọn, giới hạn 1.000 ký tự, gợi ý không nhập tên hoặc hồ sơ người thật. Giữ ô trong state phiên, không gửi AI hoặc kho progress.
- [ ] Trước khi hiện rubric, PT xác nhận xem phản hồi. Hiển thị tiêu chí đã xử lý, cần xem lại và chưa thực hành kèm lý do và nguồn liên quan.
- [ ] Mở nguồn/Atlas không mất nhánh đã chọn; đóng trở về checkpoint cũ. Nếu thẻ task 03 có sẵn, dẫn đến ID chính xác.
- [ ] Retry case tạo attempt ID mới nhưng giữ lịch sử trước đó. Một lần nộp lại cùng attempt ID không tăng số lần hoàn thành.
- [ ] Lỗi lưu vẫn cho đọc phản hồi và thử lưu lại. Case sửa version cho biết có bản mới, không ghi đè kết quả phiên bản cũ.

## Task 4 — Tích hợp tiến độ và nghiệm thu

- [ ] Thêm mục luyện tình huống trong `/knowledge` và phần tiến độ riêng ở `LearningDashboard`. Không cộng tiêu chí rubric vào tỷ lệ đúng NCSF.
- [ ] Bổ sung kiểm tra giữ state khi đổi mục, mở nguồn, storage hỏng và cùng attempt gửi hai lần.

```sh
node --test scripts/check-pt-case-practice.mjs scripts/check-learning-progress.mjs scripts/check-ncsf-study-continuity.mjs
npm run check:ncsf-runtime
npx tsc --noEmit
npx eslint src/lib/learning src/components/learning src/app/knowledge/page.tsx
npx -y react-doctor@latest . --verbose --scope changed
npm run design:check
```

- [ ] Chạy app ở port 3051 và dùng Playwright chặn `/api/ncsf/session` với session tổng hợp trước khi mở `/knowledge`. Nếu tab giáo trình/quiz được mở trong kiểm tra hồi quy, chặn cả API/PDF NCSF bằng fixture riêng tư giả lập. Kiểm tra mục tình huống ở 390/768/1440px, bàn phím và theme Linen/Slate.
- [ ] Quét route đã render bằng `npm run design:check:page -- --viewport 390x844 http://127.0.0.1:3051/knowledge`; dùng CDP để giữ đúng trạng thái panel khi cần.
- [ ] Đi hết mọi nhánh của bốn case và kiểm tra nguồn của mọi feedback có khẳng định y khoa. Tách kết quả kiểm tra logic khỏi đánh giá chuyên môn.
- [ ] Thử với ít nhất một PT bằng dữ liệu giả lập, ghi checkpoint khó hiểu và lý do phản hồi chưa thuyết phục; chỉnh câu chữ trước khi coi là hoàn thành.
- [ ] Ghi giới hạn còn lại và kiểm tra chưa chạy, rồi commit riêng phạm vi task.

**Hoàn thành khi** bốn case có branch đúng, feedback truy được lý do/nguồn, lựa chọn hợp lệ không bị chấm sai chỉ vì khác một đường đi mẫu, và lịch sử lưu đúng phiên bản.

## Phụ thuộc và bàn giao

- Cần task 02 để nghiệm thu lưu lịch sử. Nếu đang phát triển engine trước, dùng adapter bộ nhớ trong test và chỉ nối kho bền vững sau task 02.
- Bản đầu dùng nội dung và rubric xác định trước. Sinh case bằng AI, chấm tự luận và đào tạo theo lớp cần kế hoạch riêng.
- Định hướng chú trọng hướng dẫn tập và lập chương trình phù hợp phạm vi năng lực được NCSF công bố; không gọi rubric của app là tiêu chuẩn chấm chính thức. Trang nội dung thi được đọc ngày 2026-11-11. [NCSF Exam Content](https://www.ncsf.org/certification-exam/content)
