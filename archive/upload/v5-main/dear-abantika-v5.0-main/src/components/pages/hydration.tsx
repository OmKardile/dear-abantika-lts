"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Droplet,
  Plus,
  Minus,
  RotateCcw,
  Trophy,
  Sunrise,
  Clock,
  Citrus,
  Activity,
  ChevronRight,
  X,
  Pencil,
  Smile,
  History as HistoryIcon,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useStore } from "@/lib/store";
import { todayStr } from "@/lib/helpers";
import type { HydrationLog, MoodLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  AnimatedCounter,
  StaggerItem,
  Pressable,
} from "@/components/premium/primitives";
import { ProgressRing } from "@/components/premium/primitives";
import { SwipeableRow } from "@/components/premium/swipeable-row";
import { useUndo } from "@/components/providers/undo-provider";
import { HydrationLogForm } from "@/components/forms/hydration-log-form";
import { MoodLogForm } from "@/components/forms/mood-log-form";

const TIPS = [
  {
    icon: Sunrise,
    title: "Morning ritual",
    tip: "Begin your day with a full glass of water to gently wake your body.",
    tint: "var(--chart-4)",
  },
  {
    icon: Clock,
    title: "Steady reminders",
    tip: "Sip a little every hour rather than rushing it all at once.",
    tint: "var(--chart-2)",
  },
  {
    icon: Citrus,
    title: "Add some flavor",
    tip: "Lemon, cucumber or mint make water feel like a small treat.",
    tint: "var(--chart-1)",
  },
  {
    icon: Activity,
    title: "Move & drink",
    tip: "Drink extra before, during and after any movement you love.",
    tint: "var(--chart-3)",
  },
];

function fmtTime(iso: string): string {
  try {
    return format(new Date(iso), "h:mm a");
  } catch {
    return "";
  }
}

function fmtRelative(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = now - then;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "yesterday";
    if (d < 7) return `${d}d ago`;
    return format(new Date(iso), "MMM d");
  } catch {
    return "";
  }
}

