import rawManifest from "../../../public/anatomy/3d/manifest.json";
import { resolveAtlasManifest } from "@/lib/clinical/atlas-catalog";
import { atlasShortEnglishName, atlasVietnameseName } from "@/lib/clinical/atlas-names";
import type { AtlasManifest, AtlasStructure } from "@/lib/clinical/atlas-3d";
import { ANATOMY_REGIONS } from "@/lib/clinical/anatomy-atlas";
import { MUSCLE_GROUP_ATLAS } from "@/lib/clinical/muscle-hypertrophy-atlas";
import { EVIDENCE_INDEX, formatCuratedEvidence, normalizeEvidenceQuery, selectCuratedEvidence, type EvidenceIndexEntry } from "@/lib/clinical/evidence-registry";
import { getStructureAnatomyEvidence } from "@/lib/clinical/structure-anatomy-evidence";
import { trainingGroupForStructure } from "@/lib/clinical/training-atlas";
import type { PubMedPaper } from "@/lib/types";
import type { StudyAnswerMeta, StudyContext } from "./study-types";

const manifest = resolveAtlasManifest(rawManifest as AtlasManifest);
const REGION_AREAS: Record<string, string> = {
  cervical: "neck", shoulder: "upper", thoracic_core: "trunk", lumbar: "trunk",
  hip_pelvis: "hip", thigh_hamstring: "lower", knee: "lower", ankle_foot: "lower",
};

/** Only known IDs resolve. Never interpolate the supplied ID into a prompt. */
export function resolveStudyContext(id: string | undefined): StudyContext | null {
  const structure = manifest.structures.find(item => item.id === id);
  if (!structure) return null;
  return {
    structureId: structure.id,
    name: atlasVietnameseName(structure) ?? structure.english,
    english: structure.english,
    side: structure.side,
    area: REGION_AREAS[structure.clinicalRegion ?? ""] ?? structure.areas[0] ?? "full",
    groupId: trainingGroupForStructure(structure),
  };
}

export function studyEvidenceQuery(context: StudyContext | null, question: string) {
  if (!context) return question.slice(-4000);
  const structure = manifest.structures.find(item => item.id === context.structureId)!;
  const region = ANATOMY_REGIONS.find(item => item.id === structure.clinicalRegion);
  return [context.english, context.name, structure.latin, region?.name, region?.latinName,
    context.groupId, question.slice(-2400)].filter(Boolean).join("\n");
}

/** Generic anatomy vocabulary must not pull other body regions into a follow-up. */
export function selectStudyEvidence(context: StudyContext | null, question: string, localFollowupQuery = question) {
  const currentNamed = exactMentionedStudyStructures(question);
  const normalizedQuestion = normalizeEvidenceQuery(question.slice(-4000));
  const explicitTopic = /\b(insulin|metformin|sglt2|diabetes|beta blocker|statin|anticoagulant|medication|thuoc|xet nghiem|laboratory|biomarker|inbody|trigger point|diem dau|massage|palpation|rom|goniometer|range of motion|sang loc|screening|parq|csep|vai|shoulder|goi|knee|hip|hong|co chan|ankle|foot|lumbar|that lung|cervical|neck)\b/.test(normalizedQuestion);
  // Only local matching can see bounded topic history. A new known entity in the
  // current question wins; selected Atlas context never inherits old topics.
  const localQuery = context || currentNamed.length || explicitTopic
    ? question : localFollowupQuery;
  const named = context ? currentNamed : exactMentionedStudyStructures(localQuery);
  const families = new Set<string>();
  for (const structure of [
    ...(context ? [manifest.structures.find(item => item.id === context.structureId)!] : []),
    ...named,
  ]) {
    const family = getStructureAnatomyEvidence(structure.id);
    if (family && families.size < 2) families.add(`structure:${family.id}`);
  }
  const individual = [...families].flatMap(id => {
    const record = EVIDENCE_INDEX.find(item => item.id === id);
    return record ? [record] : [];
  });
  const structure = context ? manifest.structures.find(item => item.id === context.structureId)! : null;
  const allowedIds = new Set([
    ...families,
    ...(context?.groupId ? [`muscle:${context.groupId}`] : []),
    ...(structure?.clinicalRegion ? [`anatomy:${structure.clinicalRegion}`] : []),
  ]);
  const supporting = selectCuratedEvidence(context ? studyEvidenceQuery(context, "") : localQuery, 6)
    .filter(record => context ? allowedIds.has(record.id) : record.domain !== "structure" || families.has(record.id));
  const selected: EvidenceIndexEntry[] = [];
  for (const record of [...individual, ...supporting]) {
    if (selected.length >= 6 || selected.some(item => item.id === record.id)) continue;
    // Metadata lists only complete records that actually fit the model context.
    if (formatCuratedEvidence([...selected, record]).includes(`[APP:${record.id}]`)) selected.push(record);
  }
  return selected;
}

