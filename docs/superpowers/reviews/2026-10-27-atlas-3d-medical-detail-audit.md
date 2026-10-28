# Review độ chi tiết và độ chính xác y khoa của Atlas 3D

Ngày kiểm tra: **27/10/2026**, múi giờ Asia/Saigon. Mã nguồn: `8fa995f79170bec73052418271f01d4ec4e52ad5`. Trang kiểm tra: https://kinesis-lab.vercel.app/atlas.

## Kết luận

**Chưa đủ cơ sở để khẳng định toàn bộ 3D đã chính xác y khoa hoặc có độ chi tiết giải phẫu đầy đủ.** Mô hình có nguồn gốc rõ, bộ tài sản nhất quán và nhiều giới hạn được ghi nhận trung thực. Tuy nhiên, review xác nhận lỗi danh pháp, metadata bên, phân loại hiển thị và liên kết vùng; một số cấu trúc là bề mặt sơ đồ rất thô. Cần phân biệt những lỗi này với việc chưa có bằng chứng xác nhận hình học từng mesh.

Không chấm một phần trăm “độ chính xác”: chưa có tập chuẩn và quy trình đo sai lệch giải phẫu để tạo ra con số đó. Đối chiếu nguồn uy tín là tiêu chí nội dung theo `docs/medical-evidence-policy.md`; review chuyên gia độc lập là tùy chọn, không phải cổng chặn chung.

Lượt này chỉ review, tạo báo cáo/ảnh/metrics; **không sửa mã ứng dụng, dữ liệu giải phẫu, commit, push hay deploy**.

## Phạm vi đã kiểm tra

- Toàn bộ 1.031 hồ sơ manifest, ánh xạ nhóm hiển thị, tên, bên, nguồn và mức chứng cứ.
- Cả sáu GLB: danh sách ID, kích thước và hash; giải mã toàn bộ 1.411 primitive của gói full để tính độ phức tạp và kiểm tra vị trí hữu hạn. Kiểm tra boundary/world bounds ở các ví dụ nêu dưới.
- Dòng dữ liệu từ exporter tới vật liệu, lớp, nhãn, search overlay và camera; thẻ kiến thức cá thể/nhóm/vùng; thuật ngữ Việt–Anh–Latin.
- Đối chiếu bảng danh pháp gốc FIPAT TA2, tài liệu giảng dạy OpenStax và các nguồn đại học/nghiên cứu nêu cuối báo cáo. Đọc mẫu các kiến thức vai, hông, gối, cơ mông nhỡ và thành bụng; không coi đây là kiểm chứng không gian từng điểm của cả 1.031 mesh.
- Xác minh trực tiếp trên bản live: Internal Oblique và thẻ nhóm; Thyroid cartilage; Iliocostalis colli; lỗi Latin của Flexor digiti minimi of foot.

Số liệu tái lập: [geometry-metrics.json](./assets/2026-10-27-atlas-medical-audit/geometry-metrics.json). Bộ công cụ đọc GLB sẵn có: `scripts/load-atlas-audit.mjs`. Nó dùng decoder cục bộ, chỉ tạo/xóa thư mục tạm của chính nó.

## Phát hiện cần sửa

### F1 — P2: nhóm tổ chức của nguồn đang được hiển thị như phân loại mô

**Đã xác nhận cả dữ liệu và giao diện.** Exporter lấy collection Skeletal/Muscular làm `layer: bone/muscle`; panel cấu trúc in “Xương/Cơ” dưới phần “Phân lớp và bên”. Đây là hai khái niệm khác nhau.

- Có **26 cấu trúc thuộc `bone` nhưng chỉ có surface `cartilage`**: gồm sụn giáp, sụn nhẫn, một số sụn thanh quản và sụn sườn.
- Có **37 cấu trúc thuộc `muscle` nhưng không có surface muscle**, gồm gân gót, các mạc giữ gân và dải chậu–chày.
- Ví dụ live: `Thyroid cartilage`, Latin `Cartilago thyreoidea`, được in **“Xương · Đường giữa / không phân bên”**. Đây là sụn thanh quản theo [OpenStax §22.1, Larynx](https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system).

