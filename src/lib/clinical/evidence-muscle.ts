/**
 * Source comparison completed 2026-10-19. This is not clinical validation.
 * [n] in supportedClaims refers to the 1-based sources list of that record.
 * A source supports only the named claims, not every sentence in the UI.
 */
export interface MuscleEvidenceSource {
  title: string;
  url: string;
  checkedAt: string;
  access: string;
}

export interface MuscleEvidenceRecord {
  sources: MuscleEvidenceSource[];
  supportedClaims: string[];
  limitations: string[];
  reviewedBy: null;
  status: "literature-reviewed" | "limited";
}

const checkedAt = "2026-10-19";
const source = (title: string, url: string, access: string): MuscleEvidenceSource =>
  ({ title, url, checkedAt, access });

/** Access notes describe what was actually read, including restricted access. */
export const MUSCLE_EVIDENCE_SOURCES = {
  upper: source(
    "OpenStax Anatomy and Physiology 2e — 11.5 Muscles of the Pectoral Girdle and Upper Limbs",
    "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs",
    "Public section text, Tables 11.8 and figure/table descriptions read. Gross muscle actions and relationships only; no exercise trial or image-license audit.",
  ),
  lower: source(
    "OpenStax Anatomy and Physiology 2e — 11.6 Appendicular Muscles of the Pelvic Girdle and Lower Limbs",
    "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs",
    "Public section text and lower-leg figure/table descriptions read. Used for lower-leg organization and actions; some gluteal figure alt text is inconsistent with university tables and is not adopted.",
  ),
  abdomen: source(
    "OpenStax Anatomy and Physiology 2e — 11.4 Axial Muscles of the Abdominal Wall, and Thorax",
    "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax",
    "Public abdominal wall text and Table 11.6 read. Gross layers, attachments and actions only; no trial of abdominal hypertrophy or prevention of back pain.",
  ),
  muscles: source(
    "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Muscles",
    "https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html",
    "Public university tables read: erector spinae, trapezius, rhomboids, teres major, biceps, brachialis, brachioradialis, deltoid and triceps rows. Summarized gross anatomy, not attachment footprints or individual fascicle measurements.",
  ),
  pectoral: source(
    "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Pectoral Region & Breast",
    "https://anatomy.ttuhscep.edu/musculoskeletal_system/pectoral_tables.html",
    "Public university muscle table read, including pectoralis major/minor and triceps. No training outcomes, individual fiber angles or shoulder pain diagnosis.",
  ),
  hip: source(
    "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Hip & Posterior Thigh & Leg",
    "https://anatomy.ttuhscep.edu/musculoskeletal_system/gluteal_tables.html",
    "Public university table rows read for gluteus maximus/medius/minimus, biceps femoris, semitendinosus, semimembranosus, gastrocnemius and soleus.",
  ),
  thigh: source(
    "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Anterior & Medial Thigh",
    "https://anatomy.ttuhscep.edu/musculoskeletal_system/thigh_tables.html",
    "Public university rows read for quadriceps, rectus femoris, three vasti, adductors and gracilis; gross attachment/action scope only.",
  ),
  deltoid: source(
    "Anatomy, Shoulder and Upper Limb, Deltoid Muscle",
    "https://www.ncbi.nlm.nih.gov/books/NBK537056/",
    "StatPearls Structure and Function section retrieved through search-indexed text; direct full chapter returned CAPTCHA. Read three parts, attachments and multipennate lateral part; no fascicle angle assigned.",
  ),
  lat: source(
    "Anatomy, Back, Latissimus Dorsi",
    "https://www.ncbi.nlm.nih.gov/books/NBK448120/",
    "StatPearls search-indexed excerpt only; direct full chapter returned CAPTCHA. Not relied on for regional exercise selectivity; university/OpenStax tables supply gross action context.",
  ),
  chaves: source(
    "Effects of Horizontal and Incline Bench Press on Neuromuscular Adaptations in Untrained Young Men",
    "https://pubmed.ncbi.nlm.nih.gov/32922646/",
    "PubMed abstract via indexed record, plus PMC indexed methods excerpt. 47 men completed 8 weeks, once weekly; thickness data available for 30. Regional ultrasound and EMG outcomes; direct full-text request returned CAPTCHA.",
  ),
  lehman: source(
    "Variations in muscle activation levels during traditional latissimus dorsi weight training exercises: An experimental study",
    "https://pubmed.ncbi.nlm.nih.gov/15228624/",
    "Abstract read on PubMed and Europe PMC MED record. Four pull/row tasks, two 10-second isometric portions per task; surface EMG, no longitudinal hypertrophy.",
  ),
  cools: source(
    "Rehabilitation of scapular muscle balance: which exercises to prescribe?",
    "https://pubmed.ncbi.nlm.nih.gov/17606671/",
    "Abstract read via Europe PMC MED record and indexed publisher text. Controlled laboratory surface-EMG study, 45 healthy subjects, 12 scapular exercises; not a trial proving postural correction or injury prevention.",
  ),
  lateralRaise: source(
    "Dumbbell versus cable lateral raises for lateral deltoid hypertrophy: an experimental study",
    "https://pubmed.ncbi.nlm.nih.gov/40692697/",
    "Abstract read via Europe PMC MED record; DOI 10.3389/fphys.2025.1611468. 24 trained participants, within-person arm allocation, 8 weeks, twice weekly, five sets to momentary failure, matched ROM, proximal/distal ultrasound. Full publisher/PMC requests failed.",
  ),
  triceps: source(
    "Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position",
    "https://pubmed.ncbi.nlm.nih.gov/35819335/",
    "PubMed abstract read via indexed record. 21 adults, within-person arm comparison, cable elbow extension 90–0 degrees, 70% 1RM, 5 sets of 10 twice weekly for 12 weeks, MRI. Online 2022; journal issue 2023. No full-text-based injury claim.",
  ),
  plotkin: source(
    "Hip thrust and back squat training elicit similar gluteus muscle hypertrophy and transfer similarly to the deadlift",
    "https://pubmed.ncbi.nlm.nih.gov/37877099/",
    "Peer-reviewed 2023 abstract read via Europe PMC MED record; DOI 10.3389/fphys.2023.1279170. 34 untrained college-aged participants, 9 weeks, set-volume equated, MRI cross-sectional areas and first-session sEMG. Uses final journal article, not earlier preprint PMID 37461495.",
  ),
  kubo: source(
    "Effects of squat training with different depths on lower limb muscle volumes",
    "https://pubmed.ncbi.nlm.nih.gov/31230110/",
    "Abstract read via Europe PMC MED record; DOI 10.1007/s00421-019-04181-y. 17 men, full versus half squat, 10 weeks twice weekly; MRI volumes. Not a hack squat, heel-elevation, RDL or split-squat comparison.",
  ),
  pedrosa: source(
    "Partial range of motion training elicits favorable improvements in muscular adaptations when carried out at long muscle lengths",
    "https://pubmed.ncbi.nlm.nih.gov/33977835/",
    "PubMed abstract read via indexed record. 45 untrained women allocated to four knee-extension ROM protocols or control; rectus femoris/vastus lateralis regional cross-sectional areas and strength. Initial ROM 100–65 degrees versus other prescribed ROMs; not a reclined-seat or reverse-Nordic trial.",
  ),
  hamstrings: source(
    "Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths",
    "https://pubmed.ncbi.nlm.nih.gov/33009197/",
    "Abstract read via Europe PMC MED record, plus indexed PMC discussion. 20 healthy adults, within-person seated versus prone leg curl, 70% 1RM, 5 sets of 10 twice weekly for 12 weeks; MRI. Separate eccentric-damage experiment; no injury-incidence or RDL comparison.",
  ),
  calf: source(
    "Triceps surae muscle hypertrophy is greater after standing versus seated calf-raise training",
    "https://pubmed.ncbi.nlm.nih.gov/38156065/",
    "Abstract read via Europe PMC MED record. 14 untrained adults, within-person legs, 12 weeks twice weekly, 70% 1RM and 5 sets of 10; knee extended versus 90-degree flexion, MRI. Soleus change similar between positions; direct full-text request returned CAPTCHA.",
  ),
  calfROM: source(
    "Greater Gastrocnemius Muscle Hypertrophy After Partial Range of Motion Training Performed at Long Muscle Lengths",
    "https://pubmed.ncbi.nlm.nih.gov/37015016/",
    "PubMed abstract read. 42 young women, 8 weeks three times weekly, horizontal pin-loaded leg-press calf raise, 3 sets of 15–20RM; ultrasound. Initial partial ROM versus full/final ROM. Lateral-head difference from full ROM was not statistically significant; not a study of mandatory two-second pauses.",
  ),
  emg: source(
    "Interpreting Signal Amplitudes in Surface Electromyography Studies in Sport and Rehabilitation Sciences",
    "https://pubmed.ncbi.nlm.nih.gov/29354060/",
    "Review abstract read via PubMed indexed record and Europe PMC MED record. Methodological scope: limits of interpreting surface EMG amplitude as force, recruitment or long-term adaptation.",
  ),
} satisfies Record<string, MuscleEvidenceSource>;