const LITERATURE_FACETS: readonly [RegExp, string][] = [
  [/\b(nguyen uy|bam tan|bam co|origin|insertion|attachment)\b/, "anatomy OR origin OR insertion OR attachment"],
  [/\b(than kinh|innervation|nerve)\b/, "anatomy OR innervation"],
  [/\b(co sinh hoc|canh tay don|moment arm|biomechanics)\b/, 'biomechanics OR "moment arm"'],
  [/\b(bai tap|tap luyen|exercise|hypertrophy|training|phi dai|tang co|kich hoat|emg)\b/, 'exercise OR "resistance training" OR electromyography'],
];

function studySearchFamily(context: StudyContext) {
  const structure = manifest.structures.find(item => item.id === context.structureId)!;
  // Existing catalog display grammar preserves the exact parent muscle name for
  // named parts/heads/bellies; this broadens search, never anatomical claims.
  if (/\b(tendon|fascia|aponeurosis|ligament|retinaculum|bursa|sheath)\b/i.test(structure.english)) {
    return structure.english;
  }
  const parent = atlasShortEnglishName(structure).split(" · ")[0];
  // The display helper drops “muscle”. Restore it only when the catalog names
  // an actual muscle, so deltoid muscle cannot become ankle deltoid ligament.
  return / muscle$/i.test(structure.english) && !/ muscle$/i.test(parent)
    ? `${parent} muscle` : parent;
}

/** Name relevance only; matching is not confirmation of a paper's claims. */
export function filterStudyPubMed(context: StudyContext, papers: readonly PubMedPaper[]) {
  const family = normalizeEvidenceQuery(studySearchFamily(context));
  const phrases = [family, ...(/ muscle$/.test(family) ? [`${family}s`] : [])];
  return papers.slice(0, 10).filter(paper => {
    const text = ` ${normalizeEvidenceQuery(`${paper.title.slice(0, 600)} ${paper.abstract.slice(0, 8000)}`)} `;
    return phrases.some(phrase => text.includes(` ${phrase} `));
  });
}

