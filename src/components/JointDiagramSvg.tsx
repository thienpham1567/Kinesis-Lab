"use client";

import { useEffect, useState } from "react";
import type { AnatomyRegionId } from "@/lib/clinical/anatomy-atlas";
import { ANATOMY_REGION_EVIDENCE } from "@/lib/clinical/evidence-anatomy";

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
    /** One-based sources in the region evidence record, attached to this note. */
    sourceRefs: number[];
  }[];
}

// Notes restate gross anatomy and the claim limits in the region evidence records
// (evidence-anatomy.ts). Unsourced percentages, causal chains and fixed rules were removed.
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
          sourceRefs: [1, 4],
          enLabel: "Lumbar spine (L1–L5)",
          vnLabel: "Đoạn cột sống thắt lưng L1–L5",
          clinicalNote:
            "Năm đốt sống thắt lưng và các đĩa đệm vừa chịu tải vừa cho phép vận động. Quan sát tư thế gập lưng trong một động tác không xác định được thoát vị hay mức tổn thương.",
        },
        {
          code: "02",
          sourceRefs: [1],
          enLabel: "Vertebra (Vertebral body)",
          vnLabel: "Thân đốt sống thắt lưng",
          clinicalNote:
            "Thân đốt sống là phần phía trước của mỗi đốt và đỡ trọng lượng cơ thể; thân đốt thắt lưng lớn và dày nhất cột sống.",
        },
        {
          code: "03",
          sourceRefs: [1, 10],
          enLabel: "Herniated disc (Nucleus pulposus)",
          vnLabel: "Thoát vị đĩa đệm (hình minh họa)",
          clinicalNote:
            "Đĩa đệm gồm vòng sợi bên ngoài và nhân nhầy bên trong. Vật liệu đĩa đệm thoát qua vùng vòng sợi tổn thương có thể ảnh hưởng rễ thần kinh; hình minh họa không cho biết tình trạng của người đang xem.",
        },
        {
          code: "04",
          sourceRefs: [5, 10],
          enLabel: "Pinched nerve (Spinal nerve root)",
          vnLabel: "Rễ thần kinh tủy sống bị chèn ép",
          clinicalNote:
            "Có thể gây đau lan, tê hoặc yếu theo vùng rễ chi phối, ví dụ đau thần kinh tọa xuống mông và chân. Cần khám thần kinh; tê vùng yên ngựa hoặc rối loạn tiểu tiện/đại tiện mới xuất hiện cần đi cấp cứu.",
        },
      ],
    },
    {
      id: "lumbar-deep-psoas",
      title: "Giải phẫu Cơ Thắt lưng – Chậu (Iliopsoas) & Cơ Vuông thắt lưng (Quadratus Lumborum)",
      subtitle:
        "Các cơ sâu liên quan cột sống thắt lưng: cơ thắt lưng lớn, cơ chậu, cơ vuông thắt lưng và cơ ngang bụng",
      src: "/anatomy/core-abdomen.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Rice University (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          sourceRefs: [3],
          enLabel: "Quadratus lumborum (Hình b)",
          vnLabel: "Cơ vuông thắt lưng (QL)",
          clinicalNote:
            "Nối mào chậu với xương sườn 12 và mỏm ngang các đốt thắt lưng; nghiêng thân và cố định xương sườn 12 khi hô hấp.",
        },
        {
          code: "02",
          sourceRefs: [6, 7],
          enLabel: "Psoas major & Iliacus (Hình b)",
          vnLabel: "Phức hợp Cơ thắt lưng lớn & Cơ chậu (Iliopsoas)",
          clinicalNote:
            "Cơ thắt lưng lớn bám từ thân đốt T12–L5 và mỏm ngang thắt lưng; cơ chậu từ hố chậu. Cả hai bám tận vùng mấu chuyển bé và gập háng. Không suy ra co rút cơ từ thời gian ngồi hoặc hình dạng khung chậu.",
        },
        {
          code: "03",
          sourceRefs: [8, 9],
          enLabel: "Transversus abdominis (Hình a)",
          vnLabel: "Cơ ngang bụng (TVA)",
          clinicalNote:
            "Lớp sâu nhất trong ba lớp cơ thành bụng bên, thớ cơ chạy ngang; hỗ trợ thành bụng, thở ra gắng sức và tăng áp lực ổ bụng. Không đo được mức giảm tải cho một tầng đĩa đệm từ cách gồng bụng.",
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
          sourceRefs: [10, 7],
          enLabel: "Clavicle & Scapula (Acromion)",
          vnLabel: "Xương đòn & Mỏm cùng vai (Trần khoang dưới mỏm cùng)",
          clinicalNote:
            "Mỏm cùng vai tiếp khớp với xương đòn tạo khớp cùng – đòn và nằm phía trên gân cơ trên gai. Vị trí cung đau khi nâng tay không đủ xác định mô tổn thương.",
        },
        {
          code: "02",
          sourceRefs: [10],
          enLabel: "Humerus (Humeral head)",
          vnLabel: "Chỏm xương cánh tay",
          clinicalNote:
            "Bốn cơ chóp xoay (trên gai, dưới gai, tròn bé, dưới vai) bám quanh chỏm xương cánh tay, tham gia vận động và giữ chỏm trong ổ chảo; mỗi cơ có hướng kéo riêng.",
        },
        {
          code: "03",
          sourceRefs: [10],
          enLabel: "Articular cartilage & Joint cavity",
          vnLabel: "Sụn khớp & Ổ khớp hoạt dịch",
          clinicalNote:
            "Chỏm xương cánh tay tiếp khớp với ổ chảo tương đối nông. Sụn viền, bao khớp, dây chằng và các cơ quanh vai cùng góp phần giữ vững khớp.",
        },
        {
          code: "04",
          sourceRefs: [12],
          enLabel: "Fibrous joint capsule & Synovial membrane",
          vnLabel: "Bao khớp sợi & Màng hoạt dịch",
          clinicalNote:
            "Bao khớp sợi bao quanh khớp, mặt trong lót màng hoạt dịch tiết dịch bôi trơn. Độ căng bao khớp ở từng người cần được khám, không suy ra từ loại bài tập.",
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
          sourceRefs: [4],
          enLabel: "Serratus anterior (Hình trái)",
          vnLabel: "Cơ răng trước",
          clinicalNote:
            "Bám từ các xương sườn trên vào mặt sườn bờ trong xương bả vai; vươn và xoay lên xương bả vai.",
        },
        {
          code: "02",
          sourceRefs: [11],
          enLabel: "Pectoralis minor & Coracoid process",
          vnLabel: "Cơ ngực bé & Mỏm quạ xương bả vai",
          clinicalNote:
            "Cơ ngực bé nối các xương sườn trên với mỏm quạ, tham gia kéo bả vai ra trước – xuống. Số thứ tự sườn bám có biến thể; không suy ra cơ ngắn hoặc nguồn đau từ tư thế vai.",
        },
        {
          code: "03",
          sourceRefs: [11, 5],
          enLabel: "Trapezius & Rhomboid major / minor (Hình phải)",
          vnLabel: "Cơ thang (Trên/Giữa/Dưới) & Cơ trám lớn / bé",
          clinicalNote:
            "Các bó cơ thang cùng cơ răng trước tham gia xoay lên xương bả vai; cơ trám kéo bả vai về phía cột sống. Nhịp vai – bả vai thay đổi theo người và giai đoạn nâng tay; tỉ lệ 2:1 chỉ là trung bình mô tả, không phải chuẩn chẩn đoán.",
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
          sourceRefs: [2, 3, 6],
          enLabel: "Patella & Tendon of quadriceps / Patellar ligament",
          vnLabel: "Xương bánh chè, Gân tứ đầu đùi & Dây chằng bánh chè",
          clinicalNote:
            "Gân tứ đầu – bánh chè – dây chằng bánh chè truyền lực duỗi gối tới lồi củ chày. Đau trước gối khi gập gối chịu tải cần được đánh giá; không có một góc gập an toàn chung.",
        },
        {
          code: "02",
          sourceRefs: [1, 6],
          enLabel: "Anterior & Posterior cruciate ligament (ACL / PCL)",
          vnLabel: "Dây chằng chéo trước (ACL) & Dây chằng chéo sau (PCL)",
          clinicalNote:
            "Hai dây chằng chéo nằm trong bao khớp, bắt chéo và góp phần kiểm soát vận động trước – sau: ACL hạn chế chày trượt ra trước so với đùi; PCL hạn chế chày trượt ra sau.",
        },
        {
          code: "03",
          sourceRefs: [6],
          enLabel: "Medial & Lateral meniscus (Hình b)",
          vnLabel: "Sụn chêm trong & Sụn chêm ngoài (hình chữ C)",
          clinicalNote:
            "Hai đĩa sụn sợi bám vào mâm chày, nằm giữa lồi cầu xương đùi và mâm chày; đệm và lấp khoảng trống giữa hai mặt khớp. Sụn chêm trong ít di động hơn vì dính vào bao khớp và dây chằng bên chày.",
        },
        {
          code: "04",
          sourceRefs: [6],
          enLabel: "Tibial (MCL) & Fibular (LCL) collateral ligament",
          vnLabel: "Dây chằng bên chày (MCL) & Dây chằng bên mác (LCL)",
          clinicalNote:
            "MCL ở mặt trong và LCL ở mặt ngoài góp phần hạn chế mở khớp sang bên. Mặt sâu MCL liên kết với bao khớp và sụn chêm trong; không coi hai dây chằng có cùng quan hệ với bao khớp.",
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
          sourceRefs: [2, 4],
          enLabel: "Quadriceps & Patella",
          vnLabel: "Cơ tứ đầu đùi & Xương bánh chè",
          clinicalNote:
            "Cơ tứ đầu duỗi gối qua bánh chè; cơ thẳng đùi còn đi qua khớp háng. Sau tái tạo ACL, bài chuỗi mở và chuỗi đóng đều có vai trò; biên độ, tải và thời điểm do đội điều trị quyết định.",
        },
        {
          code: "02",
          sourceRefs: [7],
          enLabel: "Hamstrings",
          vnLabel: "Nhóm cơ gân kheo",
          clinicalNote:
            "Nằm ở mặt sau đùi và gập gối; các phần đi qua khớp háng còn duỗi háng.",
        },
        {
          code: "03",
          sourceRefs: [1, 6],
          enLabel: "Meniscus (Blue cartilage)",
          vnLabel: "Sụn chêm đệm giữa Lồi cầu đùi & Mâm chày",
          clinicalNote:
            "Góp phần phân bố tải, đệm và ổn định khớp gối; không gán một tỉ lệ phần trăm hấp thụ lực chung cho mọi hoạt động.",
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
          sourceRefs: [9],
          enLabel: "Sternocleidomastoid & Scalenes (Hình trên)",
          vnLabel: "Cơ ức – đòn – chũm & Nhóm cơ bậc thang (Scalenes)",
          clinicalNote:
            "Nằm ở mặt bên cổ, tham gia gập, nghiêng và xoay cổ; cơ bậc thang bám vào xương sườn 1–2 và có thể hỗ trợ hít vào gắng sức. Tư thế đầu nhô ra trước không đủ để kết luận cơ co rút hay hoạt động bù trừ.",
        },
        {
          code: "02",
          sourceRefs: [4, 5],
          enLabel: "Levator scapulae & Trapezius",
          vnLabel: "Cơ nâng vai & Cơ thang bó trên",
          clinicalNote:
            "Cơ nâng vai đi từ mỏm ngang C1–C4 tới phần trên bờ trong xương bả vai và nâng xương bả vai; bó trên cơ thang đi từ xương chẩm – dây chằng gáy tới xương đòn. Đau cổ khi tập cần được ghi nhận và đánh giá, không quy cho một cơ từ một động tác.",
        },
        {
          code: "03",
          sourceRefs: [9],
          enLabel: "Suboccipital, Semispinalis & Multifidus (Hình dưới)",
          vnLabel: "Nhóm cơ dưới chẩm, Cơ bán gai & Cơ nhiều chân cổ",
          clinicalNote:
            "Các nhóm cơ sau cổ có điểm bám khác nhau trên sọ và cột sống; tham gia vận động đầu – cổ. Đây là mô tả nhóm cơ, không phải bảng điểm bám chi tiết từng cơ dưới chẩm hoặc từng bó cơ nhiều chân.",
        },
      ],
    },
  ],
  thoracic_core: [
    {
      id: "core-abdomen-openstax",
      title: "Giải phẫu Các Nhóm Cơ Thành bụng & Thành bụng sau",
      subtitle:
        "(a) Các lớp cơ thành bụng trước – bên & Bao cơ thẳng bụng, (b) Các cơ thành bụng sau & cột sống",
      src: "/anatomy/core-abdomen.jpg",
      sourceCredit: "OpenStax Anatomy & Physiology — Fig 11.12 (CC BY 4.0)",
      landmarks: [
        {
          code: "01",
          sourceRefs: [2, 9],
          enLabel: "Transversus abdominis (TVA)",
          vnLabel: "Cơ ngang bụng (Lớp sâu của thành bụng bên)",
          clinicalNote:
            "Thớ cơ chạy ngang quanh thành bụng; hỗ trợ thành bụng, thở ra gắng sức và tăng áp lực ổ bụng. Một kiểu gồng bụng không chứng minh cột sống được bảo vệ khỏi chấn thương.",
        },
        {
          code: "02",
          sourceRefs: [4, 5, 9],
          enLabel: "Internal & External oblique",
          vnLabel: "Cơ chéo bụng trong & Cơ chéo bụng ngoài",
          clinicalNote:
            "Cơ chéo ngoài là lớp nông, cơ chéo trong là lớp giữa của thành bụng bên; tham gia xoay và nghiêng thân, hỗ trợ thành bụng và thở ra gắng sức.",
        },
        {
          code: "03",
          sourceRefs: [8, 9],
          enLabel: "Rectus abdominis & Linea alba",
          vnLabel: "Cơ thẳng bụng & Đường trắng giữa (Linea alba)",
          clinicalNote:
            "Cơ thẳng bụng chạy dọc hai bên đường trắng giữa và gập thân. Tách cơ thẳng bụng sau sinh cần đánh giá lâm sàng; chưa đủ bằng chứng để cấm mặc định crunch/sit-up hay chọn một phác đồ tập duy nhất.",
        },
        {
          code: "04",
          sourceRefs: [10],
          enLabel: "Serratus anterior & Latissimus dorsi",
          vnLabel: "Cơ răng trước & Cơ lưng rộng (Xô)",
          clinicalNote:
            "Cơ răng trước nối các xương sườn với xương bả vai; cơ lưng rộng nối cột sống ngực – thắt lưng, mạc ngực – thắt lưng và mào chậu với xương cánh tay.",
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
          sourceRefs: [1, 2, 3],
          enLabel: "Gluteus maximus, medius & minimus (Hình dưới phải)",
          vnLabel: "Cơ mông lớn, Cơ mông nhỡ & Cơ mông bé",
          clinicalNote:
            "Cơ mông lớn duỗi và xoay ngoài háng; mông nhỡ và mông bé dạng háng và tham gia kiểm soát khung chậu khi đứng một chân. Gối đi vào trong khi squat không tự chứng minh yếu cơ mông.",
        },
        {
          code: "02",
          sourceRefs: [9],
          enLabel: "Piriformis & Deep lateral rotators",
          vnLabel: "Cơ hình lê (Piriformis) & Nhóm 6 cơ xoay ngoài sâu",
          clinicalNote:
            "Cơ hình lê và các cơ xoay ngoài sâu nằm dưới cơ mông lớn, tham gia xoay ngoài đùi tại háng. Đau mông lan chân cần được đánh giá; vị trí trên hình không xác định một cơ đang chèn ép thần kinh.",
        },
        {
          code: "03",
          sourceRefs: [4, 5, 9],
          enLabel: "Psoas major, Iliacus & Tensor fasciae latae (TFL)",
          vnLabel: "Cơ thắt lưng – chậu & Cơ căng mạc đùi (TFL)",
          clinicalNote:
            "Cơ thắt lưng lớn và cơ chậu gập háng; cơ căng mạc đùi liên kết với dải chậu – chày và tham gia gập, dạng háng. Không suy ra TFL hoạt động bù trừ chỉ từ quan sát chuyển động.",
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
          sourceRefs: [6, 8],
          enLabel: "Acetabulum & Ball (Femoral head)",
          vnLabel: "Ổ cối xương chậu & Chỏm xương đùi",
          clinicalNote:
            "Khớp háng là khớp chỏm – ổ cối, có sụn viền ổ cối bao quanh. Hội chứng FAI cần đồng thời triệu chứng, dấu hiệu lâm sàng và hình ảnh; không có một độ rộng chân khi squat phù hợp cho mọi cấu trúc háng.",
        },
        {
          code: "02",
          sourceRefs: [10],
          enLabel: "Sacrum, Ilium & Pubis",
          vnLabel: "Xương cùng, Xương cánh chậu & Xương mu",
          clinicalNote:
            "Xương cùng và hai xương chậu (gồm cánh chậu, ngồi, mu) tạo vòng chậu, nối cột sống với hai chi dưới qua khớp cùng – chậu và khớp mu.",
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
          sourceRefs: [1, 2],
          enLabel: "Rectus femoris, Vastus lateralis & Vastus medialis (Hình trên)",
          vnLabel: "Cơ thẳng đùi, Cơ rộng ngoài & Cơ rộng trong",
          clinicalNote:
            "Cơ thẳng đùi đi qua cả khớp háng và khớp gối; các cơ rộng chỉ đi qua gối. Cơ tứ đầu truyền lực duỗi gối qua bánh chè; vị trí đau trước gối không xác định một bó cơ bị yếu.",
        },
        {
          code: "02",
          sourceRefs: [1, 4],
          enLabel: "Adductor brevis, longus, magnus & Gracilis (Hình dưới trái)",
          vnLabel: "Cơ khép ngắn, khép dài, khép lớn & Cơ thon",
          clinicalNote:
            "Nhóm cơ khép đi từ xương mu – ngồi tới xương đùi; riêng cơ thon tới mặt trong đầu trên xương chày. Phần ngồi – lồi cầu của cơ khép lớn bám ụ ngồi và góp phần duỗi háng.",
        },
        {
          code: "03",
          sourceRefs: [1, 3],
          enLabel: "Biceps femoris, Semitendinosus & Semimembranosus (Hình dưới phải)",
          vnLabel: "Cơ nhị đầu đùi, Cơ bán gân & Cơ bán màng (Gân kheo)",
          clinicalNote:
            "Đầu dài cơ nhị đầu đùi, cơ bán gân và cơ bán màng bám ụ ngồi, đi qua háng và gối nên vừa duỗi háng vừa gập gối. Đầu ngắn cơ nhị đầu đùi xuất phát từ xương đùi nên chỉ đi qua gối.",
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
          sourceRefs: [8],
          enLabel: "Anterior talofibular (ATFL) & Calcaneofibular ligament (Hình dưới)",
          vnLabel: "Dây chằng sên – mác trước (ATFL) & Dây chằng mác – gót (CFL)",
          clinicalNote:
            "Thuộc nhóm dây chằng bên ngoài cổ chân, hạn chế lật bàn chân vào trong (inversion). Bong gân do lật cổ chân cần được đánh giá mức độ; hình minh họa dây chằng không xác định mức tổn thương hoặc liều phục hồi.",
        },
        {
          code: "02",
          sourceRefs: [8],
          enLabel: "Deltoid ligament & Medial malleolus (Hình trên)",
          vnLabel: "Phức hợp dây chằng Delta & Mắt cá trong xương chày",
          clinicalNote:
            "Phức hợp dây chằng ở phía mắt cá trong hỗ trợ mặt trong cổ chân và hạn chế lật bàn chân ra ngoài quá mức (eversion).",
        },
        {
          code: "03",
          sourceRefs: [8],
          enLabel: "Subtalar joint & Talus",
          vnLabel: "Khớp dưới sên & Xương sên (Talus)",
          clinicalNote:
            "Xương sên khớp với gọng chày – mác ở trên (khớp sên – cẳng chân) và với xương gót ở dưới (khớp dưới sên); khớp dưới sên tham gia lật trong – lật ngoài bàn chân. Hạn chế gập mu khi squat có nhiều nguyên nhân, không tự xác định một cấu trúc bị kẹt.",
        },
      ],
    },
    {
      id: "achilles-pathology-3d",
      title: "Giải phẫu Phức hợp Bắp chân – Gân Achilles & Vị trí Bệnh gân Thường gặp",
      subtitle:
        "Hình minh họa 3D cơ bụng chân, cơ dép và gân gót (Achilles) bám vào xương gót",
      src: "/anatomy/achilles-tendon.png",
      sourceCredit: "Blausen Medical Communications — Scientific Medical Atlas (CC BY 3.0)",
      landmarks: [
        {
          code: "01",
          sourceRefs: [1, 2],
          enLabel: "Gastrocnemius & Soleus muscles",
          vnLabel: "Cơ bụng chân (2 đầu) & Cơ dép (Soleus)",
          clinicalNote:
            "Cơ bụng chân đi qua cả khớp gối và cổ chân; cơ dép chỉ đi qua cổ chân. Cả hai gập lòng bàn chân qua gân Achilles bám vào xương gót.",
        },
        {
          code: "02",
          sourceRefs: [5],
          enLabel: "Achilles tendon mid-portion (2–6 cm above insertion)",
          vnLabel: "Đoạn giữa gân Achilles (khoảng 2–6 cm trên điểm bám)",
          clinicalNote:
            "Đau khu trú khoảng 2–6 cm trên điểm bám là một tiêu chí chẩn đoán bệnh gân Achilles đoạn giữa. Với người đã được đánh giá và không nghi suy yếu cấu trúc gân, hướng dẫn 2024 ưu tiên tải gân theo khả năng và giáo dục; không áp trực tiếp cho đứt gân.",
        },
        {
          code: "03",
          sourceRefs: [5],
          enLabel: "Calcaneus insertion",
          vnLabel: "Điểm bám tận gân Achilles vào xương gót",
          clinicalNote:
            "Bệnh gân tại điểm bám cần được phân biệt với bệnh gân đoạn giữa vì kế hoạch tập khác nhau; hỏi người điều trị về biên độ calf raise phù hợp, kể cả hạ gót dưới bậc.",
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
            <span className="rounded bg-cobalt px-2 py-0.5 font-mono text-[10px] font-bold text-on-cobalt">
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
                    ? "bg-cobalt text-on-cobalt"
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
          <div className="mt-2 flex items-center justify-between border-t border-rule pt-2 text-xs text-slate">
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
            Chú giải Thuật ngữ trên Hình
          </p>
          <p className="text-xs leading-5 text-slate">
            Chú giải tóm tắt theo các nguồn được liên kết dưới từng mục. Các số là khóa chú giải, không xác nhận tọa độ điểm bám, kích thước mô hay nguồn đau của một người.
          </p>
          <div className="space-y-2">
            {activePlate.landmarks.map((lm) => (
              <div
                key={lm.code}
                className="rounded-md border border-rule bg-canvas/60 p-3 text-xs transition-colors hover:border-cobalt/50"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-cobalt font-mono text-[11px] font-bold text-on-cobalt">
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
                    <p className="leading-5 text-slate">
                      {lm.clinicalNote}{" "}
                      {lm.sourceRefs.map((number) => {
                        const source = ANATOMY_REGION_EVIDENCE[regionId].sources[number - 1];
                        return (
                          <a
                            key={number}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            title={`${source.title} · Đối chiếu ${source.checkedAt}`}
                            className="ml-1 font-mono text-cobalt underline underline-offset-2"
                            aria-label={`Nguồn ${number} cho ${lm.vnLabel}`}
                          >
                            [{number}]
                          </a>
                        );
                      })}
                    </p>
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
                className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-on-cobalt"
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
