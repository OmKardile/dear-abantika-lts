"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import {
  REMINDER_CATEGORIES,
  WEEKDAY_LABELS,
  type Reminder,
  type ReminderCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Reminder;
  onSave: (r: Omit<Reminder, "id">) => void;
  onDelete?: (id: string) => void;
}

export function ReminderForm({ open, onOpenChange, existing, onSave, onDelete }: Props) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ReminderCategory>("medication");
  const [time, setTime] = React.useState("08:00");
  const [days, setDays] = React.useState<boolean[]>(
    existing?.days ?? [false, true, true, true, true, true, false]
  );

  React.useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? "");
      setCategory(existing?.category ?? "medication");
      setTime(existing?.time ?? "08:00");
      setDays(existing?.days ?? [false, true, true, true, true, true, false]);
    }
  }, [open, existing]);

  const toggleDay = (i: number) =>
    setDays((prev) => prev.map((d, idx) => (idx === i ? !d : d)));

  const save = () => {
    if (!title.trim()) {
      onOpenChange(false);
      return;
    }
    onSave({
      title: title.trim(),
      category,
      time,
      days,
      enabled: existing?.enabled ?? true,
    });
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
                    {existing ? "Edit reminder" : "New reminder"}
                  </p>
                  <h2 className="text-headline text-text-primary">Stay on track</h2>
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
              {/* Title */}
              <div>
                <p className="text-label text-text-tertiary mb-2">What to remember</p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Evening vitamins"
                  className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                />
              </div>

              {/* Category */}
              <div>
                <p className="text-label text-text-tertiary mb-2.5">Category</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {REMINDER_CATEGORIES.map((c) => (
                    <motion.button
                      key={c.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "rounded-2xl p-3.5 border-2 text-left transition-all flex items-center gap-2.5",
                        category === c.id
                          ? "border-primary bg-surface shadow-glow"
                          : "border-border bg-surface"
                      )}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-caption font-semibold text-text-primary">
                        {c.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <p className="text-label text-text-tertiary mb-2">Time</p>
                <div className="flex items-center justify-center rounded-2xl bg-surface-secondary border border-border py-5">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent text-headline text-text-primary outline-none text-center"
                  />
                </div>
              </div>

              {/* Days */}
              <div>
                <p className="text-label text-text-tertiary mb-2.5">Repeat on</p>
                <div className="flex justify-between gap-1.5">
                  {WEEKDAY_LABELS.map((d, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleDay(i)}
                      className={cn(
                        "flex-1 aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all",
                        days[i]
                          ? "gradient-primary-bg text-primary-foreground shadow-glow"
                          : "bg-surface-secondary text-text-tertiary"
                      )}
                    >
                      {d}
                    </motion.button>
                  ))}
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
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={save}
                className="flex-1 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
              >
                {existing ? "Save changes" : "Add reminder"}
              </button>
            </div>
          </motion.div>
        </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
