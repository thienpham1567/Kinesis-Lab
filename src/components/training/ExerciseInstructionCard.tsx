import type {
  ExerciseInstruction,
  InstructionText,
} from "@/lib/clinical/exercise-instruction-types";
import { ExerciseInstructionMedia } from "./ExerciseInstructionMedia";

type Source = Extract<InstructionText, { kind: "sourced" }>["sources"][number];

function uniqueSources(items: InstructionText[]): Source[] {
  const found: Source[] = [];
  for (const item of items) {
    if (item.kind !== "sourced") continue;
    for (const source of item.sources) {
      if (!found.some((s) => s.url === source.url)) found.push(source);
    }
  }
  return found;
}

function Lines({
  items,
  numbered,
  sourceIndex,
}: {
  items: InstructionText[];
  numbered?: boolean;
  sourceIndex: (source: Source) => number;
}) {
  const List = numbered ? "ol" : "ul";
  return (
    <List
      className={`mt-2 space-y-1.5 pl-5 text-sm leading-6 text-ink ${numbered ? "list-decimal" : "list-disc"}`}
    >
      {items.map((item) => (
        <li key={item.text}>
          {item.text}
          {item.kind === "sourced" && (
            <sup className="ml-1 text-cobalt">
              [{item.sources.map(sourceIndex).join(", ")}]
            </sup>
          )}
        </li>
      ))}
    </List>
  );
}

/**
 * Full instruction card. Shared by the Atlas explorer and the workout recorder.
 * Sourced statements carry numbered citations; coaching examples are the app's
 * own wording and are labelled as such.
 */
export function ExerciseInstructionCard({
  card,
  exerciseName,
  headingId,
  showMedia = true,
}: {
  card: ExerciseInstruction;
  exerciseName: string;
  headingId?: string;
  showMedia?: boolean;
}) {
  const all = [
    ...card.setup,
    ...card.execution,
    ...card.cues,
    ...card.observations,
    ...card.adjustments.map((a) => a.suggestion),
  ];
  const sources = uniqueSources(all);
  const sourceIndex = (source: Source) =>
    sources.findIndex((s) => s.url === source.url) + 1;

  return (
    <section
      className="space-y-4 rounded-xl border border-rule bg-sheet p-4 sm:p-5"
      aria-labelledby={headingId}
      data-exercise-instruction={card.exerciseId}
    >
      <div>
        <p className="eyebrow">Thẻ hướng dẫn · phiên bản {card.version}</p>
        {headingId && (
          <h4 id={headingId} className="mt-1 font-semibold text-ink">
            Hướng dẫn: {exerciseName}
          </h4>
        )}
        <p className="mt-1 text-xs leading-5 text-slate">{card.variantNote}</p>
      </div>

      {showMedia && (
        <div className="max-w-xl">
          <ExerciseInstructionMedia media={card.media} title={exerciseName} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h5 className="text-xs font-semibold text-cobalt">Chuẩn bị</h5>
          <Lines items={card.setup} sourceIndex={sourceIndex} />
        </div>
        <div>
          <h5 className="text-xs font-semibold text-cobalt">Các bước thực hiện</h5>
          <Lines items={card.execution} numbered sourceIndex={sourceIndex} />
        </div>
        <div>
          <h5 className="text-xs font-semibold text-ink">
            Câu PT có thể nói{" "}
            <span className="font-normal text-slate">(ví dụ do ứng dụng biên soạn)</span>
          </h5>
          <Lines items={card.cues} sourceIndex={sourceIndex} />
        </div>
        <div>
          <h5 className="text-xs font-semibold text-ink">Điểm quan sát</h5>
          <Lines items={card.observations} sourceIndex={sourceIndex} />
        </div>
      </div>

      <div>
        <h5 className="text-xs font-semibold text-ink">Lựa chọn điều chỉnh</h5>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-ink">
          {card.adjustments.map((a) => (
            <li key={a.context} className="rounded-lg border border-rule p-3">
              <p className="text-xs font-semibold text-slate">{a.context}</p>
              <p className="mt-1">
                {a.suggestion.text}
                {a.suggestion.kind === "sourced" && (
                  <sup className="ml-1 text-cobalt">
                    [{a.suggestion.sources.map(sourceIndex).join(", ")}]
                  </sup>
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs leading-5 text-slate">
          PT quyết định có áp dụng hay không; lựa chọn này không tự thay bài trong giáo án đang dùng.
        </p>
      </div>

      <details className="rounded-lg border border-caution/25 bg-canvas p-3 text-xs leading-5 text-ink">
        <summary className="cursor-pointer font-semibold">
          Nguồn và giới hạn · Chưa có người đánh giá riêng
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {card.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {sources.length > 0 && (
          <ol className="mt-3 list-decimal space-y-2 pl-4">
            {sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-cobalt underline"
                >
                  {s.title} ↗
                </a>
                <span className="block text-slate">
                  Kiểm tra {s.checkedAt} · {s.access}
                </span>
              </li>
            ))}
          </ol>
        )}
      </details>
    </section>
  );
}
