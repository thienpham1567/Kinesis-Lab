"use client";

import { useRef, useState } from "react";
import type { TeachingView } from "@/lib/training/teaching-view";
import { TeachingDialog } from "./TeachingDialog";

export function TeachingLaunchButton({
  getView,
  children,
  disabled = false,
}: {
  getView: () => TeachingView | null;
  children: string;
  disabled?: boolean;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [presentation, setPresentation] = useState<{
    view: TeachingView;
    root: HTMLElement;
  } | null>(null);
  return (
    <>
      <button
        ref={trigger}
        className="button-secondary"
        type="button"
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={(event) => {
          const view = getView();
          if (view)
            setPresentation({
              view,
              root: event.currentTarget.ownerDocument.body,
            });
        }}
      >
        {children}
      </button>
      {presentation && (
        <TeachingDialog
          initialView={presentation.view}
          portalRoot={presentation.root}
          onClose={() => {
            setPresentation(null);
            trigger.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </>
  );
}
