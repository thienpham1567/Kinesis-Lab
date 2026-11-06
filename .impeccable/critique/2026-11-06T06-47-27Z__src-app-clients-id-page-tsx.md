---
target: Review trang học viên, UI/UX và lõi lập kế hoạch tập luyện/dinh dưỡng
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/thienpham/Documents/pt-medical-agent/src/app/clients/[id]/page.tsx"
target_fingerprint: "sha256:e11e44cd4e4f77cb9a00860407746ba65cb0b48a27dfb6caba7be1f5a95f6193"
target_path: /Users/thienpham/Documents/pt-medical-agent/src/app/clients/[id]/page.tsx
timestamp: 2026-11-06T06-47-27Z
slug: src-app-clients-id-page-tsx
---
Method: dual-agent (A: `/root/client_design_review` · B: `/root/client_detector_review`).

**Đúng: AI hiện viết gợi ý giáo án trong chat khi PT yêu cầu. App chưa có bộ lập chương trình tập và thực đơn có cấu trúc.**

Luồng hiện tại là hồ sơ học viên + tối đa 4 bản ghi xét nghiệm/InBody/ROM + nguồn truy xuất → AI qua OpenRouter → câu trả lời dạng hội thoại. Đáng chú ý, API chưa đọc nhật ký tập để điều chỉnh chương trình; câu trả lời cũng chưa trở thành lịch tuần/buổi có thể giao và theo dõi. Xem [API chat](/Users/thienpham/Documents/pt-medical-agent/src/app/api/chat/route.ts:90).

**Nhận định thiết kế:** Clinical Field Notes có bản sắc phù hợp: nền giấy, chữ Việt, giao diện điềm tĩnh và nguồn tham khảo rõ. Điểm cần nâng cấp lớn nhất là chuyển trang học viên từ nơi lưu hồ sơ và hỏi đáp thành nơi PT lên kế hoạch, thực hiện và điều chỉnh việc tập.

Những phần nên giữ: tìm kiếm hồ sơ theo tên/mục tiêu/bệnh lý; trạng thái tải, lưu và thử lại; liên kết bài tập sang Atlas; cách phân biệt tải ngoài, trọng lượng cơ thể và trợ lực. Giữ sàng lọc và giới hạn bằng chứng, không thêm một cổng “chờ chuyên gia duyệt” cho toàn bộ kiến thức.

**Năm vấn đề ưu tiên:**

| Mức | Phát hiện và tác động | Hướng sửa |
|---|---|---|
| P1 | “Tư vấn & giáo án” mở chat chung; chưa có mục tiêu → lịch → buổi → bài → tiến triển. PT phải chuyển văn bản AI thành kế hoạch bằng tay. | Tạo trình lập chương trình, cho tạo thủ công/từ mẫu/AI; lưu bản nháp, phiên bản và chương trình đang áp dụng. `shape` |
| P1 | Chưa có module dinh dưỡng: đánh giá đầu vào, mục tiêu năng lượng, thực đơn, đổi món hay theo dõi. InBody là đầu vào đo lường. | Xây luồng dinh dưỡng riêng, xác định rõ giáo dục/thói quen và phạm vi cần chuyên môn phù hợp. `shape` |
| P1 | Đã tái hiện: nhập ghi chú nhật ký, đổi sang Hồ sơ rồi quay lại thì bản nháp trống, không báo trước. Chat và hồ sơ cũng giữ state cục bộ trong panel bị unmount. | Giữ bản nháp theo học viên; khôi phục ngữ cảnh và có thao tác bỏ thay đổi rõ ràng. `harden` |
| P2 | Mặc định mở bản đồ đau; mục tiêu không hiện trong header. 7 tab ngang khiến phần cuối khó thấy ở màn hình hẹp. | Mở Tổng quan với mục tiêu, kế hoạch đang dùng, buổi kế tiếp; gom thông tin lâm sàng theo nhóm. `layout`/`distill` |
| P2 | Nhật ký ghi từng bài rời, một số reps/tải cho cả mục; chỉ 13 lựa chọn Atlas, có ID gộp nhiều biến thể. Chưa có nhóm buổi, ghi từng hiệp, sửa mục hoặc so kế hoạch với thực tế. | Ghi trực tiếp từ buổi đã lên lịch; chuẩn hoá từng biến thể, hiện kết quả gần nhất, hỗ trợ sửa/sao chép buổi. `shape` |

