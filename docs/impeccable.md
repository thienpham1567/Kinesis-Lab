# Impeccable trong Kinesis Lab

Tích hợp ngày 2026-10-30, phạm vi project. Lượt đầu thực hiện **tích hợp và kiểm tra trước**. Sau đó người dùng yêu cầu sửa ba nhóm lỗi UI; xem [kết quả xác minh](superpowers/reviews/2026-10-30-impeccable-ui-fixes.md).

## Nguồn và phiên bản

- Repo: [pbakaus/impeccable](https://github.com/pbakaus/impeccable).
- Skill: `4.8.0`, engine: `0.1.18`.
- Commit ghim: [`02523aec3e4c4580102d996d1b6a71fbe062e03f`](https://github.com/pbakaus/impeccable/tree/02523aec3e4c4580102d996d1b6a71fbe062e03f).
- Thư mục upstream: `.agents/skills/impeccable/`; bản sao nằm cùng đường dẫn trong project.
- Giấy phép và thông báo nguồn nằm trong `LICENSE` và `NOTICE.md` cạnh skill.
- Launcher tự tải engine phù hợp hệ điều hành vào `~/.impeccable/bin/`, kiểm SHA-256 bằng manifest đi kèm. Binary không nằm trong bundle của app hay git.
- `.impeccable/config.json` tắt telemetry. Không thêm rule/file ignore để làm sạch kết quả kiểm tra.

## Dùng trong Codex

Skill được nhận diện từ lượt tiếp theo. Ví dụ:

```text
$impeccable audit src/components/AppShell.tsx
$impeccable critique trang Atlas hiện tại
$impeccable polish bộ chọn bảng màu, giữ thiết kế hiện có
```

Đã cài skill và lệnh kiểm tra thủ công. Chưa cấu hình hook tự động. `PRODUCT.md` và `DESIGN.md` chưa được khởi tạo theo quy trình phỏng vấn của upstream; kiểm tra hoặc tinh chỉnh hẹp có thể dùng mã nguồn hiện có làm căn cứ. Khi cần tạo màn hình mới hoặc thiết kế lại, chạy `$impeccable init` để xác nhận ngữ cảnh sản phẩm trước, rồi `$impeccable document` để ghi lại hệ thống thiết kế.

## Ngữ cảnh đã có trong repo

Đây là ghi nhận từ mã nguồn và README, không phải một hướng thiết kế mới:

- **Sản phẩm:** Kinesis Lab, app web tiếng Việt cho Personal Trainer, hỗ trợ tra cứu giải phẫu/cơ sinh học, học tập NCSF, quản lý học viên và tham khảo bằng chứng.
- **Luồng chính:** `/` chuyển đến `/atlas`; các mục khác gồm `/consult`, `/clients`, `/movement`, `/knowledge`.
- **Thiết kế:** Clinical Field Notes; Be Vietnam Pro cho nội dung, IBM Plex Mono cho dữ liệu/nhãn kỹ thuật. Nguồn: `README.md`, `src/app/layout.tsx`, `src/app/globals.css`.
- **Màu:** 13 theme trong `src/lib/theme.ts`; mặc định `tide` (Ocean Sunset). Dùng token ngữ nghĩa trong `globals.css`, kiểm tra các theme thay vì giả định chỉ có một bảng màu.
- **Khung:** thanh điều hướng trên desktop, thanh dưới trên mobile; vùng nội dung cuộn riêng; bộ chọn theme và widget hỏi nhanh. Nguồn: `src/components/AppShell.tsx`.
- **Thành phần chung:** `src/components/WorkspaceUI.tsx`. Tận dụng thành phần hiện có khi tinh chỉnh.
- **Y khoa:** tuân thủ `docs/medical-evidence-policy.md`; giữ trích dẫn, ngày truy cập và giới hạn nguồn/mô phỏng. Không đổi `reviewedBy: null` thành một phê duyệt không có thật. Kiểm tra UI không xác nhận nội dung y khoa.
- **Riêng tư:** tài liệu NCSF, PDF và ngân hàng câu hỏi không được đưa vào `public/` hoặc git. Không gửi dữ liệu học viên hay bí mật môi trường vào dịch vụ thiết kế.

## Chạy detector

```bash
# Kiểm tra pattern trong mã nguồn
npm run design:check
npm run --silent design:check -- --json

# Một terminal chạy app
npm run dev -- --hostname 127.0.0.1

# Terminal khác kiểm tra trang đã render
npm run design:check:page -- http://127.0.0.1:3000/atlas
npm run design:check:page -- --viewport 390x844 http://127.0.0.1:3000/atlas
```

Quét URL cần Chrome/Edge hoặc trình duyệt Chromium tương thích mà engine tìm thấy. Exit code `0`: quét xong, không có primary finding; `2`: quét xong, có finding; `1`: ít nhất một mục không quét được. Advisory được liệt kê riêng và không làm lệnh thất bại. Lỗi quét phải được ghi nhận, không diễn giải thành kết quả sạch.

Source scan chỉ dò pattern; URL scan bổ sung kiểm tra trang đã render. Cần đối chiếu cảnh báo với ngữ cảnh và kiểm tra tương tác thực tế. Không dùng tổng cảnh báo hoặc điểm audit làm chứng nhận accessibility, hiệu năng hay lâm sàng.

## Cài lại đúng bản

Dùng công cụ cài skill của Codex với repo, commit và đường dẫn nêu trên; chọn đích `.agents/skills` của project. Công cụ từ chối ghi đè thư mục đã có. Sau khi giải nén, bảo đảm `.agents/skills/impeccable/scripts/impeccable` có quyền thực thi (`chmod +x`). Giữ giấy phép/thông báo upstream khi phân phối lại.
