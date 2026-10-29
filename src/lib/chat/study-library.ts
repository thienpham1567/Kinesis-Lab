import type { StudyChatMessage } from "./illustration-types";
import { upgradeStudyMessages } from "./study-messages";

export type StudyConversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: StudyChatMessage[];
};
export type StudyBookmark = {
  id: string;
  question: string;
  answer: StudyChatMessage;
  savedAt: string;
};
export type StudyLibrary = {
  version: 1;
  conversations: StudyConversation[];
  saved: StudyBookmark[];
};
export const EMPTY_STUDY_LIBRARY: StudyLibrary = {
  version: 1,
  conversations: [],
  saved: [],
};
const normalized = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
const bounded = (value: unknown, limit: number) =>
  typeof value === "string" ? value.slice(0, limit) : "";

export function parseStudyLibrary(raw: string | null): StudyLibrary {
  if (!raw) return EMPTY_STUDY_LIBRARY;
  try {
    const input = JSON.parse(raw);
    if (!input || input.version !== 1) return EMPTY_STUDY_LIBRARY;
    const conversations: StudyConversation[] = Array.isArray(
      input.conversations,
    )
      ? input.conversations
          .slice(0, 30)
          .flatMap((row: Record<string, unknown>) => {
            if (!row || typeof row.id !== "string") return [];
            const messages = upgradeStudyMessages(
              Array.isArray(row.messages) ? row.messages.slice(-60) : [],
            );
            return messages.length
              ? [
                  {
                    id: bounded(row.id, 100),
                    title: bounded(row.title, 160),
                    updatedAt: bounded(row.updatedAt, 40),
                    messages,
                  },
                ]
              : [];
          })
      : [];
    const saved: StudyBookmark[] = Array.isArray(input.saved)
      ? input.saved.slice(0, 100).flatMap((row: Record<string, unknown>) => {
          if (!row || typeof row.id !== "string") return [];
          const answer = upgradeStudyMessages([row.answer])[0];
          return answer?.role === "assistant" && answer.content.trim()
            ? [
                {
                  id: bounded(row.id, 200),
                  question: bounded(row.question, 20000),
                  answer,
                  savedAt: bounded(row.savedAt, 40),
                },
              ]
            : [];
        })
      : [];
    return { version: 1, conversations, saved };
  } catch {
    return EMPTY_STUDY_LIBRARY;
  }
}
export function rememberStudyConversation(
  library: StudyLibrary,
  conversation: { id: string; messages: StudyChatMessage[] },
  date: string,
): StudyLibrary {
  const messages = conversation.messages
    .filter((message) => message.content.trim())
    .slice(-60);
  if (!messages.length) return library;
  const title = (
    messages.find((message) => message.role === "user")?.content ?? "Hội thoại"
  )
    .replace(/\s+/g, " ")
    .slice(0, 100);
  return {
    ...library,
    conversations: [
      { id: conversation.id, title, messages, updatedAt: date },
      ...library.conversations.filter((row) => row.id !== conversation.id),
    ].slice(0, 30),
  };
}
export function toggleStudyBookmark(
  library: StudyLibrary,
  bookmark: StudyBookmark,
): StudyLibrary {
  const exists = library.saved.some((row) => row.id === bookmark.id);
  if (!exists && library.saved.length >= 100)
    throw new Error(
      "Đã lưu đủ 100 câu trả lời. Hãy bỏ một mục trước khi thêm.",
    );
  return {
    ...library,
    saved: exists
      ? library.saved.filter((row) => row.id !== bookmark.id)
      : [bookmark, ...library.saved].slice(0, 100),
  };
}
export function searchStudyBookmarks(library: StudyLibrary, query: string) {
  const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
  return library.saved.filter((row) => {
    const haystack = normalized(
      `${row.question} ${row.answer.content} ${row.answer.study?.context?.name ?? ""} ${row.answer.study?.sources.map((source) => source.title).join(" ") ?? ""}`,
    );
    return terms.every((term) => haystack.includes(term));
  });
}
export function searchStudyConversations(library: StudyLibrary, query: string) {
  const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
  return library.conversations.filter((row) => {
    const haystack = normalized(
      `${row.title} ${row.messages.map((message) => message.content).join(" ")}`,
    );
    return terms.every((term) => haystack.includes(term));
  });
}

/** Evict only old automatic history under storage pressure; bookmarks stay explicit. */
export function fitStudyLibrary(
  library: StudyLibrary,
  maxCharacters = 2000000,
): StudyLibrary {
  const conversations = [...library.conversations];
  while (
    JSON.stringify({ ...library, conversations }).length > maxCharacters &&
    conversations.length > 1
  )
    conversations.pop();
  const fitted = { ...library, conversations };
  if (JSON.stringify(fitted).length > maxCharacters)
    throw new Error(
      "Kho lưu đã đầy. Hãy bỏ bớt câu trả lời đã lưu trước khi thêm.",
    );
  return fitted;
}
