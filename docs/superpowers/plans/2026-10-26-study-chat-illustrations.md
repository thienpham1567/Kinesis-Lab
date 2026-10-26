# Floating Chat Images Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task after the user approves this proposal. Steps use checkbox syntax. This document is a review draft, not authorization to run image generation or production changes now.

**Goal:** Cho phép tạo ảnh có chữ giải thích do model vẽ trực tiếp ngay trong chat nổi, lưu cùng hội thoại và bấm mở lớn.

**Architecture:** Typed image attachments độc lập Markdown, Gemini 2.5 Flash tạo brief có nguồn, Seedream 5.0 Flash sinh raster chứa cả chữ. Tái sử dụng transport ảnh hiện có; job ledger/storage dùng chung để phục hồi và hạn chế lượt trùng, IndexedDB giữ Blob local, native dialog làm viewer.

**Tech Stack:** Next.js 16.4.1, React 19, TypeScript, OpenRouter, Supabase/Postgres/private Storage, IndexedDB, native dialog.

**Spec:** `docs/superpowers/specs/2026-10-26-study-chat-illustrations-design.md`.

## Review baseline

Hiện trạng được đọc tại commit `5e6ed58`. GET production `/api/illustrations` đã xác nhận enabled/Seedream/live price; không gọi POST tạo ảnh. Các test ảnh cũ dùng prompt không chữ, chưa đủ đánh giá tính năng mới. Chỉ viết hai tài liệu trong lượt review này.

## Task 1: Kiểm tra model với đúng yêu cầu có chữ

**Files:** Create `scripts/eval-study-chat-images.mjs`, `docs/research/2026-10-26-study-chat-image-text.md`; artifacts ở `.data/study-chat-image-eval/`.

- [ ] Ghi trước ba brief: một vùng giải phẫu có 3 nhãn; một khái niệm chuyển động có 3 ghi chú; một hình so sánh hai điều kiện, có tiêu đề và 4 chú giải. Dùng kiến thức đã có nguồn trong app, câu ngắn với đủ dấu tiếng Việt, không tự thêm câu khẳng định y khoa mới.
- [ ] Lưu protocol gồm exact imageText, nguồn và phạm vi đọc, model/provider, 2K/4:3/n=1, không fallback, không auto retry; mặc định script chỉ in protocol. Chỉ `--apply --max-images=6` mới gọi trả phí.
- [ ] Sau khi người dùng duyệt triển khai, chạy tối đa hai ảnh/brief. Ghi response, cost thật/null, hash, latency và lỗi từng chữ/dấu so với expectedText; kiểm tra quan hệ hình/nhãn theo nguồn và khả năng đọc ở viewer.
- [ ] Chỉ chọn Seedream mặc định cho tính năng có chữ nếu mẫu thử đạt điều kiện đọc/nội dung. Nếu không đạt, báo chính xác lỗi; đề xuất lựa chọn model khác bằng một đợt thử riêng, không tự thay bằng chữ overlay.
- [ ] Commit protocol/báo cáo đã bỏ secrets; không commit ảnh nhạy cảm hoặc tệp nguồn bảo hộ.

## Task 2: Hợp đồng dữ liệu và brief có nguồn

**Files:** Create `src/lib/chat/illustration-types.ts`, `src/lib/chat/illustration-brief.ts`, `src/lib/chat/study-messages.ts`, `scripts/check-chat-image-brief.mjs`, `scripts/check-study-message-storage.mjs`.

- [ ] Định nghĩa các kiểu độc lập, không thay ChatMessage API hiện tại:

```ts
type ChatImageState = "preparing" | "generating" | "succeeded" | "failed" | "unknown";
type ChatImageSource = { id: string; title: string; url: string; checkedAt: string; access: string };
type ChatIllustrationBrief = {
  title: string;
  subjectKind: "anatomy" | "movement" | "comparison";
  visualDescription: string;
  imageText: string[];
  explanation: string;
  sources: ChatImageSource[];
  limitations: string[];
};
type ChatImageReceipt = {
  id: string; createdAt: string; model: string; provider: string;
  purpose: "chat-study"; brief: ChatIllustrationBrief;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  byteLength: number; sha256: string; elapsedMs: number;
  costUsd: number | null; estimateUsd: number; priceCheckedAt: string;
  resolution: "2K"; aspectRatio: "4:3"; parentId: string | null;
  label: "Hình minh họa AI"; reviewedBy: null;
};
type ChatImageAttachment = { imageId: string; sourceMessageId: string; state: ChatImageState };
type StudyChatMessage = {
  id: string; role: "user" | "assistant"; content: string;
  attachments: ChatImageAttachment[]; sources: ChatImageSource[];
};
```

