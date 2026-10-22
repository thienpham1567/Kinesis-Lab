import {
  TRIGGER_EVIDENCE_SOURCES,
  TRIGGER_POINT_EVIDENCE,
  TRIGGER_GENERAL_EVIDENCE,
} from "./evidence-trigger";
import type { ScientificReference } from "./muscle-hypertrophy-atlas";

export { TRIGGER_POINT_EVIDENCE, TRIGGER_GENERAL_EVIDENCE };

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
  | "Synergist Dominant (Gồng bù trừ)"
  | "Chưa xác định qua đánh giá trực tiếp";

export type PainSiteId =
  | "anterior_shoulder"
  | "neck_temple"
  | "between_scapulae"
  | "low_back"
  | "glute_posterior_thigh"
  | "lateral_knee"
  | "heel_foot"
  | "anterior_hip";

/** Legacy illustrative coordinates, retained for compatibility; withheld from the UI because a source-to-location mapping is unavailable. */
export interface TriggerPointNode {
  id: string;
  code: string;
  locationLabel: string;
  view: "anterior" | "posterior";
  x: number;
  y: number;
}

/** Legacy illustrative referral shapes, not a validated map; withheld from the UI. */
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

/** One muscle inside a grouped entry; layer and study coverage are cited per component. */
export interface TriggerMuscleComponent {
  name: string;
  latin: string;
  layer: string;
  trpStudy: string;
}

/** Sourced OpenStax plates (provenance in public/anatomy/SOURCES.md). */
export const SOURCE_PLATES = {
  openstax1105: {
    src: "/anatomy/full-body-muscles-openstax.jpg",
    width: 1304,
    height: 3033,
    title: "OpenStax A&P, hình 1105 — mặt trước/sau; nửa phải người: nông, nửa trái người: sâu",
    credit: "OpenStax, CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg",
  },
  openstaxGluteal: {
    src: "/anatomy/glute-deep-openstax.jpg",
    width: 1713,
    height: 2175,
    title: "OpenStax A&P, hình 1122 — cơ chậu hông và đùi",
    credit: "OpenStax, CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:1122_Gluteal_Muscles_that_Move_the_Femur.jpg",
  },
} as const;

export interface SourcePlateView {
  plate: keyof typeof SOURCE_PLATES;
  /** x, y, width, height in source pixels; framing only, not an anatomical claim. */
  crop: [number, number, number, number];
  /** Labels printed on the source figure that belong to this entry. */
  labels: string[];
}

export interface TriggerPointMuscle {
  id: TriggerPointMuscleId;
  shortName: string;
  name: string;
  latinName: string;
  category: TriggerPointCategory;
  components: TriggerMuscleComponent[];
  plateViews: SourcePlateView[];
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

const evidenceReference = (source: {
  title: string;
  url: string;
}): ScientificReference => {
  const pmid = source.url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/)?.[1];
  return {
    title: source.title,
    source: "Đối chiếu tài liệu; xem phạm vi nguồn và giới hạn",
    url: source.url,
    ...(pmid ? { pmid } : {}),
  };
};

export const CORE_TRP_REFERENCES: ScientificReference[] = [
  TRIGGER_EVIDENCE_SOURCES.consensus,
  TRIGGER_EVIDENCE_SOURCES.history,
  TRIGGER_EVIDENCE_SOURCES.biochemistry,
  TRIGGER_EVIDENCE_SOURCES.rollingMechanisms,
  TRIGGER_EVIDENCE_SOURCES.rolling,
].map(evidenceReference);

// Kept for API compatibility. Neither book was accessed for detailed claim verification.
export const TEXTBOOK_TRAVELL: ScientificReference = {
  title: "Travell, Simons & Simons’ Myofascial Pain and Dysfunction, 3rd ed. (2019): The Trigger Point Manual (chỉ kiểm tra trang nhà xuất bản)",
  source: "Không dùng xác nhận bản đồ hoặc phác đồ trong app",
  url: "https://shop.lww.com/Travell--Simons---Simons--Myofascial-Pain-and-Dysfunction/p/9781451119237",
};
export const JANDA_REFERENCE: ScientificReference = {
  title: "Page, Frank & Lardner (2010) — Assessment and Treatment of Muscle Imbalance: The Janda Approach (chưa đọc trong rà soát này)",
  source: "Human Kinetics; không dùng xác nhận cơ bị khóa hoặc ức chế ở cá nhân",
  url: "https://www.ncbi.nlm.nih.gov/nlmcatalog/101521868",
};

// Initial source comparison: 2026-10-19; all ten entries and the handbook rechecked on 2026-10-22.
// The four legacy protocol fields are navigation slots, not a validated treatment sequence.
export const PALPATION_FUNDAMENTALS = {
  "title": "Điểm nhạy cơ: cách hiểu và giới hạn cho huấn luyện viên",
  "hypothesis": "Giả thuyết tích hợp đề xuất rối loạn bản vận động, co cục bộ và thay đổi môi trường hóa học. Đây là mô hình nghiên cứu; chưa thể xác nhận thiếu ATP, thiếu máu hoặc sarcomere co bằng sờ một điểm đau. Nghiên cứu Shah 2008 chỉ có chín người và cho thấy khác biệt hóa học theo nhóm. [Shah 2008, 2015]",
  "diagnosticCriteria": [
    {
      "code": "1",
      "name": "Dải căng (taut band)",
      "feel": "Dấu hiệu sờ được đề xuất trong đồng thuận chuyên gia; khả năng nhận diện giữa người khám thay đổi. Không dùng riêng để chẩn đoán. [Delphi 2018; Myburgh 2008]"
    },
    {
      "code": "2",
      "name": "Điểm nhạy với áp lực",
      "feel": "Đau khu trú khi chạm có thể là một phần đánh giá triệu chứng. Không cần tạo đau mạnh, jump sign hoặc tìm một hạt có kích thước cố định. [Delphi 2018; Myburgh 2008]"
    },
    {
      "code": "3",
      "name": "Cảm giác lan hoặc tái hiện triệu chứng quen thuộc",
      "feel": "Có thể được ghi nhận trong khám lâm sàng; không kỳ vọng điểm và vùng lan giống hệt sơ đồ. Tái hiện đau không tự xác nhận nguồn đau. [Delphi 2018]"
    },
    {
      "code": "4",
      "name": "Đáp ứng giật cục bộ: không cần gây ra",
      "feel": "Đồng thuận đề xuất ba tiêu chí ở trên; giật cục bộ không thuộc cụm thiết yếu. Không hướng dẫn búng, ấn sâu hay dùng đau để tìm twitch. [Delphi 2018; NCCIH]"
    }
  ],
  "techniques": [
    {
      "name": "Flat Palpation" as PalpationTechnique,
      "when": "Chỉ tiếp xúc nhẹ vùng mô mềm nông nếu người tập đồng ý và người thực hiện có năng lực phù hợp.",
      "how": "Ghi vùng nhạy và phản ứng, không cố tái tạo sơ đồ. Sờ nắn không xác định chắc mô gây đau. [Myburgh 2008]"
    },
    {
      "name": "Pincer Palpation" as PalpationTechnique,
      "when": "Tên kỹ thuật được giữ để giải thích thuật ngữ, không là hướng dẫn chẩn đoán cho huấn luyện viên.",
      "how": "Không kẹp mạnh hoặc tìm jump sign. Cân nhắc chuyên viên được đào tạo nếu cần đánh giá mô mềm. [Myburgh 2008; NCCIH]"
    },
    {
      "name": "Deep / Snapping Palpation" as PalpationTechnique,
      "when": "Không đưa vào tự chăm sóc hoặc hướng dẫn thực hành của app.",
      "how": "Không ấn sâu cổ, quanh đòn/nách, bụng/bẹn hoặc vùng gây tê. Không búng cơ để tạo giật; đây là lựa chọn thận trọng của ứng dụng vì có báo cáo tổn thương thần kinh sau massage, không phải kỹ thuật đã được thử nghiệm cho từng cơ. [NCCIH; Chang 2015]"
    }
  ],
  "pressureScale": [
    {
      "level": "Nhẹ, dễ chịu",
      "meaning": "Nếu tự lăn phù hợp, chọn lực nhẹ và dễ dừng; có thể bỏ qua hoàn toàn. Đau khi lăn không xác nhận điểm kích hoạt. [Cheatham 2015]"
    },
    {
      "level": "Không có ngưỡng đau an toàn chung",
      "meaning": "Chưa có liều tối ưu chung về lực, thời gian hay số lần. Không cần chịu đau để đạt hiệu quả. [Cheatham 2015; NCCIH]"
    },
    {
      "level": "Dừng và đánh giá",
      "meaning": "Dừng khi đau nhói, tê, yếu, chóng mặt, khó thở hoặc triệu chứng tăng. Dấu hiệu đáng lo cần đánh giá y tế, không thử tăng lực. [NCCIH; NHS Chest pain]"
    }
  ],
  "differentials": [
    {
      "name": "Điểm đau được gọi là hoạt động (active)",
      "vs": "Trong định nghĩa đồng thuận, kích thích có thể tái hiện triệu chứng quen thuộc. Phân loại này không là bằng chứng về một nguồn đau duy nhất. [Delphi 2018]"
    },
    {
      "name": "Điểm nhạy không gắn triệu chứng quen thuộc (latent)",
      "vs": "Không có cơ sở từ các nguồn đã đọc để bắt buộc điều trị mọi điểm nhạy không gây vấn đề chức năng. Không suy ra cơ bị ức chế chỉ từ palpation. [Delphi 2018; Myburgh 2008]"
    },
    {
      "name": "Đau cơ sau tập và các nguyên nhân khác",
      "vs": "Xem diễn tiến, tải tập, chấn thương và chức năng. Một điểm đau hoặc bản đồ tô màu không phân biệt chắc đau sau tập với bệnh gân, khớp hoặc thần kinh. [Myburgh 2008; Cheatham 2015]"
    },
    {
      "name": "Dấu hiệu cần chuyển khám/cấp cứu",
      "vs": "Đau ngực mới kèm khó thở/toát mồ hôi: cấp cứu. Đau/sưng một chân: khám khẩn; kèm khó thở/đau ngực: cấp cứu. Đau lưng kèm thay đổi cảm giác vùng yên ngựa, bí tiểu mới hoặc rối loạn đại tiểu tiện: đánh giá cấp cứu. Yếu tiến triển, sốt hoặc chấn thương đáng kể cần khám, không chờ hết một đợt SMR. [NHS Chest pain; NHS DVT; NHS Back pain; North Bristol NHS CES]"
    }
  ],
  "smrMechanism": "Foam rolling có thể cải thiện ROM và đau mỏi ngắn hạn. Cơ chế điều biến cảm giác và cơ học vẫn đang được nghiên cứu; không chứng minh bóng phá sẹo hoặc loại bỏ nút. Các tổng quan không xác lập quy tắc tái phát trong một ngày, cửa sổ kích hoạt hoặc phác đồ bốn bước bắt buộc. [Behm & Wilke 2019; Cheatham 2015]",
  "ptScope": "Trong app này PT là huấn luyện viên thể hình. Hỗ trợ tập luyện theo dung nạp và điều chỉnh tải trong năng lực/ủy quyền địa phương; không dùng sơ đồ để chẩn đoán hoặc thực hiện thủ thuật lâm sàng. Khi có triệu chứng chưa rõ, kéo dài, tăng lên hoặc ảnh hưởng chức năng, khuyến khích đánh giá bởi chuyên viên y tế. Các ví dụ vận động do ứng dụng biên soạn; nguồn không xác nhận một trình tự điều trị chung hoặc bản đồ vị trí ấn. [NCCIH; NICE NG59]",
  references: TRIGGER_GENERAL_EVIDENCE.sources.map(evidenceReference),
};

