import type { ScientificReference } from "./muscle-hypertrophy-atlas";

export type TriggerPointMuscleId =
  | "upper_trapezius"
  | "levator_scapulae"
  | "infraspinatus"
  | "pec_minor"
  | "lats_serratus"
  | "quadratus_lumborum"
  | "iliopsoas"
  | "glute_med_piriformis"
  | "tfl_vastus_lateralis"
  | "soleus_gastroc";

export type TriggerPointCategory = "neck_shoulder" | "trunk" | "hip_leg";

export type PalpationTechnique =
  | "Flat Palpation"
  | "Pincer Palpation"
  | "Deep / Snapping Palpation";

export type OverloadedState =
  | "Locked-Long (Bị kéo giãn quá tải)"
  | "Locked-Short (Bị rút ngắn co cứng)"
  | "Synergist Dominant (Gồng bù trừ)";

export type PainSiteId =
  | "anterior_shoulder"
  | "neck_temple"
  | "between_scapulae"
  | "low_back"
  | "glute_posterior_thigh"
  | "lateral_knee"
  | "heel_foot"
  | "anterior_hip";

export interface TriggerPointNode {
  id: string;
  code: string;
  locationLabel: string;
  view: "anterior" | "posterior";
  x: number;
  y: number;
}

export interface ReferredPainZone {
  view: "anterior" | "posterior";
  d: string;
  labelX: number;
  labelY: number;
  description: string;
}

export interface MuscleChainLink {
  overloadedState: OverloadedState;
  biomechanicalReason: string;
  antagonistOrInhibited: {
    muscles: string;
    whyRelated: string;
    activationExercise: string;
  };
  satelliteTriggerPoints: string[];
}

export interface PalpationGuide {
  clientPosition: string;
  technique: PalpationTechnique;
  bonyLandmarks: string;
  underFingerFeel: string;
  clientResponse: string;
}

export interface FourStepProtocol {
  step1Release: {
    tool: string;
    placement: string;
    pressureAndTime: string;
    pinAndStretch: string;
  };
  step2Mobility: string;
  step3Activation: string;
  step4LoadCue: string;
}

export interface TriggerPointMuscle {
  id: TriggerPointMuscleId;
  shortName: string;
  name: string;
  latinName: string;
  category: TriggerPointCategory;
  summary: string;
  mechanism: string;
  nodes: TriggerPointNode[];
  referredPain: ReferredPainZone[];
  palpation: PalpationGuide;
  chain: MuscleChainLink;
  protocol: FourStepProtocol;
  gymTriggers: string[];
  contraindications: string[];
  references: ScientificReference[];
  sampleAiPrompt: string;
}

export interface PainSiteCulprit {
  id: PainSiteId;
  name: string;
  shortName: string;
  view: "anterior" | "posterior";
  zoneD: string;
  pinX: number;
  pinY: number;
  victimLabel: string;
  culprits: {
    muscleId: TriggerPointMuscleId;
    whyDeceptive: string;
  }[];
}

export const CORE_TRP_REFERENCES: ScientificReference[] = [
  {
    title:
      "Fernández-de-las-Peñas & Dommerholt (2018) — International Consensus on Diagnostic Criteria of Myofascial Trigger Points: A Delphi Study",
    source: "Pain Medicine",
    pmid: "28973518",
    url: "https://pubmed.ncbi.nlm.nih.gov/28973518/",
  },
  {
    title:
      "Shah et al. (2015) — Myofascial Trigger Points Then and Now: A Historical and Scientific Perspective",
    source: "PM&R",
    pmid: "25724849",
    url: "https://pubmed.ncbi.nlm.nih.gov/25724849/",
  },
  {
    title:
      "Shah et al. (2008) — Biochemicals Associated with Pain and Inflammation are Elevated in Sites Near to and Remote from Active Myofascial Trigger Points",
    source: "Archives of Physical Medicine and Rehabilitation",
    pmid: "18164338",
    url: "https://pubmed.ncbi.nlm.nih.gov/18164338/",
  },
  {
    title:
      "Behm & Wilke (2019) — Do Self-Myofascial Release Devices Release Myofascial Tissue? Rolling Mechanisms: A Narrative Review",
    source: "Sports Medicine",
    pmid: "30756327",
    url: "https://pubmed.ncbi.nlm.nih.gov/30756327/",
  },
  {
    title:
      "Cheatham et al. (2015) — Effects of Self-Myofascial Release Using a Foam Roll or Roller Massager on Joint ROM, Muscle Recovery, and Performance: A Systematic Review",
    source: "Int J Sports Phys Ther",
    pmid: "26618062",
    url: "https://pubmed.ncbi.nlm.nih.gov/26618062/",
  },
];

export const TEXTBOOK_TRAVELL: ScientificReference = {
  title:
    "Simons DG, Travell JG, Simons LS (1999) — Myofascial Pain and Dysfunction: The Trigger Point Manual, Vol. 1 & 2 (2nd ed.)",
  source: "Williams & Wilkins",
  url: "https://pubmed.ncbi.nlm.nih.gov/?term=Travell+Simons+Myofascial+Pain+and+Dysfunction",
};

export const JANDA_REFERENCE: ScientificReference = {
  title:
    "Page P, Frank CC, Lardner R (2010) — Assessment and Treatment of Muscle Imbalance: The Janda Approach",
  source: "Human Kinetics",
  url: "https://www.ncbi.nlm.nih.gov/nlmcatalog/101521868",
};

export const PALPATION_FUNDAMENTALS = {
  title: "Cẩm nang Cảm nhận Trigger Point cho PT",
  hypothesis:
    "Giả thuyết tích hợp (Integrated Trigger Point Hypothesis — Simons / Shah): tại bản vận động (motor endplate) bị rối loạn, acetylcholine dư thừa làm một cụm sarcomere co rút cục bộ, chèn mạch máu nuôi, thiếu ATP nên sợi cơ không tự giãn được. Môi trường hoá học quanh nút (bradykinin, CGRP, substance P, protons) kích thích nociceptor — đó là lý do ấn vào nút gây đau sâu và lan đi nơi khác, chứ không phải 'hạt thịt' hay 'mô sẹo' cần nghiền nát.",
  diagnosticCriteria: [
    {
      code: "1",
      name: "Taut Band",
      feel: "Một dải sợi cơ căng như dây đàn, nổi rõ hơn các thớ xung quanh khi vuốt ngang thớ.",
    },
    {
      code: "2",
      name: "Hypersensitive Nodule",
      feel: "Trên taut band có một nút chắc, ấn đúng tâm thì khách giật (Jump Sign) — đau 'sâu trong cơ', không nông ngoài da.",
    },
    {
      code: "3",
      name: "Referred Pain",
      feel: "Đau lan theo bản đồ Travell, thường xa chỗ ấn. Khách nói: 'Đúng chỗ tôi đau khi tập / khi ngủ'.",
    },
    {
      code: "4",
      name: "Local Twitch Response (không bắt buộc)",
      feel: "Vuốt dọc taut band có thể thấy sợi cơ giật cục bộ. Delphi 2018 (PMID 28973518) xếp đây là tiêu chí hỗ trợ, không bắt buộc để nhận diện trên lâm sàng.",
    },
  ],
  techniques: [
    {
      name: "Flat Palpation" as PalpationTechnique,
      when: "Cơ nằm trên nền xương (thang trên, dưới gai, QL nông, vastus lateralis).",
      how: "Dùng 1–2 đầu ngón, ấn vuông góc xuống xương rồi trượt ngang thớ để 'lăn' taut band dưới ngón.",
    },
    {
      name: "Pincer Palpation" as PalpationTechnique,
      when: "Cơ có thể kẹp được (thang trên, pec major, lats bờ ngoài, gastrocnemius).",
      how: "Kẹp bụng cơ giữa ngón cái và các ngón còn lại, lăn dải căng trong kẹp.",
    },
    {
      name: "Deep / Snapping Palpation" as PalpationTechnique,
      when: "Cơ sâu (iliopsoas, piriformis, pec minor dưới pec major, soleus dưới gastroc).",
      how: "Đặt ngón vuông góc, ấn chậm theo nhịp thở khách, không 'đâm'. Khi gặp nút, giữ và hỏi đường lan đau.",
    },
  ],
  pressureScale: [
    {
      level: "VAS 0–3",
      meaning: "Sờ bản đồ, chưa đủ để xác nhận nút — khách chỉ thấy 'căng'.",
    },
    {
      level: "VAS 5–6 / 10",
      meaning:
        "Ngưỡng làm việc an toàn (Ischemic Compression / SMR). Khách chịu được, thở được, không nín thở. Giữ 30–90 giây đến khi đau giảm hoặc taut band mềm hơn.",
    },
    {
      level: "VAS ≥ 8 / Protective Guarding",
      meaning:
        "Quá ngưỡng. Cơ phản vệ co lại, giao cảm tăng — phản tác dụng. Giảm lực, đổi góc, hoặc dừng.",
    },
  ],
  differentials: [
    {
      name: "Active Trigger Point",
      vs: "Đau tự phát hoặc đau khi vận động đúng pattern; ấn nút tái hiện đúng cơn đau khách than.",
    },
    {
      name: "Latent Trigger Point",
      vs: "Không đau khi nghỉ, nhưng khi ấn thì đau tại chỗ ± lan. Lucas et al. (PMID 21946988) cho thấy latent TrP làm rối loạn thứ tự tuyển dụng vận động — vẫn đáng xử lý ở PT.",
    },
    {
      name: "DOMS",
      vs: "Đau lan toả cả bụng cơ 24–72h sau tập lạ / lệch tâm, không có nút khu trú, không có referred pattern Travell, giảm dần theo ngày.",
    },
    {
      name: "Red Flags thần kinh / mạch máu",
      vs: "Tê bì theo khoanh da, yếu lực tiến triển, đau ban đêm không đổi tư thế, sốt, sụt cân, mất tự chủ đại tiểu tiện, đau ngực — dừng sờ nắn, chuyển bác sĩ.",
    },
  ],
  smrMechanism:
    "Foam roll / bóng không 'phá mô sẹo'. Behm & Wilke (PMID 30756327) và Cheatham (PMID 26618062): cơ chế chính là điều biến thần kinh (Ruffini, Golgi-like, giảm kích thích gamma, tăng ROM tạm thời). Vì vậy Bước 3 — kích hoạt cơ bị ức chế — bắt buộc ngay sau khi nhả, nếu không TrP tái lập trong 24 giờ.",
  ptScope:
    "PT không tiêm dry needling, không chẩn đoán bệnh. PT sờ nắn để nhận diện pattern cơ học, giải phóng trong phạm vi SMR / pin-and-stretch, chỉnh kỹ thuật nâng tạ, và chuyển tuyến khi có red flag hoặc đau không giảm sau 2–3 tuần can thiệp cơ học hợp lý.",
  references: [
    ...CORE_TRP_REFERENCES,
    TEXTBOOK_TRAVELL,
    {
      title:
        "Lucas et al. (2010) — Latent Myofascial Trigger Points: Their Effects on Muscle Activation and Movement Efficiency",
      source: "Journal of Bodywork and Movement Therapies",
      pmid: "21946988",
      url: "https://pubmed.ncbi.nlm.nih.gov/21946988/",
    },
  ] satisfies ScientificReference[],
};

