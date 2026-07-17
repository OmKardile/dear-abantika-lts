"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, Trash2, Sparkles } from "lucide-react";
import {
  WISHLIST_CATEGORIES,
  type WishlistCategory,
  type WishlistItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: WishlistCategory;
  existing?: WishlistItem;
  onSave: (item: Omit<WishlistItem, "id">) => void;
  onDelete?: (id: string) => void;
}

export function WishlistItemForm({
  open,
  onOpenChange,
  defaultCategory = "dream",
  existing,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<WishlistCategory>(defaultCategory);
  const [notes, setNotes] = React.useState("");
  const [link, setLink] = React.useState("");
  const [image, setImage] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? "");
      setDescription(existing?.description ?? "");
      setCategory(existing?.category ?? defaultCategory);
      setNotes(existing?.notes ?? "");
      setLink(existing?.link ?? "");
      setImage(existing?.image ?? "");
    }
  }, [open, existing, defaultCategory]);

  const save = () => {
    if (!title.trim()) {
      onOpenChange(false);
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      notes: notes.trim() || undefined,
      link: link.trim() || undefined,
      image: image.trim() || undefined,
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
                    {existing ? "Edit item" : "Add to wishlist"}
                  </p>
                  <h2 className="text-headline text-text-primary">
                    Something lovely
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

            <div className="px-6 py-5 space-y-5">
              {/* image preview */}
              <div className="rounded-[22px] overflow-hidden bg-surface-secondary border border-border aspect-[16/9] flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-text-tertiary">
                    <Sparkles size={28} />
                    <span className="text-caption">Add an image URL</span>
                  </div>
                )}
              </div>

              <Field label="Image URL (optional)">
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                />
              </Field>

              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Silk pillowcase"
                  className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="What makes it special?"
                  className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
                />
              </Field>

              <div>
                <p className="text-label text-text-tertiary mb-2.5">Category</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {WISHLIST_CATEGORIES.map((c) => (
                    <motion.button
                      key={c.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "rounded-2xl p-3.5 border-2 text-left transition-all",
                        category === c.id
                          ? "border-primary bg-surface shadow-glow"
                          : "border-border bg-surface"
                      )}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <p className="text-caption font-semibold text-text-primary mt-1">
                        {c.label}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Field label="Notes (optional)">
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Size, color, where you saw it…"
                  className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                />
              </Field>

              <Field label="Link (optional)" icon={LinkIcon}>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                />
              </Field>
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
                {existing ? "Save changes" : "Add to wishlist"}
              </button>
            </div>
          </motion.div>
        </motion.div>
          </Portal>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-text-tertiary" />}
        <p className="text-label text-text-tertiary">{label}</p>
      </div>
      {children}
    </div>
  );
}
