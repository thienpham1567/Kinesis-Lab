import type { ChatImageAttachment, StudyChatMessage } from "./illustration-types";

const BILLING_ACTIONS = new Set(["create", "edit"]);

export function clampZoom(value: number) {
  return Math.min(300, Math.max(25, Math.round(value)));
}

export function shouldBillNewImage(reason: string) {
  return BILLING_ACTIONS.has(reason);
}

export function attachmentFor(
  messages: StudyChatMessage[],
  imageId: string,
): ChatImageAttachment | undefined {
  for (const message of messages)
    for (const item of message.attachments) if (item.imageId === imageId) return item;
}

export function applyImageState(
  messages: StudyChatMessage[],
  input: {
    conversationId: string;
    activeConversationId: string;
    imageId: string;
    sourceMessageId: string;
    state: ChatImageAttachment["state"];
    content?: string;
  },
): StudyChatMessage[] {
  if (input.conversationId !== input.activeConversationId) return messages;
  return messages.map((message) => {
    const attachments = message.attachments.map((item) =>
      item.imageId === input.imageId
        ? { ...item, state: input.state, sourceMessageId: input.sourceMessageId }
        : item,
    );
    if (attachments === message.attachments) return message;
    const changed = attachments.some((item, index) => item !== message.attachments[index]);
    if (!changed) return message;
    return {
      ...message,
      attachments,
      content: input.content !== undefined ? input.content : message.content,
    };
  });
}

export function bindImageMessage(input: {
  messages: StudyChatMessage[];
  conversationId: string;
  activeConversationId: string;
  imageId: string;
  sourceMessageId: string;
  userContent: string;
}): StudyChatMessage[] {
  if (input.conversationId !== input.activeConversationId) return input.messages;
  const user: StudyChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: input.userContent,
    attachments: [],
    sources: [],
  };
  const assistant: StudyChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: "",
    attachments: [
      {
        imageId: input.imageId,
        sourceMessageId: input.sourceMessageId,
        state: "preparing",
      },
    ],
    sources: [],
  };
  return [...input.messages, user, assistant];
}