/** Only catalog English + a selected fixed facet leave via search. */
export function studyPublicLiteratureQuery(context: StudyContext, question: string) {
  const family = studySearchFamily(context).replace(/["\\]/g, "");
  const normalized = normalizeEvidenceQuery(question.slice(-4000));
  const facet = LITERATURE_FACETS.find(([pattern]) => pattern.test(normalized))?.[1]
    ?? "anatomy OR function";
  return `("${family}"[Title/Abstract]) AND (${facet})`;
}

function studyContextActions(context: StudyContext) {
  const actions = [{
    label: `Xem ${context.name}${context.side ? ` bên ${context.side === "left" ? "trái" : "phải"}` : ""} trong Atlas`,
    href: `/atlas?tab=3d&area=${encodeURIComponent(context.area)}&structure=${encodeURIComponent(context.structureId)}#atlas-3d-stage`,
  }];
  const group = MUSCLE_GROUP_ATLAS.find(item => item.id === context.groupId);
  if (group) actions.push({ label: `Bài tập nhóm ${group.name}`, href: `/atlas?tab=hypertrophy&muscle=${encodeURIComponent(group.id)}` });
  return actions;
}

// Resolve full known names, never fuzzy tokens. Ambiguous aliases are omitted.
function exactMentionedStudyStructures(question: string) {
  const normalized = ` ${normalizeEvidenceQuery(question.slice(-4000))} `;
  const aliases = new Map<string, AtlasStructure[]>();
  for (const structure of manifest.structures) {
    for (const name of [structure.english, structure.latin, structure.label,
      atlasVietnameseName(structure), atlasShortEnglishName(structure)]) {
      const term = normalizeEvidenceQuery(name ?? "");
      if (term.length < 5 || !normalized.includes(` ${term} `)) continue;
      const entries = aliases.get(term) ?? [];
      if (!entries.some(item => item.id === structure.id)) entries.push(structure);
      aliases.set(term, entries);
    }
  }
  return Array.from(new Map([...aliases]
    .filter(([, structures]) => new Set(structures.map(item => item.english)).size === 1)
    .sort(([a], [b]) => normalized.lastIndexOf(` ${b} `) - normalized.lastIndexOf(` ${a} `))
    .flatMap(([, structures]) => structures.map(structure => [structure.id, structure] as const))).values());
}

/** Exact known name mentions only; a bilateral name may offer both real sides. */
function mentionedStudyActions(question: string) {
  const normalized = ` ${normalizeEvidenceQuery(question.slice(-4000))} `;
  let matches = exactMentionedStudyStructures(question);
  // Shared aliases across different named structures are ambiguous. Never choose
  // an arbitrary structure or side just to provide a navigation action.
  if (new Set(matches.map(item => item.english)).size !== 1) return [];
  // “Có phải ...?” asks a question; “phải” alone is not a side label.
  const left = /\b(ben trai|left)\b/.test(normalized);
  const right = /\b(ben phai|right)\b/.test(normalized);
  if (left !== right) matches = matches.filter(item => item.side === (left ? "left" : "right"));
  const actions = matches.flatMap(item => studyContextActions(resolveStudyContext(item.id)!));
  return Array.from(new Map(actions.map(action => [action.href, action])).values()).slice(0, 4);
}

export function selectedStudyContextBlock(context: StudyContext | null) {
  if (!context) return "NGỮ CẢNH ATLAS: chưa có cấu trúc được chọn hợp lệ. Có thể tiếp tục đối tượng đã được nêu rõ trong hội thoại khi câu hỏi hiện tại là câu nối tiếp; một tên mới được nêu rõ trong câu hỏi hiện tại thay thế chủ đề trước. Không tự đoán cơ hoặc bên. Nếu cả câu hỏi và hội thoại chưa xác định đối tượng, hỏi người dùng chọn hoặc nêu tên cấu trúc.";
  return `CẤU TRÚC ATLAS ĐANG ĐƯỢC CHỌN (metadata catalog do máy chủ xác định)\n${JSON.stringify({
    name: context.name, english: context.english,
    side: context.side === "left" ? "trái" : context.side === "right" ? "phải" : "không phân bên",
    area: context.area,
  })}\nCác câu hỏi ngắn như “chức năng chính?”, “cơ này”, “so sánh nguồn” mặc định nói về cấu trúc và bên đang chọn trong lượt này, kể cả lịch sử nói về cơ khác. Nếu người dùng nêu rõ cấu trúc khác, phân biệt với cơ đang chọn. Không coi tên, nhóm tập hoặc vùng catalog là bằng chứng cho chức năng, giải phẫu chi tiết hay hình học đã xác nhận.`;
}

export function studyAnswerMeta(
  context: StudyContext | null,
  records: readonly EvidenceIndexEntry[],
  papers: readonly PubMedPaper[],
  literatureStatus: string,
  question = "",
): StudyAnswerMeta {
  const sources = records.flatMap(record => record.evidence.sources.map((source, index) => ({
    id: `APP:${record.id}:${index + 1}`, ...source,
  })));
  const checkedAt = new Date().toISOString().slice(0, 10);
  sources.push(...papers.map(paper => ({
    id: `PMID:${paper.pmid}`, title: paper.title, url: paper.url, checkedAt,
    access: paper.abstract?.trim()
      ? "metadata và abstract được truy xuất trong lượt này; chưa có toàn văn"
      : "chỉ metadata/tiêu đề; không có abstract hoặc toàn văn trong lượt này",
  })));
  const actions = context ? studyContextActions(context) : mentionedStudyActions(question);
  const publicNotice = literatureStatus === "error"
    ? "Chưa tra cứu được PubMed trong lượt này."
    : literatureStatus === "no_matches" ? "PubMed chưa trả về bài phù hợp với truy vấn."
    : literatureStatus === "skipped" ? "Lượt này chưa có truy vấn PubMed phù hợp."
    : "PubMed chỉ cung cấp metadata và abstract nếu có; chưa có toàn văn.";
  const comparisonNotice = records.filter(record => record.domain === "structure").length > 1
    ? " Các cơ được nêu rõ trong hội thoại có thêm hồ sơ nguồn từng cơ để so sánh; truy vấn PubMed vẫn chỉ theo cấu trúc đang chọn nếu có." : "";
  return {
    context, actions, sources,
    sourceNotice: `${publicNotice}${context ? ` Truy vấn dùng tên cơ mẹ/cấu trúc catalog: ${studySearchFamily(context)}; kết quả không tự xác nhận chức năng riêng của phần đang chọn hoặc khác biệt giữa hai bên.` : ""}${comparisonNotice} Nguồn được liệt kê để đối chiếu; không phải mọi nguồn đều trả lời từng nhận định. Chỉ tổng hợp phần thực sự được hỗ trợ; nếu thiếu nguồn trực tiếp cho cơ hoặc câu hỏi, nêu rõ giới hạn. Không suy giải phẫu, hướng sợi hay phép đo từ mesh và không biến kiến thức thành chỉ định điều trị cá nhân.`,
  };
}
