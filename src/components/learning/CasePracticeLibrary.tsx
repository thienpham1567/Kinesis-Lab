"use client";

import { useRef, useState } from "react";
import type { CaseSubmission, PtCase } from "@/lib/learning/case-types";
import { PT_CASES } from "@/lib/learning/pt-cases";
import { NCSF_DOMAINS } from "@/lib/ncsf-quiz";
import { CaseReading } from "./CasePracticeFeedback";
import { CasePracticeRunner } from "./CasePracticeRunner";

export function CasePracticeLibrary({
  attempts,
  onSubmit,
}: {
  attempts: readonly CaseSubmission[];
  onSubmit: (submission: CaseSubmission) => Promise<boolean>;
}) {
  const [active, setActive] = useState<PtCase | null>(null);
  const [visited, setVisited] = useState<PtCase[]>([]);
  const launchers = useRef(new Map<string, HTMLButtonElement>());
  const [domain, setDomain] = useState("");
  const cases = domain
    ? PT_CASES.filter((scenario) => scenario.domain === domain)
    : PT_CASES;
  const domains = [...new Set(PT_CASES.map((scenario) => scenario.domain))];

  function openCase(scenario: PtCase) {
    setVisited((previous) =>
      previous.some(({ id }) => id === scenario.id)
        ? previous
        : [...previous, scenario],
    );
    setActive(scenario);
  }

  function backToLibrary() {
    setActive(null);
    if (active)
      requestAnimationFrame(() => launchers.current.get(active.id)?.focus());
  }

  return (
    <>
      <div hidden={active !== null}>
        <section
          className="panel mx-auto max-w-4xl p-4 sm:p-6"
          aria-label="Danh mục tình huống"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-ink">
                Luyện tình huống
              </h2>
              <p className="max-w-prose text-sm leading-6 text-ink">
                Chọn một tình huống giả lập, quyết định cách xử lý và xem phản
                hồi theo từng tiêu chí.
              </p>
            </div>
            <label className="field-label w-full sm:w-auto">
              Chủ đề tình huống
              <select
                className="min-h-11 w-full text-sm"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
              >
                <option value="">Tất cả chủ đề</option>
                {domains.map((id) => (
                  <option key={id} value={id}>
                    {NCSF_DOMAINS[id]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ul className="divide-y divide-rule">
            {cases.map((scenario) => {
              const history = attempts.filter(
                (attempt) => attempt.caseId === scenario.id,
              );
              const completed = history.filter(
                (attempt) => attempt.caseVersion === scenario.version,
              ).length;
              const opened = visited.some(({ id }) => id === scenario.id);
              const action = opened ? "Mở lại" : "Bắt đầu";
              return (
                <li
                  key={scenario.id}
                  className="flex flex-wrap items-start justify-between gap-3 py-4"
                >
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold text-ink">{scenario.title}</h3>
                    <p className="text-sm leading-6 text-ink">
                      {scenario.objective}
                    </p>
                    <p className="text-xs leading-5 text-ink">
                      {NCSF_DOMAINS[scenario.domain]} · Khoảng 5–10 phút ·{" "}
                      {completed} lần luyện phiên bản này
                    </p>
                    {history.some(
                      (attempt) => attempt.caseVersion < scenario.version,
                    ) && (
                      <p className="text-xs text-ink">
                        Có phiên bản mới. Kết quả trước vẫn xem được trong tiến
                        độ.
                      </p>
                    )}
                    <CaseReading scenario={scenario} includeSources />
                  </div>
                  <button
                    type="button"
                    className="button-secondary"
                    aria-label={`${action} ${scenario.title}`}
                    ref={(element) => {
                      if (element) launchers.current.set(scenario.id, element);
                      else launchers.current.delete(scenario.id);
                    }}
                    onClick={() => openCase(scenario)}
                  >
                    {action}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      {visited.map((scenario) => (
        <div key={scenario.id} hidden={active?.id !== scenario.id}>
          <CasePracticeRunner
            scenario={scenario}
            visible={active?.id === scenario.id}
            onSubmit={onSubmit}
            onBack={backToLibrary}
          />
        </div>
      ))}
    </>
  );
}
