"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Clock, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  REMINDER_CATEGORIES,
  WEEKDAY_LABELS,
  type Reminder,
  type SortOption,
} from "@/lib/types";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  EmptyState,
  Pressable,
} from "@/components/premium/primitives";
import { ReminderForm } from "@/components/forms/reminder-form";
import { SwipeableRow } from "@/components/premium/swipeable-row";
import { SelectionBar } from "@/components/premium/selection-bar";
import { SortMenu } from "@/components/premium/sort-menu";
import { ConfirmDialog } from "@/components/premium/confirm-dialog";
import { useSelection } from "@/hooks/use-selection";
import { toast } from "@/hooks/use-toast";

export function Reminders() {
  const reduce = useReducedMotion();
  const {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    bulkDeleteReminders,
  } = useStore();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | undefined>();
  const [sort, setSort] = React.useState<SortOption>("newest");
  const [confirmSingle, setConfirmSingle] = React.useState<Reminder | undefined>();
  const [confirmBulk, setConfirmBulk] = React.useState(false);

  const editingReminder = reminders.find((r) => r.id === editing);

  // Only show non-archived reminders here. Archived ones live in the Archive tab.
  const activeReminders = React.useMemo(
    () => reminders.filter((r) => !r.archived),
    [reminders]
  );

  const sorted = React.useMemo(() => {
    const arr = [...activeReminders];
    switch (sort) {
      case "oldest":
        // insertion order (oldest added first)
        return arr;
      case "newest":
        // reverse insertion order (newest added first)
        return arr.reverse();
      case "alpha":
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      case "modified":
        // by reminder time (HH:mm) ascending
        return arr.sort((a, b) => a.time.localeCompare(b.time));
      default:
        return arr;
    }
  }, [activeReminders, sort]);

  const sel = useSelection(sorted);

  const handleSwipeDelete = (r: Reminder) => {
    // Permanent delete after confirm — reminders are easily recreated, no undo.
    setConfirmSingle(r);
  };

  const confirmSingleDelete = () => {
    if (confirmSingle) {
      deleteReminder(confirmSingle.id);
      toast({ title: "Reminder deleted" });
    }
    setConfirmSingle(undefined);
  };

  const handleBulkDelete = () => {
    if (sel.selected.length === 0) return;
    setConfirmBulk(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteReminders(sel.selected);
    sel.clearAll();
    setConfirmBulk(false);
    toast({
      title: `${sel.selected.length} reminders deleted`,
    });
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader title="Reminders" subtitle="Gentle nudges for your day" />
      </motion.div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-body text-text-secondary">
          {activeReminders.length}{" "}
          {activeReminders.length === 1 ? "reminder" : "reminders"}
        </p>
        <div className="flex items-center gap-2">
          <SortMenu value={sort} onChange={setSort} />
          <Pressable
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="px-4 py-2 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5 shrink-0"
          >
            <Plus size={15} />
            New
          </Pressable>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="No reminders yet"
          description="Add gentle nudges for water, medication, skincare or anything you'd like to remember."
          action={
            <Pressable
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
              className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
            >
              <Plus size={15} />
              Add reminder
            </Pressable>
          }
        />
      ) : (
        /* Timeline */
        <div className="relative pl-6">
          {/* timeline rail */}
          <div className="absolute left-[10px] top-2 bottom-2 w-0.5 bg-divider" />
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {sorted.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0 }}
                  transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.02 }}
                  className="relative"
                >
                  {/* node */}
                  <div
                    className={cn(
                      "absolute -left-[18px] top-5 w-4 h-4 rounded-full border-2 border-background z-10",
                      r.enabled ? "gradient-primary-bg" : "bg-surface-secondary"
                    )}
                  />
                  <SwipeableRow
                    onDelete={() => handleSwipeDelete(r)}
                    disabled={sel.mode}
                  >
                    <ReminderRow
                      reminder={r}
                      selected={sel.isSelected(r.id)}
                      inSelectionMode={sel.mode}
                      onTap={() => {
                        if (sel.mode) sel.toggle(r.id);
                        else {
                          setEditing(r.id);
                          setFormOpen(true);
                        }
                      }}
                      onLongPress={() => sel.enterMode(r.id)}
                      onToggleEnabled={() =>
                        updateReminder(r.id, { enabled: !r.enabled })
                      }
                    />
                  </SwipeableRow>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <ReminderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editingReminder}
        onSave={(r) => {
          if (editingReminder) updateReminder(editingReminder.id, r);
          else addReminder(r);
        }}
        onDelete={deleteReminder}
      />

      {/* Selection bar — portaled to body */}
      <Portal>
        <SelectionBar
          selectedCount={sel.selectedCount}
          onCancel={sel.clearAll}
          onDelete={handleBulkDelete}
          onSelectAll={sel.selectAll}
          total={sorted.length}
        />
      </Portal>

      {/* Confirm single delete */}
      <Portal>
        <ConfirmDialog
          open={!!confirmSingle}
          onOpenChange={(v) => {
            if (!v) setConfirmSingle(undefined);
          }}
          title="Delete this reminder?"
          description="This cannot be undone, but you can always recreate it."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={confirmSingleDelete}
        />
      </Portal>

      {/* Confirm bulk delete */}
      <Portal>
        <ConfirmDialog
          open={confirmBulk}
          onOpenChange={setConfirmBulk}
          title={
            sel.selectedCount > 1
              ? `Delete ${sel.selectedCount} reminders?`
              : "Delete this reminder?"
          }
          description="This cannot be undone, but you can always recreate them."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={confirmBulkDelete}
        />
      </Portal>
    </div>
  );
}

/* ============== REMINDER ROW ============== */
function ReminderRow({
  reminder,
  selected,
  inSelectionMode,
  onTap,
  onLongPress,
  onToggleEnabled,
}: {
  reminder: Reminder;
  selected: boolean;
  inSelectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
  onToggleEnabled: () => void;
}) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = React.useRef(false);

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
  React.useEffect(() => () => cancelPress(), []);

  const handleClick = () => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onTap();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerMove={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      className="block w-full text-left select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[24px]"
      aria-pressed={selected}
    >
      <SurfaceCard
        className={cn(
          "p-4 transition-shadow",
          !reminder.enabled && "opacity-60",
          selected && "ring-2 ring-inset ring-primary"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-surface-secondary flex items-center justify-center text-xl shrink-0">
            {REMINDER_CATEGORIES.find((c) => c.id === reminder.category)?.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-title text-text-primary truncate">
              {reminder.title}
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-secondary mt-0.5">
              <Clock size={12} />
              {formatTime(reminder.time)}
            </div>
            <div className="flex gap-1 mt-2">
              {WEEKDAY_LABELS.map((d, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center",
                    reminder.days[idx] ? "text-primary" : "text-text-tertiary"
                  )}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          {/* toggle (hidden in selection mode) */}
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
              {selected && <Check size={15} className="text-primary-foreground" />}
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnabled();
              }}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors shrink-0",
                reminder.enabled ? "gradient-primary-bg" : "bg-border"
              )}
              aria-label={reminder.enabled ? "Disable" : "Enable"}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md",
                  reminder.enabled ? "left-6" : "left-1"
                )}
              />
            </button>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}

/* ==================== PORTAL ==================== */
function Portal({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore avoids setState-in-effect and is SSR-safe:
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted) return null;
  return createPortal(children, document.body);
}
