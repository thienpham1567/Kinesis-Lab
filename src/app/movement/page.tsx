"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon, PageHeading } from "@/components/WorkspaceUI";
import {
  EVIDENCE_LABELS,
  HANDBOOK,
  HANDBOOK_LESSON,
  type Evidence,
  type HandbookItem,
  type HandbookPart,
  type HandbookTable,
  type HandbookTopic,
} from "@/lib/clinical/movement-handbook";
import { ROM_MOVEMENTS } from "@/lib/clinical/rom-norms";

const EVIDENCE_CLASS: Record<Evidence, string> = {
  strong: "bg-cleared-soft text-cleared",
  moderate: "bg-cobalt-soft text-cobalt",
  weak: "bg-caution-soft text-caution",
  convention: "bg-canvas text-slate",
};

export default function MovementHandbookPage() {
  return (
    <Suspense
      fallback={
        <div className="panel flex min-h-64 items-center justify-center gap-3 text-sm text-slate">
          <Icon name="spinner" className="size-5 animate-spin" />
          Đang mở sổ tay…
        </div>
      }
    >
      <HandbookInner />
    </Suspense>
  );
}

function HandbookInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = HANDBOOK.find((t) => t.id === searchParams.get("tab")) ?? HANDBOOK[0];

  function selectTab(id: HandbookTopic["id"]) {
    router.replace(id === HANDBOOK[0].id ? "/movement" : `/movement?tab=${id}`, {
      scroll: false,
    });
  }

  return (
    <div className="space-y-5">
      <PageHeading
        eyebrow="Kiến thức nền · Có dẫn nguồn"
        title="Sổ tay vận động"
        description="Bốn nền tảng đánh giá vận động: mẫu chuyển động, cân đối cơ thể, biên độ vận động và kiểm soát chuyển động. Mỗi phần có khái niệm, cách đánh giá, con số nên nhớ, hiểu lầm hay gặp và câu hỏi tự kiểm tra."
      />

      <section className="panel space-y-2 p-5" aria-label="Bài học chung">
        <p className="eyebrow">Bài học xuyên suốt cả bốn mục</p>
        {HANDBOOK_LESSON.map((line) => (
          <p key={line} className="max-w-3xl text-sm leading-6 text-ink">
            {line}
          </p>
        ))}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate">
          <span>Mức bằng chứng:</span>
          {(Object.keys(EVIDENCE_LABELS) as Evidence[]).map((e) => (
            <EvidenceBadge key={e} evidence={e} />
          ))}
        </div>
      </section>

      <div className="tab-bar grid grid-cols-2 sm:grid-cols-4" aria-label="Các mục trong sổ tay">
        {HANDBOOK.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={topic.id === t.id}
            onClick={() => selectTab(t.id)}
            className="tab-button px-1.5 text-center sm:px-3.5"
          >
            {t.tab}
          </button>
        ))}
      </div>

      <TopicView key={topic.id} topic={topic} />
    </div>
  );
}

