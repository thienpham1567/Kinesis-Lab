"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BodyMapExplorer } from "@/components/BodyMapExplorer";
import { MuscleHypertrophyExplorer } from "@/components/MuscleHypertrophyExplorer";
import { TriggerPointExplorer } from "@/components/TriggerPointExplorer";
import type { Client } from "@/lib/types";
import { Icon, PageHeading, type IconName } from "@/components/WorkspaceUI";

type AtlasTab = "hypertrophy" | "trigger_points" | "clinical_rehab";

function parseAtlasTab(value: string | null): AtlasTab {
  if (value === "trigger_points" || value === "clinical_rehab") return value;
  return "hypertrophy";
}

const TAB_COPY: Record<AtlasTab, { title: string; subtitle: string }> = {
  hypertrophy: {
    title: "Atlas Cơ – Khớp",
    subtitle:
      "Chọn bó cơ để ra bài tập, hoặc chọn bài tập để xem bản đồ nhiệt kích hoạt.",
  },
  trigger_points: {
    title: "Trigger Point & Cơ mạc",
    subtitle:
      "Sờ nắn nhận diện nút, đọc đường đau quy chiếu, rồi giải phóng – kích hoạt – chỉnh kỹ thuật.",
  },
  clinical_rehab: {
    title: "Phục hồi khớp",
    subtitle:
      "Sàng lọc vùng khớp, red flag và bài tập thay thế theo hồ sơ học viên.",
  },
};

export default function AtlasPage() {
  return (
    <Suspense
      fallback={
        <div className="panel flex min-h-64 items-center justify-center gap-3 text-sm text-slate">
          <Icon name="spinner" className="size-5 animate-spin" />
          Đang mở Atlas…
        </div>
      }
    >
      <AtlasPageInner />
    </Suspense>
  );
}

function AtlasPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const atlasTab = parseAtlasTab(searchParams.get("tab"));
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  function selectTab(id: AtlasTab) {
    const next = new URLSearchParams(searchParams.toString());
    if (id === "hypertrophy") next.delete("tab");
    else next.set("tab", id);
    const query = next.toString();
    router.replace(query ? `/atlas?${query}` : "/atlas", { scroll: false });
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/clients")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ignore && ok) setClients(data.clients ?? []);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const activeClient = clients.find((c) => c.id === selectedClientId) ?? null;

  return (
    <div className="atlas-workspace space-y-5">
      <PageHeading
        eyebrow="Cấu trúc · Chuyển động · Ứng dụng"
        title="Atlas giải phẫu"
        description={TAB_COPY[atlasTab].subtitle}
      >
        <span className="badge hidden bg-sheet text-cleared sm:inline-flex">
          <Icon name="target" className="size-3.5" />
          Tra cứu tương tác
        </span>
      </PageHeading>
      <div className="tab-bar grid grid-cols-3" aria-label="Nội dung Atlas">
        {(
          [
            { id: "hypertrophy", label: "Cơ bắp & bài tập", icon: "activity" },
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
      {atlasTab === "hypertrophy" ? (
        <MuscleHypertrophyExplorer />
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
        <BodyMapExplorer
          mode="full"
          clients={clients}
          client={activeClient}
          onSelectClient={setSelectedClientId}
        />
      )}
    </div>
  );
}
