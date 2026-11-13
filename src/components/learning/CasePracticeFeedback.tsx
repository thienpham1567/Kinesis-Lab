import type { CaseEvaluation, PtCase } from "@/lib/learning/case-types";

const GROUPS = [
  ["Đã xử lý", "addressedCriterionIds"],
  ["Cần xem lại", "revisitCriterionIds"],
  ["Chưa thực hành", "unpracticedCriterionIds"],
] as const;

export function CaseReading({
  scenario,
  includeSources = false,
}: {
  scenario: PtCase;
  includeSources?: boolean;
}) {
  const sources = includeSources
    ? [
        ...new Map(
          scenario.criteria
            .flatMap((criterion) => criterion.sources)
            .map((source) => [source.url, source]),
        ).values(),
      ]
    : [];
  const links = [
    ...(scenario.reading ? [scenario.reading] : []),
    ...sources.map(({ title, url }) => ({ label: title, href: url })),
  ];
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4">
      {links.map(({ href, label }) => (
        <a
          key={href}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-cobalt underline underline-offset-4"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {label} <span className="sr-only">(mở tab mới)</span>
        </a>
      ))}
    </div>
  );
}

export function CasePracticeFeedback({
  scenario,
  evaluation,
  choices,
}: {
  scenario: PtCase;
  evaluation: CaseEvaluation;
  choices: readonly string[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-ink">
        Các tiêu chí dùng để tự đối chiếu cách xử lý trong tình huống này.
      </p>
      {GROUPS.map(([label, key]) => (
        <section key={key} className="space-y-2 border-t border-rule pt-3">
          <h4 className="font-semibold text-ink">{label}</h4>
          {evaluation[key].length === 0 ? (
            <p className="text-sm text-slate">Không có tiêu chí.</p>
          ) : (
            <ul className="space-y-3">
              {scenario.criteria
                .filter(({ id }) => evaluation[key].includes(id))
                .map((criterion) => (
                  <li
                    key={criterion.id}
                    className="space-y-1 text-sm leading-6 text-ink"
                  >
                    <p>{criterion.description}</p>
                    {criterion.sources.map((source) => (
                      <p
                        key={source.url}
                        className="text-xs leading-5 text-ink"
                      >
                        <a
                          className="inline-block py-2 font-semibold text-cobalt underline underline-offset-4"
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.title}
                          <span className="sr-only"> (mở tab mới)</span>
                        </a>
                        <span className="block">
                          Đối chiếu {source.checkedAt} · {source.access}
                        </span>
                      </p>
                    ))}
                  </li>
                ))}
            </ul>
          )}
        </section>
      ))}
      <CaseChoiceReview scenario={scenario} choices={choices} />
      <CaseReading scenario={scenario} />
      {scenario.limitations.map((line) => (
        <p key={line} className="text-sm leading-6 text-ink text-pretty">
          {line}
        </p>
      ))}
    </div>
  );
}

export function CaseChoiceReview({
  scenario,
  choices,
  open,
}: {
  scenario: PtCase;
  choices: readonly string[];
  open?: boolean;
}) {
  const available = scenario.checkpoints.flatMap((step) => step.choices);
  return (
    <details open={open} className="border-t border-rule pt-3">
      <summary className="min-h-11 cursor-pointer font-semibold text-ink">
        Xem lại lựa chọn của bạn
      </summary>
      <ol className="space-y-3 pl-5 text-sm leading-6 text-ink list-decimal">
        {choices.map((id) => {
          const choice = available.find((item) => item.id === id);
          return (
            choice && (
              <li key={id}>
                <strong>{choice.label}</strong>
                {!open && <p>{choice.feedback}</p>}
              </li>
            )
          );
        })}
      </ol>
    </details>
  );
}