Vị trí: `scripts/export_z_anatomy.py:86`; `src/lib/clinical/atlas-3d.ts:48`; `src/components/atlas3d/Atlas3DExplorer.tsx:572`.

Ảnh live: [thyroid-cartilage-bone-layer.png](./assets/2026-10-27-atlas-medical-audit/thyroid-cartilage-bone-layer.png).

Nên sửa: tách **nhóm hiển thị theo hệ của nguồn** khỏi **loại mô giải phẫu**; không đổi đơn giản mọi surface bằng suy đoán từ màu. Thông tin học cần dùng tên phù hợp và có phạm vi nguồn riêng.

### F2 — P2: một số material nguồn không tương đương danh tính mô thật

**Đã xác nhận trong manifest và GLB.** `classify_surface()` chỉ đọc tên material, không đối chiếu danh tính cấu trúc.

| Cấu trúc, mỗi bên | Phân loại material đang dùng | Đối chiếu giải phẫu |
|---|---|---|
| Intermediate tendon of digastric | `Ligament → ligament` | Là gân trung gian của cơ hai bụng, không phải dây chằng |
| Articular disc of distal radio-ulnar joint | `Ligament → ligament` | Nghiên cứu mô học phân biệt đĩa sụn sợi với mô dây chằng quay–trụ; không nên coi cả hai là một mô đồng nhất |
| Iliotibial tract | `Tendon → tendon` | Là phần của fascia lata; bộ bảy material hiện không có nhóm fascia |

