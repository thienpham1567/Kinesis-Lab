# Atlas Vietnamese terminology comparison — 2026-10-28

Research date / actual access date: **2026-10-28**. Independent professional reviewer: **`reviewedBy: null`**; review date: **`reviewedAt: null`**. Source comparison is the acceptance criterion authorized for Atlas educational terminology. This report records research recommendations, not implemented product status or clinical validation.

Scope: the eight unresolved and 35 partial records in `src/lib/clinical/atlas-terminology-evidence.ts`, read alongside `public/anatomy/3d/TERMINOLOGY.md`, `AGENTS.md`, and `docs/medical-evidence-policy.md`. No anatomical properties, attachment sites, fiber directions, mesh locations, measurements, treatment advice, or clinician approval were inferred from terminology matching.

## Sources and actual access

### BYT-2427-2025 — bilingual terminology table

- Issuer: **Bộ Y tế**.
- Document: **Phụ lục 1: Danh mục mã dùng chung thuật ngữ lâm sàng – Đợt 1**, accompanying **Quyết định 2427/QĐ-BYT, 25 July 2025**.
- Actual PDF read: [signed appendix on the Điện Biên government document service](https://hscv.dienbien.gov.vn/qlvb/vbpq.nsf/3d0f058120469ad34725726600365420/958EDD2F2512480F47258CD500065A0B/%24file/03%20Phu%20luc%2001%20%28Danh%20muc%20Cau%20truc%20co%20the%29.signed.pdf).
- Bibliographic cross-check: [Khánh Hòa CDC document entry](https://www.ksbtkhanhhoa.vn/VanBan/ChiTiet/8847), opened and read, identifies 2427/QĐ-BYT, 25/07/2025, issuing agency Bộ Y tế. The PDF first page was visually read and shows the same decision/date with a Bộ Y tế stamp.
- Downloaded PDF: 16,742,555 bytes, **1,441 PDF pages**. Text was extracted and searched throughout. Relevant complete pages **1, 258, 282, 325, 489, 566, 629, 978, 1071, 1266, 1289** were rendered and visually read. Extraction was a search aid; this is not a claim that all 1,441 pages were read visually or medically audited.
- The source is an official government-hosted bilingual clinical coding table, not an anatomy textbook or a FIPAT Vietnamese translation. Its SNOMED body-structure names support the specific terminology comparisons below, not the truth of every row or clinical validation of the app.
- Selected surrounding rows contain inconsistent translations (for example some interspinalis/intertransversarius rows and some regional names). Do not import the table wholesale, automatically change unrelated labels, or treat official hosting as proof that every translation is correct.
- A second [Đắk Nông mirror](https://syt.daknong.gov.vn/upload/2005704/20250909/03_Phu_luc_01__Danh_muc_Cau_truc_co_the__signed_6ef8a.pdf) was found in search, but web retrieval timed out and curl rejected an expired certificate. **No actual reading of that mirror is claimed**; use the Điện Biên URL for the citations below.

### VT-SCT-244872002 — Rotatores identity bridge

- Publisher: **Veterinary Terminology & Standards, Virginia-Maryland College of Veterinary Medicine, Virginia Tech**.
- [Opened concept page](https://vtsl.vetmed.vt.edu/Terminologymgt/RF2Viewer/display.cfm?SCT_ConceptID=244872002&hdr=Specimen+Source+Site&refset=332811000009101).
- Actual access 2026-10-28: read the HTML concept header, SNOMED code, description and synonyms. The page identifies **244872002**, fully specified name **Entire rotator muscle (body structure)**, and synonym **Entire Rotatores**. The displayed parent links include structure of rotator muscle and structure of transversospinalis muscle.
- This is a narrow terminology bridge for the same SNOMED identifier used by BYT row 6112778. It is not evidence about veterinary-to-human gross anatomy or an endorsement of the app. Record its HTML concept identifier as the locator; **do not invent a PDF page** for this source.

## Twenty supported upgrades

Recommendation: add the new source references and specific notes, then change these records to `matched` under the existing definition “full named entity found in context; not official certification.” Seven originate from `unresolved`; thirteen originate from `partial`. Do not delete earlier valid references or relabel old source checks as newly read.

All page numbers are **one-based PDF pages**, with row IDs from the first column. The following source terms reproduce short table names, preserving the meaningful source variants. The repeated body-structure semantic tag is omitted from the two term columns; the source prints `(cấu trúc cơ thể)` and `(body structure)` respectively.

| Exact existing record key | Prior status | PDF page | BYT row | SNOMED CT | Vietnamese term actually read | English term actually read |
| --- | --- | ---: | --- | --- | --- | --- |
| Levatores breves costarum | unresolved | 325 | 6108535 | 368051000 | Toàn bộ cơ nâng sườn ngắn | Entire levator costae brevis muscle |
| Levatores longi costarum | unresolved | 325 | 6108536 | 368050004 | Toàn bộ cơ nâng sườn dài | Entire levator costae longus muscle |
| Rotatores | unresolved | 489 | 6112778 | 244872002 | Toàn bộ cơ xoay | Entire rotator muscle |
| Spinalis capitis muscle | unresolved | 1289 | 6132695 | 50200003 | Cấu trúc cơ gai đầu | Structure of spinalis capitis muscle |
| Spinalis colli muscle | unresolved | 1289 | 6132696 | 90411004 | Cơ gai cổ | Structure of spinalis cervicis muscle |
| Superficial transverse metacarpal ligament | unresolved | 566 | 6114727 | 15324007 | Toàn bộ dây chằng ngang gan tay nông | Entire superficial transverse metacarpal ligament |
| Superficial transverse metatarsal ligament | unresolved | 566 | 6114728 | 42009009 | Toàn bộ dây chằng ngang nông bàn chân | Entire superficial transverse metatarsal ligament |
| Humeral head of extensor carpi ulnaris | partial | 258 | 6106797 | 368527004 | Toàn bộ đầu cánh tay của cơ duỗi cổ tay trụ | Entire humeral head of extensor carpi ulnaris muscle |
| Ulnar head of extensor carpi ulnaris | partial | 629 | 6116352 | 368528009 | Toàn bộ đầu trụ của cơ duỗi cổ tay trụ | Entire ulnar head of extensor carpi ulnaris muscle |
| Iliocostalis lumborum muscle | partial | 978 | 6125231 | 49178001 | Cấu trúc cơ chậu - sườn thắt lưng | Structure of iliocostalis lumborum muscle |
| Iliocostalis thoracis muscle | partial | 978 | 6125233 | 10921009 | Cấu trúc cơ chậu-sườn ngực | Structure of iliocostalis thoracis muscle |
| Interspinales colli muscles | partial | 282 | 6107407 | 246011001 | Cơ gian gai cổ | Entire interspinalis cervicis muscle |
| Interspinales lumborum muscles | partial | 282 | 6107408 | 246021009 | Toàn bộ cơ gian gai thắt lưng | Entire interspinalis lumborum muscle |
| Interspinales thoracis muscles | partial | 282 | 6107410 | 134197004 | Toàn bộ cơ gian gai ngực | Entire interspinalis thoracis muscle |
| Longissimus capitis muscle | partial | 1071 | 6127470 | 61134003 | Cấu trúc cơ longissimus đầu | Structure of longissimus capitis muscle |
| Longissimus colli muscle | partial | 1071 | 6127471 | 50059002 | Cấu trúc cơ dài cổ bên | Structure of longissimus cervicis muscle |
| Longissimus thoracis muscle | partial | 1071 | 6127473 | 24796008 | Cấu trúc cơ dài ngực | Structure of longissimus thoracis muscle |
| Semispinalis colli muscle | partial | 1266 | 6132146 | 44222009 | Cấu trúc cơ bán gai cổ | Structure of semispinalis cervicis muscle |
| Semispinalis thoracis muscle | partial | 1266 | 6132148 | 29385000 | Cấu trúc cơ bán gai ngực | Structure of semispinalis thoracis muscle |
| Spinalis thoracis muscle | partial | 1289 | 6132698 | 88769007 | Cơ gai ngực | Structure of spinalis thoracis muscle |

Specific implementation notes:

- **Rotatores** requires both sources: BYT PDF 489 establishes the Vietnamese pair and code; VT-SCT-244872002 establishes the explicit `Rotatores` synonym. Do not silently interpret a generic movement word as the named transversospinal group without this bridge.
- **Colli/cervicis and singular/plural:** preserve the source English/Latin verbatim and explicitly note the naming variant. This comparison does not authorize rewriting upstream catalog names. Original TA2 naming normalization belongs to the separate source-name audit.
- **Longissimus:** the new rows supply named regional bilingual pairs. Preserve source variants `longissimus đầu`, `dài cổ bên`, and `dài ngực`; preserve the app's Latin disambiguation from `longus capitis/colli`. Do not claim the source prints the app's complete display wording verbatim.
- **Superficial transverse ligaments:** the source uses `ngang gan tay nông` and `ngang nông bàn chân`. Existing display labels may remain with these variants recorded; this report did not establish that the current aliases are medically wrong. Do not substitute deep transverse, carpal, or other ligament records.
- **Levatores:** BYT uses singular `levator costae brevis/longus`; the existing catalog key is a plural group. Record this lexical number variant, without treating it as evidence for a specific number of mesh structures.

## Twenty-two records that should remain partial

These records were assessed by the existing evidence notes plus bounded searches of the new bilingual source. The new source did not close their stated gap. Whole-muscle, untranslated Latin, toe-specific, or alternate regional wording is not automatically proof of the requested named entity.

| Exact existing record key | Why it remains partial |
| --- | --- |
| Acromial part of deltoid muscle | Parent deltoid records found; no matching named acromial part pair found. |
| Clavicular part of deltoid muscle | Parent deltoid records found; no matching named clavicular part pair found. |
| Scapular spinal part of deltoid muscle | Parent deltoid records found; no matching named scapular-spinal part pair found. |
| Ascending part of trapezius muscle | Parent trapezius records do not establish this named part. |
| Descending part of trapezius muscle | Parent trapezius records do not establish this named part. |
| Transverse part of trapezius muscle | Parent trapezius records do not establish this named part. |
| Deep head of pronator teres | BYT humeral/ulnar head pairs do not establish the catalog's deep/superficial equivalence. |
| Superficial head of pronator teres | Same unresolved head-identity distinction. |
| Dorsal parts of lateral intertransversarii lumborum muscles | Lateral lumbar parent group found; no requested dorsal subdivision pair found. |
| Ventral parts of lateral intertransversarii lumborum muscles | Lateral lumbar parent group found; no requested ventral subdivision pair found. |
| Ary-epiglottic part of oblique arytenoid muscle | Whole aryepiglottic muscle terminology does not establish the requested part-of-oblique-arytenoid relationship. |
| Thyro-epiglottic part of thyro-arytenoid muscle | Whole thyroepiglottic muscle terminology does not establish the requested part relationship. |
| External part of thyro-arytenoid muscle | Parent/superior thyroarytenoid terminology does not establish the requested external part. |
| Flexor digiti minimi of foot | Source supports brevis; existing upstream missing/duplicated words remain a separate unresolved naming discrepancy. |
| Flexor digiti minimi of hand | Source supports brevis; upstream key lacking brevis is not resolved by another brevis citation. |
| Iliocostalis colli muscle | BYT muscle row 6125230, PDF 978 retains `iliocostalis cổ`; a tendon row saying chậu-sườn cổ is not a full muscle-pair citation. |
| Multifidus colli muscle | BYT uses đa phân/đa liên variants; no newly verified full regional bilingual pair using the app's nhiều chân wording. |
| Multifidus lumborum muscle | Same unresolved source-variant mapping. |
| Multifidus thoracis muscle | BYT uses đa phân/chéo sống variants; do not infer the complete app wording from a group citation. |
| Splenius capitis muscle | BYT uses chẩm-đầu or untranslated splenius; no newly verified pair supporting gối đầu. |
| Splenius colli muscle | BYT uses untranslated splenius cổ; no newly verified pair supporting gối cổ. |
| Tendon of extensor digitorum longus | New tendon rows specify within individual toes; they do not establish the entire requested tendon entity. |

## One record that remains unresolved

**Adductor minimus**: retain `unresolved` and its existing Vietnamese authored label/English unless a separately justified correction is found. `adductor minimus` was absent from the searched text of the 1,441-page BYT PDF. This is a bounded search result, not proof that no reputable Vietnamese source exists.

The search surfaced a Scribd user-uploaded copy attributed to Nguyễn Văn Huy's anatomical dictionary, with an indexed minimus/khép nhỏ pair. Its publisher provenance and full-text integrity were not authenticated; it was **not accepted** as the missing source. This report does not infer minimus from brevis or from the superior part of adductor magnus.

## Bounded search record and exclusions

- Searches combined the eight Latin/English names and Vietnamese candidate names with `site:edu.vn`, and narrower university domains including HMU, UMP, CTUMP and PNT; searches included rotatores, spinalis capitis/cervicis, levatores, nâng sườn ngắn/dài, adductor minimus/khép, and superficial transverse metacarpal/metatarsal terminology. These searches did not yield another usable institutional original Vietnamese bilingual text for minimus.
- Official BYT search leads yielded the Điện Biên PDF actually read. Khánh Hòa CDC provided independent bibliographic metadata for the same decision; the Gia Lai health-department page also identified the decision, but its linked files were not substituted for the actual appendix read.
- A library-hosted textbook search lead at `https://www.thuvienlamdong.org.vn/Files/Books/12516.pdf` exposed deep-back figure labels in search results. Actual retrieval failed (web timeout; certificate mismatch for www; non-www path returned a 404 HTML page). **Search excerpts were not counted as full-text or visual access and were not used for upgrades.**
- Third-party scans attributed to the Military Medical Academy, commercial exercise pages, Scribd/Studocu user uploads, and RASA/editorial compilations were not used to promote statuses in this research. Their indexed terms may be leads for future authenticated reading.
- No negative search result should be generalized to the entire Vietnamese anatomy literature.

## Expected bookkeeping if implemented

The existing 173 matched / 35 partial / 8 unresolved counts would become **193 matched / 22 partial / 1 unresolved** after all twenty recommendations are implemented and inventory checks pass. This report alone does not update those statuses.

Keep existing medical/geometry limits and truthful null reviewer fields. Source comparison and automated coverage checks do not constitute clinical validation. The **139 upstream CSV suffix cases are string-matching/bookkeeping differences, not 139 medical errors**. Verification against original TA2 naming standards is a separate claim from matching an upstream derivative CSV or comparing Vietnamese terminology.

Research artifacts used for local checking: `/tmp/atlas-vn-moh-body.pdf`, `/tmp/atlas-vn-moh-body-pages.json`, and selected rendered `/tmp/atlas-vn-moh-{page}.png` files. These are temporary research files, not redistributed source material in the repository.
