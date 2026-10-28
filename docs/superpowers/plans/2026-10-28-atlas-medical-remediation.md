# Atlas Medical Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement the linked plans task-by-task. Steps use checkbox syntax for tracking. This document is a roadmap, not authorization to mark unverified anatomy as validated.

**Goal:** Sửa các lỗi đã xác nhận, tăng chất lượng kiến thức và hình học theo bằng chứng, giữ trải nghiệm search/highlight toàn body.

**Architecture:** Giữ nguyên metadata và tài sản nguồn để truy xuất; áp dụng một lớp hiệu chỉnh có nguồn thống nhất cho các bộ xem. Kiến thức cá thể và nguồn hình học có hồ sơ riêng, không nâng trạng thái của mesh chỉ vì tên hoặc thẻ kiến thức được đối chiếu.

**Tech Stack:** Next.js 16.4.1, React 19, TypeScript, Three.js r186, GLB/Draco, dữ liệu JSON/MJS cục bộ; không cần database hay dịch vụ mới.

---

Baseline: commit `8fa995f79170bec73052418271f01d4ec4e52ad5`, [báo cáo review 27/10](../reviews/2026-10-27-atlas-3d-medical-detail-audit.md). Các ảnh và JSON bên cạnh báo cáo là bằng chứng ban đầu. Đọc `AGENTS.md`, `docs/medical-evidence-policy.md` và hướng dẫn Next.js cục bộ liên quan trước khi sửa mã.

## Ba đợt độc lập

| Thứ tự | Phạm vi | Kết quả phải đạt | Có thể phát hành riêng |
|---|---|---|---|
| 1 — Sửa lỗi hiện tại | Render hai mặt; Latin; trái/phải; vùng vai; nhóm mô; dẫn nguồn và chú thích chế độ xem | Các lỗi đã xác nhận không còn tái hiện, nguồn gốc vẫn truy được | Có, ưu tiên làm trước |
| 2 — Bổ sung kiến thức | Thẻ giải phẫu cá thể, quan hệ lớp, nguồn cạnh từng phát biểu, xử lý các khoảng trống thuật ngữ | Người dùng tra một cơ nhận được kiến thức của chính cơ đó | Có, theo từng nhóm đã hoàn tất |
| 3 — Nâng hình học | Thử nghiệm các dây chằng/đĩa khớp đang quá sơ lược; audit theo vùng | Có hình học tốt hơn với nguồn và đối chiếu rõ ràng, hoặc ghi đúng giới hạn hiện có | Có, theo từng tài sản đạt tiêu chí |

Chi tiết thực thi:

- [Đợt 1 — Correctness fixes](./2026-10-28-atlas-correctness-fixes.md).
- [Đợt 2 — Sourced learning](./2026-10-28-atlas-sourced-learning.md).
- [Đợt 3 — Geometry upgrade](./2026-10-28-atlas-geometry-upgrade.md).

## Những điều phải giữ

- [x] Search luôn thấy phía trên 3D, chỉ có một ô nhập.
- [x] Search tên Việt/Anh/Latin và trái/phải vẫn hoạt động; tên chính xác được ưu tiên.
- [x] Search giữ toàn bộ body, không tự tách riêng hoặc làm mờ toàn bộ phần còn lại.
- [x] Tô xuyên là công cụ định vị; có chú thích ngay trên canvas. Người dùng vẫn có thể chủ động dùng nút Tách riêng/Cận cảnh.
- [x] Không thay ID hoặc làm hỏng liên kết đã chia sẻ trong đợt 1–2.
- [x] Giữ tên nguồn, giá trị nguồn và lý do hiệu chỉnh. Không sửa dữ liệu gốc rồi gọi kết quả là nguyên bản Z-Anatomy.
- [x] Phát biểu mới có nguồn, phạm vi đã đọc và ngày kiểm tra thực tế. Reviewer metadata chỉ ghi sự kiện có thật.
- [x] Không coi texture AI, shader, số polygon, tỷ lệ đỉnh tính được hoặc test pass là xác nhận y khoa.
- [x] Không tạo nhãn chờ chuyên gia duyệt chung; áp dụng tiêu chí đối chiếu nguồn theo quyết định người dùng 22/10.

