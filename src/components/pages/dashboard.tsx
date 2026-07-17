"use client";

import * as React from "react";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import {
  Droplet,
  Smile,
  Flower2,
  Flame,
  Waves,
  Sparkles,
  CalendarHeart,
  BookHeart,
  ChevronRight,
  Check,
  HeartPulse,
  AlertTriangle,
  Activity,
  Quote as QuoteIcon,
  Lightbulb,
  Clock,
  Sunrise,
  Sun,
  Moon,
  Search,
  Trophy,
  FileText,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  greeting,
  greetingSub,
  formatTime,
  timeUntil,
  todayStr,
} from "@/lib/helpers";
import {
  SurfaceCard,
  IconBadge,
  StaggerItem,
  AnimatedCounter,
  Pressable,
  ProgressRing,
} from "@/components/premium/primitives";
import { MoodDialog } from "@/components/forms/mood-dialog";
import {
  MEDICAL_DISCLAIMER,
  DAILY_QUOTES,
  DAILY_WELLNESS_TIPS,
  REMINDER_CATEGORIES,
} from "@/lib/types";
import type { TabId } from "@/components/app-shell";

const PRIORITY_DOT: Record<"low" | "medium" | "high", string> = {
  low: "var(--text-tertiary)",
  medium: "var(--warning)",
  high: "var(--error)",
};

/** Day-of-year index (1-366) for deterministic daily quote/tip rotation. */
function dayOfYear(d: Date): number {
  return Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
      Date.UTC(d.getFullYear(), 0, 0)) /
      86_400_000
  );
}

/** Default time-of-day for a care routine when none is set. */
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

type TimelineEvent = {
  time: Date;
  emoji: string;
  title: string;
  color: string;
};