export const TRIGGER_POINT_MUSCLES: TriggerPointMuscle[] = [
  {
    id: "upper_trapezius",
    shortName: "Thang trên",
    name: "Cơ Thang Bó Trên — TrP1 & TrP2",
    latinName: "M. Trapezius, pars descendens",
    category: "neck_shoulder",
    summary:
      "Điểm kích hoạt hay gặp nhất ở người ngồi bàn + tập đẩy. Travell mô tả đau lan thành hình dấu hỏi: từ góc cổ–vai lên dọc cổ, vòng sau tai, tận thái dương và góc hàm. Khách thường nghĩ 'đau đầu căng thẳng' hoặc 'thoái hoá cổ'.",
    mechanism:
      "Upper trap bị Locked-Short khi vai nhô + đầu đưa ra trước. Motor endplate ở bụng cơ (điểm giữa đường C7–mỏm cùng vai) co cụm sarcomere, thiếu máu nuôi. Lower trapezius và deep neck flexors bị ức chế (Upper Crossed Syndrome — Janda), nên thang trên phải gồng giữ xương bả vai cả ngày.",
    nodes: [
      {
        id: "ut-trp1-l",
        code: "TrP1",
        locationLabel: "Bụng giữa bó trên, đường C7 → mỏm cùng vai (trái)",
        view: "posterior",
        x: 352,
        y: 278,
      },
      {
        id: "ut-trp1-r",
        code: "TrP1",
        locationLabel: "Bụng giữa bó trên, đường C7 → mỏm cùng vai (phải)",
        view: "posterior",
        x: 548,
        y: 278,
      },
      {
        id: "ut-trp2-l",
        code: "TrP2",
        locationLabel: "Gần bám tận 1/3 ngoài xương đòn / bờ trên xương bả (trái)",
        view: "posterior",
        x: 318,
        y: 318,
      },
    ],
    referredPain: [
      {
        view: "posterior",
        d: "M 330 240 C 370 210, 430 205, 470 230 L 520 280 C 490 310, 400 300, 360 320 L 310 290 Z",
        labelX: 455,
        labelY: 222,
        description:
          "Lan dọc cổ sau–bên lên ụ chẩm, vòng sau tai (cung dấu hỏi của Travell).",
      },
      {
        view: "anterior",
        d: "M 175 175 C 230 145, 290 155, 318 200 L 300 245 C 250 255, 190 235, 170 205 Z",
        labelX: 210,
        labelY: 158,
        description:
          "Tận thái dương, thái dương–trán và góc hàm cùng bên — khách mô tả 'đau đầu căng'.",
      },
    ],
    palpation: {
      clientPosition:
        "Ngồi hoặc nằm sấp, cánh tay buông, đầu hơi nghiêng về bên đang sờ để chùng thang trên.",
      technique: "Pincer Palpation",
      bonyLandmarks:
        "Mỏm cùng vai → C7. TrP1 nằm khoảng 1/2 đường này, hơi trước bờ trên xương bả.",
      underFingerFeel:
        "Kẹp bụng cơ: taut band chạy ngang như dây guitar, nút chắc cỡ hạt đậu–hạt ngô. Vuốt ngang thớ sẽ 'bật' dải căng.",
      clientResponse:
        "Jump Sign rõ. Khách chỉ lên thái dương / sau tai: 'Đúng chỗ đau khi ngồi máy tính và khi nhún tạ'.",
    },
    chain: {
      overloadedState: "Locked-Short (Bị rút ngắn co cứng)",
      biomechanicalReason:
        "Đầu đưa ra trước + nâng vai mạn tính làm thang trên làm việc đẳng trường cả ngày. Khi tập, shrug không kiểm soát ở Overhead Press / Upright Row / Deadlift lockout càng siết ngắn thêm.",
      antagonistOrInhibited: {
        muscles: "Lower Trapezius, Serratus Anterior, Deep Neck Flexors (Longus colli/capitis)",
        whyRelated:
          "Janda Upper Crossed: cặp lực hạ + xoay lên xương bả vai yếu → thang trên và nâng vai gồng thay. Deep neck flexors yếu → thang trên kéo chẩm để giữ đầu.",
        activationExercise:
          "Prone Y-raise 30° (lower trap) + Wall Slide có serratus + Chin Tuck giữ 10s × 8 (deep neck flexors).",
      },
      satelliteTriggerPoints: [
        "Levator scapulae",
        "Sternocleidomastoid",
        "Temporalis (vệ tinh đau đầu)",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Bóng lacrosse tựa tường, hoặc kẹp Pincer + ischemic compression bằng ngón.",
        placement:
          "Bóng kẹp giữa tường và bụng giữa thang trên (không lăn lên mỏm cùng vai hay đốt sống).",
        pressureAndTime:
          "VAS 5–6, 45–90s, thở ra dài 4–6s. Đến khi nút mềm hoặc đau lan giảm.",
        pinAndStretch:
          "Giữ ấn nút, khách từ từ nghiêng đầu sang đối bên + xoay nhẹ nhìn xuống nách đối bên.",
      },
      step2Mobility:
        "Upper trap stretch có scapular depression chủ động (kéo xương bả xuống túi quần) 3 × 30s. Không kéo cổ bằng tay lên đỉnh đầu — dễ chèn khớp facet.",
      step3Activation:
        "Prone Y 3 × 12 (tempo 2-1-3) + Chin Tuck 8 × 10s. Đây là bước chống tái phát 24h.",
      step4LoadCue:
        "Overhead Press / Pull-up: 'giấu xương bả vào túi quần sau' trước khi đẩy/kéo. Cấm shrug ở lockout. Deadlift: mắt nhìn sàn 2–3m, không ngửa cổ nhìn gương.",
    },
    gymTriggers: [
      "Ngồi bàn 8h vai nhô, tai đưa ra trước vai",
      "Shrug ở đỉnh Overhead Press / Lateral Raise",
      "Upright Row tay hẹp",
      "Nhìn gương ngửa cổ khi Deadlift",
    ],
    contraindications: [
      "Không ấn vào hố trên đòn (plexus brachialis, động mạch dưới đòn)",
      "Chóng mặt / hoa mắt khi xoay cổ → nghi ngờ mạch đốt sống, dừng, chuyển bác sĩ",
      "Tê yếu bàn tay theo khoanh C5–C8 → không 'xoa bóp cho hết tê'",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      JANDA_REFERENCE,
      {
        title:
          "Fernández-de-las-Peñas et al. (2007) — Myofascial Trigger Points in Subjects Presenting with Mechanical Neck Pain: A Blinded, Controlled Study",
        source: "Manual Therapy",
        pmid: "17197231",
        url: "https://pubmed.ncbi.nlm.nih.gov/17197231/",
      },
      CORE_TRP_REFERENCES[0],
    ],
    sampleAiPrompt:
      "Học viên đau đầu thái dương và cứng góc cổ–vai khi ngồi máy tính và khi Overhead Press. Nghi Trigger Point cơ Thang bó trên (Travell question-mark pattern). Hãy sàng lọc red flag cổ, hướng dẫn palpation an toàn, phác đồ 4 bước SMR + kích hoạt Lower Trap / Deep Neck Flexors, và chỉnh cue bài đẩy trên đầu. Trích PMID 28973518, 17197231.",
  },
  {
    id: "levator_scapulae",
    shortName: "Nâng vai",
    name: "Cơ Nâng Vai — góc cổ không ngoái được",
    latinName: "M. Levator scapulae",
    category: "neck_shoulder",
    summary:
      "Thủ phạm 'cứng cổ' kinh điển: khách không xoay đầu nhìn gương, không nhìn xuống nách. Đau tập trung góc trên–trong xương bả vai và lan dọc bờ trong xương bả — dễ nhầm với 'đau lồi đĩa cổ'.",
    mechanism:
      "Levator vừa nâng xương bả vừa xoay xuống dưới. Khi xương bả bị tilt trước (pec minor rút) và đầu đưa ra trước, levator bị Locked-Short ở góc trên xương bả. Tập Pull-up / One-arm Row mà shrug càng siết.",
    nodes: [
      {
        id: "ls-trp-l",
        code: "TrP góc bả",
        locationLabel: "Góc trên–trong xương bả vai, bám tận levator (trái)",
        view: "posterior",
        x: 368,
        y: 348,
      },
      {
        id: "ls-trp-r",
        code: "TrP góc bả",
        locationLabel: "Góc trên–trong xương bả vai, bám tận levator (phải)",
        view: "posterior",
        x: 532,
        y: 348,
      },
    ],
    referredPain: [
      {
        view: "posterior",
        d: "M 345 300 C 385 270, 430 290, 445 340 L 430 430 C 390 450, 350 420, 340 370 Z",
        labelX: 455,
        labelY: 318,
        description:
          "Đau góc cổ–vai và dọc bờ trong xương bả vai xuống giữa hai bả — khách không ngoái cổ được.",
      },
    ],
    palpation: {
      clientPosition:
        "Nằm sấp, tay cùng bên ra sau lưng (hand-behind-back) để nâng góc trên xương bả sát ngón PT; hoặc ngồi, đầu nghiêng cùng bên.",
      technique: "Deep / Snapping Palpation",
      bonyLandmarks:
        "Sờ góc trên–trong xương bả vai (superior angle). Nút nằm ngay trên góc này, sâu hơn thang trên.",
      underFingerFeel:
        "Nút sâu, tròn, 'dính xương bả'. Không nông như thang trên. Ấn vuông góc vào góc xương, không trượt vào hố trên gai.",
      clientResponse:
        "Đau nhói góc cổ, khách muốn nghiêng đầu cùng bên để giảm căng. Lan dọc bờ trong xương bả.",
    },
    chain: {
      overloadedState: "Locked-Short (Bị rút ngắn co cứng)",
      biomechanicalReason:
        "Scapula downward rotation + anterior tilt mạn tính. Levator giữ xương bả khỏi bị pec minor kéo đổ hoàn toàn — vừa Locked-Short vừa quá tải.",
      antagonistOrInhibited: {
        muscles: "Lower Trapezius & Serratus Anterior (upward rotators)",
        whyRelated:
          "Cặp lực xoay lên xương bả vai yếu → levator và pec minor thắng, xương bả không trượt–xoay khi giơ tay trên đầu.",
        activationExercise:
          "Serratus wall slide 3 × 12 + Prone Y 3 × 10. Cue: 'đẩy xương bả ra xa cột sống rồi lên trên' chứ không shrug.",
      },
      satelliteTriggerPoints: [
        "Upper trapezius",
        "Rhomboids",
        "Pectoralis minor (cặp lực đối)",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Bóng lacrosse tựa tường, hơi cúi đầu cùng bên.",
        placement:
          "Bóng đặt đúng góc trên–trong xương bả, không lăn vào hõm trên gai (supraspinatus) hay đốt sống.",
        pressureAndTime: "VAS 5–6, 45–60s, thở chậm. Đầu từ từ nghiêng đối bên khi nút đã mềm hơn.",
        pinAndStretch:
          "Giữ bóng, khách gục cằm + xoay mặt sang đối bên như nhìn nách đối diện.",
      },
      step2Mobility:
        "Levator stretch: gục cằm, nghiêng và xoay đối bên, tay cùng bên với cơ đang giãn nắm ghế để hạ xương bả. 3 × 30s.",
      step3Activation:
        "Wall slide có serratus (cùi chỏ không rời tường, xương sườn dưới không ưỡn) 3 × 10.",
      step4LoadCue:
        "Pull-up / Lat pulldown: bắt đầu bằng 'hạ xương bả rồi mới gập khuỷu'. Row: hết shrug. Overhead: đạt upward rotation trước khi đẩy tạ.",
    },
    gymTriggers: [
      "Ngồi vai nhô, điện thoại kẹp giữa tai và vai",
      "Pull-up / Pulldown shrug hết ROM",
      "One-arm dumbbell row nhún vai",
    ],
    contraindications: [
      "Không ấn vào tam giác cổ sau (plexus, mạch)",
      "Đau cổ kèm tê lan tay theo khoanh → chuyển khám",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      {
        title:
          "Fernández-de-las-Peñas et al. (2007) — Myofascial Trigger Points in Mechanical Neck Pain",
        source: "Manual Therapy",
        pmid: "17197231",
        url: "https://pubmed.ncbi.nlm.nih.gov/17197231/",
      },
      CORE_TRP_REFERENCES[1],
    ],
    sampleAiPrompt:
      "Học viên cứng cổ không xoay đầu nhìn gương, đau góc trên–trong xương bả vai. Nghi Trigger Point Levator scapulae. Sàng lọc red flag cổ, hướng dẫn sờ góc trên xương bả an toàn, SMR + kích hoạt Serratus / Lower Trap, cue Pull-up không shrug. Nguồn Travell & PMID 17197231.",
  },
  {
    id: "infraspinatus",
    shortName: "Dưới gai",
    name: "Cơ Dưới Gai & Tròn Bé — thủ phạm đau mặt trước vai",
    latinName: "M. Infraspinatus & M. Teres minor",
    category: "neck_shoulder",
    summary:
      "Đây là bài học Travell quan trọng nhất cho PT: nút nằm mặt SAU xương bả vai nhưng khách kêu đau SÂU mặt TRƯỚC khớp vai, lan xuống mặt ngoài cánh tay — bị nhầm viêm gân nhị đầu, 'impingement', thậm chí đau tim. Hidalgo-Lozano (PMID 20038718) ghi nhận TrP dưới gai rất phổ biến ở đau vai mạn.",
    mechanism:
      "Infraspinatus là xoay ngoài chính của chỏm xương cánh tay. Khi pec minor / pec major rút, chỏm trượt trước; infraspinatus vừa Locked-Long (bị kéo) vừa phải gồng hãm chỏm. Tập Bench Press / Fly với khuỷu mở 90° càng nhồi chỏm ra trước, TrP cháy.",
    nodes: [
      {
        id: "is-trp1-l",
        code: "TrP1",
        locationLabel: "Giữa hố dưới gai, bụng infraspinatus (trái)",
        view: "posterior",
        x: 302,
        y: 412,
      },
      {
        id: "is-trp1-r",
        code: "TrP1",
        locationLabel: "Giữa hố dưới gai, bụng infraspinatus (phải)",
        view: "posterior",
        x: 598,
        y: 412,
      },
      {
        id: "tm-trp-l",
        code: "TrP TM",
        locationLabel: "Teres minor, bờ ngoài xương bả sát nách sau (trái)",
        view: "posterior",
        x: 268,
        y: 448,
      },
    ],
    referredPain: [
      {
        view: "anterior",
        d: "M 218 330 C 270 300, 330 325, 348 380 L 330 470 C 270 500, 210 455, 205 390 Z",
        labelX: 175,
        labelY: 355,
        description:
          "Đau sâu mặt TRƯỚC khớp vai (nơi khách than) — đây là referred, không phải chỗ nút.",
      },
      {
        view: "anterior",
        d: "M 195 455 C 250 470, 265 560, 235 720 L 175 710 C 155 560, 160 480, 195 455 Z",
        labelX: 145,
        labelY: 590,
        description: "Lan mặt ngoài cánh tay xuống cẳng tay, đôi khi tới ngón 2–3.",
      },
      {
        view: "posterior",
        d: "M 250 370 C 310 350, 355 380, 350 440 L 310 470 C 260 460, 235 420, 250 370 Z",
        labelX: 200,
        labelY: 390,
        description: "Đau tại chỗ hố dưới gai khi ấn — khách ít khi tự chỉ vào đây.",
      },
    ],
    palpation: {
      clientPosition:
        "Ngồi hoặc nằm sấp. Cánh tay khép, khuỷu 90°, bàn tay đặt trên bụng để chùng infraspinatus.",
      technique: "Flat Palpation",
      bonyLandmarks:
        "Gai xương bả vai (spina scapulae) ở trên, bờ ngoài xương bả ở ngoài. Hố dưới gai là 'cái đĩa' giữa hai mốc. TrP1 ở trung tâm đĩa.",
      underFingerFeel:
        "Nền xương phẳng. Taut band chạy ngang (sợi infraspinatus đi ngang ra mấu động lớn). Nút chắc, ấn xuống xương là Jump Sign mạnh.",
      clientResponse:
        "Khách giật và CHỈ RA MẶT TRƯỚC VAI: 'Đúng chỗ đau khi Bench'. Đây là dấu hiệu vàng của referred pain.",
    },
    chain: {
      overloadedState: "Locked-Long (Bị kéo giãn quá tải)",
      biomechanicalReason:
        "Chỏm cánh tay bị kéo ra trước bởi pecs rút ngắn; infraspinatus bị kéo dài nhưng phải co đẳng trường để giữ chỏm vào ổ chảo — classic eccentric overload của chóp xoay.",
      antagonistOrInhibited: {
        muscles: "Hạ pec minor / pec major (kéo dài) + kích hoạt hạ xương bả (lower trap)",
        whyRelated:
          "Không giải pec minor thì chỏm vẫn trượt trước, TrP infraspinatus tái phát dù foam roll mỗi ngày.",
        activationExercise:
          "Sidelying external rotation 3 × 12 (khủy 90°, khăn kẹp nách) SAU KHI đã mở pec minor. Không tập xoay ngoài máy nặng khi đang đau cấp.",
      },
      satelliteTriggerPoints: [
        "Pectoralis minor (thủ phạm tư thế)",
        "Anterior deltoid (nạn nhân)",
        "Supraspinatus",
        "Biceps long head (bị nhầm chẩn đoán)",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Bóng lacrosse tựa tường, thân hơi xoay 20° để hố dưới gai áp bóng.",
        placement:
          "Bóng vào GIỮA hố dưới gai, dưới gai xương bả, không trượt vào nách (mạch, plexus) hay khớp vai.",
        pressureAndTime:
          "VAS 5–6, 60–90s. Cánh tay buông. Khi nút mềm, từ từ xoay trong–ngoài biên độ nhỏ (pin & move).",
        pinAndStretch:
          "Giữ bóng, khách đưa tay ngang ngực (horizontal adduction) nhẹ để kéo giãn infraspinatus trên nút.",
      },
      step2Mobility:
        "Sleeper stretch nhẹ NHƯNG ưu tiên pec doorway stretch trước (mở thủ phạm Locked-Short). Sleeper quá mạnh có thể nhồi chỏm — dừng nếu đau mặt trước tăng.",
      step3Activation:
        "Sidelying ER 3 × 12, tempo 2-1-3, không nâng tạ trên 1–2 kg lúc đầu. Cue: 'khuỷu dán sườn, xoay cẳng tay như mở cửa'.",
      step4LoadCue:
        "Bench / Push-up: thu xương bả, khuỷu 45–60° so với thân, không để khuỷu 90° (flared). Dừng đẩy trước khi vai nhấc khỏi ghế. Đổi sang Floor Press nếu đau.",
    },
    gymTriggers: [
      "Bench Press / Fly khuỷu mở 90°, vai nhấc khỏi ghế",
      "Pec stretch quá sâu không kiểm soát xương bả",
      "Ngủ nằm nghiêng đè vai",
    ],
    contraindications: [
      "Không ấn hõm nách / bờ ngoài quá thấp (bó mạch–thần kinh)",
      "Đau vai ban đêm + yếu xoay ngoài tiến triển → nghi rách chóp xoay, chuyển bác sĩ",
      "Đau ngực trái kèm khó thở / toát mồ hôi → cấp cứu, không phải TrP",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      {
        title:
          "Hidalgo-Lozano et al. (2010) — Muscle Trigger Points and Pressure Pain Hyperalgesia in the Shoulder Muscles of Patients with Unilateral Shoulder Impingement",
        source: "Clinical Journal of Pain",
        pmid: "20038718",
        url: "https://pubmed.ncbi.nlm.nih.gov/20038718/",
      },
      {
        title:
          "Bron et al. (2011) — Treatment of Myofascial Trigger Points in Patients with Chronic Shoulder Pain: A Randomized, Controlled Trial",
        source: "BMC Medicine",
        pmid: "21261971",
        url: "https://pubmed.ncbi.nlm.nih.gov/21261971/",
      },
      CORE_TRP_REFERENCES[1],
    ],
    sampleAiPrompt:
      "Học viên đau sâu mặt trước vai khi Bench Press. PT sờ thấy nút hố dưới gai (Infraspinatus) và ấn vào tái hiện đúng đau mặt trước vai (Travell referred pain). Sàng lọc red flag vai / tim, phác đồ 4 bước: SMR infraspinatus + mở pec minor + sidelying ER + cue Bench khuỷu 45–60°. Trích PMID 20038718, 21261971.",
  },
  {
    id: "pec_minor",
    shortName: "Ngực bé",
    name: "Cơ Ngực Bé & Ngực Lớn — kéo đổ mỏm cùng vai",
    latinName: "M. Pectoralis minor & M. Pectoralis major",
    category: "neck_shoulder",
    summary:
      "Pec minor bám mỏm quạ, kéo xương bả tilt trước + xoay xuống — chìa khoá Upper Crossed. TrP pec minor gây đau mặt trước vai lan mặt TRONG cánh tay xuống ngón 4–5, giả hội chứng chèn ép đám rối (TOS). Borstad (PMID 16089175) gắn chiều dài pec minor với kinematics xương bả.",
    mechanism:
      "Locked-Short do ngồi vai đổ, Bench/Fly thể tích cao, thở ngực nông. Pec minor chèn khoang dưới mỏm quạ (plexus + mạch dưới đòn) khi quá rút. Pec major TrP bổ sung đau mặt trước ngực và mặt trong cánh tay.",
    nodes: [
      {
        id: "pm-trp-l",
        code: "TrP Pm",
        locationLabel: "Pec minor, dưới pec major, đường sườn 3–4 vào mỏm quạ (trái)",
        view: "anterior",
        x: 338,
        y: 398,
      },
      {
        id: "pm-trp-r",
        code: "TrP Pm",
        locationLabel: "Pec minor, dưới pec major, đường sườn 3–4 vào mỏm quạ (phải)",
        view: "anterior",
        x: 562,
        y: 398,
      },
      {
        id: "pj-trp-l",
        code: "TrP Pmaj",
        locationLabel: "Pec major, bụng giữa bó ức–sườn (trái)",
        view: "anterior",
        x: 378,
        y: 430,
      },
    ],
    referredPain: [
      {
        view: "anterior",
        d: "M 300 340 C 360 320, 420 350, 430 410 L 400 480 C 340 500, 290 450, 295 390 Z",
        labelX: 175,
        labelY: 400,
        description: "Đau mặt trước vai và dưới đòn — khách nghĩ 'đau khớp vai / đau ngực'.",
      },
      {
        view: "anterior",
        d: "M 230 430 C 280 450, 270 560, 240 700 L 185 690 C 175 540, 185 460, 230 430 Z",
        labelX: 145,
        labelY: 560,
        description: "Lan mặt TRONG cánh tay xuống ngón 4–5 (giả TOS / giả C8–T1).",
      },
    ],
    palpation: {
      clientPosition:
        "Nằm ngửa, tay hơi dạng. PT đứng bên, dùng đầu ngón trượt DƯỚI bờ ngoài pec major vào hướng mỏm quạ.",
      technique: "Deep / Snapping Palpation",
      bonyLandmarks:
        "Mỏm quạ (ngay dưới 1/3 ngoài xương đòn, hõm delta–ngực). Pec minor chạy từ sườn 3–5 lên mỏm quạ, NẰM DƯỚI pec major.",
      underFingerFeel:
        "Sợi căng như dây dải chếch lên mỏm quạ. Nút sâu hơn pec major. Ấn chậm theo nhịp thở — pec major nông phải chùng trước.",
      clientResponse:
        "Đau sâu dưới đòn, lan mặt trong tay. Có thể tê ngón 4–5 thoáng qua — nếu tê kéo dài / yếu lực thì dừng, nghi TOS thật.",
    },
    chain: {
      overloadedState: "Locked-Short (Bị rút ngắn co cứng)",
      biomechanicalReason:
        "Anterior scapular tilt mạn tính. Pec minor thắng Lower Trap + Serratus; chỏm cánh tay bị đẩy ra trước → infraspinatus và biceps long head thành nạn nhân.",
      antagonistOrInhibited: {
        muscles: "Lower Trapezius, Serratus Anterior, Infraspinatus (nạn nhân Locked-Long)",
        whyRelated:
          "Không mở pec minor thì mọi bài 'chỉnh tư thế' và SMR dưới gai chỉ là tạm. Đây là key TrP của đai vai.",
        activationExercise:
          "Wall angel / Prone Y + Serratus punch. Cue: 'mỏm quạ đi ra sau–xuống' (posterior tilt).",
      },
      satelliteTriggerPoints: [
        "Infraspinatus (đau mặt trước vai giả)",
        "Scalenes (TOS chồng)",
        "Upper trapezius",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Bóng mềm / pec pec-release trên foam (không bóng cứng đè plexus).",
        placement:
          "Nằm sấp lên bóng đặt dưới pec, hơi lệch ra ngoài–lên mỏm quạ. Tay buông xuống đất.",
        pressureAndTime:
          "VAS 5, 45–60s. Nếu tê tay tăng ngay → nhấc ra, đổi góc nông hơn. Không nằm đè bóng vào hõm nách.",
        pinAndStretch:
          "Giữ bóng, khách đưa tay lên đầu theo mặt phẳng xương bả (scaption) chậm.",
      },
      step2Mobility:
        "Doorway pec minor stretch: cẳng tay trên khung cửa, bước chân cùng bên lên, xương sườn giữ trung tính (không ưỡn thắt lưng). 3 × 30s.",
      step3Activation:
        "Serratus wall slide + Prone Y. 3 × 10–12. Kiểm tra mỏm cùng vai không còn nhô trước khi tăng tải Bench.",
      step4LoadCue:
        "Bench: xương bả thu + hạ TRƯỚC khi nhấc tạ; không để vai 'đổ' về phía tạ. Giảm volume Fly tạm. Thêm hàng kéo 1:1 với đẩy.",
    },
    gymTriggers: [
      "Ngồi bàn vai đổ, ngực lép",
      "Bench / Fly thể tích cao không cân kéo",
      "Thở ngực nông, ít thở bằng cơ hoành",
    ],
    contraindications: [
      "Không ấn hõm nách và hố dưới đòn (đám rối, mạch)",
      "Tê ngón 4–5 + phù tay + mạch quay yếu → TOS / mạch, chuyển bác sĩ",
      "Đau ngực trái kiểu nội tạng — loại trừ tim mạch trước khi gọi là TrP pec",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      {
        title:
          "Borstad & Ludewig (2005) — The Effect of Long Versus Short Pectoralis Minor Resting Length on Scapular Kinematics in Healthy Individuals",
        source: "Journal of Orthopaedic & Sports Physical Therapy",
        pmid: "16089175",
        url: "https://pubmed.ncbi.nlm.nih.gov/16089175/",
      },
      CORE_TRP_REFERENCES[1],
      JANDA_REFERENCE,
    ],
    sampleAiPrompt:
      "Học viên vai đổ, đau mặt trước vai lan mặt trong tay ngón 4–5 khi Bench. Nghi TrP Pectoralis minor (Locked-Short) kéo anterior tilt xương bả, vệ tinh Infraspinatus. Sàng lọc TOS / tim, hướng dẫn pec minor release an toàn (tránh plexus), doorway stretch, kích hoạt Serratus / Lower Trap. PMID 16089175.",
  },
  {
    id: "lats_serratus",
    shortName: "Xô & Răng trước",
    name: "Cơ Lưng Rộng & Cơ Răng Trước — đau góc dưới xương bả",
    latinName: "M. Latissimus dorsi & M. Serratus anterior",
    category: "trunk",
    summary:
      "TrP lats gây đau góc dưới xương bả 'không đổi tư thế nào cho đỡ' và đau lan mặt trong cánh tay. TrP serratus gây đau nhói cạnh sườn khi hít sâu, khi tập Overhead hoặc Punch — dễ nhầm đau sườn / 'stitch'.",
    mechanism:
      "Lats là duỗi–khép–xoay trong cánh tay và kéo xương bả xuống. Khi ngực rút + lats Locked-Short, tay không giơ hết overhead (thoracic extension giả). Serratus nếu yếu thì xương bả trượt ra (winging) và chính serratus lại TrP do quá tải khi cố ổn định.",
    nodes: [
      {
        id: "lat-trp-l",
        code: "TrP Lats",
        locationLabel: "Bờ ngoài lats, ngang góc dưới xương bả (trái)",
        view: "posterior",
        x: 328,
        y: 575,
      },
      {
        id: "lat-trp-r",
        code: "TrP Lats",
        locationLabel: "Bờ ngoài lats, ngang góc dưới xương bả (phải)",
        view: "posterior",
        x: 572,
        y: 575,
      },
      {
        id: "sa-trp-l",
        code: "TrP SA",
        locationLabel: "Serratus anterior, thành bên lồng ngực khoảng sườn 5–7 (trái)",
        view: "anterior",
        x: 268,
        y: 505,
      },
    ],
    referredPain: [
      {
        view: "posterior",
        d: "M 310 500 C 370 480, 430 520, 420 600 L 370 650 C 320 640, 290 580, 310 500 Z",
        labelX: 200,
        labelY: 555,
        description:
          "Đau góc dưới xương bả dai dẳng — khách hay nhờ PT 'bấm giúp chỗ này'.",
      },
      {
        view: "anterior",
        d: "M 230 460 C 290 450, 320 510, 300 580 L 250 590 C 210 540, 205 490, 230 460 Z",
        labelX: 165,
        labelY: 505,
        description: "Đau cạnh sườn khi hít sâu / Overhead (serratus).",
      },
    ],
    palpation: {
      clientPosition:
        "Lats: nằm sấp hoặc ngồi, tay dạng; kẹp bờ ngoài lats (pincer). Serratus: nằm nghiêng, tay đưa lên đầu, sờ thành bên lồng ngực.",
      technique: "Pincer Palpation",
      bonyLandmarks:
        "Góc dưới xương bả; bờ ngoài lats tạo thành bờ sau nách. Serratus: răng bám mặt ngoài sườn 5–8, trước bờ lats.",
      underFingerFeel:
        "Lats: dải dày, nút dọc bờ ngoài. Serratus: nút trên thành sườn, ấn vào kẽ sườn (không ấn đầu sườn).",
      clientResponse:
        "Lats: đau góc bả + mặt trong tay. Serratus: đau nhói sườn, khách nín thở.",
    },
    chain: {
      overloadedState: "Locked-Short (Bị rút ngắn co cứng)",
      biomechanicalReason:
        "Lats rút làm hạn chế gập vai và xoay ngoài — bù bằng ưỡn thắt lưng khi Overhead. Serratus yếu / TrP làm winging → deltoid và pec phải gồng.",
      antagonistOrInhibited: {
        muscles: "Lower Trapezius (cặp hạ xương bả) + Serratus nếu lats thắng; Posterior cuff nếu lats xoay trong quá",
        whyRelated:
          "Lats và lower trap cùng hạ xương bả nhưng lats kéo xoay trong. Cần hạ xương bả KHÔNG kèm xoay trong.",
        activationExercise:
          "Straight-arm pulldown nhẹ với cue 'khép nách, xương sườn xuống' + Serratus punch 3 × 12.",
      },
      satelliteTriggerPoints: [
        "Pectoralis major",
        "Quadratus lumborum (lats bám mào chậu / fascia TL)",
        "Triceps long head",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Foam roller dọc bờ ngoài lats; bóng nhỏ cho serratus bên thành ngực (nằm nghiêng).",
        placement:
          "Lats: nằm nghiêng, roller dưới nách sau, không đè nách trước. Serratus: bóng trên sườn 5–7 đường nách giữa.",
        pressureAndTime: "VAS 5–6, 45–60s mỗi điểm. Thở ra khi ấn serratus — lồng ngực phải giãn được.",
        pinAndStretch:
          "Giữ roller, khách đưa tay lên trên đầu (shoulder flexion) chậm để kéo lats trên nút.",
      },
      step2Mobility:
        "Child pose lệch bên / lat stretch có xương sườn hạ. 3 × 30s. Kiểm tra không ưỡn thắt lưng thay vì giãn lats.",
      step3Activation:
        "Serratus wall slide + Dead bug (chống ưỡn khi tay lên). 3 × 8–10.",
      step4LoadCue:
        "Overhead Press: xương sườn hạ, không 'cày' thắt lưng. Pulldown: kết thúc bằng hạ xương bả, không bằng xoay trong quá mức (khuỷu không quặp vào bụng).",
    },
    gymTriggers: [
      "Pulldown / Pull-up volume cao, ROM ngắn",
      "Overhead Press ưỡn thắt lưng bù lats rút",
      "Ngủ tay đưa lên đầu, đau sườn sáng dậy",
    ],
    contraindications: [
      "Không ấn nách (mạch, plexus)",
      "Đau sườn sau chấn thương / ho ra máu / khó thở → không phải TrP serratus, chuyển cấp cứu",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      CORE_TRP_REFERENCES[3],
      {
        title:
          "Hidalgo-Lozano et al. (2010) — Muscle Trigger Points in Unilateral Shoulder Impingement",
        source: "Clinical Journal of Pain",
        pmid: "20038718",
        url: "https://pubmed.ncbi.nlm.nih.gov/20038718/",
      },
    ],
    sampleAiPrompt:
      "Học viên đau góc dưới xương bả không đổi tư thế nào cho đỡ, và đau cạnh sườn khi Overhead Press. Nghi TrP Latissimus dorsi + Serratus anterior. Hướng dẫn pincer lats an toàn, SMR, kích hoạt serratus, cue Overhead không ưỡn thắt lưng. Travell + PMID 20038718.",
  },
  {
    id: "quadratus_lumborum",
    shortName: "QL",
    name: "Cơ Vuông Thắt Lưng — thủ phạm đau lưng dưới sâu",
    latinName: "M. Quadratus lumborum (superficial & deep)",
    category: "trunk",
    summary:
      "Travell gọi QL là 'thủ phạm lớn nhất của đau lưng dưới'. TrP nông gây đau mào chậu và mông trên; TrP sâu gây đau SI joint và mông sâu. Iglesias-González (PMID 23993790) thấy TrP QL phổ biến ở đau thắt lưng mạn. Ở phòng tạ: Squat/Deadlift lệch hông một bên.",
    mechanism:
      "QL nâng mào chậu và nghiêng cột sống. Khi glute medius yếu, QL cùng bên gồng hãm khung chậu (hip hike) — Synergist Dominant. Ngồi xệ một mông, cầm tạ một tay, hoặc chân ngắn chức năng làm QL Locked-Short một bên, Locked-Long bên kia.",
    nodes: [
      {
        id: "ql-sup-l",
        code: "TrP nông",
        locationLabel: "QL nông, giữa sườn 12 và mào chậu, cạnh erector (trái)",
        view: "posterior",
        x: 378,
        y: 688,
      },
      {
        id: "ql-sup-r",
        code: "TrP nông",
        locationLabel: "QL nông, giữa sườn 12 và mào chậu, cạnh erector (phải)",
        view: "posterior",
        x: 522,
        y: 688,
      },
      {
        id: "ql-deep-l",
        code: "TrP sâu",
        locationLabel: "QL sâu, sát mỏm ngang L3–L4 (trái) — ấn chậm",
        view: "posterior",
        x: 398,
        y: 655,
      },
    ],
    referredPain: [
      {
        view: "posterior",
        d: "M 330 640 C 410 610, 490 630, 510 700 L 470 780 C 400 800, 330 760, 320 700 Z",
        labelX: 200,
        labelY: 690,
        description:
          "Đau thắt lưng dưới sâu lan mào chậu, SI joint và mông trên — khách chỉ 'lưng dưới'.",
      },
    ],
    palpation: {
      clientPosition:
        "Nằm sấp, gối hơi gập; hoặc nằm nghiêng, gối chồng, hông hơi gập để chùng QL. PT đứng phía sau.",
      technique: "Deep / Snapping Palpation",
      bonyLandmarks:
        "Sườn 12 (sờ từ dưới nách ra sau đến xương sườn cuối) và mào chậu. QL lấp khoảng giữa hai mốc, NGOÀI khối erector spinae.",
      underFingerFeel:
        "Nông: dải dọc, nút sát mào chậu. Sâu: ấn hướng mỏm ngang, gặp 'tấm gỗ' — khách nín thở. Không nhầm với erector (nổi giữa, sát gai sau).",
      clientResponse:
        "Đau sâu một bên lưng, lan mông trên. Khách không thích nghiêng người về đối bên.",
    },
    chain: {
      overloadedState: "Synergist Dominant (Gồng bù trừ)",
      biomechanicalReason:
        "Glute medius không giữ được khung chậu trên chân trụ → QL cùng bên hip-hike. Deadlift/Squat lệch, hoặc cầm túi/tạ một bên cả ngày.",
      antagonistOrInhibited: {
        muscles: "Gluteus medius (chân trụ) + Obliques đối bên",
        whyRelated:
          "Nhả QL mà không dạy glute medius thì hip hike trở lại ngay hiệp Squat sau. Đây là vệ tinh của Weak Lateral Hip.",
        activationExercise:
          "Side-lying hip abduction (không xoay hông) 3 × 12 + Single-leg stance 3 × 20s, xương chậu ngang.",
      },
      satelliteTriggerPoints: [
        "Gluteus medius / minimus",
        "Iliopsoas (cặp lực trước–sau)",
        "Thoracolumbar erector",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Bóng lacrosse tựa tường, đứng, hơi nghiêng người lên bóng.",
        placement:
          "Bóng vào tam giác sườn 12 – mào chậu – erector (KHÔNG lăn trên gai sau hay thận phía sau sườn 12).",
        pressureAndTime:
          "VAS 5–6, 45–60s. Hơi thở vào bụng làm QL trượt trên bóng. Đổi bên so sánh.",
        pinAndStretch:
          "Giữ bóng, khách đưa tay cùng bên lên trên đầu và nghiêng nhẹ đối bên.",
      },
      step2Mobility:
        "QL stretch: đứng, tay cùng bên đưa lên, nghiêng đối bên, hông đẩy ra phía cơ đang giãn. 3 × 30s. Không gập người về trước.",
      step3Activation:
        "Side plank 3 × 20–30s (QL đối bên + glute med) + Hip hitch / pelvic drop chậm 3 × 8 mỗi chân.",
      step4LoadCue:
        "Squat / Deadlift: gương phía trước, mào chậu hai bên ngang suốt chuyển động. Suitcase carry bên đối diện QL rút. Giảm tạ nếu hip hike xuất hiện.",
    },
    gymTriggers: [
      "Squat / Deadlift lệch hông, hip hike chân trụ",
      "Ngồi xệ một mông, ví sau túi quần",
      "Suitcase / túi xách một bên mạn tính",
    ],
    contraindications: [
      "Không ấn dưới sườn 12 sát cột sống (cực dưới thận)",
      "Đau lưng + sốt / tiểu máu / đau ban đêm không đổi tư thế → nội tạng / nhiễm khuẩn, chuyển bác sĩ",
      "Mất tự chủ đại tiểu tiện + tê yên ngựa → cấp cứu (CES)",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      {
        title:
          "Iglesias-González et al. (2013) — Myofascial Trigger Points, Pain, Disability, and Sleep Quality in Patients with Chronic Nonspecific Low Back Pain",
        source: "Pain Medicine",
        pmid: "23993790",
        url: "https://pubmed.ncbi.nlm.nih.gov/23993790/",
      },
      CORE_TRP_REFERENCES[0],
      JANDA_REFERENCE,
    ],
    sampleAiPrompt:
      "Học viên đau thắt lưng dưới một bên khi Squat, hip hike rõ. Nghi TrP Quadratus lumborum (Travell: thủ phạm lớn của LBP) do glute medius yếu. Sàng lọc CES / red flag, palpation tam giác sườn 12–mào chậu, SMR, kích hoạt glute med, cue khung chậu ngang. PMID 23993790.",
  },
  {
    id: "iliopsoas",
    shortName: "Iliopsoas",
    name: "Cơ Thắt Lưng–Chậu — nút ở bụng, đau ở lưng",
    latinName: "M. Psoas major & M. Iliacus",
    category: "trunk",
    summary:
      "Điểm kích hoạt nằm mặt TRƯỚC (bụng bên / hố chậu) nhưng referred Pain chủ yếu là đau dọc MỘT BÊN cột sống thắt lưng và mặt trước háng. Khách 'đứng dậy khỏi ghế bị cứng lưng'. PT hay foam roll lưng sau — sai chỗ.",
    mechanism:
      "Iliopsoas Locked-Short do ngồi lâu + Squat depth thiếu + ưỡn thắt lưng. Psoas bám mỏm ngang T12–L5 nên nút bụng kéo đốt sống; glute max bị ức chế (Janda Lower Crossed). Đứng dậy = duỗi háng trên cơ đang rút → đau.",
    nodes: [
      {
        id: "psoas-l",
        code: "TrP Psoas",
        locationLabel: "Psoas, cạnh ngoài cơ thẳng bụng, ngang rốn lệch 4–5 cm (trái)",
        view: "anterior",
        x: 392,
        y: 655,
      },
      {
        id: "iliacus-l",
        code: "TrP Iliacus",
        locationLabel: "Iliacus, mặt trong hố chậu, sát mào chậu trong (trái)",
        view: "anterior",
        x: 348,
        y: 742,
      },
      {
        id: "psoas-r",
        code: "TrP Psoas",
        locationLabel: "Psoas, cạnh ngoài cơ thẳng bụng, ngang rốn lệch 4–5 cm (phải)",
        view: "anterior",
        x: 508,
        y: 655,
      },
    ],
    referredPain: [
      {
        view: "posterior",
        d: "M 360 610 C 420 590, 480 610, 495 680 L 460 740 C 400 755, 350 720, 345 660 Z",
        labelX: 210,
        labelY: 660,
        description:
          "Đau dọc một bên cột sống thắt lưng (nơi khách than) — nút thật lại ở bụng.",
      },
      {
        view: "anterior",
        d: "M 320 700 C 380 680, 430 720, 420 780 L 370 810 C 320 800, 300 750, 320 700 Z",
        labelX: 175,
        labelY: 745,
        description: "Đau mặt trước háng / nếp bẹn khi đứng dậy, bước lên cầu thang.",
      },
    ],
    palpation: {
      clientPosition:
        "Nằm ngửa, gối cùng bên gập, bàn chân đặt giường để chùng psoas. PT đứng bên, tay ấm.",
      technique: "Deep / Snapping Palpation",
      bonyLandmarks:
        "Psoas: từ rốn ra ngoài ~4–5 cm, ấn CHẬM giữa rectus và oblique, hướng sau–trong về cột sống (không về giữa bụng). Iliacus: ngón trượt xuống mặt trong mào chậu.",
      underFingerFeel:
        "Psoas như 'thỏi' dọc sâu, đập theo mạch chủ nên ấn thì thì — gặp nút khách nín thở, lưng sau 'nóng'. Không nhầm đại tràng (sôi, nông hơn).",
      clientResponse:
        "Đau sâu bụng bên + CHỈ VÀO LƯNG SAU cùng bên. Đây là referred cổ điển.",
    },
    chain: {
      overloadedState: "Locked-Short (Bị rút ngắn co cứng)",
      biomechanicalReason:
        "Ngồi lâu + ưỡn thắt lưng khi Squat/OHP. Psoas rút giữ đốt sống ở lordosis tăng; glute max không duỗi háng được hết → Deadlift lockout bằng lưng.",
      antagonistOrInhibited: {
        muscles: "Gluteus maximus + Core chống ưỡn (TrA, obliques, hamstrings đa khớp)",
        whyRelated:
          "Lower Crossed Syndrome (Janda): iliopsoas + erector thắng; glute max + abdominals yếu. Nhả psoas rồi phải dạy glute ngay.",
        activationExercise:
          "Glute bridge với posterior pelvic tilt 3 × 12 + Dead bug 3 × 6/bên. Cue: 'dán thắt lưng xuống rồi mới đẩy gót'.",
      },
      satelliteTriggerPoints: [
        "Quadratus lumborum",
        "Rectus femoris (gập háng đồng vận)",
        "Erector spinae thắt lưng",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Bóng mềm trên bụng (psoas) — KHÔNG bóng cứng; iliacus: bóng nhỏ mặt trong mào chậu khi nằm nghiêng.",
        placement:
          "Nằm sấp lên bóng mềm cạnh rốn lệch ngoài, gối gập. Hoặc PT ấn bằng ngón theo nhịp thở, 20–30s mỗi lần.",
        pressureAndTime:
          "VAS 4–5 (bụng nhạy hơn). Thở ra dài, đợi thành bụng nhả rồi ấn sâu hơn một nấc. Dừng nếu buồn nôn, tê bì bẹn, mạch đập đau.",
        pinAndStretch:
          "Giữ ấn, khách từ từ duỗi gối cùng bên xuống giường (kéo giãn psoas trên nút).",
      },
      step2Mobility:
        "Half-kneeling hip flexor stretch có posterior pelvic tilt (cuộn xương chậu, mông siết, không ưỡn). 3 × 30s.",
      step3Activation:
        "Glute bridge + Bird dog. Không Stretch xong rồi ngồi xuống — phải kích hoạt glute trong 5 phút.",
      step4LoadCue:
        "Squat: đạt depth bằng gập háng–gối, không bằng ưỡn thắt lưng. Deadlift lockout: siết mông, xương sườn hạ. Giảm ngồi liên tục — đứng dậy 5 phút mỗi giờ.",
    },
    gymTriggers: [
      "Ngồi 8–10 giờ, đứng dậy đau lưng",
      "Squat ưỡn thắt lưng, hip flexor lấy depth",
      "Leg raise treo người volume cao khi psoas đã rút",
    ],
    contraindications: [
      "Không ấn giữa bụng / quanh rốn (động mạch chủ) hay hố chậu khi nghi ruột thừa",
      "Đau bụng + sốt / phản ứng thành bụng → ngoại khoa, không phải TrP",
      "Phụ nữ mang thai: không deep palpation bụng",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      JANDA_REFERENCE,
      {
        title:
          "Iglesias-González et al. (2013) — Myofascial Trigger Points in Chronic Nonspecific Low Back Pain",
        source: "Pain Medicine",
        pmid: "23993790",
        url: "https://pubmed.ncbi.nlm.nih.gov/23993790/",
      },
      CORE_TRP_REFERENCES[1],
    ],
    sampleAiPrompt:
      "Học viên đau một bên thắt lưng khi đứng dậy khỏi ghế, ngồi nhiều. PT sờ psoas cạnh rốn tái hiện đau lưng sau (Travell iliopsoas referred). Sàng lọc red flag bụng / CES. Hướng dẫn ấn psoas an toàn, half-kneeling stretch có posterior tilt, kích hoạt glute max. PMID 23993790, Janda Lower Crossed.",
  },
  {
    id: "glute_med_piriformis",
    shortName: "Mông nhỡ & Hình lê",
    name: "Cơ Mông Nhỡ, Mông Bé & Cơ Hình Lê — giả thần kinh tọa",
    latinName: "M. Gluteus medius, minimus & M. Piriformis",
    category: "hip_leg",
    summary:
      "Glute minimus là 'thần kinh tọa của Travell': đau lan mặt ngoài / sau đùi xuống bắp chân mà MRI cột sống sạch. Piriformis chồng thêm khi dây tọa đi qua / dưới cơ. Hopayian (PMID 20598206) cảnh báo chẩn đoán piriformis phải loại trừ rễ thần kinh thật.",
    mechanism:
      "Trendelenburg / valgus gối khi Squat → glute med/min Locked-Long quá tải (hãm khung chậu) VÀ TFL–piriformis gồng bù. Ngồi ví sau túi quần chèn piriformis. Glute max ức chế → chuỗi sau phải gồng.",
    nodes: [
      {
        id: "gmed-l",
        code: "TrP Gmed",
        locationLabel: "Glute medius, 1/3 sau mào chậu (upper shelf) trái",
        view: "posterior",
        x: 348,
        y: 792,
      },
      {
        id: "gmin-l",
        code: "TrP Gmin",
        locationLabel: "Glute minimus, sâu dưới medius, mặt ngoài mông trái",
        view: "posterior",
        x: 318,
        y: 838,
      },
      {
        id: "pf-l",
        code: "TrP PF",
        locationLabel: "Piriformis, 1/2 đường S2 → mấu chuyển lớn (trái)",
        view: "posterior",
        x: 378,
        y: 868,
      },
      {
        id: "gmed-r",
        code: "TrP Gmed",
        locationLabel: "Glute medius, 1/3 sau mào chậu (phải)",
        view: "posterior",
        x: 552,
        y: 792,
      },
    ],
    referredPain: [
      {
        view: "posterior",
        d: "M 300 760 C 380 740, 450 780, 440 880 L 400 1020 C 350 1100, 310 980, 295 860 Z",
        labelX: 200,
        labelY: 920,
        description:
          "Pseudo-sciatica: mông → mặt sau / ngoài đùi → bắp chân. Không theo đúng khoanh S1 nếu là TrP thuần.",
      },
    ],
    palpation: {
      clientPosition:
        "Nằm nghiêng, hông trên hơi gập 45° / gối 90°. PT sờ từ mào chậu xuống mấu chuyển lớn.",
      technique: "Deep / Snapping Palpation",
      bonyLandmarks:
        "Mào chậu, mấu chuyển lớn, gai chậu sau trên (PSIS). Piriformis: 1/2 đường từ bờ ngoài sacrum tới mấu chuyển lớn, SÂU dưới glute max.",
      underFingerFeel:
        "Gmed: nút nông hơn dưới mào chậu. Gmin: sâu, Jump Sign mạnh, khách chỉ xuống chân. Piriformis: thỏi chéo sâu, ấn quá giữa có thể tái tê bàn chân — giảm lực ngay.",
      clientResponse:
        "Lan xuống chân. Phân biệt: TrP thường đau sâu cơ, tê không theo đúng khoanh, SLR âm tính hoặc chỉ căng mông. Rễ thần kinh: tê khoanh, yếu lực, phản xạ giảm.",
    },
    chain: {
      overloadedState: "Locked-Long (Bị kéo giãn quá tải)",
      biomechanicalReason:
        "Glute med/min phải hãm pelvis trên chân trụ nhưng bị TFL và adductors thắng. Piriformis gồng xoay ngoài bù khi squat valgus.",
      antagonistOrInhibited: {
        muscles: "Gluteus maximus (ức chế) — TFL là synergist đang thắng",
        whyRelated:
          "Kích hoạt glute max + med theo mặt phẳng trán. Nếu chỉ foam roll piriformis, valgus vẫn còn → TrP quay lại.",
        activationExercise:
          "Sidelying clam (không xoay thân) 3 × 12 + Single-leg hip hinge 3 × 8. Cue: 'đẩy sàn ra ngoài bằng mép ngoài bàn chân'.",
      },
      satelliteTriggerPoints: [
        "TFL / IT band complex",
        "Hamstrings (đau chồng mặt sau đùi)",
        "QL (hip hike)",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Bóng lacrosse ngồi lên (piriformis) hoặc tựa tường (gmed upper shelf).",
        placement:
          "Piriformis: ngồi lệch mông lên bóng, chân cùng bên bắt chéo. Gmed: đứng, bóng dưới mào chậu 1/3 sau. Tránh xương sacrum và đại trà thần kinh tọa giữa mông nếu tê tăng.",
        pressureAndTime: "VAS 5–6, 45–90s. Tê bàn chân tăng → nhấc ra, dịch bóng lên trên / ra ngoài.",
        pinAndStretch:
          "Giữ bóng piriformis, khách gập háng thêm (kéo gối vào ngực) chậm.",
      },
      step2Mobility:
        "Figure-4 stretch 3 × 30s, xương chậu không xoay. Không kéo mạnh kiểu 'bẻ khớp háng'.",
      step3Activation:
        "Clam + Lateral band walk 3 × 12 bước. Ưu tiên cảm giác mông nhỡ, không TFL (sờ TFL — nếu TFL cháy thì giảm ROM, xoay hông ra ngoài hơn).",
      step4LoadCue:
        "Squat: gối theo mũi chân, không valgus. Single-leg RDL trước khi tăng tạ 2 chân. Bỏ ví túi sau khi ngồi.",
    },
    gymTriggers: [
      "Squat valgus, Trendelenburg trên máy hack / step-up",
      "Ngồi lâu, ví / điện thoại túi sau",
      "Chạy bộ volume tăng đột ngột",
    ],
    contraindications: [
      "Tê bì theo khoanh, yếu gót / mũi chân, phản xạ Achilles giảm → rễ S1, không 'bấm piriformis cho đỡ'",
      "Hội chứng đuôi ngựa — cấp cứu",
      "Không ấn mạnh giữa mông nếu tê tăng ngay (dây tọa nông)",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      {
        title:
          "Hopayian et al. (2010) — The Clinical Features of the Piriformis Syndrome: A Systematic Review",
        source: "European Spine Journal",
        pmid: "20598206",
        url: "https://pubmed.ncbi.nlm.nih.gov/20598206/",
      },
      {
        title:
          "Martin et al. (2016) — Deep Gluteal Syndrome",
        source: "Journal of Hip Preservation Surgery",
        pmid: "27583147",
        url: "https://pubmed.ncbi.nlm.nih.gov/27583147/",
      },
      JANDA_REFERENCE,
    ],
    sampleAiPrompt:
      "Học viên đau mông lan mặt sau đùi xuống bắp chân khi Squat, MRI cột sống sạch. Nghi TrP Gluteus minimus (Travell sciatica) ± piriformis. Sàng lọc rễ thần kinh vs pseudo-sciatica (PMID 20598206), SMR an toàn, kích hoạt glute med/max, cue chống valgus.",
  },
  {
    id: "tfl_vastus_lateralis",
    shortName: "TFL & Rộng ngoài",
    name: "Cơ Căng Mạc Đùi & Rộng Ngoài — đau mặt ngoài gối",
    latinName: "M. Tensor fasciae latae & M. Vastus lateralis",
    category: "hip_leg",
    summary:
      "TFL gồng bù khi glute medius yếu, kéo dải chậu–chày. Vastus lateralis là cơ lớn, TrP dọc mặt ngoài đùi referred thẳng xuống mặt ngoài khớp gối — khách nghĩ 'đau gối / IT band'. Foam roll IT band trên xương đùi thì đau nhưng nút nằm trong VL và TFL.",
    mechanism:
      "Synergist Dominant: TFL làm cả gập–nội xoay–dạng háng khi glute med không làm dạng. VL quá tải vì squat valgus + ngồi. Travell: VL có nhiều TrP dọc từ mấu chuyển tới xương bánh chè ngoài.",
    nodes: [
      {
        id: "tfl-l",
        code: "TrP TFL",
        locationLabel: "TFL, dưới gai chậu trước trên (ASIS) ra ngoài (trái)",
        view: "anterior",
        x: 302,
        y: 778,
      },
      {
        id: "vl-l",
        code: "TrP VL",
        locationLabel: "Vastus lateralis, 1/2 mặt ngoài đùi (trái)",
        view: "anterior",
        x: 318,
        y: 980,
      },
      {
        id: "vl-dist-l",
        code: "TrP VL xa",
        locationLabel: "Vastus lateralis xa, trên lồi cầu ngoài (trái)",
        view: "anterior",
        x: 328,
        y: 1125,
      },
    ],
    referredPain: [
      {
        view: "anterior",
        d: "M 275 760 C 330 740, 360 800, 350 900 L 340 1140 C 310 1180, 280 1100, 270 900 Z",
        labelX: 175,
        labelY: 980,
        description:
          "Lan dọc mặt ngoài đùi xuống mặt ngoài khớp gối (giả ITBS / đau bánh chè ngoài).",
      },
    ],
    palpation: {
      clientPosition:
        "Nằm ngửa, gối hơi gập. TFL: sờ dưới ASIS ra ngoài khi khách gập háng nhẹ. VL: sờ dọc mặt ngoài đùi trên nền xương.",
      technique: "Flat Palpation",
      bonyLandmarks:
        "ASIS, mấu chuyển lớn, lồi cầu ngoài xương đùi. TFL nằm trong tam giác ASIS–mấu chuyển–trước. VL phủ mặt ngoài xương đùi.",
      underFingerFeel:
        "TFL: thỏi nhỏ, chắc, Jump Sign ra ngoài háng. VL: taut band dọc, nhiều nút; xa gối thì ấn rất đau, khách chỉ mặt ngoài bánh chè.",
      clientResponse:
        "Đau mặt ngoài gối 'như dao' khi xuống cầu thang / Squat. IT band bản thân ít nút — nút ở TFL và VL.",
    },
    chain: {
      overloadedState: "Synergist Dominant (Gồng bù trừ)",
      biomechanicalReason:
        "Glute medius không kiểm soát mặt phẳng trán → TFL cháy. VL kéo bánh chè ra ngoài khi VMO tương đối trễ (cơ học, không thần thoại VMO cô lập).",
      antagonistOrInhibited: {
        muscles: "Gluteus medius / maximus; cân bằng vastus medialis trong pattern khép–duỗi gối",
        whyRelated:
          "Foam roll ITB mỗi ngày mà không dạy hông dạng–xoay ngoài thì TFL vẫn thắng.",
        activationExercise:
          "Side-lying hip abduction (TFL chùng: hơi duỗi háng, xoay ngoài) 3 × 12 + Terminal knee extension có band 3 × 12.",
      },
      satelliteTriggerPoints: [
        "Gluteus minimus",
        "Rectus femoris",
        "Gastrocnemius đầu ngoài",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Foam roller / bóng cho VL; bóng nhỏ cho TFL dưới ASIS.",
        placement:
          "VL: nằm nghiêng, roller mặt ngoài ĐÙI (cơ), không đè xương bánh chè hay mấu chuyển. TFL: bóng ngay dưới ASIS ra ngoài, 30–45s.",
        pressureAndTime:
          "VAS 5–6, 45–60s mỗi nút VL (thường 2–3 nút). IT band trên xương: lăn nhẹ chỉ để di động, không 'nghiền' 5 phút.",
        pinAndStretch:
          "Giữ bóng TFL, khách khép háng nhẹ (chân trên đưa ra sau) để kéo TFL.",
      },
      step2Mobility:
        "TFL stretch đứng (chân sau bắt chéo sau chân trụ, đẩy hông ra ngoài, tay cùng bên đưa lên). 3 × 30s.",
      step3Activation:
        "Hip abduction hơi duỗi háng 3 × 12 + Split squat kiểm soát gối giữa bàn chân.",
      step4LoadCue:
        "Squat / lunge: gối không sập vào trong, không đẩy gối ra ngoài quá (hip hinge vẫn cần). Giảm downhill run tạm.",
    },
    gymTriggers: [
      "Squat valgus, hack squat đẩy gối ra trước–ngoài",
      "Chạy dốc xuống, volume đột tăng",
      "Ngồi bắt chéo chân lâu",
    ],
    contraindications: [
      "Sưng gối, kẹt khớp, khóa gối → nội khớp, không phải TrP VL",
      "Không lăn trực tiếp trên lồi cầu / dải ITB sát xương bánh chè khi sưng",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      CORE_TRP_REFERENCES[3],
      CORE_TRP_REFERENCES[4],
      JANDA_REFERENCE,
    ],
    sampleAiPrompt:
      "Học viên đau mặt ngoài gối khi Squat và xuống cầu thang. Sờ TFL dưới ASIS và Vastus lateralis tái hiện đau gối (Travell VL referred). Phân biệt ITBS / bệnh bánh chè. SMR TFL+VL, kích hoạt glute med, cue chống valgus. PMID 30756327 (cơ chế SMR).",
  },
  {
    id: "soleus_gastroc",
    shortName: "Bắp chân & Dép",
    name: "Cơ Bụng Chân, Cơ Dép & Chày Trước — giả viêm cân gan chân",
    latinName: "M. Gastrocnemius, M. Soleus & M. Tibialis anterior",
    category: "hip_leg",
    summary:
      "Soleus TrP1 của Travell referred thẳng xuống GÓT — khách được gắn mác plantar fasciitis. Hạn chế dorsiflexion làm Squat sập gối / ưỡn lưng. Gastroc TrP gây đau bụng chân và khoeo. Tibialis anterior TrP đau mặt trước cẳng chân (giả shin splint).",
    mechanism:
      "Giày cao gót / mũi giày hẹp, Squat kê gót, chạy tăng volume: soleus Locked-Short, dorsiflexion mất. Gastroc đa khớp dễ TrP khi deadlift gối cứng + thiếu hinge. Thiếu dorsiflexion → chuỗi bù từ gối đến thắt lưng.",
    nodes: [
      {
        id: "gas-l",
        code: "TrP Gas",
        locationLabel: "Gastrocnemius đầu trong, bụng trên bắp chân (trái)",
        view: "posterior",
        x: 372,
        y: 1265,
      },
      {
        id: "sol-l",
        code: "TrP1 Sol",
        locationLabel: "Soleus TrP1, 1/3 dưới bắp chân, sâu hơn gastroc (trái)",
        view: "posterior",
        x: 380,
        y: 1368,
      },
      {
        id: "ta-l",
        code: "TrP TA",
        locationLabel: "Tibialis anterior, 1/3 trên mặt trước cẳng chân (trái)",
        view: "anterior",
        x: 368,
        y: 1285,
      },
    ],
    referredPain: [
      {
        view: "posterior",
        d: "M 340 1320 C 400 1300, 430 1360, 420 1480 L 390 1580 C 350 1590, 330 1480, 335 1380 Z",
        labelX: 210,
        labelY: 1480,
        description:
          "Soleus TrP1 → đau thốn GÓT và gân Achilles (giả plantar fasciitis / Achilles tendinopathy).",
      },
      {
        view: "anterior",
        d: "M 330 1220 C 390 1200, 420 1280, 405 1420 L 360 1460 C 325 1380, 315 1280, 330 1220 Z",
        labelX: 175,
        labelY: 1320,
        description: "Tibialis anterior → đau mặt trước cẳng chân (giả shin splint).",
      },
    ],
    palpation: {
      clientPosition:
        "Gastroc: nằm sấp, gối hơi gập, pincer bụng cơ. Soleus: gối gập 90° (chùng gastroc), ấn sâu qua gastroc vào soleus. TA: nằm ngửa, flat palpation cạnh xương chày.",
      technique: "Pincer Palpation",
      bonyLandmarks:
        "Khoeo, gân Achilles, mắt cá trong/ngoài, mào chày trước. Soleus TrP1: 1/3 dưới cẳng chân, hơi lệch trong, SÂU.",
      underFingerFeel:
        "Gastroc: nút trong bụng, pincer rõ. Soleus: phải 'lọt' qua lớp nông, nút chắc, ấn là khách chỉ GÓT. TA: taut band dọc cạnh chày.",
      clientResponse:
        "Soleus: 'đau gót buổi sáng' — hỏi thêm có nút bắp chân không trước khi kết luận fascia gan chân. TA: đau khi xuống dốc / chạy.",
    },
    chain: {
      overloadedState: "Locked-Short (Bị rút ngắn co cứng)",
      biomechanicalReason:
        "Dorsiflexion mất → squat depth lấy từ gối valgus hoặc thân đổ. Soleus rút còn làm chân trụ cứng, truyền sốc lên gối và ITB.",
      antagonistOrInhibited: {
        muscles: "Tibialis anterior (dorsiflexor) — phải kích hoạt sau khi nhả soleus",
        whyRelated:
          "Kéo giãn soleus xong không dạy TA thì chiến lược đi bộ vẫn là plantarflex. ROM cổ chân là cửa sổ thần kinh–cơ, không chỉ 'cơ ngắn'.",
        activationExercise:
          "Seated dorsiflexion có band 3 × 15 + Wall ankle rocker 3 × 10 (gót dính, gối ra trước).",
      },
      satelliteTriggerPoints: [
        "Vastus lateralis (bù dorsiflexion)",
        "Plantar fascia / flexor digitorum brevis (nạn nhân gót)",
        "Hamstrings (chuỗi sau)",
      ],
    },
    protocol: {
      step1Release: {
        tool: "Foam roller gastroc/soleus; bóng nhỏ dưới soleus 1/3 dưới; không lăn xương chày.",
        placement:
          "Ngồi, roller dưới bắp chân, gối gập để nhắm soleus. Bóng: ấn TrP1 1/3 dưới lệch trong.",
        pressureAndTime:
          "VAS 5–6, 60s. Gập–duỗi cổ chân chậm trên bóng (pin & move). Dừng nếu tê bàn chân (khoang / thần kinh chày).",
        pinAndStretch:
          "Giữ nút soleus, khách gập mu chân (dorsiflex) chậm, gối vẫn gập.",
      },
      step2Mobility:
        "Kneeling or standing gastroc stretch (gối thẳng) VÀ soleus stretch (gối gập) 3 × 30s mỗi cái — phải tách hai khớp.",
      step3Activation:
        "Tibialis raise 3 × 15 + Calf raise chậm đầy ROM (dừng 2s đáy). Kinoshita logic: đứng = gastroc, ngồi = soleus.",
      step4LoadCue:
        "Squat: gót xuống đất, gối ra trước trong giới hạn cổ chân thật — không kê gót mãi nếu mục tiêu là ROM. Chạy: tăng volume ≤10%/tuần. Đổi giày cao gót khi tập.",
    },
    gymTriggers: [
      "Squat kê gót thường xuyên, dorsiflexion không bao giờ được tải",
      "Calf raise nửa ROM, nảy Achilles",
      "Chạy tăng km đột ngột, shin splint",
    ],
    contraindications: [
      "Sưng / đỏ / nóng bắp chân một bên + khó thở → DVT, cấp cứu, không SMR",
      "Đau gót trẻ vận động viên: loại Sever / stress fracture",
      "Không lăn trực tiếp lên xương chày",
    ],
    references: [
      TEXTBOOK_TRAVELL,
      CORE_TRP_REFERENCES[3],
      CORE_TRP_REFERENCES[4],
      {
        title:
          "Cheatham et al. (2015) — Self-Myofascial Release: ROM, Recovery, Performance (Systematic Review)",
        source: "Int J Sports Phys Ther",
        pmid: "26618062",
        url: "https://pubmed.ncbi.nlm.nih.gov/26618062/",
      },
    ],
    sampleAiPrompt:
      "Học viên đau thốn gót buổi sáng, bị gắn plantar fasciitis, Squat sập gối. Sờ Soleus TrP1 (Travell) tái hiện đau gót. Sàng lọc DVT / stress fracture. Phác đồ nhả soleus (gối gập), tách stretch gastroc vs soleus, kích hoạt tibialis anterior, cue Squat gót xuống. PMID 26618062.",
  },
];