- [ ] Viết `parseChatIllustrationBrief` kiểm tra enum, field cho phép, title ≤60, visualDescription ≤1600, 2–4 imageText mục ≤120 và tổng ≤550 ký tự, explanation ≤1600, ≤8 sources. Reject URL/ID chưa nằm trong bộ nguồn server thực sự cung cấp; không coi kiểm tra ID là chứng minh đúng nội dung.
- [ ] Viết test fail cho brief sai JSON/enum, quá dài, nguồn giả, lẫn `clientId`, raw history hoặc model override. Dùng `node --test scripts/check-chat-image-brief.mjs` để xác nhận fail đúng nguyên nhân rồi implement parser tối thiểu.
- [ ] Viết `buildChatIllustrationBrief` với Gemini 2.5 Flash và deadline; chỉ nhận yêu cầu ngắn + nguồn của message được chọn. Nếu message cũ không có sources, truy xuất lại theo chủ đề riêng. Lưu exact imageText để so với ảnh, không bảo là OCR.
- [ ] Viết `upgradeStudyMessages` cho history v1 role/content sang v2; `toChatMessages` chỉ trả role/content, giữ rolling history, không gửi attachment/blob/receipt lên `/api/chat`.
- [ ] Test nâng cấp id ổn định sau lưu, history hỏng có fallback, message text rỗng chứa ảnh không làm API reject, không lẫn nguồn giữa hai message. Chạy hai script và commit.

## Task 3: Tái sử dụng image gateway, thêm compiler cho ảnh có chữ

**Files:** Create `src/lib/illustrations/provider.ts`, `src/lib/chat/illustration-prompt.ts`, `scripts/check-chat-image-provider.mjs`; Modify `src/lib/illustrations/server.ts`.

- [ ] Tách `requestRasterImage` từ transport hiện có: fixed model/provider, request timeout, byte/MIME cap, cost/null và hash. Không thêm provider tự fallback/retry.
- [ ] Giữ `generateIllustration` cũ dùng `compileImagePrompt` cũ; các kiểm tra cấm chữ/preset anatomy của luồng cũ vẫn qua.
- [ ] Thêm `compileChatIllustrationPrompt(brief)`: infographic gốc cho học tập, vẽ chính xác imageText tiếng Việt vào raster, bố cục có khoảng trống, chữ đủ lớn, không thêm nhãn/đo lường ngoài brief. SubjectKind quyết định anatomy/movement/comparison; không tái dùng câu cấm chữ/bài tập của preset cũ.
- [ ] Test mock request mới chứa nguyên dấu tiếng Việt, n=1, 2K/4:3 và chỉ brief đã duyệt schema; reference chỉ là ảnh job đã kiểm tra owner. Test response malformed/oversize/MIME mismatch/402/429/deadline và thiếu cost.
- [ ] Run `node scripts/check-illustration-workflow.mjs` và `node --test scripts/check-chat-image-provider.mjs`; expected không paid call, không hồi quy luồng gallery. Commit.

## Task 4: Job bền vững, quyền truy cập asset và API

**Files:** Create `supabase/migrations/004_chat_image_jobs.sql`, `src/lib/chat/image-jobs.ts`, `src/lib/chat/image-session.ts`, `src/app/api/chat/illustrations/route.ts`, `src/app/api/chat/illustrations/[id]/route.ts`, `src/app/api/internal/chat-illustrations/cleanup/route.ts`, `vercel.json`, `.env.example`, `scripts/check-chat-image-jobs.mjs`, `scripts/check-chat-image-route.mjs`.

