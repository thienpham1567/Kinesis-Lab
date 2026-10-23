import { ClinicalEvidencePanel } from "@/components/ClinicalEvidencePanel";
import { RegionFoundations } from "@/components/RegionFoundations";
import {
  ANATOMY_REGIONS,
  type AnatomyRegionId,
  type MuscleStructure,
} from "@/lib/clinical/anatomy-atlas";
import { ANATOMY_REGION_EVIDENCE } from "@/lib/clinical/evidence-anatomy";

// Từ chỉ định ("longus", "lateralis"...) đứng riêng sau dấu phẩy/& trong tên Latin của thẻ;
// chúng kế thừa từ đầu của cụm trước, không được khớp một mình.
const MODIFIER_TERMS = new Set([
  "longus", "brevis", "lateralis", "medialis", "anterius", "posterius",
  "medius", "minimus", "intermedius", "internus", "externus", "major", "minor",
]);

function normalize(text: string) {
  return text.toLowerCase().replace(/\bmusculus\s+/g, "").replace(/\s+/g, " ").trim();
}

/** Các cụm Latin riêng lẻ của một thẻ, ví dụ "Meniscus medialis & lateralis" -> meniscus medialis, meniscus lateralis. */
function latinTerms(latin: string) {
  const terms: string[] = [];
  let lead = "";
  for (const raw of latin.split(/[&,+()]/)) {
    const term = normalize(raw);
    if (!term) continue;
    const words = term.split(" ");
    if (words.length === 1 && MODIFIER_TERMS.has(term)) {
      if (lead) terms.push(`${lead} ${term}`);
    } else {
      terms.push(term);
      lead = words[0];
    }
  }
  return terms.filter((term) => term.includes(" ") || term.length >= 6);
}

/**
 * Thẻ cấu trúc của vùng trùng tên với mesh đang chọn, theo cụm Latin của thẻ
 * (so khớp nguyên từ, không phân biệt hoa thường). Không chắc chắn thì trả null.
 */
export function findStructureForMesh(
  structures: MuscleStructure[],
  mesh: { english?: string | null; latin?: string | null },
) {
  const names = [mesh.english, mesh.latin]
    .filter(Boolean)
    .map((name) => normalize(name as string));
  if (!names.length) return null;
  return (
    structures.find((structure) =>
      latinTerms(structure.latin).some((term) =>
        names.some((name) => new RegExp(`(^|[^a-z])${term}([^a-z]|$)`).test(name)),
      ),
    ) ?? null
  );
}

export function RegionKnowledgePanel({
  regionId,
  meshEnglish,
  meshLatin,
}: {
  regionId: AnatomyRegionId;
  meshEnglish?: string | null;
  meshLatin?: string | null;
}) {
  const region = ANATOMY_REGIONS.find((entry) => entry.id === regionId);
  if (!region) return null;
  const matched = findStructureForMesh(region.structures, {
    english: meshEnglish,
    latin: meshLatin,
  });
  const structures = matched
    ? [matched, ...region.structures.filter((structure) => structure !== matched)]
    : region.structures;
  return (
    <div className="space-y-3 border-t border-rule pt-3">
      <RegionFoundations regionId={region.id} regionName={region.name} />
      <div className="space-y-2">
        <h3 className="font-display text-sm font-bold text-ink">
          Cấu trúc giải phẫu của vùng
        </h3>
        <div className="space-y-2">
          {structures.map((structure) => (
            <div
              key={structure.name}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs leading-5"
            >
              {structure === matched && (
                <p className="mb-1 font-semibold text-cobalt">Cấu trúc đang chọn</p>
              )}
              <p className="font-display font-bold text-ink">{structure.name}</p>
              <p className="font-mono text-cobalt">{structure.latin}</p>
              <p className="mt-1.5 text-slate">
                <strong className="text-ink">Vị trí / điểm bám:</strong>{" "}
                {structure.originInsertion}
              </p>
              <p className="mt-1 text-slate">
                <strong className="text-ink">Chức năng:</strong> {structure.action}
              </p>
            </div>
          ))}
        </div>
      </div>
      <ClinicalEvidencePanel evidence={ANATOMY_REGION_EVIDENCE[region.id]} />
    </div>
  );
}
