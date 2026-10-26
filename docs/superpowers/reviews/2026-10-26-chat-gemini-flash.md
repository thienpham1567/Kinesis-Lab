# Đổi chat sang Gemini 2.5 Flash — 2026-10-26

Theo yêu cầu người dùng, thay Haiku 5.5 bằng `google/gemini-2.5-flash` cho cả chat lâm sàng và tra cứu nhanh. Đã đồng bộ defaults trong code, `.env.example`, local config, README, kiểm tra và hai biến Vercel `OPENROUTER_MODEL_CLINICAL` / `OPENROUTER_MODEL_FAST` cho Production, Preview, Development.

Embedding giữ `google/gemini-embedding-2`, 1.536 chiều, namespace và 3 tài liệu / 197 đoạn đã nhập. Không cần tạo lại vector khi chỉ đổi model trả lời.

Production [kinesis-lab.vercel.app](https://kinesis-lab.vercel.app/consult), [deployment dpl_ARVEny6pFrUWdSGt8wXVLwP4daeJ](https://vercel.com/thienphamuser-1935s-projects/kinesis-lab/ARVEny6pFrUWdSGt8wXVLwP4daeJ) báo `READY`, source commit `e47d0cb`.

Xác minh: `npm run check:chat` 23/23 và kiểm tra bằng chứng qua; production build/TypeScript và lint qua. Cảnh báo metadataBase local có từ upstream, không chặn build.

Kiểm tra API trực tiếp lúc `2026-10-26T04:14:30.607Z`: cả 3 lượt trả model `google/gemini-2.5-flash`, embedding `google/gemini-embedding-2`, 1.536 chiều, 3 documents, lấy đúng DOI cho từng chủ đề, mã RAG khớp nguồn, nhận `done`, không có lỗi/cảnh báo trích dẫn trong các lượt này. Câu hỏi tổng quát, không dùng hồ sơ học viên.

| Ca | Tổng thời gian gồm tìm nguồn và model | RAG |
| --- | --- | --- |
| who-activity | 9.29s | `ready` |
| low-back-pain | 11.47s | `ready` |
| lateral-raise | 6.58s | `ready` |

Chuyển model theo lựa chọn người dùng. Các lượt này kiểm tra kỹ thuật và truy xuất trong phạm vi hữu hạn; không phải so sánh chất lượng Gemini/Claude hoặc thẩm định lâm sàng. [Báo cáo pipeline và nguồn ban đầu](2026-10-26-chat-production-rag.md) giữ nguyên lịch sử triển khai trước lần đổi này.
