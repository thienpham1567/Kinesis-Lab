import type { CaseEvaluation, PtCase } from "./case-types";

export function evaluateCaseChoices(
  caseDefinition: PtCase,
  choiceIds: readonly string[],
): CaseEvaluation {
  const practiced = new Set<string>();
  const addressed = new Set<string>();
  let nextCheckpointId: string | null = caseDefinition.entryCheckpointId;

  for (const choiceId of choiceIds) {
    const step = caseDefinition.checkpoints.find(
      (item) => item.id === nextCheckpointId,
    );
    const choice = step?.choices.find((item) => item.id === choiceId);
    if (!step || !choice)
      throw new Error("Lựa chọn không thuộc checkpoint hiện tại.");

    for (const id of step.criterionIds) practiced.add(id);
    for (const id of choice.criterionIds) addressed.add(id);
    nextCheckpointId = choice.nextCheckpointId;
  }

  const criteria = caseDefinition.criteria.map(({ id }) => id);
  return {
    addressedCriterionIds: criteria.filter((id) => addressed.has(id)),
    revisitCriterionIds: criteria.filter(
      (id) => practiced.has(id) && !addressed.has(id),
    ),
    unpracticedCriterionIds: criteria.filter((id) => !practiced.has(id)),
    nextCheckpointId,
  };
}
