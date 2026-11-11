# Rà soát và tinh gọn các chủ đề bổ trợ Movement

Yêu cầu: xem các mục còn lại sau khi mở rộng bài đánh giá tư thế; lọc phần không cần thiết, giữ nội dung thực hành và bằng chứng. Đây là rà soát biên tập/luồng đọc bằng Impeccable distill, không phải một đợt nghiên cứu y khoa mới hoặc thẩm định lâm sàng.

## Quyết định

Giữ cả bốn chủ đề. Chúng phục vụ bốn câu hỏi khác nhau: chọn và mô tả nhiệm vụ, so số hai bên, đọc số đo ROM, dạy và kiểm tra kỹ năng. Không cần xóa cả mục để trang ngắn hơn.

| Mục | Giữ | Lọc bớt |
| --- | --- | --- |
| Mẫu chuyển động | Bảng squat/lunge, hinge, đẩy/kéo, mang vác; cơ học theo thiết lập; giới hạn quan sát và sàng lọc | Bỏ phần “Phân biệt mô tả với kết luận” lặp lại các điểm trọng tâm và hiểu lầm; bỏ 2 ô số liệu nhắc lại. |
| So sánh hai bên (trước là Đối xứng) | Công thức, số từng bên, ví dụ tỷ lệ giảm dù cả hai bên giảm lực, giới hạn LSI sau ACL | Bỏ TUG khỏi điểm trọng tâm, phần giải thích, câu hỏi và nguồn của bài này; TUG không trả lời câu hỏi chênh lệch hai bên. Bỏ 2 ô số liệu lặp. Giữ URL `?tab=symmetry`. |
| Biên độ vận động | AROM/PROM, quy trình, quần thể tham chiếu, hình giáo trình có giấy phép, ví dụ gập gối, sai số và cách ghi kết quả | Bỏ 2 ô tuổi tham chiếu đã có ở bảng và nội dung chính. Không xóa giới hạn phương pháp hoặc biến trung bình thành mục tiêu cá nhân. |
| Kiểm soát chuyển động | Ví dụ cue, thực hiện/giữ/chuyển kỹ năng, phản biện ưu thế cue ngoài và phạm vi nghiên cứu đau lưng | Bỏ 2 ô “3 kết quả/Theo nhiệm vụ” lặp lại phần giải thích. Giữ phân biệt dạy kỹ năng với điều trị đau. |

Thay đổi chung:

- Bỏ tổng cộng 8 ô “Mốc và con số”; xóa field/renderer chỉ dùng cho các ô này. Con số cần thiết trong công thức, ví dụ, quần thể và phạm vi nguồn vẫn còn.
- Bỏ 4 khối 3D nhúng trước phần thực hành, thay bằng liên kết tới Atlas ở phần áp dụng. Mô hình đứng tham chiếu không trả lời trực tiếp câu hỏi so tỷ lệ, sai số ROM hay hiệu quả cue. Component MovementAnatomy không còn consumer nên được bỏ; Atlas và viewer dùng ở nơi khác được giữ.
- Mục lục “3D” đổi thành “Thực hành”, nối đúng tới các bảng và ví dụ.
- “Hiểu lầm hay gặp” ở bốn bài bổ trợ thu gọn mặc định, vẫn giữ giải thích và trích dẫn. Câu hỏi tự kiểm tra vẫn mở từng câu như trước. Luồng tư thế chính và sáu hướng dẫn theo vùng được giữ.
- Bỏ nhãn tiếng Anh đánh số trên đầu bài và nhãn “Đọc từ nguồn gốc” lặp tiêu đề nguồn. Đồng nhất bề rộng bài, dấu phân cách và kiểu đọc đã có ở bài tư thế.
- Dùng learning accent và chiều dài dòng đã có của Movement tư thế cho các bài bổ trợ; sửa tương phản mục lục và đoạn nguồn quá dài được detector phát hiện. Không thay palette/theme.
- Bỏ 9 nhãn tác giả lặp ở từng dòng của ba bảng đã đánh dấu toàn bộ là ví dụ app biên soạn; metadata authored và mọi trích dẫn nguồn vẫn được giữ. Bảng có cả thuật ngữ từ nghiên cứu lẫn câu hỏi app biên soạn vẫn giữ phân biệt từng dòng.
- Bảng hai cột và bảng số học so sánh hai bên vừa bề rộng điện thoại; bảng ba cột dài giữ cuộn ngang trong khung riêng khi cần.

Không thêm nhận định y khoa, protocol hay ngày đọc nguồn mới. Nguồn Barry được bỏ khỏi bài so sánh hai bên và evidence record hiện hành của bài; bản ghi nguồn cũ trong catalog không bị viết lại. Các source ID, ngày đọc, trích dẫn cạnh nội dung và `reviewedBy: null` còn lại được giữ. Không xóa các giới hạn y khoa chỉ vì chúng làm bài dài hơn.

## Kiểm tra

- `check-movement-sources.mjs`: qua; các bài còn render trích dẫn, ngày đọc, phạm vi nguồn, nội dung trọng tâm và hình có giấy phép.
- `check-evidence-coverage.mjs`: qua, 1.274 entry; không mất metadata và các source index được tính theo danh mục hiện hành.
- `check-reading-position.mjs`: 5/5 qua; ESLint các file thay đổi và `git diff --check`: qua.
- `npm run build`: Next/Turbopack và TypeScript qua sau thay đổi cuối, với Node 24.12.0 có sẵn trên máy.
- `npm run design:check`: chạy xong, exit 2; còn 2 cảnh báo `side-tab` có sẵn ở CSS chung (dòng 800/1108) và 24 advisory có sẵn (20 font-size, 4 radius). Không thêm ignore để làm sạch báo cáo.
- `npm run design:check:page -- --viewport … <url>`: chạy đủ `/movement` và bốn query `tab=patterns/symmetry/rom/control`, mỗi mục ở `1440x1000` và `390x844`. Cả 10 lượt cuối: exit 0, không có finding. Các lượt trước phát hiện tương phản mục lục, nhãn thừa và chiều dài dòng; đã sửa theo ngữ cảnh. Cache dev CSS cũ được tái tạo trước lượt xác minh cuối; kiểu CSS mới đã được kiểm tra trực tiếp trong trình duyệt.
- Kiểm tra trình duyệt: điều hướng qua đủ bốn chủ đề, anchor mục lục, mở phần hiểu lầm, liên kết Atlas hiện diện, không có canvas 3D nhúng hoặc tràn ngang toàn trang. Bảng hai cột và bảng số học hai bên đều rộng 337 px trong khung 337 px trên mobile 390 px. Bảng so sánh ba cột dài vẫn cuộn riêng. Rà lại bài tư thế qua detector ở cả hai kích thước.
- Code review riêng không phát hiện regression cần sửa trong consumer, field đã bỏ, anchor, URL cũ, nguồn và evidence record. Lần tinh gọn nhãn tác giả cuối giữ metadata và mọi source link; nhãn toàn bảng vẫn hiển thị.

Ảnh và kết quả detector: `.impeccable/review/2026-11-10-movement-trim/` (gitignored), gồm `desktop-symmetry.jpg`, `mobile-symmetry.jpg` và JSON của 10 lượt quét cuối. Bản xem trước dùng server có sẵn cho công việc tại cổng 3001; không dừng server cổng 3000 của người dùng. Không kiểm tra chuyên biệt bàn phím, screen reader hoặc toàn bộ theme trong lượt này. Đây không phải audit đầy đủ khả năng tiếp cận, nghiên cứu hiệu quả học tập hay thẩm định lâm sàng.
