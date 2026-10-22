# Trigger Point — sửa cách trình bày giải phẫu

Ngày: **2026-10-22**. Tiếp nối bốn phát hiện và hướng xử lý đã được người dùng đồng ý. Nhánh local: `codex/trigger-source-anatomy`.

## Đã thay đổi

- Khung chính của **Tra cứu theo cơ** dùng hình OpenStax có nhãn gốc. Các hình đã được chuẩn bị trong working tree trước lượt này; giữ nguyên nội dung lớp cơ và phạm vi nghiên cứu theo từng thành phần.
- Gỡ renderer vẽ tọa độ điểm kích hoạt, vùng đau lan và vùng tô được gắn với cơ. Đổi dấu X thành vòng hoặc thêm dấu hỏi vẫn không xác nhận vị trí; các lớp đó hiện không được vẽ. Tọa độ cũ chỉ còn dữ liệu tương thích, có chú thích rõ.
- Hình dưới gai/tròn bé hiện là khung ảnh nguồn có nhãn `Infraspinatus` và `Teres minor`, thay vì tô vùng vai ngoài trên hình nông. Không thêm đường viền giải phẫu do app tự vẽ lên hình nguồn.
- Bổ sung liên kết **Xem ảnh gốc** cho từng khung để đọc nhãn ở độ phân giải đầy đủ. Mở rộng khung bắp chân/chày trước để giữ thêm phần cơ thể, không chỉ một dải nhãn.
- **Tra cứu vùng đau** giữ tám vùng lựa chọn và hình định hướng lớp nông có ghi công, chỉ là điều hướng triệu chứng. Không hiển thị điểm TrP, cơ “thủ phạm” hoặc hình đau lan. Chọn vùng tự chuyển tới mặt trước/sau tương ứng; các vùng SVG nhận Enter/Space và có tên truy cập.
- Giữ các nhãn trung tính đã có: “Nhóm cơ để tham khảo”, “Vận động/bài tập có thể cân nhắc sau đánh giá”, không khẳng định ức chế hoặc bắt buộc kích hoạt.
- Tách `TriggerSourceAnatomy.tsx` và `TriggerPainLocator.tsx` khỏi component điều phối; giữ giao diện, màu và kiểu chữ của Kinesis Lab.

## Nguồn ảnh và giới hạn y khoa

Hai ảnh local được so lại với `imageinfo` API Commons ngày 2026-10-22:

| File | Kích thước | SHA-1 local = nguồn |
| --- | --- | --- |
| `full-body-muscles-openstax.jpg` | 1304 × 3033 | `8a3b1231f319214a74cffda6b70ff2c166e55a81` |
| `glute-deep-openstax.jpg` | 1713 × 2175 | `48a26b0c6351a2052a16c4fcd338bc092505e492` |

