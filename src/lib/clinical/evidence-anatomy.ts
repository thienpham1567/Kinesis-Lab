import type { AnatomyRegionId } from "./anatomy-atlas";

export interface AnatomyRegionEvidence {
  sources: { title: string; url: string; checkedAt: string; access: string }[];
  /** Field-level mappings to the numbered sources in this region, not certification. */
  supportedClaims: string[];
  limitations: string[];
  reviewedBy: null;
  status: "literature-reviewed" | "limited";
}

const checkedAt = "2026-10-22";
const source = (title: string, url: string, access: string) => ({ title, url, checkedAt, access });
const lumen = (title: string, slug: string) => source(
  `Loyola University Chicago, LUMEN: ${title}`,
  `https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/${slug}.htm`,
  "Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation.",
);
const vertebralColumn = source(
  "OpenStax, Anatomy and Physiology 2e §7.3: The Vertebral Column",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/7-3-the-vertebral-column",
  "Full HTML available; regional anatomy, intervertebral disc structure and vertebral support/movement sections checked. Clinical treatment statements in this chapter were not used as guidance.",
);
const lowerLimb = source(
  "OpenStax, Anatomy and Physiology 2e §11.6: Appendicular Muscles of the Pelvic Girdle and Lower Limbs",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs",
  "Full HTML; thigh-compartment prose, pelvic muscle descriptions and selected table material rechecked for broad function. Detailed attachments cross-checked with LUMEN. Image alternative text is not treated as an error-free attachment/function reference; no images reproduced.",
);
const chestPain = source(
  "NHS: Chest pain",
  "https://www.nhs.uk/symptoms/chest-pain/",
  "Full HTML; emergency symptoms and instruction to obtain immediate help checked. UK service numbers were not copied into the Vietnamese text.",
);
const neckGuideline = source(
  "Blanpied et al. Neck Pain: Revision 2017. JOSPT 47(7):A1–A83; doi:10.2519/jospt.2017.0302",
  "https://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20CPG%20-%20Revision%202017.pdf",
  "Full official PDF downloaded and text extracted; summary A2–A3, differential diagnosis and physical impairment examination checked. Web reader returned 403; direct PDF retrieval succeeded. Source age is explicit.",
);
const shoulderConditioning = source(
  "AAOS OrthoInfo / ASES: Rotator Cuff and Shoulder Conditioning Program",
  "https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program",
  "Full HTML; introduction, Getting Started, Standing Row and external-rotation exercise sections checked. General conditioning examples, not an individual treatment prescription.",
);
const pfpGuide = source(
  "Neal et al. Best practice guide for patellofemoral pain. BJSM 2024;58:1486–1495; doi:10.1136/bjsports-2024-108110",
  "https://bjsm.bmj.com/content/58/24/1486",
  "Publisher indexed full-text sections How to apply the BPG, Discussion and Conclusion read through web search; direct open returned 403. Exercise/education and individualized load recommendations checked, not every included trial.",
);
const selectedJoints = source(
  "OpenStax, Anatomy and Physiology 2e §9.6: Anatomy of Selected Synovial Joints",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints",
  "Full HTML; Shoulder, Hip, Knee and Ankle Joint prose checked for gross articulations, labrum, cruciate/collateral ligaments and ankle inversion/eversion restraints. No injury rates, postoperative advice or source-to-image coordinate verification adopted.",
);
const vertebralJoints = {
  title: "OpenStax, Anatomy and Physiology 2e §9.6: Articulations of the Vertebral Column",
  url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints",
  checkedAt: "2026-10-28",
  access: "HTML subsection Articulations of the Vertebral Column; paragraphs on facet-joint orientation and cervical, thoracic and lumbar movement checked. Only these regional movement descriptions are used here, not personal ROM measurements, treatment guidance or mesh validation.",
};
const synovialJoints = source(
  "OpenStax, Anatomy and Physiology 2e §9.4: Synovial Joints",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/9-4-synovial-joints",
  "Full HTML; articular capsule, synovial membrane and lubrication paragraphs checked; no personal measurement or treatment guidance.",
);
const headNeck = source(
  "OpenStax, Anatomy and Physiology 2e §11.3: Axial Muscles of the Head, Neck, and Back",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back",
  "Full HTML; head/neck and posterior neck/back prose and table 11.5 checked. General group functions only; not a detailed atlas of suboccipital attachments or proof of postural pain mechanisms.",
);
const abdominalWall = source(
  "OpenStax, Anatomy and Physiology 2e §11.4: Axial Muscles of the Abdominal Wall, and Thorax",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax",
  "Full HTML; Muscles of the Abdomen prose checked: four paired groups, three lateral wall layers, rectus/linea alba and posterior wall. Detailed attachment tables and the historical physical therapy vignette are not used as treatment evidence.",
);
const pectoralGirdle = source(
  "OpenStax, Anatomy and Physiology 2e §11.5: Muscles of the Pectoral Girdle and Upper Limbs",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs",
  "Full HTML; pectoral-girdle positioning prose/table and broad humeral muscle descriptions checked. Pectoralis minor rib attachment varies (2–4 or 3–5); no muscle-length/pain causation inferred from this chapter.",
);
const pelvicGirdle = source(
  "OpenStax, Anatomy and Physiology 2e §8.3: The Pelvic Girdle and Pelvis",
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/8-3-the-pelvic-girdle-and-pelvis",
  "Full HTML; hip bone components, sacroiliac articulation and pubic symphysis checked. Describes gross pelvic ring structure, not individual alignment or pain causation.",
);

