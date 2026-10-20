export type RenderQuality = "auto" | "fast" | "detailed";
export type ResolvedRenderQuality = Exclude<RenderQuality, "auto">;

export function resolveRenderQuality(
  requested: RenderQuality,
  device: { width: number; coarsePointer: boolean },
): ResolvedRenderQuality {
  if (requested !== "auto") return requested;
  return device.width <= 720 || device.coarsePointer ? "fast" : "detailed";
}

export function shouldUseOcclusion(
  quality: ResolvedRenderQuality,
  visibleMuscles: boolean,
  muscleOpacity: number,
) {
  return quality === "detailed" && (!visibleMuscles || muscleOpacity >= 1);
}

export type AtlasPresentation = "light" | "dark";

export function presentationBackground(presentation?: AtlasPresentation) {
  return presentation === "dark" ? 0x17242c : 0xeeefeb;
}
