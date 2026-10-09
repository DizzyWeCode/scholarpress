"use client";

import { useEffect, useId, useRef } from "react";
import type { RefObject, ReactNode } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  title,
  onClose,
  children,
  initialFocusRef,
  returnFocusRef,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement>;
  returnFocusRef?: RefObject<HTMLElement>;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) (returnFocusRef?.current ?? previousFocus.current)?.focus();
      wasOpen.current = false;
      return;
    }
    if (!wasOpen.current && document.activeElement instanceof HTMLElement) {
      previousFocus.current = document.activeElement;
    }
    wasOpen.current = true;
    const focusTarget = initialFocusRef?.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    focusTarget?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [initialFocusRef, onClose, open, returnFocusRef]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-ink/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mx-auto my-10 w-full max-w-lg border border-line bg-paper p-6 shadow-xl"
        style={{ borderRadius: 7 }}
      >
        <h2 id={titleId} className="font-serif text-2xl tracking-tight text-ink">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
