# Chọn model ảnh cho Kinesis Lab

Ngày tra cứu: **23/10/2026**, Asia/Ho_Chi_Minh. Phạm vi: các model ảnh hiện có trên OpenRouter, chú trọng các mục bổ sung tháng 9–10/2026 và các nhu cầu Movement/Atlas/bài tập của app.

## Đề xuất

**Ứng viên mặc định: `google/gemini-nano-banana-2.1`.** Theo tài liệu Google, model chú trọng bố cục, chữ, chỉnh sửa và nhất quán qua nhiều lần sửa. Phần ảnh 1K khoảng $0.0336, 2K $0.0504. Có thể cân đối chi phí cho nội dung giáo dục gồm nhiều yêu cầu. Đây là suy luận lựa chọn từ khả năng công bố, chưa phải kết quả thử nghiệm trên app. [Google model](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1), [Google pricing](https://ai.google.dev/gemini-api/docs/pricing).

**Ứng viên tiết kiệm: `black-forest-labs/flux-3-image-klein`.** OpenRouter công bố $0.009/1K, $0.014/2K và nhận tối đa 10 ảnh tham chiếu. Đáng thử cho hình minh họa nhiệm vụ, thumbnail và ảnh vận động cần cùng nhân vật. BFL công bố kết quả nội bộ; chưa xem đó là bằng chứng ưu thế trên nội dung PT hoặc độ đúng giải phẫu. [BFL công bố](https://bfl.ai/blog/flux-3-image-klein), [OpenRouter model](https://openrouter.ai/black-forest-labs/flux-3-image-klein), [giá endpoint](https://openrouter.ai/api/v1/images/models/black-forest-labs/flux-3-image-klein/endpoints).

**Đối chứng có giá dễ dự toán: `bytedance-seed/seedream-5-0-flash`.** $0.018/ảnh với các mức 1K/2K, tối đa 14 tham chiếu, có seed. Cần so trực tiếp với Klein và Nano trên các tư thế app thực sự cần. [Model](https://openrouter.ai/bytedance-seed/seedream-5-0-flash).

**Ứng viên chỉnh sửa phức tạp: `openai/gpt-image-2.5-sunburst`**, hoặc Flare khi ưu tiên tốc độ. Tài liệu chính thức phân biệt hai mục tiêu này; không có cơ sở quy Sunburst luôn tốt hơn cho giải phẫu. Giá token giống nhau không có nghĩa giá một ảnh giống nhau. [Official OpenAI documentation](https://developers.openai.com/api/docs/guides/image-prompting).

## Cách nghiên cứu và mức chắc chắn

- Tải danh mục Image API công khai: có **61 mục** tại thời điểm kiểm tra. Đọc giá/tham số endpoint của **21 ứng viên**; một số có giá thiếu hoặc không có endpoint phục vụ.
- API chat thông thường chỉ trả một tập con; không dùng tập con đó để kết luận danh sách ảnh mới nhất. [Image API docs](https://openrouter.ai/docs/guides/overview/multimodal/image-generation).
- Đối chiếu giá và tính năng với Google, BFL và tài liệu OpenAI; xem thêm danh mục/kiểu đầu ra Qwen, Recraft, Seedream và các ứng viên khác.
- Các ngày trong bảng dưới là ngày `created` trong **danh mục OpenRouter**, không nhất thiết là ngày nhà sản xuất ra mắt. Ví dụ GPT Image 2.5 có bản model ngày 08/09, mục OpenRouter ngày 09/09; Qwen 2.1 có công bố trước mục OpenRouter ngày 16/10.
- Chưa chạy thử ảnh trả phí, chưa đo latency, chưa xác nhận chất lượng chữ tiếng Việt hoặc tỷ lệ đạt kiến thức trên bộ nội dung của app. Không dùng bảng xếp hạng lượng sử dụng làm xếp hạng chất lượng.
- Snapshot công khai có nguồn và thời điểm lưu ở thư mục `2026-10-23-image-model-selection/` bên cạnh báo cáo này. Không đọc khóa thực tế, không gửi dữ liệu học viên, không thay đổi tích hợp app.

## Giá và khả năng đáng chú ý

USD, giá niêm yết tại thời điểm đọc. Giá theo token dưới đây chưa thể chuyển thành một đơn giá/ảnh cố định. Các giá phần ảnh không bao gồm input, reasoning/text output khi có, search, lần tạo lại, thuế hoặc phí mua credits. `1K`/`2K` là mức phân giải; kích thước cụ thể phụ thuộc tỷ lệ và provider.

| Model | Có trên OpenRouter từ | Giá phần ảnh | Tham chiếu tối đa qua endpoint đã đọc | Nhận xét cho app (suy luận) |
| --- | --- | --- | ---: | --- |
| FLUX 3 Image Klein | 15/10/2026 | 1K $0.009; 2K $0.014; 4K $0.036 | 10 | Ứng viên tiết kiệm cho minh họa bài tập; không suy độ đúng cơ/xương từ chất lượng ảnh |
| Nano Banana 2.1 | 06/10/2026 | $30/1M image tokens; Google quy đổi 1K $0.0336, 2K $0.0504, 4K khoảng $0.113 | 14 | Ứng viên mặc định cho yêu cầu nhiều phần và chỉnh sửa |
| Seedream 5.0 Flash | 01/10/2026 | $0.018/ảnh; 1K/2K | 14 | Đối chứng chi phí thấp, ảnh tham chiếu đầu vào $0 theo endpoint |
| Qwen Image 2.1 Turbo | 16/10/2026 | $0.0184/ảnh ở cả 1K/2K | 4 | Đối chứng giá thấp; chưa xác nhận chữ tiếng Việt |
| Qwen Image 2.1 Pro | 16/10/2026 | $0.046/ảnh ở cả 1K/2K | 4 | Chỉ chọn nếu thử nghiệm cho thấy tăng tỷ lệ đạt yêu cầu |
| Recraft V4.1 Flash | 23/09/2026 | $0.007/ảnh khoảng 1K | Không nhận ảnh | Rẻ cho hình trang trí; thiếu chỉnh sửa dựa trên hình chuẩn nên không ưu tiên cho bài cần hình tham chiếu |
| GPT Image 2.5 Flare | 09/09/2026 | $30/1M image output tokens; $8/1M image input; $5/1M text input | 16 | Ứng viên OpenAI ưu tiên tốc độ, có alpha qua background transparent |
| GPT Image 2.5 Sunburst | 09/09/2026 | Cùng đơn giá token trên; không mặc định cùng token/ảnh | 16 | Ứng viên OpenAI cho yêu cầu chất lượng/chỉnh sửa cao |
| Recraft V4.1 Vector | 13/05/2026 | $0.08/SVG | 1 | Hình thiết kế dạng vector có thể sửa; vẫn không tự xác nhận nội dung hình |
| FLUX 3 Image | 01/10/2026 | 1K $0.048; 2K $0.10; 4K $0.607 | 10 | Chi phí 4K cao, chỉ dùng khi có lợi ích đo được so với Klein |
| Seedream 5.0 Lite | 13/08/2026 | $0.035/ảnh; 2K/4K | 14 | Đáng xem nếu thật sự cần 4K; không phải lựa chọn rẻ nhất ở 2K |
| Nano Banana 2 Lite | 30/06/2026 | $30/1M image tokens, tương đương $0.0336/1K | 14 theo catalog | Google lưu ý không tối ưu nhiều tham chiếu/chỉnh sửa nhiều lượt; cùng giá phần ảnh 1K với 2.1, nhưng phí input thấp hơn |
| Nano Banana 2 | 18/06/2026 | Endpoint Google AI Studio $60/1M image tokens, khoảng $0.0672/1K | 14 | 2.1 có giá phần ảnh 1K bằng một nửa; không vì thế suy tổng request luôn rẻ hơn một nửa |
| Nano Banana Pro | 18/06/2026 | $120/1M image tokens | 14 | Không làm mặc định tiết kiệm; cần lợi ích cụ thể mới dùng |

Nguồn giá là các đường `endpoints` tương ứng trong snapshot và [tài liệu Image API](https://openrouter.ai/docs/guides/overview/multimodal/image-generation). Thông tin tính năng: [Klein](https://openrouter.ai/black-forest-labs/flux-3-image-klein), [Seedream Flash](https://openrouter.ai/bytedance-seed/seedream-5-0-flash), [Qwen Turbo](https://openrouter.ai/qwen/qwen-image-2.1-turbo), [Recraft Flash](https://openrouter.ai/recraft/recraft-v4.1-flash), [Recraft Vector](https://openrouter.ai/recraft/recraft-v4.1-vector). Giá OpenAI đối chiếu [model Flare](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare) và [pricing](https://developers.openai.com/api/docs/pricing).

### Các trường hợp không chốt giá hoặc không ưu tiên

- Muse Image có tên trong catalog nhưng endpoint công khai trả danh sách rỗng khi kiểm tra; không lấy giá marketing $0.01 làm bảo đảm gọi được ngay.
- Krea K3 Edit là chỉnh sửa, cần ảnh tham chiếu, endpoint không công bố pricing line; chưa đủ dữ liệu để xếp hạng giá.
- Hy Image 3.5 Preview và MAI-Image-2.6 Flash có đơn giá token; chưa có số token/ảnh của bài thử phù hợp nên không đặt chúng vào bảng giá/ảnh cố định.
- Riverflow 2.5 Fast có giá endpoint $0.019 cơ sở, $0.021 ở 2K, tối đa 4 tham chiếu; không có lợi thế giá rõ so với Seedream Flash ở 2K. Chưa thử nên không kết luận kém chất lượng.
- GPT Image 1 Mini có đơn giá image output $8/1M tokens, nhưng đơn giá token thấp không tự có nghĩa ảnh dùng được rẻ hơn. GPT Image 2 còn là đối chứng hữu ích. Không lấy chi phí một thử nghiệm GPT Image 2 để gán cho GPT Image 2.5: tài liệu OpenAI nói rõ calculator của Image 2 không ước tính token consumption của 2.5.

## Những điểm dễ so sánh sai

1. **Giá “from” khác giá 1K.** Klein $0.008 là mức 768, không phải 1K. Giá 1K là $0.009.
2. **Tính năng hãng khác tính năng gateway.** BFL mô tả bounding box/pixel restoration; endpoint OpenRouter đã đọc không liệt kê mọi điều khiển đó. Qwen công bố model native có thêm khả năng nhưng OpenRouter giới hạn bốn reference và không công bố `background` alpha. Không hứa các tính năng chưa có ở endpoint.
3. **Chất lượng tương đương tên không tương đương chi phí.** GPT Image 2.5 tính theo token, `quality` và input ảnh có thể đổi hóa đơn. Chọn rõ quality khi so sánh và lưu `usage.cost` thực tế.
4. **Ảnh lỗi nội dung nhưng render thành công vẫn tốn phí.** Image API tính theo hoàn tất; vì vậy phải đo tổng chi phí cho mỗi ảnh được chấp nhận, tính cả ảnh đã sinh nhưng bị loại. [Billing](https://openrouter.ai/docs/guides/overview/multimodal/image-generation).
5. **Phí nền tảng tách khỏi inference.** OpenRouter Standard thu 5.5% khi mua credits; Business 8%. Bảng trên chưa cộng khoản đó hoặc thuế. Không cộng lặp vào từng request đã đo. [OpenRouter pricing](https://openrouter.ai/pricing).

OpenRouter có một [bài thử thực tế 20 model](https://openrouter.ai/blog/insights/image-generation-models-compared/) ngày 11/09/2026, hữu ích để thấy giá/ảnh biến động theo thiết lập. Đó là thử hình sản phẩm với số mẫu nhỏ, trước các bản tháng 10; không phải benchmark giải phẫu hay bằng chứng đủ để chọn model mới cho app.

## Áp dụng theo nội dung Kinesis Lab

| Nội dung | Cách làm đề xuất |
| --- | --- |
| Movement – tư thế, bài tập, cùng nhân vật | Thử Nano 2.1, Klein và Seedream Flash với cùng reference có quyền sử dụng, cùng góc máy/nhiệm vụ |
| Đối xứng – công thức, ví dụ số, biểu đồ | Dựng HTML/SVG từ dữ liệu để giữ phép tính và nhãn đúng, dễ đọc; AI chỉ bổ trợ hình nhiệm vụ |
| ROM – gập/duỗi, vị trí thước, góc | Ưu tiên hình nguồn đã cấp phép và diagram có mốc được đối chiếu; không sinh ra góc/mốc như thể là phép đo |
| Motor control – cue và trình tự | Có thể sinh nhân vật/bối cảnh; câu cue, thứ tự và số bước lấy từ nội dung đã biên soạn có nguồn |
| Atlas – lớp cơ/xương/điểm bám/mạch/thần kinh | Giữ hình nguồn hoặc 3D có provenance, đối chiếu cấu trúc với nguồn. Không đưa hình text-to-image tự do thành bản giải phẫu chuẩn |
| Trigger points – vị trí, vùng đau lan | Giữ mapping và phạm vi bằng chứng hiện có; ảnh mới không làm bản đồ đau thành công cụ chẩn đoán |
| Texture mô, ảnh giống chụp thật | Có thể dùng cho mô phỏng có nhãn; không xem là ảnh mô người thật hoặc dữ liệu đo độ dày |

Đây là quyết định thiết kế cho app. Tính đúng nội dung phải truy về nguồn riêng. Citation của một bài nghiên cứu hỗ trợ đoạn kiến thức không tự chứng minh mọi pixel trong ảnh AI đi kèm. Nên giữ nhãn tiếng Việt, số đo, đường chỉ và link nguồn bằng lớp HTML/SVG có thể kiểm soát. Google liệt kê vi-VN trong ngôn ngữ khuyến nghị nhưng điều đó không bảo đảm mọi dấu tiếng Việt/nhãn trong ảnh đều đúng. [Google image guide](https://ai.google.dev/gemini-api/docs/image-generation).

### Bằng chứng liên quan đến độ đúng giải phẫu

Đã đọc abstract đầy đủ của nghiên cứu [Strugała và cs., Clinical Anatomy 2026, PMID 42478089](https://pubmed.ncbi.nlm.nih.gov/42478089/) qua hồ sơ MED/Europe PMC sau khi trang PubMed mở trực tiếp không trả nội dung. Nghiên cứu đánh giá 144 hình từ sáu công cụ, ghi nhận nhiều thiếu/sai cấu trúc. Không dùng kết quả đó để chấm Nano 2.1, FLUX 3 hay GPT Image 2.5: abstract không xác định các bản endpoint mới đang xét. Phạm vi đọc là abstract, không toàn văn. Nó hỗ trợ việc phân biệt chất lượng hình và độ đúng cấu trúc; không thay đổi quyết định của người dùng về tiêu chí đối chiếu nguồn và không thêm yêu cầu duyệt chuyên gia độc lập cho app.

## Ngân sách và cách chọn thực tế

Ví dụ **100 ảnh được tạo, mỗi ảnh một lượt**, phần ảnh 2K:

- Klein: $1.40.
- Seedream Flash: $1.80.
- Qwen Turbo: $1.84.
- Nano 2.1: khoảng $5.04, cộng input/text/thinking khi có.

Nếu cần ba lượt hoàn tất để chọn được một ảnh thì chi phí tương ứng tăng theo số lượt. Đây là phép tính từ đơn giá, chưa phải hóa đơn hoặc giá ảnh được nghiệm thu. Tổng ngân sách còn có input, nền tảng và thuế.

Bước tiếp theo đề xuất, **chưa chạy**: chọn 12 brief thật từ bốn tab Movement, hai lần/brief/model cho Nano 2.1 + Klein + Seedream Flash, cùng 2K và cùng reference. Tổng 72 ảnh; phần ảnh dự kiến $1.9776, chưa tính các phụ phí/input. Thử GPT Image 2.5 Sunburst riêng cho những brief khó nếu ba model chưa đáp ứng.

Ghi cho mỗi ảnh: model/provider, kích thước, prompt/nguồn/reference, hash, thời gian, `usage.cost`, lỗi người/chi/bàn tay/dụng cụ, sai hướng/chuyển động, nhãn/chữ và mức giữ reference. Lỗi trọng yếu về kiến thức bị loại dù ảnh đẹp. So **tổng chi phí / số ảnh đạt yêu cầu**, không chọn theo ảnh đẹp nhất được hãng trưng bày. Đây là bài thử đề xuất; chưa có điểm số hoặc kết quả đạt cho model nào.

## Tình trạng tích hợp

Đọc `src/lib/ai/openrouter.ts`: app đang có chat completions/stream, vision extraction và embeddings; chưa có Image API riêng. `vision` hiện là đọc ảnh và trả text, không tự là khả năng tạo ảnh. Nếu triển khai, nên thêm nhánh ảnh riêng gọi `/api/v1/images`, lưu ảnh dùng lại và provenance/cost; không chỉ thay biến model chat. Đây là khuyến nghị kiến trúc, chưa sửa code hoặc gọi tạo ảnh trả phí.
