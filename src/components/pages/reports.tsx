"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Droplet,
  Smile,
  CalendarHeart,
  CheckCircle2,
  ListTodo,
  BookOpen,
  FileText,
  Stethoscope,
  Flower2,
  Printer,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  MEDICAL_DISCLAIMER,
  type AppData,
  type MonthlyReport,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  StaggerItem,
  Pressable,
  ProgressRing,
  AnimatedCounter,
  Chip,
} from "@/components/premium/primitives";

/* ============================================================
   Reports — Monthly wellness reports with print export
   ============================================================ */

function monthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

function computeMonthlyReport(month: string, data: AppData): MonthlyReport {
  const [y, m] = month.split("-").map(Number);
  const start = startOfMonth(new Date(y, m - 1, 1));
  const end = endOfMonth(start);
  const inRange = (iso: string) => {
    const d = new Date(iso);
    return d >= start && d <= end;
  };
  const datePrefix = (ds: string) => ds.startsWith(month);

  // Hydration — average daily intake from logs
  const hydrationLogs = data.hydrationLogs.filter((l) => inRange(l.timestamp));
  const hydrationAvg = hydrationLogs.length
    ? Math.round(
        hydrationLogs.reduce((s, l) => s + Math.max(0, l.amount), 0) /
          hydrationLogs.length
      )
    : Math.round(
        (data.hydration.history
          .filter((h) => datePrefix(h.date))
          .reduce((s, h) => s + h.amount, 0) || 0) /
          Math.max(
            1,
            data.hydration.history.filter((h) => datePrefix(h.date)).length
          )
      ) || 0;

  // Mood — most frequent
  const moodLogs = data.moodLogs.filter((l) => inRange(l.timestamp));
  const moodCount: Record<string, number> = {};
  for (const l of moodLogs) moodCount[l.mood] = (moodCount[l.mood] || 0) + 1;
  const moodEntries = Object.entries(moodCount).sort(
    (a, b) => b[1] - a[1]
  );
  const moodAvg = moodEntries[0]?.[0] ?? "—";

  // Cycle days (period)
  const cycleDays = data.cycleEntries.filter(
    (c) => c.isPeriod && datePrefix(c.date)
  ).length;

  // Care completion %
  const careTasks = data.careTasks.filter((t) => !t.archived);
  const daysInMonth = end.getDate();
  let careTotal = 0;
  let careDone = 0;
  for (const t of careTasks) {
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${month}-${String(day).padStart(2, "0")}`;
      careTotal++;
      if (t.completion[ds]) careDone++;
    }
  }
  const careCompletion = careTotal
    ? Math.round((careDone / careTotal) * 100)
    : 0;

  // Task completion %
  const tasks = data.dailyTasks.filter((t) => datePrefix(t.date));
  const taskCompletion = tasks.length
    ? Math.round(
        (tasks.filter((t) => t.completed).length / tasks.length) * 100
      )
    : 0;

  // Journal entries
  const journalCount = data.journalEntries.filter((j) =>
    datePrefix(j.date)
  ).length;

  // Wellness score (composite)
  const goal = data.hydration.goal || 2000;
  const hydrationScore = Math.min(hydrationAvg / goal, 1) * 100;
  const moodScore = moodLogs.length ? 72 : 38;
  const journalScore = Math.min(journalCount / 10, 1) * 100;
  const wellnessScore = Math.round(
    hydrationScore * 0.2 +
      careCompletion * 0.25 +
      taskCompletion * 0.25 +
      journalScore * 0.15 +
      moodScore * 0.15
  );

  return {
    month,
    hydrationAvg,
    moodAvg,
    cycleDays,
    careCompletion,
    taskCompletion,
    journalCount,
    wellnessScore,
  };
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--success)";
  if (score >= 60) return "var(--chart-4)";
  if (score >= 40) return "var(--warning)";
  return "var(--error)";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Thriving";
  if (score >= 60) return "Healthy";
  if (score >= 40) return "Steady";
  return "Needs care";
}

/* ---------------- Print helpers ---------------- */

function openPrintWindow(title: string, bodyHtml: string) {
  const w = window.open("", "_blank", "width=820,height=960");
  if (!w) {
    alert("Please allow popups to export reports.");
    return;
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    *{box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2a2622;background:#fdfcf9;margin:0;padding:40px;line-height:1.55}
    .wrap{max-width:720px;margin:0 auto}
    h1{font-size:26px;margin:0 0 4px;color:#8a3b1f}
    .sub{color:#8a7a6e;font-size:13px;margin-bottom:24px}
    .brand{font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#b89b8a;margin-bottom:2px}
    .card{background:#fff;border:1px solid #ece4dc;border-radius:16px;padding:18px 20px;margin-bottom:14px}
    .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dashed #ece4dc}
    .row:last-child{border-bottom:none}
    .label{color:#6b5d52;font-size:13px}
    .val{font-weight:600;color:#2a2622;font-size:14px}
    .score{font-size:48px;font-weight:700;color:#8a3b1f;line-height:1}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .stat{background:#faf5ef;border:1px solid #ece4dc;border-radius:12px;padding:14px}
    .stat .k{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#8a7a6e}
    .stat .v{font-size:22px;font-weight:700;color:#2a2622;margin-top:4px}
    .disc{font-size:11px;color:#a39488;margin-top:18px;padding:10px;background:#faf5ef;border-radius:10px;border-left:3px solid #c8a98e}
    .pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;background:#f0e6dc;color:#6b5d52}
    .bar{height:8px;background:#f0e6dc;border-radius:999px;overflow:hidden;margin-top:6px}
    .bar>span{display:block;height:100%;background:linear-gradient(90deg,#a8542e,#c8a98e)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #ece4dc}
    th{color:#8a7a6e;font-size:11px;text-transform:uppercase;letter-spacing:0.06em}
    .foot{margin-top:28px;text-align:center;color:#b89b8a;font-size:11px}
    @media print{body{padding:0;background:#fff}.card{break-inside:avoid}}
  </style></head><body><div class="wrap">${bodyHtml}<div class="foot">Generated by Dear Abantika · ${format(
    new Date(),
    "MMM d, yyyy h:mm a"
  )}</div></div></body></html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try {
      w.print();
    } catch {
      /* noop */
    }
  }, 450);
}

function buildMonthlyReportHtml(
  report: MonthlyReport,
  monthLabel: string
): string {
  const score = report.wellnessScore;
  return `
    <div class="brand">Dear Abantika · Wellness Report</div>
    <h1>${monthLabel}</h1>
    <p class="sub">Your monthly wellness summary</p>
    <div class="card" style="text-align:center">
      <div class="k" style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a6e">Overall Wellness Score</div>
      <div class="score">${score}</div>
      <div class="pill" style="margin-top:8px">${scoreLabel(score)}</div>
      <div class="bar" style="max-width:300px;margin:12px auto 0"><span style="width:${score}%"></span></div>
    </div>
    <div class="grid">
      <div class="stat"><div class="k">Hydration avg</div><div class="v">${report.hydrationAvg} ml</div></div>
      <div class="stat"><div class="k">Top mood</div><div class="v">${report.moodAvg}</div></div>
      <div class="stat"><div class="k">Cycle days</div><div class="v">${report.cycleDays}</div></div>
      <div class="stat"><div class="k">Care completion</div><div class="v">${report.careCompletion}%</div></div>
      <div class="stat"><div class="k">Task completion</div><div class="v">${report.taskCompletion}%</div></div>
      <div class="stat"><div class="k">Journal entries</div><div class="v">${report.journalCount}</div></div>
    </div>
    <div class="disc">${MEDICAL_DISCLAIMER}</div>
  `;
}

function buildCycleReportHtml(data: AppData, month: string, monthLabel: string): string {
  const entries = data.cycleEntries
    .filter((c) => c.date.startsWith(month) && !c.archived)
    .sort((a, b) => a.date.localeCompare(b.date));
  const periodDays = entries.filter((e) => e.isPeriod);
  const symptomCount: Record<string, number> = {};
  for (const e of entries)
    for (const s of e.symptoms)
      symptomCount[s] = (symptomCount[s] || 0) + 1;
  const topSymptoms = Object.entries(symptomCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const rows = entries.length
    ? entries
        .map(
          (e) =>
            `<tr><td>${format(new Date(e.date), "MMM d")}</td><td>${
              e.isPeriod ? "Period" : "—"
            }</td><td>${e.flow ?? "—"}</td><td>${
              e.symptoms.length ? e.symptoms.join(", ") : "—"
            }</td><td>${e.painScale ?? "—"}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="5" style="text-align:center;color:#8a7a6e;padding:20px">No cycle entries logged this month</td></tr>`;

  const symptomHtml = topSymptoms.length
    ? topSymptoms
        .map(
          (s) =>
            `<div class="row"><span class="label">${s[0]}</span><span class="val">${s[1]}×</span></div>`
        )
        .join("")
    : `<div class="row"><span class="label">No symptoms logged</span><span class="val">—</span></div>`;

  return `
    <div class="brand">Dear Abantika · Cycle Report</div>
    <h1>${monthLabel}</h1>
    <p class="sub">Cycle & symptom summary</p>
    <div class="grid">
      <div class="stat"><div class="k">Period days</div><div class="v">${periodDays.length}</div></div>
      <div class="stat"><div class="k">Total entries</div><div class="v">${entries.length}</div></div>
    </div>
    <div class="card">
      <div class="k" style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a6e;margin-bottom:6px">Top symptoms</div>
      ${symptomHtml}
    </div>
    <div class="card">
      <div class="k" style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a6e;margin-bottom:6px">Daily log</div>
      <table><thead><tr><th>Date</th><th>Period</th><th>Flow</th><th>Symptoms</th><th>Pain</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    <div class="disc">${MEDICAL_DISCLAIMER}</div>
  `;
}

function buildDoctorReportHtml(
  data: AppData,
  report: MonthlyReport,
  monthLabel: string
): string {
  const pcos = data.settings.pcos;
  const recentCycles = data.cycleEntries
    .filter((c) => c.isPeriod && !c.archived)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6);
  let avgCycleLen: string;
  if (recentCycles.length >= 2) {
    const diffs: number[] = [];
    for (let i = 1; i < recentCycles.length; i++) {
      diffs.push(
        Math.round(
          (new Date(recentCycles[i].date).getTime() -
            new Date(recentCycles[i - 1].date).getTime()) /
            86400000
        )
      );
    }
    avgCycleLen = `${Math.round(
      diffs.reduce((s, n) => s + n, 0) / diffs.length
    )} days`;
  } else {
    avgCycleLen = "Insufficient data";
  }

  const symptomCount: Record<string, number> = {};
  for (const e of data.cycleEntries)
    if (!e.archived)
      for (const s of e.symptoms)
        symptomCount[s] = (symptomCount[s] || 0) + 1;
  const topSymptoms = Object.entries(symptomCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const symptomHtml = topSymptoms.length
    ? topSymptoms
        .map(
          (s) =>
            `<div class="row"><span class="label">${s[0]}</span><span class="val">${s[1]}×</span></div>`
        )
        .join("")
    : `<div class="row"><span class="label">None logged</span><span class="val">—</span></div>`;

  return `
    <div class="brand">Dear Abantika · Doctor Report</div>
    <h1>Clinical Summary</h1>
    <p class="sub">For ${monthLabel} · Share with your healthcare provider</p>
    <div class="card">
      <div class="row"><span class="label">Average cycle length</span><span class="val">${avgCycleLen}</span></div>
      <div class="row"><span class="label">Period days this month</span><span class="val">${report.cycleDays}</span></div>
      <div class="row"><span class="label">PCOS mode</span><span class="val">${pcos.enabled ? "Enabled" : "Off"}</span></div>
      ${
        pcos.enabled && pcos.diagnosedDate
          ? `<div class="row"><span class="label">PCOS diagnosed</span><span class="val">${format(
              new Date(pcos.diagnosedDate),
              "MMM yyyy"
            )}</span></div>`
          : ""
      }
      ${
        pcos.medications
          ? `<div class="row"><span class="label">Medications</span><span class="val">${pcos.medications}</span></div>`
          : ""
      }
      ${
        pcos.insulinResistance
          ? `<div class="row"><span class="label">Insulin resistance</span><span class="val">Yes</span></div>`
          : ""
      }
      <div class="row"><span class="label">Overall wellness</span><span class="val">${
        report.wellnessScore
      }/100 (${scoreLabel(report.wellnessScore)})</span></div>
    </div>
    <div class="card">
      <div class="k" style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a6e;margin-bottom:6px">Most frequent symptoms (all time)</div>
      ${symptomHtml}
    </div>
    <div class="disc">${MEDICAL_DISCLAIMER}</div>
  `;
}

/* ---------------- Stat card ---------------- */

function StatCard({
  Icon,
  label,
  value,
  suffix,
  tint,
  index,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  suffix?: string;
  tint: string;
  index: number;
}) {
  const isNum = typeof value === "number";
  return (
    <StaggerItem index={index}>
      <SurfaceCard className="p-3.5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `color-mix(in oklch, ${tint} 14%, transparent)`,
            }}
          >
            <Icon size={15} className="" style={{ color: tint } as any} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary leading-tight">
            {label}
          </span>
        </div>
        <div className="text-xl font-bold text-text-primary leading-none">
          {isNum ? (
            <>
              <AnimatedCounter value={value as number} />
              {suffix && (
                <span className="text-sm font-semibold text-text-secondary ml-0.5">
                  {suffix}
                </span>
              )}
            </>
          ) : (
            <span>{value}</span>
          )}
        </div>
      </SurfaceCard>
    </StaggerItem>
  );
}

/* ---------------- Main ---------------- */

export function Reports() {
  const reduce = useReducedMotion();
  const store = useStore();
  const data: AppData = store;

  // Last 6 months keys (oldest → newest)
  const months = React.useMemo(() => {
    const arr: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push(monthKey(d));
    }
    return arr;
  }, []);

  const [selected, setSelected] = React.useState(months[months.length - 1]);

  const reports = React.useMemo(
    () => months.map((mk) => computeMonthlyReport(mk, data)),
    [months, data]
  );

  const selectedReport =
    reports.find((r) => r.month === selected) ?? reports[reports.length - 1];

  const trendData = reports.map((r) => ({
    name: format(new Date(r.month + "-01"), "MMM"),
    score: r.wellnessScore,
    isCurrent: r.month === selected,
  }));

  const score = selectedReport.wellnessScore;
  const sc = scoreColor(score);

  const handleExportPdf = () => {
    const label = format(new Date(selected + "-01"), "MMMM yyyy");
    openPrintWindow(
      `Wellness Report — ${label}`,
      buildMonthlyReportHtml(selectedReport, label)
    );
  };

  const handleExportCycle = () => {
    const label = format(new Date(selected + "-01"), "MMMM yyyy");
    openPrintWindow(
      `Cycle Report — ${label}`,
      buildCycleReportHtml(data, selected, label)
    );
  };

  const handleExportDoctor = () => {
    const label = format(new Date(selected + "-01"), "MMMM yyyy");
    openPrintWindow(
      `Doctor Report — ${label}`,
      buildDoctorReportHtml(data, selectedReport, label)
    );
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          title="Reports"
          subtitle="Monthly wellness summaries & exports"
        />
      </motion.div>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {months.map((mk) => {
          const active = mk === selected;
          const r = reports.find((x) => x.month === mk);
          return (
            <Chip
              key={mk}
              active={active}
              onClick={() => setSelected(mk)}
              className="flex flex-col items-center gap-0.5 py-2 min-w-[68px]"
            >
              <span className="text-xs font-bold">
                {format(new Date(mk + "-01"), "MMM")}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  active ? "text-primary-foreground/80" : "text-text-tertiary"
                )}
              >
                {r ? r.wellnessScore : "—"}
              </span>
            </Chip>
          );
        })}
      </div>

      {/* Wellness Score hero */}
      <SurfaceCard glow className="p-5">
        <div className="flex items-center gap-4">
          <ProgressRing
            progress={score / 100}
            size={120}
            stroke={12}
            gradientId="report-score-grad"
          >
            <div className="flex flex-col items-center">
              <AnimatedCounter
                value={score}
                className="text-3xl font-bold leading-none"
                style={{ color: sc } as any}
              />
              <span className="text-[10px] text-text-tertiary mt-1 uppercase tracking-wide">
                / 100
              </span>
            </div>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <p className="text-caption text-text-secondary uppercase tracking-wide mb-1">
              {format(new Date(selected + "-01"), "MMMM yyyy")}
            </p>
            <h3
              className="text-xl font-bold leading-tight"
              style={{ color: sc }}
            >
              {scoreLabel(score)}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mt-1">
              {score >= 80
                ? "You're glowing this month. Beautiful balance."
                : score >= 60
                ? "Solid month. A few small tweaks could lift you higher."
                : score >= 40
                ? "Steady progress. Keep showing up for yourself."
                : "Be gentle with yourself. Small steps still count."}
            </p>
          </div>
        </div>
      </SurfaceCard>

      {/* 2×3 stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          Icon={Droplet}
          label="Hydration avg"
          value={selectedReport.hydrationAvg}
          suffix="ml"
          tint="var(--chart-5)"
          index={0}
        />
        <StatCard
          Icon={Smile}
          label="Top mood"
          value={selectedReport.moodAvg}
          tint="var(--chart-4)"
          index={1}
        />
        <StatCard
          Icon={CalendarHeart}
          label="Cycle days"
          value={selectedReport.cycleDays}
          tint="var(--primary)"
          index={2}
        />
        <StatCard
          Icon={CheckCircle2}
          label="Care done"
          value={selectedReport.careCompletion}
          suffix="%"
          tint="var(--success)"
          index={3}
        />
        <StatCard
          Icon={ListTodo}
          label="Tasks done"
          value={selectedReport.taskCompletion}
          suffix="%"
          tint="var(--chart-3)"
          index={4}
        />
        <StatCard
          Icon={BookOpen}
          label="Journal"
          value={selectedReport.journalCount}
          tint="var(--chart-2)"
          index={5}
        />
      </div>

      {/* Trend chart */}
      <SurfaceCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Wellness score trend
            </h3>
            <p className="text-caption text-text-secondary">
              Last 6 months
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Score
          </div>
        </div>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 8, right: 4, bottom: 0, left: -28 }}
            >
              <defs>
                <linearGradient id="trend-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" />
                  <stop offset="100%" stopColor="var(--chart-4)" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-secondary)", opacity: 0.4 }}
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
                labelStyle={{ color: "var(--text-secondary)" }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {trendData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.isCurrent ? "var(--primary)" : "url(#trend-bar)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      {/* Export buttons */}
      <div className="grid grid-cols-1 gap-2.5">
        <Pressable
          onClick={handleExportPdf}
          className="w-full gradient-primary-bg text-primary-foreground rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 font-semibold text-sm shadow-glow"
        >
          <FileText size={16} />
          Export Wellness PDF
        </Pressable>
        <div className="grid grid-cols-2 gap-2.5">
          <Pressable
            onClick={handleExportCycle}
            className="w-full surface-card rounded-2xl py-3 px-3 flex items-center justify-center gap-2 font-semibold text-sm text-text-primary border border-border"
          >
            <Flower2 size={15} className="text-primary" />
            Cycle Report
          </Pressable>
          <Pressable
            onClick={handleExportDoctor}
            className="w-full surface-card rounded-2xl py-3 px-3 flex items-center justify-center gap-2 font-semibold text-sm text-text-primary border border-border"
          >
            <Stethoscope size={15} className="text-primary" />
            Doctor Report
          </Pressable>
        </div>
      </div>

      <p className="text-[11px] text-text-tertiary text-center leading-snug px-4">
        <Printer size={11} className="inline mr-1 -mt-0.5" />
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}
