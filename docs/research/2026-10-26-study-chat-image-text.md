# Pilot chữ tiếng Việt trong ảnh chat nổi

Ngày: 2026-10-26. Model theo lựa chọn của người dùng: Nano Banana 2.1 (`google/gemini-nano-banana-2.1`, provider `google-ai-studio`). Mặc định chatbox: 1K. Kết quả QA Seedream trước đó không phải kết quả đánh giá model này.

## Protocol

- Ba brief có nguồn sẵn trong app: giải phẫu cánh tay trước (OpenStax A&P 2e §11.5, đã đọc 2026-10-23); squat đổi độ rộng chân (Lorenzetti 2018 và Bahr 2016, đã đọc 2026-10-22); so sánh LSI với số từng bên (Parkinson 2021 và Wellsandt 2017, đã đọc 2026-10-22).
- Mỗi brief có tiêu đề ≤60 ký tự và 3 hoặc 4 chú giải tiếng Việt có dấu, tổng chữ trong ảnh ≤550 ký tự. Exact `imageText` nằm trong `scripts/eval-study-chat-images.mjs`.
- Ảnh: 1K, 4:3, n=1, không fallback, không tự retry. Tối đa hai ảnh mỗi brief, tổng tối đa 6 ảnh.
- Script mặc định chỉ in protocol. Chỉ `--apply --max-images=N` (N≤6) mới gọi OpenRouter trả phí.
- Không dùng OCR làm bằng chứng chữ đúng. Người đọc đối chiếu từng dấu/chữ với `expectedText`, bố cục, và quan hệ hình–nhãn theo phạm vi nguồn. Nguồn không xác nhận pixel, mũi tên hay phép đo do model vẽ.

## Kết quả chạy

Chưa chạy `--apply` cho Nano Banana 2.1. Chưa có receipt, hash, latency hay đánh giá chữ của model này. API local đã trả đúng model và 1K; kiểm tra request/receipt, giá theo token, build và lint đã qua. Đây chưa phải đánh giá chất lượng hình hoặc độ chính xác giải phẫu.

## Quyết định mặc định

Theo yêu cầu người dùng ngày 2026-10-26: chatbox dùng `google/gemini-nano-banana-2.1`, provider `google-ai-studio`, mặc định 1K. Cả tạo mới và chỉnh sửa dùng cấu hình này. Giữ toàn bộ chữ do model vẽ trực tiếp trong ảnh. Giá ảnh đầu ra ước tính 1K là $0.0336, chưa gồm prompt/thinking; chi phí thực tế lấy từ `usage.cost`. Atlas vẫn giữ cấu hình riêng.
