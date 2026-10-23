# Bổ sung kiến thức Atlas (4 tab) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa 4 tab Atlas từ "nguồn tốt nhưng mỏng" lên mức một học viên CPT (NCSF) có thể học trực tiếp, với mọi kiến thức mới có nguồn ở cấp mệnh đề.

**Architecture:** Mỗi tab vẫn giữ data module + `EvidenceRecord`/`MuscleEvidenceRecord` hiện có; kiến thức mới là field/record mới trong cùng file dữ liệu, có `sourceRefs`/`[n]` trỏ vào danh sách nguồn của record. Thứ tự: P0 sửa sai và hiển thị dữ liệu đã có → P1 lập chương trình tập (tab PT) → P2 Trigger Point → P3 Phục hồi khớp và chiều sâu giải phẫu 3D. Mỗi phase là một nhánh/PR riêng, chạy được độc lập.

**Tech Stack:** Next 16 / React 19 (đọc `node_modules/next/dist/docs/` trước khi đụng route/component), TypeScript data modules trong `src/lib/clinical/`, script kiểm tra Node trong `scripts/`.

**Spec:** Kết quả audit 4 tab ngày 2026-10-22 (tóm tắt trong phiên chat, đối chiếu với `docs/superpowers/reviews/2026-10-22-atlas-source-review-all.md`) và `docs/medical-evidence-policy.md`.

## Global Constraints

- Tuân thủ `docs/medical-evidence-policy.md`: mỗi phát biểu y khoa/giải phẫu mới có nguồn truy được ở cấp mệnh đề.
- **Đọc nguồn trước khi viết.** Chỉ dùng nội dung trong phạm vi đã đọc thực tế (full text / bảng / abstract). `access` ghi đúng phạm vi đó; `checkedAt` = ngày đọc thật, không phải ngày tích hợp.
- `reviewedBy: null` giữ nguyên. Không thêm badge "chờ chuyên gia duyệt" (quyết định 2026-10-22). Không bịa chứng nhận/phê duyệt.
- `status: "literature-reviewed"` chỉ khi đã đối chiếu nguồn cho các mệnh đề của record; còn lại `"limited"`.
- Diễn đạt lại bằng tiếng Việt, ngắn gọn; không chép nguyên văn hay phân phối lại hình/văn bản sách có bản quyền.
- Không trình bày hướng sợi, toạ độ điểm kích hoạt, vùng đau lan dạng hình hay số đo mô suy ra từ mesh/AI như giải phẫu đã xác minh.
- Giữ hướng dẫn chuyển khám theo triệu chứng; nội dung là giáo dục, không chẩn đoán.
- Nguồn được ưu tiên: sách giáo khoa (OpenStax A&P 2e), NCBI StatPearls, bảng giải phẫu đại học, CPG của JOSPT, NICE, Cochrane, position stand (ACSM/NSCA/ACOG), nghiên cứu bình duyệt. Không dùng blog/trang thương mại.
- Khi thêm record mới phải cập nhật inventory chính xác trong `scripts/check-evidence-coverage.mjs` và ghi chú coverage trong `docs/medical-evidence-policy.md`.
- Mỗi task kết thúc bằng: script kiểm tra liên quan + `npm run lint` + `npx next build` pass, kiểm tra UI desktop/mobile, commit.

## Review Focus

- Mệnh đề có `[n]` nhưng nguồn [n] không thực sự nói điều đó (lỗi đã gặp ở §7.3) → mỗi task có bước đối chiếu từng mệnh đề với đoạn nguồn và ghi vào review note.
- Thêm vùng mới (`elbow`, `wrist_hand`) làm vỡ mọi `Record<AnatomyRegionId, …>` và bộ từ khoá cảnh báo hồ sơ khách → Task 13 có assertion mọi region đều có foundations/evidence/keywords.
- Record `source-only` vẫn hiện câu "Phát biểu được đối chiếu…" → Task 5 assertion theo từng status.
- Trên mobile, nội dung mới dài làm panel cấu trúc 3D hoặc thẻ bài tập tràn/khó đọc → mọi task UI có kiểm tra 375px.
- Kiểu đau lan bị hiển thị như bản đồ chẩn đoán → Task 10 chỉ là văn bản có nhãn "mô tả từ quan sát chuyên gia, biến thiên", không vẽ vùng.

---

## P0 — Sửa sai và hiển thị kiến thức đã có nguồn (ít nghiên cứu mới, tác động lớn)

### Task 1: Sửa trích dẫn sai và lỗi nhỏ

**Files:**
- Modify: `src/lib/clinical/anatomy-atlas.ts:597-711` (REGION_FOUNDATIONS cervical/thoracic/lumbar; ankle ligaments)
- Modify: `src/components/JointDiagramSvg.tsx:275` (scalenes)
- Modify: `src/lib/clinical/evidence-muscle.ts:176` (Lehman 2004)
- Modify: `src/lib/clinical/evidence-anatomy.ts` (thêm nguồn vào record vùng tương ứng)
- Test: `scripts/check-anatomy-regions-evidence.mjs`

