// NCSF Vietnam CPT student materials (deploy permitted by NCSF per the user, 2026-10-22).
// PDFs + quiz.json live in the private Supabase bucket below (uploaded by
// scripts/ncsf-upload.mjs) and are served only after the password gate.
// Never move them into `public/` or git.
export const NCSF_SOURCE = "https://ncsfvietnam.com.vn/document-category/cpt/";
export const NCSF_BUCKET = "ncsf";

export const NCSF_CPT = [
  { slug: "01-suc-khoe-the-duc", title: "Chương 1 – Sức khoẻ và Thể dục thể chất" },
  { slug: "02-giai-phau-chuc-nang", title: "Chương 2 – Giải phẫu chức năng và Hướng dẫn tập luyện" },
  { slug: "03-he-nang-luong", title: "Chương 3 – Hiểu về hệ năng lượng" },
  { slug: "04-sang-loc-danh-gia", title: "Chương 4 – Sàng lọc, Đánh giá và Thực hành chuyên nghiệp" },
  { slug: "05-dinh-duong", title: "Chương 5 – Dinh dưỡng" },
  { slug: "06-quan-ly-can-nang", title: "Chương 6 – Quản lý cân nặng" },
  { slug: "07-len-chuong-trinh", title: "Chương 7 – Các yếu tố cần xem xét khi lên chương trình tập luyện" },
  { slug: "08-doi-tuong-dac-biet", title: "Chương 8 – Lên chương trình tập cho nhóm đối tượng đặc biệt" },
  { slug: "09-de-cuong-on-tap", title: "Đề cương ôn tập" },
  { slug: "10-de-thi-thu-1", title: "Đề thi thử 150 câu (1)" },
  { slug: "11-de-thi-thu-2", title: "Đề thi thử 150 câu (2)" },
  { slug: "00-video-bai-hoc", title: "Video bài học" },
] as const;

// Lesson start pages per chapter (index 0 = Chương 1), read from each "Bài N" heading page.
export const NCSF_LESSONS: { title: string; from: number }[][] = [
  [
    { title: "Lối sống khỏe mạnh (wellness)", from: 1 },
    { title: "Thành phần sức khỏe & hiệu suất", from: 12 },
    { title: "Hoạt động thể chất & bệnh tim mạch", from: 23 },
    { title: "Béo phì, tiểu đường & ung thư", from: 33 },
    { title: "Xương khớp & sức khỏe tinh thần", from: 42 },
  ],
  [
    { title: "Sinh lý học cơ xương", from: 1 },
    { title: "Giải phẫu chức năng & kỹ thuật kháng lực", from: 15 },
    { title: "Chuỗi chuyển động & chức năng vận động", from: 40 },
    { title: "Đơn vị cơ bắp & sai lệch tư thế", from: 50 },
    { title: "Bài tập điều chỉnh", from: 66 },
  ],
  [
    { title: "Hệ năng lượng", from: 1 },
    { title: "Sinh lý hệ tim mạch", from: 19 },
    { title: "Hệ thống nội tiết", from: 34 },
  ],
  [
    { title: "Yếu tố tác động đến thể lực", from: 1 },
    { title: "Sàng lọc trước khi tập luyện", from: 6 },
    { title: "Đánh giá thể trạng lúc nghỉ", from: 21 },
    { title: "Phương pháp kiểm tra & đặt mục tiêu", from: 37 },
    { title: "Các bài đánh giá", from: 47 },
  ],
  [
    { title: "Năng lượng & carbohydrate", from: 1 },
    { title: "Chất béo & chất đạm", from: 19 },
    { title: "Vitamin, khoáng chất & nước", from: 28 },
    { title: "Nhãn thực phẩm & ngành bổ sung", from: 42 },
    { title: "Thực phẩm bổ sung & ergogenic aids", from: 53 },
  ],
  [
    { title: "Béo phì & thành phần cơ thể", from: 1 },
    { title: "Cân bằng năng lượng", from: 13 },
    { title: "Chiến lược giảm cân & rối loạn ăn uống", from: 27 },
  ],
  [
    { title: "Giới thiệu thiết kế chương trình", from: 1 },
    { title: "Yếu tố chuyển hóa & thành phần chương trình", from: 8 },
    { title: "Nguyên tắc, phân kỳ & an toàn", from: 20 },
    { title: "Kháng lực theo mục tiêu thích nghi", from: 29 },
    { title: "Hệ thống tập luyện kỵ khí", from: 48 },
    { title: "Lưu ý kỵ khí & chấn thương", from: 58 },
    { title: "Đánh giá CRF & phương pháp", from: 70 },
    { title: "Khái niệm & chiến lược tim mạch", from: 82 },
    { title: "Lưu ý tim mạch & chấn thương", from: 93 },
    { title: "Độ linh hoạt & yếu tố ảnh hưởng", from: 102 },
    { title: "Các loại hình linh hoạt", from: 115 },
    { title: "Thiết kế chương trình theo giai đoạn", from: 124 },
  ],
  [
    { title: "Hen suyễn, tiểu đường & tim mạch", from: 1 },
    { title: "Trẻ em, người cao tuổi & phụ nữ mang thai", from: 19 },
  ],
];

export const lessonOf = (ch: number, page: number) =>
  NCSF_LESSONS[ch - 1].findLastIndex((l) => page >= l.from);
