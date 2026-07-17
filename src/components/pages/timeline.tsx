"use client";

import * as React from "react";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Sunrise, Sun, Moon, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { todayStr } from "@/lib/helpers";
import {
  SurfaceCard,
  IconBadge,
  StaggerItem,
  EmptyState,
  Pressable,
} from "@/components/premium/primitives";
import {
  REMINDER_CATEGORIES,
  CARE_ROUTINES,
} from "@/lib/types";
import type { TabId } from "@/components/app-shell";

/* ============================================================
   Timeline — a beautiful chronological view of today's
   logged activities, grouped by time-of-day.
   ============================================================ */

type EventCategory =
  | "water"
  | "mood"
  | "journal"
  | "care"
  | "cycle"
  | "task"
  | "reminder";

interface TimelineEvent {
  id: string;
  time: Date;
  emoji: string;
  title: string;
  subtitle?: string;
  category: EventCategory;
  color: string;
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  water: "var(--chart-2)",
  mood: "var(--chart-4)",
  journal: "var(--chart-1)",
  care: "var(--chart-3)",
  cycle: "var(--primary)",
  task: "var(--chart-5)",
  reminder: "var(--warning)",
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  water: "Hydration",
  mood: "Mood",
  journal: "Journal",
  care: "Self-care",
  cycle: "Cycle",
  task: "Task",
  reminder: "Reminder",
};

function routineDefaultTime(routine: string): string {
  switch (routine) {
    case "morning":
      return "08:00";
    case "afternoon":
      return "14:00";
    case "night":
      return "21:00";
    default:
      return "12:00";
  }
}

function partOfDay(h: number): "morning" | "afternoon" | "night" {
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "night";
}

const PART_META = {
  morning: { label: "Morning", emoji: "🌅", icon: Sunrise, tint: "var(--chart-4)" },
  afternoon: { label: "Afternoon", emoji: "☀️", icon: Sun, tint: "var(--warning)" },
  night: { label: "Night", emoji: "🌙", icon: Moon, tint: "var(--chart-5)" },
} as const;

