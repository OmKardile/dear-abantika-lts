// ============================================================
// Dear Abantika v6.0 — Local Insights Engine
// 100% local pattern detection. No cloud AI, no network calls.
// Every insight is gentle, never alarming.
// ============================================================

import type { AppData, WellnessInsight } from "./types";
import { MEDICAL_DISCLAIMER } from "./types";

// --- date / time helpers -------------------------------------

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) /
      86400000
  );
}

function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDay();
}

// --- cycle helpers -------------------------------------------

/** Group consecutive period days into cycles; return period start dates (sorted asc). */
function getPeriodStarts(entries: AppData["cycleEntries"]): string[] {
  const periodDays = entries
    .filter((e) => e.isPeriod && !e.archived)
    .map((e) => e.date.split("T")[0])
    .sort();
  if (periodDays.length === 0) return [];
  const starts: string[] = [];
  let currentStart = periodDays[0];
  let prev = periodDays[0];
  for (let i = 1; i < periodDays.length; i++) {
    const d = periodDays[i];
    if (daysBetween(prev, d) > 1) {
      starts.push(currentStart);
      currentStart = d;
    }
    prev = d;
  }
  starts.push(currentStart);
  return starts;
}

/** Cycle day (1-based) for a given date, or null if before first known period. */
function cycleDayOf(dateStr: string, periodStarts: string[]): number | null {
  if (periodStarts.length === 0) return null;
  let start: string | null = null;
  for (const s of periodStarts) {
    if (s <= dateStr) start = s;
    else break;
  }
  if (!start) return null;
  return daysBetween(start, dateStr) + 1;
}

// --- mood helpers --------------------------------------------

const POSITIVE_MOODS = ["😊", "😄", "😌", "🥰", "😇"];
const NEUTRAL_MOODS = ["😴", "🤗"];
const NEGATIVE_MOODS = ["😔", "😢", "😤"];

/** Map a mood emoji to a 0/1/2 score (negative / neutral / positive). */
function moodScore(mood: string): number {
  if (POSITIVE_MOODS.includes(mood)) return 2;
  if (NEGATIVE_MOODS.includes(mood)) return 0;
  return 1; // neutral or unknown
}

// --- streak helpers ------------------------------------------

/** Consecutive days (ending today or yesterday) with hydration amount > 0. */
function hydrationStreak(history: { date: string; amount: number }[]): number {
  if (history.length === 0) return 0;
  const drankSet = new Set(
    history.filter((h) => h.amount > 0).map((h) => h.date.split("T")[0])
  );
  let streak = 0;
  const cursor = new Date();
  if (!drankSet.has(cursor.toISOString().split("T")[0])) {
    cursor.setDate(cursor.getDate() - 1);
  }
  // Safety cap to avoid runaway loops on weird data.
  let guard = 0;
  while (drankSet.has(cursor.toISOString().split("T")[0]) && guard < 1000) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    guard += 1;
  }
  return streak;
}

/** Consecutive days (ending today or yesterday) with at least one journal entry. */
function journalStreak(entries: AppData["journalEntries"]): number {
  if (entries.length === 0) return 0;
  const dates = new Set(entries.map((e) => e.date.split("T")[0]));
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(cursor.toISOString().split("T")[0])) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let guard = 0;
  while (dates.has(cursor.toISOString().split("T")[0]) && guard < 1000) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    guard += 1;
  }
  return streak;
}

// --- candidate scoring ---------------------------------------

interface CandidateInsight extends WellnessInsight {
  relevance: number; // higher = more relevant
}

const TYPE_PRIORITY: Record<WellnessInsight["type"], number> = {
  warning: 4,
  pattern: 3,
  positive: 2,
  tip: 1,
};

function rankAndTrim(candidates: CandidateInsight[]): WellnessInsight[] {
  candidates.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    return TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type];
  });
  return candidates.slice(0, 5).map(({ relevance: _r, ...rest }) => rest);
}

// ============================================================
// generateInsights — analyzes the full app data
// ============================================================