- [ ] Xác minh quyền áp migration và tạo private bucket trước khi code phụ thuộc schema. Không thử dùng service role REST key như SQL management token. Đọc guide Next hiện tại về route handlers, cookies và request cancellation.
- [ ] Migration tạo `chat_image_jobs` với schema/state trong spec, RLS bật, quyền client trực tiếp tắt; tạo atomic claim function kiểm tra fingerprint, owner và giới hạn global/session bằng transaction lock. Tạo private bucket riêng, không dùng bucket NCSF.
- [ ] Test hai adapter server dùng cùng shared ledger tranh một id: chỉ một caller được tạo ảnh. Test cùng id khác fingerprint 409, owner khác không đọc được job/asset, không vượt 2 concurrency/30 giờ global/5 giờ session.
- [ ] GET base khởi tạo phiên ngắn trước khi tạo hình, trả model/ước tính và Set-Cookie ngay; POST dài bắt buộc phiên đó, không cấp cookie lần đầu ở cuối generation response. `getOrCreateImageSession` sinh cookie ngẫu nhiên 256-bit, HttpOnly, Secure ở prod, SameSite, server lưu hash. Route cần Origin hợp lệ và owner hợp lệ; Origin không thay thế owner check. GET không trả prompt hoặc đường dẫn asset của owner khác.
- [ ] POST nhận `{requestId, conversationId, sourceMessageId, instruction, selectedContext, sourceIds}` với allowlist/length caps; server kiểm tra lại nguồn. Response chuẩn `{id, state, brief?, receipt?, assetUrl?, errorCode?}`; không trả raw upstream errors.
- [ ] Claim → deadline nội bộ 140 giây → brief tối đa 15 giây → image call được await với timeout min(110 giây, thời gian còn lại trừ 15 giây) → upload tối đa 10 giây → receipt thành công. Không bắt đầu image call nếu thiếu ngân sách deadline. Nếu timeout sau khả năng provider đã nhận: ghi unknown, không tự retry. GET cho polling/recovery, chỉ cấp signed URL sau kiểm tra owner. Không dựa vào background promise sau response.
- [ ] Cho truy cập artifact server 24 giờ. Route cleanup nội bộ xác thực bearer `CRON_SECRET`, xóa asset qua Supabase Storage API rồi xóa brief/path trong job đã hết hạn; không xóa trực tiếp storage.objects bằng SQL. Lịch cron hằng ngày trong vercel.json giữ dữ liệu vật lý tối đa khoảng 48 giờ, cần kiểm tra hỗ trợ cron của project trước rollout. Giữ tombstone ownerHash/id/fingerprint/trạng thái, không giữ nội dung, để replay ID cũ không tạo phí mới. Không cấp public bucket. Client mất chờ có thể GET phục hồi; job/asset hết hạn trả trạng thái expired riêng trong response lỗi, không phát sinh POST mới.
- [ ] Chạy `node --test scripts/check-chat-image-jobs.mjs scripts/check-chat-image-route.mjs`; dùng database test để kiểm tra atomic claim/RLS/asset owner trước production. Commit.

## Task 5: Lưu attachment và điều khiển image request

**Files:** Create `src/lib/chat/image-storage.ts`, `src/components/chat/useStudyChatImages.ts`, `scripts/check-chat-image-storage.mjs`; Modify `src/lib/illustrations/library.ts` chỉ để chia sẻ kết nối IndexedDB v2 không phá store cũ.

- [ ] Migration IndexedDB giữ store `images`, thêm `chat-images`. Blob/brief/receipt theo imageId; sessionStorage chỉ chứa message v2 và attachment IDs.
- [ ] Hook quản lý conversationId/sourceMessageId, deadline/UI cancel, POST cùng requestId, GET polling và hydration từ local Blob trước remote recovery. Tách trạng thái text busy/image busy.
- [ ] Không tạo lại ảnh khi refresh, mở viewer, signed URL hết hạn hoặc GET lỗi. Với unknown/expired, hiển thị trạng thái và cho người dùng chủ động tạo một request mới có hiển thị phí.
- [ ] Test storage migration/quota 50 ảnh/IDB disabled/full; hiện ảnh và download vẫn hoạt động khi save thất bại. Test URL revoke, unmount, reset, chuyển trang và hai request trả kết quả ngược thứ tự không gắn nhầm message.
- [ ] Run `node --test scripts/check-chat-image-storage.mjs scripts/check-study-message-storage.mjs`; commit.

## Task 6: Tích hợp tạo ảnh và image card vào chat nổi

**Files:** Create `src/components/chat/StudyChatImageCard.tsx`, `src/components/chat/StudyChatImageComposer.tsx`; Modify `src/components/StudyChatWidget.tsx`, `src/app/globals.css`; Create `scripts/check-study-chat-images.mjs`.