export function Timeline({
  onNavigate,
}: {
  onNavigate?: (t: TabId) => void;
}) {
  const reduce = useReducedMotion();
  const {
    hydrationLogs,
    moodLogs,
    journalEntries,
    cycleEntries,
    careTasks,
    dailyTasks,
    reminders,
    settings,
  } = useStore();

  const today = todayStr();
  const todayWeekday = new Date().getDay();

  // ----- Gather today's events from all log sources -----
  const events = React.useMemo<TimelineEvent[]>(() => {
    const out: TimelineEvent[] = [];

    // 1. Hydration logs (water)
    for (const log of hydrationLogs) {
      if (!log.timestamp.startsWith(today)) continue;
      if (log.amount <= 0) continue;
      out.push({
        id: log.id,
        time: new Date(log.timestamp),
        emoji: "💧",
        title: `+${log.amount}ml water`,
        subtitle: "Hydration logged",
        category: "water",
        color: CATEGORY_COLORS.water,
      });
    }

    // 2. Mood logs
    for (const log of moodLogs) {
      if (!log.timestamp.startsWith(today)) continue;
      out.push({
        id: log.id,
        time: new Date(log.timestamp),
        emoji: log.mood,
        title: "Mood check-in",
        subtitle: log.note ?? "Mood logged",
        category: "mood",
        color: CATEGORY_COLORS.mood,
      });
    }

    // 3. Journal entries
    for (const j of journalEntries) {
      if (j.archived) continue;
      if (j.date.split("T")[0] !== today) continue;
      out.push({
        id: j.id,
        time: new Date(j.date),
        emoji: j.sticker ?? "📔",
        title: j.title || "Journal entry",
        subtitle: j.reflection?.slice(0, 60) || undefined,
        category: "journal",
        color: CATEGORY_COLORS.journal,
      });
    }

    // 4. Care task completions (today)
    for (const c of careTasks) {
      if (c.archived) continue;
      if (c.completion[today] !== true) continue;
      const timeStr = c.time ?? routineDefaultTime(c.routine);
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      const routineMeta = CARE_ROUTINES.find((r) => r.id === c.routine);
      out.push({
        id: c.id,
        time: d,
        emoji: c.emoji ?? routineMeta?.emoji ?? "✨",
        title: c.title,
        subtitle: `${routineMeta?.label ?? "Self-care"} routine`,
        category: "care",
        color: CATEGORY_COLORS.care,
      });
    }

    // 5. Cycle entries (today)
    for (const e of cycleEntries) {
      if (e.archived) continue;
      if (e.date !== today) continue;
      const d = new Date(e.date + "T12:00:00");
      out.push({
        id: e.id,
        time: d,
        emoji: e.isPeriod ? "🌸" : "🌿",
        title: e.isPeriod
          ? `Period${e.flow ? ` · ${e.flow}` : ""}`
          : "Cycle entry",
        subtitle:
          e.symptoms.length > 0
            ? e.symptoms.slice(0, 3).join(", ")
            : e.notes?.slice(0, 60) || undefined,
        category: "cycle",
        color: CATEGORY_COLORS.cycle,
      });
    }

    // 6. Daily task completions (today)
    for (const t of dailyTasks) {
      if (t.archived) continue;
      if (t.date !== today) continue;
      if (!t.completed || !t.completedAt) continue;
      out.push({
        id: t.id,
        time: new Date(t.completedAt),
        emoji: t.emoji ?? "✅",
        title: t.title,
        subtitle: "Task completed",
        category: "task",
        color: CATEGORY_COLORS.task,
      });
    }

    // 7. Reminders scheduled for today (medicine / supplements / etc.)
    for (const r of reminders) {
      if (r.archived || !r.enabled) continue;
      if (r.days[todayWeekday] !== true) continue;
      const [h, m] = r.time.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      const catMeta = REMINDER_CATEGORIES.find((c) => c.id === r.category);
      out.push({
        id: r.id,
        time: d,
        emoji: catMeta?.emoji ?? "🔔",
        title: r.title,
        subtitle: `${catMeta?.label ?? "Reminder"} · scheduled`,
        category: "reminder",
        color: CATEGORY_COLORS.reminder,
      });
    }

    // Sort chronologically (ascending)
    return out.sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [
    hydrationLogs,
    moodLogs,
    journalEntries,
    cycleEntries,
    careTasks,
    dailyTasks,
    reminders,
    today,
    todayWeekday,
  ]);

  // ----- Group by part of day -----
  const grouped = React.useMemo(() => {
    const g: Record<"morning" | "afternoon" | "night", TimelineEvent[]> = {
      morning: [],
      afternoon: [],
      night: [],
    };
    for (const e of events) {
      g[partOfDay(e.time.getHours())].push(e);
    }
    return g;
  }, [events]);

  const hasAny = events.length > 0;
  const now = new Date();

  return (
    <div className="space-y-4">
      {/* ===== Header ===== */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] p-5 text-primary-foreground gradient-primary-bg shadow-glow"
      >
        <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-label text-primary-foreground/80 tracking-elegant">
            {format(now, "EEEE")}
          </p>
          <h1 className="text-display-serif mt-0.5">
            Today&rsquo;s <span className="italic">Timeline</span>
          </h1>
          <p className="text-sm text-primary-foreground/85 mt-1.5">
            {format(now, "MMMM d, yyyy")} ·{" "}
            <span className="font-semibold">
              {events.length} {events.length === 1 ? "moment" : "moments"}
            </span>{" "}
            logged
          </p>
        </div>
      </motion.div>

      {/* ===== Body ===== */}
      {!hasAny ? (
        <EmptyState
          emoji="🌱"
          title="Nothing logged yet today"
          description="Your timeline will fill as you go — log water, mood, journal, care or complete a task."
        />
      ) : (
        <div className="space-y-5">
          {(["morning", "afternoon", "night"] as const).map((part) => {
            const items = grouped[part];
            if (items.length === 0) return null;
            const meta = PART_META[part];
            const PartIcon = meta.icon;
            return (
              <StaggerItem key={part} index={part === "morning" ? 1 : part === "afternoon" ? 2 : 3}>
                {/* Part header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${meta.tint}1a`,
                      backgroundImage: `linear-gradient(135deg, ${meta.tint}26, ${meta.tint}0d)`,
                    }}
                  >
                    <PartIcon size={16} style={{ color: meta.tint }} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-headline-serif text-text-primary text-lg leading-tight">
                      {meta.label} {meta.emoji}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {items.length} {items.length === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                </div>

                {/* Timeline rail for this part */}
                <SurfaceCard className="p-4">
                  <div className="relative pl-6">
                    {/* rail */}
                    <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-divider" />
                    <div className="space-y-3">
                      {items.map((e, i) => (
                        <motion.div
                          key={e.id}
                          initial={reduce ? false : { opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: reduce ? 0 : i * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="relative"
                        >
                          {/* animated node */}
                          <motion.div
                            className="absolute -left-[18px] top-1 w-3.5 h-3.5 rounded-full border-2 border-background z-10 flex items-center justify-center"
                            style={{ background: e.color }}
                            animate={
                              reduce
                                ? undefined
                                : { scale: [1, 1.18, 1] }
                            }
                            transition={{
                              duration: 2.4,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          >
                            <span
                              className="w-1 h-1 rounded-full bg-background"
                              aria-hidden
                            />
                          </motion.div>

                          {/* event row */}
                          <div className="flex items-start gap-2.5">
                            <span className="text-xl shrink-0 leading-none mt-0.5">
                              {e.emoji}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-text-primary leading-tight truncate">
                                    {e.title}
                                  </p>
                                  {e.subtitle && (
                                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-snug">
                                      {e.subtitle}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                  <span
                                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                    style={{
                                      color: e.color,
                                      backgroundColor: `${e.color}14`,
                                    }}
                                  >
                                    {CATEGORY_LABELS[e.category]}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-text-tertiary tabular-nums">
                                <Clock size={10} />
                                {format(e.time, "h:mm a")}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </SurfaceCard>
              </StaggerItem>
            );
          })}

          {/* ===== Summary footer card ===== */}
          <StaggerItem index={4}>
            <SurfaceCard className="p-4" elevated>
              <div className="flex items-center gap-3">
                <IconBadge icon={Clock} variant="soft" size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-label text-text-tertiary">Day Summary</p>
                  <p className="text-sm font-bold text-text-primary mt-0.5">
                    {events.length} moments across{" "}
                    {(["morning", "afternoon", "night"] as const).filter(
                      (p) => grouped[p].length > 0
                    ).length}{" "}
                    parts of the day
                  </p>
                </div>
              </div>

              {/* Category breakdown chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(
                  Object.keys(CATEGORY_LABELS) as EventCategory[]
                ).map((cat) => {
                  const count = events.filter((e) => e.category === cat).length;
                  if (count === 0) return null;
                  return (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{
                        color: CATEGORY_COLORS[cat],
                        backgroundColor: `${CATEGORY_COLORS[cat]}14`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: CATEGORY_COLORS[cat] }}
                      />
                      {CATEGORY_LABELS[cat]} · {count}
                    </span>
                  );
                })}
              </div>

              {onNavigate && (
                <Pressable
                  onClick={() => onNavigate("home")}
                  className="mt-3 w-full py-2.5 rounded-2xl bg-surface-secondary text-text-primary text-xs font-semibold border border-border flex items-center justify-center gap-1"
                >
                  Back to dashboard
                  <ChevronRight size={12} />
                </Pressable>
              )}
            </SurfaceCard>
          </StaggerItem>
        </div>
      )}
    </div>
  );
}
