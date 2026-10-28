/** Exact-ID educational anatomy. Source comparison does not validate source meshes. */
import { getAnatomyEvidence, GLUTEUS_MEDIUS_IDS } from "./anatomy-evidence.mjs";

export type StructureAnatomySource = {
  id: string;
  title: string;
  url: string;
  checkedAt: string;
  access: string;
  doi?: string;
};

export type StructureAnatomyClaim = {
  id: string;
  label: string;
  text: string;
  sourceIds: readonly string[];
};

export type StructureAnatomyEvidence = {
  id: string;
  structureIds: readonly string[];
  name: string;
  latin: string;
  claims: readonly StructureAnatomyClaim[];
  sources: readonly StructureAnatomySource[];
  literatureCheckedAt: string;
  reviewedBy: null;
  limitations: readonly string[];
  fiberMapping: { status: "unavailable"; reason: string };
  architectureNote?: string;
  architectureSources?: readonly string[];
};

const COMMON_LIMITATIONS = [
  "Nguồn hỗ trợ giải phẫu đại thể phục vụ học tập; không xác nhận tọa độ, hình dạng hay nhãn của từng mesh.",
  "Vùng bám nêu ở mức đại thể, không phải bản đồ điểm bám, hướng bó sợi hay số đo mô của cá nhân.",
  "Nội dung không xác định nguyên nhân đau, chẩn đoán tổn thương hoặc kế hoạch điều trị cá nhân.",
];
const FIBER_MAPPING = {
  status: "unavailable" as const,
  reason: "Chưa có bản đồ hướng sợi được kiểm chứng và ánh xạ lên mesh này.",
};

// Actual access scopes from docs/research/2026-10-28-atlas-individual-muscles.md.
const SOURCES: Readonly<Record<string, StructureAnatomySource>> = {
  openstaxAbdomen: {
    id: "openstaxAbdomen",
    title: "OpenStax Anatomy and Physiology 2e §11.4",
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax",
    checkedAt: "2026-10-28",
    access: "Public HTML: “Muscles of the Abdomen,” Figure 11.16 caption and adjacent prose, plus Table 11.6 for comparison. Use layer relationships; exclude disputed abbreviated attachment entries.",
  },
  openstaxShoulder: {
    id: "openstaxShoulder",
    title: "OpenStax Anatomy and Physiology 2e §11.5",
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs",
    checkedAt: "2026-10-28",
    access: "Public HTML: “Muscles That Move the Humerus,” running text, Figure 11.23 caption, Figure 11.24 alternative text for comparison. Exclude inconsistent alternative-text claims.",
  },
  loyolaExternal: {
    id: "loyolaExternal",
    title: "Loyola LUMEN · External abdominal oblique",
    url: "https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/exab.htm",
    checkedAt: "2026-10-28",
    access: "Full public short entry: origin, insertion, action and nerve.",
  },
  loyolaInternal: {
    id: "loyolaInternal",
    title: "Loyola LUMEN · Internal abdominal oblique",
    url: "https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/inab.htm",
    checkedAt: "2026-10-28",
    access: "Full public short entry: origin, insertion, action and nerve.",
  },
  loyolaTransversus: {
    id: "loyolaTransversus",
    title: "Loyola LUMEN · Transversus abdominis",
    url: "https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/trab.htm",
    checkedAt: "2026-10-28",
    access: "Full public short entry: origin, insertion, action and nerve.",
  },
  loyolaAbdomenTable: {
    id: "loyolaAbdomenTable",
    title: "Loyola · Abdomen Muscle Table",
    url: "https://www.stritch.luc.edu/lumen/meded/grossanatomy/homepage/muscletables/abdomenmuscletable.pdf",
    checkedAt: "2026-10-28",
    access: "Full public one-page PDF, Robert Frysztak, PhD; printed date 2015-07-16. External-oblique, internal-oblique and transversus rows read.",
  },
  loyolaSupraspinatus: {
    id: "loyolaSupraspinatus",
    title: "Loyola LUMEN · Supraspinatus",
    url: "https://www.lumen.luc.edu/lumen/meded/grossanatomy/dissector/muscles/sups.htm",
    checkedAt: "2026-10-28",
    access: "Full public short entry: origin, insertion, action and nerve.",
  },
  loyolaInfraspinatus: {
    id: "loyolaInfraspinatus",
    title: "Loyola LUMEN · Infraspinatus",
    url: "https://www.lumen.luc.edu/lumen/meded/grossanatomy/dissector/muscles/infs.htm",
    checkedAt: "2026-10-28",
    access: "Full public short entry: origin, insertion, action and nerve.",
  },
  loyolaSubscapularis: {
    id: "loyolaSubscapularis",
    title: "Loyola LUMEN · Subscapularis",
    url: "https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/subs.htm",
    checkedAt: "2026-10-28",
    access: "Full public short entry: origin, insertion, action and nerve.",
  },
  loyolaTeresMinor: {
    id: "loyolaTeresMinor",
    title: "Loyola LUMEN · Teres minor",
    url: "https://www.lumen.luc.edu/lumen/meded/grossanatomy/dissector/muscles/tmn.htm",
    checkedAt: "2026-10-28",
    access: "Full public short entry: origin, insertion, action and nerve.",
  },
  ttuhscMuscles: {
    id: "ttuhscMuscles",
    title: "TTUHSC · Medical Gross Anatomy muscle tables",
    url: "https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html",
    checkedAt: "2026-10-28",
    access: "Public HTML: all seven relevant muscle rows and associated notes. University teaching table, not a peer-reviewed clinical study or source-to-mesh validation.",
  },
};

