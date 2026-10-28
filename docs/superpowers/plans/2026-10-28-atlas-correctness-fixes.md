# Atlas Correctness Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans task-by-task. Check each step only after verification.

**Goal:** Sửa toàn bộ lỗi đã xác nhận F1–F7 mà không thay hình học nguồn hoặc phá trải nghiệm toàn body.

**Architecture:** Bảo toàn thuộc tính material của GLB; giữ manifest gốc và thêm một catalog hiệu chỉnh thuần dữ liệu, có nguồn và guard chống lệch upstream. Các bộ xem dùng cùng catalog đã resolve, còn audit nguồn tiếp tục đọc dữ liệu nguyên bản.

**Tech Stack:** TypeScript, JSON/MJS, Three.js, existing Node checks và browser QA.

---

Đọc [review gốc](../reviews/2026-10-27-atlas-3d-medical-detail-audit.md), [roadmap](./2026-10-28-atlas-medical-remediation.md), `AGENTS.md`, medical policy và Next.js docs cục bộ. Làm theo task 1→2→3→4→5; task 1 có thể phát hành trước nếu cần.

## Task 1 — Giữ thuộc tính hai mặt khi thay material

**Files:**
- Modify: `src/components/atlas3d/tissue-materials.ts`.
- Modify: `src/components/atlas3d/atlas-stage.ts`.
- Modify: `src/components/training/curl/curl-stage.ts`.
- Test: `scripts/check-atlas-render-policy.mjs`.

- [x] Thêm regression dùng hàm thật vào check render. Trước sửa phải fail vì đối số side bị bỏ qua:

```js
import { DoubleSide, BackSide, FrontSide } from 'three';
for (const side of [DoubleSide, BackSide, FrontSide]) {
  const material = createTissueMaterial('ligament', false, undefined, side);
  assert.equal(material.side, side);
  setTissueSelection(material, 'ligament', true);
  setTissueOpacity(material, 0.4);
  setTissueOpacity(material, 1);
  assert.equal(material.side, side);
  material.dispose();
}
```

- [x] Chạy `npm run check:atlas-render`, xác nhận fail ở DoubleSide.
- [x] Thêm đối số thứ tư `sourceSide: THREE.Side = THREE.FrontSide` cho `createTissueMaterial()` và truyền `side: sourceSide` vào `MeshPhysicalMaterial`.
- [x] Ở AtlasStage, lấy `sourceMaterial.side` trước khi thay, truyền vào factory; không chỉ đặt DoubleSide riêng cho ID ATFL. Ở curl, constructor material riêng phải có `side: old.side`.
- [x] Chạy lại render, study, detail checks. Giữ nguyên dispose, màu chọn, opacity, heatmap và texture lifecycle.
- [x] Browser: ATFL phải `za-975efd6a59c5` và CFL ở hai phía camera; chế độ thường, search, isolate; closed muscle và curl cũng phải xem được. Không hủy camera transition trước lúc chụp. So với hai ảnh đối diện trong audit.
- [x] Commit: `fix(atlas): preserve source material sidedness`.

## Task 2 — Catalog hiệu chỉnh có nguồn, giữ dữ liệu gốc

**Create:**
- `src/lib/clinical/atlas-corrections.json`: dữ liệu hiệu chỉnh, nguồn, ngày, phạm vi và expected raw values.
- `src/lib/clinical/atlas-catalog-corrections.mjs`: hàm thuần `applyAtlasCorrections(rawManifest, corrections)`; dùng JSDoc để giữ type inference.
- `src/lib/clinical/atlas-catalog.ts`: wrapper `resolveAtlasManifest(raw: AtlasManifest): AtlasManifest`, import JSON và gọi hàm thuần.
- `scripts/check-atlas-medical-corrections.mjs`: native Node tests cho dữ liệu thực và fixtures lỗi.

**Modify:**
- `src/lib/clinical/atlas-3d.ts`: optional provenance/tissue fields và search aliases.
- `src/components/atlas3d/Atlas3DExplorer.tsx`.
- `src/components/atlas3d/ContextualAnatomyViewer.tsx`.
- `src/components/training/TrainingAnatomyViewer.tsx`.
- `src/lib/clinical/evidence-registry.ts`: diễn đạt rõ audit so chuỗi nguyên bản; không nâng source-only geometry.
- `package.json`: thêm `check:atlas-corrections`.

