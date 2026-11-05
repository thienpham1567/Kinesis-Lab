# Atlas head terminology comparison — 2026-11-05

This addition supplies translated educational labels for a bounded subset of the head inventory. It does not certify source mesh identity, geometry, thickness, fiber directions, attachment footprints or clinical use. Reputable-source comparison is the content acceptance criterion; no clinician review occurred and `reviewedBy` remains `null`.

## Scope and caller contract

`src/lib/clinical/atlas-head-terminology.ts` contains **22 exact source-English keys**, corresponding to **37 source objects** in the accepted head expansion: 15 bone keys / 23 objects and 7 muscle keys / 14 objects. These counts describe source objects, including bilateral pairs, rather than a count of human anatomical bones. The historical 216 muscular-layer comparisons remain separate and unchanged (193 matched, 22 partial, 1 unresolved).

`getAtlasHeadTerminologyComparison(english)` returns a comparison or `null`; only the exact corrected alias `Buccinator` maps to the source key `Bucinator`. `atlasVietnameseName` consumes the compared Vietnamese field, so existing bilingual and accent-insensitive search automatically includes these names. The existing `getAtlasTerminologyComparison` delegates missing old keys to this new module; its source registry includes the three separately scoped head source records. The existing terminology card can therefore show dates, locators and reading limits without a new UI component. Unknown names and unresearched subdivisions receive no head comparison or invented Vietnamese translation.

The new source-specific record `hmu-2004-head` retains the actual new reading date, **2026-11-05**. It does not overwrite the dates or reading scopes of the historical `hmu-2004` record. OpenStax is an English terminology bridge, not a source of Vietnamese translations. `matched` means the full named entity or specific part/head was found in the cited context; it is not official bilingual certification or a canonical FIPAT identifier.

## Sources actually read

- [ĐH Y Hà Nội, *Bài giảng Giải phẫu học* (2004), third-party-hosted scan](https://dienthaiduong.com.vn/upload/file/bai-giang-giai-phau-hocdh-y-ha-noi-1755658431-1762569650.pdf): downloaded and rendered locally because web screenshots repeatedly timed out. Visually inspected PDF pages 16–24, 80, 82–84; used names at pages **16, 83 and 84** only. Pages are one-based PDF indices: e.g. PDF 16 bears printed page 17, PDF 83 printed page 84. No OCR text was available in the downloaded PDF. The host is neither the university nor publisher; integrity is not publisher-verified. The existing [library bibliographic record](https://phucvu.thuvientphcm.gov.vn/Item/ItemDetail/344751) is retained as metadata, not claimed newly read or as authentication of the downloaded scan. No textbook images or long passages are redistributed.
- [OpenStax A&P 2e §7.2, *The Skull*](https://openstax.org/books/anatomy-and-physiology-2e/pages/7-2-the-skull): read HTML sections “Bones of the Brain Case” and “Facial Bones of the Skull,” including their named-bone subsections, on 2026-11-05. Used English names to connect the source labels with the Vietnamese–Latin names in HMU. Hyoid uses the HMU comparison alone; it is not attributed to this skull subsection.
- [OpenStax A&P 2e §11.3, *Axial Muscles of the Head, Neck, and Back*](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back): read HTML “Muscles That Create Facial Expression,” Figure 11.8 text, “Muscles That Move the Lower Jaw” and Table 11.4 on 2026-11-05. Used only English muscle naming and context, including the spelling `buccinator`. Individual masseter parts and lateral pterygoid heads are supported by the HMU paragraphs/figure, not by OpenStax's parent-level table. OpenStax table attachment/action rows are not imported.

## Claim-level comparison inventory

The implementation stores these references on every individual term; this table records the scope without reproducing the source passages.

| Source-English key(s) | Vietnamese display | Exact reading scope |
| --- | --- | --- |
| Frontal, Parietal, Temporal, Occipital, Sphenoid, Ethmoid bone | Xương trán, đỉnh, thái dương, chẩm, bướm, sàng | HMU PDF 16 Vietnamese–Latin inventory; OpenStax §7.2 brain-case named-bone subsections |
| Maxilla, Mandible | Xương hàm trên, hàm dưới | HMU PDF 16; OpenStax §7.2 corresponding facial-bone subsections |
| Zygomatic, Nasal, Lacrimal, Palatine bone; Inferior nasal concha bone; Vomer | Xương gò má, mũi, lệ, khẩu cái, xoăn mũi dưới, lá mía | HMU PDF 16; OpenStax §7.2 corresponding facial-bone subsections |
| Hyoid bone | Xương móng | HMU PDF 16 only |
| Bucinator (raw); Buccinator (corrected alias) | Cơ mút | HMU PDF 83 table supplies Vietnamese/Latin synonym; OpenStax §11.3 facial-expression paragraph/Figure 11.8 supplies English spelling |
| Temporalis muscle | Cơ thái dương | HMU PDF 83; OpenStax §11.3 jaw section/Table 11.4 |
| Superficial part of masseter; Deep part of masseter | Cơ cắn · phần nông; phần sâu | HMU PDF 83 paragraph names both parts; OpenStax §11.3 names parent muscle only |
| Medial pterygoid muscle | Cơ chân bướm trong | HMU PDF 84; OpenStax §11.3 Table 11.4 |
| Superior / Inferior head of lateral pterygoid muscle | Cơ chân bướm ngoài · đầu trên / đầu dưới | HMU PDF 83 paragraph and PDF 84 Figure 4.8 labels; OpenStax §11.3 names parent muscle only |

Source-specific Latin spellings from the scan are retained as read, including the unusual entries beside Mandible and Lacrimal bone. They are not used to correct catalog Latin or assert canonical terminology IDs. No official Vietnamese FIPAT translation was read or claimed.

## Guarded spelling correction

`atlas-corrections.json` adds `english-buccinator-spelling` for the exact original objects `Bucinator.l` (`za-13ac05d8d27f`) and `Bucinator.r` (`za-ac2287df247e`). IDs follow the exporter contract `za-` plus the first 12 SHA-256 hex characters of the exact Blender object name. The runtime guard requires original English `Bucinator` and changes only English to `Buccinator`, following the OpenStax spelling actually read. It does not change Latin, layer, mesh, laterality or the distributed manifest. `sourceMetadata.english` retains the original spelling; the original label remains searchable. Both spellings resolve to the same Vietnamese comparison.

## Limits and verification

Teeth, TMJ structures, facial/ocular muscles and other subdivisions outside this finite comparison retain source-English fallbacks. Viewing neighboring source pages is not a claim that all their content has been accepted. Source-only geometry status is independent from these educational labels; no expert review, measurements, personal treatment advice or anatomical mesh validation is claimed.

`node scripts/check-atlas-head-terminology.mjs` was first run before implementation and failed at the missing Frontal bone Vietnamese label. After implementation it checks the exact 22-key inventory, all three source records and their dates/locators, null reviewer metadata, bilingual/Latin/side search, preservation of source fields, unknown/prototype fallbacks, the unchanged historical status counts, and the exact two-ID spelling correction with upstream-drift rejection. Passing software tests does not establish medical truth or clinical validation.