Nguồn:
- OpenStax A&P 2e §9.5 *Types of Body Movements*; StatPearls *Anatomy, Back, Vertebral Column* (NBK525969).
- StatPearls *Anatomy, Bony Pelvis and Lower Limb: Ankle Joint* (NBK545158), cho dây chằng sên mác sau (PTFL).
- StatPearls *Anatomy, Head and Neck, Scalenus Muscle* (NBK519058).
- Lehman GJ et al. 2004 (đã có trong app; đọc lại abstract).

- [ ] **Step 1:** Đọc các nguồn trên; ghi cho từng mệnh đề đoạn nguồn hỗ trợ vào `docs/superpowers/reviews/2026-10-2x-atlas-p0-fixes.md`.
- [ ] **Step 2: Test thất bại** — trong `check-anatomy-regions-evidence.mjs` assert: các foundation về mỏm gai ngực, mặt khớp thắt lưng, khớp chẩm–đội không còn chỉ trỏ vào nguồn §7.3; ankle foundation chứa "sên mác sau"; record vùng có nguồn NBK525969 và NBK545158.
- [ ] **Step 3:** Gán lại `sourceRefs` sang nguồn mới (hoặc viết lại mệnh đề cho đúng điều §7.3 nói). Thêm PTFL. Thêm trích dẫn bám xương sườn 1–2 cho scalenes. Sửa câu Lehman: bỏ chữ "nhỏ", nêu đúng kết quả abstract (wide-grip pulldown và seated row có tỉ lệ lat:biceps cao nhất).
- [ ] **Step 4:** Chạy `node --experimental-strip-types scripts/check-anatomy-regions-evidence.mjs` và `node scripts/check-evidence-coverage.mjs` → PASS. Sửa câu "§7.3" trong `docs/medical-evidence-policy.md` (mục Foundations update).
- [ ] **Step 5:** Commit `fix(atlas): correct misattributed spine foundations and minor anatomy gaps`.

### Task 2: Sửa gắn vùng lâm sàng sai trong tab 3D

**Files:**
- Modify: `src/lib/clinical/atlas-3d.ts` (thêm `resolveClinicalRegion`)
- Modify: `src/components/atlas3d/Atlas3DExplorer.tsx:185`
- Modify: `scripts/export_z_anatomy.py:112-116` (cùng quy tắc cho lần export sau)
- Test: `scripts/check-atlas-evidence.mjs`

**Interfaces:**
- Produces: `resolveClinicalRegion(structure: Pick<AtlasStructure, "english" | "clinicalRegion" | "areas">): AnatomyRegionId | null`.

- [ ] **Step 1: Test thất bại.** Với manifest hiện tại, assert: supraspinatus, infraspinatus, subscapularis, teres minor, serratus anterior, pectoralis major/minor và latissimus dorsi → `"shoulder"`. Cơ thanh quản/hầu → `null`. Mọi mesh khác không đổi so với manifest.
- [ ] **Step 2:** Thêm danh sách override theo tên (regex vai/đai vai). Nhánh này phải được xét trước quy tắc chiều cao thân ở dòng 116. Áp dụng cùng thứ tự ấy trong exporter.
- [ ] **Step 3:** Explorer dùng `resolveClinicalRegion(selected)` thay cho `selected?.clinicalRegion`.
- [ ] **Step 4:** Chạy check → PASS. Kiểm tra UI: chọn supraspinatus thì thấy ghi chú vùng vai, không thấy ghi chú cơ hoành.
- [ ] **Step 5:** Commit.

### Task 3: Hiển thị kiến thức vùng đã có nguồn trong tab 3D

**Files:**
- Modify: `src/components/atlas3d/Atlas3DExplorer.tsx:740-790` (panel cấu trúc)
- Test: `scripts/check-atlas-source-presentation.mjs`

**Interfaces:**
- Consumes: `ANATOMY_REGIONS[].structures`, `REGION_FOUNDATIONS`, `ANATOMY_REGION_EVIDENCE` và `resolveClinicalRegion` (Task 2).

- [ ] **Step 1: Test thất bại.** Server-render panel cho một mesh thuộc vùng knee. Assert có heading "Kiến thức nền" kèm 3 foundation có link [n], có thẻ cấu trúc của vùng và có `ClinicalEvidencePanel` của vùng.
- [ ] **Step 2:** Render 3 khối đó dưới "Ghi chú PT". Nếu mesh trùng tên một `structures[].name` thì đưa thẻ cấu trúc đó lên đầu.
- [ ] **Step 3:** Chạy check, rồi kiểm tra UI desktop và 375px → commit.

### Task 4: Hiển thị hướng dẫn huấn luyện chung (ACSM) và bổ sung các kết quả bị bỏ sót

