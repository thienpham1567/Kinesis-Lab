# Rà soát Trigger Point: hình giải phẫu và kiến thức

Ngày rà soát: **2026-10-20**. Phạm vi: tab `trigger_points`, 10 mục cơ, 8 mục vùng đau, cẩm nang, bản ghi bằng chứng và hai PNG toàn thân đang dùng. Có kiểm tra giao diện localhost và một lượt review mã độc lập.

**Kết luận: chưa thể coi tab này là chính xác đầy đủ hoặc đã được thẩm định y khoa.** Có lỗi ánh xạ hình ảnh quan sát được và các tiêu đề suy diễn nguyên nhân trái với nội dung bằng chứng. Mọi bản ghi vẫn `status: limited`, `reviewedBy: null`. Đây là báo cáo review; các phát hiện dưới đây còn hiện diện trong phiên bản được kiểm tra.

## Các phát hiện cần sửa

### 1. P1 — Nhãn khẳng định cơ bị ức chế và là nguyên nhân đau

`src/components/TriggerPointExplorer.tsx:791` luôn in **“CƠ BỊ ỨC CHẾ — PHẢI KÍCH HOẠT”**. Dữ liệu ngay bên dưới chỉ đề nghị đánh giá chức năng và không mặc định ức chế. Ở dòng 927, chế độ tra vùng đau luôn gọi cơ là **“Thủ phạm”**, kể cả mục có nội dung nói chưa có bản đồ riêng được xác nhận. Người dùng có thể hiểu các tiêu đề nổi bật này là kết luận và chỉ định tập.

Đề nghị đổi thành “Vận động/bài tập có thể cân nhắc sau đánh giá” và “Nhóm cơ để tham khảo”; bỏ ngôn ngữ nguyên nhân và bắt buộc. Các tiêu đề “Key vs Satellite”, “Nút Trigger Point”, “Khi nào TrP cháy” cũng cần được rà cùng nội dung, tránh tạo cảm giác đã xác định điểm bệnh lý.

