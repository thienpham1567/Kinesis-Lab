"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  EmptyState,
  Icon,
  PageHeading,
  SectionHeading,
} from "@/components/WorkspaceUI";
import { ClientRecordCard, clientStatus } from "@/components/ClientRecordCard";
import type { Client } from "@/lib/types";

async function fetchClients(): Promise<Client[]> {
  const res = await fetch("/api/clients");
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error ?? "Không tải được danh sách học viên.");
  return data.clients ?? [];
}

function feedbackError(error: unknown, fallback: string) {
  if (error instanceof TypeError || error instanceof SyntaxError)
    return fallback;
  return error instanceof Error ? error.message : fallback;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [goals, setGoals] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [createdClient, setCreatedClient] = useState<Pick<Client, "id" | "name"> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const formTrigger = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  const openForm = () => {
    setFormOpen(true);
    window.setTimeout(() => nameInput.current?.focus(), 60);
  };
  const closeForm = () => {
    setFormOpen(false);
    formTrigger.current?.focus();
  };

  useEffect(() => {
    let ignore = false;
    fetchClients()
      .then((records) => {
        if (!ignore) setClients(records);
      })
      .catch((error) => {
        if (!ignore)
          setListError(
            feedbackError(
              error,
              "Không tải được danh sách học viên. Kiểm tra kết nối và thử lại.",
            ),
          );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function reload() {
    setLoading(true);
    setListError("");
    try {
      setClients(await fetchClients());
    } catch (error) {
      setListError(
        feedbackError(
          error,
          "Không tải được danh sách học viên. Kiểm tra kết nối và thử lại.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setFormError("");
    setMessage("");
    setCreatedClient(null);
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
      if (!res.ok) throw new Error(data.error ?? "Không tạo được hồ sơ.");
      if (data.client?.id) setCreatedClient(data.client);
      setName("");
      setAge("");
      setGoals("");
      setMessage(
        "Đã tạo hồ sơ. Mở hồ sơ để bổ sung sàng lọc và thông tin lâm sàng.",
      );
      await reload();
      nameInput.current?.focus();
    } catch (error) {
      setFormError(
        feedbackError(
          error,
          "Không tạo được hồ sơ. Kiểm tra kết nối và thử lại.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  const matchingClients = clients.filter((client) =>
    [
      client.name,
      client.goals,
      ...(client.medical_conditions ?? []).map((condition) => condition.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("vi")
      .includes(query.trim().toLocaleLowerCase("vi")),
  );
  const referralCount = clients.filter(
    (client) => clientStatus(client).level === "referral",
  ).length;
  const cautionCount = clients.filter(
    (client) => clientStatus(client).level === "caution",
  ).length;

  return (
    <div className="space-y-7">
      <PageHeading

        title="Hồ sơ học viên"
        description="Tập hợp mục tiêu, bệnh lý và kết quả sàng lọc để chuẩn bị cho từng buổi tập."
      >
        <button
          ref={formTrigger}
          type="button"
          className="button-primary"
          aria-expanded={formOpen}
          aria-controls="new-client-form"
          onClick={() => (formOpen ? closeForm() : openForm())}
        >
          <Icon name="plus" className="size-4" />
          Thêm học viên
        </button>
      </PageHeading>

      {(loading || (!listError && clients.length > 0)) && (
        <dl
          className="grid divide-y divide-rule rounded-xl border border-rule bg-sheet sm:grid-cols-3 sm:gap-3 sm:divide-y-0 sm:rounded-none sm:border-0 sm:bg-transparent"
          aria-label={loading ? "Đang tải chỉ số học viên" : undefined}
          aria-busy={loading}
        >
          {[
            {
              label: "Hồ sơ học viên",
              value: clients.length,
              icon: "users" as const,
              color: "text-ink bg-cobalt-soft",
            },
            {
              label: "Cần điều chỉnh tập luyện",
              value: cautionCount,
              icon: "activity" as const,
              color: "text-ink bg-caution-soft",
            },
            {
              label: "Cần chuyển khám bác sĩ",
              value: referralCount,
              icon: "shield" as const,
              color: "text-ink bg-crimson-soft",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2 sm:grid-cols-1 sm:rounded-2xl sm:border sm:border-rule sm:bg-sheet sm:py-5 sm:pr-5 sm:pl-20"
            >
              <dt className="text-sm leading-5 text-slate sm:text-xs">
                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 left-5 hidden size-11 -translate-y-1/2 items-center justify-center rounded-xl sm:flex ${item.color}`}
                >
                  <Icon name={item.icon} />
                </span>
                {item.label}
              </dt>
              <dd className="font-mono text-lg font-medium text-ink sm:mt-1 sm:text-2xl">
                {loading ? (
                  <span className="block h-6 w-7 animate-pulse rounded-md bg-surface" />
                ) : item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div
        className={`grid items-start gap-6 ${formOpen ? "xl:grid-cols-[minmax(0,1fr)_340px]" : ""}`}
      >
        {formOpen && (
          <section
            id="new-client-form"
            className="panel min-w-0 p-5 sm:p-6 xl:sticky xl:top-24 xl:col-start-2 xl:row-start-1"
            aria-label="Tạo hồ sơ học viên"
          >
            <SectionHeading number="02" title="Học viên mới">
              <button type="button" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-slate hover:text-cobalt" onClick={closeForm}>
                <Icon name="close" className="size-4" />
                Đóng biểu mẫu
              </button>
            </SectionHeading>
            <p className="mt-3 text-sm leading-6 text-slate">
              Bắt đầu với thông tin cơ bản. Bổ sung chi tiết lâm sàng sau khi tạo
              hồ sơ.
            </p>
            <form onSubmit={create} className="mt-6 space-y-4" aria-busy={busy}>
              <label className="block">
                <span className="field-label">
                  Họ và tên <span className="text-crimson">*</span>
                </span>
                <input
                  ref={nameInput}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="VD: Lê Hoàng Nam"
                  className="min-h-11 w-full px-3 text-sm"
                  autoComplete="name"
                  required
                  maxLength={160}
                />
              </label>
              <label className="block">
                <span className="field-label">
                  Tuổi{" "}
                  <span className="font-normal text-slate">(không bắt buộc)</span>
                </span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  step={1}
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="VD: 38"
                  className="min-h-11 w-full px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="field-label">Mục tiêu / Ghi chú ban đầu</span>
                <textarea
                  value={goals}
                  onChange={(event) => setGoals(event.target.value)}
                  placeholder="VD: Giảm mỡ nội tạng; đau gối trái khi xuống cầu thang"
                  className="min-h-28 w-full resize-y px-3 py-3 text-sm leading-6"
                  rows={4}
                />
              </label>
              <div aria-live="polite">
                {formError && (
                  <p className="alert-error" role="alert">
                    {formError}
                  </p>
                )}
                {message && (
                  <div className="rounded-lg bg-cleared-soft p-3 text-sm leading-6 text-ink">
                    <p>{message}</p>
                    {createdClient && (
                      <Link href={`/clients/${encodeURIComponent(createdClient.id)}`} className="mt-2 inline-flex min-h-11 items-center font-semibold text-cobalt underline underline-offset-4">
                        Mở hồ sơ {createdClient.name}
                      </Link>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="button-primary w-full"
              >
                <Icon
                  name={busy ? "spinner" : "plus"}
                  className={`size-4 ${busy ? "animate-spin" : ""}`}
                />
                {busy ? "Đang tạo hồ sơ…" : "Tạo hồ sơ học viên"}
              </button>
            </form>
            <p className="mt-5 border-t border-rule pt-4 text-xs leading-5 text-slate">
              Phân tầng nguy cơ dựa trên thông tin đã nhập. Luôn hoàn tất sàng lọc
              trước khi thiết kế chương trình tập.
            </p>
          </section>
        )}
        <section
          aria-label="Danh sách học viên"
          className="min-w-0 space-y-4 xl:col-start-1 xl:row-start-1"
        >
          <SectionHeading number="01" title="Danh sách học viên">
            <span className="font-mono text-xs text-slate">
              {loading ? "Đang tải…" : listError ? "Chưa tải được danh sách" : `${matchingClients.length} / ${clients.length} hồ sơ`}
            </span>
          </SectionHeading>
          <div className="relative">
            <label htmlFor="client-search" className="sr-only">
              Tìm hồ sơ học viên
            </label>
            <span className="input-with-icon block">
              <Icon name="search" className="size-4 text-slate" />
              <input
                ref={searchInput}
                id="client-search"
                type="search"
                className={`min-h-11 w-full min-w-0 text-sm ${query ? "pr-13" : ""}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tên, bệnh lý, mục tiêu"
                aria-label="Tìm theo tên, bệnh lý hoặc mục tiêu"
              />
            </span>
            {query && (
              <button type="button" className="absolute right-0 top-0 flex min-h-11 min-w-11 items-center justify-center rounded-r-lg text-slate hover:text-cobalt" aria-label="Xóa từ khóa tìm học viên" onClick={() => { setQuery(""); searchInput.current?.focus(); }}>
                <Icon name="close" className="size-4" />
              </button>
            )}
          </div>
          {query.trim() && !loading && !listError && <p role="status" className="wrap-anywhere text-xs text-slate">Tìm thấy {matchingClients.length} hồ sơ cho “{query.trim()}”.</p>}
          <div aria-live="polite">
            {listError && (
              <div className="alert-error mb-4">
                <p>{listError}</p>
                <button
                  type="button"
                  disabled={loading}
                  className="button-secondary mt-3"
                  onClick={() => void reload()}
                >
                  <Icon name="refresh" className="size-4" />
                  Thử tải lại
                </button>
              </div>
            )}
            {loading ? (
              <div className="panel flex items-center gap-3 p-6 text-sm text-slate">
                <Icon name="spinner" className="size-5 animate-spin" />
                Đang tải hồ sơ học viên…
              </div>
            ) : clients.length === 0 && !listError ? (
              <div className="panel">
                <EmptyState
                  icon="users"
                  title="Bắt đầu từ một hồ sơ"
                  action={
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={openForm}
                    >
                      <Icon name="plus" className="size-4" />
                      Tạo học viên đầu tiên
                    </button>
                  }
                >
                  Lưu thông tin ban đầu, sau đó bổ sung bệnh lý, thuốc và sàng
                  lọc trước tập trong hồ sơ học viên.
                </EmptyState>
              </div>
            ) : !matchingClients.length && !listError ? (
              <div className="panel">
                <EmptyState
                  icon="search"
                  title="Chưa tìm thấy hồ sơ phù hợp"
                  action={
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => setQuery("")}
                    >
                      Xóa bộ lọc
                    </button>
                  }
                >
                  Thử một tên, bệnh lý hoặc mục tiêu khác.
                </EmptyState>
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {matchingClients.map((client) => (
              <ClientRecordCard key={client.id} client={client} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