**Files:**
- Modify: `src/components/training/TrainingAtlasExplorer.tsx`
- Modify: `src/lib/clinical/evidence-muscle.ts:200-228` (TRAINING_GENERAL_GUIDANCE, record squat)
- Test: `scripts/check-muscle-evidence.mjs`

Nguồn:
- Currier BS et al. *ACSM Position Stand: Resistance Training Prescription for Muscle…*, Med Sci Sports Exerc 2026, PMID 41843416. Đọc bảng khuyến nghị của bản full text nếu truy cập được; nếu không, ghi phạm vi là abstract.
- Kubo K et al. 2019 (đã có trong app), cho kết quả full squat > half squat đối với cơ mông lớn và nhóm khép.

- [ ] **Step 1: Test thất bại.** Assert `TRAINING_GENERAL_GUIDANCE` được import ở `TrainingAtlasExplorer.tsx`. Assert guidance có mệnh đề về khối lượng/tuần cho phì đại và về tải cho sức mạnh, mỗi mệnh đề kèm [n] trỏ vào ACSM 2026.
- [ ] **Step 2:** Bổ sung mệnh đề; chỉ đưa con số mà nguồn đã đọc thực sự nêu.
- [ ] **Step 3:** Render khối "Nguyên tắc chung (ACSM 2026)" ở đầu tab, mặc định mở.
- [ ] **Step 4:** Check, lint, kiểm tra UI → commit.

### Task 5: Câu mở đầu của evidence panel theo đúng status

**Files:**
- Modify: `src/components/ClinicalEvidencePanel.tsx:27`
- Test: `scripts/check-atlas-source-presentation.mjs`

- [ ] **Step 1: Test thất bại.** Với `status: "source-only"`, panel không chứa "Phát biểu được đối chiếu" mà chứa câu nói rõ đây chỉ là dữ liệu tên gọi/nguồn mesh, chưa có kiến thức theo cấu trúc.
- [ ] **Step 2:** Dùng câu riêng cho từng status (literature-reviewed / limited / source-only).
- [ ] **Step 3:** Chạy check → commit.

### Task 6: Bổ sung red flag còn thiếu

**Files:**
- Modify: `src/lib/clinical/trigger-point-atlas.ts:273` (thẻ phân biệt / red flag của handbook)
- Modify: `src/lib/clinical/anatomy-atlas.ts` (redFlags vùng cervical)
- Modify: `src/lib/clinical/evidence-trigger.ts`, `evidence-anatomy.ts`
- Test: `scripts/check-trigger-evidence.mjs`, `scripts/check-anatomy-regions-evidence.mjs`

Nguồn:
- NICE NG59 (đã có).
- Blanpied PR et al. *Neck Pain: Revision 2017*, JOSPT, PMID 28666405 (đã có), cho dấu hiệu bệnh tủy cổ: rối loạn dáng đi, vụng tay.
- Finucane LM et al. *International Framework for Red Flags for Potential Serious Spinal Pathologies*, JOSPT 2020, PMID 32438853.

- [ ] **Step 1: Test thất bại.** Handbook có red flag về đau về đêm/khi nghỉ, sụt cân không rõ lý do, tiền sử ung thư, sốt/bệnh toàn thân hoặc suy giảm miễn dịch. Vùng cervical có dấu hiệu bệnh tủy cổ. Mỗi mục có nguồn.
- [ ] **Step 2:** Đọc nguồn, thêm mục. Thẻ red flag của handbook hiển thị mà không cần mở.
- [ ] **Step 3:** Chạy check → commit.

---

## P1 — Tab Huấn luyện PT: kiến thức lập chương trình và các mẫu vận động còn thiếu

### Task 7: Module "Nguyên tắc lập chương trình"

**Files:**
- Create: `src/lib/clinical/training-programming.ts`
- Create: `scripts/check-training-programming.mjs` (thêm script `check:training-programming` vào `package.json`)
- Modify: `src/components/training/TrainingAtlasExplorer.tsx` (thêm mục/tab con "Lập chương trình")
- Modify: `src/lib/clinical/evidence-registry.ts`, `scripts/check-evidence-coverage.mjs`

**Interfaces:**
- Produces: `PROGRAMMING_TOPICS: ProgrammingTopic[]`, với
  `ProgrammingTopic = { id: ProgrammingTopicId; title: string; points: { text: string; sourceRefs: number[] }[]; evidence: MuscleEvidenceRecord }`.
- `ProgrammingTopicId = "fitt" | "overload" | "load_by_goal" | "weekly_volume" | "rest" | "tempo" | "warm_up"`.

