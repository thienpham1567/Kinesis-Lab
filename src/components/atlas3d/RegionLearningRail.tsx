import type { LearningStep } from "./region-learning";

export function RegionLearningRail({
  step,
  steps,
  areaLabel,
  onStep,
}: {
  step: number;
  steps: LearningStep[];
  areaLabel: string;
  onStep: (step: number) => void;
}) {
  const active = steps[step];
  return (
    <section
      className="overflow-hidden rounded-xl border border-rule bg-sheet"
      aria-label={`Các bước học · ${areaLabel}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-4 py-3">
        <p className="eyebrow text-cobalt">Lộ trình quan sát · {areaLabel}</p>
        <span className="font-mono text-xs text-slate">
          {String(step + 1).padStart(2, "0")} /{" "}
          {String(steps.length).padStart(2, "0")}
        </span>
      </div>
      <ol className="grid grid-cols-5 divide-x divide-rule">
        {steps.map((item, index) => (
          <li key={item.id} className="min-w-0">
            <button
              type="button"
              onClick={() => onStep(index)}
              aria-current={index === step ? "step" : undefined}
              className={`flex min-h-20 w-full flex-col items-start gap-2 px-2 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cobalt sm:px-4 ${index === step ? "bg-cobalt-soft text-cobalt" : "text-slate hover:bg-canvas"}`}
            >
              <span className="font-mono text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="break-words text-xs font-semibold leading-5">
                {item.short}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3">
        <div className="min-w-0 flex-1 basis-64">
          <h3 className="text-sm font-semibold text-ink">{active.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate" role="status">
            {active.instruction}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="button-secondary"
            disabled={step === 0}
            onClick={() => onStep(step - 1)}
            aria-label="Bước học trước"
          >
            ← Trước
          </button>
          <button
            type="button"
            className="button-primary"
            disabled={step === steps.length - 1}
            onClick={() => onStep(step + 1)}
            aria-label="Bước học tiếp theo"
          >
            Tiếp →
          </button>
        </div>
      </div>
    </section>
  );
}
