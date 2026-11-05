import { normalizeEvidenceQuery } from "@/lib/clinical/evidence-registry";
import type { PubMedPaper, RagHit } from "@/lib/types";

// Public searches use only these authored strings, never question fragments.
// Order chooses the most specific intent rather than AND-ing unrelated topics.
const TOPICS: readonly { id: string; pattern: RegExp; query: string; local: string }[] = [
  { id: "emg", pattern: /\b(emg|electromyography|dien co)\b/, query: '("10.1007/s40279-021-01619-2"[AID]) OR ((electromyography[Title/Abstract] OR EMG[Title/Abstract]) AND hypertrophy[Title/Abstract] AND (predict*[Title/Abstract] OR validity[Title/Abstract]))', local: "hip thrust squat" },
  { id: "diabetes", pattern: /\b(insulin|metformin|sglt2|diabetes|dai thao duong|tieu duong|ha duong huyet|ha glucose)\b/, query: '(diabetes AND exercise) AND (medication OR insulin OR hypoglycemia) AND (guideline OR consensus OR review)', local: "medication metformin insulin" },
  { id: "activity", pattern: /\bwho\b.*\b2020\b|\b(aerobic|van dong the luc|hoat dong the chat|physical activity|sedentary)\b/, query: '(World[Title] AND Health[Title] AND Organization[Title] AND 2020[Title] AND physical[Title] AND activity[Title])', local: "" },
  { id: "medication", pattern: /\b(beta blocker|metoprolol|statin|anticoagulant|dung thuoc|thuoc chong dong|medication)\b/, query: '(exercise AND medication) AND (safety OR guideline)', local: "medication" },
  { id: "labs", pattern: /\b(xet nghiem|laboratory|biomarker|inbody)\b/, query: 'laboratory reference intervals interpretation', local: "laboratory reference intervals" },
  { id: "trigger", pattern: /\b(trigger point|diem dau|massage|palpation)\b/, query: 'myofascial trigger point systematic review', local: "trigger point" },
  { id: "rom", pattern: /\b(rom|tam van dong|goniometer|range of motion)\b/, query: 'joint range of motion measurement reliability', local: "rom goniometer" },
  { id: "lumbar", pattern: /\b(dau lung|that lung|lumbar|spine|back pain|thoat vi)\b/, query: 'low back pain exercise guideline', local: "lumbar" },
  { id: "shoulder", pattern: /\b(vai|shoulder|rotator cuff|deltoid)\b/, query: 'shoulder exercise rehabilitation', local: "shoulder" },
  { id: "knee", pattern: /\b(goi|knee|quadriceps|hamstring)\b/, query: 'knee exercise rehabilitation', local: "knee" },
  { id: "hip", pattern: /\b(hong|hip|gluteus|gluteal|co mong)\b/, query: 'hip gluteal muscle exercise', local: "gluteus" },
  { id: "neck", pattern: /\b(cervical|neck|cot song co)\b/, query: 'neck pain exercise guideline', local: "cervical" },
  { id: "ankle", pattern: /\b(co chan|ankle|foot|calf|soleus|gastrocnemius)\b/, query: 'ankle foot exercise', local: "ankle" },
  { id: "hypertrophy", pattern: /\b(phi dai|tang co|hypertrophy|resistance training)\b/, query: 'resistance training muscle hypertrophy systematic review', local: "muscle hypertrophy" },
  { id: "screening", pattern: /\b(sang loc|screening|parq|csep|dau nguc)\b/, query: 'physical activity preparticipation screening', local: "screening" },
];

export function studyLiteratureTopic(question: string) {
  const normalized = normalizeEvidenceQuery(question.slice(-4000));
  const topic = TOPICS.find(topic => topic.pattern.test(normalized));
  if (!topic) return null;
  if (topic.id === "emg") return { ...topic, local: /\b(hip thrust|squat)\b/.test(normalized)
    ? "hip thrust squat" : TOPICS.find(item => item.id !== "emg" && item.pattern.test(normalized))?.local ?? "" };
  if (topic.id === "diabetes") {
    const kind = normalized.match(/\b(type|typ|tip|loai) (1|2)\b/)?.[2];
    if (kind) return { ...topic, id: `diabetes-${kind}`, query: `("type ${kind} diabetes"[Title] AND exercise[Title]) AND (consensus[Title] OR statement[Title])` };
  }
  return topic;
}

// Conservative scope gates for the three actually registered full-text articles.
// These are retrieval limits, not medical relevance or quality scores. Unknown
// articles need an explicit scope before being exposed by the study assistant.
const CORPUS_SCOPES: Readonly<Record<string, RegExp>> = {
  "10.1136/bjsports-2020-102955": /\bwho\b.*\b2020\b|\b(aerobic|van dong the luc|hoat dong the chat|physical activity|sedentary)\b/,
  "10.1007/s10926-023-10124-4": /\b(dau lung|that lung|low back pain|lumbar)\b/,
  "10.3389/fphys.2025.1611468": /\b(lateral raise|lateral raises|deltoid|deltoids|co delta|co vai giua|dang vai)\b/,
};

export function filterStudyKnowledge(query: string, hits: readonly RagHit[]) {
  const topic = normalizeEvidenceQuery(query.slice(-6000));
  const selected = hits.filter(hit => Boolean(hit.doi && CORPUS_SCOPES[hit.doi]?.test(topic)));
  const alias = (hit: RagHit) => /^[a-f0-9-]{36}$/i.test(hit.id) ? hit.id.replace(/-/g, "").slice(0, 12) : hit.id;
  return selected.map(hit => ({ ...hit, citationId: selected.filter(other => alias(other) === alias(hit)).length === 1 ? alias(hit) : hit.id }));
}

/** Conservative topic filter; a match still does not prove support for a claim. */
export function filterStudyTopicPapers(question: string, papers: readonly PubMedPaper[]) {
  const topic = studyLiteratureTopic(question);
  if (!topic) return [...papers];
  return papers.filter(paper => {
    const title = normalizeEvidenceQuery(paper.title);
    const text = `${title} ${normalizeEvidenceQuery(paper.abstract)}`;
    if (topic.id === "activity") return title === "world health organization 2020 guidelines on physical activity and sedentary behaviour";
    if (topic.id === "emg") return /\b(emg|electromyography|electromyograms)\b/.test(text) &&
      /hypertroph/.test(text) && /\b(exercise|exercises|training|resistance)\b/.test(text);
    if (topic.id === "diabetes-1" || topic.id === "diabetes-2") return title.includes(`type ${topic.id.endsWith("1") ? "1" : "2"} diabetes`) && /\bexercise\b/.test(title) && /\b(consensus|statement)\b/.test(title);
    return true;
  });
}
