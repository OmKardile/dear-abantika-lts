"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Droplet, Plus, Minus } from "lucide-react";
import type { HydrationLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: HydrationLog;
  onSave: (amount: number, timestamp: string) => void;
  onDelete?: (id: string) => void;
}

/** Format an ISO timestamp into "HH:mm" suitable for <input type="time">. */
function isoToTimeInput(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "08:00";
  }
}

/** Build an ISO timestamp for today (or the existing log's date) at HH:mm. */
function buildTimestamp(timeStr: string, baseIso?: string): string {
  const base = baseIso ? new Date(baseIso) : new Date();
  const [h, m] = timeStr.split(":").map((n) => parseInt(n, 10));
  base.setHours(h || 0, m || 0, 0, 0);
  return base.toISOString();
}

const QUICK_AMOUNTS = [250, 500, -250];

export function HydrationLogForm({
  open,
  onOpenChange,
  existing,
  onSave,
  onDelete,
}: Props) {
  const [time, setTime] = React.useState("08:00");
  const [amount, setAmount] = React.useState<number>(250);

  React.useEffect(() => {
    if (open) {
      setTime(existing ? isoToTimeInput(existing.timestamp) : isoToTimeInput(new Date().toISOString()));
      setAmount(existing?.amount ?? 250);
    }
  }, [open, existing]);

  const save = () => {
    if (!Number.isFinite(amount) || amount === 0) {
      onOpenChange(false);
      return;
    }
    const ts = buildTimestamp(time, existing?.timestamp);
    onSave(amount, ts);
    onOpenChange(false);
  };

  const isPositive = amount >= 0;

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
                    {existing ? "Edit log" : "Add water"}
                  </p>
                  <h2 className="text-headline text-text-primary">Hydration log</h2>
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
              {/* Amount */}
              <div>
                <p className="text-label text-text-tertiary mb-2.5">
                  Amount (ml)
                </p>
                <div
                  className={cn(
                    "rounded-3xl border-2 p-5 flex items-center gap-4 transition-colors",
                    isPositive
                      ? "border-primary/40 bg-surface"
                      : "border-error/30 bg-surface"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setAmount((a) => a - 50)}
                    className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center shrink-0"
                    aria-label="Decrease by 50"
                  >
                    <Minus size={16} className="text-text-secondary" />
                  </button>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-[2.5rem] leading-none font-bold tabular-nums",
                          isPositive ? "text-primary" : "text-error"
                        )}
                      >
                        {amount > 0 ? "+" : ""}
                        {amount}
                      </span>
                      <span className="text-body text-text-secondary font-semibold">
                        ml
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAmount((a) => a + 50)}
                    className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center shrink-0"
                    aria-label="Increase by 50"
                  >
                    <Plus size={16} className="text-text-secondary" />
                  </button>
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {QUICK_AMOUNTS.map((q) => {
                    const positive = q > 0;
                    return (
                      <motion.button
                        key={q}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setAmount(q)}
                        className={cn(
                          "rounded-2xl py-2.5 text-sm font-bold border transition-all flex items-center justify-center gap-1",
                          amount === q
                            ? positive
                              ? "gradient-primary-bg text-primary-foreground border-transparent shadow-glow"
                              : "bg-error text-white border-transparent"
                            : "bg-surface text-text-secondary border-border"
                        )}
                      >
                        {positive ? "+" : ""}
                        {q}ml
                      </motion.button>
                    );
                  })}
                </div>

                {/* Manual entry */}
                <label className="block mt-3">
                  <span className="text-label text-text-tertiary">
                    Or type a custom amount
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={Number.isFinite(amount) ? amount : 0}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setAmount(Number.isFinite(v) ? v : 0);
                    }}
                    className="mt-1.5 w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary outline-none focus:border-primary/40 tabular-nums"
                  />
                </label>
              </div>

              {/* Time */}
              <div>
                <p className="text-label text-text-tertiary mb-2">Time</p>
                <div className="flex items-center justify-center rounded-2xl bg-surface-secondary border border-border py-5">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent text-headline text-text-primary outline-none text-center tabular-nums"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-3.5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isPositive
                      ? "gradient-primary-bg"
                      : "bg-error/15"
                  )}
                >
                  <Droplet
                    size={18}
                    className={isPositive ? "text-primary-foreground" : "text-error"}
                    fill="currentColor"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-caption text-text-secondary">
                    This will {isPositive ? "add" : "remove"}{" "}
                    <span className={cn("font-bold", isPositive ? "text-primary" : "text-error")}>
                      {Math.abs(amount)}ml
                    </span>{" "}
                    {isPositive ? "to" : "from"} today&apos;s total
                  </p>
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
                  aria-label="Delete log"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={save}
                className="flex-1 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
              >
                {existing ? "Save changes" : "Add log"}
              </button>
            </div>
          </motion.div>
        </motion.div>
          </Portal>
      )}
    </AnimatePresence>
  );
}
