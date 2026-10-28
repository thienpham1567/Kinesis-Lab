# Kinesis Lab — PT Medical & Exercise Science Agent

Clinical co-pilot cho Personal Trainer: hồ sơ bệnh lý học viên, sàng lọc Red Flags, truy xuất bằng chứng theo nguồn, PubMed, đọc phiếu xét nghiệm/InBody.

## Chạy local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

### Biên soạn đề NCSF riêng tư

Khi đã có bộ tài liệu được cấp quyền trong `.data/ncsf/`, chạy `NCSF_LOCAL_CONTENT=1 npm run dev` để xem JSON và hình đang sửa ở local; vẫn cần đăng nhập NCSF. Cờ này chỉ hoạt động ở development, không có tác dụng trên production. Chạy `npm run ncsf:figures` để render các trang hình được câu hỏi tham chiếu, sau đó `npm run check:ncsf-quiz` để kiểm tra dữ liệu và bảng coverage. Các kiểm tra không xác nhận tính đúng y khoa.

PDF, ngân hàng câu hỏi và hình NCSF giữ trong thư mục/bucket riêng tư; không thêm vào `public/` hoặc git. Khi phát hành, cập nhật mã giao diện và ngân hàng/hình tương ứng cùng nhau để tránh câu phụ thuộc hình xuất hiện trên giao diện cũ.

Sau khi triển khai mã tương ứng, `node --env-file=.env.local scripts/ncsf-upload.mjs` chỉ cập nhật đề và hình, sao lưu đề đang phục vụ và kiểm tra hash sau tải lên. Chỉ dùng `--include-pdfs` khi chủ động khởi tạo/cập nhật PDF; mặc định giữ nguyên các PDF.

## Biến môi trường

| Key | Việc |
| --- | --- |
| `OPENROUTER_API_KEY` | Bắt buộc. Chat, Vision, embedding đều đi qua OpenRouter. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Hồ sơ học viên, vector tài liệu bằng chứng. |
| `NCBI_EMAIL` / `NCBI_API_KEY` | Tuỳ chọn, lịch sự với PubMed. |
| `SITE_URL` | Origin HTTPS thực tế khi tự host; dùng cho canonical và URL ảnh chia sẻ của landing. Vercel tự cung cấp hostname production. |

Model mặc định (đổi được trong `.env.local`):

- Lập luận lâm sàng: `google/gemini-3.8-flash`
- Đọc ảnh xét nghiệm/InBody: `google/gemini-2.5-pro`
- Tra cứu nhanh: `google/gemini-3.8-flash`
- Embedding: `google/gemini-embedding-2 (1.536 chiều)`

## Supabase

1. Tạo project, bật extension `vector`.
2. SQL Editor → chạy `supabase/migrations/001_initial_schema.sql`.
3. Dán URL + service role key vào `.env.local`.

Không expose service role ra trình duyệt. Mọi truy vấn đi qua API routes.

## Việc nên làm trên app

1. **Nguồn chat** — guideline, tổng quan hệ thống và nghiên cứu đã đăng ký; xem nguồn và phạm vi trong từng lượt. Thư viện NCSF là nội dung học tập riêng.
2. **Học viên** — bệnh nền, thuốc, pain trigger, PAR-Q+.
3. **Xét nghiệm / InBody** — chụp phiếu, Gemini đọc chỉ số.
4. **Tư vấn** — hỏi bài tập; agent trích đoạn nguồn + PMID và kiểm tra chống chỉ định.

PT không chẩn đoán, không kê thuốc. Red Flags → chuyển bác sĩ.

## UI/UX skill của project

Skill `frontend-design` được cài tại `.agents/skills/frontend-design/` từ [Agentic Awesome Skills](https://github.com/sickn33/agentic-awesome-skills), release `v19.7.0` (commit `a3072641b750a1fb2f6ce695a5f984ea3d4c3ec1`). Codex nhận diện skill ở phạm vi project; có thể yêu cầu “Dùng frontend-design để nâng cấp giao diện”.

Giao diện dùng hướng **Clinical Field Notes**, với Be Vietnam Pro, IBM Plex Mono và các token trong `src/app/globals.css`. Icon, tiêu đề và trạng thái trống dùng chung tại `src/components/WorkspaceUI.tsx`.

Cài lại đúng skill và phiên bản:

```bash
npm exec --yes --ignore-scripts --package=agentic-awesome-skills@19.7.0 -- \
  agentic-awesome-skills --release 19.7.0 --path .agents/skills --skills frontend-design
```

## Kho bằng chứng cho chat

Cấu hình trên Vercel phải dùng cùng model với local. Đổi embedding model cần tạo lại vector; không trộn các không gian embedding dù cùng số chiều. Kho đầu tiên có 3 nguồn CC BY / 197 đoạn (WHO hoạt động thể chất, tổng quan bài tập đau lưng, thử nghiệm lateral raise), chưa bao phủ toàn bộ y học. Registry lưu DOI, giấy phép, hash nội dung, ngày truy cập và phạm vi đọc; `reviewedBy: null`.

```bash
npm run evidence:prepare # tải XML và chuẩn bị metadata; không ghi database
npm run evidence:import  # tạo Gemini vectors và ghi collection đã chuẩn bị
npm run check:chat
```

Triển khai code và biến môi trường trước khi import. Import từ chối kho cũ chưa được đăng ký; runtime từ chối truy vấn nếu namespace/model không khớp hoặc collection chưa nhập đủ. Giữ `.data/evidence-corpus` để chạy tiếp khi import gián đoạn. Import lặp lại không tính tiền embedding cho chunk đã có. Không đưa service role hoặc API key vào phía trình duyệt.

Chat kết hợp kho đoạn toàn văn, bộ bằng chứng trong app và PubMed theo từ vựng chủ đề cố định. PubMed chỉ cung cấp metadata/abstract; trạng thái nguồn được hiển thị kể cả khi trống hoặc lỗi. Trích đoạn không thay thế đọc bài đầy đủ và không thiết lập giá trị điều trị cá nhân.
