import type { Client, OrthopedicIssue } from "@/lib/types";

export type AnatomyRegionId =
  | "cervical"
  | "shoulder"
  | "thoracic_core"
  | "lumbar"
  | "hip_pelvis"
  | "thigh_hamstring"
  | "knee"
  | "ankle_foot";

export interface MuscleStructure {
  name: string;
  latin: string;
  originInsertion: string;
  action: string;
}

export interface ExerciseProtocolPair {
  avoid: string;
  whyAvoid: string;
  rehabAlternative: string;
  cuesAndTempo: string;
}

export interface AnatomyRegion {
  id: AnatomyRegionId;
  name: string;
  latinName: string;
  group: "spine_core" | "upper_limb" | "lower_limb";
  views: ("anterior" | "posterior")[];
  summary: string;
  biomechanicsKey: string;
  structures: MuscleStructure[];
  commonPathologies: string[];
  painTriggers: string[];
  screeningTests: { name: string; purpose: string }[];
  redFlags: string[];
  protocols: ExerciseProtocolPair[];
  sampleAiPrompt: string;
}

// Educational region text and joint annotation sources rechecked 2026-10-22.
// See evidence-anatomy.ts for claim scope; source anatomy does not establish mesh mapping.
export const ANATOMY_REGIONS: AnatomyRegion[] = [
  {
    "id": "cervical",
    "name": "Cột sống Cổ & Đai vai trên",
    "latinName": "Columna Cervicalis (C1–C7) & Cingulum Pectorale",
    "group": "spine_core",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Cột sống cổ nâng đỡ và vận động đầu. Cơ, dây chằng và khớp cùng tham gia kiểm soát vận động; tư thế nhìn thấy không đủ để xác định nguyên nhân đau.",
    "biomechanicsKey": "Nhóm gập, duỗi và xoay cổ phối hợp theo nhiệm vụ. Hướng dẫn đau cổ 2017 lựa chọn vận động và tăng sức mạnh/sức bền theo biểu hiện, thay vì dùng một quy tắc tải suy ra từ khoảng nhô đầu.",
    "structures": [
      {
        "name": "Nhóm cơ gập cổ sâu",
        "latin": "Longus colli & Longus capitis",
        "originInsertion": "Longus colli: thân đốt sống và mỏm ngang cổ–ngực trên → cung trước C1 và thân đốt sống cổ; longus capitis: mỏm ngang C3–C6 → phần nền xương chẩm.",
        "action": "Tham gia gập cổ/đầu; hai cơ có điểm bám và vai trò khác nhau."
      },
      {
        "name": "Cơ nâng vai",
        "latin": "Levator scapulae",
        "originInsertion": "Mỏm ngang C1–C4 → phần trên bờ trong xương bả vai.",
        "action": "Nâng xương bả vai."
      },
      {
        "name": "Cơ thang",
        "latin": "Trapezius",
        "originInsertion": "Xương chẩm, dây chằng gáy và mỏm gai đến T12 → xương đòn, mỏm cùng và gai vai.",
        "action": "Các bó tham gia nâng, kéo về sau và xoay xương bả vai; tác dụng thay đổi theo bó cơ."
      }
    ],
    "commonPathologies": [
      "Đau cổ có hạn chế vận động hoặc giảm sức bền: cần đánh giá theo triệu chứng.",
      "Bệnh rễ thần kinh cổ có thể gây đau lan, tê hoặc yếu tay; cần khám y khoa."
    ],
    "painTriggers": [
      "Một số hướng xoay/ngửa cổ có thể làm tăng đau lan ở người có bệnh rễ; ghi nhận triệu chứng thay vì thử ép cổ."
    ],
    "screeningTests": [
      {
        "name": "Quan sát vận động cổ chủ động",
        "purpose": "Ghi nhận hướng vận động dễ chịu, đau và ảnh hưởng sinh hoạt; không chẩn đoán từ tư thế đầu."
      },
      {
        "name": "Khám thần kinh và nghiệm pháp cổ",
        "purpose": "Spurling và các nghiệm pháp thần kinh thuộc đánh giá của người hành nghề phù hợp; không tự ép đầu hoặc dùng kết quả đơn lẻ để kết luận chèn ép rễ."
      }
    ],
    "redFlags": [
      "Đau cổ sau chấn thương, đau dữ dội kéo dài hoặc kèm đau đầu và tê/yếu tay chân: ngừng tập và được đánh giá y tế ngay.",
      "Dấu hiệu gợi ý bệnh tủy cổ: dáng đi loạng choạng hoặc hay vấp/ngã, tay vụng về (khó cài cúc, cầm chìa khóa, viết), tê hoặc yếu tay/chân tăng dần, hoặc thay đổi tiểu tiện/đại tiện kèm đau hoặc cứng cổ: ngừng tập và được đánh giá y tế; không tự thử nghiệm pháp cổ. Đây là dấu hiệu cần khám, không là chẩn đoán."
    ],
    "protocols": [
      {
        "avoid": "Tạm điều chỉnh bài kéo/đẩy đang làm tăng đau cổ hoặc đau lan",
        "whyAvoid": "Mức tải và biên độ cần phù hợp biểu hiện; tên bài tập không xác định tổn thương.",
        "rehabAlternative": "Thảo luận bài vận động cổ và tăng sức mạnh/sức bền vùng cổ–vai phù hợp với chuyên viên phục hồi chức năng.",
        "cuesAndTempo": "Vận động trong phạm vi được hướng dẫn; dừng nếu xuất hiện hoặc tăng tê/yếu."
      },
      {
        "avoid": "Tự kéo nắn, ép hoặc xoay cổ để tìm điểm đau",
        "whyAvoid": "Khám cần xem xét chấn thương, thần kinh và bệnh lý nghiêm trọng trước can thiệp.",
        "rehabAlternative": "Ghi lại vị trí, thời điểm và hoạt động liên quan đến triệu chứng để cung cấp khi khám.",
        "cuesAndTempo": "Đây là giáo dục và theo dõi triệu chứng; liều tập do người đánh giá lựa chọn."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu cổ–vai và giới hạn của việc suy luận bệnh từ tư thế. Với đau cổ kèm đau lan, nêu dấu hiệu cần khám và nguyên tắc điều chỉnh hoạt động theo hướng dẫn chuyên môn, kèm nguồn."
  },
  {
    "id": "shoulder",
    "name": "Khớp Vai, Xương bả vai & Chóp xoay",
    "latinName": "Articulatio Humeri & Scapula",
    "group": "upper_limb",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Vận động nâng tay phối hợp khớp vai và xương bả vai. Nhịp vai–bả vai thay đổi theo giai đoạn nâng/hạ tay; tỉ lệ 2:1 không phải chuẩn cố định để chẩn đoán.",
    "biomechanicsKey": "Chóp xoay tham gia vận động và ổn định khớp vai. Cơ răng trước và cơ thang tham gia vận động bả vai; không thể quy đau vai về một khoảng dưới mỏm cùng đoán từ tư thế.",
    "structures": [
      {
        "name": "Cơ trên gai",
        "latin": "Supraspinatus",
        "originInsertion": "Hố trên gai xương bả vai → diện trên củ lớn xương cánh tay và bao khớp.",
        "action": "Tham gia dạng cánh tay và ổn định khớp vai; không chỉ hoạt động ở một cung góc cố định."
      },
      {
        "name": "Cơ dưới gai & cơ tròn bé",
        "latin": "Infraspinatus & Teres minor",
        "originInsertion": "Hố dưới gai / bờ ngoài xương bả vai → diện giữa / diện dưới củ lớn xương cánh tay và bao khớp.",
        "action": "Xoay ngoài cánh tay và góp phần ổn định khớp vai."
      },
      {
        "name": "Cơ răng trước",
        "latin": "Serratus anterior",
        "originInsertion": "Các xương sườn trên → mặt sườn của bờ trong xương bả vai.",
        "action": "Vươn và xoay lên xương bả vai."
      }
    ],
    "commonPathologies": [
      "Đau hoặc rách chóp xoay cần được phân biệt bằng bệnh sử và thăm khám.",
      "Thay đổi vận động bả vai là mô tả quan sát, không tự xác định cơ yếu hoặc nguồn đau."
    ],
    "painTriggers": [
      "Đau khi nâng/hạ tay hoặc mang tải có thể gặp ở bệnh lý chóp xoay; vị trí cung đau không đủ xác định mô tổn thương."
    ],
    "screeningTests": [
      {
        "name": "Quan sát nâng tay chủ động",
        "purpose": "Ghi nhận tầm vận động và triệu chứng khi người tập tự nâng tay; không ép qua đau để tìm một cung góc."
      },
      {
        "name": "Trao đổi khi cần khám vai",
        "purpose": "Đánh giá sức mạnh, khả năng nâng tay và nghiệm pháp lâm sàng cần được diễn giải cùng bệnh sử bởi người có chuyên môn."
      }
    ],
    "redFlags": [
      "Đau/tức ngực đột ngột không giảm; đau ngực lan tay, cổ hoặc lưng; hoặc đau ngực kèm khó thở, vã mồ hôi hay choáng: ngừng tập và gọi cấp cứu ngay.",
      "Đau vai đột ngột dữ dội, không cử động được tay, biến dạng/sưng lớn hoặc đau sau ngã/chấn thương: cần đánh giá y tế khẩn; không tự kết luận đứt chóp xoay."
    ],
    "protocols": [
      {
        "avoid": "Tiếp tục bài vai đang gây đau tăng",
        "whyAvoid": "Chương trình vận động vai cần được chọn theo đánh giá và phản ứng triệu chứng.",
        "rehabAlternative": "Thảo luận vận động vai nhẹ và bài tăng sức mạnh chóp xoay/bả vai với chuyên viên.",
        "cuesAndTempo": "Chọn tải và biên độ thoải mái theo hướng dẫn; không áp một góc hoặc tempo cho mọi người."
      },
      {
        "avoid": "Dùng một bài đẩy thay thế như phác đồ cho mọi dạng đau vai",
        "whyAvoid": "Chẩn đoán, giai đoạn hồi phục và mục tiêu vận động khác nhau.",
        "rehabAlternative": "Row hoặc xoay ngoài kháng lực có thể là ví dụ giáo dục nếu đã được người điều trị chọn.",
        "cuesAndTempo": "Hỏi người điều trị về liều tập và tiêu chí tăng tải, nhất là sau chấn thương/phẫu thuật."
      }
    ],
    "sampleAiPrompt": "Giải thích vai trò chóp xoay và nhịp vai–bả vai biến thiên. Nêu giới hạn chẩn đoán từ cung đau và nguyên tắc chọn vận động theo đánh giá, không tự đặt chẩn đoán hoặc phác đồ 4 tuần."
  },
  {
    "id": "thoracic_core",
    "name": "Cột sống Ngực, Lồng ngực & Cơ thân mình",
    "latinName": "Columna Thoracica (T1–T12) & Musculi Abdominis",
    "group": "spine_core",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Cột sống ngực liên kết với xương sườn. Cơ thành bụng, cơ lưng và cơ hoành tham gia vận động thân mình, hô hấp và kiểm soát áp lực; cả cột sống ngực và thắt lưng đều có vận động.",
    "biomechanicsKey": "Cơ hoành là cơ hít vào; cơ thành bụng hỗ trợ thở ra gắng sức và tăng áp lực ổ bụng. Một kiểu gồng hoặc quan sát bụng bằng tay không chứng minh cột sống được bảo vệ khỏi chấn thương.",
    "structures": [
      {
        "name": "Cơ ngang bụng",
        "latin": "Transversus abdominis",
        "originInsertion": "Bờ sườn, mạc thắt lưng, mào chậu và dây chằng bẹn → hệ cân thành bụng và vùng mu.",
        "action": "Hỗ trợ thành bụng, thở ra gắng sức và tăng áp lực ổ bụng."
      },
      {
        "name": "Cơ hoành",
        "latin": "Diaphragma",
        "originInsertion": "Mỏm mũi kiếm, các sườn dưới và trụ thắt lưng → trung tâm gân.",
        "action": "Hít vào và hỗ trợ tăng áp lực ổ bụng."
      },
      {
        "name": "Cơ chéo bụng trong & ngoài",
        "latin": "Obliquus internus & externus abdominis",
        "originInsertion": "Cơ chéo ngoài nối các sườn dưới với hệ cân bụng/mào chậu; cơ chéo trong nối mạc thắt lưng, mào chậu, dây chằng bẹn với bờ sườn/hệ cân bụng.",
        "action": "Tham gia xoay và nghiêng thân, hỗ trợ thành bụng và thở ra gắng sức."
      }
    ],
    "commonPathologies": [
      "Đau ngực hoặc lưng trên có nhiều nguyên nhân; cần đánh giá khi dai dẳng hoặc xuất hiện dấu hiệu toàn thân.",
      "Tách cơ thẳng bụng sau sinh cần đánh giá riêng; hình dạng bụng không đủ để quyết định cấm bài tập."
    ],
    "painTriggers": [
      "Nín thở khi gắng sức có thể làm tăng huyết áp; người có bệnh tim mạch cần hướng dẫn vận động riêng."
    ],
    "screeningTests": [
      {
        "name": "Quan sát hô hấp khi vận động nhẹ",
        "purpose": "Ghi nhận người tập có thở đều và thoải mái hay không; không coi quan sát này là phép đo áp lực ổ bụng."
      },
      {
        "name": "Ghi nhận đau ngực và triệu chứng đi kèm",
        "purpose": "Hỏi thời điểm, hoạt động và khó thở/chóng mặt kèm theo; không dùng bài tập thử để loại trừ bệnh tim phổi."
      }
    ],
    "redFlags": [
      "Đau/tức ngực đột ngột không giảm; đau ngực lan tay/cổ/lưng; hoặc đau ngực kèm khó thở, vã mồ hôi hay choáng: ngừng tập và gọi cấp cứu ngay."
    ],
    "protocols": [
      {
        "avoid": "Gồng nín thở kéo dài, nhất là khi có tăng huyết áp",
        "whyAvoid": "Nín thở có thể làm tăng huyết áp; hướng dẫn thở không bảo đảm loại bỏ mọi đáp ứng huyết áp.",
        "rehabAlternative": "Giảm cường độ để có thể thở đều và xin hướng dẫn cá nhân từ đội ngũ chăm sóc.",
        "cuesAndTempo": "Thở đều; tăng hoạt động dần theo khả năng và bệnh nền."
      },
      {
        "avoid": "Tự áp dụng phác đồ core cho đau ngực hoặc tình trạng sau sinh chưa được đánh giá",
        "whyAvoid": "Nhu cầu đánh giá và giới hạn tập khác nhau giữa các tình trạng.",
        "rehabAlternative": "Trao đổi với người hành nghề phù hợp trước chương trình phục hồi chuyên biệt.",
        "cuesAndTempo": "Nội dung này mô tả chức năng cơ và nguyên tắc vận động chung; không đưa liều điều trị."
      }
    ],
    "sampleAiPrompt": "Giải thích chức năng cơ hoành và cơ thành bụng có nguồn. Phân biệt giáo dục hô hấp với điều trị tăng huyết áp hoặc tách cơ bụng; nêu dấu hiệu đau ngực cần cấp cứu."
  },
  {
    "id": "lumbar",
    "name": "Cột sống Thắt lưng – Cùng (L1–S1)",
    "latinName": "Columna Lumbalis (L1–L5) & Discus Intervertebralis",
    "group": "spine_core",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Đốt sống thắt lưng và đĩa đệm vừa chịu tải vừa cho phép vận động. Đau lưng có nhiều nguyên nhân; quan sát gập lưng trong một động tác không xác định được thoát vị hay mức tổn thương.",
    "biomechanicsKey": "NICE NG59 khuyến khích duy trì hoạt động và chọn vận động theo nhu cầu, khả năng và sở thích sau đánh giá. Không có một tư thế hay bài thay thế bảo đảm giảm một tỉ lệ lực cắt cố định cho mọi người.",
    "structures": [
      {
        "name": "Đĩa đệm gian đốt sống",
        "latin": "Discus intervertebralis",
        "originInsertion": "Nằm giữa các thân đốt sống; gồm vòng sợi bên ngoài và nhân nhầy bên trong.",
        "action": "Góp phần chịu tải nén và cho phép vận động giữa các đốt sống."
      },
      {
        "name": "Cơ nhiều chân",
        "latin": "Multifidus",
        "originInsertion": "Nhóm cơ sâu nối các thành phần sau của cột sống với mỏm gai ở các tầng phía trên.",
        "action": "Tham gia duỗi và kiểm soát vận động cột sống; đây là mô tả nhóm cơ, không phải bản đồ điểm bám từng bó."
      },
      {
        "name": "Cơ vuông thắt lưng",
        "latin": "Quadratus lumborum",
        "originInsertion": "Giữa mào chậu, xương sườn 12 và mỏm ngang thắt lưng.",
        "action": "Nghiêng thân và cố định xương sườn 12 khi hô hấp."
      }
    ],
    "commonPathologies": [
      "Đau lưng có hoặc không kèm đau thần kinh tọa cần phân loại qua đánh giá.",
      "Thoát vị đĩa đệm có thể liên quan triệu chứng rễ; không suy ra chẩn đoán từ một kiểu squat/deadlift."
    ],
    "painTriggers": [
      "Ghi lại hoạt động, tư thế hoặc thời lượng liên quan đau của từng người; không áp mốc ngồi cố định hoặc coi một động tác là nguyên nhân chắc chắn."
    ],
    "screeningTests": [
      {
        "name": "Theo dõi hoạt động và chức năng",
        "purpose": "Ghi nhận khả năng đi lại, ngồi, nâng vật và thay đổi triệu chứng để trao đổi khi khám."
      },
      {
        "name": "Khám thần kinh khi có đau lan hoặc yếu",
        "purpose": "Slump/straight leg raise thuộc thăm khám chuyên môn; không kéo căng thần kinh hoặc dùng một kết quả đơn lẻ để chẩn đoán."
      }
    ],
    "redFlags": [
      "Tê mới vùng yên ngựa, khó bắt đầu tiểu/bí tiểu, mất kiểm soát tiểu tiện/đại tiện hoặc tê/yếu nặng hay tăng dần ở cả hai chân, đặc biệt cùng đau lưng/đau chân: đi cấp cứu ngay để loại trừ chùm đuôi ngựa.",
      "Yếu chân mới xuất hiện hoặc tăng dần, đau lưng kèm sốt, sụt cân không rõ nguyên nhân hoặc chấn thương: cần được đánh giá y tế sớm/khẩn theo biểu hiện."
    ],
    "protocols": [
      {
        "avoid": "Tiếp tục mức tải đang làm triệu chứng tăng rõ hoặc vi phạm chỉ định điều trị",
        "whyAvoid": "Cần điều chỉnh hoạt động theo khả năng, chẩn đoán và diễn biến; không cấm vĩnh viễn squat/deadlift vì tên bệnh.",
        "rehabAlternative": "Duy trì hoạt động có thể dung nạp; thảo luận thay đổi tải, biên độ hoặc dạng vận động với chuyên viên.",
        "cuesAndTempo": "Theo dõi chức năng và triệu chứng; liều tập và tiến triển cần cá nhân hóa."
      },
      {
        "avoid": "Dùng hướng dẫn từ atlas như phác đồ sau mổ hoặc khi có dấu hiệu thần kinh mới",
        "whyAvoid": "Các tình trạng này cần đánh giá và hướng dẫn riêng.",
        "rehabAlternative": "Ưu tiên khám và chương trình do người điều trị thống nhất.",
        "cuesAndTempo": "Ngừng tập và xử trí khẩn khi có dấu hiệu chùm đuôi ngựa."
      }
    ],
    "sampleAiPrompt": "Giải thích cấu trúc đĩa đệm và nguyên tắc duy trì hoạt động trong đau lưng theo NICE NG59. Nêu giới hạn suy luận từ tư thế, dấu hiệu cần khám và thông tin cần có trước đề xuất vận động."
  },
  {
    "id": "hip_pelvis",
    "name": "Khớp Háng, Khung chậu & Cơ Mông",
    "latinName": "Articulatio Coxae, Pelvis & Regio Glutealis",
    "group": "lower_limb",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Khớp háng là khớp chỏm–ổ cối. Cơ mông và các cơ quanh háng tạo vận động và hỗ trợ kiểm soát khung chậu; đau bẹn hay gối đi vào trong không tự chứng minh một cơ yếu.",
    "biomechanicsKey": "Cơ mông nhỡ/bé tham gia dạng háng và kiểm soát khung chậu khi đi. Hội chứng FAI cần đồng thời triệu chứng, dấu hiệu lâm sàng và hình ảnh phù hợp; không xác định FAI chỉ qua độ sâu squat.",
    "structures": [
      {
        "name": "Cơ mông lớn",
        "latin": "Gluteus maximus",
        "originInsertion": "Phần sau xương cánh chậu, xương cùng/cụt và dây chằng cùng–ụ ngồi → dải chậu chày và lồi củ cơ mông xương đùi.",
        "action": "Duỗi và xoay ngoài háng."
      },
      {
        "name": "Cơ mông nhỡ & mông bé",
        "latin": "Gluteus medius & minimus",
        "originInsertion": "Mặt ngoài xương cánh chậu → mấu chuyển lớn; vị trí bám khác nhau giữa hai cơ.",
        "action": "Dạng háng và tham gia kiểm soát khung chậu khi đi; mô tả này không xác định chức năng từng phân khu trên mesh."
      },
      {
        "name": "Cơ thắt lưng–chậu",
        "latin": "Iliopsoas (Psoas major + Iliacus)",
        "originInsertion": "Psoas major từ thân đốt T12–L5/mỏm ngang thắt lưng; iliacus từ hố chậu → vùng mấu chuyển bé xương đùi.",
        "action": "Gập háng; không suy ra co rút cơ từ thời gian ngồi hoặc hình dạng chậu."
      }
    ],
    "commonPathologies": [
      "Hội chứng FAI: chẩn đoán cần kết hợp triệu chứng, thăm khám và hình ảnh.",
      "Đau mặt ngoài háng hoặc đau mông có thể có nhiều nguồn; cần phân biệt khi khám."
    ],
    "painTriggers": [
      "Đau háng/bẹn liên quan vận động hoặc tư thế có thể gặp trong FAI nhưng không đặc hiệu; ghi lại hoạt động gây đau."
    ],
    "screeningTests": [
      {
        "name": "Quan sát đứng một chân hoặc bước lên bục khi thoải mái",
        "purpose": "Ghi nhận thăng bằng, triệu chứng và cách vận động; không quy trực tiếp lệch chậu/gối cho yếu cơ mông nhỡ."
      },
      {
        "name": "Đánh giá đau háng chuyên môn",
        "purpose": "Nghiệm pháp háng và hình ảnh chỉ có ý nghĩa trong bệnh cảnh phù hợp; PT không tự đặt chẩn đoán FAI từ một dấu hiệu."
      }
    ],
    "redFlags": [
      "Đau háng/bẹn dữ dội sau ngã/chấn thương hoặc không thể đi, chịu lực: ngừng tập và đến cấp cứu.",
      "Đau háng đột ngột nặng, khớp nóng/sưng hoặc kèm sốt: cần đánh giá y tế khẩn."
    ],
    "protocols": [
      {
        "avoid": "Lặp lại độ sâu hoặc tư thế đang làm đau bẹn tăng",
        "whyAvoid": "Trong FAI đã được đánh giá, điều chỉnh hoạt động và phục hồi chức năng có thể là lựa chọn; không áp một độ rộng chân cho mọi cấu trúc háng.",
        "rehabAlternative": "Trao đổi cách giảm biên độ/tải và lựa chọn vận động với người điều trị.",
        "cuesAndTempo": "Chọn cách vận động phù hợp triệu chứng; không cố ép qua cảm giác cấn đau."
      },
      {
        "avoid": "Dùng bài kích hoạt cơ mông thay cho đánh giá đau háng kéo dài",
        "whyAvoid": "Điều trị phụ thuộc nguyên nhân và mục tiêu, không chỉ kết quả quan sát gối/chậu.",
        "rehabAlternative": "Chương trình chuyên môn có thể gồm sức mạnh, kiểm soát vận động và tầm vận động phù hợp.",
        "cuesAndTempo": "Không áp một số lần hoặc thời hạn phục hồi chung từ atlas."
      }
    ],
    "sampleAiPrompt": "Giải thích chức năng cơ quanh háng và tiêu chí Warwick cho FAI. Với đau bẹn khi squat, nêu thông tin cần khám, các cách điều chỉnh theo triệu chứng và giới hạn chẩn đoán từ quan sát."
  },
  {
    "id": "thigh_hamstring",
    "name": "Cơ Đùi trước, Gân kheo & Cơ Khép",
    "latinName": "Regio Femoralis Anterior, Posterior & Medialis",
    "group": "lower_limb",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Cơ tứ đầu duỗi gối; gân kheo gập gối và phần lớn còn duỗi háng. Đầu ngắn cơ nhị đầu đùi không đi qua khớp háng; cơ thẳng đùi đi qua cả háng và gối.",
    "biomechanicsKey": "Sau căng gân kheo, hướng dẫn 2022 khuyến nghị phục hồi theo khả năng, gồm tăng sức mạnh với pha co cơ khi kéo dài và tiến triển chạy. Một tỉ lệ sức mạnh hay số lần bridge đơn lẻ không đủ quyết định trở lại thể thao.",
    "structures": [
      {
        "name": "Nhóm cơ tứ đầu đùi",
        "latin": "Rectus femoris, Vastus lateralis, Vastus medialis & Vastus intermedius",
        "originInsertion": "Cơ thẳng đùi từ gai chậu trước dưới/vùng trên ổ cối; các cơ rộng từ xương đùi → gân tứ đầu, bánh chè và dây chằng bánh chè đến lồi củ chày.",
        "action": "Duỗi gối; cơ thẳng đùi còn gập háng. Không coi một bó VMO là cơ chế duy nhất kiểm soát bánh chè."
      },
      {
        "name": "Nhóm cơ gân kheo",
        "latin": "Biceps femoris, Semitendinosus & Semimembranosus",
        "originInsertion": "Phần lớn từ ụ ngồi; đầu ngắn nhị đầu từ xương đùi → đầu xương mác hoặc phía trong đầu trên xương chày.",
        "action": "Gập gối; các phần đi qua háng còn tham gia duỗi háng."
      },
      {
        "name": "Nhóm cơ khép đùi",
        "latin": "Adductor magnus, longus, brevis & Gracilis",
        "originInsertion": "Từ vùng mu/ngồi đến xương đùi; riêng gracilis đến mặt trong đầu trên xương chày.",
        "action": "Khép háng; gracilis còn tham gia gập gối, các phần cơ khép lớn có tác dụng khác nhau."
      }
    ],
    "commonPathologies": [
      "Căng cơ gân kheo khi hoạt động nhanh: chẩn đoán và mức độ cần đánh giá.",
      "Đau gần ụ ngồi có thể cần phân biệt tổn thương cơ, gân hoặc bong điểm bám."
    ],
    "painTriggers": [
      "Đau đột ngột mặt sau đùi khi chạy nhanh có thể liên quan căng cơ; không xác định độ rách chỉ qua triệu chứng."
    ],
    "screeningTests": [
      {
        "name": "Ghi nhận khả năng đi, chạy và triệu chứng",
        "purpose": "Theo dõi chức năng theo kế hoạch điều trị; không yêu cầu chạy thử nếu mới chấn thương."
      },
      {
        "name": "Đo sức mạnh và tầm vận động chuyên môn",
        "purpose": "Hướng dẫn gân kheo dùng đo sức mạnh và độ duỗi gối trong đánh giá tổng thể; phép đo chiều dài đơn lẻ không phân biệt chắc chắn đau thần kinh."
      }
    ],
    "redFlags": [
      "Đau đột ngột kèm tiếng bụp, bầm lan rộng, yếu rõ hoặc đau sát ụ ngồi: ngừng tập và được đánh giá sớm để loại trừ rách/bong điểm bám gân.",
      "Đau và sưng đùi/bắp chân một bên, nhất là sau bất động hoặc phẫu thuật: cần đánh giá khẩn vì có thể huyết khối tĩnh mạch sâu. Nếu kèm khó thở hoặc đau ngực, gọi cấp cứu ngay."
    ],
    "protocols": [
      {
        "avoid": "Trở lại chạy nước rút chỉ dựa vào hết đau khi nghỉ hoặc một số lần bridge",
        "whyAvoid": "Tiến triển cần cân nhắc sức mạnh, đau, chức năng đi/chạy và chương trình đã hoàn thành.",
        "rehabAlternative": "Theo chương trình phục hồi có tăng sức mạnh, co cơ khi kéo dài và tiến triển chạy được chuyên viên lựa chọn.",
        "cuesAndTempo": "Mức tải theo khả năng; không áp mốc trở lại thể thao chung."
      },
      {
        "avoid": "Tự áp phác đồ căng cơ cấp cho đau gân mạn tính hoặc tổn thương bong điểm bám",
        "whyAvoid": "Hướng dẫn căng cơ gân kheo không bao phủ mọi nguyên nhân đau gần ụ ngồi.",
        "rehabAlternative": "Khám để xác định tình trạng trước chương trình tải gân hoặc bài Nordic cường độ cao.",
        "cuesAndTempo": "Bài Nordic có bằng chứng trong chương trình phòng ngừa; không phải mặc định cho mọi giai đoạn chấn thương."
      }
    ],
    "sampleAiPrompt": "Phân biệt giải phẫu cơ hai khớp và đầu ngắn cơ nhị đầu đùi. Giải thích nguyên tắc hướng dẫn căng gân kheo 2022, giới hạn khi áp cho đau gân mạn tính và các tiêu chí cần đánh giá trước tăng tải."
  },
  {
    "id": "knee",
    "name": "Khớp Gối, Khớp Chè–Đùi & Dây chằng",
    "latinName": "Articulatio Genus & Articulatio Patellofemoralis",
    "group": "lower_limb",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Gối gồm khớp đùi–chày và chè–đùi, với dây chằng và sụn chêm góp phần ổn định. Đau gối có nhiều nguyên nhân; không thể mặc định phần lớn bắt nguồn từ háng hoặc cổ chân.",
    "biomechanicsKey": "Đau chè–đùi cần đánh giá và giáo dục kết hợp bài tập gối, có thể thêm bài háng theo nhu cầu. Sau tái tạo ACL, bài chuỗi mở và chuỗi đóng đều có vai trò; liều, biên độ và thời điểm do đội điều trị quyết định.",
    "structures": [
      {
        "name": "Khớp chè–đùi & dây chằng bánh chè",
        "latin": "Articulatio patellofemoralis & Ligamentum patellae",
        "originInsertion": "Bánh chè tiếp khớp với rãnh xương đùi; dây chằng bánh chè nối bánh chè với lồi củ chày.",
        "action": "Tham gia cơ chế duỗi gối qua gân tứ đầu–bánh chè–dây chằng bánh chè."
      },
      {
        "name": "Dây chằng chéo trước & sau",
        "latin": "Ligamentum cruciatum anterius & posterius",
        "originInsertion": "Nối xương đùi và xương chày trong khớp gối.",
        "action": "Hai dây chằng chéo góp phần ổn định và kiểm soát di chuyển trước–sau giữa chày và đùi."
      },
      {
        "name": "Sụn chêm trong & ngoài",
        "latin": "Meniscus medialis & lateralis",
        "originInsertion": "Hai cấu trúc sụn sợi nằm giữa đầu dưới xương đùi và đầu trên xương chày.",
        "action": "Phân bố tải, đệm và góp phần ổn định khớp; không gán một phần trăm hấp thụ lực chung."
      }
    ],
    "commonPathologies": [
      "Đau chè–đùi thường liên quan hoạt động chịu tải khi gối gập; cần phân biệt nguyên nhân khác.",
      "Tổn thương dây chằng/sụn chêm và tình trạng sau mổ cần đánh giá, chỉ định riêng."
    ],
    "painTriggers": [
      "Đau trước gối khi lên/xuống cầu thang hoặc squat có thể gặp trong đau chè–đùi; gối vượt mũi chân không tự là dấu hiệu tổn thương."
    ],
    "screeningTests": [
      {
        "name": "Quan sát bước xuống bục phù hợp khả năng",
        "purpose": "Ghi nhận triệu chứng và chức năng; không chẩn đoán PFPS từ một kiểu chuyển động gối."
      },
      {
        "name": "Hỏi về kẹt gối, sưng và chấn thương",
        "purpose": "Nếu không thể duỗi hoặc chịu lực, cần khám; không tự thực hiện Thessaly/McMurray để xác nhận rách sụn chêm."
      }
    ],
    "redFlags": [
      "Gối khóa không vận động được, không chịu lực được, sưng lớn/biến dạng hoặc mất vững rõ: ngừng tập và được đánh giá khẩn.",
      "Gối nóng đỏ kèm sốt/rét run: cần đánh giá khẩn vì có thể nhiễm trùng."
    ],
    "protocols": [
      {
        "avoid": "Giữ nguyên mức tải/góc gập đang làm đau gối tăng",
        "whyAvoid": "Hướng dẫn đau chè–đùi điều chỉnh nhiệm vụ, tải và tần suất theo mức kích thích.",
        "rehabAlternative": "Bài tập gối kết hợp giáo dục; thêm bài háng khi phù hợp theo đánh giá chuyên môn.",
        "cuesAndTempo": "Tăng dần theo khả năng và chức năng; không ấn định Spanish squat hay một góc an toàn chung."
      },
      {
        "avoid": "Tự đổi chương trình sau mổ ACL theo atlas",
        "whyAvoid": "Giới hạn phụ thuộc phẫu thuật, mô ghép và tổn thương phối hợp.",
        "rehabAlternative": "Tuân thủ đội điều trị; có thể dùng cả bài chuỗi mở và chuỗi đóng khi được chỉ định.",
        "cuesAndTempo": "Theo dõi đau trước gối, sưng và chức năng; không tự chọn thời điểm trở lại chạy/nhảy."
      }
    ],
    "sampleAiPrompt": "Giải thích giải phẫu gối và hướng dẫn đau chè–đùi 2024. Phân biệt với phục hồi ACL sau mổ, nêu vai trò cả bài chuỗi mở/đóng và thông tin cần từ đội điều trị trước thay đổi tập."
  },
  {
    "id": "ankle_foot",
    "name": "Cổ chân, Gân Achilles & Bàn chân",
    "latinName": "Articulatio Talocruralis, Tendo Calcaneus & Pes",
    "group": "lower_limb",
    "views": [
      "anterior",
      "posterior"
    ],
    "summary": "Cổ chân và bàn chân tham gia chịu lực và vận động. Cơ bụng chân và cơ dép truyền lực qua gân Achilles tới xương gót; một giá trị gập mu chân không đủ giải thích mọi thay đổi squat hoặc chẩn đoán bệnh.",
    "biomechanicsKey": "Cơ bụng chân đi qua gối và cổ chân; cơ dép không đi qua gối. Với bệnh gân Achilles đoạn giữa đã được đánh giá, hướng dẫn 2024 ưu tiên tải gân theo khả năng và giáo dục khi không nghi suy yếu cấu trúc gân; không áp trực tiếp cho đứt gân hoặc mọi đau gót.",
    "structures": [
      {
        "name": "Cơ bụng chân & cơ dép",
        "latin": "Gastrocnemius & Soleus",
        "originInsertion": "Cơ bụng chân từ vùng lồi cầu đùi; cơ dép từ mặt sau chày/mác → gân Achilles → xương gót.",
        "action": "Gập lòng bàn chân; cơ bụng chân còn tham gia gập gối."
      },
      {
        "name": "Cơ chày sau",
        "latin": "Tibialis posterior",
        "originInsertion": "Mặt sau chày/mác và màng gian cốt → vùng xương ghe và các điểm bám ở bàn chân.",
        "action": "Gập lòng, nghiêng trong bàn chân và hỗ trợ vòm dọc trong."
      },
      {
        "name": "Cơ chày trước",
        "latin": "Tibialis anterior",
        "originInsertion": "Mặt ngoài xương chày và màng gian cốt → xương chêm trong và nền xương đốt bàn I.",
        "action": "Gập mu và nghiêng trong bàn chân."
      }
    ],
    "commonPathologies": [
      "Bệnh gân Achilles đoạn giữa và tại điểm bám cần được phân biệt.",
      "Đau gót/bàn chân hoặc hạn chế vận động sau chấn thương cần đánh giá nguyên nhân."
    ],
    "painTriggers": [
      "Đau Achilles khi chịu tải và cứng sau nghỉ có thể gặp trong bệnh gân; không xác định chẩn đoán chỉ qua đau sáng sớm."
    ],
    "screeningTests": [
      {
        "name": "Ghi nhận vận động cổ chân chủ động",
        "purpose": "Theo dõi sự thay đổi và triệu chứng; không dùng một mốc khoảng cách knee-to-wall làm chuẩn cho mọi người."
      },
      {
        "name": "Theo dõi nhón gót khi đã được hướng dẫn",
        "purpose": "Đánh giá chức năng cần xét tuổi, khả năng, đau và cách đo; không dùng 25 lần làm chuẩn chẩn đoán hay tự thử khi nghi đứt gân."
      }
    ],
    "redFlags": [
      "Tiếng bụp đột ngột sau cổ chân/gót, sưng đau và khó đi hoặc không nhón gót được: ngừng tập và khám khẩn để loại trừ đứt Achilles; không tự làm Thompson để trì hoãn khám.",
      "Đau khu trú vùng xương bàn chân tăng khi chạy/đi lại, nhất là sau tăng tải: dừng hoạt động gây đau và khám sớm để đánh giá tổn thương xương do stress; không tự nhảy thử để xác nhận."
    ],
    "protocols": [
      {
        "avoid": "Duy trì chạy/nhảy ở mức làm đau Achilles tăng rõ",
        "whyAvoid": "Với bệnh gân đoạn giữa, hoạt động và tải gân cần điều chỉnh trong khả năng; nghỉ hoàn toàn không phải khuyến nghị chung.",
        "rehabAlternative": "Theo chương trình tải gân tiến triển và giáo dục được chuyên viên lựa chọn.",
        "cuesAndTempo": "Liều và tiến triển theo khả năng, triệu chứng và chức năng; đây không phải phác đồ cho đứt gân."
      },
      {
        "avoid": "Áp bài hạ gót sâu cho mọi người đau gót",
        "whyAvoid": "Bệnh gân tại điểm bám, đoạn giữa và các nguyên nhân đau khác có kế hoạch khác nhau.",
        "rehabAlternative": "Khám xác định vị trí và tình trạng; hỏi người điều trị về biên độ calf raise phù hợp.",
        "cuesAndTempo": "Không ép gập mu hoặc tự kéo nắn cổ chân để vượt một mốc đo chung."
      }
    ],
    "sampleAiPrompt": "Giải thích khác biệt cơ bụng chân–cơ dép và phạm vi hướng dẫn Achilles đoạn giữa 2024. Nêu cách theo dõi triệu chứng, giới hạn knee-to-wall và dấu hiệu cần khám khẩn; không tự đặt chẩn đoán từ số đo."
  }
];

/**
 * Kiến thức nền theo vùng, diễn đạt lại tiếng Việt từ nguồn giải phẫu đã ghi
 * trong evidence-anatomy.ts (OpenStax Anatomy and Physiology 2e, CC BY 4.0, đọc
 * lại 2026-10-22; các ý về biên độ vận động cổ/ngực/thắt lưng và dây chằng cổ
 * chân sau còn dựa trên StatPearls, đọc 2026-10-23). sourceRefs là số thứ tự nguồn trong hồ sơ của vùng.
 * Đây là giải phẫu đại thể, không phải đo lường trên mô hình 3D hay chẩn đoán.
 */
export const REGION_FOUNDATIONS: Record<
  AnatomyRegionId,
  { text: string; sourceRefs: number[] }[]
> = {
  cervical: [
    {
      text: "Đốt đội C1 không có thân đốt hay mỏm gai và khớp với lồi cầu xương chẩm; khớp đội–chẩm chủ yếu cho đầu gập và duỗi, còn xoay đầu chủ yếu nhờ khớp đội–trục bên dưới.",
      sourceRefs: [1, 10],
    },
    {
      text: "Đốt trục C2 có mấu răng làm trục xoay; khớp đội–trục cho đầu xoay sang hai bên, như động tác lắc đầu.",
      sourceRefs: [1],
    },
    {
      text: "Mặt khớp đốt cổ phẳng, chủ yếu hướng lên/xuống; đĩa đệm cổ cao tương đối so với thân đốt và bao khớp mặt khớp mỏng, góp phần cho vùng cổ có biên độ vận động lớn.",
      sourceRefs: [1, 10],
    },
  ],
  shoulder: [
    {
      text: "Khớp vai (glenohumeral) là khớp chỏm–ổ giữa chỏm xương cánh tay và ổ chảo xương bả vai; đây là khớp có biên độ vận động lớn nhất cơ thể.",
      sourceRefs: [10],
    },
    {
      text: "Độ linh hoạt đó đổi lấy độ ổn định thấp hơn: bao khớp tương đối lỏng, khớp dựa nhiều vào dây chằng và nhóm cơ chóp xoay để giữ vững.",
      sourceRefs: [10, 12],
    },
    {
      text: "Sụn viền ổ chảo, bao khớp và màng hoạt dịch cùng tham gia cấu trúc khớp hoạt dịch của vai.",
      sourceRefs: [10, 12],
    },
  ],
  thoracic_core: [
    {
      text: "Đốt ngực có diện khớp với đầu xương sườn và củ sườn; lồng ngực gắn vào cột sống ngực nên vùng này vận động ít hơn cổ và thắt lưng.",
      sourceRefs: [1],
    },
    {
      text: "Mỏm gai đốt ngực dài và chúc xuống chồng lên đốt dưới; cùng với hướng của xương sườn, chúng hạn chế đáng kể gập và duỗi ở vùng ngực, còn xoay tương đối được nhiều nhất ở T5–T8.",
      sourceRefs: [1, 11],
    },
    {
      text: "Đường cong ngực là đường cong nguyên phát, lồi ra sau; đường cong cổ và thắt lưng là cong thứ phát, lõm ra sau, hình thành khi trẻ tập giữ đầu, đứng và đi.",
      sourceRefs: [1],
    },
  ],
  lumbar: [
    {
      text: "Thân đốt thắt lưng lớn và dày vì vùng này chịu phần trọng lượng cơ thể lớn nhất trong các vùng đốt sống.",
      sourceRefs: [1],
    },
    {
      text: "Mặt khớp trên của đốt thắt lưng gần thẳng đứng nên cho phép gập, duỗi và nghiêng bên, nhưng hạn chế xoay quanh trục thân.",
      sourceRefs: [11],
    },
    {
      text: "Giữa các thân đốt là đĩa đệm gồm vòng sợi bên ngoài và nhân nhầy dạng gel ở giữa; đĩa vừa đệm vừa cho phép vận động giữa các đốt.",
      sourceRefs: [1],
    },
  ],
  hip_pelvis: [
    {
      text: "Khớp háng là khớp chỏm–ổ đa trục giữa chỏm xương đùi và ổ cối; khớp cần vừa ổn định để đứng và đi, vừa đủ biên độ vận động.",
      sourceRefs: [8],
    },
    {
      text: "Dây chằng quanh khớp háng khỏe và căng khi đứng thẳng, kéo chỏm xương đùi vào ổ cối; vì vậy biên độ háng hẹp hơn vai nhưng ổn định hơn.",
      sourceRefs: [8],
    },
    {
      text: "Vòng chậu nối với cột sống qua khớp cùng–chậu và nối hai bên qua khớp mu; đai chậu vận động rất ít vì phải nâng đỡ và ổn định thân.",
      sourceRefs: [10],
    },
  ],
  thigh_hamstring: [
    {
      text: "Mạc sâu chia đùi thành ba khoang: khoang trong khép đùi tại háng, khoang trước gập đùi và duỗi cẳng chân, khoang sau gập cẳng chân và duỗi đùi.",
      sourceRefs: [1],
    },
    {
      text: "Nhóm tứ đầu gồm bốn cơ dùng chung gân tứ đầu qua bánh chè, tiếp nối thành dây chằng bánh chè bám vào lồi củ chày.",
      sourceRefs: [1],
    },
    {
      text: "Nhóm gân kheo ở mặt sau đùi gồm cơ nhị đầu đùi, cơ bán gân và cơ bán màng; gân của chúng tạo nên hố khoeo sau gối.",
      sourceRefs: [1],
    },
  ],
  knee: [
    {
      text: "Khớp gối gồm ba khớp trong một bao khớp: khớp chè–đùi và hai khớp đùi–chày trong, ngoài.",
      sourceRefs: [6],
    },
    {
      text: "Gối vận động chủ yếu như khớp bản lề cho gập và duỗi, kết hợp lăn và trượt của lồi cầu đùi trên mâm chày; gối gập thì xoay được ít, duỗi thẳng thì không.",
      sourceRefs: [6],
    },
    {
      text: "Khi duỗi hết, xương đùi xoay trong nhẹ so với xương chày để khóa gối ở tư thế ổn định nhất; bắt đầu gập, cơ khoeo xoay ngược lại để mở khóa.",
      sourceRefs: [6],
    },
  ],
  ankle_foot: [
    {
      text: "Khớp sên–cẳng chân (talocrural) giữa xương sên với đầu dưới xương chày và xương mác là khớp bản lề một trục, chỉ cho gập mu và gập lòng bàn chân.",
      sourceRefs: [8],
    },
    {
      text: "Lật trong và lật ngoài bàn chân đến từ khớp dưới sên và các khớp giữa các xương cổ chân, không phải từ khớp sên–cẳng chân.",
      sourceRefs: [8],
    },
    {
      text: "Bên ngoài có ba dây chằng: sên–mác trước (ATFL), sên–mác sau (PTFL) và mác–gót (CFL), cùng chống lật trong quá mức, trong đó ATFL yếu nhất; dây chằng delta bên trong chống lật ngoài quá mức.",
      sourceRefs: [8, 9],
    },
  ],
};

export interface ClientRegionAlert {
  regionId: AnatomyRegionId;
  severity: "caution" | "crimson";
  matchedIssues: OrthopedicIssue[];
  matchedConditions: string[];
}

const REGION_KEYWORDS: Record<AnatomyRegionId, string[]> = {
  cervical: ["cổ", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "vai gáy", "nâng vai", "upper crossed"],
  shoulder: [
    "vai",
    "mỏm cùng",
    "chóp xoay",
    "rotator",
    "supraspinatus",
    "trên gai",
    "impingement",
    "bả vai",
    "scapula",
    "nhị đầu",
  ],
  thoracic_core: ["ngực", "t1", "t12", "sườn", "cơ lõi", "core", "tách cơ bụng", "diastasis"],
  lumbar: [
    "thắt lưng",
    "lưng dưới",
    "l1",
    "l2",
    "l3",
    "l4",
    "l5",
    "s1",
    "đĩa đệm",
    "thoát vị",
    "thần kinh tọa",
    "sciatica",
    "cột sống",
  ],
  hip_pelvis: ["háng", "khung chậu", "mông", "glute", "fai", "ổ cối", "hình lê", "piriformis", "bẹn"],
  thigh_hamstring: ["đùi", "gân kheo", "hamstring", "quad", "tứ đầu", "cơ khép", "adductor", "ụ ngồi"],
  knee: ["gối", "bánh chè", "chè đùi", "pfps", "acl", "pcl", "mcl", "sụn chêm", "meniscus", "chày"],
  ankle_foot: ["cổ chân", "bàn chân", "achilles", "gót", "cân gan chân", "bắp chân", "dorsiflexion"],
};

export function matchClientIssuesToRegions(
  client: Client | null | undefined,
): Record<AnatomyRegionId, ClientRegionAlert | undefined> {
  const result = {} as Record<AnatomyRegionId, ClientRegionAlert | undefined>;
  if (!client) return result;

  const issues = client.orthopedic_issues ?? [];
  const conditions = client.medical_conditions ?? [];

  for (const region of ANATOMY_REGIONS) {
    const keywords = REGION_KEYWORDS[region.id];
    const matchedIssues = issues.filter((iss) => {
      const hay = `${iss.region} ${iss.painTriggers ?? ""} ${iss.notes ?? ""}`.toLowerCase();
      return keywords.some((kw) => hay.includes(kw));
    });
    const matchedConditions = conditions
      .filter((mc) => {
        const hay = `${mc.name} ${mc.notes ?? ""}`.toLowerCase();
        return keywords.some((kw) => hay.includes(kw));
      })
      .map((mc) => mc.name);

    if (matchedIssues.length > 0 || matchedConditions.length > 0) {
      result[region.id] = {
        regionId: region.id,
        // Keyword overlap is a navigation cue, not a measure of clinical urgency.
        severity: "caution",
        matchedIssues,
        matchedConditions,
      };
    }
  }

  return result;
}

export function detectRegionsInText(text: string): AnatomyRegion[] {
  const lower = text.toLowerCase();
  if (!lower.trim()) return [];
  return ANATOMY_REGIONS.filter((region) =>
    REGION_KEYWORDS[region.id].some((kw) => lower.includes(kw)),
  );
}

