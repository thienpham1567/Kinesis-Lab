# Thuật ngữ Kinesis Lab

Phạm vi hiện tại: giáo án và nhật ký buổi tập trong hồ sơ học viên. Xem [quy tắc lưu và xác minh](docs/training-program-storage.md) và [chính sách bằng chứng](docs/medical-evidence-policy.md#training-program-workflow--2026-11-06).

## Soạn và áp dụng giáo án

**Giáo án**: Nội dung tập dự kiến cho một học viên, gồm mục tiêu, lịch tuần và thông số dự kiến cho các bài tập.

**Bản đang soạn**: Nội dung có thể chỉnh sửa trong trình soạn, bắt đầu từ bản mới, phiên bản đã lưu hoặc đề xuất AI. Các chỉnh sửa chỉ trở thành một phiên bản mới khi PT lưu.

**Đề xuất AI**: Nội dung do AI tạo để PT xem trước. Đưa đề xuất vào trình soạn là thay bản đang soạn, chưa lưu hay áp dụng giáo án.

**Phiên bản giáo án đã lưu**: Một lần lưu có số phiên bản riêng của học viên, với nội dung được giữ nguyên để xem lại và đối chiếu. Phiên bản mới mang trạng thái “Bản nháp” cho đến khi PT đổi trạng thái; cụm “bản đang soạn” chỉ nội dung trong trình soạn.

**Giáo án đang áp dụng**: Phiên bản đã lưu mà PT chọn làm giáo án hiện hành; mỗi học viên có tối đa một phiên bản ở trạng thái này. “Đang áp dụng” là trạng thái trong app, không phải xác nhận y khoa.

**Ngữ cảnh nguồn của đề xuất**: Các hồ sơ nguồn đã cung cấp cho AI khi tạo đề xuất. Việc đính kèm nguồn không xác nhận từng nhận định hay tính phù hợp với học viên.

## Lịch và kết quả tập

**Buổi trong giáo án**: Một mục trong lịch tuần của phiên bản giáo án, gồm các bài tập, số hiệp và thông số dự kiến.

**Buổi tập**: Lần thực hiện một buổi trong giáo án vào một ngày cụ thể, có thể được lưu ở trạng thái đang thực hiện hoặc đã hoàn thành. Bản ghi lưu lại nội dung dự kiến của buổi gốc để có thể đối chiếu sau khi đổi giáo án.

**Hiệp theo giáo án**: Một hiệp dự kiến của một bài trong buổi, với số lần, tải và các thông số theo giáo án.

**Kết quả từng hiệp**: Số lần, tải và trạng thái hoàn thành do PT ghi cho một hiệp trong buổi tập. Các giá trị dự kiến trong giáo án không được tính là kết quả đã thực hiện.
