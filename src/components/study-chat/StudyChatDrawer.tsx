"use client";

import { useLayoutEffect, type ReactNode, type RefObject } from "react";

export function StudyChatDrawer({
  open,
  onOpenChange,
  onEscape,
  panelRef,
  launcherRef,
  composerRef,
  titleId,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEscape: () => void;
  panelRef: RefObject<HTMLDialogElement | null>;
  launcherRef: RefObject<HTMLButtonElement | null>;
  composerRef: RefObject<HTMLTextAreaElement | null>;
  titleId: string;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    const drawer = panelRef.current;
    if (!drawer) return;
    const desktop = window.matchMedia("(min-width: 1280px)");
    const sync = () => {
      const modal = !desktop.matches;
      const focused = document.activeElement;
      const switching =
        open && drawer.open && drawer.matches(":modal") !== modal;
      if (switching || (!open && drawer.open)) drawer.close();
      if (open && !drawer.open) {
        drawer.setAttribute("aria-modal", String(modal));
        if (modal) drawer.showModal();
        else drawer.show();
        // Preserve a focused control when crossing the responsive breakpoint.
        // Mobile initially focuses the heading rather than opening its keyboard.
        const target =
          switching &&
          focused instanceof HTMLElement &&
          drawer.contains(focused)
            ? focused
            : desktop.matches
              ? composerRef.current
              : drawer.querySelector<HTMLElement>("[data-drawer-heading]");
        (target ?? drawer.querySelector<HTMLElement>("button, input"))?.focus({
          preventScroll: true,
        });
      } else if (
        !open &&
        focused instanceof HTMLElement &&
        drawer.contains(focused)
      ) {
        launcherRef.current?.focus({ preventScroll: true });
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (
        !open ||
        !desktop.matches ||
        event.defaultPrevented ||
        event.isComposing ||
        event.key !== "Escape" ||
        document.querySelector("dialog:modal") ||
        [...document.querySelectorAll('[role="menu"]')].some(
          (menu) => !drawer.contains(menu) && menu.getClientRects().length > 0,
        )
      )
        return;
      event.preventDefault();
      onEscape();
    };
    sync();
    desktop.addEventListener("change", sync);
    document.addEventListener("keydown", onKey);
    return () => {
      desktop.removeEventListener("change", sync);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onEscape, panelRef, launcherRef, composerRef]);

  return (
    <dialog
      ref={panelRef}
      id="study-assistant-drawer"
      aria-labelledby={titleId}
      inert={!open}
      className="study-drawer"
      onKeyDown={(event) => {
        if (event.key !== "Tab" || !event.currentTarget.matches(":modal"))
          return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), summary, a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          ),
        ].filter(
          (control) =>
            control.getClientRects().length > 0 && !control.closest("[inert]"),
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (!first || !last) return;
        const focused = document.activeElement;
        if (
          event.shiftKey &&
          (focused === first ||
            focused === event.currentTarget ||
            focused?.hasAttribute("data-drawer-heading"))
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && focused === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onEscape();
      }}
      onClose={(event) => {
        // close() followed by show/showModal during a breakpoint switch queues
        // a close event too; it must not dismiss the newly opened presentation.
        if (!event.currentTarget.open) onOpenChange(false);
      }}
      onClick={(event) => {
        if (
          event.target !== event.currentTarget ||
          !event.currentTarget.matches(":modal")
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onOpenChange(false);
      }}
    >
      {children}
    </dialog>
  );
}
