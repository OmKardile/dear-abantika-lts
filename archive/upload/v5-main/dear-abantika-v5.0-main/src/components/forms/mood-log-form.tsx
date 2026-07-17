"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { MOODS, type MoodLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: MoodLog;
  onSave: (mood: string, note?: string) => void;
  onDelete?: (id: string) => void;
}

export function MoodLogForm({
  open,
  onOpenChange,
  existing,
  onSave,
  onDelete,
}: Props) {
  const [mood, setMood] = React.useState<string>(MOODS[0]);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setMood(existing?.mood ?? MOODS[0]);
      setNote(existing?.note ?? "");
    }
  }, [open, existing]);

  const save = () => {
    onSave(mood, note.trim() || undefined);
    onOpenChange(false);
  };

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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative w-full max-w-md max-h-[94dvh] overflow-y-auto no-scrollbar rounded-[32px] glass-sheet"
          >
            <div className="sticky top-0 z-10 pt-3 pb-3 px-6 bg-transparent backdrop-blur-md border-b border-white/10">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-border mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label text-text-tertiary">
                    {existing ? "Edit mood" : "Check in"}
                  </p>
                  <h2 className="text-headline text-text-primary">
                    How are you feeling?
                  </h2>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"
                  aria-label="Close"
                >
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Mood grid */}
              <div>
                <p className="text-label text-text-tertiary mb-2.5">
                  Pick a mood
                </p>
                <div className="grid grid-cols-5 gap-2.5">
                  {MOODS.map((m, i) => {
                    const active = mood === m;
                    return (
                      <motion.button
                        key={m}
                        type="button"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.04 + i * 0.025,
                          type: "spring",
                          stiffness: 400,
                          damping: 18,
                        }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setMood(m)}
                        aria-pressed={active}
                        aria-label={`Mood ${m}`}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center text-3xl border-2 transition-all",
                          active
                            ? "border-primary bg-surface shadow-glow scale-105"
                            : "border-border bg-surface-secondary"
                        )}
                      >
                        <span className={cn(!active && "opacity-80")}>{m}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-label text-text-tertiary mb-2">
                  Note <span className="text-text-tertiary/70">(optional)</span>
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="A small note about this moment…"
                  className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-label text-text-tertiary tabular-nums">
                    {note.length}/300
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 bg-transparent backdrop-blur-md border-t border-white/10 flex gap-3">
              {existing && onDelete && (
                <button
                  onClick={() => {
                    onDelete(existing.id);
                    onOpenChange(false);
                  }}
                  className="px-4 py-3.5 rounded-2xl border border-error/30 text-error flex items-center gap-1.5 text-sm font-semibold"
                  aria-label="Delete mood log"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={save}
                className="flex-1 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
              >
                {existing ? "Save changes" : "Log mood"}
              </button>
            </div>
          </motion.div>
        </motion.div>
          </Portal>
      )}
    </AnimatePresence>
  );
}

export type { MoodLog };