Bằng chứng liên quan: [đồng thuận Delphi 2018](https://pubmed.ncbi.nlm.nih.gov/29025044/) đề xuất tiêu chí lâm sàng, không xác nhận cơ bị ức chế hay chỉ định kích hoạt bắt buộc từ một sơ đồ. [Myburgh 2008](https://pubmed.ncbi.nlm.nih.gov/18503816/) cho thấy bằng chứng về độ tái lập sờ nắn có hạn chế. Đây là nhận định về mức hỗ trợ của nguồn, không phải phủ nhận mọi biểu hiện lâm sàng của đau cơ.

Ảnh kiểm tra: `assets/2026-10-20-trigger-review/causal-heading.png`.

### 2. P2 — Vùng đau thái dương nằm ngoài đầu trên hình

`src/lib/clinical/trigger-point-atlas.ts:286`: đường vùng lan trước của thang trên dùng x khoảng 170–318. Đầu của PNG trước nằm khoảng x362–536. Giao diện hiển thị vùng “Lan đau” nổi trong nền trắng bên cạnh đầu. Mục `neck_temple` ở dòng 1171 cũng có vùng x175–420, phần lớn lệch sang bên.

Hai ảnh và SVG đều 900×1620; đây là tọa độ biên soạn không khớp nền, không phải lỗi co giãn SVG. Sửa kích thước hiển thị không giải quyết ánh xạ này. Cần định vị lại theo mốc trên ảnh có nguồn, rồi duyệt ánh xạ; không tự suy thành vị trí trigger point đã được xác nhận.

Ảnh kiểm tra: `assets/2026-10-20-trigger-review/upper-trapezius-floating-referral.png`.

### 3. P2 — “Dưới gai” đang tô vùng chụp cơ delta

`src/components/TriggerPointExplorer.tsx:103` và 109 đặt vùng chọn dưới gai lên phần vai ngoài của hình mặt sau. Các dấu X tại `trigger-point-atlas.ts:424`, 432 và 440 cũng nằm trong phần cơ delta nhìn thấy ở PNG. Hình nền này là hình bề mặt, không phơi bày đầy đủ cơ dưới gai/tròn bé ở khu vực đang tô.

Đề nghị dùng hình vai có lớp phù hợp hoặc mô hình 3D được ánh xạ theo cơ riêng, phân biệt rõ lớp nông/sâu. Nếu chỉ là nút tra cứu theo vùng cơ thể thì phải thể hiện như vùng định hướng, không tô phần cơ delta với chú giải “Cơ đang chọn”. [OpenStax §11.5, hình 11.22–11.24](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs) minh họa các lớp và vị trí cơ đai vai; hình sâu có cắt cơ che phủ.

Ảnh kiểm tra: `assets/2026-10-20-trigger-review/infraspinatus-over-deltoid.png`.

### 4. P2 — Nguồn gốc hai hình nền chưa truy vết được

Chú thích mã ở `src/components/TriggerPointExplorer.tsx:31` gọi hai ảnh là OpenStax. Tuy nhiên, `public/anatomy/SOURCES.md` chỉ ghi nguồn các hình mông và nêu rõ các ảnh khác còn cần hồ sơ riêng. Không tìm thấy URL gốc, tác giả, giấy phép, lịch sử thay đổi/cắt nhãn hay bản ghi review giải phẫu tương ứng với `muscles-anterior.png` và `muscles-posterior.png` trong phạm vi repository đã tìm.

Điều này không chứng minh hai ảnh là AI hoặc sai toàn bộ; nó có nghĩa chưa đủ cơ sở xác nhận nguồn và các chi tiết. Cần bổ sung hồ sơ gốc/biến đổi/giấy phép và so với ảnh nguồn; nếu không xác minh được thì thay bằng tài sản truy vết được. Nguồn hợp lệ của ảnh nền cũng không tự xác nhận các đường đau lan do app vẽ thêm.

## Đánh giá nội dung theo 10 mục

Phần chữ đã tránh nhiều suy diễn trước đây: không coi sơ đồ là chẩn đoán, không yêu cầu đau 5–6/10, không có cửa sổ kích hoạt bắt buộc, không hướng dẫn ấn sâu cổ/nách/bụng/bẹn. Những giới hạn đó phù hợp với mức thận trọng của các nguồn đang dẫn. Các nhận định cơ chế, hiệu quả bài tập và bản đồ chi tiết chưa vì vậy được xác nhận đầy đủ.

| Mục | Nội dung/giới hạn cần giữ |
| --- | --- |
| Thang trên | Nghiên cứu cổ 20 người bệnh/20 chứng không xác nhận mọi đau đầu từ cơ thang; bản đồ đang lệch nền. |
| Nâng vai | Không suy từ đau góc bả hoặc tư thế sang cơ co ngắn/ức chế; vị trí cơ sâu chưa được duyệt. |
| Dưới gai/tròn bé | Nghiên cứu vai 12 người bệnh/10 chứng khảo sát infraspinatus, không khảo sát teres minor; không gán bằng chứng chung cho cả hai. |
| Ngực bé/ngực lớn | Liên hệ chiều dài ngực bé–vận động bả ở người không đau không xác nhận bản đồ đau, TOS hoặc tác dụng release. |
| Xô/răng trước | Hồ sơ hiện tại thừa nhận chưa có nguồn đã đọc xác nhận bản đồ đau riêng. |
| QL | Không suy quan hệ nhân quả hoặc chuỗi bù trừ từ điểm đau/hip hike; sờ mô mềm lưng có độ tin cậy không nhất quán. |
| Iliopsoas | Cơ sâu, không dùng chấm trên bụng làm tọa độ tiếp cận; đau bẹn/lưng không chọn được một cơ duy nhất. |
| Mông nhỡ/bé/hình lê | Không gộp đau lan chân, chèn ép thần kinh và điểm nhạy thành một chẩn đoán; cần hình lớp sâu phù hợp. |
| TFL/rộng ngoài | Hướng dẫn đau bánh chè không chứng minh mọi đau ngoài gối do TFL/VL; bản đồ riêng chưa có nguồn hỗ trợ trong hồ sơ. |
| Bụng chân/dép/chày trước | Không gộp các cơ ở khoang/lớp khác nhau thành một vị trí; đau gót và nhạy bắp chân không xác định nguồn đau. |

Bảng là rà soát phạm vi lập luận/dữ liệu hiện có, không chứng nhận từng câu hoặc từng tọa độ. Một số mục gộp nhiều cơ có bằng chứng và lớp giải phẫu khác nhau; nên tách trước khi triển khai bản đồ chi tiết.

## Nguồn đối chiếu lại ngày 2026-10-20

| Nguồn | Phần thực sự tiếp cận | Ý nghĩa cho review |
| --- | --- | --- |
| [Fernández-de-las-Peñas & Dommerholt 2018, PMID 29025044](https://pubmed.ncbi.nlm.nih.gov/29025044/) | Bản ghi và abstract | Đồng thuận chuyên gia; không kỳ vọng một vị trí điểm/vùng lan cố định. Không xác nhận bản đồ app. |
| [Myburgh 2008, PMID 18503816](https://pubmed.ncbi.nlm.nih.gov/18503816/) | Bản ghi và abstract | Bằng chứng tái lập sờ nắn hạn chế, chất lượng nghiên cứu không đồng đều. |
| [Fernández-de-las-Peñas 2007, PMID 21882489](https://pubmed.ncbi.nlm.nih.gov/21882489/) | Bản ghi và đoạn abstract từ kết quả tra cứu nguồn gốc; mở trang trực tiếp lúc đầu không trả nội dung | Cơ cổ, mẫu 20/20; không chứng minh chuỗi nguyên nhân hoặc bản đồ cố định. |
| [Hidalgo-Lozano 2010, PMID 20186400](https://pubmed.ncbi.nlm.nih.gov/20186400/) | Abstract hiển thị đầy đủ trong kết quả tra cứu PubMed; mở trang trực tiếp lúc đầu không trả nội dung | Mẫu 12/10, danh sách cơ không có teres minor. |
| [Nolet 2021, PMID 34446040](https://pubmed.ncbi.nlm.nih.gov/34446040/) | Bản ghi và abstract | Độ tin cậy sờ mô mềm lưng không nhất quán, độ giá trị còn bất định; không chẩn đoán QL/psoas qua sơ đồ. |
| [Cheatham 2015, PMID 26618062](https://pubmed.ncbi.nlm.nih.gov/26618062/) | Bản ghi và abstract | Lợi ích SMR ngắn hạn; không có chương trình tối ưu thống nhất. Không xác nhận liều hoặc bản đồ cơ riêng. |
| [NCCIH: Massage Therapy](https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know) | Phần risks và tips | Phù hợp với lựa chọn thận trọng của app; không dùng massage trì hoãn đánh giá vấn đề y tế. Không phải nghiên cứu xác nhận vị trí ấn cho từng cơ. |
| [OpenStax A&P2e §11.5](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs) | Văn bản và mô tả hình lớp cơ vai | Đối chiếu vị trí/lớp cơ; không xác nhận nguồn của hai PNG hiện tại. |
| [OpenStax A&P2e §11.6](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs) | Đoạn lớp cơ mông và cẳng chân | Piriformis ở sâu so với maximus, soleus ở sâu so với gastrocnemius; cần phân lớp khi minh họa. |

Các nguồn còn lại trong `evidence-trigger.ts` giữ phạm vi/ngày kiểm tra 2026-10-19 đã ghi trong báo cáo trước. Lần này không đọc lại toàn văn toàn bộ 23 nguồn và không xác nhận các bản đồ Travell/Janda. Một số trang PubMed/BMJ trả nội dung rỗng hoặc lỗi truy cập; không dùng kết quả đó như đã đọc tài liệu. Chưa có chuyên gia giải phẫu/clinician độc lập duyệt bản đồ, bản dịch hoặc chỉ dẫn thực hành.

## Kiểm tra phần mềm

- `node scripts/check-trigger-evidence.mjs`: pass — 10 mục cơ, 8 mục đau, 11 bản ghi bằng chứng, trạng thái review và metadata. Script chỉ kiểm tra tọa độ hữu hạn/chú thích giới hạn; **không kiểm tra điểm có nằm đúng cơ/đầu hay không**.
- React Doctor, phạm vi `TriggerPointExplorer.tsx`, tắt telemetry/supply-chain scan: hai cảnh báo maintainability (hàm lớn/phức tạp). Đây là nhận xét cấu trúc mã có căn cứ, không phải bằng chứng sai kiến thức hay nguyên nhân của từng lỗi hình ảnh. Không sửa/suppress trong lượt review.
- UI đã quan sát: Cơ → vùng đau, thang trên, dưới gai, mặt trước/sau và chế độ Vùng đau → cơ. Nhãn “Thủ phạm” và nhãn ức chế tái hiện được. Ảnh chụp bằng CUA, không chỉnh sửa ảnh.
- Không thay đổi runtime, nội dung y khoa hay tọa độ trong lượt review. Không có phê duyệt lâm sàng.

## Thứ tự xử lý đề nghị

1. Sửa ngay ngôn ngữ kết luận nguyên nhân/ức chế/bắt buộc và đồng bộ chú giải với trạng thái minh họa.
2. Xác minh/thay ảnh có nguồn rõ ràng; tách các cơ đang gộp và dùng lớp nông/sâu đúng.
3. Chỉ hiển thị vùng đau/điểm có hồ sơ nguồn cụ thể; giữ các vùng chưa có bằng chứng ở trạng thái chưa xác nhận, không vẽ như bản đồ chuẩn.
4. Review độc lập từng lớp/vị trí và nội dung trước khi ghi trạng thái đã được chuyên gia duyệt. Kiểm thử phần mềm tiếp tục là một kiểm tra riêng.

## Xử lý ngày 2026-10-20

Phần này ghi lại các thay đổi phần mềm. Nó không phải phê duyệt chuyên môn: mọi bản ghi vẫn ở trạng thái `reviewedBy: null`, và các tọa độ mới vẫn chỉ là minh họa, chưa được xác minh.

1. **P1, ngôn ngữ (đã sửa).** Các tiêu đề trong `TriggerPointExplorer.tsx` đã được đổi như sau:

   | Tiêu đề cũ | Tiêu đề mới |
   | --- | --- |
   | “CƠ BỊ ỨC CHẾ — PHẢI KÍCH HOẠT” | “Vận động/bài tập có thể cân nhắc sau đánh giá” |
   | “Bài kích hoạt” | “Ví dụ nếu phù hợp” |
   | “Thủ phạm” | “Nhóm cơ để tham khảo” |
   | “Key vs Satellite” | “Cơ liên quan cần đánh giá (giả thuyết, chưa xác nhận)” |
   | “Trigger Point vệ tinh” | “Vùng liên quan khác (chưa xác nhận)” |
   | “Khi nào TrP cháy” | “Tình huống tập có thể làm triệu chứng tăng” |
   | “Nút Trigger Point” | “Vùng minh họa, chưa xác minh vị trí” |
   | “Cơ đang chọn” | “Vùng tra cứu (không phải ranh giới cơ)” |

   Ngoài ra, nhãn “Jump Sign” và “Khách hay than” đã được thay bằng nhãn trung tính.

2. **P2, thái dương (đã sửa).** Vùng lan trước của thang trên và vùng đau `neck_temple` nay đã nằm trên đầu/cổ theo mốc trên PNG. Vùng lan sau của thang trên nay nằm trên cổ sau-bên.

3. **P2, dưới gai (đã sửa).** Vùng tra cứu và các dấu X của dưới gai đã được dời vào khoảng tam giác nhìn thấy giữa bờ sau cơ delta và bờ ngoài cơ thang. Dấu X của tròn bé vẫn chỉ là vị trí định hướng. Lớp sâu chưa được thể hiện vì hình nền chỉ có lớp nông.

4. **P2, nguồn ảnh (đã truy vết).**
   - Hai PNG được xác định là bản cắt trùng từng pixel của `muscles-front-back.png`.
   - Nguồn khả dĩ là [Muscles front and back.svg](https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg), tác giả OpenStax & Tomáš Kebert & umimeto.org, giấy phép CC BY-SA 4.0. Đây là bản vẽ lại từ OpenStax 1105, trong đó mặt sau đã bị chỉnh sửa.
   - Đã tải bản render 1920 px từ Commons để đối chiếu. File không trùng byte, nhưng 889.212/889.245 pixel hiển thị lệch dưới 8/255; 33 pixel còn lại đều là pixel khử răng cưa ở mép. Kết luận: cùng nội dung, khác lần render.
   - Chi tiết nằm trong `public/anatomy/SOURCES.md`. Cả ba màn hình dùng hai PNG (Trigger Point, `MuscleHypertrophyExplorer`, `BodyMapExplorer`) nay hiển thị ghi công qua `MusclePlateCredit`, kèm ghi chú về lớp nông.
   - Đã bỏ chú thích mã gọi hai ảnh là “OpenStax”.

5. **Phát hiện thêm khi sửa (đã sửa).**
   - **Ngoài cơ thể:** các dấu X `ut-trp1-l/r`, `sa-trp-l`, `vl-dist-l` nằm ngoài cơ thể. Vùng lan tay của pec minor và dưới gai, vùng lan của răng trước, TFL/VL và soleus, cùng các vùng đau `lateral_knee`, `heel_foot` và các vùng tra cứu bắp chân/cẳng chân đều có 18–57% diện tích nằm ngoài cơ thể.
   - **Sai bên:** vùng lan mặt trước của thang trên, dưới gai, răng trước và chày trước được vẽ ở bên cơ thể đối diện với vùng/điểm mặt sau. Trên ảnh mặt sau, bên trái ảnh là bên trái người; trên ảnh mặt trước, bên phải ảnh mới là bên trái người.

6. **Kiểm tra hồi quy.** `scripts/check-trigger-evidence.mjs` nay đọc kênh alpha của hai PNG và kiểm tra ba điều:
   - mọi dấu X nằm trên cơ thể;
   - mọi vùng có ≤15% diện tích nằm ngoài cơ thể;
   - vùng lan của mỗi mục không bị vẽ ở cả hai bên.

   Script thất bại với tọa độ cũ và đạt với tọa độ mới. Script vẫn **không** kiểm tra một điểm có nằm đúng cơ hay đúng lớp hay không.

Ảnh tọa độ sau khi sửa: `assets/2026-10-20-trigger-review/after-overlays.png`.

**Còn mở:**
- Hình lớp sâu có nguồn cho các cơ sâu, và tách các mục đang gộp nhiều cơ.
- Chỉ vẽ vùng/điểm có hồ sơ nguồn riêng.
- Duyệt độc lập của chuyên gia giải phẫu/lâm sàng.
