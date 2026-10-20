export type MuscleGroupId =
  | "chest"
  | "lats_teres"
  | "upper_back_traps"
  | "deltoids"
  | "biceps_forearm"
  | "triceps"
  | "abs_obliques"
  | "glutes"
  | "quads_adductors"
  | "hamstrings"
  | "calves";

export interface ScientificReference {
  title: string;
  source: string;
  pmid?: string;
  url: string;
}

export interface MuscleSubdivision {
  id: string;
  name: string;
  latin: string;
  originInsertion: string;
  fiberDirection: string;
  lengthenedExercise: string;
  shortenedExercise: string;
  ptCue: string;
}

export interface CompensationFix {
  symptom: string;
  biomechanicalCause: string;
  ptCorrection: string;
}

export interface MuscleAnatomyPlate {
  src: string;
  title: string;
  credit: string;
  label: string;
  description: string;
  sourceUrl: string;
}

export interface MuscleGroupAtlas {
  id: MuscleGroupId;
  name: string;
  latinName: string;
  category: "upper_push" | "upper_pull" | "arms_core" | "lower_body";
  views: ("anterior" | "posterior")[];
  summary: string;
  hypertrophyScience: string;
  plateSrc: string;
  plateTitle: string;
  plateCredit: string;
  plateLabel?: string;
  plateDescription?: string;
  plateSourceUrl?: string;
  additionalPlates?: MuscleAnatomyPlate[];
  references: ScientificReference[];
  subdivisions: MuscleSubdivision[];
  compensationFixes: CompensationFix[];
  sampleAiPrompt: string;
}

export interface ExerciseMuscleTarget {
  muscleId: MuscleGroupId;
  role: "primary" | "synergist" | "stabilizer";
  /** @deprecated Unmeasured legacy field. 0 means unavailable, never 0% activation. Use role only. */
  activationPct: number;
  targetedHeads: string;
  biomechanicalWhy: string;
}

export interface HypertrophyExercise {
  id: string;
  name: string;
  vietnameseName: string;
  pattern: "Push" | "Pull" | "Legs & Glutes" | "Arms & Core";
  equipment: string;
  resistanceProfile:
    | "Lengthened-Biased (Đầu biên độ giãn)"
    | "Mid-Range (Giữa biên độ)"
    | "Shortened-Biased (Đỉnh co rút)"
    | "Variable (Phụ thuộc thiết lập)";
  setupAndExecution: string;
  commonMistake: string;
  targets: ExerciseMuscleTarget[];
}

/** Educational source comparison; every item still awaits qualified expert review.
 * Claim scope and source access dates: evidence-muscle.ts.
 * Exercise examples/cues are coaching options, not validated prescriptions.
 * Legacy lengthened/shortened field names do not establish a measured resistance profile.
 */
