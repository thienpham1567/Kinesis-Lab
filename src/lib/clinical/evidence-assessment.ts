import { HANDBOOK } from "./movement-handbook";
import { ROM_MOVEMENTS } from "./rom-norms";
import type { EvidenceRecord, EvidenceSource } from "./evidence-types";
const source = (title: string, url: string, access: string): EvidenceSource => ({title,url,access,checkedAt:"2026-10-19"});
const record = (sources: EvidenceSource[], supportedClaims: string[], limitations: string[] = []): EvidenceRecord => ({sources,supportedClaims,limitations:[...limitations,"Chưa được chuyên gia độc lập duyệt; đối chiếu nguồn không là xác nhận lâm sàng."],reviewedBy:null,status:"limited"});
export const HANDBOOK_EVIDENCE: Record<string,EvidenceRecord> = Object.fromEntries(HANDBOOK.map(t=>[t.id,record(t.sources.map(s=>source(s.label,s.url,
  s.label.startsWith("CDC") ? "Bảng 11 động tác theo tuổi/giới và mô tả mẫu" :
  s.label.startsWith("JTSS") ? "Toàn văn: abstract, methods và results" :
  s.label.startsWith("Parkinson") ? "Toàn văn: công thức, giới hạn ngưỡng và kết luận" :
  s.label.startsWith("Keogh") ? "Toàn văn: abstract, methods và kết luận; không xác nhận mọi app" :
  s.label.startsWith("Cochrane") ? "Bản tóm tắt công khai và kết luận tổng quan" : "Hồ sơ thư mục và abstract; không suy chi tiết ngoài abstract")),
  ["Các nhận định trong bài ghi tên nguồn trong ngoặc vuông; nguồn chỉ hỗ trợ phạm vi được mô tả.","Các cue và cách ghi chép được đánh dấu ví dụ/quy ước của app; không là test hoặc phác đồ điều trị đã thẩm định."],
  ["Không dùng điểm test, bất đối xứng hoặc trung bình ROM làm công cụ chẩn đoán/cấp phép tập."])]));
export const ROM_EVIDENCE: Record<string,EvidenceRecord> = Object.fromEntries(ROM_MOVEMENTS.map(m=>[m.id,record([source(typeof m.means === "number" ? "JTSS 2023 · 300 người khỏe 18–29 tuổi" : "CDC/Soucie · 11 động tác, tuổi 2–69",m.source,typeof m.means === "number" ? "Toàn văn: mẫu, quy trình đo chủ động và kết quả" : "Bảng tham chiếu theo tuổi và giới")],
  [typeof m.means === "number" ? "Giá trị là trung bình gộp của mẫu 18–29 tuổi; hai hướng nghiêng/xoay cổ hiển thị trung bình làm tròn, không là số riêng từng bên." : "Giá trị chép từ bảng CDC cho đúng động tác, nhóm tuổi và giới.","App chỉ hiển thị mức thay đổi thô; không suy cải thiện hoặc độ tin cậy từ danh mục dụng cụ."],
  ["Trung bình không là ranh giới bệnh hoặc mục tiêu điều trị. Cần khớp quy trình đo và quần thể.","MDC của nghiên cứu gối i-Goni v1.1 (OA/sau thay khớp) không áp dụng tự động cho form hiện tại."])]));
