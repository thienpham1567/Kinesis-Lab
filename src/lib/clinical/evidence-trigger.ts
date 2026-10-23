import type { TriggerPointMuscleId } from "./trigger-point-atlas";

export interface TriggerEvidenceSource {
  title: string;
  url: string;
  checkedAt: string;
  access: string;
}

export interface TriggerEvidenceRecord {
  sources: TriggerEvidenceSource[];
  supportedClaims: string[];
  limitations: string[];
  reviewedBy: null;
  status: "literature-reviewed" | "limited";
}

const source = (title: string, url: string, access: string, checkedAt = "2026-10-22"): TriggerEvidenceSource => ({
  title, url, checkedAt, access,
});

// Access scope describes what was actually read, not what a linked site may offer.
export const TRIGGER_EVIDENCE_SOURCES = {
  consensus: source("Fernández-de-las-Peñas & Dommerholt (2018). International Consensus on Diagnostic Criteria and Clinical Considerations of Myofascial Trigger Points: A Delphi Study", "https://pubmed.ncbi.nlm.nih.gov/29025044/", "PubMed bibliographic record and abstract; expert consensus, not a diagnostic accuracy study"),
  history: source("Shah et al. (2015). Myofascial Trigger Points Then and Now: A Historical and Scientific Perspective", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4508225/", "PMC abstract/introduction, integrated energy-crisis hypothesis and conclusion passages; narrative review, not proof of the model; no protected figures reused"),
  biochemistry: source("Shah et al. (2008). Biochemicals associated with pain and inflammation are elevated in sites near to and remote from active myofascial trigger points", "https://pubmed.ncbi.nlm.nih.gov/18164325/", "PubMed record and indexed abstract text: design, participants, results and conclusions; nine volunteers; observational microdialysis, gastrocnemius sampled as an uninvolved remote site"),
  palpation: source("Myburgh et al. (2008). A systematic, critical review of manual palpation for identifying myofascial trigger points: evidence and clinical significance", "https://pubmed.ncbi.nlm.nih.gov/18503816/", "PubMed bibliographic record and abstract; reproducibility review"),
  lowBackPalpation: source("Nolet et al. (2021). Reliability and validity of manual palpation for the assessment of patients with low back pain: a systematic and critical review", "https://pubmed.ncbi.nlm.nih.gov/34446040/", "PubMed bibliographic record and indexed abstract; full text not read in this recheck"),
  rollingMechanisms: source("Behm & Wilke (2019). Do Self-Myofascial Release Devices Release Myofascia? Rolling Mechanisms: A Narrative Review", "https://pubmed.ncbi.nlm.nih.gov/31256353/", "PubMed bibliographic record and abstract; mechanisms proposed, not proven for an individual pain site"),
  rolling: source("Cheatham et al. (2015). The Effects of Self-Myofascial Release Using a Foam Roll or Roller Massager on Joint Range of Motion, Muscle Recovery, and Performance: A Systematic Review", "https://pubmed.ncbi.nlm.nih.gov/26618062/", "PubMed abstract plus PMC abstract, methods/results overview and conclusion; 14 included articles; no consensus on optimal program; individual trial tables not re-audited"),
  neck: source("Fernández-de-las-Peñas et al. (2007). Myofascial trigger points in subjects presenting with mechanical neck pain: a blinded, controlled study", "https://pubmed.ncbi.nlm.nih.gov/21882489/", "PubMed bibliographic record and abstract; 20 patients and 20 controls"),
  shoulder: source("Hidalgo-Lozano et al. (2010). Muscle trigger points and pressure pain hyperalgesia in the shoulder muscles in patients with unilateral shoulder impingement: a blinded, controlled study", "https://pubmed.ncbi.nlm.nih.gov/20186400/", "PubMed bibliographic record and abstract; 12 patients and 10 controls; Experimental Brain Research"),
  shoulderTreatment: source("Bron et al. (2011). Treatment of myofascial trigger points in patients with chronic shoulder pain: a randomized, controlled trial", "https://pubmed.ncbi.nlm.nih.gov/21261971/", "PubMed abstract methods/results plus indexed conclusion; comprehensive 12-week treatment versus a waiting-list control; PMC full text not accessed"),
  pectoralLength: source("Borstad & Ludewig (2005). The effect of long versus short pectoralis minor resting length on scapular kinematics in healthy individuals", "https://pubmed.ncbi.nlm.nih.gov/15901124/", "PubMed bibliographic record and abstract; comparison of 50 volunteers without shoulder pain"),
  lowBack: source("Iglesias-González et al. (2013). Myofascial trigger points, pain, disability, and sleep quality in patients with chronic nonspecific low back pain", "https://pubmed.ncbi.nlm.nih.gov/23947760/", "PubMed bibliographic record and complete abstract; cross-sectional, 42 patients and 42 controls"),
  piriformis: source("Hopayian et al. (2010). The clinical features of the piriformis syndrome: a systematic review", "https://pubmed.ncbi.nlm.nih.gov/20596735/", "PubMed abstract plus indexed PMC introduction/results/discussion passages; mostly case reports/series, no accepted diagnostic reference standard"),
  deepGluteal: source("Martin, Reddy & Gómez-Hoyos (2015). Deep gluteal syndrome", "https://pubmed.ncbi.nlm.nih.gov/27011826/", "PubMed record plus indexed PMC abstract/introduction passages; clinical review of sciatic nerve entrapment, not a trigger-point validation study"),
  slrAccuracy: source("Is the Straight Leg Raise Suitable for the Diagnosis of Radiculopathy? Analysis of Diagnostic Accuracy in a Phase III Study (2023)", "https://pubmed.ncbi.nlm.nih.gov/38132028/", "PubMed/PMC indexed abstract; 142 suspected radiculopathy participants, electrodiagnosis reference standard; limited diagnostic validity, no app prediction rule inferred"),
  neuropathicClassification: source("Schmid et al. (2023). Recommendations for terminology and the identification of neuropathic pain in people with spine-related leg pain: NeuPSIG working group", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10348639/", "PubMed abstract and indexed PMC passages on neuroanatomically plausible pain beyond traditional dermatomes and limitations of isolated neurodynamic tests; position paper, not a diagnostic validation of this app"),
  knee: source("Neal et al. (2024). Best practice guide for patellofemoral pain based on synthesis of a systematic review, the patient voice and expert clinical reasoning", "https://pubmed.ncbi.nlm.nih.gov/39401870/", "PubMed bibliographic record and abstract; exercise and education recommendations apply to assessed patellofemoral pain, not all lateral knee pain"),
  heel: source("Koc et al. (2023). Heel Pain - Plantar Fasciitis: Revision 2023", "https://www.orthopt.org/uploads/content_files/files/koc_et_al_2023_heel_pain_plantar_fasciitis_revision_2023.pdf", "Final AOPT/JOSPT PDF downloaded and text read: CPG4 scope, CPG7 diagnosis/differential, CPG9–10 manual-therapy evidence and reference 47 on CPG28; summarized trials not independently read"),
  lowBackGuidance: source("NICE NG59. Low back pain and sciatica in over 16s: assessment and management", "https://www.nice.org.uk/guidance/ng59/chapter/Recommendations", "Official indexed recommendation text 1.1.1, 1.2.1, 1.2.2 and 1.2.7; direct page returned 403; manual therapy only within a package including exercise"),
  safety: source("NCCIH. Massage Therapy: What You Need To Know", "https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know", "Public guidance, risks and tips sections; rare nerve injury, clot and fracture reports; do not delay medical assessment"),
  nerveInjury: source("Chang et al. (2015). Massage-induced brachial plexus injury", "https://pubmed.ncbi.nlm.nih.gov/25212519/", "PubMed bibliographic record and abstract; a case report demonstrates possibility, not incidence"),
  psoasAnatomy: source("StatPearls. Anatomy, Bony Pelvis and Lower Limb: Psoas Major", "https://www.ncbi.nlm.nih.gov/books/NBK535418/", "Official indexed Structure/Function and Fascial Relationship passages on lumbo-pelvic and inguinal relations, nerves/vessels; direct page challenged; no point-location measurements or diagnostic accuracy inferred"),
  chest: source("NHS. Chest pain", "https://www.nhs.uk/symptoms/chest-pain/", "Public guidance: immediate action and medical assessment advice"),
  dvt: source("NHS. DVT (deep vein thrombosis)", "https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/", "Public guidance: leg pain/swelling needs urgent assessment; chest pain or breathlessness with DVT symptoms needs emergency help"),
  openstaxGirdle: source("OpenStax Anatomy and Physiology 2e, §11.5 Muscles of the Pectoral Girdle and Upper Limbs", "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs", "Text on anterior/posterior girdle muscles, rotator cuff and infraspinatus position; Figure 11.22 caption", "2026-10-22"),
  openstaxAbdomen: source("OpenStax Anatomy and Physiology 2e, §11.4 Axial Muscles of the Abdominal Wall and Thorax", "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax", "Sentence on the posterior abdominal wall (psoas major, iliacus, quadratus lumborum)", "2026-10-22"),
  openstaxLowerLimb: source("OpenStax Anatomy and Physiology 2e, §11.6 Appendicular Muscles of the Pelvic Girdle and Lower Limbs", "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs", "Text on gluteal layers, deep lateral rotators, TFL, vastus lateralis and calf layers", "2026-10-22"),
  shoulderSafety: source("NHS. Shoulder pain", "https://www.nhs.uk/symptoms/shoulder-pain/", "Public guidance: self-care principles and non-urgent/urgent assessment sections; no muscle-specific protocol inferred"),
  kneeSafety: source("NHS. Knee pain", "https://www.nhs.uk/symptoms/knee-pain/", "Public guidance: urgent assessment for inability to bear weight, severe swelling, locking and hot/red knee with fever"),
  backSafety: source("NHS. Back pain", "https://www.nhs.uk/conditions/back-pain/", "Public guidance, full page re-read 2026-10-23: non-urgent list (weight loss without trying, pain not improving after rest or worse at night, lump or change in back shape), urgent list (feeling hot, cold, shivery or generally unwell; severe sudden or fast-worsening pain) and emergency list, including bladder/bowel change and saddle sensory loss; no cancer-history or immunosuppression item", "2026-10-23"),
  abdominalSafety: source("NHS. Stomach ache", "https://www.nhs.uk/symptoms/stomach-ache/", "Public guidance: urgent symptoms and emergency care for sudden/severe abdominal pain; no psoas diagnosis inferred"),
  headacheSafety: source("NHS. Headaches", "https://www.nhs.uk/symptoms/headaches/", "Public guidance: urgent headache with jaw pain when eating/tender scalp; emergency sudden extremely painful headache or neurological signs"),
  heelSafety: source("NHS 111 Wales. Foot pain: Heel pain", "https://111.wales.nhs.uk/encyclopaedia/f/article/footpain/", "Official indexed heel-pain section: urgent assessment after injury, inability to walk, deformity or a snap/pop; no calf trigger attribution"),
  caudaEquina: source("North Bristol NHS Trust. Same Day Emergency Clinic: Cauda Equina Syndrome", "https://www.nbt.nhs.uk/our-services/a-z-services/neurosurgery/neurosurgery-patient-information/same-day-emergency-clinic-sdec-cauda-equina-syndrome-sec", "Official indexed patient-guidance symptom list: new saddle sensory or bladder/bowel changes including urinary retention; direct page returned 503"),
  finucane: source("Finucane et al. (2020). International Framework for Red Flags for Potential Serious Spinal Pathologies. JOSPT 50(7):350-372", "https://pubmed.ncbi.nlm.nih.gov/32438853/", "Europe PMC indexed record and abstract/synopsis only: purpose of the IFOMPT framework, rarity and severity of serious spinal pathology, absence of high-quality diagnostic-accuracy evidence for most red flags, clinical-reasoning pathway. JOSPT full text returned a bot-verification page (not bypassed) and Europe PMC has no open-access copy; the framework's red-flag tables were not read and are not used", "2026-10-23"),
  downie: source("Downie et al. (2013). Red flags to screen for malignancy and fracture in patients with low back pain: systematic review. BMJ 347:f7095", "https://pmc.ncbi.nlm.nih.gov/articles/PMC3898572/", "Full text read via Europe PMC (open access): abstract, results and discussion on post-test probability of red flags for spinal malignancy; history of malignancy had the highest probability (33% emergency setting, 7% primary care) while unexplained weight loss alone was below 3%. Low back pain studies; no screening rule for this app", "2026-10-23"),
  spinalInfection: source("Yusuf, Finucane & Selfe (2019). Red flags for the early detection of spinal infection in back pain patients. BMC Musculoskelet Disord 20:606", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6911279/", "Full text read via Europe PMC (open access, CC BY-NC 4.0): abstract, results and discussion on determinants and clinical features of spinal infection (spinal pain, fever, neurological dysfunction; immunosuppression-related conditions, corticosteroid use). Descriptive review that could not assess diagnostic accuracy; clinical features alone should not be relied on", "2026-10-23"),
};

const S = TRIGGER_EVIDENCE_SOURCES;
const mapLimit = "Vùng chọn triệu chứng chỉ dùng điều hướng. Tọa độ trigger point và hình đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí; hình giải phẫu có nguồn không xác định cơ gây đau.";
const clinicalLimit = "Đối chiếu nguồn chỉ hỗ trợ các nhận định trong phạm vi đã ghi; không xác nhận chẩn đoán cá nhân hoặc hiệu quả của trình tự bốn mục. Các ví dụ vận động/tự chăm sóc do ứng dụng biên soạn, cần chọn theo khả năng và triệu chứng.";
const commonSources = [S.consensus, S.palpation, S.rolling, S.rollingMechanisms, S.safety];
function record(sources: TriggerEvidenceSource[], supportedClaims: string[], limitations: string[]): TriggerEvidenceRecord {
  return { sources: [...commonSources, ...sources], supportedClaims, limitations: [mapLimit, ...limitations, clinicalLimit], reviewedBy: null, status: "limited" };
}

export const TRIGGER_POINT_EVIDENCE: Record<TriggerPointMuscleId, TriggerEvidenceRecord> = {
  upper_trapezius: record([S.neck, S.biochemistry, S.history, S.openstaxGirdle, S.nerveInjury, S.chest, S.shoulderSafety, S.headacheSafety], [
    "[neck] Nghiên cứu nhỏ ghi nhận điểm nhạy và đau lan ở cơ cổ, gồm thang trên; đây là liên hệ với đau cổ, không chứng minh cơ này gây mọi đau đầu.",
    "[openstaxGirdle] Trapezius thuộc nhóm cơ sau đai vai.",
    "[biochemistry] Nghiên cứu chín người tìm thấy khác biệt môi trường hóa học theo nhóm; không xác nhận chuỗi thiếu ATP hoặc cơ bị khóa ngắn ở một người.",
    "[safety, nerveInjury] Tránh tự ấn sâu cổ và vùng quanh đòn là lựa chọn thận trọng của ứng dụng; đã có báo cáo tổn thương thần kinh sau massage cổ.",
  ], ["Không có bằng chứng trong nguồn đã đọc cho hình dấu hỏi cố định, nhãn locked-short, ngưỡng đau 5–6/10 an toàn chung hoặc cấm nâng vai khi đẩy trên đầu."]),
  levator_scapulae: record([S.neck, S.shoulder, S.openstaxGirdle, S.nerveInjury, S.shoulderSafety], [
    "[neck] Levator được khảo sát cùng cơ cổ khác; khác biệt phân bố điểm giữa hai nhóm không có ý nghĩa cho cả hai levator trong nghiên cứu 20/20 người.",
    "[shoulder] Nghiên cứu vai 12/10 người cũng khảo sát levator; đây là khảo sát điểm đau, không xác nhận bản đồ vùng lan trong app.",
    "[consensus, palpation] Đau góc bả hoặc đau khi sờ không đủ xác nhận cơ nâng vai là nguồn đau.",
  ], ["Không suy từ tư thế sang co cứng, ức chế serratus hoặc bệnh đĩa đệm; chưa có nguồn ánh xạ từng vị trí đau lan đặc hiệu trong app."]),
  infraspinatus: record([S.shoulder, S.shoulderTreatment, S.openstaxGirdle, S.chest, S.shoulderSafety], [
    "[shoulder] Nghiên cứu 12/10 người có khảo sát infraspinatus và ghi nhận điểm đau hoạt động ở một số người đau vai; không chứng minh một nguyên nhân duy nhất.",
    "[openstaxGirdle] Infraspinatus nằm dưới gai bả vai; infraspinatus và teres minor thuộc nhóm cơ chóp xoay.",
    "[shoulderTreatment] Điều trị tổng hợp trong 12 tuần có cải thiện so với nhóm chứng chờ điều trị; không tách được hiệu quả của bóng tự lăn hoặc của từng bước.",
  ], ["Nguồn shoulder không khảo sát teres minor. Không xác nhận bản đồ đau tới ngón tay, góc khuỷu chuẩn cho mọi người hoặc chuỗi pec co ngắn làm chỏm trượt trước."]),
  pec_minor: record([S.pectoralLength, S.shoulder, S.openstaxGirdle, S.nerveInjury, S.chest, S.shoulderSafety], [
    "[pectoralLength] Chiều dài nghỉ pec minor có liên hệ với khác biệt vận động bả vai ở người không đau.",
    "[shoulder] Nghiên cứu vai 12/10 người khảo sát pectoralis major, không khảo sát pectoralis minor.",
    "[openstaxGirdle] Pec minor thuộc nhóm cơ trước đai vai; hình 11.22 phải cắt pec major mới thấy các cơ sâu hơn.",
    "[safety, nerveInjury] App không cung cấp thao tác ấn dưới mỏm quạ, luồn ngón dưới pec major hoặc gây tê tay; đây là giới hạn thận trọng, không phải phác đồ nghiên cứu.",
  ], ["Nghiên cứu pec minor ở người không đau không xác nhận trigger point, TOS, nguyên nhân đau, hay hiệu quả release. Không diễn giải tê ngón 4–5 là đau cơ lành tính."]),
  lats_serratus: record([S.openstaxGirdle, S.chest, S.shoulderSafety], [
    "[rolling, rollingMechanisms] Bằng chứng lăn cơ nói chung cho lợi ích vận động/nghỉ hồi ngắn hạn; không xác nhận bản đồ riêng của latissimus hoặc serratus.",
    "[chest] Đau ngực/sườn kèm khó thở cần đánh giá cấp cứu theo dấu hiệu, trước khi thử massage.",
    "[openstaxGirdle] Latissimus dorsi ở phần dưới lưng; serratus anterior thuộc nhóm cơ trước đai vai. Hai cơ khác vị trí, không gộp thành một vùng.",
  ], ["Nguồn Hidalgo trước đây không khảo sát latissimus hoặc serratus nên đã loại khỏi bản ghi này. Chưa xác minh được bản đồ đau riêng hoặc cơ chế winging do trigger point."]),
  quadratus_lumborum: record([S.lowBack, S.lowBackPalpation, S.openstaxAbdomen, S.lowBackGuidance, S.caudaEquina, S.backSafety], [
    "[lowBack] QL là một trong các cơ có điểm đau hoạt động thường gặp trong mẫu LBP 42 người; nghiên cứu cắt ngang không xếp QL là nguyên nhân lớn nhất.",
    "[lowBackGuidance] Tư vấn hoạt động và chọn vận động theo khả năng; can thiệp mô mềm nếu dùng thuộc gói có vận động.",
    "[openstaxAbdomen] QL góp phần tạo thành bụng sau cùng psoas major và iliacus.",
  ], ["Hip hike không là dấu hiệu chẩn đoán QL hoặc glute med yếu. Tổng quan cho thấy độ tin cậy sờ mô mềm không nhất quán; không hướng dẫn ấn sâu vùng hông lưng."]),
  iliopsoas: record([S.lowBack, S.lowBackPalpation, S.psoasAnatomy, S.openstaxAbdomen, S.lowBackGuidance, S.caudaEquina, S.backSafety, S.abdominalSafety], [
    "[lowBack, openstaxAbdomen] Nghiên cứu LBP khảo sát psoas, không khảo sát iliacus; cả hai cơ góp phần tạo thành bụng sau.",
    "[lowBack] Psoas có trong danh sách cơ khảo sát; kết quả này không xác nhận psoas là nguồn đau ở một người hoặc chứng minh release bụng có ích.",
    "[psoasAnatomy] Psoas sâu, liên quan tạng, mạch và đám rối thắt lưng; app bỏ hướng dẫn ấn bụng/bẹn và không coi cảm giác mạch đập là mốc.",
  ], ["Không suy từ ngồi lâu sang iliopsoas co ngắn hoặc glute max bị ức chế. Không có dữ liệu đã đọc hỗ trợ cửa sổ kích hoạt 5 phút. Không dùng tọa độ cạnh rốn để tìm cơ sâu."]),
  glute_med_piriformis: record([S.lowBack, S.lowBackPalpation, S.openstaxLowerLimb, S.piriformis, S.deepGluteal, S.slrAccuracy, S.neuropathicClassification, S.caudaEquina, S.backSafety], [
    "[lowBack] Glute med/min và piriformis có trong nghiên cứu LBP; liên hệ điểm đau không là bằng chứng mọi đau lan chân do cơ.",
    "[openstaxLowerLimb] Glute med nằm dưới glute max, glute min dưới glute med; piriformis thuộc nhóm xoay ngoài dưới glute max.",
    "[piriformis, deepGluteal] Hội chứng mông sâu gồm nguyên nhân chèn ép thần kinh; cần phân biệt với bệnh cột sống và bệnh háng bằng đánh giá lâm sàng.",
    "[slrAccuracy, neuropathicClassification] SLR đơn lẻ có độ giá trị hạn chế; đau ngoài vùng khoanh da kinh điển vẫn có thể phù hợp đau do rễ. SLR âm tính hoặc vùng đau không theo sơ đồ không tự loại nguyên nhân thần kinh.",
  ], ["MRI cột sống bình thường không xác nhận trigger point. SLR âm tính, đau không theo khoanh hoặc đau khi ấn đều không tự loại được bệnh rễ. Không ngồi đè bóng để tìm piriformis sâu."]),
  tfl_vastus_lateralis: record([S.knee, S.openstaxLowerLimb, S.kneeSafety], [
    "[knee] Với đau bánh chè đã được đánh giá, giáo dục và tập gối, có thể kết hợp tập hông, là điều trị chính theo hướng dẫn 2024.",
    "[openstaxLowerLimb] TFL ở phần trên mặt ngoài đùi; vastus lateralis ở mặt ngoài đùi.",
    "[rolling, consensus] Đau khi lăn đùi không xác nhận TFL/VL là nguồn đau gối; nguồn lăn cơ không xác nhận bản đồ cơ này.",
  ], ["Hướng dẫn patellofemoral pain không áp dụng cho mọi đau ngoài gối. Chưa có nguồn đã đọc xác nhận cơ chế TFL thắng glute med, VMO trễ hoặc nút nằm cách gối 10–30 cm ở từng người."]),
  soleus_gastroc: record([S.heel, S.openstaxLowerLimb, S.dvt, S.heelSafety], [
    "[heel] Đau mặt trong gan gót ở những bước đầu sau nghỉ là đặc điểm thường gặp của plantar fasciitis; cần đánh giá cùng các dấu hiệu khác và chẩn đoán phân biệt (CPG4, CPG7).",
    "[heel] CPG9–10 tóm tắt thử nghiệm 21/21 người: trị liệu MTrP bắp chân kết hợp siêu âm và giãn có lợi ngắn hạn so với siêu âm và giãn. Không xác nhận chấm soleus trong app hoặc chứng minh đau gót có nguồn từ cơ dép.",
    "[dvt] Đau/sưng một chân cần đánh giá khẩn; kèm đau ngực/khó thở cần cấp cứu. Không cần đủ mọi dấu hiệu mới chuyển khám.",
    "[openstaxLowerLimb] Gastrocnemius là cơ nông nhất bắp chân, soleus nằm dưới gastrocnemius; tibialis anterior ở mặt ngoài xương chày.",
    "[rolling] Lăn cơ có thể giúp ROM/đau mỏi ngắn hạn; không xác nhận đau gót buổi sáng là điểm đau soleus.",
  ], ["Không dùng đau soleus khi sờ để loại plantar fasciitis, bệnh gân Achilles hoặc stress fracture. Chưa có nguồn cho quy tắc tăng chạy 10%/tuần bảo đảm an toàn hoặc bắt buộc kích hoạt tibialis anterior sau lăn."]),
};

export const TRIGGER_GENERAL_EVIDENCE: TriggerEvidenceRecord = {
  sources: [S.consensus, S.history, S.biochemistry, S.palpation, S.lowBackPalpation, S.rollingMechanisms, S.rolling, S.safety, S.nerveInjury, S.lowBackGuidance, S.chest, S.dvt, S.caudaEquina, S.shoulderSafety, S.kneeSafety, S.backSafety, S.abdominalSafety, S.headacheSafety, S.heelSafety, S.finucane, S.downie, S.spinalInfection],
  supportedClaims: [
    "[consensus] Delphi gồm 60 chuyên gia đề xuất cụm taut band, điểm nhạy và đau lan. Đồng thuận không phải nghiên cứu độ chính xác; không kỳ vọng vị trí điểm hoặc vùng lan cố định.",
    "[history, biochemistry] Giả thuyết bản vận động/thiếu năng lượng là mô hình nghiên cứu. Khác biệt hóa học trong mẫu nhỏ không xác nhận toàn bộ cơ chế hay tổn thương sờ được.",
    "[palpation, lowBackPalpation] Khả năng tái lập sờ nắn thay đổi theo dấu hiệu và cơ; độ giá trị chẩn đoán còn bất định.",
    "[rolling, rollingMechanisms] ROM và cảm giác đau mỏi có thể cải thiện ngắn hạn; cơ chế chưa rõ và chưa có liều SMR tối ưu chung. Không có cơ sở coi lăn là phá sẹo hoặc xác nhận loại bỏ nút.",
    "[safety, nerveInjury] App dùng lựa chọn bảo thủ: chỉ tự chăm sóc nhẹ nếu phù hợp, dừng khi đau/tê tăng, không dạy ấn sâu hoặc tạo twitch/jump sign.",
    "[chest, dvt, caudaEquina] Dấu hiệu cấp cứu phải được xử trí trước tự chăm sóc; bí tiểu mới xuất hiện cũng thuộc dấu hiệu cần đánh giá khẩn, không chỉ mất tự chủ.",
    "[lowBackGuidance] Với đau lưng, hướng dẫn khuyến khích hoạt động phù hợp; massage nếu cân nhắc là một phần gói có vận động.",
    "[headacheSafety, abdominalSafety] Đau đầu đột ngột cực kỳ dữ dội hoặc đau bụng đột ngột/dữ dội cần cấp cứu. Đau đầu kèm đau hàm khi nhai hoặc đau da đầu cần khám khẩn.",
    "[shoulderSafety, kneeSafety, heelSafety] Tê kéo dài, mất cảm giác hoặc tay nóng/lạnh bất thường cần khám khẩn; gối khóa, sưng nhiều hoặc mất khả năng chịu lực và đau gót sau chấn thương không đi được cần đánh giá khẩn.",
    "[backSafety, lowBackGuidance, downie, spinalInfection, finucane] Khung cảnh báo cột sống: NHS chia hai mức cho người đau lưng: nên đi khám (không khẩn) khi đau không đỡ sau khi nghỉ hoặc nặng hơn về đêm, hoặc sụt cân không chủ ý; hẹn khám khẩn hoặc gọi 111 khi cảm thấy nóng, lạnh, run rét hoặc khó chịu toàn thân (NHS; thẻ trigger giữ hai mức này); triệu chứng mới hoặc thay đổi cần nghĩ tới nguyên nhân khác như ung thư, nhiễm trùng (NICE NG59 1.1.1); tiền sử ung thư là dấu hiệu làm tăng xác suất ung thư cột sống nhiều nhất trong tổng quan, còn sụt cân đơn độc có xác suất sau xét nghiệm dưới 3% (Downie 2013); sốt và điều kiện suy giảm miễn dịch thường gặp ở nhiễm trùng cột sống, nên hạ ngưỡng nghi ngờ và tìm sớm (Yusuf 2019; NHS không có mục suy giảm miễn dịch hay tiền sử ung thư, và Yusuf không nêu mốc thời gian, nên mức “khám trong ngày” cho suy giảm miễn dịch là lựa chọn thận trọng của ứng dụng). Đây là gợi ý để suy luận lâm sàng, không là quy tắc chẩn đoán (Finucane 2020, chỉ đọc abstract).",
  ],
  limitations: [mapLimit, "Các bài tập nêu là ví dụ điều chỉnh theo dung nạp, không là gói bốn bước đã được thử nghiệm hoặc toa cho mọi người. Không có bằng chứng đã đọc cho tái lập trong 24 giờ, cửa sổ 5 phút, ngưỡng đau 5–6/10 an toàn chung hoặc phải xử lý mọi điểm nhạy không triệu chứng.", "Tài liệu Travell/Janda trước đây chưa được đọc đầy đủ ở lần rà soát này; không dùng làm bằng chứng cho bản đồ chi tiết hoặc quy tắc nguyên nhân–bù trừ. Không sao chép hình hoặc toàn văn có bản quyền.", "Các dấu hiệu cảnh báo toàn thân (đau đêm, sụt cân, tiền sử ung thư, sốt, suy giảm miễn dịch) lấy từ nguồn về đau lưng/cột sống; độ chính xác chẩn đoán của từng dấu hiệu riêng lẻ còn hạn chế. Toàn văn khung Finucane 2020 chưa được đọc (chỉ abstract), nên bảng dấu hiệu chi tiết của khung này không được dùng; việc áp dụng tương tự cho vùng khác là lựa chọn thận trọng của ứng dụng.", clinicalLimit],
  reviewedBy: null,
  status: "limited",
};
