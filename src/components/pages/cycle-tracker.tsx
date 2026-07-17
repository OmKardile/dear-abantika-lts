"use client";

import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Droplet,
  Search,
  List as ListIcon,
  Check,
  Plus,
  HeartPulse,
  Activity,
  AlertTriangle,
  CalendarClock,
  ShieldAlert,
  Brain,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addDays,
  subDays,
  differenceInDays,
} from "date-fns";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useStore } from "@/lib/store";
import { dateKey } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  MEDICAL_DISCLAIMER,
  PCOS_SYMPTOMS,
  type CycleEntry,
  type SortOption,
} from "@/lib/types";
import {
  SurfaceCard,
  SectionHeader,
  IconBadge,
  EmptyState,
  AnimatedCounter,
  StaggerItem,
  Pressable,
  Chip,
} from "@/components/premium/primitives";
import { SwipeableRow } from "@/components/premium/swipeable-row";
import { SelectionBar } from "@/components/premium/selection-bar";
import { SortMenu } from "@/components/premium/sort-menu";
import { ConfirmDialog } from "@/components/premium/confirm-dialog";
import { useSelection } from "@/hooks/use-selection";
import { useUndo } from "@/components/providers/undo-provider";
import { CycleEntryForm } from "@/components/forms/cycle-entry-form";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

type CycleFilter = "all" | "period" | "symptoms" | "month";
const CYCLE_FILTERS: { id: CycleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "period", label: "Period days" },
  { id: "symptoms", label: "Symptoms only" },
  { id: "month", label: "This month" },
];

type CycleView = "calendar" | "list" | "insights";

/* ---------- v5.0 cycle math helpers ---------- */

/** Group consecutive period days into periods; return their start dates (asc). */
function getPeriodStarts(entries: CycleEntry[]): Date[] {
  const periodDays = entries
    .filter((e) => e.isPeriod)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const starts: Date[] = [];
  let prev: Date | null = null;
  for (const e of periodDays) {
    const d = new Date(e.date + "T00:00:00");
    if (!prev || differenceInDays(d, prev) > 1) starts.push(d);
    prev = d;
  }
  return starts;
}

/** Cycle lengths (days) between consecutive period starts. */
function getCycleLengths(entries: CycleEntry[]): { date: Date; length: number }[] {
  const starts = getPeriodStarts(entries);
  const out: { date: Date; length: number }[] = [];
  for (let i = 1; i < starts.length; i++) {
    out.push({
      date: starts[i],
      length: differenceInDays(starts[i], starts[i - 1]),
    });
  }
  return out;
}

function avgCycleLength(entries: CycleEntry[], fallback = 28): number {
  const lens = getCycleLengths(entries).map((c) => c.length);
  if (lens.length === 0) return fallback;
  return Math.round(lens.reduce((a, b) => a + b, 0) / lens.length);
}

function cycleStddev(entries: CycleEntry[]): number {
  const lens = getCycleLengths(entries).map((c) => c.length);
  if (lens.length < 2) return 0;
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const variance =
    lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length;
  return Math.sqrt(variance);
}

/** Confidence % for predictions, based on data regularity. */
function predictionConfidence(
  entries: CycleEntry[],
  pcosEnabled: boolean
): number {
  const lens = getCycleLengths(entries).map((c) => c.length);
  if (lens.length === 0) return 0;
  const stddev = cycleStddev(entries);
  let base = Math.max(30, 95 - stddev * 7);
  if (lens.length < 3) base -= (3 - lens.length) * 12;
  if (pcosEnabled) base = Math.min(base, 70);
  return Math.max(15, Math.min(95, Math.round(base)));
}

const CONFIDENCE_LABEL = (c: number) => {
  if (c >= 75) return "High confidence";
  if (c >= 50) return "Moderate confidence";
  if (c > 0) return "Low confidence";
  return "Not enough data";
};


