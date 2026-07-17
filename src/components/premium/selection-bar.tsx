"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Archive, X, CheckSquare } from "lucide-react";

interface Props {
  selectedCount: number;
  onCancel: () => void;
  onDelete: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
  onSelectAll?: () => void;
  total?: number;
}

export function SelectionBar({
  selectedCount,
  onCancel,
  onDelete,
  onArchive,
  onSelectAll,
  total,
}: Props) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          className="fixed inset-x-0 top-0 z-[90] px-3 pt-3 pb-safe"
        >
          <div className="mx-auto max-w-md rounded-[22px] surface-elevated shadow-lifted p-2 flex items-center gap-1.5">
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-text-secondary hover:bg-surface-secondary"
              aria-label="Cancel selection"
            >
              <X size={20} />
            </button>
            <div className="flex-1 min-w-0 px-1">
              <p className="text-sm font-bold text-text-primary">
                {selectedCount} selected
              </p>
              {onSelectAll && total !== undefined && total > selectedCount && (
                <button
                  onClick={onSelectAll}
                  className="text-caption text-primary font-semibold flex items-center gap-1"
                >
                  <CheckSquare size={12} />
                  Select all {total}
                </button>
              )}
            </div>
            {onArchive && (
              <button
                onClick={() => onArchive([])}
                className="h-10 px-3 rounded-2xl flex items-center gap-1.5 text-sm font-semibold text-text-primary bg-surface-secondary"
              >
                <Archive size={16} />
                <span className="hidden sm:inline">Archive</span>
              </button>
            )}
            <button
              onClick={() => onDelete([])}
              className="h-10 px-3 rounded-2xl flex items-center gap-1.5 text-sm font-bold text-white bg-error"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
