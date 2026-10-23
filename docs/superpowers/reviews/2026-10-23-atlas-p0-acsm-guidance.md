# Atlas P0 task 4 — nguyên tắc chung ACSM 2026 và kết quả Kubo 2019 (2026-10-23)

Phạm vi: hiển thị khối "Nguyên tắc chung (ACSM 2026)" ở đầu tab "Huấn luyện PT" (trước đó `TRAINING_GENERAL_GUIDANCE` không được UI nào dùng), bổ sung kết quả khối lượng/tuần cho phì đại và tải cho sức mạnh, và bổ sung kết quả full squat so với half squat của Kubo 2019. Kiểm thử chỉ xác nhận tính nhất quán dữ liệu và việc render, không xác nhận đúng y khoa. `reviewedBy` giữ `null`.

## Nguồn đã đọc và phạm vi

| Nguồn | Phạm vi đọc thực tế |
| --- | --- |
| Currier BS et al., ACSM Position Stand 2026, Med Sci Sports Exerc 58(4), PMID 41843416, PMC12965823 (open access) | Bản full text mở qua Europe PMC (`/PMC12965823/fullTextXML`), đọc 2026-10-23: abstract, câu khuyến nghị chính ở phần thảo luận, phần Results về sức mạnh và phì đại, Bảng 6, bảng định nghĩa biến số (eccentric overload...). **Chưa đọc:** các phụ lục bổ sung (Supplemental Appendices), các phần còn lại của bài; không thẩm định phê phán toàn bộ. |
| Kubo K et al. 2019, PMID 31230110 | Abstract qua Europe PMC (bản ghi MED), đọc lại 2026-10-23. Không đọc full text; các con số là của abstract. |

## Mệnh đề ↔ đoạn nguồn

Tất cả mệnh đề của `TRAINING_GENERAL_GUIDANCE` mang [1] = ACSM 2026.

| Mệnh đề trong ứng dụng | Đoạn nguồn (diễn đạt lại) |
| --- | --- |
| Tập kháng lực tăng dần, nỗ lực cao, ≥2 buổi/tuần, huy động các nhóm cơ lớn; nỗ lực đạt bằng nhiều tổ hợp tải và số hiệp | Thảo luận: "Our primary recommendation is that healthy adults perform RT with high effort (effort can be measured through various scales, but can be achieved with various loads and sets per the FITT-VP principle) at least twice weekly, with all major muscle groups being engaged." Kết luận abstract: "Healthy adults should perform progressive RT". |
| Phì đại tăng khi khối lượng cao hơn, ≥10 hiệp/nhóm cơ/tuần (liều–đáp ứng) | Results: "hypertrophy was enhanced by ... higher volume (≥10 sets/muscle group/wk)"; Bảng 6, hàng Hypertrophy: "Volume: ≥10 sets/wk (dose-response)". Abstract: "≥10 sets/wk". |
| Chỉ ly tâm cho phì đại nhiều hơn chỉ hướng tâm; ly tâm quá tải = tăng tải hoặc thời gian chịu lực ở pha ly tâm | Results: "hypertrophy was enhanced by RT performed with eccentric-only contractions (versus concentric-only)"; Bảng 6: "Type: Eccentric contractions/overload"; bảng định nghĩa: "Eccentric overload: Increased load or time under tension during eccentric movement." |
| Sức mạnh tăng nhiều hơn với tải nặng hơn, ≥80% 1RM (liều–đáp ứng); biên độ đầy đủ, 2–3 hiệp/buổi, đầu buổi, ≥2 buổi/tuần | Bảng 6, hàng Strength: "Frequency: ≥2 sessions/wk; Intensity: ≥80% 1RM (dose-response); Technique: Full range of motion; Volume: 2–3 sets/session; Exercise order: Beginning of training session". Abstract: "lifting heavier loads (≥80% one-repetition maximum), through a complete range of motion, for 2–3 sets, at the beginning of training sessions, and ≥2 sessions/wk". |
| Với phì đại, các biến số sau không cho khác biệt nhất quán: tải 30%–100% 1RM, tập tới thất bại, nhịp 0,5 s so 8 s, hạn chế lưu lượng máu, chu kỳ hóa, thứ tự bài | Results: "RT did not influence hypertrophy performed with ... low (30% 1RM) to high (100% 1RM) loads; contractions to muscle failure/fatigue; blood flow restriction; ... fast (0.5 s) versus slow (8 s) repetitions; ... periodization ...; or exercise order within training sessions." |