Nguồn:
- ACSM 2026, PMID 41843416.
- Schoenfeld BJ, Ogborn D, Krieger JW. *Dose-response relationship between weekly resistance training volume and increases in muscle mass*, J Sports Sci 2017, PMID 27433992.
- Schoenfeld BJ et al. *Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training*, J Strength Cond Res 2017, PMID 28834797.
- NSCA *Essentials of Strength Training and Conditioning*, 4th ed. (Haff & Triplett, 2016), các chương thiết kế chương trình. Cần bản đọc được.
- Tài liệu NCSF CPT đã có trong PdfReader của app; ghi số trang.

- [ ] **Step 1: Test thất bại.** Assert có đủ 7 topic id. Mỗi point có `sourceRefs` hợp lệ, trỏ đúng vào `evidence.sources`. Có `checkedAt`. `reviewedBy === null`. Không có point nào thiếu nguồn.
- [ ] **Step 2:** Đọc nguồn và viết các point. Mỗi khoảng số (rep, %1RM, nghỉ, số set/tuần) phải gắn đúng nguồn đã nêu nó. Khi các nguồn khác nhau, ghi rõ khác biệt thay vì chọn một con số.
- [ ] **Step 3:** Render trong TrainingAtlasExplorer và đăng ký vào registry.
- [ ] **Step 4:** Chạy `check:training-programming`, coverage, lint, build, kiểm tra UI → commit.

### Task 8: Thêm các mẫu vận động cốt lõi và tăng chiều sâu kỹ thuật

**Files:**
- Modify: `src/lib/clinical/muscle-hypertrophy-atlas.ts:77-95` (`HypertrophyExercise`, danh sách bài tập)
- Modify: `src/lib/clinical/evidence-muscle.ts` (`EXERCISE_EVIDENCE`)
- Modify: `src/components/training/TrainingAtlasExplorer.tsx:238-408`
- Test: `scripts/check-training-atlas.mjs`, `scripts/check-muscle-evidence.mjs`

**Interfaces:**
- `HypertrophyExercise` thêm các field: `movementPattern: "squat" | "hinge" | "lunge" | "push_horizontal" | "push_vertical" | "pull_horizontal" | "pull_vertical" | "carry" | "core_anti_extension" | "core_anti_rotation" | "core_anti_lateral_flexion" | "core_flexion" | "isolation"`, `commonMistakes: string[]`, `progressions: string[]`, `regressions: string[]`, `breathingCue?: string`. Giữ `commonMistake` cho đến khi UI chuyển hẳn sang mảng, rồi xoá.

Bài tập thêm theo thứ tự ưu tiên: overhead press, bench press, push-up, pull-up, deadlift (conventional), goblet squat, farmer carry, plank, dead bug, Pallof press, side plank, xoay ngoài vai với dây, prone Y/T. Tách các record đang gộp: RDL / leg curl, crunch / hanging curl.

Nguồn:
- NSCA *Exercise Technique Manual for Resistance Training* (ấn bản hiện hành) và tài liệu NCSF CPT trong app, cho setup, lỗi thường gặp, tăng/giảm cấp, thở.
- McGill SM. *Low back exercises: evidence for improving exercise regimens*, Phys Ther 1998, PMID 9672547, cho các bài core chống duỗi/xoay.
- Nguồn Cools về chóp xoay/xương vai (đã có trong app).
- OpenStax §11.5–11.6 / bảng TTUHSC cho cơ chính/phụ.

- [ ] **Step 1: Test thất bại.** Assert mỗi `movementPattern` thuộc squat/hinge/lunge/push_horizontal/push_vertical/pull_horizontal/pull_vertical/carry/core_anti_extension/core_anti_rotation có ít nhất 1 bài. Assert mỗi bài có ≥2 `commonMistakes`, ≥1 progression và ≥1 regression, cùng một `EXERCISE_EVIDENCE` record có nguồn.
- [ ] **Step 2:** Đọc nguồn, rồi thêm bài tập. Bài nào không có nghiên cứu trên đúng bài đó thì đặt `status: "limited"` và nói rõ điều này trong `limitations`.
- [ ] **Step 3:** UI: lọc theo mẫu vận động (thay cho Push/Pull), hiện danh sách lỗi thường gặp và thang tăng/giảm cấp.
- [ ] **Step 4:** Chạy check, lint, build, kiểm tra UI 375px → commit.

### Task 9: Sàng lọc trước tập và nhóm đặc biệt

**Files:**
- Modify: `src/lib/clinical/training-programming.ts` (thêm topic `"screening"` và `"special_populations"`)
- Test: `scripts/check-training-programming.mjs`

Nguồn:
- Riebe D et al. *Updating ACSM's Recommendations for Exercise Preparticipation Health Screening*, MSSE 2015, PMID 26473759.
- PAR-Q+ (bản chính thức tại eparmedx.com; ghi phiên bản).
- Fragala MS et al. *Resistance Training for Older Adults: NSCA Position Statement*, JSCR 2019, PMID 31343601.
- ACOG Committee Opinion 804, *Physical Activity and Exercise During Pregnancy and the Postpartum Period*, Obstet Gynecol 2020, PMID 32217980.
- Brooke-Wavell K et al. *Strong, steady and straight: UK consensus statement on physical activity and exercise for osteoporosis*, BJSM 2022, PMID 35577538.
- Hướng dẫn tăng huyết áp trong *ACSM's Guidelines for Exercise Testing and Prescription* (ấn bản hiện hành).