export const MUSCLE_GROUP_ATLAS: MuscleGroupAtlas[] = [
  {
    "id": "chest",
    "name": "Cơ Ngực Lớn & Cơ Răng Trước",
    "latinName": "M. Pectoralis major & M. Serratus anterior",
    "category": "upper_push",
    "views": [
      "anterior"
    ],
    "summary": "Cơ ngực lớn có phần đòn và phần ức–sườn; các sợi dưới có thể được mô tả riêng. Cơ răng trước vận động bả vai; cơ ngực bé là một cơ riêng, không phải bó ngực dưới.",
    "hypertrophyScience": "Chaves et al. so sánh đẩy ngang và đẩy dốc trong 8 tuần ở nam trẻ chưa tập: khác biệt độ dày chỉ xuất hiện tại một vị trí đo. Nghiên cứu không xác lập 30° là góc tối ưu cho mọi người hoặc mọi vùng ngực.",
    "plateSrc": "/anatomy/chest-lats-humerus-openstax.jpg",
    "plateTitle": "OpenStax — Giải phẫu Cơ Ngực Lớn, Cơ Delta, Cơ Răng Trước & Lớp Sâu Khớp Vai",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Pectoral Region & Breast",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/musculoskeletal_system/pectoral_tables.html"
      },
      {
        "title": "OpenStax Anatomy and Physiology 2e — 11.5 Muscles of the Pectoral Girdle and Upper Limbs",
        "source": "OpenStax / Rice University",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs"
      },
      {
        "title": "Effects of Horizontal and Incline Bench Press on Neuromuscular Adaptations in Untrained Young Men",
        "source": "Chaves et al. (2020), International Journal of Exercise Science",
        "pmid": "32922646",
        "url": "https://pubmed.ncbi.nlm.nih.gov/32922646/"
      }
    ],
    "subdivisions": [
      {
        "id": "pec-clavicular",
        "name": "Phần Đòn — Cơ Ngực Lớn",
        "latin": "Pectoralis major, pars clavicularis",
        "originInsertion": "Mặt trước nửa trong xương đòn → mào củ lớn xương cánh tay.",
        "fiberDirection": "Góp phần gập và khép cánh tay; không có góc sợi đo riêng cho mô hình.",
        "lengthenedExercise": "Đẩy tạ đơn ghế dốc nhẹ, biên độ phù hợp.",
        "shortenedExercise": "Ép cáp từ thấp lên trước ngực, tùy vị trí ròng rọc.",
        "ptCue": "Gợi ý: khép cánh tay có kiểm soát; chỉnh ghế theo sự thoải mái."
      },
      {
        "id": "pec-sternal",
        "name": "Phần Ức–Sườn — Cơ Ngực Lớn",
        "latin": "Pectoralis major, pars sternocostalis",
        "originInsertion": "Xương ức và các sụn sườn → mào củ lớn xương cánh tay.",
        "fiberDirection": "Góp phần khép và xoay trong cánh tay; không có góc sợi đo riêng cho mô hình.",
        "lengthenedExercise": "Đẩy ngực ngang bằng tạ đơn.",
        "shortenedExercise": "Pec deck hoặc cable fly, tùy máy.",
        "ptCue": "Gợi ý: giữ đường đẩy kiểm soát được, không ép độ sâu."
      },
      {
        "id": "pec-costal",
        "name": "Vùng Sợi Dưới — Cơ Ngực Lớn",
        "latin": "Pectoralis major, inferior sternocostal/abdominal fibers",
        "originInsertion": "Phần dưới vùng ức–sườn và cân thành bụng → mào củ lớn xương cánh tay.",
        "fiberDirection": "Là mô tả vùng của cơ ngực lớn; cơ ngực bé bám vào mỏm quạ là cơ riêng.",
        "lengthenedExercise": "Dip có hỗ trợ nếu vai dung nạp.",
        "shortenedExercise": "Ép cáp từ cao xuống, tùy cấu hình.",
        "ptCue": "Gợi ý: chọn biên độ vai thoải mái; không ép tay bắt chéo sâu."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Mỏi hoặc khó chịu vùng vai khi đẩy ngực",
        "biomechanicalCause": "Nhiều yếu tố có thể góp phần, gồm tải, biên độ, đường đẩy và tình trạng vai; cảm giác mỏi không xác định cơ đang nhận tải nhiều nhất.",
        "ptCorrection": "Thử giảm tải, chọn tay cầm và biên độ thoải mái; đau kéo dài cần được đánh giá."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Ngực Lớn & Cơ Răng Trước, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "lats_teres",
    "name": "Cơ Lưng Rộng & Cơ Tròn Lớn",
    "latinName": "M. Latissimus dorsi & M. Teres major",
    "category": "upper_pull",
    "views": [
      "posterior",
      "anterior"
    ],
    "summary": "Cơ lưng rộng và cơ tròn lớn góp phần duỗi, khép và xoay trong cánh tay. Cơ tròn lớn bắt nguồn từ xương bả vai và là cơ riêng.",
    "hypertrophyScience": "Lehman et al. khảo sát điện cơ khi kéo xô và chèo. Điện cơ mô tả đáp ứng trong điều kiện đo; không xác nhận tay cầm trung tính cô lập xô dưới hoặc một biến thể tạo phì đại tối đa.",
    "plateSrc": "/anatomy/chest-lats-humerus-openstax.jpg",
    "plateTitle": "OpenStax — Giải phẫu Cơ Lưng Rộng (Latissimus Dorsi), Cơ Tròn Lớn (Teres Major) & Vai Sau",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "Anatomy, Back, Latissimus Dorsi",
        "source": "StatPearls, NCBI Bookshelf",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK448120/"
      },
      {
        "title": "OpenStax Anatomy and Physiology 2e — 11.5 Muscles of the Pectoral Girdle and Upper Limbs",
        "source": "OpenStax / Rice University",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs"
      },
      {
        "title": "Variations in muscle activation levels during traditional latissimus dorsi weight training exercises: An experimental study",
        "source": "Lehman et al. (2004), Dynamic Medicine",
        "pmid": "15228624",
        "url": "https://pubmed.ncbi.nlm.nih.gov/15228624/"
      }
    ],
    "subdivisions": [
      {
        "id": "lat-thoracic-teres",
        "name": "Vùng Ngực Cơ Lưng Rộng & Cơ Tròn Lớn",
        "latin": "Latissimus dorsi & Teres major",
        "originInsertion": "Lưng rộng: vùng ngực–thắt lưng → rãnh gian củ; tròn lớn: góc dưới bả vai → mào củ bé cánh tay.",
        "fiberDirection": "Cùng góp phần duỗi và khép vai; vùng cơ không đồng nghĩa một khoang có thể cô lập bằng tay cầm.",
        "lengthenedExercise": "Lat pulldown hoặc pull-up có hỗ trợ.",
        "shortenedExercise": "Row hoặc cable pull-in có kiểm soát.",
        "ptCue": "Gợi ý: kéo cánh tay xuống trong biên độ thoải mái, cho bả vai vận động tự nhiên."
      },
      {
        "id": "lat-iliac-lumbar",
        "name": "Vùng Thắt Lưng–Chậu Cơ Lưng Rộng",
        "latin": "Latissimus dorsi, lumbar/iliac regions",
        "originInsertion": "Cân ngực–thắt lưng và mào chậu → gân bám xương cánh tay.",
        "fiberDirection": "Góp phần duỗi và khép vai; chưa có căn cứ ở đây để gọi tay cầm trung tính là cô lập xô dưới.",
        "lengthenedExercise": "Pulldown một tay hoặc hai tay.",
        "shortenedExercise": "Row kéo khuỷu về phía hông.",
        "ptCue": "Gợi ý: giữ thân ổn định và kiểm soát đường đi cánh tay."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Mỏi tay trước hoặc cẳng tay khi kéo",
        "biomechanicalCause": "Gập khuỷu và nắm tay vốn là phần của động tác; cảm giác này không chứng minh cơ xô không hoạt động.",
        "ptCorrection": "Thử giảm tải, điều chỉnh tay cầm và kiểm soát đường kéo; dùng tay cầm chắc chắn."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Lưng Rộng & Cơ Tròn Lớn, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "upper_back_traps",
    "name": "Cơ Thang, Cơ Trám & Cơ Dựng Sống",
    "latinName": "M. Trapezius (Descendens, Transversa, Ascendens), Mm. Rhomboidei & Erector Spinae",
    "category": "upper_pull",
    "views": [
      "posterior"
    ],
    "summary": "Cơ thang và cơ trám tham gia vận động bả vai; cơ dựng sống góp phần duỗi và nghiêng thân. Đây là các cơ khác nhau, không phải một khối cơ có chung điểm bám.",
    "hypertrophyScience": "Cools et al. đo điện cơ ở 45 người khỏe khi thực hiện bài tập bả vai. Kết quả về tỉ số điện cơ không chứng minh một góc chèo tối ưu cho phì đại, hoặc một bài tập sửa được mọi dạng gù lưng.",
    "plateSrc": "/anatomy/shoulder-muscles.jpg",
    "plateTitle": "OpenStax — Giải phẫu Lớp Nông & Lớp Sâu Cơ Thang (Trapezius), Cơ Trám (Rhomboids) & Cơ Nâng Vai",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "OpenStax Anatomy and Physiology 2e — 11.5 Muscles of the Pectoral Girdle and Upper Limbs",
        "source": "OpenStax / Rice University",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs"
      },
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Muscles",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html"
      },
      {
        "title": "Rehabilitation of scapular muscle balance: which exercises to prescribe?",
        "source": "Cools et al. (2007), American Journal of Sports Medicine",
        "pmid": "17606671",
        "url": "https://pubmed.ncbi.nlm.nih.gov/17606671/"
      }
    ],
    "subdivisions": [
      {
        "id": "trap-middle-rhomboid",
        "name": "Cơ Thang Giữa & Cơ Trám",
        "latin": "Trapezius, transverse part; Rhomboideus major/minor",
        "originInsertion": "Cơ trám: mỏm gai C7–T5 → bờ trong bả vai; thang giữa → mỏm cùng và gai vai.",
        "fiberDirection": "Góp phần kéo bả vai về phía cột sống; không cần ép tối đa ở mọi lần lặp.",
        "lengthenedExercise": "Row có tựa ngực.",
        "shortenedExercise": "Cable row, tùy cấu hình.",
        "ptCue": "Gợi ý: cho bả vai trượt có kiểm soát, giữ cổ thoải mái."
      },
      {
        "id": "trap-lower",
        "name": "Cơ Thang Dưới",
        "latin": "Trapezius, ascending part",
        "originInsertion": "Vùng mỏm gai ngực dưới → đầu trong gai vai.",
        "fiberDirection": "Góp phần kiểm soát và xoay lên bả vai cùng các cơ khác; không có góc sợi đo riêng cho mô hình.",
        "lengthenedExercise": "Prone Y raise với tải nhẹ.",
        "shortenedExercise": "Prone extension hoặc bài kiểm soát bả vai theo đánh giá.",
        "ptCue": "Gợi ý: cho bả vai xoay lên khi nâng tay; không ghì vai xuống suốt động tác."
      },
      {
        "id": "erector-spinae",
        "name": "Cơ Dựng Sống & Cơ Thang Trên — Hai Nhóm Riêng",
        "latin": "Iliocostalis, Longissimus, Spinalis; Trapezius, descending part",
        "originInsertion": "Dựng sống: chậu–cùng–đốt sống → sườn, đốt sống và sọ; thang trên: chẩm–cổ → đòn ngoài.",
        "fiberDirection": "Dựng sống góp phần duỗi thân; thang trên góp phần nâng và xoay bả vai.",
        "lengthenedExercise": "Hip hinge hoặc back extension, tùy mục tiêu.",
        "shortenedExercise": "Shrug cho cơ thang; không phải bài tương đương cho cơ dựng sống.",
        "ptCue": "Gợi ý: chọn bài theo từng cơ; dùng tải cho phép kiểm soát cổ và thân."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Mỏi cổ khi chèo tạ",
        "biomechanicalCause": "Tải, tư thế đầu và cách vận động có thể liên quan; không thể chẩn đoán nguyên nhân chỉ từ biểu hiện này.",
        "ptCorrection": "Thử tải nhẹ hơn và tựa ngực, giữ cổ ở tư thế thoải mái; đánh giá nếu đau kéo dài."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Thang, Cơ Trám & Cơ Dựng Sống, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "deltoids",
    "name": "Cơ Delta & Nhóm Chóp Xoay",
    "latinName": "M. Deltoideus (Clavicularis, Acromialis, Spinalis) & Rotator Cuff",
    "category": "upper_push",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Cơ delta gồm phần trước, giữa và sau. Nhóm chóp xoay gồm bốn cơ riêng phối hợp vận động và ổn định vai; cơ delta không thuộc chóp xoay.",
    "hypertrophyScience": "Larsen et al. (2025) ghi nhận tăng độ dày cơ delta giữa tương tự giữa nâng ngang bằng tạ đơn và cáp trong 8 tuần với biên độ được chuẩn hóa. Chưa thể gọi cấu hình cáp sau lưng hay góc nâng cụ thể là tối ưu.",
    "plateSrc": "/anatomy/shoulder-joint.png",
    "plateTitle": "Blausen — Minh họa Khớp Vai",
    "plateCredit": "Blausen Medical Communications (CC BY 3.0)",
    "references": [
      {
        "title": "Anatomy, Shoulder and Upper Limb, Deltoid Muscle",
        "source": "Elzanie & Varacallo, StatPearls (updated 2024)",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK537056/"
      },
      {
        "title": "OpenStax Anatomy and Physiology 2e — 11.5 Muscles of the Pectoral Girdle and Upper Limbs",
        "source": "OpenStax / Rice University",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs"
      },
      {
        "title": "Dumbbell versus cable lateral raises for lateral deltoid hypertrophy: an experimental study",
        "source": "Larsen et al. (2025), Frontiers in Physiology",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40692697/"
      }
    ],
    "subdivisions": [
      {
        "id": "delt-anterior",
        "name": "Cơ Delta Trước",
        "latin": "Deltoideus, clavicular part",
        "originInsertion": "Một phần ba ngoài xương đòn → lồi củ delta xương cánh tay.",
        "fiberDirection": "Góp phần gập và xoay trong vai.",
        "lengthenedExercise": "Press theo biên độ vai phù hợp.",
        "shortenedExercise": "Front raise bằng cáp hoặc tạ.",
        "ptCue": "Gợi ý: chọn đường nâng tay thoải mái; không có góc cố định bảo đảm hết đau vai."
      },
      {
        "id": "delt-lateral",
        "name": "Cơ Delta Giữa",
        "latin": "Deltoideus, acromial part",
        "originInsertion": "Mỏm cùng vai → lồi củ delta xương cánh tay.",
        "fiberDirection": "Có cấu trúc đa lông vũ; góp phần dạng vai.",
        "lengthenedExercise": "Cable lateral raise, tùy vị trí ròng rọc.",
        "shortenedExercise": "Dumbbell hoặc machine lateral raise.",
        "ptCue": "Gợi ý: nâng tay có kiểm soát và cho bả vai xoay cùng cánh tay."
      },
      {
        "id": "delt-posterior",
        "name": "Cơ Delta Sau",
        "latin": "Deltoideus, spinal part",
        "originInsertion": "Gai vai → lồi củ delta xương cánh tay.",
        "fiberDirection": "Góp phần duỗi và xoay ngoài vai; tham gia dạng ngang cánh tay.",
        "lengthenedExercise": "Reverse fly, tùy cấu hình.",
        "shortenedExercise": "Row với cánh tay mở vừa phải.",
        "ptCue": "Gợi ý: quét cánh tay ra sau có kiểm soát; không cần khóa cứng bả vai."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Mỏi cổ hoặc khó chịu khi nâng tay",
        "biomechanicalCause": "Cơ thang tham gia bình thường khi bả vai xoay lên; mỏi cổ không xác nhận một cơ cướp tải hay chèn ép vai.",
        "ptCorrection": "Thử giảm tải và điều chỉnh đường nâng, biên độ; không cố giữ bả vai bất động."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Delta & Nhóm Chóp Xoay, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "biceps_forearm",
    "name": "Cơ Nhị Đầu Cánh Tay, Cơ Cánh Tay & Cơ Cánh Tay–Quay",
    "latinName": "M. Biceps Brachii (Caput Longum & Breve), M. Brachialis & M. Brachioradialis",
    "category": "arms_core",
    "views": [
      "anterior"
    ],
    "summary": "Cơ nhị đầu cánh tay có đầu dài và đầu ngắn, cùng góp phần gập khuỷu và ngửa cẳng tay. Cơ cánh tay và cánh tay–quay cũng gập khuỷu.",
    "hypertrophyScience": "Vị trí vai, khuỷu và tay cầm thay đổi yêu cầu cơ học của bài cuốn. Các nguồn giải phẫu được kiểm tra không xác lập bài nào cô lập một đầu hoặc thay đổi riêng đỉnh bắp tay; cần nghiên cứu tập luyện trực tiếp cho từng biến thể.",
    "plateSrc": "/anatomy/biceps-triceps-forearm-openstax.jpg",
    "plateTitle": "OpenStax — Giải phẫu Biceps Brachii (Đầu Dài/Ngắn), Brachialis, Brachioradialis & Cẳng Tay",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Muscles",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html"
      },
      {
        "title": "OpenStax Anatomy and Physiology 2e — 11.5 Muscles of the Pectoral Girdle and Upper Limbs",
        "source": "OpenStax / Rice University",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs"
      }
    ],
    "subdivisions": [
      {
        "id": "biceps-long-head",
        "name": "Đầu Dài Cơ Nhị Đầu Cánh Tay",
        "latin": "Biceps brachii, caput longum",
        "originInsertion": "Củ trên ổ chảo xương bả vai → lồi củ quay.",
        "fiberDirection": "Đi qua vai và khuỷu; vị trí vai thay đổi chiều dài nhưng không cô lập đầu dài.",
        "lengthenedExercise": "Incline curl hoặc cable curl với cánh tay sau thân vừa phải.",
        "shortenedExercise": "Curl đứng hoặc bằng cáp.",
        "ptCue": "Gợi ý: dùng biên độ vai thoải mái; tránh đung đưa để nâng tải."
      },
      {
        "id": "biceps-short-head",
        "name": "Đầu Ngắn Cơ Nhị Đầu Cánh Tay",
        "latin": "Biceps brachii, caput breve",
        "originInsertion": "Mỏm quạ xương bả vai → lồi củ quay.",
        "fiberDirection": "Cùng đầu dài góp phần gập khuỷu và ngửa cẳng tay.",
        "lengthenedExercise": "Preacher curl với tải phù hợp.",
        "shortenedExercise": "Concentration curl hoặc cable curl.",
        "ptCue": "Gợi ý: giữ cổ tay thoải mái; không ép xoay tối đa để cô lập đầu ngắn."
      },
      {
        "id": "brachialis-brachioradialis",
        "name": "Cơ Cánh Tay & Cơ Cánh Tay–Quay",
        "latin": "Brachialis & Brachioradialis",
        "originInsertion": "Cánh tay: xương cánh tay → xương trụ; cánh tay–quay: mào trên lồi cầu ngoài → quay gần mỏm trâm.",
        "fiberDirection": "Hai cơ gập khuỷu; tay cầm không cô lập hoàn toàn một cơ.",
        "lengthenedExercise": "Hammer curl bằng cáp hoặc tạ.",
        "shortenedExercise": "Reverse curl với tải phù hợp.",
        "ptCue": "Gợi ý: giữ cổ tay ổn định, hạ tải nếu cần lấy đà."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Đung đưa thân hoặc khó chịu vai khi cuốn tạ",
        "biomechanicalCause": "Có thể liên quan tới tải và chiến lược nâng; chưa đủ để kết luận cơ nào yếu hoặc tổn thương.",
        "ptCorrection": "Thử tải nhẹ hơn hoặc tư thế có tựa, duy trì đường cuốn kiểm soát được."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Nhị Đầu Cánh Tay, Cơ Cánh Tay & Cơ Cánh Tay–Quay, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "triceps",
    "name": "Cơ Tam Đầu Cánh Tay",
    "latinName": "M. Triceps Brachii (Caput Longum, Laterale & Mediale)",
    "category": "arms_core",
    "views": [
      "posterior"
    ],
    "summary": "Ba đầu cơ tam đầu duỗi khuỷu. Đầu dài xuất phát từ xương bả vai, đi qua vai và khuỷu; đầu ngoài và đầu trong xuất phát từ xương cánh tay.",
    "hypertrophyScience": "Maeo et al.: 21 người tập duỗi khuỷu bằng cáp trong 12 tuần, mỗi tay ở một tư thế vai. MRI ghi nhận tăng thể tích lớn hơn ở tư thế qua đầu, gồm cả nhóm đầu ngoài–trong. Đây là kết quả của một giao thức, không phải tỉ lệ tăng trưởng bảo đảm.",
    "plateSrc": "/anatomy/biceps-triceps-forearm-openstax.jpg",
    "plateTitle": "OpenStax — Giải phẫu Cơ Tam Đầu Cánh Tay (Triceps Brachii — Long & Lateral Head)",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Pectoral Region & Breast",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/musculoskeletal_system/pectoral_tables.html"
      },
      {
        "title": "Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position",
        "source": "Maeo et al. (2023; online 2022), European Journal of Sport Science",
        "pmid": "35819335",
        "url": "https://pubmed.ncbi.nlm.nih.gov/35819335/"
      }
    ],
    "subdivisions": [
      {
        "id": "triceps-long",
        "name": "Đầu Dài Cơ Tam Đầu",
        "latin": "Triceps brachii, caput longum",
        "originInsertion": "Củ dưới ổ chảo → mỏm khuỷu xương trụ.",
        "fiberDirection": "Đi qua vai và khuỷu; nâng tay qua đầu làm thay đổi chiều dài.",
        "lengthenedExercise": "Overhead cable elbow extension.",
        "shortenedExercise": "Cable elbow extension với tay cạnh thân.",
        "ptCue": "Gợi ý: chọn tư thế vai dung nạp, giữ bắp tay tương đối ổn định."
      },
      {
        "id": "triceps-lateral-medial",
        "name": "Đầu Ngoài & Đầu Trong Cơ Tam Đầu",
        "latin": "Triceps brachii, caput laterale & mediale",
        "originInsertion": "Mặt sau xương cánh tay → mỏm khuỷu xương trụ.",
        "fiberDirection": "Đi qua khuỷu và góp phần duỗi khuỷu ở nhiều tư thế vai.",
        "lengthenedExercise": "Cable extension hoặc lying extension.",
        "shortenedExercise": "Pushdown bằng tay cầm thoải mái.",
        "ptCue": "Gợi ý: duỗi trong biên độ kiểm soát được, tránh giật khóa khuỷu."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Đau vùng khuỷu khi duỗi tay",
        "biomechanicalCause": "Đau khuỷu có nhiều nguyên nhân; mô tả này không chẩn đoán bệnh gân tam đầu.",
        "ptCorrection": "Giảm hoặc dừng biến thể gây đau, thử tải và tay cầm phù hợp; đau dai dẳng cần đánh giá chuyên môn."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Tam Đầu Cánh Tay, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "abs_obliques",
    "name": "Cơ Thẳng Bụng, Cơ Chéo Bụng & Cơ Ngang Bụng",
    "latinName": "M. Rectus Abdominis, Obliquus Externus/Internus & Transversus Abdominis",
    "category": "arms_core",
    "views": [
      "anterior"
    ],
    "summary": "Thành bụng trước–bên gồm cơ thẳng bụng, chéo ngoài, chéo trong và ngang bụng. Chúng góp phần vận động thân, nén ổ bụng và kiểm soát tư thế.",
    "hypertrophyScience": "Cơ thẳng bụng tham gia gập thân và có thể chịu tải khi giữ tư thế. Không bắt buộc phải cuộn từng đốt sống để cơ bụng hoạt động; nâng chân cũng có thể huy động cơ bụng để ổn định dù cơ gập háng tạo chuyển động.",
    "plateSrc": "/anatomy/core-abdomen.jpg",
    "plateTitle": "OpenStax — Giải phẫu 4 Lớp Cơ Thành Bụng (Rectus Abdominis, Obliques, Transversus)",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "OpenStax Anatomy and Physiology 2e — 11.4 Axial Muscles of the Abdominal Wall, and Thorax",
        "source": "OpenStax / Rice University",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax"
      }
    ],
    "subdivisions": [
      {
        "id": "rectus-upper-lower",
        "name": "Cơ Thẳng Bụng — Các Vùng Của Cùng Một Cơ",
        "latin": "Rectus abdominis",
        "originInsertion": "Xương mu → mỏm mũi kiếm và sụn sườn 5–7.",
        "fiberDirection": "Sợi chạy dọc; gân ngang chia đoạn. Có thể vận động hoặc giữ thân, không chia thành hai cơ trên–dưới độc lập.",
        "lengthenedExercise": "Crunch bằng cáp hoặc trên bóng, nếu dung nạp.",
        "shortenedExercise": "Reverse crunch hoặc giữ tư thế có kiểm soát.",
        "ptCue": "Gợi ý: kiểm soát thân và thở; chọn biên độ không làm tăng triệu chứng."
      },
      {
        "id": "obliques-transversus",
        "name": "Cơ Chéo Bụng & Cơ Ngang Bụng",
        "latin": "Obliquus externus/internus & Transversus abdominis",
        "originInsertion": "Điểm bám khác nhau ở sườn, chậu, cân và đường trắng; đây là ba cơ riêng.",
        "fiberDirection": "Hai cơ chéo có hướng sợi khác nhau; cơ ngang chạy ngang và nén ổ bụng.",
        "lengthenedExercise": "Cable rotation với tải phù hợp.",
        "shortenedExercise": "Side plank, Pallof press hoặc carry là ví dụ giữ thân.",
        "ptCue": "Gợi ý: duy trì kiểm soát thân và nhịp thở, không gồng tối đa cho mọi bài."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Khó chịu lưng hoặc háng khi crunch/nâng chân",
        "biomechanicalCause": "Không thể quy đau lưng cho cơ psoas hay bụng yếu chỉ từ động tác; cơ gập háng và bụng có thể cùng hoạt động.",
        "ptCorrection": "Thử biến thể dễ hơn, giảm tải hoặc biên độ; chọn bài dung nạp được và đánh giá nếu đau kéo dài."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Thẳng Bụng, Cơ Chéo Bụng & Cơ Ngang Bụng, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "glutes",
    "name": "Cơ Mông Lớn, Mông Nhỡ & Mông Bé",
    "latinName": "M. Gluteus Maximus, Gluteus Medius & Gluteus Minimus",
    "category": "lower_body",
    "views": [
      "posterior"
    ],
    "summary": "Cơ mông lớn góp phần duỗi và xoay ngoài háng. Cơ mông nhỡ và mông bé nằm ở mặt ngoài chậu, góp phần dạng háng và kiểm soát khung chậu.",
    "hypertrophyScience": "Plotkin et al. theo dõi 34 người chưa tập trong 9 tuần: squat và hip thrust tạo thay đổi kích thước cơ mông lớn tương tự, trong khi mông nhỡ–bé thay đổi ít. Điện cơ ban đầu cao hơn ở hip thrust không dự báo nhất quán mức tăng kích thước.",
    "plateSrc": "/anatomy/glute-superficial-sobotta-1909.png",
    "plateTitle": "Sobotta 1909 — Cơ mông lớn nguyên vẹn và cân vùng mông",
    "plateCredit": "Johannes Sobotta, Atlas and Text-book of Human Anatomy (1909), hình 294 — Public domain",
    "plateLabel": "Lớp nông — Mông lớn",
    "plateDescription": "Nhìn sau-bên: cơ mông lớn còn nguyên, thấy hướng thớ cơ và liên hệ với dải chậu–chày. Phần trên cơ mông nhỡ được ghi nhãn cùng cân mông; cơ mông bé nằm sâu nên không thấy ở hình này. Nhãn gốc dùng thuật ngữ Latin cổ Glutaeus.",
    "plateSourceUrl": "https://commons.wikimedia.org/wiki/File:Sobo_1909_294.png",
    "additionalPlates": [
      {
        "src": "/anatomy/glute-medius-sobotta-1909.png",
        "title": "Sobotta 1909 — Cơ mông nhỡ và các cơ xoay ngoài sâu",
        "credit": "Johannes Sobotta, Atlas and Text-book of Human Anatomy (1909), hình 295 — Public domain",
        "label": "Lớp trung gian — Mông nhỡ",
        "description": "Cơ mông lớn đã cắt và lật để lộ cơ mông nhỡ, cơ hình lê, cơ sinh đôi, gân cơ bịt trong và cơ vuông đùi. Cơ mông bé vẫn nằm sâu dưới cơ mông nhỡ.",
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sobo_1909_295.png"
      },
      {
        "src": "/anatomy/glute-deep-openstax.jpg",
        "title": "OpenStax — Cơ mông bé và lớp sâu vùng hông–đùi",
        "credit": "OpenStax, Anatomy & Physiology, hình 1122 (bản gốc 2013) — CC BY 4.0",
        "label": "Lớp sâu — Mông bé",
        "description": "Xem panel dưới bên phải: cơ mông lớn và mông nhỡ đã cắt (cut) để lộ cơ mông bé và cơ hình lê. Hai panel còn lại là mặt trước vùng chậu–đùi.",
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:1122_Gluteal_Muscles_that_Move_the_Femur.jpg"
      }
    ],
    "references": [
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Hip & Posterior Thigh & Leg",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/musculoskeletal_system/gluteal_tables.html"
      },
      {
        "title": "Hip thrust and back squat training elicit similar gluteus muscle hypertrophy and transfer similarly to the deadlift",
        "source": "Plotkin et al. (2023), Frontiers in Physiology",
        "pmid": "37877099",
        "url": "https://pubmed.ncbi.nlm.nih.gov/37877099/"
      },
      {
        "title": "Effects of squat training with different depths on lower limb muscle volumes",
        "source": "Kubo et al. (2019), European Journal of Applied Physiology",
        "pmid": "31230110",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31230110/"
      }
    ],
    "subdivisions": [
      {
        "id": "glute-maximus",
        "name": "Cơ Mông Lớn",
        "latin": "Gluteus maximus",
        "originInsertion": "Chậu sau, cùng–cụt và dây chằng cùng–ụ ngồi → dải chậu–chày và lồi củ mông.",
        "fiberDirection": "Góp phần duỗi và xoay ngoài háng; không có góc sợi đo riêng cho mô hình.",
        "lengthenedExercise": "Squat hoặc split squat theo biên độ phù hợp.",
        "shortenedExercise": "Hip thrust hoặc bridge.",
        "ptCue": "Gợi ý: duỗi háng có kiểm soát; không cần ép thêm biên độ bằng lưng dưới."
      },
      {
        "id": "glute-medius-minimus",
        "name": "Cơ Mông Nhỡ & Cơ Mông Bé",
        "latin": "Gluteus medius & Gluteus minimus",
        "originInsertion": "Mặt ngoài xương chậu → các mặt khác nhau của mấu chuyển lớn.",
        "fiberDirection": "Góp phần dạng háng; chức năng từng vùng tùy tư thế. Không có đường sợi đo cho mô hình 3D này.",
        "lengthenedExercise": "Cable hip abduction với biên độ phù hợp.",
        "shortenedExercise": "Side-lying hip abduction hoặc máy dạng háng.",
        "ptCue": "Gợi ý: giữ chậu kiểm soát được; không có góc ngón chân bảo đảm loại bỏ cơ TFL."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Khó chịu lưng hoặc co rút đùi sau khi hip thrust",
        "biomechanicalCause": "Vị trí chân, tải, biên độ và nhiều yếu tố cá nhân có thể liên quan; không xác định nguyên nhân từ cảm giác đơn lẻ.",
        "ptCorrection": "Thử điều chỉnh chân và tải, kết thúc ở duỗi háng kiểm soát được; không cố tăng biên độ bằng lưng."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Mông Lớn, Mông Nhỡ & Mông Bé, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "quads_adductors",
    "name": "Cơ Tứ Đầu Đùi & Nhóm Cơ Khép Đùi",
    "latinName": "M. Quadriceps Femoris (Rectus Femoris, Vastus Lateralis, Medialis, Intermedius) & Adductores",
    "category": "lower_body",
    "views": [
      "anterior"
    ],
    "summary": "Tứ đầu đùi gồm cơ thẳng đùi và ba cơ rộng, đều duỗi gối; cơ thẳng đùi còn đi qua háng. Nhóm cơ khép gồm nhiều cơ, có điểm bám và chức năng khác nhau.",
    "hypertrophyScience": "Kubo et al. ghi nhận tăng thể tích cơ duỗi gối sau squat 10 tuần, nhưng cơ thẳng đùi không tăng rõ. Pedrosa et al. khảo sát các biên độ duỗi gối và thấy khác biệt tại một số vùng đo. Chưa thể suy ra một bài bắt buộc hoặc tối ưu cho mọi người.",
    "plateSrc": "/anatomy/hip-gluteal.jpg",
    "plateTitle": "OpenStax — Giải phẫu 4 Đầu Cơ Tứ Đầu Đùi (Quadriceps) & Nhóm Cơ Khép Đùi (Adductors)",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Anterior & Medial Thigh",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/musculoskeletal_system/thigh_tables.html"
      },
      {
        "title": "Effects of squat training with different depths on lower limb muscle volumes",
        "source": "Kubo et al. (2019), European Journal of Applied Physiology",
        "pmid": "31230110",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31230110/"
      },
      {
        "title": "Partial range of motion training elicits favorable improvements in muscular adaptations when carried out at long muscle lengths",
        "source": "Pedrosa et al. (2022; online 2021), European Journal of Sport Science",
        "pmid": "33977835",
        "url": "https://pubmed.ncbi.nlm.nih.gov/33977835/"
      }
    ],
    "subdivisions": [
      {
        "id": "quad-vastus",
        "name": "Ba Cơ Rộng Đùi",
        "latin": "Vastus lateralis, Vastus medialis & Vastus intermedius",
        "originInsertion": "Các vùng xương đùi → bánh chè và lồi củ chày qua hệ gân duỗi gối.",
        "fiberDirection": "Duỗi gối. VMO mô tả sợi chéo của cơ rộng trong, không phải đầu cơ thứ năm.",
        "lengthenedExercise": "Squat, hack squat hoặc leg press theo khả năng.",
        "shortenedExercise": "Leg extension theo cấu hình máy.",
        "ptCue": "Gợi ý: giữ bàn chân ổn định và cho gối đi theo hướng thoải mái."
      },
      {
        "id": "quad-rectus-femoris",
        "name": "Cơ Thẳng Đùi",
        "latin": "Rectus femoris",
        "originInsertion": "Gai chậu trước dưới và vùng trên ổ cối → bánh chè, rồi lồi củ chày.",
        "fiberDirection": "Đi qua háng và gối: gập háng, duỗi gối; chiều dài tùy cả hai khớp.",
        "lengthenedExercise": "Leg extension với góc háng phù hợp; reverse Nordic là lựa chọn cần điều chỉnh.",
        "shortenedExercise": "Seated leg extension.",
        "ptCue": "Gợi ý: chỉnh trục máy gần trục gối và đệm phù hợp, không ép ngả ghế quá mức."
      },
      {
        "id": "adductors-inner-thigh",
        "name": "Nhóm Cơ Khép Đùi",
        "latin": "Adductor magnus/longus/brevis, Gracilis & Pectineus",
        "originInsertion": "Mu–ngồi → các vùng xương đùi; riêng cơ thon bám mặt trong xương chày.",
        "fiberDirection": "Khép háng; phần ngồi–lồi cầu cơ khép lớn còn duỗi háng.",
        "lengthenedExercise": "Hip adduction máy hoặc squat trong biên độ phù hợp.",
        "shortenedExercise": "Cable adduction; Copenhagen plank là ví dụ giữ tư thế.",
        "ptCue": "Gợi ý: tăng biên độ và tải từ mức kiểm soát được, không ép mở háng tối đa."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Hông nâng lên sớm khi squat",
        "biomechanicalCause": "Có thể liên quan tới tải, kỹ năng, tỷ lệ cơ thể, khả năng vận động và mệt mỏi; không tự động là hạn chế cổ chân.",
        "ptCorrection": "Thử giảm tải, điều chỉnh chân hoặc dùng máy có hỗ trợ; chọn kê gót nếu giúp vận động thoải mái."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Tứ Đầu Đùi & Nhóm Cơ Khép Đùi, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "hamstrings",
    "name": "Cơ Gân Kheo — Nhóm Đùi Sau",
    "latinName": "M. Biceps Femoris (Caput Longum & Breve), M. Semitendinosus & M. Semimembranosus",
    "category": "lower_body",
    "views": [
      "posterior"
    ],
    "summary": "Đầu dài cơ nhị đầu đùi, cơ bán gân và cơ bán màng đi qua háng và gối. Đầu ngắn cơ nhị đầu đùi đi qua gối, không đi qua háng.",
    "hypertrophyScience": "Maeo et al. so sánh hai chân ở 20 người trong 12 tuần: leg curl ngồi tạo tăng thể tích lớn hơn ở các cơ hai khớp so với nằm sấp, nhưng đầu ngắn không khác rõ. Kết quả này không trực tiếp so sánh RDL hoặc chứng minh phòng ngừa chấn thương.",
    "plateSrc": "/anatomy/hip-gluteal.jpg",
    "plateTitle": "OpenStax — Giải phẫu Bóc tách Nhóm Cơ Gân Kheo (Biceps Femoris, Semitendinosus, Semimembranosus)",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Hip & Posterior Thigh & Leg",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/musculoskeletal_system/gluteal_tables.html"
      },
      {
        "title": "Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths",
        "source": "Maeo et al. (2021), Medicine & Science in Sports & Exercise",
        "pmid": "33009197",
        "url": "https://pubmed.ncbi.nlm.nih.gov/33009197/"
      }
    ],
    "subdivisions": [
      {
        "id": "hamstring-biarticular",
        "name": "Các Cơ Gân Kheo Hai Khớp",
        "latin": "Biceps femoris long head, Semitendinosus & Semimembranosus",
        "originInsertion": "Ụ ngồi → đầu mác (nhị đầu dài) hoặc chày trong (bán gân/bán màng).",
        "fiberDirection": "Góp phần duỗi háng và gập gối; chiều dài tùy đồng thời góc háng và gối.",
        "lengthenedExercise": "Seated leg curl hoặc RDL.",
        "shortenedExercise": "Prone leg curl.",
        "ptCue": "Gợi ý: ở RDL, gập háng và giữ tải gần người; dừng ở biên độ kiểm soát được."
      },
      {
        "id": "hamstring-short-head",
        "name": "Đầu Ngắn Cơ Nhị Đầu Đùi",
        "latin": "Biceps femoris, caput breve",
        "originInsertion": "Xương đùi → đầu xương mác.",
        "fiberDirection": "Đi qua gối, không tạo mô-men duỗi háng trực tiếp; điều đó không có nghĩa hoàn toàn im điện cơ khi RDL.",
        "lengthenedExercise": "Leg curl qua biên độ gối phù hợp.",
        "shortenedExercise": "Standing hoặc prone leg curl.",
        "ptCue": "Gợi ý: giữ đùi ổn định trong máy; không cần ép cổ chân vào một góc cố định."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Khó chịu lưng dưới khi RDL",
        "biomechanicalCause": "Biểu hiện này không đủ để quy tổn thương cho L4–L5; tải, biên độ và tình trạng cá nhân đều cần xem xét.",
        "ptCorrection": "Thử giảm tải, giữ tạ gần người và thu biên độ; không tiếp tục biến thể làm đau tăng."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Gân Kheo — Nhóm Đùi Sau, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  },
  {
    "id": "calves",
    "name": "Cơ Bụng Chân, Cơ Dép & Cơ Chày Trước",
    "latinName": "M. Gastrocnemius, M. Soleus (Triceps Surae) & M. Tibialis Anterior",
    "category": "lower_body",
    "views": [
      "posterior",
      "anterior"
    ],
    "summary": "Cơ bụng chân đi qua gối và cổ chân; cơ dép chỉ đi qua cổ chân. Cả hai gấp gan chân. Cơ chày trước nằm ở khoang trước cẳng chân và góp phần gấp mu chân.",
    "hypertrophyScience": "Kinoshita et al.: 14 người chưa tập trong 12 tuần, đứng nâng gót tạo tăng thể tích cơ bụng chân lớn hơn ngồi, còn cơ dép tương tự. Kassiano et al. khảo sát biên độ trên máy leg press ở 42 phụ nữ trẻ; kết quả không chứng minh dừng 2 giây loại bỏ tác dụng gân hoặc ngăn bệnh gân.",
    "plateSrc": "/anatomy/calves-shin-openstax.jpg",
    "plateTitle": "OpenStax — Giải phẫu Cơ Bụng Chân (Gastrocnemius), Cơ Dép (Soleus), Gân Achilles & Cơ Chày Trước",
    "plateCredit": "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    "references": [
      {
        "title": "OpenStax Anatomy and Physiology 2e — 11.6 Appendicular Muscles of the Pelvic Girdle and Lower Limbs",
        "source": "OpenStax / Rice University",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs"
      },
      {
        "title": "Texas Tech University Health Sciences Center El Paso — Anatomy Tables: Hip & Posterior Thigh & Leg",
        "source": "University anatomy teaching tables",
        "url": "https://anatomy.ttuhscep.edu/musculoskeletal_system/gluteal_tables.html"
      },
      {
        "title": "Triceps surae muscle hypertrophy is greater after standing versus seated calf-raise training",
        "source": "Kinoshita et al. (2023), Frontiers in Physiology",
        "pmid": "38156065",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38156065/"
      },
      {
        "title": "Greater Gastrocnemius Muscle Hypertrophy After Partial Range of Motion Training Performed at Long Muscle Lengths",
        "source": "Kassiano et al. (2023), Journal of Strength and Conditioning Research",
        "pmid": "37015016",
        "url": "https://pubmed.ncbi.nlm.nih.gov/37015016/"
      }
    ],
    "subdivisions": [
      {
        "id": "gastrocnemius",
        "name": "Cơ Bụng Chân — Hai Đầu",
        "latin": "Gastrocnemius, medial & lateral heads",
        "originInsertion": "Vùng lồi cầu xương đùi → xương gót qua gân gót.",
        "fiberDirection": "Đi qua gối và cổ chân; góp phần gấp gan chân và gập gối.",
        "lengthenedExercise": "Standing calf raise với hạ gót kiểm soát được.",
        "shortenedExercise": "Standing calf raise với nâng gót có kiểm soát.",
        "ptCue": "Gợi ý: giữ gối tương đối thẳng, không ép khóa cứng hoặc hạ gót quá khả năng."
      },
      {
        "id": "soleus-tibialis",
        "name": "Cơ Dép & Cơ Chày Trước — Hai Chức Năng Khác Nhau",
        "latin": "Soleus & Tibialis anterior",
        "originInsertion": "Dép: chày–mác → gót qua gân gót; chày trước: chày → chêm trong và nền bàn I.",
        "fiberDirection": "Cơ dép gấp gan chân; cơ chày trước gấp mu và nghiêng trong bàn chân.",
        "lengthenedExercise": "Seated calf raise cho gấp gan chân; tibialis raise cho gấp mu.",
        "shortenedExercise": "Giữ nâng gót hoặc nâng mũi chân, tùy cơ cần tập.",
        "ptCue": "Gợi ý: phân biệt hai hướng vận động; ngồi nâng gót không cô lập tuyệt đối cơ dép."
      }
    ],
    "compensationFixes": [
      {
        "symptom": "Khó chịu vùng gân gót khi nâng gót",
        "biomechanicalCause": "Không thể kết luận gân gánh hết tải hoặc chẩn đoán bệnh gân từ nhịp tập; cần xét tải và triệu chứng.",
        "ptCorrection": "Điều chỉnh tải, biên độ và nhịp phù hợp; đau dai dẳng cần đánh giá, không dùng dừng 2 giây như điều trị."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu và các lựa chọn tập Cơ Bụng Chân, Cơ Dép & Cơ Chày Trước, dẫn nguồn cho từng nhận định; phân biệt kết quả nghiên cứu với gợi ý thực hành, không chẩn đoán từ cảm giác mỏi và không khẳng định một bài tối ưu cho mọi người."
  }
];

export const HYPERTROPHY_EXERCISES: HypertrophyExercise[] = [
  {
    "id": "incline-db-press",
    "name": "Incline Dumbbell Press",
    "vietnameseName": "Đẩy Ngực Tạ Đơn Ghế Dốc",
    "pattern": "Push",
    "equipment": "Dumbbell + ghế điều chỉnh",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Chọn độ dốc nhẹ phù hợp (30° chỉ là một ví dụ), bàn chân vững. Hạ tạ có kiểm soát tới biên độ vai dung nạp rồi đẩy lên.",
    "commonMistake": "Ép độ sâu hoặc tải khiến mất kiểm soát.",
    "targets": [
      {
        "muscleId": "chest",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ ngực lớn, gồm phần đòn",
        "biomechanicalWhy": "Khép/gập cánh tay góp phần vào động tác đẩy; chưa xác nhận mức ưu tiên riêng ở người tập."
      },
      {
        "muscleId": "deltoids",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ delta trước",
        "biomechanicalWhy": "Góp phần gập vai trong động tác đẩy."
      },
      {
        "muscleId": "triceps",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ tam đầu cánh tay",
        "biomechanicalWhy": "Góp phần duỗi khuỷu."
      }
    ]
  },
  {
    "id": "cable-chest-fly",
    "name": "Seated Cable Chest Fly",
    "vietnameseName": "Ép Ngực Dây Cáp Ngồi",
    "pattern": "Push",
    "equipment": "Hai ròng rọc + ghế",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Chọn độ cao cáp và ghế thoải mái. Giữ khuỷu hơi gập, khép cánh tay có kiểm soát trước ngực; không cần bắt chéo tay.",
    "commonMistake": "Dùng tải quá lớn, giật tay hoặc ép quá biên độ vai.",
    "targets": [
      {
        "muscleId": "chest",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ ngực lớn",
        "biomechanicalWhy": "Khép cánh tay trước thân; mô-men thay đổi theo vị trí cáp, không có vùng rãnh ngực trong độc lập."
      },
      {
        "muscleId": "deltoids",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ delta trước",
        "biomechanicalWhy": "Có thể góp phần vào vận động cánh tay tùy đường kéo."
      }
    ]
  },
  {
    "id": "cable-lateral-raise",
    "name": "Cable Lateral Raise",
    "vietnameseName": "Nâng Vai Ngang Bằng Cáp",
    "pattern": "Push",
    "equipment": "Ròng rọc điều chỉnh",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Chỉnh vị trí ròng rọc và đứng để cáp không cọ người. Nâng tay ra bên theo đường thoải mái; cho bả vai vận động cùng tay.",
    "commonMistake": "Giật tạ hoặc ép cánh tay ra sau vượt mức vai dung nạp.",
    "targets": [
      {
        "muscleId": "deltoids",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ delta, đặc biệt phần giữa",
        "biomechanicalWhy": "Góp phần dạng vai; mức tải dọc biên độ phụ thuộc cấu hình cáp."
      },
      {
        "muscleId": "upper_back_traps",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ thang trong phối hợp vận động bả vai",
        "biomechanicalWhy": "Bả vai cần xoay khi nâng tay; đây là phối hợp bình thường."
      }
    ]
  },
  {
    "id": "neutral-lat-pulldown",
    "name": "Neutral-Grip / Single-Arm Lat Pulldown",
    "vietnameseName": "Kéo Xô Tay Cầm Trung Tính / Một Tay",
    "pattern": "Pull",
    "equipment": "Máy lat pulldown hoặc cáp",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Giữ thân ổn định, kéo cánh tay xuống với khuỷu gập. Trả lên có kiểm soát, cho bả vai vận động; không kéo sau gáy.",
    "commonMistake": "Lấy đà quá mức khiến khó kiểm soát đường kéo.",
    "targets": [
      {
        "muscleId": "lats_teres",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ lưng rộng và cơ tròn lớn",
        "biomechanicalWhy": "Góp phần khép/duỗi vai; không đồng nghĩa cô lập xô dưới."
      },
      {
        "muscleId": "biceps_forearm",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Các cơ gập khuỷu",
        "biomechanicalWhy": "Góp phần gập khuỷu trong pha kéo."
      },
      {
        "muscleId": "upper_back_traps",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Các cơ vận động bả vai",
        "biomechanicalWhy": "Phối hợp vị trí bả vai trong kéo và trả tải."
      }
    ]
  },
  {
    "id": "chest-supported-tbar-row",
    "name": "Chest-Supported Row",
    "vietnameseName": "Chèo Tạ Có Tựa Ngực",
    "pattern": "Pull",
    "equipment": "T-bar hoặc máy row có đệm ngực",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Chỉnh đệm để thở thoải mái, chọn tay cầm phù hợp. Kéo về bằng phối hợp cánh tay, khuỷu và bả vai, rồi trả có kiểm soát.",
    "commonMistake": "Bật ngực khỏi đệm hoặc giật tải.",
    "targets": [
      {
        "muscleId": "upper_back_traps",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ thang giữa và cơ trám",
        "biomechanicalWhy": "Góp phần kéo bả vai về phía cột sống; phần đóng góp tùy cách chèo."
      },
      {
        "muscleId": "deltoids",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ delta sau",
        "biomechanicalWhy": "Góp phần đưa cánh tay ra sau."
      },
      {
        "muscleId": "lats_teres",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ lưng rộng và cơ tròn lớn",
        "biomechanicalWhy": "Góp phần duỗi vai."
      },
      {
        "muscleId": "biceps_forearm",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Các cơ gập khuỷu",
        "biomechanicalWhy": "Góp phần gập khuỷu, không chỉ giữ tư thế."
      }
    ]
  },
  {
    "id": "bayesian-incline-curl",
    "name": "Cable Curl / Incline Dumbbell Curl",
    "vietnameseName": "Cuốn Tay Trước Bằng Cáp / Ghế Nghiêng",
    "pattern": "Arms & Core",
    "equipment": "Cáp hoặc dumbbell + ghế",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Chọn vị trí vai thoải mái, có thể đặt cánh tay sau thân vừa phải. Gập khuỷu và hạ có kiểm soát, giữ cổ tay phù hợp.",
    "commonMistake": "Ép duỗi vai sâu hoặc dùng đà thân để nâng tải.",
    "targets": [
      {
        "muscleId": "biceps_forearm",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ nhị đầu và các cơ gập khuỷu",
        "biomechanicalWhy": "Vai sau thân thay đổi chiều dài cơ nhị đầu; không xác nhận cô lập đầu dài hay tạo đỉnh bắp tay."
      },
      {
        "muscleId": "deltoids",
        "role": "stabilizer",
        "activationPct": 0,
        "targetedHeads": "Cơ delta và các cơ vai phối hợp",
        "biomechanicalWhy": "Góp phần giữ vị trí cánh tay; không phải phép đo hoạt động."
      }
    ]
  },
  {
    "id": "overhead-cable-triceps",
    "name": "Overhead Cable Elbow Extension",
    "vietnameseName": "Duỗi Khuỷu Bằng Cáp Qua Đầu",
    "pattern": "Arms & Core",
    "equipment": "Cáp + dây thừng hoặc tay cầm",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Nâng cánh tay tới tư thế qua đầu dung nạp được. Giữ thân ổn định, gập và duỗi khuỷu có kiểm soát; điều chỉnh độ cao cáp theo máy.",
    "commonMistake": "Dùng tải hoặc biên độ làm khó kiểm soát thân và khuỷu.",
    "targets": [
      {
        "muscleId": "triceps",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cả ba đầu cơ tam đầu",
        "biomechanicalWhy": "Duỗi khuỷu; tư thế vai thay đổi chiều dài đầu dài. Nghiên cứu Maeo chỉ áp dụng trực tiếp cho giao thức đã khảo sát."
      },
      {
        "muscleId": "abs_obliques",
        "role": "stabilizer",
        "activationPct": 0,
        "targetedHeads": "Thành bụng",
        "biomechanicalWhy": "Góp phần kiểm soát thân khi tay ở trên đầu; vai trò được suy luận từ động tác."
      }
    ]
  },
  {
    "id": "cable-rope-crunch",
    "name": "Kneeling Cable Crunch / Hanging Pelvic Curl",
    "vietnameseName": "Crunch Cáp Quỳ / Cuộn Chậu Khi Treo",
    "pattern": "Arms & Core",
    "equipment": "Cáp hoặc xà phù hợp",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Với crunch: gập thân có kiểm soát dưới tải phù hợp. Với treo: giữ vai thoải mái, kiểm soát chuyển động chậu; có thể co gối để giảm độ khó. Đây là hai bài khác nhau.",
    "commonMistake": "Dùng đà hoặc tiếp tục biên độ làm tăng khó chịu.",
    "targets": [
      {
        "muscleId": "abs_obliques",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ thẳng bụng và các cơ thành bụng",
        "biomechanicalWhy": "Góp phần gập hoặc ổn định thân/chậu; cơ gập háng cũng tham gia nâng chân."
      }
    ]
  },
  {
    "id": "heel-elevated-hack-squat",
    "name": "Hack Squat / High-Bar Squat",
    "vietnameseName": "Hack Squat / Squat Tạ Đòn Cao",
    "pattern": "Legs & Glutes",
    "equipment": "Máy hack squat hoặc barbell; kê gót tùy nhu cầu",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Chọn vị trí chân vững. Gập gối và háng tới độ sâu kiểm soát được; gối có thể đi trước mũi chân tùy tư thế. Kê gót là lựa chọn, không bắt buộc.",
    "commonMistake": "Ép chạm đùi–bắp chân hoặc cố một vị trí chân không phù hợp máy và cơ thể.",
    "targets": [
      {
        "muscleId": "quads_adductors",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ tứ đầu đùi; cơ khép góp phần tùy biến thể",
        "biomechanicalWhy": "Duỗi gối khi đứng lên; không xác nhận cô lập VMO hoặc mọi cơ khép."
      },
      {
        "muscleId": "glutes",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ mông lớn",
        "biomechanicalWhy": "Góp phần duỗi háng."
      },
      {
        "muscleId": "calves",
        "role": "stabilizer",
        "activationPct": 0,
        "targetedHeads": "Các cơ quanh cổ chân, gồm cơ dép",
        "biomechanicalWhy": "Góp phần kiểm soát cổ chân tùy máy và tư thế."
      }
    ]
  },
  {
    "id": "romanian-deadlift-seated-curl",
    "name": "Seated Leg Curl / Romanian Deadlift",
    "vietnameseName": "Ngồi Gập Gối / Romanian Deadlift",
    "pattern": "Legs & Glutes",
    "equipment": "Máy leg curl; barbell hoặc dumbbell",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Leg curl: chỉnh trục và đệm máy rồi gập gối có kiểm soát. RDL: giữ gối hơi gập, gập háng với tải gần chân; dừng ở biên độ kiểm soát được. Hai bài có cơ chế khác nhau.",
    "commonMistake": "Áp một độ sâu hoặc góc gối cố định cho mọi người và cả hai bài.",
    "targets": [
      {
        "muscleId": "hamstrings",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Gân kheo: khác nhau giữa leg curl và RDL",
        "biomechanicalWhy": "Leg curl tải gập gối; RDL tải duỗi háng và không tạo mô-men háng trực tiếp ở đầu ngắn."
      },
      {
        "muscleId": "glutes",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Cơ mông lớn trong RDL",
        "biomechanicalWhy": "Góp phần duỗi háng ở RDL; không phải cơ chủ vận gập gối trong leg curl."
      },
      {
        "muscleId": "upper_back_traps",
        "role": "stabilizer",
        "activationPct": 0,
        "targetedHeads": "Cơ dựng sống và cơ giữ tải trong RDL",
        "biomechanicalWhy": "Góp phần kiểm soát thân khi RDL; không áp dụng giống vậy cho leg curl có ghế tựa."
      }
    ]
  },
  {
    "id": "glute-bulgarian-split-squat",
    "name": "Rear-Foot-Elevated Split Squat",
    "vietnameseName": "Split Squat Kê Chân Sau",
    "pattern": "Legs & Glutes",
    "equipment": "Dumbbell; bục kê chân thấp phù hợp",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Chọn chiều dài bước và độ cao bục ổn định; có thể vịn hỗ trợ. Hạ bằng gập háng và gối trước rồi đẩy lên, thân nghiêng theo khả năng.",
    "commonMistake": "Ép bước thật dài hoặc giữ một góc thân cố định khiến mất thăng bằng.",
    "targets": [
      {
        "muscleId": "glutes",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ mông lớn; cơ mông bên phối hợp giữ chậu",
        "biomechanicalWhy": "Góp phần duỗi háng và kiểm soát chậu khi chống chân; không xác nhận ưu tiên bó cụ thể."
      },
      {
        "muscleId": "quads_adductors",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ tứ đầu đùi và một số cơ khép",
        "biomechanicalWhy": "Duỗi gối và phối hợp vận động háng; chia tải tùy tư thế."
      },
      {
        "muscleId": "hamstrings",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Các cơ gân kheo hai khớp",
        "biomechanicalWhy": "Có thể phối hợp duỗi háng/gập gối; không thể gọi là bảo vệ gối chỉ từ vai trò."
      }
    ]
  },
  {
    "id": "barbell-hip-thrust",
    "name": "Barbell / Machine Hip Thrust",
    "vietnameseName": "Đẩy Hông Bằng Tạ Đòn / Máy",
    "pattern": "Legs & Glutes",
    "equipment": "Barbell có đệm + ghế vững hoặc máy",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Đặt lưng trên tựa chắc, chỉnh bàn chân thoải mái và đệm tải trên chậu. Nâng hông có kiểm soát tới duỗi háng, giữ thân kiểm soát được.",
    "commonMistake": "Cố nâng hông cao hơn bằng cách ưỡn lưng dưới.",
    "targets": [
      {
        "muscleId": "glutes",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ mông lớn",
        "biomechanicalWhy": "Duỗi háng chống tải; không xác nhận mông nhỡ phát triển đáng kể từ bài này."
      },
      {
        "muscleId": "quads_adductors",
        "role": "stabilizer",
        "activationPct": 0,
        "targetedHeads": "Các cơ góp phần giữ tư thế gối",
        "biomechanicalWhy": "Vai trò phụ thuộc đặt chân và máy, không phải số liệu tải đo được."
      },
      {
        "muscleId": "hamstrings",
        "role": "synergist",
        "activationPct": 0,
        "targetedHeads": "Gân kheo hai khớp",
        "biomechanicalWhy": "Có thể góp phần duỗi háng; mức đóng góp tùy góc khớp."
      }
    ]
  },
  {
    "id": "standing-seated-calf-raise",
    "name": "Standing / Seated Calf Raise",
    "vietnameseName": "Nâng Gót Đứng / Ngồi",
    "pattern": "Legs & Glutes",
    "equipment": "Máy nâng gót hoặc tải có hỗ trợ",
    "resistanceProfile": "Variable (Phụ thuộc thiết lập)",
    "setupAndExecution": "Đứng với gối tương đối thẳng hoặc ngồi với gối gập. Hạ và nâng gót trong biên độ dung nạp, giữ bàn chân ổn định; dừng ngắn nếu giúp kiểm soát.",
    "commonMistake": "Nhún bằng đà hoặc ép hạ gót sâu khi khó chịu; không bắt buộc dừng đúng 2 giây.",
    "targets": [
      {
        "muscleId": "calves",
        "role": "primary",
        "activationPct": 0,
        "targetedHeads": "Cơ bụng chân và cơ dép",
        "biomechanicalWhy": "Cả hai gấp gan chân. Gập gối làm thay đổi chiều dài bụng chân, không loại bỏ hoàn toàn hoạt động của cơ này."
      }
    ]
  }
];
