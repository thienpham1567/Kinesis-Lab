# Atlas foundations — source ledger (2026-10-22)

## Yêu cầu

Người dùng hỏi kiến thức Atlas đã đủ từ nguồn uy tín chưa và muốn mang kiến thức từ nguồn về, dịch và thêm vào app cho đầy đủ nhất.

## Kết luận rà soát

- Kho hữu hạn đã có hồ sơ nguồn ở mức từng phát biểu: 8 vùng giải phẫu (mỗi vùng 3 cấu trúc, 2 điều chỉnh hoạt động), 11 nhóm cơ/27 đầu cơ, 13 bài tập, 10 nhóm trigger point/19 thành phần, 8 vùng đau, 4 bài sổ tay, 17 động tác ROM. Trạng thái `literature-reviewed` hoặc `limited`; `reviewedBy: null` là sự thật (không có chuyên gia duyệt độc lập) và theo quyết định 2026-10-22 của người dùng, đối chiếu nguồn uy tín là tiêu chí chấp nhận.
- Khoảng trống thật: (1) 1.031 cấu trúc 3D chỉ ở mức `source-only` — chọn cấu trúc chủ yếu thấy tên, chưa có kiến thức giải phẫu riêng có nguồn; (2) hai trường `commonPathologies` và `painTriggers` đã có nguồn đối chiếu nhưng chưa từng được hiển thị.

## Nguồn đã đọc lại ngày 2026-10-22

OpenStax *Anatomy and Physiology 2e* (CC BY 4.0), đọc toàn văn các mục:

- §7.3 The Vertebral Column — C1/C2 và khớp đội–chẩm/đội–trục, hướng mặt khớp từng vùng, diện sườn đốt ngực, thân đốt thắt lưng, đĩa đệm vòng sợi/nhân nhầy, đường cong nguyên phát/thứ phát.
- §9.6 Synovial Joints (khớp chọn lọc) — vai chỏm–ổ biên độ lớn nhất nhưng kém vững; háng đa trục, dây chằng mạnh; gối ba khớp trong một bao khớp, bản lề lăn–trượt, screw-home; cổ chân sên–cẳng chân một trục, lật trong/ngoài từ khớp dưới sên, dây chằng ngoài và delta.
- §8.3 The Pelvic Girdle and Pelvis — vòng chậu, khớp cùng–chậu, khớp mu (đã có trong hồ sơ hip_pelvis).
- §11.6 Appendicular Muscles of the Pelvic Girdle and Lower Limbs — ba khoang cơ đùi, gân tứ đầu qua bánh chè, gân kheo và hố khoeo.

## Thay đổi đã làm

- `src/lib/clinical/anatomy-atlas.ts`: thêm `REGION_FOUNDATIONS` — mỗi vùng 3 ý kiến thức nền, diễn đạt lại tiếng Việt (không sao chép nguyên văn), mỗi ý gắn số nguồn theo đúng thứ tự hồ sơ của vùng.
- `src/lib/clinical/evidence-anatomy.ts`: mỗi vùng thêm một dòng supported claim “Kiến thức nền” ghi rõ mục OpenStax và ngày đọc lại.
- `src/components/BodyMapExplorer.tsx`: hiển thị mục “Kiến thức nền” (kèm link nguồn `[n]`) và hai mục “Tình trạng thường gặp” / “Hoạt động thường liên quan triệu chứng” từ dữ liệu đã có nguồn, kèm câu rõ ràng rằng liên quan triệu chứng không tự cho biết mô tổn thương.
- `scripts/check-anatomy-regions-evidence.mjs`: kiểm tra đủ 3 ý nền/vùng, chỉ số nguồn hợp lệ và có dòng claim tương ứng. Kiểm tra này chỉ chứng minh tính nhất quán dữ liệu, không chứng minh đúng y khoa.

## Giới hạn còn lại (không được nói quá)

- 1.031 cấu trúc 3D vẫn `source-only`: đợt này không dịch/gắn kiến thức cho từng cấu trúc vì chưa đọc đối chiếu từng cấu trúc với nguồn giải phẫu. Muốn đầy đủ ở tầng này cần làm theo đợt (ví dụ từng hệ cơ quan), mỗi đợt đọc nguồn và ghi ledger riêng.
- Kiến thức nền là giải phẫu đại thể từ giáo trình; không phải đo lường trên mô hình, không phải chẩn đoán và không thay thế thăm khám.
