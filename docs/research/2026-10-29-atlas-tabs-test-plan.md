# Test plan — Huấn luyện PT và Trigger Point

Ngày chạy lại: 2026-10-29. Mở `http://localhost:3000` (không dùng `127.0.0.1`, vì trang dev không hydrate).

Toàn bộ 13 bài tập trên tab **Huấn luyện PT** (`?tab=hypertrophy`) dùng mô hình cơ–xương nguyên người (`full.glb`), đánh dấu nhóm cơ của bài. Màu đánh dấu không phải EMG; mô hình không thể hiện lực hay chuyển động bài tập. Trigger Point không vẽ tọa độ điểm kích hoạt.

## Lệnh tự động

```bash
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-arm-motion.mjs
node scripts/check-curl-policy.mjs
node scripts/check-contextual-anatomy.mjs
```

| Lệnh | Kết quả 2026-10-29 |
| --- | --- |
| `check-arm-motion.mjs` | Đạt. Spec trục/góc hai bài tay vẫn nguyên vẹn. |
| `check-curl-policy.mjs` | Đạt. Nhãn pha cuốn tay vẫn là `Gập khuỷu` / `Hạ có kiểm soát`. |
| `check-contextual-anatomy.mjs` | Đạt. Toàn thân dùng bundle `full`, không cắt cơ ngoài case khi xem hai bên, vẫn ẩn bên kia, khung vùng cũ và bài tập ngực giữ bundle vùng. |

## Huấn luyện PT (`?tab=hypertrophy`)

| ID | Việc cần thấy | Kỳ vọng | Kết quả |
| --- | --- | --- | --- |
| HT-01 | Tất cả 13 bài tập (`incline-db-press`, `cable-chest-fly`, `cable-lateral-raise`, `neutral-lat-pulldown`, `chest-supported-tbar-row`, `bayesian-incline-curl`, `overhead-cable-triceps`, `cable-rope-crunch`, `heel-elevated-hack-squat`, `romanian-deadlift-seated-curl`, `glute-bulgarian-split-squat`, `barbell-hip-thrust`, `standing-seated-calf-raise`) | Đều mở `TrainingAnatomyViewer` nguyên người (`full.glb`), stage cao `640px`, tùy chọn đầu tiên là `Các nhóm của bài`, ẩn checkbox `Toàn bộ cơ trong vùng`, không mở khung chỉ có cánh tay hay nút `Bản mẫu chuyển động`. | Đạt cả 13/13 bài. Chỉ tải `full.glb`, số cấu trúc cơ khớp từng bài (8 → 46 cấu trúc). |
| HT-02 | Lọc `Nhóm cơ quan sát` trong bài | Đổi từ `Các nhóm của bài` sang từng nhóm cơ của bài thì danh sách cấu trúc thu hẹp đúng nhóm đó, vẫn giữ mô hình nguyên người. | Đạt. Ví dụ `bayesian-incline-curl`: `all` = 14 cấu trúc, `biceps_forearm` = 8, `deltoids` = 6. |
| HT-03 | Chọn cấu trúc cơ, `Tập trung`, `Tách riêng`, `Về nhóm cơ` | Chọn cơ hiện thẻ `Đang chọn` và link `Tra cứu nhóm & bài liên quan →`. Bấm `Tách riêng` báo `Đang tách riêng cấu trúc` (`aria-pressed="true"`). Bấm `Về nhóm cơ` trả lại tổng số cấu trúc của nhóm. | Đạt. |
| HT-04 | 6 góc nhìn, `Chất lượng`, `Xương làm mốc` | 6 nút góc nhìn (`3/4 trước`, `3/4 sau`, `Trước`, `Sau`, `Trái`, `Phải`), đổi chất lượng (`Tự động` / `Chi tiết` / `Nhanh`), bật/tắt `Xương làm mốc`. | Đạt. |
| HT-05 | Chế độ `Cơ → Bài tập` (`?tab=hypertrophy&muscle=...`) | Mở `ContextualAnatomyViewer` theo vùng của nhóm cơ, vẫn có checkbox `Cấu trúc xung quanh`, danh sách bài tập liên quan nhảy lại sang bài tập nguyên người. | Đạt. |
| HT-06 | Tìm bài tập và lọc `Nhóm chuyển động` | Lọc `Push` còn 3 kết quả; tìm `squat` còn 2 kết quả; xóa lọc trả về 13 kết quả. | Đạt. |
| HT-07 | `Ghi bài này` | Mở khối chọn học viên (`aria-expanded="true"`), không làm mất mô hình nguyên người `640px`. | Đạt. |
| HT-08 | Nguồn bài và giới hạn y khoa | Có câu: `Hình là toàn bộ hệ cơ–xương của atlas. Cơ của bài được đánh dấu. Không có đầu, da, nội tạng. Màu đánh dấu không đo hoạt động cơ; mô hình không thể hiện lực hay chuyển động bài tập.` | Đạt trên cả 13/13 bài. |

