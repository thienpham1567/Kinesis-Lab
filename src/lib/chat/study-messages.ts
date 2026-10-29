import type {
  ChatImageAttachment,
  ChatImageSource,
  StudyChatMessage,
} from "./illustration-types";
import type { ChatMessage } from "@/lib/types";
import { parseAnswerCitations } from "./answer-citations";

import { parseStudyMeta } from "./study-meta";

const UUID = /^[0-9a-f-]{36}$/i;
const ROLES = new Set(["user", "assistant"]);

function asId(value: unknown) {
  return typeof value === "string" && UUID.test(value) ? value : crypto.randomUUID();
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asSources(value: unknown): ChatImageSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== "string" ||
      typeof row.title !== "string" ||
      typeof row.url !== "string" ||
      typeof row.checkedAt !== "string" ||
      typeof row.access !== "string"
    )
      return [];
    return [
      {
        id: row.id.slice(0, 120),
        title: row.title.slice(0, 240),
        url: row.url.slice(0, 500),
        checkedAt: row.checkedAt.slice(0, 40),
        access: row.access.slice(0, 800),
      },
    ];
  });
}

function asAttachments(value: unknown): ChatImageAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.imageId !== "string" || typeof row.sourceMessageId !== "string")
      return [];
    const state = row.state;
    if (
      state !== "preparing" &&
      state !== "generating" &&
      state !== "succeeded" &&
      state !== "failed" &&
      state !== "unknown"
    )
      return [];
    return [
      {
        imageId: row.imageId.slice(0, 80),
        sourceMessageId: row.sourceMessageId.slice(0, 80),
        state,
      },
    ];
  });
}

export function upgradeStudyMessages(raw: unknown): StudyChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (!ROLES.has(String(row.role))) return [];
    return [
      {
        id: asId(row.id),
        role: row.role as StudyChatMessage["role"],
        content: asText(row.content).slice(0, 20000),
        attachments: asAttachments(row.attachments),
        sources: asSources(row.sources),
        citations: parseAnswerCitations(row.citations),
        study: parseStudyMeta(row.study),
      },
    ];
  });
}

export function toChatMessages(messages: StudyChatMessage[]): ChatMessage[] {
  return messages
    .filter((message) => message.content.trim())
    .map((message) => ({ role: message.role, content: message.content }))
    .slice(-11);
}

export function illustrationContextFromChat(
  messages: StudyChatMessage[],
  preferredMessageId?: string | null,
) {
  const candidates = messages.filter((message) => message.content.trim());
  const source = preferredMessageId
    ? candidates.find((message) => message.id === preferredMessageId)
    : candidates.at(-1);
  if (!source)
    return { sourceMessageId: null, instruction: "", selectedContext: "", contextTitle: "" };
  const index = messages.findIndex((message) => message.id === source.id);
  const user = source.role === "user" ? source : messages
    .slice(0, index)
    .reverse()
    .find((message) => message.role === "user" && message.content.trim());
  const instruction = user?.content ?? "";
  const selectedContext = [`Câu hỏi:\n${instruction}`, ...(source.role === "assistant" ? [`Câu trả lời:\n${source.content}`] : [])]
    .join("\n\n")
    .slice(0, 4000);
  const contextTitle = (user?.content || source.content).replace(/\s+/g, " ").trim().slice(0, 80);
  return { sourceMessageId: source.id, instruction, selectedContext, contextTitle };
}

export function imagePromptMessageId(messages: StudyChatMessage[], imageId: string) {
  const index = messages.findIndex((message) => message.attachments.some((item) => item.imageId === imageId));
  if (index < 0) return null;
  return messages.slice(0, index).reverse().find((message) => message.role === "user" && message.content.trim())?.id ?? null;
}

export function serializeStudyChatStore(input: {
  conversationId: string;
  messages: StudyChatMessage[];
}) {
  return JSON.stringify({
    version: 2,
    conversationId: input.conversationId,
    messages: input.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      attachments: message.attachments.map((item) => ({
        imageId: item.imageId,
        sourceMessageId: item.sourceMessageId,
        state: item.state,
      })),
      sources: message.sources,
      citations: message.citations,
      study: message.study,
    })),
  });
}

export function parseStudyChatStore(raw: string | null): {
  conversationId: string;
  messages: StudyChatMessage[];
} {
  if (!raw)
    return { conversationId: crypto.randomUUID(), messages: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed))
      return { conversationId: crypto.randomUUID(), messages: upgradeStudyMessages(parsed) };
    if (!parsed || typeof parsed !== "object")
      return { conversationId: crypto.randomUUID(), messages: [] };
    const row = parsed as Record<string, unknown>;
    const conversationId =
      typeof row.conversationId === "string" && UUID.test(row.conversationId)
        ? row.conversationId
        : crypto.randomUUID();
    return { conversationId, messages: upgradeStudyMessages(row.messages) };
  } catch {
    return { conversationId: crypto.randomUUID(), messages: [] };
  }
}
