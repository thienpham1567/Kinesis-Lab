import { ANATOMY_CONTEXT_SOURCES } from "@/lib/illustrations/anatomy-presets";
import { MOVEMENT_SOURCES } from "@/lib/clinical/movement-sources";
import type { ChatImageSource } from "./illustration-types";

export function catalogChatImageSources(): ChatImageSource[] {
  const anatomy = Object.entries(ANATOMY_CONTEXT_SOURCES).map(([id, source]) => ({
    id,
    title: source.title,
    url: source.url,
    checkedAt: source.checkedAt,
    access: source.access,
  }));
  const movement = Object.values(MOVEMENT_SOURCES).map((source) => ({
    id: source.id,
    title: source.title,
    url: source.url,
    checkedAt: source.checkedAt,
    access: source.access,
  }));
  return [...anatomy, ...movement];
}

export function resolveChatImageSources(ids: string[]): ChatImageSource[] {
  const catalog = new Map(catalogChatImageSources().map((source) => [source.id, source]));
  return ids.map((id) => {
    const source = catalog.get(id);
    if (!source) throw new Error("Nguồn không nằm trong bộ nguồn máy chủ cung cấp.");
    return source;
  });
}
