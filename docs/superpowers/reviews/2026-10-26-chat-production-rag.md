# Cập nhật chat production — 2026-10-26

Bản chạy: [kinesis-lab.vercel.app](https://kinesis-lab.vercel.app/consult). Deployment cuối [dpl_HreofVjUdr6Bus6p6UtZtYCMTC11](https://vercel.com/thienphamuser-1935s-projects/kinesis-lab/HreofVjUdr6Bus6p6UtZtYCMTC11), Vercel `READY`, source commit `ac2438d`.

## Mã nguồn và cấu hình

Đã fetch/pull `origin/master` tại `4bdeb35`, merge vào nhánh `codex/chat-production-rag` tại `6f18aba`. Giữ các cập nhật landing, Atlas theo ngữ cảnh, Markdown an toàn và chat nổi từ master. Giải quyết conflict của route chat và lockfile, giữ cả bộ dependency mới và pipeline bằng chứng. Lần `git pull --no-rebase origin master` sau merge báo `Already up to date`.

Ba biến Vercel đã cập nhật cho Production, Preview, Development:

- `OPENROUTER_MODEL_CLINICAL=anthropic/claude-haiku-5.5`
- `OPENROUTER_MODEL_FAST=anthropic/claude-haiku-5.5`
- `OPENROUTER_MODEL_EMBEDDING=google/gemini-embedding-2`

Giữ nguyên thông tin xác thực và model vision. Local/example/defaults trong code dùng cùng ba model. Không ghi secret vào repo hoặc báo cáo.

## Kho truy xuất thực tế

Namespace `evidence-v1:google/gemini-embedding-2:1536:qa-v1`, 1.536 chiều, **3 tài liệu / 197 đoạn có vector**. Tạo vector từ từng đoạn độc lập, có tiêu đề; query có task question-answering. Kiểm tra số lượng, thứ tự, độ dài và giá trị vector trước khi lưu; chuẩn hóa vector.

- [World Health Organization 2020 guidelines on physical activity and sedentary behaviour](https://doi.org/10.1136/bjsports-2020-102955) — 80 đoạn, CC BY 4.0.
- [Systematic Review to Inform a World Health Organization (WHO) Clinical Practice Guideline: Benefits and Harms of Structured Exercise Programs for Chronic Primary Low Back Pain in Adults](https://doi.org/10.1007/s10926-023-10124-4) — 65 đoạn, CC BY 4.0.
- [Dumbbell versus cable lateral raises for lateral deltoid hypertrophy: an experimental study](https://doi.org/10.3389/fphys.2025.1611468) — 52 đoạn, CC BY 4.0.

Nguồn lấy qua Europe PMC fullTextXML, xác minh DOI và giấy phép CC BY. Registry lưu tác giả, DOI, URL, giấy phép, hash XML, ngày truy cập/kiểm tra, vị trí mục/đoạn và `reviewedBy: null`. Chỉ tách văn bản tường thuật và abstract; bỏ bảng, hình, tài liệu tham khảo và phụ lục. Đây là kho khởi đầu, chưa bao phủ toàn bộ giải phẫu, bệnh nền, thuốc hay phục hồi chức năng.

NCSF vẫn là thư viện giáo trình riêng. PubMed bổ sung metadata/abstract bằng từ vựng chủ đề cố định; không gửi câu hỏi nguyên văn hoặc hồ sơ học viên sang PubMed. Bộ bằng chứng biên soạn trong app tiếp tục được cung cấp theo chủ đề.

Đã triển khai code kiểm tra namespace trước khi import vào database đang trống. Runtime từ chối so sánh vector khi namespace không tương thích hoặc collection chưa nhập đủ. Không đổi schema 1.536 chiều. Chạy import lần hai xác nhận `newlyEmbedded: 0` ở cả ba nguồn và tổng vẫn 197; không tạo bản sao hoặc tính thêm embedding cho chunk đã có.

## Hành vi chat

- Cả bàn tư vấn và chat nổi dùng parser stream chung, giữ tiếng Việt khi byte bị chia, đọc được bản ghi cuối không có newline, và báo gián đoạn khi không hoàn tất.
- Chỉ báo hoàn tất/lưu câu trả lời khi provider trả `finish_reason: stop`; lỗi provider, giới hạn token hoặc finish reason khác không được coi là câu trả lời đầy đủ.
- Giới hạn lịch sử gửi đi để hội thoại không tự lỗi sau 24 lượt. Đổi học viên xóa ngữ cảnh cũ; reset chat nổi hủy request cũ và ngăn kết quả cũ ghi vào phiên mới.
- Hiển thị trạng thái kho trống/đang nhập/không phù hợp/lỗi; có nguồn DOI, vị trí đoạn và giấy phép. Bàn tư vấn hiển thị thêm bộ bằng chứng app.
- Kiểm tra mã RAG xuất hiện trong đầu ra với các đoạn đã cung cấp. Mã lạ/giữ chỗ tạo cảnh báo rõ và lưu audit với hội thoại hồ sơ. Đây chỉ là kiểm tra định danh RAG, chưa kiểm chứng ý nghĩa từng nhận định hoặc mọi URL/PMID/APP trong đầu ra.
- Prompt phân biệt độ mạnh khuyến nghị với độ chắc chắn bằng chứng, giới hạn đọc toàn văn/abstract, không suy tương đương từ việc không phát hiện khác biệt, và xử trí thận trọng khi thiếu dữ liệu an toàn.

## Xác minh

- `npm run check:chat`: **23/23** ca và kiểm tra 1.107 hồ sơ bằng chứng qua.
- `check:safety`, `check:rom`, `check:markdown`, `check:atlas-context`, `check:landing`: qua.
- TypeScript, ESLint và production build: qua. Local build có cảnh báo metadataBase của mã upstream khi không cấu hình origin local; kiểm tra riêng HTML production không có origin localhost.
- React Doctor so với `origin/master`: 2 cảnh báo clone JSON trong script test/benchmark; không phải luồng React production. Không sửa hoặc suppress quy tắc để che cảnh báo.
- Review mã phát hiện giới hạn 24 lượt và cách hiểu sai SSE `[DONE]`; đã sửa và review lại. Review tích hợp chat nổi/master không còn blocker được xác định.
- Gọi Gemini thật xác nhận nhiều vector 1.536 chiều độc lập, có chuẩn hóa, và query tiếng Việt phân biệt đúng nội dung thử.
- Kiểm tra UI production: bàn tư vấn, chat nổi tại Sổ tay, Markdown, DOI có thể mở và danh sách đoạn nguồn. Chỉ dùng câu hỏi tổng quát, không dùng hồ sơ cá nhân.

Kiểm tra API cuối lúc `2026-10-26T04:08:27.686Z`; cả ba dùng Haiku 5.5, Gemini Embedding 2, 3 documents, `ready`, có trích dẫn UUID khớp nguồn, nhận `done` và không có cảnh báo trích dẫn trong ba lượt này:

| Ca | Tổng thời gian gồm tìm nguồn/model | RAG | PubMed | DOI tìm được |
| --- | --- | --- | --- | --- |
| who-activity | 16.37s | `ready` | `skipped` | 10.1136/bjsports-2020-102955 |
| low-back-pain | 15.69s | `ready` | `ready` | 10.1007/s10926-023-10124-4 |
| lateral-raise | 14.65s | `ready` | `ready` | 10.3389/fphys.2025.1611468 |

Lệnh kiểm tra live (3 request trả phí, không dùng clientId):

```sh
node scripts/smoke-chat-production.mjs --url=https://kinesis-lab.vercel.app
```

Đối chiếu PubMed CommentsCorrections cho PMID 33239350, 37991647, 40692697 chỉ trả một liên kết `CommentIn` trong lần kiểm tra; không phải bảo đảm giám sát đầy đủ đính chính/rút bài hoặc bản hướng dẫn mới.

Báo cáo [so sánh 64 câu Haiku/Sonnet](../../research/2026-10-26-chat-model-comparison.md) giữ nguyên snapshot prompt/route/PubMed của phép thử trước thay đổi production. Không dùng điểm số cũ như kết quả đánh giá pipeline mới. Các kiểm tra trên xác nhận phần mềm, truy xuất và phạm vi hữu hạn; không thiết lập thẩm định lâm sàng hay bảo đảm mọi câu trả lời AI chính xác.
