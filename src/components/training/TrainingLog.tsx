"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { HYPERTROPHY_EXERCISES } from "@/lib/clinical/muscle-hypertrophy-atlas";
import { trainingAtlasHref, trainingExerciseName, type TrainingLoadUnit, type TrainingRecord } from "@/lib/training-log";

type TrainingLogProps = { clientId: string; initialExerciseId?: string | null };

function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function readResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Không thể truy cập nhật ký tập.");
  return data;
}

async function fetchHistory(clientId: string, signal?: AbortSignal): Promise<TrainingRecord[]> {
  const response = await fetch(`/api/training-log?client_id=${encodeURIComponent(clientId)}`, { signal, cache: "no-store" });
  const data = await readResponse(response);
  if (!Array.isArray(data.records)) throw new Error("Máy chủ trả về lịch sử không hợp lệ.");
  return data.records;
}

/** Keyed workspace prevents history and in-flight form state from crossing client boundaries. */
export function TrainingLog({ clientId, initialExerciseId }: TrainingLogProps) {
  return <TrainingLogWorkspace key={`${clientId}:${initialExerciseId ?? ""}`} clientId={clientId} initialExerciseId={initialExerciseId} />;
}

function TrainingLogWorkspace({ clientId, initialExerciseId }: TrainingLogProps) {
  const fieldId = useId();
  const [exerciseId, setExerciseId] = useState(() => HYPERTROPHY_EXERCISES.some((item) => item.id === initialExerciseId) ? initialExerciseId! : HYPERTROPHY_EXERCISES[0].id);
  const [date, setDate] = useState(today);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [load, setLoad] = useState("");
  const [loadUnit, setLoadUnit] = useState<TrainingLoadUnit>("kg");
  const [rpe, setRpe] = useState("");
  const [feedback, setFeedback] = useState("");
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchHistory(clientId, controller.signal)
      .then((history) => { if (!controller.signal.aborted) setRecords(history); })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Không tải được nhật ký.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [clientId]);

  async function reload() {
    setLoading(true);
    setError("");
    try { setRecords(await fetchHistory(clientId)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được nhật ký."); }
    finally { setLoading(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/training-log", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, recorded_at: date, exercise_id: exerciseId, sets: Number(sets), reps: Number(reps), load: loadUnit === "bodyweight" ? null : Number(load), load_unit: loadUnit, rpe: rpe.trim() === "" ? null : Number(rpe), feedback }),
      });
      const data = await readResponse(response);
      const record: TrainingRecord = data.record;
      if (!record?.id || record.client_id !== clientId) throw new Error("Máy chủ trả về nhật ký không hợp lệ; tải lại lịch sử trước khi thử lưu lại.");
      setRecords((previous) => [record, ...previous].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at) || b.created_at.localeCompare(a.created_at)));
      setNotice("Đã lưu nhật ký cho học viên này.");
      setFeedback("");
      setRpe("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không lưu được nhật ký. Kiểm tra kết nối và thử lại."); }
    finally { setSaving(false); }
  }

  async function remove(recordId: string) {
    if (deleting) return;
    setDeleting(recordId);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/training-log?client_id=${encodeURIComponent(clientId)}&id=${encodeURIComponent(recordId)}`, { method: "DELETE" });
      await readResponse(response);
      setRecords((previous) => previous.filter((item) => item.id !== recordId));
      setPendingDelete(null);
      setNotice("Đã xóa nhật ký đã chọn.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không xóa được nhật ký. Thử lại sau."); }
    finally { setDeleting(null); }
  }

  const inputClass = "mt-1.5 block min-h-11 w-full px-3 py-2 text-sm";
  return (
    <section className="min-w-0 space-y-5" aria-label="Nhật ký tập của học viên">
      <div className="panel min-w-0 p-4 sm:p-6">
        <p className="eyebrow">Theo dõi buổi tập</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">Nhật ký tập luyện</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate">Ghi lại bài đã tập, tải, số hiệp và phản hồi.</p>
        <form onSubmit={save} className="mt-5 min-w-0 space-y-4" aria-busy={saving}>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label htmlFor={`${fieldId}-date`} className="min-w-0 text-sm font-medium text-ink">Ngày tập
              <input id={`${fieldId}-date`} type="date" required value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} />
            </label>
            <label htmlFor={`${fieldId}-exercise`} className="min-w-0 text-sm font-medium text-ink">Bài tập
              <select id={`${fieldId}-exercise`} required value={exerciseId} onChange={(event) => setExerciseId(event.target.value)} className={inputClass}>
                {HYPERTROPHY_EXERCISES.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name} · {exercise.vietnameseName}</option>)}
              </select>
            </label>
          </div>
          <Link href={trainingAtlasHref(exerciseId)} className="inline-flex min-h-11 items-center text-sm font-semibold text-cobalt hover:underline">Xem bài này trong Atlas →</Link>
          <div className="grid min-w-0 grid-cols-2 gap-4">
            <label htmlFor={`${fieldId}-sets`} className="min-w-0 text-sm font-medium text-ink">Số hiệp
              <input id={`${fieldId}-sets`} type="number" min={1} max={100} step={1} inputMode="numeric" required value={sets} onChange={(event) => setSets(event.target.value)} className={inputClass} />
            </label>
            <label htmlFor={`${fieldId}-reps`} className="min-w-0 text-sm font-medium text-ink">Số lần / hiệp
              <input id={`${fieldId}-reps`} type="number" min={1} max={1000} step={1} inputMode="numeric" required value={reps} onChange={(event) => setReps(event.target.value)} className={inputClass} />
            </label>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label htmlFor={`${fieldId}-unit`} className="min-w-0 text-sm font-medium text-ink">Loại tải
              <select id={`${fieldId}-unit`} value={loadUnit} onChange={(event) => setLoadUnit(event.target.value as TrainingLoadUnit)} className={inputClass}>
                <option value="kg">Tải ngoài (kg)</option>
                <option value="bodyweight">Trọng lượng cơ thể</option>
                <option value="assisted">Có hỗ trợ (kg trợ lực)</option>
              </select>
            </label>
            {loadUnit !== "bodyweight" && <label htmlFor={`${fieldId}-load`} className="min-w-0 text-sm font-medium text-ink">{loadUnit === "assisted" ? "Mức trợ lực (kg)" : "Tải ngoài (kg)"}
              <input id={`${fieldId}-load`} type="number" min={0} max={2000} step="any" inputMode="decimal" required value={load} onChange={(event) => setLoad(event.target.value)} className={inputClass} aria-describedby={`${fieldId}-load-note`} />
            </label>}
          </div>
          <p id={`${fieldId}-load-note`} className="text-xs leading-relaxed text-slate">Ghi tổng tải ngoài hoặc khối lượng trợ lực theo thiết bị. Với trọng lượng cơ thể, không ghi tải ngoài. Ghi rõ cấu hình tạ/máy trong phản hồi nếu cần so sánh các lần tập.</p>
          <label htmlFor={`${fieldId}-rpe`} className="block min-w-0 text-sm font-medium text-ink">RPE buổi tập (tùy chọn, 0–10)
            <input id={`${fieldId}-rpe`} type="number" min={0} max={10} step="any" inputMode="decimal" value={rpe} onChange={(event) => setRpe(event.target.value)} className={inputClass} placeholder="Để trống nếu chưa ghi nhận" aria-describedby={`${fieldId}-rpe-note`} />
          </label>
          <p id={`${fieldId}-rpe-note`} className="text-xs leading-relaxed text-slate">Mức nỗ lực do người tập tự báo cáo trên thang 0–10. Đây là dữ liệu ghi nhận, không quy đổi thành tải chỉ định.</p>
          <label htmlFor={`${fieldId}-feedback`} className="block min-w-0 text-sm font-medium text-ink">Phản hồi / ghi chú (tùy chọn)
            <textarea id={`${fieldId}-feedback`} rows={3} maxLength={2000} value={feedback} onChange={(event) => setFeedback(event.target.value)} className={`${inputClass} resize-y`} placeholder="Cảm nhận buổi tập, cấu hình thiết bị, điều muốn trao đổi với PT…" />
          </label>
          {error && <p role="alert" className="break-words rounded-xl bg-crimson-soft p-3 text-sm text-crimson">{error}</p>}
          <p role="status" className="text-sm text-cleared">{notice}</p>
          <button type="submit" className="button-primary min-h-11 w-full sm:w-auto" disabled={saving || loading || Boolean(deleting)}>{saving ? "Đang lưu…" : "Lưu nhật ký"}</button>
        </form>
      </div>

      <div className="panel min-w-0 p-4 sm:p-6" aria-busy={loading}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">Lịch sử đã ghi <span className="text-sm font-normal text-slate">({records.length})</span></h3>
          <button type="button" className="button-secondary min-h-11" onClick={() => void reload()} disabled={loading || saving || Boolean(deleting)}>{loading ? "Đang tải…" : "Tải lại"}</button>
        </div>
        {loading && <p role="status" className="mt-4 text-sm text-slate">Đang tải lịch sử…</p>}
        {!loading && !error && !records.length && <p className="mt-4 text-sm text-slate">Chưa có nhật ký cho học viên này.</p>}
        <ul className="mt-4 min-w-0 space-y-3">
          {records.map((record) => <li key={record.id} className="min-w-0 rounded-xl border border-rule p-4">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 basis-48">
                <time dateTime={record.recorded_at} className="text-xs font-medium text-slate">{record.recorded_at.split("-").reverse().join("/")}</time>
                <Link href={trainingAtlasHref(record.exercise_id)} className="mt-1 block break-words text-sm font-semibold text-cobalt hover:underline">{trainingExerciseName(record.exercise_id)}</Link>
              </div>
              <button type="button" aria-label={`Xóa nhật ký ${trainingExerciseName(record.exercise_id)} ngày ${record.recorded_at}`} className="min-h-11 rounded-lg px-3 text-sm font-medium text-crimson hover:bg-crimson-soft" onClick={() => setPendingDelete(record.id)} disabled={saving || Boolean(deleting)}>Xóa</button>
            </div>
            <p className="mt-2 break-words text-sm text-ink">{record.sets} hiệp × {record.reps} lần · {record.load_unit === "bodyweight" ? "Trọng lượng cơ thể" : record.load_unit === "assisted" ? `${record.load} kg trợ lực` : `${record.load} kg tải ngoài`}</p>
            {record.rpe != null && <p className="mt-1 text-xs text-slate">RPE buổi tập tự báo cáo: {record.rpe}/10</p>}
            {record.feedback && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate">{record.feedback}</p>}
            {pendingDelete === record.id && <div className="mt-3 rounded-lg bg-crimson-soft p-3">
              <p className="text-sm text-crimson">Xóa mục nhật ký này khỏi lịch sử?</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <button type="button" className="button-secondary min-h-11" disabled={Boolean(deleting)} onClick={() => setPendingDelete(null)}>Giữ lại</button>
                <button type="button" className="min-h-11 rounded-lg bg-crimson px-4 text-sm font-semibold text-white" disabled={Boolean(deleting)} onClick={() => void remove(record.id)}>{deleting === record.id ? "Đang xóa…" : "Xác nhận xóa"}</button>
              </div>
            </div>}
          </li>)}
        </ul>
      </div>
    </section>
  );
}