function createRecord(input: {
  id: string;
  structureIds: readonly string[];
  name: string;
  latin: string;
  claims: readonly StructureAnatomyClaim[];
  sourceDifferences: readonly string[];
  comparisonSourceIds?: readonly string[];
}): StructureAnatomyEvidence {
  const { sourceDifferences, comparisonSourceIds = [], ...record } = input;
  const sourceIds = [...new Set([...record.claims.flatMap((claim) => claim.sourceIds), ...comparisonSourceIds])];
  return {
    ...record,
    sources: sourceIds.map((id) => SOURCES[id]),
    literatureCheckedAt: "2026-10-28",
    reviewedBy: null,
    limitations: [...COMMON_LIMITATIONS, ...sourceDifferences],
    fiberMapping: FIBER_MAPPING,
  };
}

/** Seven bilateral families only; this does not upgrade catalog geometry evidence. */
export const STRUCTURE_ANATOMY_EVIDENCE: readonly StructureAnatomyEvidence[] = [
  createRecord({
    id: "internal-oblique",
    structureIds: ["za-6ac590756567", "za-11e8ab43abc3"],
    name: "Cơ chéo bụng trong",
    latin: "Musculus obliquus internus abdominis",
    claims: [
      {
        id: "position",
        label: "Vị trí và lớp",
        text: "Lớp giữa của ba cơ dẹt thành bụng trước bên, nằm sâu hơn cơ chéo bụng ngoài và nông hơn cơ ngang bụng.",
        sourceIds: ["openstaxAbdomen"],
      },
      {
        id: "origin",
        label: "Nguyên ủy",
        text: "Mạc ngực–thắt lưng, phần trước mào chậu và phần ngoài dây chằng bẹn.",
        sourceIds: ["loyolaInternal", "loyolaAbdomenTable"],
      },
      {
        id: "insertion",
        label: "Bám tận",
        text: "Bờ dưới các xương sườn 10–12 và đường trắng; phần dưới góp vào gân kết hợp bám xương mu.",
        sourceIds: ["loyolaAbdomenTable"],
      },
      {
        id: "innervation",
        label: "Thần kinh",
        text: "Các nhánh trước thần kinh ngực dưới và thần kinh thắt lưng thứ nhất, tương ứng T7–L1.",
        sourceIds: ["loyolaAbdomenTable"],
      },
      {
        id: "action",
        label: "Chức năng chính",
        text: "Ép và nâng đỡ tạng bụng; góp phần gấp và xoay thân.",
        sourceIds: ["loyolaAbdomenTable"],
      },
    ],
    comparisonSourceIds: ["ttuhscMuscles"],
    sourceDifferences: [
      "Nguồn khác nhau về phần dây chằng bẹn bám nguyên ủy; mô tả giữ vị trí chung, không gán một tỷ lệ duy nhất. Bám sườn 10–12 theo bảng PDF Loyola; TTUHSC mô tả ba hoặc bốn xương sườn dưới.",
      "Nguồn đã đọc chưa phân biệt rõ chiều xoay cùng bên và đối bên; không gán chiều xoay một bên.",
      "OpenStax §11.4 chỉ hỗ trợ vị trí lớp; không dùng các hàng bám cơ rút gọn trong Bảng 11.6 vì khác các nguồn đại học.",
    ],
  }),
  createRecord({
    id: "external-oblique",
    structureIds: ["za-a37e0a05a2d2", "za-a0399c244657"],
    name: "Cơ chéo bụng ngoài",
    latin: "Musculus obliquus externus abdominis",
    claims: [
      {
        id: "position",
        label: "Vị trí và lớp",
        text: "Lớp nông nhất trong ba cơ dẹt của thành bụng trước bên.",
        sourceIds: ["openstaxAbdomen"],
      },
      {
        id: "origin",
        label: "Nguyên ủy",
        text: "Mặt ngoài các xương sườn 5–12.",
        sourceIds: ["loyolaAbdomenTable"],
      },
      {
        id: "insertion",
        label: "Bám tận",
        text: "Đường trắng, củ mu và nửa trước mào chậu; cân cơ góp phần tạo dây chằng bẹn.",
        sourceIds: ["loyolaAbdomenTable", "ttuhscMuscles"],
      },
      {
        id: "innervation",
        label: "Thần kinh",
        text: "Các nhánh trước thần kinh ngực T7–T12.",
        sourceIds: ["loyolaExternal"],
      },
      {
        id: "action",
        label: "Chức năng chính",
        text: "Nâng đỡ thành bụng, góp phần tăng áp lực trong ổ bụng và hỗ trợ thở ra gắng sức.",
        sourceIds: ["loyolaExternal"],
      },
    ],
    sourceDifferences: [
      "TTUHSC nêu thêm thần kinh chậu–hạ vị và chậu–bẹn; mô tả T7–T12 theo mục riêng và bảng PDF Loyola, không khẳng định đã giải quyết khác biệt này.",
      "Nguồn đã đọc chưa phân biệt rõ chiều xoay cùng bên và đối bên; không gán chiều xoay một bên.",
      "OpenStax §11.4 chỉ hỗ trợ vị trí lớp; không dùng các hàng bám cơ rút gọn trong Bảng 11.6 vì khác các nguồn đại học.",
    ],
  }),
  createRecord({
    id: "transversus-abdominis",
    structureIds: ["za-0f462c8829a0", "za-67d5878d84fa"],
    name: "Cơ ngang bụng",
    latin: "Musculus transversus abdominis",
    claims: [
      {
        id: "position",
        label: "Vị trí và lớp",
        text: "Lớp sâu nhất trong ba cơ dẹt của thành bụng trước bên.",
        sourceIds: ["openstaxAbdomen"],
      },
      {
        id: "origin",
        label: "Nguyên ủy",
        text: "Mặt trong các sụn sườn 7–12, mạc ngực–thắt lưng, mào chậu và phần ngoài dây chằng bẹn.",
        sourceIds: ["loyolaAbdomenTable"],
      },
      {
        id: "insertion",
        label: "Bám tận",
        text: "Qua cân cơ vào bao cơ thẳng bụng; gân kết hợp bám mào mu và lược xương mu.",
        sourceIds: ["loyolaTransversus"],
      },
      {
        id: "innervation",
        label: "Thần kinh",
        text: "Các nhánh trước T7–T12 và thành phần L1.",
        sourceIds: ["loyolaTransversus", "loyolaAbdomenTable"],
      },
      {
        id: "action",
        label: "Chức năng chính",
        text: "Nâng đỡ thành bụng, hỗ trợ thở ra gắng sức và tăng áp lực trong ổ bụng.",
        sourceIds: ["loyolaTransversus"],
      },
    ],
    comparisonSourceIds: ["ttuhscMuscles"],
    sourceDifferences: [
      "Loyola và TTUHSC khác nhau về tỷ lệ mào chậu và dây chằng bẹn; mô tả chỉ giữ các vùng bám chung.",
      "Chức năng theo Loyola; không đưa gấp hoặc nghiêng thân được nêu trong TTUHSC vào mô tả cốt lõi.",
      "OpenStax §11.4 chỉ hỗ trợ vị trí lớp; không dùng các hàng bám cơ rút gọn trong Bảng 11.6 vì khác các nguồn đại học.",
    ],
  }),
  createRecord({
    id: "supraspinatus",
    structureIds: ["za-0425424460a5", "za-01cb75938da6"],
    name: "Cơ trên gai",
    latin: "Musculus supraspinatus",
    claims: [
      {
        id: "position",
        label: "Vị trí và lớp",
        text: "Cơ sâu vùng vai, nằm phía trên gai xương vai và thuộc nhóm chóp xoay.",
        sourceIds: ["openstaxShoulder"],
      },
      {
        id: "origin",
        label: "Nguyên ủy",
        text: "Hố trên gai xương vai.",
        sourceIds: ["loyolaSupraspinatus", "ttuhscMuscles"],
      },
      {
        id: "insertion",
        label: "Bám tận",
        text: "Diện trên của củ lớn xương cánh tay và bao khớp vai.",
        sourceIds: ["loyolaSupraspinatus"],
      },
      {
        id: "innervation",
        label: "Thần kinh",
        text: "Thần kinh trên vai, C5–C6.",
        sourceIds: ["loyolaSupraspinatus"],
      },
      {
        id: "action",
        label: "Chức năng chính",
        text: "Dạng cánh tay và góp phần giữ vững khớp vai.",
        sourceIds: ["loyolaSupraspinatus"],
      },
    ],
    sourceDifferences: [
      "Không dùng mô tả xoay khuỷu trong văn bản thay thế Hình 11.24 OpenStax làm bằng chứng chức năng; dạng cánh tay theo Loyola.",
    ],
  }),
  createRecord({
    id: "infraspinatus",
    structureIds: ["za-87ff24e3a85d", "za-3eade513dbf4"],
    name: "Cơ dưới gai",
    latin: "Musculus infraspinatus",
    claims: [
      {
        id: "position",
        label: "Vị trí và lớp",
        text: "Cơ sâu vùng vai, nằm phía dưới gai xương vai và thuộc nhóm chóp xoay.",
        sourceIds: ["openstaxShoulder"],
      },
      {
        id: "origin",
        label: "Nguyên ủy",
        text: "Hố dưới gai xương vai và các vách sợi giữa cơ.",
        sourceIds: ["loyolaInfraspinatus"],
      },
      {
        id: "insertion",
        label: "Bám tận",
        text: "Diện giữa của củ lớn xương cánh tay và bao khớp vai.",
        sourceIds: ["loyolaInfraspinatus"],
      },
      {
        id: "innervation",
        label: "Thần kinh",
        text: "Thần kinh trên vai, C5–C6.",
        sourceIds: ["loyolaInfraspinatus"],
      },
      {
        id: "action",
        label: "Chức năng chính",
        text: "Xoay ngoài cánh tay và góp phần giữ vững khớp vai.",
        sourceIds: ["loyolaInfraspinatus"],
      },
    ],
    sourceDifferences: [
      "Không dùng mô tả vùng bám không nhất quán trong chú thích Hình 11.23 OpenStax; vùng bám theo mục riêng Loyola.",
    ],
  }),
  createRecord({
    id: "subscapularis",
    structureIds: ["za-84c7d3654da9", "za-bb19dc35992b"],
    name: "Cơ dưới vai",
    latin: "Musculus subscapularis",
    claims: [
      {
        id: "position",
        label: "Vị trí và lớp",
        text: "Cơ sâu ở mặt trước xương vai, thuộc nhóm chóp xoay.",
        sourceIds: ["openstaxShoulder"],
      },
      {
        id: "origin",
        label: "Nguyên ủy",
        text: "Hai phần ba trong của hố dưới vai.",
        sourceIds: ["loyolaSubscapularis"],
      },
      {
        id: "insertion",
        label: "Bám tận",
        text: "Củ bé xương cánh tay và bao khớp vai.",
        sourceIds: ["loyolaSubscapularis"],
      },
      {
        id: "innervation",
        label: "Thần kinh",
        text: "Thần kinh dưới vai trên và dưới, C5–C6.",
        sourceIds: ["loyolaSubscapularis"],
      },
      {
        id: "action",
        label: "Chức năng chính",
        text: "Xoay trong cánh tay và góp phần giữ vững khớp vai.",
        sourceIds: ["loyolaSubscapularis"],
      },
    ],
    comparisonSourceIds: ["ttuhscMuscles"],
    sourceDifferences: [
      "Không đưa động tác duỗi phụ trợ do TTUHSC nêu vào mô tả cốt lõi.",
    ],
  }),
  createRecord({
    id: "teres-minor",
    structureIds: ["za-a9f9cad10f26", "za-fd5c02294b47"],
    name: "Cơ tròn bé",
    latin: "Musculus teres minor",
    claims: [
      {
        id: "position",
        label: "Vị trí và lớp",
        text: "Cơ sâu thuộc nhóm chóp xoay, ở vùng bờ ngoài xương vai, phía trên cơ tròn lớn.",
        sourceIds: ["openstaxShoulder", "loyolaTeresMinor"],
      },
      {
        id: "origin",
        label: "Nguyên ủy",
        text: "Phần giữa bờ ngoài xương vai.",
        sourceIds: ["loyolaTeresMinor"],
      },
      {
        id: "insertion",
        label: "Bám tận",
        text: "Diện dưới của củ lớn xương cánh tay và bao khớp vai.",
        sourceIds: ["loyolaTeresMinor"],
      },
      {
        id: "innervation",
        label: "Thần kinh",
        text: "Thần kinh nách, C5–C6.",
        sourceIds: ["loyolaTeresMinor"],
      },
      {
        id: "action",
        label: "Chức năng chính",
        text: "Xoay ngoài cánh tay và góp phần giữ vững khớp vai.",
        sourceIds: ["loyolaTeresMinor"],
      },
    ],
    sourceDifferences: [
      "Không đưa động tác duỗi phụ trợ do OpenStax nêu vào mô tả cốt lõi.",
    ],
  }),
];

