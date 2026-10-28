# Atlas Geometry Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; use subagents only for independent source comparisons when authorized by the applicable skill. No generated geometry is to be presented as measured anatomy.

**Goal:** Nâng đúng các cấu trúc cần chi tiết hơn, với nguồn và kiểm tra giải phẫu rõ ràng; không thay cả atlas chỉ để tăng số polygon.

**Architecture:** Thử nghiệm theo từng tài sản, giữ ID ứng dụng/liên kết tương thích và provenance theo từng cấu trúc. Bản nguồn cũ được giữ để so sánh/rollback; mọi thay đổi hình học có manifest phiên bản và phạm vi đối chiếu riêng.

**Tech Stack:** Blender/GLB/Draco, existing exporter/audit loader, JSON provenance, browser QA. Việc có nguồn Blender hoặc dữ liệu thay thế là đầu vào thực sự, không được giả định đã có.

---

Phụ thuộc: đợt 1 xong để không nhầm lỗi cull với thiếu geometry. Đợt 2 có thể làm song song ở phần nghiên cứu nguồn; không cần chờ phủ toàn bộ kiến thức.

## Task 1 — Lập inventory và chọn pilot nhỏ

**Create:** `scripts/audit-atlas-geometry-quality.mjs`; `public/anatomy/3d/geometry-quality.json`; `docs/research/2026-10-28-atlas-geometry-candidates.md`.

- [x] Dùng `loadAuditMeshes()` giải mã GLB; ghi ID, triangles, vertex slots, boundary/nonmanifold, bounds, nguồn/phiên bản. Kiểm tra mọi position hữu hạn. Thuật toán và ngưỡng weld phải được ghi trong output.
- [x] So với baseline audit: full 1.031 structures, 1.411 primitives, 2.368.785 triangles, 154 structures <=10 triangles, 58 đúng hai triangles. Sai khác phải được giải thích bởi asset version, không tự đổi số chuẩn cho test pass.
- [x] Pilot: ATFL hai bên, CFL hai bên, đĩa khớp cùng–đòn hai bên, ức–đòn hai bên và quay–trụ dưới hai bên — tổng mười cấu trúc. Dùng ID thực từ manifest, không dùng tên gần giống để thay nhầm.
- [x] Ghi nhãn biểu diễn có ý nghĩa học: bề mặt sơ đồ/không xác nhận thể tích. Polygon count không tự quyết định “đúng y khoa”; source mặt hở không mặc nhiên là lỗi nếu đối tượng được chủ ý biểu diễn như màng.
- [x] Nếu chưa có ứng viên tốt hơn, có thể phát hành inventory và chú thích giới hạn hiện có; không ghi nhiệm vụ thay hình học là hoàn tất.

## Task 2 — So sánh nguồn trước khi dựng hoặc thay mesh

- [x] Khôi phục đúng pinned source archive/Blender của Z-Anatomy vào thư mục ignored `.data/z-anatomy/`; lưu repository, commit, URL tải, SHA-256, phiên bản Blender và lệnh export. Không ghi source hash nếu chưa tải thật.
- [x] Với mỗi pilot, so sánh ít nhất hai hướng khả thi: bản nguồn hiện tại đầy đủ/modifier bị bỏ khi export; và mô hình từ tổ chức học thuật/dataset mở có nguồn rõ. Nếu dùng segmentation thì phải có quyền dữ liệu và lịch sử biên tập.
- [x] Bảng ứng viên ghi: cấu trúc/bên, nguồn, license, quyền sửa/phân phối, số đo/hình học có thực sự đo hay biên soạn, hệ tọa độ/units, chi tiết bổ sung, đối chiếu atlas/giáo trình và chi phí tích hợp.
- [x] Loại nguồn không cho phép sử dụng/sửa/phân phối theo mục tiêu app. Không lấy mesh từ atlas thương mại hoặc ảnh textbook không có quyền phù hợp.
- [ ] Chọn bằng bằng chứng về outline, quan hệ xương–khớp và attachment đại thể; không chọn vì số polygon hoặc vẻ chân thật cao hơn. Nếu các nguồn không thống nhất, ghi biến thể/phạm vi thay vì tự tạo trung bình không có nguồn.
- [x] Không extrude ribbon, subdivide hay dùng AI vẽ sợi rồi gọi kết quả là cấu trúc/độ dày đo được. Mô phỏng chỉ được giữ dưới nhãn mô phỏng.

## Task 3 — Tích hợp tài sản đạt tiêu chí

