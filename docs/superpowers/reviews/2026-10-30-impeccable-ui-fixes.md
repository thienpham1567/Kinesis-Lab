# Impeccable — xác minh các bản sửa UI

Ngày: **2026-10-30**. Tiếp nối [audit ban đầu](2026-10-30-impeccable-audit.md). Người dùng đã yêu cầu sửa ba nhóm vấn đề trong audit.

## Thay đổi

- Bộ chọn màu dùng `select` native có label “Bảng màu”, giữ vòng màu và đủ 13 theme. Trình duyệt quản lý popup, bàn phím và focus; bỏ listbox tự viết và CSS không còn dùng.
- ThemeProvider dùng `useSyncExternalStore` với snapshot server mặc định, sau hydration đọc theme do bootstrap áp dụng. Điều này giải quyết lệch giá trị picker sau reload, cảnh báo hydration và lỗi lint `set-state-in-effect`. Listener được gỡ khi unmount. Nếu ghi storage bị từ chối, theme vẫn đổi trong phiên hiện tại.
- Nhãn điều hướng mobile và chú thích chức năng đã kiểm tra tăng từ 10px lên 12px. Eyebrow/section-number dùng chung tăng từ 10px lên 11px. Chú thích ví dụ Sổ tay và hướng dẫn phím ở form Tư vấn dùng 12px.
- Nhãn “Cách đọc bằng chứng” dùng `text-ink` thay vì `text-cleared`, giữ nguyên câu chữ và trích dẫn.

## Xác minh tương tác

Kiểm tra trên Chrome/macOS qua CUA, gồm input hệ điều hành cho popup native:

| Thao tác | Kết quả |
| --- | --- |
| Mở picker, Down, Enter | Đổi Ocean Blue Serenity sang Warm Neutral Tones; theme và select đều là `canopy`; focus giữ ở select |
| Mở lại, Down, Escape | Hủy lựa chọn tạm, vẫn `canopy`; focus vẫn ở select |
| Tải lại với theme đã lưu | Theme trang và giá trị select đều khôi phục `canopy` |
| Tab từ picker trên Atlas mobile | Đi tiếp tới nút “Giải phẫu 3D”, không kẹt trong picker |
| Chọn lần lượt 13 theme | Tên lựa chọn và theme trang cập nhật; hoàn nguyên `tide` sau kiểm tra |
| Console sau sửa và tải trang | Không có error trong lượt kiểm tra cuối |

Trước sửa đã tái hiện lỗi phím Down của listbox và nhãn màu cũ. Kiểm tra lưu theme phát hiện cảnh báo hydration và select lệch với màu trang; đã sửa rồi xác minh lại. Synthetic keyboard của browser bridge không điều khiển được popup native macOS nên phần phím mũi tên/Enter/Escape được xác minh bằng native app API; không coi lần bridge không thao tác được là một kiểm tra đạt.

## Tương phản nhãn bằng chứng

Đo computed text/background của cùng nhãn qua 13 theme; tính luminance sRGB, xử lý cả `rgb()` và `color(srgb ...)`. Theme mặc định tăng từ **3.5308:1** lên **18.0518:1**. Kết quả thấp nhất trong các theme là **6.2376:1**.

| Theme | Tỷ lệ |
| --- | ---: |
| tide | 18.05:1 |
| pacific | 16.83:1 |
| canopy | 10.35:1 |
| sunny-beach | 9.70:1 |
| summer-ocean | 12.36:1 |
| earthy-forest | 8.39:1 |
| olive-garden | 12.55:1 |
| summer-fun | 13.39:1 |
| autumn-glow | 13.58:1 |
| black-gold | 15.97:1 |
| deep-sea | 17.47:1 |
| earthy-green | 10.26:1 |
| fresh-greens | 6.24:1 |

Đây là phép đo nhãn vừa sửa, không phải xác nhận mọi phần tử của cả 13 theme đều đạt accessibility.

## Bố cục và detector

Quan sát Atlas ở 1280×800 và 390×844. Ở mobile: page width = viewport width = **390px**; năm nhãn điều hướng là **12px**, mỗi link cao **48px**, rộng khoảng **71.6px**. Không thấy tràn ngang trong trạng thái đã kiểm tra. Các nhãn chức năng chính vẫn nằm trong viewport.

Quét lại cùng 5 route ở desktop/mobile bằng Impeccable engine 0.1.18. Tất cả lệnh quét hoàn tất; source/desktop/mobile có exit code 2 do còn cảnh báo kiểu dáng, không có exit code 1.

| Phạm vi | Primary trước | Primary sau | Advisory sau |
| --- | ---: | ---: | ---: |
| Source | 1 | 1 | 0 |
| Atlas desktop | 6 | 1 | 1 |
| Atlas mobile | 11 | 1 | 1 |
| Sổ tay desktop | 25 | 1 | 0 |
| Sổ tay mobile | 30 | 1 | 4 |
| Tư vấn desktop | 5 | 3 | 0 |
| Tư vấn mobile | 11 | 4 | 1 |
| Học viên desktop | 3 | 1 | 0 |
| Học viên mobile | 8 | 1 | 0 |
| NCSF desktop | 1 | 0 | 0 |
| NCSF mobile | 6 | 0 | 0 |
| **Tổng** | **107** | **14** | **7** |

Đã loại bỏ **93 lượt cảnh báo primary**. Không còn `undersized-ui-text`, `tiny-text` hoặc `low-contrast` trong các snapshot quét lại. Đây là lượt cảnh báo lặp theo phần tử/viewport, không phải số lỗi duy nhất hay điểm chứng nhận.

Còn lại `nested-cards`, `kicker-above-heading`, `icon-tile-stack`, một cảnh báo `line-length`, advisory wrapping và source false positive `side-tab` trên Markdown blockquote. Giữ chúng như audit đã phân loại; không xóa nội dung, đổi bố cục ngoài phạm vi hoặc thêm ignore để làm sạch số đếm.

## Kiểm tra mã

- `npx tsc --noEmit`: đạt.
- `npm run build`: đạt, production compile/TypeScript và sinh 21 static pages hoàn tất.
- `npm run lint`: exit 0, **0 error**, còn 2 warning biến không dùng trong script local `.data/ncsf/review-2026-10-27/analyze-coverage.mjs` có từ trước.
- React Doctor: quét 6 file thay đổi, không báo issue. Không coi điểm số công cụ là chứng nhận chất lượng.
- Review độc lập các file UI sửa: không phát hiện vấn đề cần xử lý.
- `git diff --check`: đạt.

Không thêm dependency, không sửa nội dung/nguồn y khoa hoặc dữ liệu riêng tư. Chưa kiểm tra thiết bị cảm ứng thật, screen reader và mọi trạng thái mở rộng. Browser measurements và screenshots là bằng chứng UI, không phải clinical validation.

## Tài liệu kỹ thuật

Theme hydration dùng server snapshot đồng nhất rồi subscribe vào trạng thái browser, theo [React — useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) (đọc 2026-10-30). Các API Next/CSS đối chiếu tài liệu cài cùng Next 16.4.1 trong `node_modules/next/dist/docs/`.

Raw JSON, phép đo và ảnh lưu local (gitignored) trong `.impeccable/review/2026-10-30-fixes/`: `source.json`, `desktop.json`, `mobile.json`, `theme-contrast.json`, `atlas-mobile.png`, `atlas-desktop.png`, `movement-evidence.png`, `build.txt`.
