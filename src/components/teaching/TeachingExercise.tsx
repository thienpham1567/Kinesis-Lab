import Image from "next/image";
import { useState } from "react";
import { getExerciseInstruction } from "@/lib/clinical/exercise-instructions";
import type {
  ExerciseInstruction,
  ExerciseInstructionMediaAsset,
  InstructionText,
} from "@/lib/clinical/exercise-instruction-types";
import type { EvidenceSource } from "@/lib/clinical/evidence-types";
import type { TeachingExercise as Exercise } from "@/lib/training/teaching-view";
import { ExerciseInstructionMedia } from "../training/ExerciseInstructionMedia";

const loadFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

function InstructionLines({
  title,
  lines,
  sources,
  ordered,
}: {
  title: string;
  lines: readonly InstructionText[];
  sources: ReadonlyMap<string, EvidenceSource>;
  ordered?: boolean;
}) {
  if (!lines.length) return null;
  const List = ordered ? "ol" : "ul";
  const sourceUrls = Array.from(sources.keys());
  return (
    <section className="teaching-instruction-block space-y-2">
      <h4 className="font-semibold text-ink">{title}</h4>
      <List
        className={`space-y-1.5 pl-5 text-pretty ${ordered ? "list-decimal" : "list-disc"}`}
      >
        {lines.map((line) => (
          <li key={line.text}>
            {line.text}
            {line.kind === "sourced" && (
              <sup className="ml-1 text-cobalt">
                [
                {line.sources
                  .map(({ url }) => sourceUrls.indexOf(url) + 1)
                  .join(", ")}
                ]
              </sup>
            )}
          </li>
        ))}
      </List>
    </section>
  );
}

function PlannedExercise({
  planned,
}: {
  planned: NonNullable<Exercise["planned"]>;
}) {
  const reps =
    planned.repMin === planned.repMax
      ? planned.repMin
      : `${planned.repMin}–${planned.repMax}`;

  let load = "PT hướng dẫn trực tiếp";
  if (planned.loadUnit === "bodyweight") load = "Trọng lượng cơ thể";
  else if (planned.load !== null)
    load = `${loadFormat.format(planned.load)} kg ${planned.loadUnit === "assisted" ? "trợ lực" : "tải ngoài"}`;
  const details = [
    ["Hiệp và số lần", `${planned.sets} hiệp × ${reps} lần`],
    [planned.loadUnit === "assisted" ? "Trợ lực" : "Tải", load],
    ["Nghỉ", `${planned.restSeconds} giây`],
    ["RIR", planned.rir ?? "PT hướng dẫn trực tiếp"],
    ["Tempo", planned.tempo || "PT hướng dẫn trực tiếp"],
    [
      "Cách tập",
      planned.method === "superset"
        ? `Superset · nhóm ${planned.supersetGroup}`
        : "Hiệp thường",
    ],
  ];

  return (
    <section className="teaching-instruction-block border-y border-rule py-3">
      <h4 className="font-semibold text-ink">Thông số theo giáo án đã lưu</h4>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-sm text-slate">{label}</dt>
            <dd className="wrap-anywhere font-medium tabular-nums text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PrintMedia({
  media,
  name,
}: {
  media: ExerciseInstructionMediaAsset;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className="teaching-print-media space-y-2">
      {!loaded && !failed && (
        <p role="status" className="teaching-screen-only text-sm text-slate">
          Đang tải hình minh họa…
        </p>
      )}
      {failed ? (
        <p>
          Không tải được hình minh họa. Bạn có thể dùng phần hướng dẫn bằng chữ.
        </p>
      ) : (
        <Image
          src={media.poster}
          width={640}
          height={360}
          unoptimized
          loading="eager"
          alt={`Hình minh họa ${name}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="h-auto max-h-72 w-full object-contain object-left"
        />
      )}
      <figcaption className="wrap-anywhere text-sm text-slate">
        {media.credit} · {media.license}
        <a
          className="block text-cobalt underline"
          href={media.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {media.sourceUrl}
        </a>
      </figcaption>
    </figure>
  );
}

function TeachingInstructions({
  card,
  name,
  handout,
  showMedia,
  showSources,
}: {
  card: ExerciseInstruction;
  name: string;
  handout: boolean;
  showMedia: boolean;
  showSources: boolean;
}) {
  const cues = card.cues.slice(0, 3);
  const purpose = card.observations
    .filter((line) => line.kind === "sourced")
    .slice(0, 1);
  const sources = new Map(
    [...purpose, ...card.setup, ...card.execution, ...cues].flatMap((line) =>
      line.kind === "sourced"
        ? line.sources.map((source) => [source.url, source] as const)
        : [],
    ),
  );
  return (
    <>
      <p className="text-slate">{card.variantNote}</p>
      {handout && card.media && <PrintMedia media={card.media} name={name} />}
      <div
        className={
          showMedia && card.media && !handout
            ? "grid items-start gap-6 md:grid-cols-2"
            : "space-y-4"
        }
      >
        <div className="space-y-4">
          <InstructionLines
            title="Mục đích động tác"
            lines={purpose}
            sources={sources}
          />
          <InstructionLines
            title="Chuẩn bị"
            lines={card.setup}
            sources={sources}
          />
          <InstructionLines
            title="Thực hiện"
            lines={card.execution}
            sources={sources}
            ordered
          />
          <InstructionLines
            title="Lời nhắc của PT"
            lines={cues}
            sources={sources}
          />
        </div>
        {showMedia &&
          !handout &&
          (card.media ? (
            <ExerciseInstructionMedia media={card.media} title={name} />
          ) : (
            <p className="teaching-screen-only text-sm text-slate">
              Thẻ này hiện có hướng dẫn bằng chữ.
            </p>
          ))}
      </div>
      <section className="space-y-2 border-t border-rule pt-3">
        <h4 className="font-semibold">Phạm vi hướng dẫn</h4>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate">
          {card.limitations.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </section>
      {(handout || showSources) && sources.size > 0 && (
        <section className="space-y-2 border-t border-rule pt-3">
          <h4 className="font-semibold">Nguồn tham khảo</h4>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate">
            {[...sources.values()].map((source) => (
              <li key={source.url} className="wrap-anywhere">
                <a
                  className="text-cobalt underline underline-offset-2"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title}
                </a>
                <span className="block">
                  Đối chiếu {source.checkedAt} · {source.access}
                </span>
                {handout && <span className="block">{source.url}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

export function TeachingExercise({
  exercise,
  showName = true,
  showMedia = true,
  showSources = false,
  handout = false,
}: {
  exercise: Exercise;
  showName?: boolean;
  showMedia?: boolean;
  showSources?: boolean;
  handout?: boolean;
}) {
  const card = getExerciseInstruction(exercise.exerciseId);
  return (
    <section className="teaching-exercise min-w-0 space-y-4 wrap-anywhere leading-relaxed text-ink">
      {showName && (
        <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {exercise.name}
        </h3>
      )}
      {exercise.planned && <PlannedExercise planned={exercise.planned} />}
      {card ? (
        <TeachingInstructions
          card={card}
          name={exercise.name}
          handout={handout}
          showMedia={showMedia}
          showSources={showSources}
        />
      ) : (
        <p className="text-sm text-slate">PT sẽ hướng dẫn trực tiếp bài này.</p>
      )}
    </section>
  );
}
