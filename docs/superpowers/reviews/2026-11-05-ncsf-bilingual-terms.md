# Thuật ngữ Việt–Anh trong đề luyện NCSF

Rà ngày **05/11/2026**, theo yêu cầu thêm tiếng Anh bên cạnh thuật ngữ chuyên ngành trong câu hỏi và câu trả lời của từng chương. Đã đọc toàn bộ **586 câu**, các lựa chọn, lời giải, ghi chú đính chính và mô tả hình. **486 câu / 1.252 trường hiển thị** được bổ sung. Câu không đổi đã có cách ghi phù hợp hoặc không có thuật ngữ cần thêm trong lượt rà này.

| Chương | Câu đã rà | Câu bổ sung | Trường hiển thị bổ sung |
|---|---:|---:|---:|
| 1 | 65 | 55 | 118 |
| 2 | 70 | 57 | 166 |
| 3 | 61 | 50 | 119 |
| 4 | 64 | 46 | 108 |
| 5 | 77 | 63 | 175 |
| 6 | 50 | 35 | 89 |
| 7 | 141 | 126 | 340 |
| 8 | 58 | 54 | 137 |
| **Tổng** | **586** | **486** | **1.252** |

## Cách bổ sung và nguồn

Giữ từ tiếng Việt, thêm tên tiếng Anh trong ngoặc. Ví dụ ở chương 2: khớp bản lề (hinge joint), khớp trục (pivot joint), khớp cầu (ball-and-socket joint), khớp yên ngựa (saddle joint). Không thêm lặp một thuật ngữ nhiều lần trong cùng một trường; các lựa chọn độc lập vẫn có chú thích riêng. Với ngoặc chứa chữ viết tắt, có thể thêm tên đầy đủ vào trong ngoặc đó để tránh ngoặc lồng nhau.

Nguồn chính là giáo trình riêng tư của từng chương và transcript hình đã có. Nhật ký riêng ghi từng cặp thuật ngữ, trang chứa khái niệm, trang thực sự chứa chữ tiếng Anh, phạm vi đọc và ngày đối chiếu. Phân biệt nhãn nguyên văn với cách diễn đạt tiếng Anh chuẩn hóa về dạng từ hoặc tên đầy đủ; không giả nhận mọi cách diễn đạt là bản chép nguyên văn của sách. Không đưa ngân hàng đề hoặc toàn văn giáo trình vào git hay truy vấn web.

Các đối chiếu công khai chỉ gửi tên thuật ngữ ngắn. Nguồn bổ trợ đã đọc trong lượt này gồm [OpenStax A&P 2e §10.3](https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation), [§10.4](https://openstax.org/books/anatomy-and-physiology-2e/pages/10-4-nervous-system-control-of-muscle-tension), [§19.4](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-4-cardiac-physiology), [§20.2](https://openstax.org/books/anatomy-and-physiology-2e/pages/20-2-blood-flow-blood-pressure-and-resistance), [§24.2](https://openstax.org/books/anatomy-and-physiology-2e/pages/24-2-carbohydrate-metabolism), [NIAMS về DXA](https://www.niams.nih.gov/health-topics/bone-mineral-density-tests-what-numbers-mean), [NCI về BIA](https://cancercontrol.cancer.gov/brp/research/group-evaluated-measures/adopt/bis), [NIDDK về BMI](https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity/all-content) và [NIMH về tên rối loạn ăn uống](https://www.nimh.nih.gov/health/publications/eating-disorders). Phạm vi là các đoạn HTML/đoạn kết quả được ghi rõ ở từng nhật ký; không tuyên bố đã đọc toàn bộ mọi tài liệu được liên kết. Các nguồn và ngày đối chiếu y khoa cũ của câu hỏi được giữ nguyên.

## Kiểm tra và cập nhật

- Kiểm tra trước/sau từng trường của cả 586 câu: chỉ có phần chèn thêm, không mất ký tự gốc; thứ tự câu/lựa chọn, khóa đáp án, trang nguồn, trích dẫn nguyên văn, tham chiếu và metadata không đổi. Không tạo ngoặc mất cân bằng hoặc ngoặc lồng mới.
- Rà ngữ cảnh đã loại trường hợp ghép sai `cơ tim` trong cụm `nguy cơ tim mạch`; không dùng quy tắc thay chữ chung thiếu ngữ cảnh để phát hành. Review độc lập các trường thay đổi của chương 3/6 phát hiện trường hợp này và xác nhận đã sửa.
- `npm run check:ncsf-quiz`: 12 kiểm tra runtime/coverage đạt; toàn bộ 586 câu qua kiểm tra cấu trúc/trang trích dẫn/nguồn, 20 tham chiếu hình / 19 trang hình riêng tư hợp lệ, PDF gốc không đổi. Không có ứng viên trùng theo ngưỡng kiểm tra hiện tại.
- Bản ngân hàng trước sửa ở máy chủ trùng toàn bộ tám tệp local. Đã sao lưu, kiểm tra không có cập nhật đồng thời trước khi ghi, cập nhật duy nhất `quiz.json` trong bucket NCSF **riêng tư**, rồi tải xuống đối chiếu SHA-256 thành công. Không tải lại PDF/hình, không thay quyền truy cập, không deploy mã.
- SHA-256 ngân hàng sau cập nhật: `0facba40ac806b8d154f803117d0a39b076fd662d7eb376b743b23b446ce83e2`.
- Đã tải lại bản ứng dụng thật tại localhost, mở Đề thi nhỏ và chương 2: câu về khớp cổ tay–bàn tay hiển thị đủ bốn nhãn Việt–Anh. Chụp kiểm tra 1440×900 và 390×844; bề ngang body lần lượt bằng viewport, không tràn ngang. Không chọn đáp án hoặc nộp lượt luyện; kiểm tra khóa đáp án bằng đối chiếu dữ liệu trước/sau. Đã trả viewport về mặc định.

Hồ sơ chi tiết, bản sao lưu, cặp thuật ngữ/trang nguồn, kiểm tra trước/sau và biên nhận cập nhật nằm tại `.data/ncsf/terminology-2026-11-05/` (gitignored). Có thể phục hồi từ `remote-before.json`; `release.json` ghi checksum và thời điểm ghi thực tế. Không chứa credential trong hồ sơ phát hành.

Đây là lượt rà thuật ngữ của ngân hàng luyện theo chương, không sửa hai đề thử 150 câu gốc và không thay nội dung PDF. Không phải tái thẩm định lâm sàng toàn bộ chương trình hoặc xác nhận chuyên gia; `reviewedBy: null`. Những giới hạn kiến thức/đính chính/ngưỡng cá nhân đang có vẫn giữ nguyên.
