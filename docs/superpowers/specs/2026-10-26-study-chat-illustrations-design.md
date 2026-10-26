# Ảnh có chữ giải thích trong chat nổi — thiết kế đề xuất

Ngày: 2026-10-26. Trạng thái: bản đề xuất để người dùng review; chưa triển khai hoặc deploy tính năng.

## Yêu cầu đã chốt trong hội thoại

- Tạo hình ngay trong floating study chat khi người dùng muốn.
- **Toàn bộ chữ, nhãn và giải thích trong ảnh do model tạo ảnh vẽ trực tiếp vào raster** — quyết định người dùng, không dùng lớp chữ HTML/SVG đè lên ảnh để thay thế.
- Bấm thumbnail mở trình xem lớn; vẫn giữ nội dung và vị trí cuộc chat.
- Chat văn bản tiếp tục dùng `google/gemini-2.5-flash`; embedding giữ `google/gemini-embedding-2`.
- Đợt này chỉ review và lập kế hoạch. Chưa gọi tạo ảnh trả phí.

## Review hiện trạng và khoảng trống

| Phần | Mã hiện có | Nhận xét |
| --- | --- | --- |
| Floating chat | `src/components/StudyChatWidget.tsx` | Chỉ có text message, stream NDJSON, sessionStorage, trích đoạn đang học và nguồn. Chưa có attachment, trạng thái tạo ảnh hoặc viewer. |
| Message API | `src/lib/types.ts:102`, `src/app/api/chat/route.ts` | `ChatMessage` chỉ có role/content; API chủ động lọc fields. Không nhét base64 ảnh vào history gửi model. |
| Markdown | `src/components/MarkdownAnswer.tsx:9` | `img` được đổi thành text để model không thể tự gây request tới URL ngoài. Giữ cơ chế này; ảnh mới cần card có kiểu dữ liệu riêng. |
| Image model | `src/lib/illustrations/catalog.ts:4`, `src/lib/illustrations/server.ts` | Đang có Seedream 5.0 Flash, API server-only, xử lý MIME/size, receipt/hash/cost và ảnh tham chiếu. GET production `/api/illustrations` kiểm tra ngày 2026-10-26: HTTP 200, enabled, đúng model, livePrice=true; đây không phải phép thử tạo ảnh có chữ. |
| Prompt hiện có | `src/lib/illustrations/catalog.ts:99` | Cấm chữ, số, mũi tên, bài tập; preset chỉ là anatomy. Không thể dùng nguyên prompt cho infographic giải thích hoặc hình so sánh. |
| Lưu ảnh | `src/lib/illustrations/library.ts` | IndexedDB lưu Blob và receipt, giới hạn thư viện 50 ảnh. Gallery hiện kỳ vọng anatomy preset/Movement topic; không gán bừa mọi ảnh chat vào một topic để vượt type. |
| Mở ảnh lớn | `ImagePreview.tsx:41`, `LibraryImageCard.tsx:45` | Chỉ mở data/blob URL ở tab mới. Chưa có lightbox, zoom/pan hoặc điều phối Escape với chat. |
| Request trùng | `src/lib/illustrations/server.ts:215` | Map/rate limit trong process. Chú thích mã cũng xác nhận cần shared storage khi nhiều server. Không xem đây là idempotency bền vững của Vercel. |
| Kiểm tra ảnh cũ | `docs/research/2026-10-23-anatomy-model-comparison.md` | Prompt mẫu trước cố tình không có chữ; có giới hạn cấu trúc giải phẫu. Không dùng chúng để khẳng định Seedream vẽ đúng tiếng Việt/nhãn y học. |

## Các cách tiếp cận

1. Cho Markdown tự render URL ảnh: nhanh, nhưng không có kiểm soát generation/receipt/chi phí và phá bảo vệ URL hiện có. Không chọn.
2. **Typed image card + gọi image service riêng + viewer toàn màn hình:** tái sử dụng model/gateway, có trạng thái/lưu ảnh/nguồn, giữ chat text hiện tại. Đề xuất chọn.
3. Thay toàn bộ chat bằng một model vừa chat vừa sinh ảnh: thay nhiều luồng và model, chưa cần cho yêu cầu này. Không chọn ở phiên bản đầu.

