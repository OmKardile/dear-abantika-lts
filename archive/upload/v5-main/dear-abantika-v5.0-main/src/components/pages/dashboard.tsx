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
import { MEDICAL_DISCLAIMER } from "@/lib/types";
import type { TabId } from "@/components/app-shell";

const TIPS = [
  "Take three slow breaths. Let your shoulders drop away from your ears.",
  "A glass of water now is a small kindness to your future self.",
  "Notice one thing around you that feels quietly beautiful.",
  "Stretch your fingers, your wrists, your jaw — release what you're holding.",
  "You don't have to earn rest. It belongs to you.",
];

const PRIORITY_DOT: Record<"low" | "medium" | "high", string> = {
  low: "var(--text-tertiary)",
  medium: "var(--warning)",
  high: "var(--error)",
};

export function Dashboard({
  onNavigate,
}: {
  onNavigate: (t: TabId) => void;
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
    settings,
    addWater,
    setMood,
    toggleDailyTask,
  } = useStore();

  const [moodOpen, setMoodOpen] = React.useState(false);
  const [tipIdx, setTipIdx] = React.useState(() =>
    Math.floor(Math.random() * TIPS.length)
  );

  const today = todayStr();
  const todayWeekday = new Date().getDay();
  const hydrationPct = Math.min(
    (hydration.current / hydration.goal) * 100,
    100
  );

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

  // ----- Current cycle day (days since last period start + 1) -----
  const cycleDay = React.useMemo(() => {
    if (!lastPeriodStart) return null;
    const start = new Date(lastPeriodStart + "T00:00:00");
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return Math.floor((t.getTime() - start.getTime()) / 86_400_000) + 1;
  }, [lastPeriodStart]);

  // ----- Period prediction (last period + avg cycle length) -----
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

  // ----- Next enabled reminder -----
  const nextReminder = React.useMemo(() => {
    const enabled = reminders.filter((r) => r.enabled && !r.archived);
    if (!enabled.length) return null;
    const now = new Date();
    let best: { r: (typeof enabled)[number]; t: number } | null = null;
    for (const r of enabled) {
      const [h, m] = r.time.split(":").map(Number);
      const t = new Date();
      t.setHours(h, m, 0, 0);
      if (t <= now) t.setDate(t.getDate() + 1);
      if (!best || t.getTime() < best.t) best = { r, t: t.getTime() };
    }
    return best?.r ?? null;
  }, [reminders]);

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

  // ----- Wellness score (0-100) -----
  const wellnessScore = React.useMemo(() => {
    const h = (hydrationPct / 100) * 25;
    const m = moodLoggedToday ? 15 : 0;
    const c = (carePct / 100) * 25;
    const t = (tasksPct / 100) * 20;
    const j = journalToday ? 15 : 0;
    return Math.round(h + m + c + t + j);
  }, [hydrationPct, moodLoggedToday, carePct, tasksPct, journalToday]);

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

    // Top symptom this cycle (since last period start)
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

  // ----- Top 3 daily tasks for mini-list (priority order: high→low) -----
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

  const quickActions = [
    {
      label: "Log Water",
      icon: Droplet,
      tint: "var(--chart-2)",
      action: () => addWater(250),
    },
    {
      label: "Log Mood",
      icon: Smile,
      tint: "var(--chart-4)",
      action: () => setMoodOpen(true),
    },
    {
      label: "Cycle",
      icon: Flower2,
      tint: "var(--primary)",
      action: () => onNavigate("cycle"),
    },
    {
      label: "Care",
      icon: Sparkles,
      tint: "var(--chart-3)",
      action: () => onNavigate("care"),
    },
  ] as const;

  // Wellness breakdown bars
  const wellnessBreakdown = [
    {
      label: "Hydration",
      value: hydrationPct,
      color: "var(--chart-2)",
    },
    {
      label: "Mood",
      value: moodLoggedToday ? 100 : 0,
      color: "var(--chart-4)",
    },
    {
      label: "Care",
      value: carePct,
      color: "var(--primary)",
    },
    {
      label: "Tasks",
      value: tasksPct,
      color: "var(--chart-3)",
    },
    {
      label: "Journal",
      value: journalToday ? 100 : 0,
      color: "var(--chart-1)",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ===== 1. Hero Greeting (KEEP) ===== */}
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
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="text-display-serif mt-1">
            Hello, <span className="italic">Abantika</span>
          </h1>
          <p className="text-sm text-primary-foreground/85 mt-1.5 max-w-[18rem]">
            {greetingSub()}
          </p>

          {/* mini stats — water streak + journal streak */}
          <div className="mt-3.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-primary-foreground/90">
              <Flame size={14} className="text-primary-foreground" />
              <span className="text-xs font-bold tabular-nums">
                {waterStreak}
              </span>
              <span className="text-[10px] text-primary-foreground/70">
                water
              </span>
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
          </div>
        </div>
      </motion.div>

      {/* ===== 2. Quick Actions Row ===== */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <StaggerItem key={a.label} index={i}>
              <Pressable
                onClick={a.action}
                className="w-full flex flex-col items-center gap-1.5 p-2.5 rounded-[18px] surface-card active:scale-95"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${a.tint}1a`,
                    backgroundImage: `linear-gradient(135deg, ${a.tint}26, ${a.tint}0d)`,
                  }}
                >
                  <Icon size={20} style={{ color: a.tint }} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] font-semibold text-text-primary leading-tight text-center">
                  {a.label}
                </span>
              </Pressable>
            </StaggerItem>
          );
        })}
      </div>

      {/* ===== 3. 2×2 Status Grid: Mood | Cycle Day | Self-Care | Next Reminder ===== */}
      <div className="grid grid-cols-2 gap-3">
        {/* Mood (top-left) */}
        <StaggerItem index={2}>
          <Pressable
            onClick={() => setMoodOpen(true)}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--chart-4)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Mood
                </span>
              </div>
              <motion.div
                animate={
                  reduce
                    ? undefined
                    : { y: [0, -4, 0], rotate: [0, 6, -6, 0] }
                }
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl text-center my-1"
              >
                {mood.current}
              </motion.div>
              <p className="text-[11px] text-text-secondary text-center">Today</p>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>

        {/* Cycle Day (top-right) */}
        <StaggerItem index={3}>
          <Pressable
            onClick={() => onNavigate("cycle")}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Cycle Day
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-1 my-1">
                {cycleDay !== null ? (
                  <>
                    <span className="text-2xl font-extrabold text-text-primary tabular-nums leading-none">
                      <AnimatedCounter value={cycleDay} />
                    </span>
                    <span className="text-[10px] text-text-tertiary font-semibold">
                      / {cycleLengthAvg}
                    </span>
                  </>
                ) : (
                  <Flower2 size={26} className="text-primary" strokeWidth={2} />
                )}
              </div>
              <p className="text-[11px] text-text-secondary text-center truncate">
                {cycleDay !== null ? "of current cycle" : "Begin tracking"}
              </p>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>

        {/* Self-Care Score (bottom-left) */}
        <StaggerItem index={4}>
          <Pressable
            onClick={() => onNavigate("care")}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--chart-3)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Self-Care
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-0.5 my-1">
                <span className="text-2xl font-extrabold text-text-primary tabular-nums leading-none">
                  <AnimatedCounter value={Math.round(carePct)} />
                </span>
                <span className="text-sm font-bold text-text-tertiary">%</span>
              </div>
              <p className="text-[11px] text-text-secondary text-center">
                {careCompletedCount}/{todaysCareTasks.length} done
              </p>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>

        {/* Next Reminder (bottom-right) */}
        <StaggerItem index={5}>
          <Pressable
            onClick={() => onNavigate("reminders")}
            className="w-full text-left h-full"
          >
            <SurfaceCard className="p-4 h-full flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--chart-3)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Next
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary text-center my-1 line-clamp-2 leading-tight">
                {nextReminder ? nextReminder.title : "No alerts"}
              </p>
              <p className="text-[11px] text-text-secondary text-center">
                {nextReminder ? timeUntil(nextReminder.time) : "Set one up"}
              </p>
            </SurfaceCard>
          </Pressable>
        </StaggerItem>
      </div>

      {/* ===== 4. Hydration Wave Card (KEEP, compact) ===== */}
      <StaggerItem index={6}>
        <SurfaceCard className="relative overflow-hidden p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-label text-text-tertiary">Hydration</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold text-text-primary tabular-nums">
                  <AnimatedCounter value={hydration.current} />ml
                </span>
                <span className="text-caption text-text-secondary">
                  / {hydration.goal}ml
                </span>
              </div>
            </div>
            <IconBadge icon={Droplet} variant="solid" size={36} />
          </div>

          {/* Wave progress */}
          <div className="relative h-14 rounded-2xl overflow-hidden bg-surface-secondary">
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: "var(--gradient-primary)" }}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${hydrationPct}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { x: "-50%" }}
              animate={reduce ? undefined : { x: ["-50%", "0%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              style={{ width: "200%" }}
            >
              <div
                className="absolute inset-y-0 left-0 w-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
                }}
              />
              <div
                className="absolute inset-y-0 left-1/2 w-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
                }}
              />
            </motion.div>
            <div className="relative h-full flex items-center justify-between px-3.5">
              <span className="text-xs font-bold text-primary-foreground drop-shadow-sm">
                {Math.round(hydrationPct)}%
              </span>
              <div className="flex items-center gap-1.5 text-primary-foreground/90">
                <Waves size={13} />
                <span className="text-[11px] font-medium">
                  {hydrationPct >= 100
                    ? "Goal complete!"
                    : `${hydration.goal - hydration.current}ml to go`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Pressable
              onClick={() => addWater(250)}
              className="flex-1 py-2 rounded-2xl gradient-primary-bg text-primary-foreground text-xs font-semibold shadow-glow flex items-center justify-center"
            >
              +250ml
            </Pressable>
            <Pressable
              onClick={() => addWater(500)}
              className="flex-1 py-2 rounded-2xl bg-surface-secondary text-text-primary text-xs font-semibold border border-border flex items-center justify-center"
            >
              +500ml
            </Pressable>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* ===== 5. Wellness Summary Card (NEW) ===== */}
      <StaggerItem index={7}>
        <SurfaceCard className="p-4">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <p className="text-label text-text-tertiary">Wellness Score</p>
              <p className="text-headline-serif text-text-primary mt-0.5">
                Today&rsquo;s balance
              </p>
            </div>
            <IconBadge icon={HeartPulse} variant="soft" size={36} />
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing
              progress={wellnessScore / 100}
              size={108}
              stroke={11}
              gradientId="wellness-ring"
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-text-primary tabular-nums leading-none">
                  <AnimatedCounter value={wellnessScore} />
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5 font-semibold">
                  of 100
                </span>
              </div>
            </ProgressRing>

            <div className="flex-1 space-y-1.5 min-w-0">
              {wellnessBreakdown.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {b.label}
                    </span>
                    <span className="text-[10px] font-bold text-text-tertiary tabular-nums">
                      {Math.round(b.value)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
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
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* ===== 6. PCOS Insights Card (ONLY if settings.pcos.enabled) ===== */}
      {pcosInsights && (
        <StaggerItem index={8}>
          <SurfaceCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <IconBadge icon={HeartPulse} variant="solid" size={32} />
              <div className="min-w-0">
                <p className="text-label text-text-tertiary">PCOS Insights</p>
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

              {/* Top symptom this cycle */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-secondary">
                <div className="flex items-center gap-2 min-w-0">
                  <Activity size={15} className="text-chart-3 shrink-0" />
                  <span className="text-xs font-semibold text-text-primary truncate">
                    Top symptom
                  </span>
                </div>
                <span className="text-xs font-bold text-text-secondary shrink-0 ml-2 truncate max-w-[40%]">
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

      {/* ===== 7. Period Prediction Card ===== */}
      <StaggerItem index={9}>
        <SurfaceCard className="p-4">
          <div className="flex items-center gap-3">
            <IconBadge icon={CalendarHeart} variant="solid" size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-label text-text-tertiary">Period Prediction</p>
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
                    Expected: {format(periodPrediction.next, "EEE, MMM d")} ·{" "}
                    {cycleLengthAvg}-day cycle
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

      {/* ===== 8. Today's Tasks Mini-List ===== */}
      <StaggerItem index={10}>
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

      {/* ===== 9. Daily Reflection (KEEP glass-card) ===== */}
      <StaggerItem index={11}>
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
              className="text-4xl mb-2.5"
            >
              🌸
            </motion.div>
            <p className="text-[10px] font-bold uppercase tracking-elegant text-text-tertiary mb-2">
              Daily Reflection
            </p>
            <p className="font-serif text-base text-text-primary leading-relaxed max-w-[20rem] italic">
              {TIPS[tipIdx]}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIdx(i)}
                  aria-label={`Reflection ${i + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === tipIdx ? 22 : 6,
                    background:
                      i === tipIdx ? "var(--primary)" : "var(--border)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </StaggerItem>

      <MoodDialog
        open={moodOpen}
        onOpenChange={setMoodOpen}
        onSelect={(m) => setMood(m)}
      />
    </div>
  );
}
