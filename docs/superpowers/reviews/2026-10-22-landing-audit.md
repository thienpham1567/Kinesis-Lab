# Rà soát landing Kinesis Lab — 22/10/2026

## Phạm vi và kết luận

Rà source landing, CSS, metadata, các đích liên kết liên quan, chính sách bằng chứng; kiểm tra trình duyệt tại `http://localhost:3000/` trên Next dev. Kiểm tra viewport 320×740, 390×844, 768×1024 và 1440×1000. Trình duyệt có thanh cuộn chiếm khoảng 15px, nên chiều rộng nội dung nhỏ hơn viewport tương ứng.

Landing đã có phân cấp tiêu đề rõ, font tiếng Việt phù hợp, màu xanh nhất quán, CTA dễ nhận ra và giới hạn phạm vi PT trong FAQ/footer. Vấn đề lớn nhất là lời giới thiệu đi xa hơn phần demo và phạm vi bằng chứng thật. Nên sửa tính chính xác và đường đi trước, sau đó nâng cấp trình diễn sản phẩm và rút gọn mobile.

P1 = nên sửa trước khi dùng landing để giới thiệu rộng rãi; P2 = cải thiện trải nghiệm/chuyển đổi; P3 = hoàn thiện. Đây là mức ưu tiên của đợt audit, không phải chứng nhận hay kết luận lâm sàng.

## Các phát hiện

### 1. P1 — “LIVE” và góc khớp trông như dữ liệu đo thật

- `src/components/LandingPage.tsx:9–59, 304–328, 404–419`: 142°, 98°, 112°, 64°, 34° và các mốc tối đa đều là hằng số viết trực tiếp. Chọn vùng chỉ thay bộ số có sẵn.
- Hero ghi “GÓC KHỚP TRỰC TIẾP”, “LIVE” nhưng không có đầu vào đo hay luồng dữ liệu trực tiếp. Phần demo không nêu nguồn, động tác cụ thể, tư thế đo, đo chủ động/thụ động hay nhóm tham chiếu.
- “Cổ chân 45°” không đủ thông tin để hiểu là vận động nào; câu bên cạnh lại nói gập mu. Không nên trình bày các số này như chuẩn chung cho một khớp.
- Đề xuất: bỏ bộ đo trang trí, hoặc gắn rõ “Ví dụ minh họa — không phải phép đo”. Nếu giữ số tham chiếu, lấy từ catalog ROM hiện có với tên động tác, phương pháp và nguồn tương ứng. Không suy tình trạng cá nhân từ thanh phần trăm.

### 2. P1 — Một số câu cơ sinh học khẳng định nguyên nhân quá mạnh