- [ ] **Step 1: Test thất bại.** Assert có 2 topic mới. Assert có mục "khi nào cần giấy phép y tế/chuyển khám", lấy từ Riebe 2015.
- [ ] **Step 2:** Đọc nguồn và viết các point. Nhóm đặc biệt chỉ nêu nguyên tắc chung, không kê chương trình cá nhân.
- [ ] **Step 3:** Chạy check → commit.

---

## P2 — Tab Trigger Point

### Task 10: Kiểu đau lan dạng văn bản (có điều kiện)

**Gate:** Chỉ làm task này khi đã có bản đọc được của *Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual*, 3rd ed. (Donnelly JM et al., Wolters Kluwer, 2019). Nếu không có, giữ trạng thái ẩn như hiện tại và chỉ dùng các nghiên cứu bên dưới cho cơ tương ứng.

**Files:**
- Modify: `src/lib/clinical/trigger-point-atlas.ts` (thêm `referralText` vào `TriggerMuscleComponent`)
- Modify: `src/components/TriggerPointExplorer.tsx`, `src/components/TriggerSourceAnatomy.tsx:12-15`
- Modify: `src/lib/clinical/evidence-trigger.ts`
- Test: `scripts/check-trigger-presentation.mjs`, `scripts/check-trigger-evidence.mjs`

**Interfaces:**
- `referralText?: { text: string; basis: "expert_observation" | "experimental_study"; sourceRefs: number[] }`.

Nguồn hỗ trợ:
- Fernández-de-las-Peñas C et al. *Referred pain from trapezius muscle trigger points shares similar characteristics with chronic tension type headache*, Eur J Pain 2007, PMID 16919982.
- Bron C et al. *High prevalence of shoulder girdle muscles with myofascial trigger points in patients with shoulder pain*, BMC Musculoskelet Disord 2011, PMID 21711512.
- Hidalgo-Lozano 2010 và Myburgh 2008 (đã có trong app).

- [ ] **Step 1: Test thất bại.**
  - Mọi `referralText` có nhãn hiển thị "mô tả từ quan sát chuyên gia, biến thiên giữa người" (hoặc "nghiên cứu thực nghiệm").
  - Vẫn không render `nodes` hay `referredPain` dạng hình.
  - Mỗi mục có nguồn.
- [ ] **Step 2:** Đọc chương của từng cơ và viết văn bản tóm tắt bằng lời của mình.
- [ ] **Step 3:** Cập nhật câu ghi chú ở `TriggerSourceAnatomy.tsx:13`: vùng đau lan có mô tả bằng chữ, còn toạ độ vẫn ẩn.
- [ ] **Step 4:** Chạy check, kiểm tra UI → commit.

### Task 11: Kiến thức cơ bản theo từng cơ và các cơ còn thiếu

**Files:**
- Modify: `src/lib/clinical/trigger-point-atlas.ts` (`TriggerPointMuscleId`, `TriggerMuscleComponent` thêm `attachments`, `action`, `innervation`)
- Modify: `src/lib/clinical/evidence-trigger.ts`, `scripts/check-evidence-coverage.mjs`
- Test: `scripts/check-trigger-evidence.mjs`

Ưu tiên thêm các cơ mà nghiên cứu đã trích dẫn có đề cập: ức đòn chũm, nhóm dưới chẩm, cơ trên gai, cơ dưới vai, cơ chậu sườn. Đợt sau: cơ bậc thang, cơ cắn/cơ thái dương, cơ mông lớn, nhóm cơ mác, hamstring, nhóm khép, cơ trám/thang giữa, nhóm duỗi cẳng tay.

Nguồn (StatPearls, NCBI Bookshelf):
- *Sternocleidomastoid Muscle*, NBK532881.
- *Suboccipital Muscles*, NBK567762.
- *Anatomy, Rotator Cuff*, NBK441844.
- *Infraspinatus Muscle*, NBK513255.
- *Scalenus Muscle*, NBK519058.

Nguồn khác: OpenStax §11.3–11.6 và bảng TTUHSC. Nghiên cứu tỉ lệ trigger point: Fernández-de-las-Peñas 2007, Hidalgo-Lozano 2010, Iglesias-González 2013 (đã có trong app).

- [ ] **Step 1: Test thất bại.** Assert mỗi component (10 nhóm cũ cùng các cơ mới) có `attachments`, `action`, `innervation`, mỗi field có `sourceRefs`. Assert inventory khớp số cơ mới.
- [ ] **Step 2:** Đọc nguồn và điền dữ liệu. Thêm plate OpenStax có sẵn license cho cơ mới (nếu không có plate phù hợp thì không thêm hình).
- [ ] **Step 3:** Chạy check, lint, build, kiểm tra UI → commit.

