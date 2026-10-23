# Atlas P0 task 1 — citation fixes (2026-10-23)

Phạm vi: sửa các trích dẫn không khớp nguồn do rà soát phát hiện. Kiểm thử chỉ xác nhận tính nhất quán dữ liệu, không xác nhận đúng y khoa.

## Nguồn đã đọc và phạm vi

| Nguồn | Phạm vi đọc thực tế |
| --- | --- |
| OpenStax A&P 2e §7.3 The Vertebral Column | Toàn văn HTML đọc lại 2026-10-23. Có: C1 khớp lồi cầu chẩm, C2 là trục xoay đầu, mặt khớp cổ phẳng hướng lên/xuống, mỏm gai ngực dài chúc xuống chồng đốt dưới, mặt khớp ngực trên hướng ra sau/dưới hướng ra trước, mỏm khớp thắt lưng lớn (trên hướng vào trong, dưới hướng ra ngoài). Không có: gật đầu ở khớp đội–chẩm, biên độ cổ theo mặt khớp, giới hạn duỗi/nghiêng ngực, giới hạn xoay thắt lưng. |
| OpenStax §9.5 Types of Body Movements | Đọc toàn văn. Chỉ định nghĩa gập/duỗi/nghiêng/xoay cột sống; không nói khớp đội–chẩm, mỏm gai, mặt khớp hay giới hạn theo vùng. Không dùng. |
| OpenStax §9.6 (mục cổ chân) | Đọc lại. Nêu tên ba dây chằng ngoài (sên–mác trước, sên–mác sau, mác–gót) cùng chống lật trong; delta chống lật ngoài. |
| StatPearls Anatomy, Back, Vertebral Column (NBK525969, cập nhật 2023-08-08) | Đọc toàn văn qua đường `/sites/books/` (đường `/books/` trả trang xác minh bot, không vượt qua). Chỉ nói cột sống cho xoay/cúi, diện bám xương sườn ở ngực, đường cong; **không** nêu mặt khớp, mỏm gai hay giới hạn vận động. Không dùng làm nguồn cho các ý trên. |
| StatPearls Anatomy, Back, Cervical Vertebrae (NBK459200, cập nhật 2026-01-31) | Toàn văn. “Atlantooccipital joints contribute predominantly to head flexion and extension”; tỉ lệ chiều cao đĩa/thân đốt lớn nhất, “contributing to an increased range of motion”; bao khớp mặt khớp cổ “particularly thin, facilitating increased movement”; C1–C2 đóng góp chính cho xoay trục. |
| StatPearls Anatomy, Back, Thoracic Vertebrae (NBK459153, cập nhật 2026-01-31) | Toàn văn. “The orientation of the ribs and the morphology of the spinous processes substantially limit flexion and extension within the thoracic spine”; T5–T8 xoay nhiều nhất; mặt khớp ngực chủ yếu trong mặt phẳng trán, hạn chế gập/duỗi/nghiêng bên, giữ xoay trục. |
| StatPearls Anatomy, Back, Lumbar Vertebrae (NBK459278, cập nhật 2026-01-31) | Toàn văn. “The near-vertical orientation of the superior articular facets permits flexion, extension, and lateral flexion while restricting axial rotation.” |
| StatPearls Anatomy, Head and Neck, Scalenus Muscle (NBK519058, cập nhật 2025-03-25) | Toàn văn. Bậc thang trước và giữa bám mặt trên xương sườn 1; bậc thang sau bám mặt trước xương sườn 2; nâng xương sườn 1–2 khi hít vào gắng sức; nêu nhiều biến thể bám. |
| StatPearls Anatomy, Bony Pelvis and Lower Limb: Ankle Joint (NBK545158, cập nhật 2023-05-23) | Toàn văn. Ba dây chằng bên ngoài: sên–mác trước, sên–mác sau, mác–gót; ATFL yếu nhất nên hay tổn thương nhất; delta bên trong. Mô tả nghiệm pháp đặc biệt không dùng. |
| Lehman et al. 2004, PMID 15228624 | Abstract trên Europe PMC (bản ghi MED), đọc 2026-10-23. Không đọc toàn văn. |

