# Atlas Sourced Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans task-by-task. Do not create medical facts to fill empty coverage.

**Goal:** Người dùng chọn một cơ có thể học kiến thức riêng của cơ đó, với citation sát từng phát biểu và trạng thái coverage trung thực.

**Architecture:** Registry kiến thức cá thể độc lập với catalog hình học; dữ liệu cá thể ánh xạ ID chính xác, thẻ nhóm chỉ là nội dung liên quan. Hồ sơ thuật ngữ, kiến thức đại thể và hình học không tự nâng trạng thái cho nhau.

**Tech Stack:** TypeScript/MJS, curated records cục bộ, existing evidence registry và React cards.

---

Phụ thuộc: đợt 1 đã ổn định API catalog resolved và nguồn nguyên bản. Theo medical policy: đối chiếu nguồn uy tín là tiêu chí chấp nhận nội dung; reviewer identity chỉ ghi nếu có thật. Không có yêu cầu chờ expert signoff chung.

## Task 1 — Hồ sơ giải phẫu cá thể cho batch đầu

**Create:** `docs/research/2026-10-28-atlas-individual-muscles.md`; `src/lib/clinical/structure-anatomy-evidence.ts`; `scripts/check-structure-anatomy-evidence.mjs`.

**Keep:** `src/lib/clinical/anatomy-evidence.mjs` và GLUTEUS_MEDIUS_IDS dùng cho nhãn bề mặt; không làm gãy import của các MJS renderer.

Batch đầu gồm bảy họ cơ, hai bên: Internal abdominal oblique, External abdominal oblique, Transversus abdominis, Supraspinatus, Infraspinatus, Subscapularis và Teres minor. Registry mới bao gồm/fallback hồ sơ mông nhỡ hiện có, không copy hai bản kiến thức dễ lệch.

- [x] Lấy chính xác 14 ID từ resolved catalog. Lưu bảng ID/tên/bên trong research note; không dùng regex rộng để đưa nhầm cơ khác vào hồ sơ cá thể.
- [x] Đọc nguồn cho từng cơ: OpenStax §11.4/§9.6/§11.5, các dòng muscle table của TTUHSC và entry Loyola tương ứng. Dùng textbook/nguồn đại học khác khi có khác biệt cần giải quyết; ghi phần đã đọc, không gán full-text khi chỉ đọc abstract.
- [x] Với mỗi cơ, đối chiếu riêng: vị trí và quan hệ lớp, nguyên ủy đại thể, bám tận, thần kinh, chức năng chính và khác biệt cần lưu ý. Không tự đưa hướng sợi hoặc footprint onto mesh.
- [x] Mỗi claim có `id`, `label`, `text`, `sourceIds`. Source có `url`, `title`, `checkedAt`, `access`; record có `structureIds`, `limitations`, `reviewedBy:null`. Không tạo claim rỗng để đạt số lượng.
- [x] Nguồn khác nhau về biến thể được ghi thành phạm vi/biến thể; không tự hợp nhất thành một kết luận tuyệt đối. Đối chiếu nguồn cũng không xác nhận tọa độ attachment của GLB.
- [x] Viết regression: 14 ID đúng cơ và đúng bên; mọi sourceId tồn tại; unknown ID trả null; không kế thừa claim của cơ khác; reviewer fields trung thực; mỗi batch đủ các trường thực sự được nghiên cứu.
- [x] Chạy regression trước implementation để xác nhận chưa có registry/batch; implement rồi chạy lại. Giữ nguyên trạng thái `source-only` của geometry.
- [x] Commit: `feat(atlas): add sourced individual abdominal and cuff anatomy`.

## Task 2 — Thẻ cá thể hiển thị trước nội dung nhóm

**Modify:** `src/components/atlas3d/AnatomyEvidenceCard.tsx`, `src/components/atlas3d/Atlas3DExplorer.tsx`, `src/lib/clinical/evidence-registry.ts`.

- [x] Thẻ gọi `getStructureAnatomyEvidence(structureId)` từ registry mới. Registry nạp hồ sơ mông nhỡ gốc và batch đầu; mọi ID khác trả null.
- [x] Bỏ aria-label cố định “cơ mông nhỡ”; dùng tên record thực. Render claim label, nội dung và citation ngay cạnh nhau.
- [x] Thẻ nhóm có tiêu đề “Nhóm cơ liên quan”, không để người đọc hiểu toàn bộ group card là nguyên ủy/thần kinh riêng của cơ đang chọn.
- [x] Nội dung chưa có thẻ cá thể vẫn cho xem tên, nguồn và kiến thức vùng hiện có; không tạo nhãn “chờ chuyên gia duyệt” chung.
- [ ] Browser: IO/EO/TA cho ba thẻ khác nhau; bốn cơ chóp xoay khác nhau; gluteus medius giữ nội dung cũ; đổi trái/phải không đổi nguồn sang cơ khác; link và keyboard focus hoạt động trên màn hình hẹp và rộng.
- [x] Chạy `node --test scripts/check-structure-anatomy-evidence.mjs`, `check:atlas-evidence`, `check:atlas-learning`, `check:atlas-search`, evidence coverage, build và lint.
- [x] Commit: `feat(atlas): show individual anatomy before group context`.

