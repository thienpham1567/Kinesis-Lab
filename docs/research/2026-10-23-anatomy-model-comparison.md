# Thử model ảnh cho giải phẫu cơ thể

Ngày thực hiện: 2026-10-23, Asia/Ho_Chi_Minh. Mục tiêu theo đính chính của người dùng: minh họa cơ thể, cơ–xương–gân, không yêu cầu bài tập.

## Giao thức

Một request mới/model cho cùng prompt giải phẫu, không tham chiếu ảnh, n=1, resolution=1K, aspect_ratio=4:3. Cố định provider; không fallback hay tự động thử lại. Prompt đầy đủ và SHA256 nằm trong [protocol](assets/2026-10-23-anatomy-model-comparison/protocol.json). Chỉ thực hiện text-to-image; chưa thử chỉnh sửa hoặc khả năng giữ hình tham chiếu. Không sửa default FLUX hoặc route app cho bài thử này.

Brief: một chi trên phải nhìn trước, từ đai vai đến bàn tay; tập trung cơ nhị đầu cánh tay, lớp cơ cánh tay nằm sâu; cơ đỏ trầm, gân ngà, xương trắng ngà, nền sáng, không chữ hay mũi tên. Đây là minh họa mô hình mô phỏng, không ảnh mô người thật.

## Kết quả thực tế

| Model / provider cố định | Kết quả | Thời gian request | Chi phí usage.cost | Kích thước |
| --- | --- | --- | --- | --- |
| google/gemini-nano-banana-2.1 / google-ai-studio | HTTP 429 từ provider: exceeded current quota; không có ảnh | 1.058 giây | Không có usage; chưa xác nhận phí | — |
| bytedance-seed/seedream-5-0-flash / seed | HTTP 200, một JPEG | 16.833 giây | $0.018 | 1110 × 832 |

Receipt giữ request và metadata thực tế tại cùng thư mục assets. Không chứa khóa API. Không được chấm chất lượng Nano hoặc tuyên bố Seedream thắng Nano khi Nano không trả ảnh. Lỗi quota nêu tên Google AI Studio; chưa xác định nguyên nhân cấu hình quota từ phía tài khoản/provider.

## Đọc ảnh Seedream

Nhận xét thẩm mỹ là đánh giá trực quan trên đúng một mẫu, không phải benchmark:

- Màu cơ–gân–xương tách biệt, ánh sáng mềm, bóng khối rõ, nền đơn giản; hợp bố cục minh họa của app.
- Chi nằm trọn khung, bàn tay có năm ngón quan sát được, ngón cái nằm cùng phía với xương cẳng tay có đầu dưới rộng. Không có chữ, mũi tên hoặc dụng cụ tập.
- Hai dải cơ đỏ thấy được không tự chứng minh chúng là hai đầu đúng của cơ nhị đầu. Không truy vết rõ hai nguyên ủy và đường đi của gân đầu dài từ hình này.
- Vùng gân trắng qua khuỷu liên tục với các dải trắng xuống cổ tay; hình không phân biệt rõ gân bám tận cơ nhị đầu vào phần gần xương quay với các gân cẳng tay. Không nên gắn nhãn điểm bám tận dựa vào ảnh này.
- Ranh giới cơ nhị đầu và cơ cánh tay nằm sâu không đủ rõ để dạy lớp giải phẫu. Không có căn cứ xác nhận hướng sợi hay độ dày mô từ các vệt texture.

**Quyết định:** ảnh xem trước để nghiên cứu thẩm mỹ, chưa chấp nhận làm hình kiến thức Atlas có nhãn cấu trúc. Đây là giới hạn của mẫu đầu ra, không kết luận mọi ảnh Seedream đều sai.

## Nguồn đối chiếu kiến thức

Đọc 2026-10-23:

