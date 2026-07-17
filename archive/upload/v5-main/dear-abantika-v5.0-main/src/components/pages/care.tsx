"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Plus,
  Sparkles,
  Check,
  Clock,
  Calendar as CalIcon,
  Repeat,
  X,
  Trash2,
  Heart,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  CARE_ROUTINES,
  CARE_TASK_PRESETS,
  TASK_PRIORITY_META,
  WEEKDAY_LABELS,
  type CareRoutineType,
  type CareTask,
  type DailyTask,
} from "@/lib/types";
import { todayStr, formatTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  EmptyState,
  Pressable,
} from "@/components/premium/primitives";
import { SwipeableRow } from "@/components/premium/swipeable-row";
import { ConfirmDialog } from "@/components/premium/confirm-dialog";
import { Portal } from "@/components/premium/portal";
import { toast } from "@/hooks/use-toast";
import type { TabId } from "@/components/app-shell";

/* ============================================================
   Care — Self-care routines + daily task planner
   ============================================================ */
export function Care({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<"routines" | "tasks">("routines");
  const pcosEnabled = useStore((s) => s.settings.pcos.enabled);

  return (
    <div className="space-y-5">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          title="Care"
          subtitle="Self-care rituals & daily tasks"
        />
      </motion.div>

      {/* PCOS-aware encouragement banner */}
      {pcosEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[24px] surface-card p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl gradient-primary-bg flex items-center justify-center shrink-0">
            <Heart size={18} className="text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">PCOS mode is on</p>
            <p className="text-caption text-text-secondary leading-relaxed">
              Gentle daily rituals help balance hormones. Be kind to yourself.
            </p>
          </div>
        </motion.div>
      )}

      {/* Tab switcher */}
      <div className="relative flex p-1 rounded-full surface-card">
        {(["routines", "tasks"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
            aria-pressed={tab === t}
          >
            {tab === t && (
              <motion.div
                layoutId="care-tab"
                className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex items-center gap-2",
                tab === t ? "text-primary-foreground" : "text-text-secondary"
              )}
            >
              {t === "routines" ? <Sparkles size={15} /> : <CalIcon size={15} />}
              {t === "routines" ? "Routines" : "Tasks"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "routines" ? (
          <motion.div
            key="routines"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Routines />
          </motion.div>
        ) : (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
          >
            <Tasks />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   ROUTINES TAB
   ============================================================ */
function Routines() {
  const reduce = useReducedMotion();
  const {
    careTasks,
    addCareTask,
    updateCareTask,
    deleteCareTask,
    archiveCareTask,
    toggleCareTaskCompletion,
  } = useStore();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CareTask | undefined>();
  const [confirmDelete, setConfirmDelete] = React.useState<CareTask | undefined>();
  const today = todayStr();
  const dow = new Date().getDay();

  const active = React.useMemo(
    () => careTasks.filter((t) => !t.archived),
    [careTasks]
  );

  const groups = React.useMemo(() => {
    const m: Record<CareRoutineType, CareTask[]> = {
      morning: [],
      night: [],
      weekly: [],
      custom: [],
    };
    for (const t of active) m[t.routine].push(t);
    for (const k of Object.keys(m) as CareRoutineType[]) {
      m[k].sort((a, b) =>
        (a.time ?? "99:99").localeCompare(b.time ?? "99:99")
      );
    }
    return m;
  }, [active]);

  // A task is "scheduled today" if days[dow] is true, OR no days are set (always-on)
  const scheduledToday = (t: CareTask) =>
    t.days.some(Boolean) ? t.days[dow] : true;

  const totalScheduled = active.filter(scheduledToday).length;
  const totalDone = active.filter(
    (t) => scheduledToday(t) && t.completion[today]
  ).length;

  const handleQuickAdd = (preset: (typeof CARE_TASK_PRESETS)[number]) => {
    addCareTask({
      title: preset.title,
      emoji: preset.emoji,
      routine: preset.routine,
      time: undefined,
      days: [true, true, true, true, true, true, true],
      enabled: true,
    });
    toast({ title: `${preset.emoji} ${preset.title} added` });
  };

  return (
    <div className="space-y-5">
      {/* Today summary */}
      <SurfaceCard className="p-5" glow>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label text-text-tertiary">Today's rituals</p>
            <p className="text-title text-text-primary">
              {totalDone} of {totalScheduled} done
            </p>
          </div>
          <div className="text-right">
            <p className="text-headline text-text-primary">
              {totalScheduled > 0
                ? Math.round((totalDone / totalScheduled) * 100)
                : 0}
              <span className="text-body text-text-tertiary">%</span>
            </p>
            <p className="text-caption text-text-tertiary">complete</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-surface-secondary overflow-hidden mt-3">
          <motion.div
            className="h-full gradient-primary-bg"
            initial={{ width: 0 }}
            animate={{
              width: `${
                totalScheduled > 0 ? (totalDone / totalScheduled) * 100 : 0
              }%`,
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </SurfaceCard>

      {/* Quick-add preset chips */}
      {active.length > 0 && (
        <div>
          <p className="text-label text-text-tertiary mb-2 px-1">Quick add</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {CARE_TASK_PRESETS.map((p, i) => (
              <motion.button
                key={`${p.title}-${p.routine}-${i}`}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleQuickAdd(p)}
                className="shrink-0 px-3 py-2 rounded-full bg-surface border border-border text-sm font-medium text-text-primary flex items-center gap-1.5"
              >
                <span>{p.emoji}</span>
                <span className="whitespace-nowrap">{p.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {active.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="Start your self-care journey"
          description="Build morning, night, weekly or custom rituals. Small daily acts create lasting change."
          action={
            <Pressable
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
              className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
            >
              <Plus size={15} /> Add routine
            </Pressable>
          }
        />
      ) : (
        <>
          {CARE_ROUTINES.map((routine) => {
            const list = groups[routine.id];
            if (list.length === 0) return null;
            const todays = list.filter(scheduledToday);
            const done = todays.filter((t) => t.completion[today]).length;
            const pct = todays.length > 0 ? done / todays.length : 0;

            return (
              <div key={routine.id} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{routine.emoji}</span>
                    <h3 className="text-headline-serif text-text-primary truncate">
                      {routine.label}
                    </h3>
                    <span className="text-caption text-text-tertiary">
                      {todays.length > 0
                        ? `${done}/${todays.length} done`
                        : `${list.length} ${list.length === 1 ? "task" : "tasks"}`}
                    </span>
                  </div>
                </div>

                {/* Per-group progress bar */}
                {todays.length > 0 && (
                  <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                    <motion.div
                      className="h-full gradient-primary-bg"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                )}

                {/* Task rows */}
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {list.map((task, i) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: reduce ? 0 : i * 0.03,
                        }}
                      >
                        <SwipeableRow
                          archived={task.archived}
                          onArchive={(a) => {
                            archiveCareTask(task.id, a);
                            toast({
                              title: a ? "Routine archived" : "Routine restored",
                            });
                          }}
                          onDelete={() => setConfirmDelete(task)}
                        >
                          <CareTaskRow
                            task={task}
                            today={today}
                            scheduledToday={scheduledToday(task)}
                            onToggleComplete={() =>
                              toggleCareTaskCompletion(task.id, today)
                            }
                            onEdit={() => {
                              setEditing(task);
                              setFormOpen(true);
                            }}
                          />
                        </SwipeableRow>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {/* Add routine button */}
          <Pressable
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="w-full py-3.5 rounded-2xl surface-card border border-dashed border-border text-sm font-semibold text-text-secondary flex items-center justify-center gap-1.5"
          >
            <Plus size={16} /> Add routine
          </Pressable>
        </>
      )}

      <CareTaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
        onSave={(t) => {
          if (editing) {
            updateCareTask(editing.id, t);
            toast({ title: "Routine updated" });
          } else {
            addCareTask(t);
            toast({ title: "Routine added" });
          }
        }}
        onDelete={(id) => {
          deleteCareTask(id);
          toast({ title: "Routine deleted" });
        }}
      />

      <Portal>
        <ConfirmDialog
          open={!!confirmDelete}
          onOpenChange={(v) => {
            if (!v) setConfirmDelete(undefined);
          }}
          title="Delete this routine?"
          description="This cannot be undone, but you can always recreate it."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => {
            if (confirmDelete) deleteCareTask(confirmDelete.id);
            setConfirmDelete(undefined);
          }}
        />
      </Portal>
    </div>
  );
}

/* ---------------- CareTaskRow ---------------- */
function CareTaskRow({
  task,
  today,
  scheduledToday,
  onToggleComplete,
  onEdit,
}: {
  task: CareTask;
  today: string;
  scheduledToday: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
}) {
  const completed = !!task.completion[today];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit();
        }
      }}
      className="block w-full text-left select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[24px]"
    >
      <SurfaceCard
        className={cn(
          "p-4 transition-shadow",
          !scheduledToday && "opacity-55",
          !task.enabled && "opacity-60"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-surface-secondary flex items-center justify-center text-xl shrink-0">
            {task.emoji ?? "✨"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-title text-text-primary truncate",
                completed && "line-through text-text-tertiary"
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 text-caption text-text-secondary mt-0.5">
              {task.time && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(task.time)}
                </span>
              )}
              {!scheduledToday && task.days.some(Boolean) && (
                <span className="text-text-tertiary italic">Not today</span>
              )}
              {scheduledToday && completed && (
                <span className="text-primary font-semibold">Done today</span>
              )}
            </div>
          </div>
          {/* Completion checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            aria-label={completed ? "Mark incomplete" : "Mark complete"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
              completed
                ? "gradient-primary-bg border-transparent shadow-glow"
                : "border-border bg-surface"
            )}
          >
            <AnimatePresence>
              {completed && (
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check
                    size={16}
                    className="text-primary-foreground"
                    strokeWidth={3}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </SurfaceCard>
    </div>
  );
}

/* ============================================================
   TASKS TAB
   ============================================================ */
function Tasks() {
  const reduce = useReducedMotion();
  const {
    dailyTasks,
    addDailyTask,
    updateDailyTask,
    deleteDailyTask,
    toggleDailyTask,
  } = useStore();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DailyTask | undefined>();
  const [confirmDelete, setConfirmDelete] = React.useState<DailyTask | undefined>();
  const today = todayStr();

  const todays = React.useMemo(() => {
    return dailyTasks
      .filter((t) => !t.archived && t.date === today)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const pr = { high: 0, medium: 1, low: 2 };
        if (pr[a.priority] !== pr[b.priority])
          return pr[a.priority] - pr[b.priority];
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [dailyTasks, today]);

  const doneCount = todays.filter((t) => t.completed).length;
  const pct = todays.length > 0 ? doneCount / todays.length : 0;

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Today summary card */}
      <SurfaceCard className="p-5" glow>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-label text-text-tertiary">Today</p>
            <p className="text-title text-text-primary">{dateLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-headline text-text-primary">
              {doneCount}
              <span className="text-body text-text-tertiary">
                /{todays.length}
              </span>
            </p>
            <p className="text-caption text-text-tertiary">done</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-surface-secondary overflow-hidden">
          <motion.div
            className="h-full gradient-primary-bg"
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </SurfaceCard>

      {/* Add task button */}
      <Pressable
        onClick={() => {
          setEditing(undefined);
          setFormOpen(true);
        }}
        className="w-full py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-1.5"
      >
        <Plus size={16} /> Add task
      </Pressable>

      {todays.length === 0 ? (
        <EmptyState
          emoji="🌸"
          title="A clear canvas for today"
          description="Add one small, kind thing you can finish today. Tiny wins build momentum."
          action={
            <Pressable
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
              className="px-5 py-2.5 rounded-full gradient-primary-bg text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-1.5"
            >
              <Plus size={15} /> Add task
            </Pressable>
          }
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {todays.map((task, i) => (
              <motion.div
                key={task.id}
                layout
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.03 }}
              >
                <SwipeableRow onDelete={() => setConfirmDelete(task)}>
                  <DailyTaskRow
                    task={task}
                    onToggle={() => toggleDailyTask(task.id)}
                    onEdit={() => {
                      setEditing(task);
                      setFormOpen(true);
                    }}
                  />
                </SwipeableRow>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <DailyTaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
        onSave={(t) => {
          if (editing) {
            updateDailyTask(editing.id, t);
            toast({ title: "Task updated" });
          } else {
            addDailyTask(t);
            toast({ title: "Task added" });
          }
        }}
        onDelete={(id) => {
          deleteDailyTask(id);
          toast({ title: "Task deleted" });
        }}
      />

      <Portal>
        <ConfirmDialog
          open={!!confirmDelete}
          onOpenChange={(v) => {
            if (!v) setConfirmDelete(undefined);
          }}
          title="Delete this task?"
          description="This cannot be undone, but you can always add a new one."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => {
            if (confirmDelete) deleteDailyTask(confirmDelete.id);
            setConfirmDelete(undefined);
          }}
        />
      </Portal>
    </div>
  );
}

/* ---------------- DailyTaskRow ---------------- */
function DailyTaskRow({
  task,
  onToggle,
  onEdit,
}: {
  task: DailyTask;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const priorityMeta = TASK_PRIORITY_META.find((p) => p.id === task.priority)!;
  const recurringLabel =
    task.recurring && task.recurring !== "none"
      ? task.recurring.charAt(0).toUpperCase() + task.recurring.slice(1)
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit();
        }
      }}
      className="block w-full text-left select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[24px]"
    >
      <SurfaceCard
        className={cn(
          "p-4 transition-shadow",
          task.completed && "opacity-60"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Priority dot */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: priorityMeta.color }}
            aria-label={`${priorityMeta.label} priority`}
          />
          {/* Emoji */}
          {task.emoji && (
            <span className="text-lg shrink-0">{task.emoji}</span>
          )}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-body font-semibold text-text-primary truncate",
                task.completed && "line-through text-text-tertiary"
              )}
            >
              {task.title}
            </p>
            {recurringLabel && (
              <div className="flex items-center gap-1 text-caption text-text-tertiary mt-0.5">
                <Repeat size={11} />
                {recurringLabel}
              </div>
            )}
          </div>
          {/* Completion checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
              task.completed
                ? "gradient-primary-bg border-transparent shadow-glow"
                : "border-border bg-surface"
            )}
          >
            <AnimatePresence>
              {task.completed && (
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check
                    size={16}
                    className="text-primary-foreground"
                    strokeWidth={3}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </SurfaceCard>
    </div>
  );
}

/* ============================================================
   CARE TASK FORM (portaled, glass-sheet, centered modal)
   ============================================================ */
function CareTaskForm({
  open,
  onOpenChange,
  existing,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: CareTask;
  onSave: (t: Omit<CareTask, "id" | "createdAt" | "completion">) => void;
  onDelete?: (id: string) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [emoji, setEmoji] = React.useState("✨");
  const [routine, setRoutine] = React.useState<CareRoutineType>("morning");
  const [time, setTime] = React.useState("");
  const [days, setDays] = React.useState<boolean[]>([
    true, true, true, true, true, true, true,
  ]);

  React.useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? "");
      setEmoji(existing?.emoji ?? "✨");
      setRoutine(existing?.routine ?? "morning");
      setTime(existing?.time ?? "");
      setDays(existing?.days ?? [true, true, true, true, true, true, true]);
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
      emoji: emoji.trim() || "✨",
      routine,
      time: time || undefined,
      days,
      enabled: existing?.enabled ?? true,
    });
    onOpenChange(false);
  };

  const presets = CARE_TASK_PRESETS.filter((p) => p.routine === routine);
  const emojiOptions = [
    "✨", "🪥", "💧", "🧘", "🤸", "🚶", "📖", "💊",
    "🌿", "🛁", "☀️", "🌙", "🥗", "🏃", "📔", "🧴",
  ];

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
                      {existing ? "Edit routine" : "New routine"}
                    </p>
                    <h2 className="text-headline text-text-primary">
                      Daily ritual
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
                {/* Title */}
                <div>
                  <p className="text-label text-text-tertiary mb-2">
                    What's the ritual
                  </p>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning skincare"
                    className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                  />
                </div>

                {/* Emoji */}
                <div>
                  <p className="text-label text-text-tertiary mb-2">Icon</p>
                  <div className="flex items-center gap-2 mb-2.5">
                    <input
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      maxLength={2}
                      className="w-14 h-12 text-center text-2xl rounded-2xl bg-surface-secondary border border-border px-2 outline-none focus:border-primary/40"
                    />
                    <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
                      {emojiOptions.map((e) => (
                        <button
                          key={e}
                          onClick={() => setEmoji(e)}
                          className={cn(
                            "shrink-0 w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all",
                            emoji === e
                              ? "border-primary bg-surface shadow-glow"
                              : "border-border bg-surface"
                          )}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Routine selector */}
                <div>
                  <p className="text-label text-text-tertiary mb-2.5">Routine</p>
                  <div className="grid grid-cols-4 gap-2">
                    {CARE_ROUTINES.map((r) => (
                      <motion.button
                        key={r.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setRoutine(r.id)}
                        className={cn(
                          "rounded-2xl p-2.5 border-2 text-center transition-all flex flex-col items-center gap-1",
                          routine === r.id
                            ? "border-primary bg-surface shadow-glow"
                            : "border-border bg-surface"
                        )}
                      >
                        <span className="text-lg">{r.emoji}</span>
                        <span className="text-[10px] font-semibold text-text-primary">
                          {r.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Time (optional) */}
                <div>
                  <p className="text-label text-text-tertiary mb-2">
                    Time (optional)
                  </p>
                  <div className="flex items-center justify-center rounded-2xl bg-surface-secondary border border-border py-4">
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
                  <p className="text-label text-text-tertiary mb-2.5">
                    Repeat on
                  </p>
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

                {/* Preset quick-fill (only when creating new) */}
                {!existing && presets.length > 0 && (
                  <div>
                    <p className="text-label text-text-tertiary mb-2.5">
                      Or pick a preset
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((p, i) => (
                        <button
                          key={`${p.title}-${i}`}
                          onClick={() => {
                            setTitle(p.title);
                            setEmoji(p.emoji);
                          }}
                          className="px-3 py-2 rounded-full bg-surface border border-border text-sm font-medium text-text-primary flex items-center gap-1.5"
                        >
                          <span>{p.emoji}</span>
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 px-6 py-4 bg-transparent backdrop-blur-md border-t border-white/10 flex gap-3">
                {existing && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(existing.id);
                      onOpenChange(false);
                    }}
                    className="px-4 py-3.5 rounded-2xl border border-error/30 text-error flex items-center gap-1.5 text-sm font-semibold"
                    aria-label="Delete routine"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={save}
                  className="flex-1 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
                >
                  {existing ? "Save changes" : "Add routine"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   DAILY TASK FORM (portaled, glass-sheet, centered modal)
   ============================================================ */
function DailyTaskForm({
  open,
  onOpenChange,
  existing,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: DailyTask;
  onSave: (t: Omit<DailyTask, "id" | "createdAt">) => void;
  onDelete?: (id: string) => void;
}) {
  const today = todayStr();
  const [title, setTitle] = React.useState("");
  const [emoji, setEmoji] = React.useState("");
  const [priority, setPriority] = React.useState<"low" | "medium" | "high">(
    "medium"
  );
  const [recurring, setRecurring] = React.useState<
    "none" | "daily" | "weekly" | "monthly"
  >("none");

  React.useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? "");
      setEmoji(existing?.emoji ?? "");
      setPriority(existing?.priority ?? "medium");
      setRecurring(existing?.recurring ?? "none");
    }
  }, [open, existing]);

  const save = () => {
    if (!title.trim()) {
      onOpenChange(false);
      return;
    }
    onSave({
      title: title.trim(),
      emoji: emoji.trim() || undefined,
      priority,
      date: existing?.date ?? today,
      completed: existing?.completed ?? false,
      completedAt: existing?.completedAt,
      recurring,
    });
    onOpenChange(false);
  };

  const RECURRING_OPTIONS: {
    id: "none" | "daily" | "weekly" | "monthly";
    label: string;
  }[] = [
    { id: "none", label: "Once" },
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
  ];

  const emojiOptions = [
    "💧", "🥗", "🏃", "🧘", "📖", "💊", "🛒", "📞",
    "✉️", "🧹", "💼", "🎯",
  ];

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
                      {existing ? "Edit task" : "New task"}
                    </p>
                    <h2 className="text-headline text-text-primary">
                      Today's plan
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
                {/* Title */}
                <div>
                  <p className="text-label text-text-tertiary mb-2">
                    What needs doing
                  </p>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Drink 2L water"
                    className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                  />
                </div>

                {/* Emoji */}
                <div>
                  <p className="text-label text-text-tertiary mb-2">
                    Icon (optional)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      maxLength={2}
                      placeholder="—"
                      className="w-14 h-12 text-center text-2xl rounded-2xl bg-surface-secondary border border-border px-2 outline-none focus:border-primary/40 placeholder:text-text-tertiary"
                    />
                    <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
                      {emojiOptions.map((e) => (
                        <button
                          key={e}
                          onClick={() => setEmoji(e)}
                          className={cn(
                            "shrink-0 w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all",
                            emoji === e
                              ? "border-primary bg-surface shadow-glow"
                              : "border-border bg-surface"
                          )}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-label text-text-tertiary mb-2.5">
                    Priority
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {TASK_PRIORITY_META.map((p) => (
                      <motion.button
                        key={p.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setPriority(p.id)}
                        className={cn(
                          "rounded-2xl p-3 border-2 text-center transition-all flex flex-col items-center gap-1.5",
                          priority === p.id
                            ? "border-primary bg-surface shadow-glow"
                            : "border-border bg-surface"
                        )}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-caption font-semibold text-text-primary">
                          {p.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Recurring */}
                <div>
                  <p className="text-label text-text-tertiary mb-2.5">Repeat</p>
                  <div className="grid grid-cols-4 gap-2">
                    {RECURRING_OPTIONS.map((o) => (
                      <motion.button
                        key={o.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setRecurring(o.id)}
                        className={cn(
                          "rounded-2xl py-2.5 px-2 border-2 text-center transition-all text-xs font-semibold",
                          recurring === o.id
                            ? "border-primary bg-surface shadow-glow text-text-primary"
                            : "border-border bg-surface text-text-secondary"
                        )}
                      >
                        {o.label}
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
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={save}
                  className="flex-1 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
                >
                  {existing ? "Save changes" : "Add task"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