export function Hydration() {
  const reduce = useReducedMotion();
  const { hydration, addWater, resetWater } = useStore();
  const pct = Math.min((hydration.current / hydration.goal) * 100, 100);

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const key = date.toISOString().split("T")[0];
    const entry = hydration.history.find((h) => h.date === key);
    const isToday = key === todayStr();
    return {
      day: format(date, "EEE"),
      amount: isToday ? hydration.current : entry?.amount ?? 0,
      goal: hydration.goal,
      isToday,
    };
  });

  const avg = Math.round(
    weekly.reduce((a, b) => a + b.amount, 0) / weekly.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          title="Hydration"
          subtitle="Stay soft, stay hydrated"
        />
      </motion.div>

      {/* Hero ring card */}
      <StaggerItem index={0}>
        <SurfaceCard elevated className="relative overflow-hidden p-7">
          <div
            aria-hidden
            className="absolute -top-16 -right-12 w-56 h-56 rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--chart-2)" }}
          />
          <div className="relative flex flex-col items-center">
            <ProgressRing progress={pct / 100} size={200} stroke={16}>
              <div className="flex flex-col items-center">
                <motion.div
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 14 }}
                  className="mb-1"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-primary-bg flex items-center justify-center shadow-glow">
                    <Droplet
                      size={28}
                      className="text-primary-foreground"
                      fill="currentColor"
                    />
                  </div>
                </motion.div>
                <p className="text-headline text-text-primary leading-none">
                  <AnimatedCounter value={hydration.current} />ml
                </p>
                <p className="text-caption text-text-secondary mt-1">
                  of {hydration.goal}ml
                </p>
              </div>
            </ProgressRing>

            <div className="mt-5 text-center">
              <p className="text-headline text-primary">
                <AnimatedCounter value={Math.round(pct)} suffix="%" />
              </p>
              <p className="text-caption text-text-secondary mt-0.5">
                {pct >= 100
                  ? "Goal achieved — beautifully done."
                  : `${hydration.goal - hydration.current}ml remaining today`}
              </p>
            </div>
          </div>

          {/* Quick add */}
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <Pressable
              onClick={() => addWater(-250)}
              className="py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border flex items-center justify-center gap-1.5"
            >
              <Minus size={15} />
              250
            </Pressable>
            <Pressable
              onClick={() => addWater(250)}
              className="py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-1.5"
            >
              <Plus size={15} />
              250ml
            </Pressable>
            <Pressable
              onClick={() => addWater(500)}
              className="py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-1.5"
            >
              <Plus size={15} />
              500ml
            </Pressable>
          </div>
          <Pressable
            onClick={resetWater}
            className="mt-3 w-full py-2.5 rounded-2xl text-text-tertiary text-caption font-semibold flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={13} />
            Reset today
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-3">
        <StaggerItem index={1}>
          <SurfaceCard className="p-4 text-center">
            <Trophy size={18} className="mx-auto text-chart-4" />
            <p className="text-title text-text-primary mt-2">
              {Math.max(0, Math.round((hydration.current / 250) * 1) * 1)}
            </p>
            <p className="text-caption text-text-secondary">glasses</p>
          </SurfaceCard>
        </StaggerItem>
        <StaggerItem index={2}>
          <SurfaceCard className="p-4 text-center">
            <Activity size={18} className="mx-auto text-chart-2" />
            <p className="text-title text-text-primary mt-2">{avg}ml</p>
            <p className="text-caption text-text-secondary">7-day avg</p>
          </SurfaceCard>
        </StaggerItem>
        <StaggerItem index={3}>
          <SurfaceCard className="p-4 text-center">
            <Droplet size={18} className="mx-auto text-chart-1" />
            <p className="text-title text-text-primary mt-2">
              {Math.round((hydration.current / 1000) * 10) / 10}L
            </p>
            <p className="text-caption text-text-secondary">today</p>
          </SurfaceCard>
        </StaggerItem>
      </div>

      {/* Today's logs */}
      <TodaysLogs />

      {/* Recent mood */}
      <RecentMood />

      {/* Weekly chart */}
      <StaggerItem index={4}>
        <SurfaceCard className="p-5">
          <SectionHeader
            title="This week"
            subtitle="Daily intake vs goal"
            className="mb-5"
          />
          <div className="h-52 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} barCategoryGap="22%" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" />
                    <stop offset="100%" stopColor="var(--chart-2)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontWeight: 600 }}
                  dy={6}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-secondary)", radius: 12 }}
                  contentStyle={{
                    background: "var(--elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    boxShadow: "var(--shadow-lifted)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text-secondary)", fontWeight: 600 }}
                  formatter={(v: number) => [`${v} ml`, "Intake"]}
                />
                <Bar dataKey="amount" radius={[10, 10, 6, 6]} maxBarSize={36}>
                  {weekly.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.isToday ? "url(#bar-grad)" : "var(--accent)"}
                      opacity={d.isToday ? 1 : 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* goal line marker */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-divider">
            <span className="w-2.5 h-2.5 rounded-sm gradient-primary-bg" />
            <span className="text-caption text-text-secondary">
              Today · goal {hydration.goal}ml
            </span>
            <span className="w-2.5 h-2.5 rounded-sm bg-accent ml-3" />
            <span className="text-caption text-text-secondary">Past days</span>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* Tips */}
      <div>
        <SectionHeader title="Gentle tips" className="mb-3" />
        <div className="space-y-3">
          {TIPS.map((t, i) => {
            const Icon = t.icon;
            return (
              <StaggerItem key={t.title} index={5 + i}>
                <SurfaceCard className="p-4 flex items-start gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${t.tint}1a` }}
                  >
                    <Icon size={18} style={{ color: t.tint }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-title text-text-primary">{t.title}</p>
                    <p className="text-caption text-text-secondary mt-0.5 leading-relaxed">
                      {t.tip}
                    </p>
                  </div>
                </SurfaceCard>
              </StaggerItem>
            );
          })}
        </div>
      </div>

      {/* Goal info */}
      <StaggerItem index={10}>
        <SurfaceCard className="p-5 text-center">
          <p className="text-body text-text-secondary leading-relaxed">
            Your daily goal is{" "}
            <span className="text-primary font-bold">{hydration.goal}ml</span>.
            The recommended intake for most adults is around 2000ml — about 8
            glasses — adjusted to your body and climate.
          </p>
        </SurfaceCard>
      </StaggerItem>
    </div>
  );
}

