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

const source = (title: string, url: string, access: string): TriggerEvidenceSource => ({
  title, url, checkedAt: "2026-10-19", access,
});

// Access scope describes what was actually read, not what a linked site may offer.
export const TRIGGER_EVIDENCE_SOURCES = {
  consensus: source("Fernández-de-las-Peñas & Dommerholt (2018). International Consensus on Diagnostic Criteria and Clinical Considerations of Myofascial Trigger Points: A Delphi Study", "https://pubmed.ncbi.nlm.nih.gov/29025044/", "PubMed bibliographic record and abstract; expert consensus, not a diagnostic accuracy study"),
  history: source("Shah et al. (2015). Myofascial Trigger Points Then and Now: A Historical and Scientific Perspective", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4508225/", "PMC introduction, role of MTrPs and conclusion; narrative review; no protected figures reused"),
  biochemistry: source("Shah et al. (2008). Biochemicals associated with pain and inflammation are elevated in sites near to and remote from active myofascial trigger points", "https://pubmed.ncbi.nlm.nih.gov/18164325/", "PubMed bibliographic record and abstract; nine volunteers, observational microdialysis study"),
  palpation: source("Myburgh et al. (2008). A systematic, critical review of manual palpation for identifying myofascial trigger points: evidence and clinical significance", "https://pubmed.ncbi.nlm.nih.gov/18503816/", "PubMed bibliographic record and abstract; reproducibility review"),
  lowBackPalpation: source("Nolet et al. (2021). Reliability and validity of manual palpation for the assessment of patients with low back pain: a systematic and critical review", "https://pubmed.ncbi.nlm.nih.gov/34446040/", "PubMed bibliographic record and abstract; full PMC page unavailable at check"),
  rollingMechanisms: source("Behm & Wilke (2019). Do Self-Myofascial Release Devices Release Myofascia? Rolling Mechanisms: A Narrative Review", "https://pubmed.ncbi.nlm.nih.gov/31256353/", "PubMed bibliographic record and abstract; mechanisms proposed, not proven for an individual pain site"),
  rolling: source("Cheatham et al. (2015). The Effects of Self-Myofascial Release Using a Foam Roll or Roller Massager on Joint Range of Motion, Muscle Recovery, and Performance: A Systematic Review", "https://pubmed.ncbi.nlm.nih.gov/26618062/", "PubMed bibliographic record and complete abstract; 14 included articles; full PMC page unavailable at check"),
  neck: source("Fernández-de-las-Peñas et al. (2007). Myofascial trigger points in subjects presenting with mechanical neck pain: a blinded, controlled study", "https://pubmed.ncbi.nlm.nih.gov/21882489/", "PubMed bibliographic record and abstract; 20 patients and 20 controls"),
  shoulder: source("Hidalgo-Lozano et al. (2010). Muscle trigger points and pressure pain hyperalgesia in the shoulder muscles in patients with unilateral shoulder impingement: a blinded, controlled study", "https://pubmed.ncbi.nlm.nih.gov/20186400/", "PubMed bibliographic record and abstract; 12 patients and 10 controls; Experimental Brain Research"),
  shoulderTreatment: source("Bron et al. (2011). Treatment of myofascial trigger points in patients with chronic shoulder pain: a randomized, controlled trial", "https://pubmed.ncbi.nlm.nih.gov/21261971/", "PubMed bibliographic record and abstract; comprehensive 12-week treatment; full PMC page unavailable at check"),
  pectoralLength: source("Borstad & Ludewig (2005). The effect of long versus short pectoralis minor resting length on scapular kinematics in healthy individuals", "https://pubmed.ncbi.nlm.nih.gov/15901124/", "PubMed bibliographic record and abstract; comparison of 50 volunteers without shoulder pain"),
  lowBack: source("Iglesias-González et al. (2013). Myofascial trigger points, pain, disability, and sleep quality in patients with chronic nonspecific low back pain", "https://pubmed.ncbi.nlm.nih.gov/23947760/", "PubMed bibliographic record and complete abstract; cross-sectional, 42 patients and 42 controls"),
  piriformis: source("Hopayian et al. (2010). The clinical features of the piriformis syndrome: a systematic review", "https://pubmed.ncbi.nlm.nih.gov/20596735/", "PubMed bibliographic record and abstract; mostly case reports/series, uncertain diagnostic accuracy"),
  deepGluteal: source("Martin, Reddy & Gómez-Hoyos (2015). Deep gluteal syndrome", "https://pubmed.ncbi.nlm.nih.gov/27011826/", "PubMed bibliographic record and abstract; clinical review of sciatic nerve entrapment, not a trigger-point validation study"),
  knee: source("Neal et al. (2024). Best practice guide for patellofemoral pain based on synthesis of a systematic review, the patient voice and expert clinical reasoning", "https://pubmed.ncbi.nlm.nih.gov/39401870/", "PubMed bibliographic record and abstract; exercise and education recommendations apply to assessed patellofemoral pain, not all lateral knee pain"),
  heel: source("Koc et al. (2023). Heel Pain - Plantar Fasciitis: Revision 2023", "https://pubmed.ncbi.nlm.nih.gov/38037331/", "Bibliographic record and scope abstract only; no detailed treatment recommendation inferred"),
  lowBackGuidance: source("NICE NG59. Low back pain and sciatica in over 16s: assessment and management", "https://www.nice.org.uk/guidance/ng59/chapter/Recommendations", "Recommendations 1.1.1, 1.2.1, 1.2.2 and 1.2.7; manual therapy only within a package including exercise"),
  safety: source("NCCIH. Massage Therapy: What You Need To Know", "https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know", "Public guidance, risks and tips sections; rare nerve injury, clot and fracture reports; do not delay medical assessment"),
  nerveInjury: source("Chang et al. (2015). Massage-induced brachial plexus injury", "https://pubmed.ncbi.nlm.nih.gov/25212519/", "PubMed bibliographic record and abstract; a case report demonstrates possibility, not incidence"),
  psoasAnatomy: source("StatPearls. Anatomy, Bony Pelvis and Lower Limb: Psoas Major", "https://www.ncbi.nlm.nih.gov/books/NBK535418/", "Structure and function: lumbo-pelvic and inguinal relations; nerves and vessels; no point-location measurements inferred"),
  chest: source("NHS. Chest pain", "https://www.nhs.uk/symptoms/chest-pain/", "Public guidance: immediate action and medical assessment advice"),
  dvt: source("NHS Wales. DVT (deep vein thrombosis)", "https://111.wales.nhs.uk/encyclopaedia/d/article/dvt%28deepveinthrombosis%29", "Public guidance: leg pain/swelling needs urgent assessment; chest pain or breathlessness with DVT symptoms needs emergency help"),
  caudaEquina: source("North Bristol NHS Trust. Same Day Emergency Clinic: Cauda Equina Syndrome", "https://www.nbt.nhs.uk/our-services/a-z-services/neurosurgery/neurosurgery-patient-information/same-day-emergency-clinic-sdec-cauda-equina-syndrome-sec", "Patient guidance: new saddle sensory or bladder/bowel changes, including retention, require urgent investigation"),
};

const S = TRIGGER_EVIDENCE_SOURCES;
const mapLimit = "Các chấm và vùng tô là sơ đồ giáo dục chưa được đối chiếu với từng vị trí thực nghiệm hoặc người bệnh; không là tọa độ ấn, vùng chẩn đoán hay bản đồ đã được chuyên gia xác nhận.";
const clinicalLimit = "Đối chiếu tài liệu không phải thẩm định lâm sàng. Chưa có người có chuyên môn độc lập duyệt nội dung và ánh xạ không gian; reviewedBy vẫn null.";
const commonSources = [S.consensus, S.palpation, S.rolling, S.rollingMechanisms, S.safety];
function record(sources: TriggerEvidenceSource[], supportedClaims: string[], limitations: string[]): TriggerEvidenceRecord {
  return { sources: [...commonSources, ...sources], supportedClaims, limitations: [mapLimit, ...limitations, clinicalLimit], reviewedBy: null, status: "limited" };
}

export const TRIGGER_POINT_EVIDENCE: Record<TriggerPointMuscleId, TriggerEvidenceRecord> = {
  upper_trapezius: record([S.neck, S.biochemistry, S.nerveInjury, S.chest], [
    "[neck] Nghiên cứu nhỏ ghi nhận điểm nhạy và đau lan ở cơ cổ, gồm thang trên; đây là liên hệ với đau cổ, không chứng minh cơ này gây mọi đau đầu.",
    "[biochemistry] Nghiên cứu chín người tìm thấy khác biệt môi trường hóa học theo nhóm; không xác nhận chuỗi thiếu ATP hoặc cơ bị khóa ngắn ở một người.",
    "[safety, nerveInjury] Tránh tự ấn sâu cổ và vùng quanh đòn là lựa chọn thận trọng của ứng dụng; đã có báo cáo tổn thương thần kinh sau massage cổ.",
  ], ["Không có bằng chứng trong nguồn đã đọc cho hình dấu hỏi cố định, nhãn locked-short, ngưỡng đau 5–6/10 an toàn chung hoặc cấm nâng vai khi đẩy trên đầu."]),
  levator_scapulae: record([S.neck, S.nerveInjury], [
    "[neck] Levator được khảo sát cùng cơ cổ khác; khác biệt phân bố điểm giữa hai nhóm không có ý nghĩa cho cả hai levator trong nghiên cứu 20/20 người.",
    "[consensus, palpation] Đau góc bả hoặc đau khi sờ không đủ xác nhận cơ nâng vai là nguồn đau.",
  ], ["Không suy từ tư thế sang co cứng, ức chế serratus hoặc bệnh đĩa đệm; không có bản đồ vùng lan đặc hiệu đã được thẩm định trong app."]),
  infraspinatus: record([S.shoulder, S.shoulderTreatment, S.chest], [
    "[shoulder] Nghiên cứu 12/10 người có khảo sát infraspinatus và ghi nhận điểm đau hoạt động ở một số người đau vai; không chứng minh một nguyên nhân duy nhất.",
    "[shoulderTreatment] Điều trị tổng hợp trong 12 tuần có cải thiện so với nhóm chứng; không tách được hiệu quả của bóng tự lăn hoặc của từng bước.",
  ], ["Nguồn shoulder không khảo sát teres minor. Không xác nhận bản đồ đau tới ngón tay, góc khuỷu chuẩn cho mọi người hoặc chuỗi pec co ngắn làm chỏm trượt trước."]),
  pec_minor: record([S.pectoralLength, S.nerveInjury, S.chest], [
    "[pectoralLength] Chiều dài nghỉ pec minor có liên hệ với khác biệt vận động bả vai ở người không đau.",
    "[safety, nerveInjury] App không cung cấp thao tác ấn dưới mỏm quạ, luồn ngón dưới pec major hoặc gây tê tay; đây là giới hạn thận trọng, không phải phác đồ nghiên cứu.",
  ], ["Nghiên cứu pec minor ở người không đau không xác nhận trigger point, TOS, nguyên nhân đau, hay hiệu quả release. Không diễn giải tê ngón 4–5 là đau cơ lành tính."]),
  lats_serratus: record([S.chest], [
    "[rolling, rollingMechanisms] Bằng chứng lăn cơ nói chung cho lợi ích vận động/nghỉ hồi ngắn hạn; không xác nhận bản đồ riêng của latissimus hoặc serratus.",
    "[chest] Đau ngực/sườn kèm khó thở cần đánh giá cấp cứu theo dấu hiệu, trước khi thử massage.",
  ], ["Nguồn Hidalgo trước đây không khảo sát latissimus hoặc serratus nên đã loại khỏi bản ghi này. Chưa xác minh được bản đồ đau riêng hoặc cơ chế winging do trigger point."]),
  quadratus_lumborum: record([S.lowBack, S.lowBackPalpation, S.lowBackGuidance, S.caudaEquina], [
    "[lowBack] QL là một trong các cơ có điểm đau hoạt động thường gặp trong mẫu LBP 42 người; nghiên cứu cắt ngang không xếp QL là nguyên nhân lớn nhất.",
    "[lowBackGuidance] Tư vấn hoạt động và chọn vận động theo khả năng; can thiệp mô mềm nếu dùng thuộc gói có vận động.",
  ], ["Hip hike không là dấu hiệu chẩn đoán QL hoặc glute med yếu. Tổng quan cho thấy độ tin cậy sờ mô mềm không nhất quán; không hướng dẫn ấn sâu vùng hông lưng."]),
  iliopsoas: record([S.lowBack, S.lowBackPalpation, S.psoasAnatomy, S.lowBackGuidance, S.caudaEquina], [
    "[lowBack] Psoas có trong danh sách cơ khảo sát; kết quả này không xác nhận psoas là nguồn đau ở một người hoặc chứng minh release bụng có ích.",
    "[psoasAnatomy] Psoas sâu, liên quan tạng, mạch và đám rối thắt lưng; app bỏ hướng dẫn ấn bụng/bẹn và không coi cảm giác mạch đập là mốc.",
  ], ["Không suy từ ngồi lâu sang iliopsoas co ngắn hoặc glute max bị ức chế. Không có dữ liệu đã đọc hỗ trợ cửa sổ kích hoạt 5 phút. Không dùng tọa độ cạnh rốn để tìm cơ sâu."]),
  glute_med_piriformis: record([S.lowBack, S.lowBackPalpation, S.piriformis, S.deepGluteal, S.caudaEquina], [
    "[lowBack] Glute med/min và piriformis có trong nghiên cứu LBP; liên hệ điểm đau không là bằng chứng mọi đau lan chân do cơ.",
    "[piriformis, deepGluteal] Hội chứng mông sâu gồm nguyên nhân chèn ép thần kinh; cần phân biệt với bệnh cột sống và bệnh háng bằng đánh giá lâm sàng.",
  ], ["MRI cột sống bình thường không xác nhận trigger point. SLR âm tính, đau không theo khoanh hoặc đau khi ấn đều không tự loại được bệnh rễ. Không ngồi đè bóng để tìm piriformis sâu."]),
  tfl_vastus_lateralis: record([S.knee], [
    "[knee] Với đau bánh chè đã được đánh giá, giáo dục và tập gối, có thể kết hợp tập hông, là điều trị chính theo hướng dẫn 2024.",
    "[rolling, consensus] Đau khi lăn đùi không xác nhận TFL/VL là nguồn đau gối; nguồn lăn cơ không xác nhận bản đồ cơ này.",
  ], ["Hướng dẫn patellofemoral pain không áp dụng cho mọi đau ngoài gối. Chưa có nguồn đã đọc xác nhận cơ chế TFL thắng glute med, VMO trễ hoặc nút nằm cách gối 10–30 cm ở từng người."]),
  soleus_gastroc: record([S.heel, S.dvt], [
    "[heel] Hướng dẫn 2023 dành cho đánh giá và quản lý đau gót; chỉ kiểm tra bản ghi/phạm vi, không suy ra phác đồ chi tiết.",
    "[dvt] Đau/sưng một chân cần đánh giá khẩn; kèm đau ngực/khó thở cần cấp cứu. Không cần đủ mọi dấu hiệu mới chuyển khám.",
    "[rolling] Lăn cơ có thể giúp ROM/đau mỏi ngắn hạn; không xác nhận đau gót buổi sáng là điểm đau soleus.",
  ], ["Không dùng đau soleus khi sờ để loại plantar fasciitis, bệnh gân Achilles hoặc stress fracture. Chưa có nguồn cho quy tắc tăng chạy 10%/tuần bảo đảm an toàn hoặc bắt buộc kích hoạt tibialis anterior sau lăn."]),
};

export const TRIGGER_GENERAL_EVIDENCE: TriggerEvidenceRecord = {
  sources: [S.consensus, S.history, S.biochemistry, S.palpation, S.lowBackPalpation, S.rollingMechanisms, S.rolling, S.safety, S.nerveInjury, S.lowBackGuidance, S.chest, S.dvt, S.caudaEquina],
  supportedClaims: [
    "[consensus] Delphi gồm 60 chuyên gia đề xuất cụm taut band, điểm nhạy và đau lan. Đồng thuận không phải nghiên cứu độ chính xác; không kỳ vọng vị trí điểm hoặc vùng lan cố định.",
    "[history, biochemistry] Giả thuyết bản vận động/thiếu năng lượng là mô hình nghiên cứu. Khác biệt hóa học trong mẫu nhỏ không xác nhận toàn bộ cơ chế hay tổn thương sờ được.",
    "[palpation, lowBackPalpation] Khả năng tái lập sờ nắn thay đổi theo dấu hiệu và cơ; độ giá trị chẩn đoán còn bất định.",
    "[rolling, rollingMechanisms] ROM và cảm giác đau mỏi có thể cải thiện ngắn hạn; cơ chế chưa rõ và chưa có liều SMR tối ưu chung. Không có cơ sở coi lăn là phá sẹo hoặc xác nhận loại bỏ nút.",
    "[safety, nerveInjury] App dùng lựa chọn bảo thủ: chỉ tự chăm sóc nhẹ nếu phù hợp, dừng khi đau/tê tăng, không dạy ấn sâu hoặc tạo twitch/jump sign.",
    "[chest, dvt, caudaEquina] Dấu hiệu cấp cứu phải được xử trí trước tự chăm sóc; bí tiểu mới xuất hiện cũng thuộc dấu hiệu cần đánh giá khẩn, không chỉ mất tự chủ.",
    "[lowBackGuidance] Với đau lưng, hướng dẫn khuyến khích hoạt động phù hợp; massage nếu cân nhắc là một phần gói có vận động.",
  ],
  limitations: [mapLimit, "Các bài tập nêu là ví dụ điều chỉnh theo dung nạp, không là gói bốn bước đã được thử nghiệm hoặc toa cho mọi người. Không có bằng chứng đã đọc cho tái lập trong 24 giờ, cửa sổ 5 phút, ngưỡng đau 5–6/10 an toàn chung hoặc phải xử lý mọi điểm nhạy không triệu chứng.", "Tài liệu Travell/Janda trước đây chưa được đọc đầy đủ ở lần rà soát này; không dùng làm bằng chứng cho bản đồ chi tiết hoặc quy tắc nguyên nhân–bù trừ. Không sao chép hình hoặc toàn văn có bản quyền.", clinicalLimit],
  reviewedBy: null,
  status: "limited",
};
