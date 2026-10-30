# Impeccable cho Kinesis Lab

Đọc và đối chiếu ngày 30/10/2026. Nguồn chính: [pbakaus/impeccable](https://github.com/pbakaus/impeccable), commit [`df3a4abe7d0840d5f60324812c432e00b66a4e75`](https://github.com/pbakaus/impeccable/tree/df3a4abe7d0840d5f60324812c432e00b66a4e75). Các playbook của 24 lệnh và `SKILL.md` tại commit này trùng byte với bản cài trong project (skill 4.8.0); không cần cập nhật package để sử dụng.

Đây là một skill có 24 lệnh, không phải 24 package độc lập. Các lệnh là hướng dẫn làm việc cho agent; không phải chạy `impeccable polish` trong terminal để tự động sửa app.

## Đối chiếu từng lệnh

Các liên kết dưới đây dẫn tới tài liệu upstream. Phân loại dựa trên app hiện tại, không phải giới hạn vĩnh viễn của lệnh.

| Lệnh | Công việc theo tài liệu | Áp dụng cho Kinesis Lab |
| --- | --- | --- |
| [shape](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/shape.md) | Xác định người dùng, nhiệm vụ, trạng thái và brief trước code | Hữu ích cho màn hình/luồng mới. Lượt này đã xác nhận ưu tiên cân bằng học tập và tư vấn. |
| [init](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/init.md) | Ghi kiến thức sản phẩm đã xác nhận vào PRODUCT.md | Đã có; dùng làm căn cứ, không phỏng vấn lại dữ kiện đã chốt. |
| [document](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/document.md) | Ghi lại hệ thống thiết kế thực tế trong DESIGN.md và sidecar | Đã có. Các thay đổi lần này được ghi rõ trong review; không tái tạo toàn bộ hệ thống. |
| [extract](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/extract.md) | Gom pattern lặp cùng mục đích ít nhất ba lần | Phù hợp với WorkspaceUI và token dùng chung. Chỉ gom khi có nhu cầu thực; không thêm framework/component library. |
| [critique](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/critique.md) | Review UX độc lập với detector rồi tổng hợp | Dùng để tìm trở ngại trong năm route chính, có hai đánh giá độc lập. |
| [audit](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/audit.md) | Kiểm tra kỹ thuật a11y, theme, responsive, hiệu năng và tính nhất quán | Dùng để lấy số đo, kiểm tra mã và quét nguồn/trang render. Báo cáo không phải chứng nhận. |
| [polish](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/polish.md) | Hoàn thiện luồng và trạng thái trong nhận diện hiện có | Dùng làm bước kết thúc cho các thay đổi đã chọn. |
| [bolder](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/bolder.md) | Tăng sức nặng của một vùng trong ngôn ngữ thiết kế sẵn có | Có thể dùng cho hành động chính thiếu nổi bật. Chưa có lý do tăng cường độ toàn app. |
| [quieter](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/quieter.md) | Giảm nhiễu thị giác, giữ phân cấp | Hữu ích cho bảng công cụ dày. Giữ nguyên palette, chiều sâu và nhận diện người dùng đã chọn. |
| [distill](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/distill.md) | Bỏ bước dư, gom hoặc tiết lộ dần thông tin phụ | Dùng cho cài đặt Atlas và tham chiếu tư vấn; không bỏ nguồn, giới hạn hoặc chức năng. |
| [harden](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/harden.md) | Xử lý đầu vào dài, lỗi, pending, quyền truy cập và focus | Dùng cho đóng form, đăng nhập và giữ bản nháp. Kiểm tra bằng dữ liệu giả, không ghi hồ sơ thật. |
| [onboard](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/onboard.md) | Đưa người mới tới hành động hữu ích bằng empty state/hướng dẫn tại chỗ | Dùng cho gợi ý bản nháp tư vấn và giải thích các cách học NCSF trước đăng nhập. |
| [animate](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/animate.md) | Motion giải thích trạng thái và quan hệ, có reduced motion | Phù hợp với phản hồi nhẹ và thanh vị trí đọc; không thêm animation xuất hiện hàng loạt. |
| [colorize](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/colorize.md) | Thêm màu theo vai trò, kiểm tra tương phản | App đã có 13 theme; dùng token hiện có cho trạng thái chọn thay vì thêm bảng màu. |
| [typeset](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/typeset.md) | Cải thiện vai trò chữ, cỡ, measure, line-height | Dùng cho văn bản sổ tay và nhập liệu mobile, giữ Be Vietnam Pro/IBM Plex Mono. |
| [layout](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/layout.md) | Đặt thứ tự nhiệm vụ, nhóm thông tin và bố cục theo viewport | Dùng để đưa mô hình và ô soạn tư vấn gần hành động chính hơn, giữ DOM/focus hợp lý. |
| [delight](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/delight.md) | Thêm cá tính ở thời điểm có ý nghĩa | Có thể áp dụng sau cho hoàn thành buổi học; không thêm celebration cho thao tác thường ngày. |
| [overdrive](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/overdrive.md) | Kỹ thuật tham vọng cho tương tác hoặc hình ảnh, cần chọn phương án | Chưa dùng: không có bằng chứng cần shader/physics/effect mới; Atlas đã có renderer riêng. |
| [clarify](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/clarify.md) | Làm rõ nhãn, trạng thái và bước tiếp theo | Dùng cho tiêu đề hồ sơ, số kết quả, bản nháp tư vấn và vị trí cuộn sổ tay. Không viết lại nhận định y khoa. |
| [adapt](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/adapt.md) | Thích ứng cấu trúc và thao tác theo thiết bị | Dùng cho vùng chạm, form, đọc và bàn tư vấn; mobile web vẫn là nền tảng web. |
| [optimize](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/optimize.md) | Đo bottleneck trước/sau rồi mới tối ưu | Chỉ đề xuất tối ưu lớn sau khi đo. Lượt này không tuyên bố cải thiện Web Vitals hoặc tốc độ 3D. |
| [live](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/live.md) | Chọn phần tử trên app local và duyệt variant | Dùng khi người dùng muốn chọn trực tiếp; không cần overlay cho các sửa lỗi đã xác định. |
| [generate](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/generate.md) | Tạo nhiều variant của phần tử đã chỉ định qua live | Hữu ích khi so sánh phương án, không tạo ngẫu nhiên nhiều bản của toàn app trong lượt này. |
| [craft](https://github.com/pbakaus/impeccable/blob/df3a4abe7d0840d5f60324812c432e00b66a4e75/.agents/skills/impeccable/reference/craft.md) | Alias đã deprecated cho yêu cầu tạo UI thông thường | Không cần gọi. |

## Phạm vi nâng cấp

Người dùng chọn cân bằng học tập và tư vấn. Giữ Clinical Field Notes, 13 theme, nguồn/giới hạn và dữ liệu riêng tư. Tiêu chí là hoàn tất thao tác, đọc được ở mobile/desktop và phản hồi trạng thái rõ. Không đổi nội dung y khoa hay dùng detector làm clinical validation.

1. Hệ thống chung: điều khiển chính dễ chạm, nhập liệu mobile đọc được, focus và theme giữ nhất quán.
2. Atlas: tiết lộ dần cài đặt phụ, bớt lặp lựa chọn vùng, có đường tới mô hình.
3. Tư vấn: gợi ý chỉ điền bản nháp, không tự gửi; thu gọn tham chiếu phụ, nhãn ô soạn rõ.
4. Hồ sơ: tìm/xóa từ khóa rõ, số kết quả dễ hiểu, đóng form ngay tại vị trí nhập và trả focus.
5. Sổ tay: mục lục chỉ phần đang xem; phần trăm là vị trí cuộn, không xác nhận đã học/đọc; tính trong vùng cuộn thực.
6. NCSF: giải thích ba chế độ học trước đăng nhập, giữ nguyên xác thực và tính liên tục bài thi.

Kết quả và giới hạn kiểm tra được ghi riêng trong `docs/superpowers/reviews/2026-10-30-impeccable-app-upgrade.md`.
