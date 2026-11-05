import type { AnatomyRegionId } from "@/lib/clinical/anatomy-atlas";
import type {
  AtlasArea,
  AtlasLayer,
  AtlasStructure,
} from "@/lib/clinical/atlas-3d";
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
    scope:
      "Kiến thức nền áp dụng cho các vùng được liệt kê bên dưới. Phần đầu & mặt hiện phục vụ tra cứu tên và hình học theo danh mục mô hình nguồn; chưa có thẻ kiến thức lâm sàng riêng.",
  },
  head: {
    regions: [],
    example: "Mandible",
    scope:
      "Tên và hình học vùng đầu theo danh mục mô hình nguồn. Vùng này phục vụ tra cứu cấu trúc; kiến thức lâm sàng riêng cho đầu & mặt chưa được bổ sung. Nguồn tên gọi và nguồn mô hình nằm trong mục Nguồn.",
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
  _area: AtlasArea,
  _structures: AtlasStructure[],
): LearningStep[] {
  const layers = { bone: true, muscle: true, joint: false };
  return [
    {
      id: "overview",
      title: "Nhìn toàn cảnh",
      short: "Toàn cảnh",
      instruction: "Xoay mô hình rồi chọn một cấu trúc để đọc tên Việt / Anh.",
      layers,
      camera: "front-oblique",
    },
    {
      id: "bones",
      title: "Quan sát hệ xương",
      short: "Hệ xương",
      instruction: "Chỉ hiện nhóm xương của nguồn, không kết luận loại mô.",
      layers: { bone: true, muscle: false, joint: false },
      camera: "front-oblique",
    },
    {
      id: "muscles",
      title: "Thêm hệ cơ–gân",
      short: "Hệ cơ–gân",
      instruction: "Hiện nhóm cơ–gân của nguồn cùng xương.",
      layers,
      camera: "back-oblique",
    },
  ];
}
