/** Source-linked educational facts. Literature checking is not independent clinical review. */
const GLUTEUS_MEDIUS = {
  name: "Cơ mông nhỡ",
  latin: "Musculus gluteus medius",
  review: { literatureCheckedAt: "2026-10-22", clinician: null },
  fiberMapping: {
    status: "unavailable",
    reason: "Chưa có bản đồ hướng sợi được kiểm chứng và ánh xạ lên mesh này.",
  },
  facts: [
    {
      id: "origin",
      label: "Nguyên ủy",
      text: "Vùng bám xương đại thể: mặt ngoài cánh chậu giữa đường mông trước và sau; không phải toàn bộ bản đồ nguyên ủy cân–xương.",
      sources: ["mcgraw"],
    },
    {
      id: "insertion",
      label: "Bám tận",
      text: "Mấu chuyển lớn xương đùi; vùng bám gồm mặt ngoài và phần trên sau.",
      sources: ["uw", "tsutsumi"],
    },
    {
      id: "innervation",
      label: "Thần kinh",
      text: "Thần kinh mông trên, từ các rễ L4, L5 và S1.",
      sources: ["uw"],
    },
    {
      id: "action",
      label: "Chức năng chính",
      text: "Dạng đùi tại khớp háng; góp phần giữ vững khung chậu khi trụ một chân.",
      sources: ["mcgraw", "uw"],
    },
  ],
  architectureNote:
    "Flack mô tả bốn khoang theo cấu trúc và thần kinh; Tsutsumi phân biệt hai phần gân theo vùng bám. Hai cách chia này khác tiêu chí, không phải những phân vùng tương đương hoặc bản đồ hướng sợi trên mesh.",
  architectureSources: ["flack", "tsutsumi"],
  sources: {
    mcgraw: {
      label: "McGraw Hill · Gross Anatomy, 2e · Bảng 35-1",
      url: "https://accessmedicine.mhmedical.com/Content.aspx?bookid=2478&sectionid=202021783",
      checkedAt: "2026-10-22",
      access: "Publisher-indexed public Table 35-1 excerpt rechecked; direct page returned 403. Gross attachments/action only; no complete chapter access claimed.",
    },
    uw: {
      label: "University of Washington · Muscle Atlas",
      url: "https://rad.uw.edu/muscle-atlas/gluteus-medius",
      checkedAt: "2026-10-22",
      access: "Full public entry: origin, insertion, action and innervation rechecked. Page displays ‘This is unpublished’; university teaching reference, not a peer-reviewed paper. No illustrations redistributed.",
    },
    flack: {
      label: "Flack và cs. · Clinical Anatomy (2014)",
      url: "https://pubmed.ncbi.nlm.nih.gov/23625344/",
      doi: "10.1002/ca.22248",
      checkedAt: "2026-10-22",
      access:
        "PubMed-indexed abstract rechecked; direct PubMed open was unavailable. Dissection of 12 cadavers, four architecture/innervation compartments; no full-text or source-to-mesh fiber-map claim.",
    },
    tsutsumi: {
      label: "Tsutsumi và cs. · JBJS (2019)",
      url: "https://pubmed.ncbi.nlm.nih.gov/30653048/",
      doi: "10.2106/JBJS.18.00602",
      checkedAt: "2026-10-22",
      access:
        "PubMed-indexed abstract rechecked; direct PubMed open was unavailable. Twenty-five hips from 15 Japanese cadavers; two tendon parts and lateral/superoposterior facets. No full-text access or patient-specific measurements claimed.",
    },
  },
};
export const GLUTEUS_MEDIUS_IDS = ["za-98cfd2e47395", "za-cc11824f98a0"];
/** @param {string|null|undefined} id */
export function getAnatomyEvidence(id) {
  return id && GLUTEUS_MEDIUS_IDS.includes(id) ? GLUTEUS_MEDIUS : null;
}
