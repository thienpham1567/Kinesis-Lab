# Kinesis Lab — PT Medical & Exercise Science Agent

Clinical co-pilot cho Personal Trainer: hồ sơ bệnh lý học viên, sàng lọc Red Flags, RAG sách chuyên ngành, PubMed, đọc phiếu xét nghiệm/InBody.

## Chạy local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Biến môi trường

| Key | Việc |
| --- | --- |
| `OPENROUTER_API_KEY` | Bắt buộc. Chat, Vision, embedding đều đi qua OpenRouter. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Hồ sơ học viên, vector sách PDF. |
| `NCBI_EMAIL` / `NCBI_API_KEY` | Tuỳ chọn, lịch sự với PubMed. |

Model mặc định (đổi được trong `.env.local`):

- Lập luận lâm sàng: `anthropic/claude-sonnet-4`
- Đọc ảnh xét nghiệm/InBody: `google/gemini-2.5-pro`
- Tra cứu nhanh: `google/gemini-2.5-flash`
- Embedding: `openai/text-embedding-3-small`

## Supabase

1. Tạo project, bật extension `vector`.
2. SQL Editor → chạy `supabase/migrations/001_initial_schema.sql`.
3. Dán URL + service role key vào `.env.local`.

Không expose service role ra trình duyệt. Mọi truy vấn đi qua API routes.

## Việc nên làm trên app

1. **Thư viện** — nạp PDF ACSM / NSCA / NASM.
2. **Học viên** — bệnh nền, thuốc, pain trigger, PAR-Q+.
3. **Xét nghiệm / InBody** — chụp phiếu, Gemini đọc chỉ số.
4. **Tư vấn** — hỏi bài tập; agent trích sách + PMID và kiểm tra chống chỉ định.

PT không chẩn đoán, không kê thuốc. Red Flags → chuyển bác sĩ.

## UI/UX skill của project

Skill `frontend-design` được cài tại `.agents/skills/frontend-design/` từ [Agentic Awesome Skills](https://github.com/sickn33/agentic-awesome-skills), release `v19.7.0` (commit `a3072641b750a1fb2f6ce695a5f984ea3d4c3ec1`). Codex nhận diện skill ở phạm vi project; có thể yêu cầu “Dùng frontend-design để nâng cấp giao diện”.

Giao diện dùng hướng **Clinical Field Notes**, với Be Vietnam Pro, IBM Plex Mono và các token trong `src/app/globals.css`. Icon, tiêu đề và trạng thái trống dùng chung tại `src/components/WorkspaceUI.tsx`.

Cài lại đúng skill và phiên bản:

```bash
npm exec --yes --ignore-scripts --package=agentic-awesome-skills@19.7.0 -- \
  agentic-awesome-skills --release 19.7.0 --path .agents/skills --skills frontend-design
```