### Data contract

Một correction có `id`, `structureIds`, `expected`, `changes`, `sources`, `checkedAt`, `access`, `basis`, `reviewedBy: null`. `changes` chỉ được chỉnh Latin, side, clinicalRegion hoặc bổ sung nhãn mô đã đối chiếu; không chỉnh ID, geometry, layer membership, area membership, thickness hoặc bundle hashes.

`basis` phân biệt `terminology-source`, `medical-source` và `paired-source-placement`. Nguồn placement là đối tác và world bounds đã lưu trong audit, không gọi đó là đối chiếu mẫu giải phẫu độc lập.

Mỗi structure đã sửa giữ `sourceMetadata` gồm giá trị nguyên bản và `correctionIds`. Hàm không mutate input; lỗi ID không tồn tại, expected raw value không khớp, nguồn thiếu, hoặc hai correction xung đột cùng trường phải throw trước khi trả catalog. Không ghi đè âm thầm khi upstream thay đổi.

Thêm các field sau vào `AtlasStructure`; `anatomicalTissueLabel` là nhãn nội dung đã đối chiếu, không tự thay surface/material hay thông số vật lý:

```ts
sourceMetadata?: {
  english: string;
  latin: string;
  side: "left" | "right" | null;
  clinicalRegion: string | null;
};
correctionIds?: string[];
anatomicalTissueLabel?: string;
```

`expected` chỉ so các trường nguồn đã lưu, gồm ít nhất English và trường sắp hiệu chỉnh. `changes` chỉ nhận `latin`, `side`, `clinicalRegion`, `anatomicalTissueLabel`; từ chối trường không nằm trong allowlist. Các mô label không có trường tương ứng ở nguồn phải xác nhận đúng ID/English và material nguồn của ví dụ, không tự tạo expected anatomy của người thật.

### Tập sửa bắt buộc

| Trường | IDs | Giá trị đúng/đích |
|---|---|---|
| Latin | `za-0594168bc7e0`, `za-a71914347fd5` | `Flexor digiti minimi pedis` |
| Latin | `za-f0a2b9e97a61`, `za-57697192a9ea` | `Caput mediale musculi tricipitis brachii` |
| Latin | `za-9df38dd0067f`, `za-0ca27c38f6ab` | `Os primum metacarpi` — sửa lỗi chữ, giữ cách sắp tên nguồn |
| Latin | `za-a1dbeb10397d`, `za-ed21d2eab363` | `Os quartum metatarsi` |
| Side | `za-ad4d8464ab41` | `left` |
| Side | `za-5e590f3614ed` | `left` |
| Side | `za-ef71d29b63c0` | `right` |
| clinicalRegion | `za-0425424460a5`, `za-01cb75938da6` | `shoulder` |
| clinicalRegion | `za-87ff24e3a85d`, `za-3eade513dbf4` | `shoulder` |
| clinicalRegion | `za-84c7d3654da9`, `za-bb19dc35992b` | `shoulder` |
| Nhãn mô đại thể | `za-09d8674ed113`, `za-d64d3d420b6c` | Gân trung gian cơ hai bụng; source material ligament được giữ riêng |
| Nhãn mô đại thể | `za-76671b911ccb`, `za-d7748ccf7a30` | Đĩa sụn sợi; không tự coi toàn TFCC là cùng một mô |
| Nhãn mô đại thể | `za-119decb9d97f`, `za-c50e8a3180cf` | Dải chậu–chày, phần của fascia lata |
| Nhãn mô đại thể | `za-9cf0878d5d75` | Sụn giáp |

Nguồn và expected raw values lấy đúng từ audit: FIPAT TA2 PDF69/76; Comenius bàn tay/bàn chân; OpenStax §9.6/§22.1; FIPAT TAH15240; nghiên cứu TFCC và ITB. Kiểm tra lại ID có thật trước khi ghi JSON. Không xem việc thiếu chữ brevis là lỗi riêng; không đổi PCL decussatum posterius thành lỗi.