type SourceKey = keyof typeof MUSCLE_EVIDENCE_SOURCES;
const pending = "Chờ chuyên gia giải phẫu/lâm sàng đủ năng lực đánh giá nội dung và ánh xạ không gian; reviewedBy = null. Đối chiếu tài liệu không phải xác nhận lâm sàng.";
const coaching = "Các trường lengthenedExercise, shortenedExercise và ptCue là ví dụ/gợi ý thực hành, chưa được xác nhận là ưu tiên tối ưu hoặc phù hợp cho từng người. Tên trường không chứng minh cơ đang chịu mô-men lớn nhất ở vị trí dài/ngắn.";
const symptoms = "compensationFixes là khả năng cần quan sát và điều chỉnh, không phải chẩn đoán nguyên nhân đau, cơ yếu, bệnh gân hoặc chèn ép. Cảm giác mỏi không đo được mức hoạt động/phì đại.";
const record = (
  keys: SourceKey[], supportedClaims: string[], limitations: string[],
  status: MuscleEvidenceRecord["status"] = "literature-reviewed",
): MuscleEvidenceRecord => ({ sources: keys.map(key => MUSCLE_EVIDENCE_SOURCES[key]), supportedClaims, limitations: [...limitations, pending], reviewedBy: null, status });

export const MUSCLE_GROUP_EVIDENCE: Record<string, MuscleEvidenceRecord> = {
  chest: record(["pectoral", "upper", "chaves"], [
    "summary; pec-clavicular/pec-sternal/pec-costal.originInsertion: [1] phân biệt ngực lớn với ngực bé, điểm bám đại thể phần đòn và ức–sườn; [2] răng trước vận động bả vai.",
    "hypertrophyScience: [3] khác biệt độ dày tại một trong ba vị trí đo, trong giao thức đẩy ngang/dốc 8 tuần; không xác lập góc 30 độ tối ưu phổ quát.",
  ], [coaching, symptoms, "Ba vùng ngực là cách trình bày; không phải ba cơ độc lập. Chưa kiểm tra góc sợi từng cá thể hoặc nguồn ảnh/mesh."]),
  lats_teres: record(["upper", "lat", "lehman", "muscles"], [
    "summary; lat-thoracic-teres/lat-iliac-lumbar.originInsertion và phần hành động trong fiberDirection: [1,4] lưng rộng/tròn lớn là hai cơ, góp phần khép/duỗi/xoay trong vai, điểm bám đại thể; [2] chỉ dùng bổ sung ngữ cảnh cơ lưng rộng.",
    "hypertrophyScience: [3] các biến thể kéo/row tạo khác biệt điện cơ nhỏ trong phần giữ đẳng trường được đo.",
  ], [coaching, symptoms, "Không đo vùng xô trên/dưới hoặc so sánh phì đại theo tay cầm trung tính. Bản đồ vùng và các đường sợi chưa có xác nhận giải phẫu."], "limited"),
  upper_back_traps: record(["upper", "muscles", "cools"], [
    "summary; trap-middle-rhomboid/trap-lower/erector-spinae.originInsertion và chức năng: [1,2] bả vai được vận động bởi thang/trám; dựng sống là nhóm riêng, gồm ba cột.",
    "hypertrophyScience: [3] tỉ số điện cơ cơ thang ở 45 người khỏe trong bài tập bả vai; không chứng minh hiệu quả sửa gù hay phì đại khi row.",
  ], [coaching, symptoms, "Cơ dựng sống và thang trên còn chung một thẻ vì schema cũ; mô tả ghi rõ đây là hai nhóm riêng. Không có góc chèo tối ưu được xác nhận."], "limited"),
  deltoids: record(["deltoid", "upper", "lateralRaise"], [
    "summary; delt-anterior/delt-lateral/delt-posterior.originInsertion và hành động: [1] ba phần delta và cấu trúc đa lông vũ phần giữa; [2] chóp xoay gồm bốn cơ riêng.",
    "hypertrophyScience: [3] mức tăng độ dày delta giữa tương tự ở cáp/tạ đơn với ROM chuẩn hóa trong 8 tuần.",
  ], [coaching, symptoms, "[3] không khảo sát mọi vị trí cáp sau lưng hoặc chứng minh một đường nâng phòng đau vai. Không suy ra góc sợi cố định từ kiến trúc đa lông vũ."]),
  biceps_forearm: record(["muscles", "upper"], [
    "summary; biceps-long-head/biceps-short-head/brachialis-brachioradialis.originInsertion và chức năng: [1,2] các cơ gập khuỷu có điểm bám khác nhau; nhị đầu có hai đầu và góp phần ngửa cẳng tay.",
  ], [coaching, symptoms, "Không có thử nghiệm dài hạn được kiểm tra cho cấu hình Bayesian/incline/preacher cụ thể trong mục này. Vị trí vai thay đổi chiều dài nhưng không xác nhận cô lập đầu, đỉnh peak hoặc ưu thế tăng trưởng."], "limited"),
  triceps: record(["pectoral", "triceps"], [
    "summary; triceps-long/triceps-lateral-medial.originInsertion và hành động: [1] ba đầu duỗi khuỷu; chỉ đầu dài bắt nguồn ở bả vai và đi qua vai.",
    "hypertrophyScience: [2] MRI ghi nhận tăng thể tích lớn hơn với duỗi khuỷu qua đầu trong giao thức 12 tuần, gồm đầu dài và nhóm đầu ngoài–trong.",
  ], [coaching, symptoms, "[2] không bảo đảm tỉ lệ 1,5 lần cho người tập khác; không so sánh mọi dạng pushdown/JM press và không chứng minh phòng hoặc điều trị bệnh gân."]),
  abs_obliques: record(["abdomen"], [
    "summary; rectus-upper-lower/obliques-transversus.originInsertion và hướng sợi đại thể: [1] bốn cơ thành bụng, cơ thẳng bụng chạy dọc, cơ chéo theo các hướng khác nhau, cơ ngang chạy ngang; chức năng gập thân/nén ổ bụng.",
  ], [coaching, symptoms, "Không có thử nghiệm được kiểm tra ở đây xác nhận phì đại từng vùng bụng, bắt buộc cuộn cột sống, hoặc phòng ngừa đau lưng. Vai trò giữ thân trong ví dụ tập là diễn giải cơ học, không phải số đo."], "limited"),
  glutes: record(["hip", "plotkin", "kubo"], [
    "summary; glute-maximus/glute-medius-minimus.originInsertion và hành động: [1] mông lớn duỗi/xoay ngoài háng, mông nhỡ/bé góp phần dạng háng; các cơ có điểm bám khác nhau.",
    "hypertrophyScience: [2] thay đổi mông lớn tương tự sau squat/hip thrust 9 tuần; mông nhỡ–bé thay đổi ít; điện cơ ban đầu không dự báo nhất quán kết quả tăng kích thước.",
    "[3] chỉ bổ sung so sánh squat sâu/nửa squat 10 tuần; không phải bằng chứng trực tiếp cho split squat hoặc RDL.",
  ], [coaching, symptoms, "Chưa xác nhận đường sợi, phân vùng cơ hoặc ánh xạ điểm bám lên mesh. Không có góc mũi chân loại bỏ TFL được xác nhận trong các nguồn này."]),
  quads_adductors: record(["thigh", "kubo", "pedrosa"], [
    "summary; quad-vastus/quad-rectus-femoris/adductors-inner-thigh.originInsertion và chức năng: [1] bốn cơ tứ đầu, ba cơ rộng, thẳng đùi hai khớp, cơ thon bám chày và các cơ khép khác bám đùi.",
    "hypertrophyScience: [2] thể tích duỗi gối tăng nhưng thẳng đùi không thay đổi rõ sau squat; [3] biên độ duỗi gối cho đáp ứng theo vùng trong giao thức ở nữ chưa tập.",
  ], [coaching, symptoms, "[2,3] không xác nhận kê gót/hack squat tối ưu, cô lập VMO, góc ghế ngả 30 độ, hoặc bắt buộc reverse Nordic. VMO không được trình bày như đầu cơ độc lập."]),
  hamstrings: record(["hip", "hamstrings"], [
    "summary; hamstring-biarticular/hamstring-short-head.originInsertion và hành động: [1] đầu dài nhị đầu/bán gân/bán màng đi qua háng và gối; đầu ngắn bắt đầu ở đùi, chỉ đi qua gối.",
    "hypertrophyScience: [2] trong 12 tuần, leg curl ngồi tạo tăng thể tích lớn hơn ở các cơ hai khớp so với nằm sấp; đầu ngắn không khác rõ. Không khác rõ về bảo vệ trước tổn thương cơ do buổi eccentric thí nghiệm.",
  ], [coaching, symptoms, "Đầu ngắn không tạo mô-men háng trực tiếp; điều đó không có nghĩa im điện cơ trong RDL. [2] không so sánh RDL và không đo số chấn thương thực tế."]),
  calves: record(["lower", "hip", "calf", "calfROM"], [
    "summary; gastrocnemius/soleus-tibialis.originInsertion và chức năng: [1,2] bụng chân hai khớp, dép không đi qua gối, chày trước gấp mu chân; điểm bám đại thể.",
    "hypertrophyScience: [3] đứng tạo tăng thể tích bụng chân lớn hơn ngồi, cơ dép tương tự; [4] phần biên độ đầu tăng độ dày đầu trong nhiều hơn các điều kiện khác trong giao thức được đo.",
  ], [coaching, symptoms, "[4] dùng máy leg press ngang, không phải thử nghiệm bắt buộc dừng 2 giây; đầu ngoài không khác có ý nghĩa so với full ROM. Các nguồn không chứng minh ngăn bệnh gân gót, gân thay toàn bộ công cơ hoặc ngồi cô lập tuyệt đối cơ dép."]),
};

