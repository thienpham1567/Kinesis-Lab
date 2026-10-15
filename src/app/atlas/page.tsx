"use client";

import { useEffect, useState } from "react";
import { BodyMapExplorer } from "@/components/BodyMapExplorer";
import { MuscleHypertrophyExplorer } from "@/components/MuscleHypertrophyExplorer";
import type { Client } from "@/lib/types";

export default function AtlasPage() {
  const [atlasTab, setAtlasTab] = useState<"hypertrophy" | "clinical_rehab">(
    "hypertrophy",
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

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
            Atlas Cơ – Khớp
          </h1>
          <p className="mt-0.5 text-sm text-slate">
            Chọn bó cơ để ra bài tập, hoặc chọn bài tập để xem bản đồ nhiệt kích hoạt.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-rule bg-sheet p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setAtlasTab("hypertrophy")}
            className={`rounded-md px-3.5 py-2 font-display text-xs font-bold transition-colors ${
              atlasTab === "hypertrophy"
                ? "bg-cobalt text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            Cơ bắp & bài tập
          </button>
          <button
            type="button"
            onClick={() => setAtlasTab("clinical_rehab")}
            className={`rounded-md px-3.5 py-2 font-display text-xs font-bold transition-colors ${
              atlasTab === "clinical_rehab"
                ? "bg-cobalt text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            Phục hồi khớp
          </button>
        </div>
      </div>

      {atlasTab === "hypertrophy" ? (
        <MuscleHypertrophyExplorer />
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