Bằng chứng mã nguồn: [điều hướng và panel](/Users/thienpham/Documents/pt-medical-agent/src/app/clients/[id]/page.tsx:190), [state chat](/Users/thienpham/Documents/pt-medical-agent/src/components/ChatPanel.tsx:65), [dữ liệu nhật ký](/Users/thienpham/Documents/pt-medical-agent/src/lib/training-log.ts:5).

**UI/UX đề xuất:** giữ typography và các theme hiện có. Điều hướng chính gồm **Tổng quan · Kế hoạch tập · Dinh dưỡng · Tiến độ · Hồ sơ**. Tổng quan trả lời được “hôm nay tập gì, mục tiêu gì, cần lưu ý gì”, với hành động chính “Bắt đầu buổi tập” hoặc “Lập kế hoạch” khi chưa có. Sàng lọc, bản đồ đau, ROM và xét nghiệm vẫn dễ mở trong nhóm Hồ sơ; cảnh báo khẩn không bị giấu. AI nằm trong ngữ cảnh của kế hoạch và giữ hội thoại khi PT mở dữ liệu khác.

**Cốt lõi lập chương trình nên có bốn lớp:**

1. **Đầu vào:** mục tiêu chính/phụ, kinh nghiệm, số ngày và thời lượng khả dụng, thiết bị, sở thích, giới hạn đã ghi nhận và thông tin an toàn còn thiếu. Mục tiêu cần chỉ số theo dõi và mốc đánh giá lại, thay vì một ô văn bản.
2. **Nội dung kế hoạch:** tuần → buổi → bài → từng hiệp; có sets, khoảng reps, tải/cách chọn tải, nghỉ, RIR/RPE đúng loại thang đo, hướng dẫn thực hiện và bài thay thế.
3. **Method rõ nghĩa:** tách lịch chia buổi (full-body/upper–lower), cách tổ chức hiệp (hiệp thường/superset…), và quy tắc tiến triển. Mỗi lựa chọn cần giải thích lý do phù hợp mục tiêu, lịch và giới hạn của học viên.
4. **Vòng phản hồi:** so dự kiến với thực tế, hiển thị lần tập tương đương gần nhất, theo dõi mức hoàn thành/phản hồi, rồi đề xuất thay đổi có lý do để PT xem và chấp nhận. Lưu lịch sử phiên bản.

