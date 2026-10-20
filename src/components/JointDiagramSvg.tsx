"use client";

import { useEffect, useState } from "react";
import type { AnatomyRegionId } from "@/lib/clinical/anatomy-atlas";

interface MedicalPlate {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  sourceCredit: string;
  landmarks: {
    code: string;
    enLabel: string;
    vnLabel: string;
    clinicalNote: string;
  }[];
}

const REGION_PLATES: Record<AnatomyRegionId, MedicalPlate[]> = {
  lumbar: [
    {
      id: "lumbar-herniation",
      title: "Giải phẫu bệnh Thoát vị Đĩa đệm Thắt lưng & Chèn ép Rễ thần kinh (L4–L5 / L5–S1)",
      subtitle:
        "Hình cắt lớp 3D đối chiếu giữa cột sống thắt lưng toàn cảnh và cận cảnh đốt sống – đĩa đệm – rễ thần kinh",
      src: "/anatomy/lumbar-disc-herniation.png",
      sourceCredit: "Blausen Medical Communications — Scientific Medical Atlas (CC BY 3.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Lumbar spine (L1–L5)",
          vnLabel: "Đoạn cột sống thắt lưng L1–L5",
          clinicalNote:
            "Chịu mô-men uốn lớn nhất khi gập thân có tải; cần giữ độ cong sinh lý trung tính (Neutral Lordosis).",
        },
        {
          code: "02",
          enLabel: "Vertebra (Vertebral body)",
          vnLabel: "Thân đốt sống thắt lưng",
          clinicalNote:
            "Chịu 80% tải trọng nén dọc trục (Axial compression) khi đứng và gánh tạ.",
        },
        {
          code: "03",
          enLabel: "Herniated disc (Nucleus pulposus)",
          vnLabel: "Khối thoát vị đĩa đệm (Nhân nhầy lồi ra sau)",
          clinicalNote:
            "Khi gập tròn lưng (Flexion) dưới tải nặng, áp lực phía trước ép nhân nhầy rách qua vòng sợi (Annulus fibrosus) về phía sau – bên.",
        },
        {
          code: "04",
          enLabel: "Pinched nerve (Spinal nerve root)",
          vnLabel: "Rễ thần kinh tủy sống bị chèn ép",
          clinicalNote:
            "Gây đau buốt lan theo đường dây thần kinh tọa xuống mông, mặt sau đùi và bàn chân (Radiculopathy).",
        },
      ],
    },
    {
      id: "lumbar-deep-psoas",
      title: "Giải phẫu Cơ Thắt lưng – Chậu (Iliopsoas) & Cơ Vuông thắt lưng (Quadratus Lumborum)",
      subtitle:
        "Các cơ sâu bám trực tiếp vào thân và mỏm ngang đốt sống thắt lưng L1–L5",
      src: "/anatomy/core-abdomen.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Rice University (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Quadratus lumborum (Hình b)",
          vnLabel: "Cơ vuông thắt lưng (QL)",
          clinicalNote:
            "Nối xương sườn 12 với mào chậu & mỏm ngang L1–L4; giữ ổn định mặt phẳng trán trong bài Side Plank & Suitcase Carry.",
        },
        {
          code: "02",
          enLabel: "Psoas major & Iliacus (Hình b)",
          vnLabel: "Phức hợp Cơ thắt lưng lớn & Cơ chậu (Iliopsoas)",
          clinicalNote:
            "Bám trực tiếp vào thân đốt sống T12–L5; khi co rút do ngồi lâu sẽ kéo cột sống thắt lưng ưỡn quá mức (Anterior Pelvic Tilt).",
        },
        {
          code: "03",
          enLabel: "Transversus abdominis (Hình a)",
          vnLabel: "Cơ ngang bụng (TVA)",
          clinicalNote:
            "Lớp cơ sâu nhất tạo đai áp lực ổ bụng 360° (IAP) làm căng mạc ngực – thắt lưng để giảm tải cho L4–L5.",
        },
      ],
    },
  ],
  shoulder: [
    {
      id: "shoulder-joint-3d",
      title: "Cấu trúc Giải phẫu Cắt dọc Khớp Vai (Glenohumeral Joint & Subacromial Space)",
      subtitle:
        "Thiết đồ cắt đứng ngang qua chỏm xương cánh tay, ổ chảo xương bả vai, mỏm cùng vai và bao khớp",
      src: "/anatomy/shoulder-joint.png",
      sourceCredit: "Blausen Medical Communications — Scientific Medical Atlas (CC BY 3.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Clavicle & Scapula (Acromion)",
          vnLabel: "Xương đòn & Mỏm cùng vai (Trần khoang dưới mỏm cùng)",
          clinicalNote:
            "Khi đẩy qua đầu ở mặt phẳng ngang 90° mà xương bả vai không xoay lên kịp, mỏm cùng vai sẽ cọ xát vào gân cơ trên gai.",
        },
        {
          code: "02",
          enLabel: "Humerus (Humeral head)",
          vnLabel: "Chỏm xương cánh tay",
          clinicalNote:
            "Cần được 4 cơ Chóp xoay (Rotator Cuff) giữ định tâm và kéo trượt xuống dưới khi cơ Delta nâng cánh tay.",
        },
        {
          code: "03",
          enLabel: "Articular cartilage & Joint cavity",
          vnLabel: "Sụn khớp & Ổ khớp hoạt dịch",
          clinicalNote:
            "Ổ chảo rất nông (chỉ tiếp xúc ~1/3 chỏm xương cánh tay), nên khớp vai phụ thuộc lớn vào kiểm soát thần kinh – cơ.",
        },
        {
          code: "04",
          enLabel: "Fibrous joint capsule & Synovial membrane",
          vnLabel: "Bao khớp sợi & Màng hoạt dịch",
          clinicalNote:
            "Bao khớp sau thường bị dày và căng ở người tập Bench Press nhiều, đẩy chỏm xương cánh tay trượt ra trước – lên trên.",
        },
      ],
    },
    {
      id: "shoulder-girdle-muscles",
      title: "Giải phẫu Cơ Đai Vai: Cơ Răng trước (Serratus Anterior), Cơ Thang & Cơ Trám",
      subtitle:
        "Phẫu tích lớp nông và lớp sâu mặt trước – bên và mặt sau đai vai",
      src: "/anatomy/shoulder-muscles.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 11.18 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Serratus anterior (Hình trái)",
          vnLabel: "Cơ răng trước",
          clinicalNote:
            "Bám từ xương sườn 1–9 vào bờ trong mặt trước xương bả vai; cơ chủ đạo giúp xoay xương bả vai lên trên để mở rộng khoảng dưới mỏm cùng vai.",
        },
        {
          code: "02",
          enLabel: "Pectoralis minor & Coracoid process",
          vnLabel: "Cơ ngực bé & Mỏm quạ xương bả vai",
          clinicalNote:
            "Khi cơ ngực bé bị co rút (do ngồi gù lưng), nó kéo mỏm quạ chúi ra trước – xuống dưới (Anterior Tilt), làm hẹp trực tiếp khoang dưới mỏm cùng vai.",
        },
        {
          code: "03",
          enLabel: "Trapezius & Rhomboid major / minor (Hình phải)",
          vnLabel: "Cơ thang (Trên/Giữa/Dưới) & Cơ trám lớn / bé",
          clinicalNote:
            "Tạo cặp lực (Force couple) với cơ răng trước để kiểm soát nhịp bả vai – cánh tay (Scapulohumeral Rhythm 2:1).",
        },
      ],
    },
  ],
  knee: [
    {
      id: "knee-openstax-3view",
      title: "Giải phẫu Đa diện Khớp Gối: Thiết đồ Cắt dọc, Mâm chày & Hệ Dây chằng (ACL/PCL/MCL/LCL)",
      subtitle:
        "(a) Cắt dọc khớp chè – đùi, (b) Nhìn từ trên xuống mâm chày & 2 sụn chêm, (c) Nhìn từ trước",
      src: "/anatomy/knee-joint-openstax.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 9.17 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Patella & Tendon of quadriceps / Patellar ligament",
          vnLabel: "Xương bánh chè, Gân tứ đầu đùi & Dây chằng bánh chè",
          clinicalNote:
            "Đóng vai trò ròng rọc cơ học; góc gập gối càng lớn dưới tải nặng thì vector lực ép xương bánh chè vào xương đùi (PFJ force) càng cao.",
        },
        {
          code: "02",
          enLabel: "Anterior & Posterior cruciate ligament (ACL / PCL)",
          vnLabel: "Dây chằng chéo trước (ACL) & Dây chằng chéo sau (PCL)",
          clinicalNote:
            "ACL ngăn mâm chày trượt ra trước và chống sập xoay gối vào trong (Dynamic Valgus); gân kheo là cơ đồng vận bảo vệ ACL.",
        },
        {
          code: "03",
          enLabel: "Medial & Lateral meniscus (Hình b)",
          vnLabel: "Sụn chêm trong (hình chữ C) & Sụn chêm ngoài (hình chữ O)",
          clinicalNote:
            "Sụn chêm trong ít di động hơn nên dễ rách hơn khi vừa chịu lực nén dọc trục vừa xoay vặn gối đang gập.",
        },
        {
          code: "04",
          enLabel: "Tibial (MCL) & Fibular (LCL) collateral ligament",
          vnLabel: "Dây chằng bên chày (MCL) & Dây chằng bên mác (LCL)",
          clinicalNote:
            "Chống lực vẹo trong (Valgus stress) và vẹo ngoài (Varus stress) trên mặt phẳng trán.",
        },
      ],
    },
    {
      id: "knee-blausen-side",
      title: "Giải phẫu 3D Mặt bên Khớp Gối: Tương quan Cơ Tứ đầu – Gân kheo – Sụn chêm",
      subtitle:
        "Hiển thị trực quan cặp cơ đối vận Quadriceps (trước) và Hamstrings (sau) bám quanh khớp gối",
      src: "/anatomy/knee-joint-side.png",
      sourceCredit: "Blausen Medical Communications — Scientific Medical Atlas (CC BY 3.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Quadriceps & Patella",
          vnLabel: "Cơ tứ đầu đùi & Xương bánh chè",
          clinicalNote:
            "Tạo lực duỗi gối; ở góc duỗi cuối (30°–0°) trong bài chuỗi mở (Leg Extension), lực kéo trượt xương chày ra trước đạt đỉnh.",
        },
        {
          code: "02",
          enLabel: "Hamstrings",
          vnLabel: "Nhóm cơ gân kheo",
          clinicalNote:
            "Đồng co trong các bài chuỗi đóng (Squat, Lunge, Leg Press) để kéo giữ đầu trên xương chày về phía sau, giảm tải cho ACL.",
        },
        {
          code: "03",
          enLabel: "Meniscus (Blue cartilage)",
          vnLabel: "Sụn chêm đệm giữa Lồi cầu đùi & Mâm chày",
          clinicalNote:
            "Phân tán 50–70% tải trọng nén qua khớp gối khi chạy nhảy và gánh tạ.",
        },
      ],
    },
  ],
  cervical: [
    {
      id: "cervical-openstax",
      title: "Giải phẫu Cơ vùng Cổ – Gáy: Lớp nông, Lớp giữa & Lớp sâu cạnh sống (C1–T1)",
      subtitle:
        "Phẫu tích nhìn nghiêng (Lateral view) và nhìn từ phía sau (Superficial & Deep Posterior view)",
      src: "/anatomy/cervical-neck.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 11.11 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Sternocleidomastoid & Scalenes (Hình trên)",
          vnLabel: "Cơ ức – đòn – chũm & Nhóm cơ bậc thang (Scalenes)",
          clinicalNote:
            "Thường bị co rút và hoạt động bù trừ quá mức ở người có tư thế đầu nhô ra trước (Forward Head Posture) hoặc thở ngực nông.",
        },
        {
          code: "02",
          enLabel: "Levator scapulae & Trapezius",
          vnLabel: "Cơ nâng vai & Cơ thang bó trên",
          clinicalNote:
            "Bám từ mỏm ngang C1–C4 xuống góc trên xương bả vai; khi người tập nhún vai (shrug) lúc đẩy/kéo tạ sẽ gây đau mỏi cổ gáy cấp.",
        },
        {
          code: "03",
          enLabel: "Suboccipital, Semispinalis & Multifidus (Hình dưới)",
          vnLabel: "Nhóm cơ dưới chẩm, Cơ bán gai & Cơ nhiều chân cổ",
          clinicalNote:
            "Chứa mật độ thụ thể cảm thụ bản thể (Proprioceptors) dày đặc; bị chèn ép khi ngửa cổ gập gáy nhìn gương lúc Deadlift.",
        },
      ],
    },
  ],
  thoracic_core: [
    {
      id: "core-abdomen-openstax",
      title: "Giải phẫu 4 Lớp Cơ Thành bụng & Hệ thống Ổn định Lõi Sâu (Core Cylinder)",
      subtitle:
        "(a) Các lớp cơ thành bụng trước – bên & Bao cơ thẳng bụng, (b) Các cơ thành bụng sau & cột sống",
      src: "/anatomy/core-abdomen.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 11.12 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Transversus abdominis (TVA)",
          vnLabel: "Cơ ngang bụng (Lớp sâu nhất)",
          clinicalNote:
            "Các thớ cơ chạy ngang vòng quanh bụng như chiếc đai lưng tự nhiên; co trước tiên để tạo áp lực ổ bụng 360° (IAP).",
        },
        {
          code: "02",
          enLabel: "Internal & External oblique",
          vnLabel: "Cơ chéo bụng trong & Cơ chéo bụng ngoài",
          clinicalNote:
            "Các thớ cơ đan chéo vuông góc nhau giúp chống xoay (Anti-rotation), chống nghiêng bên và kéo hạ khung sườn (Ribcage Stack).",
        },
        {
          code: "03",
          enLabel: "Rectus abdominis & Linea alba",
          vnLabel: "Cơ thẳng bụng & Đường trắng giữa (Linea alba)",
          clinicalNote:
            "Đường trắng giữa là nơi dễ bị giãn tách ở phụ nữ sau sinh (Diastasis Recti) — cần tránh Crunch/Sit-up gây phồng đỉnh bụng.",
        },
        {
          code: "04",
          enLabel: "Serratus anterior & Latissimus dorsi",
          vnLabel: "Cơ răng trước & Cơ lưng rộng (Xô)",
          clinicalNote:
            "Kết nối đai vai với lồng ngực và mạc ngực – thắt lưng để truyền lực từ thân dưới lên tay.",
        },
      ],
    },
  ],
  hip_pelvis: [
    {
      id: "hip-gluteal-openstax",
      title: "Giải phẫu Cơ Vùng Chậu – Hông & Nhóm Cơ Xoay ngoài Sâu (Deep 6 Rotators)",
      subtitle:
        "Phẫu tích mặt trước nông, mặt trước sâu (nhóm cơ khép) và mặt sau mông – đùi",
      src: "/anatomy/hip-gluteal.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 11.22 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Gluteus maximus, medius & minimus (Hình dưới phải)",
          vnLabel: "Cơ mông lớn, Cơ mông nhỡ & Cơ mông bé",
          clinicalNote:
            "Cơ mông nhỡ & mông bé giữ khung chậu cân bằng trên mặt phẳng trán khi đứng 1 chân; yếu cơ này gây sập gối (Dynamic Knee Valgus).",
        },
        {
          code: "02",
          enLabel: "Piriformis & Deep lateral rotators",
          vnLabel: "Cơ hình lê (Piriformis) & Nhóm 6 cơ xoay ngoài sâu",
          clinicalNote:
            "Dây thần kinh tọa chạy ngay dưới (hoặc xuyên qua) cơ hình lê; co thắt cơ này gây đau giả thần kinh tọa vùng giữa mông.",
        },
        {
          code: "03",
          enLabel: "Psoas major, Iliacus & Tensor fasciae latae (TFL)",
          vnLabel: "Cơ thắt lưng – chậu & Cơ căng mạc đùi (TFL)",
          clinicalNote:
            "Khi cơ mông nhỡ yếu, học viên thường dùng TFL bù trừ khi dạng háng/Squat, gây căng dải chậu chày (IT Band) và xoay trong đùi.",
        },
      ],
    },
    {
      id: "hip-joint-3d",
      title: "Giải phẫu Khớp Háng (Chỏm xương đùi – Ổ cối) & Khung chậu – Cột sống Cùng",
      subtitle:
        "Cấu trúc xương ổ cối (Acetabulum), chỏm xương đùi (Femoral head) và khớp cùng – chậu (SI Joint)",
      src: "/anatomy/hip-joint.png",
      sourceCredit: "Blausen Medical Communications — Scientific Medical Atlas (CC BY 3.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Acetabulum & Ball (Femoral head)",
          vnLabel: "Ổ cối xương chậu & Chỏm xương đùi",
          clinicalNote:
            "Độ sâu ổ cối và góc cổ xương đùi quyết định độ rộng chân tối ưu khi Squat; ép Squat chân hẹp ở người có FAI gây cấn bờ trước ổ cối.",
        },
        {
          code: "02",
          enLabel: "Sacrum, Ilium & Pubis",
          vnLabel: "Xương cùng, Xương cánh chậu & Xương mu",
          clinicalNote:
            "Tạo vòng chậu vững chắc truyền tải lực giữa cột sống thắt lưng và hai chân.",
        },
      ],
    },
  ],
  thigh_hamstring: [
    {
      id: "thigh-dissection-openstax",
      title: "Giải phẫu Cơ Đùi Trước (Quadriceps), Đùi Trong (Adductors) & Đùi Sau (Hamstrings)",
      subtitle:
        "Phẫu tích hoàn chỉnh 3 khoang cơ vùng đùi: Khoang trước, Khoang trong và Khoang sau",
      src: "/anatomy/hip-gluteal.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 11.22 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Rectus femoris, Vastus lateralis & Vastus medialis (Hình trên)",
          vnLabel: "Cơ thẳng đùi, Cơ rộng ngoài & Cơ rộng trong (VMO)",
          clinicalNote:
            "Riêng cơ thẳng đùi (Rectus femoris) vượt qua cả khớp háng lẫn khớp gối; VMO giữ xương bánh chè trượt đúng rãnh.",
        },
        {
          code: "02",
          enLabel: "Adductor brevis, longus, magnus & Gracilis (Hình dưới trái)",
          vnLabel: "Cơ khép ngắn, khép dài, khép lớn & Cơ thon",
          clinicalNote:
            "Cơ khép lớn (Adductor magnus) có bó sau bám vào ụ ngồi, hoạt động như một cơ duỗi háng cực mạnh ở đáy Squat sâu.",
        },
        {
          code: "03",
          enLabel: "Biceps femoris, Semitendinosus & Semimembranosus (Hình dưới phải)",
          vnLabel: "Cơ nhị đầu đùi, Cơ bán gân & Cơ bán màng (Gân kheo)",
          clinicalNote:
            "Đều bám nguyên ủy vào ụ ngồi (Ischial tuberosity); vừa duỗi háng vừa gập gối và chịu tải tâm trương lớn khi chạy/RDLs.",
        },
      ],
    },
  ],
  ankle_foot: [
    {
      id: "ankle-ligaments-openstax",
      title: "Giải phẫu Khớp Cổ chân, Khớp Dưới sên & Hệ thống Dây chằng Trong / Ngoài",
      subtitle:
        "(Trên) Nhìn từ mặt trong cổ chân (Medial view), (Dưới) Nhìn từ mặt ngoài cổ chân (Lateral view)",
      src: "/anatomy/ankle-foot-joints.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 9.19 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Anterior talofibular (ATFL) & Calcaneofibular ligament (Hình dưới)",
          vnLabel: "Dây chằng sên – mác trước (ATFL) & Dây chằng mác – gót (CFL)",
          clinicalNote:
            "ATFL là dây chằng bị tổn thương trong >80% các ca lật sơ mi cổ chân (Inversion sprain); sau chấn thương thường để lại hạn chế gập mu chân (Dorsiflexion).",
        },
        {
          code: "02",
          enLabel: "Deltoid ligament & Medial malleolus (Hình trên)",
          vnLabel: "Phức hợp dây chằng Delta & Mắt cá trong xương chày",
          clinicalNote:
            "Giữ vững mặt trong cổ chân và ngăn bàn chân sập vòm quá mức (Overpronation).",
        },
        {
          code: "03",
          enLabel: "Subtalar joint & Talus",
          vnLabel: "Khớp dưới sên & Xương sên (Talus)",
          clinicalNote:
            "Khi gập mu chân (Squat), xương sên phải trượt ra sau trong gọng kìm chày – mác; nếu xương sên bị kẹt trước, người tập sẽ bị nhấc gót hoặc sập gối.",
        },
      ],
    },
    {
      id: "achilles-pathology-3d",
      title: "Giải phẫu Phức hợp Bắp chân – Gân Achilles & Vị trí Tổn thương Điển hình",
      subtitle:
        "Hình minh họa 3D cơ bụng chân, cơ dép, gân gót (Achilles) bám vào xương gót và vùng nghèo mạch máu",
      src: "/anatomy/achilles-tendon.png",
      sourceCredit: "Blausen Medical Communications — Scientific Medical Atlas (CC BY 3.0)",
      landmarks: [
        {
          code: "01",
          enLabel: "Gastrocnemius & Soleus muscles",
          vnLabel: "Cơ bụng chân (2 đầu) & Cơ dép (Soleus)",
          clinicalNote:
            "Cơ bụng chân đi qua cả khớp gối và cổ chân (tập khi thẳng gối); cơ dép chỉ đi qua cổ chân (chịu tải chính khi gối gập trong lúc Squat và chạy).",
        },
        {
          code: "02",
          enLabel: "Achilles tendon watershed zone (2–6 cm above calcaneus)",
          vnLabel: "Vùng giữa gân Achilles (cách xương gót 2–6 cm)",
          clinicalNote:
            "Vùng nghèo mạch máu nuôi dưỡng nhất nên dễ bị viêm thoái hóa gân (Mid-portion tendinopathy) hoặc đứt gân khi bật nhảy đột ngột.",
        },
        {
          code: "03",
          enLabel: "Calcaneus insertion",
          vnLabel: "Điểm bám tận gân Achilles vào xương gót",
          clinicalNote:
            "Nếu đau ngay điểm bám vào xương gót (Insertional tendinopathy), tuyệt đối tránh hạ gót sâu dưới bậc thềm (Deficit Calf Raise).",
        },
      ],
    },
  ],
};

