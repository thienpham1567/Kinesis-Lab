# Pilot chữ tiếng Việt trong ảnh chat nổi

Ngày: 2026-10-26. Model hiện tại theo lựa chọn của người dùng: GPT Image 2.5 Sunburst (`openai/gpt-image-2.5-sunburst`, provider `openai`). Kích thước, tỉ lệ và chất lượng tự động. Kết quả QA Seedream và lỗi quota Nano Banana trước đó không phải kết quả đánh giá Sunburst.

## Protocol

- Ba brief có nguồn sẵn trong app: giải phẫu cánh tay trước (OpenStax A&P 2e §11.5, đã đọc 2026-10-23); squat đổi độ rộng chân (Lorenzetti 2018 và Bahr 2016, đã đọc 2026-10-22); so sánh LSI với số từng bên (Parkinson 2021 và Wellsandt 2017, đã đọc 2026-10-22).
- Mỗi brief có tiêu đề ≤60 ký tự và 3 hoặc 4 chú giải tiếng Việt có dấu, tổng chữ trong ảnh ≤550 ký tự. Exact `imageText` nằm trong `scripts/eval-study-chat-images.mjs`.
- Ảnh: không gửi `resolution`/`size` cố định; `aspect_ratio: auto`, `quality: auto`, `n: 1`, không fallback, không tự retry. Tối đa hai ảnh mỗi brief, tổng tối đa 6 ảnh.
- Script mặc định chỉ in protocol. Chỉ `--apply --max-images=N` (N≤6) mới gọi OpenRouter trả phí.
- Không dùng OCR làm bằng chứng chữ đúng. Người đọc đối chiếu từng dấu/chữ với `expectedText`, bố cục, và quan hệ hình–nhãn theo phạm vi nguồn. Nguồn không xác nhận pixel, mũi tên hay phép đo do model vẽ.

## Kết quả chạy

Chưa chạy bộ ba brief bằng `--apply` cho Sunburst. Kết quả kiểm tra triển khai và lượt smoke test được ghi riêng trong báo cáo rollout; chúng chưa phải đánh giá độ chính xác giải phẫu.

## Quyết định mặc định

Theo yêu cầu mới nhất ngày 2026-10-26: chatbox dùng `openai/gpt-image-2.5-sunburst`, provider `openai`, kích thước/chất lượng tự động. Cả tạo mới và chỉnh sửa dùng cấu hình này. Giữ toàn bộ chữ do model vẽ trực tiếp trong ảnh. Không áp giá cố định mỗi ảnh cho chế độ auto; chi phí thực tế lấy từ `usage.cost`. Atlas vẫn giữ cấu hình riêng.