Không nên lấy số lượng kỹ thuật nâng cao làm thước đo chất lượng. ACSM 2026 nhấn mạnh cá thể hoá theo mục tiêu và khả năng duy trì; nhiều kỹ thuật phức tạp không cần thiết với người lớn khoẻ mạnh nói chung. Đây là định hướng nguồn cho thiết kế, không phải phác đồ áp dụng cho mọi học viên. [ACSM](https://acsm.org/resistance-training-guidelines-update-2026/) — đọc trang hướng dẫn công khai ngày 06/11/2026.

**Dinh dưỡng cần dữ liệu tính được và sửa được:** thu thập số đo có ngày ghi nhận, sinh hoạt, khẩu vị, dị ứng, ngân sách và khả năng chuẩn bị bữa. Mục tiêu năng lượng/macro phải có phương pháp tính, giả định và trạng thái ước tính. Thực đơn cần khẩu phần gram, phân biệt sống/chín, thành phần món và tổng theo bữa/ngày; đổi món phải tính lại. AI có thể đề xuất món và giải thích, còn số dinh dưỡng nên lấy từ cơ sở dữ liệu có nguồn và tính bằng mã. [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide/) cung cấp API dữ liệu thực phẩm; món Việt vẫn cần nguồn và công thức được đối chiếu riêng. Đọc API Guide ngày 06/11/2026, chưa đánh giá độ phủ món Việt.

**Tôi đề xuất kiến trúc kết hợp:** dữ liệu bài tập/thực phẩm có nguồn + phép tính và kiểm tra ràng buộc bằng mã + AI tạo bản nháp/giải thích + PT chỉnh và chọn áp dụng. Đổi giao diện đơn thuần không giải quyết được thiếu kế hoạch; chỉ thêm prompt AI vẫn khó bảo đảm nhất quán và tính toán. Không suy an toàn từ hồ sơ còn thiếu, và không coi trích dẫn trong câu trả lời là bảo đảm mọi đề xuất được nguồn hỗ trợ.

**Điểm heuristic: 23/40**, là đánh giá thiết kế tham khảo, không phải chứng nhận accessibility hay y khoa.

| Tiêu chí | Điểm /4 | Điểm yếu chính |
|---|---:|---|
| Hiển thị trạng thái | 3 | Chưa có trạng thái bản nháp |
| Khớp công việc thực tế | 2 | Hồ sơ lâm sàng lấn luồng lập kế hoạch |
| Quyền kiểm soát | 2 | Đổi tab mất nội dung đang nhập |
| Nhất quán | 3 | Xác nhận xoá khác nhau giữa nhật ký và xét nghiệm |
| Ngăn lỗi | 2 | Chưa bảo vệ thay đổi chưa lưu |
| Nhận biết thay vì ghi nhớ | 2 | Thiếu mục tiêu và kết quả cũ tại nơi quyết định |
| Hiệu quả thao tác | 1 | Nhập từng bài, chưa có mẫu buổi |
| Thẩm mỹ và tối giản | 3 | Header/cảnh báo lặp chiếm chỗ |
| Khôi phục lỗi | 3 | Có thử lại, chưa khôi phục bản nháp |
| Hướng dẫn | 2 | Có chú thích nhưng thiếu luồng tạo kế hoạch |

Về tải nhận thức, bốn điểm yếu là thiếu một trọng tâm, các lựa chọn ngang cấp cạnh tranh, phải nhớ dữ liệu giữa màn hình và phải tự ghép nhiều bước. PT bận rộn thiếu sao chép buổi; PT mới thiếu điểm bắt đầu cho giáo án; người dùng mobile dễ bỏ sót tab và mất nháp khi tra hồ sơ. Trải nghiệm vào trang khá bình tĩnh, nhưng thời điểm lập kế hoạch bắt đầu bằng ô chat trống và chưa kết thúc bằng một kế hoạch sẵn sàng thực hiện.

Quan sát nhỏ: sửa OCR xét nghiệm hiện dùng JSON thô; nhãn “Lịch sử sinh hoạt của PT” có thể khiến hiểu nhầm đối tượng cần ghi. Nên sửa các chi tiết này sau luồng chính.

Detector nguồn: **0 primary, 2 advisory** ở chữ 10px trong client detail (dòng 292, 854). Tám lượt quét render trên danh sách/bản đồ/nhật ký/chat tại 1440×1000 và 390×844 có **114 primary và 28 advisory observations**, gồm phần tử lặp qua route/viewport, không phải 142 lỗi riêng. Đáng xử lý: heading cảnh báo khoảng 3,4:1 và nhãn điều hướng mobile khoảng 3,5:1 trong Linen; chữ chức năng 10–11px ở bản đồ cần rà soát. Cảnh báo khối lồng nhau cần xét theo ngữ cảnh; cảnh báo hình giải phẫu là hình ghép primitive là false positive vì SVG đang chứa ảnh có nguồn cùng vùng tương tác.

Hai câu hỏi định hướng: Trong 60 giây trước buổi tập, trang có trả lời được hôm nay tập gì và khác lần trước thế nào? Đối tượng chính cần lưu nên là hội thoại hay một chương trình có phiên bản mà hội thoại hỗ trợ tạo ra?
