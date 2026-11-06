"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { StudyChatMessage } from "@/lib/chat/illustration-types";
import { studyAnswerCitations, studyAnswerClipboard } from "@/lib/chat/study-copy";
import { studyContextLabel } from "@/lib/chat/study-context";
import { Icon } from "../WorkspaceUI";

const MarkdownAnswer = dynamic(
  () => import("../MarkdownAnswer").then((module) => module.MarkdownAnswer),
  { loading: () => <p role="status" className="text-sm leading-6 text-slate">Đang chuẩn bị nội dung…</p> },
);

export function StudyAnswer({
  message,
  saved,
  onSave,
  busy = false,
  onNavigate,
}: {
  message: StudyChatMessage;
  saved: boolean;
  onSave: () => void;
  busy?: boolean;
  onNavigate?: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const citations = useMemo(() => studyAnswerCitations(message), [message]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(studyAnswerClipboard(message));
      setCopyStatus("Đã sao chép");
    } catch {
      setCopyStatus(
        "Chưa sao chép được. Bạn có thể bôi đen câu trả lời để sao chép.",
      );
    }
  }
  return (
    <div className="space-y-2.5">
      {message.study?.context && (
        <p className="text-[11px] font-medium leading-5 text-slate">
          Về: {studyContextLabel(message.study.context)}
        </p>
      )}
      <MarkdownAnswer
        text={message.content}
        citations={citations}
        uncitedNotice={message.study?.sourceNotice}
        streaming={busy}
        className="text-sm"
      />
      {message.study?.warning && (
        <p className="text-xs leading-5 text-caution">{message.study.warning}</p>
      )}
      {!!message.study?.actions.length && (
        <div
          className="flex flex-wrap gap-1.5"
          aria-label="Mở nội dung liên quan"
        >
          {message.study.actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={onNavigate}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-cobalt/20 bg-cobalt-soft px-2.5 py-1 text-xs font-medium text-cobalt"
            >
              <Icon name="arrow-right" className="size-3.5" />
              {action.label}
            </Link>
          ))}
        </div>
      )}
      <div className="flex min-h-9 flex-wrap items-center gap-1 border-t border-rule pt-1">
        <button
          type="button"
          onClick={() => void copy()}
          disabled={busy}
          aria-label="Sao chép câu trả lời"
          title="Sao chép câu trả lời và nguồn"
          className="inline-flex size-9 items-center justify-center rounded-lg text-slate hover:bg-canvas hover:text-cobalt disabled:opacity-40"
        >
          <Icon
            name={copyStatus === "Đã sao chép" ? "check" : "copy"}
            className="size-4"
          />
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          aria-label={saved ? "Bỏ lưu câu trả lời" : "Lưu câu trả lời"}
          aria-pressed={saved}
          title={saved ? "Bỏ lưu" : "Lưu kiến thức"}
          className={`inline-flex size-9 items-center justify-center rounded-lg hover:bg-canvas disabled:opacity-40 ${saved ? "text-cobalt" : "text-slate"}`}
        >
          <Icon name="bookmark" className="size-4" />
        </button>
        <span role="status" className="min-w-0 text-[11px] text-slate">
          {copyStatus || (saved ? "Đã lưu" : "")}
        </span>
      </div>
    </div>
  );
}