### Task 12: Thẻ handbook "Tranh luận, độ tin cậy và bằng chứng điều trị"

**Files:**
- Modify: `src/lib/clinical/trigger-point-atlas.ts` (handbook)
- Modify: `src/lib/clinical/evidence-trigger.ts` (TRIGGER_GENERAL_EVIDENCE)
- Test: `scripts/check-trigger-evidence.mjs`

Nguồn:
- Quintner JL, Bove GM, Cohen ML. *A critical evaluation of the trigger point phenomenon*, Rheumatology 2015, PMID 25477053, cùng thư phản hồi của Rathbone A et al. 2015, PMID 25832612.
- Lucas N et al. *Reliability of physical examination for diagnosis of myofascial trigger points: a systematic review*, Clin J Pain 2009, PMID 19158550.
- Kietrys DM et al. *Effectiveness of dry needling for upper-quarter myofascial pain*, JOSPT 2013, PMID 23756457.
- Cagnie B et al. *Evidence for the Use of Ischemic Compression and Dry Needling…*, Am J Phys Med Rehabil 2015, PMID 25768071.
- Lu W et al. *Effect of ischemic compression on myofascial pain syndrome*, Chiropr Man Therap 2022, PMID 36050701.
- Koc TA et al. *Heel Pain – Plantar Fasciitis: Revision 2023*, JOSPT, PMID 38037331. Nêu đúng các mức khuyến nghị đã đọc trong guideline (khuyến nghị dry needling và mô mềm cho nhóm cơ bắp chân).
- StatPearls *Myofascial Pain Syndrome*, NBK499882.

- [ ] **Step 1: Test thất bại.** Assert thẻ có 3 phần (tranh luận, độ tin cậy chẩn đoán, bằng chứng điều trị), mỗi phần có nguồn. Assert có câu nói rõ dry needling không thuộc phạm vi hành nghề của PT.
- [ ] **Step 2:** Đọc nguồn và viết nội dung. Trình bày cả lập luận phản biện lẫn phản hồi, không chọn phe.
- [ ] **Step 3:** Chạy check → commit.

---

## P3 — Tab Phục hồi khớp và chiều sâu giải phẫu 3D

### Task 13: Thêm vùng khuỷu và cổ tay/bàn tay

**Files:**
- Modify: `src/lib/clinical/anatomy-atlas.ts:3` (`AnatomyRegionId` thêm `"elbow" | "wrist_hand"`), `ANATOMY_REGIONS`, `REGION_FOUNDATIONS`, bộ từ khoá cảnh báo (khoảng dòng 723)
- Modify: `src/lib/clinical/evidence-anatomy.ts`, `src/components/BodyMapExplorer.tsx`, `src/components/JointDiagramSvg.tsx`
- Modify: `src/lib/clinical/atlas-3d.ts` (`resolveClinicalRegion`: các mesh cẳng tay/bàn tay → vùng mới)
- Modify: `scripts/check-evidence-coverage.mjs`
- Test: `scripts/check-anatomy-regions-evidence.mjs`

Nguồn:
- OpenStax §9.6 (khớp khuỷu), §8.2 và §11.5.
- StatPearls *Anatomy, Shoulder and Upper Limb, Elbow Joint* (NBK532948).
- StatPearls *Anatomy, Shoulder and Upper Limb, Wrist Joint* (NBK534779).
- Lucado AM et al. *Lateral Elbow Pain and Muscle Function Impairments*, JOSPT 2022, PMID 36453071.
- Erickson M et al. *Hand Pain and Sensory Deficits: Carpal Tunnel Syndrome*, JOSPT 2019, PMID 31039690.

- [ ] **Step 1: Test thất bại.** Assert 10 vùng. Assert mỗi vùng có 3 foundation có nguồn, ≥3 thẻ cấu trúc, red flag, record evidence và từ khoá cảnh báo.
- [ ] **Step 2:** Đọc nguồn và viết dữ liệu theo đúng khuôn của các vùng hiện có.
- [ ] **Step 3:** Thêm vùng trên body map, hình khớp nếu có plate license phù hợp, và quy tắc 3D.
- [ ] **Step 4:** Chạy check, lint, build. Kiểm tra UI cả 4 tab (3D, body map) → commit.

### Task 14: Bệnh lý có cấu trúc thay cho danh sách 2 câu

**Files:**
- Modify: `src/lib/clinical/anatomy-atlas.ts` (thay `commonPathologies: string[]` bằng `conditions: RegionCondition[]`), `src/components/BodyMapExplorer.tsx`
- Modify: `src/lib/clinical/evidence-anatomy.ts`
- Test: `scripts/check-anatomy-regions-evidence.mjs`