## Bao phủ phát hiện của review

| Phát hiện | Công việc |
|---|---|
| F1 — Nhóm nguồn bị gọi như loại mô | Đợt 1, task 3 |
| F2 — Material không tương đương mô giải phẫu | Đợt 1, task 2–3; đối chiếu sâu hơn ở đợt 2 |
| F3 — Ba bên bị thiếu | Đợt 1, task 2 |
| F4 — Sáu mesh chóp xoay bị gán vùng ngực | Đợt 1, task 2 |
| F5 — Bốn lỗi Latin/tám mesh | Đợt 1, task 2 |
| F6 — Bị mất double-sided | Đợt 1, task 1, cả static Atlas và curl |
| F7 — Dẫn nguồn chưa đúng đoạn | Đợt 1, task 4 |
| G1 — 154 cấu trúc quá ít đa giác | Đợt 3, task 1–3 |
| G2 — Ít kiến thức cá thể | Đợt 2, task 1–3 |
| G3 — Vân mô/độ dày/chuyển động mô phỏng | Đợt 1, task 3; đợt 3 không suy số đo từ chúng |
| G4 — Highlight không dạy được quan hệ lớp | Đợt 1, task 3; đợt 2 bổ sung quan hệ lớp có nguồn |

## Điều kiện triển khai mỗi đợt

1. Hoàn tất phạm vi của đợt, có diff và nguồn cụ thể; review những phần vừa thay đổi.
2. Chạy kiểm tra phù hợp, `npm run build`, `npm run lint`; kiểm tra browser cho luồng bị tác động.
3. Đối chiếu nguồn riêng với tính nhất quán phần mềm. Ghi rõ các giới hạn còn lại.
4. Commit theo phần việc; khi thực thi việc phát hành đã được cho phép, push `master`, deploy Vercel, xác minh trên URL chính và lưu commit/deployment/ảnh.
5. Giữ đường rollback về commit/deployment trước. Đối với tài sản mới, giữ bản cũ và provenance để phục hồi; không cần thay cả atlas để phát hành một sửa đổi nhỏ.

## Thước đo tiến độ

- Đợt 1: lỗi tái hiện ở F1–F7 được xử lý, có fixture đối chiếu độc lập; không chỉ báo số test pass.
- Đợt 2: đếm họ cơ/mesh có thẻ cá thể và số claim có nguồn, báo riêng nội dung còn thiếu. Batch đầu thêm bảy họ cơ/hai bên; không hứa đã phủ 1.031 cấu trúc.
- Đợt 3: đếm từng tài sản đã đối chiếu và mức chi tiết thực sự được bổ sung. Không dùng tổng polygon hoặc tỷ lệ “độ chính xác” tự đặt.

Lượt lập kế hoạch này không thay mã ứng dụng, dữ liệu 3D hoặc production. Các kế hoạch sau chỉ bắt đầu khi thực hiện yêu cầu sửa, không tự coi một checkbox chưa làm là hoàn tất.

## Trạng thái đợt triển khai đầu

F1–F7 đã được xử lý với review độc lập; thêm bảy họ cơ/hai bên và giữ mông nhỡ; thuật ngữ còn 22 partial và một unresolved. Hình học đã có inventory và đối chiếu mười pilot, giữ tài sản hiện có với chú thích bề mặt sơ đồ vì chưa có thay thế chứng minh cải thiện giải phẫu. Không tuyên bố đã thay mesh hoặc xác nhận y khoa toàn bộ atlas. Hai viewport 390/1280 chưa được kiểm do công cụ không hỗ trợ đặt kích thước.
