"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Check } from "lucide-react";
import { SORT_LABELS, type SortOption } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL_OPTIONS = Object.keys(SORT_LABELS) as SortOption[];

export function SortMenu({
  value,
  onChange,
  options = ALL_OPTIONS,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
  options?: SortOption[];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface border border-border text-sm font-semibold text-text-secondary"
      >
        <ArrowDownUp size={14} />
        <span className="hidden sm:inline">{SORT_LABELS[value]}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-11 z-50 w-48 rounded-2xl surface-elevated shadow-lifted p-1.5"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-left",
                    value === opt
                      ? "text-primary bg-surface-secondary"
                      : "text-text-secondary hover:bg-surface-secondary"
                  )}
                >
                  {SORT_LABELS[opt]}
                  {value === opt && <Check size={15} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
