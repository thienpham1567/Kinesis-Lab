"use client";

import Link from "next/link";
import { ClinicalEvidencePanel } from "./ClinicalEvidencePanel";
import { TriggerSourceAnatomy } from "./TriggerSourceAnatomy";
import { TriggerPainLocator } from "./TriggerPainLocator";
import { TRIGGER_POINT_EVIDENCE, TRIGGER_GENERAL_EVIDENCE } from "@/lib/clinical/evidence-trigger";
import { useState, type ReactNode } from "react";
import {
  CATEGORY_LABELS,
  PALPATION_FUNDAMENTALS,
  PAIN_SITE_CULPRIT_MAP,
  TRIGGER_POINT_MUSCLES,
  culpritMusclesForSite,
  getPainSite,
  getTriggerPointMuscle,
  type PainSiteId,
  type TriggerPointCategory,
  type TriggerPointMuscle,
  type TriggerPointMuscleId,
} from "@/lib/clinical/trigger-point-atlas";
type LookupMode = "muscle_to_pain" | "pain_to_muscle" | "handbook";

export function TriggerPointExplorer({
  initialMode = "muscle_to_pain",
}: {
  initialMode?: LookupMode;
}) {
  const [lookupMode, setLookupMode] = useState<LookupMode>(initialMode);
  const [selectedMuscleId, setSelectedMuscleId] =
    useState<TriggerPointMuscleId>("infraspinatus");
  const [selectedPainSiteId, setSelectedPainSiteId] =
    useState<PainSiteId>("anterior_shoulder");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | TriggerPointCategory
  >("all");
  const [bodySide, setBodySide] = useState<"both" | "anterior" | "posterior">(
    "both",
  );
  const activeMuscle = getTriggerPointMuscle(selectedMuscleId);

  const filteredMuscles = TRIGGER_POINT_MUSCLES.filter(
    (m) => categoryFilter === "all" || m.category === categoryFilter,
  );

  function selectMuscle(id: TriggerPointMuscleId) {
    const muscle = getTriggerPointMuscle(id);
    setSelectedMuscleId(id);
    setLookupMode("muscle_to_pain");
    if (categoryFilter !== "all" && categoryFilter !== muscle.category) {
      setCategoryFilter("all");
    }
  }

  function selectPainSite(id: PainSiteId) {
    setSelectedPainSiteId(id);
    setBodySide(getPainSite(id).view);
  }

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 px-4 py-3.5">
        <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-rule bg-canvas p-1 sm:inline-flex sm:w-auto">
          {(
            [
              { id: "muscle_to_pain", label: "Tra cứu theo cơ" },
              { id: "pain_to_muscle", label: "Tra cứu vùng đau" },
              { id: "handbook", label: "Cẩm nang sờ nắn" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => { setLookupMode(mode.id); setBodySide("both"); }}
                  aria-pressed={lookupMode === mode.id}
              className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                lookupMode === mode.id
                  ? mode.id === "pain_to_muscle"
                    ? "bg-caution text-white"
                    : mode.id === "handbook"
                      ? "bg-ink text-white"
                      : "bg-crimson text-white"
                  : "text-slate hover:text-ink"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {lookupMode === "muscle_to_pain" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "neck_shoulder", "trunk", "hip_leg"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  aria-pressed={categoryFilter === cat}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    categoryFilter === cat
                      ? "bg-crimson-soft text-crimson"
                      : "bg-surface text-slate hover:text-ink"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {lookupMode === "muscle_to_pain" && (
        <div className="flex flex-wrap gap-1.5">
          {filteredMuscles.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMuscle(m.id)}
              aria-pressed={m.id === selectedMuscleId}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                m.id === selectedMuscleId
                  ? "border-crimson bg-crimson text-white"
                  : "border-rule bg-sheet text-slate hover:border-crimson hover:text-ink"
              }`}
            >
              {m.shortName}
            </button>
          ))}
        </div>
      )}

      {lookupMode === "pain_to_muscle" && (
        <div className="flex flex-wrap gap-1.5">
          {PAIN_SITE_CULPRIT_MAP.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => selectPainSite(site.id)}
                  aria-pressed={selectedPainSiteId === site.id}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                site.id === selectedPainSiteId
                  ? "border-caution bg-caution text-white"
                  : "border-rule bg-sheet text-slate hover:border-caution hover:text-ink"
              }`}
            >
              {site.shortName}
            </button>
          ))}
        </div>
      )}

      {lookupMode === "handbook" ? (
        <HandbookPanel />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-lg border border-rule bg-sheet p-3.5 shadow-xs lg:sticky lg:top-[5.5rem] lg:self-start lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto">
            {lookupMode === "muscle_to_pain" ? (
              <TriggerSourceAnatomy muscle={activeMuscle}/>
            ) : (
              <TriggerPainLocator selectedId={selectedPainSiteId} side={bodySide} onSide={setBodySide} onSelect={selectPainSite}/>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-rule bg-sheet p-4 shadow-xs sm:p-5">
            {lookupMode === "muscle_to_pain" ? (
              <MuscleClinicalPanel
                muscle={activeMuscle}
                onJumpToPainSite={(id) => {
                  selectPainSite(id);
                  setLookupMode("pain_to_muscle");
                }}
              />
            ) : (
              <PainSitePanel
                siteId={selectedPainSiteId}
                onSelectMuscle={selectMuscle}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MuscleClinicalPanel({
  muscle,
  onJumpToPainSite,
}: {
  muscle: TriggerPointMuscle;
  onJumpToPainSite: (id: PainSiteId) => void;
}) {
  const relatedSites = PAIN_SITE_CULPRIT_MAP.filter((site) =>
    site.culprits.some((c) => c.muscleId === muscle.id),
  );

  return (
    <>
      <ClinicalEvidencePanel evidence={TRIGGER_POINT_EVIDENCE[muscle.id]} />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-4">
        <div className="min-w-0 flex-1">
          <span className="rounded bg-crimson-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-crimson">
            {muscle.latinName}
          </span>
          <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {muscle.name}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate">
            {muscle.summary}
          </p>
        </div>
        <Link
          href={`/?prompt=${encodeURIComponent(muscle.sampleAiPrompt)}`}
          className="rounded-md bg-cobalt px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-95"
        >
          Trao đổi với AI
        </Link>
      </div>

      <div className="space-y-2.5 rounded-md border border-crimson/25 bg-crimson-soft/40 p-3.5 text-xs leading-6 text-ink">
        <div>
          <span className="font-display font-bold text-crimson">
            Giả thuyết và giới hạn cơ chế:{" "}
          </span>
          {muscle.mechanism}
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          Thành phần, lớp giải phẫu và phạm vi nghiên cứu
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {muscle.components.map((c) => (
            <div key={c.latin} className="rounded-md border border-rule bg-canvas/60 p-3 text-xs leading-5">
              <p className="font-display font-bold text-ink">
                {c.name} <span className="font-mono text-[11px] font-normal text-slate">{c.latin}</span>
              </p>
              <p className="mt-1 text-ink">
                <strong>Lớp/vị trí: </strong>
                {c.layer}
              </p>
              <p className="mt-1 text-slate">
                <strong>Nghiên cứu trigger point: </strong>
                {c.trpStudy}
              </p>
            </div>
          ))}
        </div>

      </section>

      {relatedSites.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="self-center text-[11px] font-semibold text-slate">
            Vùng đau liên quan để tra cứu:
          </span>
          {relatedSites.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => onJumpToPainSite(site.id)}
              className="rounded-full border border-caution/40 bg-caution-soft px-2.5 py-1 text-[11px] font-semibold text-caution hover:border-caution"
            >
              {site.shortName} →
            </button>
          ))}
        </div>
      )}

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          1. Trao đổi triệu chứng &amp; giới hạn tiếp xúc
        </h3>
        <div className="grid gap-2 text-xs md:grid-cols-2">
          <PalpationCard label="Tư thế học viên" value={muscle.palpation.clientPosition} />
          <PalpationCard
            label="Thuật ngữ kỹ thuật"
            value={muscle.palpation.technique}
            accent
          />
          <PalpationCard label="Mô tả vùng, không phải tọa độ ấn" value={muscle.palpation.bonyLandmarks} />
          <PalpationCard
            label="Giới hạn tiếp xúc"
            value={muscle.palpation.underFingerFeel}
          />
        </div>
        <div className="rounded-md border border-rule bg-canvas/70 px-3 py-2.5 text-xs leading-6 text-ink">
          <strong className="text-crimson">Ghi nhận phản ứng: </strong>
          {muscle.palpation.clientResponse}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          2. Cơ liên quan cần đánh giá (giả thuyết, chưa xác nhận)
        </h3>
        <div className="rounded-lg border border-rule bg-canvas/60 p-4 text-xs leading-6">
          <p>
            <span className="rounded bg-caution-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-caution">
              {muscle.chain.overloadedState}
            </span>
          </p>
          <p className="mt-2 text-slate">{muscle.chain.biomechanicalReason}</p>
          <div className="mt-3 grid gap-2.5 md:grid-cols-2">
            <div className="rounded border border-cleared/30 bg-cleared-soft/50 p-2.5">
              <span className="inline-block rounded bg-cleared px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                Vận động/bài tập có thể cân nhắc sau đánh giá
              </span>
              <p className="mt-1.5 font-display font-bold text-ink">
                {muscle.chain.antagonistOrInhibited.muscles}
              </p>
              <p className="mt-1 text-slate">
                {muscle.chain.antagonistOrInhibited.whyRelated}
              </p>
              <p className="mt-1.5 text-ink">
                <strong>Ví dụ nếu phù hợp: </strong>
                {muscle.chain.antagonistOrInhibited.activationExercise}
              </p>
            </div>
            <div className="rounded border border-rule bg-sheet p-2.5">
              <span className="font-mono text-[10px] font-bold uppercase text-slate">
                Vùng liên quan khác (chưa xác nhận)
              </span>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-ink">
                {muscle.chain.satelliteTriggerPoints.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          3. Các lựa chọn và giới hạn thực hành
        </h3>
        <p className="text-xs leading-6 text-slate">Các mục dưới là ví dụ thực hành do ứng dụng biên soạn để chọn theo triệu chứng và khả năng. Chúng không phải trình tự điều trị đã được nghiên cứu cho từng cơ; có thể bỏ qua mục mô mềm.</p>
        <ol className="grid gap-2.5">
          <ProtocolStep
            n={1}
            title="Tự chăm sóc: giới hạn và lựa chọn"
            tone="crimson"
          >
            <p>
              <strong>Dụng cụ: </strong>
              {muscle.protocol.step1Release.tool}
            </p>
            <p>
              <strong>Vị trí: </strong>
              {muscle.protocol.step1Release.placement}
            </p>
            <p>
              <strong>Lực &amp; thời gian: </strong>
              {muscle.protocol.step1Release.pressureAndTime}
            </p>
            <p>
              <strong>Pin &amp; Stretch: </strong>
              {muscle.protocol.step1Release.pinAndStretch}
            </p>
          </ProtocolStep>
          <ProtocolStep n={2} title="Vận động trong khả năng phù hợp" tone="caution">
            <p>{muscle.protocol.step2Mobility}</p>
          </ProtocolStep>
          <ProtocolStep
            n={3}
            title="Tập cơ theo đánh giá và mục tiêu"
            tone="cleared"
          >
            <p>{muscle.protocol.step3Activation}</p>
          </ProtocolStep>
          <ProtocolStep n={4} title="Tải lại &amp; chỉnh kỹ thuật nâng tạ" tone="cobalt">
            <p>{muscle.protocol.step4LoadCue}</p>
          </ProtocolStep>
        </ol>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          4. Tình huống phòng tạ &amp; chống chỉ định
        </h3>
        <div className="grid gap-2.5 md:grid-cols-2">
          <div className="rounded-md border border-rule bg-canvas/60 p-3 text-xs">
            <p className="font-display font-bold text-ink">Tình huống tập có thể làm triệu chứng tăng</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-slate">
              {muscle.gymTriggers.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-crimson/30 bg-crimson-soft/50 p-3 text-xs">
            <p className="font-display font-bold text-crimson">
              Không được ấn / Red Flags
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-ink">
              {muscle.contraindications.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function PainSitePanel({
  siteId,
  onSelectMuscle,
}: {
  siteId: PainSiteId;
  onSelectMuscle: (id: TriggerPointMuscleId) => void;
}) {
  const site = getPainSite(siteId);
  const culprits = culpritMusclesForSite(site);

  return (
    <>
      <ClinicalEvidencePanel evidence={TRIGGER_GENERAL_EVIDENCE} />
      <div className="border-b border-rule pb-4">
        <span className="rounded bg-caution-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-caution">
          Đau có thể có nhiều nguyên nhân
        </span>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {site.name}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate">
          {site.victimLabel}
        </p>
      </div>

      <div className="space-y-3">
        {site.culprits.map((c) => {
          const muscle = getTriggerPointMuscle(c.muscleId);
          return (
            <button
              key={c.muscleId}
              type="button"
              onClick={() => onSelectMuscle(c.muscleId)}
              className="w-full rounded-lg border border-rule bg-canvas/60 p-4 text-left text-xs transition-colors hover:border-crimson"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-ink">
                  Nhóm cơ để tham khảo: {muscle.shortName}
                </h3>
                <span className="font-mono text-[11px] text-crimson">
                  {muscle.latinName}
                </span>
              </div>
              <p className="mt-2 leading-6 text-slate">{c.whyDeceptive}</p>
              <p className="mt-2 font-semibold text-cobalt">
                Xem nội dung và giới hạn theo nhóm cơ →
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-rule bg-surface/70 p-3.5 text-xs leading-6 text-ink">
        <strong>Giới hạn tra cứu: </strong>
        Vùng chọn triệu chứng chỉ giúp điều hướng; chưa có nguồn ánh xạ các tọa độ trigger point hoặc vùng đau lan cũ. Đau tái hiện khi sờ không xác nhận một cơ là nguồn đau duy nhất; không dùng hình minh họa để tự ấn sâu hoặc loại trừ bệnh khớp, thần kinh, mạch máu hay nội tạng.{" "}
        {culprits[0] && (
          <Link
            href={`/?prompt=${encodeURIComponent(culprits[0].sampleAiPrompt)}`}
            className="font-semibold text-cobalt hover:underline"
          >
            Trao đổi với AI về giới hạn đánh giá
          </Link>
        )}
      </div>
    </>
  );
}

function HandbookPanel() {
  const f = PALPATION_FUNDAMENTALS;
  return (
    <div className="space-y-4 rounded-lg border border-rule bg-sheet p-4 shadow-xs sm:p-5">
      <ClinicalEvidencePanel evidence={TRIGGER_GENERAL_EVIDENCE} />
      <div className="border-b border-rule pb-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {f.title}
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate">
          {f.ptScope}
        </p>
      </div>

      <div className="rounded-md border border-cobalt/25 bg-cobalt-soft/50 p-3.5 text-xs leading-6 text-ink">
        <span className="font-display font-bold text-cobalt">
          Giả thuyết tích hợp (Shah / Simons):{" "}
        </span>
        {f.hypothesis}
      </div>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          Tiêu chí đồng thuận và độ tin cậy sờ nắn
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {f.diagnosticCriteria.map((c) => (
            <div
              key={c.code}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs"
            >
              <p className="font-display font-bold text-ink">
                <span className="mr-1.5 font-mono text-crimson">{c.code}.</span>
                {c.name}
              </p>
              <p className="mt-1 leading-5 text-slate">{c.feel}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          Thông tin về sờ nắn và giới hạn
        </h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {f.techniques.map((t) => (
            <div
              key={t.name}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs leading-5"
            >
              <p className="font-mono text-[11px] font-bold text-cobalt">
                {t.name}
              </p>
              <p className="mt-1.5 text-ink">
                <strong>Khi nào: </strong>
                {t.when}
              </p>
              <p className="mt-1 text-slate">
                <strong>Cách làm: </strong>
                {t.how}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          Giới hạn tiếp xúc và dấu hiệu cần dừng
        </h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {f.pressureScale.map((p) => (
            <div
              key={p.level}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs"
            >
              <p className="font-mono text-[11px] font-bold text-crimson">
                {p.level}
              </p>
              <p className="mt-1 leading-5 text-slate">{p.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          Phân biệt Active TrP · Latent TrP · DOMS · Red Flags
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {f.differentials.map((d) => (
            <div
              key={d.name}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs"
            >
              <p className="font-display font-bold text-ink">{d.name}</p>
              <p className="mt-1 leading-5 text-slate">{d.vs}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-md border border-cleared/30 bg-cleared-soft/50 p-3.5 text-xs leading-6 text-ink">
        <span className="font-display font-bold text-cleared">
          Foam roll: bằng chứng và giới hạn cơ chế:{" "}
        </span>
        {f.smrMechanism}
      </div>

    </div>
  );
}

function PalpationCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        accent
          ? "border-crimson/30 bg-crimson-soft/40"
          : "border-rule bg-canvas/60"
      }`}
    >
      <p className="font-mono text-[10px] font-bold uppercase text-slate">
        {label}
      </p>
      <p className="mt-1 leading-5 text-ink">{value}</p>
    </div>
  );
}

function ProtocolStep({
  n,
  title,
  tone,
  children,
}: {
  n: number;
  title: string;
  tone: "crimson" | "caution" | "cleared" | "cobalt";
  children: ReactNode;
}) {
  const toneCls = {
    crimson: "border-crimson/30 bg-crimson-soft/40",
    caution: "border-caution/30 bg-caution-soft/50",
    cleared: "border-cleared/30 bg-cleared-soft/50",
    cobalt: "border-cobalt/30 bg-cobalt-soft/50",
  }[tone];
  const badgeCls = {
    crimson: "bg-crimson text-white",
    caution: "bg-caution text-white",
    cleared: "bg-cleared text-white",
    cobalt: "bg-cobalt text-white",
  }[tone];

  return (
    <li className={`rounded-lg border p-3.5 text-xs leading-6 ${toneCls}`}>
      <p className="font-display font-bold text-ink">
        <span
          className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[11px] ${badgeCls}`}
        >
          {n}
        </span>
        {title}
      </p>
      <div className="mt-1.5 space-y-1 text-ink">{children}</div>
    </li>
  );
}