export function generateInsights(data: AppData): WellnessInsight[] {
  const candidates: CandidateInsight[] = [];

  // --- 1. Hydration dips on a specific weekday ---------------
  const byDay: Record<number, { sum: number; count: number }> = {};
  let totalAmt = 0;
  let totalCount = 0;
  for (const h of data.hydration.history) {
    if (h.amount <= 0) continue;
    const d = dayOfWeek(h.date);
    if (!byDay[d]) byDay[d] = { sum: 0, count: 0 };
    byDay[d].sum += h.amount;
    byDay[d].count += 1;
    totalAmt += h.amount;
    totalCount += 1;
  }
  const overallAvg = totalCount > 0 ? totalAmt / totalCount : 0;
  if (overallAvg > 0) {
    let worst: { dayIdx: number; avg: number; count: number } | null = null;
    for (const k of Object.keys(byDay)) {
      const v = byDay[Number(k)];
      if (v.count < 2) continue;
      const avg = v.sum / v.count;
      if (!worst || avg < worst.avg) {
        worst = { dayIdx: Number(k), avg, count: v.count };
      }
    }
    if (worst && worst.avg < overallAvg * 0.85) {
      const pct = Math.round((1 - worst.avg / overallAvg) * 100);
      candidates.push({
        id: "hydro-weekday-low",
        type: "pattern",
        title: `Hydration dips on ${WEEKDAY_NAMES[worst.dayIdx]}s`,
        description: `You drink about ${pct}% less water on ${WEEKDAY_NAMES[worst.dayIdx]}s compared to your usual week. A gentle nudge that morning could help.`,
        emoji: "💧",
        relevance: 58 + pct,
      });
    }
  }

  // --- 2. Pain peaks on a specific cycle day -----------------
  const periodStarts = getPeriodStarts(data.cycleEntries);
  if (periodStarts.length >= 1) {
    const byCycleDay: Record<number, { sum: number; count: number }> = {};
    for (const e of data.cycleEntries) {
      if (e.archived || e.painScale == null) continue;
      const cd = cycleDayOf(e.date.split("T")[0], periodStarts);
      if (cd == null || cd < 1 || cd > 7) continue;
      if (!byCycleDay[cd]) byCycleDay[cd] = { sum: 0, count: 0 };
      byCycleDay[cd].sum += e.painScale;
      byCycleDay[cd].count += 1;
    }
    let peak: { cd: number; avg: number; count: number } | null = null;
    for (const k of Object.keys(byCycleDay)) {
      const v = byCycleDay[Number(k)];
      if (v.count < 2) continue;
      const avg = v.sum / v.count;
      if (!peak || avg > peak.avg) {
        peak = { cd: Number(k), avg, count: v.count };
      }
    }
    if (peak && peak.avg >= 3) {
      candidates.push({
        id: "pain-cycle-day-peak",
        type: "pattern",
        title: `Pain tends to peak around Cycle Day ${peak.cd}`,
        description: `Across ${peak.count} logged cycles, your average pain is highest on Cycle Day ${peak.cd}. Planning a slower, gentler day then can soften it. ${MEDICAL_DISCLAIMER}`,
        emoji: "🩹",
        relevance: 70,
      });
    }
  }

  // --- 3. Sleep < 6h correlates with lower mood --------------
  const withSleep = data.cycleEntries.filter(
    (e) => !e.archived && e.sleepHours != null && e.moodTag
  );
  if (withSleep.length >= 4) {
    const low = withSleep.filter((e) => (e.sleepHours ?? 0) < 6);
    const ok = withSleep.filter((e) => (e.sleepHours ?? 0) >= 7);
    if (low.length >= 2 && ok.length >= 2) {
      const lowAvg = low.reduce((a, b) => a + moodScore(b.moodTag!), 0) / low.length;
      const okAvg = ok.reduce((a, b) => a + moodScore(b.moodTag!), 0) / ok.length;
      if (okAvg - lowAvg >= 1) {
        candidates.push({
          id: "sleep-mood-correlation",
          type: "pattern",
          title: "Less sleep, lower mood",
          description: `On nights you sleep under 6 hours, your mood tends to dip the next day. Protecting your sleep may help steady how you feel.`,
          emoji: "😴",
          relevance: 65,
        });
      }
    }
  }

  // --- 4. Acne frequently appears before your cycle ----------
  if (periodStarts.length >= 2) {
    let acneWindows = 0;
    let observedWindows = 0;
    for (const start of periodStarts) {
      const startDate = new Date(start + "T00:00:00");
      let windowHasAnyEntry = false;
      let windowHasAcne = false;
      for (let i = 5; i >= 1; i--) {
        const d = new Date(startDate);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        const entries = data.cycleEntries.filter(
          (e) => !e.archived && e.date.split("T")[0] === ds
        );
        if (entries.length > 0) {
          windowHasAnyEntry = true;
          if (entries.some((e) => e.symptoms.includes("Acne"))) windowHasAcne = true;
        }
      }
      if (windowHasAnyEntry) {
        observedWindows += 1;
        if (windowHasAcne) acneWindows += 1;
      }
    }
    if (observedWindows >= 2 && acneWindows / observedWindows >= 0.5) {
      candidates.push({
        id: "acne-before-cycle",
        type: "pattern",
        title: "Acne often appears before your cycle",
        description: `In ${acneWindows} of ${observedWindows} cycles, you logged acne in the 5 days before your period began. A skincare boost in that window may help. ${MEDICAL_DISCLAIMER}`,
        emoji: "✨",
        relevance: 68,
      });
    }
  }

  // --- 5. Mood lower (or brighter) this week -----------------
  const now = Date.now();
  const recentMoods = data.moodLogs.filter(
    (l) => now - new Date(l.timestamp).getTime() <= 7 * 86400000
  );
  const olderMoods = data.moodLogs.filter((l) => {
    const diff = now - new Date(l.timestamp).getTime();
    return diff > 7 * 86400000 && diff <= 21 * 86400000;
  });
  if (recentMoods.length >= 3 && olderMoods.length >= 3) {
    const recentAvg =
      recentMoods.reduce((a, b) => a + moodScore(b.mood), 0) / recentMoods.length;
    const olderAvg =
      olderMoods.reduce((a, b) => a + moodScore(b.mood), 0) / olderMoods.length;
    if (olderAvg - recentAvg >= 0.5) {
      candidates.push({
        id: "mood-down-week",
        type: "warning",
        title: "Your mood has been a little lower this week",
        description: `Compared to the previous two weeks, your mood logs have dipped slightly. Be gentle with yourself — small acts of care can lift the rhythm.`,
        emoji: "🌷",
        relevance: 72,
      });
    } else if (recentAvg - olderAvg >= 0.5) {
      candidates.push({
        id: "mood-up-week",
        type: "positive",
        title: "Your mood has been brighter this week",
        description: `Your mood logs are trending upward compared to the previous two weeks. Whatever you're doing, it's working — keep going.`,
        emoji: "🌈",
        relevance: 70,
      });
    }
  }

  // --- 6. Missed hydration 3+ days in a row ------------------
  {
    let longestGap = 0;
    let gap = 0;
    for (let i = 0; i < 14; i++) {
      const d = dateOffset(-i);
      const entry = data.hydration.history.find(
        (h) => h.date.split("T")[0] === d
      );
      if (!entry || entry.amount <= 0) {
        gap += 1;
        longestGap = Math.max(longestGap, gap);
      } else {
        gap = 0;
      }
    }
    if (longestGap >= 3) {
      candidates.push({
        id: "hydration-missed-streak",
        type: "warning",
        title: `Hydration has slipped ${longestGap} days in a row`,
        description: `You've missed logging water for ${longestGap} consecutive days recently. Even a single glass counts — start small and rebuild the rhythm.`,
        emoji: "💦",
        relevance: 75,
      });
    }
  }

  // --- 7. Routine completion down (or up) this week ---------
  {
    const enabledTasks = data.careTasks.filter((t) => t.enabled && !t.archived);
    if (enabledTasks.length > 0) {
      let thisDone = 0;
      let thisTotal = 0;
      let lastDone = 0;
      let lastTotal = 0;
      for (const t of enabledTasks) {
        for (let i = 0; i < 7; i++) {
          const dThis = dateOffset(-i);
          const dLast = dateOffset(-i - 7);
          const dayIdxThis = dayOfWeek(dThis);
          const dayIdxLast = dayOfWeek(dLast);
          if (t.days[dayIdxThis]) {
            thisTotal += 1;
            if (t.completion[dThis]) thisDone += 1;
          }
          if (t.days[dayIdxLast]) {
            lastTotal += 1;
            if (t.completion[dLast]) lastDone += 1;
          }
        }
      }
      if (thisTotal >= 3 && lastTotal >= 3) {
        const thisRate = thisDone / thisTotal;
        const lastRate = lastDone / lastTotal;
        if (lastRate - thisRate >= 0.2) {
          const pctDrop = Math.round((lastRate - thisRate) * 100);
          candidates.push({
            id: "routine-down-week",
            type: "warning",
            title: "Routine completion is down this week",
            description: `Your self-care task completion dropped ${pctDrop}% versus last week. Pick one anchor habit (like brushing teeth) and let the rest follow.`,
            emoji: "🧘",
            relevance: 70,
          });
        } else if (thisRate - lastRate >= 0.2 && thisRate >= 0.7) {
          const pctRise = Math.round((thisRate - lastRate) * 100);
          candidates.push({
            id: "routine-up-week",
            type: "positive",
            title: "Your routine is back on track",
            description: `Self-care completion is up ${pctRise}% this week. That momentum is real — celebrate the small wins.`,
            emoji: "🌟",
            relevance: 68,
          });
        }
      }
    }
  }

  // --- 8. Positive: hit water goal N days this week ----------
  {
    let goalHits = 0;
    for (let i = 0; i < 7; i++) {
      const d = dateOffset(-i);
      const entry = data.hydration.history.find(
        (h) => h.date.split("T")[0] === d
      );
      if (
        entry &&
        data.hydration.goal > 0 &&
        entry.amount >= data.hydration.goal
      ) {
        goalHits += 1;
      }
    }
    if (goalHits >= 3) {
      candidates.push({
        id: "water-goal-week",
        type: "positive",
        title: `Hydration goal hit ${goalHits} days this week`,
        description: `You reached your water goal ${goalHits} of the last 7 days. That consistency shows up in energy, skin, and mood.`,
        emoji: "🌊",
        relevance: 64 + goalHits,
      });
    }
  }

  // --- 9. Positive: journal streak ---------------------------
  {
    const jStreak = journalStreak(data.journalEntries);
    if (jStreak >= 3) {
      candidates.push({
        id: "journal-streak",
        type: "positive",
        title: `${jStreak}-day journal streak`,
        description: `You've journaled ${jStreak} days in a row. Writing it down is how the mind exhales — keep going.`,
        emoji: "📔",
        relevance: 58 + jStreak,
      });
    }
  }

  // --- 10. Positive: hydration streak ------------------------
  {
    const hStreak = hydrationStreak(data.hydration.history);
    if (hStreak >= 3) {
      candidates.push({
        id: "hydration-streak",
        type: "positive",
        title: `${hStreak}-day hydration streak`,
        description: `You've logged water ${hStreak} days running. Small sips, big ripple.`,
        emoji: "💧",
        relevance: 56 + hStreak,
      });
    }
  }

  // --- 11. Tip: morning hydration ----------------------------
  if (data.hydration.history.length >= 4 && data.hydration.goal > 0) {
    const avg =
      data.hydration.history.reduce((a, b) => a + b.amount, 0) /
      data.hydration.history.length;
    if (avg < data.hydration.goal * 0.6) {
      candidates.push({
        id: "tip-morning-water",
        type: "tip",
        title: "Try a glass of water when you wake",
        description: `Your hydration is often below your goal. A glass of water first thing in the morning is a simple, kind reset.`,
        emoji: "🌅",
        relevance: 50,
      });
    }
  }

  // --- 12. Tip: get started ----------------------------------
  if (
    data.cycleEntries.length === 0 &&
    data.journalEntries.length === 0 &&
    data.moodLogs.length < 3
  ) {
    candidates.push({
      id: "tip-get-started",
      type: "tip",
      title: "Start logging to unlock insights",
      description: `The more you log — water, mood, cycle, journal — the more patterns we can gently surface. Try one entry today.`,
      emoji: "🌱",
      relevance: 40,
    });
  }

  return rankAndTrim(candidates);
}

