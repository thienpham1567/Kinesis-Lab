"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PARQ_ITEMS } from "@/lib/clinical/safety";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [goals, setGoals] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    return fetch("/api/clients")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) setError(data.error ?? "Không tải được danh sách học viên");
        else setClients(data.clients ?? []);
      });
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/clients")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ignore) return;
        if (!ok) setError(data.error ?? "Không tải được danh sách học viên");
        else setClients(data.clients ?? []);
      })
      .catch(() => {
        if (!ignore) setError("Không tải được danh sách học viên");
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: age ? Number(age) : null,
          goals: goals.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tạo được hồ sơ");
        return;
      }
      setName("");
      setAge("");
      setGoals("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 rounded-lg border border-rule bg-sheet p-5 shadow-xs lg:grid-cols-[1fr_440px]">
        <div>
          <span className="inline-block rounded bg-cobalt-soft px-2.5 py-0.5 text-xs font-semibold text-cobalt">
            Quản lý Hồ sơ Lâm sàng
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            Học viên & phân tầng nguy cơ
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate">
            Lưu trữ bệnh lý nền, thuốc ảnh hưởng nhịp tim/đường huyết, điểm kích phát đau cơ xương khớp
            (Pain Triggers) và kết quả sàng lọc PAR-Q+ trước khi thiết kế chương trình tập.
          </p>
        </div>

        <form onSubmit={create} className="space-y-3 rounded-md border border-rule bg-canvas/70 p-4">
          <p className="font-display text-sm font-semibold text-ink">Tạo hồ sơ học viên mới</p>
          <div className="grid gap-2.5 sm:grid-cols-[1fr_90px]">
            <label className="block text-xs text-slate">
              <span>Họ và tên</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Lê Hoàng Nam"
                className="mt-1 w-full px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block text-xs text-slate">
              <span>Tuổi</span>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="38"
                className="mt-1 w-full px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs text-slate">
            <span>Mục tiêu / Ghi chú ban đầu</span>
            <input
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="VD: Giảm mỡ nội tạng, đau gối trái khi xuống cầu thang"
              className="mt-1 w-full px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-cobalt px-4 py-2 font-display text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {busy ? "Đang tạo..." : "Tạo hồ sơ lâm sàng"}
          </button>
        </form>
      </div>

      {error ? (
        <p className="rounded-md border border-crimson/30 bg-crimson-soft px-4 py-2.5 text-sm text-crimson">
          {error}
        </p>
      ) : null}

      {clients.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-rule-strong bg-sheet px-6 py-12 text-center">
          <p className="font-display text-base font-bold text-ink">
            Chưa có hồ sơ học viên
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate">
            Tạo hồ sơ bên trên để gắn bệnh lý, thuốc, PAR-Q+ và điểm đau lên bản đồ giải phẫu trước khi thiết kế giáo án.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => {
          const parq = c.red_flags?.parq ?? {};
          const redNight = parq.red_night === true || parq.chest === true || parq.dizzy === true;
          const hasCaution =
            (c.medical_conditions?.length ?? 0) > 0 ||
            (c.medications?.length ?? 0) > 0 ||
            (c.orthopedic_issues?.length ?? 0) > 0 ||
            PARQ_ITEMS.some((q) => parq[q.id] === true);

          const status = redNight
            ? { label: "Cần chuyển khám BS", cls: "bg-crimson-soft text-crimson border-crimson/30" }
            : hasCaution
              ? { label: "Cần điều chỉnh tải / bài tập", cls: "bg-caution-soft text-caution border-caution/30" }
              : { label: "Đủ điều kiện tập tiêu chuẩn", cls: "bg-cleared-soft text-cleared border-cleared/30" };

          return (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="group flex flex-col justify-between rounded-lg border border-rule bg-sheet p-5 shadow-xs transition-colors hover:border-cobalt"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink group-hover:text-cobalt">
                      {c.name}
                    </h2>
                    <p className="text-xs text-slate">
                      {c.sex ?? "Chưa rõ giới"} • {c.age != null ? `${c.age} tuổi` : "Chưa rõ tuổi"} •{" "}
                      {c.training_level ?? "Chưa phân cấp độ"}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.cls}`}>
                    {status.label}
                  </span>
                </div>

                {c.goals && (
                  <p className="text-sm text-ink">
                    <span className="font-medium text-slate">Mục tiêu:</span> {c.goals}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(c.medical_conditions ?? []).map((mc) => (
                    <span
                      key={mc.name}
                      className="rounded bg-crimson-soft px-2 py-0.5 text-xs font-medium text-crimson"
                    >
                      {mc.name}
                    </span>
                  ))}
                  {(c.medications ?? []).map((med) => (
                    <span
                      key={med.name}
                      className="rounded bg-caution-soft px-2 py-0.5 text-xs font-medium text-caution"
                    >
                      Thuốc: {med.name}
                    </span>
                  ))}
                  {(c.orthopedic_issues ?? []).map((oi) => (
                    <span
                      key={oi.region}
                      className="rounded bg-cobalt-soft px-2 py-0.5 text-xs font-medium text-cobalt"
                    >
                      Cơ xương khớp: {oi.region}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-rule pt-3 text-xs text-slate">
                <span>
                  {(c.medical_conditions?.length ?? 0)} bệnh nền • {(c.medications?.length ?? 0)} thuốc •{" "}
                  {(c.orthopedic_issues?.length ?? 0)} vùng cơ xương khớp
                </span>
                <span className="font-semibold text-cobalt">Mở bệnh án vận động</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