function TopicView({ topic }: { topic: HandbookTopic }) {
  return (
    <article className="space-y-6">
      <header className="panel space-y-2 p-5 sm:p-6">
        <p className="font-mono text-xs text-cobalt">{topic.kicker}</p>
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{topic.title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-ink">{topic.gist}</p>
      </header>

      {topic.parts.map((part) => (
        <PartView key={part.label} part={part} />
      ))}

      <Section label="Con số nên nhớ">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topic.numbers.map((n) => (
            <div key={n.value} className="rounded-lg border border-rule bg-sheet p-4">
              <p className="font-mono text-lg font-semibold text-ink">{n.value}</p>
              <p className="mt-1 text-xs leading-5 text-slate">
                {n.text} {n.evidence ? <EvidenceBadge evidence={n.evidence} /> : null}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Hiểu lầm hay gặp">
        <div className="space-y-2">
          {topic.myths.map((m) => (
            <div
              key={m.say}
              className="grid overflow-hidden rounded-lg border border-rule bg-sheet sm:grid-cols-2"
            >
              <div className="bg-crimson-soft/50 p-4 text-sm leading-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-crimson">Hay nghe</p>
                <p className="mt-1 text-ink">{m.say}</p>
              </div>
              <div className="p-4 text-sm leading-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cleared">Bằng chứng nói</p>
                <p className="mt-1 text-ink">
                  {m.real} {m.evidence ? <EvidenceBadge evidence={m.evidence} /> : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <section className="space-y-3 rounded-xl border border-cobalt/15 bg-cobalt-soft/60 p-5">
        <p className="eyebrow text-cobalt">Áp dụng trong buổi tập</p>
        <ItemList items={topic.apply} />
        {topic.id === "rom" ? (
          <Link href="/clients" className="button-secondary">
            Mở hồ sơ học viên để ghi số đo
            <Icon name="arrow-right" className="size-4" />
          </Link>
        ) : null}
      </section>

      <Section label="Tự kiểm tra">
        <div className="space-y-2">
          {topic.quiz.map((q) => (
            <details key={q.q} className="group rounded-lg border border-rule bg-sheet px-4">
              <summary className="flex cursor-pointer list-none gap-3 py-3 text-sm font-medium leading-6 text-ink">
                <span className="font-mono text-cobalt group-open:text-cleared">?</span>
                {q.q}
              </summary>
              <p className="pb-4 pl-6 text-sm leading-6 text-slate">{q.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <footer className="space-y-1 border-t border-rule pt-4 text-xs leading-5 text-slate">
        <p className="font-medium text-ink">Nguồn chính</p>
        <p>
          {topic.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 ? " · " : ""}
              <a href={s.url} target="_blank" rel="noreferrer" className="text-cobalt hover:underline">
                {s.label}
              </a>
            </span>
          ))}
        </p>
        <p>Sổ tay để học và tham khảo, không thay thế chẩn đoán của bác sĩ hoặc chuyên viên vật lý trị liệu.</p>
      </footer>
    </article>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="eyebrow">{label}</h3>
      {children}
    </section>
  );
}

function PartView({ part }: { part: HandbookPart }) {
  return (
    <Section label={part.label}>
      {part.intro ? <p className="max-w-3xl text-sm leading-6 text-ink">{part.intro}</p> : null}
      {part.items ? <ItemList items={part.items} /> : null}
      {part.table ? <TableView table={part.table} /> : null}
      {part.chart === "knee-flexion" ? <KneeFlexionChart /> : null}
      {part.note ? <p className="max-w-3xl text-xs leading-5 text-slate">{part.note}</p> : null}
    </Section>
  );
}

function ItemList({ items }: { items: HandbookItem[] }) {
  return (
    <ul className="max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-ink marker:text-cobalt">
      {items.map((item) => (
        <li key={(item.lead ?? "") + item.text}>
          {item.lead ? <strong className="font-semibold">{item.lead}</strong> : null}{" "}
          {item.text} {item.evidence ? <EvidenceBadge evidence={item.evidence} /> : null}
        </li>
      ))}
    </ul>
  );
}

function TableView({ table }: { table: HandbookTable }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-rule bg-sheet">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-rule bg-canvas text-[11px] uppercase tracking-wider text-slate">
          <tr>
            {table.head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {table.rows.map((row) => (
            <tr key={row.cells[0]} className="align-top">
              {row.cells.map((cell, i) => (
                <td key={i} className="px-4 py-2.5 leading-6 text-ink">
                  {cell}
                  {i === row.cells.length - 1 && row.evidence ? (
                    <>
                      {" "}
                      <EvidenceBadge evidence={row.evidence} />
                    </>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 align-middle text-[10px] font-semibold ${EVIDENCE_CLASS[evidence]}`}
    >
      {EVIDENCE_LABELS[evidence]}
    </span>
  );
}

// Knee flexion scale 0–160°: functional bands (Rowe 2000) and CDC adult means.
function KneeFlexionChart() {
  const means = ROM_MOVEMENTS.find((m) => m.id === "knee_flexion")!.means as Record<"F" | "M", number[]>;
  const male = means.M[2];
  const female = means.F[2];
  const x = (deg: number) => 20 + (deg / 160) * 600;
  const fmt = (n: number) => n.toFixed(1).replace(".", ",");
  return (
    <figure className="overflow-x-auto rounded-lg border border-rule bg-sheet p-4">
      <svg
        viewBox="0 0 660 150"
        className="block h-auto w-full min-w-[520px]"
        role="img"
        aria-label={`Thang gập gối 0–160°: đi bộ cần dưới 90°, cầu thang và ngồi ghế 90–120°, mục tiêu phục hồi 110°, trung bình nam 20–44 tuổi ${fmt(male)}°, nữ ${fmt(female)}°`}
      >
        <rect x="20" y="66" width="600" height="16" rx="3" className="fill-rule" />
        <rect x="20" y="66" width={x(90) - 20} height="16" rx="3" className="fill-cobalt-soft" />
        <rect x={x(90)} y="66" width={x(120) - x(90)} height="16" className="fill-cobalt/30" />
        <text x={(20 + x(90)) / 2} y="102" textAnchor="middle" fontSize="12" className="fill-slate">
          đi bộ, đi dốc (&lt; 90°)
        </text>
        <text x={(x(90) + x(120)) / 2} y="102" textAnchor="middle" fontSize="12" className="fill-slate">
          cầu thang, ngồi ghế (90–120°)
        </text>
        <line x1={x(110)} y1="55" x2={x(110)} y2="86" strokeWidth="2" className="stroke-cobalt" />
        <text x={x(110)} y="50" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-cobalt">
          mục tiêu phục hồi 110°
        </text>
        <line x1={x(male)} y1="32" x2={x(male)} y2="86" strokeWidth="1.5" className="stroke-ink" />
        <text x={x(male) - 5} y="30" textAnchor="end" fontSize="12" className="fill-ink">
          TB nam 20–44: {fmt(male)}°
        </text>
        <line x1={x(female)} y1="8" x2={x(female)} y2="86" strokeWidth="1.5" strokeDasharray="3 2" className="stroke-ink" />
        <text x={x(female) - 5} y="12" textAnchor="end" fontSize="12" className="fill-ink">
          TB nữ 20–44: {fmt(female)}°
        </text>
        {[0, 30, 60, 90, 120, 150].map((d) => (
          <text key={d} x={x(d)} y="130" textAnchor="middle" fontSize="11" className="fill-slate font-mono">
            {d}°
          </text>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs text-slate">
        Trung bình theo CDC (Soucie 2011); mốc chức năng theo Rowe 2000. Trung bình là mức của người khỏe, không phải
        ngưỡng chẩn đoán.
      </figcaption>
    </figure>
  );
}
