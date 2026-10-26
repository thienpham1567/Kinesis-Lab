# Đề xuất nguồn embedding cho chat

Ngày kiểm tra: 2026-10-26. Đây là ghi nhận nghiên cứu **trước triển khai**, giữ nguyên phạm vi truy cập tại thời điểm đề xuất. Trạng thái hiện tại và 3 nguồn đã nạp được ghi trong [báo cáo production](../superpowers/reviews/2026-10-26-chat-production-rag.md).

## Yêu cầu và hiện trạng

Người dùng muốn kho kiến thức dựa trên nhiều nguồn chuyên môn uy tín. NCSF là giáo trình bổ trợ, không là nguồn bao phủ mọi câu hỏi hoặc nguồn mặc định cho quyết định lâm sàng.

Lần rà soát trước đã kiểm tra Supabase cấu hình trong `.env.local`: `knowledge_documents`, `knowledge_chunks` và số chunk có embedding đều bằng 0. Chat có tìm RAG, tìm PubMed theo chủ đề cố định và chọn các hồ sơ bằng chứng được biên soạn trong app theo từ khóa. Không có pipeline nạp nguồn công khai vào RAG trong mã nguồn đã rà soát. Thư viện NCSF phục vụ PDF từ bucket riêng.

## Danh sách nguồn ban đầu

Các mục dưới đây là ứng viên theo chủ đề, không phải tuyên bố đã thẩm định toàn bộ nội dung hay xác nhận đây là tài liệu mới nhất. Phải kiểm tra bản cập nhật, đính chính, rút bài và chất lượng phương pháp trước khi kích hoạt từng tài liệu. Không nạp hình ảnh/tài liệu bên thứ ba chỉ vì văn bản chính có giấy phép mở.

