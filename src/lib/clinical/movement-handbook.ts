// Study handbook for the four movement-assessment foundations.
// Evidence: reports/Bốn nền tảng đánh giá vận động.md

export type Evidence = "strong" | "moderate" | "weak" | "convention";

export const EVIDENCE_LABELS: Record<Evidence, string> = {
  strong: "Mạnh",
  moderate: "Trung bình",
  weak: "Yếu",
  convention: "Quy ước",
};

export type HandbookItem = { lead?: string; text: string; evidence?: Evidence };
export type HandbookTable = {
  head: string[];
  rows: { cells: string[]; evidence?: Evidence }[];
};
export type HandbookPart = {
  label: string;
  intro?: string;
  items?: HandbookItem[];
  table?: HandbookTable;
  note?: string;
  chart?: "knee-flexion";
};
export type HandbookTopic = {
  id: "patterns" | "symmetry" | "rom" | "control";
  tab: string;
  kicker: string;
  title: string;
  gist: string;
  parts: HandbookPart[];
  numbers: { value: string; text: string; evidence?: Evidence }[];
  myths: { say: string; real: string; evidence?: Evidence }[];
  apply: HandbookItem[];
  quiz: { q: string; a: string }[];
  sources: { label: string; url: string }[];
};

export const HANDBOOK_LESSON = [
  "Quan sát vận động mô tả khả năng trong một nhiệm vụ. Một kết quả sàng lọc không xác định nguyên nhân đau hay dự đoán chắc một cá nhân sẽ chấn thương [Bahr 2016].",
  "Ghi quy trình, số thô, triệu chứng và mục tiêu chức năng; so theo thời gian bằng cùng phương pháp. Các ví dụ huấn luyện dưới đây chưa được thẩm định thành phác đồ điều trị.",
];