export function JointDiagramSvg({ regionId }: { regionId: AnatomyRegionId }) {
  const plates = REGION_PLATES[regionId] ?? REGION_PLATES.lumbar;
  const [plateIdx, setPlateIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!zoomOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomOpen]);

  const activePlate = plates[plateIdx] ?? plates[0];

  return (
    <div className="overflow-hidden rounded-lg border border-rule bg-sheet shadow-2xs">
      {/* Top Bar: Title + Plate Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule bg-surface/60 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cobalt px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              HÌNH MINH HỌA CÓ NGUỒN
            </span>
            <span className="text-[11px] font-medium text-slate">
              {activePlate.sourceCredit}
            </span>
          </div>
          <h3 className="mt-1 font-display text-sm font-bold text-ink">
            {activePlate.title}
          </h3>
        </div>

        {plates.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {plates.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlateIdx(idx)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  idx === plateIdx
                    ? "bg-cobalt text-white"
                    : "border border-rule bg-sheet text-slate hover:text-ink"
                }`}
              >
                Hình {idx + 1}/{plates.length}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: High-Res Medical Illustration + Annotated Vietnamese Landmark Guide */}
      <div className="grid gap-4 p-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col justify-between rounded-md border border-rule bg-white p-3">
          <div className="relative flex items-center justify-center overflow-hidden rounded bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePlate.src}
              alt={activePlate.title}
              className="max-h-[410px] w-auto max-w-full cursor-zoom-in object-contain"
              onClick={() => setZoomOpen(true)}
            />
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-rule pt-2 text-[11px] text-slate">
            <span>{activePlate.subtitle}</span>
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="shrink-0 font-semibold text-cobalt hover:underline"
            >
              Phóng to hình giải phẫu
            </button>
          </div>
        </div>

        {/* Right side: Vietnamese – English/Latin Landmark Key & Clinical Biomechanics */}
        <div className="space-y-2.5">
          <p className="font-display text-xs font-bold uppercase tracking-wide text-slate">
            Chú giải Thuật ngữ trên Hình & Ứng dụng Lâm sàng PT
          </p>
          <div className="space-y-2">
            {activePlate.landmarks.map((lm) => (
              <div
                key={lm.code}
                className="rounded-md border border-rule bg-canvas/60 p-3 text-xs transition-colors hover:border-cobalt/50"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-cobalt font-mono text-[11px] font-bold text-white">
                    {lm.code}
                  </span>
                  <div className="space-y-1">
                    <div>
                      <span className="font-display font-bold text-ink">
                        {lm.vnLabel}
                      </span>
                      <span className="ml-1.5 rounded bg-cobalt-soft px-1.5 py-0.5 font-mono text-[11px] font-medium text-cobalt">
                        {lm.enLabel}
                      </span>
                    </div>
                    <p className="leading-5 text-slate">{lm.clinicalNote}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal when PT clicks to zoom */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-xs"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="max-h-[92dvh] max-w-5xl overflow-auto rounded-lg border border-rule bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4 border-b border-rule pb-2">
              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  {activePlate.title}
                </h4>
                <p className="text-xs text-slate">{activePlate.sourceCredit}</p>
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white"
              >
                Đóng (ESC)
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePlate.src}
              alt={activePlate.title}
              className="mx-auto max-h-[78dvh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
