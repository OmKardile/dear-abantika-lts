"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MOODS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

export function MoodDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect?: (mood: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
          <Portal>
                  <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md rounded-[28px] glass-sheet p-6"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-label text-text-tertiary">Check in</p>
                <h2 className="text-headline text-text-primary">
                  How are you feeling?
                </h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center text-text-secondary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-caption text-text-secondary mb-5">
              Take a moment. There&apos;s no wrong answer.
            </p>
            <div className="grid grid-cols-5 gap-2.5">
              {MOODS.map((mood, i) => (
                <motion.button
                  key={mood}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 + i * 0.03, type: "spring", stiffness: 400, damping: 18 }}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.12, y: -2 }}
                  onClick={() => {
                    onSelect?.(mood);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "aspect-square rounded-2xl bg-surface-secondary flex items-center justify-center text-3xl border border-border transition-colors hover:border-primary/40"
                  )}
                >
                  {mood}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
          </Portal>
      )}
    </AnimatePresence>
  );
}