// Adapt, rather than copy, the existing record so its source scopes and dates stay authoritative.
const originalGluteusMedius = getAnatomyEvidence(GLUTEUS_MEDIUS_IDS[0]);
const gluteusMedius: StructureAnatomyEvidence | null = originalGluteusMedius ? {
  id: "gluteus-medius",
  structureIds: GLUTEUS_MEDIUS_IDS,
  name: originalGluteusMedius.name,
  latin: originalGluteusMedius.latin,
  claims: originalGluteusMedius.facts.map(({ sources, ...claim }) => ({ ...claim, sourceIds: sources })),
  sources: Object.entries(originalGluteusMedius.sources).map(([id, { label, ...source }]) => ({ id, title: label, ...source })),
  literatureCheckedAt: originalGluteusMedius.review.literatureCheckedAt,
  reviewedBy: null,
  limitations: COMMON_LIMITATIONS,
  fiberMapping: { status: "unavailable", reason: originalGluteusMedius.fiberMapping.reason },
  architectureNote: originalGluteusMedius.architectureNote,
  architectureSources: originalGluteusMedius.architectureSources,
} : null;

const byStructureId = new Map<string, StructureAnatomyEvidence>();
/** One educational record per family, including the preserved original adapter. */
export const STRUCTURE_ANATOMY_FAMILIES: readonly StructureAnatomyEvidence[] = [
  ...STRUCTURE_ANATOMY_EVIDENCE,
  ...(gluteusMedius ? [gluteusMedius] : []),
];
for (const record of STRUCTURE_ANATOMY_FAMILIES) {
  for (const id of record.structureIds) byStructureId.set(id, record);
}

/** Unknown, regional and other muscle IDs never inherit a family record. */
export function getStructureAnatomyEvidence(id: string | null | undefined): StructureAnatomyEvidence | null {
  return id ? byStructureId.get(id) ?? null : null;
}