/* ==================== TODAY'S LOGS ==================== */
function TodaysLogs() {
  const { hydrationLogs, deleteHydrationLog, addHydrationLog, updateHydrationLog } =
    useStore();
  const { showUndo } = useUndo();
  const [editing, setEditing] = React.useState<HydrationLog | undefined>();
  const [formOpen, setFormOpen] = React.useState(false);

  const today = todayStr();
  const todays = React.useMemo(
    () =>
      hydrationLogs
        .filter((l) => l.timestamp.startsWith(today))
        .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    [hydrationLogs, today]
  );

  const handleDelete = (log: HydrationLog) => {
    deleteHydrationLog(log.id);
    showUndo("Log removed", () => addHydrationLog(log.amount, log.timestamp));
  };

  return (
    <StaggerItem index={3}>
      <SurfaceCard className="p-5">
        <SectionHeader
          title="Today's logs"
          subtitle={
            todays.length === 0
              ? "No water logged yet"
              : `${todays.length} ${todays.length === 1 ? "entry" : "entries"} today`
          }
          className="mb-4"
        />

        {todays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-5 text-center">
            <Droplet size={22} className="mx-auto text-text-tertiary opacity-60" />
            <p className="text-caption text-text-secondary mt-2">
              No logs yet — add water above
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto scroll-area -mr-2 pr-2">
            <AnimatePresence initial={false}>
              {todays.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <SwipeableRow onDelete={() => handleDelete(log)}>
                    <Pressable
                      onClick={() => {
                        setEditing(log);
                        setFormOpen(true);
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            log.amount >= 0
                              ? "gradient-primary-bg"
                              : "bg-error/12"
                          )}
                        >
                          <Droplet
                            size={16}
                            className={
                              log.amount >= 0
                                ? "text-primary-foreground"
                                : "text-error"
                            }
                            fill="currentColor"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-title font-semibold tabular-nums",
                              log.amount >= 0
                                ? "text-primary"
                                : "text-error"
                            )}
                          >
                            {log.amount > 0 ? "+" : ""}
                            {log.amount}ml
                          </p>
                          <p className="text-caption text-text-secondary mt-0.5">
                            {fmtTime(log.timestamp)}
                          </p>
                        </div>
                        <Pencil size={14} className="text-text-tertiary shrink-0" />
                      </div>
                    </Pressable>
                  </SwipeableRow>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </SurfaceCard>

      <HydrationLogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
        onSave={(amount, timestamp) => {
          if (editing) updateHydrationLog(editing.id, { amount, timestamp });
        }}
        onDelete={deleteHydrationLog}
      />
    </StaggerItem>
  );
}

