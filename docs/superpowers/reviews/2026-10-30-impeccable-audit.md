# Kiểm tra UI ban đầu bằng Impeccable

Ngày kiểm tra: **2026-10-30**. Mã app làm mốc: `541aea7`. Người dùng chọn **tích hợp và kiểm tra trước**; không sửa UI trong lượt này.

## Phạm vi và phương pháp

- Impeccable skill `4.8.0`, engine `0.1.18`, upstream commit `02523aec3e4c4580102d996d1b6a71fbe062e03f`.
- Source scan: toàn bộ `src/`, không quét `.env`, tài liệu riêng hay dependency/vendor.
- Rendered scan: `/atlas`, `/movement`, `/consult`, `/clients`, `/knowledge`, ở **1280×800** và **390×844**, theme mặc định `tide`.
- Quét URL bằng Chromium do engine khởi chạy. Quan sát và kiểm tra bàn phím bổ sung bằng trình duyệt trong app qua CUA.
- Quan sát trực tiếp Atlas ở cả hai kích thước. Đọc computed style ở Sổ tay để đối chiếu cảnh báo màu.
- Chỉ kiểm tra trạng thái mặc định. Không đăng nhập NCSF, gửi chat tới AI, tạo hồ sơ học viên hoặc chỉnh dữ liệu.
- Chưa kiểm tra đủ 13 theme, toàn bộ tab/bài học/chi tiết, screen reader, zoom 200%, cử chỉ cảm ứng, thiết bị thật, Core Web Vitals hay production build.

## Kết quả detector

Số đếm là **lượt cảnh báo**, không phải số lỗi duy nhất. Một phần tử có thể bị nhiều rule đánh dấu và xuất hiện lại ở hai kích thước. Tất cả lệnh dưới đây kết thúc với exit code **2**: quét hoàn tất, có finding; không có lỗi quét exit code 1.

| Phạm vi | Primary | Advisory |
| --- | ---: | ---: |
| Source `src/` | 1 | 0 |
| Atlas, desktop | 6 | 1 |
| Atlas, mobile | 11 | 1 |
| Sổ tay vận động, desktop | 25 | 1 |
| Sổ tay vận động, mobile | 30 | 5 |
| Tư vấn, desktop | 5 | 0 |
| Tư vấn, mobile | 11 | 1 |
| Học viên, desktop | 3 | 0 |
| Học viên, mobile | 8 | 0 |
| NCSF, desktop | 1 | 0 |
| NCSF, mobile | 6 | 0 |
| **Tổng lượt cảnh báo** | **107** | **9** |

Raw JSON được lưu local trong `.impeccable/review/2026-10-30/` (gitignored): `source.json`, `atlas-desktop.json`, `atlas-mobile.json`, `routes-desktop.json`, `routes-mobile.json`. Có thể tái chạy theo `docs/impeccable.md`; font, thời điểm tải và trạng thái UI có thể làm số đếm thay đổi.

## Nhận định về tính nhất quán

App có hệ thống thiết kế nhận diện được: font Việt/mono, token màu, thanh điều hướng dùng chung, panel và mẫu tiêu đề thống nhất. Những rule như `nested-cards`, `kicker-above-heading`, `icon-tile-stack` là tín hiệu cần xem xét trong ngữ cảnh, không tự chứng minh giao diện sai hoặc khó dùng.

Không chấm tổng điểm chất lượng/20: phạm vi hiện tại chưa đủ để xác nhận accessibility hoặc hiệu năng toàn app. Bảng này ghi độ bao phủ thay cho một điểm số có vẻ chính xác nhưng thiếu căn cứ:

| Mảng | Bằng chứng hiện có | Phần còn thiếu |
| --- | --- | --- |
| Accessibility | Rendered scan, màu chữ/nền, bàn phím bộ chọn theme | Screen reader, zoom, mọi trạng thái tương tác |
| Performance | App chạy local, Atlas tải được mô hình trong lần quan sát | Production profiling, CWV, thiết bị yếu |
| Theming | Token nguồn và theme mặc định | Kiểm tra tương phản/tương tác đủ 13 theme |
| Responsive | 5 route ở hai viewport; quan sát Atlas trực tiếp | Thiết bị thật, gesture cảm ứng, trạng thái mở rộng |
| Implementation integrity | Source detector và đối chiếu một số cảnh báo | Review toàn bộ component/flow |

