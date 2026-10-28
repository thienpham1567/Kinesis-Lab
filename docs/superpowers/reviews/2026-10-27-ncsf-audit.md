# Rà soát NCSF CPT: câu hỏi, kiến thức và hình ảnh

Ngày đối chiếu: **27/10/2026**. Đây là rà soát AI có đối chiếu nguồn, không phải chứng nhận lâm sàng. Không có người thẩm định chuyên môn độc lập; `reviewedBy: null`. Ngân hàng câu hỏi, PDF gốc và nội dung đang phục vụ chưa được sửa trong lượt này.

**Kết luận: bộ đề nhỏ hiện chưa bao phủ đủ kiến thức/kỹ năng, và một số câu hoặc phần giải thích cần sửa trước khi tiếp tục mở rộng.** Bảng coverage cũ đếm việc có dẫn chiếu, chưa chứng minh rằng từng ý trong mục tiêu được hỏi đúng và đủ. Bám nguồn NCSF là cần thiết, nhưng vẫn phải kiểm tra lỗi nguồn, dịch thuật và giới hạn áp dụng.

## Phạm vi và khả năng truy cập nguồn

Hai snapshot đề thử được đọc trước khi rà chương: **150 + 150 câu**, gồm toàn bộ câu dẫn và lựa chọn. Hai PDF đề thử chỉ là trang bìa có liên kết tới form.

- **Đề thử 1:** đã đọc snapshot riêng tư sẵn có; form hiện hành yêu cầu đăng nhập. Chưa xác minh lại được nội dung/ảnh của form hiện tại. Không có đáp án chính thức trong snapshot.
- **Đề thử 2:** đọc được form hiện hành; toàn bộ 150 câu dẫn và lựa chọn khớp snapshot. Không có khóa đáp án chính thức trong dữ liệu đã đọc.
- **Đề nhỏ của app:** 344 câu trong 8 chương; đã đối chiếu toàn bộ JSON đang phục vụ trong bucket riêng, giống bản cục bộ.
- **Đề ôn tập theo bài trên NCSF:** đề cương có 40 liên kết; 39 bộ truy cập được, tổng **1.969 câu dẫn/lựa chọn**. Bộ Chương 1, Bài 5 đã đóng, không trả nội dung câu hỏi. Không nộp form hoặc tự gán đáp án chính thức.
- **Giáo trình:** 8 chương, **532 trang PDF**, gồm phần chữ và hình/bảng. Nhật ký xem trang, hình cần phóng lớn, câu được rà và phạm vi nguồn ngoài nằm trong hồ sơ chi tiết riêng tư.
- **Khung thi hiện hành:** đọc Candidate Handbook trang 13–19 và 37–41; trực tiếp xem hình trang 14–18. Không coi các trang còn lại của handbook là đã đọc.

Tệp nguồn và bản trích xuất giữ trong `.data/ncsf/`, không đưa PDF, hình hoặc toàn bộ ngân hàng câu hỏi vào git/public. Hồ sơ có dấu SHA-256 để xác định chính xác phiên bản được rà.

## Coverage hiện tại

Các số sau là **số mục tiêu có liên kết**, không phải tỷ lệ kiến thức đã được kiểm tra đúng. “Chỉ đề thử” nghĩa là chưa có câu app được gắn; “chưa có” là các dòng được ghi lý do thiếu nội dung giáo trình.

| Chương | Trang | Câu app | Mục tiêu | Có liên kết app | Trong chính chương | Chỉ đề thử | Chưa có |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1. Sức khỏe/thể chất | 48 | 40 | 44 | 37 | 30 | 7 | 0 |
| 2. Giải phẫu/chỉ dẫn tập | 77 | 43 | 51 | 39 | 37 | 10 | 2 |
| 3. Hệ năng lượng | 48 | 33 | 38 | 26 | 23 | 12 | 0 |
| 4. Sàng lọc/đánh giá | 70 | 38 | 44 | 37 | 31 | 4 | 3 |
| 5. Dinh dưỡng | 67 | 52 | 58 | 52 | 49 | 6 | 0 |
| 6. Quản lý cân nặng | 37 | 29 | 39 | 34 | 30 | 5 | 0 |
| 7. Thiết kế chương trình | 153 | 82 | 88 | 71 | 63 | 15 | 2 |
| 8. Nhóm đặc biệt | 32 | 27 | 15 | 15 | 10 | 0 | 0 |
| **Tổng** | **532** | **344** | **377** | **311** | **273** | **59** | **7** |

