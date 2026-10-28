# Hoàn tất bản sửa đề nhỏ NCSF tại local

Đối chiếu ngày **28/10/2026**. Ngân hàng tăng từ **344 lên 586 câu**: bổ sung 242 câu và sửa nội dung/phạm vi của 164 câu gốc, giữ nguyên vị trí câu gốc. Số 164 gồm sửa lời giải, bối cảnh và nguồn; không có nghĩa 164 khóa đáp án đều sai. Bản này **chưa được tải lên production**.

Đã áp dụng kết quả [audit trước đó](2026-10-27-ncsf-audit.md): đọc hai snapshot đề thử 150 câu trước khi rà toàn bộ 8 chương/532 trang và ngân hàng cũ. Đề thử 2 đã đối chiếu form hiện hành; đề thử 1 hiện yêu cầu đăng nhập, nên phần đó vẫn dựa snapshot. Không có khóa đáp án chính thức cho hai form trong dữ liệu đã đọc.

| Chương | Trước | Hiện tại | Câu mới | Câu gốc sửa nội dung | Câu hình thật |
|---|---:|---:|---:|---:|---:|
| 1 | 40 | 65 | 25 | 16 | 2 |
| 2 | 43 | 70 | 27 | 17 | 2 |
| 3 | 33 | 61 | 28 | 19 | 2 |
| 4 | 38 | 64 | 26 | 8 | 2 |
| 5 | 52 | 77 | 25 | 30 | 3 |
| 6 | 29 | 50 | 21 | 19 | 3 |
| 7 | 82 | 141 | 59 | 33 | 4 |
| 8 | 27 | 58 | 31 | 22 | 2 |
| **Tổng** | **344** | **586** | **242** | **164** | **20** |

## Cách hỏi và phần đã sửa

Ngân hàng dùng sáu dạng rút ra từ mẫu đã đọc: 196 nhận biết, 83 cơ chế/so sánh, 66 thông số, 34 tính toán, 187 tình huống và 20 hình/bảng. Tỷ lệ này là lựa chọn biên soạn cho bài luyện theo chương, không phải tỷ lệ dạng câu chính thức NCSF. Mỗi câu có bốn lựa chọn khác nhau và một khóa đáp án; vị trí A/B/C/D được xáo khi bắt đầu/làm lại.

Bổ sung theo yêu cầu: mỗi lần bấm “Đề thi nhỏ” bắt đầu lượt mới và xáo cả thứ tự câu hỏi. Chọn chương/bài/dạng hoặc làm lại cũng tạo thứ tự mới, dùng chỉ số câu gốc để giữ đúng đáp án, trang nguồn và nhóm câu sai. Thứ tự giữ ổn định trong lúc làm bài. Đã thử hai lượt 65 câu có thứ tự khác nhau nhưng cùng đủ bộ câu; rời rồi mở lại cũng đổi thứ tự; chấm thử 1/65 và làm lại 64 câu sai loại đúng câu đã làm đúng. Nhật ký tại `qa/question-shuffle-check.json`.

Các sửa đổi ưu tiên gồm phát biểu tuyệt đối, sai thuật ngữ/bản dịch, công thức và đơn vị, ngưỡng không có đối tượng áp dụng, giải thích vượt kết quả nghiên cứu và tình huống thiếu dữ kiện. Có đính chính cụ thể cùng nguồn/phạm vi/ngày đối chiếu sau khi nộp bài; khi đọc PDF, các đính chính liên quan xuất hiện ở đúng trang. PDF gốc giữ nguyên.

20 câu hình sử dụng **19 trang PNG từ PDF riêng tư**, có phóng to và cuộn trong khung. Đã xem lại toàn bộ 19 trang được dùng; sửa các transcript không đúng chữ trong hình. Các câu đọc nhãn/biểu đồ không cho sẵn toàn bộ số liệu cần đọc trong câu dẫn. Khi ảnh lỗi có thông báo và nút tải lại. Hình đi qua API đăng nhập, không nằm trong `public/`, không qua image optimizer và không được cache công khai.