export function CycleTracker() {
  const reduce = useReducedMotion();
  const {
    cycleEntries,
    addCycleEntry,
    updateCycleEntry,
    deleteCycleEntry,
    settings,
  } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEntry, setEditingEntry] = useState<CycleEntry | undefined>();
  const [view, setView] = useState<CycleView>("calendar");
  const [formOpen, setFormOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getEntry = (d: Date) =>
    cycleEntries.find((e) => isSameDay(new Date(e.date), d));

  const periodDays = cycleEntries.filter((e) => e.isPeriod).length;

  // symptom frequency
  const symptomCounts = useMemo(() => {
    const m = new Map<string, number>();
    cycleEntries.forEach((e) =>
      e.symptoms.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1))
    );
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [cycleEntries]);
  const maxCount = symptomCounts[0]?.[1] ?? 1;

  // ---------- v5.0 prediction + PCOS ----------
  const pcosEnabled = settings.pcos.enabled;
  const avgLen =
    pcosEnabled && settings.pcos.cycleLengthAvg
      ? settings.pcos.cycleLengthAvg
      : avgCycleLength(cycleEntries, 28);
  const periodStarts = useMemo(
    () => getPeriodStarts(cycleEntries),
    [cycleEntries]
  );
  const lastPeriodStart =
    periodStarts.length > 0 ? periodStarts[periodStarts.length - 1] : null;
  const predictedStart = lastPeriodStart
    ? addDays(lastPeriodStart, avgLen)
    : null;
  // uncertainty window — wider in PCOS mode
  const uncertaintyDays = pcosEnabled ? 5 : 2;
  const predictedWindowStart = predictedStart
    ? subDays(predictedStart, uncertaintyDays)
    : null;
  const predictedWindowEnd = predictedStart
    ? addDays(predictedStart, uncertaintyDays)
    : null;
  const confidence = predictionConfidence(cycleEntries, pcosEnabled);

  const daysAway = predictedStart
    ? differenceInDays(predictedStart, new Date())
    : null;

  const isPredictedDay = (d: Date) => {
    if (!predictedWindowStart || !predictedWindowEnd) return false;
    return (
      d >= predictedWindowStart && d <= predictedWindowEnd && !getEntry(d)?.isPeriod
    );
  };

  // cycle history chart data
  const cycleHistoryData = useMemo(
    () =>
      getCycleLengths(cycleEntries).map((c) => ({
        date: format(c.date, "MMM d"),
        length: c.length,
      })),
    [cycleEntries]
  );

  // pain trend chart data
  const painTrendData = useMemo(
    () =>
      cycleEntries
        .filter((e) => typeof e.painScale === "number")
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((e) => ({
          date: format(new Date(e.date), "MMM d"),
          pain: e.painScale as number,
        })),
    [cycleEntries]
  );

  // symptom heatmap (last 3 months, GitHub-style weeks)
  const heatmapWeeks = useMemo(() => {
    const end = new Date();
    const start = startOfWeek(subMonths(end, 3), { weekStartsOn: 0 });
    const weeks: Date[][] = [];
    let cursor = start;
    while (cursor <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) week.push(addDays(cursor, i));
      weeks.push(week);
      cursor = addDays(cursor, 7);
    }
    return weeks;
  }, []);
  const symptomCountForDay = (d: Date) => {
    const entry = cycleEntries.find((e) => isSameDay(new Date(e.date), d));
    return entry?.symptoms.length ?? 0;
  };

  const openNew = (date: Date) => {
    setSelectedDate(date);
    setEditingEntry(undefined);
    setFormOpen(true);
  };

  const openEdit = (entry: CycleEntry) => {
    setSelectedDate(new Date(entry.date));
    setEditingEntry(entry);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-3"
      >
        <SectionHeader
          title="Cycle Tracker"
          subtitle="Gentle, private insights"
        />
        {pcosEnabled && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-border text-caption font-bold text-text-primary"
          >
            <HeartPulse size={13} className="text-primary" />
            PCOS Mode
          </motion.span>
        )}
      </motion.div>

      {/* 3-way segmented control */}
      <div className="relative flex p-1 rounded-full surface-card">
        {(["calendar", "list", "insights"] as const).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold"
              aria-pressed={active}
            >
              {active && (
                <motion.div
                  layoutId="cycle-view-tab"
                  className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex items-center gap-1.5 capitalize",
                  active ? "text-primary-foreground" : "text-text-secondary"
                )}
              >
                {v === "calendar" && <CalendarDays size={15} />}
                {v === "list" && <ListIcon size={15} />}
                {v === "insights" && <TrendingUp size={15} />}
                {v}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {view === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Calendar card */}
            <SurfaceCard className="p-5">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <Pressable
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center"
                >
                  <ChevronLeft size={18} className="text-text-secondary" />
                </Pressable>
                <div className="text-center">
                  <p className="text-label text-text-tertiary">Month</p>
                  <p className="text-title text-text-primary">
                    {format(currentDate, "MMMM yyyy")}
                  </p>
                </div>
                <Pressable
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center"
                >
                  <ChevronRight size={18} className="text-text-secondary" />
                </Pressable>
              </div>

              {/* DOW header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DOW.map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-label text-text-tertiary py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const entry = getEntry(day);
                  const inMonth = isSameMonth(day, currentDate);
                  const today = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const predicted = isPredictedDay(day);
                  const isPredictedCenter =
                    predictedStart && isSameDay(day, predictedStart);
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedDate(day);
                        setEditingEntry(getEntry(day));
                        setFormOpen(true);
                      }}
                      className={cnDay({
                        inMonth,
                        today,
                        selected: !!isSelected,
                        isPeriod: entry?.isPeriod,
                        isPredicted: predicted,
                        isPredictedCenter,
                      })}
                    >
                      <span
                        className={cn(
                          "relative z-10 text-sm font-semibold",
                          entry?.isPeriod
                            ? "text-primary-foreground"
                            : isPredictedCenter
                            ? "text-primary"
                            : inMonth
                            ? "text-text-primary"
                            : "text-text-tertiary",
                          today && !entry?.isPeriod && "text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {entry && !entry.isPeriod && entry.symptoms.length > 0 && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {entry.symptoms.slice(0, 3).map((_, idx) => (
                            <span
                              key={idx}
                              className="w-1 h-1 rounded-full bg-chart-3"
                            />
                          ))}
                        </span>
                      )}
                      {isPredictedCenter && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                      {today && (
                        <span className="absolute inset-0 rounded-xl ring-2 ring-primary/40 pointer-events-none" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 pt-4 border-t border-divider">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full gradient-primary-bg" />
                  <span className="text-caption text-text-secondary">Period</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-chart-3" />
                  <span className="text-caption text-text-secondary">Symptoms</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md border-2 border-dashed border-primary/50 bg-primary/10" />
                  <span className="text-caption text-text-secondary">
                    Predicted
                  </span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <CalendarDays size={13} className="text-text-tertiary" />
                  <span className="text-caption text-text-secondary">
                    Tap a day to log
                  </span>
                </div>
              </div>
            </SurfaceCard>

            {/* Prediction card */}
            {predictedStart && (
              <SurfaceCard className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CalendarClock size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-title text-text-primary font-semibold">
                        Next period
                      </p>
                      {pcosEnabled && confidence > 0 && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                            confidence >= 75
                              ? "bg-chart-2/20 text-chart-2"
                              : confidence >= 50
                              ? "bg-warning/20 text-warning"
                              : "bg-error/15 text-error"
                          )}
                        >
                          {confidence}% · {CONFIDENCE_LABEL(confidence)}
                        </span>
                      )}
                    </div>
                    <p className="text-body text-text-primary mt-1 font-semibold">
                      {format(predictedStart, "EEE, MMM d")}
                      {daysAway !== null && (
                        <span className="text-text-secondary font-normal">
                          {" "}
                          ·{" "}
                          {daysAway > 0
                            ? `est. ${daysAway} day${daysAway === 1 ? "" : "s"} away`
                            : daysAway === 0
                            ? "estimated today"
                            : `${Math.abs(daysAway)} day${Math.abs(daysAway) === 1 ? "" : "s"} overdue`}
                        </span>
                      )}
                    </p>
                    <p className="text-caption text-text-secondary mt-0.5">
                      Window:{" "}
                      {format(predictedWindowStart!, "MMM d")} –{" "}
                      {format(predictedWindowEnd!, "MMM d")}
                      {" · "}
                      avg {avgLen}-day cycle
                      {pcosEnabled ? " · PCOS ±5d" : " · ±2d"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-surface-secondary p-3">
                  <AlertTriangle
                    size={14}
                    className="text-warning shrink-0 mt-0.5"
                  />
                  <p className="text-caption text-text-secondary leading-relaxed">
                    {MEDICAL_DISCLAIMER}
                  </p>
                </div>
              </SurfaceCard>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              <StaggerItem index={0}>
                <SurfaceCard className="p-5">
                  <IconBadge icon={Droplet} variant="solid" size={40} />
                  <p className="text-headline text-text-primary mt-3">
                    <AnimatedCounter value={periodDays} />
                  </p>
                  <p className="text-caption text-text-secondary">Period days</p>
                </SurfaceCard>
              </StaggerItem>
              <StaggerItem index={1}>
                <SurfaceCard className="p-5">
                  <IconBadge icon={Sparkles} variant="soft" size={40} />
                  <p className="text-headline text-text-primary mt-3">
                    <AnimatedCounter value={cycleEntries.length} />
                  </p>
                  <p className="text-caption text-text-secondary">Total entries</p>
                </SurfaceCard>
              </StaggerItem>
            </div>

            {cycleEntries.length === 0 && (
              <EmptyState
                emoji="🌸"
                title="Start your journey"
                description="Tap any day on the calendar to log your first entry. Everything stays private on your device."
              />
            )}
          </motion.div>
        )}

        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CycleListView onEditEntry={openEdit} onAddNew={() => openNew(new Date())} />
          </motion.div>
        )}

        {view === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4">
              <SurfaceCard className="p-5">
                <p className="text-label text-text-tertiary">Total entries</p>
                <p className="text-headline text-text-primary mt-1">
                  <AnimatedCounter value={cycleEntries.length} />
                </p>
              </SurfaceCard>
              <SurfaceCard className="p-5">
                <p className="text-label text-text-tertiary">Period days</p>
                <p className="text-headline text-text-primary mt-1">
                  <AnimatedCounter value={periodDays} />
                </p>
              </SurfaceCard>
              <SurfaceCard className="p-5">
                <p className="text-label text-text-tertiary">Avg cycle</p>
                <p className="text-headline text-text-primary mt-1">
                  {avgLen}
                  <span className="text-body text-text-secondary ml-1 font-medium">
                    days
                  </span>
                </p>
              </SurfaceCard>
              <SurfaceCard className="p-5">
                <p className="text-label text-text-tertiary">Cycles logged</p>
                <p className="text-headline text-text-primary mt-1">
                  <AnimatedCounter value={cycleHistoryData.length} />
                </p>
              </SurfaceCard>
            </div>

            {/* Cycle history chart */}
            <SurfaceCard className="p-5">
              <SectionHeader
                title="Cycle history"
                subtitle="Cycle length over time"
                className="mb-4"
              />
              {cycleHistoryData.length === 0 ? (
                <EmptyState
                  emoji="📈"
                  title="Need more data"
                  description="Log two or more period start dates to see your cycle length trend."
                />
              ) : (
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={cycleHistoryData}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="cycleGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--divider)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <RTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--divider)",
                          background: "var(--surface)",
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "var(--text-secondary)" }}
                        formatter={(v: number) => [`${v} days`, "Cycle"]}
                      />
                      <ReferenceLine
                        y={avgLen}
                        stroke="var(--chart-4)"
                        strokeDasharray="4 4"
                        label={{
                          value: "avg",
                          fontSize: 10,
                          fill: "var(--chart-4)",
                          position: "right",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="length"
                        stroke="var(--chart-1)"
                        strokeWidth={2.5}
                        fill="url(#cycleGrad)"
                        dot={{
                          r: 3,
                          fill: "var(--chart-1)",
                          strokeWidth: 0,
                        }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SurfaceCard>

            {/* Top symptoms */}
            <SurfaceCard className="p-5">
              <SectionHeader
                title="Top symptoms"
                subtitle="Most logged this period"
                className="mb-5"
              />
              {symptomCounts.length === 0 ? (
                <EmptyState
                  emoji="📊"
                  title="No data yet"
                  description="Log symptoms with your entries to see patterns here."
                />
              ) : (
                <div className="space-y-3.5">
                  {symptomCounts.map(([sym, count], i) => (
                    <StaggerItem key={sym} index={i}>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-body text-text-primary font-medium">
                            {sym}
                          </span>
                          <span className="text-caption text-text-secondary font-semibold">
                            {count}×
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-surface-secondary overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundImage: "var(--gradient-primary)",
                            }}
                            initial={reduce ? { width: `${(count / maxCount) * 100}%` } : { width: 0 }}
                            animate={{ width: `${(count / maxCount) * 100}%` }}
                            transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              )}
            </SurfaceCard>

            {/* Symptom heatmap (last 3 months) */}
            <SurfaceCard className="p-5">
              <SectionHeader
                title="Symptom heatmap"
                subtitle="Last 3 months · daily intensity"
                className="mb-4"
              />
              <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
                <div className="flex gap-1 min-w-max">
                  {heatmapWeeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => {
                        const count = symptomCountForDay(day);
                        const future = day > new Date();
                        return (
                          <div
                            key={di}
                            title={`${format(day, "MMM d")} · ${count} symptom${count === 1 ? "" : "s"}`}
                            className={cn(
                              "w-3 h-3 rounded-[4px] transition-colors",
                              future
                                ? "bg-transparent"
                                : count === 0
                                ? "bg-surface-secondary"
                                : count === 1
                                ? "bg-primary/30"
                                : count === 2
                                ? "bg-primary/50"
                                : count === 3
                                ? "bg-primary/70"
                                : "bg-primary"
                            )}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-text-tertiary">Less</span>
                <span className="w-2.5 h-2.5 rounded-[3px] bg-surface-secondary" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-primary/30" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-primary/50" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-primary/70" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-primary" />
                <span className="text-[10px] text-text-tertiary">More</span>
              </div>
            </SurfaceCard>

            {/* Pain trend */}
            {painTrendData.length > 0 && (
              <SurfaceCard className="p-5">
                <SectionHeader
                  title="Pain trend"
                  subtitle="Pain scale over logged days"
                  className="mb-4"
                />
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={painTrendData}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--divider)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={[0, 10]}
                        ticks={[0, 5, 10]}
                        tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <RTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--divider)",
                          background: "var(--surface)",
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "var(--text-secondary)" }}
                        formatter={(v: number) => [`${v}/10`, "Pain"]}
                      />
                      <ReferenceLine
                        y={5}
                        stroke="var(--warning)"
                        strokeDasharray="4 4"
                      />
                      <Line
                        type="monotone"
                        dataKey="pain"
                        stroke="var(--chart-5)"
                        strokeWidth={2.5}
                        dot={{
                          r: 3,
                          fill: "var(--chart-5)",
                          strokeWidth: 0,
                        }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SurfaceCard>
            )}

            {/* PCOS panel */}
            {pcosEnabled && (
              <SurfaceCard className="p-5 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <HeartPulse size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-title text-text-primary font-semibold">
                      PCOS insights
                    </p>
                    <p className="text-caption text-text-secondary">
                      Pattern & irregularity overview
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl bg-surface-secondary p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Activity size={13} className="text-text-tertiary" />
                      <p className="text-label text-text-tertiary">
                        Cycle irregularity
                      </p>
                    </div>
                    <p className="text-headline text-text-primary">
                      ±{cycleStddev(cycleEntries).toFixed(1)}
                      <span className="text-caption text-text-secondary ml-1 font-medium">
                        days
                      </span>
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      std. deviation
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface-secondary p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Brain size={13} className="text-text-tertiary" />
                      <p className="text-label text-text-tertiary">
                        Ovulation certainty
                      </p>
                    </div>
                    <p className="text-headline text-text-primary">
                      {confidence > 0 ? `${confidence}%` : "—"}
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {CONFIDENCE_LABEL(confidence)}
                    </p>
                  </div>
                </div>

                {/* PCOS symptom trend summary */}
                <div className="rounded-2xl bg-surface-secondary p-3.5 mb-4">
                  <p className="text-label text-text-tertiary mb-2">
                    PCOS-flagged symptom trends
                  </p>
                  {(() => {
                    const pcosCounts = PCOS_SYMPTOMS.map((s) => ({
                      s,
                      n: cycleEntries.filter((e) => e.symptoms.includes(s))
                        .length,
                    })).filter((x) => x.n > 0);
                    if (pcosCounts.length === 0)
                      return (
                        <p className="text-caption text-text-secondary">
                          No PCOS-related symptoms logged yet.
                        </p>
                      );
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {pcosCounts
                          .sort((a, b) => b.n - a.n)
                          .map(({ s, n }) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-caption text-text-primary font-medium"
                            >
                              {s}
                              <span className="text-primary font-bold">{n}×</span>
                            </span>
                          ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-start gap-2 rounded-2xl bg-warning/10 p-3">
                  <ShieldAlert
                    size={14}
                    className="text-warning shrink-0 mt-0.5"
                  />
                  <p className="text-caption text-text-secondary leading-relaxed">
                    {MEDICAL_DISCLAIMER}
                  </p>
                </div>
              </SurfaceCard>
            )}

            {/* Recent entries */}
            {cycleEntries.length > 0 && (
              <SurfaceCard className="p-5">
                <SectionHeader
                  title="Recent entries"
                  className="mb-4"
                />
                <div className="space-y-2.5 max-h-72 overflow-y-auto scroll-area -mr-2 pr-2">
                  {[...cycleEntries]
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .slice(0, 12)
                    .map((e) => (
                      <Pressable
                        key={e.id}
                        onClick={() => openEdit(e)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            e.isPeriod
                              ? "gradient-primary-bg"
                              : "bg-surface border border-border"
                          )}
                        >
                          {e.isPeriod ? (
                            <Droplet size={16} className="text-primary-foreground" />
                          ) : (
                            <Sparkles size={16} className="text-text-tertiary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body text-text-primary font-semibold">
                            {format(new Date(e.date), "MMM d, yyyy")}
                          </p>
                          <p className="text-caption text-text-secondary truncate">
                            {e.isPeriod
                              ? `${e.flow ?? "light"} flow`
                              : "Symptoms only"}
                            {e.symptoms.length > 0 &&
                              ` · ${e.symptoms.length} symptoms`}
                          </p>
                        </div>
                      </Pressable>
                    ))}
                </div>
              </SurfaceCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CycleEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        date={selectedDate ? dateKey(selectedDate) : dateKey(new Date())}
        existing={editingEntry}
        pcosEnabled={pcosEnabled}
        onSave={(entry) => {
          if (editingEntry) updateCycleEntry(editingEntry.id, entry);
          else addCycleEntry(entry);
        }}
        onDelete={deleteCycleEntry}
      />
    </div>
  );
}

/* ==================== LIST VIEW ==================== */
function CycleListView({
  onEditEntry,
  onAddNew,
}: {
  onEditEntry: (entry: CycleEntry) => void;
  onAddNew: () => void;
}) {
  const {
    cycleEntries,
    archiveCycleEntry,
    bulkDeleteCycleEntries,
    bulkArchiveCycleEntries,
  } = useStore();
  const { showUndo } = useUndo();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CycleFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });

  // archived entries live in the Archive screen in Settings — hide them here
  const activeEntries = useMemo(
    () => cycleEntries.filter((e) => !e.archived),
    [cycleEntries]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    const filtered = activeEntries.filter((e) => {
      if (q) {
        const matches =
          (e.notes?.toLowerCase().includes(q) ?? false) ||
          (e.medication?.toLowerCase().includes(q) ?? false) ||
          (e.flow?.toLowerCase().includes(q) ?? false) ||
          e.date.toLowerCase().includes(q) ||
          e.symptoms.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      switch (filter) {
        case "period":
          return e.isPeriod;
        case "symptoms":
          return !e.isPeriod && e.symptoms.length > 0;
        case "month": {
          const d = new Date(e.date);
          return d >= mStart && d <= mEnd;
        }
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.date > b.date ? 1 : -1;
        case "alpha": // by symptom count desc (alpha doesn't fit cycle entries)
          return b.symptoms.length - a.symptoms.length;
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
  }, [activeEntries, search, filter, sort]);

  const sel = useSelection(visible);
  const hasAny = activeEntries.length > 0;

  // Swipe "delete" action = soft archive + undo snackbar
  const handleSwipeDelete = (entry: CycleEntry) => {
    archiveCycleEntry(entry.id, true);
    showUndo("Entry archived", () => archiveCycleEntry(entry.id, false));
  };
  // Swipe "archive" action = archive (restorable from Settings)
  const handleSwipeArchive = (entry: CycleEntry, archived: boolean) => {
    archiveCycleEntry(entry.id, archived);
  };
  // Multi-select delete = permanent delete after confirm
  const handleMultiDelete = () => {
    if (sel.selected.length === 0) return;
    setConfirmDelete({ open: true, ids: sel.selected });
  };
  const handleMultiArchive = () => {
    const ids = sel.selected;
    if (ids.length === 0) return;
    bulkArchiveCycleEntries(ids, true);
    sel.clearAll();
  };
  const confirmDeleteAction = () => {
    bulkDeleteCycleEntries(confirmDelete.ids);
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
            placeholder="Search entries…"
            className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary min-w-0"
            aria-label="Search cycle entries"
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

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {CYCLE_FILTERS.map((f) => (
          <Chip
            key={f.id}
            active={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {/* List or empty state */}
      {visible.length === 0 ? (
        <EmptyState
          emoji="🌸"
          title={hasAny ? "No matches found" : "Start your journey"}
          description={
            hasAny
              ? "Try a different search or filter to find your entries."
              : "Log your first cycle entry to begin tracking. Everything stays private on your device."
          }
          action={
            !hasAny ? (
              <Pressable
                onClick={onAddNew}
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
                  <CycleEntryCard
                    entry={entry}
                    selected={sel.isSelected(entry.id)}
                    inSelectionMode={sel.mode}
                    onTap={() => {
                      if (sel.mode) sel.toggle(entry.id);
                      else onEditEntry(entry);
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
            onClick={onAddNew}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{ bottom: "calc(var(--nav-h, 4rem) + 0.75rem)" }}
            className="fixed right-4 z-40 w-14 h-14 rounded-2xl gradient-primary-bg text-primary-foreground shadow-glow flex items-center justify-center"
            aria-label="Add cycle entry"
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
    </div>
  );
}

/* ==================== ENTRY CARD ==================== */
function CycleEntryCard({
  entry,
  selected,
  inSelectionMode,
  onTap,
  onLongPress,
}: {
  entry: CycleEntry;
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
          "p-4 flex items-center gap-3 transition-shadow",
          selected && "ring-2 ring-inset ring-primary"
        )}
      >
        {/* Icon / type indicator */}
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
            entry.isPeriod ? "gradient-primary-bg" : "bg-surface-secondary"
          )}
        >
          {entry.isPeriod ? (
            <Droplet size={18} className="text-primary-foreground" />
          ) : (
            <Sparkles size={18} className="text-text-tertiary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-title text-text-primary font-semibold truncate">
              {format(new Date(entry.date), "MMM d, yyyy")}
            </p>
            {entry.isPeriod ? (
              <span className="px-2 py-0.5 rounded-full gradient-primary-bg text-primary-foreground text-[10px] font-bold uppercase tracking-wide shrink-0">
                Period
              </span>
            ) : entry.symptoms.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary text-[10px] font-bold uppercase tracking-wide shrink-0">
                Symptoms
              </span>
            ) : null}
          </div>
          <p className="text-caption text-text-secondary mt-0.5 truncate">
            {entry.isPeriod
              ? `${entry.flow ?? "light"} flow`
              : "Symptoms only"}
            {entry.symptoms.length > 0 &&
              ` · ${entry.symptoms.length} symptom${
                entry.symptoms.length === 1 ? "" : "s"
              }`}
            {entry.medication && ` · ${entry.medication}`}
          </p>
        </div>

        {/* Trailing: checkbox in selection mode, chevron otherwise */}
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
          <ChevronRight size={18} className="text-text-tertiary shrink-0" />
        )}
      </SurfaceCard>
    </button>
  );
}

/* ==================== PORTAL ==================== */
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

/* ---------- helpers ---------- */
function cnDay({
  inMonth,
  today,
  selected,
  isPeriod,
  isPredicted,
  isPredictedCenter,
}: {
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  isPeriod?: boolean;
  isPredicted?: boolean;
  isPredictedCenter?: boolean;
}) {
  return cn(
    "relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all",
    isPeriod
      ? "gradient-primary-bg shadow-glow"
      : isPredicted
      ? "bg-primary/10 border-2 border-dashed border-primary/40"
      : "hover:bg-surface-secondary",
    !inMonth && "opacity-35",
    isPredictedCenter && "ring-2 ring-primary/60",
    selected && "ring-2 ring-primary ring-offset-2 ring-offset-surface"
  );
}
