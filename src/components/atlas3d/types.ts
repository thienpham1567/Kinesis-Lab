import type { AtlasPresentation, RenderQuality } from "./render-policy";
import type { AtlasLayer, AtlasStructure } from "@/lib/clinical/atlas-3d";
import type { StudyStatus } from "./tissue-study-resources";

export type CameraCommand = {
  type:
    | "front"
    | "front-oblique"
    | "back-oblique"
    | "back"
    | "left"
    | "right"
    | "focus"
    | "reset"
    | "hip"
    | "muscle"
    | "detail";
  revision: number;
};
export type AtlasCanvasProps = {
  bundleUrl: string;
  structures: AtlasStructure[];
  layers: Record<AtlasLayer, boolean>;
  hiddenIds: ReadonlySet<string>;
  frameIds?: ReadonlySet<string>;
  isolatedId: string | null;
  selectedId: string | null;
  thicknessId: string | null;
  materialStudy: boolean;
  showSurfaceLabels: boolean;
  studyRetry: number;
  onStudyStatus: (status: StudyStatus) => void;
  muscleOpacity: number;
  quality: RenderQuality;
  presentation?: AtlasPresentation;
  projection?: "perspective" | "orthographic";
  learningMode?: boolean;
  showStructureLabels?: boolean;
  command: CameraCommand;
  onSelect: (id: string) => void;
};