Lưu ý diễn giải: abstract viết "eccentric overload"; bản full text cho thấy so sánh thực tế là chỉ ly tâm với chỉ hướng tâm. Ứng dụng nêu đúng so sánh đó và ghi giới hạn. Với sức mạnh, nguồn ghi "not affected by ... contraction type", nên không có khuyến nghị ly tâm cho sức mạnh. Ngưỡng ≥10 hiệp và ≥80% 1RM là ngưỡng báo cáo khi so sánh chương trình; ACSM không xác định giới hạn trên của tần suất ("upper limit cannot ... be determined").

### Kubo 2019 (PMID 31230110), abstract

| Mệnh đề | Đoạn nguồn |
| --- | --- |
| 17 nam, 10 tuần, 2 buổi/tuần, MRI; full squat (n = 8) so với half squat (n = 9) | "Seventeen males ... FST (n = 8) ... HST (n = 9) ... 10 weeks (2 days per week) ... magnetic resonance imaging". |
| Mông lớn tăng 6,7 ± 3,5% (full) so với 2,2 ± 2,6% (half); full lớn hơn có ý nghĩa, p = 0,008 | "adductor and gluteus maximus muscles significantly increased in FST (6.2 ± 2.6% and 6.7 ± 3.5%) and HST (2.7 ± 3.1% and 2.2 ± 2.6%) ... gluteus maximus (p = 0.008) ... significantly greater in FST". |
| Nhóm khép tăng 6,2 ± 2,6% (full) so với 2,7 ± 3,1% (half); full lớn hơn có ý nghĩa, p = 0,026 | cùng câu trên, "adductor (p = 0.026)". |
| Duỗi gối tăng ở cả hai nhóm (4,9% và 4,6%); thẳng đùi và gân kheo không đổi | "knee extensor muscles significantly increased by 4.9 ± 2.6% in FST and 4.6 ± 3.1% in HST ... rectus femoris and hamstring muscles did not change in either group". |

## Thay đổi trong mã

- `evidence-muscle.ts`: `TRAINING_GENERAL_GUIDANCE` đổi thành bản ghi bằng chứng đầy đủ (`sources`, `supportedClaims`, `limitations`, `reviewedBy: null`, `status`) cùng đoạn `text` giới thiệu; `acsm2026` và `kubo` cập nhật `access` và `checkedAt` = 2026-10-23 (đã đọc lại); mệnh đề glutes [3] và quads_adductors [2] bổ sung kết quả Kubo.
- `muscle-hypertrophy-atlas.ts`: `hypertrophyScience` của glutes và quads_adductors nêu kết quả Kubo (kèm "mẫu nhỏ").
- `TrainingGuidancePanel.tsx` (mới) dùng lại `ClinicalEvidencePanel` (thêm prop `defaultOpen`), mở sẵn, đặt đầu `TrainingAtlasExplorer`.
- `check-muscle-evidence.mjs`: kiểm tra từng mệnh đề guidance có [1] trỏ vào ACSM, các con số đã đọc, import trong Explorer và vị trí đầu tab, server-render thực tế của khối (tiêu đề, `open`, mệnh đề, liên kết, phạm vi truy cập), các con số Kubo ở mệnh đề và thẻ.

## Giới hạn còn lại

- ACSM: chỉ là tổng quan các tổng quan ở người lớn khỏe mạnh; phụ lục bổ sung chưa đọc; không phải đơn tập cá nhân hay hướng dẫn cho người bệnh/đang phục hồi. Các exercise records vẫn dùng mệnh đề "Hướng dẫn chung" cũ (còn khớp với bản đã đọc).
- Kubo: mẫu 17 nam, các con số lấy từ abstract, chưa đọc full text; không phải bằng chứng cho hack squat, kê gót, RDL hay split squat. Chưa đo độ sâu tương ứng với "full" và "half" trong ứng dụng.
- Chưa kiểm tra trực quan trên trình duyệt (controller làm ở cuối).