**Modify khi có ứng viên đạt:** `scripts/export_z_anatomy.py`, asset GLB/manifest liên quan, `src/lib/clinical/evidence-registry.ts`, `public/anatomy/3d/ATTRIBUTION.md`, scripts kiểm tra surfaces/geometry.

- [ ] Tạo export pilot tách biệt để so sánh; giữ file cũ và camera/light/projection giống nhau. Ghi phép transform/registration và đơn vị, kiểm tra cả bên trái/phải; không tự mirror một bên rồi gọi nó là giải phẫu đo của bên kia.
- [ ] Nếu giữ ID legacy `za-*` để không phá link, per-structure `geometrySource` phải trỏ nguồn thật của mesh mới. ID ứng dụng không được dùng như bằng chứng mọi asset vẫn là Z-Anatomy.
- [ ] Cập nhật `getCatalogEvidence()` theo nguồn của từng structure; không để model mới kế thừa provenance Z-Anatomy hardcoded. Record có original source ID, version/hash, license, adaptations, source-comparison scope/date và limitations.
- [ ] Kiểm tra vị trí tương đối ở tối thiểu hai góc trực giao và trong toàn body; phân biệt mặt sơ đồ với thể tích. Chỉ yêu cầu kín/volume nếu tài sản thực sự được dùng như thể tích, không ép mọi màng/diện thành khối giả.
- [ ] Recompute source material groups và geometric fields khi geometry đổi. Không giữ bản đồ thickness của mesh cũ; không biến thickness tính lại thành đo mô thật.
- [ ] Kiểm tra search/callouts/side/region, raycast, clipping, double-sided, nguồn và rollback. Hash/version thay phải đúng theo bytes mới; ID cũ vẫn mở đúng cấu trúc.
- [ ] Đo transfer và frame cost trên cùng thiết bị/viewport trước–sau. Nếu tăng đáng kể, ghi số đo và tối ưu asset trước khi thay mặc định; không tăng chất lượng đồ họa rồi bỏ qua khả năng dùng trên điện thoại.
- [ ] Commit từng nhóm pilot đủ nguồn/QA, không trộn ứng viên chưa đạt vào bundle production.

## Task 4 — Đối chiếu và phát hành pilot

- [ ] Hoàn tất bảng so sánh từng tài sản: vấn đề cũ, nguồn mới, chi tiết bổ sung, vị trí/bên/quan hệ đã kiểm và phần vẫn chưa có bằng chứng.
- [x] Người triển khai đọc nguồn phải ghi phạm vi thật; expert review thêm nếu có chỉ ghi đúng người/ngày/phần đã xem. Không tạo cổng chờ chuyên gia chung cho nội dung đã đủ nguồn.
- [ ] Chạy surfaces, render, search, contextual, evidence checks, build/lint và browser trên hẹp/rộng. Ảnh trước–sau là bằng chứng hiển thị, không tự là chứng minh y khoa.
- [ ] Khi phát hành được thực hiện: deploy từng pilot có thể rollback, kiểm tra URL chính và per-structure attribution. Cập nhật quality inventory và research matrix.

**Done:** các pilot được thay phải có cải thiện giải phẫu thực sự được đối chiếu và provenance đầy đủ; các pilot không có nguồn đạt yêu cầu giữ biểu diễn hiện tại kèm giới hạn. Không chấm phần trăm “medical accuracy”, không tuyên bố đã nâng đủ 1.031 cấu trúc sau pilot.

## Kết quả có điều kiện của batch đầu — 2026-10-28

Inventory đã hoàn tất với baseline không đổi. Đã tải và kiểm hash nguồn pinned, đọc/evaluate cả mười modifier stack trong Blender với autoexec tắt, so sánh các dataset học thuật/nguồn mở và ghi phạm vi thực tế. Chưa có ứng viên đạt bằng chứng cải thiện giải phẫu, nên **không chọn tài sản thay thế và không thực hiện Task 3**. Những checkbox thay mesh/registration/đo chi phí mesh mới còn để trống có chủ đích; không được mô tả chúng là hoàn tất. Các bề mặt cũ được giữ kèm ghi chú sơ đồ và inventory có nguồn. Xem `docs/research/2026-10-28-atlas-geometry-candidates.md`, các JSON/script đính kèm và QA log. Browser thực 687×877; 390/1280 chưa kiểm vì không có khả năng đặt viewport. Phát hành batch inventory/annotation được ghi sau khi xác minh production.