**Interfaces:**
- `RegionCondition = { name: string; definition: string; typicalPresentation: string; trainingConsiderations: string; referWhen: string; sourceRefs: number[] }`

Bệnh lý và nguồn (JOSPT CPG trừ khi ghi khác):

| Vùng | Bệnh lý | Nguồn |
|---|---|---|
| Vai | Bệnh lý gân chóp xoay | Desmeules F et al. 2025, PMID 40165544 |
| Vai | Hội chứng đau dưới mỏm cùng vai | Lambers Heerspink FO et al., Acta Orthop 2026, PMID 41718640 |
| Vai | Viêm dính bao khớp | Kelley MJ et al. 2013, PMID 23636125 |
| Thắt lưng | Đau lưng không đặc hiệu (cấp/mạn) | George SZ et al. 2021, PMID 34719942 |
| Thắt lưng | Đau lưng không đặc hiệu (cấp/mạn) | Hayden JA et al., Cochrane 2021, PMID 34580864 |
| Thắt lưng | Đau lưng không đặc hiệu (cấp/mạn) | StatPearls *Low Back Pain*, NBK538173 |
| Háng | Thoái hoá khớp háng | Cibulka MT et al. 2017, PMID 28566053 |
| Gối | Tổn thương dây chằng (gồm ACL trước phẫu thuật) | Logerstedt DS et al. 2017, PMID 29089004 |
| Gối | Tổn thương sụn chêm/sụn khớp | Logerstedt DS et al. 2018, PMID 29385940 |
| Gối | Đau bánh chè–đùi | Willy RW et al. 2019, PMID 31475628 |
| Gối | Thoái hoá khớp gối | NICE NG226 (2022) |
| Gối | Thoái hoá khớp gối | Fransen M et al., Cochrane 2015, PMID 25569281 |
| Cổ chân | Bong gân dây chằng bên ngoài | Martin RL et al. 2021, PMID 33789434 |
| Cổ chân | Đau gót / viêm cân gan chân | Koc TA et al. 2023, PMID 38037331 |
| Cổ | Đau cổ | Blanpied PR et al. 2017, PMID 28666405 (đã có) |

- [ ] **Step 1: Test thất bại.**
  - Mỗi bệnh lý trong bảng có đủ 5 field và `sourceRefs` hợp lệ.
  - `referWhen` không rỗng.
  - Không còn field `commonPathologies`.
  - Ghi chú "không phải chẩn đoán" vẫn hiển thị.
- [ ] **Step 2:** Đọc từng CPG (ít nhất phần tóm tắt khuyến nghị và phần chẩn đoán/phân loại) và viết `RegionCondition`. Ghi mức khuyến nghị (A/B/C) đúng như guideline đã đọc.
- [ ] **Step 3:** UI: mỗi bệnh lý là một thẻ gập/mở. Phần `referWhen` luôn hiện.
- [ ] **Step 4:** Chạy check, lint, build, kiểm tra UI → commit.

### Task 15: Hiển thị tầm vận động (ROM) bình thường trong tab

**Files:**
- Modify: `src/components/BodyMapExplorer.tsx`
- Modify: `src/lib/clinical/rom-norms.ts` (thêm `regionId` cho từng `RomMovement` nếu chưa có)
- Test: `src/lib/clinical/rom-norms.check.ts` (`npm run check:rom`)

**Interfaces:**
- `romMovementsForRegion(regionId: AnatomyRegionId): RomMovement[]`

Nguồn:
- Soucie JM et al. *Range of motion measurements: reference values and a database for comparison studies*, Haemophilia 2011, PMID 21070485. Đây là bài gốc của dữ liệu CDC; đọc để xác nhận phương pháp đo thụ động thay vì dựa vào abstract.
- Dữ liệu JTSS 2023 (đã có).

- [ ] **Step 1: Test thất bại.** Assert mỗi `RomMovement` thuộc đúng một vùng. Assert `romMovementsForRegion("knee")` trả về gập/duỗi gối. Assert nhãn chủ động/thụ động được giữ nguyên.
- [ ] **Step 2:** Viết hàm, render bảng ROM của vùng kèm nhãn chủ động/thụ động và quần thể tham chiếu.
- [ ] **Step 3:** Chạy check, kiểm tra UI → commit.

### Task 16: Phân loại khớp, mặt phẳng–trục và dây chằng theo khớp

**Files:**
- Modify: `src/lib/clinical/anatomy-atlas.ts` (thêm `JOINT_BASICS` dùng chung và `ligaments` theo vùng)
- Modify: `src/components/BodyMapExplorer.tsx`, `src/lib/clinical/evidence-anatomy.ts`
- Test: `scripts/check-anatomy-regions-evidence.mjs`