// ============================================================
// getMoodIntelligence — mood-focused insights & gentle recs
// ============================================================

const MOOD_LABELS: Record<string, string> = {
  "😊": "happy",
  "😄": "joyful",
  "😌": "calm",
  "😔": "sad",
  "😢": "crying",
  "😴": "tired",
  "🥰": "loved",
  "😤": "frustrated",
  "🤗": "hugging",
  "😇": "blessed",
  "😰": "anxious",
  "😎": "confident",
};

export function getMoodIntelligence(data: AppData): WellnessInsight[] {
  const candidates: CandidateInsight[] = [];
  const logs = data.moodLogs;
  const now = Date.now();

  // --- Most frequent mood ------------------------------------
  if (logs.length >= 5) {
    const counts: Record<string, number> = {};
    for (const l of logs) counts[l.mood] = (counts[l.mood] ?? 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    const pct = Math.round((top[1] / logs.length) * 100);
    const isPositive = POSITIVE_MOODS.includes(top[0]);
    candidates.push({
      id: "mood-most-common",
      type: isPositive ? "positive" : "pattern",
      title: `Your most frequent mood is ${top[0]} ${MOOD_LABELS[top[0]] ? `(${MOOD_LABELS[top[0]]})` : ""}`.trim(),
      description: `You've logged ${top[0]} ${top[1]} times — about ${pct}% of your mood check-ins. ${
        isPositive
          ? "That's a gentle baseline to celebrate."
          : "It's okay to feel this. Noticing it is the first step in caring for yourself."
      }`,
      emoji: top[0],
      relevance: 60 + pct / 4,
    });
  }

  // --- Mood by time of day ----------------------------------
  {
    const buckets: Record<
      "morning" | "afternoon" | "evening" | "night",
      { sum: number; count: number }
    > = {
      morning: { sum: 0, count: 0 },
      afternoon: { sum: 0, count: 0 },
      evening: { sum: 0, count: 0 },
      night: { sum: 0, count: 0 },
    };
    for (const l of logs) {
      const h = new Date(l.timestamp).getHours();
      const key: keyof typeof buckets =
        h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
      buckets[key].sum += moodScore(l.mood);
      buckets[key].count += 1;
    }
    const filled = (Object.entries(buckets) as [
      keyof typeof buckets,
      { sum: number; count: number }
    ][])
      .filter(([, v]) => v.count >= 2)
      .map(([k, v]) => ({ bucket: k, avg: v.sum / v.count }));
    if (filled.length >= 2) {
      filled.sort((a, b) => a.avg - b.avg);
      const low = filled[0];
      const high = filled[filled.length - 1];
      if (high.avg - low.avg >= 1) {
        candidates.push({
          id: "mood-time-of-day",
          type: "pattern",
          title: `Your mood tends to dip in the ${low.bucket}`,
          description: `Your ${low.bucket} mood logs are noticeably lower than your ${high.bucket}s. A small ritual in the ${low.bucket} — a walk, water, a song — might lift the rhythm.`,
          emoji: "🌗",
          relevance: 65,
        });
      }
    }
  }

  // --- 30-day mood trend ------------------------------------
  {
    const recent = logs.filter(
      (l) => now - new Date(l.timestamp).getTime() <= 30 * 86400000
    );
    const older = logs.filter((l) => {
      const diff = now - new Date(l.timestamp).getTime();
      return diff > 30 * 86400000 && diff <= 60 * 86400000;
    });
    if (recent.length >= 4 && older.length >= 4) {
      const rAvg = recent.reduce((a, b) => a + moodScore(b.mood), 0) / recent.length;
      const oAvg = older.reduce((a, b) => a + moodScore(b.mood), 0) / older.length;
      if (rAvg - oAvg >= 0.4) {
        candidates.push({
          id: "mood-trend-up",
          type: "positive",
          title: "Your mood is trending upward",
          description: `Over the last month, your mood has been brighter than the month before. Small, steady care is compounding.`,
          emoji: "📈",
          relevance: 70,
        });
      } else if (oAvg - rAvg >= 0.4) {
        candidates.push({
          id: "mood-trend-down",
          type: "warning",
          title: "Your mood has been a bit lower lately",
          description: `Your recent month's mood logs are a touch lower than the previous one. If it persists, consider reaching out to someone you trust.`,
          emoji: "🌷",
          relevance: 72,
        });
      }
    }
  }

  // --- Mood by cycle phase ----------------------------------
  {
    const periodStarts = getPeriodStarts(data.cycleEntries);
    if (periodStarts.length >= 1) {
      const phaseMoods: Record<
        "menstrual" | "follicular" | "luteal",
        { sum: number; count: number }
      > = {
        menstrual: { sum: 0, count: 0 },
        follicular: { sum: 0, count: 0 },
        luteal: { sum: 0, count: 0 },
      };
      for (const l of logs) {
        const ds = l.timestamp.split("T")[0];
        const cd = cycleDayOf(ds, periodStarts);
        if (cd == null) continue;
        const phase: keyof typeof phaseMoods =
          cd <= 5 ? "menstrual" : cd <= 14 ? "follicular" : "luteal";
        phaseMoods[phase].sum += moodScore(l.mood);
        phaseMoods[phase].count += 1;
      }
      const filled = (Object.entries(phaseMoods) as [
        keyof typeof phaseMoods,
        { sum: number; count: number }
      ][])
        .filter(([, v]) => v.count >= 2)
        .map(([k, v]) => ({ phase: k, avg: v.sum / v.count }));
      if (filled.length >= 2) {
        filled.sort((a, b) => a.avg - b.avg);
        const low = filled[0];
        const high = filled[filled.length - 1];
        if (high.avg - low.avg >= 1) {
          candidates.push({
            id: "mood-cycle-phase",
            type: "pattern",
            title: `Your mood is often lower in the ${low.phase} phase`,
            description: `Your mood logs dip on average during the ${low.phase} phase of your cycle. Tenderness then — lighter schedules, warmer meals — can help. ${MEDICAL_DISCLAIMER}`,
            emoji: "🌸",
            relevance: 75,
          });
        }
      }
    }
  }

  // --- Mood vs pain -----------------------------------------
  {
    const withPain = data.cycleEntries.filter(
      (e) => !e.archived && e.painScale != null && e.moodTag
    );
    if (withPain.length >= 4) {
      const highPain = withPain.filter((e) => (e.painScale ?? 0) >= 6);
      const lowPain = withPain.filter((e) => (e.painScale ?? 0) <= 3);
      if (highPain.length >= 2 && lowPain.length >= 2) {
        const hAvg =
          highPain.reduce((a, b) => a + moodScore(b.moodTag!), 0) / highPain.length;
        const lAvg =
          lowPain.reduce((a, b) => a + moodScore(b.moodTag!), 0) / lowPain.length;
        if (lAvg - hAvg >= 1) {
          candidates.push({
            id: "mood-pain-link",
            type: "pattern",
            title: "Pain and mood move together",
            description: `On days with higher pain, your mood tends to be lower. A warmth pad, gentle movement, or rest can soften both. ${MEDICAL_DISCLAIMER}`,
            emoji: "🩹",
            relevance: 70,
          });
        }
      }
    }
  }

  // --- Tip: log mood daily ----------------------------------
  if (logs.length >= 1 && logs.length < 7) {
    candidates.push({
      id: "mood-tip-log-more",
      type: "tip",
      title: "Log mood daily to see your rhythm",
      description: `A quick mood check-in each day helps surface patterns between sleep, cycle, and feelings. Try a single tap each evening.`,
      emoji: "📅",
      relevance: 45,
    });
  }

  // --- Tip: evening check-in --------------------------------
  {
    const evening = logs.filter((l) => new Date(l.timestamp).getHours() >= 21);
    if (logs.length >= 4 && evening.length === 0) {
      candidates.push({
        id: "mood-tip-evening-ritual",
        type: "tip",
        title: "An evening mood check-in helps",
        description: `You've been logging mood earlier in the day. A short evening check-in captures how the day actually landed — try it tonight.`,
        emoji: "🌙",
        relevance: 50,
      });
    }
  }

  return rankAndTrim(candidates);
}
