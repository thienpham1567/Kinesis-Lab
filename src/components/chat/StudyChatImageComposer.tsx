"use client";

import { useEffect, useRef } from "react";
import { CHAT_IMAGE_MAX_INSTRUCTION } from "@/lib/chat/image-limits";

export function StudyChatImageComposer({
  mode,
  onMode,
  instruction,
  onInstruction,
  contextTitle,
  busy,
  chatBusy = false,
  onCreate,
}: {
  mode: "ask" | "illustrate";
  onMode: (mode: "ask" | "illustrate") => void;
  instruction: string;
  onInstruction: (value: string) => void;
  contextTitle: string;
  busy: boolean;
  chatBusy?: boolean;
  onCreate: () => void;
}) {
  const composer = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (mode === "illustrate") composer.current?.focus();
  }, [mode, contextTitle]);

  return (
    <div className="space-y-2">
      <div className="flex rounded-lg border border-rule bg-sheet p-0.5 text-xs font-medium">
        <button
          type="button"
          className={`min-h-9 flex-1 rounded-md px-2 ${mode === "ask" ? "bg-cobalt-soft text-cobalt" : "text-slate"}`}
          aria-pressed={mode === "ask"}
          onClick={() => onMode("ask")}
        >
          Hỏi đáp
        </button>
        <button
          type="button"
          className={`min-h-9 flex-1 rounded-md px-2 ${mode === "illustrate" ? "bg-cobalt-soft text-cobalt" : "text-slate"}`}
          aria-pressed={mode === "illustrate"}
          onClick={() => onMode("illustrate")}
        >
          Tạo hình
        </button>
      </div>
      {mode === "illustrate" && (
        <>
          {contextTitle && (
            <p className="text-xs leading-5 text-slate">
              Minh họa từ: <span className="text-ink">{contextTitle}</span>
            </p>
          )}
          <textarea
            ref={composer}
            aria-label="Mô tả hình cần tạo"
            value={instruction}
            onChange={(e) => onInstruction(e.target.value)}
            maxLength={CHAT_IMAGE_MAX_INSTRUCTION}
            rows={2}
            placeholder="Mô tả hình cần vẽ, gồm chữ tiếng Việt trong ảnh…"
            className="block max-h-40 min-h-11 w-full resize-none rounded-xl border border-rule-strong bg-sheet px-2.5 py-2 text-[13px] leading-6"
          />
          <button
            type="button"
            disabled={busy || chatBusy || !instruction.trim()}
            onClick={onCreate}
            className="button-primary min-h-10 w-full text-sm"
          >
            {busy ? "Đang tạo hình…" : chatBusy ? "Đang trả lời câu hỏi…" : "Tạo hình"}
          </button>
        </>
      )}
    </div>
  );
}
