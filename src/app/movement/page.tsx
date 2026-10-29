"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon, PageHeading } from "@/components/WorkspaceUI";
import { MovementTopic } from "@/components/movement/MovementTopic";
import {
  HANDBOOK,
  type HandbookTopic,
} from "@/lib/clinical/movement-handbook";

export default function MovementHandbookPage() {
  return (
    <Suspense fallback={<HandbookFallback />}>
      <HandbookInner />
    </Suspense>
  );
}

/* Khi tải, giữ nguyên tiêu đề và hàng tab để trang không nhảy hình. */
function HandbookFallback() {
  return (
    <div className="space-y-5" aria-busy="true">
      <PageHeading
        eyebrow="Hiểu · Quan sát · Áp dụng"
        title="Sổ tay vận động"
        description="Bốn nền tảng cho PT, với kiến thức trọng tâm, ví dụ thực hành và đường dẫn về tài liệu gốc ngay cạnh nhận định."
      />
      <div
        className="tab-bar grid grid-cols-2 sm:grid-cols-4"
        aria-hidden="true"
      >
        {HANDBOOK.map((t, i) => (
          <span
            key={t.id}
            className="tab-button px-1.5 text-center sm:px-3.5"
            aria-pressed={i === 0}
          >
            {t.tab}
          </span>
        ))}
      </div>
      <div className="panel flex min-h-64 items-center justify-center gap-3 text-sm text-slate">
        <Icon name="spinner" className="size-5 animate-spin" />
        Đang mở sổ tay…
      </div>
    </div>
  );
}
function HandbookInner() {
  const searchParams = useSearchParams(),
    router = useRouter();
  const topic =
    HANDBOOK.find((t) => t.id === searchParams.get("tab")) ?? HANDBOOK[0];
  function selectTab(id: HandbookTopic["id"]) {
    router.replace(
      id === HANDBOOK[0].id ? "/movement" : `/movement?tab=${id}`,
      { scroll: false },
    );
  }
  return (
    <div className="space-y-5">
      <PageHeading
        eyebrow="Hiểu · Quan sát · Áp dụng"
        title="Sổ tay vận động"
        description="Bốn nền tảng cho PT, với kiến thức trọng tâm, ví dụ thực hành và đường dẫn về tài liệu gốc ngay cạnh nhận định."
      />
      <div
        className="tab-bar grid grid-cols-2 sm:grid-cols-4"
        aria-label="Các mục trong sổ tay"
      >
        {HANDBOOK.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={topic.id === t.id}
            onClick={() => selectTab(t.id)}
            className="tab-button px-1.5 text-center sm:px-3.5"
          >
            {t.tab}
          </button>
        ))}
      </div>
      <MovementTopic key={topic.id} topic={topic} />
    </div>
  );
}
