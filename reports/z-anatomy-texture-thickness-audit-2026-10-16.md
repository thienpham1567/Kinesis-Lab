# Kiểm tra texture và dữ liệu độ dày Z-Anatomy

Ngày: 16/10/2026. Phạm vi: dữ liệu nguồn Z-Anatomy đang dùng cho Kinesis Lab; không phải khảo sát mọi bộ dữ liệu giải phẫu trên Internet.

## Nguồn và cách kiểm tra

- Repository: https://github.com/Z-Anatomy/Models-of-human-anatomy
- Commit đang dùng và commit master tại thời điểm kiểm tra: `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`.
- Mở `Startup.blend` của `Z-Anatomy.zip` và `Z-Biomechanics.7z` bằng Blender 4.5.9, chạy nền với `--factory-startup --disable-autoexec`. Không chạy add-on nguồn, không ghi đè file Blender.
- Kiểm kê ảnh đóng gói/liên kết, node ảnh trong mọi material và node group lồng nhau; đối chiếu 1.031 cấu trúc theo ID nguồn; đọc UV, material index từng mặt, một số mẫu topology; đọc JSON của cả sáu GLB trong app.

## Kết quả

| Hạng mục | Trong nguồn | Trong GLB hiện tại |
|---|---|---|
| Ảnh mô thật / base-color photograph | Không tìm thấy. File chính chỉ có ảnh CheatSheet và các buffer Viewer/Render Result; không có Image Texture node trong toàn bộ vật liệu | 0 ảnh, 0 texture |
| Normal / roughness / displacement image maps | Không tìm thấy | Không có |
| Thickness map hoặc trường độ dày có nguồn đo đạc | Không tìm thấy tệp ảnh hoặc thuộc tính mesh tương ứng trong phần được kiểm tra | Không có; không có KHR_materials_volume |
| UV | 376/1.031 mesh có UV layer; 198 mesh có tọa độ biến thiên, 178 chỉ có tọa độ không biến thiên; 655 mesh không có UV | Không có TEXCOORD; exporter hiện đặt export_texcoords=False |
| Vật liệu theo vùng bề mặt | 33 vật liệu được tham chiếu bởi phần cơ–xương–khớp; 380 mesh thực sự dùng nhiều vật liệu trên các mặt khác nhau | Đã gộp theo 3 lớp cơ, xương và khớp |
| Tham số subsurface trong shader | Có ở Cartilage, Tendon, Ligament, Fat khi mở bằng Blender 4.5.9; đây là thiết lập shader, chưa có chứng cứ là số liệu quang học đo thực nghiệm | Chưa chuyển sang shader web |

Gói Z-Biomechanics: 8 vật liệu, không có image datablock và không có Image Texture node. Archive không chứa bộ ảnh texture mô riêng.

Lưu ý: tọa độ UV biến thiên không chứng minh UV đã được unwrap tốt, không overlap hoặc sẵn sàng để bake. Tên node group CrossSectionControllerGroup có chữ trùng với chuỗi tìm kiếm SSS nhưng dùng cho mặt cắt, không phải một thickness map.

## Những chi tiết nguồn có thể tận dụng ngay

- Femur trái/phải: mỗi bên có 2.966 mặt Bone và 820 mặt Cartilage.
- Gluteus medius trái/phải: mỗi bên có 4.374 mặt cơ và 802 mặt Tendon.
- Hip bone trái/phải: mỗi bên có các vùng Bone-7, Bone-1, Bone-6 và 200 mặt Cartilage.
- Gluteus maximus trái/phải: mỗi bên có một vùng Extension; không có UV layer trong các mẫu này.

Các số trên là mặt polygon trong Blender, không phải số tam giác sau xuất glTF.

Mười mẫu gồm sụn viền ổ cối, xương đùi, cơ mông lớn/nhỡ và xương chậu hai bên đều có 0 cạnh hở và 0 cạnh không manifold. Đây là tín hiệu thuận lợi để thử bake độ dày từ hình học trên các mẫu đó, không phải kết luận toàn bộ 1.031 mesh đều sẵn sàng. Chưa kiểm tra đầy đủ tự giao nhau, hướng pháp tuyến hoặc độ chính xác sinh học.

## Ý nghĩa đối với app

1. Có thể tăng độ chân thực trước bằng cách giữ material index của từng mặt, phân biệt gân–cơ và sụn–xương, rồi chuyển các giá trị vật liệu sang PBR web. Đây là dữ liệu thật sự có trong nguồn nhưng lần xuất hiện tại đã giản lược.
2. Chưa có bộ texture ảnh mô thật và thickness map đồng bộ để cắm trực tiếp vào Three.js. Muốn thêm chúng cần unwrap/kiểm tra UV, tạo hoặc tìm dữ liệu ảnh phù hợp và đối chiếu từng cấu trúc.
3. Độ dày bake từ mesh là dữ liệu suy ra từ hình học mô hình; không phải độ dày đo từ mẫu mô hay bệnh nhân. Không nên đặt tên hoặc mô tả như số liệu đo thật.
4. `thickness: 0.008` trong `studio-renderer.ts` là tham số của hiệu ứng GTAO, không phải độ dày mô. Grain trong `tissue-materials.ts` chỉ là biến thiên bề mặt mang tính thẩm mỹ.

Cuộc kiểm tra này không thay đổi mô hình hay giao diện của app.

## Tệp bằng chứng cục bộ

- `.data/z-anatomy/material-audit.json`: ảnh, vật liệu/node, UV và attributes của phần nguồn đang dùng.
- `.data/z-anatomy/biomechanics-material-audit.json`: kiểm kê gói Z-Biomechanics.
- `.data/z-anatomy/surface-data-audit.json`: phân bố vật liệu trên mặt và topology các mẫu.
- Script kiểm kê nằm trong `.data/z-anatomy/audit-*.py`; thư mục này được Git bỏ qua.

SHA-256 nguồn:

- `Startup.blend`: `9f08a17ea0115fed80b2a73ecdf0a1bc2ab2f6956f37c593ce23d513ea35afcd`
- `Z-Anatomy.zip`: `e029688545627bd0214b269e1063143abb580aad72b2c2445d6d8a9a0d9da736`
- `Z-Biomechanics.7z`: `0a74b2fa3c47db925b06241fa38c89b0811e58a78ee28ec440cd460e279cf22b`
