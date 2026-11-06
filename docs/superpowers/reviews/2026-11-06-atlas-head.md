# Khôi phục vùng đầu trong Atlas 3D

Hoàn tất kiểm tra local ngày **06/11/2026**, theo [phạm vi người dùng đã duyệt](../specs/2026-11-05-atlas-head-design.md). Nguyên nhân ban đầu là bộ xuất chủ động loại collection `Head` và các đối tượng ethmoid; không phải một lớp đang tắt hay lỗi camera.

## Kết quả

- Khôi phục **158 đối tượng nguồn**: 64 thuộc nhóm hiển thị xương, 80 cơ–gân, 14 khớp/dây chằng. Có sọ, xương mặt, hàm/răng, cơ vùng đầu và các cấu trúc khớp thái dương–hàm. Các số này đếm đối tượng nguồn, không phải số xương/cơ giải phẫu độc lập.
- Toàn thân có đầu ở vị trí/tỷ lệ nguồn; thêm mục **Đầu & mặt** với bundle riêng **1.270.008 byte**. Tổng catalog: **1.189 cấu trúc**.
- Giữ nguyên byte hình học, node/mesh/accessor/material của 1.031 cấu trúc cũ bằng cách ghép thêm bundle đầu vào GLB cũ; metadata và ID cũ cũng khớp hash. Các bundle cổ/chi/thân/chậu không đổi.
- Có tìm kiếm, chọn cấu trúc, góc nhìn và ba lớp quan sát hiện có. Vùng đầu không nhận nhầm thẻ kiến thức lâm sàng cổ. Các viewer ngữ cảnh dùng toàn thân đã bỏ mô tả cũ “không có đầu”.
- 22 tên đã đối chiếu có tiếng Việt, ứng với 37 đối tượng. Các tên khác giữ English của nguồn. Sửa chính tả `Bucinator` thành `Buccinator` tại runtime cho đúng hai ID có guard; tên gốc vẫn được lưu/hiển thị riêng. Hồ sơ tên và nguồn có [bản public truy cập được](../../../public/anatomy/3d/HEAD-TERMINOLOGY.md).

## Phạm vi nguồn

Dùng cùng Z-Anatomy commit `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`, nguồn Blender local và giấy phép/credit được giữ trong public. Đã xem source ngày 05/11; ngày đó được ghim riêng với thời điểm sinh asset hoặc chạy lại audit. Không chạy script nhúng trong Blender; không sinh thêm giải phẫu bằng AI. [head-addition.json](../../../public/anatomy/3d/head-addition.json) ghi hash trước/sau, ID cũ, phần thêm và ngoại lệ.

Sáu xương con tai hai bên (`Malleus`, `Incus`, `Stapes`) thuộc Bonus collection được giữ ngoài bản xuất do chưa phân định nguồn với mô hình tai trong có credit NC-SA riêng. Không coi giấy phép chung là bằng chứng ghi đè điều kiện của thành phần đó. Não, thần kinh, mạch máu, da và các cơ quan đầu khác không thuộc lần khôi phục hệ vận động này; không tuyên bố đã đủ mọi hệ cơ quan.

CSV dẫn xuất khớp 1.181 cặp tên English/Latin, còn tám trường hợp cũ không khớp. Đây là so chuỗi, không phải kiểm định giải phẫu hoặc mã FIPAT chính thức. Cả 1.189 bản ghi hình học vẫn `source-only`; tên được đối chiếu không nâng trạng thái mesh. Không có phê duyệt chuyên gia được tạo ra, `reviewedBy: null`.

## Xác minh

- `npm run check:atlas-head`: **16/16** Node tests và script tên đầu đạt. Bao gồm giữ nguyên toàn bộ binary/metadata cũ, chọn đối tượng nguồn, bundle/manifest, vùng học, nguồn tên gốc sau hiệu chỉnh, guard và link báo cáo public.
- `npm run check:atlas-geometry`: **10/10** tests và đọc/giải mã GLB thực đạt. Tổng mới **1.599 primitives / 2.696.367 triangles**; riêng phần cũ vẫn 1.411 / 2.368.785. Độ hữu hạn tọa độ, tập ID và mười pilot cũ được kiểm riêng. Baseline version 2 vẫn giữ trong code; không thay số cũ chỉ để làm test qua.
- Learning studio **10/10**, search **10/10**, callouts **9/9**, catalog audit **6/6** đạt. Các script names, corrections, contextual anatomy, load deadline, render/material và evidence coverage đạt; coverage hiện 1.273 bản ghi gồm 1.189 catalog entries.
- TypeScript, ESLint phạm vi thay đổi, production build và `git diff --check` đạt. React Doctor không báo lỗi ở phần thay đổi; điểm không phải chứng nhận chất lượng y khoa/accessibility.
- Review độc lập không thấy lỗi ghép GLB hoặc lọc vùng đầu. Đã sửa hai phát hiện: link public trỏ ra ngoài public và tên đã sửa bị gắn nhãn tên nguồn. Recheck xác nhận đã hết phát hiện hành động trong phạm vi đó.
- Trình duyệt production local: vùng đầu tải thật; hiện sọ/hàm với nhãn; chọn xương trán và thấy hồ sơ nguồn mới; bật cơ và khớp, đổi góc bên, chọn dây chằng TMJ; toàn thân hiển thị cả đầu và bàn chân. Tìm `xuong ham duoi` trả đúng một cấu trúc Mandible và chuyển sang toàn thân theo hành vi tìm kiếm hiện có.
- Desktop **1440×900**, mobile **390×844**: mô hình đầu hiển thị đầy đủ sau khi cuộn đến canvas, body không tràn ngang. Kiểm tra là trình duyệt desktop đổi viewport, chưa phải máy di động vật lý. Ảnh ở `.data/artifacts/atlas-head-desktop.jpg`, `atlas-head-full-body.jpg`, `atlas-head-mobile.jpg`.
- URL báo cáo public trả HTTP 200. Đã trả viewport về mặc định khi bàn giao.

## Design detector và giới hạn còn lại

`npm run design:check` giữ phát hiện border-left 3px hiện có ở `globals.css:1090` và 25 advisories. Scan trang đầu render thực hoàn tất nhưng exit 2: **hai phát hiện** (Linen slate 3,5:1 trên nền canvas và nested cards), cùng **sáu advisories** về contrast/wrapping. Các token/khung này kế thừa thiết kế hiện có; không mở rộng lượt thêm dữ liệu đầu thành thay đổi palette hoặc cấu trúc toàn Atlas. Không diễn giải scan là đạt toàn bộ accessibility. Không thử đủ mọi theme, thiết bị hay mọi mesh.

Đây là bổ sung dữ liệu và thao tác học theo nguồn, không xác nhận kích thước mô, hướng sợi, chẩn đoán hay điều trị cá nhân. Không push/deploy trong lượt kiểm tra này; bản bàn giao là local.
