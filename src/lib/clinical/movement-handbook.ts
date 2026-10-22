import {
  MOVEMENT_SOURCES as S,
  type MovementSource,
  type MovementSourceId,
} from "./movement-sources";

export type Cited = { sourceIds?: MovementSourceId[]; authored?: boolean };
export type HandbookItem = Cited & { lead?: string; text: string };
export type HandbookTable = {
  head: string[];
  rows: (Cited & { cells: string[] })[];
};
export type HandbookPart = Cited & {
  label: string;
  intro?: string;
  items?: HandbookItem[];
  table?: HandbookTable;
  note?: string;
  chart?: "knee-flexion";
};
export type HandbookFigure = {
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  caption: string;
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  changes: string;
};
export type HandbookTopic = Cited & {
  id: "patterns" | "symmetry" | "rom" | "control";
  tab: string;
  kicker: string;
  title: string;
  gist: string;
  keyPoints: (Cited & { title: string; text: string })[];
  parts: HandbookPart[];
  numbers: (Cited & { value: string; text: string })[];
  myths: (Cited & { say: string; real: string })[];
  apply: HandbookItem[];
  quiz: (Cited & { q: string; a: string })[];
  sources: MovementSource[];
  figure?: HandbookFigure;
};
export const HANDBOOK_LESSON: HandbookItem[] = [
  {
    text: "Quan sát mô tả cách một người thực hiện nhiệm vụ. Một kết quả sàng lọc không dự đoán chắc cá nhân đó sẽ chấn thương.",
    sourceIds: ["bahr"],
  },
  {
    text: "Đọc kiến thức, thử ví dụ phù hợp rồi ghi lại đáp ứng. Các ví dụ của sổ tay do app biên soạn; không phải bài kiểm tra chẩn đoán hoặc phác đồ điều trị.",
    authored: true,
  },
];