const exerciseLimits = [
  "targets[].role là phân loại vai trò định tính dựa trên chuyển động, không phải xếp hạng thực nghiệm hoặc chứng minh cơ nào mệt trước. targets[].activationPct = 0 là giá trị kế thừa cho dữ liệu chưa có; không có nghĩa hoạt động 0%. Không hiển thị hay so sánh như phần trăm.",
  "setupAndExecution/commonMistake là gợi ý có thể điều chỉnh, chưa là giao thức kê đơn được xác nhận. Chưa đo mô-men theo góc hoặc lực cơ ở cấu hình máy của người dùng; resistanceProfile để Variable.",
];
const exerciseRecord = (keys: SourceKey[], claims: string[], limits: string[], status: MuscleEvidenceRecord["status"] = "limited") =>
  record(keys, claims, [...limits, ...exerciseLimits], status);

export const EXERCISE_EVIDENCE: Record<string, MuscleEvidenceRecord> = {
  "incline-db-press": exerciseRecord(["upper", "chaves"], [
    "targets[].biomechanicalWhy: [1] cơ ngực/delta trước vận động vai, tam đầu duỗi khuỷu; vai trò trong bài đẩy là diễn giải theo hành động.",
    "[2] chỉ hỗ trợ bối cảnh đẩy ngang/dốc và đáp ứng theo vị trí đo, không xác nhận cấu hình dumbbell 30 độ hoặc chiều sâu cụ thể.",
  ], ["Không gọi 30 độ tối ưu phổ quát; chưa kiểm tra tăng trưởng theo đầu cơ ở biến thể chính xác này."]),
  "cable-chest-fly": exerciseRecord(["upper", "pectoral"], [
    "targets[].biomechanicalWhy: [1,2] khép cánh tay phù hợp chức năng ngực lớn; delta trước có thể phối hợp tùy đường tay. Đây là suy luận hành động.",
  ], ["Không có thử nghiệm cable fly ngồi cụ thể được kiểm tra. Không xác nhận lực căng không đổi, ưu thế khi tay cắt chéo hoặc cơ rãnh ngực trong độc lập."]),
  "cable-lateral-raise": exerciseRecord(["deltoid", "upper", "lateralRaise"], [
    "targets[].biomechanicalWhy: [1,2] delta góp phần dạng vai, cơ thang phối hợp bả vai.",
    "[3] so sánh dài hạn cáp/tạ đơn dưới ROM chuẩn hóa cho mức tăng độ dày tương tự; không chuyển thành ưu thế cho mọi vị trí cáp.",
  ], ["Cấu hình cáp sau lưng/độ cao cổ tay không được xác nhận là tối ưu; mô-men phụ thuộc đường cáp và cơ thể."]),
  "neutral-lat-pulldown": exerciseRecord(["upper", "muscles", "lehman"], [
    "targets[].biomechanicalWhy: [1,2] khép/duỗi vai, gập khuỷu và vận động bả vai mô tả đóng góp cơ học định tính.",
    "[3] khảo sát một số biến thể kéo/row trong các đoạn giữ đẳng trường; chỉ hỗ trợ bối cảnh khác biệt điện cơ theo bài.",
  ], ["[3] không khảo sát ưu thế phì đại của neutral grip một tay hay cô lập xô dưới."]),
  "chest-supported-tbar-row": exerciseRecord(["muscles", "upper", "lehman"], [
    "targets[].biomechanicalWhy: [1,2] thang/trám vận động bả vai; delta sau/lưng rộng đưa cánh tay ra sau; các cơ gập khuỷu là đồng vận.",
    "[3] chỉ là EMG seated row; không phải thử nghiệm chest-supported T-bar row.",
  ], ["Không xác nhận góc khuỷu tối ưu hoặc phì đại tối đa cơ thang dưới. Tựa ngực không được coi là điều trị đau cổ/lưng."]),
  "bayesian-incline-curl": exerciseRecord(["muscles", "upper"], [
    "targets[].biomechanicalWhy: [1,2] nhị đầu đi qua vai/khuỷu và góp phần gập khuỷu; cơ vai phối hợp giữ cánh tay là suy luận theo tư thế.",
  ], ["Không có thử nghiệm cấu hình chính xác được kiểm tra; hai bài không có cùng đường lực. Không xác nhận ưu tiên đầu dài hoặc đỉnh peak."]),
  "overhead-cable-triceps": exerciseRecord(["pectoral", "triceps", "abdomen"], [
    "targets[].biomechanicalWhy: [1] tam đầu duỗi khuỷu; [3] thành bụng góp phần giữ thân là diễn giải chức năng.",
    "[2] so sánh trực tiếp overhead/neutral cable elbow extension trong 12 tuần, MRI; hỗ trợ kết quả trong giao thức đã công bố.",
  ], ["Tay cầm dây thừng và vị trí ròng rọc tùy máy không phải toàn bộ cấu hình đã nghiên cứu. Không bảo đảm tỉ lệ phì đại hoặc giảm nguy cơ đau khuỷu."], "literature-reviewed"),
  "cable-rope-crunch": exerciseRecord(["abdomen"], [
    "targets[].biomechanicalWhy: [1] chức năng gập thân/nén ổ bụng và tổ chức thành bụng; giữ chậu khi treo là diễn giải theo động tác.",
  ], ["Crunch cáp và treo cuộn chậu là hai bài khác nhau. Không có so sánh phì đại, phân vùng trên/dưới hoặc điều trị đau lưng được kiểm tra ở đây."]),
  "heel-elevated-hack-squat": exerciseRecord(["thigh", "hip", "kubo"], [
    "targets[].biomechanicalWhy: [1,2] tứ đầu duỗi gối, mông lớn duỗi háng; cơ cổ chân phối hợp giữ tư thế là diễn giải cơ học.",
    "[3] chỉ so sánh full/half squat về thể tích cơ; không kiểm tra hack squat hoặc kê gót.",
  ], ["Không xác nhận độ cao gót, vị trí bàn đạp hay độ sâu tối ưu. Cơ khép không có cùng vai trò trong mọi máy/tư thế; VMO không được chứng minh cô lập."]),
  "romanian-deadlift-seated-curl": exerciseRecord(["hip", "muscles", "hamstrings"], [
    "targets[].biomechanicalWhy: [1,2] gân kheo hai khớp tham gia duỗi háng/gập gối, mông duỗi háng, dựng sống góp phần kiểm soát thân; các vai trò RDL là diễn giải hành động.",
    "[3] trực tiếp so sánh leg curl ngồi/nằm sấp, gồm khác biệt giữa cơ hai khớp và đầu ngắn; không phải nghiên cứu RDL.",
  ], ["Hai bài được giữ trong cùng entry vì ID cũ; vai trò mông/dựng sống áp dụng cho RDL. Không có phần trăm gộp có ý nghĩa cho hai bài hoặc bằng chứng RDL hoàn toàn không huy động đầu ngắn."]),
  "glute-bulgarian-split-squat": exerciseRecord(["hip", "thigh"], [
    "targets[].biomechanicalWhy: [1,2] mông và một phần cơ khép duỗi háng, tứ đầu duỗi gối; giữ chậu khi chống một chân là diễn giải cơ học.",
  ], ["Chưa kiểm tra thử nghiệm phì đại trực tiếp ở biến thể này. Không khẳng định góc thân 20–25 độ, bước dài hay kê chân bảo đảm ưu tiên mông hoặc bảo vệ gối."]),
  "barbell-hip-thrust": exerciseRecord(["hip", "thigh", "plotkin"], [
    "targets[].biomechanicalWhy: [1,2] mông lớn và gân kheo hai khớp góp phần duỗi háng; giữ góc gối là diễn giải vai trò tùy tư thế.",
    "[3] hip thrust và squat tăng kích thước mông lớn tương tự trong giao thức 9 tuần; không ghi nhận tăng đáng kể mông nhỡ–bé.",
  ], ["[3] không chứng minh hip thrust tối ưu mọi bó mông, đỉnh mô-men luôn 0–20 độ, hoặc giữ 2 giây là bắt buộc. Biến thể máy có thể khác giao thức."], "literature-reviewed"),
  "standing-seated-calf-raise": exerciseRecord(["hip", "calf", "calfROM"], [
    "targets[].biomechanicalWhy: [1] bụng chân đi qua hai khớp, cơ dép không đi qua gối.",
    "[2] so sánh trực tiếp đứng/ngồi 12 tuần: bụng chân tăng thể tích nhiều hơn khi đứng, cơ dép tương tự; [3] chỉ bổ sung nghiên cứu ROM trên leg press.",
  ], ["Không suy ra ngồi cô lập tuyệt đối cơ dép. [2,3] không thử nghiệm điều trị/phòng bệnh gân, loại bỏ năng lượng đàn hồi, hoặc bắt buộc dừng 2 giây."], "literature-reviewed"),
};

export const MUSCLE_EVIDENCE_REVIEW = {
  checkedAt,
  reviewedBy: null,
  reviewedAt: null,
  spatialMappingStatus: "pending-qualified-expert-review",
  activationData: "unmeasured; legacy activationPct zero is an unavailable sentinel",
} as const;