**311/377 = 82,5% chỉ phản ánh có tham chiếu.** Có 38 mục tiêu hoàn toàn dựa vào câu ở chương khác. Người chỉ làm đề chương của mình không gặp các câu đó. Có 66 dòng chưa có câu app được gắn; số lỗ hổng thực tế còn lớn hơn vì mục tiêu đa ý đang bị gộp.

Các bài đều có câu hỏi, nhưng số lượng theo bài không chứng minh độ bao phủ. Ví dụ:

- **O2.093** gộp 26 nhóm bài tập, có thêm biến thể một/hai chân, cùng tư thế, cơ tham gia, lỗi và spotting. Không thể đánh dấu hoàn tất nhờ một câu về một cơ hay một bài tập.
- **O7.361** yêu cầu biết cách giãn 7 nhóm cơ. Việc tên bài xuất hiện trong bảng chương trình không chứng minh đã có hướng dẫn kỹ thuật hoặc câu kiểm tra tương ứng.
- **O3.122** gộp nhiều định nghĩa; câu hỏi về DOMS không thay thế câu về thể tích nhát bóp, thiếu máu cục bộ hay ức chế đối ứng.
- **O7.329** yêu cầu xây dựng chương trình; câu nhận biết tên giai đoạn chưa đo được khả năng chọn tổ hợp bài, tải, hiệp, lặp và nghỉ.
- **Chương 8 có liên kết cho 15/15 mục tiêu**, nhưng từng mục gộp nhiều bệnh, mức độ, chống chỉ định và cách điều chỉnh. Vì vậy không thể công bố “100% kiến thức đã cover”.

59 mục chỉ có trong đề thử cần được đưa vào đề nhỏ bằng câu mới kiểm tra cùng kiến thức. Tránh sao chép câu dẫn không có nghĩa là loại kiến thức đó khỏi phần luyện theo chương.