export function Dashboard({
  onNavigate,
  onOpenOverlay,
}: {
  onNavigate: (t: TabId) => void;
  onOpenOverlay?: (id: "timeline" | "insights" | "achievements" | "reports" | "search") => void;
}) {
  const reduce = useReducedMotion();
  const {
    hydration,
    mood,
    cycleEntries,
    reminders,
    journalEntries,
    careTasks,
    dailyTasks,
    hydrationLogs,
    moodLogs,
    settings,
    addWater,
    setMood,
    toggleDailyTask,
  } = useStore();

  const [moodOpen, setMoodOpen] = React.useState(false);

  const today = todayStr();
  const now = new Date();
  const todayWeekday = now.getDay();
  const hydrationPct = Math.min(
    (hydration.current / hydration.goal) * 100,
    100
  );

  // ----- Deterministic daily quote + tip (day-of-year index) -----
  const quoteIdx = dayOfYear(now) % DAILY_QUOTES.length;
  const tipIdx = dayOfYear(now) % DAILY_WELLNESS_TIPS.length;

  // ----- Water streak: consecutive days (incl. today) with >0 intake -----
  const waterStreak = React.useMemo(() => {
    const map = new Map(hydration.history.map((h) => [h.date, h.amount]));
    let s = 0;
    const d = new Date();
    const todayKey = d.toISOString().split("T")[0];
    if (hydration.current > 0 || (map.get(todayKey) ?? 0) > 0) {
      let cur = new Date(d);
      while (true) {
        const key = cur.toISOString().split("T")[0];
        const amt = key === todayKey ? hydration.current : map.get(key) ?? 0;
        if (amt > 0) {
          s++;
          cur.setDate(cur.getDate() - 1);
        } else break;
      }
    }
    return s;
  }, [hydration]);

  // ----- Journal streak: consecutive days with journal entries -----
  const journalStreak = React.useMemo(() => {
    const dates = new Set(journalEntries.map((j) => j.date.split("T")[0]));
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (dates.has(key)) {
        s++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  }, [journalEntries]);

  // ----- Last period start (PCOS override > most recent period entry) -----
  const lastPeriodStart = React.useMemo(() => {
    if (settings.pcos.enabled && settings.pcos.lastPeriodStart) {
      return settings.pcos.lastPeriodStart;
    }
    const periods = cycleEntries.filter((e) => e.isPeriod && !e.archived);
    if (periods.length === 0) return null;
    const sorted = [...periods].sort((a, b) => a.date.localeCompare(b.date));
    return sorted[sorted.length - 1].date;
  }, [cycleEntries, settings.pcos]);

  // ----- Average cycle length (PCOS override > computed > default 28) -----
  const cycleLengthAvg = React.useMemo(() => {
    if (settings.pcos.enabled && settings.pcos.cycleLengthAvg) {
      return settings.pcos.cycleLengthAvg;
    }
    const periods = cycleEntries
      .filter((e) => e.isPeriod && !e.archived)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (periods.length < 2) return 28;
    const diffs: number[] = [];
    for (let i = 1; i < periods.length; i++) {
      const a = new Date(periods[i - 1].date + "T00:00:00");
      const b = new Date(periods[i].date + "T00:00:00");
      diffs.push(Math.round((b.getTime() - a.getTime()) / 86_400_000));
    }
    return Math.round(diffs.reduce((x, y) => x + y, 0) / diffs.length);
  }, [cycleEntries, settings.pcos]);

  // ----- Current cycle day -----
  const cycleDay = React.useMemo(() => {
    if (!lastPeriodStart) return null;
    const start = new Date(lastPeriodStart + "T00:00:00");
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return Math.floor((t.getTime() - start.getTime()) / 86_400_000) + 1;
  }, [lastPeriodStart]);

  // ----- Period prediction -----
  const periodPrediction = React.useMemo(() => {
    if (!lastPeriodStart) return null;
    const start = new Date(lastPeriodStart + "T00:00:00");
    const next = new Date(start);
    next.setDate(next.getDate() + cycleLengthAvg);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const days = Math.round((next.getTime() - t.getTime()) / 86_400_000);
    return { next, days };
  }, [lastPeriodStart, cycleLengthAvg]);

  // ----- PCOS confidence (more cycles logged = higher confidence) -----
  const pcosConfidence = React.useMemo(() => {
    if (!settings.pcos.enabled) return null;
    const periods = cycleEntries
      .filter((e) => e.isPeriod && !e.archived)
      .sort((a, b) => a.date.localeCompare(b.date));
    const intervals = periods.length - 1;
    if (intervals <= 0) return 30;
    if (intervals === 1) return 50;
    if (intervals <= 3) return 70;
    return 85;
  }, [settings.pcos.enabled, cycleEntries]);

  // ----- Next enabled reminder -----
  const nextReminder = React.useMemo(() => {
    const enabled = reminders.filter(
      (r) => r.enabled && !r.archived && r.days[todayWeekday] === true
    );
    if (!enabled.length) {
      const anyEnabled = reminders.filter((r) => r.enabled && !r.archived);
      if (!anyEnabled.length) return null;
      return anyEnabled[0];
    }
    const nowMs = Date.now();
    let best: { r: (typeof enabled)[number]; t: number } | null = null;
    for (const r of enabled) {
      const [h, m] = r.time.split(":").map(Number);
      const t = new Date();
      t.setHours(h, m, 0, 0);
      if (t.getTime() <= nowMs) t.setDate(t.getDate() + 1);
      if (!best || t.getTime() < best.t) best = { r, t: t.getTime() };
    }
    return best?.r ?? enabled[0];
  }, [reminders, todayWeekday]);

  // ----- Self-care score (today's care tasks completion) -----
  const todaysCareTasks = React.useMemo(
    () =>
      careTasks.filter(
        (t) => t.enabled && !t.archived && t.days[todayWeekday] === true
      ),
    [careTasks, todayWeekday]
  );
  const careCompletedCount = todaysCareTasks.filter(
    (t) => t.completion[today] === true
  ).length;
  const carePct =
    todaysCareTasks.length > 0
      ? (careCompletedCount / todaysCareTasks.length) * 100
      : 0;

  // ----- Today's daily tasks -----
  const todaysDailyTasks = React.useMemo(
    () => dailyTasks.filter((t) => t.date === today && !t.archived),
    [dailyTasks, today]
  );
  const tasksCompletedCount = todaysDailyTasks.filter((t) => t.completed).length;
  const tasksPct =
    todaysDailyTasks.length > 0
      ? (tasksCompletedCount / todaysDailyTasks.length) * 100
      : 0;

  // ----- Today flags -----
  const moodLoggedToday = mood.date === today;
  const journalToday = journalEntries.some(
    (j) => j.date.split("T")[0] === today
  );

  // ----- Wellness score (0-100) with weighted breakdown -----
  const wellnessScore = React.useMemo(() => {
    const h = (hydrationPct / 100) * 25;
    const m = moodLoggedToday ? 15 : 0;
    const c = (carePct / 100) * 25;
    const t = (tasksPct / 100) * 20;
    const j = journalToday ? 15 : 0;
    return Math.round(h + m + c + t + j);
  }, [hydrationPct, moodLoggedToday, carePct, tasksPct, journalToday]);

  // Wellness breakdown bars (weight = contribution to 100)
  const wellnessBreakdown = [
    { label: "Hydration", weight: 25, value: hydrationPct, color: "var(--chart-2)" },
    { label: "Mood", weight: 15, value: moodLoggedToday ? 100 : 0, color: "var(--chart-4)" },
    { label: "Care", weight: 25, value: carePct, color: "var(--primary)" },
    { label: "Tasks", weight: 20, value: tasksPct, color: "var(--chart-3)" },
    { label: "Journal", weight: 15, value: journalToday ? 100 : 0, color: "var(--chart-1)" },
  ];

  // ----- PCOS insights (only computed if PCOS enabled) -----
  const pcosInsights = React.useMemo(() => {
    if (!settings.pcos.enabled) return null;
    const periods = cycleEntries
      .filter((e) => e.isPeriod && !e.archived)
      .sort((a, b) => a.date.localeCompare(b.date));
    const lengths: number[] = [];
    for (let i = 1; i < periods.length; i++) {
      const a = new Date(periods[i - 1].date + "T00:00:00");
      const b = new Date(periods[i].date + "T00:00:00");
      lengths.push(Math.round((b.getTime() - a.getTime()) / 86_400_000));
    }
    const variance =
      lengths.length >= 2 ? Math.max(...lengths) - Math.min(...lengths) : 0;
    const irregular = variance > 7;

    const since = lastPeriodStart ?? "0000-00-00";
    const entriesThisCycle = cycleEntries.filter(
      (e) => e.date >= since && !e.archived
    );
    const symptomCounts = new Map<string, number>();
    for (const e of entriesThisCycle) {
      for (const s of e.symptoms) {
        symptomCounts.set(s, (symptomCounts.get(s) ?? 0) + 1);
      }
    }
    let topSymptom: string | null = null;
    let topCount = 0;
    for (const [s, c] of symptomCounts) {
      if (c > topCount) {
        topSymptom = s;
        topCount = c;
      }
    }
    return { irregular, variance, lengths, topSymptom, topCount };
  }, [settings.pcos.enabled, cycleEntries, lastPeriodStart]);

  // ----- Top 3 daily tasks (priority: high→low) -----
  const top3Tasks = React.useMemo(() => {
    const priorityOrder: Record<string, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return [...todaysDailyTasks]
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3);
  }, [todaysDailyTasks]);

  // ----- Timeline preview: today's logged activities (water, mood, journal, care) -----
  const todayEvents = React.useMemo<TimelineEvent[]>(() => {
    const events: TimelineEvent[] = [];
    for (const log of hydrationLogs) {
      if (log.timestamp.startsWith(today) && log.amount > 0) {
        events.push({
          time: new Date(log.timestamp),
          emoji: "💧",
          title: `+${log.amount}ml water`,
          color: "var(--chart-2)",
        });
      }
    }
    for (const log of moodLogs) {
      if (log.timestamp.startsWith(today)) {
        events.push({
          time: new Date(log.timestamp),
          emoji: log.mood,
          title: "Mood logged",
          color: "var(--chart-4)",
        });
      }
    }
    for (const j of journalEntries) {
      if (j.date.split("T")[0] === today) {
        events.push({
          time: new Date(j.date),
          emoji: j.sticker ?? "📔",
          title: j.title || "Journal entry",
          color: "var(--chart-1)",
        });
      }
    }
    for (const c of careTasks) {
      if (c.completion[today] === true) {
        const timeStr = c.time ?? routineDefaultTime(c.routine);
        const [h, m] = timeStr.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        events.push({
          time: d,
          emoji: c.emoji ?? "✨",
          title: c.title,
          color: "var(--chart-3)",
        });
      }
    }
    return events
      .sort((a, b) => a.time.getTime() - b.time.getTime())
      .slice(0, 4);
  }, [hydrationLogs, moodLogs, journalEntries, careTasks, today]);

  // ----- Today's Summary mini stat cards -----
  const summaryCards = [
    {
      key: "mood",
      label: "Mood",
      value: moodLoggedToday ? mood.current : "—",
      sub: moodLoggedToday ? "Today" : "Tap to log",
      color: "var(--chart-4)",
      onClick: () => setMoodOpen(true),
    },
    {
      key: "hydration",
      label: "Hydration",
      value: `${Math.round(hydrationPct)}%`,
      sub: `${hydration.current}ml`,
      color: "var(--chart-2)",
      onClick: () => onNavigate("hydration"),
    },
    {
      key: "cycle",
      label: "Cycle Day",
      value: cycleDay !== null ? String(cycleDay) : "—",
      sub: cycleDay !== null ? `of ${cycleLengthAvg}` : "Begin",
      color: "var(--primary)",
      onClick: () => onNavigate("cycle"),
    },
    {
      key: "care",
      label: "Self-Care",
      value: `${Math.round(carePct)}%`,
      sub: `${careCompletedCount}/${todaysCareTasks.length}`,
      color: "var(--chart-3)",
      onClick: () => onNavigate("care"),
    },
    {
      key: "tasks",
      label: "Tasks",
      value: `${tasksCompletedCount}/${todaysDailyTasks.length}`,
      sub: tasksPct >= 100 ? "Done!" : `${Math.round(tasksPct)}%`,
      color: "var(--chart-1)",
      onClick: () => onNavigate("care"),
    },
    {
      key: "reminder",
      label: "Next Up",
      value: nextReminder ? formatTime(nextReminder.time).replace(":00", "") : "—",
      sub: nextReminder ? nextReminder.title : "No alerts",
      color: "var(--warning)",
      onClick: () => onNavigate("reminders"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ===== 1. Hero Greeting (KEEP gradient card) ===== */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] p-5 pb-5 text-primary-foreground gradient-primary-bg shadow-glow"
      >
        {/* floating decorative orbs */}
        <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <motion.div
          aria-hidden
          className="absolute right-4 top-4 text-2xl"
          animate={reduce ? undefined : { rotate: [0, 8, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>

        <div className="relative">
          <p className="text-label text-primary-foreground/80 tracking-elegant">
            {greeting()}
          </p>
          <p className="text-[11px] font-medium text-primary-foreground/55 mt-0.5">
            {format(now, "EEEE, MMMM d")}
          </p>
          <h1 className="text-display-serif mt-1">
            Hello, <span className="italic">Abantika</span>
          </h1>
          <p className="text-sm text-primary-foreground/85 mt-1.5 max-w-[18rem]">
            {greetingSub()}
          </p>

          {/* mini streak stats */}
          <div className="mt-3.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <Flame size={14} className="text-primary-foreground" />
              <span className="text-xs font-bold tabular-nums">
                {waterStreak}
              </span>
              <span className="text-[10px] text-primary-foreground/70">water</span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/30" />
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <BookHeart size={14} />
              <span className="text-xs font-bold tabular-nums">
                {journalStreak}
              </span>
              <span className="text-[10px] text-primary-foreground/70">
                journal
              </span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/30" />
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <HeartPulse size={14} />
              <span className="text-xs font-bold tabular-nums">
                {wellnessScore}
              </span>
              <span className="text-[10px] text-primary-foreground/70">
                wellness
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== 2. Wellness Score Ring (visual centerpiece) ===== */}
      <StaggerItem index={1}>
        <SurfaceCard className="p-5" elevated>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-label text-text-tertiary">Wellness Score</p>
              <p className="text-headline-serif text-text-primary mt-0.5">
                Today&rsquo;s balance
              </p>
            </div>
            <IconBadge icon={HeartPulse} variant="solid" size={40} />
          </div>

          {/* Hero ring + breakdown */}
          <div className="flex flex-col items-center">
            <ProgressRing
              progress={wellnessScore / 100}
              size={148}
              stroke={13}
              gradientId="wellness-ring-hero"
            >
              <div className="flex flex-col items-center">
                <motion.span
                  className="text-4xl font-extrabold text-text-primary tabular-nums leading-none font-serif"
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <AnimatedCounter value={wellnessScore} />
                </motion.span>
                <span className="text-[10px] text-text-tertiary mt-1 font-semibold tracking-elegant uppercase">
                  of 100
                </span>
              </div>
            </ProgressRing>

            {/* 5 mini breakdown bars */}
            <div className="w-full mt-5 space-y-2">
              {wellnessBreakdown.map((b) => (
                <div key={b.label} className="flex items-center gap-2.5">
                  <span className="text-[11px] font-semibold text-text-secondary w-16 shrink-0">
                    {b.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-surface-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: b.color }}
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${b.value}%` }}
                      transition={{
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-text-tertiary tabular-nums w-9 text-right shrink-0">
                    {Math.round(b.value)}%
                  </span>
                  <span className="text-[9px] font-medium text-text-tertiary/70 w-7 text-right shrink-0">
                    {b.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* ===== 3. Today's Summary (2×3 mini stat grid) ===== */}
      <StaggerItem index={2}>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-headline-serif text-text-primary">
            Today&rsquo;s Summary
          </h2>
          <Pressable
            onClick={() => setMoodOpen(true)}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-primary"
          >
            Quick log
            <ChevronRight size={12} />
          </Pressable>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {summaryCards.map((c, i) => (
            <StaggerItem key={c.key} index={i + 3}>
              <Pressable
                onClick={c.onClick}
                className="w-full text-left h-full"
              >
                <SurfaceCard className="p-3 h-full flex flex-col justify-between min-h-[88px]">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary truncate">
                      {c.label}
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-text-primary tabular-nums leading-tight truncate">
                    {c.value}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">
                    {c.sub}
                  </p>
                </SurfaceCard>
              </Pressable>
            </StaggerItem>
          ))}
        </div>
      </StaggerItem>

      {/* ===== 4. Period Countdown ===== */}
      <StaggerItem index={6}>
        <SurfaceCard className="p-4">
          <div className="flex items-center gap-3">
            <IconBadge icon={CalendarHeart} variant="solid" size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-label text-text-tertiary">Period Countdown</p>
              {periodPrediction ? (
                <>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    {periodPrediction.days > 0 ? (
                      <>
                        <span className="text-2xl font-extrabold text-text-primary tabular-nums leading-none">
                          ~<AnimatedCounter value={periodPrediction.days} />
                        </span>
                        <span className="text-xs font-semibold text-text-secondary">
                          days away
                        </span>
                      </>
                    ) : periodPrediction.days === 0 ? (
                      <span className="text-xl font-extrabold text-primary leading-tight">
                        Due today
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl font-extrabold text-primary tabular-nums leading-none">
                          ~<AnimatedCounter value={Math.abs(periodPrediction.days)} />
                        </span>
                        <span className="text-xs font-semibold text-text-secondary">
                          days late
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Expected {format(periodPrediction.next, "EEE, MMM d")} ·{" "}
                    {cycleLengthAvg}-day cycle
                    {settings.pcos.enabled && pcosConfidence !== null && (
                      <>
                        {" · "}
                        <span className="font-semibold text-text-secondary">
                          ±7d window · {pcosConfidence}% conf.
                        </span>
                      </>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-text-secondary mt-0.5">
                  Log a period to predict
                </p>
              )}
            </div>
          </div>
          <p className="text-[10px] text-text-tertiary italic mt-3 leading-relaxed">
            {MEDICAL_DISCLAIMER}
          </p>
        </SurfaceCard>
      </StaggerItem>

      {/* ===== 5. PCOS Insight (conditional) ===== */}
      {pcosInsights && (
        <StaggerItem index={7}>
          <SurfaceCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <IconBadge icon={HeartPulse} variant="solid" size={32} />
              <div className="min-w-0">
                <p className="text-label text-text-tertiary">PCOS Insight</p>
                <p className="text-sm font-bold text-text-primary truncate">
                  Your cycle patterns
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Cycle irregularity */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-secondary">
                <div className="flex items-center gap-2 min-w-0">
                  {pcosInsights.irregular ? (
                    <AlertTriangle size={15} className="text-warning shrink-0" />
                  ) : (
                    <Check size={15} className="text-primary shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-text-primary truncate">
                    Cycle regularity
                  </span>
                </div>
                <span className="text-xs font-bold text-text-secondary shrink-0 ml-2">
                  {pcosInsights.irregular
                    ? `Varies ${pcosInsights.variance}d`
                    : `~${cycleLengthAvg}d cycle`}
                </span>
              </div>

              {/* Top symptom */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-secondary">
                <div className="flex items-center gap-2 min-w-0">
                  <Activity size={15} className="text-chart-3 shrink-0" />
                  <span className="text-xs font-semibold text-text-primary truncate">
                    Top symptom
                  </span>
                </div>
                <span className="text-xs font-bold text-text-secondary shrink-0 ml-2 truncate max-w-[45%]">
                  {pcosInsights.topSymptom
                    ? `${pcosInsights.topSymptom} ×${pcosInsights.topCount}`
                    : "None logged"}
                </span>
              </div>

              {/* Ovulation uncertainty */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-secondary">
                <div className="flex items-center gap-2 min-w-0">
                  <Flower2 size={15} className="text-primary shrink-0" />
                  <span className="text-xs font-semibold text-text-primary truncate">
                    Ovulation
                  </span>
                </div>
                <span className="text-xs font-bold text-text-secondary shrink-0 ml-2">
                  ±5 days uncertain
                </span>
              </div>
            </div>

            <p className="text-[10px] text-text-tertiary italic mt-3 leading-relaxed">
              {MEDICAL_DISCLAIMER}
            </p>
          </SurfaceCard>
        </StaggerItem>
      )}

      {/* ===== 6. Today's Tasks (top 3 + view all) ===== */}
      <StaggerItem index={8}>
        <SurfaceCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="text-label text-text-tertiary">Today&rsquo;s Tasks</p>
              <p className="text-sm font-bold text-text-primary mt-0.5">
                {tasksCompletedCount} of {todaysDailyTasks.length} done
              </p>
            </div>
            <Pressable
              onClick={() => onNavigate("care")}
              className="flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-surface-secondary text-text-secondary text-[11px] font-semibold shrink-0"
            >
              View all
              <ChevronRight size={12} />
            </Pressable>
          </div>

          {top3Tasks.length > 0 ? (
            <div className="space-y-1.5">
              {top3Tasks.map((task) => (
                <Pressable
                  key={task.id}
                  onClick={() => toggleDailyTask(task.id)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-surface-secondary/60 active:scale-[0.98]"
                >
                  <span className="text-lg shrink-0 leading-none">
                    {task.emoji ?? "📌"}
                  </span>
                  <span
                    className={`flex-1 text-xs font-medium text-left truncate ${
                      task.completed
                        ? "text-text-tertiary line-through"
                        : "text-text-primary"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: PRIORITY_DOT[task.priority] }}
                    aria-hidden
                  />
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      task.completed
                        ? "gradient-primary-bg border-transparent"
                        : "border-border bg-surface"
                    }`}
                  >
                    {task.completed && (
                      <Check
                        size={12}
                        className="text-primary-foreground"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                </Pressable>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-2xl mb-1">🌷</p>
              <p className="text-xs text-text-secondary">
                No tasks for today — a gentle day.
              </p>
            </div>
          )}
        </SurfaceCard>
      </StaggerItem>

      {/* ===== 7. Daily Quote (serif italic, rotating by day-of-year) ===== */}
      <StaggerItem index={9}>
        <div className="relative overflow-hidden p-5 text-center rounded-[24px] glass-card">
          <div
            aria-hidden
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{ background: "var(--chart-3)" }}
          />
          <div
            aria-hidden
            className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full opacity-15 blur-2xl"
            style={{ background: "var(--chart-4)" }}
          />
          <div className="relative flex flex-col items-center">
            <motion.div
              animate={
                reduce
                  ? undefined
                  : { y: [0, -4, 0], rotate: [0, 5, -5, 0] }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl mb-2"
            >
              🌸
            </motion.div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <QuoteIcon size={12} className="text-text-tertiary" />
              <p className="text-[10px] font-bold uppercase tracking-elegant text-text-tertiary">
                Daily Quote
              </p>
            </div>
            <p className="font-serif text-base text-text-primary leading-relaxed max-w-[20rem] italic">
              {DAILY_QUOTES[quoteIdx]}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              {DAILY_QUOTES.map((_, i) => (
                <span
                  key={i}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: i === quoteIdx ? 18 : 5,
                    background:
                      i === quoteIdx ? "var(--primary)" : "var(--border)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ===== 8. Daily Wellness Tip (actionable) ===== */}
      <StaggerItem index={10}>
        <SurfaceCard className="p-4 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ background: "var(--chart-2)" }}
          />
          <div className="relative flex items-start gap-3">
            <IconBadge icon={Lightbulb} variant="soft" size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-label text-text-tertiary">Wellness Tip</p>
              <p className="text-sm text-text-primary leading-relaxed mt-1">
                {DAILY_WELLNESS_TIPS[tipIdx]}
              </p>
              <div className="mt-3 flex gap-2">
                <Pressable
                  onClick={() => addWater(250)}
                  className="px-3 py-1.5 rounded-full gradient-primary-bg text-primary-foreground text-[11px] font-semibold shadow-glow flex items-center gap-1"
                >
                  <Droplet size={12} /> +250ml
                </Pressable>
                <Pressable
                  onClick={() => setMoodOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-surface-secondary text-text-primary text-[11px] font-semibold border border-border flex items-center gap-1"
                >
                  <Smile size={12} /> Mood
                </Pressable>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* ===== 9. Timeline Preview (today's logged activities, inline) ===== */}
      <StaggerItem index={11}>
        <SurfaceCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="text-label text-text-tertiary">Timeline Preview</p>
              <p className="text-headline-serif text-text-primary mt-0.5 text-base">
                Today&rsquo;s activity
              </p>
            </div>
            <Pressable
              onClick={() => onNavigate("home")}
              className="flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-surface-secondary text-text-secondary text-[11px] font-semibold shrink-0"
            >
              View timeline
              <ChevronRight size={12} />
            </Pressable>
          </div>

          {todayEvents.length > 0 ? (
            <div className="relative pl-6">
              {/* rail */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-divider" />
              <div className="space-y-2.5">
                {todayEvents.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={reduce ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: reduce ? 0 : i * 0.05,
                    }}
                    className="relative flex items-center gap-2.5"
                  >
                    <div
                      className="absolute -left-[18px] w-3.5 h-3.5 rounded-full border-2 border-background z-10 flex items-center justify-center"
                      style={{ background: e.color }}
                    />
                    <span className="text-base shrink-0 leading-none">
                      {e.emoji}
                    </span>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-text-primary truncate">
                        {e.title}
                      </span>
                      <span className="text-[10px] text-text-tertiary tabular-nums shrink-0 flex items-center gap-0.5">
                        <Clock size={10} />
                        {format(e.time, "h:mm a")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-5 text-center">
              <p className="text-2xl mb-1">🌱</p>
              <p className="text-xs text-text-secondary max-w-[16rem] mx-auto">
                Nothing logged yet today. Your timeline will fill as you go.
              </p>
            </div>
          )}
        </SurfaceCard>
      </StaggerItem>

      {/* ===== Discover more ===== */}
      {onOpenOverlay && (
        <StaggerItem index={9}>
          <div className="grid grid-cols-2 gap-3">
            <Pressable
              onClick={() => onOpenOverlay("search")}
              className="text-left"
            >
              <SurfaceCard className="p-4 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center">
                  <Search size={18} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Search</p>
                <p className="text-caption text-text-secondary">Find anything</p>
              </SurfaceCard>
            </Pressable>
            <Pressable
              onClick={() => onOpenOverlay("timeline")}
              className="text-left"
            >
              <SurfaceCard className="p-4 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center">
                  <Clock size={18} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Timeline</p>
                <p className="text-caption text-text-secondary">Today's story</p>
              </SurfaceCard>
            </Pressable>
            <Pressable
              onClick={() => onOpenOverlay("insights")}
              className="text-left"
            >
              <SurfaceCard className="p-4 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Insights</p>
                <p className="text-caption text-text-secondary">Your patterns</p>
              </SurfaceCard>
            </Pressable>
            <Pressable
              onClick={() => onOpenOverlay("achievements")}
              className="text-left"
            >
              <SurfaceCard className="p-4 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center">
                  <Trophy size={18} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Wins</p>
                <p className="text-caption text-text-secondary">Milestones</p>
              </SurfaceCard>
            </Pressable>
            <Pressable
              onClick={() => onOpenOverlay("reports")}
              className="text-left col-span-2"
            >
              <SurfaceCard className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center">
                  <FileText size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">Wellness Reports</p>
                  <p className="text-caption text-text-secondary">Monthly summary & PDF export</p>
                </div>
                <ChevronRight size={18} className="text-text-tertiary" />
              </SurfaceCard>
            </Pressable>
          </div>
        </StaggerItem>
      )}

      <MoodDialog
        open={moodOpen}
        onOpenChange={setMoodOpen}
        onSelect={(m) => setMood(m)}
      />
    </div>
  );
}
