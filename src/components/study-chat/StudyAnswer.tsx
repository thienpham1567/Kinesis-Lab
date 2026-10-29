"use client";

import Link from "next/link";
import { useState } from "react";
import type { StudyChatMessage } from "@/lib/chat/illustration-types";
import { studyAnswerClipboard } from "@/lib/chat/study-copy";
import { studyContextLabel } from "@/lib/chat/study-context";
import { MarkdownAnswer } from "../MarkdownAnswer";
import { Icon } from "../WorkspaceUI";

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
        citations={message.citations}
        className="text-[13px]"
      />
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
      {message.study &&
        (message.study.sources.length > 0 || message.study.sourceNotice) && (
          <details className="rounded-lg border border-rule bg-canvas px-2.5 text-xs leading-5">
            <summary className="cursor-pointer py-2 font-medium text-cobalt">
              Nguồn tham khảo · {message.study.sources.length}
            </summary>
            <div className="space-y-2 pb-2.5 text-slate">
              {message.study.context && (
                <p>{studyContextLabel(message.study.context)}</p>
              )}
              {message.study.sourceNotice && (
                <p>{message.study.sourceNotice}</p>
              )}
              {message.study.sources.map((source) => (
                <div
                  key={`${source.id}:${source.url}`}
                  className="border-t border-rule pt-2"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-cobalt underline underline-offset-2"
                  >
                    {source.title}
                  </a>
                  <p>{source.access}</p>
                  {source.checkedAt && (
                    <p className="text-[11px]">
                      Ngày đối chiếu / truy xuất: {source.checkedAt}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </details>
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
