# Bổ sung vùng đầu cho Atlas 3D

Ngày: 2026-11-05. Trạng thái: người dùng đã duyệt phạm vi sọ–mặt, hàm/răng, cơ vùng đầu và khớp hàm; toàn thân và mục Đầu & mặt riêng.

## Vấn đề đã xác định

`scripts/export_z_anatomy.py` bỏ mọi mesh thuộc collection `Head` và các mesh tên `ethmoid bone`. Vì vậy manifest 1.031 cấu trúc hiện tại không có xương sọ/mặt; không phải chỉ lỗi camera hay một lớp bị tắt. Bộ chọn vùng cũng chưa có vùng đầu. Nguồn đã ghim và bản `Startup.blend` còn ở local.

Inventory ban đầu xác định 164 đối tượng bị loại nhưng thuộc ba nhóm xuất hiện có: 70 đối tượng nhóm xương, 80 nhóm cơ–gân và 14 nhóm khớp/dây chằng. Đây là số đối tượng nguồn, không phải số xương/cơ giải phẫu độc lập; phân loại nguồn có cả sụn hoặc mạc. Số được phát hành cuối cùng phụ thuộc kiểm tra hình học và nguồn/quyền sử dụng từng nhóm.

## Phương án đề xuất

Bổ sung phần đầu tương ứng với phạm vi Atlas hệ vận động: xương sọ và mặt, hàm/răng, cơ nhai, cơ biểu cảm và các cơ vùng đầu, khớp thái dương–hàm cùng các cấu trúc liên quan có trong nguồn và đủ căn cứ để phân phối. Toàn thân sẽ có đầu ở đúng vị trí nguồn; thêm mục **Đầu & mặt** để phóng đến vùng này. Dùng nguyên hình học nguồn, không ghép đầu minh họa hoặc sinh thêm bằng AI.

Chọn phương án này thay vì chỉ thêm một khối sọ để che chỗ thiếu (không đủ thao tác học), hoặc mở rộng đồng thời sang toàn bộ não/thần kinh/mạch máu/da (vượt phạm vi các lớp Atlas hiện có). Những phần chưa có nguồn phân phối phù hợp phải được nêu rõ, không gọi là đã đủ mọi hệ cơ quan.

## Dữ liệu, nguồn và quyền sử dụng

- Giữ stable ID của 1.031 cấu trúc cũ, các correction guards và dữ liệu kiến thức hiện có.
- Kiểm tra đối tượng vùng đầu thật trong Blender, provenance/credit và các ngoại lệ giấy phép của nguồn; không coi thông báo CC BY-SA chung là bằng chứng ghi đè credit hạn chế của thành phần riêng. Rà riêng phần tai trong/xương con nếu không phân định được nguồn.
- Xuất bundle `head.glb` và toàn thân chứa đầu, giữ tọa độ/tỷ lệ nguồn. Không cần thay các vùng chi/thân/chậu nếu không bị ảnh hưởng.
- Thêm metadata và tên cho cấu trúc mới; giữ tên English/Latin nguồn. Chỗ chưa đủ đối chiếu tên Việt dùng tên nguồn rõ ràng, không tự gắn trạng thái đã thẩm định.
- Các mô hình mới có provenance/source-only tương ứng; chỉ bổ sung kiến thức giải phẫu khi có trích dẫn cụ thể và ngày đọc thực tế. Không gán cấu trúc đầu vào kiến thức lâm sàng cổ chỉ vì gần nhau.
- Đối chiếu kiến thức cơ bản với OpenStax A&P 2e §7.2 và §11.3; không diễn giải độ dày hoặc bề mặt mesh thành số đo mô thật. `reviewedBy` giữ null nếu không có review chuyên môn.

## Giao diện và tương tác

Giữ Clinical Field Notes, theme và các thao tác chọn cấu trúc, ẩn/hiện, tách riêng, tìm kiếm Việt–Anh và nguồn. Vùng Đầu & mặt có camera bao trọn vùng; toàn thân bao trọn cả đầu và chân. Có thể bật xương/cơ/khớp như các vùng hiện tại. Cập nhật những mô tả đang nói mô hình không có đầu để phản ánh đúng phạm vi mới, phân biệt Atlas đầy đủ với viewer ngữ cảnh dùng subset khác.

## Xác minh trước bàn giao

Kiểm tra tập ID nguồn/bundle/manifest khớp nhau, không mất cấu trúc cũ, các tên/correction/evidence không bị trôi; tái tạo audit hình học và CSV với số đếm thật. Thử toàn thân và vùng đầu, xoay trước/sau/trái/phải, chọn sọ/hàm/cơ nhai/khớp hàm, tìm kiếm, ẩn/hiện/tách riêng, đổi vùng và xử lý lỗi tải. Kiểm tra desktop/mobile, build/type/lint, các kiểm tra Atlas liên quan và design detector. Ghi rõ kiểm tra không chạy và giới hạn còn lại. Không suy từ test hoặc ảnh render thành xác nhận lâm sàng.

Phát hành mã/mô hình lên production là bước riêng; không tự push/deploy trong lượt chuẩn bị và kiểm tra local.
