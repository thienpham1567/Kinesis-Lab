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
    | "Shortened-Biased (Đỉnh co rút)";
  setupAndExecution: string;
  commonMistake: string;
  targets: ExerciseMuscleTarget[];
}

export const MUSCLE_GROUP_ATLAS: MuscleGroupAtlas[] = [
  {
    id: "chest",
    name: "Cơ Ngực (Trên – Giữa – Dưới) & Cơ Răng Trước",
    latinName:
      "M. Pectoralis Major (Clavicularis, Sternocostalis, Abdominalis) & Serratus Anterior",
    category: "upper_push",
    views: ["anterior"],
    summary:
      "Cơ ngực lớn là cơ hình quạt dày bao phủ lồng ngực trước, hội tụ về mép ngoài rãnh gian củ xương cánh tay. Do các bó sợi chạy theo 3 góc khác nhau (từ xương đòn, xương ức và bao cơ thẳng bụng), không một góc ghế đơn lẻ nào có thể kích thích tối đa cả 3 bó.",
    hypertrophyScience:
      "Theo nghiên cứu điện cơ & siêu âm của Trebs et al. (2010) và Chaves et al. (2020), góc ghế dốc 30° tối ưu hóa bó đòn (Ngực trên), trong khi dốc quá 45°–60° làm giảm tải ngực và chuyển sang cơ Vai trước. Cơ ngực đạt cánh tay đòn nội tại lớn nhất ở đầu và giữa pha đẩy (Lengthened-to-Mid range).",
    plateSrc: "/anatomy/chest-lats-humerus-openstax.jpg",
    plateTitle:
      "OpenStax Fig 11.19 — Giải phẫu Cơ Ngực Lớn, Cơ Delta, Cơ Răng Trước & Lớp Sâu Khớp Vai",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Chaves et al. (2020) — Incline vs. Flat Bench Press Hypertrophy (30° Optimal Clavicular)",
        source: "Int J Exerc Sci",
        pmid: "32922646",
        url: "https://pubmed.ncbi.nlm.nih.gov/32922646/",
      },
      {
        title: "Ackland et al. (2008) — Moment Arms of the Human Shoulder Muscles",
        source: "Journal of Anatomy",
        pmid: "18691376",
        url: "https://pubmed.ncbi.nlm.nih.gov/18691376/",
      },
    ],
    subdivisions: [
      {
        id: "pec-clavicular",
        name: "1. Ngực Trên — Bó Đòn (Upper Chest / Clavicular Head)",
        latin: "Pectoralis major (pars clavicularis)",
        originInsertion:
          "1/2 trong mặt trước xương đòn → Mép ngoài rãnh gian củ xương cánh tay",
        fiberDirection:
          "Thớ cơ chạy chếch từ trên-trong xuống dưới-ngoài góc ~30°–45°. Tối ưu khi đẩy ghế dốc 30° hoặc kéo cáp từ thấp lên cao (Low-to-High) kèm gập vai.",
        lengthenedExercise:
          "30° Incline Dumbbell Press / Incline Smith Machine Press (hạ sâu mở lồng ngực)",
        shortenedExercise:
          "Seated Low-to-High Cable Fly (khép qua đường giữa trước cằm)",
        ptCue:
          "Ưỡn nhẹ xương ức lên trần, dẫn đường bằng mặt trong bắp tay hướng về phía xương đòn đối diện thay vì đẩy thẳng lên đầu.",
      },
      {
        id: "pec-sternal",
        name: "2. Ngực Giữa — Bó Ức – Sườn (Mid Chest / Sternocostal Head)",
        latin: "Pectoralis major (pars sternocostalis)",
        originInsertion:
          "Mặt trước xương ức & sụn sườn 1–6 → Rãnh gian củ xương cánh tay",
        fiberDirection:
          "Thớ cơ chạy gần như nằm ngang. Tối ưu khi đẩy ngang (Flat Press) với góc mở cùi chỏ ~45°–65° so với thân người.",
        lengthenedExercise:
          "Flat Dumbbell Press / Cambered Bar Bench Press (dừng 1s ở điểm căng đáy)",
        shortenedExercise: "Pec Deck Machine / Flat Seated Cable Fly",
        ptCue:
          "Tưởng tượng đang ép hai bắp tay chạm vào nhau trước ngực thay vì chỉ duỗi khuỷu tay đẩy tạ.",
      },
      {
        id: "pec-costal",
        name: "3. Ngực Dưới — Bó Bụng / Sườn dưới (Lower Chest / Costal Head)",
        latin: "Pectoralis major (pars abdominalis) & Pectoralis minor",
        originInsertion:
          "Sụn sườn 5–7 & lá trước bao cơ thẳng bụng → Rãnh gian củ xương cánh tay",
        fiberDirection:
          "Thớ cơ chạy chếch từ dưới lên trên-ngoài. Tối ưu khi đẩy từ trên xuống dưới (High-to-Low) hoặc Chest Dip.",
        lengthenedExercise:
          "Weighted Forward-Lean Chest Dip (nghiêng thân 25° về trước)",
        shortenedExercise:
          "High-to-Low Cable Crossover (ép hai tay cắt chéo trước bụng dưới)",
        ptCue:
          "Giữ vai hạ thấp xa tai (Depression) trong suốt pha ép xuống để khóa chặt lồng ngực dưới.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Tập ngực nhưng chỉ mỏi căng cơ Vai trước (Anterior Deltoid) và mỏi khớp vai",
        biomechanicalCause:
          "Để xương bả vai trượt ra trước (Protraction) khi đẩy lên và mở cùi chỏ ngang 90° làm mô-men xoắn dồn vào cơ vai trước.",
        ptCorrection:
          "Khép & hạ xương bả vai ép chặt xuống ghế (Scapular retraction & depression), thu góc cùi chỏ về 45°–60° và dừng đẩy trước khi vai bị nhấc khỏi ghế.",
      },
      {
        symptom: "Mỏi cơ Tay sau (Triceps) trước khi cơ ngực kịp mệt",
        biomechanicalCause:
          "Cầm tay quá hẹp hoặc cẳng tay không vuông góc với mặt sàn ở điểm đáy, biến bài đẩy ngực thành bài duỗi khuỷu tay.",
        ptCorrection:
          "Điều chỉnh độ rộng tay sao cho ở đáy chuyển động, cẳng tay thẳng đứng 90° so với sàn; kết hợp Pre-exhaust bằng Cable Fly cho học viên tay khỏe hơn ngực.",
      },
    ],
    sampleAiPrompt:
      "Thiết kế buổi tập chuyên biệt cải thiện Ngực Trên (Clavicular Pectoralis) và rãnh ngực trong cho học viên bị trội vai trước, kèm phân tích góc ghế, góc cùi chỏ và hồ sơ kháng lực.",
  },
  {
    id: "lats_teres",
    name: "Cơ Lưng Rộng — Cơ Xô & Cơ Tròn Lớn (V-Taper Width)",
    latinName: "M. Latissimus Dorsi (Thoracic, Lumbar, Iliac) & M. Teres Major",
    category: "upper_pull",
    views: ["posterior", "anterior"],
    summary:
      "Cơ Xô (Latissimus Dorsi) là cơ có diện tích rộng nhất lưng, bám từ đốt sống ngực T7, cân ngực – thắt lưng, mào chậu và 4 xương sườn dưới, xoắn 180° trước khi bám vào rãnh gian củ xương cánh tay. Đây là nhóm cơ quyết định độ rộng chữ V (V-Taper).",
    hypertrophyScience:
      "Để vào Xô tối đa thay vì vào Lưng trên (Traps/Rhomboids), cánh tay phải di chuyển sát thân trên mặt phẳng đứng dọc (Sagittal Plane — Shoulder Extension) hoặc khép từ ngoài vào sườn trên mặt phẳng trán (Frontal Plane — Shoulder Adduction) trong khi giữ xương bả vai ổn định.",
    plateSrc: "/anatomy/chest-lats-humerus-openstax.jpg",
    plateTitle:
      "OpenStax Fig 11.19 — Giải phẫu Cơ Lưng Rộng (Latissimus Dorsi), Cơ Tròn Lớn (Teres Major) & Vai Sau",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Lehman et al. (2004) — Lat Pulldown & Row Biomechanical Muscle Activation",
        source: "Strength Cond J / BMC Sports Sci",
        pmid: "15228624",
        url: "https://pubmed.ncbi.nlm.nih.gov/15228624/",
      },
      {
        title: "Signorile et al. (2002) — Hand Position Effects on Latissimus Dorsi & Teres Major",
        source: "J Strength Cond Res",
        pmid: "12423182",
        url: "https://pubmed.ncbi.nlm.nih.gov/12423182/",
      },
    ],
    subdivisions: [
      {
        id: "lat-thoracic-teres",
        name: "1. Bó Xô Trên & Cơ Tròn Lớn (Upper Lats & Teres Major)",
        latin: "Latissimus dorsi (pars vertebralis) & Teres major",
        originInsertion:
          "Mỏm gai T7–T12 & góc dưới xương bả vai → Xương cánh tay",
        fiberDirection:
          "Chạy gần nằm ngang từ cột sống ngực ra nách. Tối ưu với động tác Khép vai trên mặt phẳng trán (Wide-grip Pulldown).",
        lengthenedExercise:
          "Wide-Grip Lat Pulldown / Assisted Pull-up (mở rộng bả vai có kiểm soát ở đỉnh)",
        shortenedExercise: "High-Angle Single-Arm Cable Lat Pull-in",
        ptCue:
          "Kéo hai cùi chỏ từ hai bên hướng thẳng xuống hai bên sườn hông, giữ ngực mở nhẹ 15°.",
      },
      {
        id: "lat-iliac-lumbar",
        name: "2. Bó Xô Dưới / Xô Hông (Lower / Iliac & Lumbar Lats)",
        latin: "Latissimus dorsi (pars iliaca & costalis)",
        originInsertion:
          "Mào chậu & cân ngực-thắt lưng → Rãnh gian củ xương cánh tay",
        fiberDirection:
          "Thớ cơ chạy gần như thẳng đứng từ hông lên nách. Tối ưu khi kéo từ cao phía trước mặt xuống sát hông với tay cầm hẹp trung tính (Neutral Grip).",
        lengthenedExercise:
          "Single-Arm Kneeling Cable Pulldown / Neutral-Grip Pulldown",
        shortenedExercise:
          "Chest-Supported Single-Arm Machine Row (kéo thấp cùi chỏ về sát mào chậu)",
        ptCue:
          "Dẫn đường bằng cùi chỏ quét sát mạng sườn về phía túi quần sau, không kéo quá mặt phẳng thân người.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Tập kéo xô / chèo cáp nhưng chỉ phồng mỏi Bắp tay trước (Biceps) và Cẳng tay",
        biomechanicalCause:
          "Nắm thanh đòn quá chặt bằng ngón cái và gập khuỷu tay sớm trước khi hạ xương bả vai (Scapular depression).",
        ptCorrection:
          "Dùng Thumbless Grip (móc 4 ngón tay như móc sắt) + Lifting Straps ở hiệp nặng; khởi phát bằng hạ bả vai rồi mới dẫn cùi chỏ xuống hông.",
      },
      {
        symptom: "Kéo Row nhưng vào hết Lưng trên / Cầu vai thay vì vào Xô",
        biomechanicalCause:
          "Cùi chỏ mở rộng 45°–75° ra xa sườn và ép hai bả vai sát nhau ở cuối biên độ.",
        ptCorrection:
          "Giữ cùi chỏ ôm sát thân người (Sagittal plane), hơi gù nhẹ lưng trên (Thoracic flexion nhẹ) và dừng cùi chỏ ngay ngang thân người.",
      },
    ],
    sampleAiPrompt:
      "Phân tích sự khác biệt cơ sinh học giữa bài kéo vào Xô (Lat-biased Row) và kéo vào Lưng trên (Upper-Back-biased Row), kèm giáo án mở rộng Xô dưới (Iliac Lats).",
  },
  {
    id: "upper_back_traps",
    name: "Cơ Lưng Trên, Cơ Thang & Cơ Dựng Sống (Back Thickness)",
    latinName:
      "M. Trapezius (Descendens, Transversa, Ascendens), Mm. Rhomboidei & Erector Spinae",
    category: "upper_pull",
    views: ["posterior"],
    summary:
      "Nhóm cơ tạo độ dày 3D cho toàn bộ vùng lưng và giữ tư thế cột sống vững chắc. Bao gồm Cơ Thang (3 bó trên – giữa – dưới), Cơ Trám lớn/bé nằm dưới cơ thang, và cột Cơ Dựng sống chạy dọc hai bên cột sống.",
    hypertrophyScience:
      "Khác với cơ Xô (vận động xương cánh tay), Cơ Thang giữa/dưới và Cơ Trám vận động trực tiếp Xương Bả Vai (Scapular Protraction → Retraction). Do đó bài tập phải cho phép hai bả vai mở rộng tối đa ở đáy và ép sát tối đa vào cột sống ở đỉnh co rút, với góc mở cùi chỏ 45°–75°.",
    plateSrc: "/anatomy/shoulder-muscles.jpg",
    plateTitle:
      "OpenStax Fig 11.18 — Giải phẫu Lớp Nông & Lớp Sâu Cơ Thang (Trapezius), Cơ Trám (Rhomboids) & Cơ Nâng Vai",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Cools et al. (2007) — Rehabilitation of Scapular Muscle Balance (Trapezius Subdivisions)",
        source: "Am J Sports Med",
        pmid: "17606671",
        url: "https://pubmed.ncbi.nlm.nih.gov/17606671/",
      },
      {
        title: "Fenwick et al. (2009) — Core & Upper Back Muscle Recruitment During Rowing Exercises",
        source: "J Strength Cond Res",
        pmid: "19209075",
        url: "https://pubmed.ncbi.nlm.nih.gov/19209075/",
      },
    ],
    subdivisions: [
      {
        id: "trap-middle-rhomboid",
        name: "1. Cơ Thang Giữa & Cơ Trám (Mid-Traps & Rhomboids — Độ dày lưng giữa)",
        latin: "Trapezius (pars transversa) & Rhomboideus major/minor",
        originInsertion:
          "Mỏm gai C7–T5 → Bờ trong xương bả vai & mỏm cùng vai",
        fiberDirection:
          "Chạy ngang từ cột sống ra xương bả vai. Tối ưu khi chèo tạ ngang ngực với cùi chỏ mở ~45°–65°.",
        lengthenedExercise:
          "Chest-Supported T-Bar Row (Wide Pronated Grip — thả giãn bả vai ở đáy)",
        shortenedExercise:
          "Seated Wide-Grip Cable Row (giữ 1s ép chặt hai bả vai ở đỉnh)",
        ptCue:
          "Ở điểm đáy hãy để tạ kéo hai bả vai trượt tách xa nhau; khi kéo về hãy kẹp chặt một cây bút giữa hai xương bả vai.",
      },
      {
        id: "trap-lower",
        name: "2. Cơ Thang Dưới (Lower Trapezius — Giữ ổn định bả vai)",
        latin: "Trapezius (pars ascendens)",
        originInsertion: "Mỏm gai T6–T12 → Gai vai (Spine of scapula)",
        fiberDirection:
          "Chạy chếch từ dưới cột sống ngực lên trên-ngoài tới gai vai. Kéo bả vai hạ xuống và xoay lên trên.",
        lengthenedExercise:
          "Incline Prone Y-Raise (nằm sấp ghế dốc 30° nâng tạ chữ Y góc 120°)",
        shortenedExercise:
          "High-Pulley Face Pull kèm xoay ngoài vai & nâng tay chữ Y",
        ptCue:
          "Hạ xương bả vai đút vào túi quần sau trước khi nâng hai cánh tay lên theo hình chữ Y.",
      },
      {
        id: "erector-spinae",
        name: "3. Khối Cơ Dựng Sống & Cơ Thang Trên (Erector Spinae & Upper Traps)",
        latin: "Iliocostalis, Longissimus, Spinalis & Trapezius descendens",
        originInsertion:
          "Xương cùng, mào chậu & mỏm gai → Xương sườn, đốt sống & xương đòn ngoài",
        fiberDirection:
          "Cơ dựng sống chạy dọc hai bên cột sống; Cơ thang trên chạy chếch vào trong-lên trên góc 45°.",
        lengthenedExercise: "Romanian Deadlift (RDL) / 45° Back Extension",
        shortenedExercise:
          "Wide-Grip Barbell / Cable Kelso Shrug (nhún chéo lên-vào trong)",
        ptCue:
          "Với Shrug: nhún hai mỏm vai hướng về phía hai dái tai theo góc chéo vào trong thay vì cuộn tròn khớp vai.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Tập Row lưng trên nhưng bị mỏi căng cổ (Upper Traps / Levator Scapulae)",
        biomechanicalCause:
          "Rụt vai lên gần tai (Scapular elevation) khi kéo tạ nặng và ngửa cổ nhìn gương.",
        ptCorrection:
          "Giữ cổ trung tính thẳng hàng cột sống ngực, chủ động hạ vai xuống trước khi kéo cùi chỏ ra sau.",
      },
    ],
    sampleAiPrompt:
      "Thiết kế chương trình phát triển độ dày Lưng trên (Mid-Traps, Rhomboids, Rear Delts) và khắc phục gù lưng tròn vai cho học viên văn phòng.",
  },
  {
    id: "deltoids",
    name: "Cơ Vai 3 Bó (Trước – Giữa – Sau) & Chóp Xoay",
    latinName:
      "M. Deltoideus (Clavicularis, Acromialis, Spinalis) & Rotator Cuff",
    category: "upper_push",
    views: ["anterior", "posterior"],
    summary:
      "Cơ Delta có cấu trúc lông vũ đa hướng (Multipennate ở bó giữa) bao lấy khớp vai ở cả 3 mặt Trước – Ngoài – Sau. Để tạo bờ vai 3D tròn đều và bảo vệ khớp ổ chảo – cánh tay, PT phải huấn luyện riêng biệt từng bó theo đúng mặt phẳng giải phẫu.",
    hypertrophyScience:
      "Bó vai giữa (Lateral Deltoid) phát triển tốt nhất khi chịu lực căng ngay ở 30° đầu biên độ dạng vai (Lengthened position với cáp đặt ngang đùi/cổ tay thay vì tạ đơn có lực cản = 0 ở đáy) và di chuyển trong Mặt phẳng Xương bả vai (Scapular Plane — đưa tay chếch về trước 25°–30°).",
    plateSrc: "/anatomy/shoulder-joint.png",
    plateTitle:
      "Blausen 0797 & OpenStax — Giải phẫu Khớp Vai, Mỏm Cùng Vai & 3 Bó Cơ Delta",
    plateCredit: "Blausen Medical Communications (CC BY 3.0)",
    references: [
      {
        title: "Coratella et al. (2020) — Deltoid Heads Activation Across Lateral & Frontal Raises",
        source: "Int J Environ Res Public Health",
        pmid: "32825096",
        url: "https://pubmed.ncbi.nlm.nih.gov/32825096/",
      },
      {
        title: "Botton et al. (2013) — Electromyographical Analysis of the Deltoid Between Different Exercises",
        source: "Medicina Sportiva / J Sports Sci",
        pmid: "24998610",
        url: "https://pubmed.ncbi.nlm.nih.gov/24998610/",
      },
    ],
    subdivisions: [
      {
        id: "delt-anterior",
        name: "1. Vai Trước — Bó Đòn (Anterior Deltoid)",
        latin: "Deltoideus (pars clavicularis)",
        originInsertion: "1/3 ngoài xương đòn → Lồi củ delta xương cánh tay",
        fiberDirection: "Gập vai và đẩy qua đầu trong mặt phẳng xương bả vai.",
        lengthenedExercise:
          "Seated High-Incline (65°–75°) Dumbbell Overhead Press",
        shortenedExercise:
          "Seated Cable Front Raise (dây thừng kéo qua giữa hai đùi)",
        ptCue:
          "Đưa cùi chỏ hơi chếch vào trong 30° (Scapular plane) khi đẩy qua đầu để mở rộng khoang dưới mỏm cùng vai.",
      },
      {
        id: "delt-lateral",
        name: "2. Vai Giữa — Bó Cùng Vai (Lateral / Side Deltoid — Tạo độ rộng bờ vai)",
        latin: "Deltoideus (pars acromialis)",
        originInsertion:
          "Mỏm cùng vai (Acromion) → Lồi củ delta xương cánh tay",
        fiberDirection:
          "Cấu trúc đa lông vũ (Multipennate) sinh lực rất lớn khi dạng cánh tay ra ngang trong mặt phẳng xương bả vai (chếch trước 20°–30°).",
        lengthenedExercise:
          "Behind-the-Back Cable Lateral Raise (ròng rọc đặt ngang cổ tay để căng ngay ở đáy)",
        shortenedExercise: "Chest-Supported Dumbbell / Machine Lateral Raise",
        ptCue:
          "Hãy nghĩ 'vươn xa hai nắm đấm chạm vào hai bức tường hai bên phòng' thay vì nhún cầu vai nâng tạ lên cao.",
      },
      {
        id: "delt-posterior",
        name: "3. Vai Sau — Bó Gai Vai (Posterior / Rear Deltoid)",
        latin: "Deltoideus (pars spinalis)",
        originInsertion:
          "Bờ dưới gai xương bả vai → Lồi củ delta xương cánh tay",
        fiberDirection:
          "Duỗi ngang xương cánh tay (Horizontal Abduction) ở góc mở cánh tay ~45°–75° mà KHÔNG ép xương bả vai.",
        lengthenedExercise:
          "Reverse Pec Deck / Cross-Body Single-Arm Cable Rear Delt Fly",
        shortenedExercise:
          "Chest-Supported Rear Delt Row (cùi chỏ mở 60° ra ngoài)",
        ptCue:
          "Giữ yên xương bả vai, chỉ quét rộng hai cùi chỏ ra phía sau theo cung tròn rộng.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Bay vai (Lateral Raise) nhưng toàn vào Cầu vai (Upper Traps) và mỏi cổ",
        biomechanicalCause:
          "Nâng cánh tay quá cao trên 90° kèm nhún xương bả vai và xoay trong khớp vai (ngón út cao hơn ngón cái).",
        ptCorrection:
          "Hạ đầu ròng rọc cáp lên ngang đùi, giữ vai hạ thấp, vươn cánh tay trong mặt phẳng xương bả vai (chếch trước 25°) và dừng ngang tầm vai.",
      },
    ],
    sampleAiPrompt:
      "Xây dựng tổ hợp bài tập chuyên sâu cho Vai Giữa (Lateral Deltoid) và Vai Sau (Posterior Deltoid) không gây cấn mỏm cùng vai (Subacromial Impingement).",
  },
  {
    id: "biceps_forearm",
    name: "Cơ Tay Trước (Đầu Dài – Đầu Ngắn – Cơ Cánh Tay) & Cẳng Tay",
    latinName:
      "M. Biceps Brachii (Caput Longum & Breve), M. Brachialis & M. Brachioradialis",
    category: "arms_core",
    views: ["anterior"],
    summary:
      "Nhóm gập khuỷu gồm 3 cơ chính: Biceps Brachii (gồm Đầu dài bên ngoài tạo đỉnh Peak và Đầu ngắn bên trong tạo độ dày mặt trước), Cơ Cánh tay (Brachialis nằm sâu dưới Biceps đẩy Biceps nhô cao lên), và Cơ Cánh tay – Quay (Brachioradialis ở mặt ngoài cẳng tay).",
    hypertrophyScience:
      "Vì Biceps Brachii vượt qua cả khớp vai lẫn khớp khuỷu và bám vào lồi củ xương quay, nó chỉ phát huy hết công suất khi Cẳng tay Ngửa hoàn toàn (Supination). Thay đổi vị trí cùi chỏ so với thân người (Sau lưng vs. Trước người) sẽ dịch chuyển sức căng giữa Đầu dài và Đầu ngắn.",
    plateSrc: "/anatomy/biceps-triceps-forearm-openstax.jpg",
    plateTitle:
      "OpenStax Fig 11.20 — Giải phẫu Biceps Brachii (Đầu Dài/Ngắn), Brachialis, Brachioradialis & Cẳng Tay",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Oliveira et al. (2009) — Biceps Brachii Neuromuscular Activity in Incline vs. Preacher Curls",
        source: "J Sports Sci Med",
        pmid: "24149799",
        url: "https://pubmed.ncbi.nlm.nih.gov/24149799/",
      },
      {
        title: "Pedrosa et al. (2023) — Initial vs. Final Range of Motion in Elbow Flexion Hypertrophy",
        source: "J Strength Cond Res",
        pmid: "36826929",
        url: "https://pubmed.ncbi.nlm.nih.gov/36826929/",
      },
    ],
    subdivisions: [
      {
        id: "biceps-long-head",
        name: "1. Đầu Dài Cơ Nhị Đầu (Long Head — Tạo đỉnh chóp Peak mặt ngoài)",
        latin: "Biceps brachii (caput longum)",
        originInsertion: "Củ trên ổ chảo xương bả vai → Lồi củ xương quay",
        fiberDirection:
          "Khi cánh tay đưa ra sau thân người (Shoulder Extension), đầu dài được kéo giãn tối đa qua khớp vai (Lengthened).",
        lengthenedExercise:
          "Incline Dumbbell Curl (ghế nghiêng 45°–60°, cùi chỏ ở sau thân) / Bayesian Cable Curl",
        shortenedExercise: "Close-Grip EZ-Bar Curl",
        ptCue:
          "Khóa cố định cùi chỏ ở phía sau đường giữa thân người trong suốt pha cuốn tạ lên.",
      },
      {
        id: "biceps-short-head",
        name: "2. Đầu Ngắn Cơ Nhị Đầu (Short Head — Tạo độ dày mặt trong cánh tay)",
        latin: "Biceps brachii (caput breve)",
        originInsertion:
          "Mỏm quạ xương bả vai (Coracoid process) → Lồi củ xương quay",
        fiberDirection:
          "Hoạt động mạnh khi cánh tay đưa ra trước thân người (Shoulder Flexion) và cẳng tay xoay ngửa tối đa.",
        lengthenedExercise:
          "Preacher Curl (EZ-Bar hoặc Dumbbell trên đệm nghiêng)",
        shortenedExercise:
          "High-Cable Spider / Concentration Curl (xoay ngón út hướng lên trần ở đỉnh)",
        ptCue:
          "Ở đỉnh pha cuốn, chủ động xoay ngón út ra ngoài – lên trên (Supination) để vắt kiệt đầu ngắn.",
      },
      {
        id: "brachialis-brachioradialis",
        name: "3. Cơ Cánh Tay & Cơ Cánh Tay – Quay (Brachialis & Brachioradialis)",
        latin: "M. Brachialis & M. Brachioradialis",
        originInsertion:
          "Mặt trước xương cánh tay → Mỏm vẹt xương trụ (Brachialis) & Mỏm trâm quay",
        fiberDirection:
          "Gập khuỷu thuần túy cực khỏe khi cẳng tay ở vị trí Trung tính (Neutral / Hammer grip) hoặc Úp (Pronated).",
        lengthenedExercise: "Cross-Body / Cable Rope Hammer Curl",
        shortenedExercise: "Reverse-Grip EZ-Bar Curl",
        ptCue:
          "Giữ cổ tay thẳng cứng trung tính như cầm búa, cuốn chậm và dừng 1 giây ở góc khuỷu 90°.",
      },
    ],
    compensationFixes: [
      {
        symptom: "Cuốn tạ tay trước nhưng mỏi vai trước và đung đưa lưng dưới",
        biomechanicalCause:
          "Đưa cùi chỏ vung về phía trước (Shoulder flexion) để ăn gian điểm chết giữa biên độ.",
        ptCorrection:
          "Tựa lưng vào tường hoặc nằm trên ghế Preacher/Incline để cố định xương cánh tay, giảm 15% tạ và kiểm soát pha hạ 3 giây.",
      },
    ],
    sampleAiPrompt:
      "Phân tích cơ sinh học bộ 3 bài tập Biceps toàn diện (Bayesian Curl ở vị trí giãn, Preacher Curl và Hammer Curl) để phát triển cả đỉnh Biceps lẫn cơ Brachialis.",
  },
  {
    id: "triceps",
    name: "Cơ Tay Sau 3 Đầu (Đầu Dài – Đầu Ngoài – Đầu Trong)",
    latinName: "M. Triceps Brachii (Caput Longum, Laterale & Mediale)",
    category: "arms_core",
    views: ["posterior"],
    summary:
      "Cơ Tam đầu cánh tay chiếm tới ~60–65% tổng thể tích bắp tay trên. Trong khi Đầu ngoài và Đầu trong chỉ đi qua khớp khuỷu, riêng Đầu dài (Long Head — phần thịt lớn nhất mặt sau trong tay) bám vào củ dưới ổ chảo xương bả vai nên đi qua cả khớp vai lẫn khớp khuỷu.",
    hypertrophyScience:
      "Nghiên cứu đo MRI của Maeo et al. (2022) chứng minh tập Triceps ở vị trí đưa tay qua đầu (Overhead Cable Extension — kéo giãn Đầu dài) tạo mức phì đại cơ Đầu dài lớn hơn ~1.5 lần so với chỉ đẩy cáp đứng (Pushdown), trong khi Pushdown/JM Press lại kích hoạt mạnh Đầu ngoài và Đầu trong.",
    plateSrc: "/anatomy/biceps-triceps-forearm-openstax.jpg",
    plateTitle:
      "OpenStax Fig 11.20 — Giải phẫu Cơ Tam Đầu Cánh Tay (Triceps Brachii — Long & Lateral Head)",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Maeo et al. (2022) — Triceps Brachii Hypertrophy: Overhead vs. Neutral Arm Position (1.5x Long Head Growth)",
        source: "European Journal of Sport Science",
        pmid: "35819335",
        url: "https://pubmed.ncbi.nlm.nih.gov/35819335/",
      },
    ],
    subdivisions: [
      {
        id: "triceps-long",
        name: "1. Đầu Dài Cơ Tam Đầu (Long Head — Khối cơ lớn nhất mặt sau tay)",
        latin: "Triceps brachii (caput longum)",
        originInsertion:
          "Củ dưới ổ chảo xương bả vai (Infraglenoid tubercle) → Mỏm khuỷu xương trụ",
        fiberDirection:
          "Cơ đa khớp: vừa được kéo giãn mạnh khi đưa cánh tay qua đầu (Overhead), vừa tham gia duỗi vai khi kéo cáp từ trước mặt xuống sau hông.",
        lengthenedExercise:
          "Overhead Cable Rope Triceps Extension (đứng quay lưng vào máy cáp)",
        shortenedExercise:
          "Dual-Rope Triceps Kickback / Straight-Arm Pushdown",
        ptCue:
          "Giữ bắp tay cố định góc ~120°–150° hướng lên trên, hạ cẳng tay sâu ra sau gáy để cảm nhận vết căng dọc mặt sau nách.",
      },
      {
        id: "triceps-lateral-medial",
        name: "2. Đầu Ngoài & Đầu Trong (Lateral & Medial Head — Hình móng ngựa mặt ngoài)",
        latin: "Triceps brachii (caput laterale & mediale)",
        originInsertion:
          "Mặt sau xương cánh tay → Mỏm khuỷu xương trụ (Olecranon)",
        fiberDirection:
          "Duỗi khuỷu thuần túy cực mạnh khi cánh tay ở cạnh sườn hoặc đẩy tạ hẹp tay.",
        lengthenedExercise:
          "JM Press / Close-Grip Bench Press / EZ-Bar Skullcrusher",
        shortenedExercise:
          "Cable Dual-Rope / V-Bar Triceps Pushdown (tách dây ở đáy)",
        ptCue:
          "Khóa cố định khớp vai, duỗi thẳng hoàn toàn khớp khuỷu ở đáy và giữ 1 giây.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Đau nhói đỉnh mỏm khuỷu (Triceps Tendinopathy) khi tập Skullcrusher thanh đòn",
        biomechanicalCause:
          "Mô-men xoắn cực đại rơi đúng vào góc khuỷu gập sâu với cổ tay bị khóa cứng trên thanh thẳng.",
        ptCorrection:
          "Chuyển sang sử dụng Dây cáp đôi (Dual Rope Overhead Extension) để đường lực (Line of Resistance) đi êm theo cung khớp khuỷu.",
      },
    ],
    sampleAiPrompt:
      "Thiết kế lịch tập Triceps tối ưu cả 3 đầu (Long, Lateral, Medial Head) dựa trên nghiên cứu kháng lực vị trí kéo giãn (Overhead vs Pushdown) mà không gây đau khuỷu tay.",
  },
  {
    id: "abs_obliques",
    name: "Cơ Bụng 6 Múi, Cơ Chéo Bụng & Hộp Cơ Lõi (Core)",
    latinName:
      "M. Rectus Abdominis, Obliquus Externus/Internus & Transversus Abdominis",
    category: "arms_core",
    views: ["anterior"],
    summary:
      "Hệ cơ thành bụng gồm 4 lớp đan chéo nhau như chiếc đai lưng sinh học tự nhiên: Cơ Thẳng bụng (tạo 6–8 múi nhờ các trẻ gân ngang Tendinous intersections), Cơ Chéo bụng ngoài/trong (kiểm soát xoay và nghiêng thân), và Cơ Ngang bụng sâu nhất (tạo áp lực ổ bụng IAP bảo vệ cột sống).",
    hypertrophyScience:
      "Sai lầm phổ biến nhất khi tập bụng là chỉ gập khớp háng (Hip Flexion bằng cơ Iliopsoas khi nâng chân thẳng mà lưng vẫn phẳng). Để cơ Thẳng bụng thực sự co rút và dày múi, bắt buộc phải có chuyển động Cuộn tròn Cột sống Ngực – Thắt lưng (Spinal Flexion: kéo xương ức lại gần xương mu hoặc cuộn xương mu lên xương ức).",
    plateSrc: "/anatomy/core-abdomen.jpg",
    plateTitle:
      "OpenStax Fig 11.12 — Giải phẫu 4 Lớp Cơ Thành Bụng (Rectus Abdominis, Obliques, Transversus)",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "McGill (2010) — Core Training: Evidence Translating to Better Performance and Injury Prevention",
        source: "Strength and Conditioning Journal",
        pmid: "20179652",
        url: "https://pubmed.ncbi.nlm.nih.gov/20179652/",
      },
      {
        title: "Escamilla et al. (2006) — Electromyographic Analysis of Traditional and Nontraditional Abdominal Exercises",
        source: "Physical Therapy (PTJ)",
        pmid: "16648330",
        url: "https://pubmed.ncbi.nlm.nih.gov/16648330/",
      },
    ],
    subdivisions: [
      {
        id: "rectus-upper-lower",
        name: "1. Cơ Thẳng Bụng — Phần Trên & Phần Dưới (Rectus Abdominis)",
        latin: "M. Rectus abdominis & Intersectiones tendineae",
        originInsertion:
          "Mào mu & khớp mu → Sụn sườn 5–7 & mỏm mũi kiếm xương ức",
        fiberDirection:
          "Chạy thẳng đứng dọc đường trắng giữa. Gập đốt sống ngực từ trên xuống (Crunch) ưu tiên phần trên; cuộn xương chậu từ dưới lên (Reverse Crunch) ưu tiên phần dưới.",
        lengthenedExercise:
          "Weighted Cable Kneeling Crunch / Swiss-Ball Crunch (duỗi nhẹ lưng trên qua bóng ở đầu pha)",
        shortenedExercise:
          "Hanging / Decline Bench Posterior Pelvic Tilt Leg Raise (cuộn mông nhấc khỏi đệm)",
        ptCue:
          "Thở ra hết và cuộn từng đốt sống như đang cuộn một tấm thảm — nếu xương chậu không cuộn lên thì bạn mới chỉ đang tập cơ gập háng.",
      },
      {
        id: "obliques-transversus",
        name: "2. Cơ Chéo Bụng Trong/Ngoài & Cơ Ngang Bụng (Obliques & TVA)",
        latin: "M. Obliquus externus, internus & Transversus abdominis",
        originInsertion:
          "Xương sườn 5–12 ↔ Mào chậu, dây chằng bẹn & đường trắng",
        fiberDirection:
          "Chạy chéo chữ X quanh eo. Vừa tạo đường cắt V-line hai bên bụng, vừa chống xoay/chống nghiêng cột sống dưới tải nặng.",
        lengthenedExercise: "High-to-Low Cable Woodchopper / Pallof Press",
        shortenedExercise: "Side Plank Hip Lift & Suitcase Dumbbell Carry",
        ptCue:
          "Gồng cứng 360° quanh thành bụng như chuẩn bị đỡ một cú đấm vào bụng (Abdominal Bracing).",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Tập gập bụng / nâng chân nhưng chỉ mỏi buốt thắt lưng dưới và mặt trước háng",
        biomechanicalCause:
          "Cơ gập háng (Psoas major) kéo đốt sống thắt lưng L1–L5 ưỡn quá mức (Anterior Pelvic Tilt) khi bụng dưới không đủ khỏe để giữ xương chậu.",
        ptCorrection:
          "Hơi co nhẹ gối, ép thắt lưng chạm sàn (Posterior Pelvic Tilt) trước khi nâng và chỉ tính biên độ từ lúc xương cụt cuộn nhấc khỏi ghế.",
      },
    ],
    sampleAiPrompt:
      "Phân biệt cơ sinh học giữa Spinal Flexion (tập cơ bụng thực sự) và Hip Flexion (vào cơ Psoas gây đau lưng), kèm lịch tập Core cho cả thẩm mỹ lẫn bảo vệ L4–L5.",
  },
  {
    id: "glutes",
    name: "Cơ Mông 3 Phần (Mông Lớn – Mông Nhỡ – Mông Bé)",
    latinName: "M. Gluteus Maximus, Gluteus Medius & Gluteus Minimus",
    category: "lower_body",
    views: ["posterior"],
    summary:
      "Nhóm cơ sinh lực lớn nhất cơ thể. Cơ Mông lớn (Gluteus Maximus) tạo độ tròn đầy mặt sau và duỗi háng mạnh mẽ; Cơ Mông nhỡ & Mông bé (Gluteus Medius/Minimus) nằm ở mặt bên trên khung chậu (Upper Shelf), quyết định độ tròn phần mông trên và giữ khung chậu không bị sập khi đứng 1 chân.",
    hypertrophyScience:
      "Nghiên cứu của Plotkin et al. (2023) và Kubo et al. (2019) chỉ ra Cơ Mông lớn đạt cánh tay đòn duỗi háng lớn nhất ở Đỉnh co rút (0° Hip Extension — bài Hip Thrust), nhưng lại chịu sức căng cơ học kéo giãn (Stretch-mediated hypertrophy) cực lớn ở đáy các bài Squat sâu / Bulgarian Split Squat và RDL. Kết hợp cả 2 nhóm bài mang lại kết quả tối ưu nhất.",
    plateSrc: "/anatomy/glute-superficial-sobotta-1909.png",
    plateTitle: "Sobotta 1909 — Cơ mông lớn nguyên vẹn và cân vùng mông",
    plateCredit: "Johannes Sobotta, Atlas and Text-book of Human Anatomy (1909), hình 294 — Public domain",
    plateLabel: "Lớp nông — Mông lớn",
    plateDescription:
      "Nhìn sau-bên: cơ mông lớn còn nguyên, thấy hướng thớ cơ và liên hệ với dải chậu–chày. Phần trên cơ mông nhỡ được ghi nhãn cùng cân mông; cơ mông bé nằm sâu nên không thấy ở hình này. Nhãn gốc dùng thuật ngữ Latin cổ Glutaeus.",
    plateSourceUrl: "https://commons.wikimedia.org/wiki/File:Sobo_1909_294.png",
    additionalPlates: [
      {
        src: "/anatomy/glute-medius-sobotta-1909.png",
        title: "Sobotta 1909 — Cơ mông nhỡ và các cơ xoay ngoài sâu",
        credit: "Johannes Sobotta, Atlas and Text-book of Human Anatomy (1909), hình 295 — Public domain",
        label: "Lớp trung gian — Mông nhỡ",
        description:
          "Cơ mông lớn đã cắt và lật để lộ cơ mông nhỡ, cơ hình lê, cơ sinh đôi, gân cơ bịt trong và cơ vuông đùi. Cơ mông bé vẫn nằm sâu dưới cơ mông nhỡ.",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Sobo_1909_295.png",
      },
      {
        src: "/anatomy/glute-deep-openstax.jpg",
        title: "OpenStax — Cơ mông bé và lớp sâu vùng hông–đùi",
        credit: "OpenStax, Anatomy & Physiology, hình 1122 (bản gốc 2013) — CC BY 4.0",
        label: "Lớp sâu — Mông bé",
        description:
          "Xem panel dưới bên phải: cơ mông lớn và mông nhỡ đã cắt (cut) để lộ cơ mông bé và cơ hình lê. Hai panel còn lại là mặt trước vùng chậu–đùi.",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:1122_Gluteal_Muscles_that_Move_the_Femur.jpg",
      },
    ],
    references: [
      {
        title: "Plotkin et al. (2023) — Hip Thrust vs. Back Squat Effects on Gluteus Maximus Hypertrophy",
        source: "Front Physiol / Sports Med",
        pmid: "37456934",
        url: "https://pubmed.ncbi.nlm.nih.gov/37456934/",
      },
      {
        title: "Kubo et al. (2019) — Effects of Squat Training with Different Depths on Lower Limb Muscle Volumes",
        source: "Eur J Appl Physiol",
        pmid: "31230172",
        url: "https://pubmed.ncbi.nlm.nih.gov/31230172/",
      },
    ],
    subdivisions: [
      {
        id: "glute-maximus",
        name: "1. Cơ Mông Lớn — Bó Trên & Bó Dưới (Gluteus Maximus)",
        latin: "M. Gluteus maximus",
        originInsertion:
          "Mặt sau xương chậu, xương cùng & dây chằng cùng-ụ ngồi → Dải chậu-chày & lồi củ cơ mông xương đùi",
        fiberDirection:
          "Chạy chếch 45° từ trong-trên xuống ngoài-dưới. Vừa duỗi háng (Hip extension), vừa xoay ngoài đùi.",
        lengthenedExercise:
          "Front-Foot Elevated Bulgarian Split Squat (nghiêng thân 20° về trước) / Romanian Deadlift",
        shortenedExercise:
          "Barbell / Machine Hip Thrust (giữ 2 giây khóa mông ở đỉnh kèm cuộn nhẹ xương chậu)",
        ptCue:
          "Ở bài Split Squat: đẩy hông lùi chéo ra sau về phía gót chân sau; ở bài Hip Thrust: thu cằm mắt nhìn về trước và cuộn xương mu lên ở 20° cuối.",
      },
      {
        id: "glute-medius-minimus",
        name: "2. Cơ Mông Nhỡ & Mông Bé (Gluteus Medius & Minimus — Phần Mông Trên / Upper Shelf)",
        latin: "M. Gluteus medius & minimus",
        originInsertion:
          "Mặt ngoài cánh xương chậu → Mấu chuyển lớn xương đùi (Greater trochanter)",
        fiberDirection:
          "Chạy hình quạt từ mào chậu xuống mấu chuyển lớn. Dạng háng (Hip Abduction) trong mặt phẳng trán hơi đưa chân ra sau 15°.",
        lengthenedExercise:
          "Standing Cable Hip Abduction (đưa chân chéo qua trước chân trụ rồi đá chéo ra sau 15°)",
        shortenedExercise:
          "45° Side-Lying Hip Abduction / Seated Abduction Machine",
        ptCue:
          "Đá gót chân chếch ra sau góc 15°–20° (ngón chân hơi hướng nhẹ xuống sàn) để cô lập hoàn toàn cơ Mông nhỡ mà không bị cơ TFL (mặt trước hông) cướp tải.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Tập Hip Thrust / Glute Bridge nhưng chỉ mỏi căng Thắt lưng dưới hoặc chuột rút Gân kheo",
        biomechanicalCause:
          "Ưỡn lưng dưới ở đỉnh (Lumbar hyperextension) thay vì duỗi khớp háng, hoặc đặt bàn chân quá xa mông làm gân kheo phải gánh tải.",
        ptCorrection:
          "Đặt gót chân sao cho ở đỉnh bài nâng, ống chân thẳng đứng 90° so với sàn; giữ lồng ngực hạ và chỉ đẩy bằng gót chân kèm cuộn nhẹ xương chậu (Posterior Pelvic Tilt).",
      },
    ],
    sampleAiPrompt:
      "Thiết kế buổi tập Mông toàn diện kết hợp bài Lengthened (Bulgarian Split Squat/RDL) và Shortened (Hip Thrust/Cable Kickback angle 30°) tập trung vào cả Gluteus Maximus và Gluteus Medius.",
  },
  {
    id: "quads_adductors",
    name: "Cơ Đùi Trước (4 Đầu) & Nhóm Cơ Khép Đùi",
    latinName:
      "M. Quadriceps Femoris (Rectus Femoris, Vastus Lateralis, Medialis, Intermedius) & Adductores",
    category: "lower_body",
    views: ["anterior"],
    summary:
      "Cơ Tứ đầu đùi gồm 3 đầu đơn khớp (Vastus Lateralis mặt ngoài, Vastus Medialis/VMO giọt lệ mặt trong, Vastus Intermedius ở giữa) và 1 đầu đa khớp (Rectus Femoris đi qua cả khớp háng lẫn khớp gối). Nhóm cơ Khép đùi (Adductor Magnus) tạo độ dày mặt trong đùi và hỗ trợ mạnh mẽ khi Squat sâu.",
    hypertrophyScience:
      "Theo Kubo et al. (2019) và Pedrosa et al. (2022), trong các bài Squat / Leg Press (vừa gập gối vừa gập háng), 3 đầu Vastus và Adductor Magnus phát triển rất mạnh nhưng cơ Thẳng đùi (Rectus Femoris) hầu như không đổi chiều dài. Muốn phát triển Rectus Femoris tối đa bắt buộc phải có bài Duỗi gối khi Háng giữ mở (Seated/Reclined Leg Extension hoặc Reverse Nordic).",
    plateSrc: "/anatomy/hip-gluteal.jpg",
    plateTitle:
      "OpenStax Fig 11.22 — Giải phẫu 4 Đầu Cơ Tứ Đầu Đùi (Quadriceps) & Nhóm Cơ Khép Đùi (Adductors)",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Pedrosa et al. (2022) — Partial Range of Motion at Long Muscle Lengths Maximizes Quad Hypertrophy",
        source: "European Journal of Sport Science",
        pmid: "33977835",
        url: "https://pubmed.ncbi.nlm.nih.gov/33977835/",
      },
      {
        title: "Kubo et al. (2019) — Vastus & Adductor Magnus vs. Rectus Femoris Growth in Deep Squats",
        source: "Eur J Appl Physiol",
        pmid: "31230172",
        url: "https://pubmed.ncbi.nlm.nih.gov/31230172/",
      },
    ],
    subdivisions: [
      {
        id: "quad-vastus",
        name: "1. Ba Đầu Vastus: Đùi Ngoài, Giọt Lệ Trong (VMO) & Đùi Giữa",
        latin:
          "Vastus lateralis, Vastus medialis obliquus (VMO) & Vastus intermedius",
        originInsertion:
          "Thân xương đùi & đường ráp → Gân cơ tứ đầu → Xương bánh chè → Lồi củ chày",
        fiberDirection:
          "Duỗi gối thuần túy; sinh lực cực đại khi đầu gối đẩy vượt mũi chân có kiểm soát (Maximal Knee Flexion dưới tải).",
        lengthenedExercise:
          "Heel-Elevated Hack Squat / Pendulum Squat / High-Bar Squat (kê gót 2–3cm)",
        shortenedExercise: "Terminal Knee Extension / Leg Press đặt chân thấp",
        ptCue:
          "Giữ lưng thẳng đứng, chủ động đẩy đầu gối tiến về phía trước theo đúng hướng ngón chân thứ 2–3 để tối đa hóa góc gập gối.",
      },
      {
        id: "quad-rectus-femoris",
        name: "2. Cơ Thẳng Đùi (Rectus Femoris — Đầu cơ chạy dọc chính giữa đùi)",
        latin: "M. Rectus femoris",
        originInsertion:
          "Gai chậu trước dưới (AIIS) → Xương bánh chè → Lồi củ chày",
        fiberDirection:
          "Cơ đa khớp duy nhất của Tứ đầu đùi. Chỉ được kéo giãn hoàn toàn khi Khớp háng duỗi (ngả lưng ra sau) kết hợp Khớp gối gập sâu.",
        lengthenedExercise:
          "Reclined-Seat Leg Extension (ngả tựa lưng ghế ra sau 30°) / Reverse Nordic Curl",
        shortenedExercise: "Seated Leg Extension (giữ 1 giây khóa đỉnh)",
        ptCue:
          "Ngả phần tựa lưng máy Leg Extension ra sau và kéo sâu cẳng chân xuống gầm ghế ở điểm đáy.",
      },
      {
        id: "adductors-inner-thigh",
        name: "3. Nhóm Cơ Khép Đùi (Adductor Magnus, Longus & Gracilis)",
        latin: "Mm. Adductores & M. Gracilis",
        originInsertion: "Xương mu & ụ ngồi → Đường ráp mặt sau xương đùi",
        fiberDirection:
          "Khép đùi về đường giữa và duỗi háng cực khỏe ở đáy Squat rộng chân.",
        lengthenedExercise:
          "Wide-Stance Squat / Cossack Squat & Seated Hip Adduction Machine (mở rộng có kiểm soát)",
        shortenedExercise: "Copenhagen Adductor Plank",
        ptCue:
          "Ở máy ép đùi trong: kiểm soát 3 giây pha mở rộng và dừng 1 giây ở điểm căng nhất.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Squat muốn vào Đùi trước nhưng toàn vào Mông và Lưng dưới (Squat-morning)",
        biomechanicalCause:
          "Thiếu độ gập mu cổ chân (Ankle dorsiflexion) làm đầu gối không đẩy ra trước được, buộc hông phải bật cao và gập thân người.",
        ptCorrection:
          "Sử dụng giày cử tạ (Weightlifting shoes) hoặc kê đĩa tạ dưới gót chân 2.5cm, hoặc chuyển sang Hack Squat / Pendulum Squat.",
      },
    ],
    sampleAiPrompt:
      "Phân tích tại sao Squat thông thường không kích thích tối đa cơ Thẳng đùi (Rectus Femoris) và lập giáo án phát triển toàn diện 4 đầu Quadriceps.",
  },
  {
    id: "hamstrings",
    name: "Cơ Gân Kheo — Đùi Sau (3 Đầu Đa Khớp & 1 Đầu Đơn Khớp)",
    latinName:
      "M. Biceps Femoris (Caput Longum & Breve), M. Semitendinosus & M. Semimembranosus",
    category: "lower_body",
    views: ["posterior"],
    summary:
      "Nhóm Gân kheo gồm 4 đầu cơ chia làm 2 cơ chế hoàn toàn khác nhau: 3 cơ đa khớp (Đầu dài Nhị đầu đùi, Bán gân, Bán màng) bám từ ụ ngồi nên đi qua cả khớp háng lẫn khớp gối; riêng Đầu ngắn cơ Nhị đầu đùi (Biceps femoris short head) bám từ xương đùi nên CHỈ đi qua khớp gối.",
    hypertrophyScience:
      "Nghiên cứu kinh điển của Maeo et al. (2021) chứng minh Seated Leg Curl (ngồi gập đùi — hông gập 90° làm 3 đầu đa khớp được kéo giãn tối đa) tạo mức phì đại cơ Gân kheo lớn hơn ~1.4 lần so với Lying Leg Curl. Đồng thời, vì bài RDL (duỗi háng) không thể kích hoạt Đầu ngắn Nhị đầu đùi, một chương trình hoàn chỉnh bắt buộc phải có cả Seated Leg Curl lẫn RDL.",
    plateSrc: "/anatomy/hip-gluteal.jpg",
    plateTitle:
      "OpenStax Fig 11.22 — Giải phẫu Bóc tách Nhóm Cơ Gân Kheo (Biceps Femoris, Semitendinosus, Semimembranosus)",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Maeo et al. (2021) — Greater Hamstrings Muscle Hypertrophy in Seated vs. Prone Leg Curl (~1.4x Growth)",
        source: "Medicine & Science in Sports & Exercise",
        pmid: "33009197",
        url: "https://pubmed.ncbi.nlm.nih.gov/33009197/",
      },
      {
        title: "Bourne et al. (2017) — Framework for Strengthening the Hamstring Muscles (Hip Extension vs Knee Flexion)",
        source: "British Journal of Sports Medicine (BJSM)",
        pmid: "27660368",
        url: "https://pubmed.ncbi.nlm.nih.gov/27660368/",
      },
    ],
    subdivisions: [
      {
        id: "hamstring-biarticular",
        name: "1. Ba Cơ Gân Kheo Đa Khớp (Đầu Dài Nhị Đầu, Cơ Bán Gân & Cơ Bán Màng)",
        latin:
          "Biceps femoris (caput longum), Semitendinosus & Semimembranosus",
        originInsertion:
          "Ụ ngồi (Ischial tuberosity) → Đầu xương mác & mặt trong đầu trên xương chày",
        fiberDirection:
          "Vừa duỗi háng (Hip Hinge) vừa gập gối. Đạt độ giãn cơ học cực đại khi khớp háng gập 90° đồng thời khớp gối duỗi.",
        lengthenedExercise:
          "Seated Leg Curl (nghiêng nhẹ thân về trước 15°) & Barbell Romanian Deadlift (RDL)",
        shortenedExercise: "Lying / Prone Leg Curl & Glute-Ham Raise",
        ptCue:
          "Ở bài RDL: mở khóa nhẹ gối 15°, đẩy mông lùi thẳng ra bức tường phía sau và dừng ngay khi mông hết lùi được nữa (không gập lưng dưới).",
      },
      {
        id: "hamstring-short-head",
        name: "2. Đầu Ngắn Cơ Nhị Đầu Đùi (Biceps Femoris Short Head — Cơ Đơn Khớp Gối)",
        latin: "Biceps femoris (caput breve)",
        originInsertion:
          "Đường ráp xương đùi (Linea aspera) → Đầu trên xương mác",
        fiberDirection:
          "Chỉ vượt qua khớp gối (KHÔNG đi qua khớp háng), nên hoàn toàn không tham gia vào bài Deadlift / RDL.",
        lengthenedExercise:
          "Seated Leg Curl (kiểm soát 3 giây pha duỗi gối)",
        shortenedExercise: "Single-Leg Lying / Standing Leg Curl",
        ptCue:
          "Giữ mu bàn chân gập nhẹ về phía ống đồng (Dorsiflexion) khi gập đùi để huy động tối đa chuỗi gân kheo – bụng chân.",
      },
    ],
    compensationFixes: [
      {
        symptom:
          "Tập Romanian Deadlift (RDL) nhưng chỉ mỏi buốt Thắt lưng dưới thay vì căng Gân kheo",
        biomechanicalCause:
          "Để thanh đòn trôi xa ống quyển và tiếp tục hạ tạ xuống sàn bằng cách gập đốt sống thắt lưng L4–L5 sau khi khớp háng đã hết biên độ lùi.",
        ptCorrection:
          "Ép thanh đòn trượt sát đùi/ống quyển bằng cơ Xô, chỉ tập trung đẩy mông lùi ngang ra sau và dừng ngay dưới gối khi mông dừng di chuyển.",
      },
    ],
    sampleAiPrompt:
      "Giải thích nghiên cứu Maeo et al. (2021) về Seated vs. Lying Leg Curl và tại sao RDL không thể tác động vào Đầu ngắn cơ Nhị đầu đùi (Biceps femoris short head), kèm giáo án đùi sau toàn diện.",
  },
  {
    id: "calves",
    name: "Cơ Bắp Chân (Bụng Chân – Cơ Dép) & Cơ Cẳng Chân Trước",
    latinName:
      "M. Gastrocnemius, M. Soleus (Triceps Surae) & M. Tibialis Anterior",
    category: "lower_body",
    views: ["posterior", "anterior"],
    summary:
      "Phức hợp Tam đầu cẳng chân gồm Cơ Bụng chân (Gastrocnemius — 2 đầu nông vượt qua cả khớp gối lẫn cổ chân) và Cơ Dép (Soleus — nằm sâu bên dưới, chiếm ~60% thể tích bắp chân và chỉ đi qua khớp cổ chân), kết hợp với Cơ Chày trước (Tibialis Anterior) ở mặt trước ống đồng.",
    hypertrophyScience:
      "Do Gân Achilles có khả năng lưu trữ năng lượng đàn hồi cực cao (như lò xo), nếu nhón chân nhanh có độ nảy thì gân sẽ làm việc thay cơ. Các nghiên cứu của Kassiano et al. (2023) chứng minh tập ở nửa biên độ kéo giãn sâu có dừng tĩnh (Lengthened-biased Standing Calf Raise) tạo mức phì đại Gastrocnemius vượt trội.",
    plateSrc: "/anatomy/calves-shin-openstax.jpg",
    plateTitle:
      "OpenStax Fig 11.23 — Giải phẫu Cơ Bụng Chân (Gastrocnemius), Cơ Dép (Soleus), Gân Achilles & Cơ Chày Trước",
    plateCredit: "OpenStax Anatomy & Physiology 2e (Rice University, CC BY 4.0)",
    references: [
      {
        title: "Kassiano et al. (2023) — Gastrocnemius Muscle Hypertrophy: Initial Lengthened Partial vs. Full ROM",
        source: "Journal of Strength and Conditioning Research",
        pmid: "37015016",
        url: "https://pubmed.ncbi.nlm.nih.gov/37015016/",
      },
      {
        title: "Kinoshita et al. (2023) — Triceps Surae Hypertrophy in Standing vs. Seated Calf Raise",
        source: "Frontiers in Physiology",
        pmid: "38179124",
        url: "https://pubmed.ncbi.nlm.nih.gov/38179124/",
      },
    ],
    subdivisions: [
      {
        id: "gastrocnemius",
        name: "1. Cơ Bụng Chân — Đầu Trong & Đầu Ngoài (Gastrocnemius)",
        latin: "M. Gastrocnemius (caput mediale & laterale)",
        originInsertion:
          "Lồi cầu trong & ngoài xương đùi → Gân Achilles → Xương gót",
        fiberDirection:
          "Cơ đa khớp đi qua cả khớp gối và cổ chân. Chỉ phát lực và chịu kéo giãn tối đa khi Đầu gối Duỗi Thẳng (Standing Calf Raise).",
        lengthenedExercise:
          "Standing Straight-Knee Calf Raise / Leg Press Calf Raise (dừng 2s ở điểm hạ sâu gót)",
        shortenedExercise:
          "Standing Calf Raise (nhón hết biên độ lên khớp bàn – ngón chân cái)",
        ptCue:
          "Khóa thẳng khớp gối, hạ gót chân sâu hết cỡ và dừng tĩnh 2 giây ở đáy để triệt tiêu độ nảy đàn hồi của gân Achilles.",
      },
      {
        id: "soleus-tibialis",
        name: "2. Cơ Dép (Soleus) & Cơ Chày Trước (Tibialis Anterior)",
        latin: "M. Soleus & M. Tibialis anterior",
        originInsertion:
          "Mặt sau đầu trên xương chày/mác → Gân Achilles (Soleus) | Mặt ngoài xương chày → Nền xương bàn 1 (Tibialis)",
        fiberDirection:
          "Khi gối gập 90° (Seated Calf Raise), Gastrocnemius bị chùng và nhường tải cho Soleus; Tibialis Anterior gập mu chân chống đau ống đồng.",
        lengthenedExercise:
          "Seated Bent-Knee Calf Raise & Tibialis Bar / Wall Tibialis Raise",
        shortenedExercise: "Isometric Seated Calf Hold ở đỉnh co rút",
        ptCue:
          "Giữ nhịp chậm 3-2-1-1, tập trung đẩy lực thẳng qua ngón chân cái và ngón trỏ (không để cổ chân vẹo ra ngoài).",
      },
    ],
    compensationFixes: [
      {
        symptom: "Tập Bắp chân nhiều nhưng không to và hay mỏi gân Achilles",
        biomechanicalCause:
          "Nhấp nhả nhanh ở nửa trên biên độ (Bouncing) làm Gân Achilles lưu trữ và hoàn trả năng lượng đàn hồi thay vì bắt sợi cơ làm việc.",
        ptCorrection:
          "Bắt buộc dừng tĩnh (Dead-stop pause) 2 giây ở điểm hạ gót thấp nhất (Lengthened position) ở mỗi lần lặp.",
      },
    ],
    sampleAiPrompt:
      "Phân tích cơ sinh học Standing vs. Seated Calf Raise (Kinoshita et al. 2023 & Kassiano et al. 2023) cho Gastrocnemius và Soleus, kèm quy trình tập bắp chân chống viêm gân Achilles.",
  },
];

