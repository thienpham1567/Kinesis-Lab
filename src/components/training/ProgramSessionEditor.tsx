"use client";

import Link from "next/link";
import { HYPERTROPHY_EXERCISES } from "@/lib/clinical/muscle-hypertrophy-atlas";
import {
  createExercisePrescription,
  WEEKDAY_LABELS,
  type ExercisePrescription,
  type ProgramSession,
} from "@/lib/training/program";
import { NumberField, ProgramField, UnitField } from "./ProgramFields";

export function ProgramSessionEditor({
  session,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  session: ProgramSession;
  index: number;
  onChange: (session: ProgramSession) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const context = `Buổi ${index + 1}`;
  function changeExercise(exercise: ExercisePrescription) {
    onChange({
      ...session,
      exercises: session.exercises.map((e) =>
        e.id === exercise.id ? exercise : e,
      ),
    });
  }
  return (
    <section
      className="min-w-0 border-t border-rule pt-5"
      aria-label={`${context} · ${session.name}`}
    >
      <div className="mb-4 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <ProgramField label="Tên buổi" context={context}>
          <input
            value={session.name}
            maxLength={120}
            onChange={(e) => onChange({ ...session, name: e.target.value })}
            required
          />
        </ProgramField>
        <ProgramField label="Ngày trong tuần" context={context}>
          <select
            value={session.weekday}
            onChange={(e) =>
              onChange({ ...session, weekday: Number(e.target.value) })
            }
          >
            {WEEKDAY_LABELS.map((label, day) => (
              <option key={day} value={day}>
                {label}
              </option>
            ))}
          </select>
        </ProgramField>
        <button
          type="button"
          className="button-secondary"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label={`${context} · Xóa buổi`}
        >
          Xóa buổi
        </button>
      </div>
      <div className="divide-y divide-rule">
        {session.exercises.map((exercise, i) => (
          <PrescriptionEditor
            key={exercise.id}
            exercise={exercise}
            context={`${context} · Bài ${i + 1}`}
            onChange={changeExercise}
            onRemove={() =>
              onChange({
                ...session,
                exercises: session.exercises.filter(
                  (e) => e.id !== exercise.id,
                ),
              })
            }
            canRemove={session.exercises.length > 1}
          />
        ))}
      </div>
      <button
        type="button"
        className="button-secondary mt-4"
        disabled={session.exercises.length >= 12}
        onClick={() =>
          onChange({
            ...session,
            exercises: [...session.exercises, createExercisePrescription()],
          })
        }
        aria-label={`${context} · Thêm bài tập`}
      >
        Thêm bài tập
      </button>
    </section>
  );
}

function PrescriptionEditor({
  exercise,
  context,
  onChange,
  onRemove,
  canRemove,
}: {
  exercise: ExercisePrescription;
  context: string;
  onChange: (exercise: ExercisePrescription) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const change = (patch: Partial<ExercisePrescription>) =>
    onChange({ ...exercise, ...patch });
  return (
    <div className="min-w-0 py-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ProgramField label="Bài Atlas (tùy chọn)" context={context}>
          <select
            value={exercise.exerciseId ?? ""}
            onChange={(e) => {
              const atlas = HYPERTROPHY_EXERCISES.find(
                (item) => item.id === e.target.value,
              );
              change({
                exerciseId: atlas?.id ?? null,
                ...(!exercise.name && atlas
                  ? { name: `${atlas.name} · ${atlas.vietnameseName}` }
                  : {}),
              });
            }}
          >
            <option value="">Bài tùy chỉnh / chưa liên kết</option>
            {HYPERTROPHY_EXERCISES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {e.vietnameseName}
              </option>
            ))}
          </select>
        </ProgramField>
        <ProgramField label="Tên bài / biến thể cụ thể" context={context}>
          <input
            value={exercise.name}
            maxLength={180}
            onChange={(e) => change({ name: e.target.value })}
            required
          />
        </ProgramField>
        <UnitField
          value={exercise.loadUnit}
          context={context}
          onChange={(loadUnit) => change({ loadUnit, load: null })}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <NumberField
          label="Số hiệp"
          context={context}
          value={exercise.sets}
          min={1}
          max={100}
          onChange={(n) => change({ sets: n ?? 1 })}
        />
        <NumberField
          label="Số lần tối thiểu"
          context={context}
          value={exercise.repMin}
          min={1}
          max={1000}
          onChange={(n) => change({ repMin: n ?? 1 })}
        />
        <NumberField
          label="Số lần tối đa"
          context={context}
          value={exercise.repMax}
          min={1}
          max={1000}
          onChange={(n) => change({ repMax: n ?? 1 })}
        />
        <NumberField
          label={
            exercise.loadUnit === "assisted" ? "Trợ lực (kg)" : "Tải ngoài (kg)"
          }
          context={context}
          value={exercise.load}
          nullable
          step={0.1}
          max={2000}
          disabled={exercise.loadUnit === "bodyweight"}
          onChange={(load) => change({ load })}
        />
        <NumberField
          label="Nghỉ (giây)"
          context={context}
          value={exercise.restSeconds}
          max={3600}
          onChange={(n) => change({ restSeconds: n ?? 0 })}
        />
        <NumberField
          label="RIR (tùy chọn)"
          context={context}
          value={exercise.rir}
          nullable
          max={10}
          step={0.5}
          onChange={(rir) => change({ rir })}
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ProgramField label="Tempo" context={context}>
          <input
            value={exercise.tempo}
            maxLength={80}
            onChange={(e) => change({ tempo: e.target.value })}
          />
        </ProgramField>
        <ProgramField label="Phương pháp" context={context}>
          <select
            value={exercise.method}
            onChange={(e) =>
              change({
                method: e.target.value as ExercisePrescription["method"],
                supersetGroup: "",
              })
            }
          >
            <option value="straight">Từng bài (straight set)</option>
            <option value="superset">Superset</option>
          </select>
        </ProgramField>
        <ProgramField label="Nhóm superset" context={context}>
          <input
            disabled={exercise.method !== "superset"}
            value={exercise.supersetGroup}
            maxLength={50}
            onChange={(e) => change({ supersetGroup: e.target.value })}
          />
        </ProgramField>
      </div>
      <div className="mt-3">
        <ProgramField label="Ghi chú kỹ thuật / điều chỉnh" context={context}>
          <textarea
            value={exercise.notes}
            maxLength={2000}
            onChange={(e) => change({ notes: e.target.value })}
          />
        </ProgramField>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {exercise.exerciseId && (
          <Link
            href={`/atlas?tab=hypertrophy&exercise=${encodeURIComponent(exercise.exerciseId)}`}
            className="inline-flex min-h-11 items-center text-xs font-semibold text-cobalt underline underline-offset-4"
          >
            Đọc bài và nguồn trong Atlas
          </Link>
        )}
        <button
          type="button"
          className="button-secondary ml-auto"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label={`${context} · Xóa bài`}
        >
          Xóa bài
        </button>
      </div>
    </div>
  );
}
