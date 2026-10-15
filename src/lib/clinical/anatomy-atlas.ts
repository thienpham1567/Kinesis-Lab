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

export const ANATOMY_REGIONS: AnatomyRegion[] = [
  {
    id: "cervical",
    name: "Cột sống Cổ & Đai vai trên",
    latinName: "Columna Cervicalis (C1–C7) & Cingulum Pectorale",
    group: "spine_core",
    views: ["anterior", "posterior"],
    summary:
      "Chịu trách nhiệm nâng đỡ sọ não và định vị tầm nhìn. Khi đầu nhô ra trước (Forward Head Posture) mỗi 2.5cm, mô-men xoắn lên đốt sống cổ dưới (C5–C7) tăng gấp đôi.",
    biomechanicsKey:
      "Cân bằng cặp lực giữa nhóm Gập cổ sâu (Deep Neck Flexors) phía trước và nhóm Duỗi cổ / Cơ thang trên (Upper Trapezius, Levator Scapulae) phía sau.",
    structures: [
      {
        name: "Nhóm cơ gập cổ sâu",
        latin: "Longus colli & Longus capitis",
        originInsertion: "Mặt trước thân đốt sống C1–T3 → Nền xương chẩm & củ trước đốt sống cổ",
        action: "Gập nhẹ đốt sống cổ trên (Chin tuck), giữ ổn định từng đốt sống cổ khi mang tải",
      },
      {
        name: "Cơ nâng vai",
        latin: "Levator scapulae",
        originInsertion: "Mỏm ngang C1–C4 → Góc trên trong xương bả vai",
        action: "Nâng xương bả vai và xoay xuống dưới; dễ co rút khi rụt vai đẩy tạ",
      },
      {
        name: "Cơ thang bó trên",
        latin: "Trapezius (Pars descendens)",
        originInsertion: "Ụ chẩm ngoài, dây chằng gáy → 1/3 ngoài xương đòn",
        action: "Nâng và xoay lên xương bả vai; thường hoạt động quá mức khi yếu cơ răng trước",
      },
    ],
    commonPathologies: [
      "Hội chứng chéo trên (Upper Crossed Syndrome)",
      "Thoát vị / lồi đĩa đệm cổ C5–C6, C6–C7",
      "Căng cơ nâng vai cấp tính khi gồng cổ lúc tập Overhead / Pull-up",
    ],
    painTriggers: [
      "Ngửa cổ nhìn gương khi Deadlift hoặc Squat",
      "Rụt vai (shrug) không kiểm soát khi kéo xô hoặc đẩy vai",
      "Đưa cằm ra trước (poking chin) ở những rep cuối khi mỏi",
    ],
    screeningTests: [
      {
        name: "Craniocervical Flexion Test (Chin Tuck)",
        purpose: "Đánh giá sức bền nhóm cơ gập cổ sâu thay vì dùng cơ ức đòn chũm bù trừ",
      },
      {
        name: "Spurling Sign (Tham khảo y khoa)",
        purpose: "Nếu nghiêng đầu + ép nhẹ gây tê buốt lan xuống cánh tay → nghi ngờ chèn ép rễ thần kinh cổ",
      },
    ],
    redFlags: [
      "Đau cổ kèm tê rần hoặc yếu lực nắm bàn tay, teo cơ mô cái",
      "Chóng mặt, hoa mắt, buồn nôn khi xoay hoặc ngửa cổ (nghi ngờ thiếu máu động mạch đốt sống)",
    ],
    protocols: [
      {
        avoid: "Behind-the-Neck Lat Pulldown / Behind-the-Neck Press",
        whyAvoid: "Ép cột sống cổ gập cực đại ra trước kết hợp xoay ngoài vai cuối biên độ.",
        rehabAlternative: "Front Chest-Supported Row + Chin-Tuck Isometric với dây kháng lực",
        cuesAndTempo: "Giữ trục tai – mỏm cùng vai thẳng hàng; Tempo 3-2-1-1, RPE 6–7",
      },
      {
        avoid: "Heavy Barbell Shrug khi đang co cứng cơ nâng vai",
        whyAvoid: "Tăng lực kéo cắt lên mỏm ngang C1–C4 qua cơ nâng vai.",
        rehabAlternative: "Scapular Upward Rotation (Y-Raise trên ghế nghiêng 30°)",
        cuesAndTempo: "Hạ sườn, vươn xương bả vai mượt mà không nhún cổ; Tempo 2-2-2-0",
      },
    ],
    sampleAiPrompt:
      "Phân tích cơ sinh học hội chứng Upper Crossed Syndrome ở học viên văn phòng đau mỏi cổ vai gáy: cách kích hoạt Deep Neck Flexors, Lower Trapezius và chỉnh kỹ thuật khi tập kéo/đẩy thân trên.",
  },
  {
    id: "shoulder",
    name: "Khớp Vai, Mỏm cùng vai & Chóp xoay",
    latinName: "Articulatio Humeri & Subacromial Space",
    group: "upper_limb",
    views: ["anterior", "posterior"],
    summary:
      "Khớp linh hoạt nhất cơ thể nhưng đánh đổi bằng độ vững cơ học. Để nâng tay qua đầu không bị kẹt gân dưới mỏm cùng vai, xương cánh tay và xương bả vai phải phối hợp theo nhịp 2:1 (Scapulohumeral Rhythm).",
    biomechanicsKey:
      "Khi cơ Delta kéo chỏm xương cánh tay lên trên, 4 cơ Chóp xoay (SITS) phải nén và trượt chỏm xuống dưới, đồng thời Cơ răng trước + Cơ thang dưới xoay xương bả vai lên trên để mở rộng khoảng dưới mỏm cùng vai (8–12mm).",
    structures: [
      {
        name: "Cơ trên gai (thuộc Chóp xoay)",
        latin: "Supraspinatus",
        originInsertion: "Hố trên gai xương bả vai → Diện trên củ lớn xương cánh tay (đi dưới mỏm cùng vai)",
        action: "Khởi phát dạng vai 0–30° và giữ chỏm xương cánh tay nằm trong ổ chảo",
      },
      {
        name: "Cơ dưới gai & Cơ tròn bé",
        latin: "Infraspinatus & Teres minor",
        originInsertion: "Hố dưới gai / Bờ ngoài xương bả vai → Củ lớn xương cánh tay",
        action: "Xoay ngoài khớp vai và kéo trượt chỏm xương cánh tay xuống dưới khi đưa tay qua đầu",
      },
      {
        name: "Cơ răng trước",
        latin: "Serratus anterior",
        originInsertion: "Xương sườn 1–9 → Bờ trong mặt trước xương bả vai",
        action: "Vươn (protraction), xoay lên trên và ép sát xương bả vai vào lồng ngực (chống Winged Scapula)",
      },
    ],
    commonPathologies: [
      "Hội chứng chèn ép dưới mỏm cùng vai (Subacromial Impingement)",
      "Viêm gân cơ trên gai / đầu dài gân cơ nhị đầu",
      "Rối loạn vận động xương bả vai (Scapular Dyskinesis)",
    ],
    painTriggers: [
      "Cung đau 70°–120° (Painful Arc) khi dạng ngang hoặc đẩy tạ qua đầu mặt phẳng trán",
      "Đẩy ngực (Bench Press) khuỷu tay mở ngang 90° kèm trượt chỏm xương cánh tay ra trước",
      "Upright Row tay cầm hẹp (dạng vai kèm xoay trong tối đa)",
    ],
    screeningTests: [
      {
        name: "Painful Arc Sign (60°–120°)",
        purpose: "Đau nhói khi nâng tay từ 60° đến 120° và giảm khi qua 120° → gợi ý chèn ép khoảng dưới mỏm cùng vai",
      },
      {
        name: "Wall Slide / Scapular Assistance Observation",
        purpose: "Kiểm tra xem xương bả vai có xoay lên mượt mà hay bị nhô bờ trong (winging)",
      },
    ],
    redFlags: [
      "Đau vai dữ dội về đêm không nằm nghiêng được kèm mất hoàn toàn khả năng chủ động nâng tay (Drop Arm — nghi ngờ đứt toàn bộ chóp xoay)",
      "Đau vai trái lan xuống mặt trong cánh tay kèm tức ngực, vã mồ hôi khi gắng sức (nghi ngờ tim mạch)",
    ],
    protocols: [
      {
        avoid: "Strict Barbell Overhead Press (mặt phẳng trán) hoặc Upright Row",
        whyAvoid: "Thu hẹp tối đa khoảng dưới mỏm cùng vai khi xương bả vai chưa đủ góc xoay lên.",
        rehabAlternative: "Half-Kneeling Single-Arm Landmine Press (góc mặt phẳng bả vai 30°)",
        cuesAndTempo: "Hướng khuỷu tay 30–45° trước thân, vươn nhẹ bả vai ở đỉnh; Tempo 3-1-1-1",
      },
      {
        avoid: "Flat Barbell Bench Press xuống chạm sâu ngực khi đang viêm đầu dài nhị đầu",
        whyAvoid: "Duỗi vai quá mức ở đáy làm tăng lực trượt trước (anterior shear) lên chỏm xương cánh tay.",
        rehabAlternative: "Neutral-Grip Floor Press hoặc Dumbbell Press góc 15° kết hợp Cable External Rotation",
        cuesAndTempo: "Giữ cẳng tay vuông góc mặt đất, dừng cách ngực 3–5cm nếu đau; RPE 7",
      },
    ],
    sampleAiPrompt:
      "Học viên bị hội chứng chèn ép dưới mỏm cùng vai phải (đau ở cung 70-110 độ). Giải thích cơ chế cặp lực Rotator Cuff - Serratus Anterior và lên chuỗi bài tập 4 tuần từ Isometric đến Landmine Press.",
  },
  {
    id: "thoracic_core",
    name: "Cột sống Ngực, Lồng ngực & Hộp Cơ Lõi",
    latinName: "Columna Thoracica (T1–T12) & Cylindrus Abdominis",
    group: "spine_core",
    views: ["anterior", "posterior"],
    summary:
      "Cột sống ngực cần độ linh hoạt (duỗi & xoay) trong khi cột sống thắt lưng cần độ ổn định. Hộp cơ lõi hoạt động như một xi-lanh áp suất thủy tĩnh (IAP) bảo vệ cột sống khi nâng nặng.",
    biomechanicsKey:
      "Áp lực ổ bụng (Intra-Abdominal Pressure) được tạo bởi sự đồng co của 4 mặt: Cơ hoành (trên), Sàn chậu (dưới), Cơ ngang bụng TVA & Cơ chéo bụng (xung quanh), và Cơ nhiều chân Multifidus (sau).",
    structures: [
      {
        name: "Cơ ngang bụng",
        latin: "Transversus abdominis (TVA)",
        originInsertion: "Mào chậu, mạc ngực-thắt lưng, sụn sườn 7–12 → Đường trắng giữa (Linea alba)",
        action: "Đai siết tự nhiên làm căng mạc ngực – thắt lưng và tăng áp lực ổ bụng trước khi tay chân cử động",
      },
      {
        name: "Cơ hoành",
        latin: "Diaphragma",
        originInsertion: "Mỏm mũi kiếm, xương sườn 7–12, đốt sống L1–L3 → Trung tâm gân cơ hoành",
        action: "Hô hấp chính và hạ xuống tạo áp lực ổ bụng (360° Bracing) ổn định cột sống",
      },
      {
        name: "Cơ chéo bụng trong & ngoài",
        latin: "Obliquus internus & externus abdominis",
        originInsertion: "Xương sườn dưới ↔ Mào chậu & dây chằng bẹn",
        action: "Chống xoay (Anti-rotation), chống nghiêng bên và giữ khung sườn xếp chồng lên khung chậu (Ribcage-Pelvis Stack)",
      },
    ],
    commonPathologies: [
      "Gù cột sống ngực tư thế (Thoracic Kyphosis) gây hạn chế đưa tay qua đầu",
      "Mất kiểm soát áp lực ổ bụng (ưỡn sườn - Rib Flare) làm quá tải thắt lưng",
      "Tách cơ thẳng bụng sau sinh (Diastasis Recti)",
    ],
    painTriggers: [
      "Ưỡn lồng ngực (Rib flare) để ăn gian biên độ khi đẩy vai qua đầu",
      "Nín thở Valsalva quá lâu ở người có tăng huyết áp",
      "Gập bụng (Sit-up / Crunch) tốc độ nhanh gây phồng đường trắng giữa ở người tách cơ bụng",
    ],
    screeningTests: [
      {
        name: "Seated Thoracic Rotation & Back-to-Wall Shoulder Flexion",
        purpose: "Kiểm tra xem học viên có đủ 45° xoay ngực và duỗi ngực mà không ưỡn thắt lưng bù trừ",
      },
      {
        name: "360° Diaphragmatic Bracing Check",
        purpose: "Đặt tay hai bên hông dưới xương sườn để kiểm tra khả năng giãn nở 360 độ khi hít thở gồng core",
      },
    ],
    redFlags: [
      "Đau thắt ngang ngực hoặc đau xuyên ra sau lưng kèm khó thở, vã mồ hôi khi tập",
      "Khối phồng bất thường vùng bẹn hoặc rốn đau nhói khi gồng bụng (nghi ngờ thoát vị thành bụng/bẹn)",
    ],
    protocols: [
      {
        avoid: "Sit-ups / Russian Twists biên độ lớn có tạ",
        whyAvoid: "Kết hợp gập và xoay cột sống lặp lại nhiều lần dưới tải nén.",
        rehabAlternative: "Dead Bug (Hạ sườn thở ra) + Pallof Press (Anti-rotation)",
        cuesAndTempo: "Thở ra kéo xương sườn dưới hướng về khung chậu; giữ 3 giây ở điểm xa nhất",
      },
      {
        avoid: "Ép duỗi lưng dưới khi cột sống ngực bị cứng",
        whyAvoid: "Chuyển toàn bộ mô-men uốn vào bản lề L4–L5.",
        rehabAlternative: "Thoracic Open-Book + Foam Roller Thoracic Extension trước buổi tập thân trên",
        cuesAndTempo: "Giữ cố định hai gối, xoay mở lồng ngực theo nhịp thở ra 5 giây",
      },
    ],
    sampleAiPrompt:
      "Giải thích cơ chế Ribcage-Pelvis Stack (xếp chồng lồng ngực - khung chậu) và cách hướng dẫn học viên hít thở 360 độ tạo IAP bảo vệ cột sống mà không gây tăng huyết áp đột ngột.",
  },
  {
    id: "lumbar",
    name: "Cột sống Thắt lưng – Cùng (L1–S1)",
    latinName: "Columna Lumbalis (L1–L5) & Discus Intervertebralis",
    group: "spine_core",
    views: ["posterior", "anterior"],
    summary:
      "Đoạn L4–L5 và L5–S1 chịu tải trọng nén và lực trượt trước – sau (Anteroposterior Shear Force) lớn nhất cơ thể. Khi cột sống thắt lưng gập tròn dưới tải nặng, nhân nhầy đĩa đệm bị ép dịch chuyển về phía sau – ngoài (nơi có rễ thần kinh tọa).",
    biomechanicsKey:
      "Giữ cột sống ở vùng trung tính (Neutral Zone) giúp các thớ sợi vòng (Annulus Fibrosus) và mấu khớp (Facet Joints) chia sẻ lực nén dọc trục đồng đều, giảm tới 50–70% lực cắt ngang lên L4–L5.",
    structures: [
      {
        name: "Đĩa đệm gian đốt sống L4–L5 & L5–S1",
        latin: "Discus intervertebralis",
        originInsertion: "Gồm Nhân nhầy (Nucleus pulposus) ở giữa và Vòng sợi collagen (Annulus fibrosus) bao quanh",
        action: "Phân tán lực nén thủy tĩnh; yếu nhất khi chịu tổ hợp Gập + Xoay dưới tải (Loaded Flexion-Rotation)",
      },
      {
        name: "Cơ nhiều chân thắt lưng",
        latin: "Multifidus lumborum",
        originInsertion: "Xương cùng, mào chậu, mỏm ngang → Mỏm gai các đốt sống trên từ 2–4 tầng",
        action: "Kiểm soát vi chuyển động và chống trượt từng đốt sống thắt lưng; dễ bị ức chế thần kinh sau cơn đau lưng cấp",
      },
      {
        name: "Cơ vuông thắt lưng",
        latin: "Quadratus lumborum (QL)",
        originInsertion: "Mào chậu → Xương sườn 12 & mỏm ngang L1–L4",
        action: "Giữ ổn định mặt phẳng trán (chống sập hông bên đối diện); được rèn tối ưu bằng bài Side Plank & Suitcase Carry",
      },
    ],
    commonPathologies: [
      "Thoát vị / lồi đĩa đệm L4–L5, L5–S1 (trung tâm hoặc sau – bên)",
      "Đau lưng cơ học nhạy cảm với gập (Flexion-Intolerant Low Back Pain)",
      "Hội chứng mấu khớp hoặc trượt đốt sống độ 1 (Spondylolisthesis — nhạy cảm với ưỡn quá mức)",
    ],
    painTriggers: [
      "Gập lưng dưới có tải (Butt wink ở đáy Squat sâu hoặc tròn lưng khi kéo Deadlift từ sàn)",
      "Ngồi lâu trên 45 phút sau đó đứng dậy cúi nhặt tạ ngay (hiệu ứng ngậm nước đĩa đệm)",
      "Ưỡn lưng dưới quá mức (Hyperextension) khi đẩy tạ qua đầu hoặc Hip Thrust quá biên độ",
    ],
    screeningTests: [
      {
        name: "Hip Hinge Dowel Rod Screen (Cây gậy 3 điểm chạm)",
        purpose: "Kiểm tra khả năng gập thuần tại khớp háng trong khi giữ Chẩm – Ngực – Xương cùng chạm gậy",
      },
      {
        name: "Slump / Straight Leg Raise (Tham khảo y khoa)",
        purpose: "Nếu nâng chân thẳng gây đau buốt như điện giật lan qua gối xuống bàn chân → dấu hiệu kích thích rễ thần kinh tọa",
      },
    ],
    redFlags: [
      "Hội chứng Chùm đuôi ngựa (Cauda Equina): Tê vùng yên ngựa (bẹn/hậu môn), bí tiểu hoặc mất tự chủ đại tiểu tiện → CẤP CỨU Y KHOA NGAY",
      "Yếu liệt tiến triển bàn chân (Foot drop — không đi bằng gót hoặc mũi chân được)",
      "Đau lưng dữ dội về đêm kèm sụt cân không rõ nguyên nhân hoặc sốt",
    ],
    protocols: [
      {
        avoid: "Conventional Barbell Deadlift từ sàn hoặc Low-bar Back Squat vượt quá độ sâu gập háng (Butt wink)",
        whyAvoid: "Tăng cánh tay đòn từ thanh đòn tới L4–L5 và buộc đốt sống thắt lưng gập cuối biên độ dưới tải nén lớn.",
        rehabAlternative: "High-Handle Trap-Bar Deadlift + Bulgarian Split Squat + McGill Big 3 (Bird-Dog, Side Plank, Curl-up)",
        cuesAndTempo: "Trọng tâm đi xuyên qua giữa bàn chân, gập háng giữ cột sống trung tính; Tempo 3-1-1-1, RPE 6.5–7.5",
      },
      {
        avoid: "Leg Press hạ quá sâu làm xương cùng cuộn nhấc khỏi đệm ghế",
        whyAvoid: "Tạo mô-men gập cưỡng bức lên đĩa đệm L4–L5 và L5–S1 dù người tập tưởng đang được tựa lưng.",
        rehabAlternative: "Goblet Box Squat chạm ghế ở góc không cuộn chậu + Suitcase Carry một bên",
        cuesAndTempo: "Dừng đúng độ cao giữ nguyên độ cong sinh lý thắt lưng; nghỉ 90–120s giữa hiệp",
      },
    ],
    sampleAiPrompt:
      "Học viên thoát vị đĩa đệm L4-L5 đã qua giai đoạn cấp: hãy so sánh mô-men xoắn lên L4-L5 giữa Barbell Back Squat, Conventional Deadlift và High-Handle Trap-Bar Deadlift, kèm chương trình Rehab 3 giai đoạn.",
  },
  {
    id: "hip_pelvis",
    name: "Khớp Háng, Khung chậu & Cơ Mông",
    latinName: "Articulatio Coxae, Pelvis & Regio Glutealis",
    group: "lower_limb",
    views: ["posterior", "anterior"],
    summary:
      "Khớp chỏm – ổ cối truyền lực giữa thân dưới và cột sống. Khi khớp háng bị thiếu độ linh hoạt hoặc cơ mông nhỡ (Gluteus Medius) yếu, toàn bộ lực xoay và gập dư thừa sẽ dồn lên cột sống thắt lưng và khớp gối.",
    biomechanicsKey:
      "Trong pha đứng một chân (Single-leg Stance), cơ Mông nhỡ phải tạo lực gấp 2 lần trọng lượng cơ thể để giữ khung chậu không bị sập sang bên đối diện (dấu hiệu Trendelenburg) và ngăn xương đùi xoay trong gây sập gối (Dynamic Knee Valgus).",
    structures: [
      {
        name: "Cơ mông lớn",
        latin: "Gluteus maximus",
        originInsertion: "Mặt sau xương cánh chậu, xương cùng, dây chằng cùng-ụ ngồi → Dải chậu chày (ITB) & lồi củ cơ mông xương đùi",
        action: "Duỗi háng mạnh nhất, xoay ngoài đùi và kiểm soát nghiêng sau khung chậu",
      },
      {
        name: "Cơ mông nhỡ & Mông bé",
        latin: "Gluteus medius & minimus",
        originInsertion: "Mặt ngoài xương cánh chậu → Mấu chuyển lớn xương đùi",
        action: "Dạng háng và giữ thăng bằng khung chậu trên mặt phẳng trán khi bước đi, chạy hoặc Split Squat",
      },
      {
        name: "Cơ thắt lưng – chậu",
        latin: "Iliopsoas (Psoas major + Iliacus)",
        originInsertion: "Thân & mỏm ngang T12–L5, hố chậu → Mấu chuyển bé xương đùi",
        action: "Gập háng chính; khi co rút do ngồi nhiều sẽ kéo cột sống thắt lưng ưỡn trước (Anterior Pelvic Tilt)",
      },
    ],
    commonPathologies: [
      "Hội chứng chèn ép khớp háng (Femoroacetabular Impingement — FAI)",
      "Viêm gân cơ mông nhỡ / đau mặt ngoài mấu chuyển lớn (GTPS)",
      "Hội chứng cơ hình lê (Piriformis Syndrome) chèn ép dây thần kinh tọa ngoài cột sống",
    ],
    painTriggers: [
      "Đau nhói vùng bẹn trước (Pinching sensation) khi Squat sâu quá 90° với hai chân khép hẹp",
      "Sập gối vào trong (Knee valgus) và lệch hông khi tập Lunge hoặc bước lên bục",
      "Đau sâu giữa mông lan xuống mặt sau đùi khi ngồi ghế cứng lâu",
    ],
    screeningTests: [
      {
        name: "Single-Leg Squat & Trendelenburg Screen",
        purpose: "Quan sát xem gai chậu trước trên có bị tụt xuống hoặc gối sập vào trong khi đứng/squat 1 chân",
      },
      {
        name: "Thomas Test (Đánh giá độ căng Iliopsoas & Rectus Femoris)",
        purpose: "Kiểm tra xem cơ gập háng có bị co rút gây ưỡn lưng bù trừ khi duỗi háng",
      },
    ],
    redFlags: [
      "Đau khớp háng vùng bẹn không chịu được lực tỳ đè sau ngã hoặc ở người lớn tuổi / dùng Corticoid kéo dài (nghi ngờ hoại tử chỏm xương đùi hoặc gãy cổ xương đùi)",
    ],
    protocols: [
      {
        avoid: "Narrow-Stance Ass-to-Grass Squat khi học viên có cấu trúc ổ cối sâu hoặc FAI",
        whyAvoid: "Cổ xương đùi va chạm sớm vào bờ trước trên ổ cối gây tổn thương sụn viền (Labrum).",
        rehabAlternative: "Box Squat mở góc mũi chân 15–30° vừa biên độ + Romanian Deadlift (Hip Hinge)",
        cuesAndTempo: "Tìm độ rộng chân và góc xoay mũi chân không gây cấn bẹn trước; Tempo 3-1-1-0",
      },
      {
        avoid: "Chạy nhảy Plyometrics cường độ cao khi chưa kiểm soát được trục Hông – Gối – Cổ chân",
        whyAvoid: "Làm quá tải dải chậu chày (IT Band) và khớp chè – đùi.",
        rehabAlternative: "Wall-Press Single-Leg RDL + Lateral Band Monster Walk + Step-Down kiểm soát",
        cuesAndTempo: "Giữ tâm xương bánh chè thẳng hàng ngón chân thứ 2; Tempo chậm 3 giây pha hạ",
      },
    ],
    sampleAiPrompt:
      "Học viên bị đau cấn mặt trước khớp háng (nghi ngờ FAI nhẹ) khi Squat sâu và yếu cơ mông nhỡ gây sập gối. Hãy hướng dẫn cách chọn Stance Width và thiết kế chuỗi bài tập kích hoạt Glute Medius.",
  },
  {
    id: "thigh_hamstring",
    name: "Cơ Đùi trước & Chuỗi sau (Hamstrings / Adductors)",
    latinName: "Regio Femoralis Anterior & Posterior",
    group: "lower_limb",
    views: ["anterior", "posterior"],
    summary:
      "Cơ Tứ đầu đùi (Quadriceps) và Gân kheo (Hamstrings) tạo thành cặp đối vận kiểm soát khớp gối và khớp háng. 3/4 cơ gân kheo và cơ thẳng đùi (Rectus Femoris) là cơ đa khớp (Bi-articular), chịu lực căng lớn nhất khi kéo giãn đồng thời ở cả 2 khớp.",
    biomechanicsKey:
      "Gân kheo vừa duỗi háng vừa gập gối, đồng thời đóng vai trò là 'dây chằng động' kéo mâm chày ra sau để bảo vệ dây chằng chéo trước (ACL) không bị trượt trước.",
    structures: [
      {
        name: "Nhóm cơ Tứ đầu đùi",
        latin: "Rectus femoris, Vastus lateralis, Vastus medialis (VMO), Vastus intermedius",
        originInsertion: "Gai chậu trước dưới (Rectus femoris) & thân xương đùi → Xương bánh chè → Lồi củ chày",
        action: "Duỗi gối toàn bộ; riêng Vastus Medialis Obliquus (VMO) giữ xương bánh chè không trượt lệch ra ngoài",
      },
      {
        name: "Nhóm cơ Gân kheo",
        latin: "Biceps femoris, Semitendinosus, Semimembranosus",
        originInsertion: "Ụ ngồi (Ischial tuberosity) → Đầu xương mác & mặt trong đầu trên xương chày",
        action: "Duỗi háng (khi gối duỗi) và gập gối; hãm tốc tâm trương (Eccentric) khi chạy nước rút",
      },
      {
        name: "Nhóm cơ Khép đùi",
        latin: "Adductor magnus, longus, brevis & Gracilis",
        originInsertion: "Xương mu & ngành ngồi-mu → Đường ráp xương đùi (Linea aspera)",
        action: "Khép đùi và hỗ trợ mạnh mẽ cho duỗi háng ở đáy Squat sâu (đặc biệt là Adductor Magnus)",
      },
    ],
    commonPathologies: [
      "Căng / rách điểm bám cao gân kheo (Proximal Hamstring Tendinopathy tại ụ ngồi)",
      "Mất cân bằng lực Quad : Hamstring làm tăng nguy cơ chấn thương gối",
      "Căng cơ khép háng (Groin strain) khi đổi hướng đột ngột hoặc mở rộng chân quá nhanh",
    ],
    painTriggers: [
      "Đau sâu ngay nếp lằn mông (ụ ngồi) khi kéo giãn gân kheo kết hợp gập háng sâu (như Good Morning / ngồi ghế lâu)",
      "Giật gân kheo khi tăng tốc chạy mà chưa khởi động pha tâm trương (Eccentric)",
    ],
    screeningTests: [
      {
        name: "Active Knee Extension (90/90 Hamstring Length Test)",
        purpose: "Phân biệt độ linh hoạt thực sự của gân kheo với cảm giác căng dây thần kinh tọa",
      },
      {
        name: "Single-Leg Hamstring Bridge Endurance",
        purpose: "Kiểm tra sức bền chuỗi sau độc lập từng chân (mục tiêu >20 lần kiểm soát tốt)",
      },
    ],
    redFlags: [
      "Tiếng 'bụp' lớn mặt sau đùi kèm vết bầm tím lan rộng và lõm cơ sờ thấy được (nghi ngờ đứt gân kheo độ 3)",
      "Sưng nóng đỏ đau bắp đùi/bắp chân một bên sau chấn thương hoặc bất động lâu (nghi ngờ huyết khối tĩnh mạch sâu — DVT)",
    ],
    protocols: [
      {
        avoid: "Static Stretching kéo giãn gân kheo cuối biên độ khi đang viêm điểm bám cao tại ụ ngồi",
        whyAvoid: "Khi gập háng sâu, gân kheo bị ép chặt (Compression) vào ụ ngồi làm nặng thêm bệnh lý gân.",
        rehabAlternative: "Isometric Supine Hamstring Bridge góc háng trung tính → Romanian Deadlift giới hạn biên độ",
        cuesAndTempo: "Giữ isometric 30–45 giây x 4 hiệp để giảm đau gân (Analgesic effect) trước khi tăng tải",
      },
      {
        avoid: "Chỉ tập Leg Extension mà bỏ qua chuỗi sau",
        whyAvoid: "Làm tăng lực kéo trượt xương chày ra trước mà thiếu lực đối kháng từ Hamstrings.",
        rehabAlternative: "Nordic Hamstring Curl (hỗ trợ dây kháng lực) + Copenhagen Adductor Plank",
        cuesAndTempo: "Hạ chậm pha tâm trương 4 giây, giữ hông thẳng hàng với gối",
      },
    ],
    sampleAiPrompt:
      "Học viên bị viêm điểm bám cao gân kheo (đau ở ụ ngồi khi ngồi lâu và khi cúi sâu). Tại sao kéo giãn tĩnh lại làm đau hơn và cần lên phác đồ Isometric -> Heavy Slow Resistance như thế nào?",
  },
  {
    id: "knee",
    name: "Khớp Gối, Khớp Chè – Đùi & Dây chằng",
    latinName: "Articulatio Genus, Patellofemoral & Ligamenta Cruciata",
    group: "lower_limb",
    views: ["anterior", "posterior"],
    summary:
      "Khớp gối là khớp bản lề biến đổi nằm kẹp giữa hai đòn bẩy dài nhất cơ thể (xương đùi và xương chày). Đa số các ca đau gối không do chấn thương trực tiếp tại phòng tập đều bắt nguồn từ kiểm soát kém ở Khớp Háng (trên) hoặc cứng Cổ chân (dưới).",
    biomechanicsKey:
      "Lực phản hồi lên khớp chè – đùi (PFJ Reaction Force) phụ thuộc vào tích số giữa Lực căng cơ Tứ đầu đùi và Góc gập gối: trong bài chuỗi đóng (Squat), lực nén PFJ tăng mạnh từ 60°–90°; trong bài chuỗi mở (Leg Extension), lực trượt ACL cao nhất ở góc duỗi cuối 30°–0°.",
    structures: [
      {
        name: "Khớp Chè – Đùi & Gân bánh chè",
        latin: "Articulatio patellofemoralis & Ligamentum patellae",
        originInsertion: "Mặt sau xương bánh chè trượt trên rãnh ròng rọc xương đùi → bám vào lồi củ xương chày",
        action: "Ròng rọc cơ học giúp tăng cánh tay đòn của cơ Tứ đầu đùi thêm ~30%",
      },
      {
        name: "Dây chằng chéo trước & chéo sau",
        latin: "Ligamentum cruciatum anterius (ACL) & posterius (PCL)",
        originInsertion: "Lồi cầu xương đùi ↔ Vùng gian lồi cầu mâm chày",
        action: "ACL ngăn xương chày trượt ra trước và chống xoay trong quá mức; PCL ngăn xương chày trượt ra sau",
      },
      {
        name: "Sụn chêm trong & ngoài",
        latin: "Meniscus medialis & lateralis",
        originInsertion: "Hai vòng sụn sợi hình bán nguyệt nằm trên mâm chày",
        action: "Hấp thụ 50–70% xung lực nén và tăng diện tích tiếp xúc khớp đùi – chày",
      },
    ],
    commonPathologies: [
      "Hội chứng đau khớp chè – đùi (Patellofemoral Pain Syndrome — PFPS / Đau mặt trước gối)",
      "Viêm gân bánh chè (Patellar Tendinopathy / Jumper's Knee)",
      "Phục hồi sau tái tạo dây chằng chéo trước (ACL) hoặc tổn thương sụn chêm",
    ],
    painTriggers: [
      "Đau mặt trước gối khi đi xuống cầu thang, đứng dậy từ ghế thấp hoặc đẩy gối vượt mũi chân quá sớm dưới tải nặng",
      "Đau nhói khe khớp kèm tiếng lạo xạo/kẹt khớp khi xoay vặn trên chân trụ đang gập",
    ],
    screeningTests: [
      {
        name: "Forward Step-Down Test (Bước xuống bục 15–20cm)",
        purpose: "Đánh giá đau chè – đùi, độ lệch trục gối (Valgus) và khả năng hãm tâm trương của cơ Tứ đầu đùi",
      },
      {
        name: "Thessaly / McMurray History Check",
        purpose: "Nếu có tiền sử kẹt cứng khớp (Locking) không duỗi thẳng được → nghi ngờ rách sụn chêm cơ học",
      },
    ],
    redFlags: [
      "Kẹt khớp cơ học thực sự (True Locking — gối bị khóa cứng không thể tự duỗi thẳng)",
      "Tràn dịch khớp gối sưng to nhanh chóng trong vòng vài giờ sau chấn thương kèm cảm giác sụp gối (Giving way)",
    ],
    protocols: [
      {
        avoid: "Deep Sissy Squat / Jumping Lunges khi đang đau cấp khớp chè – đùi (PFPS)",
        whyAvoid: "Tạo mô-men gập gối cực đại làm ép xương bánh chè vào rãnh xương đùi với lực gấp 5–7 lần trọng lượng cơ thể.",
        rehabAlternative: "Spanish Squat Isometric (45s) + Box Squat ống chân gần thẳng đứng + Hip Thrust",
        cuesAndTempo: "Đẩy hông ra sau nhiều hơn (Hip-dominant) ở giai đoạn đầu để giảm tải PFJ, sau đó tăng dần góc gập gối theo dung nạp",
      },
      {
        avoid: "Open-Chain Knee Extension từ 30° đến 0° với tạ nặng ở giai đoạn sớm sau mổ ACL",
        whyAvoid: "Cơ tứ đầu kéo xương chày trượt ra trước mạnh nhất ở 30° cuối mà không có lực đồng co của gân kheo.",
        rehabAlternative: "Closed-Chain Mini Squat / Leg Press góc an toàn (0°–60°) + Terminal Knee Extension (TKE) với dây band",
        cuesAndTempo: "Kiểm soát đồng co Quad – Hamstring; Tempo 3-2-1-1",
      },
    ],
    sampleAiPrompt:
      "Học viên đau mặt trước khớp gối trái khi xuống cầu thang (hội chứng chè – đùi PFPS). Giải thích cách điều chỉnh tỷ lệ mô-men Khớp Gối vs Khớp Háng trong bài Squat/Split Squat để vẫn tập chân hiệu quả mà không đau gối.",
  },
  {
    id: "ankle_foot",
    name: "Cổ chân, Gân Achilles & Vòm bàn chân",
    latinName: "Articulatio Talocruralis, Tendo Calcaneus & Planta Pedis",
    group: "lower_limb",
    views: ["anterior", "posterior"],
    summary:
      "Điểm tiếp xúc duy nhất giữa cơ thể và mặt sàn. Khi biên độ gập mu chân (Ankle Dorsiflexion) bị hạn chế (<35°), xương chày không thể tiến về trước khi Squat, buộc bàn chân phải sập vòm (Overpronation), gối sập vào trong và thắt lưng phải gập bù trừ.",
    biomechanicsKey:
      "Phức hợp Bắp chân – Gân Achilles (Gastrocnemius, Soleus) hoạt động như chiếc lò xo đàn hồi lớn nhất cơ thể; riêng cơ Dép (Soleus) chịu tải cao nhất khi gối gập (Bent-knee Calf Raise & Squat).",
    structures: [
      {
        name: "Cơ bụng chân & Cơ dép (Tam đầu cẳng chân)",
        latin: "Gastrocnemius & Soleus (Triceps surae)",
        originInsertion: "Lồi cầu xương đùi (Gastrocnemius) & mặt sau xương chày/mác (Soleus) → Gân Achilles → Xương gót",
        action: "Gập lòng bàn chân (Plantarflexion) và hãm tốc xương chày tiến về trước khi Squat/tiếp đất",
      },
      {
        name: "Cơ chày sau",
        latin: "Tibialis posterior",
        originInsertion: "Mặt sau xương chày, xương mác & màng gian cốt → Xương ghe và các xương cổ chân",
        action: "Nâng đỡ vòm dọc trong bàn chân (chống bàn chân bẹt chức năng và chống sập cổ chân vào trong)",
      },
      {
        name: "Cơ chày trước",
        latin: "Tibialis anterior",
        originInsertion: "Mặt ngoài xương chày → Xương chêm trong & nền xương đốt bàn 1",
        action: "Gập mu bàn chân (Dorsiflexion) và kiểm soát hạ bàn chân êm ái khi bước đi/chạy",
      },
    ],
    commonPathologies: [
      "Hạn chế biên độ gập mu chân (Ankle Dorsiflexion Restriction) sau bong gân cổ chân cũ",
      "Viêm gân Achilles (Mid-portion hoặc Insertional Achilles Tendinopathy)",
      "Viêm cân gan chân (Plantar Fasciitis) & Sập vòm bàn chân (Pes Planus chức năng)",
    ],
    painTriggers: [
      "Nhấc gót chân hoặc đổ người ra trước quá mức khi Squat xuống sâu",
      "Đau cứng gân Achilles hoặc gót chân vào những bước đầu tiên buổi sáng",
      "Bật nhảy dây / Box Jump liên tục khi gân Achilles chưa đủ sức bền tải nặng",
    ],
    screeningTests: [
      {
        name: "Knee-to-Wall Test (Weight-Bearing Lunge Test)",
        purpose: "Đặt mũi chân cách tường 10–12cm, đẩy gối chạm tường không nhấc gót để đo độ linh hoạt Dorsiflexion",
      },
      {
        name: "Single-Leg Heel Raise Capacity",
        purpose: "Kiểm tra sức bền phức hợp Gastrocnemius–Soleus (chuẩn khỏe mạnh: 25 lần hết biên độ)",
      },
    ],
    redFlags: [
      "Nghe tiếng nổ 'bốp' ở gót chân như bị ai đá vào sau cổ chân kèm mất khả năng nhón gót (Test Thompson dương tính — Đứt gân Achilles)",
      "Đau nhói trên xương bàn chân tăng dần ở người tăng khối lượng chạy bộ đột ngột (nghi ngờ gãy xương mỏi — Stress Fracture)",
    ],
    protocols: [
      {
        avoid: "Ép Squat chân phẳng trên sàn khi học viên bị cứng khớp cổ chân (kẹt xương sên)",
        whyAvoid: "Buộc bàn chân xoay ngoài, sập vòm trong và tạo mô-men xoắn vặn lên khớp gối.",
        rehabAlternative: "Heel-Elevated Goblet Squat (Kê gót 1.5–2cm) + Banded Ankle Joint Mobilization",
        cuesAndTempo: "Giữ 3 điểm chạm bàn chân (Tripod Foot: gốc ngón cái, gốc ngón út, giữa gót)",
      },
      {
        avoid: "Hạ gót sâu dưới bậc thềm (Deficit Calf Raise) khi bị viêm điểm bám gân Achilles vào xương gót",
        whyAvoid: "Ép mặt trước gân Achilles vào bờ trên xương gót (Insertional compression).",
        rehabAlternative: "Flat-Ground Heavy Slow Calf Raise ( cả thẳng gối cho Gastroc & gập gối cho Soleus)",
        cuesAndTempo: "Chỉ hạ ngang mặt sàn phẳng; Tempo 3 giây lên – giữ 2 giây – 3 giây xuống",
      },
    ],
    sampleAiPrompt:
      "Học viên có tiền sử lật sơ mi cổ chân phải, hiện tại bài Knee-to-Wall chỉ đạt 5cm làm gối phải sập vào trong khi Squat. Hãy lên quy trình cải thiện Dorsiflexion và điều chỉnh bài tập thân dưới.",
  },
];

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
  ankle_foot: ["cổ chân", "bàn chân", "achilles", "gót", "cân gan chân", "bắp chân", "sơ mi", "dorsiflexion"],
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
        severity: matchedIssues.length > 0 && matchedConditions.length > 0 ? "crimson" : "caution",
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

