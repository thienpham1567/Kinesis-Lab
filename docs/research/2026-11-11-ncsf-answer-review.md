# Giải thích đầy đủ cho câu trả lời sai (NCSF)

Ngày: 2026-11-11. Phạm vi: Đề cương ôn tập (2.019 câu, 8 chương) và hai Đề thi thử (300 câu).

## Người dùng đã chọn

- Trích nguyên văn đoạn giáo trình của trang được dẫn, kèm lý do vì sao đáp án đúng và vì sao từng phương án sai. Lý do do AI soạn, chỉ dựa trên trang giáo trình đó.
- Áp dụng cho cả Đề cương ôn tập và Đề thi thử.
- Upload file giải thích lên bucket riêng `ncsf`.

## Dữ liệu

- File: `review/quiz-ch{1..8}.json`, `review/mock-{1,2}.json` trong bucket riêng `ncsf`. Chúng nằm tách khỏi `quiz.json` và `mock-answers.json`, nên code production cũ không đọc chúng và không bị ảnh hưởng khi upload.
- Khóa mỗi mục là `itemId` của câu hỏi (`src/lib/learning/ncsf-identity.ts`). Khóa lý do sai là mã băm nội dung phương án. Khi câu hỏi, đáp án hoặc phương án đổi, `itemId` đổi theo, nên giải thích cũ tự ẩn thay vì hiện sai câu.
- Mỗi mục có: chương giáo trình (`slug`), `page`, `section` (tiêu đề slide), `passage` (1–6 dòng trích nguyên văn), `concept`, `whyCorrect`, `whyWrong`.
- Metadata ghi đúng thực tế: `method: "ai-draft-from-textbook-page"`, tên model, ngày tạo, `reviewedBy: null`. Chưa có chuyên gia duyệt.
- Route `/api/ncsf/review?bank=quiz|mock&part=N` cần phiên đăng nhập NCSF, chỉ đọc khóa cố định và kiểm schema trước khi trả về (`src/lib/ncsf-answer-review.ts`).

## Cách tạo

Script: `scripts/ncsf-answer-review.mjs`. Dữ liệu riêng nằm trong `.data/ncsf-review/` (git-ignored).

```bash
node --env-file=.env.local scripts/ncsf-answer-review.mjs pull
node scripts/ncsf-answer-review.mjs pages
node --env-file=.env.local scripts/ncsf-answer-review.mjs generate --concurrency=12
node scripts/ncsf-answer-review.mjs build
node --env-file=.env.local scripts/ncsf-answer-review.mjs publish
```

- Văn bản giáo trình được trích bằng `unpdf` theo từng trang PDF của 8 chương; số trang phải khớp `NCSF_PAGE_COUNTS`.
- Trang dùng cho mỗi câu:
  - Đề cương: trang `page` của câu, cộng tối đa hai trang khác mà giải thích có sẵn nhắc tới.
  - Đề thi thử: trang giáo trình trong nguồn của khóa đáp án (293/300 câu). Bảy câu chỉ có nguồn ngoài được ghép với hai trang giáo trình gần nhất theo từ khóa; danh sách nằm trong `report.json` (`lexicalPageMatches`) để kiểm lại.
- Model mặc định là `OPENROUTER_MODEL_CLINICAL` (lúc tạo: `anthropic/claude-haiku-5.5`).
- Kiểm tra tự động trước khi nhận một bản nháp:
  - Có đủ lý do cho mọi phương án sai.
  - Không gọi phương án bằng chữ cái hoặc số thứ tự, vì thứ tự phương án được xáo trộn khi hiển thị.
  - Không có markdown.
  - Không có con số nào ngoài các số đã có trong trang giáo trình, câu hỏi, phương án hoặc giải thích có sẵn.
  - Các dòng giáo trình được chọn phải có thật trên trang được cung cấp. Với Đề cương, luôn có dòng chứa câu trích `evidence` đã được kiểm tra trước đó.
- Model đánh dấu `keyConflict` khi trang được cung cấp không hỗ trợ rõ đáp án. Danh sách nằm trong `.data/ncsf-review/report.json`. Phần lớn các trường hợp là căn cứ còn yếu (trang chỉ liệt kê, không định nghĩa), không phải khóa đáp án sai. Khóa đáp án không bị thay đổi.

## Giới hạn

- Lý do do AI soạn có thể dùng định nghĩa nền phổ thông khi giáo trình không nói. Lớp kiểm tra số liệu không bắt được lỗi diễn giải không chứa số.
- Tiêu đề mục lấy từ dòng đầu của slide. Một số slide bắt đầu bằng bảng hoặc câu dẫn nên không có tiêu đề mục. Số trang là định vị chính.
- Văn bản PDF hai cột có thể làm một dòng trích bị ngắt hoặc ghép lệch. Nút “Mở trang” luôn dẫn tới trang gốc.
- Các kiểm tra trên chỉ xác nhận cấu trúc và nguồn trích. Chúng không xác nhận độ chính xác y khoa và không thay cho việc chuyên gia duyệt.