- [x] Viết tests từ bảng trên, kiểm tra raw values còn nguyên trong `sourceMetadata`; raw manifest không bị mutate.
- [x] Thêm fixtures reject ID lạ, expected value lệch, correction conflict, thiếu nguồn. Kiểm tra ID/count/area/bundle/thickness không thay đổi.
- [x] Chạy `node --test scripts/check-atlas-medical-corrections.mjs`, xác nhận fail trước implementation.
- [x] Implement hàm thuần và wrapper, sau đó áp dụng wrapper sau `response.json()` trong cả ba bộ xem. Không thay abort/retry/deadline logic.
- [x] Audit mọi consumer bằng `rg 'manifest.json' src`. `evidence-registry.ts` cố ý dùng raw để kiểm tra nguồn; `landing-data.ts` chỉ dùng ID/count đã có nên không cần đổi vì task này. Consumer mới cần lựa chọn raw/resolved rõ ràng.
- [x] Search thêm `sourceMetadata.latin` vào alias, ưu tiên tên chuẩn khi hiển thị. Thêm tests cho cả tên chuẩn và chuỗi nguồn cũ.
- [x] Dùng `contextStructures()`/`contextForStructure()` thật để kiểm tra tập vai có đủ tám mesh bốn cơ chóp xoay, không tự điều hướng chúng sang thoracic_core.
- [x] Kiểm tra ba truy vấn có bên bị thiếu trước đây: `Iliocostalis colli left`, `Intra-articular ligament of head of rib left`, `Ulnopisiform ligament right` trả đúng ID tương ứng.
- [x] Không chạy script audit đang ghi file để “validate” mà không chủ đích. Chưa đổi con số 884/147 thành tình trạng xác nhận y khoa; raw provenance vẫn dùng raw CSV.
- [x] Hồ sơ có hiệu chỉnh tên được đối chiếu không tiếp tục hiện câu blanket “chưa đối chiếu FIPAT gốc” như thể chưa có đối chiếu nào. Ghi đúng phần raw audit và phần canonical correction, giữ trạng thái hình học source-only.
- [x] Commit: `fix(atlas): apply traceable catalog corrections`.

## Task 3 — Hiển thị đúng nghĩa của nhóm nguồn và chế độ tô xuyên

**Create:** `src/components/atlas3d/AtlasCatalogCorrectionDetails.tsx`, nhận `structure: AtlasStructure` và hiển thị giá trị nguồn/giá trị mới/nguồn theo `correctionIds`.

**Modify:** `src/lib/clinical/atlas-3d.ts`, `src/components/atlas3d/Atlas3DExplorer.tsx`, `src/lib/clinical/atlas-terminology-evidence.ts` ở các ghi chú Latin nguồn có liên quan, `src/components/atlas3d/region-learning.ts`, `public/anatomy/3d/ATTRIBUTION.md`, `docs/medical-evidence-policy.md`.

- [x] Giữ enum nội bộ `bone/muscle/joint`; đổi nhãn bộ lọc thành nhóm hệ của nguồn, ví dụ “Hệ xương”, “Hệ cơ–gân”, “Khớp & dây chằng”. Dòng cấu trúc gọi là “Nhóm hiển thị”, không gọi nó là loại mô.
- [x] Với nhãn mô đã đối chiếu ở task 2, hiện loại mô và nguồn riêng. Không suy rằng toàn bộ 63 cấu trúc đã được kiểm chứng mô học chỉ vì material của chúng có cùng tên.
- [x] Thay fallback null bằng “Không phân bên trong dữ liệu nguồn”; chỉ gọi “đường giữa” khi có hồ sơ xác nhận riêng. Ba ID task 2 hiện đúng bên.
- [x] Hiện tên Latin chuẩn; mục nguồn gốc giữ tên nguồn và giải thích hiệu chỉnh, liên kết citation của correction. Không gộp tên chuẩn và tên nguồn lỗi thành hai cấu trúc khác nhau.
- [x] Đặt CorrectionDetails sau mục thuật ngữ, tách nhãn “Hiệu chỉnh catalog có nguồn” khỏi đối chiếu bản dịch Việt. Ghi chú lỗi Latin trong hồ sơ thuật ngữ phải nói rõ đó là chuỗi nguồn nguyên bản, không mô tả Latin đã chuẩn hóa là vẫn lỗi. Giữ trạng thái partial/unresolved nếu bằng chứng thuật ngữ chưa thay đổi.
- [x] Khi `searchTargetIds.size > 0`, thêm legend nhỏ luôn thấy trên canvas: “Tô xuyên lớp để định vị”; không che body hoặc chặn thao tác xoay. Giữ nguyên whole-body search và màu các cấu trúc khác.
- [x] Khi xem vật liệu/độ dày, giữ thông tin đây là mô phỏng/ước lượng lưới; không đổi đơn vị hiển thị thành kết luận đo mô thật.
- [ ] Browser QA 390px và desktop ít nhất 1280px qua giao diện công cụ được hỗ trợ: search một ô, overlay legend, tên dài, panel nguồn, focus, không overflow; nếu công cụ không có viewport cần thiết, ghi rõ phần chưa kiểm thay vì tuyên bố đã kiểm.
- [x] Commit: `fix(atlas): distinguish source groups and anatomical facts`.