1. [OpenStax Anatomy and Physiology 2e, §11.5](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs). Phạm vi: văn bản HTML phần cơ vận động cẳng tay và chú thích hình 11.25–11.26. Đối chiếu cơ nhị đầu có hai đầu và cơ cánh tay nằm sâu dưới cơ nhị đầu. Không lấy hình sách làm đầu vào cho model hoặc sao chép hình.
2. [University of Washington Department of Radiology, Muscle Atlas: Biceps Brachii](https://rad.uw.edu/muscle-atlas/biceps-brachii). Phạm vi: toàn bộ các trường văn bản origin/insertion trên trang. Đầu ngắn từ mỏm quạ, đầu dài từ củ trên ổ chảo; bám tận vào lồi củ xương quay và mạc cẳng tay qua cân cơ nhị đầu. Chỉ liên kết, không tải hay tái phân phối hình bản quyền của UW.

Nguồn hỗ trợ các quan hệ giải phẫu dùng để đối chiếu; chúng không chứng nhận ảnh AI. Không có người duyệt chuyên môn độc lập: reviewedBy=null. Đây không phải điều kiện chặn phổ quát; lý do loại mẫu này là các quan hệ cấu trúc chưa được thể hiện đủ rõ.

Thông tin model đã kiểm tra cùng ngày: [Nano Banana 2.1](https://openrouter.ai/google/gemini-nano-banana-2.1), [Seedream 5.0 Flash](https://openrouter.ai/bytedance-seed/seedream-5-0-flash), và endpoint metadata công khai tương ứng. Phí trong bảng lấy từ response thực tế, không từ giá marketing.

## Lượt trước khi người dùng đính chính

Trước khi nhận được đính chính, đã gửi một request hip hinge/model theo kế hoạch ban đầu. Nano trả 429 (không có usage), Seedream tạo ảnh với usage.cost=$0.018 trong 16.181 giây. Tài liệu ở `assets/2026-10-23-nano-seedream-comparison/`. Không dùng mẫu bài tập để đánh giá khả năng vẽ giải phẫu. Tổng phí xác nhận trong lượt làm việc này là $0.036 cho hai ảnh Seedream; hai lỗi Nano chưa có usage để xác nhận phí.

## Hướng tính năng phù hợp

Quy trình nên bắt đầu từ Atlas: chọn vùng cơ thể → cấu trúc cần học → góc nhìn → lớp giải phẫu → tạo hình → đối chiếu nguồn và gắn nhãn ngoài ảnh. Với cấu trúc đã có mesh Z-Anatomy, ưu tiên render có đối chiếu danh tính/cấu trúc thay cho yêu cầu text-to-image tự suy ra mọi điểm bám. Mesh provenance không tự xác nhận y khoa; mọi chỉnh vật liệu hoặc hình AI vẫn phải ghi rõ phạm vi mô phỏng.

Chưa đủ dữ liệu chọn Nano hay Seedream làm model mặc định cho giải phẫu: Nano bị quota và Seedream mới có một mẫu chưa đạt tiêu chí cấu trúc. Cần một bài thử có ảnh tham chiếu anatomy được phép sử dụng/render từ dữ liệu hiện có, rồi mới đánh giá khả năng giữ cấu trúc; không suy khả năng đó từ bài text-to-image này.


## Bổ sung: FLUX 3 Image Klein, cùng ngày

Theo yêu cầu tiếp theo của người dùng, gửi đúng một request `black-forest-labs/flux-3-image-klein`, provider `black-forest-labs`, cùng nguyên văn prompt anatomy, 1K, 4:3, n=1. Hai protocol có cùng promptSha256; không fallback, không tự động thử lại.

- HTTP 200; thời gian request **9.388 giây**.
- usage.cost thực tế **$0.009**, bằng một nửa mẫu Seedream trên.
- JPEG **1184 × 880**, 277262 byte. 1K là mức phân giải yêu cầu; kích thước thực tế của hai provider khác nhau.
- [Ảnh FLUX](assets/2026-10-23-anatomy-model-comparison/flux-3-image-klein.jpg), [receipt](assets/2026-10-23-anatomy-model-comparison/flux-3-image-klein-receipt.json), [protocol](assets/2026-10-23-anatomy-model-comparison/flux-protocol.json).

### Quan sát trực tiếp

- Bề mặt cơ, xương, gân có nhiều chi tiết; bố cục tràn khung hơn Seedream, ánh sáng dịu và màu tách biệt. Theo đánh giá thẩm mỹ chủ quan trên hai mẫu này, FLUX cho cảm giác mô hình giải phẫu chi tiết hơn.
- **Sai yêu cầu tư thế:** khuỷu gập rõ, không giữ tư thế giải phẫu trung tính mà prompt yêu cầu. Seedream bám brief chi duỗi tốt hơn ở điểm này.
- Xương cánh tay bộc lộ thành dải lớn ở giữa; mẫu không thể hiện rõ cơ nhị đầu nằm trước và quan hệ lớp sâu của cơ cánh tay. Không thể dùng chi tiết texture như bằng chứng quan hệ các lớp đúng.
- Không thể truy vết chắc chắn hai đầu gần cơ nhị đầu tới các nguyên ủy hay gân bám tận vào lồi củ xương quay theo các trường origin/insertion của UW đã đọc ở trên. Không gắn nhãn cấu trúc/điểm bám cho các bó nhìn giống cơ khi chưa đối chiếu được.
- Chi, bàn tay trọn khung và có năm ngón quan sát được; không chữ hay mũi tên. Những tiêu chí hình thức đạt không bù cho sai tư thế hoặc quan hệ cấu trúc chưa rõ.

**Quyết định cho đúng mẫu FLUX này:** chưa chấp nhận làm hình kiến thức Atlas có nhãn. FLUX rẻ và nhanh hơn trong lượt đo đơn lẻ; chưa đủ mẫu để kết luận tốc độ/chất lượng tổng quát. Cả FLUX và Seedream đều chưa đạt mục tiêu minh họa anatomy có thể truy vết các cấu trúc của brief; Nano chưa có ảnh vì quota. Bước thử hữu ích tiếp theo là dùng cùng render anatomy có provenance làm ảnh tham chiếu, đánh giá cấu trúc được giữ lại, thay vì tăng độ phân giải để kỳ vọng tự sửa giải phẫu.

Metadata model kiểm tra: [OpenRouter FLUX 3 Image Klein](https://openrouter.ai/black-forest-labs/flux-3-image-klein), 2026-10-23. Giá bảng so sánh vẫn là usage.cost thực tế.

Tổng phí đã nhận usage từ đầu chuỗi thử là **$0.045**: Seedream hip hinge $0.018, Seedream anatomy $0.018, FLUX anatomy $0.009. Hai lỗi Nano không có usage để xác nhận phí. Không sửa cấu hình model mặc định hay nội dung hiển thị của app trong bài thử.
