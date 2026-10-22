"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HYPERTROPHY_EXERCISES,
  MUSCLE_GROUP_ATLAS,
  type MuscleGroupId,
} from "@/lib/clinical/muscle-hypertrophy-atlas";
import { EXERCISE_EVIDENCE } from "@/lib/clinical/evidence-muscle";
import {
  TRAINING_ROLE_LABELS,
  filterTrainingExercises,
  exercisesForMuscle,
  resolveTrainingSelection,
  trainingHref,
  atlasGroupHref,
} from "@/lib/clinical/training-atlas";
import { ClinicalEvidencePanel } from "../ClinicalEvidencePanel";
import { EmptyState, Icon } from "../WorkspaceUI";
import { MuscleStudyCard } from "./MuscleStudyCard";
import { TrainingAnatomyViewer } from "./TrainingAnatomyViewer";
import { CurlExercisePreview } from "./curl/CurlExercisePreview";
import type { Client } from "@/lib/types";
const ROLE_STYLE = {
  primary: "border-crimson/30 bg-crimson-soft text-crimson",
  synergist: "border-caution/30 bg-caution-soft text-caution",
  stabilizer: "border-cobalt/30 bg-cobalt-soft text-cobalt",
};
export function TrainingAtlasExplorer({
  initialExerciseId,
  initialMuscleId,
}: {
  initialExerciseId?: string | null;
  initialMuscleId?: string | null;
}) {
  const router = useRouter();
  const { exercise, muscle, mode } = resolveTrainingSelection(
    HYPERTROPHY_EXERCISES,
    MUSCLE_GROUP_ATLAS,
    { exerciseId: initialExerciseId, muscleId: initialMuscleId },
  );
  const [query, setQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [pattern, setPattern] = useState("all");
  const [showRecording, setShowRecording] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [clientError, setClientError] = useState("");
  const [clientRetry, setClientRetry] = useState(0);
  const [loadingClients, setLoadingClients] = useState(false);
  useEffect(() => {
    if (!showRecording) return;
    const controller = new AbortController();
    fetch("/api/clients", { signal: controller.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Không tải được học viên");
        return d.clients ?? [];
      })
      .then((d) => {
        if (!controller.signal.aborted) setClients(d);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setClientError(
            e instanceof Error ? e.message : "Không tải được học viên",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingClients(false);
      });
    return () => controller.abort();
  }, [showRecording, clientRetry]);
  const filtered = filterTrainingExercises(
    HYPERTROPHY_EXERCISES,
    query,
    pattern,
  );
  const matchingMuscles = MUSCLE_GROUP_ATLAS.filter((m) =>
    `${m.name} ${m.latinName}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLowerCase()
      .includes(
        query
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .toLowerCase()
          .trim(),
      ),
  );
  function goExercise(id: string) {
    if (mode !== "exercise") {
      setQuery("");
      setPattern("all");
    }
    setCatalogOpen(false);
    router.push(trainingHref("exercise", id));
  }
  function goMuscle(id: MuscleGroupId) {
    if (mode !== "muscle") setQuery("");
    setCatalogOpen(false);
    router.push(trainingHref("muscle", id));
  }
  const related = exercisesForMuscle(HYPERTROPHY_EXERCISES, muscle.id);
  return (
    <section className="min-w-0 space-y-4" aria-label="Atlas dành cho PT">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div
          className="grid w-full grid-cols-2 gap-1 rounded-lg border border-rule bg-canvas p-1 sm:w-auto"
          role="group"
          aria-label="Cách tra cứu PT"
        >
          <button
            className="tab-button min-h-11"
            aria-pressed={mode === "exercise"}
            onClick={() => goExercise(exercise.id)}
          >
            Bài tập → Cơ
          </button>
          <button
            className="tab-button min-h-11"
            aria-pressed={mode === "muscle"}
            onClick={() => goMuscle(muscle.id)}
          >
            Cơ → Bài tập
          </button>
        </div>
      </div>
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className="panel min-w-0 overflow-hidden lg:sticky lg:top-24"
          aria-label="Danh mục huấn luyện"
        >
          <button
            className="flex min-h-12 w-full items-center justify-between px-4 text-sm font-semibold text-ink lg:hidden"
            aria-expanded={catalogOpen}
            onClick={() => setCatalogOpen((v) => !v)}
          >
            {mode === "exercise" ? "Chọn bài tập" : "Chọn nhóm cơ"}
            <span className="text-xs font-normal text-slate">
              {mode === "exercise" ? filtered.length : matchingMuscles.length}{" "}
              mục · {catalogOpen ? "Thu gọn" : "Mở danh mục"}
            </span>
          </button>
          <div className={`${catalogOpen ? "block" : "hidden"} lg:block`}>
            <div className="space-y-3 border-b border-rule p-4">
              <label className="field-label">
                {mode === "exercise" ? "Tìm bài tập" : "Tìm nhóm cơ"}
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    mode === "exercise"
                      ? "Tên bài, thiết bị…"
                      : "Tên Việt hoặc Latin…"
                  }
                />
              </label>
              {mode === "exercise" && (
                <label className="field-label">
                  Nhóm chuyển động
                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                  >
                    <option value="all">Tất cả bài tập</option>
                    {["Push", "Pull", "Legs & Glutes", "Arms & Core"].map(
                      (p) => (
                        <option key={p}>{p}</option>
                      ),
                    )}
                  </select>
                </label>
              )}
              <p className="text-[11px] text-slate" role="status">
                {mode === "exercise" ? filtered.length : matchingMuscles.length}{" "}
                kết quả
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-rule lg:max-h-[580px]">
              {(mode === "exercise" ? filtered : matchingMuscles).map(
                (item) => (
                  <button
                    key={item.id}
                    aria-pressed={
                      mode === "exercise"
                        ? exercise.id === item.id
                        : muscle.id === item.id
                    }
                    onClick={() =>
                      mode === "exercise"
                        ? goExercise(item.id)
                        : goMuscle(item.id as MuscleGroupId)
                    }
                    className={`block w-full border-l-[3px] p-3.5 text-left transition-colors ${(mode === "exercise" ? exercise.id : muscle.id) === item.id ? "border-cobalt bg-cobalt-soft" : "border-transparent hover:bg-surface"}`}
                  >
                    <span className="block text-sm font-semibold text-ink">
                      {"vietnameseName" in item
                        ? item.vietnameseName
                        : item.name}
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 text-slate">
                      {"equipment" in item
                        ? `${item.name} · ${item.equipment}`
                        : item.latinName}
                    </span>
                  </button>
                ),
              )}
              {(mode === "exercise" ? filtered : matchingMuscles).length ===
                0 && (
                <div className="p-4">
                  <p className="text-xs text-slate">
                    Không có kết quả phù hợp.
                  </p>
                  <button
                    className="mt-3 text-xs font-semibold text-cobalt underline"
                    onClick={() => {
                      setQuery("");
                      setPattern("all");
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
        <div className="min-w-0 space-y-4">
          {mode === "exercise" ? (
            <>
              <header className="panel space-y-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow">
                      {exercise.pattern} · {exercise.equipment}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
                      {exercise.vietnameseName}
                    </h3>
                    <p className="mt-1 text-xs text-slate">{exercise.name}</p>
                  </div>
                  <button
                    className="button-primary"
                    aria-expanded={showRecording}
                    onClick={() => {
                      if (!showRecording) {
                        setLoadingClients(true);
                        setClientError("");
                      }
                      setShowRecording((v) => !v);
                    }}
                  >
                    <Icon name="activity" className="size-4" />
                    Ghi bài này
                  </button>
                </div>
                <ClinicalEvidencePanel
                  evidence={EXERCISE_EVIDENCE[exercise.id]}
                />
              </header>
              {showRecording && (
                <section
                  className="panel space-y-3 p-4"
                  aria-label="Chọn học viên ghi buổi tập"
                >
                  <h4 className="font-semibold text-ink">
                    Ghi vào hồ sơ học viên
                  </h4>
                  {loadingClients ? (
                    <p role="status" className="text-xs text-slate">
                      Đang tải học viên…
                    </p>
                  ) : clientError ? (
                    <div role="alert">
                      <p className="text-xs text-crimson">{clientError}</p>
                      <button
                        onClick={() => {
                          setLoadingClients(true);
                          setClientError("");
                          setClientRetry((n) => n + 1);
                        }}
                        className="button-secondary mt-2"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : clients.length ? (
                    <>
                      <label className="field-label">
                        Học viên
                        <select
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                        >
                          <option value="">Chọn học viên…</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      {clients.some((c) => c.id === clientId) && (
                        <Link
                          className="button-primary"
                          href={`/clients/${encodeURIComponent(clientId)}?tab=training&exercise=${encodeURIComponent(exercise.id)}`}
                        >
                          Mở nhật ký với bài đã chọn →
                        </Link>
                      )}
                    </>
                  ) : (
                    <EmptyState icon="users" title="Chưa có học viên">
                      <Link href="/clients" className="text-cobalt underline">
                        Tạo hồ sơ học viên
                      </Link>
                    </EmptyState>
                  )}
                </section>
              )}
              <div className="grid min-w-0 items-start gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(250px,.85fr)]">
                {exercise.id === "bayesian-incline-curl" ? (
                  <CurlExercisePreview exercise={exercise} />
                ) : (
                  <TrainingAnatomyViewer exercise={exercise} />
                )}
                <section
                  className="panel space-y-3 p-4 sm:p-5"
                  aria-label="Các cơ tham gia"
                >
                  <div>
                    <h4 className="font-semibold text-ink">
                      Các nhóm cơ tham gia
                    </h4>
                    <p className="mt-1 text-[11px] leading-5 text-slate">
                      Vai trò định tính theo thiết lập ví dụ. Không phải số đo
                      EMG hoặc tỷ lệ hoạt hóa; các biến thể có thể khác nhau.
                    </p>
                  </div>
                  {exercise.targets.map((t) => {
                    const m = MUSCLE_GROUP_ATLAS.find(
                      (g) => g.id === t.muscleId,
                    )!;
                    return (
                      <div
                        key={t.muscleId}
                        className="rounded-lg border border-rule p-3"
                      >
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLE[t.role]}`}
                        >
                          {TRAINING_ROLE_LABELS[t.role]}
                        </span>
                        <button
                          onClick={() => goMuscle(m.id)}
                          className="mt-2 block text-left text-sm font-semibold text-ink hover:text-cobalt"
                        >
                          {m.name} →
                        </button>
                        <p className="mt-1 text-xs leading-5 text-slate">
                          {t.targetedHeads}
                        </p>
                        <div className="mt-2">
                          <Link
                            className="text-xs font-semibold text-cobalt underline"
                            href={atlasGroupHref(m.id)}
                          >
                            Xem nhóm cơ 3D ↗
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </section>
              </div>
              <section
                className="panel p-4 sm:p-5"
                aria-label="Gợi ý hướng dẫn bài tập"
              >
                <h4 className="font-semibold text-ink">
                  Chuẩn bị và hướng dẫn
                </h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-cobalt">
                      Thiết lập & thực hiện
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink">
                      {exercise.setupAndExecution}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-caution">
                      Điểm cần quan sát
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink">
                      {exercise.commonMistake}
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <MuscleStudyCard muscle={muscle} />
              <section
                className="panel space-y-4 p-4 sm:p-5"
                aria-label="Bài tập liên quan"
              >
                <div>
                  <p className="eyebrow">Từ cấu trúc tới thực hành</p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">
                    Bài tập liên quan
                  </h3>
                  <p className="mt-1 text-[11px] text-slate">
                    Sắp theo vai trò định tính, không xếp hạng hiệu quả hoặc mức
                    hoạt hóa.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {related.map((e) => {
                    const target = e.targets.find(
                      (t) => t.muscleId === muscle.id,
                    );
                    if (!target) return null;
                    const role = target.role;
                    return (
                      <button
                        key={e.id}
                        onClick={() => goExercise(e.id)}
                        className="rounded-lg border border-rule p-4 text-left hover:border-cobalt hover:bg-cobalt-soft"
                      >
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLE[role]}`}
                        >
                          {TRAINING_ROLE_LABELS[role]}
                        </span>
                        <span className="mt-2 block text-sm font-semibold text-ink">
                          {e.vietnameseName}
                        </span>
                        <span className="mt-1 block text-xs text-slate">
                          {e.name}
                        </span>
                        <span className="mt-3 block text-xs font-semibold text-cobalt">
                          Xem giải phẫu & hướng dẫn →
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!related.length && (
                  <p className="text-sm text-slate">
                    Chưa có bài tập liên kết cho nhóm cơ này.
                  </p>
                )}
              </section>
              <details className="panel p-4 text-xs leading-6 text-slate">
                <summary className="cursor-pointer font-semibold text-ink">
                  Bằng chứng về tập luyện và tăng cơ
                </summary>
                <p className="mt-3">{muscle.hypertrophyScience}</p>
              </details>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
