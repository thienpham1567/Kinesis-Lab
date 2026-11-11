"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoadingState, PageHeading } from "@/components/WorkspaceUI";
import { MovementTopic } from "@/components/movement/MovementTopic";
import { HANDBOOK } from "@/lib/clinical/movement-handbook";

const [posture, ...supplementary] = HANDBOOK;
const pageTitle = "Đánh giá & điều chỉnh tư thế";
const pageDescription = "Hướng dẫn thực hành cho PT: quan sát, đo chức năng, chọn điều chỉnh theo vùng và đánh giá lại. Có bằng chứng, quy trình và ví dụ tiếng Việt.";

export default function MovementHandbookPage() {
  return (
    <Suspense fallback={<HandbookFallback />}>
      <HandbookInner />
    </Suspense>
  );
}

function HandbookFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-5" aria-busy="true">
      <PageHeading title={pageTitle} description={pageDescription} />
      <LoadingState className="panel">
        Đang mở sổ tay…
      </LoadingState>
    </div>
  );
}
function HandbookInner() {
  const searchParams = useSearchParams();
  const topic =
    HANDBOOK.find((t) => t.id === searchParams.get("tab")) ?? posture;
  const isPosture = topic.id === posture.id;
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeading
        title={isPosture ? pageTitle : "Sổ tay vận động"}
        description={isPosture ? pageDescription : "Kiến thức bổ trợ cho quá trình đánh giá và huấn luyện học viên."}
      />
      <nav aria-label="Các mục trong sổ tay" className="space-y-2">
        {!isPosture && (
          <Link href="/movement" className="button-secondary inline-flex">
            Quay về đánh giá tư thế
          </Link>
        )}
        <details open={!isPosture} className="rounded-xl border border-rule bg-sheet px-4">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-cobalt">
            Chủ đề bổ trợ · {supplementary.length}
          </summary>
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-rule py-2">
            {supplementary.map((item) => (
              <Link
                key={item.id}
                href={`/movement?tab=${item.id}`}
                aria-current={item.id === topic.id ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded px-1 text-sm font-medium text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-cobalt aria-[current=page]:font-bold"
              >
                {item.tab}
              </Link>
            ))}
          </div>
        </details>
      </nav>
      <MovementTopic key={topic.id} topic={topic} />
    </div>
  );
}
