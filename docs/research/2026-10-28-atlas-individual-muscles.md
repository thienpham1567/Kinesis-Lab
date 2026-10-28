# Atlas individual-muscle source comparison — 2026-10-28

Research scope: seven muscle families and their fourteen bilateral manifest IDs. This is a durable source comparison for educational content, not implementation or clinical validation. Sources were actually opened and read on **2026-10-28**. Repository policy: `docs/medical-evidence-policy.md` and `AGENTS.md`. Existing gluteus-medius content is outside this change and must remain unchanged.

Acceptance uses reputable-source comparison. Independent expert signoff is optional; none occurred. Set `reviewedBy: null`; if retaining the current record shape, use `review: { literatureCheckedAt: "2026-10-28", clinician: null }`. Do not describe this report as clinician approval or a universal wait for expert approval.

## Sources and actual access

Every source below has `checkedAt: "2026-10-28"`. Read scope is bounded as stated; no full textbook, proprietary illustration, or clinical validation access is claimed.

| Source key | Exact source | Actual access scope |
| --- | --- | --- |
| `openstaxAbdomen` | [OpenStax Anatomy and Physiology 2e §11.4](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax) | Public HTML: “Muscles of the Abdomen,” Figure 11.16 caption and adjacent prose, plus Table 11.6 for comparison. Use layer relationships; exclude disputed abbreviated attachment entries. |
| `openstaxShoulder` | [OpenStax Anatomy and Physiology 2e §11.5](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs) | Public HTML: “Muscles That Move the Humerus,” running text, Figure 11.23 caption, Figure 11.24 alternative text for comparison. Exclude inconsistent alternative-text claims. |
| `openstaxCuff` | [OpenStax Anatomy and Physiology 2e §9.6](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints) | Public HTML: “Shoulder Joint,” especially cuff tendons, capsule relationship and dynamic support. |
| `loyolaExternal` | [Loyola LUMEN · External abdominal oblique](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/exab.htm) | Full public short entry: origin, insertion, action and nerve. |
| `loyolaInternal` | [Loyola LUMEN · Internal abdominal oblique](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/inab.htm) | Full public short entry: origin, insertion, action and nerve. |
| `loyolaTransversus` | [Loyola LUMEN · Transversus abdominis](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/trab.htm) | Full public short entry: origin, insertion, action and nerve. |
| `loyolaAbdomenTable` | [Loyola · Abdomen Muscle Table](https://www.stritch.luc.edu/lumen/meded/grossanatomy/homepage/muscletables/abdomenmuscletable.pdf) | Full public one-page PDF, Robert Frysztak, PhD; printed date 2015-07-16. External-oblique, internal-oblique and transversus rows read. |
| `loyolaSupraspinatus` | [Loyola LUMEN · Supraspinatus](https://www.lumen.luc.edu/lumen/meded/grossanatomy/dissector/muscles/sups.htm) | Full public short entry: origin, insertion, action and nerve. |
| `loyolaInfraspinatus` | [Loyola LUMEN · Infraspinatus](https://www.lumen.luc.edu/lumen/meded/grossanatomy/dissector/muscles/infs.htm) | Full public short entry: origin, insertion, action and nerve. |
| `loyolaSubscapularis` | [Loyola LUMEN · Subscapularis](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/subs.htm) | Full public short entry: origin, insertion, action and nerve. |
| `loyolaTeresMinor` | [Loyola LUMEN · Teres minor](https://www.lumen.luc.edu/lumen/meded/grossanatomy/dissector/muscles/tmn.htm) | Full public short entry: origin, insertion, action and nerve. |
| `ttuhscMuscles` | [TTUHSC · Medical Gross Anatomy muscle tables](https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html) | Public HTML: all seven relevant muscle rows and associated notes. University teaching table, not a peer-reviewed clinical study or source-to-mesh validation. |

Loyola's regional list was used to resolve the actual entry links: [abdomen](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/abdomen.htm) and [back](https://www.lumen.luc.edu/lumen/meded/grossanatomy/dissector/muscles/back_.html). No illustrations are redistributed.

## Proposed claim-level records

IDs, English and Latin names below were read from `public/anatomy/3d/manifest.json`. This establishes catalog correspondence only. The linked anatomy sources do not independently verify the manifest's vertex coordinates, segmentation, laterality labels or mesh identity.

Each family has exactly five proposed claims. The claim IDs fit the existing `facts: [{ id, label, text, sources }]` shape in `src/lib/clinical/anatomy-evidence.mjs`. Names in Vietnamese are proposed display names; this report does not independently certify all terminology translations.

### Internal abdominal oblique muscle — Cơ chéo bụng trong

- Latin: `Musculus obliquus internus abdominis`
- Left: `za-6ac590756567`
- Right: `za-11e8ab43abc3`

| Claim ID / label | Proposed Vietnamese text | Sources |
| --- | --- | --- |
| `position` / Vị trí và lớp | Lớp giữa của ba cơ dẹt thành bụng trước bên, nằm sâu hơn cơ chéo bụng ngoài và nông hơn cơ ngang bụng. | `openstaxAbdomen` |
| `origin` / Nguyên ủy | Mạc ngực–thắt lưng, phần trước mào chậu và phần ngoài dây chằng bẹn. | `loyolaInternal`, `loyolaAbdomenTable` |
| `insertion` / Bám tận | Bờ dưới các xương sườn 10–12 và đường trắng; phần dưới góp vào gân kết hợp bám xương mu. | `loyolaAbdomenTable` |
| `innervation` / Thần kinh | Các nhánh trước thần kinh ngực dưới và thần kinh thắt lưng thứ nhất, tương ứng T7–L1. | `loyolaAbdomenTable` |
| `action` / Chức năng chính | Ép và nâng đỡ tạng bụng; góp phần gấp và xoay thân. | `loyolaAbdomenTable` |

### External abdominal oblique muscle — Cơ chéo bụng ngoài

- Latin: `Musculus obliquus externus abdominis`
- Left: `za-a37e0a05a2d2`
- Right: `za-a0399c244657`

| Claim ID / label | Proposed Vietnamese text | Sources |
| --- | --- | --- |
| `position` / Vị trí và lớp | Lớp nông nhất trong ba cơ dẹt của thành bụng trước bên. | `openstaxAbdomen` |
| `origin` / Nguyên ủy | Mặt ngoài các xương sườn 5–12. | `loyolaAbdomenTable` |
| `insertion` / Bám tận | Đường trắng, củ mu và nửa trước mào chậu; cân cơ góp phần tạo dây chằng bẹn. | `loyolaAbdomenTable`, `ttuhscMuscles` |
| `innervation` / Thần kinh | Các nhánh trước thần kinh ngực T7–T12. | `loyolaExternal` |
| `action` / Chức năng chính | Nâng đỡ thành bụng, góp phần tăng áp lực trong ổ bụng và hỗ trợ thở ra gắng sức. | `loyolaExternal` |

### Transversus abdominis muscle — Cơ ngang bụng

- Latin: `Musculus transversus abdominis`
- Left: `za-0f462c8829a0`
- Right: `za-67d5878d84fa`

| Claim ID / label | Proposed Vietnamese text | Sources |
| --- | --- | --- |
| `position` / Vị trí và lớp | Lớp sâu nhất trong ba cơ dẹt của thành bụng trước bên. | `openstaxAbdomen` |
| `origin` / Nguyên ủy | Mặt trong các sụn sườn 7–12, mạc ngực–thắt lưng, mào chậu và phần ngoài dây chằng bẹn. | `loyolaAbdomenTable` |
| `insertion` / Bám tận | Qua cân cơ vào bao cơ thẳng bụng; gân kết hợp bám mào mu và lược xương mu. | `loyolaTransversus` |
| `innervation` / Thần kinh | Các nhánh trước T7–T12 và thành phần L1. | `loyolaTransversus`, `loyolaAbdomenTable` |
| `action` / Chức năng chính | Nâng đỡ thành bụng, hỗ trợ thở ra gắng sức và tăng áp lực trong ổ bụng. | `loyolaTransversus` |

### Supraspinatus muscle — Cơ trên gai

- Latin: `Musculus supraspinatus`
- Left: `za-0425424460a5`
- Right: `za-01cb75938da6`

| Claim ID / label | Proposed Vietnamese text | Sources |
| --- | --- | --- |
| `position` / Vị trí và lớp | Cơ sâu vùng vai, nằm phía trên gai xương vai và thuộc nhóm chóp xoay. | `openstaxShoulder` |
| `origin` / Nguyên ủy | Hố trên gai xương vai. | `loyolaSupraspinatus`, `ttuhscMuscles` |
| `insertion` / Bám tận | Diện trên của củ lớn xương cánh tay và bao khớp vai. | `loyolaSupraspinatus` |
| `innervation` / Thần kinh | Thần kinh trên vai, C5–C6. | `loyolaSupraspinatus` |
| `action` / Chức năng chính | Dạng cánh tay và góp phần giữ vững khớp vai. | `loyolaSupraspinatus` |

### Infraspinatus muscle — Cơ dưới gai

- Latin: `Musculus infraspinatus`
- Left: `za-87ff24e3a85d`
- Right: `za-3eade513dbf4`

| Claim ID / label | Proposed Vietnamese text | Sources |
| --- | --- | --- |
| `position` / Vị trí và lớp | Cơ sâu vùng vai, nằm phía dưới gai xương vai và thuộc nhóm chóp xoay. | `openstaxShoulder` |
| `origin` / Nguyên ủy | Hố dưới gai xương vai và các vách sợi giữa cơ. | `loyolaInfraspinatus` |
| `insertion` / Bám tận | Diện giữa của củ lớn xương cánh tay và bao khớp vai. | `loyolaInfraspinatus` |
| `innervation` / Thần kinh | Thần kinh trên vai, C5–C6. | `loyolaInfraspinatus` |
| `action` / Chức năng chính | Xoay ngoài cánh tay và góp phần giữ vững khớp vai. | `loyolaInfraspinatus` |

### Subscapularis muscle — Cơ dưới vai

- Latin: `Musculus subscapularis`
- Left: `za-84c7d3654da9`
- Right: `za-bb19dc35992b`

| Claim ID / label | Proposed Vietnamese text | Sources |
| --- | --- | --- |
| `position` / Vị trí và lớp | Cơ sâu ở mặt trước xương vai, thuộc nhóm chóp xoay. | `openstaxShoulder` |
| `origin` / Nguyên ủy | Hai phần ba trong của hố dưới vai. | `loyolaSubscapularis` |
| `insertion` / Bám tận | Củ bé xương cánh tay và bao khớp vai. | `loyolaSubscapularis` |
| `innervation` / Thần kinh | Thần kinh dưới vai trên và dưới, C5–C6. | `loyolaSubscapularis` |
| `action` / Chức năng chính | Xoay trong cánh tay và góp phần giữ vững khớp vai. | `loyolaSubscapularis` |

### Teres minor muscle — Cơ tròn bé

- Latin: `Musculus teres minor`
- Left: `za-a9f9cad10f26`
- Right: `za-fd5c02294b47`

| Claim ID / label | Proposed Vietnamese text | Sources |
| --- | --- | --- |
| `position` / Vị trí và lớp | Cơ sâu thuộc nhóm chóp xoay, ở vùng bờ ngoài xương vai, phía trên cơ tròn lớn. | `openstaxShoulder`, `loyolaTeresMinor` |
| `origin` / Nguyên ủy | Phần giữa bờ ngoài xương vai. | `loyolaTeresMinor` |
| `insertion` / Bám tận | Diện dưới của củ lớn xương cánh tay và bao khớp vai. | `loyolaTeresMinor` |
| `innervation` / Thần kinh | Thần kinh nách, C5–C6. | `loyolaTeresMinor` |
| `action` / Chức năng chính | Xoay ngoài cánh tay và góp phần giữ vững khớp vai. | `loyolaTeresMinor` |

Optional shared cuff context, separate from the five-claim records: “Gân của bốn cơ chóp xoay liên quan với bao khớp và góp phần giữ chỏm xương cánh tay trong ổ chảo.” Source: `openstaxCuff`.

## Source differences and deliberate exclusions

1. **Abdominal rotation laterality:** the actually read abdominal sources do not explicitly distinguish same-side internal-oblique rotation from opposite-side external-oblique rotation. Do not add those unilateral laterality claims from memory. General rotation can be stated where cited.
2. **External-oblique innervation:** TTUHSC includes iliohypogastric/ilioinguinal nerves. Loyola's individual entry says T7–T12; its PDF says six inferior thoracic nerves. The proposed claim follows the concordant Loyola descriptions. This report does not silently reconcile the discrepancy or claim no variation exists.
3. **Internal-oblique attachment extent:** Loyola's individual entry and TTUHSC give lateral two thirds of the inguinal ligament; Loyola's PDF gives lateral half. TTUHSC gives the lower three or four ribs; Loyola's PDF specifies ribs 10–12. The origin avoids a definitive ligament fraction; the rib-number claim is explicitly linked to the PDF.
4. **Transversus attachment extent:** Loyola's individual entry gives anterior two thirds of the iliac crest and lateral half of the inguinal ligament; TTUHSC gives anterior three quarters/lateral third. Loyola's PDF leaves iliac extent general and gives lateral third. Proposed text retains shared attachment sites without harmonizing those fractions.
5. **Transversus action:** TTUHSC lists trunk flexion/lateral bending, whereas Loyola and OpenStax emphasize abdominal compression/support. The core function follows the latter sources; TTUHSC's alternate action is excluded.
6. **OpenStax §11.4 Table 11.6:** its abbreviated abdominal attachment rows conflict with the university tables (including transversus origin/insertion descriptions). Do not use those rows as attachment evidence. Adjacent prose and Figure 11.16 support the layer claims.
7. **OpenStax §11.5 Figure 11.24 alternative text:** it describes supraspinatus as rotating the elbow outward. The running text and both university sources identify abduction. Do not use that alternative text as the action claim. The Figure 11.23 caption also has problematic attachment wording for infraspinatus; use the individual university entry for attachments.
8. **Secondary shoulder actions:** TTUHSC adds subscapularis-assisted extension; OpenStax adds teres-minor extension. These optional secondary actions are excluded from the concise core.
9. **Attachment maps and architecture:** gross attachment descriptions do not establish tendon footprints, compartment partitions, local fascicle trajectories, thickness, muscle force, deformation or exact source-to-mesh landmarks. The existence of three abdominal layers does not verify layer clearance in this mesh.

## Limits and handoff requirements

- Retain `reviewedBy: null` and truthful review metadata. Reputable-source comparison is the content acceptance criterion; no expert approval occurred and none is represented as a release gate.
- Keep fiber mapping unavailable: `status: "unavailable"`, reason: “Chưa có bản đồ hướng sợi được kiểm chứng và ánh xạ lên mesh này.”
- Suggested Vietnamese limits: “Nguồn hỗ trợ giải phẫu đại thể phục vụ học tập; không xác nhận tọa độ, hình dạng hay nhãn của từng mesh.” “Vùng bám nêu ở mức đại thể, không phải bản đồ điểm bám, hướng bó sợi hay số đo mô của cá nhân.” “Nội dung không xác định nguyên nhân đau, chẩn đoán tổn thương hoặc kế hoạch điều trị cá nhân.”
- Do not infer medical correctness from source-material names such as `Internal rotator`, mesh-derived normals, vertex coordinates, visual realism or automated tests. Symptom-based medical referral guidance remains applicable.
- Unknown IDs must continue to return no evidence. These fourteen IDs can resolve to seven shared bilateral records; this does not upgrade all catalog structures.
- Preserve the existing gluteus-medius record and its dates, source scopes and limitations. Product implementation, tests, commits, pushes and deployment were not performed for this research report.