export const HYPERTROPHY_EXERCISES: HypertrophyExercise[] = [
  {
    id: "incline-db-press",
    name: "30° Incline Dumbbell Press",
    vietnameseName: "Đẩy Ngực Trên Tạ Đơn Ghế Dốc 30°",
    pattern: "Push",
    equipment: "Dumbbell + Ghế điều chỉnh 30°",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Chỉnh ghế dốc đúng 30° (không quá 45° để tránh sang vai trước). Thu và hạ xương bả vai, mở cùi chỏ góc ~50°–60° theo mặt phẳng xương bả vai, hạ sâu tạ ngang xương đòn và dừng 1 giây trước khi đẩy lên.",
    commonMistake:
      "Chỉnh ghế quá cao (45°–60°) và mở cùi chỏ ngang 90° làm tải dồn sang cơ Vai trước.",
    targets: [
      {
        muscleId: "chest",
        role: "primary",
        activationPct: 95,
        targetedHeads: "Bó Đòn Ngực Trên (Clavicular Head) & Bó Ức trên",
        biomechanicalWhy:
          "Góc ghế 30° đặt đường lực trọng trường trùng khớp với hướng chạy chếch lên của các thớ cơ bó đòn.",
      },
      {
        muscleId: "deltoids",
        role: "synergist",
        activationPct: 70,
        targetedHeads: "Vai Trước (Anterior Deltoid)",
        biomechanicalWhy: "Đồng vận gập vai trong mặt phẳng xương bả vai.",
      },
      {
        muscleId: "triceps",
        role: "synergist",
        activationPct: 60,
        targetedHeads:
          "Đầu Ngoài & Đầu Trong Cơ Tam Đầu (Lateral & Medial Head)",
        biomechanicalWhy: "Duỗi khớp khuỷu ở 1/2 trên của pha đẩy.",
      },
    ],
  },
  {
    id: "cable-chest-fly",
    name: "Seated Converging Cable Chest Fly",
    vietnameseName: "Ép Ngực Dây Cáp Ngồi Có Tựa Lưng",
    pattern: "Push",
    equipment: "Dual Adjustable Pulley + Ghế tựa đứng",
    resistanceProfile: "Mid-Range (Giữa biên độ)",
    setupAndExecution:
      "Ngồi tựa lưng cố định xương bả vai, cùi chỏ hơi mở khóa cố định góc 15°, khép hai bắp tay theo vòng cung rộng cho tới khi hai cổ tay chạm nhau hoặc bắt chéo nhẹ trước ngực.",
    commonMistake:
      "Biến bài Fly thành bài Press hoặc nhô hai vai về phía trước ở cuối pha ép.",
    targets: [
      {
        muscleId: "chest",
        role: "primary",
        activationPct: 96,
        targetedHeads: "Toàn bộ Bó Ức – Sườn (Sternocostal) & Rãnh ngực trong",
        biomechanicalWhy:
          "Dây cáp giữ lực căng liên tục ngay cả khi hai cánh tay đã khép sát đường giữa cơ thể (Shortened position).",
      },
      {
        muscleId: "deltoids",
        role: "stabilizer",
        activationPct: 45,
        targetedHeads: "Vai Trước (Anterior Deltoid)",
        biomechanicalWhy: "Giữ ổn định khớp vai trong mặt phẳng ngang.",
      },
    ],
  },
  {
    id: "cable-lateral-raise",
    name: "Behind-the-Back Cable Lateral Raise",
    vietnameseName: "Bay Vai Giữa Dây Cáp Đặt Ngang Cổ Tay",
    pattern: "Push",
    equipment: "Single Cable Pulley (Đặt cao ngang cổ tay/đùi)",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Đặt ròng rọc ngang cổ tay, dây cáp đi qua phía sau mông. Vươn cánh tay lên ngang vai theo mặt phẳng xương bả vai (hơi chếch về trước 25°).",
    commonMistake:
      "Đặt ròng rọc sát sàn và nhún cầu vai để giật tạ lên quá đầu.",
    targets: [
      {
        muscleId: "deltoids",
        role: "primary",
        activationPct: 96,
        targetedHeads: "Vai Giữa (Lateral / Acromial Deltoid)",
        biomechanicalWhy:
          "Tạo cánh tay đòn vuông góc 90° với xương cánh tay ngay ở vị trí cơ vai giữa đang kéo giãn qua thân người.",
      },
      {
        muscleId: "upper_back_traps",
        role: "stabilizer",
        activationPct: 40,
        targetedHeads: "Cơ Thang Trên & Dưới (Scapular Upward Rotators)",
        biomechanicalWhy:
          "Giữ ổn định và xoay nhẹ xương bả vai lên trên để tạo khoảng trống cho mỏm cùng vai.",
      },
    ],
  },
  {
    id: "neutral-lat-pulldown",
    name: "Neutral-Grip / Single-Arm Lat Pulldown",
    vietnameseName: "Kéo Xô Tay Cầm Trung Tính (Ưu Tiên Xô Dưới)",
    pattern: "Pull",
    equipment: "Lat Pulldown Machine / Single Handle",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Ngồi thẳng hoặc hơi ngả nhẹ 10°, giữ cùi chỏ hướng về phía trước (Mặt phẳng đứng dọc — Sagittal Plane), kéo cùi chỏ đi sát mạng sườn xuống phía mào chậu.",
    commonMistake:
      "Ngả người 45° ra sau và mở rộng cùi chỏ sang hai bên biến bài tập thành chèo lưng trên.",
    targets: [
      {
        muscleId: "lats_teres",
        role: "primary",
        activationPct: 95,
        targetedHeads: "Bó Xô Dưới / Xô Hông (Iliac & Lumbar Lats) & Teres Major",
        biomechanicalWhy:
          "Đường kéo trên mặt phẳng đứng dọc trùng hoàn hảo với hướng thớ cơ chạy dọc của các bó Xô dưới.",
      },
      {
        muscleId: "biceps_forearm",
        role: "synergist",
        activationPct: 65,
        targetedHeads:
          "Cơ Cánh Tay (Brachialis) & Cơ Cánh Tay – Quay (Brachioradialis)",
        biomechanicalWhy:
          "Tay cầm trung tính huy động Brachialis và Brachioradialis hỗ trợ gập khuỷu.",
      },
      {
        muscleId: "upper_back_traps",
        role: "stabilizer",
        activationPct: 45,
        targetedHeads: "Cơ Thang Dưới (Lower Trapezius)",
        biomechanicalWhy: "Giữ xương bả vai hạ thấp ổn định trên lồng ngực.",
      },
    ],
  },
  {
    id: "chest-supported-tbar-row",
    name: "Wide-Grip Chest-Supported Row",
    vietnameseName: "Chèo Tạ Tựa Ngực Tay Cầm Rộng (Độ Dày Lưng Trên)",
    pattern: "Pull",
    equipment: "Chest-Supported T-Bar / Machine Row",
    resistanceProfile: "Mid-Range (Giữa biên độ)",
    setupAndExecution:
      "Tựa ngực vào đệm ghế, cầm tay rộng úp lòng bàn tay, mở góc cùi chỏ 60°–75° so với sườn. Ở đáy thả cho hai bả vai trượt mở rộng tối đa; khi kéo lên ép sát hai bả vai vào cột sống.",
    commonMistake: "Rụt vai lên gần tai hoặc bật ngực khỏi đệm ghế.",
    targets: [
      {
        muscleId: "upper_back_traps",
        role: "primary",
        activationPct: 95,
        targetedHeads:
          "Cơ Thang Giữa – Dưới (Mid/Lower Traps) & Cơ Trám (Rhomboids)",
        biomechanicalWhy:
          "Góc mở cùi chỏ 60°–75° tối ưu hóa chuyển động khép xương bả vai (Scapular Retraction).",
      },
      {
        muscleId: "deltoids",
        role: "synergist",
        activationPct: 80,
        targetedHeads: "Vai Sau (Posterior Deltoid)",
        biomechanicalWhy:
          "Duỗi ngang xương cánh tay mạnh mẽ khi cùi chỏ mở rộng.",
      },
      {
        muscleId: "lats_teres",
        role: "synergist",
        activationPct: 55,
        targetedHeads: "Bó Xô Trên & Cơ Tròn Lớn (Teres Major)",
        biomechanicalWhy: "Hỗ trợ kéo xương cánh tay về phía sau.",
      },
      {
        muscleId: "biceps_forearm",
        role: "stabilizer",
        activationPct: 45,
        targetedHeads: "Brachioradialis & Biceps Brachii",
        biomechanicalWhy: "Gập nhẹ khớp khuỷu.",
      },
    ],
  },
  {
    id: "bayesian-incline-curl",
    name: "Bayesian Cable Curl / Incline Dumbbell Curl",
    vietnameseName: "Cuốn Tay Trước Dây Cáp Sau Lưng / Ghế Nghiêng",
    pattern: "Arms & Core",
    equipment: "Single Cable Pulley hoặc Ghế nghiêng 50°",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Đứng quay lưng vào máy cáp (cánh tay đưa ra sau thân người 30° để kéo giãn Đầu dài Biceps qua khớp vai). Giữ cùi chỏ đứng yên phía sau hông khi cuốn cẳng tay lên.",
    commonMistake: "Đưa cùi chỏ vung ra phía trước ngay khi bắt đầu cuốn.",
    targets: [
      {
        muscleId: "biceps_forearm",
        role: "primary",
        activationPct: 96,
        targetedHeads:
          "Đầu Dài Cơ Nhị Đầu (Biceps Long Head — Đỉnh Peak) & Brachialis",
        biomechanicalWhy:
          "Đặt khớp vai vào tư thế duỗi (Extension) giúp kéo căng Đầu dài Biceps ngay từ điểm xuất phát.",
      },
      {
        muscleId: "deltoids",
        role: "stabilizer",
        activationPct: 30,
        targetedHeads: "Khớp Vai & Chóp Xoay",
        biomechanicalWhy: "Giữ cố định đầu xương cánh tay trong ổ chảo.",
      },
    ],
  },
  {
    id: "overhead-cable-triceps",
    name: "Overhead Cable Rope Triceps Extension",
    vietnameseName: "Duỗi Tay Sau Dây Thừng Qua Đầu",
    pattern: "Arms & Core",
    equipment: "Cable Pulley + Dây thừng (Rope)",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Đặt ròng rọc ngang hông/lưng giữa, nâng hai cùi chỏ lên góc ~130° phía trước trán. Hạ sâu cẳng tay ra sau gáy để kéo giãn Đầu dài Triceps rồi duỗi thẳng lên.",
    commonMistake:
      "Ưỡn gãy thắt lưng hoặc hạ bắp tay xuống theo mỗi lần đẩy.",
    targets: [
      {
        muscleId: "triceps",
        role: "primary",
        activationPct: 97,
        targetedHeads: "Đầu Dài Cơ Tam Đầu (Long Head) & Đầu Ngoài/Trong",
        biomechanicalWhy:
          "Đưa cánh tay qua đầu kéo giãn Đầu dài Triceps qua khớp vai, giúp tăng phì đại cơ gấp ~1.5 lần so với chỉ đẩy cáp đứng (Maeo et al., 2022).",
      },
      {
        muscleId: "abs_obliques",
        role: "stabilizer",
        activationPct: 45,
        targetedHeads: "Cơ Thẳng Bụng & Cơ Ngang Bụng (Anti-Extension Core)",
        biomechanicalWhy:
          "Giữ lồng ngực đóng xuống chống ưỡn thắt lưng khi tay giơ qua đầu.",
      },
    ],
  },
  {
    id: "cable-rope-crunch",
    name: "Kneeling Cable Crunch & Hanging Leg Raise",
    vietnameseName: "Cuộn Bụng Dây Cáp Quỳ & Đu Xà Cuộn Xương Chậu",
    pattern: "Arms & Core",
    equipment: "High Pulley Rope / Xà đơn",
    resistanceProfile: "Mid-Range (Giữa biên độ)",
    setupAndExecution:
      "Cố định khớp háng, chủ động cuộn tròn từng đốt sống ngực hướng xương ức về phía rốn (Cable Crunch) hoặc cuộn xương mu về phía xương ức (Hanging Pelvic Tilt).",
    commonMistake:
      "Gập thẳng người ở khớp háng với lưng giữ phẳng (chỉ vào cơ Psoas).",
    targets: [
      {
        muscleId: "abs_obliques",
        role: "primary",
        activationPct: 95,
        targetedHeads: "Cơ Thẳng Bụng 6 Múi (Rectus Abdominis) & Cơ Chéo Bụng",
        biomechanicalWhy:
          "Thực hiện đúng chức năng giải phẫu Gập cột sống (Spinal Flexion) dưới kháng lực tăng tiến.",
      },
    ],
  },
  {
    id: "heel-elevated-hack-squat",
    name: "Heel-Elevated Hack Squat / High-Bar Squat",
    vietnameseName: "Hack Squat / Squat Kê Gót Chuyên Sâu Đùi Trước",
    pattern: "Legs & Glutes",
    equipment: "Hack Squat Machine / Barbell + Đế kê gót",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Đặt hai chân rộng bằng vai ở phần thấp của bàn đạp, giữ lưng áp sát đệm ghế, cho phép đầu gối đẩy tối đa qua mũi chân cho tới khi đùi sau chạm bắp chân.",
    commonMistake: "Nhấc gót chân hoặc dừng quá nông ở góc gối 90°.",
    targets: [
      {
        muscleId: "quads_adductors",
        role: "primary",
        activationPct: 96,
        targetedHeads:
          "3 Đầu Vastus (Vastus Lateralis, VMO Giọt Lệ & Vastus Intermedius) + Cơ Khép Lớn (Adductor Magnus)",
        biomechanicalWhy:
          "Tối đa hóa góc gập khớp gối (Knee Flexion Moment Arm) ở đáy chuyển động.",
      },
      {
        muscleId: "glutes",
        role: "synergist",
        activationPct: 75,
        targetedHeads: "Cơ Mông Lớn (Gluteus Maximus) ở đáy Squat sâu",
        biomechanicalWhy: "Hỗ trợ duỗi háng đẩy thoát khỏi điểm đáy.",
      },
      {
        muscleId: "calves",
        role: "stabilizer",
        activationPct: 45,
        targetedHeads: "Cơ Dép (Soleus) hãm tốc xương chày tiến về trước",
        biomechanicalWhy:
          "Kiểm soát độ gập mu cổ chân (Dorsiflexion) dưới tải trọng lớn.",
      },
    ],
  },
  {
    id: "romanian-deadlift-seated-curl",
    name: "Seated Leg Curl & Barbell Romanian Deadlift (RDL)",
    vietnameseName: "Ngồi Gập Đùi Sau & Romanian Deadlift (RDL)",
    pattern: "Legs & Glutes",
    equipment: "Seated Leg Curl Machine + Barbell / Dumbbell",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Với Seated Leg Curl: gập háng 90°, khóa đệm đùi chặt và gập hết biên độ (tác động cả 4 đầu gân kheo). Với RDL: mở khóa nhẹ gối 15°, đẩy thẳng mông ra sau giữ thanh đòn trượt sát đùi cho tới khi mông hết lùi được.",
    commonMistake:
      "Hạ thanh đòn RDL quá sâu bằng cách gập tròn thắt lưng L4–L5 sau khi khớp háng đã hết biên độ.",
    targets: [
      {
        muscleId: "hamstrings",
        role: "primary",
        activationPct: 96,
        targetedHeads:
          "Toàn bộ 4 Đầu Cơ Gân Kheo (Biceps Femoris Long/Short Head, Semitendinosus, Semimembranosus)",
        biomechanicalWhy:
          "Đặt cơ Gân kheo dưới sức căng cơ học lớn nhất ở vị trí kéo giãn qua khớp háng (Maeo et al., 2021).",
      },
      {
        muscleId: "glutes",
        role: "primary",
        activationPct: 86,
        targetedHeads: "Cơ Mông Lớn (Gluteus Maximus — trong pha RDL)",
        biomechanicalWhy: "Đồng chủ vận duỗi khớp háng từ vị trí kéo giãn sâu.",
      },
      {
        muscleId: "upper_back_traps",
        role: "stabilizer",
        activationPct: 60,
        targetedHeads: "Khối Cơ Dựng Sống (Erector Spinae) & Cơ Thang",
        biomechanicalWhy:
          "Giữ cột sống trung tính đẳng trường (Isometric) trong suốt bài RDL.",
      },
    ],
  },
  {
    id: "glute-bulgarian-split-squat",
    name: "Glute-Biased Bulgarian Split Squat",
    vietnameseName: "Bulgarian Split Squat Ưu Tiên Mông (Ở Vị Trí Giãn)",
    pattern: "Legs & Glutes",
    equipment: "Dumbbell + Ghế kê chân sau",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Bước chân trước xa vừa phải, nghiêng thân người về trước góc ~20°–25° (Hip Hinge nhẹ), hạ hông lùi chéo về phía gót chân sau để tối đa hóa độ gập khớp háng ở đáy.",
    commonMistake:
      "Giữ thân người quá thẳng đứng và đẩy gối vượt quá xa mũi chân (chuyển tải sang Đùi trước).",
    targets: [
      {
        muscleId: "glutes",
        role: "primary",
        activationPct: 96,
        targetedHeads:
          "Cơ Mông Lớn (Gluteus Maximus) & Cơ Mông Nhỡ (Gluteus Medius giữ thăng bằng mặt phẳng trán)",
        biomechanicalWhy:
          "Tạo mô-men gập háng cực đại ở vị trí cơ mông đang kéo giãn sâu nhất dưới tải 1 chân.",
      },
      {
        muscleId: "quads_adductors",
        role: "synergist",
        activationPct: 75,
        targetedHeads: "3 Đầu Vastus & Cơ Khép Lớn (Adductor Magnus)",
        biomechanicalWhy: "Đồng vận duỗi gối và duỗi háng thoát khỏi đáy.",
      },
      {
        muscleId: "hamstrings",
        role: "stabilizer",
        activationPct: 45,
        targetedHeads: "Nhóm Gân Kheo đồng co giữ ổn định gối",
        biomechanicalWhy: "Bảo vệ khớp gối trong bài chuỗi đóng 1 chân.",
      },
    ],
  },
  {
    id: "barbell-hip-thrust",
    name: "Barbell / Machine Hip Thrust",
    vietnameseName: "Đẩy Hông Tạ Đòn (Tối Ưu Đỉnh Co Rút Cơ Mông)",
    pattern: "Legs & Glutes",
    equipment: "Barbell + Ghế Bench / Hip Thrust Machine",
    resistanceProfile: "Shortened-Biased (Đỉnh co rút)",
    setupAndExecution:
      "Tựa bờ dưới xương bả vai lên ghế, ống chân thẳng đứng 90° ở đỉnh, thu cằm mắt nhìn về trước, đẩy bằng gót chân và khóa mông 2 giây ở đỉnh kèm cuộn nhẹ xương chậu (Posterior Pelvic Tilt).",
    commonMistake:
      "Ưỡn gãy lưng dưới ở đỉnh hoặc đặt chân quá xa làm chuột rút gân kheo.",
    targets: [
      {
        muscleId: "glutes",
        role: "primary",
        activationPct: 97,
        targetedHeads:
          "Cơ Mông Lớn Bó Trên & Bó Dưới (Gluteus Maximus) + Cơ Mông Nhỡ",
        biomechanicalWhy:
          "Tạo cánh tay đòn duỗi háng lớn nhất ngay ở 0°–20° cuối biên độ duỗi háng (Shortened position).",
      },
      {
        muscleId: "quads_adductors",
        role: "synergist",
        activationPct: 55,
        targetedHeads: "Cơ Tứ Đầu Đùi giữ góc gối 90°",
        biomechanicalWhy:
          "Phối hợp giữ cố định xương chày không trượt về trước.",
      },
      {
        muscleId: "hamstrings",
        role: "stabilizer",
        activationPct: 45,
        targetedHeads: "3 Đầu Gân Kheo Đa Khớp",
        biomechanicalWhy: "Hỗ trợ duỗi háng.",
      },
    ],
  },
  {
    id: "standing-seated-calf-raise",
    name: "Paused Standing & Seated Calf Raise",
    vietnameseName: "Nhón Bắp Chân Đứng (Thẳng Gối) & Ngồi (Gập Gối)",
    pattern: "Legs & Glutes",
    equipment: "Standing & Seated Calf Machine",
    resistanceProfile: "Lengthened-Biased (Đầu biên độ giãn)",
    setupAndExecution:
      "Hạ gót chân sâu hết biên độ, bắt buộc dừng tĩnh 2 giây ở đáy để triệt tiêu độ nảy đàn hồi của gân Achilles, sau đó đẩy thẳng lên khớp bàn – ngón chân cái.",
    commonMistake:
      "Nhấp nhả nhanh ở nửa trên biên độ làm gân Achilles gánh hết tải.",
    targets: [
      {
        muscleId: "calves",
        role: "primary",
        activationPct: 98,
        targetedHeads:
          "Cơ Bụng Chân (Gastrocnemius — khi đứng thẳng gối) & Cơ Dép (Soleus — khi ngồi gập gối)",
        biomechanicalWhy:
          "Đứng thẳng gối kéo căng Gastrocnemius qua cả 2 khớp; ngồi gập gối 90° làm chùng Gastrocnemius để cô lập Soleus (Kinoshita et al., 2023).",
      },
    ],
  },
];
