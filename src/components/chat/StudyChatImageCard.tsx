"use client";

import type { ChatImageAttachment, ChatIllustrationBrief, ChatImageReceipt } from "@/lib/chat/illustration-types";
import { Icon } from "../WorkspaceUI";

export function StudyChatImageCard({
  attachment,
  previewUrl,
  brief,
  receipt,
  onOpen,
  onEdit,
  onRetry,
  onRecover,
}: {
  attachment: ChatImageAttachment;
  previewUrl?: string;
  brief?: ChatIllustrationBrief | null;
  receipt?: ChatImageReceipt | null;
  onOpen: () => void;
  onEdit: () => void;
  onRetry: () => void;
  onRecover: () => void;
}) {
  if (attachment.state === "preparing")
    return (
      <p className="inline-flex items-center gap-2 text-xs text-slate">
        <Icon name="spinner" className="size-4 animate-spin" />
        Đang chuẩn bị nội dung
      </p>
    );
  if (attachment.state === "generating")
    return (
      <p className="inline-flex items-center gap-2 text-xs text-slate">
        <Icon name="spinner" className="size-4 animate-spin" />
        Đang tạo hình
      </p>
    );
  if (attachment.state === "failed")
    return (
      <div className="rounded-lg border border-rule bg-canvas px-3 py-2 text-xs leading-5">
        <p className="text-crimson">Không tạo được hình.</p>
        <button type="button" className="mt-1 font-medium text-cobalt" onClick={onRetry}>
          Tạo lại (tính phí mới)
        </button>
      </div>
    );
  if (attachment.state === "unknown")
    return (
      <div className="rounded-lg border border-rule bg-canvas px-3 py-2 text-xs leading-5">
        <p>Chưa rõ ảnh đã xong chưa. Không tự gửi lại yêu cầu trả phí.</p>
        <button type="button" className="mt-1 font-medium text-cobalt" onClick={onRecover}>
          Kiểm tra trạng thái
        </button>
      </div>
    );
  return (
    <figure className="study-chat-image-card space-y-2">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full overflow-hidden rounded-xl border border-rule bg-canvas"
        aria-label={`Mở ảnh lớn: ${brief?.title ?? "Hình minh họa AI"}`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={brief?.title ?? "Hình minh họa AI"} className="mx-auto max-h-56 w-auto" />
        ) : (
          <span className="block px-3 py-8 text-xs text-slate">Ảnh hết thời gian lưu trên máy chủ.</span>
        )}
      </button>
      <figcaption className="space-y-1 text-xs leading-5 text-slate">
        <p className="font-medium text-ink">{brief?.title ?? "Hình minh họa AI"}</p>
        <p>{receipt?.model ? `${receipt.model} · ` : ""}Hình minh họa AI</p>
        <button type="button" className="font-medium text-cobalt" onClick={onOpen}>
          Mở ảnh lớn
        </button>
        {" · "}
        <button type="button" className="font-medium text-cobalt" onClick={onEdit}>
          Chỉnh sửa ảnh
        </button>
        {brief && (
          <details>
            <summary className="cursor-pointer font-medium text-ink">Chữ đã yêu cầu model vẽ</summary>
            <ul className="mt-1 list-disc pl-4">
              <li>{brief.title}</li>
              {brief.imageText.map((line) => (
                <li key={line}>{line}</li>
              ))}
              {brief.imageExplanation && <li>{brief.imageExplanation}</li>}
            </ul>
            <p className="mt-1">Đây là nội dung đã yêu cầu vẽ, không phải OCR đã xác minh ảnh.</p>
          </details>
        )}
        {!!brief?.limitations.length && (
          <details>
            <summary className="cursor-pointer font-medium text-ink">Phạm vi nguồn và giới hạn hình</summary>
            <ul className="mt-1 list-disc pl-4">
              {brief.limitations.map((limit) => <li key={limit}>{limit}</li>)}
            </ul>
          </details>
        )}
        {brief?.sources?.map((source) => (
          <p key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer" className="text-cobalt underline">
              {source.title}
            </a>
            <span> · kiểm tra {source.checkedAt.slice(0, 10)}</span>
          </p>
        ))}
      </figcaption>
    </figure>
  );
}