Lựa chọn model đề xuất: thử Seedream 5.0 Flash đang tích hợp trước, không tự chuyển model ảnh khác. [OpenRouter](https://openrouter.ai/bytedance-seed/seedream-5-0-flash/providers) xác nhận model tạo/chỉnh ảnh; [hướng dẫn BytePlus Pro/Flash](https://docs.byteplus.com/zh-TW/docs/modelark/seedream-5-0-pro?redirect=1) được tra cứu ngày 2026-10-26. Chưa có bằng chứng thử trực tiếp cho độ đúng chữ tiếng Việt trong app; cần pilot với đúng yêu cầu mới.

## Luồng người dùng

1. Composer có hai chế độ **Hỏi đáp** / **Tạo hình**. Mặc định Hỏi đáp. Nút “Minh họa nội dung này” dưới một câu trả lời cũng chuyển sang chế độ Tạo hình, gắn đúng message đó.
2. Người dùng nhập mô tả; phần tóm tắt nội dung được chọn và ước tính phí có ngày kiểm tra hiện trước nút **Tạo hình**. Không có popup xác nhận thứ hai. Không sinh ảnh chỉ vì một đoạn PDF hoặc câu trả lời model chứa từ “tạo hình”. Khi người dùng gõ yêu cầu vẽ trong chế độ Hỏi đáp, có thể đề nghị action này nhưng không tự gọi image API.
3. Bấm Tạo hình: Gemini 2.5 Flash chuẩn bị brief theo nguồn; Seedream vẽ cả hình, tiêu đề và 2–4 chú giải tiếng Việt trực tiếp vào ảnh. Mặc định 2K, 4:3, một ảnh; không đổ nguyên câu trả lời dài lên ảnh. Tiêu đề tối đa 60 ký tự, mỗi chú giải tối đa 120 ký tự, tổng chữ yêu cầu trong ảnh tối đa 550 ký tự. Nếu nhiều nội dung hơn, rút gọn brief và giữ bản giải thích chi tiết bằng text trong chat.
4. Card đi qua “Đang chuẩn bị nội dung” → “Đang tạo hình” → ảnh hoàn tất, hoặc lỗi có hành động rõ. Không hiển thị phần trăm giả.
5. Thumbnail giữ đúng tỉ lệ, có “Mở ảnh lớn”, tiêu đề, model và nhãn “Hình minh họa AI”. Bên dưới có nguồn, ngày kiểm tra và bản chữ của **nội dung đã yêu cầu model vẽ**; không gọi bản chữ này là OCR đã xác minh ảnh.
6. Bấm ảnh: mở viewer lớn, fit màn hình, zoom +/−/100%/fit, kéo khi phóng to, hỗ trợ thao tác cảm ứng và tải ảnh gốc có cả chữ. Escape đóng viewer trước; chat vẫn mở. Trả focus về thumbnail.
7. “Chỉnh sửa ảnh” cho nhập sửa đổi, dùng chính ảnh đó làm reference và ghi parentId. Đây là request trả phí mới, chủ động bấm gửi; không tự tạo lại khi phát hiện lỗi chữ.

## Nội dung, nguồn và giới hạn

- `ChatIllustrationBrief`: title, subjectKind (`anatomy|movement|comparison`), visualDescription, imageText (2–4 mục ngắn), explanation, sources (id/url/checkedAt/access), limitations. JSON được validate và giới hạn độ dài trước khi gọi image model.
- Gemini dùng đúng nguồn từ message được chọn; khi chưa có nguồn lưu theo message, server truy xuất theo câu hỏi chủ đề được chọn. Không dùng các state nguồn “lượt mới nhất” cho một câu trả lời cũ.
- Prompt ảnh có purpose `chat-study`, độc lập prompt anatomy cũ. Chỉ truyền brief, chữ ngắn đã chuẩn bị, và reference ảnh được chọn; không tự gửi toàn bộ conversation, hồ sơ học viên hoặc PDF/page scan NCSF.
- Chữ và mũi tên bên trong ảnh cũng có thể sai. Nguồn hỗ trợ nội dung giải thích, không xác nhận từng pixel, vị trí mũi tên, điểm bám, hướng sợi hay phép đo do model vẽ. Không gắn nhãn đã xác nhận y khoa; reviewedBy giữ null.
- Với câu hỏi thiếu nguồn, ghi rõ giới hạn; không vẽ hình mang nhãn đo lường/chẩn đoán chính xác để bù cho thiếu dữ liệu. Không thêm cổng chờ chuyên gia độc lập phổ quát.
- Sửa chữ đã dính vào raster cần image edit/tạo lại. Không âm thầm chuyển sang overlay khi model vẽ chữ chưa đạt yêu cầu.

## Kiến trúc đề xuất

- Giữ `/api/chat` và `ChatMessage` text-only. Thêm local `StudyChatMessage` có id, attachments và nguồn theo message. Serializer chỉ gửi role/content; message ảnh thuần không bị gửi như payload rỗng hoặc base64.
- `StudyChatImageCard` + `StudyChatImageViewer` riêng. `useStudyChatImages` quản lý image request, cancellation, lưu Blob, restore và URL cleanup; không làm `StudyChatWidget` thành một file xử lý toàn bộ image service.
- Tách low-level OpenRouter raster transport khỏi anatomy compiler; caller cũ giữ model/provider/limits/prompt cũ. Compiler mới có thể vẽ chữ và hình movement/comparison mà không buộc giả danh anatomy preset.
- `GET /api/chat/illustrations` khởi tạo cookie phiên và trả model/ước tính ngay trước request dài. `POST /api/chat/illustrations` yêu cầu cookie đã có, khởi tạo hoặc đọc lại cùng requestId, chuẩn bị brief và tạo ảnh trong invocation được await; không dùng promise chạy nền sau response. `GET /api/chat/illustrations/[id]` phục hồi trạng thái/asset. Route generation có maxDuration 150 giây và deadline nội bộ 140 giây: brief tối đa 15 giây, image upstream tối đa min(110 giây, thời gian còn lại trừ 15 giây dành lưu/finalize). Nếu không còn ngân sách thời gian, không bắt đầu image call. Giới hạn upload artifact 10 giây.
- Shared job ledger trong Supabase: requestId, ownerHash, fingerprint, state (`preparing|generating|succeeded|failed|unknown`), brief, receipt, storagePath, timestamps/expiry. Atomic claim ngăn hai instance cùng gọi provider. Cùng ID khác nội dung trả 409; ID đã hoàn tất trả artifact; trạng thái unknown không tự gọi lại upstream. Không hứa “exactly once” khi provider đã tính phí nhưng server chưa ghi kết quả.
- Cookie phiên ảnh ngẫu nhiên 256-bit, HttpOnly/Secure/SameSite, chỉ lưu hash làm owner. Tất cả GET/POST/asset kiểm tra owner; Origin check bổ sung, không được dùng như authentication. Không dùng requestId như quyền truy cập công khai.
- Private bucket `chat-illustrations`, signed URL ngắn hạn sau owner check. Cho truy cập artifact để phục hồi trong 24 giờ. Cleanup hằng ngày xóa Blob/brief đã hết hạn (thời gian lưu vật lý có thể đến 48 giờ); giữ tombstone ID/ownerHash/fingerprint/trạng thái tối thiểu để không gọi trả phí lại cùng ID. Cleanup là route nội bộ có bearer secret, cấu hình khi triển khai. Cơ chế này không tạo tài khoản hoặc đồng bộ chat giữa thiết bị.
- IndexedDB v2 thêm store `chat-images`, giữ nguyên store `images` và gallery cũ. Lưu Blob/receipt/brief ở local, history chỉ giữ imageId; không đặt base64 vào sessionStorage. Lịch sử cũ được nâng cấp có id và attachments rỗng, không mất text. Có giới hạn local 50 ảnh; đầy bộ nhớ thì ảnh hiện tại vẫn xem/tải được và báo chưa lưu.
- Remote artifact hết hạn + local Blob còn: dùng Blob. Nếu cả hai không có: card báo ảnh hết thời gian lưu, không tự regenerate. URL blob được revoke khi unmount/đổi ảnh; signed URL được cấp lại sau owner check, không lưu như đường dẫn vĩnh viễn.
- Global limit khởi điểm: 2 image requests đang tạo và 30 lượt/giờ toàn project, 5 lượt/giờ mỗi phiên; lưu/claim atomic ở server. Không coi cookie session là bot protection hoặc per-person identity.

## Trạng thái lỗi và tương tác

- Timeout/đóng chat/reset/ngắt mạng không có nghĩa provider đã hủy phí. Hủy phần chờ UI, giữ job id; khi mở lại hỏi trạng thái trước, không tự POST mới.
- 402 thiếu credit; 429 giới hạn; provider từ chối; ảnh/MIME/dung lượng không hợp lệ; hết hạn link; thiếu local storage; schema brief sai đều có thông báo riêng. Không lộ upstream secret/error payload.
- Chuyển trang, chat text mới hoặc reset khi ảnh đang tạo không được khiến ảnh gắn sang message/phiên mới. Gắn sourceMessageId + conversationId ổn định.
- Native `<dialog>` ở top layer/portal, tránh nằm trong container overflow của widget. Widget bỏ qua Escape khi viewer đang mở, trả focus đúng nút. Không tạo lượt AI khi mở/zoom/tải ảnh.

## Điều kiện hoàn tất

- Hỏi text không gọi image API. Chỉ một thao tác Tạo hình rõ ràng mới gọi provider.
- Một request trùng chạy từ hai server chỉ một lần claim provider; refresh/poll không tạo thêm ảnh trả phí.
- Pilot gồm 3 brief tiếng Việt, mỗi brief 2 ảnh (tổng tối đa 6 ảnh, ghi giá/receipt), kiểm tra từng dấu/chữ, bố cục, cấu trúc và nhãn theo nguồn. Chưa chạy pilot trong lượt lập kế hoạch. Nếu đầu ra chưa đạt, ghi lỗi và dừng chọn mặc định cho tính năng này; không tự đổi model hoặc tuyên bố chữ chắc chắn đúng.
- Bấm ảnh mở được bản lớn, zoom/pan, Escape/focus/mobile đúng; tải xuống còn nguyên chữ trong raster.
- Reload khôi phục được ảnh/history; lỗi storage và ảnh hết hạn có trạng thái thật.
- Chat thường, Markdown chặn ảnh ngoài, gallery và nguồn/citation cũ không bị hồi quy.
- Triển khai production sau khi code/test/QA đạt và có quyền chạy migration/bucket. Service role app hiện có không đồng nghĩa quyền chạy DDL; xác minh đường áp migration Supabase trước khi bắt đầu phần server.

