import type {
  StudyAction,
  StudyAnswerMeta,
  StudyContext,
  StudySource,
} from "./study-types";

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.slice(0, max) : "";
export function parseStudyMeta(raw: unknown): StudyAnswerMeta | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  const sources: StudySource[] = Array.isArray(row.sources)
    ? row.sources.slice(0, 30).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const source = item as Record<string, unknown>;
        if (
          typeof source.url !== "string" ||
          !/^https?:\/\//i.test(source.url) ||
          !source.title
        )
          return [];
        return [
          {
            id: text(source.id, 200),
            title: text(source.title, 500),
            url: text(source.url, 2000),
            checkedAt: text(source.checkedAt, 40),
            access: text(source.access, 1200),
          },
        ];
      })
    : [];
  const actions: StudyAction[] = Array.isArray(row.actions)
    ? row.actions.slice(0, 4).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const action = item as Record<string, unknown>;
        if (
          typeof action.href !== "string" ||
          !/^\/(atlas|movement|consult)(\?|#|$)/.test(action.href) ||
          !action.label
        )
          return [];
        return [
          { label: text(action.label, 160), href: text(action.href, 1500) },
        ];
      })
    : [];
  let context: StudyContext | null = null;
  if (row.context && typeof row.context === "object") {
    const ctx = row.context as Record<string, unknown>;
    if (
      typeof ctx.structureId === "string" &&
      typeof ctx.name === "string" &&
      typeof ctx.english === "string"
    ) {
      context = {
        structureId: text(ctx.structureId, 100),
        name: text(ctx.name, 240),
        english: text(ctx.english, 240),
        side: ctx.side === "left" || ctx.side === "right" ? ctx.side : null,
        area: text(ctx.area, 40),
        groupId: typeof ctx.groupId === "string" ? text(ctx.groupId, 80) : null,
      };
    }
  }
  return {
    sources,
    actions,
    context,
    sourceNotice: text(row.sourceNotice, 1500) || undefined,
  };
}