export const HANDBOOK: HandbookTopic[] = [
  {
    id: "patterns",
    tab: "Mẫu chuyển động",
    kicker: "01 · Movement patterns",
    title: "Đọc chuyển động theo nhiệm vụ",
    gist: "Bắt đầu bằng việc người tập cần làm gì, cách thiết lập và điều thực sự quan sát được. Tên mẫu giúp tổ chức bài tập; không thay thế phép đo hay chẩn đoán.",
    authored: true,
    keyPoints: [
      {
        title: "Đặt tên theo nhiệm vụ",
        text: "Squat, hinge, lunge, đẩy, kéo và mang vác là cách nhóm bài của app. Một bài có thể kết hợp nhiều mẫu.",
        authored: true,
      },
      {
        title: "Quan sát các khớp phối hợp",
        text: "Trong squat, nghiên cứu đo đồng thời vận động hông, gối và thân. Hình dáng của một khớp không mô tả toàn bộ nhiệm vụ.",
        sourceIds: ["squat"],
      },
      {
        title: "Thiết lập làm thay đổi cơ học",
        text: "Độ rộng chân và góc bàn chân làm thay đổi chuyển động, mô-men hông/gối trong nghiên cứu ở người khỏe. Kết quả không xác định một tư thế an toàn chung.",
        sourceIds: ["squat"],
      },
      {
        title: "Quan sát không phải đo sức mạnh",
        text: "Ở một mẫu 41 phụ nữ hoạt động thể chất, nhóm phân theo quan sát single-leg squat không khác nhau về sức mạnh hông. Không kết luận cơ mông yếu chỉ vì gối đi vào trong.",
        sourceIds: ["hollman"],
      },
      {
        title: "Điểm sàng lọc cần đúng mục đích",
        text: "Liên hệ với chấn thương, khả năng dự báo cá nhân và lợi ích của can thiệp theo kết quả sàng lọc là các câu hỏi khác nhau.",
        sourceIds: ["bahr"],
      },
    ],
    figure: {
      src: "/movement/squat-lab-lorenzetti-2018.png",
      width: 896,
      height: 857,
      title: "Squat được đo như thế nào?",
      alt: "Hình 1 nghiên cứu Lorenzetti: người tham gia squat với marker chuyển động, thanh gỗ, hai force plate và camera.",
      caption:
        "Thiết lập thí nghiệm với marker, force plate và camera. Đây là một điều kiện nghiên cứu, không phải tư thế chuẩn để bắt chước.",
      author:
        "Lorenzetti và cs., BMC Sports Science, Medicine and Rehabilitation (2018), Hình 1",
      sourceUrl:
        "https://link.springer.com/article/10.1186/s13102-018-0103-7/figures/1",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      changes:
        "Giữ nguyên ảnh và nhãn gốc; chú thích tiếng Việt nằm ngoài hình.",
    },
    parts: [
      {
        label: "Từ mẫu đến nhiệm vụ cụ thể",
        authored: true,
        intro:
          "Dùng tên mẫu để tìm bài, rồi mô tả nhiệm vụ đủ rõ để lần sau có thể lặp lại.",
        table: {
          head: ["Mẫu trong app", "Điều có thể ghi lại"],
          rows: [
            {
              cells: [
                "Squat / lunge",
                "Độ sâu hoặc độ cao ghế, hỗ trợ, tải, số lần và triệu chứng.",
              ],
              authored: true,
            },
            {
              cells: [
                "Hip hinge",
                "Vị trí vật cần nâng, mức tải, biên độ và khả năng giữ thăng bằng.",
              ],
              authored: true,
            },
            {
              cells: [
                "Đẩy / kéo",
                "Hướng lực, dụng cụ, điểm tựa và biên độ đã thực hiện.",
              ],
              authored: true,
            },
            {
              cells: [
                "Mang vác",
                "Khối lượng, một/hai bên, quãng đường và cách hoàn thành.",
              ],
              authored: true,
            },
          ],
        },
      },
      {
        label: "Phân biệt mô tả với kết luận",
        sourceIds: ["hollman", "bahr"],
        items: [
          {
            lead: "Mô tả:",
            text: "“Gối di chuyển vào trong ở ba lần cuối” là ghi chép quan sát do app gợi ý.",
            authored: true,
          },
          {
            lead: "Kết luận cần thêm dữ liệu:",
            text: "Nếu câu hỏi là sức mạnh hông, cần phép đo sức mạnh phù hợp. Quan sát single-leg squat không tự trả lời câu hỏi đó.",
            sourceIds: ["hollman"],
          },
          {
            lead: "Sàng lọc:",
            text: "Không dùng một điểm tổng để dự báo chắc chấn thương hoặc tự cấp phép trở lại thể thao.",
            sourceIds: ["bahr"],
          },
        ],
      },
    ],
    numbers: [
      {
        value: "42 người",
        text: "Mẫu nghiên cứu squat: người khỏe tập gym; không phải thử nghiệm điều trị hay theo dõi chấn thương.",
        sourceIds: ["squat"],
      },
      {
        value: "Cùng nhiệm vụ",
        text: "Ghi thiết lập, tải và hỗ trợ để việc so sánh lần sau có ý nghĩa thực hành.",
        authored: true,
      },
    ],
    myths: [
      {
        say: "“Gối vào trong chứng minh cơ mông yếu.”",
        real: "Quan sát và đo sức mạnh là hai việc khác nhau; nghiên cứu single-leg squat không cho phép suy ngược như vậy cho mọi người.",
        sourceIds: ["hollman"],
      },
      {
        say: "“Điểm sàng lọc thấp nghĩa là sắp chấn thương.”",
        real: "Một liên hệ ở cấp nhóm chưa đủ làm công cụ dự báo cho cá nhân.",
        sourceIds: ["bahr"],
      },
    ],
    apply: [
      {
        lead: "Chọn một nhiệm vụ:",
        text: "xác định mục tiêu, quan sát cách hoàn thành rồi ghi số thô và triệu chứng.",
        authored: true,
      },
      {
        lead: "Thử một điều chỉnh:",
        text: "ví dụ dùng điểm tựa, thay độ cao ghế hoặc giảm tải; ghi lại đáp ứng thay vì gọi đó là xác nhận nguyên nhân.",
        authored: true,
      },
    ],
    quiz: [
      {
        q: "Đổi độ rộng chân làm squat dễ hơn: đã tìm được nguyên nhân đau chưa?",
        a: "Chưa. Thiết lập có thể thay đổi cơ học của nhiệm vụ; đáp ứng với một thay đổi không tự xác định mô gây đau.",
        sourceIds: ["squat"],
        authored: true,
      },
      {
        q: "Có thể dùng ảnh nghiên cứu làm tiêu chuẩn tư thế cho mọi học viên không?",
        a: "Không. Ảnh thể hiện một điều kiện đo ở mẫu người khỏe; không là chuẩn an toàn hoặc bài kiểm tra đã xác thực cho cá nhân.",
        sourceIds: ["squat"],
      },
    ],
    sources: [S.bahr, S.squat, S.hollman],
  },
  {
    id: "symmetry",
    tab: "Đối xứng",
    kicker: "02 · Symmetry",
    title: "Đọc cả hai bên, không chỉ một tỷ lệ",
    gist: "Chênh lệch hai bên phụ thuộc nhiệm vụ, cách tính và độ lặp lại. Không có một tỷ lệ phần trăm chung phân biệt khỏe và bệnh.",
    sourceIds: ["parkinson"],
    keyPoints: [
      {
        title: "Đối xứng theo từng phép đo",
        text: "Chênh lực, quãng nhảy và thời gian thực hiện là các đại lượng khác nhau. Một test không tạo thành hồ sơ đối xứng toàn cơ thể.",
        sourceIds: ["parkinson"],
      },
      {
        title: "Luôn giữ số từng bên",
        text: "Công thức và mẫu số làm thay đổi tỷ lệ. Chỉ số dùng bên lớn/bên nhỏ cũng không giữ lại thông tin bên nào mạnh hơn.",
        sourceIds: ["parkinson"],
      },
      {
        title: "Không dùng ngưỡng 10–15% chung",
        text: "Cần xét phép đo, thể thao, quần thể và độ lặp lại; các ngưỡng thường dùng không tự là ranh giới nguy hiểm.",
        sourceIds: ["parkinson"],
      },
      {
        title: "LSI có thể đánh giá quá cao hồi phục",
        text: "Sau ACL, chi đối diện cũng có thể giảm khả năng. Xem số tuyệt đối và tiến trình từng chân; đạt LSI 90% riêng lẻ chưa đủ kết luận hồi phục đầy đủ.",
        sourceIds: ["wellsandt"],
      },
      {
        title: "TUG là thông tin di chuyển",
        text: "TUG không đo tỷ lệ lệch hai chi. Ngưỡng 13,5 giây dự báo ngã hạn chế ở người cao tuổi sống tại cộng đồng; cần thêm bệnh sử và đánh giá.",
        sourceIds: ["barry"],
      },
    ],
    parts: [
      {
        label: "Công thức phải đi cùng mục đích",
        sourceIds: ["parkinson", "wellsandt"],
        table: {
          head: ["Chỉ số", "Cách đọc và giới hạn"],
          rows: [
            {
              cells: [
                "Chênh lệch theo bên lớn",
                "(Lớn − nhỏ) / lớn × 100. Ghi cả hai giá trị và bên tương ứng; đây là một lựa chọn công thức.",
              ],
              sourceIds: ["parkinson"],
            },
            {
              cells: [
                "LSI sau ACL",
                "Chi ảnh hưởng / chi đối diện × 100 cho biến càng cao càng tốt. Test thời gian cần quy định chiều/công thức trước.",
              ],
              sourceIds: ["wellsandt", "parkinson"],
            },
          ],
        },
      },
      {
        label: "Một tỷ lệ đẹp hơn chưa chắc là tiến bộ",
        authored: true,
        intro:
          "Ví dụ tính toán do app biên soạn, không phải dữ liệu bệnh nhân hoặc ngưỡng phục hồi.",
        table: {
          head: ["Lần đo", "Trái / phải", "Chênh theo bên lớn"],
          rows: [
            { cells: ["Lần 1", "800 / 700 N", "12,5%"], authored: true },
            { cells: ["Lần 2", "700 / 650 N", "≈7,1%"], authored: true },
          ],
        },
        note: "Tỷ lệ giảm nhưng cả hai bên cùng giảm lực. Đây là lý do giữ số tuyệt đối và điều kiện đo.",
      },
      {
        label: "Đặt TUG đúng vai trò",
        sourceIds: ["barry"],
        intro:
          "TUG tính thời gian đứng lên, đi, quay lại và ngồi theo quy trình. Tổng quan về dự báo ngã không biến kết quả đó thành phép đo bất đối xứng hoặc giấy phép tập bài khó.",
      },
    ],
    numbers: [
      {
        value: "12,5%",
        text: "(800 − 700) / 800 × 100. Ví dụ số học; không là ngưỡng bệnh.",
        authored: true,
      },
      {
        value: "90% LSI",
        text: "Không dùng riêng để xác nhận hồi phục sau ACL hoặc trở lại thể thao.",
        sourceIds: ["wellsandt"],
      },
    ],
    myths: [
      {
        say: "“Lệch trên 10% luôn nguy hiểm.”",
        real: "Ngưỡng phải gắn với phép đo và quần thể; không dùng một tỷ lệ chung cho mọi nhiệm vụ.",
        sourceIds: ["parkinson"],
      },
      {
        say: "“Hai bên bằng nhau nghĩa là đã hồi phục.”",
        real: "Hai bên có thể cùng suy giảm. Nghiên cứu sau ACL cho thấy giới hạn khi chỉ lấy chi đối diện làm tham chiếu.",
        sourceIds: ["wellsandt"],
      },
    ],
    apply: [
      {
        lead: "Chuẩn hóa lượt đo:",
        text: "ghi dụng cụ, số lượt, cách chọn kết quả và nghỉ giữa lượt; giữ cùng cách tính khi theo dõi.",
        authored: true,
      },
      {
        lead: "Đọc cùng chức năng:",
        text: "so số từng bên theo thời gian và nhiệm vụ người tập muốn làm; không tự cho phép trở lại thể thao từ tỷ lệ.",
        authored: true,
      },
    ],
    quiz: [
      {
        q: "Trái 150 cm, phải 170 cm: chênh theo bên lớn bao nhiêu?",
        a: "(170 − 150) / 170 × 100 ≈11,8%. Đây là phép tính mô tả, không xác định nguyên nhân hoặc nguy cơ.",
        authored: true,
      },
      {
        q: "TUG nhanh hơn có nghĩa hai chân đối xứng hơn không?",
        a: "Không. TUG đo di chuyển chức năng theo thời gian, không phải tỷ lệ sức mạnh hoặc quãng nhảy hai bên.",
        sourceIds: ["barry"],
      },
    ],
    sources: [S.parkinson, S.wellsandt, S.barry],
  },
  {
    id: "rom",
    tab: "Biên độ vận động",
    kicker: "03 · Range of motion",
    title: "Đo đúng trước khi so sánh ROM",
    gist: "Một số đo góc chỉ có ý nghĩa khi biết đo chủ động hay thụ động, đo bằng cách nào và so với quần thể nào.",
    sourceIds: ["cdc", "soucie", "jtss", "keogh"],
    keyPoints: [
      {
        title: "Phân biệt AROM và PROM",
        text: "AROM do người được đo tự vận động; PROM được người đo đưa khớp đi. Bảng chi của CDC là thụ động, nguồn cột sống JTSS là chủ động; không coi hai loại tương đương.",
        sourceIds: ["soucie", "jtss"],
      },
      {
        title: "Khớp tên test chưa đủ",
        text: "Tư thế và quy trình phải khớp. CDC đo gập mu cổ chân với gối gập ít nhất 30°; không coi đó là cùng phép đo với lunge chịu tải hoặc gối duỗi.",
        sourceIds: ["cdcProtocol"],
      },
      {
        title: "Trung bình không phải ngưỡng bệnh",
        text: "CDC có dữ liệu người khỏe 2–69 tuổi; JTSS khảo sát 18–29 tuổi. CI của trung bình CDC không phải khoảng chứa 95% người khỏe.",
        sourceIds: ["cdc", "soucie", "jtss"],
      },
      {
        title: "Độ tin cậy khác sai số theo độ",
        text: "ICC, SEM và MDC trả lời các câu hỏi khác nhau. Không chuyển kết quả của một app, khớp hoặc quy trình sang mọi dụng cụ đo.",
        sourceIds: ["keogh", "mehta"],
      },
      {
        title: "Vượt sai số chưa đủ nói có ích",
        text: "Thay đổi phát hiện được khác thay đổi quan trọng với người bệnh. Cần xem thêm hoạt động họ muốn làm; không có MCID ROM chung từ các nguồn này.",
        sourceIds: ["devet", "mehta"],
      },
    ],
    figure: {
      src: "/movement/flexion-extension-openstax.jpg",
      width: 2430,
      height: 1377,
      title: "Đọc tên và hướng chuyển động",
      alt: "Hình giáo trình OpenStax với nhãn gốc Flexion và Extension ở vai, gối và cổ.",
      caption:
        "Flexion: gập; Extension: duỗi. Hình minh họa tên và hướng chuyển động, không phải hướng dẫn đặt thước hoặc xác nhận góc đo.",
      author:
        "OpenStax College / Tonye Ogele CNX; bản cắt của Doc James (2017)",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Flexion_and_extension_movements.jpg",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      changes:
        "Giữ nguyên bản cắt có sẵn và nhãn tiếng Anh; không vẽ thêm góc hay điểm mốc.",
    },
    parts: [
      {
        label: "Hai bộ tham chiếu trong app",
        sourceIds: ["cdc", "soucie", "jtss"],
        table: {
          head: ["Nguồn", "Dữ liệu", "Phạm vi"],
          rows: [
            {
              cells: [
                "CDC / Soucie",
                "ROM thụ động · 11 động tác / 5 khớp",
                "674 người khỏe, 2–69 tuổi; bảng theo tuổi và giới.",
              ],
              sourceIds: ["cdc", "soucie"],
            },
            {
              cells: [
                "Apti / JTSS 2023",
                "ROM chủ động cột sống",
                "300 sinh viên khỏe, 18–29 tuổi; thước kỹ thuật số theo quy trình nghiên cứu.",
              ],
              sourceIds: ["jtss"],
            },
          ],
        },
        note: "JTSS công bố nghiêng/xoay cổ riêng từng bên. Các số đại diện làm tròn 42° và 71° trong app không phải trung bình gộp được tác giả báo cáo.",
      },
      {
        label: "Gập gối: ví dụ trung bình mẫu CDC",
        sourceIds: ["cdc", "soucie"],
        chart: "knee-flexion",
        note: "Đây là PROM của nhóm 20–44 tuổi. Không dùng trung bình làm mục tiêu phục hồi hoặc so trực tiếp với AROM khác quy trình.",
      },
      {
        label: "Đọc thay đổi có thứ tự",
        sourceIds: ["keogh", "mehta", "devet"],
        items: [
          {
            lead: "Độ tin cậy tương đối:",
            text: "ICC cao không tự cho biết sai số chỉ vài độ. Xem SEM, MDC hoặc giới hạn đồng thuận trong đúng nghiên cứu.",
            sourceIds: ["keogh"],
          },
          {
            lead: "Sai số của đúng công cụ:",
            text: "Mehta khảo sát i-Goni v1.1 và AROM gối ở 60 người OA/sau thay khớp; không xác nhận MDC cho form nhập số của app.",
            sourceIds: ["mehta"],
          },
          {
            lead: "Ý nghĩa với người tập:",
            text: "Nguyên tắc đo lường phân biệt detectable change và important change. Không tự chuyển MDC thành một mục tiêu ROM có ý nghĩa cho cá nhân.",
            sourceIds: ["devet"],
          },
        ],
      },
    ],
    numbers: [
      {
        value: "2–69 tuổi",
        text: "Khoảng tuổi của bảng PROM CDC; không ngoại suy ra ngoài mẫu.",
        sourceIds: ["cdc", "soucie"],
      },
      {
        value: "18–29 tuổi",
        text: "Mẫu AROM cột sống JTSS; không đại diện mọi độ tuổi.",
        sourceIds: ["jtss"],
      },
    ],
    myths: [
      {
        say: "“Dưới trung bình nghĩa là bệnh lý.”",
        real: "Trung bình mô tả mẫu nghiên cứu; cần phương pháp, triệu chứng và chức năng để diễn giải cá nhân.",
        sourceIds: ["cdc", "jtss"],
      },
      {
        say: "“Đổi dụng cụ rồi tăng 8° là đã tiến bộ.”",
        real: "Khác phương pháp có thể góp phần tạo khác biệt. Độ tin cậy/giá trị cần đúng app và quy trình.",
        sourceIds: ["keogh"],
      },
    ],
    apply: [
      {
        lead: "Trước khi đo:",
        text: "ghi AROM/PROM, bên, tư thế, mốc, dụng cụ và người đo. Không ép khớp để đạt trung bình của bảng.",
        authored: true,
      },
      {
        lead: "Khi đo lại:",
        text: "giữ quy trình và ghi cả thay đổi bằng độ lẫn khả năng thực hiện nhiệm vụ. Form chỉ hiển thị thay đổi thô, không tự xác nhận vượt MDC.",
        authored: true,
      },
    ],
    quiz: [
      {
        q: "AROM gối thấp hơn trung bình PROM CDC: đã xác định hạn chế bệnh lý chưa?",
        a: "Chưa. Loại đo khác nhau; trung bình PROM cũng không phải ngưỡng chẩn đoán.",
        sourceIds: ["cdc", "soucie"],
      },
      {
        q: "Người 75 tuổi có thể lấy nhóm CDC 45–69 làm chuẩn cá nhân không?",
        a: "Không. Dữ liệu được trích chỉ tới 69 tuổi; không ngoại suy số tham chiếu đó.",
        sourceIds: ["cdc"],
      },
    ],
    sources: [
      S.cdc,
      S.soucie,
      S.cdcProtocol,
      S.jtss,
      S.keogh,
      S.mehta,
      S.devet,
      S.motions,
    ],
  },
  {
    id: "control",
    tab: "Kiểm soát chuyển động",
    kicker: "04 · Motor control",
    title: "Dạy kỹ năng và theo dõi điều học được",
    gist: "Hướng dẫn cần gắn với nhiệm vụ, đáp ứng của người tập và khả năng giữ kỹ năng. Kết quả học vận động không tự là bằng chứng điều trị đau.",
    sourceIds: ["chua", "mckay", "cochrane"],
    keyPoints: [
      {
        title: "Phối hợp trong nhiệm vụ",
        text: "Trong nghiên cứu đau lưng mạn không đặc hiệu, bài kiểm soát vận động luyện phối hợp cơ rồi tiến tới nhiệm vụ chức năng phức tạp hơn. Đây là mô tả can thiệp trong phạm vi đó.",
        sourceIds: ["cochrane"],
      },
      {
        title: "Phân biệt hướng chú ý",
        text: "Hướng trong chú ý đến bộ phận cơ thể; hướng ngoài chú ý đến hiệu ứng mong muốn của động tác. Hai cách mô tả không tự tạo thành kê đơn cue.",
        sourceIds: ["chua"],
      },
      {
        title: "Tốt ngay chưa phải học được lâu",
        text: "Nghiên cứu phân biệt thực hiện lúc tập, giữ kỹ năng sau đó và chuyển sang điều kiện khác. Nêu rõ mình đang theo dõi kết quả nào.",
        sourceIds: ["chua"],
      },
      {
        title: "Cue ngoài chưa chắc luôn hơn",
        text: "Chua 2021 báo cáo lợi thế trung bình; McKay 2024 cho thấy hiệu ứng giảm nhiều sau điều chỉnh thiên lệch công bố. Thử cue theo đáp ứng, không bảo đảm một loại luôn tốt hơn.",
        sourceIds: ["chua", "mckay"],
      },
      {
        title: "Đau lưng cần chọn theo người",
        text: "WHO 2023 nêu tập có cấu trúc có thể là một phần chăm sóc đau lưng mạn nguyên phát. Bài kiểm soát vận động là một lựa chọn, không phải cách sửa một nguyên nhân duy nhất.",
        sourceIds: ["who", "cochrane"],
      },
    ],
    parts: [
      {
        label: "Hai cách cue cho cùng nhiệm vụ",
        authored: true,
        intro:
          "Các câu dưới là ví dụ do app biên soạn, không phải cue đã được kiểm nghiệm riêng cho mọi học viên.",
        table: {
          head: ["Nhiệm vụ", "Chú ý vào cơ thể", "Chú ý vào hiệu ứng"],
          rows: [
            {
              cells: [
                "Squat",
                "“Duỗi gối và hông khi đứng lên.”",
                "“Đẩy sàn ra xa.”",
              ],
              authored: true,
            },
            {
              cells: [
                "Hip hinge",
                "“Đưa hông ra sau.”",
                "“Chạm mông tới bức tường phía sau.”",
              ],
              authored: true,
            },
            {
              cells: [
                "Ném bóng",
                "“Duỗi tay khi thả bóng.”",
                "“Đưa bóng tới mục tiêu.”",
              ],
              authored: true,
            },
          ],
        },
      },
      {
        label: "Tách kết quả thực hiện và kết quả học",
        sourceIds: ["chua"],
        table: {
          head: ["Kết quả", "Câu hỏi thực hành do app gợi ý"],
          rows: [
            {
              cells: [
                "Performance · lúc tập",
                "Ngay sau cue, nhiệm vụ được thực hiện thế nào?",
              ],
              authored: true,
            },
            {
              cells: [
                "Retention · giữ kỹ năng",
                "Lần sau không nhắc lại cue, người tập có giữ cách làm không?",
              ],
              authored: true,
            },
            {
              cells: [
                "Transfer · chuyển kỹ năng",
                "Khi đổi điều kiện phù hợp, cách làm có còn áp dụng được không?",
              ],
              authored: true,
            },
          ],
        },
      },
      {
        label: "Không đồng nhất dạy kỹ năng với điều trị đau",
        sourceIds: ["cochrane", "who"],
        intro:
          "Cochrane 2016 không tìm thấy ưu thế quan trọng của tập kiểm soát vận động so với các hình thức tập khác cho đau lưng mạn không đặc hiệu. WHO 2023 nhấn mạnh chăm sóc dựa trên đánh giá và hoàn cảnh cá nhân.",
        note: "Cochrane tìm kiếm đến 04/2015. WHO: tập có cấu trúc là khuyến nghị có điều kiện, bằng chứng độ chắc chắn thấp; quick guide đã đọc không xác nhận từng cue hoặc phác đồ của app.",
      },
    ],
    numbers: [
      {
        value: "3 kết quả",
        text: "Thực hiện lúc tập, giữ kỹ năng và chuyển kỹ năng là các kết quả khác nhau.",
        sourceIds: ["chua"],
      },
      {
        value: "Theo nhiệm vụ",
        text: "Thử một cue đơn giản và xem đáp ứng; không hứa một phần trăm cải thiện chung.",
        authored: true,
      },
    ],
    myths: [
      {
        say: "“Cue ngoài luôn tốt hơn cue trong.”",
        real: "Kết luận ưu thế trung bình chịu phản biện về thiên lệch công bố; không suy thành quy tắc cho mọi người.",
        sourceIds: ["chua", "mckay"],
      },
      {
        say: "“Đau lưng nghĩa là phải tập cô lập cơ lõi.”",
        real: "Kiểm soát vận động là một lựa chọn trong chăm sóc; tổng quan không chứng minh nó vượt trội quan trọng mọi dạng tập khác.",
        sourceIds: ["cochrane", "who"],
      },
    ],
    apply: [
      {
        lead: "Một thay đổi mỗi lần:",
        text: "nêu mục tiêu, thử một cue rồi hỏi cảm nhận và quan sát nhiệm vụ. Giữ tải và hỗ trợ phù hợp.",
        authored: true,
      },
      {
        lead: "Kiểm tra lại:",
        text: "giảm dần nhắc nếu phù hợp, xem người tập có tự làm lại được không và ghi rõ điều kiện. Đây là ví dụ dạy kỹ năng của app.",
        authored: true,
      },
    ],
    quiz: [
      {
        q: "Người tập làm tốt hơn ngay sau một cue: đã chứng minh kỹ năng được giữ lâu chưa?",
        a: "Chưa. Cải thiện lúc tập và giữ/chuyển kỹ năng là các kết quả riêng; cần xem lại ở thời điểm hoặc điều kiện phù hợp.",
        sourceIds: ["chua"],
      },
      {
        q: "Không thích plank thì không thể cải thiện đau lưng mạn?",
        a: "Không. Có nhiều lựa chọn tập; chọn theo đánh giá, sở thích và khả năng duy trì. Không coi một bài là bắt buộc.",
        sourceIds: ["cochrane", "who"],
      },
    ],
    sources: [S.chua, S.mckay, S.cochrane, S.who],
  },
];
