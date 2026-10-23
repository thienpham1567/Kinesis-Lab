"use client";
import { useImageComposer, type ComposerProps } from "./useImageComposer";
import { ImageControls } from "./ImageControls";
import { ImagePreview } from "./ImagePreview";
export function ImageGenerator(props: ComposerProps) {
  const composer = useImageComposer(props);
  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.3fr)]">
      <ImageControls composer={composer} />
      <ImagePreview composer={composer} />
    </div>
  );
}
