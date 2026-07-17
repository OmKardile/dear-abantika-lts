"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Trash2, Bold, Italic, List } from "lucide-react";
import { format } from "date-fns";
import { MOODS, STICKERS, type JournalEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: JournalEntry;
  onSave: (entry: Omit<JournalEntry, "id">) => void;
  onDelete?: (id: string) => void;
}

export function DiaryEntryForm({ open, onOpenChange, existing, onSave, onDelete }: Props) {
  const [title, setTitle] = React.useState("");
  const [mood, setMood] = React.useState("😊");
  const [reflection, setReflection] = React.useState("");
  const [sticker, setSticker] = React.useState<string | undefined>(undefined);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? "");
      setMood(existing?.mood ?? "😊");
      setReflection(existing?.reflection ?? "");
      setSticker(existing?.sticker);
    }
  }, [open, existing]);

  const save = () => {
    if (!title.trim() && !reflection.trim()) {
      onOpenChange(false);
      return;
    }
    onSave({
      date: existing?.date ?? new Date().toISOString(),
      title: title.trim() || "Untitled thought",
      mood,
      reflection: reflection.trim(),
      sticker,
    });
    onOpenChange(false);
  };

  const insert = (before: string, after = "") => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart, selectionEnd, value } = ta;
    const next =
      value.slice(0, selectionStart) +
      before +
      value.slice(selectionStart, selectionEnd) +
      after +
      value.slice(selectionEnd);
    setReflection(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = selectionStart + before.length;
      ta.selectionEnd = selectionEnd + before.length;
    });
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
            className="relative w-full max-w-md max-h-[94dvh] flex flex-col rounded-[32px] glass-sheet"
          >
            {/* header */}
            <div className="sticky top-0 z-10 pt-3 pb-3 px-6 bg-transparent backdrop-blur-md border-b border-white/10">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-border mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label text-text-tertiary">
                    {existing ? "Edit entry" : "New reflection"}
                  </p>
                  <h2 className="text-headline text-text-primary">My diary</h2>
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

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-5">
              {/* date + mood preview */}
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <Calendar size={14} />
                {format(new Date(existing?.date ?? Date.now()), "EEEE, MMM d")}
                <span className="ml-auto text-2xl">{mood}</span>
              </div>

              {/* title */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it a title…"
                className="w-full bg-transparent outline-none text-headline text-text-primary placeholder:text-text-tertiary"
              />

              {/* reflection */}
              <textarea
                ref={taRef}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={8}
                placeholder="What's on your mind? Let it flow…"
                className="w-full bg-surface-secondary rounded-2xl border border-border p-4 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none leading-relaxed"
              />

              {/* floating formatting toolbar */}
              <div className="sticky bottom-2 flex items-center justify-center gap-1.5">
                <div className="flex items-center gap-1 rounded-full surface-elevated px-2 py-1.5 shadow-lifted">
                  <ToolBtn onClick={() => insert("**", "**")} label="Bold">
                    <Bold size={15} />
                  </ToolBtn>
                  <ToolBtn onClick={() => insert("*", "*")} label="Italic">
                    <Italic size={15} />
                  </ToolBtn>
                  <ToolBtn onClick={() => insert("\n• ")} label="List">
                    <List size={15} />
                  </ToolBtn>
                </div>
              </div>

              {/* mood picker */}
              <div>
                <p className="text-label text-text-tertiary mb-2.5">Mood</p>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all",
                        mood === m
                          ? "bg-surface-secondary scale-110 ring-2 ring-primary"
                          : "bg-surface-secondary/60"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* sticker picker */}
              <div>
                <p className="text-label text-text-tertiary mb-2.5">
                  Sticker {sticker ? "· selected" : "· optional"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSticker(undefined)}
                    className={cn(
                      "h-10 px-3 rounded-2xl text-caption font-semibold flex items-center",
                      !sticker
                        ? "gradient-primary-bg text-primary-foreground"
                        : "bg-surface-secondary text-text-secondary"
                    )}
                  >
                    None
                  </button>
                  {STICKERS.map((s) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setSticker(s)}
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-surface-secondary transition-all",
                        sticker === s && "ring-2 ring-primary scale-110"
                      )}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* footer actions */}
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
                {existing ? "Save changes" : "Save entry"}
              </button>
            </div>
          </motion.div>
        </motion.div>
          </Portal>
      )}
    </AnimatePresence>
  );
}

function ToolBtn({
  onClick,
  children,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-secondary"
    >
      {children}
    </motion.button>
  );
}