## Vấn đề đã đối chiếu

### [P1] Nhãn bằng chứng thiếu tương phản trên Sổ tay

- **Vị trí:** `src/components/movement/MovementTopic.tsx:332`, nhãn “Cách đọc bằng chứng”, lặp lại hai lần trong bài mặc định.
- **Nhóm:** Accessibility / Theming.
- **Bằng chứng:** detector báo `low-contrast` trên desktop và mobile. Computed style xác nhận chữ `rgb(10, 147, 150)` trên tổ tiên có nền `rgb(255, 248, 234)`; tỷ lệ tính theo luminance sRGB là **3.5308:1**. Chữ hiện tại 10px, không thuộc nhóm chữ lớn.
- **Ảnh hưởng:** nội dung giúp người học phân biệt cách hiểu bằng chứng khó đọc hơn đối với người có thị lực kém.
- **Đối chiếu:** [W3C WCAG 2.2, SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) yêu cầu tối thiểu 4.5:1 cho chữ thông thường; đọc ngày 2026-10-30.
- **Đề xuất:** dùng token chữ có tương phản phù hợp cho nhãn này, đo lại trên từng theme. Không xóa hay rút gọn nội dung bằng chứng để tránh cảnh báo.
- **Lệnh phù hợp:** `$impeccable harden` phần nhãn bằng chứng, sau đó `$impeccable audit`.

### [P2] Bộ chọn bảng màu thiếu hành vi bàn phím của listbox

- **Vị trí:** `src/components/ThemePicker.tsx:24` và `:65`.
- **Nhóm:** Accessibility / Implementation integrity.
- **Bằng chứng:** mở picker giữ focus ở trigger; `Down` không đưa focus vào danh sách. `Tab` tới option Ocean Sunset rồi `Down` vẫn giữ focus ở option đó. `Escape` đóng danh sách nhưng focus rơi về trang. Mã nguồn chỉ xử lý Escape; chưa có điều hướng Arrow, quản lý focus option hoặc khôi phục focus trigger khi option bị tháo khỏi DOM.
- **Ảnh hưởng:** người dùng bàn phím gặp hành vi khác với role `listbox` được công bố và mất vị trí thao tác khi đóng.
- **Giới hạn:** các option vẫn có thể nhận focus bằng Tab; chưa kết luận bộ chọn hoàn toàn không dùng được bằng bàn phím.
- **Đối chiếu:** [W3C APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) mô tả điều hướng bằng phím lên/xuống và focus option; đọc ngày 2026-10-30. APG là hướng dẫn mẫu tương tác, không tự nó là kết quả đánh giá tuân thủ WCAG.
- **Đề xuất:** chọn mẫu điều khiển phù hợp (native select hoặc listbox đầy đủ), quản lý focus và kiểm tra mở/chọn/đóng bằng bàn phím.
- **Lệnh phù hợp:** `$impeccable harden` bộ chọn bảng màu.

### [P2] Nhãn điều hướng và chú thích chức năng đang ở 10px

- **Vị trí:** `src/components/AppShell.tsx:168`, `src/app/globals.css:668`, `src/components/movement/MovementTopic.tsx:50`.
- **Nhóm:** Accessibility / Typography.
- **Bằng chứng:** rendered detector bắt 5 nhãn thanh điều hướng mobile ở 10px; một số nhãn Atlas và chú thích “Ví dụ / quy ước của app” cũng 10px. Đã quan sát thanh điều hướng ở 390px.
- **Ảnh hưởng:** nhãn thao tác và giới hạn nội dung dễ bị bỏ qua vì nhỏ, đặc biệt trên mobile.
- **Giới hạn:** ngưỡng 11px là tiêu chí chất lượng của Impeccable, **không phải** kích thước tối thiểu do WCAG quy định. Không gọi mọi nhãn 10px là một vi phạm WCAG.
- **Đề xuất:** rà lại kích thước/line-height theo vai trò, ưu tiên nhãn điều hướng và chú thích bằng chứng; kiểm tra bố cục sau thay đổi.
- **Lệnh phù hợp:** `$impeccable typeset`, tiếp theo `$impeccable adapt` ở mobile.

