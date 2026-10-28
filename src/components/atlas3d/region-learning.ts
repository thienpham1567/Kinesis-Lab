import type { AnatomyRegionId } from "@/lib/clinical/anatomy-atlas";
import type {
  AtlasArea,
  AtlasLayer,
  AtlasStructure,
} from "@/lib/clinical/atlas-3d";
import { atlasStructureName } from "@/lib/clinical/atlas-names";
import type { CameraCommand } from "./types";

type LearningRegion = {
  regions: AnatomyRegionId[];
  example: string;
  scope?: string;
};

/** Reading groupings, not a claim that the bundles are validated anatomical cuts. */
export const LEARNING_REGIONS: Record<AtlasArea, LearningRegion> = {
  full: {
    regions: [
      "cervical",
      "shoulder",
      "thoracic_core",
      "lumbar",
      "hip_pelvis",
      "thigh_hamstring",
      "knee",
      "ankle_foot",
    ],
    example: "Gluteus medius muscle",
  },
  neck: { regions: ["cervical"], example: "Sternocleidomastoid muscle" },
  upper: {
    regions: ["shoulder"],
    example: "Supraspinatus muscle",
    scope:
      "Kiến thức nền tại đây tập trung vào vai. Tên và hình học cánh tay, cẳng tay, bàn tay vẫn theo danh mục mô hình; nguồn vai không xác nhận toàn bộ các cấu trúc đó.",
  },
  trunk: {
    regions: ["thoracic_core", "lumbar"],
    example: "Rectus abdominis muscle",
  },
  hip: { regions: ["hip_pelvis"], example: "Gluteus medius muscle" },
  lower: {
    regions: ["thigh_hamstring", "knee", "ankle_foot"],
    example: "Tibialis anterior muscle",
  },
};

export function atlasAreaHref(currentHref: string, area: AtlasArea): string {
  const url = new URL(currentHref);
  url.pathname = "/atlas";
  url.searchParams.set("tab", "3d");
  url.searchParams.set("area", area);
  for (const key of ["structure", "group", "exercise"])
    url.searchParams.delete(key);
  url.hash = "atlas-learning-studio";
  return `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
}

export type LearningStep = {
  id: string;
  title: string;
  short: string;
  instruction: string;
  layers: Record<AtlasLayer, boolean>;
  camera: CameraCommand["type"];
  structureId?: string;
};

/** Authored UI viewing steps; no clinical protocol or superficial/deep segmentation. */
export function regionLearningSteps(
  area: AtlasArea,
  structures: AtlasStructure[],
): LearningStep[] {
  const candidates = structures.filter(
    (s) =>
      s.english === LEARNING_REGIONS[area].example &&
      (area === "full" || s.areas.includes(area)),
  );
  const example = candidates.find((s) => s.side === "left") ?? candidates[0];
  const layers = { bone: true, muscle: true, joint: false };
  return [
    {
      id: "overview",
      title: "Nhìn toàn cảnh",
      short: "Toàn cảnh",
      instruction:
        "Xoay mô hình để định hướng. Chọn một cấu trúc trên hình hoặc trong danh mục để xem tên Việt và tên Anh từ nguồn.",
      layers,
      camera: "front-oblique",
    },
    {
      id: "bones",
      title: "Quan sát hệ xương",
      short: "Hệ xương",
      instruction:
        "Đã tắt nhóm Hệ cơ–gân và Khớp & dây chằng. Hệ xương là nhóm hiển thị của nguồn, không phải kết luận về loại mô của mọi cấu trúc trong nhóm. Dùng Trước / Sau để đổi hướng quan sát.",
      layers: { bone: true, muscle: false, joint: false },
      camera: "front-oblique",
    },
    {
      id: "muscles",
      title: "Thêm hệ cơ–gân",
      short: "Hệ cơ–gân",
      instruction:
        "Nhóm Hệ cơ–gân được hiện cùng Hệ xương. Đây là các nhóm hiển thị của mô hình nguồn; không phải phân lớp mô học hay nông–sâu đã được xác minh.",
      layers,
      camera: "back-oblique",
    },
    {
      id: "focus",
      title: example
        ? `Quan sát ${atlasStructureName(example)}`
        : "Chọn một cấu trúc trong danh mục",
      short: "Một cấu trúc",
      instruction: example
        ? "Cấu trúc mẫu được tách riêng để quan sát. Mở Kiến thức để đọc thông tin hiện có và Nguồn để xem phạm vi đối chiếu; tên mô hình không đồng nghĩa có kiến thức riêng cho từng mesh."
        : "Mẫu quan sát chưa có trong danh mục này. Chọn một cấu trúc ở tab Cấu trúc để tìm hiểu.",
      layers,
      camera: example ? "focus" : "reset",
      structureId: example?.id,
    },
    {
      id: "check",
      title: "Dừng lại và tự kiểm tra",
      short: "Tự kiểm tra",
      instruction:
        "Quay về toàn cảnh. Thử giải thích sự khác nhau giữa thao tác ẩn một lớp và việc xác nhận cấu trúc giải phẫu bằng tài liệu.",
      layers,
      camera: "front-oblique",
    },
  ];
}
