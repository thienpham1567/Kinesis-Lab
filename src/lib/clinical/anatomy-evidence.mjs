/** Source-linked educational facts. Literature checking is not independent clinical review. */
const GLUTEUS_MEDIUS = {
  name: "Cơ mông nhỡ",
  latin: "Musculus gluteus medius",
  review: { literatureCheckedAt: "2026-10-19", clinician: null },
  fiberMapping: {
    status: "unavailable",
    reason: "Chưa có bản đồ hướng sợi được kiểm chứng và ánh xạ lên mesh này.",
  },
  facts: [
    {
      id: "origin",
      label: "Nguyên ủy",
      text: "Mặt ngoài cánh chậu, giữa đường mông trước và đường mông sau.",
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
      sources: ["uw", "nerve"],
    },
    {
      id: "action",
      label: "Chức năng chính",
      text: "Dạng đùi tại khớp háng; góp phần giữ vững khung chậu khi trụ một chân.",
      sources: ["mcgraw", "uw"],
    },
  ],
  architectureNote:
    "Các nghiên cứu mô tả phân vùng cơ và cấu trúc gân theo những tiêu chí khác nhau. Chưa thể suy ra đường đi sợi cơ hoặc ranh giới các phần này chỉ từ bề mặt mesh.",
  architectureSources: ["flack", "tsutsumi"],
  sources: {
    mcgraw: {
      label: "McGraw Hill · Gross Anatomy, 2e · Bảng 35-1",
      url: "https://accessmedicine.mhmedical.com/Content.aspx?bookid=2478&sectionid=202021783",
      access: "Public chapter/table excerpt",
    },
    uw: {
      label: "University of Washington · Muscle Atlas",
      url: "https://rad.uw.edu/muscle-atlas/gluteus-medius",
      access: "Public anatomy reference text; no illustrations redistributed",
    },
    nerve: {
      label: "StatPearls · Superior Gluteal Nerve (2023)",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK535408/",
      access: "Public introduction and structure/function",
    },
    flack: {
      label: "Flack và cs. · Clinical Anatomy (2014)",
      url: "https://pubmed.ncbi.nlm.nih.gov/23625344/",
      doi: "10.1002/ca.22248",
      access:
        "Abstract; reports dissection of gluteal regions from 12 cadavers; not a source-to-mesh fiber map",
    },
    tsutsumi: {
      label: "Tsutsumi và cs. · JBJS (2019)",
      url: "https://pubmed.ncbi.nlm.nih.gov/30653048/",
      doi: "10.2106/JBJS.18.00602",
      access:
        "Abstract; 25 hips from 15 cadavers; not patient-specific measurements",
    },
  },
};
export const GLUTEUS_MEDIUS_IDS = ["za-98cfd2e47395", "za-cc11824f98a0"];
/** @param {string|null|undefined} id */
export function getAnatomyEvidence(id) {
  return id && GLUTEUS_MEDIUS_IDS.includes(id) ? GLUTEUS_MEDIUS : null;
}