const triggerMuscleRecords: TriggerPointMuscle[] = [
  {
    "id": "upper_trapezius",
    "shortName": "Thang trên",
    "name": "Cơ thang bó trên — điểm nhạy vùng cổ vai",
    "latinName": "M. Trapezius, pars descendens",
    "category": "neck_shoulder",
    "components": [
      {
        "name": "Thang bó trên",
        "latin": "M. trapezius, pars descendens",
        "layer": "Nhóm cơ sau đai vai. [OpenStax §11.5]",
        "trpStudy": "Có: nghiên cứu cổ 20/20 người. [Fernández-de-las-Peñas 2007]"
      }
    ],
    "plateViews": [{"plate": "openstax1105", "crop": [0, 1560, 1304, 570], "labels": ["Trapezius"]}, {"plate": "openstax1105", "crop": [0, 0, 1304, 470], "labels": ["Trapezius"]}],
    "summary": "Điểm nhạy và đau lan ở cơ cổ, gồm thang trên, được mô tả trong một nghiên cứu nhỏ về đau cổ. Đau gáy hoặc thái dương có nhiều nguyên nhân; sơ đồ không chẩn đoán đau đầu hay bệnh cột sống. [Fernández-de-las-Peñas 2007; Delphi 2018]",
    "mechanism": "Có các giả thuyết về cơ chế đau cơ; không thể suy ra thang trên bị khóa ngắn hoặc cơ cổ sâu bị ức chế từ tư thế hay một điểm đau. Khác biệt hóa học trong nghiên cứu nhỏ không chứng minh chuỗi cơ chế đó ở từng người. [Shah 2008, 2015]",
    "nodes": [
      {
        "id": "ut-trp1-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng vai trên giữa cổ và mỏm cùng vai, không là mốc ấn hoặc vị trí nút đã xác minh.",
        "view": "posterior",
        "x": 340,
        "y": 296
      },
      {
        "id": "ut-trp1-r",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng vai trên giữa cổ và mỏm cùng vai, không là mốc ấn hoặc vị trí nút đã xác minh.",
        "view": "posterior",
        "x": 560,
        "y": 296
      },
      {
        "id": "ut-trp2-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng vai trên giữa cổ và mỏm cùng vai, không là mốc ấn hoặc vị trí nút đã xác minh.",
        "view": "posterior",
        "x": 318,
        "y": 318
      }
    ],
    "referredPain": [
      {
        "view": "posterior",
        "d": "M 382 178 C 398 172, 416 182, 420 200 L 420 268 C 408 280, 390 278, 380 270 Z",
        "labelX": 285,
        "labelY": 215,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      },
      {
        "view": "anterior",
        "d": "M 500 74 C 514 72, 522 88, 522 112 L 520 196 C 514 212, 500 210, 497 196 L 497 120 Z",
        "labelX": 535,
        "labelY": 70,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Minh họa vùng vai trên giữa cổ và mỏm cùng vai, không là mốc ấn hoặc vị trí nút đã xác minh.",
      "underFingerFeel": "Ghi triệu chứng và vận động cổ/vai dễ chịu; không cần sờ để xác nhận nguyên nhân. Nếu tiếp xúc nhẹ vùng vai nông, phải có đồng ý; không ấn cổ hoặc hố quanh đòn.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Khả năng vận động và chịu tải cần đánh giá riêng; tư thế đầu hoặc nâng vai không tự chứng minh cơ yếu hay co ngắn.",
      "antagonistOrInhibited": {
        "muscles": "Nhóm cơ cổ và đai vai: chỉ lựa chọn sau đánh giá, không mặc định bị ức chế.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ vận động vai/cổ chủ động hoặc wall slide nhẹ nếu dễ chịu; liều và bài phù hợp từng người, không là thuốc chống tái phát."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Không hướng dẫn tự ấn cổ. Có thể bỏ qua bước mô mềm; ưu tiên vận động dễ chịu và đánh giá nếu triệu chứng chưa rõ.",
        "placement": "Không đặt bóng hoặc ngón sâu lên cổ trước/bên, hố trên đòn hoặc vùng gây tê lan tay.",
        "pressureAndTime": "Không có liều áp lực/thời gian được khuyến nghị cho thao tác sâu trong bản ghi này. Bước mô mềm là tùy chọn, có thể bỏ qua.",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Thử quay/nghiêng cổ nhẹ trong biên độ tự chọn nếu không làm tăng triệu chứng; không dùng tay kéo đầu hoặc ép vai xuống.",
      "step3Activation": "Có thể chọn vận động cổ và vai tăng dần theo khả năng. Không có yêu cầu kích hoạt một cơ ngay sau massage.",
      "step4LoadCue": "Điều chỉnh tải và biên độ overhead theo triệu chứng; cho phép bả vai vận động tự nhiên, không ép hạ vai suốt khi giơ tay."
    },
    "gymTriggers": [
      "Ghi mối liên hệ triệu chứng với thời gian làm việc, giấc ngủ và tải tập.",
      "Đẩy trên đầu hoặc shrug có thể là hoạt động cần điều chỉnh nếu làm đau; không tự là bằng chứng tổn thương."
    ],
    "contraindications": [
      "Không ấn sâu vùng cổ hoặc quanh đòn; dừng nếu chóng mặt, tê hay đau tăng.",
      "Đau đầu đột ngột cực kỳ dữ dội hoặc kèm yếu/tê mặt/cơ thể: cấp cứu. Đau đầu kèm đau hàm khi nhai/đau da đầu: khám khẩn. Triệu chứng cổ/tay mới hoặc tăng cần đánh giá y tế. [NHS Headaches; NHS Shoulder pain]",
      "Đau ngực kèm khó thở/toát mồ hôi cần cấp cứu."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Thang trên. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng upper_trapezius, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "levator_scapulae",
    "shortName": "Nâng vai",
    "name": "Cơ nâng vai — đau vùng góc cổ và bả vai",
    "latinName": "M. Levator scapulae",
    "category": "neck_shoulder",
    "components": [
      {
        "name": "Nâng vai",
        "latin": "M. levator scapulae",
        "layer": "Nguồn văn bản đã đọc không mô tả lớp; hình 1105 ghi nhãn ở nửa lớp sâu.",
        "trpStudy": "Có: nghiên cứu cổ 20/20 người và vai 12/10 người. [Fernández-de-las-Peñas 2007; Hidalgo-Lozano 2010]"
      }
    ],
    "plateViews": [{"plate": "openstax1105", "crop": [0, 1560, 1304, 570], "labels": ["Levator scapulae"]}],
    "summary": "Cơ nâng vai có trong nghiên cứu điểm đau ở người đau cổ, nhưng đau góc bả và hạn chế quay cổ không xác nhận cơ này là nguồn đau. Ngay nghiên cứu nhỏ đó không tìm thấy khác biệt phân bố điểm có ý nghĩa cho cả hai levator. [Fernández-de-las-Peñas 2007]",
    "mechanism": "Không suy từ tư thế bả vai sang cơ nâng vai khóa ngắn, pec minor thắng hay serratus bị ức chế. Đây là các diễn giải giả thuyết, cần khám trực tiếp nếu liên quan triệu chứng. [Delphi 2018; Myburgh 2008]",
    "nodes": [
      {
        "id": "ls-trp-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng góc trên và bờ trong bả vai; không xác nhận lớp cơ hoặc điểm sâu bằng hình bề mặt.",
        "view": "posterior",
        "x": 368,
        "y": 348
      },
      {
        "id": "ls-trp-r",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng góc trên và bờ trong bả vai; không xác nhận lớp cơ hoặc điểm sâu bằng hình bề mặt.",
        "view": "posterior",
        "x": 532,
        "y": 348
      }
    ],
    "referredPain": [
      {
        "view": "posterior",
        "d": "M 345 300 C 385 270, 430 290, 445 340 L 430 430 C 390 450, 350 420, 340 370 Z",
        "labelX": 455,
        "labelY": 318,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Sơ đồ vùng góc trên và bờ trong bả vai; không xác nhận lớp cơ hoặc điểm sâu bằng hình bề mặt.",
      "underFingerFeel": "Ưu tiên hỏi triệu chứng và quan sát vận động dễ chịu. Không ấn sâu góc cổ, luồn ngón dưới cơ thang hoặc búng tìm twitch.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Chuyển động cổ/bả vai và tải tập cần được xem cùng triệu chứng; không có chuỗi bù trừ mặc định.",
      "antagonistOrInhibited": {
        "muscles": "Các cơ kiểm soát cổ và bả vai, không kết luận yếu hoặc ức chế từ đau góc bả.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ wall slide hoặc quay cổ chủ động ở biên độ dễ chịu; không cần cô lập một cơ vì nhãn trigger point."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Bỏ qua tự ấn sâu cổ/góc trên bả. Nếu muốn chăm sóc mô mềm, cần chuyên viên có đào tạo đánh giá sự phù hợp.",
        "placement": "Không ép bóng ở góc cổ hoặc tam giác cổ sau; sơ đồ chỉ để trao đổi vị trí triệu chứng.",
        "pressureAndTime": "Không có liều áp lực/thời gian được khuyến nghị cho thao tác sâu trong bản ghi này. Bước mô mềm là tùy chọn, có thể bỏ qua.",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Cử động cổ và vai nhẹ, không cố chạm cằm vào nách hoặc ghì vai để tạo căng.",
      "step3Activation": "Tập điều khiển và chịu tải vai theo khả năng; không có trình tự bắt buộc nhả rồi kích hoạt.",
      "step4LoadCue": "Giảm tải/đổi biên độ row hoặc pull-up khi làm đau; cho phép bả vai xoay và trượt theo động tác."
    },
    "gymTriggers": [
      "Ghi hoạt động cổ/vai làm triệu chứng thay đổi.",
      "Row, pulldown hoặc làm việc kéo dài chỉ là bối cảnh đánh giá, không xác định nguyên nhân."
    ],
    "contraindications": [
      "Không ấn sâu cổ hoặc vùng trên đòn.",
      "Tê/ yếu lan tay, triệu chứng tăng hoặc hạn chế chức năng cần đánh giá y tế."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Nâng vai. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng levator_scapulae, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "infraspinatus",
    "shortName": "Dưới gai",
    "name": "Cơ dưới gai và tròn bé — triệu chứng vùng vai",
    "latinName": "M. Infraspinatus & M. Teres minor",
    "category": "neck_shoulder",
    "components": [
      {
        "name": "Dưới gai",
        "latin": "M. infraspinatus",
        "layer": "Dưới gai bả vai; thuộc nhóm chóp xoay. [OpenStax §11.5]",
        "trpStudy": "Có: nghiên cứu vai 12/10 người. [Hidalgo-Lozano 2010]"
      },
      {
        "name": "Tròn bé",
        "latin": "M. teres minor",
        "layer": "Thuộc nhóm chóp xoay. [OpenStax §11.5]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này."
      }
    ],
    "plateViews": [{"plate": "openstax1105", "crop": [0, 1560, 1304, 570], "labels": ["Infraspinatus", "Teres minor"]}],
    "summary": "Một nghiên cứu 12 người đau vai và 10 chứng ghi nhận điểm đau hoạt động ở infraspinatus trong một số người bệnh. Điều này không chứng minh đau mặt trước vai luôn xuất phát từ mặt sau bả. Teres minor không được khảo sát trong nghiên cứu này. [Hidalgo-Lozano 2010]",
    "mechanism": "Không thể xác nhận cơ dưới gai bị kéo dài hay chỏm trượt trước do pec co ngắn qua sơ đồ. Đau vai và nhạy áp lực có thể cùng tồn tại; liên hệ không xác lập chuỗi nguyên nhân. [Hidalgo-Lozano 2010]",
    "nodes": [
      {
        "id": "is-trp1-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng sau bả vai dưới gai bả; vị trí teres minor gần bờ ngoài chỉ là định hướng vùng, không là tọa độ tiếp cận.",
        "view": "posterior",
        "x": 340,
        "y": 429
      },
      {
        "id": "is-trp1-r",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng sau bả vai dưới gai bả; vị trí teres minor gần bờ ngoài chỉ là định hướng vùng, không là tọa độ tiếp cận.",
        "view": "posterior",
        "x": 560,
        "y": 429
      },
      {
        "id": "tm-trp-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng sau bả vai dưới gai bả; vị trí teres minor gần bờ ngoài chỉ là định hướng vùng, không là tọa độ tiếp cận.",
        "view": "posterior",
        "x": 316,
        "y": 440
      }
    ],
    "referredPain": [
      {
        "view": "anterior",
        "d": "M 682 330 C 630 300, 570 325, 552 380 L 570 470 C 630 500, 690 455, 695 390 Z",
        "labelX": 705,
        "labelY": 330,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      },
      {
        "view": "anterior",
        "d": "M 640 450 C 665 445, 680 470, 685 500 L 720 570 L 770 690 L 735 700 L 690 590 L 655 510 Z",
        "labelX": 760,
        "labelY": 600,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      },
      {
        "view": "posterior",
        "d": "M 250 370 C 310 350, 355 380, 350 440 L 310 470 C 260 460, 235 420, 250 370 Z",
        "labelX": 200,
        "labelY": 390,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Minh họa vùng sau bả vai dưới gai bả; vị trí teres minor gần bờ ngoài chỉ là định hướng vùng, không là tọa độ tiếp cận.",
      "underFingerFeel": "Nếu được đồng ý có thể ghi nhạy vùng mô nông sau vai, lực nhẹ. Không tìm jump sign, không luồn vào nách; phản ứng đau trước vai không tự xác nhận chẩn đoán.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Cần đánh giá chức năng vai, tải tập và vận động bả; không mặc định pec co ngắn hoặc chóp xoay yếu.",
      "antagonistOrInhibited": {
        "muscles": "Chóp xoay và đai vai: đánh giá sức mạnh/chức năng trước khi chọn bài.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ xoay ngoài nhẹ có hỗ trợ nếu phù hợp và dễ chịu; tải không được ấn định bằng bản đồ đau."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Tùy chọn tiếp xúc/lăn nhẹ vùng mô mềm nông sau vai bằng dụng cụ mềm nếu phù hợp; có thể bỏ qua.",
        "placement": "Chỉ vùng mô mềm nông sau vai dễ tiếp cận; tránh nách, khớp và xương. Không dùng sơ đồ để tìm điểm sâu.",
        "pressureAndTime": "Tùy chọn, lực nhẹ dễ chịu và có thể dừng ngay; không đặt mục tiêu mức đau hoặc số giây chung. Chưa có liều tối ưu thống nhất. Dừng nếu đau/tê tăng. [Cheatham 2015; NCCIH]",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Cử động vai chủ động dễ chịu; không ép sleeper stretch hoặc kéo vai ngang ngực để chịu đau.",
      "step3Activation": "Nếu đánh giá phù hợp, tăng dần bài chịu tải vai. Nghiên cứu Bron dùng điều trị tổng hợp, không xác nhận bài xoay ngoài cụ thể hoặc một liều bóng.",
      "step4LoadCue": "Thử giảm tải/biên độ hoặc đổi biến thể press theo phản ứng; góc khuỷu và lượng tạ phù hợp từng người."
    },
    "gymTriggers": [
      "Press, fly hoặc nằm nghiêng có thể là bối cảnh triệu chứng cần ghi nhận.",
      "Không quy mọi đau khi bench cho trigger point của cơ dưới gai."
    ],
    "contraindications": [
      "Không ấn nách hoặc cố tạo đau lan xuống tay.",
      "Chấn thương kèm yếu rõ, yếu tăng hoặc đau ảnh hưởng ngủ/chức năng cần khám.",
      "Đau ngực kèm khó thở/toát mồ hôi: cấp cứu trước khi xét nguyên nhân cơ."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Dưới gai. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng infraspinatus, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "pec_minor",
    "shortName": "Ngực bé",
    "name": "Cơ ngực bé và ngực lớn — vùng ngực trước và vai",
    "latinName": "M. Pectoralis minor & M. Pectoralis major",
    "category": "neck_shoulder",
    "components": [
      {
        "name": "Ngực bé",
        "latin": "M. pectoralis minor",
        "layer": "Nhóm cơ trước đai vai; hình 11.22 phải cắt ngực lớn mới thấy lớp sâu hơn. [OpenStax §11.5]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này. Chỉ có nghiên cứu chiều dài–vận động bả ở người không đau. [Borstad 2005]"
      },
      {
        "name": "Ngực lớn",
        "latin": "M. pectoralis major",
        "layer": "Phủ phần lớn ngực trước trên. [OpenStax §11.5]",
        "trpStudy": "Có: nghiên cứu vai 12/10 người. [Hidalgo-Lozano 2010]"
      }
    ],
    "plateViews": [{"plate": "openstax1105", "crop": [0, 0, 1304, 470], "labels": ["Pectoralis major", "Pectoralis minor"]}],
    "summary": "Nghiên cứu 50 người không đau cho thấy chiều dài nghỉ pec minor liên hệ với vận động bả vai. Nghiên cứu này không xác nhận trigger point, hội chứng chèn ép hay nguyên nhân đau vai. Tê tay hoặc đau ngực cần đánh giá riêng. [Borstad & Ludewig 2005; NHS Shoulder pain; NHS Chest pain]",
    "mechanism": "Pec minor ngắn và khác biệt vận động bả là quan sát ở nhóm người không đau; không suy ra cơ khóa ngắn, chèn mạch hoặc làm các cơ khác bị ức chế ở một cá nhân. [Borstad & Ludewig 2005]",
    "nodes": [
      {
        "id": "pm-trp-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng ngực trước; pec minor là cơ sâu và không thể nhận diện điểm bằng chấm bề mặt. Không là vị trí đặt bóng.",
        "view": "anterior",
        "x": 338,
        "y": 398
      },
      {
        "id": "pm-trp-r",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng ngực trước; pec minor là cơ sâu và không thể nhận diện điểm bằng chấm bề mặt. Không là vị trí đặt bóng.",
        "view": "anterior",
        "x": 562,
        "y": 398
      },
      {
        "id": "pj-trp-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng ngực trước; pec minor là cơ sâu và không thể nhận diện điểm bằng chấm bề mặt. Không là vị trí đặt bóng.",
        "view": "anterior",
        "x": 378,
        "y": 430
      }
    ],
    "referredPain": [
      {
        "view": "anterior",
        "d": "M 300 340 C 360 320, 420 350, 430 410 L 400 480 C 340 500, 290 450, 295 390 Z",
        "labelX": 175,
        "labelY": 400,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      },
      {
        "view": "anterior",
        "d": "M 225 445 C 250 440, 268 455, 262 500 L 238 570 L 200 700 L 160 690 L 200 560 L 215 500 Z",
        "labelX": 145,
        "labelY": 560,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Minh họa vùng ngực trước; pec minor là cơ sâu và không thể nhận diện điểm bằng chấm bề mặt. Không là vị trí đặt bóng.",
      "underFingerFeel": "Không hướng dẫn luồn ngón dưới pec major, ấn dưới mỏm quạ, hõm nách hay vùng quanh đòn. Trao đổi triệu chứng và chuyển khám nếu có tê/yếu hoặc dấu hiệu mạch.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Đánh giá vận động vai theo từng người; không cần release pec minor để mọi bài tập khác có tác dụng.",
      "antagonistOrInhibited": {
        "muscles": "Nhóm cơ vai và bả vai, không mặc định serratus/lower trap bị ức chế.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ vận động vai có hỗ trợ ở biên độ dễ chịu; lựa chọn sau đánh giá, không là điều trị TOS."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Không hướng dẫn tự release pec minor sâu hoặc nằm đè bóng vào ngực trước/mỏm quạ.",
        "placement": "Không đặt bóng trong nách, dưới đòn, dưới mỏm quạ hoặc vùng gây tê tay.",
        "pressureAndTime": "Không có liều áp lực/thời gian được khuyến nghị cho thao tác sâu trong bản ghi này. Bước mô mềm là tùy chọn, có thể bỏ qua.",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Có thể thử mở tay nhẹ nếu không gây đau/tê; không ép ngực vào khung cửa hoặc giữ căng khi triệu chứng lan tăng.",
      "step3Activation": "Tập vai theo đánh giá chức năng. Không có yêu cầu mở pec trước rồi mới kích hoạt cơ khác.",
      "step4LoadCue": "Điều chỉnh tải và biên độ press/fly theo triệu chứng; không áp tỷ lệ kéo:đẩy cố định như biện pháp điều trị."
    },
    "gymTriggers": [
      "Ghi tải press/fly và hoạt động làm triệu chứng thay đổi.",
      "Tư thế vai hoặc cách thở không tự xác định pec minor co cứng."
    ],
    "contraindications": [
      "Không dùng tê ngón tay để xác nhận trigger point hoặc tăng lực đến khi hết tê.",
      "Tay sưng, đổi màu, lạnh, tê/yếu mới hoặc tiến triển cần khám khẩn.",
      "Đau ngực mới kéo dài hoặc kèm khó thở/toát mồ hôi/choáng: cấp cứu."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Ngực bé. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng pec_minor, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "lats_serratus",
    "shortName": "Xô & Răng trước",
    "name": "Cơ lưng rộng và răng trước — vùng bả vai và thành ngực",
    "latinName": "M. Latissimus dorsi & M. Serratus anterior",
    "category": "trunk",
    "components": [
      {
        "name": "Lưng rộng",
        "latin": "M. latissimus dorsi",
        "layer": "Phần dưới lưng. [OpenStax §11.5]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này."
      },
      {
        "name": "Răng trước",
        "latin": "M. serratus anterior",
        "layer": "Nhóm cơ trước đai vai. [OpenStax §11.5]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này."
      }
    ],
    "plateViews": [{"plate": "openstax1105", "crop": [0, 1560, 1304, 570], "labels": ["Latissimus dorsi"]}, {"plate": "openstax1105", "crop": [0, 0, 1304, 470], "labels": ["Serratus anterior"]}],
    "summary": "Sơ đồ chỉ định hướng trao đổi triệu chứng vùng bả vai/thành ngực. Các nguồn lăn cơ nói chung không xác nhận bản đồ đau riêng của lats hoặc serratus. Đau sườn khi thở cần xem nguyên nhân khác trước khi thử tự chăm sóc. [Cheatham 2015; NHS Chest pain]",
    "mechanism": "Không thể kết luận lats rút, serratus yếu hoặc winging do trigger point chỉ từ tư thế và đau. Chưa có nguồn đã đọc xác nhận cơ chế riêng cho hai cơ trong bản ghi này.",
    "nodes": [
      {
        "id": "lat-trp-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng lưng bên và thành ngực; không dùng số xương sườn hoặc bờ nách làm tọa độ ấn.",
        "view": "posterior",
        "x": 328,
        "y": 575
      },
      {
        "id": "lat-trp-r",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng lưng bên và thành ngực; không dùng số xương sườn hoặc bờ nách làm tọa độ ấn.",
        "view": "posterior",
        "x": 572,
        "y": 575
      },
      {
        "id": "sa-trp-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng lưng bên và thành ngực; không dùng số xương sườn hoặc bờ nách làm tọa độ ấn.",
        "view": "anterior",
        "x": 595,
        "y": 495
      }
    ],
    "referredPain": [
      {
        "view": "posterior",
        "d": "M 310 500 C 370 480, 430 520, 420 600 L 370 650 C 320 640, 290 580, 310 500 Z",
        "labelX": 200,
        "labelY": 555,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      },
      {
        "view": "anterior",
        "d": "M 614 440 C 582 445, 565 480, 568 540 L 592 598 C 602 580, 608 540, 612 500 Z",
        "labelX": 720,
        "labelY": 470,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Sơ đồ vùng lưng bên và thành ngực; không dùng số xương sườn hoặc bờ nách làm tọa độ ấn.",
      "underFingerFeel": "Không ấn vào nách, kẽ sườn hoặc dùng lực gây nín thở để tìm điểm. Nếu đau khi hít thở hoặc không rõ nguyên nhân, ưu tiên đánh giá y tế.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Đánh giá hoạt động overhead, triệu chứng và chức năng bả vai; không suy ra cơ đối kháng bị ức chế.",
      "antagonistOrInhibited": {
        "muscles": "Nhóm cơ đai vai và thân mình; không mặc định mất cân bằng từ hình bả vai.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ wall slide nhẹ hoặc giơ tay có hỗ trợ nếu dễ chịu; bả vai nhô mới kèm yếu cần khám."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Bỏ qua bóng trên thành ngực và dưới nách. App chưa có nguồn xác nhận vị trí release an toàn riêng cho các cơ này.",
        "placement": "Không lăn/ấn trực tiếp lên sườn, kẽ sườn, hõm nách hoặc vùng đau khi thở.",
        "pressureAndTime": "Không có liều áp lực/thời gian được khuyến nghị cho thao tác sâu trong bản ghi này. Bước mô mềm là tùy chọn, có thể bỏ qua.",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Thử giơ tay chủ động trong biên độ thoải mái; không cố kéo lats bằng đè ngực hoặc nín thở.",
      "step3Activation": "Nếu phù hợp, tăng dần vận động vai/thân theo chức năng; không phải quy trình chữa winging.",
      "step4LoadCue": "Giảm tải/biên độ overhead nếu cần, giữ cách thở thoải mái; không ghì bả vai xuống suốt chuyển động."
    },
    "gymTriggers": [
      "Ghi phản ứng với kéo xô, giơ tay và hít thở.",
      "Hoạt động có triệu chứng không xác nhận mô gây đau."
    ],
    "contraindications": [
      "Đau ngực/sườn kèm khó thở, ho ra máu, choáng hoặc sau chấn thương đáng kể: đánh giá cấp cứu.",
      "Không ấn nách hoặc thành ngực để thử loại trừ nguyên nhân nguy hiểm."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Xô & Răng trước. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng lats_serratus, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "quadratus_lumborum",
    "shortName": "QL",
    "name": "Cơ vuông thắt lưng — vùng hông lưng",
    "latinName": "M. quadratus lumborum",
    "category": "trunk",
    "components": [
      {
        "name": "Vuông thắt lưng",
        "latin": "M. quadratus lumborum",
        "layer": "Thành bụng sau. [OpenStax §11.4]",
        "trpStudy": "Có: nghiên cứu đau lưng 42/42 người. [Iglesias-González 2013]"
      }
    ],
    "plateViews": [{"plate": "openstaxGluteal", "crop": [0, 0, 860, 935], "labels": ["Quadratus lumborum"]}],
    "summary": "QL là một cơ có điểm đau hoạt động thường gặp trong một nghiên cứu cắt ngang về đau lưng mạn. Kết quả không xếp QL là nguyên nhân lớn nhất hoặc biến hip hike thành dấu hiệu chẩn đoán. [Iglesias-González 2013]",
    "mechanism": "Không xác nhận QL gồng bù glute med yếu hoặc một bên khóa ngắn từ lệch hông. Độ tin cậy sờ mô mềm lưng không nhất quán và độ giá trị chẩn đoán còn bất định. [Nolet 2021]",
    "nodes": [
      {
        "id": "ql-sup-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng giữa bờ sườn dưới và mào chậu sau; không là vị trí ép sâu hướng mỏm ngang.",
        "view": "posterior",
        "x": 378,
        "y": 688
      },
      {
        "id": "ql-sup-r",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng giữa bờ sườn dưới và mào chậu sau; không là vị trí ép sâu hướng mỏm ngang.",
        "view": "posterior",
        "x": 522,
        "y": 688
      },
      {
        "id": "ql-deep-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng giữa bờ sườn dưới và mào chậu sau; không là vị trí ép sâu hướng mỏm ngang.",
        "view": "posterior",
        "x": 398,
        "y": 655
      }
    ],
    "referredPain": [
      {
        "view": "posterior",
        "d": "M 330 640 C 410 610, 490 630, 510 700 L 470 780 C 400 800, 330 760, 320 700 Z",
        "labelX": 200,
        "labelY": 690,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Sơ đồ vùng giữa bờ sườn dưới và mào chậu sau; không là vị trí ép sâu hướng mỏm ngang.",
      "underFingerFeel": "Không hướng dẫn bóng hoặc ngón ấn sâu vùng hông lưng dưới sườn. Vị trí đau không phân biệt chắc QL với cơ, khớp, thần kinh hoặc nguyên nhân khác.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Đánh giá chuyển động và chức năng trong bối cảnh đau lưng, không dùng hip hike để xác nhận một cơ yếu.",
      "antagonistOrInhibited": {
        "muscles": "Cơ hông và thân mình theo mục tiêu chức năng; không giả định cơ đối kháng bị ức chế.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ đi bộ, đứng lên ngồi xuống hoặc bài sức mạnh phù hợp; có thể chọn side plank biến thể nếu dung nạp, không bắt buộc."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Bỏ qua tự ấn sâu QL. Với đau lưng, can thiệp mô mềm nếu cân nhắc nên thuộc gói có vận động và được lựa chọn phù hợp. [NICE NG59]",
        "placement": "Không dùng sơ đồ đặt bóng vào vùng hông lưng/sườn dưới hoặc ép hướng cột sống.",
        "pressureAndTime": "Không có liều áp lực/thời gian được khuyến nghị cho thao tác sâu trong bản ghi này. Bước mô mềm là tùy chọn, có thể bỏ qua.",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Tiếp tục cử động trong khả năng, thử biên độ tự chọn; không ép nghiêng thân để kéo một điểm đau.",
      "step3Activation": "Chọn bài tập thân/hông theo sở thích và khả năng, tăng dần. Không có cơ sở yêu cầu kích hoạt glute med ngay sau nhả QL. [NICE NG59]",
      "step4LoadCue": "Điều chỉnh tải, tốc độ và biên độ squat/hinge nếu cần; lệch chuyển động cần đánh giá cùng triệu chứng, không là bằng chứng tổn thương."
    },
    "gymTriggers": [
      "Ghi diễn tiến đau với ngồi, đi bộ, mang tải và bài tập.",
      "Một bên hông cao không xác định QL là nguồn đau."
    ],
    "contraindications": [
      "Đau lưng kèm bí tiểu mới, thay đổi cảm giác yên ngựa hoặc rối loạn đại tiểu tiện: cấp cứu.",
      "Đau lưng kèm sốt/khó chịu toàn thân hoặc tăng nhanh: khám khẩn; sau tai nạn nghiêm trọng: cấp cứu. [NHS Back pain]",
      "Không ấn sâu dưới sườn hoặc dùng massage để trì hoãn khám."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng QL. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng quadratus_lumborum, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "iliopsoas",
    "shortName": "Iliopsoas",
    "name": "Cơ thắt lưng chậu — cơ sâu vùng hông và bụng sau",
    "latinName": "M. Psoas major & M. Iliacus",
    "category": "trunk",
    "components": [
      {
        "name": "Thắt lưng lớn",
        "latin": "M. psoas major",
        "layer": "Thành bụng sau. [OpenStax §11.4]",
        "trpStudy": "Tóm tắt nghiên cứu đau lưng 42/42 người ghi psoas, không tách nhãn psoas major/minor và không khảo sát iliacus. [Iglesias-González 2013]"
      },
      {
        "name": "Chậu",
        "latin": "M. iliacus",
        "layer": "Thành bụng sau. [OpenStax §11.4]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này."
      }
    ],
    "plateViews": [{"plate": "openstaxGluteal", "crop": [0, 0, 860, 935], "labels": ["Psoas major", "Iliacus"]}, {"plate": "openstax1105", "crop": [0, 500, 1304, 500], "labels": ["Iliopsoas"]}],
    "summary": "Psoas được khảo sát trong nghiên cứu điểm đau ở người đau lưng; kết quả không xác nhận đau khi đứng dậy là psoas. Đau bẹn, háng, lưng hoặc bụng có nhiều nguyên nhân và không thể định vị bằng sơ đồ. [Iglesias-González 2013]",
    "mechanism": "Iliopsoas nằm sâu và liên quan tạng, mạch, thần kinh. Không suy từ ngồi lâu sang co ngắn hay glute max bị ức chế. Sờ bụng không xác nhận cơ chế trigger point. [StatPearls Psoas Major; Nolet 2021]",
    "nodes": [
      {
        "id": "psoas-l",
        "code": "Vùng minh họa",
        "locationLabel": "Chỉ minh họa vùng cơ sâu. Bề mặt bụng hoặc khoảng cách từ rốn không là tọa độ an toàn để tiếp cận psoas/iliacus.",
        "view": "anterior",
        "x": 392,
        "y": 655
      },
      {
        "id": "iliacus-l",
        "code": "Vùng minh họa",
        "locationLabel": "Chỉ minh họa vùng cơ sâu. Bề mặt bụng hoặc khoảng cách từ rốn không là tọa độ an toàn để tiếp cận psoas/iliacus.",
        "view": "anterior",
        "x": 348,
        "y": 742
      },
      {
        "id": "psoas-r",
        "code": "Vùng minh họa",
        "locationLabel": "Chỉ minh họa vùng cơ sâu. Bề mặt bụng hoặc khoảng cách từ rốn không là tọa độ an toàn để tiếp cận psoas/iliacus.",
        "view": "anterior",
        "x": 508,
        "y": 655
      }
    ],
    "referredPain": [
      {
        "view": "posterior",
        "d": "M 360 610 C 420 590, 480 610, 495 680 L 460 740 C 400 755, 350 720, 345 660 Z",
        "labelX": 210,
        "labelY": 660,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      },
      {
        "view": "anterior",
        "d": "M 320 700 C 380 680, 430 720, 420 780 L 370 810 C 320 800, 300 750, 320 700 Z",
        "labelX": 175,
        "labelY": 745,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Chỉ minh họa vùng cơ sâu. Bề mặt bụng hoặc khoảng cách từ rốn không là tọa độ an toàn để tiếp cận psoas/iliacus.",
      "underFingerFeel": "Không hướng dẫn tự sờ sâu, luồn ngón trong mào chậu, nằm đè bóng lên bụng/bẹn hoặc nhận mạch đập làm mốc. Nếu đau bụng/bẹn chưa rõ, cần đánh giá y tế.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Đánh giá chức năng háng và lưng thay vì mặc định lower crossed syndrome hoặc một chuỗi cơ bị ức chế.",
      "antagonistOrInhibited": {
        "muscles": "Nhóm cơ hông/thân theo khả năng; không xác nhận glute max yếu bằng điểm đau bụng.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ đi bộ hoặc bridge nhẹ nếu không làm tăng triệu chứng và đã đánh giá phù hợp; không có cửa sổ kích hoạt bắt buộc."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Bỏ qua release iliopsoas bằng tay, bóng hoặc dụng cụ trên bụng/bẹn trong app.",
        "placement": "Không có vị trí đặt bóng được khuyến nghị. Không ấn bụng hoặc mặt trong hố chậu để tìm cơ sâu.",
        "pressureAndTime": "Không có liều áp lực/thời gian được khuyến nghị cho thao tác sâu trong bản ghi này. Bước mô mềm là tùy chọn, có thể bỏ qua.",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Nếu được đánh giá phù hợp, thử duỗi háng nhẹ có hỗ trợ và dừng nếu đau bẹn/bụng; không giữ áp lực bụng khi duỗi chân.",
      "step3Activation": "Chọn bài tăng chức năng hông/thân theo khả năng; không có bằng chứng yêu cầu kích hoạt glute trong vài phút sau giãn.",
      "step4LoadCue": "Điều chỉnh tải/biên độ squat và hinge theo triệu chứng; đổi tư thế và ngắt quãng ngồi theo nhu cầu."
    },
    "gymTriggers": [
      "Ghi triệu chứng khi đứng dậy, đi bộ, bước cao hoặc tập gập háng.",
      "Ngồi lâu hoặc leg raise không tự chứng minh psoas rút ngắn."
    ],
    "contraindications": [
      "Đau bụng đột ngột hoặc dữ dội: cấp cứu. Đau bụng tăng, kéo dài hoặc tái diễn cần khám khẩn; không ấn để thử psoas. [NHS Stomach ache]",
      "Đau lưng kèm bí tiểu mới, thay đổi cảm giác yên ngựa hoặc rối loạn đại tiểu tiện: cấp cứu.",
      "Không tự ấn bụng/bẹn, kể cả dùng bóng mềm; thai kỳ hoặc bệnh nền cần tư vấn phù hợp."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Iliopsoas. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng iliopsoas, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "glute_med_piriformis",
    "shortName": "Mông nhỡ & Hình lê",
    "name": "Cơ mông nhỡ, mông bé và hình lê — triệu chứng mông và chân",
    "latinName": "M. Gluteus medius, minimus & M. Piriformis",
    "category": "hip_leg",
    "components": [
      {
        "name": "Mông nhỡ",
        "latin": "M. gluteus medius",
        "layer": "Dưới mông lớn. [OpenStax §11.6]",
        "trpStudy": "Có: nghiên cứu đau lưng 42/42 người. [Iglesias-González 2013]"
      },
      {
        "name": "Mông bé",
        "latin": "M. gluteus minimus",
        "layer": "Dưới mông nhỡ. [OpenStax §11.6]",
        "trpStudy": "Có: nghiên cứu đau lưng 42/42 người. [Iglesias-González 2013]"
      },
      {
        "name": "Hình lê",
        "latin": "M. piriformis",
        "layer": "Nhóm xoay ngoài dưới mông lớn. [OpenStax §11.6]",
        "trpStudy": "Có: nghiên cứu đau lưng 42/42 người. [Iglesias-González 2013] Tổng quan hội chứng hình lê không phải nghiên cứu trigger point. [Hopayian 2010]"
      }
    ],
    "plateViews": [{"plate": "openstaxGluteal", "crop": [815, 1130, 898, 500], "labels": ["Gluteus medius (cut)", "Gluteus minimus", "Piriformis"]}],
    "summary": "Đau mông lan chân có thể liên quan cột sống, háng hoặc thần kinh vùng mông sâu. MRI cột sống bình thường không xác nhận trigger point. Piriformis syndrome có bằng chứng chẩn đoán còn hạn chế và không đồng nghĩa mọi đau vùng này. [Hopayian 2010; Martin 2015]",
    "mechanism": "Không xác nhận glute med bị khóa dài, TFL thắng hoặc piriformis gồng bù từ valgus/Trendelenburg. Hội chứng mông sâu có thể gồm chèn ép thần kinh và cần đánh giá phân biệt, không chỉ một nút cơ. [Martin 2015]",
    "nodes": [
      {
        "id": "gmed-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng mông, gồm cơ sâu dưới lớp nông; đường sacrum–mấu chuyển không là tọa độ để ấn piriformis.",
        "view": "posterior",
        "x": 348,
        "y": 792
      },
      {
        "id": "gmin-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng mông, gồm cơ sâu dưới lớp nông; đường sacrum–mấu chuyển không là tọa độ để ấn piriformis.",
        "view": "posterior",
        "x": 318,
        "y": 838
      },
      {
        "id": "pf-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng mông, gồm cơ sâu dưới lớp nông; đường sacrum–mấu chuyển không là tọa độ để ấn piriformis.",
        "view": "posterior",
        "x": 378,
        "y": 868
      },
      {
        "id": "gmed-r",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng mông, gồm cơ sâu dưới lớp nông; đường sacrum–mấu chuyển không là tọa độ để ấn piriformis.",
        "view": "posterior",
        "x": 552,
        "y": 792
      }
    ],
    "referredPain": [
      {
        "view": "posterior",
        "d": "M 300 760 C 380 740, 450 780, 440 880 L 400 1020 C 350 1100, 310 980, 295 860 Z",
        "labelX": 200,
        "labelY": 920,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Sơ đồ vùng mông, gồm cơ sâu dưới lớp nông; đường sacrum–mấu chuyển không là tọa độ để ấn piriformis.",
      "underFingerFeel": "Không ngồi đè bóng hoặc ấn sâu giữa mông để tìm piriformis/glute minimus. Đau lan hoặc tê khi ấn không xác nhận điểm kích hoạt; dừng áp lực.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Cần đánh giá sức mạnh, chức năng chân trụ và triệu chứng thần kinh; hình chuyển động không tự xác lập chuỗi bù trừ.",
      "antagonistOrInhibited": {
        "muscles": "Nhóm cơ hông/thân cần được đánh giá riêng, không mặc định glute max bị ức chế.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ bridge, đứng một chân có hỗ trợ hoặc bài sức mạnh hông phù hợp nếu dễ chịu; không dùng cảm giác cháy để xác nhận cơ được tuyển dụng."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Bỏ qua tự release piriformis sâu. Khi có đau lan chân/tê, ưu tiên đánh giá trước chăm sóc mô mềm.",
        "placement": "Không đặt bóng vào giữa mông để tạo đau/tê lan, không đổi vị trí rồi tiếp tục khi xuất hiện triệu chứng thần kinh.",
        "pressureAndTime": "Không có liều áp lực/thời gian được khuyến nghị cho thao tác sâu trong bản ghi này. Bước mô mềm là tùy chọn, có thể bỏ qua.",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Cử động háng nhẹ theo dung nạp; không kéo figure-4 nếu làm đau hoặc tê lan tăng.",
      "step3Activation": "Tập hông và chân theo đánh giá chức năng. Không có phác đồ bắt buộc clam/band walk sau lăn để ngăn tái phát.",
      "step4LoadCue": "Điều chỉnh squat/chân trụ theo triệu chứng và khả năng; không dùng một hình gối để chẩn đoán cơ gây đau."
    },
    "gymTriggers": [
      "Ghi triệu chứng với ngồi, đi bộ, chạy và tập chân.",
      "Triệu chứng thay đổi theo tư thế hoặc MRI bình thường không tự loại bệnh thần kinh."
    ],
    "contraindications": [
      "Đau lưng/lan chân kèm bí tiểu mới, thay đổi cảm giác yên ngựa hoặc rối loạn đại tiểu tiện: cấp cứu.",
      "Tê/yếu mới hoặc tăng cần đánh giá lâm sàng; không chờ đau theo đúng khoanh mới chuyển khám.",
      "Không ấn mạnh hoặc ngồi đè bóng khi gây đau điện/tê."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Mông nhỡ & Hình lê. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng glute_med_piriformis, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "tfl_vastus_lateralis",
    "shortName": "TFL & Rộng ngoài",
    "name": "Cơ căng mạc đùi và rộng ngoài — triệu chứng đùi và gối",
    "latinName": "M. Tensor fasciae latae & M. Vastus lateralis",
    "category": "hip_leg",
    "components": [
      {
        "name": "Căng mạc đùi",
        "latin": "M. tensor fasciae latae",
        "layer": "Phần trên mặt ngoài đùi. [OpenStax §11.6]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này."
      },
      {
        "name": "Rộng ngoài",
        "latin": "M. vastus lateralis",
        "layer": "Mặt ngoài đùi. [OpenStax §11.6]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này."
      }
    ],
    "plateViews": [{"plate": "openstaxGluteal", "crop": [0, 0, 860, 935], "labels": ["Tensor fascia latae", "Vastus lateralis"]}, {"plate": "openstax1105", "crop": [0, 500, 1304, 500], "labels": ["Tensor fasciae latae", "Vastus lateralis"]}],
    "summary": "Đau mặt ngoài gối có nhiều nguyên nhân. Nguồn lăn cơ không chứng minh nút ở TFL/VL là nguồn đau. Nếu được đánh giá là đau bánh chè, giáo dục và tập gối, có thể kết hợp tập hông, là hướng tiếp cận chính. [Neal 2024]",
    "mechanism": "Không thể suy từ valgus hoặc đau khi lăn sang TFL thắng glute med hay VMO hoạt động trễ. Cần đánh giá gối/hông và tải hoạt động trước khi chọn can thiệp. [Neal 2024]",
    "nodes": [
      {
        "id": "tfl-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng ngoài hông/đùi; không phải tọa độ bóng dưới ASIS hoặc sát gối.",
        "view": "anterior",
        "x": 302,
        "y": 778
      },
      {
        "id": "vl-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng ngoài hông/đùi; không phải tọa độ bóng dưới ASIS hoặc sát gối.",
        "view": "anterior",
        "x": 318,
        "y": 980
      },
      {
        "id": "vl-dist-l",
        "code": "Vùng minh họa",
        "locationLabel": "Minh họa vùng ngoài hông/đùi; không phải tọa độ bóng dưới ASIS hoặc sát gối.",
        "view": "anterior",
        "x": 335,
        "y": 1075
      }
    ],
    "referredPain": [
      {
        "view": "anterior",
        "d": "M 292 740 C 310 735, 325 760, 325 800 L 345 1000 L 350 1100 C 350 1140, 342 1140, 340 1110 L 302 1000 L 291 820 Z",
        "labelX": 175,
        "labelY": 980,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Minh họa vùng ngoài hông/đùi; không phải tọa độ bóng dưới ASIS hoặc sát gối.",
      "underFingerFeel": "Có thể ghi vùng nhạy mô đùi nông nếu đồng ý; không ấn bẹn, sát ASIS hoặc vùng khớp sưng để tìm nút. Đau khi sờ không xác nhận TFL/VL gây đau gối.",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Không mặc định gối là nạn nhân của hông. Với đau bánh chè đã đánh giá, chọn bài theo khả năng và nhu cầu. [Neal 2024]",
      "antagonistOrInhibited": {
        "muscles": "Cơ gối và hông theo đánh giá; không kết luận glute med hoặc VMO bị ức chế.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ squat nông có hỗ trợ hoặc bài sức mạnh hông/gối phù hợp; không là toa cho mọi đau mặt ngoài gối."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Tùy chọn lăn nhẹ mô đùi nông với dụng cụ mềm nếu dễ chịu; không cần truy tìm nút TFL hoặc lăn IT band để chữa đau gối.",
        "placement": "Tránh bẹn/ASIS, mấu chuyển, xương và khớp gối; không đè lên vùng đang sưng hoặc chấn thương.",
        "pressureAndTime": "Tùy chọn, lực nhẹ dễ chịu và có thể dừng ngay; không đặt mục tiêu mức đau hoặc số giây chung. Chưa có liều tối ưu thống nhất. Dừng nếu đau/tê tăng. [Cheatham 2015; NCCIH]",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Cử động hông/gối nhẹ theo dung nạp; không cần kéo chéo chân để ép TFL trên bóng.",
      "step3Activation": "Nếu phù hợp với chẩn đoán/đánh giá, tăng dần tập gối và hông kèm giáo dục. Không dùng lăn đơn độc làm điều trị chính cho đau bánh chè. [Neal 2024]",
      "step4LoadCue": "Giảm tải hoặc đổi biên độ/biến thể khi triệu chứng tăng; kỹ thuật được chọn theo từng người, không ép gối ra ngoài để sửa cơ giả định."
    },
    "gymTriggers": [
      "Ghi thay đổi tải chạy, leo cầu thang và tập chân.",
      "Gối đi vào trong không tự xác định nguyên nhân đau hoặc cơ yếu."
    ],
    "contraindications": [
      "Gối sưng nhiều, khóa/kẹt, không chịu lực được hoặc đỏ/nóng kèm sốt: đánh giá khẩn. [NHS Knee pain]",
      "Không cố massage mạnh vùng đau khớp hoặc bẹn để tái hiện triệu chứng."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng TFL & Rộng ngoài. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng tfl_vastus_lateralis, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  },
  {
    "id": "soleus_gastroc",
    "shortName": "Bắp chân & Dép",
    "name": "Cơ bụng chân, cơ dép và chày trước — triệu chứng cẳng chân và gót",
    "latinName": "M. Gastrocnemius, M. Soleus & M. Tibialis anterior",
    "category": "hip_leg",
    "components": [
      {
        "name": "Bụng chân",
        "latin": "M. gastrocnemius",
        "layer": "Cơ nông nhất của bắp chân. [OpenStax §11.6]",
        "trpStudy": "CPG 2023 tóm tắt RCT 21/21 về trị liệu MTrP bắp chân phối hợp siêu âm và giãn; chưa đọc độc lập thử nghiệm gốc, không xác nhận bản đồ cơ này. [Koc 2023, CPG9–10]"
      },
      {
        "name": "Dép",
        "latin": "M. soleus",
        "layer": "Dưới cơ bụng chân. [OpenStax §11.6]",
        "trpStudy": "CPG 2023 tóm tắt RCT 21/21 về trị liệu MTrP bắp chân phối hợp siêu âm và giãn; chưa đọc độc lập thử nghiệm gốc, không xác nhận bản đồ cơ này. [Koc 2023, CPG9–10]"
      },
      {
        "name": "Chày trước",
        "latin": "M. tibialis anterior",
        "layer": "Mặt ngoài xương chày. [OpenStax §11.6]",
        "trpStudy": "Chưa có nghiên cứu trigger point đã đọc khảo sát cơ này."
      }
    ],
    "plateViews": [{"plate": "openstax1105", "crop": [0, 2370, 1304, 520], "labels": ["Gastrocnemius (dissected)", "Soleus"]}, {"plate": "openstax1105", "crop": [0, 900, 1304, 440], "labels": ["Tibialis anterior"]}],
    "summary": "Đau mặt trong gan gót khi bước đầu sau nghỉ là đặc điểm thường gặp của plantar fasciitis; cần đánh giá cùng dấu hiệu khác và nguyên nhân khác. Không quy đau gót buổi sáng cho điểm đau soleus hoặc dùng sờ bắp chân để loại bệnh cân gan chân. [Koc 2023, CPG4/7]",
    "mechanism": "Hạn chế vận động cổ chân, đau gót và điểm nhạy có thể cần đánh giá riêng. Không suy ra soleus khóa ngắn, tibialis anterior bị ức chế hoặc nguyên nhân ở lưng từ một động tác squat. [Delphi 2018; Myburgh 2008]",
    "nodes": [
      {
        "id": "gas-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng bắp chân và cẳng chân trước; không là vị trí ấn sâu qua gastrocnemius để tìm soleus.",
        "view": "posterior",
        "x": 372,
        "y": 1265
      },
      {
        "id": "sol-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng bắp chân và cẳng chân trước; không là vị trí ấn sâu qua gastrocnemius để tìm soleus.",
        "view": "posterior",
        "x": 365,
        "y": 1370
      },
      {
        "id": "ta-l",
        "code": "Vùng minh họa",
        "locationLabel": "Sơ đồ vùng bắp chân và cẳng chân trước; không là vị trí ấn sâu qua gastrocnemius để tìm soleus.",
        "view": "anterior",
        "x": 532,
        "y": 1285
      }
    ],
    "referredPain": [
      {
        "view": "posterior",
        "d": "M 362 1320 C 385 1310, 412 1315, 420 1340 L 418 1500 L 435 1540 C 438 1575, 420 1590, 400 1590 C 380 1590, 372 1570, 378 1540 L 388 1500 L 360 1380 Z",
        "labelX": 210,
        "labelY": 1480,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      },
      {
        "view": "anterior",
        "d": "M 570 1220 C 510 1200, 480 1280, 495 1420 L 540 1460 C 575 1380, 585 1280, 570 1220 Z",
        "labelX": 645,
        "labelY": 1320,
        "description": "Vùng triệu chứng minh họa, chưa xác minh nguồn–vị trí; không xác định nguyên nhân hoặc bắt buộc đau lan theo vùng này. [Delphi 2018]"
      }
    ],
    "palpation": {
      "clientPosition": "Tư thế thoải mái do người tập tự chọn; không đặt tư thế để ép sâu vào cơ.",
      "technique": "Flat Palpation",
      "bonyLandmarks": "Sơ đồ vùng bắp chân và cẳng chân trước; không là vị trí ấn sâu qua gastrocnemius để tìm soleus.",
      "underFingerFeel": "Không ấn sâu cẳng chân, khoeo hoặc tìm nút bằng đau gót lan. Đau/sưng một chân chưa rõ cần khám khẩn trước khi massage, không cần đủ đỏ/nóng mới nghi ngờ. [NHS DVT]",
      "clientResponse": "Ghi nhận triệu chứng tự mô tả. Không cần tạo đau, twitch hoặc jump sign; đau quen thuộc khi sờ không tự xác nhận nguồn đau. [Delphi 2018; Myburgh 2008]"
    },
    "chain": {
      "overloadedState": "Chưa xác định qua đánh giá trực tiếp",
      "biomechanicalReason": "Đánh giá chức năng cổ chân, tải chạy và triệu chứng; không suy ra chuỗi bù trừ chỉ từ squat hoặc cảm giác căng.",
      "antagonistOrInhibited": {
        "muscles": "Nhóm cơ cẳng chân/bàn chân theo chức năng; không bắt buộc kích hoạt chày trước sau lăn.",
        "whyRelated": "Liên hệ cơ học nếu có là giả thuyết cần kiểm tra bằng đánh giá phù hợp, không là kết luận chẩn đoán từ sơ đồ.",
        "activationExercise": "Ví dụ cử động cổ chân hoặc calf raise có hỗ trợ nếu phù hợp; đau gót/Achilles cần lựa chọn bài theo đánh giá riêng."
      },
      "satelliteTriggerPoints": [
        "Không có chuỗi điểm vệ tinh mặc định được xác nhận; xem từng triệu chứng và chức năng riêng."
      ]
    },
    "protocol": {
      "step1Release": {
        "tool": "Chỉ cân nhắc lăn nhẹ mô bắp chân nông nếu không có dấu hiệu đáng lo và phù hợp; có thể bỏ qua. Không tìm điểm soleus sâu.",
        "placement": "Tránh khoeo, xương chày, gân/khớp đau và vùng sưng; không dùng bóng nhỏ ép sâu mặt trong cẳng chân.",
        "pressureAndTime": "Tùy chọn, lực nhẹ dễ chịu và có thể dừng ngay; không đặt mục tiêu mức đau hoặc số giây chung. Chưa có liều tối ưu thống nhất. Dừng nếu đau/tê tăng. [Cheatham 2015; NCCIH]",
        "pinAndStretch": "Không giữ áp lực rồi kéo mô/cổ hoặc tìm đau lan. Nếu muốn vận động, bỏ dụng cụ và tự cử động nhẹ trong biên độ dễ chịu."
      },
      "step2Mobility": "Cử động cổ chân nhẹ theo dung nạp; không giữ bóng rồi ép gập cổ chân để gây đau gót.",
      "step3Activation": "Tăng dần bài cẳng chân theo mục tiêu và phản ứng. Không có yêu cầu tập chày trước để giữ hiệu quả lăn.",
      "step4LoadCue": "Điều chỉnh tải chạy/tập chân theo khả năng và phản ứng; không có mức tăng phần trăm chung bảo đảm an toàn. Dụng cụ kê gót có thể cần đánh giá theo mục tiêu."
    },
    "gymTriggers": [
      "Ghi thay đổi tải chạy, nhảy, calf raise và giày.",
      "Kê gót hoặc một kiểu giày không tự chứng minh nguyên nhân đau."
    ],
    "contraindications": [
      "Đau hoặc sưng một chân chưa rõ, đổi màu/nóng: đánh giá y tế khẩn; không massage để kiểm tra. Kèm khó thở/đau ngực: cấp cứu. [NHS DVT]",
      "Đau gót nhiều sau chấn thương, nghe tiếng bật, biến dạng hoặc không đi được cần khám khẩn; không quy cho trigger point. [NHS 111 Wales Heel pain]",
      "Không ấn sâu khoeo hoặc cẳng chân; dừng khi tê/đau tăng."
    ],
    "references": [],
    "sampleAiPrompt": "Người tập có triệu chứng vùng Bắp chân & Dép. Hãy hỏi diễn tiến, tải hoạt động, chức năng và dấu hiệu cần chuyển khám/cấp cứu. Không chẩn đoán từ bản đồ, không mặc định locked-long/short hoặc cơ bị ức chế. Phân biệt giả thuyết với bằng chứng và chỉ nêu tự chăm sóc nhẹ/vận động theo dung nạp khi phù hợp; không hướng dẫn ấn sâu cổ, nách, bụng/bẹn hoặc gây tê. Dùng nguồn trong hồ sơ bằng chứng soleus_gastroc, ghi phạm vi và giới hạn; tọa độ điểm ấn và vùng đau lan cũ đang ẩn vì chưa có nguồn ánh xạ từng vị trí."
  }
];

export const TRIGGER_POINT_MUSCLES: TriggerPointMuscle[] = triggerMuscleRecords.map((muscle) => ({
  ...muscle,
  references: TRIGGER_POINT_EVIDENCE[muscle.id].sources.map(evidenceReference),
}));

export const PAIN_SITE_CULPRIT_MAP: PainSiteCulprit[] = [
  {
    "id": "anterior_shoulder",
    "name": "Đau sâu mặt trước vai",
    "shortName": "Mặt trước vai",
    "view": "anterior",
    "zoneD": "M 218 330 C 270 300, 340 325, 355 390 L 335 480 C 270 505, 205 455, 205 385 Z",
    "pinX": 268,
    "pinY": 390,
    "victimLabel": "Triệu chứng trước vai cần đánh giá khớp, gân, cổ và nguyên nhân khác theo bối cảnh; vị trí đau không chỉ ra một cơ duy nhất.",
    "culprits": [
      {
        "muscleId": "infraspinatus",
        "whyDeceptive": "Infraspinatus có trong nghiên cứu đau vai nhỏ; liên hệ điểm đau không đủ chứng minh mọi đau trước vai bắt nguồn từ cơ này. [Hidalgo-Lozano 2010]"
      },
      {
        "muscleId": "pec_minor",
        "whyDeceptive": "Chiều dài pec minor liên hệ vận động bả ở người không đau; không xác nhận trigger point hoặc TOS. Tê/yếu tay hoặc đau ngực cần đánh giá riêng. [Borstad 2005; NHS Shoulder pain; NHS Chest pain]"
      }
    ]
  },
  {
    "id": "neck_temple",
    "name": "Đau gáy, thái dương và góc hàm",
    "shortName": "Gáy & thái dương",
    "view": "anterior",
    "zoneD": "M 380 74 C 392 72, 402 88, 402 115 L 402 200 C 406 225, 418 245, 420 268 L 402 276 C 390 252, 382 226, 380 200 L 378 115 Z",
    "pinX": 392,
    "pinY": 150,
    "victimLabel": "Vùng đau đầu/cổ có nhiều nguyên nhân. Đau đầu đột ngột cực kỳ dữ dội hoặc kèm yếu/tê mặt/cơ thể: cấp cứu. Đau đầu kèm đau hàm khi nhai hoặc đau da đầu: khám khẩn. [NHS Headaches]",
    "culprits": [
      {
        "muscleId": "upper_trapezius",
        "whyDeceptive": "Thang trên có trong nghiên cứu điểm nhạy cơ cổ, nhưng không là chẩn đoán nguồn của đau thái dương. [Fernández-de-las-Peñas 2007]"
      },
      {
        "muscleId": "levator_scapulae",
        "whyDeceptive": "Đau góc cổ/bả có thể được ghi nhận cùng hạn chế vận động, không đủ kết luận cơ nâng vai là nguyên nhân. [Delphi 2018]"
      }
    ]
  },
  {
    "id": "between_scapulae",
    "name": "Đau giữa hai bả vai",
    "shortName": "Giữa hai bả",
    "view": "posterior",
    "zoneD": "M 330 430 C 410 400, 490 420, 530 500 L 500 640 C 430 680, 360 650, 320 540 Z",
    "pinX": 450,
    "pinY": 540,
    "victimLabel": "Đau giữa bả vai có thể cần đánh giá nhiều nguyên nhân; không quy là nạn nhân tư thế hoặc điểm đau ở cơ xa.",
    "culprits": [
      {
        "muscleId": "lats_serratus",
        "whyDeceptive": "Chưa có nguồn đã đọc xác nhận vùng đau riêng của lats/serratus trong app; đau ngực/sườn kèm khó thở cần đánh giá khẩn. [NHS Chest pain]"
      },
      {
        "muscleId": "levator_scapulae",
        "whyDeceptive": "Levator có trong nghiên cứu cơ cổ; không có bản đồ cố định bắt buộc cho đau giữa bả. [Fernández-de-las-Peñas 2007; Delphi 2018]"
      },
      {
        "muscleId": "pec_minor",
        "whyDeceptive": "Không xác nhận pec minor kéo bả làm rhomboid khóa dài. Nghiên cứu pec minor ở người không đau không chứng minh chuỗi nguyên nhân đó. [Borstad 2005]"
      }
    ]
  },
  {
    "id": "low_back",
    "name": "Đau vùng thắt lưng",
    "shortName": "Thắt lưng",
    "view": "posterior",
    "zoneD": "M 340 620 C 420 590, 500 610, 530 690 L 500 780 C 430 810, 350 780, 325 700 Z",
    "pinX": 450,
    "pinY": 700,
    "victimLabel": "Đau lưng thường cần đánh giá triệu chứng, chức năng và dấu hiệu đáng lo; không cần tìm một thủ phạm QL/psoas để bắt đầu vận động phù hợp. [NICE NG59]",
    "culprits": [
      {
        "muscleId": "quadratus_lumborum",
        "whyDeceptive": "QL có điểm nhạy thường gặp trong một mẫu đau lưng mạn; nghiên cứu cắt ngang không chứng minh QL là nguyên nhân lớn nhất. [Iglesias-González 2013]"
      },
      {
        "muscleId": "iliopsoas",
        "whyDeceptive": "Psoas có trong nghiên cứu đau lưng, nhưng không xác nhận nguồn đau từ vị trí/động tác. Không dùng bóng hoặc ngón sâu trên bụng để thử giả thuyết. [Iglesias-González 2013; StatPearls]"
      }
    ]
  },
  {
    "id": "glute_posterior_thigh",
    "name": "Đau mông lan mặt sau đùi",
    "shortName": "Mông & đùi sau",
    "view": "posterior",
    "zoneD": "M 305 760 C 380 730, 470 770, 460 900 L 420 1080 C 380 1120, 340 1020, 318 900 Z",
    "pinX": 360,
    "pinY": 920,
    "victimLabel": "Đau lan chân cần đánh giá cột sống, háng và thần kinh theo triệu chứng. MRI cột sống bình thường không xác nhận đau do trigger point.",
    "culprits": [
      {
        "muscleId": "glute_med_piriformis",
        "whyDeceptive": "Cơ mông và piriformis là một phần đánh giá phân biệt; hội chứng mông sâu có thể gồm chèn ép thần kinh. Sờ đau hoặc SLR âm tính không tự loại bệnh rễ. [Hopayian 2010; Martin 2015; SLR diagnostic study 2023; NeuPSIG 2023]"
      },
      {
        "muscleId": "quadratus_lumborum",
        "whyDeceptive": "Đau mô mềm hông lưng có thể chồng vùng triệu chứng; không xác định QL là nguồn chỉ bằng vùng tô. [Nolet 2021; Delphi 2018]"
      }
    ]
  },
  {
    "id": "lateral_knee",
    "name": "Đau mặt ngoài gối",
    "shortName": "Mặt ngoài gối",
    "view": "anterior",
    "zoneD": "M 338 1062 C 356 1056, 372 1080, 372 1120 L 370 1200 C 360 1215, 346 1210, 342 1195 L 340 1140 Z",
    "pinX": 355,
    "pinY": 1155,
    "victimLabel": "Không suy từ đau ngoài gối sang nút TFL/VL hoặc cơ hông yếu. Gối sưng nhiều, kẹt/khóa, không chịu lực được hoặc đỏ/nóng kèm sốt cần đánh giá khẩn. [NHS Knee pain]",
    "culprits": [
      {
        "muscleId": "tfl_vastus_lateralis",
        "whyDeceptive": "Chưa có nguồn đã đọc xác nhận bản đồ TFL/VL gây đau gối. Với đau bánh chè đã được đánh giá, tập gối và có thể tập hông kèm giáo dục là hướng chính. [Neal 2024]"
      },
      {
        "muscleId": "glute_med_piriformis",
        "whyDeceptive": "Không mặc định gối là nạn nhân của cơ mông hoặc valgus; bài tập hông nếu chọn phải phù hợp đánh giá và triệu chứng. [Neal 2024]"
      }
    ]
  },
  {
    "id": "heel_foot",
    "name": "Đau gót và gan chân",
    "shortName": "Gót chân",
    "view": "posterior",
    "zoneD": "M 380 1500 C 400 1495, 425 1498, 435 1520 L 440 1575 C 430 1592, 395 1595, 382 1580 L 375 1540 Z",
    "pinX": 408,
    "pinY": 1545,
    "victimLabel": "Đau mặt trong gan gót khi bước đầu sau nghỉ thường gặp trong plantar fasciitis; cần đánh giá cùng các dấu hiệu khác. Một điểm nhạy bắp chân không thay thế đánh giá đau gót. [Koc 2023, CPG4/7]",
    "culprits": [
      {
        "muscleId": "soleus_gastroc",
        "whyDeceptive": "Chưa có nguồn đã đọc xác nhận chấm soleus trong app là nguồn đau gót. Đau/sưng một chân cần khám khẩn trước massage; kèm khó thở/đau ngực: cấp cứu. [NHS DVT]"
      }
    ]
  },
  {
    "id": "anterior_hip",
    "name": "Đau trước háng và nếp bẹn",
    "shortName": "Mặt trước háng",
    "view": "anterior",
    "zoneD": "M 310 700 C 380 680, 440 720, 430 790 L 380 830 C 320 825, 290 770, 310 700 Z",
    "pinX": 360,
    "pinY": 760,
    "victimLabel": "Đau trước háng/bẹn cần đánh giá nhiều nguyên nhân; không tự ấn bụng/bẹn để tìm nút. Đau bụng xuất hiện đột ngột hoặc dữ dội: cấp cứu. [StatPearls Psoas Major; NHS Stomach ache]",
    "culprits": [
      {
        "muscleId": "iliopsoas",
        "whyDeceptive": "Không xác nhận iliopsoas là nguồn đau từ đau khi đứng dậy hoặc bước cao. Cơ sâu liên quan tạng/mạch/thần kinh; app không hướng dẫn ấn. [StatPearls Psoas Major]"
      },
      {
        "muscleId": "tfl_vastus_lateralis",
        "whyDeceptive": "Vị trí đau ngoài háng so với bẹn không đủ chọn TFL thay iliopsoas; cần đánh giá trực tiếp, không xếp hạng thủ phạm. [Delphi 2018]"
      }
    ]
  }
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