- [ ] Composer có Hỏi đáp/Tạo hình; nút minh họa dưới message gắn chính xác nội dung/nguồn đó. Hiển thị mô tả, context và estimate có ngày trước nút tạo. Text request/quoted PDF/model Markdown không tự kích hoạt image POST.
- [ ] Card render thumbnail từ Blob/signed URL do image service quản lý, không mở quyền ảnh Markdown chung. Giữ nhãn AI, loading/error/unknown states, source details và chữ yêu cầu model vẽ.
- [ ] Action chỉnh sửa tạo parentId từ ảnh đã chọn, cho sửa câu chữ, hiển thị phí request mới; không tuyên bố sửa riêng một chữ chắc chắn giữ nguyên mọi pixel khác.
- [ ] Giữ text stream, citation warning, lựa chọn đoạn trích, session history và reset hiện tại. Khi reset, tách attachment khỏi conversation mới nhưng không báo hủy phí provider nếu không biết.
- [ ] Test component với provider mock: default không image call; đúng một click tạo; text vẫn dùng Gemini 2.5 Flash; image response không ghép vào conversation khác; thiếu credit và lưu ảnh lỗi có hành động rõ.
- [ ] Chạy `node --test scripts/check-study-chat-images.mjs`, `npm run check:chat`, `npm run check:markdown`; commit.

## Task 7: Viewer mở lớn

**Files:** Create `src/components/chat/StudyChatImageViewer.tsx`; Modify image card, widget Escape handling và CSS; Create `scripts/check-study-chat-image-viewer.mjs`.

- [ ] Native dialog ở document top layer. Thumbnail là button có tên truy cập; open fit ảnh tự nhiên, không crop chữ trong raster.
- [ ] Có đóng, zoom +/− (25–300%), 100%, fit, pan có giới hạn và download ảnh gốc. Mobile có pinch/pan, nút đủ chạm và safe-area.
- [ ] Khi Escape: chỉ viewer đóng, chat không đóng; Tab nằm trong modal, focus quay lại đúng thumbnail, body scroll được khôi phục, không rò object URL. Mở/zoom/download không gọi image hoặc chat model.
- [ ] Kiểm tra thực bằng browser 390px/820px/1440px, keyboard, cuộn ảnh dọc và ảnh chứa nhiều chữ. Chụp QA với ảnh fixture đã được phép sử dụng, không dùng screenshot làm bằng chứng tương tác hoặc giải phẫu.
- [ ] Chạy viewer tests và React Doctor sau thay đổi React; xử lý lỗi mới có ảnh hưởng, không dọn toàn bộ warning upstream. Commit.

## Task 8: Xác minh và rollout sau duyệt

- [ ] `npm run check:chat`, `npm run check:markdown`, `node scripts/check-illustration-workflow.mjs`, toàn bộ script chat-image ở trên, `npm run lint`, `npm run build`; không sửa test để bỏ bảo vệ ảnh Markdown.
- [ ] Pilot ảnh tiếng Việt đạt tiêu chí Task 1; giữ receipt, exact expectedText, ảnh thật và đối chiếu từng nhãn. Không chỉ dựa OCR hoặc độ đẹp để xác nhận anatomy.
- [ ] Áp migration/private bucket/quota và cleanup bằng quyền hợp lệ, xác minh owner isolation và replay trên deployment nhiều instance. Nếu thiếu quyền Supabase DDL, ghi blocker trước rollout; không triển khai frontend trỏ vào API chưa có schema.
- [ ] Preview test end-to-end: tạo một ảnh có chữ → xem lớn → zoom/Escape → download → reload khôi phục → sửa ảnh → kiểm tra parentId và billing; giới hạn request thật theo pilot, không retry ẩn.
- [ ] Test timeout/network disconnect/stale job/quota/IDB disabled/expired signed URL. Refresh và mở ảnh không sinh lượt billed mới.
- [ ] Sau khi đạt, deploy production theo phạm vi người dùng duyệt; kiểm tra text chat/ảnh/nguồn. Ghi report phân biệt phần mềm, chất lượng chữ và giới hạn anatomy; cập nhật hướng dẫn lưu ảnh tại trình duyệt/cửa sổ phục hồi server 24h và dọn vật lý hằng ngày.

## Tự review bản kế hoạch

- [x] Chữ trong ảnh do model tạo, đúng lựa chọn người dùng; không có phương án overlay âm thầm thay thế.
- [x] Có đầy đủ kích hoạt chủ động, nguồn theo message, lưu ảnh, mở lớn, zoom, tải ảnh, chỉnh sửa và error states.
- [x] Giữ API chat text và chặn Markdown image hiện tại; không đổi model text/embedding.
- [x] Phân biệt draft plan với implementation, pilot trả phí và rollout production.
- [x] Đã ghi nhận model text-rendering chưa thử trực tiếp và quyền migration cần xác minh; không hứa clinical validation hoặc exactly-once billing.
