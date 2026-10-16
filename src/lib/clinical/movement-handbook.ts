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
  "Các bài test vận động đo lặp lại khá ổn định, nhưng hầu hết các “ngưỡng nguy hiểm” nổi tiếng (FMS ≤14, lệch 10–15%, LSI 90%, gối đổ vào trong) dự báo chấn thương kém khi được kiểm chứng độc lập.",
  "Cách dùng tốt nhất: so học viên với chính họ theo thời gian, biết sai số của phép đo, và coi kết quả là mô tả để chọn bài tập. Đừng dùng kết quả để phán “bạn sắp chấn thương”.",
];

export const HANDBOOK: HandbookTopic[] = [
  {
    id: "patterns",
    tab: "Mẫu chuyển động",
    kicker: "01 · Movement patterns",
    title: "Mẫu chuyển động",
    gist: "Mẫu chuyển động là các kiểu vận động nền tảng mà mọi bài tập đều quy về. Quan sát mẫu cho bạn thấy học viên làm thế nào, nhưng không cho biết chắc vì sao họ làm vậy.",
    parts: [
      {
        label: "Khái niệm cốt lõi",
        items: [
          {
            lead: "Danh sách quen thuộc trong huấn luyện sức mạnh:",
            text: "squat, bản lề hông (hinge), lunge, đẩy, kéo, mang vác, cộng thêm xoay và chống xoay. Danh sách này đến từ giới huấn luyện; không hiệp hội nào (NSCA, ACSM) chuẩn hóa chính thức.",
            evidence: "convention",
          },
          {
            lead: "Phân biệt squat và hinge:",
            text: "hinge chủ yếu ở hông, cột sống trung tính, gối gập ít. Squat gập cả gối và hông, gối gập sâu hơn. Lunge là mẫu duy nhất đứng trước–sau không đối xứng.",
          },
          {
            lead: "Trong vật lý trị liệu,",
            text: "APTA coi “hệ vận động” là bản sắc của nghề, nhưng không chọn một hệ phân loại chẩn đoán duy nhất. Mô hình nổi tiếng nhất là Suy giảm Hệ Vận động (MSI) của Sahrmann cho đau thắt lưng.",
          },
        ],
      },
      {
        label: "Cách đánh giá trên học viên",
        intro: "Bộ sàng lọc được đặc tả rõ nhất là FMS (Functional Movement Screen): 7 bài, mỗi bài chấm 0–3, tối đa 21 điểm.",
        items: [
          { lead: "Bài hai bên:", text: "chấm cả hai bên, ghi điểm thấp hơn." },
          {
            lead: "Đau ở bất kỳ đâu = 0 điểm.",
            text: "Dừng sàng lọc và chuyển đánh giá chuyên sâu (SFMA hoặc chuyên gia).",
          },
          { lead: "Phân vân thì chấm thấp.", text: "" },
        ],
        table: {
          head: ["Bài", "Đạt 3 điểm khi", "Lỗi hay gặp"],
          rows: [
            { cells: ["Deep Squat", "Thân song song cẳng chân, đùi xuống dưới mặt phẳng ngang, gối thẳng hướng bàn chân, gậy nằm trên bàn chân", "Phải kê gót mới xuống được; gập lưng dưới"] },
            { cells: ["Hurdle Step", "Hông–gối–cổ chân thẳng hàng, thắt lưng ít di động", "Chạm rào, mất thăng bằng"] },
            { cells: ["In-Line Lunge", "Gậy chạm cột sống và thẳng đứng, gối sau chạm ván", "Thân nghiêng, mất thăng bằng"] },
            { cells: ["Shoulder Mobility", "Hai nắm tay sau lưng cách nhau ≤ 1 bàn tay", "Cách xa > 1,5 bàn tay"] },
            { cells: ["Active Straight Leg Raise", "Mắt cá vượt giữa đùi chân bên kia", "Chỉ lên dưới khe gối"] },
            { cells: ["Trunk Stability Push-Up", "Nam: ngón cái ngang trán; nữ: ngang cằm", "Thân “trễ”, hông lên trước"] },
            { cells: ["Rotary Stability", "Làm được kiểu cùng bên tay–chân", "Không làm được kiểu chéo"] },
          ],
        },
        note: "Ghi đúng cái bạn thấy (“gối trái đổ vào trong khi squat”), không ghi suy đoán về nguyên nhân (“cơ mông nhỡ yếu”).",
      },
    ],
    numbers: [
      { value: "ICC ≈ 0,84–0,87", text: "Độ tin cậy chấm FMS giữa và trong người chấm: tốt.", evidence: "moderate" },
      { value: "Độ nhạy 0,24", text: "Ngưỡng FMS ≤14 bỏ sót khoảng 3/4 số người chấn thương sau đó (AUC 0,58, Dorrel 2015).", evidence: "moderate" },
      { value: "OR 1,03 vs 1,80", text: "FMS gần như không liên quan chấn thương ở vận động viên trẻ, tăng nhẹ ở người trưởng thành (Moore 2019)." },
    ],
    myths: [
      { say: "“FMS dưới 14 điểm là sắp chấn thương.”", real: "Chỉ là tín hiệu tăng nhẹ xác suất ở vài nhóm vận động viên trưởng thành. Không dùng để dự báo cho từng người." },
      { say: "“Squat đổ gối là do cơ X yếu, cơ Y căng; cứ tập sửa là hết.”", real: "Chuỗi “lỗi → mất cân bằng cơ → bài sửa” chủ yếu đến từ tài liệu thương mại (NASM, FMS). Đó là giả thuyết để thử, chưa phải kết luận.", evidence: "weak" },
    ],
    apply: [
      { lead: "Chọn mức bài phù hợp:", text: "squat phải kê gót mới xuống được → bắt đầu bằng goblet squat hoặc box squat, rồi tăng biên độ và tải dần." },
      { lead: "Đau khi làm mẫu chuyển động", text: "là tín hiệu cần chuyên gia đánh giá, không phải lỗi kỹ thuật để tự sửa." },
      { lead: "Đánh giá lại sau 4–8 tuần", text: "bằng đúng bài test cũ để so học viên với chính họ." },
    ],
    quiz: [
      { q: "Học viên được 2 điểm bên trái, 3 điểm bên phải ở Hurdle Step. Ghi mấy điểm?", a: "2 điểm. Bài hai bên luôn ghi điểm của bên thấp hơn." },
      { q: "Học viên làm Deep Squat đẹp nhưng kêu đau gối. Chấm thế nào?", a: "0 điểm, dù chất lượng chuyển động tốt. Đau là cờ dừng sàng lọc và chuyển đánh giá chuyên sâu." },
      { q: "Tổng FMS 13. Nên nói gì với học viên?", a: "“Đây là điểm chất lượng vận động hiện tại; mình sẽ chọn bài tập từ các bài điểm thấp.” Không nói “bạn có nguy cơ chấn thương cao”, vì ngưỡng 14 dự báo kém cho từng người." },
    ],
    sources: [
      { label: "Cook 2014, FMS phần 1", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4060319/" },
      { label: "Cook 2014, FMS phần 2", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4127517" },
      { label: "Dorrel 2015", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4622382" },
    ],
  },
  {
    id: "symmetry",
    tab: "Cân đối cơ thể",
    kicker: "02 · Symmetry & balance",
    title: "Cân đối cơ thể",
    gist: "Cân đối gồm ba thứ khác nhau: trái–phải (lệch sức mạnh hay sức bật giữa hai bên), tư thế (dáng đứng tĩnh) và thăng bằng (giữ trọng tâm). Ai cũng hơi lệch; câu hỏi đúng là mức lệch có lớn hơn sai số đo và có đổi theo thời gian không.",
    parts: [
      {
        label: "Khái niệm cốt lõi",
        items: [
          { lead: "Có 12 công thức", text: "tính bất đối xứng khác nhau trong 53 nghiên cứu, và đổi công thức là đổi kết quả. Chọn một công thức và dùng mãi công thức đó." },
          { lead: "Bất đối xứng chỉ “thật”", text: "khi lớn hơn độ dao động giữa các lần thử của chính bài test đó (hệ số biến thiên, CV). CV tốt thường dưới 10%." },
          { lead: "Ở người khỏe,", text: "bên mạnh hơn có thể khác nhau giữa các bài test: nhảy xa hơn bằng chân phải nhưng đá mạnh hơn bằng chân trái." },
        ],
      },
      {
        label: "Công thức nên dùng (bài một chân)",
        intro: "%Lệch = (bên mạnh − bên yếu) ÷ bên mạnh × 100",
        items: [
          { text: "Ví dụ hai chân đạp 800 N và 700 N → lệch 12,5%, bất kể chân nào là chân “bệnh”. Công thức khác, khi đảo chân, có thể cho −14,3% cho cùng hiệu số 100 N; vì vậy phải cố định công thức." },
          { lead: "Sau phẫu thuật ACL", text: "người ta còn dùng LSI = chân bệnh ÷ chân lành × 100." },
        ],
      },
      {
        label: "Cách đánh giá trên học viên",
        table: {
          head: ["Bài test", "Ngưỡng hay dùng", "Thực tế"],
          rows: [
            { cells: ["Bộ bật nhảy một chân (single, triple, crossover, 6 m)", "LSI < 85–90%", "Đặc hiệu cao nhưng độ nhạy thấp: nhiều người có vấn đề vẫn “đạt”."], evidence: "convention" },
            { cells: ["Y-Balance (với về trước)", "Chênh > 4 cm", "Một nghiên cứu bóng rổ 2006; chỉ 3/13 nghiên cứu sau lặp lại được."], evidence: "weak" },
            { cells: ["Tỷ số đùi sau : tứ đầu", "≥ 0,60", "Khác theo môn; nữ thể thao đồng đội trung bình chỉ 0,56."], evidence: "weak" },
            { cells: ["Lực nắm tay", "“Quy tắc 10%”", "Đúng cho người thuận tay phải (chênh ~12,7%); người thuận trái gần như bằng nhau."], evidence: "convention" },
            { cells: ["Berg Balance Scale (người lớn tuổi)", "< 45 / 56", "Nguy cơ ngã cao; đặc hiệu 96% nhưng độ nhạy chỉ 53%."], evidence: "moderate" },
            { cells: ["Timed Up and Go", "> 13,5 giây", "Nguy cơ ngã ở người cao tuổi sống tại cộng đồng."], evidence: "moderate" },
            { cells: ["Sàng lọc vẹo cột sống (cúi trước Adams + scoliometer)", "ATR 5–7°", "Mức nên chuyển khám; chẩn đoán cần X-quang (góc Cobb)."], evidence: "moderate" },
          ],
        },
      },
    ],
    numbers: [
      { value: "33%", text: "Chỉ 6/18 nghiên cứu dùng ngưỡng lệch 10–15% có bằng chứng tốt cho ngưỡng đó." },
      { value: "28,6%", text: "Số vận động viên sau ACL thật sự đạt 90% khi so với sức chân lành trước chấn thương (EPIC), dù nhiều người đã đạt LSI 90%." },
      { value: "< 20 mm", text: "Chênh chiều dài chân dưới mức này thường không có ý nghĩa lâm sàng; ~90% dân số chênh trung bình ~5 mm." },
    ],
    myths: [
      { say: "“Lệch trên 10–15% là mất cân bằng nguy hiểm.”", real: "Liên quan giữa bất đối xứng và chấn thương “rất không nhất quán” (28 đoàn hệ). Chỉ bật nhảy một chân cho tín hiệu khá ổn định." },
      { say: "“Gù, đầu đưa ra trước, nghiêng chậu gây đau lưng, đau cổ.”", real: "Tổng hợp 41 tổng quan hệ thống: không có đồng thuận rằng tư thế gây đau lưng.", evidence: "strong" },
      { say: "“Đạt LSI 90% là được thi đấu lại.”", real: "Đó là một điều kiện cần trong cả bộ tiêu chí. Đồng thuận Bern 2016 coi trở lại thể thao là quá trình đa yếu tố, kể cả tâm lý." },
    ],
    apply: [
      { lead: "Đo mỗi bên 2–3 lần,", text: "lấy trung bình hoặc giá trị tốt nhất, ghi số thô từng bên; tỷ lệ phần trăm tính sau." },
      { lead: "Thấy lệch thì đo lại ở buổi sau", text: "trước khi kết luận. Lệch giảm dần theo thời gian là chương trình đang đúng hướng." },
      { lead: "Đừng làm học viên sợ tư thế.", text: "Tập cho khỏe và đa dạng tư thế, nhưng không hứa “chỉnh dáng hết đau”." },
      { lead: "Với người lớn tuổi,", text: "TUG > 13,5 giây hoặc Berg < 45 là lý do để thận trọng với bài thăng bằng và trao đổi với chuyên môn y tế." },
    ],
    quiz: [
      { q: "Single hop: chân trái 150 cm, chân phải 170 cm. Lệch bao nhiêu phần trăm?", a: "(170 − 150) ÷ 170 × 100 ≈ 11,8%. Tiếp theo, kiểm tra xem các lần thử của chính học viên dao động bao nhiêu trước khi coi đây là lệch thật." },
      { q: "Học viên thuận tay phải, lực nắm tay phải hơn tay trái 11%. Có đáng lo không?", a: "Thường không. Ở người thuận phải, chênh khoảng 10–13% là bình thường. Cùng mức chênh ở người thuận trái mới đáng chú ý hơn." },
      { q: "Vì sao LSI có thể “đẹp” mà chân bệnh vẫn yếu?", a: "Vì chân lành cũng yếu đi trong thời gian nghỉ và phục hồi. Chia chân bệnh cho một chân lành đã yếu thì tỷ lệ trông cao, trong khi cả hai chân đều chưa về mức trước chấn thương." },
    ],
    sources: [
      { label: "Parkinson 2021, 12 công thức bất đối xứng", url: "https://www.jssm.org/jssm-20-594.xml-Fulltext" },
      { label: "Wellsandt 2017, EPIC", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5483854" },
      { label: "Swain 2020, tư thế và đau lưng", url: "https://pubmed.ncbi.nlm.nih.gov/31451200/" },
    ],
  },
  {
    id: "rom",
    tab: "Biên độ vận động",
    kicker: "03 · Range of motion",
    title: "Biên độ vận động",
    gist: "Biên độ vận động (ROM) là góc mà khớp đi được, đo bằng độ. Không có một con số “bình thường” duy nhất: nó phụ thuộc tuổi, giới và bảng chuẩn bạn dùng. Thứ quan trọng nhất là biết sai số của phép đo.",
    parts: [
      {
        label: "Khái niệm cốt lõi",
        items: [
          { lead: "ROM chủ động", text: "do học viên tự đưa khớp đi; ROM thụ động do người đo đưa giúp. Thụ động thường lớn hơn chủ động một chút." },
          { lead: "Bảng chuẩn lệch nhau đáng kể.", text: "AAOS ghi duỗi hông 30° và gập mu cổ chân 20°, nhưng CDC đo thực tế ở người lớn khỏe chỉ khoảng 17° và 13°. Dùng AAOS làm ngưỡng thì phần lớn người khỏe bị coi là “hạn chế”." },
          { lead: "Theo tuổi và giới:", text: "nữ thường linh hoạt hơn nam. Từ nhóm 20–44 sang 45–69 tuổi, nam mất khoảng 4–5° gập gối và gập vai." },
          { lead: "MDC", text: "(thay đổi tối thiểu phát hiện được) = 2,77 × sai số đo chuẩn (SEM). Thay đổi nhỏ hơn MDC có thể chỉ là sai số đo." },
        ],
      },
      { label: "Gập gối: chuẩn tham chiếu và mốc chức năng", chart: "knee-flexion" },
      {
        label: "Cách đánh giá trên học viên",
        items: [
          { lead: "Thước đo góc", text: "là chuẩn lâm sàng. Ứng dụng điện thoại gần tương đương ở gối, khuỷu, cổ chân, cổ tay, nhưng kém ở xoay thân và xoay cổ." },
          { lead: "Giữ nguyên dụng cụ, tư thế và người đo", text: "giữa các lần; đổi dụng cụ làm số liệu không so được với nhau." },
          { lead: "Đo bằng video", text: "(AI ước lượng tư thế) dùng được để xem xu hướng ở mặt phẳng đứng dọc. Không nên dùng ở tầm cuối, cổ chân hay chuyển động xoay, vì sai số có thể tới ±12°." },
        ],
        table: {
          head: ["Test linh hoạt", "Cách đọc", "Ghi chú"],
          rows: [
            { cells: ["Lunge chạm tường (knee-to-wall)", "< 10 cm", "Gợi ý hạn chế gập mu cổ chân; 1 cm ≈ 3,6°. Rất tin cậy (ICC 0,97–0,99), nhưng ngưỡng là quy ước."], evidence: "convention" },
            { cells: ["Duỗi gối chủ động 90-90 (đùi sau)", "MDD 7–8°", "Thay đổi dưới 7–8° có thể chỉ là sai số."], evidence: "moderate" },
            { cells: ["Thomas cải biên (gập hông)", "—", "Chỉ đáng tin khi kiểm soát được nghiêng chậu."], evidence: "weak" },
            { cells: ["Beighton (tăng động khớp)", "≥ 5/9 (dậy thì–50 tuổi)", "≥ 6 trước dậy thì, ≥ 4 trên 50 tuổi (đồng thuận 2017). Đạt ngưỡng ≠ hội chứng Ehlers-Danlos."], evidence: "moderate" },
          ],
        },
      },
    ],
    numbers: [
      { value: "MDC ≈ 9°", text: "Gập gối đo bằng thước đo góc (SEM 3,41°). Từ 100° lên 106° chưa chắc đã là tiến bộ thật." },
      { value: "110°", text: "Mục tiêu gập gối hợp lý khi phục hồi: đủ cho cầu thang và ngồi ghế." },
      { value: "10–30 giây", text: "Giữ mỗi lần kéo giãn (30–60 giây cho người lớn tuổi), ≥ 2–3 buổi/tuần, khoảng 60 giây mỗi nhóm cơ (ACSM).", evidence: "strong" },
      { value: "< 60 giây", text: "Kéo giãn tĩnh dưới mức này mỗi nhóm cơ trước tập chỉ giảm ~1% thành tích; khởi động động sau đó xóa ảnh hưởng." },
    ],
    myths: [
      { say: "“Chưa đạt số trong sách (AAOS) là khớp bị hạn chế.”", real: "Nhiều giá trị AAOS cao hơn mức người khỏe thật sự đạt. So với chuẩn theo tuổi, giới và với bên đối diện." },
      { say: "“Kéo giãn trước khi tập là hại, làm yếu cơ.”", real: "Chỉ đúng khi giữ lâu (≥ 60 giây mỗi nhóm cơ). Kéo giãn ngắn kèm khởi động động gần như không ảnh hưởng thành tích.", evidence: "strong" },
    ],
    apply: [
      { lead: "Chụp “đường nền” ROM ở buổi đầu", text: "cho các khớp liên quan mục tiêu; đo lại sau mỗi 3–4 tuần, cùng dụng cụ, cùng tư thế. Ghi số đo vào tab “Biên độ khớp” trong hồ sơ học viên." },
      { lead: "Đặt mục tiêu theo chức năng:", text: "học viên cần squat sâu, leo cầu thang hay với lên kệ cao, thay vì con số trong sách." },
      { lead: "ROM hai bên chênh rõ, hoặc giảm kèm đau:", text: "ghi lại và cân nhắc chuyển chuyên gia, nhất là sau chấn thương." },
    ],
    quiz: [
      { q: "Học viên nam 50 tuổi gập vai được 160°. Có “kém” không?", a: "Thấp hơn trung bình CDC nhóm nam 45–69 tuổi (164°) khoảng 4°, hoàn toàn có thể nằm trong dao động bình thường. So thêm với vai bên kia và với chức năng thực tế." },
      { q: "Buổi trước đo gối bằng thước đo góc, buổi này bằng app điện thoại, tăng 8°. Kết luận được gì?", a: "Gần như không kết luận được, vì đã đổi dụng cụ. Lần sau đo lại bằng cùng một dụng cụ." },
      { q: "Knee-to-wall được 8 cm ở một học viên rất cao. Có chắc là hạn chế gập mu cổ chân?", a: "Chưa chắc. Ngưỡng 10 cm chỉ là quy ước, và người cao có xương chày dài hơn. Đo thêm góc xương chày bằng inclinometer hoặc so với bên kia sẽ rõ hơn." },
    ],
    sources: [
      { label: "CDC Normal Joint ROM (Soucie 2011)", url: "https://archive.cdc.gov/www_cdc_gov/ncbddd/jointrom/index.html" },
      { label: "Keogh 2019, đo bằng điện thoại", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6505893/" },
      { label: "Behm 2016, kéo giãn", url: "https://nectar.northampton.ac.uk/id/eprint/8154/" },
    ],
  },
  {
    id: "control",
    tab: "Kiểm soát chuyển động",
    kicker: "04 · Motor control",
    title: "Kiểm soát chuyển động",
    gist: "Kiểm soát chuyển động là khả năng hệ thần kinh điều khiển cơ để thực hiện đúng ý định: đúng hướng, đúng lúc, đúng lực. Đây là mục có bằng chứng mạnh nhất về can thiệp (cách dạy và cách tập), dù phần sàng lọc vẫn yếu.",
    parts: [
      {
        label: "Khái niệm cốt lõi",
        items: [
          { lead: "Vận động sinh ra từ ba yếu tố:", text: "con người, nhiệm vụ và môi trường (mô hình định hướng nhiệm vụ của Shumway-Cook & Woollacott). Đổi nhiệm vụ hoặc môi trường cũng là đổi bài tập." },
          { lead: "Học vận động khác với biểu hiện trong buổi tập.", text: "Cách tập làm buổi tập trông “mượt” chưa chắc giúp học viên nhớ lâu." },
          { lead: "“Ổn định lõi” đã được hiểu lại.", text: "Phát hiện cơ ngang bụng (TrA) co trễ ở người đau lưng (Hodges 1996) từng sinh ra trào lưu tập cô lập TrA. Ngày nay, thay đổi cách dùng cơ khi đau được xem là thích nghi bảo vệ, khác nhau ở mỗi người." },
        ],
      },
      {
        label: "Cách dạy: chú ý bên ngoài",
        intro: "Lời hướng dẫn hướng vào hiệu ứng của chuyển động (bên ngoài) giúp học viên làm tốt hơn và nhớ lâu hơn lời hướng dẫn hướng vào bộ phận cơ thể (bên trong). Tổng hợp hơn 100 nghiên cứu: hiệu ứng ~0,26 cho thành tích và ~0,58 cho khả năng học.",
        table: {
          head: ["Bài", "Hướng vào cơ thể", "Hướng ra ngoài"],
          rows: [
            { cells: ["Squat", "“Duỗi gối, siết mông”", "“Đẩy sàn ra xa”"] },
            { cells: ["Kiểm soát gối", "“Kích hoạt cơ mông nhỡ”", "“Giữ gối hướng về hai vạch trên sàn”"] },
            { cells: ["Hip hinge", "“Gập hông, giữ lưng thẳng”", "“Đẩy hông chạm bức tường phía sau”"] },
            { cells: ["Bench press", "“Duỗi khuỷu tay”", "“Đẩy thanh đòn về phía trần”"] },
          ],
        },
        note: "Các câu trong bảng là ví dụ minh họa nguyên tắc, không phải lời hướng dẫn được nghiên cứu kiểm chứng riêng.",
      },
      {
        label: "Cách đánh giá trên học viên",
        items: [
          { lead: "Squat một chân, bước xuống bậc:", text: "quan sát gối, chậu, thân. Thang chấm 2–3 mức (tốt / chưa tốt) đáng tin hơn thang 4 mức, vì chấm càng chi tiết càng kém nhất quán." },
          { lead: "Bộ test Luomajoki", text: "cho vùng thắt lưng: cúi chào kiểu bồi bàn, nghiêng chậu, đứng một chân, duỗi gối khi ngồi, đung đưa ở tư thế bò, gập gối nằm sấp. Mỗi test chấm đạt/không đạt." },
          { lead: "Vai:", text: "test rối loạn vận động bả vai McClure, quan sát từ phía sau khi giơ tay có tạ nhẹ, chấm bình thường / nhẹ / rõ. Lệch bả vai rất hay gặp và không chắc là nguyên nhân gây đau." },
        ],
      },
    ],
    numbers: [
      { value: "−50%", text: "Chương trình tập thần kinh–cơ giảm khoảng một nửa chấn thương dây chằng chéo trước (OR 0,50, tổng hợp 8 meta-analysis).", evidence: "strong" },
      { value: "−39%", text: "FIFA 11+ giảm chấn thương bóng đá khi tập ≥ 2–3 buổi/tuần; bản FIFA 11 cũ không hiệu quả.", evidence: "strong" },
      { value: "29 RCT", text: "Cochrane: bài tập kiểm soát vận động cho đau lưng mạn không tốt hơn các loại bài tập khác về mặt lâm sàng.", evidence: "strong" },
    ],
    myths: [
      { say: "“Đau lưng là do lõi yếu; phải kích hoạt cơ ngang bụng trước rồi mới tập nặng.”", real: "Cochrane: bài tập kiểm soát vận động ngang bằng các loại bài tập khác. Chọn bài học viên thích và duy trì được." },
      { say: "“Gối đổ vào trong khi nhảy là sẽ đứt dây chằng chéo.”", real: "Nghiên cứu 710 vận động viên (Krosshaug 2016): test bật nhảy là công cụ sàng lọc kém. Kiểm soát gối vẫn là mục tiêu kỹ thuật tốt, nhưng không phải lời tiên đoán." },
      { say: "“Phải sàng lọc tìm người có nguy cơ rồi mới cho tập phòng ngừa.”", real: "Sàng lọc cá nhân dự báo kém, còn chương trình khởi động cho cả nhóm lại hiệu quả. Cho mọi người cùng tập và theo dõi việc tập đều đặn." },
    ],
    apply: [
      { lead: "Đổi lời hướng dẫn trước khi đổi bài.", text: "Một câu hướng ra ngoài thường sửa kỹ thuật nhanh hơn một bài tập sửa lỗi mới." },
      { lead: "Tăng độ khó dần:", text: "tĩnh → động, vững → kém vững, chậm → nhanh, đơn giản → phức tạp, môi trường quen → môi trường thay đổi. Đây là nguyên tắc kinh nghiệm hợp với bằng chứng, chưa phải thuật toán đã kiểm chứng.", evidence: "convention" },
      { lead: "Khi học viên đã quen bài,", text: "chuyển từ tập theo khối sang xen kẽ ngẫu nhiên. Buổi tập trông kém mượt hơn nhưng học viên nhớ lâu hơn, nhất là người lớn tuổi." },
      { lead: "Với nhóm chơi thể thao,", text: "đưa phần khởi động thần kinh–cơ (kiểu FIFA 11+) vào ≥ 2–3 buổi/tuần. Tập đều đặn quan trọng hơn bài nào hay hơn." },
      { lead: "Cho học viên chọn một phần,", text: "ví dụ thứ tự bài hay lúc xem video phản hồi. Cảm giác tự chủ có thể giúp học, dù bằng chứng còn đang tranh luận." },
    ],
    quiz: [
      { q: "Học viên squat bị đổ gối. Câu nào hướng ra ngoài: “Siết mông” hay “Đẩy gối về phía ngón chân út”?", a: "“Đẩy gối về phía ngón chân út” gần với hướng ra ngoài hơn vì có điểm tham chiếu bên ngoài. Tốt hơn nữa: đặt hai vạch trên sàn và nói “giữ gối hướng về hai vạch”." },
      { q: "Học viên đau lưng mạn không thích plank, bird-dog, chỉ thích đi bộ nhanh và tập máy. Có sao không?", a: "Không sao về mặt bằng chứng. Bài tập kiểm soát vận động không vượt trội các loại bài tập khác, nên bài học viên thích và duy trì được thường là lựa chọn tốt." },
      { q: "Tập theo khối hay ngẫu nhiên giúp nhớ kỹ năng lâu hơn?", a: "Ngẫu nhiên, khi học viên đã nắm cơ bản. Trong buổi tập trông kém hơn, nhưng khả năng giữ và chuyển giao kỹ năng tốt hơn." },
    ],
    sources: [
      { label: "Chua 2021, chú ý bên ngoài", url: "https://digitalscholarship.unlv.edu/kns_fac_articles/424" },
      { label: "Cochrane CD012004 (Saragiotto 2016)", url: "https://cochranelibrary.com/cdsr/doi/10.1002/14651858.CD012004/information" },
      { label: "Krosshaug 2016", url: "https://nih.brage.unit.no/nih-xmlui/bitstream/handle/11250/2394616/KrosshaugAmJSportMed2016.pdf?sequence=1" },
      { label: "Thorborg 2017, FIFA 11+", url: "https://pubmed.ncbi.nlm.nih.gov/28087568/" },
    ],
  },
];