## Mệnh đề thay đổi ↔ đoạn nguồn

- **Khớp đội–chẩm (cervical #1):** C1 không thân/mỏm gai, khớp lồi cầu chẩm ← §7.3; khớp đội–chẩm chủ yếu gập/duỗi ← StatPearls Cervical. Bỏ cách nói “như gật đầu” (không có trong nguồn) và nêu xoay chủ yếu nhờ đội–trục (Cervical + §7.3).
- **Biên độ cổ (cervical #3):** mặt khớp phẳng hướng lên/xuống ← §7.3; đĩa cổ cao tương đối, bao khớp mỏng góp phần biên độ ← StatPearls Cervical. Bỏ suy luận “mặt khớp phẳng nên cổ linh hoạt”.
- **Mỏm gai ngực (thoracic #2):** mỏm gai dài chúc xuống chồng đốt dưới ← §7.3; xương sườn + mỏm gai hạn chế gập/duỗi, T5–T8 xoay nhiều nhất ← StatPearls Thoracic. Bỏ “nghiêng”: nguồn gán hạn chế nghiêng bên cho hướng mặt khớp, không cho mỏm gai.
- **Mặt khớp thắt lưng (lumbar #2):** gần thẳng đứng, cho gập/duỗi/nghiêng bên, hạn chế xoay trục ← StatPearls Lumbar (§7.3 không nêu nên bỏ khỏi `sourceRefs`).
- **Cổ chân (ankle #3):** thêm sên–mác sau (PTFL) ← §9.6 + StatPearls Ankle; ATFL yếu nhất ← StatPearls Ankle.
- **Bậc thang (JointDiagramSvg, cervical plate #01):** trước/giữa bám xương sườn 1, sau bám xương sườn 2 (có biến thể) và nâng xương sườn khi hít vào gắng sức ← StatPearls Scalenus; §11.3 chỉ còn dùng cho chức năng chung cơ ức–đòn–chũm.
- **Lehman 2004 (lats_teres):** abstract nêu bốn bài (wide-grip pulldown, reverse-grip pulldown, seated row co/không co bả vai), hai đoạn giữ đẳng trường 10 giây; biceps không khác theo bài; tỉ lệ lats:biceps cao nhất ở wide-grip pulldown và seated row; thang giữa/trám cao nhất ở seated row. **Lưu ý:** phần Kết luận của abstract có câu “capable of producing small changes in the myoelectric activity of the primary movers”, nên chữ “nhỏ” được giữ nhưng quy cho tác giả, không còn là kết quả; thêm kết quả định lượng thực tế.

## Chỉ mục nguồn (không làm lệch chỉ mục cũ)

Nguồn mới chỉ được **thêm vào cuối** danh sách từng vùng: cervical 10 (Cervical Vertebrae), 11 (Scalenus); thoracic_core 11; lumbar 11; ankle_foot 9. Mọi `sourceRefs` cũ giữ nguyên số.

## Giới hạn còn lại

- StatPearls là nguồn tổng quan giải phẫu, tác giả/biên tập khác nhau theo bài; dùng cho giải phẫu đại thể, không dùng cho điều trị.
- Hướng mặt khớp cổ giữa các nguồn không hoàn toàn thống nhất (§7.3: hướng lên/xuống; StatPearls Cervical: nhìn chung hướng ra sau); văn bản chỉ giữ ý của §7.3 và không tuyên bố chi tiết hơn.
- Lehman là một nghiên cứu EMG bề mặt đẳng trường, không phải thử nghiệm phì đại; chưa đọc toàn văn.
- NBK525969 (Vertebral Column) không nêu các ý bị nghi sai nên không được thêm vào hồ sơ vùng; kiểm thử dùng ba bài StatPearls theo vùng đã đọc.