/* ==================== RECENT MOOD ==================== */
function RecentMood() {
  const { moodLogs, deleteMoodLog, addMoodLog, updateMoodLog } = useStore();
  const { showUndo } = useUndo();
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MoodLog | undefined>();
  const [formOpen, setFormOpen] = React.useState(false);

  const recent = React.useMemo(
    () =>
      [...moodLogs]
        .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
        .slice(0, 3),
    [moodLogs]
  );

  const handleDelete = (log: MoodLog) => {
    deleteMoodLog(log.id);
    // addMoodLog signature is (mood, note?) — re-add with the same mood + note.
    showUndo("Mood removed", () => addMoodLog(log.mood, log.note));
  };

  const openEdit = (log: MoodLog) => {
    setEditing(log);
    setFormOpen(true);
  };

  return (
    <StaggerItem index={3}>
      <SurfaceCard className="p-5">
        <SectionHeader
          title="Recent mood"
          subtitle="Latest check-ins"
          className="mb-4"
          action={
            moodLogs.length > 3 ? (
              <Pressable
                onClick={() => setHistoryOpen(true)}
                className="text-caption text-primary font-semibold flex items-center gap-1 shrink-0"
              >
                View all
                <ChevronRight size={14} />
              </Pressable>
            ) : undefined
          }
        />

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-5 text-center">
            <Smile size={22} className="mx-auto text-text-tertiary opacity-60" />
            <p className="text-caption text-text-secondary mt-2">
              No mood logs yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {recent.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <SwipeableRow onDelete={() => handleDelete(log)}>
                    <Pressable
                      onClick={() => openEdit(log)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary">
                        <span className="text-2xl shrink-0">{log.mood}</span>
                        <div className="flex-1 min-w-0">
                          {log.note ? (
                            <p className="text-body text-text-primary truncate">
                              {log.note}
                            </p>
                          ) : (
                            <p className="text-body text-text-secondary italic">
                              No note
                            </p>
                          )}
                          <p className="text-caption text-text-tertiary mt-0.5">
                            {fmtRelative(log.timestamp)}
                          </p>
                        </div>
                        <Pencil size={14} className="text-text-tertiary shrink-0" />
                      </div>
                    </Pressable>
                  </SwipeableRow>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </SurfaceCard>

      {/* Mood history sheet */}
      <MoodHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onEdit={(log) => {
          setHistoryOpen(false);
          openEdit(log);
        }}
        onDelete={handleDelete}
      />

      {/* Edit mood form */}
      <MoodLogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
        onSave={(mood, note) => {
          if (editing) updateMoodLog(editing.id, { mood, note });
        }}
        onDelete={deleteMoodLog}
      />
    </StaggerItem>
  );
}

/* ==================== MOOD HISTORY SHEET ==================== */
function MoodHistorySheet({
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: (log: MoodLog) => void;
  onDelete: (log: MoodLog) => void;
}) {
  const { moodLogs } = useStore();
  const sorted = React.useMemo(
    () =>
      [...moodLogs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    [moodLogs]
  );

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative w-full max-w-md max-h-[90dvh] flex flex-col rounded-t-[32px] sm:rounded-[32px] surface-elevated"
            >
              <div className="sticky top-0 z-10 pt-3 pb-3 px-6 bg-elevated/90 backdrop-blur-xl rounded-t-[32px] border-b border-divider">
                <div className="mx-auto w-10 h-1.5 rounded-full bg-border mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HistoryIcon size={18} className="text-primary" />
                    <div>
                      <p className="text-label text-text-tertiary">
                        All check-ins
                      </p>
                      <h2 className="text-headline text-text-primary">
                        Mood history
                      </h2>
                    </div>
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

              <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
                {sorted.length === 0 ? (
                  <div className="text-center py-10">
                    <Smile size={28} className="mx-auto text-text-tertiary opacity-60" />
                    <p className="text-caption text-text-secondary mt-2">
                      No mood logs yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {sorted.map((log) => (
                        <motion.div
                          key={log.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <SwipeableRow onDelete={() => onDelete(log)}>
                            <Pressable
                              onClick={() => onEdit(log)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary">
                                <span className="text-2xl shrink-0">
                                  {log.mood}
                                </span>
                                <div className="flex-1 min-w-0">
                                  {log.note ? (
                                    <p className="text-body text-text-primary line-clamp-2">
                                      {log.note}
                                    </p>
                                  ) : (
                                    <p className="text-body text-text-secondary italic">
                                      No note
                                    </p>
                                  )}
                                  <p className="text-caption text-text-tertiary mt-0.5">
                                    {fmtRelative(log.timestamp)} ·{" "}
                                    {fmtTime(log.timestamp)}
                                  </p>
                                </div>
                                <Pencil
                                  size={14}
                                  className="text-text-tertiary shrink-0"
                                />
                              </div>
                            </Pressable>
                          </SwipeableRow>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
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
