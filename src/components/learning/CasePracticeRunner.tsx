"use client";

import { useEffect, useId, useRef, useState } from "react";
import { evaluateCaseChoices } from "@/lib/learning/case-engine";
import type { CaseSubmission, PtCase } from "@/lib/learning/case-types";
import {
  CaseChoiceReview,
  CasePracticeFeedback,
  CaseReading,
} from "./CasePracticeFeedback";

export function CasePracticeRunner({
  scenario,
  visible,
  onSubmit,
  onBack,
}: {
  scenario: PtCase;
  visible: boolean;
  onSubmit: (submission: CaseSubmission) => Promise<boolean>;
  onBack: () => void;
}) {
  const [path, setPath] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [submission, setSubmission] = useState<CaseSubmission | null>(null);
  const [saveState, setSaveState] = useState<"saving" | "saved" | "failed">(
    "saving",
  );
  const submitting = useRef(false);
  const caseTitle = useRef<HTMLHeadingElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const choiceName = useId();

  useEffect(() => {
    if (visible) caseTitle.current?.focus();
  }, [visible]);

  const evaluation = evaluateCaseChoices(scenario, path.slice(0, stepIndex));
  const step = scenario.checkpoints.find(
    (item) => item.id === evaluation.nextCheckpointId,
  );
  const previousChoice = scenario.checkpoints
    .flatMap((item) => item.choices)
    .find((choice) => choice.id === path[stepIndex - 1]);

  function moveTo(index: number, choices: string[]) {
    setPath(choices);
    setStepIndex(index);
    setSelected(choices[index] ?? "");
    requestAnimationFrame(() => heading.current?.focus());
  }

  function advance() {
    if (!step?.choices.some((choice) => choice.id === selected)) return;
    const choices =
      path[stepIndex] === selected
        ? path
        : [...path.slice(0, stepIndex), selected];
    moveTo(stepIndex + 1, choices);
  }

  async function save(result: CaseSubmission) {
    if (submitting.current) return;
    submitting.current = true;
    setSaveState("saving");
    try {
      setSaveState((await onSubmit(result)) ? "saved" : "failed");
    } catch {
      setSaveState("failed");
    } finally {
      submitting.current = false;
    }
  }

  function showFeedback() {
    if (step || submission || submitting.current) return;
    const result: CaseSubmission = {
      id: `pt-case:${crypto.randomUUID()}`,
      source: "pt-case",
      submittedAt: new Date().toISOString(),
      caseId: scenario.id,
      caseVersion: scenario.version,
      choiceIds: path.slice(0, stepIndex),
      evaluation,
    };
    setSubmission(result);
    void save(result);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function restart() {
    setSubmission(null);
    setReason("");
    moveTo(0, []);
  }

  return (
    <section className="panel mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <button type="button" className="button-secondary" onClick={onBack}>
        Danh mục tình huống
      </button>
      <div className="space-y-2">
        <h2
          ref={caseTitle}
          tabIndex={-1}
          className="text-lg font-semibold text-ink"
        >
          {scenario.title}
        </h2>
        <p className="text-sm leading-6 text-ink">
          Tình huống giả lập · {scenario.fictionalContext}
        </p>
        {!submission && <CaseReading scenario={scenario} includeSources />}
      </div>
      {submission ? (
        <>
          <h3
            ref={heading}
            tabIndex={-1}
            className="text-base font-semibold text-ink"
          >
            Phản hồi tình huống
          </h3>
          <p role="status" className="text-sm text-ink">
            {saveState === "saving"
              ? "Đang lưu kết quả…"
              : saveState === "saved"
                ? "Đã lưu vào tiến độ trên trình duyệt này."
                : "Chưa lưu được kết quả trên trình duyệt này."}
          </p>
          {saveState === "failed" && (
            <button
              className="button-secondary"
              type="button"
              onClick={() => void save(submission)}
            >
              Thử lưu lại
            </button>
          )}
          <CasePracticeFeedback
            scenario={scenario}
            evaluation={submission.evaluation}
            choices={submission.choiceIds}
          />
          {reason.trim() && (
            <div className="space-y-1 border-t border-rule pt-3 text-sm leading-6 text-ink">
              <h4 className="font-semibold">Lý do bạn đã ghi</h4>
              <p className="whitespace-pre-wrap break-words">{reason}</p>
            </div>
          )}
          <button
            type="button"
            className="button-primary"
            disabled={saveState === "saving"}
            onClick={restart}
          >
            Luyện lại
          </button>
        </>
      ) : (
        <>
          <h3
            ref={heading}
            tabIndex={-1}
            className="border-t border-rule pt-4 text-base font-semibold text-ink"
          >
            {step ? `Bước ${stepIndex + 1}` : "Xem lại trước khi nhận phản hồi"}
          </h3>
          {previousChoice && (
            <p className="border-b border-rule pb-3 text-sm leading-6 text-ink">
              {previousChoice.feedback}
            </p>
          )}
          {step ? (
            <fieldset className="space-y-2">
              <legend className="mb-3 font-semibold text-ink">
                {step.prompt}
              </legend>
              {step.choices.map((choice) => (
                <label
                  key={choice.id}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-rule px-3 py-2.5 text-sm leading-6 text-ink has-checked:border-cobalt has-checked:bg-cobalt-soft"
                >
                  <input
                    type="radio"
                    name={choiceName}
                    value={choice.id}
                    checked={selected === choice.id}
                    onChange={() => setSelected(choice.id)}
                    className="mt-1 size-4 shrink-0 accent-cobalt"
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </fieldset>
          ) : (
            <div className="space-y-4">
              <CaseChoiceReview
                scenario={scenario}
                choices={path.slice(0, stepIndex)}
                open
              />
              <label className="field-label block">
                Lý do lựa chọn (không bắt buộc)
                <textarea
                  className="mt-2 block min-h-24 w-full p-3 text-sm"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={1000}
                />
                <span className="mt-1 block text-xs leading-5 text-ink">
                  Chỉ ghi về tình huống giả lập. Tránh nhập tên hoặc hồ sơ thật.
                  Lý do được giữ trong phiên đang mở.
                </span>
              </label>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                className="button-secondary"
                onClick={() => moveTo(stepIndex - 1, path)}
              >
                Quay lại bước trước
              </button>
            )}
            {step ? (
              <button
                type="button"
                className="button-primary"
                disabled={!selected}
                onClick={advance}
              >
                Tiếp tục
              </button>
            ) : (
              <button
                type="button"
                className="button-primary"
                onClick={showFeedback}
              >
                Xem phản hồi
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
