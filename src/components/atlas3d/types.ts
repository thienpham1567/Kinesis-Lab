import type { RenderQuality } from "./render-policy";
import type { AtlasLayer, AtlasStructure } from "@/lib/clinical/atlas-3d";

export type CameraCommand = {
  type: "front" | "back" | "left" | "right" | "focus" | "reset";
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
  muscleOpacity: number;
  quality: RenderQuality;
  command: CameraCommand;
  onSelect: (id: string) => void;
};