export const PAIN_SITE_CULPRIT_MAP: PainSiteCulprit[] = [
  {
    id: "anterior_shoulder",
    name: "Đau sâu mặt trước khớp vai",
    shortName: "Mặt trước vai",
    view: "anterior",
    zoneD: "M 218 330 C 270 300, 340 325, 355 390 L 335 480 C 270 505, 205 455, 205 385 Z",
    pinX: 268,
    pinY: 390,
    victimLabel:
      "Khách chỉ mặt trước vai khi Bench / Sleeping on side — đây thường là NẠN NHÂN, không phải chỗ nút.",
    culprits: [
      {
        muscleId: "infraspinatus",
        whyDeceptive:
          "Nút nằm HỐ DƯỚI GAI (mặt sau xương bả). Travell: infraspinatus referred thẳng ra mặt trước vai và xuống cánh tay ngoài — hay bị gắn 'viêm gân nhị đầu'.",
      },
      {
        muscleId: "pec_minor",
        whyDeceptive:
          "Pec minor kéo mỏm quạ ra trước, chèn khoang dưới đòn, đau mặt trước vai lan mặt trong tay ngón 4–5 (giả TOS).",
      },
    ],
  },
  {
    id: "neck_temple",
    name: "Đau gáy, thái dương & góc hàm",
    shortName: "Gáy & thái dương",
    view: "anterior",
    zoneD: "M 175 155 C 250 125, 350 140, 420 175 L 400 250 C 320 270, 230 250, 180 210 Z",
    pinX: 250,
    pinY: 195,
    victimLabel:
      "Khách than đau đầu căng thẳng, đau thái dương cuối ngày ngồi máy tính.",
    culprits: [
      {
        muscleId: "upper_trapezius",
        whyDeceptive:
          "Bản đồ Travell hình dấu hỏi: TrP bụng thang trên lan lên ụ chẩm, sau tai, thái dương — không phải 'thoái hoá não'.",
      },
      {
        muscleId: "levator_scapulae",
        whyDeceptive:
          "Cứng góc cổ, không xoay đầu. Đau tập trung góc trên xương bả hơn là thái dương, nhưng chồng với thang trên rất thường xuyên.",
      },
    ],
  },
  {
    id: "between_scapulae",
    name: "Đau giữa hai bả vai / góc dưới xương bả",
    shortName: "Giữa hai bả",
    view: "posterior",
    zoneD: "M 330 430 C 410 400, 490 420, 530 500 L 500 640 C 430 680, 360 650, 320 540 Z",
    pinX: 450,
    pinY: 540,
    victimLabel:
      "Khách nhờ 'bấm giúp giữa hai bả' — chỗ than đau là giao điểm referred của vài cơ, không phải một nút duy nhất.",
    culprits: [
      {
        muscleId: "lats_serratus",
        whyDeceptive:
          "TrP lats bờ ngoài referred vào góc dưới xương bả dai dẳng, đổi tư thế không đỡ.",
      },
      {
        muscleId: "levator_scapulae",
        whyDeceptive:
          "Lan dọc bờ trong xương bả xuống giữa hai bả, kèm cứng cổ.",
      },
      {
        muscleId: "pec_minor",
        whyDeceptive:
          "Pec minor rút kéo xương bả tilt trước, rhomboid / mid-trap bị Locked-Long quá tải — đau giữa hai bả là nạn nhân tư thế.",
      },
    ],
  },
  {
    id: "low_back",
    name: "Đau thắt lưng dưới một bên",
    shortName: "Thắt lưng",
    view: "posterior",
    zoneD: "M 340 620 C 420 590, 500 610, 530 690 L 500 780 C 430 810, 350 780, 325 700 Z",
    pinX: 450,
    pinY: 700,
    victimLabel:
      "Khách chỉ 'lưng dưới'. Foam roll erector suốt năm mà không sờ QL / psoas thì thường thiếu thủ phạm.",
    culprits: [
      {
        muscleId: "quadratus_lumborum",
        whyDeceptive:
          "Travell: QL là thủ phạm lớn nhất của LBP. Đau SI / mào chậu / mông trên. Hip hike khi Squat là dấu hiệu vàng.",
      },
      {
        muscleId: "iliopsoas",
        whyDeceptive:
          "Nút ở BỤNG (cạnh rốn / hố chậu) nhưng referred dọc một bên cột sống thắt lưng. Đứng dậy khỏi ghế đau là manh mối.",
      },
    ],
  },
  {
    id: "glute_posterior_thigh",
    name: "Đau mông lan mặt sau đùi (giả thần kinh tọa)",
    shortName: "Mông & đùi sau",
    view: "posterior",
    zoneD: "M 300 760 C 380 730, 470 770, 460 900 L 420 1120 C 360 1180, 300 1020, 285 860 Z",
    pinX: 360,
    pinY: 920,
    victimLabel:
      "Khách sợ thoát vị đĩa đệm. Cần sàng lọc rễ thần kinh trước, nhưng nhiều case MRI sạch là TrP glute minimus.",
    culprits: [
      {
        muscleId: "glute_med_piriformis",
        whyDeceptive:
          "Glute minimus = 'sciatica của Travell'. Piriformis chồng khi ngồi ví túi sau. Hopayian PMID 20598206: phải loại rễ thật.",
      },
      {
        muscleId: "quadratus_lumborum",
        whyDeceptive:
          "QL sâu referred xuống mông trên / SI, đôi khi khách mô tả 'đau mông' dù gốc ở thắt lưng.",
      },
    ],
  },
  {
    id: "lateral_knee",
    name: "Đau mặt ngoài khớp gối",
    shortName: "Mặt ngoài gối",
    view: "anterior",
    zoneD: "M 290 1080 C 350 1060, 390 1100, 380 1180 L 350 1240 C 310 1250, 280 1180, 285 1120 Z",
    pinX: 330,
    pinY: 1155,
    victimLabel:
      "Khách nghĩ tổn thương meniscus ngoài hoặc IT band. Nút thường ở TFL và Vastus lateralis, cách gối 10–30 cm.",
    culprits: [
      {
        muscleId: "tfl_vastus_lateralis",
        whyDeceptive:
          "Travell VL referred xuống mặt ngoài bánh chè. TFL kéo ITB. Foam roll 'dải ITB' trên xương ít giải quyết nút trong cơ.",
      },
      {
        muscleId: "glute_med_piriformis",
        whyDeceptive:
          "Glute med/min yếu → valgus → dồn mặt ngoài gối. Đau gối là nạn nhân của hông.",
      },
    ],
  },
  {
    id: "heel_foot",
    name: "Đau thốn gót / gan chân",
    shortName: "Gót chân",
    view: "posterior",
    zoneD: "M 345 1480 C 400 1465, 430 1510, 420 1585 L 375 1610 C 335 1600, 325 1530, 345 1480 Z",
    pinX: 380,
    pinY: 1545,
    victimLabel:
      "Hay bị gắn plantar fasciitis. Hỏi và sờ soleus TrP1 trước khi chỉ điều trị gan chân.",
    culprits: [
      {
        muscleId: "soleus_gastroc",
        whyDeceptive:
          "Travell Soleus TrP1 referred thẳng xuống gót. Hạn chế dorsiflexion đi kèm. Loại DVT / stress fracture trước khi SMR.",
      },
    ],
  },
  {
    id: "anterior_hip",
    name: "Đau mặt trước háng / nếp bẹn",
    shortName: "Mặt trước háng",
    view: "anterior",
    zoneD: "M 310 700 C 380 680, 440 720, 430 790 L 380 830 C 320 825, 290 770, 310 700 Z",
    pinX: 360,
    pinY: 760,
    victimLabel:
      "Khách than đau bẹn khi bước lên, đứng dậy, Squat sâu. Có thể là TrP iliopsoas — nhưng phải loại FAI / labrum / hernia.",
    culprits: [
      {
        muscleId: "iliopsoas",
        whyDeceptive:
          "Iliacus / psoas referred ra nếp bẹn và mặt trước háng. Nút iliacus ở mặt trong hố chậu, không phải 'khớp háng'.",
      },
      {
        muscleId: "tfl_vastus_lateralis",
        whyDeceptive:
          "TFL referred ra ngoài háng hơn là nếp bẹn; nếu khách chỉ mặt ngoài háng thì TFL thắng iliopsoas.",
      },
    ],
  },
];

export const CATEGORY_LABELS: Record<"all" | TriggerPointCategory, string> = {
  all: "Tất cả (10)",
  neck_shoulder: "Cổ – Vai – Đai vai",
  trunk: "Thân mình – Thắt lưng",
  hip_leg: "Hông – Gối – Cổ chân",
};

export function getTriggerPointMuscle(
  id: TriggerPointMuscleId,
): TriggerPointMuscle {
  return (
    TRIGGER_POINT_MUSCLES.find((m) => m.id === id) ?? TRIGGER_POINT_MUSCLES[0]
  );
}

export function getPainSite(id: PainSiteId): PainSiteCulprit {
  return (
    PAIN_SITE_CULPRIT_MAP.find((p) => p.id === id) ?? PAIN_SITE_CULPRIT_MAP[0]
  );
}

export function culpritMusclesForSite(
  site: PainSiteCulprit,
): TriggerPointMuscle[] {
  return site.culprits.map((c) => getTriggerPointMuscle(c.muscleId));
}