- `LandingPage.tsx:25`: “mông yếu khiến gối đổ vào trong khi squat và khi tiếp đất”.
- `LandingPage.tsx:45`: hứa “phân biệt” gập lưng do hông cứng với do mất kiểm soát cơ lõi, trong khi demo chỉ đổi đoạn chữ.
- `LandingPage.tsx:55`: độ gập mu “quyết định” độ sâu squat và dáng chạy.
- Các câu này không kèm nguồn ở cấp phát biểu và không nêu giới hạn suy luận. Cần chuyển sang mô tả nội dung học/quan sát, tránh hứa xác định nguyên nhân hay một yếu tố quyết định duy nhất.
- Đối chiếu mới ngày **22/10/2026**: đọc bản ghi và abstract PubMed của Cashman et al., *Knee* (2026), DOI `10.1016/j.knee.2026.104565`, [PMID 42476040](https://pubmed.ncbi.nlm.nih.gov/42476040/). Tổng quan trên người khỏe mạnh ghi nhận kết quả không nhất quán và không có phân tích gộp từng phần đạt ý nghĩa thống kê. Phạm vi này không hỗ trợ câu nhân quả tổng quát về “mông yếu”; không suy kết luận cho mọi bệnh nhân hoặc mọi kiểu squat. Chưa đọc toàn văn bài này.
- Có thể thay phần hông bằng lời giới thiệu trung tính: “Tra vai trò của nhóm cơ hông và các yếu tố cần quan sát khi squat, tiếp đất”; mọi kiến thức bổ sung sau đó vẫn cần nguồn đúng phạm vi.

### 3. P1 — Cam kết nguồn đang bao phủ rộng hơn bằng chứng thực tế

- `LandingPage.tsx:264–266, 466–468, 149–150`: “Mọi kiến thức đều có nguồn”, “Mỗi phát biểu trong Atlas đều gắn nguồn”, “đọc được nguyên văn”.
- `src/lib/clinical/evidence-registry.ts:23–44` và `docs/medical-evidence-policy.md`: 1.031 cấu trúc catalog có hồ sơ `source-only`, ghi xuất xứ mesh và so chuỗi tên; không tương đương có kiến thức giải phẫu đối chiếu riêng cho từng cấu trúc. Phạm vi truy cập tài liệu cũng có thể chỉ là abstract/bảng/đoạn trích, không bảo đảm toàn văn.
- Con số 1.031 cấu trúc không phải vấn đề; cách đặt cạnh cam kết toàn bộ tri thức dễ tạo hiểu nhầm.
- Đề xuất: mô tả tách biệt “1.031 cấu trúc 3D có thông tin xuất xứ” với “Nội dung kiến thức được đối chiếu theo từng mục, có nguồn và giới hạn truy cập”. Không thêm yêu cầu duyệt chuyên gia chung; giữ `reviewedBy: null` khi chưa có review.

### 4. P1 — Hai CTA không đưa đến nội dung mà nhãn hứa

- `LandingPage.tsx:426`: chọn Vai/Hông/Gối/Thắt lưng/Cổ chân đều cho cùng `href="/atlas"`. Đã thử đổi Hông và Cổ chân; state đổi đúng nhưng href không đổi. Người dùng mất vùng vừa chọn khi sang app.
- App đã nhận `area`, `structure`, `group` trong `src/app/atlas/page.tsx:138–140`; cần ánh xạ ID vùng của landing sang ID hợp lệ của app, không tự ghép một ID chưa được hỗ trợ.
- `LandingPage.tsx:471`: “Xem mục nguồn” dẫn `/atlas?tab=clinical_rehab`. Đã mở trực tiếp: đích là tab **Phục hồi khớp**, mặc định vùng thắt lưng, và khối “Nguồn và giới hạn áp dụng” vẫn đóng. Đây không phải đích tra cứu nguồn tổng quan mà nhãn gợi ra.
- Đề xuất: deep link đúng vùng; nút nguồn đến thư viện bằng chứng hoặc mục nguồn cụ thể, mở sẵn đúng nội dung. Kiểm tra lại sau khi thay route.

### 5. P2 — Demo chưa chứng minh được giá trị của Atlas

- Heading hứa “Chạm vào một vùng”, “Xem cách Atlas suy nghĩ” nhưng UI là năm nút văn bản và một thẻ thông tin. Không có bản đồ cơ thể, model 3D, kiến thức dẫn nguồn hoặc bài tập có thể xem ngay trong demo.
- Nhận định thiết kế: điều này khiến demo giống bộ đổi nội dung quảng cáo hơn là một lát cắt sản phẩm thật. “Atlas suy nghĩ” cũng làm mờ ranh giới Atlas tra cứu với AI.
- Đề xuất: một ví dụ thật từ dữ liệu app, gồm vùng/cơ, hình có nguồn hoặc ảnh chụp Atlas thật, một ý kiến thức có citation, và liên kết bài tập đúng đích. Có thể dùng ảnh chụp nhẹ trước khi tải 3D theo yêu cầu.

### 6. P2 — Mobile dài và thiếu điều hướng nội dung

- Quan sát tại 390×844: toàn trang khoảng **8.165px**, hero khoảng **1.353px**, visual bắt đầu khoảng **y=780px**. CTA vẫn nằm trong màn hình đầu, nhưng bằng chứng trực quan về sản phẩm gần như chưa thấy.
- 768×1024: hero khoảng **1.653px**, do tiếp tục xếp một cột. Desktop 1440×1000: hero khoảng **1.017px**.
- Các liên kết Tính năng/Thử ngay/Cách dùng/Hỏi đáp bị ẩn dưới breakpoint `md`; không có menu thay thế. Năm nút chọn vùng xếp dọc chiếm khoảng 310px trước thẻ kết quả. Thẻ demo trên mobile cần cuộn thêm để tới CTA.
- Không phát hiện tràn ngang cấp document ở bốn viewport đã kiểm tra. 320px header cao khoảng 92px, cần tinh chỉnh riêng màn hẹp.
- Đề xuất: rút phần mở đầu, đưa visual lên sớm, giảm padding dọc mobile, bố trí chọn vùng gọn hơn và thêm menu anchor đơn giản. Không cần nén mọi thứ vào một màn hình bằng cách thu nhỏ chữ.

### 7. P2 — Vai trò tab và FAQ chưa đúng với trợ năng

- `LandingPage.tsx:388–404`: có `tablist`/`tab`, nhưng cả năm tab đều `tabIndex=0`, không có `aria-controls`, không có panel mang `role="tabpanel"`, không có xử lý phím mũi tên. Đã nhấn ArrowRight trên Hông: focus và lựa chọn vẫn ở Hông.
- Hướng hiển thị dọc nhưng không khai báo `aria-orientation="vertical"`.
- `LandingPage.tsx:490–501`, `globals.css:1225–1235`: FAQ thu bằng grid height/overflow; nội dung các câu đóng vẫn hiện trong cây trợ năng quan sát được. Nút chưa nối tới panel qua `aria-controls`.
- Landing không có `main` và skip link vì `AppShell` trả children trực tiếp cho `/`.
- Đề xuất: hoàn thiện pattern tab hoặc dùng nhóm button với `aria-pressed` nếu chỉ là bộ chọn; FAQ dùng disclosure chuẩn với trạng thái ẩn đúng. Thêm main và skip link.
- Đối chiếu ngày 22/10/2026: [W3C APG Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), đã đọc phần keyboard và roles. Chưa kiểm thử thực tế VoiceOver/NVDA.

### 8. P2 — Nhãn nhỏ trên nền tối khó đọc; chuyển động đang lấn nội dung

- `.landing-band .eyebrow` thực tế là xanh `rgb(36,84,203)`, cỡ **10px**, trên nền xanh đậm. Tỉ lệ tương phản với màu nền cơ sở `#10283f` khoảng **2,29:1**; nền thực tế có gradient nên đây không phải phép đo pixel cuối cùng. Cả quan sát trực tiếp lẫn cặp màu cơ sở đều cho thấy nên tăng tương phản.
- Đề xuất dùng emerald sáng/trắng và cỡ tối thiểu dễ đọc hơn cho nhãn có thông tin.
- Trang đồng thời có orb, shimmer, pulse, badge nổi, ping, marquee, tilt và reveal. Nhận định thiết kế: lượng chuyển động lớn so với mục tiêu tạo niềm tin chuyên môn.
- CSS có `prefers-reduced-motion`; JavaScript counter vẫn chạy `requestAnimationFrame`, tilt/parallax chưa kiểm tra preference. Đây là nhận xét từ source, chưa chạy giả lập reduced-motion.
- Đề xuất giữ một hiệu ứng mở đầu, một phản hồi tương tác; cung cấp nội dung hiển thị sẵn rồi mới enhancement. `.landing-reveal` hiện mặc định opacity 0 và cần JS/IntersectionObserver để hiện.
- Đối chiếu ngày 22/10/2026: [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), văn bản thường cần 4,5:1; chưa audit toàn bộ cặp màu.

### 9. P2 — Landing chưa cho người mới biết rõ bước bắt đầu

- CTA chính là “Bắt đầu tư vấn” nhưng phần hero minh họa Atlas, các bước sử dụng cũng bắt đầu bằng Atlas. Đây là hai hướng khởi đầu cạnh tranh về mặt câu chuyện.
- Thiếu thông tin chi phí/trạng thái thử nghiệm, cần tài khoản hay không, nội dung nào có thể mở ngay, điều kiện dùng AI và khả năng dùng dữ liệu mẫu. Không nên tự bổ sung “miễn phí” khi chưa có quyết định sản phẩm.
- Đề xuất: nếu Atlas là điểm khác biệt, dùng Atlas làm CTA chính và AI làm phụ; nếu AI là trọng tâm, cần mẫu câu hỏi/câu trả lời minh họa đã ghi rõ phạm vi. Đây là giả thuyết cần đo hoặc hỏi người dùng, chưa có dữ liệu chuyển đổi chứng minh.

### 10. P2 — Copy về dữ liệu và tốc độ quá tuyệt đối, thiếu thông tin hữu ích

- `LandingPage.tsx:105`: “Mọi thay đổi đều theo thời gian thực”. Source hồ sơ dùng fetch khi tải/sau thao tác; không tìm thấy kênh subscribe realtime trong `src`. Không đủ cơ sở hứa đồng bộ trực tiếp giữa thiết bị/phiên.
- FAQ chỉ nói Supabase “khi đã kết nối”; `/api/clients/route.ts:5–8` có fallback `readLocalStore()` khi chưa có Supabase. Đây là lưu phía server của ứng dụng, không nên gọi nhầm là dữ liệu chỉ nằm trên điện thoại/trình duyệt người dùng.
- `LandingPage.tsx:522`: “trong vài giây” chưa có số đo phục vụ cam kết thời gian; AI còn phụ thuộc cấu hình và dịch vụ ngoài.
- Đề xuất: nêu đúng chế độ lưu, điều kiện hoạt động và nơi xem/xóa dữ liệu bằng ngôn ngữ người dùng; bổ sung liên kết hỗ trợ/quyền riêng tư phù hợp thực tế. Chưa audit quyền truy cập hoặc bảo mật backend, không kết luận có sự cố lộ dữ liệu.

### 11. P2 — Hình hero cần thể hiện sản phẩm tốt hơn và có attribution nhìn thấy được

- Ảnh hiện là hình giải phẫu OpenStax với nhiều nhãn tiếng Anh, không phải ảnh UI Atlas. Nhận định thiết kế: người mới khó hình dung giao diện 3D thực sự.
- Asset là JPEG **1.672.454 bytes**, 1304×3033; `<img>` tải nguyên ảnh gồm cả phần sau cơ thể, trong khi hero chỉ đóng khung phần trước. Có cơ hội giảm tải bằng ảnh responsive/định dạng phù hợp, giữ chất lượng chữ/nguồn.
- `public/anatomy/SOURCES.md` đã lưu tác giả OpenStax, link ảnh, CC BY 4.0, nhưng landing chỉ có alt “theo OpenStax”; chưa có credit/link/license nhìn thấy được ngay tại nơi dùng ảnh. Nên tái sử dụng thông tin attribution đã có thay vì chỉ để trong repository.
- Không đo LCP/CLS/INP production, không kết luận điểm Lighthouse hoặc tốc độ thực tế.

### 12. P3 — Metadata chia sẻ và cơ sở đo hiệu quả còn thiếu

- DOM hiện có title/description tiếng Việt và lang `vi`, nhưng chưa thấy Open Graph/Twitter metadata/canonical. Không tìm thấy route sitemap/robots hoặc ảnh social chuyên dụng trong các file app đã rà.
- Chưa thấy instrument riêng cho CTA landing trong source được kiểm tra. Chưa có cơ sở nói phiên bản mới sẽ tăng conversion bao nhiêu.
- Đề xuất thêm ảnh chia sẻ từ giao diện thật và metadata khi chốt domain; nếu dùng phân tích, chỉ đo sự kiện sản phẩm tối thiểu như CTA, chọn vùng và mở nguồn, không gửi nội dung tư vấn/hồ sơ.

## Hướng nâng cấp đề xuất

1. Sửa nhãn LIVE, số minh họa, câu cơ sinh học và phạm vi cam kết nguồn.
2. Sửa deep link vùng và nút xem nguồn.
3. Chốt một hành động bắt đầu; đưa một ví dụ sản phẩm thật lên gần hero.
4. Rút mobile, hoàn thiện tab/FAQ/main và tương phản nhãn nhỏ.
5. Hoàn thiện thông tin dùng thử/lưu dữ liệu, ảnh responsive, attribution và metadata chia sẻ.

Giữ font, hệ màu xanh và headline hiện tại nếu không có mục tiêu thương hiệu mới. Không cần thêm hiệu ứng. Không dùng testimonial, phê duyệt chuyên môn hoặc số liệu hiệu quả chưa có thật.

## Giới hạn kiểm tra

Không thay đổi code sản phẩm. Không gửi câu hỏi AI hoặc tạo/chỉnh hồ sơ học viên. Đã kiểm tra chọn vùng, keyboard ArrowRight, cấu trúc FAQ, đích nút nguồn và responsive; không phải kiểm thử toàn bộ app. Không chạy production build, Lighthouse, reader thực tế, giả lập mạng yếu hoặc reduced-motion. Các góp ý chuyển đổi/thẩm mỹ là đánh giá thiết kế và giả thuyết, không phải kết quả thử nghiệm người dùng. Source comparison không xác lập clinical validation.
