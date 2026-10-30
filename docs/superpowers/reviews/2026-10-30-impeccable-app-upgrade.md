# Nâng cấp Kinesis Lab bằng Impeccable — 30/10/2026

## Căn cứ và phương pháp

Người dùng yêu cầu đọc tài liệu từng lệnh tại [pbakaus/impeccable](https://github.com/pbakaus/impeccable), liệt kê khả năng áp dụng và nâng cấp app. Người dùng chọn **cân bằng học tập và tư vấn**. [Bảng đối chiếu đủ 24 lệnh](../../research/2026-10-30-impeccable-applicability.md) ghi nguồn upstream cố định và phạm vi từng lệnh. Bản đang cài có cùng nội dung các playbook đã đối chiếu; không cài lại skill hoặc thêm dependency.

Method: dual-agent (A: `/root/impeccable_design_review` · B: `/root/impeccable_technical_review`). A xem UX trước khi root nhận kết quả detector từ B. Hai agent không đọc kết quả của nhau; dùng tab kiểm tra riêng theo lượt. Root tổng hợp và thực hiện, rồi có review mã độc lập `/root/upgrade_code_review`.

Target: các route `/atlas`, `/consult`, `/clients`, `/movement`, `/knowledge` và component chung. Nền tảng web, chế độ Operate/Read. Giữ Clinical Field Notes, tiếng Việt, Be Vietnam Pro/IBM Plex Mono và 13 theme. Không thay nguồn, ngày đối chiếu y khoa, renderer/mesh, nội dung chuyên môn hoặc xác thực riêng tư.

## Vấn đề đã xác nhận và thay đổi

| Trước | Thay đổi | Xác minh |
| --- | --- | --- |
| Ô tư vấn bắt đầu y894 và nút gửi y1023 tại 390×844 | Thu gọn tham chiếu giải phẫu bằng disclosure, bỏ khoảng trống mở đầu, đặt gợi ý bản nháp sau ô soạn | Bản production: textarea y593.5, cao80; nút Phân tích y722.5, cao44, trước thanh điều hướng dưới. |
| Phiên trống chỉ hướng dẫn gõ một câu hỏi tổng quát | Ba gợi ý: phân tích bài tập, chuẩn bị tư vấn, đọc hiểu y văn | Chọn gợi ý điền textarea và focus, không gọi chat API; khi có bản nháp thì ẩn gợi ý để tránh ghi đè. |
| Form học viên nhận focus nhưng nút đóng ở đầu trang, ngoài vùng nhìn | Thêm Đóng biểu mẫu ngay phần đầu form, aria-controls, trả focus về nút mở; giữ dữ liệu khi thu gọn | Test handler và trình duyệt: nhập bản nháp giả, đóng/mở lại còn nguyên; không gửi form. |
| Số kết quả chỉ có hai con số, không có nút xóa tại ô tìm | Bổ sung đơn vị hồ sơ, trạng thái tải/lỗi, nút xóa và focus trở lại ô tìm | Trình duyệt xác nhận từ khóa trống sau xóa và focus ở client-search. Ẩn nút clear của WebKit để không có hai dấu x. |
| Hồ sơ thiếu câu trả lời vẫn có thể hiện Đủ điều kiện tập tiêu chuẩn | Thiếu câu trả lời boolean ở bất kỳ mục sàng lọc nào hiện Chưa hoàn tất sàng lọc; trường hợp đủ câu trả lời âm tính hiện Chưa ghi nhận cảnh báo trong hồ sơ | Test dữ liệu tổng hợp: thiếu/null/trả lời một phần không thành clearance; cảnh báo/chuyển khám hiện có vẫn được ưu tiên. Đây là trạng thái dữ liệu, không thêm thuật toán cấp phép tập. |
| Mục lục sổ tay không chỉ đoạn đang xem; phần trăm ghi Đã đọc | Theo dõi vùng cuộn thật, trừ phần thanh dưới che nội dung, đánh dấu aria-current=location; đổi thành Vị trí; bỏ live announcement liên tục | Click Nguồn ở mobile và Áp dụng ở desktop đánh dấu đúng mục. Có test riêng cho CSS scroll-margin của neo desktop. |
| Văn bản sổ tay dày và input mobile 12–14px | Prose 16px/1.8, tối đa72ch; input/select/textarea mobile16px; điều khiển chính, theme picker và mục lục44px | Số đo DOM trên production và ảnh thực tế. Điều khiển Atlas/client-detail tăng chiều cao ở pointer coarse. |
| Atlas lặp chọn vùng và có cài đặt phụ mở trong khám phá tự do | Giữ một lựa chọn vùng, thu gọn cài đặt phụ, thêm Đến mô hình 3D | Link cuộn và chuyển focus tới atlas-3d-model ở y83.75, canvas tải được. Mô hình vẫn cần cuộn trên mobile; không tuyên bố toàn bộ 3D nằm trong viewport đầu. |
| NCSF trước đăng nhập chỉ có form ngắn, chưa nêu các chế độ học | Form có heading/pending rõ; giải thích đọc giáo trình, đề nhỏ và đề thử bằng danh sách ngắn | Mobile đặt form trước, nút đăng nhập y530.4. Không đăng nhập thật, không đọc tài liệu riêng; kiểm tra liên tục bài thi bằng fixture. |

Các playbook áp dụng trực tiếp: audit/critique để đánh giá, adapt/layout/typeset/clarify/onboard/distill/harden để chỉnh luồng, polish để hoàn thiện. PRODUCT.md được dùng làm căn cứ. DESIGN.md và preview sidecar được đồng bộ các kích thước điều khiển thay đổi. Không chạy live/generate/overdrive hoặc tuyên bố tối ưu Web Vitals khi chưa có phép đo phù hợp.

## Kiểm tra và giới hạn

- `npm run check:ui`: **33/33 đạt**. Các ca mới được chạy thất bại trước sửa và đạt sau sửa; có regression riêng cho vị trí đọc desktop.
- `npm run check:atlas-learning`: **10/10 đạt**.
- `npm run build`: production compile, TypeScript và sinh21 trang tĩnh đạt. Lượt TypeScript trước build có cache route cũ trong `.next/types`; build tái tạo types, `npx tsc --noEmit` sau đó đạt.
- `npm run lint`: exit0, không có error/warning trong lượt kiểm tra này.
- `git diff --check`: đạt.
- Review mã độc lập: không có phát hiện cần sửa; reviewer tự chạy33 test UI đạt. Việc chỉnh Atlas toolbar cuối và ẩn native search clear được root kiểm tra thêm.
- Browser: Chromium/IAB ở390×844 và1440×1000; đã kiểm tra thêm thanh điều hướng tại1024×900: cả5 liên kết nằm trong vùng nav, không bị cắt. Đã xem năm route, lưu ảnh, kiểm tra thao tác gợi ý, xóa tìm, đóng/mở form, neo mục lục và neo mô hình. Không có console error trong phiên production đã đọc.
- Đã chọn đủ13 theme rồi khôi phục Tide; các phép đo theme cho thấy chiều rộng tài liệu390px và picker44px. Tương phản tính từ computed colors cho **hai cặp được đo**: heading/canvas thấp nhất5.48:1; secondary button text/background thấp nhất6.24:1. Không suy rộng thành mọi trạng thái/foreground trên mọi theme.
- Không gửi câu tư vấn, không tạo/sửa/xóa hồ sơ hay xét nghiệm thật, không đăng nhập NCSF và không thêm dữ liệu riêng vào git. Test dùng fixture tổng hợp.
- Chưa kiểm tra screen reader thật, Safari/iOS, bàn phím ảo, gesture cảm ứng trên thiết bị thật, hiệu năng máy yếu hoặc toàn bộ nội dung NCSF đã đăng nhập. UI/source tests không xác nhận kiến thức y khoa hoặc tính chính xác lâm sàng.

## Detector và các phát hiện còn lại

Đã chạy `npm run design:check` và `npm run design:check:page -- ...` trên đủ năm route, hai viewport. Cấu hình ignore không thay đổi. Không có automatic hook nên kiểm tra thủ công là bắt buộc. Lượt quét chính trả exit2 vì có primary findings, không phải lỗi không quét được. Sau chỉnh CSS nút clear riêng của trang học viên, hai lượt quét lại `/clients` ở desktop/mobile đều exit0, không có primary/advisory.

| Phạm vi | Primary | Advisory | Diễn giải |
| --- | ---: | ---: | --- |
| Source | 1 | 26 | side-tab ở `.md-answer blockquote` là false positive, không phải tab; 21 cảnh báo cỡ chữ và5 radius cần đối chiếu vai trò thực, gồm prose/input16px đã mô tả và ngoại lệ cũ. |
| Desktop, 5 route | 2 | 0 | nested-cards ở Atlas và chat composer. Đây là vùng công cụ/ô nhập có chức năng; giữ phân vùng thay vì xóa để giảm đếm. |
| Mobile, 5 route | 4 | 4 | 3 nested-cards tại Atlas, composer và disclosure nguồn tư vấn; 1 kicker-above-heading tại phần nguồn sổ tay có từ trước. 4 advisory straggler là các dòng cuối ngắn; chưa chỉnh nội dung chuyên môn để làm sạch detector. |

Không có tiny-text/undersized-ui-text/low-contrast trong các snapshot quét route này. Chỉ là kết quả của các trạng thái quét, không phải chứng nhận a11y. Các control/nguồn/mô phỏng khác ngoài trạng thái đã xem không được suy thành đã kiểm tra đầy đủ.

Không inject overlay vì evaluate của browser là read-only; không khởi tạo live helper. Các tab review của agent đã đóng, các viewport tạm được khôi phục. Không thêm ignore để che cảnh báo. Snapshot và dữ liệu đo nằm local, gitignored trong `.impeccable/review/2026-10-30-app-upgrade/` (`source.json`, `desktop.json`, `mobile.json`, `themes.json`, `theme-contrast.json`, ảnh từng route). Các bản tải tài liệu upstream ở `/tmp/kinesis-impeccable-upstream/`; không đưa vào repo. Không có deploy hoặc push trong lượt này.
