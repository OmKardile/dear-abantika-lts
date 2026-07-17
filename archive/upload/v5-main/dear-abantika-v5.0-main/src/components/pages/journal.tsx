"use client";

import * as React from "react";
import { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookHeart,
  ShoppingBag,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Sparkles,
  Check,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import {
  MOOD_FILTERS,
  WISHLIST_CATEGORIES,
  type WishlistCategory,
  type JournalEntry,
  type WishlistItem,
  type SortOption,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  Chip,
  EmptyState,
  StaggerItem,
  Pressable,
} from "@/components/premium/primitives";
import { SwipeableRow } from "@/components/premium/swipeable-row";
import { SelectionBar } from "@/components/premium/selection-bar";
import { SortMenu } from "@/components/premium/sort-menu";
import { ConfirmDialog } from "@/components/premium/confirm-dialog";
import { useSelection } from "@/hooks/use-selection";
import { useUndo } from "@/components/providers/undo-provider";
import { DiaryEntryForm } from "@/components/forms/diary-entry-form";
import { WishlistItemForm } from "@/components/forms/wishlist-item-form";

export function Journal() {
  const [tab, setTab] = React.useState<"diary" | "wishlist">("diary");
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader title="Journal" subtitle="Your private space" />
      </motion.div>

      {/* Tab switcher */}
      <div className="relative flex p-1 rounded-full surface-card">
        {(["diary", "wishlist"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
            aria-pressed={tab === t}
          >
            {tab === t && (
              <motion.div
                layoutId="journal-tab"
                className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex items-center gap-2",
                tab === t
                  ? "text-primary-foreground"
                  : "text-text-secondary"
              )}
            >
              {t === "diary" ? <BookHeart size={16} /> : <ShoppingBag size={16} />}
              {t === "diary" ? "My Diary" : "Wishlist"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "diary" ? (
          <motion.div
            key="diary"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Diary />
          </motion.div>
        ) : (
          <motion.div
            key="wishlist"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
          >
            <Wishlist />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============== DIARY ============== */
function Diary() {
  const {
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    archiveJournalEntry,
    bulkDeleteJournalEntries,
    bulkArchiveJournalEntries,
  } = useStore();
  const { showUndo } = useUndo();

  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });

  // archived entries live in the Archive screen in Settings — hide them here
  const activeEntries = useMemo(
    () => journalEntries.filter((e) => !e.archived),
    [journalEntries]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = activeEntries.filter((e) => {
      const ms =
        e.title.toLowerCase().includes(q) ||
        e.reflection.toLowerCase().includes(q);
      if (q && !ms) return false;
      const mm = moodFilter === "All" || e.mood === moodFilter;
      return mm;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.date > b.date ? 1 : -1;
        case "alpha":
          return a.title.localeCompare(b.title);
        case "modified": {
          const am = a.archivedAt ?? a.date;
          const bm = b.archivedAt ?? b.date;
          return am < bm ? 1 : -1;
        }
        case "newest":
        default:
          return a.date < b.date ? 1 : -1;
      }
    });
  }, [activeEntries, search, moodFilter, sort]);

  const sel = useSelection(visible);
  const editingEntry = journalEntries.find((e) => e.id === editing);
  const hasAny = activeEntries.length > 0;

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (entry: JournalEntry) => {
    setEditing(entry.id);
    setFormOpen(true);
  };

  // Swipe "delete" = soft archive + undo snackbar
  const handleSwipeDelete = (entry: JournalEntry) => {
    archiveJournalEntry(entry.id, true);
    showUndo("Entry archived", () => archiveJournalEntry(entry.id, false));
  };
  // Swipe "archive" = archive (restorable from Settings archive screen)
  const handleSwipeArchive = (entry: JournalEntry, archived: boolean) => {
    archiveJournalEntry(entry.id, archived);
  };
  // Multi-select delete = permanent delete after confirm
  const handleMultiDelete = () => {
    if (sel.selected.length === 0) return;
    setConfirmDelete({ open: true, ids: sel.selected });
  };
  const handleMultiArchive = () => {
    const ids = sel.selected;
    if (ids.length === 0) return;
    bulkArchiveJournalEntries(ids, true);
    sel.clearAll();
  };
  const confirmDeleteAction = () => {
    bulkDeleteJournalEntries(confirmDelete.ids);
    sel.clearAll();
    setConfirmDelete({ open: false, ids: [] });
  };

  return (
    <div className="space-y-5">
      {/* Search + sort row */}
      <div className="flex items-center gap-2">
        <SurfaceCard className="flex-1 flex items-center gap-3 px-4 py-3 min-w-0">
          <Search size={18} className="text-text-tertiary shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your thoughts…"
            className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary min-w-0"
            aria-label="Search journal entries"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-caption text-text-tertiary shrink-0 hover:text-text-primary transition-colors"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </SurfaceCard>
        <SortMenu value={sort} onChange={setSort} />
      </div>

      {/* Mood filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {MOOD_FILTERS.map((m) => (
          <Chip
            key={m}
            active={moodFilter === m}
            onClick={() => setMoodFilter(m)}
          >
            {m}
          </Chip>
        ))}
      </div>

      {/* Entries */}
      {visible.length === 0 ? (
        <EmptyState
          emoji="📔"
          title={
            search || moodFilter !== "All"
              ? "No matches found"
              : "Start writing"
          }
          description={
            search || moodFilter !== "All"
              ? "Try a different search or mood filter."
              : "Your first reflection is waiting. Be gentle, be honest."
          }
          action={
            !search && moodFilter === "All" ? (
              <Pressable
                onClick={openNew}
                className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
              >
                <Plus size={15} />
                New entry
              </Pressable>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((entry, i) => (
              <StaggerItem key={entry.id} index={Math.min(i, 8)}>
                <SwipeableRow
                  onDelete={() => handleSwipeDelete(entry)}
                  onArchive={(archived) => handleSwipeArchive(entry, archived)}
                  archived={entry.archived}
                  disabled={sel.mode}
                >
                  <DiaryEntryCard
                    entry={entry}
                    index={i}
                    selected={sel.isSelected(entry.id)}
                    inSelectionMode={sel.mode}
                    onTap={() => {
                      if (sel.mode) sel.toggle(entry.id);
                      else openEdit(entry);
                    }}
                    onLongPress={() => sel.enterMode(entry.id)}
                  />
                </SwipeableRow>
              </StaggerItem>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Selection bar — portaled to body to escape transformed ancestors */}
      <Portal>
        <SelectionBar
          selectedCount={sel.selectedCount}
          onCancel={sel.clearAll}
          onDelete={handleMultiDelete}
          onArchive={handleMultiArchive}
          onSelectAll={sel.selectAll}
          total={visible.length}
        />
      </Portal>

      {/* FAB — hidden in selection mode */}
      {!sel.mode && (
        <Portal>
          <motion.button
            onClick={openNew}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{ bottom: "calc(var(--nav-h, 4rem) + 0.75rem)" }}
            className="fixed right-4 z-40 w-14 h-14 rounded-2xl gradient-primary-bg text-primary-foreground shadow-glow flex items-center justify-center"
            aria-label="Add journal entry"
          >
            <Plus size={24} />
          </motion.button>
        </Portal>
      )}

      {/* Confirm delete dialog */}
      <Portal>
        <ConfirmDialog
          open={confirmDelete.open}
          onOpenChange={(v) => setConfirmDelete((p) => ({ ...p, open: v }))}
          title={
            confirmDelete.ids.length > 1
              ? `Delete ${confirmDelete.ids.length} entries?`
              : "Delete this entry?"
          }
          description="This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={confirmDeleteAction}
        />
      </Portal>

      <DiaryEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editingEntry}
        onSave={(e) => {
          if (editingEntry) updateJournalEntry(editingEntry.id, e);
          else addJournalEntry(e);
        }}
        onDelete={deleteJournalEntry}
      />
    </div>
  );
}

/* ============== WISHLIST ============== */
function Wishlist() {
  const {
    wishlistItems,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    archiveWishlistItem,
    bulkDeleteWishlistItems,
    bulkArchiveWishlistItems,
  } = useStore();
  const { showUndo } = useUndo();

  const [cat, setCat] = useState<WishlistCategory>("dream");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });

  // hide archived (they live in Settings → Archive)
  const activeItems = useMemo(
    () => wishlistItems.filter((i) => !i.archived),
    [wishlistItems]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = activeItems.filter((i) => {
      if (i.category !== cat) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.notes?.toLowerCase().includes(q) ?? false)
      );
    });
    // remember insertion index for "newest"/"oldest" sort
    const indexOf = (id: string) =>
      wishlistItems.findIndex((x) => x.id === id);
    return filtered.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return indexOf(a.id) - indexOf(b.id);
        case "alpha":
          return a.title.localeCompare(b.title);
        case "modified": {
          const am = a.archivedAt ?? "";
          const bm = b.archivedAt ?? "";
          return am < bm ? 1 : -1;
        }
        case "newest":
        default:
          return indexOf(b.id) - indexOf(a.id);
      }
    });
  }, [activeItems, wishlistItems, cat, search, sort]);

  const sel = useSelection(visible);
  const editingItem = wishlistItems.find((i) => i.id === editing);
  const hasAnyInCat =
    activeItems.filter((i) => i.category === cat).length > 0;

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (item: WishlistItem) => {
    setEditing(item.id);
    setFormOpen(true);
  };

  const handleSwipeDelete = (item: WishlistItem) => {
    archiveWishlistItem(item.id, true);
    showUndo("Item archived", () => archiveWishlistItem(item.id, false));
  };
  const handleSwipeArchive = (item: WishlistItem, archived: boolean) => {
    archiveWishlistItem(item.id, archived);
  };
  const handleMultiDelete = () => {
    if (sel.selected.length === 0) return;
    setConfirmDelete({ open: true, ids: sel.selected });
  };
  const handleMultiArchive = () => {
    const ids = sel.selected;
    if (ids.length === 0) return;
    bulkArchiveWishlistItems(ids, true);
    sel.clearAll();
  };
  const confirmDeleteAction = () => {
    bulkDeleteWishlistItems(confirmDelete.ids);
    sel.clearAll();
    setConfirmDelete({ open: false, ids: [] });
  };

  return (
    <div className="space-y-5">
      {/* Category tabs */}
      <div className="grid grid-cols-2 gap-3">
        {WISHLIST_CATEGORIES.map((c) => {
          const count = activeItems.filter((i) => i.category === c.id).length;
          const active = cat === c.id;
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setCat(c.id);
                sel.clearAll();
              }}
              className={cn(
                "relative overflow-hidden rounded-[22px] p-4 text-left border transition-all",
                active
                  ? "gradient-primary-bg text-primary-foreground border-transparent shadow-glow"
                  : "bg-surface text-text-primary border-border"
              )}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{c.emoji}</span>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    active
                      ? "bg-white/20"
                      : "bg-surface-secondary text-text-secondary"
                  )}
                >
                  {count}
                </span>
              </div>
              <p className="text-sm font-semibold mt-2">{c.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Search + sort row */}
      <div className="flex items-center gap-2">
        <SurfaceCard className="flex-1 flex items-center gap-3 px-4 py-3 min-w-0">
          <Search size={18} className="text-text-tertiary shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary min-w-0"
            aria-label="Search wishlist items"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-caption text-text-tertiary shrink-0 hover:text-text-primary transition-colors"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </SurfaceCard>
        <SortMenu value={sort} onChange={setSort} />
      </div>

      {/* Items */}
      {visible.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title={search ? "No matches found" : "Nothing here yet"}
          description={
            search
              ? "Try a different search term."
              : "Curate the things you love. Tap below to add your first inspiration."
          }
          action={
            !search ? (
              <Pressable
                onClick={openNew}
                className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
              >
                <Plus size={15} />
                Add item
              </Pressable>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((item, i) => (
              <StaggerItem key={item.id} index={Math.min(i, 8)}>
                <SwipeableRow
                  onDelete={() => handleSwipeDelete(item)}
                  onArchive={(archived) => handleSwipeArchive(item, archived)}
                  archived={item.archived}
                  disabled={sel.mode}
                >
                  <WishlistItemCard
                    item={item}
                    selected={sel.isSelected(item.id)}
                    inSelectionMode={sel.mode}
                    onTap={() => {
                      if (sel.mode) sel.toggle(item.id);
                      else openEdit(item);
                    }}
                    onLongPress={() => sel.enterMode(item.id)}
                  />
                </SwipeableRow>
              </StaggerItem>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Selection bar */}
      <Portal>
        <SelectionBar
          selectedCount={sel.selectedCount}
          onCancel={sel.clearAll}
          onDelete={handleMultiDelete}
          onArchive={handleMultiArchive}
          onSelectAll={sel.selectAll}
          total={visible.length}
        />
      </Portal>

      {/* FAB — hidden in selection mode */}
      {!sel.mode && (
        <Portal>
          <motion.button
            onClick={openNew}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{ bottom: "calc(var(--nav-h, 4rem) + 0.75rem)" }}
            className="fixed right-4 z-40 w-14 h-14 rounded-2xl gradient-primary-bg text-primary-foreground shadow-glow flex items-center justify-center"
            aria-label="Add wishlist item"
          >
            <Plus size={24} />
          </motion.button>
        </Portal>
      )}

      {/* Confirm delete dialog */}
      <Portal>
        <ConfirmDialog
          open={confirmDelete.open}
          onOpenChange={(v) => setConfirmDelete((p) => ({ ...p, open: v }))}
          title={
            confirmDelete.ids.length > 1
              ? `Delete ${confirmDelete.ids.length} items?`
              : "Delete this item?"
          }
          description="This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={confirmDeleteAction}
        />
      </Portal>

      <WishlistItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultCategory={cat}
        existing={editingItem}
        onSave={(i) => {
          if (editingItem) updateWishlistItem(editingItem.id, i);
          else addWishlistItem(i);
        }}
        onDelete={deleteWishlistItem}
      />
    </div>
  );
}

/* ============== DIARY ENTRY CARD ============== */
function DiaryEntryCard({
  entry,
  index,
  selected,
  inSelectionMode,
  onTap,
  onLongPress,
}: {
  entry: JournalEntry;
  index: number;
  selected: boolean;
  inSelectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const startPress = () => {
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, 450);
  };
  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => () => cancelPress(), []);

  const handleClick = () => {
    // If a long-press just fired, swallow the subsequent click
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onTap();
  };

  return (
    <button
      type="button"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerMove={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      className="block w-full text-left select-none cursor-pointer"
      aria-pressed={selected}
    >
      <SurfaceCard
        className={cn(
          "p-5 transition-shadow",
          selected && "ring-2 ring-inset ring-primary"
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <motion.span
              className="text-3xl shrink-0"
              whileHover={{ scale: 1.15, rotate: 6 }}
            >
              {entry.mood}
            </motion.span>
            <div className="min-w-0">
              <h3 className="text-title text-text-primary truncate">
                {entry.title}
              </h3>
              <div className="flex items-center gap-1.5 text-caption text-text-secondary mt-0.5">
                <Calendar size={12} />
                {format(new Date(entry.date), "MMM d, yyyy")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {entry.sticker && (
              <motion.span
                className="text-2xl"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              >
                {entry.sticker}
              </motion.span>
            )}
            {inSelectionMode ? (
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
                  selected
                    ? "gradient-primary-bg border-transparent"
                    : "border-border bg-surface"
                )}
                aria-hidden
              >
                {selected && (
                  <Check size={15} className="text-primary-foreground" />
                )}
              </div>
            ) : (
              <ChevronRight size={18} className="text-text-tertiary" />
            )}
          </div>
        </div>
        <p className="text-body text-text-secondary leading-relaxed line-clamp-3">
          {entry.reflection}
        </p>
      </SurfaceCard>
    </button>
  );
}

/* ============== WISHLIST ITEM CARD ============== */
function WishlistItemCard({
  item,
  selected,
  inSelectionMode,
  onTap,
  onLongPress,
}: {
  item: WishlistItem;
  selected: boolean;
  inSelectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const startPress = () => {
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, 450);
  };
  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => () => cancelPress(), []);

  const handleClick = () => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onTap();
  };

  return (
    <button
      type="button"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerMove={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      className="block w-full text-left select-none cursor-pointer"
      aria-pressed={selected}
    >
      <SurfaceCard
        className={cn(
          "overflow-hidden transition-shadow",
          selected && "ring-2 ring-inset ring-primary"
        )}
      >
        <div className="flex gap-4 p-4">
          {/* image */}
          <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden bg-surface-secondary flex items-center justify-center">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Sparkles
                size={26}
                className="text-text-tertiary opacity-50"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-title text-text-primary truncate flex-1 min-w-0">
                {item.title}
              </h3>
              {inSelectionMode ? (
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
                    selected
                      ? "gradient-primary-bg border-transparent"
                      : "border-border bg-surface"
                  )}
                  aria-hidden
                >
                  {selected && (
                    <Check size={15} className="text-primary-foreground" />
                  )}
                </div>
              ) : (
                <ChevronRight
                  size={18}
                  className="text-text-tertiary shrink-0 mt-0.5"
                />
              )}
            </div>
            {item.description && (
              <p className="text-caption text-text-secondary line-clamp-2 mt-0.5">
                {item.description}
              </p>
            )}
            {item.notes && (
              <p className="text-caption text-text-tertiary line-clamp-1 mt-1.5">
                💭 {item.notes}
              </p>
            )}
            {item.link && !inSelectionMode && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary">
                <ExternalLink size={12} />
                View link
              </span>
            )}
          </div>
        </div>
      </SurfaceCard>
    </button>
  );
}

/* ============== PORTAL ==================== */
function Portal({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore avoids setState-in-effect and is SSR-safe:
  // getServerSnapshot returns false, client snapshot returns true.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted) return null;
  return createPortal(children, document.body);
}