Đã mở lại bản ghi [hình 1105](https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg) và [hình 1122](https://commons.wikimedia.org/wiki/File:1122_Gluteal_Muscles_that_Move_the_Femur.jpg), tác giả OpenStax và CC BY 4.0. Chỉ cắt khung bằng SVG; không chỉnh pixel ảnh. Chú thích ảnh phân biệt lớp nông/sâu và liên kết nguồn được giữ.

Hình định hướng triệu chứng là [bản vẽ lại OpenStax & Tomáš Kebert & umimeto.org](https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg), CC BY-SA 4.0. Bản ghi mô tả chỉnh sửa, đặc biệt mặt sau. Hồ sơ trước có so pixel gần trùng nhưng không đủ xác định chính xác revision/rasterizer lịch sử; câu kết luận trong SOURCES.md đã được thu hẹp tương ứng.

Ngày/phạm vi đọc tài liệu y khoa trước đây (2026-10-19/20) được giữ nguyên; lượt này không tự ghi thành đã đọc lại toàn văn. Mở PubMed Delphi trực tiếp hôm nay chỉ trả phần footer, nên không ghi nhận là đã đọc lại abstract hôm nay. Các giới hạn đã đối chiếu trước đây và chính sách `docs/medical-evidence-policy.md` tiếp tục áp dụng.

**Mọi bản ghi vẫn limited, reviewedBy null.** Ảnh có nguồn và kiểm thử phần mềm không phải xác nhận y khoa độc lập. Chưa có bản đồ điểm kích hoạt/vùng đau lan theo từng cơ được chuyên gia duyệt; chưa có hướng dẫn thực hành riêng đã thẩm định cho mọi cơ thành phần. Các bài tập hiện có là ví dụ có điều kiện, không là phác đồ cá nhân.

## Kiểm chứng

- `scripts/check-trigger-presentation.mjs`: render component React thật bằng SSR; kiểm tra khung nguồn của cả 10 mục, không vẽ thêm path/circle lên hình nguồn, SHA-1 hai tài sản, không dùng sơ đồ nông trong chế độ xem cơ, không lọt nhãn khẳng định nguyên nhân/điểm TrP, giữ chế độ vùng triệu chứng/cẩm nang và liên kết ảnh gốc. Đã thấy kiểm tra thất bại trên bản còn vẽ sơ đồ nông trước khi sửa, rồi pass sau sửa.
- `scripts/check-trigger-evidence.mjs`: pass cho 10 mục cơ, 8 vùng triệu chứng và 11 bản ghi bằng chứng. Kiểm tra tọa độ legacy chỉ là kiểm tra hình học/dữ liệu, không thẩm định giải phẫu; không còn đòi parser tìm các vùng cơ đã gỡ khỏi renderer.
- `scripts/check-evidence-coverage.mjs`: pass, 1.107 mục, gồm 1.031 cấu trúc source-only, trạng thái chờ duyệt giữ nguyên.
- `npm run check:atlas-evidence`, `npm run check:training-observation`: pass.
- `npm run lint`, `npm run build`: pass, Next 16.4.1, 17 trang được tạo.
- React Doctor quét ba component: lượt đầu nhắc cấu trúc SVG chứa phần tử tương tác; đổi SVG vùng chọn sang `role=group` để các nút con có ngữ nghĩa phù hợp. Lượt cuối **No issues found**, không suppress rule.
- Review mã độc lập: không có phát hiện high/medium còn mở trong phạm vi ba component, hình cắt, attribution và kiểm tra hồi quy. Reviewer không thực hiện phê duyệt y khoa hoặc kiểm tra UI trực tiếp.

### UI thực tế qua CUA

- Chọn lần lượt cả 10 mục cơ: nút được chọn và nguồn ảnh tương ứng thay đổi đúng; hình 1105/1122 tải được. Kiểm tra trực quan khung dưới gai và khung cẳng chân.
- Chọn cả 8 vùng triệu chứng: nút được chọn và mặt trước/sau đúng. Dùng Space trên vùng SVG “Mặt ngoài gối” chuyển nội dung; Enter mở cẩm nang và chọn cơ.
- Liên kết “Xem ảnh gốc” mở được tab hình; ảnh hoàn tất tải, natural size 1304 × 3033. Đóng tab kiểm tra sau đó.
- Desktop 1280 × 900 và mobile 390 × 844. Mobile client/scroll width cùng 375 px, không tràn ngang. Giữ nút chọn và nguồn/giới hạn đọc được, không thêm chuyển động.
- Chưa giả lập lỗi tải ảnh/network hoặc chạy nhiều engine trình duyệt; thông tin cơ và liên kết nguồn vẫn là các phần riêng trong UI. Kiểm tra này không phải nghiên cứu khả dụng lâm sàng.

Ảnh bằng chứng nằm ở `assets/2026-10-22-trigger-source-anatomy/`: `desktop-infraspinatus.png`, `mobile-infraspinatus.png`, `mobile-symptom-locator.png`.

## Tiếp theo cần chuyên môn

Nếu bổ sung bản đồ điểm/vùng lan: cần nguồn vị trí cụ thể đã được đọc, hồ sơ ánh xạ từng cơ/lớp và người có chuyên môn độc lập duyệt trước khi bật renderer. Sửa hiển thị hiện tại không thay thế bước đó.