Nguồn:
- OpenStax §9.1–9.5 (phân loại khớp theo cấu trúc/chức năng, các loại khớp hoạt dịch, các loại cử động).
- StatPearls *Knee* (NBK500017), *Hip Joint* (NBK470555), *Acromioclavicular Joint* (NBK499858), *Ankle Joint* (NBK545158), *Vertebral Column* (NBK525969).

- [ ] **Step 1: Test thất bại.** Assert `JOINT_BASICS` có phân loại khớp, mặt phẳng và trục, mỗi mục có nguồn. Assert mỗi vùng có ≥2 dây chằng có nguồn.
- [ ] **Step 2:** Đọc nguồn và viết dữ liệu.
- [ ] **Step 3:** Render một mục "Cơ bản về khớp" dùng chung ở đầu tab.
- [ ] **Step 4:** Chạy check → commit.

### Task 17: Chiều sâu thẻ cơ trong tab 3D

**Files:**
- Modify: `src/lib/clinical/muscle-hypertrophy-atlas.ts:21-30` (`MuscleSubdivision` thêm `innervation: string`, `jointActions: { joint: string; action: string; plane: "sagittal" | "frontal" | "transverse" }[]`)
- Modify: `src/components/training/MuscleStudyCard.tsx`, `src/lib/clinical/evidence-muscle.ts`
- Create (nếu cần cho các cơ không thuộc 11 nhóm): `src/lib/clinical/muscle-reference.ts` với `MUSCLE_REFERENCE: MuscleReferenceEntry[]`, map tới mesh theo tên tiếng Anh trong manifest
- Modify: `src/components/atlas3d/Atlas3DExplorer.tsx`, `scripts/check-evidence-coverage.mjs`
- Test: `scripts/check-muscle-evidence.mjs`

**Interfaces:**
- `MuscleReferenceEntry = { id: string; meshNames: string[]; name: string; latin: string; origin: string; insertion: string; innervation: string; jointActions: MuscleSubdivision["jointActions"]; evidence: MuscleEvidenceRecord }`

Thứ tự ưu tiên cơ:
1. Chóp xoay (4 cơ), cơ ngực bé.
2. Ức đòn chũm, các cơ bậc thang.
3. Cơ thắt lưng chậu, 6 cơ xoay ngoài sâu, cơ căng mạc đùi, cơ may.
4. Cơ khoeo, cơ chày sau, nhóm cơ mác.
5. Các nhóm cơ gấp/duỗi cẳng tay.

Nguồn:
- OpenStax §11.3–11.6, các bảng TTUHSC/LUMEN (đã có trong app).
- StatPearls, cho từng cơ: các NBK đã liệt kê ở Task 11 và 13; các chương còn lại tra trên NCBI Bookshelf khi đọc và ghi đúng NBK.

- [ ] **Step 1: Test thất bại.**
  - 27 subdivision đều có `innervation` và ≥1 `jointActions`, kèm nguồn.
  - Mỗi `MuscleReferenceEntry` có ≥1 `meshNames` khớp với manifest.
  - Số mesh có thẻ tăng từ 112 lên ≥ mục tiêu đặt khi bắt đầu task.
- [ ] **Step 2:** Đọc nguồn và điền dữ liệu theo từng đợt (mỗi nhóm trong thứ tự trên là một commit).
- [ ] **Step 3:** Panel 3D hiển thị thẻ cơ tham chiếu khi mesh khớp tên.
- [ ] **Step 4:** Chạy check, lint, build, kiểm tra UI → commit.

### Task 18 (ưu tiên thấp): Mốc xương

**Files:** `src/lib/clinical/bone-landmarks.ts` (mới), `Atlas3DExplorer.tsx`, coverage check.

Nguồn: OpenStax A&P 2e chương 7–8 (bộ xương trục và xương chi).

- [ ] Làm tương tự Task 17 cho khoảng 20 xương chính (xương cánh tay, xương vai, xương đòn, xương chậu, xương đùi, xương chày, xương mác, xương gót, đốt sống điển hình): mốc xương và cơ bám vào mốc đó, mỗi mục có nguồn.

---

## Ước lượng và thứ tự PR

| PR | Tasks | Tính chất |
|---|---|---|
| 1 | P0: 1–6 | Sửa sai và hiển thị lại dữ liệu đã có; ít nghiên cứu mới |
| 2 | P1: 7–9 | Lấp khoảng trống lớn nhất cho học viên CPT |
| 3 | P2: 10–12 | Task 10 phụ thuộc vào việc có sách Travell & Simons |
| 4 | P3: 13–16 | Phục hồi khớp |
| 5 | P3: 17–18 | Giải phẫu 3D; làm theo đợt |

Mỗi PR kết thúc bằng một review note trong `docs/superpowers/reviews/` (nguồn đã đọc, phạm vi truy cập, mệnh đề ↔ đoạn nguồn, giới hạn còn lại) và một dòng cập nhật trong `docs/medical-evidence-policy.md`.
