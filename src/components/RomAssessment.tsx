"use client";

import { useState, type FormEvent } from "react";
import {
  INSTRUMENT_LABELS,
  KNEE_SEM_SOURCE,
  ROM_MOVEMENTS,
  SIDE_LABELS,
  changeVsPrevious,
  movementById,
  normFor,
  sideGap,
  type RomEntry,
  type RomInstrument,
  type RomMetrics,
} from "@/lib/clinical/rom-norms";
import type { BiomarkerRecord, Client } from "@/lib/types";

const REGIONS = [...new Set(ROM_MOVEMENTS.map((m) => m.region))];
const fmt = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}°`;
const metricsOf = (r: BiomarkerRecord) => r.metrics as unknown as RomMetrics;

export function RomAssessment({
  client,
  records,
  onChange,
}: {
  client: Client;
  records: BiomarkerRecord[];
  onChange: () => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [instrument, setInstrument] = useState<RomInstrument>(
    () => (records[0] ? metricsOf(records[0]).instrument : "goniometer"),
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const entries: RomEntry[] = [];
    for (const [key, raw] of Object.entries(values)) {
      if (!raw.trim()) continue;
      const value = Number(raw.replace(",", "."));
      const [movement, side] = key.split(":") as [string, RomEntry["side"]];
      if (!Number.isFinite(value) || value < -30 || value > 200) {
        setMsg(`Số đo không hợp lệ: ${movementById(movement)?.label} (${SIDE_LABELS[side]})`);
        return;
      }
      entries.push({ movement, side, value });
    }
    if (!entries.length) {
      setMsg("Nhập ít nhất một số đo.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/biomarkers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client.id,
          kind: "rom",
          recorded_at: date,
          metrics: { instrument, entries } satisfies RomMetrics,
        }),
      });
      if (!res.ok) {
        setMsg((await res.json()).error ?? "Không lưu được");
        return;
      }
      setValues({});
      onChange();
    } catch {
      setMsg("Không lưu được. Kiểm tra kết nối và thử lại.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Xóa lần đo này?")) return;
    await fetch(`/api/biomarkers?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="panel space-y-4 p-5">
        <div>
          <h2 className="font-display text-base font-bold text-ink">Nhập số đo biên độ khớp</h2>
          <p className="mt-0.5 text-xs text-slate">
            Đơn vị độ. Chỉ điền động tác đã đo; để trống phần còn lại. Nên dùng cùng một dụng cụ cho
            mọi lần đo của học viên này.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-xs font-medium text-slate">
            <span>Ngày đo</span>
            <input
              type="date"
              required
              className="w-full px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="block space-y-1 text-xs font-medium text-slate">
            <span>Dụng cụ</span>
            <select
              className="w-full px-3 py-2 text-sm"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value as RomInstrument)}
            >
              {Object.entries(INSTRUMENT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {REGIONS.map((region) => (
            <fieldset key={region} className="rounded-lg border border-rule p-3">
              <legend className="px-1 text-xs font-semibold text-ink">{region}</legend>
              <div className="space-y-2">
                {ROM_MOVEMENTS.filter((m) => m.region === region).map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 text-xs text-ink">{m.label}</span>
                    {m.sides.map((side) => {
                      const key = `${m.id}:${side}`;
                      return (
                        <input
                          key={key}
                          inputMode="decimal"
                          aria-label={`${m.label} – ${SIDE_LABELS[side]}`}
                          placeholder={SIDE_LABELS[side]}
                          className="w-20 px-2 py-1.5 font-mono text-sm"
                          value={values[key] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {msg ? (
          <p className="text-xs font-medium text-crimson" role="alert">
            {msg}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className="button-primary">
          {busy ? "Đang lưu…" : "Lưu lần đo"}
        </button>
      </form>

      {records.length ? (
        <LatestSession client={client} records={records} />
      ) : (
        <p className="panel p-5 text-sm text-slate">Chưa có lần đo nào.</p>
      )}

      {records.length ? (
        <section className="panel p-5">
          <h2 className="font-display text-base font-bold text-ink">Các lần đo</h2>
          <ul className="mt-3 divide-y divide-rule">
            {records.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                <span className="font-mono text-ink">{r.recorded_at}</span>
                <span className="text-slate">
                  {INSTRUMENT_LABELS[metricsOf(r).instrument]} · {metricsOf(r).entries.length} số đo
                </span>
                <button
                  type="button"
                  className="font-medium text-crimson hover:underline"
                  onClick={() => void remove(r.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function LatestSession({ client, records }: { client: Client; records: BiomarkerRecord[] }) {
  const [latest, ...older] = records;
  const { instrument, entries } = metricsOf(latest);
  const previousInstrument = older[0] ? metricsOf(older[0]).instrument : null;

  function previousEntry(e: RomEntry) {
    for (const r of older) {
      const m = metricsOf(r);
      const hit = m.entries.find((p) => p.movement === e.movement && p.side === e.side);
      if (hit) return { value: hit.value, instrument: m.instrument, date: r.recorded_at };
    }
    return null;
  }

  return (
    <section className="panel space-y-3 p-5">
      <div>
        <h2 className="font-display text-base font-bold text-ink">
          Lần đo gần nhất · <span className="font-mono">{latest.recorded_at}</span>
        </h2>
        <p className="mt-0.5 text-xs text-slate">{INSTRUMENT_LABELS[instrument]}</p>
      </div>
      {previousInstrument && previousInstrument !== instrument ? (
        <p className="rounded-md border border-caution/30 bg-caution-soft/60 p-3 text-xs text-caution" role="status">
          Dụng cụ khác lần trước ({INSTRUMENT_LABELS[previousInstrument]}). Thay đổi giữa hai lần đo có
          thể do dụng cụ, không nhất thiết do học viên.
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="border-b border-rule text-slate">
            <tr>
              <th className="py-2 pr-3 font-medium">Động tác</th>
              <th className="py-2 pr-3 font-medium">Bên</th>
              <th className="py-2 pr-3 font-medium">Số đo</th>
              <th className="py-2 pr-3 font-medium">Trung bình tham chiếu</th>
              <th className="py-2 pr-3 font-medium">Lệch</th>
              <th className="py-2 font-medium">So với lần trước</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {entries.map((e) => {
              const m = movementById(e.movement);
              const norm = normFor(e.movement, client.age, client.sex);
              const left = entries.find((x) => x.movement === e.movement && x.side === "L");
              const right = entries.find((x) => x.movement === e.movement && x.side === "R");
              const prev = previousEntry(e);
              const change =
                prev && prev.instrument === instrument
                  ? changeVsPrevious(e.movement, instrument, prev.value, e.value)
                  : null;
              return (
                <tr key={`${e.movement}:${e.side}`} className="align-top">
                  <td className="py-2 pr-3 text-ink">
                    {m?.label ?? e.movement}
                    {e.side === "L" && left && right ? (
                      <span className="block text-[11px] text-slate">
                        Chênh trái/phải: {sideGap(left.value, right.value).toFixed(1)}°
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3">{SIDE_LABELS[e.side]}</td>
                  <td className="py-2 pr-3 font-mono font-semibold text-ink">{e.value}°</td>
                  <td className="py-2 pr-3">
                    {"mean" in norm ? (
                      <>
                        <span className="font-mono">{norm.mean}°</span>
                        <span className="block text-[11px] text-slate">{norm.population}</span>
                      </>
                    ) : (
                      <span className="text-slate">{norm.reason}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 font-mono">{"mean" in norm ? fmt(e.value - norm.mean) : "—"}</td>
                  <td className="py-2">
                    {!prev ? (
                      <span className="text-slate">Lần đầu</span>
                    ) : !change ? (
                      <span className="text-slate">Khác dụng cụ ({prev.date})</span>
                    ) : (
                      <>
                        <span className="font-mono">{fmt(change.delta)}</span>
                        <span
                          className={`block text-[11px] ${change.beyondError ? "font-semibold text-cleared" : "text-slate"}`}
                        >
                          {change.beyondError == null
                            ? "Chưa có số liệu sai số đo"
                            : change.beyondError
                              ? `Vượt sai số đo (MDC ${change.mdc}°)`
                              : `Trong sai số đo (MDC ${change.mdc}°)`}
                        </span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] leading-5 text-slate">
        Trung bình tham chiếu là giá trị trung bình của người khỏe, không phải ngưỡng chẩn đoán; nhiều
        người khỏe vẫn thấp hơn trung bình. Nguồn:{" "}
        <a className="underline" href={ROM_MOVEMENTS[0].source} target="_blank" rel="noreferrer">
          CDC (Soucie 2011)
        </a>
        ,{" "}
        <a
          className="underline"
          href={movementById("lumbar_flexion")?.source}
          target="_blank"
          rel="noreferrer"
        >
          JTSS 2023
        </a>{" "}
        (cột sống, người trẻ), sai số đo gối:{" "}
        <a className="underline" href={KNEE_SEM_SOURCE} target="_blank" rel="noreferrer">
          J Knee Surg 2017
        </a>
        .
      </p>
    </section>
  );
}
