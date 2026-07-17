"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Archive, ArchiveRestore } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  icon?: "delete" | "archive" | "restore";
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  icon = "delete",
  onConfirm,
}: Props) {
  const Icon =
    icon === "archive" ? Archive : icon === "restore" ? ArchiveRestore : Trash2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="relative w-full max-w-sm rounded-[28px] glass-sheet p-6 text-center"
          >
            <div
              className={
                "mx-auto w-14 h-14 rounded-3xl flex items-center justify-center mb-4 " +
                (variant === "destructive"
                  ? "bg-error/12"
                  : "bg-surface-secondary")
              }
            >
              <Icon
                size={26}
                className={variant === "destructive" ? "text-error" : "text-primary"}
              />
            </div>
            <h2 className="text-headline text-text-primary mb-1.5">{title}</h2>
            {description && (
              <p className="text-body text-text-secondary leading-relaxed mb-6">
                {description}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className={
                  "flex-1 py-3 rounded-2xl text-sm font-bold shadow-glow " +
                  (variant === "destructive"
                    ? "bg-error text-white"
                    : "gradient-primary-bg text-primary-foreground")
                }
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