## Task 4 — Sửa citation kiến thức nền

**Modify:** `src/lib/clinical/evidence-anatomy.ts`, `src/lib/clinical/anatomy-atlas.ts`, `docs/medical-evidence-policy.md`.

- [x] Đọc lại OpenStax §9.6 đoạn Articulations of the Vertebral Column, lưu ngày/phạm vi thực tế.
- [x] Thêm nguồn §9.6 vào các record cổ, thoracic_core và lumbar nếu record đó chưa có; không chèn đầu array làm lệch số nguồn cũ.
- [x] Mệnh đề cổ về biên độ theo diện khớp, ngực về giới hạn theo mỏm gai/lồng ngực, lumbar về hạn chế xoay phải trỏ đúng nguồn §9.6. Những mệnh đề cấu trúc còn được §7.3 hỗ trợ giữ nguồn đó.
- [x] Chạy `node scripts/check-anatomy-regions-evidence.mjs` và `node scripts/check-evidence-coverage.mjs`. Đọc link thực ở UI để bảo đảm số nguồn không lệch.
- [x] Commit: `docs(atlas): cite vertebral movement claims precisely`.

## Task 5 — Review và phát hành đợt 1

- [x] Chạy `check:atlas-corrections`, `check:atlas-search`, `check:atlas-render`, `check:atlas-learning`, `check:atlas-evidence`, `check:atlas-study`, `check:atlas-detail`, `check:atlas-context`, `check:atlas-names`; `node scripts/check-atlas-surfaces.mjs`; `node scripts/check-evidence-coverage.mjs`; build và lint.
- [x] Browser xác minh: ATFL/CFL hai phía; sụn giáp không bị dạy là xương; Latin tám mesh; ba bên; vùng vai đủ chóp xoay; search Internal Oblique vẫn nguyên body; thẻ sửa tên có thể truy nguồn.
- [x] Review diff và nguồn. So với các ảnh audit; không chỉ xem số test.
- [x] Khi thực hiện phát hành: push các commit đã kiểm lên master, deploy Vercel và xác minh URL chính bằng search, nhóm mô, hai phía dây chằng. Lưu deployment/commit và ảnh; rollback nếu có lỗi mới.

**Done:** F1–F7 không còn tái hiện trong phạm vi đã xác nhận; geometry source-only vẫn giữ đúng trạng thái. Chưa gọi việc này là nâng chi tiết hình học hoặc hoàn tất kiến thức mọi cấu trúc.

## Trạng thái thực thi 2026-10-28

Các bước được đánh dấu đã có kiểm tra mã/dữ liệu và review độc lập. Browser đã kiểm tại viewport thực 687×877; công cụ không cung cấp đặt viewport 390/1280 nên hai kích thước đó vẫn chưa được xác minh. Kết quả, ảnh và giới hạn được ghi trong `docs/research/2026-10-28-atlas-remediation-qa.md`. Phát hành được ghi riêng sau khi push/deploy/xác minh URL chính.

Phát hành batch đầu đã được xác minh trên https://kinesis-lab.vercel.app/atlas sau push `e668bd3`; bằng chứng ảnh/hash/giới hạn trong QA log. Các batch tương lai và việc thay mesh chưa đủ nguồn không được tính là đã hoàn tất.
