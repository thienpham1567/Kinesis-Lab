"use client";

import Link from "next/link";
import { ClinicalEvidencePanel } from "@/components/ClinicalEvidencePanel";
import {
  SCREENING_EVIDENCE,
  MEDICATION_EVIDENCE,
  LAB_EVIDENCE,
} from "@/lib/clinical/evidence-assessment";
import { normalizeLabExtraction } from "@/lib/clinical/lab-extraction";
import { compressImageForUpload, MAX_UPLOAD_BYTES } from "@/lib/image-compress";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ClientTrainingWorkspace } from "@/components/training/ClientTrainingWorkspace";
import { TrainingLog } from "@/components/training/TrainingLog";
import { BodyMapExplorer } from "@/components/BodyMapExplorer";
import { ChatPanel } from "@/components/ChatPanel";
import { RomAssessment } from "@/components/RomAssessment";
import { Icon } from "@/components/WorkspaceUI";
import { matchClientIssuesToRegions } from "@/lib/clinical/anatomy-atlas";
import { PARQ_ITEMS, safetyNotes } from "@/lib/clinical/safety";
import type { BiomarkerRecord, Client } from "@/lib/types";

type Tab =
  | "overview"
  | "program"
  | "workouts"
  | "progress"
  | "ban-do"
  | "ho-so"
  | "co-do"
  | "bien-do"
  | "xet-nghiem"
  | "chat"
  | "training";

const FIELD_LABELS: Record<string, string> = {
  name: "Tên bệnh lý / Thuốc",
  since: "Thời điểm phát hiện",
  dose: "Liều dùng & Thời gian uống",
  region: "Vùng khớp / Cột sống",
  painTriggers: "Cử động gây đau (Pain Triggers)",
  safeRom: "Biên độ & Bài tập thay thế an toàn (Safe ROM)",
  notes: "Ghi chú lâm sàng",
};

export default function ClientDetailPage() {
  return (
    <Suspense
      fallback={
        <p className="panel p-6 text-sm text-slate" role="status">
          Đang mở hồ sơ…
        </p>
      }
    >
      <ClientDetailRoute />
    </Suspense>
  );
}

function ClientDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <ClientDetailPageInner key={id} id={id} />;
}

function ClientDetailPageInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedTab = searchParams.get("tab");
  const tab: Tab = [
    "overview",
    "program",
    "workouts",
    "progress",
    "ban-do",
    "ho-so",
    "co-do",
    "bien-do",
    "xet-nghiem",
    "chat",
    "training",
  ].includes(requestedTab ?? "")
    ? (requestedTab as Tab)
    : "overview";
  function setTab(nextTab: Tab) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", nextTab);
    if (nextTab !== "training") next.delete("exercise");
    router.push(`/clients/${encodeURIComponent(id)}?${next}`, {
      scroll: false,
    });
  }
  const [client, setClient] = useState<Client | null>(null);
  const [biomarkers, setBiomarkers] = useState<BiomarkerRecord[]>([]);
  const [chatRequest, setChatRequest] = useState<{ id: string; text: string } | undefined>();
  const chatRequestNumber = useRef(0);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);
  const [deleteClientError, setDeleteClientError] = useState("");
  const loadRequest = useRef<AbortController | null>(null);

  async function deleteCurrentClient() {
    if (deletingClient) return;
    setDeletingClient(true);
    setDeleteClientError("");
    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Không xóa được hồ sơ");
      }
      router.push("/clients");
    } catch (e) {
      setDeleteClientError(
        e instanceof Error
          ? e.message
          : "Không xóa được hồ sơ. Kiểm tra kết nối và thử lại.",
      );
      setDeletingClient(false);
    }
  }

  const load = useCallback(() => {
    loadRequest.current?.abort();
    const controller = new AbortController();
    loadRequest.current = controller;
    return fetch(`/api/clients/${encodeURIComponent(id)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        if (controller.signal.aborted) return false;
        if (res.status === 404) {
          setClient(null);
          setNotFound(true);
          setLoadError("Không tìm thấy học viên. Hồ sơ có thể đã được xóa.");
          return false;
        }
        const data = await res.json();
        if (controller.signal.aborted) return false;
        if (!res.ok || !data.client) throw new Error("Không tải được hồ sơ");
        setClient(data.client);
        setBiomarkers(data.biomarkers ?? []);
        setLoadError("");
        setNotFound(false);
        return true;
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setLoadError("Không tải được hồ sơ. Kiểm tra kết nối và thử tải lại.");
        return false;
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    void load();
    return () => loadRequest.current?.abort();
  }, [load]);

  function retryLoad() {
    setLoading(true);
    setLoadError("");
    return load();
  }

  async function save(patch: Partial<Client>) {
    if (!client || saving) return;
    setSaving(true);
    setError("");
    setSavedToast("");
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Không lưu được");
      else {
        setClient(data.client);
        setSavedToast("Đã lưu cập nhật hồ sơ");
      }
    } catch {
      setError("Không thể lưu hồ sơ. Kiểm tra kết nối và thử lại.");
    } finally {
      setSaving(false);
    }
  }

  if (!client) {
    return (
      <div className="panel p-8 text-center text-sm text-slate" role="status">
        <Icon
          name={loadError ? "alert" : "spinner"}
          className={`mx-auto mb-4 size-6 ${loadError ? "text-crimson" : "animate-spin text-cobalt"}`}
        />
        <p>{loadError || "Đang mở hồ sơ học viên…"}</p>
        {loadError && !notFound && (
          <button type="button" className="button-primary mt-5" disabled={loading} onClick={retryLoad}>
            {loading ? "Đang tải hồ sơ…" : "Thử tải lại"}
          </button>
        )}
        {loadError && (
          <Link href="/clients" className="button-secondary mt-5">
            Về danh sách học viên
          </Link>
        )}
      </div>
    );
  }

  const autoWarnings = safetyNotes(client).split("\n");
  const romRecords = biomarkers.filter((b) => b.kind === "rom");
  const labRecords = biomarkers.filter((b) => b.kind !== "rom");
  const regionAlertsCount = Object.keys(
    matchClientIssuesToRegions(client),
  ).length;

  const clinicalTabs: { id: Tab; label: string; badge?: number }[] = [
    {
      id: "ban-do",
      label: "Bản đồ điểm đau",
      badge: regionAlertsCount,
    },
    { id: "ho-so", label: "Hồ sơ lâm sàng" },
    {
      id: "co-do",
      label: "Bảng kiểm trước tập",
      badge: Object.values(client.red_flags?.parq ?? {}).filter(
        (v) => v === true,
      ).length,
    },
    { id: "training", label: "Nhật ký tập luyện" },
    { id: "bien-do", label: "Biên độ khớp", badge: romRecords.length },
    {
      id: "xet-nghiem",
      label: "Xét nghiệm & InBody",
      badge: labRecords.length,
    },
  ];

  const clinicalActive = clinicalTabs.some(t => t.id === tab);
  const primaryTabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Tổng quan" },
    { id: "program", label: "Chương trình" },
    { id: "workouts", label: "Buổi tập & lịch sử" },
    { id: "progress", label: "Tiến triển" },
    { id: "ho-so", label: "Hồ sơ & đánh giá" },
    { id: "chat", label: "Tư vấn" },
  ];

  return (
    <div className="client-detail-workspace min-w-0 space-y-6">
      <Link
        href="/clients"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate hover:text-cobalt"
      >
        <Icon name="arrow-left" className="size-4" />
        Danh sách học viên
      </Link>
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 wrap-anywhere">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-slate">
              {client.sex ?? "Chưa rõ giới"} •{" "}
              {client.age != null ? `${client.age} tuổi` : "Chưa rõ tuổi"} •{" "}
              {client.training_level ?? "Chưa phân cấp độ"}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink"><span className="font-semibold">Mục tiêu: </span>{client.goals || "Chưa ghi mục tiêu"}</p>
          </div>
          <div
            className="flex flex-wrap items-center gap-2 text-xs"
            aria-live="polite"
          >
            {saving && (
              <span className="font-medium text-cobalt">Đang lưu...</span>
            )}
            {savedToast && (
              <span className="rounded bg-cleared-soft px-2.5 py-1 font-medium text-ink">
                {savedToast}
              </span>
            )}
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-rule px-3 text-xs font-semibold text-slate hover:border-crimson/50 hover:bg-crimson-soft/30 hover:text-crimson"
              aria-label={`Xóa hồ sơ ${client.name}`}
              onClick={() => {
                setConfirmDelete(true);
                setDeleteClientError("");
              }}
            >
              <Icon name="trash" className="size-4" />
              Xóa hồ sơ
            </button>
          </div>
        </div>

        {confirmDelete && (
          <div
            role="alertdialog"
            aria-label={`Xác nhận xóa hồ sơ ${client.name}`}
            className="mt-4 rounded-xl border border-crimson/25 bg-crimson-soft p-4 text-sm leading-6 text-ink"
          >
            <p>
              Xóa vĩnh viễn hồ sơ <strong>{client.name}</strong> cùng toàn bộ
              dữ liệu liên quan (chỉ số, xét nghiệm, giáo án, buổi tập)? Hành
              động này <strong>không thể hoàn tác</strong>.
            </p>
            {deleteClientError && (
              <p className="mt-2 text-xs font-semibold text-crimson">
                {deleteClientError}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="button-primary min-h-11"
                disabled={deletingClient}
                onClick={() => void deleteCurrentClient()}
              >
                <Icon
                  name={deletingClient ? "spinner" : "trash"}
                  className={`size-4 ${deletingClient ? "animate-spin" : ""}`}
                />
                {deletingClient ? "Đang xóa…" : "Xóa vĩnh viễn"}
              </button>
              <button
                type="button"
                className="button-secondary min-h-11"
                disabled={deletingClient}
                onClick={() => setConfirmDelete(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-caution/25 bg-caution-soft/60 p-4">
          <h2 className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Icon name="shield" className="size-4" />
            Lưu ý an toàn & điều chỉnh tải
          </h2>
          <ul className="mt-1.5 space-y-1 wrap-anywhere text-sm leading-6 text-ink sm:text-xs sm:leading-5">
            {autoWarnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      </div>

      {error ? (
        <p className="alert-error" role="alert">{error}</p>
      ) : null}
      {loadError ? (
        <div className="alert-error" role="alert">
          <p>{loadError}</p>
          <button type="button" className="button-secondary mt-3" disabled={loading || saving} onClick={retryLoad}>
            {loading ? "Đang tải hồ sơ…" : "Thử tải lại hồ sơ"}
          </button>
        </div>
      ) : null}

      <nav className="tab-bar flex-wrap" aria-label="Các phần hồ sơ học viên">
        {primaryTabs.map(t => <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-pressed={t.id === "ho-so" ? clinicalActive : tab === t.id} className="tab-button">{t.label}</button>)}
      </nav>
      <p className="text-xs leading-6 text-slate">Bản đang soạn được giữ khi chuyển các phần của học viên này. Hãy lưu trước khi tải lại trang hoặc rời học viên; bản nháp chỉ nằm trong phiên hiện tại.</p>
      <ClientTrainingWorkspace
        key={client.id}
        clientId={client.id}
        clientGoal={client.goals}
        destination={tab === "overview" || tab === "program" || tab === "workouts" || tab === "progress" ? tab : null}
        onNavigate={setTab}
        onOpenLegacy={() => setTab("training")}
      />
      {clinicalActive && <nav className="tab-bar flex-wrap" aria-label="Đánh giá lâm sàng và nhật ký trước đây">
        {clinicalTabs.map(t => <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-pressed={tab === t.id} className="tab-button">{t.label}{t.badge != null && t.badge > 0 && <span className="ml-2 rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-ink">{t.badge}</span>}</button>)}
      </nav>}
      <KeepVisitedPanel active={tab === "ban-do"}>
        <BodyMapExplorer
          mode="client"
          client={client}
          onAskRegion={(prompt) => {
            chatRequestNumber.current += 1;
            setChatRequest({ id: `${id}:${chatRequestNumber.current}`, text: prompt });
            setTab("chat");
          }}
        />
      </KeepVisitedPanel>
      <KeepVisitedPanel active={tab === "ho-so"}>
        <ProfileForm client={client} onSave={save} saving={saving} />
      </KeepVisitedPanel>
      <KeepVisitedPanel active={tab === "co-do"}>
        <RedFlagForm client={client} onSave={save} saving={saving} />
      </KeepVisitedPanel>
      <KeepVisitedPanel active={tab === "training"}>
        <TrainingLog clientId={client.id} initialExerciseId={searchParams.get("exercise")} />
      </KeepVisitedPanel>
      <KeepVisitedPanel active={tab === "bien-do"}>
        <RomAssessment client={client} records={romRecords} onChange={load} />
      </KeepVisitedPanel>
      <KeepVisitedPanel active={tab === "xet-nghiem"}>
        <Labs clientId={client.id} records={labRecords} onChange={load} />
      </KeepVisitedPanel>
      <KeepVisitedPanel active={tab === "chat"}>
        <ChatPanel clientId={client.id} draftRequest={chatRequest} placeholder={`Hỏi về bài tập hoặc chuẩn bị tư vấn cho ${client.name}...`} />
      </KeepVisitedPanel>
    </div>
  );
}

function KeepVisitedPanel({ active, children }: { active: boolean; children: ReactNode }) {
  const [visited, setVisited] = useState(active);
  if (active && !visited) setVisited(true);
  return <div hidden={!active} inert={!active}>{active || visited ? children : null}</div>;
}

function ProfileForm({
  client,
  onSave,
  saving,
}: {
  client: Client;
  saving: boolean;
  onSave: (p: Partial<Client>) => Promise<void>;
}) {
  const [form, setForm] = useState(client);

  return (
    <form
      className="space-y-6 rounded-lg border border-rule bg-sheet p-5 shadow-xs"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          name: form.name,
          age: form.age,
          sex: form.sex,
          goals: form.goals,
          training_level: form.training_level,
          notes: form.notes,
          medical_conditions: form.medical_conditions,
          medications: form.medications,
          orthopedic_issues: form.orthopedic_issues,
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Họ và tên học viên" className="md:col-span-2">
          <input
            className="w-full px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Tuổi">
          <input
            type="number"
            className="w-full px-3 py-2 text-sm"
            value={form.age ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                age: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </Field>
        <Field label="Giới tính sinh học">
          <select
            className="w-full px-3 py-2 text-sm"
            value={form.sex ?? ""}
            onChange={(e) =>
              setForm({ ...form, sex: e.target.value || null })
            }
          >
            <option value="">Chưa rõ giới</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </Field>
        <Field label="Kinh nghiệm vận động" className="md:col-span-2">
          <input
            className="w-full px-3 py-2 text-sm"
            value={form.training_level ?? ""}
            onChange={(e) =>
              setForm({ ...form, training_level: e.target.value })
            }
            placeholder="Mới bắt đầu / Trung cấp / Vận động viên"
          />
        </Field>
        <Field label="Mục tiêu trọng tâm" className="md:col-span-2">
          <input
            className="w-full px-3 py-2 text-sm"
            value={form.goals ?? ""}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
          />
        </Field>
      </div>

      <JsonList
        label="1. Bệnh lý nền đã được chẩn đoán"
        hint="Ví dụ: Thoát vị đĩa đệm L4-L5, Tăng huyết áp độ 1, Đái tháo đường type 2"
        items={form.medical_conditions}
        fields={["name", "since", "notes"]}
        onChange={(medical_conditions) =>
          setForm({ ...form, medical_conditions })
        }
      />

      <JsonList
        label="2. Thuốc đang sử dụng & Tác động sinh lý khi gắng sức"
        hint="Ví dụ: Bisoprolol 5mg (chẹn beta — dùng RPE), Metformin 500mg, Rosuvastatin 10mg"
        items={form.medications}
        fields={["name", "dose", "notes"]}
        onChange={(medications) => setForm({ ...form, medications })}
      />

      <JsonList
        label="3. Vấn đề Cơ xương khớp, Cử động gây đau & Biên độ an toàn"
        hint="Ghi rõ góc độ gây đau (Pain Triggers) và biến thể bài tập không đau (Safe ROM)"
        items={form.orthopedic_issues}
        fields={["region", "painTriggers", "safeRom", "notes"]}
        onChange={(orthopedic_issues) =>
          setForm({ ...form, orthopedic_issues })
        }
      />

      <Field label="Ghi chú lâm sàng & Lịch sử sinh hoạt của PT">
        <textarea
          rows={3}
          className="w-full px-3 py-2 text-sm"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </Field>

      <div>
        <button type="submit" disabled={saving} className="button-primary">
          {saving ? "Đang lưu…" : "Lưu cập nhật hồ sơ"}
        </button>
      </div>
    </form>
  );
}

function RedFlagForm({
  client,
  onSave,
  saving,
}: {
  client: Client;
  saving: boolean;
  onSave: (p: Partial<Client>) => Promise<void>;
}) {
  const parq = { ...(client.red_flags?.parq ?? {}) };
  const [notes, setNotes] = useState(client.red_flags?.notes ?? "");
  const [answers, setAnswers] = useState<Record<string, boolean | null>>(parq);

  const positiveCount = Object.values(answers).filter((v) => v === true).length;

  return (
    <form
      className="space-y-5 rounded-lg border border-rule bg-sheet p-5 shadow-xs"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({ red_flags: { parq: answers, notes } });
      }}
    >
      <ClinicalEvidencePanel evidence={SCREENING_EVIDENCE} />
      <ClinicalEvidencePanel
        evidence={MEDICATION_EVIDENCE}
        title="Thuốc và giới hạn cảnh báo tự động"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Bảng kiểm trước tập của ứng dụng
          </h2>
          <p className="text-xs text-slate">
            Bảy câu tự xây dựng, chưa được thẩm định hoặc xác thực bản dịch. Mục
            Có cần khai thác thêm theo triệu chứng; không tự động cấp phép hoặc
            cấm tập.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold text-ink ${
            positiveCount > 0
              ? "border-caution/30 bg-caution-soft"
              : "border-cleared/30 bg-cleared-soft"
          }`}
        >
          {positiveCount > 0
            ? `${positiveCount} mục trả lời CÓ — Cần lưu ý lâm sàng`
            : "Chưa ghi mục CÓ — không xác nhận an toàn tập"}
        </span>
      </div>

      <ul className="divide-y divide-rule rounded-md border border-rule">
        {PARQ_ITEMS.map((q) => (
          <li
            key={q.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
          >
            <span className="max-w-xl text-sm text-ink">{q.label}</span>
            <span className="flex gap-1.5">
              {([true, false, null] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: v })}
                  aria-pressed={answers[q.id] === v}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    answers[q.id] === v
                      ? v === true
                        ? "bg-crimson text-on-crimson"
                        : v === false
                          ? "bg-cleared text-on-cleared"
                          : "bg-ink text-sheet"
                      : "bg-surface text-ink hover:bg-cobalt-soft"
                  }`}
                >
                  {v === true ? "Có" : v === false ? "Không" : "Chưa hỏi"}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>

      <Field label="Ghi chú phân loại nguy cơ & Hướng dẫn từ Bác sĩ điều trị">
        <textarea
          rows={3}
          className="w-full px-3 py-2 text-sm"
          placeholder="Ghi rõ kết luận của bác sĩ chuyên khoa, ngưỡng nhịp tim hoặc huyết áp giới hạn..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      <button type="submit" disabled={saving} className="button-primary">
        {saving ? "Đang lưu…" : "Lưu bảng sàng lọc"}
      </button>
    </form>
  );
}

function Labs({
  clientId,
  records,
  onChange,
}: {
  clientId: string;
  records: BiomarkerRecord[];
  onChange: () => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [draft, setDraft] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const deleteRequest = useRef(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");

  async function deleteRecord(recordId: string) {
    if (deleteRequest.current) return;
    deleteRequest.current = true;
    setDeletingId(recordId);
    setDeleteError("");
    setDeleteStatus("");
    try {
      const res = await fetch(`/api/biomarkers?id=${encodeURIComponent(recordId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không xóa được bản ghi");
      const refreshed = await onChange().catch(() => false);
      setDeleteStatus(refreshed
        ? "Đã xóa bản ghi."
        : "Đã xóa bản ghi; chưa tải lại được danh sách. Hãy thử tải lại hồ sơ.");
    } catch {
      setDeleteError("Không xóa được bản ghi. Kiểm tra kết nối và thử lại.");
    } finally {
      deleteRequest.current = false;
      setDeletingId(null);
    }
  }

  async function upload(file: File) {
    setBusy(true);
    setMsg("");
    try {
      const payload = await compressImageForUpload(file);
      if (payload.size > MAX_UPLOAD_BYTES) {
        setMsg("PDF vượt 4 MB; hãy xuất ảnh JPG/PNG hoặc PDF nhỏ hơn rồi tải lại.");
        return;
      }
      const fd = new FormData();
      fd.set("file", payload);
      const extracted = await fetch("/api/extract-lab", {
        method: "POST",
        body: fd,
      });
      if (extracted.status === 413) {
        setMsg("Tệp vượt giới hạn tải lên của máy chủ (4,5 MB); hãy dùng tệp nhỏ hơn.");
        return;
      }
      const data = await extracted.json();
      if (!extracted.ok) {
        setMsg(data.error ?? "Không đọc được phiếu");
        return;
      }
      setDraft(JSON.stringify(normalizeLabExtraction(data), null, 2));
      setConfirmed(false);
    } catch (err) {
      setMsg(
        err instanceof Error
          ? err.message
          : "Không đọc được phiếu; hãy thử lại",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!confirmed) return;
    setBusy(true);
    setMsg("");
    try {
      const data = normalizeLabExtraction(JSON.parse(draft));
      if (!data.recorded_at)
        throw new Error(
          "Cần điền recorded_at đúng ngày in trên phiếu trước khi lưu",
        );
      const res = await fetch("/api/biomarkers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          ...data,
          ai_summary:
            "Người dùng đã xác nhận bản chép với phiếu gốc; chưa được chuyên gia diễn giải. " +
            data.ai_summary,
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Không lưu được");
      setDraft("");
      setConfirmed(false);
      await onChange();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Không lưu được bản chép");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <ClinicalEvidencePanel evidence={LAB_EVIDENCE} />
      {draft && (
        <section
          className="panel space-y-3 p-4"
          aria-label="Bản nháp phiếu cần đối chiếu"
        >
          <h3 className="font-semibold text-ink">Đối chiếu trước khi lưu</h3>
          <p className="text-xs leading-5 text-slate">
            So từng tên, giá trị, đơn vị, khoảng tham chiếu, cờ và ngày với
            phiếu gốc. Sửa bản chép bên dưới nếu cần. Cờ unknown có nghĩa phiếu
            chưa cho cờ rõ; không phải bình thường. Việc xác nhận không là chẩn
            đoán.
          </p>
          <textarea
            aria-label="Dữ liệu trích xuất để đối chiếu"
            rows={14}
            className="w-full rounded border border-rule p-3 font-mono text-xs"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setConfirmed(false);
            }}
          />
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            Tôi đã đối chiếu bản chép với phiếu gốc
          </label>
          <div className="flex gap-3">
            <button
              className="button-primary"
              disabled={busy || !confirmed}
              onClick={() => void saveDraft()}
            >
              Lưu bản đã đối chiếu
            </button>
            <button
              className="text-xs text-slate underline"
              disabled={busy}
              onClick={() => setDraft("")}
            >
              Hủy bản nháp
            </button>
          </div>
        </section>
      )}

      <div className="rounded-lg border border-dashed border-rule-strong bg-sheet p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Bóc tách Phiếu Xét nghiệm Máu & Giấy InBody bằng AI Vision
            </h2>
            <p className="mt-0.5 text-xs text-slate">
              Hỗ trợ ảnh chụp phiếu xét nghiệm (Glucose, HbA1c, Lipid, AST/ALT,
              CK, Vitamin D, Ferritin) hoặc phiếu InBody (SMM, PBF, VFA, ECW
              Ratio).
            </p>
          </div>
          <button type="button" className="button-primary" disabled={busy} onClick={() => fileInput.current?.click()}>
            {busy
              ? "Đang phân tích phiếu..."
              : "Tải ảnh / PDF phiếu xét nghiệm"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              e.currentTarget.value = "";
              if (f) void upload(f);
            }}
          />
        </div>
        {msg ? (
          <p className="mt-3 text-xs font-medium text-crimson" role="alert">{msg}</p>
        ) : null}
      </div>

      {deleteError && <p className="alert-error" role="alert">{deleteError}</p>}
      {deleteStatus && <p className="text-sm text-ink" role="status">{deleteStatus}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {records.map((r) => (
          <article
            key={r.id}
            className="rounded-lg border border-rule bg-sheet p-5 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
              <div>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold text-ink ${
                    r.kind === "inbody"
                      ? "bg-cobalt-soft"
                      : "bg-cleared-soft"
                  }`}
                >
                  {r.kind === "inbody"
                    ? "Phân tích Thành phần Cơ thể (InBody)"
                    : "Sinh hóa & Huyết học"}
                </span>
                <p className="mt-1 font-mono text-xs text-slate">
                  Ngày đo: {r.recorded_at}
                </p>
              </div>
              <button
                type="button"
                className="min-h-11 shrink-0 text-xs font-medium text-crimson hover:underline disabled:opacity-50"
                disabled={deletingId !== null}
                aria-label={`Xóa bản ghi ${r.kind === "inbody" ? "InBody" : "xét nghiệm"} ngày ${r.recorded_at}`}
                onClick={() => deleteRecord(r.id)}
              >
                {deletingId === r.id ? "Đang xóa bản ghi…" : "Xóa bản ghi"}
              </button>
            </div>

            <dl className="mt-3 grid gap-2.5 min-[380px]:grid-cols-2 sm:grid-cols-3">
              {Object.entries(r.metrics ?? {}).map(([k, v]) => {
                const metric =
                  v && typeof v === "object" && "value" in v
                    ? (v as {
                        value: unknown;
                        unit?: string;
                        flag?: string;
                        reference_range?: string;
                      })
                    : {
                        value: v,
                        unit: "",
                        flag: "unknown",
                        reference_range: "",
                      };
                const isHigh = metric.flag === "high";
                const isLow = metric.flag === "low";
                const badgeCls = isHigh
                  ? "border-crimson/30 bg-crimson-soft/60"
                  : isLow
                    ? "border-caution/30 bg-caution-soft/60"
                    : "border-rule bg-canvas/70";
                return (
                  <div
                    key={k}
                    className={`min-w-0 wrap-anywhere rounded-md border p-2.5 text-ink ${badgeCls}`}
                  >
                    <dt className="text-xs font-medium">{k}</dt>
                    <dd className="mt-0.5">
                      <span className="block font-mono text-sm font-semibold">
                        {String(metric.value)} {metric.unit ?? ""}
                      </span>
                      <span className="mt-1 block text-xs">
                        Khoảng trên phiếu: {metric.reference_range || "chưa có"} ·{" "}
                        {metric.flag === "unknown" || !metric.flag
                          ? "Chưa có cờ"
                          : metric.flag === "normal"
                            ? "Phiếu gắn cờ trong khoảng"
                            : ""}
                      </span>
                      {(isHigh || isLow) && (
                        <span className="mt-0.5 block text-xs font-semibold">
                          {isHigh ? "Phiếu gắn cờ cao" : "Phiếu gắn cờ thấp"}
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {r.ai_summary ? (
              <div className="mt-4 rounded-md bg-surface/70 p-3.5 text-xs leading-6 text-ink">
                <p className="font-display font-semibold text-ink">
                  Ghi chú AI / bản cũ có thể chưa được rà soát y khoa:
                </p>
                <p className="mt-1 wrap-anywhere whitespace-pre-wrap">{r.ai_summary}</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`block space-y-1 text-xs font-medium text-slate ${className}`}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}

function JsonList<T extends object>({
  label,
  hint,
  items,
  fields,
  onChange,
}: {
  label: string;
  hint: string;
  items: T[];
  fields: string[];
  onChange: (items: T[]) => void;
}) {
  const list = items ?? [];
  return (
    <div className="space-y-3 rounded-md border border-rule bg-canvas/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-sm font-bold text-ink">{label}</p>
          <p className="text-xs text-slate">{hint}</p>
        </div>
        <button
          type="button"
          className="rounded border border-cobalt bg-cobalt-soft px-3 py-1 text-xs font-semibold text-cobalt hover:bg-cobalt hover:text-on-cobalt"
          onClick={() =>
            onChange([
              ...list,
              Object.fromEntries(fields.map((f) => [f, ""])) as T,
            ])
          }
        >
          + Thêm mục
        </button>
      </div>

      {list.map((item, i) => (
        <div
          key={`${label}-${i}`}
          className="grid gap-3 rounded-md border border-rule bg-sheet p-3 md:grid-cols-3"
        >
          {fields.map((f) => (
            <label key={f} className="block space-y-1 text-xs text-slate">
              <span>{FIELD_LABELS[f] ?? f}</span>
              <input
                className="w-full px-2.5 py-1.5 text-sm"
                value={String((item as Record<string, unknown>)[f] ?? "")}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...item, [f]: e.target.value };
                  onChange(next);
                }}
              />
            </label>
          ))}
          <div className="md:col-span-3">
            <button
              type="button"
              className="text-xs font-medium text-crimson hover:underline"
              onClick={() => onChange(list.filter((_, j) => j !== i))}
            >
              Xóa mục này
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