export const SCREENING_EVIDENCE = record([
  source("CSEP · Pre-screening / Get Active Questionnaire","https://csep.ca/2021/01/20/pre-screening-for-physical-activity/","Hướng dẫn công khai; liên kết công cụ chính thức, không sao chép bản dịch"),
  source("NHS · Chest pain","https://www.nhs.uk/symptoms/chest-pain/","Dấu hiệu cần trợ giúp khẩn"),
  source("NICE NG59 · Recommendations","https://www.nice.org.uk/guidance/ng59/chapter/Recommendations","Khuyến cáo 1.1.1 và 1.2.1–1.2.2: chẩn đoán phân biệt, hoạt động và tập cá thể hóa"),
],["[CSEP] Trả lời có cần xem xét thêm theo triệu chứng; không tự động cấm mọi hoạt động hoặc cấp phép từ câu trả lời không.","[NHS] Đau ngực có dấu hiệu cấp cứu cần trợ giúp ngay.","[NICE] Tên bệnh cột sống không tạo danh sách bài cấm chung."],["Bảy câu của app là bảng kiểm tự xây dựng, chưa thẩm định; không phải PAR-Q+ chính thức hoặc bản dịch được xác thực.","Khớp từ khóa chỉ tạo nhắc nhở, không phân tầng nguy cơ đã được kiểm định."]);
export const MEDICATION_EVIDENCE = record([
  source("ADA 2016 · Physical Activity/Exercise and Diabetes","https://doi.org/10.2337/dc16-1728","Tuyên bố và bảng thuốc: insulin/secretagogues, metformin và SGLT2"),
  source("AHA · Beta-blocker and exercise","https://www.heart.org/en/health-topics/consumer-healthcare/medication-information/how-do-beta-blocker-drugs-affect-exercise","Hướng dẫn công khai về HR, stress test và nỗ lực cảm nhận"),
  source("NHS · Anticoagulants","https://www.nhs.uk/medicines/anticoagulants/","Tổng quan nhóm thuốc và nguy cơ chảy máu"),
  source("NHS · Clopidogrel","https://www.nhs.uk/medicines/clopidogrel/","Hồ sơ thuốc kháng tiểu cầu"),
  source("NHS · Statins","https://www.nhs.uk/medicines/statins/","Hướng dẫn công khai: triệu chứng cơ và trao đổi bác sĩ"),
],["[ADA] Nguy cơ hạ glucose do tập phụ thuộc nhóm thuốc và phối hợp; không gán metformin/SGLT2 đơn độc cùng nguy cơ với insulin.","[AHA] Mục tiêu HR có thể được bác sĩ cá thể hóa; RPE/talk test là lựa chọn theo dõi khi thích hợp.","[NHS] Kháng tiểu cầu và chống đông là các nhóm khác; nhắc nguy cơ chảy máu không thay thế đối chiếu đơn thuốc."],["Không phải danh mục tương tác thuốc đầy đủ. Không tự thay liều/ngừng thuốc; cần xác nhận đơn hiện tại với bác sĩ/dược sĩ."]);
export const LAB_EVIDENCE = record([source("MedlinePlus · How to Understand Your Lab Results","https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/","Toàn trang hướng dẫn: khoảng tham chiếu, đơn vị, giới hạn và yếu tố ảnh hưởng")],
  ["[MedlinePlus] Diễn giải phụ thuộc khoảng tham chiếu trên phiếu, đơn vị và bối cảnh. Trong/ngoài khoảng không tự xác định khỏe/bệnh.","App chép dữ liệu và giữ cờ unknown khi phiếu không ghi cờ. Bản nháp phải được người dùng đối chiếu và xác nhận trước khi lưu."],
  ["Vision có thể đọc sai; xác nhận chỉ có nghĩa người dùng đã đối chiếu bản chép, không phải bác sĩ đã diễn giải. Không tự kê bổ sung hoặc kết luận bệnh.","Các nhận định AI cũ trong hồ sơ chưa được rà soát lại và không được dùng như kết luận y tế."]);
export const ASSISTANT_EVIDENCE = record([...SCREENING_EVIDENCE.sources.slice(0,2), ...LAB_EVIDENCE.sources],
  ["Trợ lý được cung cấp nguồn theo chủ đề và giới hạn truy cập; yêu cầu trích dẫn nguồn thực sự có trong ngữ cảnh.","Không sinh phác đồ trigger point từ vùng đau hoặc coi bản đồ/mesh là đo lường cá nhân."],
  ["Đây là chính sách xử lý của app, không là nghiên cứu xác nhận chất lượng đầu ra AI. Prompt không bảo đảm mô hình tuân thủ; từng câu trả lời cần kiểm tra.","Không gọi một kết quả PubMed hoặc tệp tải lên là nội dung đã được app/chuyên gia thẩm định."]);