7 lý do “thiếu nội dung sách” cũng cần xét lại theo từng trường hợp. Đạo đức, học tập liên tục và phạm vi hành nghề có nguồn NCSF hiện hành; các con số pháp lý hoặc tăng tải cố định phải có bối cảnh phù hợp, không tự bịa để lấp ô. [NCSF Code of Ethics](https://www.ncsf.org/about/code-of-ethics), đọc phần Ethical Foundations và Code of Conduct ngày 27/10/2026.

## Hình ảnh chưa được kiểm tra bằng câu hỏi thực sự

Có **12 câu `source: image`**, nhưng đây chỉ là câu lấy trích dẫn từ chữ trong hình. Dữ liệu câu hỏi và giao diện hiện không đưa ảnh vào câu hỏi: **0 câu yêu cầu người học quan sát ảnh thật**.

Các nhóm còn thiếu rõ nhất:

- Nhận diện mặt phẳng, chuyển động khớp, cơ chính và nhóm ổn định qua ảnh.
- Nhìn tư thế/kỹ thuật, chọn cue hoặc cách điều chỉnh phù hợp; nhận biết spotting.
- Nhận diện nhóm cơ đang được giãn, vị trí sai hoặc giới hạn vận động.
- Đọc nhãn thực phẩm, bảng đánh giá và biểu đồ; phân biệt số liệu với hình minh họa sơ đồ.
- Đọc một chương trình mẫu rồi phát hiện tổ hợp tải/lặp/nghỉ/thứ tự không phù hợp mục tiêu.

Hình/bảng nguồn cũng có lỗi cần xử lý. Ví dụ bảng corrective exercise Chương 2 trang 74–75, bảng plumb line Chương 4 trang 35–36 và bảng overhead squat trang 67–68 có khác biệt giữa bản tiếng Anh và tiếng Việt. Không nên dùng bản dịch đó làm khóa đáp án trước khi đối chiếu từng hàng. Chi tiết và phạm vi xem hình nằm trong báo cáo theo chương.

## Những việc cần sửa trước

P1 là lỗi nội dung/đáp án hoặc khái quát có thể gây hiểu sai đáng kể. P2 là thiếu bối cảnh, câu mơ hồ hoặc thiếu kỹ năng. Một câu có thể chỉ sai ở phần giải thích; không được suy ra mọi câu được gắn cờ đều có khóa đáp án sai.

| Vị trí | Vấn đề ưu tiên | Hướng xử lý |
|---|---|---|
| Ch2#3; Ch2#19 | Khẳng định tuyệt đối về khớp yên ngựa và gối vượt mũi chân | Sửa phạm vi phát biểu; không biến mô tả tải thành quy tắc cấm chung. Xem hồ sơ Ch1–3 và nguồn tại từng phát biểu. |
| Ch2 trang 38, 74–75; Ch2#42 | Thuật ngữ/chuyển động và bảng dịch không thống nhất | Tạo errata được dẫn nguồn; sửa giải thích câu app liên quan. |
| Ch3#9 | Giải thích gắn ngưỡng RPP với kết luận nguy cơ chung | Giữ công thức nếu đúng; bỏ diễn giải lâm sàng vượt nguồn. Xem hồ sơ Ch1–3. |
| Ch5#19/#37 | Dạy một UL protein chung ở 2 g/kg | Bỏ ngưỡng độc tính tự nhận này; phân biệt phạm vi người khỏe với bệnh thận. [NIH ODS, mục Protein/Safety](https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/). |
| Ch5#21 | Mọi vitamin tan trong nước đều không được dự trữ | Sửa tuyệt đối hóa; B12 là phản ví dụ rõ. [NIH ODS B12, Introduction và Deficiency](https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/). |
| Ch6#6 | Ghi tên Cunningham nhưng dùng phương trình khác | Thống nhất tên/công thức/đáp án; công thức Cunningham trong abstract gốc là `500 + 22 × LBM`. [Cunningham 1980, abstract](https://pubmed.ncbi.nlm.nih.gov/7435418/). |
| Ch7#49 | Nhầm MET tổng với phần dự trữ, gọi kết quả tổng đúng là sai | Tách rõ gross/net/reserve và việc cộng phần nghỉ; sửa đáp án/giải thích. Có phép tính kiểm tra trong hồ sơ Ch7–8. |
| Ch7#9/#36 | Giải thích biến tần suất cao, tập tới failure và khối lượng lớn thành điều kiện bắt buộc tăng cơ | Viết lại theo mục tiêu, tổng tải và người tập. Hướng dẫn ACSM hiện hành không coi failure là bắt buộc cho người lớn khỏe mạnh nói chung. [ACSM 2026, bản tóm tắt chính thức](https://acsm.org/resistance-training-guidelines-update-2026/). |
| Ch7#33; đề gốc Ch7 B3 | Dùng da khô/không ra mồ hôi để nhận diện sốc nhiệt | Không loại trừ sốc nhiệt vì còn ra mồ hôi. Xem nguồn CDC/NIOSH và các câu bị ảnh hưởng trong hồ sơ Ch7–8. |
| Ch8#26; trang 16–17 | Lẫn NYHA class I–IV với stage A–D | Sửa cả tên phân loại và mô tả class I. [American Heart Association, bảng Classes/Stages](https://www.heart.org/en/health-topics/heart-failure/what-is-heart-failure/classes-of-heart-failure). |
| Ch8 phần tim mạch, biến chứng tiểu đường, thai kỳ | Thiếu mức độ bệnh, trạng thái ổn định và điều kiện áp dụng | Thay câu phần trăm chung bằng tình huống có đủ dữ kiện, hành động phù hợp và giới hạn cụ thể. Xem hồ sơ Ch7–8. |

Các nguồn ngoài trong bảng được kiểm tra ngày **27/10/2026**. NIH ODS: đọc các mục được nêu; Cunningham: abstract; ACSM: bản tóm tắt chính thức, không nhận đã đọc toàn bộ position stand; AHA: phần stages và bảng NYHA. Các nguồn/giới hạn khác nằm cạnh từng nhận xét trong hồ sơ chương, gồm thuốc đã rút khỏi thị trường, hydrat hóa, supplement, rối loạn ăn uống và các phép đo.

Lỗi ngay trong mẫu chính thức cũng phải ghi nhận: câu về huyết áp ở đề thử 1 số 120 và handbook trang 15 dùng HR × sức cản, thiếu thành phần thể tích nhát bóp. Nguồn NINDS/NLM mô tả MAP qua cung lượng tim, sức cản hệ thống và áp lực tĩnh mạch trung tâm. [NLM CDE, đọc toàn bộ định nghĩa ngày 27/10/2026](https://cde.nlm.nih.gov/deView?tinyId=OP3qopmP0oX). Không dùng uy tín nguồn để hợp thức hóa một công thức thiếu thành phần.

## Pattern nên dùng để biên soạn lại

Hai đề có **41 câu dẫn trùng nhau** sau khi chuẩn hóa số câu/khoảng trắng; 39 câu trùng cả lựa chọn. Đề 2 hiện hành thiếu số 15, có hai số 150, và câu 125 chỉ có 3 lựa chọn. Vì vậy học cách hỏi và kỹ năng được kiểm tra, đồng thời sửa các lỗi hình thức/độ đúng thay vì sao chép nguyên mẫu.

| Dạng | Kỹ năng cần đo | Yêu cầu khi viết |
|---|---|---|
| Nhận biết | Định nghĩa, cấu trúc, chức năng, nhóm cơ | Một mục tiêu rõ; tránh đáp án gần đồng nghĩa. |
| Cơ chế/so sánh | Giải thích vì sao; phân biệt khái niệm dễ lẫn | Distractor là lỗi hiểu thường gặp, cùng cấp độ với đáp án. |
| Thông số | Đọc và chọn ngưỡng/phạm vi | Có đối tượng, điều kiện, đơn vị, phiên bản nguồn/bảng. |
| Tính toán | Áp dụng HRR, MET/kcal, tải/lặp, thành phần cơ thể | Đủ dữ kiện, công thức đúng, quy tắc làm tròn; chỉ một đáp án. |
| Tình huống | Chọn bài, hệ tập, cue, điều chỉnh hoặc hành động sàng lọc | Có mục tiêu và giới hạn cần thiết; hỏi một quyết định. |
| Hình/bảng | Quan sát, nhận diện, diễn giải và phát hiện lỗi | Có hình/bảng thực sự, đúng nhãn, đủ rõ, quyền sử dụng phù hợp; không lộ đáp án. |

Mỗi câu nên gắn **mục tiêu nguyên tử + dạng tư duy + nguồn trang/hình + giải thích đáp án và từng distractor + ngày kiểm tra**. Khi nội dung đã lỗi thời hoặc có nguồn khác nhau, phải nói rõ phạm vi “theo giáo trình/bảng X” và có errata; cách ghi đó không cho phép tiếp tục dạy một khẳng định y khoa sai như kiến thức hiện hành.

Candidate Handbook trang 13 mô tả ba mức ghi nhớ, áp dụng và phân tích. Không có tỷ lệ cho ba mức đó trong phần đã đọc; mọi tỷ lệ phối hợp câu do app chọn phải ghi là quyết định thiết kế nội bộ.

## Đối chiếu khung thi hiện hành

NCSF hiện công bố 150 câu trắc nghiệm, tối đa 3 giờ, với **10 mảng** sau. Đây là trọng số mảng nội dung, không phải tỷ lệ các kiểu câu. [NCSF Exam Content, kiểm tra ngày 27/10/2026](https://www.ncsf.org/certification-exam/content).

| Mảng | Tỷ trọng | Liên hệ với giáo trình hiện tại |
|---|---:|---|
| Functional Anatomy | 12% | Chủ yếu Ch2 |
| Exercise Physiology | 9% | Ch2–3 và phần thích nghi Ch7 |
| Health and Physical Fitness | 11% | Chủ yếu Ch1 |
| Screening and Evaluation | 11% | Chủ yếu Ch4 |
| Nutrition | 7% | Chủ yếu Ch5 |
| Weight Management | 8% | Ch6 và phần năng lượng Ch7 |
| Exercise Programming | 19% | Chủ yếu Ch7 |
| Training Instruction | 16% | Kỹ thuật/cue/spotting Ch2, Ch7; cần câu hình/thực hành |
| Special Populations | 4% | Chủ yếu Ch8, liên kết kiến thức bệnh Ch1 |
| Professionalism and Risk Management | 3% | Ch4, an toàn Ch7 và nguồn nghề nghiệp bổ sung |

Liên hệ chương trong bảng là phân loại phục vụ audit, không phải ánh xạ chính thức NCSF. Hệ thống hiện chưa gắn đủ 10 domain vào từng câu để đo tỷ trọng thực tế của ngân hàng. Không thể lấy số câu của 8 chương rồi tuyên bố đã đúng blueprint. Đặc biệt phải đo riêng **hướng dẫn kỹ thuật** và **chuyên nghiệp/quản lý rủi ro**.

## Thứ tự xử lý sau audit

1. **Sửa lỗi P1 trước**, gồm thân câu, khóa đáp án và phần giải thích; thêm errata theo trang cho nguồn PDF, giữ nguyên bản gốc được cấp quyền.
2. **Tách mục tiêu đa ý thành các kỹ năng có thể kiểm tra.** Lưu coverage riêng theo chương, theo bài, toàn ngân hàng và 10 domain. Các trạng thái nên phân biệt đầy đủ/một phần/chưa có/thiếu nguồn.
3. **Lấp 59 mục đang chỉ dựa vào đề thử và xử lý 7 dòng thiếu nguồn**, đồng thời bổ sung phần thiếu của các mục đã được gắn câu. Chưa thể chốt số câu mới chỉ từ 66 dòng này.
4. **Thêm câu hình/bảng và tình huống thực hành** từ nội dung đã đối chiếu, có quyền dùng và có nguồn. Đảm bảo khả năng hiển thị hình trong câu hỏi trước khi tính visual coverage.
5. **Rà lại đáp án duy nhất, phép tính, đơn vị và ngữ cảnh**, rồi chạy kiểm tra dữ liệu và kiểm tra coverage. Không coi kiểm tra phần mềm là kiểm chứng y khoa.

## Hồ sơ chi tiết và kiểm chứng

Hồ sơ riêng tư tại **`.data/ncsf/review-2026-10-27/`**:

- `README.md`, `parent-findings.md`: phạm vi đọc, pattern, truy cập nguồn và giới hạn.
- `ch1-3.md`, `ch4-6.md`, `ch7-8.md` và các ledger JSON: từng câu được gắn cờ, vị trí hình/bảng, mục tiêu bị ảnh hưởng, nguồn và mức độ đã đọc.
- `objective-matrix.csv`: 377 dòng mục tiêu và các liên kết hiện có.
- `quiz-gaps.csv`: 66 dòng chưa có câu app được gắn.
- `coverage-summary.json`, `mock-exam-audit.json`, `official-structure-audit.json`: số liệu tái tính.
- `official-form-status.csv`: 40 bộ theo bài, trạng thái từng bộ; 39 bộ đọc được.
- `source-manifest.json`: dấu phiên bản nguồn; `remote-quiz.json`: bản đang phục vụ đã đối chiếu.

`npm run check:ncsf-quiz` kiểm tra được định dạng, vị trí dẫn chứng, trùng câu theo quy tắc và sự tồn tại của liên kết. Các kiểm tra này hiện vẫn đạt dù có những lỗi nội dung nêu trên. Chúng không kiểm tra được toàn bộ tính đúng y khoa, tính duy nhất của mọi đáp án, hiểu hình hay độ bao phủ ngữ nghĩa.

Giới hạn còn lại được ghi rõ: bộ Ch1/B5 đã đóng; đề thử 1 hiện yêu cầu đăng nhập; không có khóa đáp án chính thức cho các form; không khẳng định mọi câu không bị gắn cờ đã được xác nhận khoa học. Đây là điều kiện phạm vi nguồn, không phải yêu cầu chờ chuyên gia phê duyệt để sử dụng kiến thức giáo dục đã được hỗ trợ.