Nguồn: [FIPAT/IFAA, intermediate tendon of digastric](https://ifaa.unifr.ch/Public/TNAEntryPage/auto/unit/LAEN/TAH15240%20Unit%20EN.htm); [Semisch và cs., nghiên cứu mô học TFCC](https://doi.org/10.1177/1753193415618391), abstract; [Fairclough và cs.](https://pubmed.ncbi.nlm.nih.gov/16533314/), abstract và mô tả hình. Các nguồn này hỗ trợ nhận dạng mô, không xác nhận hình học GLB.

Vị trí: `scripts/z_anatomy_surfaces.py:12`; `scripts/export_z_anatomy.py:124`; `public/anatomy/3d/manifest.json:1`.

Nên sửa: ghi rõ đây là material/nhóm mô đơn giản hóa của nguồn. Những cấu trúc đã đối chiếu nên có trường danh tính mô riêng hoặc ngoại lệ có nguồn; không nâng material artist thành phân đoạn mô học đã xác nhận.

### F3 — P2: ba mesh có bên nhưng mất metadata trái/phải

**Không phải thiếu mesh hoặc đã chứng minh mesh nằm sai vị trí.** Có hai đối tác ở hai phía, nhưng một đối tác mang `side:null`:

| ID | Cấu trúc | Metadata | Đối tác và suy luận từ world placement |
|---|---|---|---|
| `za-ad4d8464ab41` | Iliocostalis colli muscle | `null` | Mesh phía trái, đối tác có nhãn phải |
| `za-5e590f3614ed` | Intra-articular ligament of head of rib | `null` | Mesh phía trái, đối tác có nhãn phải |
| `za-ef71d29b63c0` | Ulnopisiform ligament | `null` | Mesh phía phải, đối tác có nhãn trái |

World bounds và phía đối tác có trong metrics JSON. Đây là kiểm tra nhất quán metadata trong cùng hệ tọa độ, chưa phải đo trên một mẫu giải phẫu độc lập.

Exporter chỉ nhận hậu tố `.l/.r`; UI đổi null thành “Đường giữa / không phân bên”. Tìm tên kèm trái/phải vì thế bỏ sót đối tác không có nhãn. Đã xác nhận nhãn sai/thiếu của Iliocostalis colli trên live.

Vị trí: `scripts/export_z_anatomy.py:97`; `src/components/atlas3d/Atlas3DExplorer.tsx:72`; `src/lib/clinical/atlas-3d.ts:63`.

Ảnh: [iliocostalis-side-null.png](./assets/2026-10-27-atlas-medical-audit/iliocostalis-side-null.png).

Nên sửa: ngoại lệ bên được đối chiếu với nguồn và đối tác; phân biệt “không có thông tin bên” với cấu trúc thật sự đường giữa.

### F4 — P2: ba cơ chóp xoay bị gán nhầm ngữ cảnh vùng ngực–thân

Supraspinatus, Infraspinatus và Subscapularis ở cả hai bên có `clinicalRegion: thoracic_core`; Teres minor là `shoulder`. Theo [OpenStax §9.6, Shoulder Joint](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints), cả bốn thuộc nhóm chóp xoay vai.

Quy tắc tọa độ/collection ở exporter ghi đè nhãn shoulder. Bộ xem theo vùng lọc đúng trường này, nên thiếu sáu mesh tương ứng khỏi tập liên quan của vai; khi bật cấu trúc xung quanh, chọn chúng còn có thể điều hướng sang thoracic/core.

Đây là lỗi liên kết ngữ nghĩa dạy học, **không phải bằng chứng ba cơ được đặt sai trên cơ thể**.

Vị trí: `scripts/export_z_anatomy.py:112–116`; `src/lib/clinical/contextual-anatomy.ts:71`; `src/components/atlas3d/ContextualAnatomyViewer.tsx:198`.

Nên sửa: ánh xạ vùng được đối chiếu theo cấu trúc, có thể nhiều vùng; thêm kiểm tra membership chóp xoay thay vì chỉ kiểm tra số lượng/chuỗi hiện tại.

### F5 — P2: ít nhất bốn tên Latin sai, ảnh hưởng tám mesh hai bên

| Tên nguồn | Latin hiện tại | Phần cần sửa/đối chiếu |
|---|---|---|
| Flexor digiti minimi of foot | `Flexor digiti minimi pedis pedis` | Bỏ một `pedis`; TA2 mục 2682 |
| Medial head of triceps brachii | `Caput mediale musculi tricipitis caput brachii` | Bỏ `caput` thừa trước `brachii`; TA2 mục 2474 |
| First metacarpal bone | `Os primum metarcapi` | `metarcapi → metacarpi` |
| Fourth metatarsal bone | `Os quatum metatarsi` | `quatum → quartum` |

Hai lỗi đầu được đối chiếu với [FIPAT TA2 v2.07, Part 2](https://cdn.dal.ca/content/dam/dalhousie/pdf/library/FIPAT/TA2/FIPAT-TA2-Part-2.pdf), PDF trang 76 và 69, gồm xem bảng trực tiếp. Hai lỗi sau đối chiếu mục tên của [Khoa Y Đại học Comenius — bàn tay](https://portal.fmed.uniba.sk/clanky.php?aid=301) và [bàn chân](https://portal.fmed.uniba.sk/clanky.php?aid=300); [Elsevier Complete Anatomy](https://www.elsevier.com/resources/anatomy/skeletal-system/appendicular-skeleton/fourth-metatarsal-bone/21104) xác nhận thêm trường hợp thứ tư.

Hai lỗi đầu vẫn được đánh dấu khớp trong nhóm “884 cặp khớp” vì CSV dẫn xuất upstream cũng sai giống hệt. Điều đó minh họa vì sao **so khớp nguồn không đồng nghĩa danh pháp đúng**. Lỗi lặp `pedis` đã xác nhận trên live: [ảnh](./assets/2026-10-27-atlas-medical-audit/latin-pedis-duplicate.png).

Không xem riêng việc tên English hand/foot flexor digiti minimi thiếu *brevis* là lỗi: TA2 có cách gọi chính đó và synonym dài hơn. PCL `Ligamentum decussatum posterius` cũng có ở cột tên khác; không báo nhầm thành ACL/PCL sai.

Vị trí dữ liệu: `public/anatomy/3d/manifest.json:1`; UI: `src/components/atlas3d/Atlas3DExplorer.tsx:568`. Nên giữ tên nguồn nguyên bản để truy xuất, thêm tên chuẩn hóa có nguồn thay vì âm thầm làm mất nguồn gốc.

### F6 — P2: app làm mất hiển thị hai mặt, khiến bề mặt hở biến mất từ phía đối diện

**Đã xác nhận bằng asset, runtime code và trang live.** Mọi material trong cả sáu GLB đều có `doubleSided:true`. GLTFLoader chuyển đúng thành `DoubleSide`, nhưng `AtlasStage.load()` thay material nguồn bằng `createTissueMaterial()` mà không chuyển tiếp `.side`. Material mới mặc định `FrontSide` của Three.js; kiểm tra hàm thật cho cả sáu loại mô đều trả `side:0`, trong khi `DoubleSide:2`.

Khi tách ATFL phải `za-975efd6a59c5`, một phía hiện rõ hình mặt bốn đỉnh/hai tam giác; phía đối diện không hiện dây chằng, dù `data-highlighted-ids` vẫn chứa ID đó. Hai camera đối xứng quanh cùng tâm, không phải mesh bị ẩn hoặc bị bỏ khỏi bundle. Đây là lỗi render của app, **không phải hệ quả bắt buộc của một mô hình sơ đồ ít polygon**.

Vị trí: `src/components/atlas3d/atlas-stage.ts:554`; `src/components/atlas3d/tissue-materials.ts:81`; dependency đang cài `node_modules/three/src/materials/Material.js:88`.

Ảnh live: [phía thấy mặt](./assets/2026-10-27-atlas-medical-audit/atfl-open-surface-visible.png) và [phía đối diện mất mặt](./assets/2026-10-27-atlas-medical-audit/atfl-open-surface-hidden-opposite.png). Dữ liệu: [render-material-evidence.json](./assets/2026-10-27-atlas-medical-audit/render-material-evidence.json).

Nên sửa: giữ thuộc tính mặt của material nguồn khi thay PBR và kiểm tra bề mặt hở từ hai phía khi xem thường/search/isolate. Đường render curl có cùng mẫu thay material; phạm vi bổ sung này đã kiểm tra code, chưa quan sát browser trong lượt này.

### F7 — P3: một số trích dẫn kiến thức nền chưa trỏ đúng đoạn hỗ trợ

Các mô tả vận động theo hướng diện khớp cổ/thắt lưng và hạn chế vận động ngực đang dẫn OpenStax §7.3. Nội dung hỗ trợ trực tiếp, cụ thể hơn nằm ở §9.6, “Articulations of the Vertebral Column”. Đây là độ chính xác của dẫn nguồn, chưa phải kết luận các mô tả sai.

Vị trí: `src/lib/clinical/anatomy-atlas.ts:611`, `:635`, `:649`; các nguồn vùng trong `evidence-anatomy.ts`. Nên dẫn thêm đúng chương cạnh mệnh đề vận động.

## Những giới hạn lớn về độ chi tiết — không đánh đồng với lỗi vị trí

### G1 — Độ chi tiết lưới không đồng đều

Gói full có **2.368.785 tam giác** nhưng tổng số lớn không nói lên độ chi tiết của từng cấu trúc:

- **58 cấu trúc đúng hai tam giác**.
- **154 cấu trúc không quá mười tam giác**: 150 ở nhóm joint, bốn ở nhóm muscle.
- Một số ví dụ được kiểm tra là bề mặt hở:

| Cấu trúc, mỗi bên | Tam giác | Vertex slots | Cạnh biên |
|---|---:|---:|---:|
| Dây chằng sên–mác trước | 2 | 4 | 4 |
| Dây chằng gót–mác | 2 | 4 | 4 |
| Đĩa khớp cùng–đòn | 4 | 6 | 6 |
| Đĩa khớp ức–đòn | 4 | 6 | 6 |
| Đĩa khớp quay–trụ dưới | 7 | 8 | 7 |

Đây là các biểu diễn sơ đồ không gian, không phải thể tích mô kín đầy đủ. Kết quả **không chứng minh vị trí đại thể sai**; nó cho thấy không thể lấy chúng để khẳng định bề dày, thể tích, vi cấu trúc hoặc diện bám thực. Tăng shader, độ nhám hay texture không bổ sung những chi tiết hình học còn thiếu.

### G2 — Kiến thức riêng cho từng cấu trúc còn rất ít

- `AnatomyEvidenceCard` chỉ có hồ sơ cá thể cho **một cơ: mông nhỡ, hai mesh hai bên**.
- **110 mesh / 55 tên English** được nối vào thẻ nhóm cơ. Chọn một cơ thường nhận kiến thức của cả nhóm, không phải hồ sơ đầy đủ riêng cho cơ đó.
- **921 lựa chọn** không có thẻ kiến thức cá thể hay thẻ nhóm cơ; vẫn có thể có tên, nguồn mô hình, đối chiếu thuật ngữ và kiến thức vùng. Đây là khoảng trống nội dung, không phải 921 cấu trúc đã bị chứng minh sai.
- Internal Oblique hiện có thẻ nhóm thành bụng, chưa có thẻ cá thể đầy đủ về nguyên ủy, bám tận, thần kinh, lớp và chức năng theo bên. Nguồn giảng dạy có thể bổ sung: [OpenStax §11.4](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax), [TTUHSC](https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html), [Loyola](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/inab.htm).

Thẻ mông nhỡ được lấy mẫu đối chiếu và nhìn chung nhất quán với nguồn đã đọc. Điều này không xác nhận tọa độ nguyên ủy/bám tận hoặc hướng sợi trên mesh đó.

### G3 — Vân mô, độ dày và chuyển động có phần là mô phỏng

- Albedo nghiên cứu vật liệu hông là ảnh AI minh họa; normal/roughness maps do trường toán học tạo ra. Thông số 6–12 mm hay 2–8 µm là thông số mỹ thuật, không phải phép đo mô. Không có bản đồ bó sợi được đối chiếu rồi ánh xạ lên mesh.
- Mười bản đồ “độ dày” là khoảng cách ray xuyên lưới, không phải đo mô thật, vỏ xương hoặc từng lớp gân/sụn. Tỷ lệ đỉnh tính được 99,94–100% là độ phủ tính toán, không phải độ chính xác y khoa.
- Rig cable curl và skin weights do app biên soạn; không phải đường bám hoặc biến dạng cơ đo được. Không cần coi một animation trông hợp lý là nghiên cứu cơ sinh học đã xác nhận.

Những giới hạn này đang được ghi tương đối rõ trong `ATTRIBUTION.md`, provenance và UI nghiên cứu vật liệu. Đó là điểm tốt; không nên quảng bá các hiệu ứng này thành mức chi tiết giải phẫu đã xác minh.

### G4 — Highlight xuyên lớp là chế độ định vị, không mô tả mặt nông–sâu

Search giữ toàn body và vẽ target với `depthTest=false`, `depthWrite=false`, `renderOrder=10` tại `atlas-stage.ts:482–484`. Cơ sâu vì thế hiện qua bề mặt che. Đây là hành vi chủ ý theo yêu cầu giữ body, **không phải bằng chứng mesh bị đặt sai**.

Internal Oblique nằm ở lớp giữa của ba cơ phẳng thành bụng; External Oblique nông hơn và Transversus sâu hơn theo [OpenStax §11.4](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax). Một ảnh tô xuyên không thể tự dạy quan hệ đó.

Hiện có câu “Cơ sâu được tô màu xuyên lớp che” dưới search, nhưng khi cuộn tới mô hình có thể không còn nhìn thấy câu này. Nên giữ một nhãn chế độ nhỏ trên canvas và có cách quan sát lớp thật/ẩn lớp ngoài; vẫn giữ được trải nghiệm toàn body người dùng yêu cầu.

## Phần đã làm đúng và giới hạn của kết luận

- Các gói full/neck/upper/trunk/hip/lower có đúng 1.031/133/330/362/54/372 structure roots tương ứng; ID, byte count và hash đều khớp manifest. Không thấy gói vùng thiếu/thừa root so với quy tắc hiện tại.
- Toàn bộ vị trí giải mã là hữu hạn: 4.181.685 position components, không có NaN/Infinity. Có 1.393.895 vertex slots; số này không phải số điểm đo giải phẫu độc lập.
- Nguồn Z-Anatomy được ghim commit `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`, có attribution và license. [BodyParts3D gốc](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html) là mô hình tham chiếu nam trưởng thành. [Bài báo nguồn](https://doi.org/10.1093/nar/gkn613) mô tả MRI TARO rồi bổ sung/chỉnh sửa bằng tài liệu giải phẫu; không thể suy rằng toàn bộ vertex Z-Anatomy ngày nay là đo trực tiếp.
- Đây là tập con hệ vận động, loại trừ collection Head, nội tạng, insertion overlays và nhãn nguồn; không phải atlas đầy đủ mọi hệ cơ quan hay mọi biến thể cơ thể.
- Mọi hồ sơ catalog giữ `source-only`; các ID lạ không tự kế thừa trạng thái đã đối chiếu. Các trường reviewer không được bịa thành có người duyệt.
- Toàn bộ 216 mục thuật ngữ Việt của nhóm muscular có hồ sơ: **173 matched / 35 partial / 8 unresolved**, tương ứng **343/70/16 mesh**. Có đủ bản dịch hiển thị không đồng nghĩa mọi bản dịch đã được xác nhận. Không tìm thấy collision do rút gọn tên English hoặc hai khóa muscular khác nhau dùng cùng tên Việt.
- Có 884 cặp English/Latin trùng CSV dẫn xuất và 147 chưa khớp. **Không gọi 147 là 147 lỗi giải phẫu**: 139 có dòng English nhưng ID có hậu tố bị regex audit bỏ qua. CSV đã tải đúng commit, SHA-256 `0f9092a328b27dcd15d696d9f9a4087deb229a1aad21b75876657622de835974`; trùng CSV không thay cho đối chiếu TA2 gốc.
- Nguồn `.blend` gốc không có cục bộ trong lượt này: không tái xuất và không so mọi vertex với Blender nguồn. Draco có lượng tử hóa vị trí; “giữ hình dạng nguồn” không nên được hiểu là giống từng bit tọa độ.
- Review này chưa xác nhận mọi attachment footprint, thần kinh/mạch nhỏ, độ dày sụn, biến thể, kiến trúc bó sợi hoặc mọi quan hệ không gian. Không tìm thấy một lỗi trong một mẫu quan sát không chứng minh toàn bộ mesh đúng.

## Các kiểm tra phần mềm đã chạy

Đều pass: `check:atlas-evidence`; `check-atlas-surfaces.mjs`; `check:atlas-names`; `check:atlas-render`; `check:atlas-study`; `check:atlas-detail`; `check:atlas-context`; `check-evidence-coverage.mjs` (1.107 records, gồm 1.031 source-only).

Các kiểm tra này xác nhận tính nhất quán dữ liệu, tài sản, source scope và hành vi phần mềm. Chúng **không phải kiểm định y khoa**; F1–F7 vẫn tồn tại khi chúng pass.

## Thứ tự cải thiện đề xuất

1. Sửa render hai mặt, danh pháp Latin đã xác nhận, ba bên bị thiếu, mapping vai và cách gọi nhóm mô. Giữ nguyên nguồn gốc, ghi trường chuẩn hóa/ngoại lệ có nguồn, thêm kiểm tra regression theo sự kiện giải phẫu đã đối chiếu.
2. Bổ sung thẻ cá thể có nguồn cho các cơ người dùng thực sự tra: ưu tiên Internal Oblique, External Oblique, Transversus, bốn cơ chóp xoay và nhóm hông. Phân biệt từng kiến thức có nguồn với mô phỏng và không tự vẽ hướng sợi lên mesh.
3. Đánh dấu cấu trúc sơ đồ/bề mặt hở; bổ sung hình học có nguồn tốt hơn cho dây chằng và đĩa khớp cần học chi tiết. Không dùng tổng polygon count hay texture làm tiêu chí y khoa.
4. Đối chiếu theo vùng với danh mục kiểm tra cụ thể: danh tính, bên, quan hệ lớp, đầu nguyên ủy/bám tận đại thể, cấu trúc lân cận và loại mô; lưu nguồn, phạm vi đọc và ngày kiểm tra cho từng kết luận. Chỉ ghi đã xác nhận phần thực sự được kiểm tra.
5. Giữ toàn body và highlight, nhưng hiện rõ chế độ tô xuyên; cung cấp thao tác lớp nông–sâu khi mục tiêu là học quan hệ giải phẫu.

## Nguồn đã đọc và phạm vi truy cập

Tất cả truy cập trong review này: **27/10/2026**. Không coi abstract hoặc search-indexed text là đã đọc toàn bài.

| Nguồn | Phạm vi thực sự đọc |
|---|---|
| [Z-Anatomy README tại commit ghim](https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/0dd2329622c42b4fdcaabbf5ff6ad234df49b659/Readme.md) | README và credits; provenance, không xác nhận mọi mesh |
| [BodyParts3D archive](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html) | HTML mô tả database đầy đủ |
| [Mitsuhashi và cs., NAR, DOI gkn613](https://doi.org/10.1093/nar/gkn613) | Đoạn Construction Process do publisher lập chỉ mục; direct reader không truy cập được |
| [FIPAT TA2 v2.07 Part 2](https://cdn.dal.ca/content/dam/dalhousie/pdf/library/FIPAT/TA2/FIPAT-TA2-Part-2.pdf) | Các bảng mục liên quan; PDF trang 69, 76; số trang này là thứ tự PDF một-based, không phải số in ở chân trang |
| [FIPAT/IFAA TAH15240](https://ifaa.unifr.ch/Public/TNAEntryPage/auto/unit/LAEN/TAH15240%20Unit%20EN.htm) | Entry tên và taxonomy của gân trung gian cơ hai bụng; trang ghi work in progress |
| [Comenius bàn tay](https://portal.fmed.uniba.sk/clanky.php?aid=301), [bàn chân](https://portal.fmed.uniba.sk/clanky.php?aid=300) | Mục tên trong HTML đầy đủ qua HTTP; web reader 502 nhưng HTTP trực tiếp có nội dung |
| [OpenStax §22.1](https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system) | Đoạn Larynx |
| [OpenStax §7.3](https://openstax.org/books/anatomy-and-physiology-2e/pages/7-3-the-vertebral-column) | Các đoạn cấu trúc đốt sống theo vùng và hướng diện khớp trong HTML công khai; đối chiếu độ trực tiếp của dẫn nguồn với §9.6 |
| [OpenStax §9.6](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints) | Vai, háng, gối và cột sống; chỉ các luận điểm được nêu trong review |
| [OpenStax §11.4](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax) | Phần cơ thành bụng, quan hệ lớp; không dùng để xác nhận từng vertex |
| [TTUHSC muscle table](https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html), [Loyola IO](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/inab.htm) | Dòng cơ liên quan / entry ngắn đầy đủ |
| [UW gluteus medius](https://rad.uw.edu/muscle-atlas/gluteus-medius) | Entry công khai đầy đủ; tài liệu dạy học đại học |
| [McGraw Hill bảng 35-1](https://accessmedicine.mhmedical.com/Content.aspx?bookid=2478&sectionid=202021783) | Bảng trích do publisher lập chỉ mục, không phải toàn chương |
| [Tsutsumi, PMID30653048](https://pubmed.ncbi.nlm.nih.gov/30653048/) | Abstract; không suy kích thước hoặc bản đồ gân cho GLB |
| [Semisch, DOI1753193415618391](https://doi.org/10.1177/1753193415618391) | Abstract do publisher lập chỉ mục; phân biệt mô đĩa/ligament |
| [Fairclough, PMID16533314](https://pubmed.ncbi.nlm.nih.gov/16533314/) | Abstract và mô tả hình; quan hệ ITB–fascia lata |

Không tái xác lập được đầy đủ bài Flack trong lượt này; các phạm vi abstract đã lưu trong app vẫn được giữ nguyên. Scan giáo trình Việt được lấy mẫu xem trực tiếp nhưng là bản lưu bên thứ ba; chưa có xác thực tính toàn vẹn từ HMU/NXB. Những giới hạn này không được đổi thành lỗi giải phẫu đã chứng minh.
