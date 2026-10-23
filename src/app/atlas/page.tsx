"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BodyMapExplorer } from "@/components/BodyMapExplorer";
import { TrainingAtlasExplorer } from "@/components/training/TrainingAtlasExplorer";
import { TriggerPointExplorer } from "@/components/TriggerPointExplorer";
import type { Client } from "@/lib/types";
import { Icon, PageHeading, type IconName } from "@/components/WorkspaceUI";

const Atlas3DExplorer = dynamic(
  () => import("@/components/atlas3d/Atlas3DExplorer"),
  {
    loading: () => (
      <div className="panel p-8 text-sm text-slate" role="status">
        Đang mở Atlas 3D…
      </div>
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
        eyebrow="Cấu trúc · Chuyển động · Ứng dụng"
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
      <div className="panel flex min-h-64 items-center justify-center gap-3 text-sm text-slate">
        <Icon name="spinner" className="size-5 animate-spin" />
        Đang mở Atlas…
      </div>
    </div>
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
    if (id === "3d") next.delete("tab");
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