const commonLimitations = [
  "Đây là đối chiếu tài liệu cho các phát biểu và trường được chỉ rõ; không chứng nhận mọi nội dung trước đây, chẩn đoán hay kế hoạch cá nhân.",
  "Nguồn mô tả giải phẫu đại thể, không xác nhận hình dạng mesh, đường sợi, điểm mốc, vùng bám hoặc số đo trên mô hình 3D.",
  "Các mục quan sát và ví dụ điều chỉnh hoạt động phục vụ giáo dục; không phải nghiệm pháp được xác thực cho PT hoặc phác đồ điều trị.",
];

/**
 * Source comparison for all eight educational region cards, rechecked 2026-10-22 including linked joint annotations;
 * vertebral movement source added 2026-10-28 with its own reading scope/date. Source numbering is
 * local to each record, one-based. `reviewedBy` stays null until an actual expert
 * review occurs. Clinical observations do not establish a diagnosis or clearance.
 */
export const ANATOMY_REGION_EVIDENCE: Record<AnatomyRegionId, AnatomyRegionEvidence> = {
  cervical: {
    sources: [
      vertebralColumn,
      lumen("Longus colli", "lncl"),
      lumen("Longus capitis (entry heading: LONGUS CAPITUS)", "lonc"),
      lumen("Levator scapulae", "ls"),
      lumen("Trapezius", "trap"),
      neckGuideline,
      source("AAOS OrthoInfo: Cervical Radiculopathy (Pinched Nerve)", "https://www.orthoinfo.org/diseases--conditions/cervical-radiculopathy-pinched-nerve/", "Full HTML; Symptoms, Physical Examination and Physical therapy paragraphs checked."),
      source("AAOS OrthoInfo: Neck Sprains and Strains", "https://www.orthoinfo.org/diseases--conditions/neck-sprain/", "Full HTML; Anatomy and Warning Signs checked. Medication, collar and passive treatment advice not adopted."),
      headNeck,
      vertebralJoints,
    ],
    supportedClaims: [
      "[1] Giải phẫu vùng: cột sống cổ nâng đỡ và vận động đầu; nguồn là §7.3 về cấu trúc và vận động cột sống.",
      "[2,3] Cấu trúc giải phẫu: kiểm tra riêng điểm bám và chức năng longus colli/capitis; sửa mô tả gộp nhầm điểm bám hai cơ.",
      "[4,5] Cấu trúc giải phẫu: kiểm tra điểm bám và tác dụng cơ nâng vai/cơ thang; không dùng LUMEN để suy ra quá hoạt hoặc yếu cơ.",
      "[6] Cơ sinh học, Quan sát và khi cần khám, Điều chỉnh hoạt động: đối chiếu khuyến nghị vận động/sức bền theo phân loại đau cổ và yêu cầu đánh giá tổng thể; bỏ quy tắc nhô đầu mỗi 2.5 cm làm tải tăng đôi, cấm bài theo tên và liều RPE/tempo không có căn cứ.",
      "[7] Tình trạng thường gặp, Hoạt động liên quan triệu chứng: đau rễ có thể lan tay kèm tê/yếu; một số vận động cổ làm triệu chứng tăng. Nguồn không chứng nhận tự chẩn đoán từ đau lan.",
      "[8] Dấu hiệu cần trợ giúp y tế: đau cổ sau chấn thương và đau kèm đau đầu/tê/yếu tay chân cần đánh giá y tế ngay; không quy chóng mặt đơn độc thành thiếu máu động mạch đốt sống.",
      "[4,5,9] Chú giải hình cơ cổ: chức năng chung ức–đòn–chũm/bậc thang và cơ sau cổ; bỏ mô tả gộp mọi cơ sâu đều nối xương chẩm với C1/C2.",
      "[1] Kiến thức nền: C1 không thân/mỏm gai và khớp đội–chẩm cho gật đầu; mỏm răng C2 cho xoay đầu (OpenStax §7.3, đọc lại 2026-10-22).",
      "[10] Kiến thức nền: mặt khớp cổ phẳng, hướng lên/xuống cho phép gập, duỗi, nghiêng và xoay nhiều (OpenStax §9.6, Articulations of the Vertebral Column, đọc 2026-10-28).",
    ],
    limitations: [...commonLimitations, "Hướng dẫn cổ được kiểm tra là bản 2017; không khẳng định đã rà soát toàn bộ chứng cứ cổ công bố sau đó. Không có mô hình lực cá nhân để định lượng tải từ tư thế đầu."],
    reviewedBy: null,
    status: "literature-reviewed",
  },
  shoulder: {
    sources: [
      lumen("Supraspinatus", "sups"),
      lumen("Infraspinatus", "infs"),
      lumen("Teres minor", "tmn"),
      lumen("Serratus anterior", "sera"),
      source("Braman et al. In Vivo Assessment of Scapulohumeral Rhythm During Unconstrained Overhead Reaching in Asymptomatic Subjects. J Shoulder Elbow Surg 2009;18:960–967", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2841046/", "Full author manuscript; Abstract, Introduction, bone-pin measurement Methods, Table I and interpretation of rhythm variability checked."),
      shoulderConditioning,
      source("AAOS OrthoInfo: Rotator Cuff Tears", "https://www.orthoinfo.org/diseases--conditions/rotator-cuff-tears", "Full publisher HTML retrieved; Symptoms and nonsurgical exercise paragraphs rechecked; used only for pain with lifting and need for clinical assessment, not tear diagnosis."),
      chestPain,
      source("NHS: Shoulder pain", "https://www.nhs.uk/symptoms/shoulder-pain/", "Full HTML; Urgent advice section checked for severe sudden pain, inability to move, swelling/deformity and post-injury symptoms. Source review date 2023; symptom referral guidance only."),
      selectedJoints,
      pectoralGirdle,
      synovialJoints,
    ],
    supportedClaims: [
      "[1–4] Cấu trúc giải phẫu: kiểm tra điểm bám đại thể và tác dụng dạng/xoay ngoài/ổn định vai, vươn và xoay bả vai; bỏ giới hạn cơ trên gai chỉ khởi phát 0–30° và khẳng định mọi cơ đều kéo chỏm xuống.",
      "[5] Giải phẫu vùng, Cơ sinh học: nghiên cứu đo bằng cảm biến gắn xương ở người không triệu chứng cho thấy nhịp nâng/hạ và các cung vận động khác nhau; không biến số trung bình nghiên cứu thành chuẩn 2:1 bắt buộc hoặc quy tắc chẩn đoán.",
      "[6] Điều chỉnh hoạt động: row và xoay ngoài là ví dụ trong chương trình chung cần người điều trị chọn; bỏ kê landmine/floor press mặc định, góc an toàn và liều cố định.",
      "[7] Tình trạng thường gặp, Hoạt động liên quan triệu chứng, Quan sát và khi cần khám: nâng tay đau có thể gặp ở bệnh chóp xoay; bản viết lại dùng bệnh sử/thăm khám, không gán cung đau cho mô tổn thương.",
      "[8] Dấu hiệu cần trợ giúp y tế: đau/tức ngực đột ngột không giảm, đau ngực lan tay/cổ/lưng hoặc kèm khó thở/vã mồ hôi/choáng cần cấp cứu; các biểu hiện không bắt buộc xuất hiện cùng nhau và không giới hạn ở vai trái.",
      "[9] Dấu hiệu cần trợ giúp y tế: đau vai đột ngột dữ dội/không vận động được, biến dạng/sưng hoặc sau chấn thương cần đánh giá khẩn; không quy đau đêm hay drop-arm tự quan sát thành chẩn đoán rách toàn bộ.",
      "[10–12,4,5,7] Chú giải hình khớp vai và cơ đai vai: ổ chảo–chỏm, chóp xoay, bao khớp/màng hoạt dịch, ngực bé và cơ trám; bỏ tỉ lệ kích thước không định nghĩa và liên hệ chiều dài ngực bé không có nguồn ở thẻ.",
      "[10,12] Kiến thức nền: vai là khớp chỏm–ổ có biên độ lớn nhất nhưng kém vững, bao khớp lỏng và dựa vào dây chằng/chóp xoay (OpenStax §9.6, đọc lại 2026-10-22).",
    ],
    limitations: [...commonLimitations, "Nghiên cứu nhịp vai là nghiên cứu động học ở người không triệu chứng, không chứng minh cơ chế gây đau hoặc bài phục hồi tốt nhất. Chưa có đo khoảng dưới mỏm cùng hay xác nhận hướng sợi từ mesh."],
    reviewedBy: null,
    status: "literature-reviewed",
  },
  thoracic_core: {
    sources: [
      vertebralColumn,
      lumen("Transversus abdominis", "trab"),
      lumen("Diaphragm", "dph"),
      lumen("Internal abdominal oblique", "inab"),
      lumen("External abdominal oblique", "exab"),
      source("American Heart Association: Getting Active to Control High Blood Pressure", "https://www.heart.org/en/health-topics/high-blood-pressure/changes-you-can-make-to-manage-high-blood-pressure/getting-active-to-control-high-blood-pressure", "Full publisher page text; Take charge of your activity level, start gradually, pre-existing conditions and Practice breath control sections checked."),
      chestPain,
      source("Hernández-Granados et al. European Hernia Society guidelines on management of rectus diastasis. BJS 2021;108:1189–1191; doi:10.1093/bjs/znab128", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10364860/", "Full executive-summary HTML; KQ2 assessment, KQ4–KQ5 symptom/width uncertainty and KQ6 nonoperative treatment read. Supplementary full guideline and every trial not audited."),
      abdominalWall,
      pectoralGirdle,
      vertebralJoints,
    ],
    supportedClaims: [
      "[1] Giải phẫu vùng: đối chiếu liên kết đốt ngực–xương sườn và việc cột sống cho phép vận động; bỏ mô hình tuyệt đối ngực chỉ linh hoạt/thắt lưng chỉ ổn định.",
      "[2–5] Cấu trúc giải phẫu và phần chức năng trong Cơ sinh học: kiểm tra các vùng bám đại thể, hít vào/thở ra gắng sức, hỗ trợ thành bụng và tăng áp lực ổ bụng; không suy ra áp lực đo được hay mức bảo vệ đĩa đệm.",
      "[6] Hoạt động liên quan triệu chứng, Điều chỉnh hoạt động: nín thở có thể tăng huyết áp; thở đều, tăng hoạt động dần và hướng dẫn cá nhân khi có bệnh nền. Bỏ cam kết bracing không gây tăng huyết áp.",
      "[7] Tình trạng thường gặp về đau ngực, Quan sát và khi cần khám, Dấu hiệu cần trợ giúp y tế: đau ngực cần đánh giá theo triệu chứng và dấu hiệu cấp cứu; vận động thử không loại trừ bệnh tim phổi.",
      "[8] Tình trạng thường gặp về tách cơ bụng, Điều chỉnh hoạt động: hướng dẫn EHS yêu cầu đánh giá lâm sàng, nêu tương quan bề rộng–triệu chứng chưa rõ và chưa đủ chứng cứ chọn một phác đồ vận động; bỏ cấm sit-up/crunch mặc định.",
      "[2,4,5,8–10] Chú giải hình cơ thành bụng: bốn nhóm cơ bụng, ba lớp thành bụng bên, cơ thẳng bụng/đường trắng; cơ răng trước/lưng rộng được mô tả đại thể, không suy ra một hệ ổn định đo được.",
      "[1] Kiến thức nền: đốt ngực khớp với xương sườn, mỏm gai dài chúc xuống; đường cong ngực là cong nguyên phát lồi ra sau (OpenStax §7.3, đọc lại 2026-10-22).",
      "[11] Kiến thức nền: mỏm gai ngực chúc xuống, chồng lên nhau cùng lồng ngực hạn chế gập, duỗi và nghiêng; cổ và thắt lưng có biên độ lớn hơn (OpenStax §9.6, Articulations of the Vertebral Column, đọc 2026-10-28).",
    ],
    limitations: [...commonLimitations, "Phạm vi đã kiểm tra gồm giải phẫu chức năng, hô hấp chung, cảnh báo đau ngực và tóm tắt EHS2021 về tách cơ bụng. Chưa rà soát đầy đủ điều trị sau sinh/sàn chậu hoặc thử nghiệm mới hơn; không cung cấp phác đồ cá nhân.", "Các quan sát thở chỉ mô tả biểu hiện, không đo áp lực ổ bụng; chưa có kiểm chứng hiệu quả phòng chấn thương của cue 360° hoặc ribcage–pelvis stack."],
    reviewedBy: null,
    status: "limited",
  },
  lumbar: {
    sources: [
      vertebralColumn,
      lumen("Transversospinalis–multifidus", "mult"),
      lumen("Quadratus lumborum", "ql"),
      source("NICE NG59: Low back pain and sciatica in over 16s — Recommendations", "https://www.nice.org.uk/guidance/ng59/chapter/Recommendations", "Official indexed full-text recommendations 1.1.1, 1.1.4–1.1.6, 1.2.1–1.2.2 checked through web search; direct reader open failed. No individualized load or surgical rehabilitation guidance inferred."),
      source("North Bristol NHS Trust: Same Day Emergency Clinic — Cauda Equina Syndrome", "https://www.nbt.nhs.uk/our-services/a-z-services/neurosurgery/neurosurgery-patient-information/same-day-emergency-clinic-sdec-cauda-equina-syndrome-sec", "NHS indexed symptom/emergency text rechecked; direct retrieval failed (503). New saddle-sensation and bowel/bladder changes prompt emergency assessment. No claim of complete current-page access."),
      lumen("Psoas major", "psmj"),
      lumen("Iliacus", "ilia"),
      lumen("Transversus abdominis", "trab"),
      abdominalWall,
      source("NHS: Sciatica", "https://www.nhs.uk/conditions/sciatica/", "Full HTML; Symptoms, Immediate action and Causes sections rechecked. Supports radiating pain, sensory/strength changes, disc-related causes and emergency bilateral/saddle/bladder/bowel symptoms; not exercise dosage or imaging-based diagnosis."),
      vertebralJoints,
    ],
    supportedClaims: [
      "[1] Giải phẫu vùng, Cấu trúc giải phẫu: đối chiếu cấu trúc vòng sợi/nhân nhầy, vị trí giữa thân đốt và chức năng chịu tải/vận động. Không coi gập lưng là chứng cứ thoát vị trong từng lần nâng.",
      "[2,3] Cấu trúc giải phẫu: nguồn đại thể về nhóm multifidus nối các tầng và duỗi cột sống; QL liên kết chậu–sườn 12–thắt lưng, nghiêng thân/cố định sườn. Chỉ mô tả khái quát, không xác nhận từng bó multifidus.",
      "[4] Cơ sinh học, Tình trạng thường gặp, Hoạt động liên quan triệu chứng, Quan sát và khi cần khám, Điều chỉnh hoạt động: đánh giá nguyên nhân khác, duy trì hoạt động, chọn vận động theo nhu cầu/khả năng; bỏ tỉ lệ giảm lực cắt 50–70%, mốc ngồi 45 phút, cấm squat/deadlift và phác đồ RPE chung.",
      "[5,10] Dấu hiệu cần trợ giúp y tế: đối chiếu chức năng thần kinh chùm đuôi ngựa, thay đổi cảm giác/tiểu tiện/đại tiện và tê/yếu nặng hoặc tăng dần hai chân cần đánh giá cấp cứu; không dùng nghiệm pháp PT để loại trừ.",
      "[4,5] Dấu hiệu cần trợ giúp y tế: cảnh báo chuyển đánh giá khi có triệu chứng thần kinh mới/tăng dần hoặc nghi nhiễm trùng, ung thư, chấn thương; không gán bệnh chỉ từ một dấu hiệu.",
      "[1,3,5–10] Chú giải hình đĩa đệm và cơ sâu vùng thắt lưng: đại thể đĩa đệm/rễ, QL, iliopsoas và thành bụng; bám tận và cơ sâu không được xác nhận bằng vị trí trên hình.",
      "[1] Kiến thức nền: thân đốt thắt lưng lớn và dày vì chịu tải lớn nhất; đĩa đệm gồm vòng sợi và nhân nhầy (OpenStax §7.3, đọc lại 2026-10-22).",
      "[11] Kiến thức nền: vùng thắt lưng gập, duỗi và nghiêng khá nhiều, nhưng hướng mặt khớp hạn chế xoay rõ rệt (OpenStax §9.6, Articulations of the Vertebral Column, đọc 2026-10-28).",
    ],
    limitations: [...commonLimitations, "NG59 dành cho người từ 16 tuổi, không phải quy trình tập sau mổ hoặc phác đồ cho mọi chẩn đoán cột sống. LUMEN multifidus là mô tả nhóm cơ cũ, không đủ lập bản đồ điểm bám thắt lưng chi tiết.", "Các ví dụ theo dõi hoạt động không phải công cụ xác định mô gây đau; chưa đối chiếu đầy đủ độ chính xác từng nghiệm pháp thần kinh."],
    reviewedBy: null,
    status: "literature-reviewed",
  },
  hip_pelvis: {
    sources: [
      lumen("Gluteus maximus", "glmx"),
      lumen("Gluteus medius", "glmd"),
      lumen("Gluteus minimus", "glmn"),
      lumen("Psoas major", "psmj"),
      lumen("Iliacus", "ilia"),
      source("Griffin et al. The Warwick Agreement on femoroacetabular impingement syndrome. BJSM 2016;50:1169–1176; doi:10.1136/bjsports-2016-096743", "https://bjsm.bmj.com/content/50/19/1169/", "Publisher indexed full-text sections What is FAI syndrome?, diagnosis, Symptoms and treatment checked through web search; direct reader open failed. International consensus, not a patient-specific exercise trial."),
      source("NHS: Broken hip", "https://www.nhs.uk/conditions/broken-hip/", "Full HTML; hip/groin pain, inability to bear weight after injury, emergency and urgent assessment criteria checked; source page reviewed 2026-07-29."),
      selectedJoints,
      lowerLimb,
      pelvicGirdle,
    ],
    supportedClaims: [
      "[1] Cấu trúc giải phẫu: kiểm tra vùng bám và chức năng duỗi/xoay ngoài mông lớn; không gán lực mạnh nhất hoặc đường sợi đo trên mesh.",
      "[2,3] Cấu trúc giải phẫu, Cơ sinh học về cơ: kiểm tra bám xương chậu–mấu chuyển lớn, dạng háng và vai trò khung chậu khi đi; bỏ lực mông nhỡ bằng hai lần trọng lượng và suy luận gối vào trong luôn do cơ yếu.",
      "[4,5] Cấu trúc giải phẫu: đối chiếu riêng nguyên ủy psoas major/iliacus và bám tận vùng mấu chuyển bé; giữ chức năng gập háng, bỏ kết luận ngồi nhiều gây co rút/ưỡn chậu.",
      "[6] Cơ sinh học về FAI, Tình trạng thường gặp, Hoạt động liên quan triệu chứng, Quan sát và khi cần khám, Điều chỉnh hoạt động: FAI cần triệu chứng, dấu hiệu và hình ảnh; chăm sóc có thể gồm giáo dục/điều chỉnh hoạt động và phục hồi chức năng. Bỏ chẩn đoán qua squat 90° và góc mở chân 15–30° chung.",
      "[7] Dấu hiệu cần trợ giúp y tế: đau háng dữ dội sau chấn thương/không chịu lực cần cấp cứu; đau đột ngột nặng hoặc khớp nóng/sốt cần đánh giá khẩn.",
      "[1–8,9,10] Chú giải hình cơ vùng háng và khớp háng: chức năng cơ quanh háng, khớp chỏm–ổ cối, vòng chậu; bỏ suy luận biến thể thần kinh ngồi/chèn ép vùng mông sâu chưa có nguồn trong thẻ.",
      "[8,10] Kiến thức nền: háng là khớp chỏm–ổ đa trục, dây chằng khỏe căng khi đứng nên biên độ hẹp hơn vai nhưng ổn định hơn; vòng chậu nối cột sống qua khớp cùng–chậu (OpenStax §9.6 và §8.3, đọc lại 2026-10-22).",
    ],
    limitations: [...commonLimitations, "Warwick là đồng thuận năm 2016; không chứng minh một stance squat tối ưu hoặc chẩn đoán từ cam/pincer đơn thuần. Không mở rộng registry này thành xác nhận nguồn đau mông/háng ngoài hay phác đồ GTPS.", "Phân khu mông nhỡ/bé và ánh xạ 3D không được xác nhận bằng các mục LUMEN; chứng cứ phân khu mông nhỡ trước đó được quản lý riêng trong anatomy-evidence.mjs."],
    reviewedBy: null,
    status: "literature-reviewed",
  },
  thigh_hamstring: {
    sources: [
      lowerLimb,
      lumen("Rectus femoris", "recf"),
      lumen("Biceps femoris", "bfem"),
      lumen("Gracilis", "grac"),
      source("Martin et al. Hamstring Strain Injury in Athletes. JOSPT 2022;52(3):CPG1–CPG44; doi:10.2519/jospt.2022.0301", "https://www.orthopt.org/uploads/content_files/files/Hamstring_Strain_Injury_in_Athletes.pdf", "Full official PDF downloaded/text extracted; Summary CPG2 covering diagnosis, strength/length examination, injury prevention, eccentric training, progressive running and return to play checked."),
      source("AAOS OrthoInfo: Muscle Strains in the Thigh", "https://www.orthoinfo.org/diseases--conditions/muscle-strains-in-the-thigh", "Full HTML; Symptoms, Doctor Examination and Be Aware of Other Similar Injuries checked, including time-sensitive proximal tendon avulsion. Fixed recovery times and medication advice not adopted."),
      source("NHS: DVT (deep vein thrombosis)", "https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/", "Full HTML; Symptoms, Urgent advice, Immediate action and recent immobility/surgery risk sections checked. UK service numbers not copied; no diagnosis from appearance alone."),
    ],
    supportedClaims: [
      "[1,2] Giải phẫu vùng, Cấu trúc giải phẫu: đối chiếu nhóm tứ đầu, cơ thẳng đùi hai khớp và đường truyền gân qua bánh chè; bỏ VMO là cơ chế duy nhất giữ bánh chè.",
      "[1,3] Giải phẫu vùng, Cấu trúc giải phẫu: kiểm tra đầu ngắn nhị đầu từ đùi không đi qua háng; điểm bám khác nhau ở mác/chày và chức năng gập gối/duỗi háng của các phần vượt háng.",
      "[1,4] Cấu trúc giải phẫu: sửa điểm bám gracilis ở chày thay vì gộp mọi cơ khép vào đường ráp đùi; giữ mô tả nhóm khép háng.",
      "[5] Cơ sinh học, Hoạt động liên quan triệu chứng, Quan sát và khi cần khám, Điều chỉnh hoạt động: hướng dẫn căng gân kheo dùng sức mạnh/tầm vận động/chức năng đi–chạy; co cơ khi kéo dài theo dung nạp và tiến triển chạy trong phục hồi, Nordic trong chương trình phòng ngừa. Bỏ chuẩn bridge >20 lần và hứa giảm đau nhờ isometric 30–45 giây cho mọi bệnh gân.",
      "[6] Tình trạng thường gặp, Dấu hiệu cần trợ giúp y tế: đau đột ngột/tiếng bụp/bầm và đau gần ụ ngồi cần phân biệt tổn thương nặng hoặc bong điểm bám; không tự phân độ 3 từ biểu hiện.",
      "[7] Dấu hiệu cần trợ giúp y tế: đau/sưng chân một bên cần đánh giá DVT; kèm đau ngực/khó thở cần cấp cứu. Không thử vận động để loại trừ huyết khối.",
      "[1–4] Chú giải hình các khoang cơ đùi: cơ tứ đầu, khép và gân kheo; đầu ngắn nhị đầu không vượt háng. Bỏ mô tả phân bó VMO không được đối chiếu riêng.",
      "[1] Kiến thức nền: đùi chia ba khoang trong/trước/sau theo chức năng; bốn cơ tứ đầu dùng chung gân qua bánh chè tới lồi củ chày; gân kheo tạo hố khoeo (OpenStax §11.6, đọc lại 2026-10-22).",
    ],
    limitations: [...commonLimitations, "CPG2022 dành cho căng cơ gân kheo ở vận động viên; không xác nhận phác đồ cho bệnh gân điểm bám mạn tính hoặc bong điểm bám. Bản viết lại hướng dẫn khám thay vì tự suy rộng.", "Không có tỉ lệ Quad:Hamstring chung hoặc số bridge được xác nhận để quyết định trở lại thể thao; không định lượng lực ACL từ hoạt động cơ gân kheo."],
    reviewedBy: null,
    status: "literature-reviewed",
  },
  knee: {
    sources: [
      source("AAOS OrthoInfo: Common Knee Injuries", "https://www.orthoinfo.org/diseases--conditions/common-knee-injuries/", "Full HTML; Anatomy, cruciate ligaments and menisci descriptions checked. Used for gross joint structure and function, not percentages of load or diagnostic accuracy."),
      lumen("Rectus femoris", "recf"),
      pfpGuide,
      source("Kotsifaki et al. Aspetar clinical practice guideline on rehabilitation after ACL reconstruction. BJSM 2023;57:500–514; doi:10.1136/bjsports-2022-106158", "https://bjsm.bmj.com/content/57/9/500", "Publisher indexed full-text Exercise initiation, Open versus closed kinetic chain and Strength and motor control training recommendations read through web search. Direct open returned 403 and PMC mirror showed a browser challenge. No individual postoperative timing inferred."),
      source("NHS: Knee pain", "https://www.nhs.uk/symptoms/knee-pain/", "Full HTML; Urgent advice checked for inability to bear weight/move, locking, large swelling/deformity, and fever with joint redness/heat."),
      selectedJoints,
      lowerLimb,
    ],
    supportedClaims: [
      "[1,2] Giải phẫu vùng, Cấu trúc giải phẫu: kiểm tra khớp đùi–chày/chè–đùi, cơ chế duỗi gối, ACL/PCL và sụn chêm; bỏ tỉ lệ tăng cánh tay đòn ~30% và hấp thụ xung lực 50–70% chung.",
      "[3] Cơ sinh học, Tình trạng thường gặp, Hoạt động liên quan triệu chứng, Điều chỉnh hoạt động: hướng dẫn PFP2024 dùng giáo dục và bài tập gối, có thể thêm háng theo đánh giá; chỉnh tải, nhiệm vụ và tần suất theo mức kích thích. Không quy đa số đau gối cho háng/cổ chân hoặc tự coi gối vượt mũi chân là chấn thương.",
      "[4] Cơ sinh học, Điều chỉnh hoạt động: cả chuỗi mở và đóng có vai trò trong phục hồi ACL; đội điều trị quyết định phạm vi/thời điểm/tải theo phẫu thuật và triệu chứng. Bỏ cặp bài thay thế/góc an toàn áp cho mọi người sau mổ.",
      "[5] Quan sát và khi cần khám, Dấu hiệu cần trợ giúp y tế: khóa gối, không chịu lực, sưng/biến dạng và sốt kèm nóng đỏ cần khám khẩn; không hướng dẫn PT tự làm nghiệm pháp sụn chêm.",
      "[1–7] Chú giải các hình khớp gối: truyền lực duỗi, sụn chêm, ACL/PCL, dây chằng bên và nguyên tắc sau ACL; diễn đạt tương quan MCL với bao khớp/sụn chêm rõ hơn, không gộp với LCL.",
      "[6] Kiến thức nền: gối gồm ba khớp trong một bao khớp, vận động bản lề lăn–trượt, xoay khi gập và cơ chế khóa screw-home khi duỗi hết (OpenStax §9.6, đọc lại 2026-10-22).",
    ],
    limitations: [...commonLimitations, "Chưa đối chiếu riêng hiệu lực chẩn đoán Thessaly/McMurray, thông số lực khớp hoặc liều tập gân bánh chè. Các con số đó được gỡ thay vì suy ra từ tài liệu không phù hợp.", "Hướng dẫn ACL là chứng cứ cho người điều trị sau tái tạo, không thay thế phác đồ của phẫu thuật viên hay tiêu chí trở lại thể thao cá nhân."],
    reviewedBy: null,
    status: "literature-reviewed",
  },
  ankle_foot: {
    sources: [
      lumen("Gastrocnemius", "gast"),
      lumen("Soleus", "sole"),
      lumen("Tibialis posterior", "tibp"),
      lumen("Tibialis anterior", "tiba"),
      source("Chimenti et al. Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy Revision 2024. JOSPT 54(12):CPG1–CPG32; doi:10.2519/jospt.2024.0302", "https://www.orthopt.org/uploads/content_files/files/Achilles_Pain_revision_2024.pdf", "Full official PDF downloaded/text extracted; Summary CPG2, scope/differential diagnosis and tendon-loading recommendations checked. Explicitly midportion disease; not an insertional or rupture guideline."),
      source("AAOS OrthoInfo: Achilles Tendon Rupture (Tear)", "https://www.orthoinfo.org/diseases--conditions/achilles-tendon-rupture-tear", "Full HTML; Anatomy, Symptoms and Doctor Examination checked. Thompson test described as clinician examination, not taught as a PT/self-test."),
      source("AAOS OrthoInfo: Stress Fractures", "https://orthoinfo.aaos.org/en/diseases--conditions/stress-fractures/", "Full HTML; activity-load Cause, localized/progressive Symptoms and First Aid/Doctor Examination checked. No imaging rule, hop-test instruction or fixed recovery time adopted."),
      selectedJoints,
    ],
    supportedClaims: [
      "[1,2] Giải phẫu vùng, Cấu trúc giải phẫu, Cơ sinh học về giải phẫu: kiểm tra bụng chân vượt gối/cổ chân, dép không vượt gối, gân đến xương gót và chức năng gập lòng; bỏ tuyên bố cơ dép luôn chịu tải cao nhất khi gối gập.",
      "[3,4] Cấu trúc giải phẫu: kiểm tra vùng bám, gập lòng/gập mu, nghiêng trong và hỗ trợ vòm; không suy ra bàn chân bẹt bệnh lý từ một quan sát vòm.",
      "[5] Cơ sinh học về bệnh gân, Tình trạng thường gặp, Hoạt động liên quan triệu chứng, Điều chỉnh hoạt động: tải gân tiến triển và giáo dục theo khả năng trong Achilles đoạn giữa; nghỉ hoàn toàn không phải lời khuyên chung. Khuyến nghị tải gân này không áp cho nghi suy yếu cấu trúc gân; CPG không cấp chuẩn knee-to-wall/25 heel raises để chẩn đoán; các ngưỡng cũ được gỡ.",
      "[6] Dấu hiệu cần trợ giúp y tế: tiếng bụp, đau/sưng gót và khó đi/nhón gót có thể do đứt gân, cần khám khẩn; nghiệm pháp không thay thế đánh giá.",
      "[7] Dấu hiệu cần trợ giúp y tế: đau xương khu trú liên quan tăng hoạt động có thể là tổn thương xương do stress; dừng hoạt động gây đau và khám sớm, không tự nhảy thử.",
      "[1,2,5,8] Chú giải các hình cổ chân: các khớp, dây chằng, cơ bắp chân và vị trí đau gân đoạn giữa 2–6 cm là một phần đánh giá; không tự chẩn đoán từ khoảng cách.",
      "[8] Kiến thức nền: khớp sên–cẳng chân là bản lề một trục cho gập mu/gập lòng; lật trong/ngoài đến từ khớp dưới sên và khớp gian cổ chân; dây chằng ngoài chống lật trong, delta chống lật ngoài (OpenStax §9.6, đọc lại 2026-10-22).",
    ],
    limitations: [...commonLimitations, "Chưa đối chiếu toàn bộ hướng dẫn bong gân, đau cân gan chân hoặc bệnh gân Achilles tại điểm bám; không chuyển phác đồ đoạn giữa sang các tình trạng này.", "Không có chuẩn duy nhất knee-to-wall hoặc heel raise được xác nhận cho mọi tuổi/cách đo. Chưa xác nhận chuỗi nhân quả hạn chế cổ chân → sập vòm → valgus → gập lưng cho từng người."],
    reviewedBy: null,
    status: "literature-reviewed",
  },
};