Có 87 câu ghi rõ kiến thức bổ sung ngoài đoạn sách được liên hệ. Kiểm tra trích dẫn trang không được dùng để xác nhận kiến thức bổ sung; nguồn ngoài cùng mức truy cập được lưu tại từng câu. Các nguồn khác nhau có phạm vi toàn mục, trích đoạn hoặc abstract. Ví dụ lần rà cuối thu hẹp câu gai xương theo [NHS](https://www.nhs.uk/conditions/osteophyte/), công thức thông khí phút theo [Clinical Methods §43](https://www.ncbi.nlm.nih.gov/books/NBK365/) và MAP theo [NLM CDE](https://cde.nlm.nih.gov/deView?tinyId=OP3qopmP0oX); kiểm tra ngày 28/10/2026.

## Độ phủ và phần còn thiếu

**Chưa thể kết luận đã phủ hết kiến thức.** Các số sau chỉ là số mục tiêu có câu liên quan:

| Chỉ số | Audit ban đầu | Sau sửa |
|---|---:|---:|
| Mục tiêu có câu app | 311/377 | 366/377 |
| Có câu trong chính chương | 273/377 | 355/377 |
| Chỉ dựa vào chương khác | 38 | 11 |
| Chỉ có đề thử | 59 | 2 |
| Chưa có câu app | 66 | 11 |

Liên kết app được dựng lại từ nhãn mục tiêu đã rà, bỏ các liên kết cũ không còn phù hợp. Có đúng một ghi chú ngữ nghĩa cho từng mục tiêu: **69 đã lấy mẫu, 301 còn một phần, 7 có giới hạn nguồn**. Không dùng trạng thái “hoàn tất” tự động. Các mục nhiều ý như kỹ thuật 26 nhóm bài tập, lập chương trình và nhóm bệnh đặc biệt vẫn cần nhiều tình huống/kỹ năng hơn; một câu không đại diện toàn bộ mục tiêu.

Bảy giới hạn nguồn còn lại:

| Mục tiêu | Phần chưa đủ căn cứ để ra câu như một quy tắc chung |
|---|---|
| O1.042 | Mức kcal/tuần bắt buộc chung cho mọi người |
| O2.092 | Mục tiêu nguồn bị gộp/lỗi chữ, gồm vị trí chấn thương cột sống và ground reaction force |
| O3.098 | Phát biểu “lactate như chất đệm acid” chưa được đối chiếu đủ trong mục tiêu này |
| O4.176 | Thời hạn pháp lý lưu hồ sơ không có một số năm chung cho mọi thẩm quyền |
| O7.336 | Một tỷ lệ tăng cường độ cố định mỗi tuần |
| O7.354 | Cơ sở functional training chưa được phần giảng của chương trình bày đủ |
| O7.361 | Kỹ thuật kéo giãn đầy đủ cả bảy nhóm cơ được nêu |

Đã gắn 10 domain cho toàn bộ câu. Đây vẫn là ngân hàng luyện theo chương, **chưa phải đề mô phỏng 150 câu được lấy mẫu đúng trọng số blueprint**. Riêng Training Instruction có 33/586 câu (5,6%), thấp hơn tỷ trọng 16% trong [khung nội dung thi NCSF](https://www.ncsf.org/certification-exam/content) đã đọc trong audit. Không lấy số câu toàn chương để tuyên bố khớp blueprint; kỹ thuật/cue/spotting và kỹ năng thực hành vẫn là phần cần mở rộng.

## Kiểm tra đã thực hiện

- `npm run check:ncsf-quiz`: 12/12 kiểm tra runtime/coverage, gồm xáo thứ tự không mất/lặp câu hoặc thay khóa/trang nguồn; toàn bộ 586 câu qua kiểm tra định dạng, lựa chọn, khóa đáp án, trang/trích dẫn hoặc metadata nguồn bổ sung; 20 tham chiếu hình/19 tệp PNG qua kiểm tra. Không phát hiện câu dẫn trùng nguyên văn với hai mock theo phép chuẩn hóa, hoặc ứng viên gần trùng theo ngưỡng đã cấu hình. Đây là phép kiểm tra hữu hạn, không chứng minh độc lập nội dung.
- `npm run build`: thành công, bao gồm TypeScript. ESLint trên toàn bộ tệp NCSF thay đổi: đạt. Cảnh báo `metadataBase` hiện có vẫn xuất hiện trong build.
- React Doctor: cảnh báo ở `StudyChatWidget.tsx` thuộc thay đổi chat đang diễn ra riêng; không có chẩn đoán ở phần NCSF được rà. Không công bố toàn repo sạch cảnh báo.
- Review độc lập về yêu cầu và chất lượng mã: đã sửa hai phát hiện (kiểu trang JSON phải là số; mặc định uploader không đẩy lại PDF), sau đó được chấp nhận. Review nội dung độc lập bổ sung đã phát hiện và loại nhãn mục tiêu quá rộng ở Ch1/Ch2, sửa câu gai xương và hoàn thiện trạng thái Ch1–3.
- Trình duyệt: bộ lọc chương/bài/dạng; hình tải thật; phóng to; một đáp án đúng/một sai cho kết quả 1/2; làm lại chỉ còn câu sai; đính chính trang 38 Ch2; lỗi hình và tải lại sau phục hồi. Kiểm tra điện thoại 390×844 phát hiện tràn ngang khi zoom; đã sửa và đo lại body bằng viewport, ảnh cuộn bên trong khung.
- Gọi API localhost: chưa đăng nhập bị từ chối 401 với đề/hình/PDF; sau đăng nhập đọc được 586 câu và cả 20 tham chiếu hình; kiểm tra PNG, `private, no-store`, `Vary: Cookie` và giới hạn trang. Tham số vượt giới hạn/đường dẫn bị từ chối.
- Hash 8 PDF gốc, 2 mock snapshot và mục tiêu học tập không đổi so với manifest audit. Dữ liệu/hình được cấp quyền vẫn ở thư mục bị git bỏ qua.

Các kiểm tra phần mềm và so sánh nguồn không phải xác nhận lâm sàng. `reviewedBy: null`; không có thẩm định chuyên môn độc lập được ghi nhận.

## Tệp bàn giao và phát hành

Hồ sơ chi tiết trong `.data/ncsf/revision-2026-10-28/`: bản gốc, nhật ký từng nhóm chương, `revision-summary.json`, ảnh kiểm tra và `release-candidate/ncsf-2026-10-28-private.zip`. Gói riêng tư chứa đề, 19 hình và checksum, không chứa credential hoặc PDF gốc. Bảng từng mục tiêu nằm tại `.data/ncsf/coverage.md` và các `coverage-status-ch*.json`.

Mã và gói dữ liệu đã chuẩn bị tại local; **chưa upload ngân hàng/hình, chưa deploy code, chưa push/PR**. Cần phát hành giao diện/API cùng ngân hàng tương ứng; tải riêng câu phụ thuộc hình lên giao diện cũ sẽ làm bài không trả lời được. Uploader hiện mặc định chỉ cập nhật đề/hình, sao lưu đề cũ, đẩy hình trước rồi đề sau và đối chiếu hash tải xuống. Nhánh mã: `codex/ncsf-quiz-review-2026-10-28`.

Xem bản local bằng `NCSF_LOCAL_CONTENT=1 npm run dev`; vẫn dùng đăng nhập NCSF hiện có. Cờ này không có tác dụng ở production.
