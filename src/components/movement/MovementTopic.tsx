import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type {
  Cited,
  HandbookItem,
  HandbookTopic,
} from "@/lib/clinical/movement-handbook";
import type {
  MovementSource,
  MovementSourceId,
} from "@/lib/clinical/movement-sources";
import { ROM_MOVEMENTS } from "@/lib/clinical/rom-norms";
import { ReadingProgress } from "./ReadingProgress";

export function MovementSourceLinks({
  ids,
  sources,
}: {
  ids?: MovementSourceId[];
  sources: MovementSource[];
}) {
  if (!ids?.length) return null;
  return (
    <span className="ml-1 inline-flex flex-wrap gap-1 align-baseline">
      {ids.map((id) => {
        const index = sources.findIndex((s) => s.id === id),
          source = sources[index];
        return source ? (
          <a
            key={id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            title={source.title}
            aria-label={`Nguồn ${index + 1}: ${source.label}`}
            className="rounded px-1 font-mono text-[11px] font-semibold text-cobalt underline decoration-cobalt/40 underline-offset-2 hover:bg-cobalt-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
          >
            [{index + 1}]
          </a>
        ) : null;
      })}
    </span>
  );
}
function Attribution({ block, topic }: { block: Cited; topic: HandbookTopic }) {
  return (
    <>
      {block.authored ? (
        <span className="ml-1 text-[10px] font-medium text-slate">
          {" "}
          · Ví dụ / quy ước của app
        </span>
      ) : null}
      <MovementSourceLinks ids={block.sourceIds} sources={topic.sources} />
    </>
  );
}
function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-36 space-y-3">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}
function Items({
  items,
  topic,
}: {
  items: HandbookItem[];
  topic: HandbookTopic;
}) {
  return (
    <ul className="max-w-4xl space-y-3 text-sm leading-6 text-ink">
      {items.map((item) => (
        <li
          key={(item.lead ?? "") + item.text}
          className="border-l-2 border-rule pl-3"
        >
          {item.lead ? <strong>{item.lead} </strong> : null}
          {item.text}
          <Attribution block={item} topic={topic} />
        </li>
      ))}
    </ul>
  );
}
export function MovementTopic({ topic }: { topic: HandbookTopic }) {
  const figure = topic.figure;
  const kneeMovement = ROM_MOVEMENTS.find((m) => m.id === "knee_flexion");
  const knee =
    kneeMovement && typeof kneeMovement.means !== "number"
      ? kneeMovement.means
      : null;
  return (
    <article
      id={`movement-article-${topic.id}`}
      aria-labelledby={`movement-${topic.id}-title`}
      className="space-y-7"
    >
      <header className="panel space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow text-cobalt">{topic.kicker}</p>
          <span className="text-xs text-slate">
            Đối chiếu 22/10/2026 · {topic.sources.length} nguồn
          </span>
        </div>
        <h2
          id={`movement-${topic.id}-title`}
          className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
        >
          {topic.title}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-ink">
          {topic.gist}
          <Attribution block={topic} topic={topic} />
        </p>
        <a
          href={`#movement-${topic.id}-sources`}
          className="inline-block text-xs font-semibold text-cobalt underline underline-offset-4"
        >
          Nguồn nào hỗ trợ nội dung này? ↓
        </a>
      </header>

      <ReadingProgress topicId={topic.id} />

      <div
        className={
          figure
            ? "grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
            : ""
        }
      >
        <section id={`movement-${topic.id}-key`} aria-label="Kiến thức trọng tâm" className="min-w-0 scroll-mt-36 space-y-3">
          <p className="eyebrow">Nắm chắc trước khi áp dụng</p>
          <div className="divide-y divide-rule rounded-xl border border-rule bg-sheet px-4 sm:px-5">
            {topic.keyPoints.map((point, index) => (
              <div key={point.title} className="flex gap-3 py-4">
                <span className="pt-0.5 font-mono text-xs text-cobalt">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate">
                    {point.text}
                    <Attribution block={point} topic={topic} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {figure ? (
          <figure className="min-w-0 overflow-hidden rounded-xl border border-rule bg-sheet">
            <a
              href={figure.src}
              target="_blank"
              rel="noreferrer"
              aria-label={`Mở ảnh đầy đủ: ${figure.title}`}
              className="block bg-white p-2 focus-visible:outline-2 focus-visible:outline-cobalt"
            >
              <Image
                src={figure.src}
                alt={figure.alt}
                width={figure.width}
                height={figure.height}
                loading="eager"
                sizes="(min-width:1280px) 430px, (min-width:640px) 760px, 100vw"
                className="h-auto w-full"
              />
            </a>
            <figcaption className="space-y-2 border-t border-rule p-4 text-xs leading-5 text-slate">
              <p className="font-semibold text-ink">{figure.title}</p>
              <p>{figure.caption}</p>
              <p>{figure.author}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <a
                  href={figure.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-cobalt underline"
                >
                  Nguồn hình ↗
                </a>
                <a
                  href={figure.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cobalt underline"
                >
                  {figure.license}
                </a>
                <a
                  href={figure.src}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cobalt underline"
                >
                  Xem ảnh lớn ↗
                </a>
              </div>
              <p>{figure.changes}</p>
            </figcaption>
          </figure>
        ) : null}
      </div>

      {topic.parts.map((part) => (
        <Section key={part.label} title={part.label}>
          {part.intro ? (
            <p className="max-w-4xl text-sm leading-6 text-ink">
              {part.intro}
              <Attribution block={part} topic={topic} />
            </p>
          ) : (
            <div className="text-xs text-slate">
              <Attribution block={part} topic={topic} />
            </div>
          )}
          {part.items ? <Items items={part.items} topic={topic} /> : null}
          {part.table ? (
            <div className="overflow-x-auto rounded-lg border border-rule bg-sheet">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-rule bg-canvas text-xs text-slate">
                  <tr>
                    {part.table.head.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {part.table.rows.map((row) => (
                    <tr key={row.cells[0]} className="align-top">
                      {row.cells.map((cell, index) => (
                        <td
                          key={part.table?.head[index] ?? cell}
                          className="px-4 py-3 leading-6 text-ink"
                        >
                          {cell}
                          {index === row.cells.length - 1 ? (
                            <Attribution block={row} topic={topic} />
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {part.chart === "knee-flexion" && knee ? (
            <figure className="rounded-lg border border-rule bg-sheet p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {(["M", "F"] as const).map((sex) => (
                  <div key={sex} className="rounded-lg bg-canvas p-4">
                    <p className="text-xs text-slate">
                      {sex === "M" ? "Nam" : "Nữ"} · 20–44 tuổi · PROM
                    </p>
                    <p className="mt-1 font-mono text-2xl font-semibold text-ink">
                      {knee[sex][2]}°
                    </p>
                  </div>
                ))}
              </div>
              <figcaption className="mt-3 text-xs leading-5 text-slate">
                Biểu diễn do app dựng từ trung bình gập gối CDC. Không phải
                khoảng bình thường của cá nhân.
                <MovementSourceLinks
                  ids={part.sourceIds}
                  sources={topic.sources}
                />
              </figcaption>
            </figure>
          ) : null}
          {part.note ? (
            <p className="max-w-4xl rounded-lg bg-canvas p-3 text-xs leading-6 text-slate">
              {part.note}
              <Attribution block={part} topic={topic} />
            </p>
          ) : null}
        </Section>
      ))}

      <Section title="Mốc và con số để đọc đúng">
        <div className="grid gap-3 sm:grid-cols-2">
          {topic.numbers.map((n) => (
            <div
              key={n.value}
              className="rounded-lg border border-rule bg-sheet p-4"
            >
              <p className="font-mono text-xl font-semibold text-cobalt">
                {n.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                {n.text}
                <Attribution block={n} topic={topic} />
              </p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Hiểu lầm hay gặp">
        <div className="space-y-3">
          {topic.myths.map((m) => (
            <div
              key={m.say}
              className="grid overflow-hidden rounded-lg border border-rule bg-sheet sm:grid-cols-2"
            >
              <div className="bg-crimson-soft/50 p-4">
                <p className="eyebrow text-crimson">Hay nghe</p>
                <p className="mt-2 text-sm leading-6 text-ink">{m.say}</p>
              </div>
              <div className="p-4">
                <p className="eyebrow text-cleared">Cách đọc bằng chứng</p>
                <p className="mt-2 text-sm leading-6 text-ink">
                  {m.real}
                  <Attribution block={m} topic={topic} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <section
        id={`movement-${topic.id}-apply`}
        aria-label="Áp dụng trong buổi tập"
        className="scroll-mt-36 space-y-3 rounded-xl border border-cobalt/20 bg-cobalt-soft/50 p-5"
      >
        <h3 className="font-display text-lg font-semibold text-ink">
          Áp dụng trong buổi tập
        </h3>
        <Items items={topic.apply} topic={topic} />
        {topic.id === "rom" ? (
          <Link href="/clients" className="button-secondary">
            Mở hồ sơ học viên để ghi số đo →
          </Link>
        ) : null}
      </section>
      <Section title="Tự kiểm tra" id={`movement-${topic.id}-quiz`}>
        <div className="space-y-2">
          {topic.quiz.map((q) => (
            <details
              key={q.q}
              className="rounded-lg border border-rule bg-sheet px-4"
            >
              <summary className="cursor-pointer py-3 text-sm font-semibold leading-6 text-ink">
                {q.q}
              </summary>
              <p className="pb-4 text-sm leading-6 text-slate">
                {q.a}
                <Attribution block={q} topic={topic} />
              </p>
            </details>
          ))}
        </div>
      </Section>
      <section
        id={`movement-${topic.id}-sources`}
        aria-label="Nguồn và phạm vi đã đọc"
        className="panel scroll-mt-36 space-y-4 p-5 sm:p-6"
      >
        <div>
          <p className="eyebrow text-cobalt">Đọc từ nguồn gốc</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-ink">
            Nguồn và phạm vi đã đọc
          </h3>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-slate">
            Số trong bài mở trực tiếp tài liệu tương ứng. Giáo trình, hướng dẫn,
            nghiên cứu gốc và tổng quan có vai trò khác nhau; xem đúng phạm vi
            trước khi áp dụng.
          </p>
        </div>
        <ol className="divide-y divide-rule">
          {topic.sources.map((s, index) => (
            <li key={s.id} className="py-4 first:pt-0">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-cobalt">
                  [{index + 1}]
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-slate">
                    {s.kind} · Kiểm tra {s.checkedAt}
                  </p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words text-sm font-semibold leading-6 text-cobalt underline decoration-cobalt/30 underline-offset-2"
                  >
                    {s.label} — {s.title} ↗
                  </a>
                  <p className="mt-2 text-xs leading-6 text-slate">
                    {s.access}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="border-t border-rule pt-3 text-xs leading-6 text-slate">
          Sổ tay phục vụ học và tham khảo. Ví dụ huấn luyện không phải kế hoạch
          điều trị cá nhân; kiến thức và hình minh họa không tự xác định nguồn
          đau hay mức sẵn sàng trở lại thể thao.
        </p>
      </section>
    </article>
  );
}