## Task 3 — Hoàn thiện thuật ngữ và độ chính xác của audit nguồn

**Modify:** `src/lib/clinical/atlas-terminology-evidence.ts`, `src/lib/clinical/atlas-muscular-names.vi.ts` khi có bằng chứng sửa, `scripts/audit-catalog-evidence.mjs`, `src/lib/clinical/catalog-evidence.json`, `public/anatomy/3d/TERMINOLOGY.md`, `docs/medical-evidence-policy.md`.

- [x] Xử lý trước tám nhóm unresolved: adductor minimus; levatores breves costarum; levatores longi costarum; rotatores; spinalis capitis; spinalis colli; superficial transverse metacarpal ligament; superficial transverse metatarsal ligament.
- [x] Sau đó xử lý 35 partial theo cơ được tra nhiều/vùng ưu tiên. Tên thấy trong ngữ cảnh, cặp song ngữ và đối chiếu Latin là ba mức khác nhau; chỉ nâng trạng thái đủ bằng chứng thực tế.
- [x] Ưu tiên tài liệu đại học/giáo trình có nguồn gốc xác thực. Nếu chỉ có scan bên thứ ba, giữ giới hạn đó; không giả danh xác thực từ trường/NXB. Không có nguồn phù hợp thì giữ trạng thái chưa giải quyết và ghi lý do.
- [x] Parser CSV được phép giữ `upstreamRowId` có hậu tố, đồng thời lưu riêng `canonicalTa2Id` nếu đã đối chiếu. Không biến `1265*1` thành số TA2 chính thức chỉ bằng cách cắt chuỗi.
- [x] Bổ sung `--check` không ghi file và `--apply` có chủ đích cho script audit. Test rows số thuần, rows suffix, synonym/parenthesized names, lỗi Latin biết trước và nguồn raw/canonical phân biệt.
- [x] Tính lại counts từ records mới; không cố giữ 884/147 hoặc gọi 139 row suffix là đã được TA2 gốc xác nhận. Không sửa checkedAt lịch sử thành ngày tích hợp chung.
- [x] Commit riêng cho từng batch dữ liệu được đọc và đối chiếu, kèm research note.

## Task 4 — Audit theo vùng và phát hành theo batch

**Create:** `docs/research/atlas-region-verification-matrix.json` với entries chỉ cho phần đã đối chiếu; không tạo các record “đã kiểm” trống.

- [x] Với từng vùng cổ, vai/chi trên, ngực, thắt lưng, hông, đùi, gối và cổ chân: liệt kê các cấu trúc đã xem; danh tính, bên, quan hệ lớp, attachment đại thể và loại mô; source IDs và giới hạn của từng kết luận.
- [x] Đếm riêng coverage thuật ngữ, kiến thức cá thể và hình học. Chỉ có thẻ kiến thức không làm mesh thành medically-verified.
- [x] Sau batch đầu, chọn batch kế theo nhu cầu học: hông/đùi/gối/cổ chân; mỗi batch là một diff có thể review, không đợi phủ đủ 921 lựa chọn còn lại mới phát hành kiến thức đã có nguồn.
- [ ] Mỗi batch chạy checks bị tác động, build/lint và browser chính xác các record mới; review nguồn rồi phát hành, lưu commit/deployment và cập nhật coverage thực.

**Done của batch đầu:** bảy họ cơ/hai bên có kiến thức cá thể đủ nguồn; mông nhỡ giữ hồ sơ; group context không bị trình bày như claim cá thể; các vùng chưa làm không bị gắn nhãn xác nhận giả.

## Trạng thái thực thi 2026-10-28

Các bước được đánh dấu đã có kiểm tra mã/dữ liệu và review độc lập. Browser đã kiểm tại viewport thực 687×877; công cụ không cung cấp đặt viewport 390/1280 nên hai kích thước đó vẫn chưa được xác minh. Kết quả, ảnh và giới hạn được ghi trong `docs/research/2026-10-28-atlas-remediation-qa.md`. Phát hành được ghi riêng sau khi push/deploy/xác minh URL chính.
