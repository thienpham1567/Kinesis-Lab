"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BodyMapExplorer } from "@/components/BodyMapExplorer";
import { MuscleHypertrophyExplorer } from "@/components/MuscleHypertrophyExplorer";
import { TriggerPointExplorer } from "@/components/TriggerPointExplorer";
import type { Client } from "@/lib/types";

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
    <Suspense fallback={null}>
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            {TAB_COPY[atlasTab].title}
          </h1>
          <p className="mt-0.5 text-sm text-slate">
            {TAB_COPY[atlasTab].subtitle}
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-rule bg-sheet p-1 shadow-xs">
          {(
            [
              { id: "hypertrophy", label: "Cơ bắp & bài tập" },
              { id: "trigger_points", label: "Trigger Point" },
              { id: "clinical_rehab", label: "Phục hồi khớp" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`rounded-md px-3.5 py-2 font-display text-xs font-bold transition-colors ${
                atlasTab === tab.id
                  ? "bg-cobalt text-white"
                  : "text-slate hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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
