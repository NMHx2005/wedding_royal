"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "danger" | "warning" | "default";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantStyles: Record<
  ConfirmVariant,
  { icon: string; button: string }
> = {
  danger: {
    icon: "bg-red-50 text-red-600",
    button: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  default: {
    icon: "bg-rose-50 text-rose-600",
    button: "bg-rose-600 hover:bg-rose-700 text-white",
  },
};

export function ConfirmDialog({
  open,
  title = "Xác nhận",
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal-backdrop bg-black/40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-modal w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none"
          onPointerDownOutside={(e) => {
            if (loading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (loading) e.preventDefault();
          }}
        >
          <div className="flex gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                styles.icon,
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-semibold text-neutral-900">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {message}
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50",
                styles.button,
              )}
            >
              {loading ? "Đang xử lý..." : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
