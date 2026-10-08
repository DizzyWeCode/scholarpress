"use client";

import { useEffect, useState } from "react";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  requireTypedConfirm = false,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireTypedConfirm?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  const canConfirm = !requireTypedConfirm || typed.trim().toUpperCase() === "DELETE";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-5"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md border border-line bg-paper p-6 shadow-xl"
        style={{ borderRadius: 7 }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-serif text-2xl tracking-tight text-ink">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-3">{body}</p>
        {requireTypedConfirm ? (
          <div className="mt-4">
            <label htmlFor="typed-confirm" className="text-xs font-medium text-ink">
              Type DELETE to confirm
            </label>
            <input
              id="typed-confirm"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-red-700"
            />
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="border border-line px-4 py-2 text-sm text-ink hover:border-ink disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy || !canConfirm}
            className={`px-4 py-2 text-sm text-paper disabled:opacity-50 ${
              danger ? "bg-red-700 hover:bg-red-800" : "bg-ink hover:opacity-80"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