| Tài liệu | Vai trò dự kiến | Phạm vi truy cập thực tế ngày kiểm tra | Quyền sử dụng và bước tiếp theo |
| --- | --- | --- | --- |
| [WHO 2020 guidelines on physical activity and sedentary behaviour — bài báo BJSM](https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/), DOI `10.1136/bjsports-2020-102955` | Khuyến nghị hoạt động thể chất, phân theo quần thể | Đã đọc metadata, abstract và thông tin CC BY từ kết quả tìm kiếm chính nguồn PMC; mở HTML trực tiếp gặp CAPTCHA | Bài báo ghi CC BY 4.0; ứng viên nạp. Cần lấy toàn văn qua dịch vụ PMC được phép và kiểm tra nội dung thực nhận trước khi nạp. Không suy giấy phép này cho sách WHO cùng chủ đề. |
| [IUSCA 2021: Resistance Training Recommendations to Maximize Muscle Hypertrophy in an Athletic Population](https://journal.iusca.org/index.php/Journal/article/view/81), DOI `10.47206/ijsc.v1i1.81` | Đồng thuận về tập phì đại trong quần thể thể thao | Đã đọc trang tạp chí: tác giả, abstract, ngày xuất bản và giấy phép; chưa đọc PDF | Trang bài ghi CC BY 4.0. Cần đọc PDF, kiểm tra cập nhật và giữ giới hạn quần thể trước khi nạp. |
| [Verville et al. 2023: Benefits and Harms of Structured Exercise Programs for Chronic Primary Low Back Pain in Adults](https://link.springer.com/article/10.1007/s10926-023-10124-4), DOI `10.1007/s10926-023-10124-4` | Tổng quan hệ thống phục vụ xây dựng hướng dẫn WHO về đau lưng mạn nguyên phát | Truy cập được HTML toàn văn; đã đọc abstract, phương pháp, phạm vi chọn mẫu và mục quyền sử dụng. Chưa rà soát tất cả bảng/phụ lục | Nhà xuất bản ghi CC BY 4.0. Ứng viên nạp phần văn bản sau khi rà soát đủ phạm vi sẽ sử dụng. |
| [Grooten et al. 2022: Summarizing the effects of different exercise types in chronic low back pain](https://link.springer.com/article/10.1186/s12891-022-05722-x), DOI `10.1186/s12891-022-05722-x` | Nguồn tổng quan bổ sung để đối chiếu chất lượng và khác biệt giữa các tổng quan | Truy cập được HTML toàn văn; đã đọc abstract và tiêu chí chọn; thông tin CC BY 4.0 hiện trong kết quả tìm kiếm PDF của nhà xuất bản | Cần xác nhận lại giấy phép trong bản tải thực nhận. Đánh dấu khả năng chồng lặp nghiên cứu với tổng quan khác, không đếm các tổng quan như bằng chứng độc lập. |
| [ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults](https://doi.org/10.1249/MSS.0000000000003897), DOI `10.1249/MSS.0000000000003897` | Tài liệu chuyên ngành quan trọng để đối chiếu tập kháng lực ở người lớn khỏe mạnh | Đã đọc metadata và các đoạn phương pháp/phạm vi từ kết quả tìm kiếm của nhà xuất bản; mở DOI trực tiếp không thành công | Chưa xác nhận giấy phép từ bản chính truy cập trực tiếp; để ở danh sách đối chiếu, chưa đưa vào danh sách tự động nạp. |

## Nguồn cần phân biệt quyền truy cập với quyền đưa vào AI

- [PMC Open Access Subset](https://pmc.ncbi.nlm.nih.gov/tools/openftlist/) yêu cầu kiểm tra giấy phép từng bài, không phải toàn bộ PMC đều được tái sử dụng. Tải tự động qua các dịch vụ được PMC cho phép; không crawl HTML hàng loạt. PubMed dùng để phát hiện tài liệu, không làm nhãn bảo chứng chất lượng.
- [NICE](https://www.nice.org.uk/reusing-our-content/nice-uk-open-content-licence) ghi việc dùng nội dung cho AI không thuộc giấy phép mở thông thường; [API syndication](https://www.nice.org.uk/reusing-our-content/nice-syndication-api) có quy trình cấp phép cho cách sử dụng cụ thể. Chưa tự động nạp toàn văn NICE.
- [OpenStax Anatomy and Physiology 2e](https://openstax.org/books/anatomy-and-physiology-2e/pages/preface) hiện ghi CC BY-NC-SA và yêu cầu chấp thuận bằng văn bản cho việc đưa nội dung vào sản phẩm AI. Chưa tự động nạp bản hiện tại. Ghi nhận này không tự sửa hoặc đánh giá lại các trích dẫn có sẵn của app.
- [WHO copyright](https://www.who.int/about/policies/publishing/copyright) yêu cầu kiểm tra từng ấn phẩm, trong đó có giới hạn sử dụng thương mại. Không gán giấy phép bài báo CC BY cho toàn bộ website hoặc guideline PDF của WHO.
- [NCI](https://www.cancer.gov/policies/copyright-reuse) cho phép tái sử dụng văn bản của mình trừ ngoại lệ ghi riêng. [SEER Anatomy & Physiology](https://training.seer.cancer.gov/anatomy/) là ứng viên cho kiến thức nền; mới xác định mục lục và chính sách chung, chưa đọc/chấp nhận từng chương. Nguồn này không bao phủ đầy đủ cơ sinh học hay phục hồi chức năng.

Đối với NCSF, quyền cung cấp PDF trong thư viện đã được người dùng ghi nhận trước đây; không tự diễn giải điều đó thành quyền cho mọi hình thức sử dụng AI. Không đưa NCSF vào đợt nạp nguồn công khai này.

## Lựa chọn kiến trúc

1. Chỉ kho embedding đã tuyển chọn: dễ kiểm soát nguồn và tái hiện câu trả lời, nhưng cần bổ sung phiên bản mới bằng quy trình nạp.
2. **Kho embedding đã tuyển chọn + tìm PubMed bổ sung khi cần (đề xuất):** có nền tài liệu truy xuất ổn định và phát hiện nghiên cứu mới. Kết quả tìm mới phải hiển thị riêng, kèm phạm vi abstract/toàn văn, không tự trở thành nguồn đã tuyển chọn.
3. Chỉ tìm trực tiếp mỗi câu hỏi: triển khai kho nhỏ hơn nhưng kết quả phụ thuộc truy vấn, khó kiểm soát chất lượng và tính ổn định; không đáp ứng mong muốn có kho embedding thực sự.

## Thiết kế đề xuất để duyệt

- Bắt đầu với hoạt động thể chất, tập kháng lực/phì đại và đau lưng mạn, là các chủ đề có ứng viên cụ thể ở trên. Công khai các chủ đề chưa đủ nguồn; mở rộng giải phẫu, vai/gối, bệnh nền, dinh dưỡng sau khi chọn được tài liệu cho từng chủ đề. Không coi vài tài liệu là đã bao phủ toàn bộ ứng dụng.
- Danh mục tài liệu giữ tiêu đề, tác giả/tổ chức, DOI/PMID/URL, loại tài liệu, ngày xuất bản/cập nhật, quần thể, phạm vi đọc, giấy phép và bằng chứng cho quyền sử dụng, ngày kiểm tra, checksum và trạng thái hoạt động/thay thế/rút bài. `reviewedBy` giữ null nếu không có người review thực tế.
- Pipeline tách theo mục/đoạn; giữ tiêu đề mục, trang PDF hoặc vị trí HTML. Không cắt rời điều kiện áp dụng, khuyến nghị và giới hạn. Lưu model embedding và kích thước vector; nạp lại không tạo bản sao, thay đổi nguồn tạo phiên bản mới.
- Dùng hạ tầng Supabase pgvector và OpenRouter hiện có. Tìm kết hợp ngữ nghĩa/từ khóa, mở rộng truy vấn Việt–Anh theo thuật ngữ có kiểm soát. Chỉ lấy nguồn đang hoạt động và phù hợp chủ đề/quần thể; thứ hạng vector không tự là mức độ bằng chứng. Không cố định ưu tiên guideline hơn mọi nghiên cứu bất kể phạm vi hoặc tuổi nguồn.
- Câu trả lời gắn nguồn cạnh nhận định và có danh sách đoạn truy xuất, phiên bản, URL/vị trí, phạm vi đọc. Có thể xem tài liệu nào thực sự được cung cấp cho model. Đoạn được truy xuất không chứng minh model đã sử dụng đúng hoặc mọi nhận định đã được kiểm chứng.
- Kho rỗng, thiếu nguồn liên quan, lỗi embedding và lỗi tìm PubMed có trạng thái khác nhau, được thông báo rõ. Không báo đã đối chiếu sách khi không có đoạn nào.
- Không chuyển hồ sơ học viên sang truy vấn PubMed. Mọi tài liệu là dữ liệu không tin cậy; giữ giới hạn điều trị cá nhân, mô phỏng và đo lường của chính sách hiện có. Không thêm cổng chờ chuyên gia duyệt phổ quát.
- Kiểm tra bằng các câu hỏi Việt/Anh cho từng chủ đề, nguồn không liên quan, phạm vi quần thể không khớp, nguồn hết hiệu lực, lỗi nhà cung cấp, nạp lặp và khớp citation với đoạn thực tế. Kiểm tra kỹ thuật và so nguồn không là xác nhận lâm sàng.

## Trạng thái tại thời điểm đề xuất

Chưa có nguồn mới nào được lưu vào Supabase hoặc gửi sang dịch vụ embedding. Chưa sửa schema, backend hay giao diện. Danh sách này hỗ trợ chốt thiết kế trước khi triển khai; việc có giấy phép phù hợp không thay thế đánh giá chất lượng chuyên môn.
