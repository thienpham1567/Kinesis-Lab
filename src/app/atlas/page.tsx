"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Client } from "@/lib/types";
import { Icon, LoadingState, PageHeading, type IconName } from "@/components/WorkspaceUI";

const BodyMapExplorer = dynamic(
  () => import("@/components/BodyMapExplorer").then((module) => module.BodyMapExplorer),
  { loading: () => <LoadingState className="panel">Đang mở không gian khớp…</LoadingState> },
);
const TrainingAtlasExplorer = dynamic(
  () => import("@/components/training/TrainingAtlasExplorer").then((module) => module.TrainingAtlasExplorer),
  { loading: () => <LoadingState className="panel">Đang mở Atlas huấn luyện…</LoadingState> },
);
const TriggerPointExplorer = dynamic(
  () => import("@/components/TriggerPointExplorer").then((module) => module.TriggerPointExplorer),
  { loading: () => <LoadingState className="panel">Đang mở tra cứu Trigger Point…</LoadingState> },
);

const Atlas3DExplorer = dynamic(
  () => import("@/components/atlas3d/Atlas3DExplorer"),
  {
    loading: () => (
      <LoadingState className="panel">
        Đang mở Atlas 3D…
      </LoadingState>
    ),
  },
);

type AtlasTab = "3d" | "hypertrophy" | "trigger_points" | "clinical_rehab";

function parseAtlasTab(value: string | null): AtlasTab {
  if (
    value === "hypertrophy" ||
    value === "trigger_points" ||
    value === "clinical_rehab"
  )
    return value;
  return "3d";
}

const TAB_COPY: Record<AtlasTab, { title: string; subtitle: string }> = {
  "3d": {
    title: "Atlas 3D",
    subtitle:
      "Khám phá từng cấu trúc cơ–xương–khớp, quan sát theo lớp và kết nối với bài tập.",
  },
  hypertrophy: {
    title: "Atlas Cơ – Khớp",
    subtitle:
      "Liên kết bài tập, cơ–khớp và nhật ký huấn luyện; tra cứu nguồn ngay trong từng nội dung.",
  },
  trigger_points: {
    title: "Trigger Point & Cơ mạc",
    subtitle:
      "Tra cứu điểm đau và cơ mạc, đọc giới hạn bằng chứng và dấu hiệu cần đánh giá chuyên môn.",
  },
  clinical_rehab: {
    title: "Phục hồi khớp",
    subtitle:
      "Ghi nhận vùng khớp, triệu chứng và lưu ý theo hồ sơ; các từ khóa không thay thế đánh giá chuyên môn.",
  },
};

export default function AtlasPage() {
  return (
    <Suspense fallback={<AtlasFallback />}>
      <AtlasPageInner />
    </Suspense>
  );
}

/* Khi tải, giữ nguyên tiêu đề và hàng tab để trang không nhảy hình. */
function AtlasFallback() {
  return (
    <div className="atlas-workspace space-y-5" aria-busy="true">
      <PageHeading

        title="Atlas giải phẫu"
        description={TAB_COPY["3d"].subtitle}
      />
      <div className="tab-bar grid grid-cols-2 sm:grid-cols-4" aria-hidden="true">
        {(
          [
            { id: "3d", label: "Giải phẫu 3D", icon: "atlas" },
            { id: "hypertrophy", label: "Huấn luyện PT", icon: "activity" },
            { id: "trigger_points", label: "Trigger Point", icon: "target" },
            { id: "clinical_rehab", label: "Phục hồi khớp", icon: "shield" },
          ] as const
        ).map((tab) => (
          <span
            key={tab.id}
            className="tab-button flex-col gap-1.5 px-1.5 text-center sm:flex-row sm:gap-2 sm:px-3.5"
            aria-pressed={tab.id === "3d"}
          >
            <Icon name={tab.icon as IconName} className="size-4" />
            {tab.label}
          </span>
        ))}
      </div>
      <LoadingState className="panel">
        Đang mở Atlas…
      </LoadingState>
    </div>
  );
}

function AtlasPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const atlasTab = parseAtlasTab(searchParams.get("tab"));
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientsState, setClientsState] = useState<"idle" | "ready" | "error">("idle");
  const [clientsRetry, setClientsRetry] = useState(0);

  function selectTab(id: AtlasTab) {
    const next = new URLSearchParams(searchParams.toString());
    if (id === "3d") next.delete("tab");
    else next.set("tab", id);
    const query = next.toString();
    router.replace(query ? `/atlas?${query}` : "/atlas", { scroll: false });
  }

  useEffect(() => {
    if (atlasTab !== "clinical_rehab") return;
    const controller = new AbortController();
    fetch("/api/clients", { signal: controller.signal })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (!ok) throw new Error("Client records unavailable");
        setClients(Array.isArray(data.clients) ? data.clients : []);
        setClientsState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setClientsState("error");
      });
    return () => controller.abort();
  }, [atlasTab, clientsRetry]);

  const activeClient = clients.find((c) => c.id === selectedClientId) ?? null;

  return (
    <div className="atlas-workspace space-y-5">
      <PageHeading

        title="Atlas giải phẫu"
        description={TAB_COPY[atlasTab].subtitle}
      />
      <div
        className="tab-bar grid grid-cols-2 sm:grid-cols-4"
        aria-label="Nội dung Atlas"
      >
        {(
          [
            { id: "3d", label: "Giải phẫu 3D", icon: "atlas" },
            { id: "hypertrophy", label: "Huấn luyện PT", icon: "activity" },
            { id: "trigger_points", label: "Trigger Point", icon: "target" },
            { id: "clinical_rehab", label: "Phục hồi khớp", icon: "shield" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={atlasTab === tab.id}
            onClick={() => selectTab(tab.id)}
            className="tab-button flex-col gap-1.5 px-1.5 text-center sm:flex-row sm:gap-2 sm:px-3.5"
          >
            <Icon name={tab.icon as IconName} className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <h2 className="sr-only">{TAB_COPY[atlasTab].title}</h2>
      {atlasTab === "3d" ? (
        <Atlas3DExplorer
          initialArea={searchParams.get("area")}
          initialStructure={searchParams.get("structure")}
          initialGroup={searchParams.get("group")}
        />
      ) : atlasTab === "hypertrophy" ? (
        <TrainingAtlasExplorer
          initialMuscleId={searchParams.get("muscle")}
          initialExerciseId={searchParams.get("exercise")}
        />
      ) : atlasTab === "trigger_points" ? (
        <TriggerPointExplorer
          initialMode={
            searchParams.get("trp") === "pain"
              ? "pain_to_muscle"
              : searchParams.get("trp") === "handbook"
                ? "handbook"
                : "muscle_to_pain"
          }
        />
      ) : (
        <div className="space-y-4">
          {clientsState === "error" && (
            <div className="alert-error" role="alert">
              <p>Chưa tải được hồ sơ học viên. Bạn vẫn có thể tra cứu khớp mà chưa gắn hồ sơ.</p>
              <button
                type="button"
                className="button-secondary mt-3"
                onClick={() => {
                  setClientsState("idle");
                  setClientsRetry((value) => value + 1);
                }}
              >
                <Icon name="refresh" className="size-4" /> Thử tải lại hồ sơ
              </button>
            </div>
          )}
          <BodyMapExplorer
            showAnatomy3D
            mode="full"
            clients={clients}
            client={activeClient}
            onSelectClient={setSelectedClientId}
          />
        </div>
      )}
    </div>
  );
}
