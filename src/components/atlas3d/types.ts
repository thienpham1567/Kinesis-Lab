import type { RenderQuality } from "./render-policy";
import type { AtlasLayer, AtlasStructure } from "@/lib/clinical/atlas-3d";
import type { StudyStatus } from "./tissue-study-resources";

export type CameraCommand = {
  type:
    "front" | "back" | "left" | "right" | "focus" | "reset" | "hip" | "muscle";
  revision: number;
};
export type AtlasCanvasProps = {
  bundleUrl: string;
  structures: AtlasStructure[];
  layers: Record<AtlasLayer, boolean>;
  hiddenIds: ReadonlySet<string>;
  isolatedId: string | null;
  selectedId: string | null;
  thicknessId: string | null;
  materialStudy: boolean;
  studyRetry: number;
  onStudyStatus: (status: StudyStatus) => void;
  muscleOpacity: number;
  quality: RenderQuality;
  command: CameraCommand;
  onSelect: (id: string) => void;
};