export const HANDBOOK: HandbookTopic[] = [
  {
    id: "patterns", tab: "Mẫu chuyển động", kicker: "01 · Movement patterns", title: "Mẫu chuyển động",
    gist: "Squat, hinge, lunge, đẩy, kéo và mang vác là cách tổ chức bài tập của app. Đây là quy ước huấn luyện, không là phân loại chẩn đoán được kiểm định.",
    parts: [
      { label: "Quan sát nhiệm vụ", items: [
        {lead: "Ghi điều nhìn thấy:", text: "học viên hoàn thành được nhiệm vụ nào, với hỗ trợ/tải/biên độ nào, có đau hay mất thăng bằng không. Không suy từ gối di chuyển vào trong thành kết luận một cơ yếu."},
        {lead: "Thay đổi thiết lập:", text: "độ rộng chân, hỗ trợ, tải và mục tiêu có thể thay đổi cách thực hiện. Các thử nghiệm điều chỉnh là ví dụ huấn luyện, không phải test chẩn đoán đã được xác thực."},
      ]},
      {label: "Sàng lọc và dự báo", intro: "Một liên hệ ở cấp nhóm không tự tạo thành công cụ dự đoán chấn thương cho từng người. Cần kiểm tra độ chính xác, quần thể và hiệu quả can thiệp trước khi dùng một ngưỡng [Bahr 2016].",
       items: [{lead: "Bộ test có tên thương mại:", text: "cần dùng hướng dẫn và đào tạo chính thức nếu chấm điểm. App không tái tạo chứng nhận FMS/SFMA hoặc cấp phép tập dựa trên tổng điểm."}]},
    ],
    numbers: [{value: "Số thô", text: "Ghi tải, số lần, biên độ và triệu chứng thay vì quy thành một điểm nguy cơ tự động."}],
    myths: [
      {say: "“Điểm thấp nghĩa là sắp chấn thương.”", real: "Không thể suy chắc nguy cơ cá nhân từ một ngưỡng hoặc một quan sát đơn lẻ [Bahr 2016]."},
      {say: "“Có một tư thế hoàn hảo cho mọi người.”", real: "App dùng nhiệm vụ và khả năng hiện tại để tổ chức quan sát; không chẩn đoán từ hình dáng hoặc một lỗi kỹ thuật."},
    ],
    apply: [{lead: "Ví dụ thực hành:",text: "dùng hỗ trợ hoặc giảm tải nếu nhiệm vụ chưa thực hiện được thoải mái; ghi lại thiết lập để so lần sau. Đau mới, tiến triển hoặc dấu hiệu thần kinh cần đánh giá chuyên môn."}],
    quiz: [{q: "Squat có gối di chuyển vào trong: đã xác định cơ mông yếu chưa?",a: "Chưa. Đây là mô tả chuyển động; cần thêm bệnh sử, đo lường và đánh giá phù hợp để tìm yếu tố liên quan."}],
    sources: [{label: "Bahr 2016 · Giới hạn sàng lọc dự báo chấn thương",url:"https://pubmed.ncbi.nlm.nih.gov/27095747/"}],
  },
  {
    id: "symmetry", tab: "Đối xứng", kicker: "02 · Symmetry", title: "Đối xứng và bất đối xứng",
    gist: "Chênh lệch hai bên phụ thuộc nhiệm vụ, cách tính và sai số đo. Không có một tỷ lệ phần trăm duy nhất phân biệt khỏe/bệnh cho mọi người [Parkinson 2021].",
    parts: [
      {label:"Tính và ghi rõ công thức",intro:"Ví dụ mô tả lực: (bên mạnh − bên yếu) ÷ bên mạnh × 100. Hai chân 800 N và 700 N cho 12,5%. Đây là phép tính mô tả, không phải ngưỡng chẩn đoán [Parkinson 2021].",items:[
        {lead:"LSI sau ACL:",text:"tỷ số chi bị ảnh hưởng / chi đối diện × 100 được dùng cho một số phép đo có giá trị càng cao càng tốt. Với test tính thời gian, phải xác định chiều và công thức trước. Không so các tỷ số khác công thức."},
        {lead:"Mẫu số cũng thay đổi:",text:"chi đối diện có thể suy giảm sau chấn thương. Nghiên cứu Wellsandt ghi nhận LSI có thể đánh giá quá cao hồi phục; LSI 90% không đủ để cho phép trở lại thể thao [Wellsandt 2017]."},
      ]},
      {label:"Thăng bằng và nguy cơ ngã",intro:"TUG đo thời gian đứng lên, đi, quay lại và ngồi theo quy trình. Tổng quan Barry cho thấy ngưỡng 13,5 giây có khả năng dự báo ngã hạn chế ở người cao tuổi sống tại cộng đồng; không dùng riêng để phân loại an toàn [Barry 2014]."},
    ],
    numbers:[{value:"12,5%",text:"Ví dụ 800 N so với 700 N; không xác nhận chấn thương hoặc mức nguy hiểm."}],
    myths:[{say:"“Lệch 10–15% luôn nguy hiểm.”",real:"Ý nghĩa thay đổi theo phép đo, thể thao, quần thể và công thức. Không gắn một ngưỡng chung [Parkinson 2021]."},{say:"“Lệch giảm nghĩa là chương trình đúng.”",real:"Có thể do cả hai bên cùng giảm, sai số hoặc thay đổi nhiệm vụ. Xem số tuyệt đối, chức năng và triệu chứng [Wellsandt 2017]."}],
    apply:[{lead:"Chuẩn hóa:",text:"ghi số từng bên, số lượt thử, dụng cụ và quy tắc chọn kết quả; đánh giá lại theo cùng quy trình. Đây là hướng dẫn ghi dữ liệu của app."},{lead:"Đánh giá ngã:",text:"phối hợp tiền sử ngã và đánh giá chuyên môn; không dựa riêng TUG/Berg để cho phép bài khó [Barry 2014]."}],
    quiz:[{q:"Chân trái 150 cm, phải 170 cm: tỷ lệ mô tả là bao nhiêu?",a:"Theo công thức trên: (170 − 150)/170 × 100 ≈ 11,8%. Con số không tự nói nguyên nhân hay nguy cơ."},{q:"Lực nắm tay lệch 11%: có thể kết luận bình thường không?",a:"Không từ tỷ lệ này đơn lẻ. Cần quy trình, độ lặp lại, thuận tay, triệu chứng và số tuyệt đối; không coi trung bình một nghiên cứu là ngưỡng chẩn đoán."}],
    sources:[{label:"Parkinson 2021 · Công thức và ngưỡng bất đối xứng",url:"https://www.jssm.org/jssm-20-594.xml-Fulltext"},{label:"Wellsandt 2017 · LSI sau ACL",url:"https://pubmed.ncbi.nlm.nih.gov/28355978/"},{label:"Barry 2014 · TUG và dự báo ngã",url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC3924230/"}],
  },
  {
    id:"rom",tab:"Biên độ vận động",kicker:"03 · Range of motion",title:"Biên độ vận động",
    gist:"ROM là biên độ góc đo theo một quy trình. Trung bình của nhóm khỏe không là ranh giới bệnh hoặc mục tiêu phục hồi cho từng người [CDC; JTSS 2023].",
    parts:[
      {label:"Tham chiếu đúng phạm vi",items:[
        {lead:"CDC:",text:"bảng của app có 11 động tác, chia theo giới và tuổi 2–69. Ngoài khoảng tuổi hoặc thiếu dữ liệu, app không ngoại suy [CDC]."},
        {lead:"Cột sống:",text:"JTSS đo 300 người khỏe 18–29 tuổi bằng goniometer kỹ thuật số, ROM chủ động. Trung bình gộp không đại diện mọi tuổi hoặc mọi phương pháp [JTSS 2023]."},
        {lead:"Đo chủ động/thụ động:",text:"ghi rõ loại đo, tư thế, mốc, dụng cụ và người đo; khác quy trình có thể cho số khác [JTSS 2023; Keogh 2019]."},
      ]},
      {label:"Gập gối: trung bình mẫu",chart:"knee-flexion"},
      {label:"Sai số và thay đổi",items:[
        {lead:"SEM/MDC:",text:"phải tương ứng phép đo và quần thể. Nghiên cứu gối i-Goni v1.1 ở 60 người OA/sau thay khớp không xác nhận sai số cho mọi ứng dụng điện thoại [J Knee Surg]."},
        {lead:"Trong app:",text:"ghi mức thay đổi bằng độ; chưa tự kết luận vượt MDC hoặc cải thiện thật vì form chưa xác nhận quy trình nghiên cứu. Vượt sai số cũng không đồng nghĩa cải thiện có ý nghĩa với người bệnh."},
        {lead:"Mục tiêu chức năng:",text:"đặt cùng nhóm điều trị theo nhiệm vụ cần đạt và tình trạng cá nhân; không dùng một mốc gập gối 110° cho mọi quá trình phục hồi."},
      ]},
    ],
    numbers:[{value:"2–69 tuổi",text:"Phạm vi tuổi của bảng CDC trong app; không là chỉ định tập."},{value:"18–29 tuổi",text:"Mẫu người khỏe của nguồn cột sống JTSS; không ngoại suy cho người lớn tuổi."}],
    myths:[{say:"“Dưới trung bình là bị hạn chế bệnh lý.”",real:"Trung bình không là ngưỡng chẩn đoán. Cần xem triệu chứng, chức năng và phương pháp đo [CDC; JTSS]."},{say:"“Mọi app đo góc đều tương đương thước.”",real:"Độ tin cậy/giá trị thay đổi theo ứng dụng, khớp và quy trình; không suy từ một nghiên cứu sang mọi app [Keogh 2019]."}],
    apply:[{lead:"Theo dõi:",text:"giữ cùng quy trình, ghi số thô và hoàn cảnh đo. Nếu giảm ROM kèm triệu chứng mới, cần đánh giá chuyên môn thay vì chỉ tăng kéo giãn."}],
    quiz:[{q:"Người 75 tuổi có thể tự lấy bảng CDC nhóm 45–69 làm chuẩn cá nhân không?",a:"Không. App hiển thị ngoài phạm vi dữ liệu thay vì ngoại suy."},{q:"Đổi từ thước sang điện thoại rồi tăng 8°: có kết luận tiến bộ không?",a:"Chưa. Khác phương pháp có thể góp vào khác biệt; cần đo lại theo quy trình nhất quán [Keogh 2019]."}],
    sources:[{label:"CDC · Bảng ROM",url:"https://archive.cdc.gov/www_cdc_gov/ncbddd/jointrom/index.html"},{label:"JTSS 2023 · ROM cột sống",url:"https://www.jtss.org/articles/normative-values-for-cervical-and-lumbar-range-of-motion-in-healthy-young-adults/doi/jtss.galenos.2023.33042"},{label:"Keogh 2019 · Đo ROM điện thoại",url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC6505893/"},{label:"J Knee Surg · i-Goni và goniometer",url:"https://doi.org/10.1055/s-0036-1593877"}],
  },
  {
    id:"control",tab:"Kiểm soát chuyển động",kicker:"04 · Motor control",title:"Kiểm soát chuyển động",
    gist:"Cách hướng dẫn và thực hành ảnh hưởng học vận động. Kết quả trung bình nghiên cứu không bảo đảm một cue phù hợp mọi người hoặc điều trị được nguyên nhân đau.",
    parts:[
      {label:"Hướng chú ý",intro:"Tổng quan Chua so sánh hướng chú ý vào hiệu ứng chuyển động bên ngoài với bộ phận cơ thể; kết quả trung bình ủng hộ hướng bên ngoài trong các nhiệm vụ được nghiên cứu [Chua 2021].",table:{head:["Nhiệm vụ","Ví dụ cue bên ngoài"],rows:[{cells:["Squat","Đẩy sàn ra xa"]},{cells:["Hip hinge","Đưa hông về bức tường phía sau"]},{cells:["Ném bóng","Đưa bóng tới mục tiêu"]}]},note:"Các câu trên là ví dụ do app soạn để minh họa, chưa được nghiên cứu riêng hoặc xác nhận cho người có chấn thương."},
      {label:"Đau lưng mạn không đặc hiệu",intro:"Cochrane 2016 không tìm thấy ưu thế quan trọng của bài kiểm soát vận động so với các hình thức tập khác. Lựa chọn cần xét sở thích, năng lực chuyên môn, chi phí và an toàn [Cochrane CD012004].",items:[{lead:"Không suy nguyên nhân:",text:"kết quả một test hoặc cảm giác khó kích hoạt cơ không xác nhận cơ đó gây đau hay mọi người cần tập cô lập cùng một cơ."}]},
    ],
    numbers:[{value:"Theo nhiệm vụ",text:"Đánh giá lại thực hiện, khả năng giữ kỹ năng và mục tiêu cá nhân; không biến hiệu ứng trung bình thành phần trăm cải thiện bảo đảm."}],
    myths:[{say:"“Đau lưng luôn do lõi yếu.”",real:"Không xác định được nguyên nhân như vậy từ đánh giá vận động; bài kiểm soát vận động không vượt trội rõ các bài khác cho LBP mạn không đặc hiệu [Cochrane]."},{say:"“Một cue sẽ sửa kỹ thuật cho mọi người.”",real:"Thử cue đơn giản, quan sát và điều chỉnh. Các ví dụ của app là hướng dẫn huấn luyện chưa được thẩm định thành điều trị."}],
    apply:[{lead:"Thử một thay đổi mỗi lần:",text:"so mức thực hiện và cảm giác trước/sau; chọn tải và hỗ trợ phù hợp. Không tăng độ bất ổn chỉ vì coi đó là tiến bộ bắt buộc."}],
    quiz:[{q:"Không thích plank thì không thể cải thiện đau lưng mạn?",a:"Không đúng. Có nhiều lựa chọn tập; chọn cùng nhóm điều trị theo tình trạng và khả năng duy trì [Cochrane CD012004]."},{q:"“Đẩy sàn ra xa” là cue đã được kiểm nghiệm riêng cho mọi người squat?",a:"Không. Đó là ví dụ do app soạn từ nguyên tắc hướng chú ý; cần quan sát đáp ứng cá nhân."}],
    sources:[{label:"Chua 2021 · Hướng chú ý và học vận động",url:"https://pubmed.ncbi.nlm.nih.gov/34843301/"},{label:"Cochrane CD012004 · Motor control và LBP mạn",url:"https://www.cochrane.org/evidence/CD012004_motor-control-exercise-chronic-non-specific-low-back-pain"}],
  },
];
