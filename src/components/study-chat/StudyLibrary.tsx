"use client";

import { useState } from "react";
import {
  searchStudyBookmarks,
  searchStudyConversations,
  type StudyBookmark,
  type StudyConversation,
  type StudyLibrary as Library,
} from "@/lib/chat/study-library";
import { StudyAnswer } from "./StudyAnswer";
import { Icon } from "../WorkspaceUI";

export function StudyLibrary({
  library,
  onRestore,
  onUnsave,
  onNavigate,
}: {
  library: Library;
  onRestore: (conversation: StudyConversation) => void;
  onUnsave: (bookmark: StudyBookmark) => void;
  onNavigate: () => void;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"saved" | "history">("saved");
  const saved = searchStudyBookmarks(library, query);
  const history = searchStudyConversations(library, query);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b border-rule bg-canvas/50 px-4 py-3">
        <label className="input-with-icon block">
          <Icon name="search" className="size-4 shrink-0 text-slate" />
          <input
            type="search"
            aria-label="Tìm kiến thức và hội thoại"
            placeholder="Tìm câu hỏi, cơ, nội dung…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div
          className="flex gap-2"
          role="group"
          aria-label="Loại nội dung đã lưu"
        >
          <button
            type="button"
            aria-pressed={tab === "saved"}
            onClick={() => setTab("saved")}
            className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${tab === "saved" ? "bg-cobalt-soft text-cobalt" : "text-slate"}`}
          >
            Đã lưu · {library.saved.length}
          </button>
          <button
            type="button"
            aria-pressed={tab === "history"}
            onClick={() => setTab("history")}
            className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${tab === "history" ? "bg-cobalt-soft text-cobalt" : "text-slate"}`}
          >
            Hội thoại · {library.conversations.length}
          </button>
        </div>
        <p className="text-[11px] leading-5 text-slate">
          Lưu trên trình duyệt này · 30 hội thoại gần nhất, tối đa 100 câu trả
          lời đã lưu.
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {tab === "saved" ? (
          saved.length ? (
            saved.map((bookmark) => (
              <article
                key={bookmark.id}
                className="rounded-xl border border-rule p-3 [overflow-wrap:anywhere]"
              >
                <p className="mb-2 text-xs font-semibold leading-5 text-ink">
                  {bookmark.question}
                </p>
                <p className="mb-3 text-[11px] text-slate">
                  {new Date(bookmark.savedAt).toLocaleDateString("vi-VN")}
                </p>
                <StudyAnswer
                  onNavigate={onNavigate}
                  message={bookmark.answer}
                  saved
                  onSave={() => onUnsave(bookmark)}
                />
              </article>
            ))
          ) : (
            <p className="text-[13px] leading-6 text-slate">
              {query
                ? "Không tìm thấy kiến thức phù hợp."
                : "Bấm biểu tượng lưu dưới câu trả lời để giữ lại cùng nguồn tham khảo."}
            </p>
          )
        ) : history.length ? (
          history.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              onClick={() => onRestore(conversation)}
              className="block w-full rounded-xl border border-rule p-3 text-left hover:border-cobalt/40"
            >
              <span className="block text-[13px] font-semibold leading-5 text-ink">
                {conversation.title}
              </span>
              <span className="mt-1 block text-[11px] text-slate">
                {conversation.messages.length} tin nhắn ·{" "}
                {new Date(conversation.updatedAt).toLocaleDateString("vi-VN")} ·
                Mở lại
              </span>
            </button>
          ))
        ) : (
          <p className="text-[13px] leading-6 text-slate">
            {query
              ? "Không tìm thấy hội thoại phù hợp."
              : "Hội thoại sẽ được lưu ở đây khi bạn gửi câu hỏi."}
          </p>
        )}
      </div>
    </div>
  );
}