## Trigger Point (`?tab=trigger_points`)

| ID | Việc cần thấy | Kỳ vọng | Kết quả |
| --- | --- | --- | --- |
| TP-01 | Tra cứu theo cơ, mặc định Dưới gai | Cả người cơ–xương, cao 640px, bundle `full.glb`. Danh sách chỉ cơ của case, xương và cơ bật, khớp tắt, không có `Cấu trúc xung quanh`. | Đạt. |
| TP-02 | Nguồn mô hình | Có câu toàn bộ hệ cơ–xương, không đầu/da/nội tạng, không phải vị trí điểm kích hoạt. Có câu không hiện tọa độ điểm kích hoạt. | Đạt. |
| TP-03 | Đổi sang Bắp chân & Dép | Vẫn `full.glb`, stage 640px, dropdown chuyển sang cơ bắp chân của case. | Đạt. |
| TP-04 | `Hai bên` / `Bên trái` / `Bên phải` | Dưới gai: `Hai bên` = 4 cấu trúc, `Bên trái` = 2 cấu trúc, `Bên phải` = 2 cấu trúc. | Đạt. |
| TP-05 | Chọn cấu trúc, `Tập trung`, `Cô lập`, `Đặt lại` | Chọn cấu trúc rồi bấm `Cô lập` bật `aria-pressed="true"`; bấm `Đặt lại` tắt cô lập. | Đạt. |
| TP-06 | Lọc nhóm cơ (`Cổ – Vai – Đai vai`, `Thân mình`, `Hông – Gối – Cổ chân`, `Tất cả (10)`) | Bấm nhóm đổi trạng thái `aria-pressed="true"`, bấm `Tất cả (10)` trả lại toàn bộ 10 case. | Đạt. |
| TP-07 | Tra cứu vùng đau (`Mặt trước vai`, `Gót chân`) | Đổi vùng đau cập nhật tiêu đề `3D · Giải phẫu vùng · Mặt trước vai` → `3D · Giải phẫu vùng · Gót chân`, giữ nguyên mô hình toàn thân 640px. | Đạt. |
| TP-08 | Cẩm nang sờ nắn | Không có viewer 3D. Có giới hạn sờ nắn và dấu hiệu cần khám. | Đạt. |
| TP-09 | Nhảy qua lại giữa cơ và vùng đau | Từ cơ Dưới gai bấm `Mặt trước vai →` nhảy sang vùng đau Mặt trước vai; từ vùng đau Gót chân bấm `Bắp chân & Dép →` nhảy về cơ `3D · Bắp chân & Dép`. | Đạt. |

## Hồi quy quanh hai tab

| ID | Việc cần thấy | Kỳ vọng | Kết quả |
| --- | --- | --- | --- |
| RG-01 | `/atlas?tab=clinical_rehab` | Viewer vùng, có `Cấu trúc xung quanh`, không có câu toàn thân của bài tập hay trigger point, không stage 640px. | Đạt. |
| RG-02 | Script kiểm tra vùng | `check-contextual-anatomy.mjs` pass toàn bộ 10 nhóm trigger, 11 nhóm training, 8 vùng. | Đạt. |