## Cảnh báo chưa coi là lỗi đã xác nhận

- **`side-tab` trong source:** trỏ tới `src/app/globals.css:1162`, selector `.md-answer blockquote`. Đây là đường phân biệt trích dẫn Markdown, không phải viền trang trí một bên card như mô tả của rule. Ghi nhận là **false positive theo ngữ cảnh**; không sửa và không tắt rule toàn project.
- **`nested-cards`:** Atlas và Tư vấn có vùng công cụ/nội dung lồng nhau. Chỉ làm phẳng nếu review luồng cụ thể cho thấy gây khó hiểu; không bỏ nhóm công cụ chỉ để giảm số đếm.
- **`kicker-above-heading`, `icon-tile-stack`:** liên quan kiểu trình bày hiện có. Chưa có bằng chứng chúng cản trở nhiệm vụ người dùng.
- **`line-length`:** detector báo khoảng 175 ký tự trên dòng ở một ghi chú nguồn Sổ tay desktop. Cần xem lại vùng đọc và khả năng xuống dòng trước khi quyết định thay đổi.
- **[P3] `straggler`:** có dòng cuối một từ ở một số đoạn. Chỉ cân nhắc typography/wrapping; không tự sửa nội dung y khoa hoặc bỏ giới hạn nguồn cho đẹp bố cục.

## Điểm đang hoạt động

- Atlas render được ở desktop và mobile. Tại viewport 390px, `document.documentElement.scrollWidth` là 390px; kiểm tra phần tử trong `main` không thấy phần tử vượt mép phải trong trạng thái đã quan sát.
- Điều hướng desktop chuyển thành thanh dưới trên mobile.
- Skip link, tên điều khiển, `aria-current` và focus ring đã có trong shell; chưa đánh giá đủ để chứng nhận tất cả đều đạt accessibility.
- Escape đóng được bộ chọn theme; vấn đề còn lại là focus và điều hướng option.
- Nguồn và giới hạn kiến thức vẫn hiện trên các trang đã xem.

## Kiểm tra tích hợp

- Launcher chạy được sau khi khôi phục executable bit mà trình tải ZIP không giữ lại. Engine `0.1.18` tải qua launcher có manifest checksum.
- `impeccable context --target src/components/AppShell.tsx` nhận đúng project và nhận diện hệ thống UI hiện có. Thiếu `PRODUCT.md`/`DESIGN.md` không chặn audit hẹp theo directive `SCOPED_EXISTING_ALLOWED`; chưa chạy quy trình init/document hay hook tự động.
- `npx eslint eslint.config.mjs` đạt. Chỉ loại thư mục script Impeccable đã vendor khỏi lint của app, vì đây là công cụ upstream có môi trường riêng.
- `npm run lint` **chưa đạt**: 1 lỗi `react-hooks/set-state-in-effect` tại `src/components/ThemeProvider.tsx:46`; 2 warning biến không dùng trong script local `.data/ncsf/review-2026-10-27/analyze-coverage.mjs`. `ThemeProvider.tsx` không đổi so với HEAD; đây là lỗi nền được phát hiện khi kiểm tra, không được sửa trong phạm vi lượt này.
- Không chạy production build hay kiểm tra lâm sàng: lượt này chỉ thêm tooling/docs/config, không thay đổi runtime app, dependency hoặc nội dung y khoa.

## Thứ tự đề xuất cho lượt chỉnh UI sau

1. **[P1] `$impeccable harden`:** tương phản nhãn bằng chứng trong Sổ tay, kiểm tra các theme.
2. **[P2] `$impeccable harden`:** bàn phím/focus bộ chọn theme.
3. **[P2] `$impeccable typeset` + `$impeccable adapt`:** nhãn mobile và chú thích chức năng.
4. **[P3] `$impeccable polish`:** rà wrapping và nhóm panel sau khi các vấn đề thao tác đã được xử lý.

Có thể thực hiện từng mục hoặc nhóm mục theo phạm vi người dùng chọn; chạy lại `$impeccable audit` sau sửa. Không đổi nội dung, metadata phê duyệt hay giới hạn bằng chứng nhằm làm đẹp kết quả UI.
