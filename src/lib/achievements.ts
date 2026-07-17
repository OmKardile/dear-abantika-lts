// ============================================================
// Dear Abantika v6.0 — Achievement System
// Computes unlocked status + progress (0-100) for every
// achievement defined in ACHIEVEMENT_DEFS, on the fly.
// No persistence — purely derived from current app data.
// ============================================================

import type { Achievement, AppData } from "./types";
import { ACHIEVEMENT_DEFS } from "./types";

// --- date helpers --------------------------------------------

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) /
      86400000
  );
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

/**
 * Perfect-week streak: consecutive days (ending today or yesterday) where every
 * scheduled care task for that weekday was marked complete. Days with no
 * scheduled tasks are skipped (don't break the streak, don't add to it).
 */
function perfectWeekStreak(tasks: AppData["careTasks"]): number {
  const enabled = tasks.filter((t) => t.enabled && !t.archived);
  if (enabled.length === 0) return 0;

  let bestStreak = 0;
  // Try starting from today, then yesterday (today might not be done yet).
  for (let startOffset = 0; startOffset <= 1; startOffset++) {
    let streak = 0;
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - startOffset);
    let guard = 0;
    while (guard < 90) {
      guard += 1;
      const ds = cursor.toISOString().split("T")[0];
      const dayIdx = cursor.getDay();
      const scheduled = enabled.filter((t) => t.days[dayIdx]);
      if (scheduled.length === 0) {
        // Free day — skip without breaking.
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      const allDone = scheduled.every((t) => t.completion[ds] === true);
      if (allDone) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    bestStreak = Math.max(bestStreak, streak);
    if (bestStreak >= 7) break;
  }
  return bestStreak;
}

// --- metric helpers ------------------------------------------

/** Total care task completions across all tasks (sum of true values in completion maps). */
function totalCareCompletions(tasks: AppData["careTasks"]): number {
  let n = 0;
  for (const t of tasks) {
    if (t.archived) continue;
    for (const v of Object.values(t.completion)) {
      if (v) n += 1;
    }
  }
  return n;
}

/** Number of days in hydration history where amount >= goal. */
function hydrationGoalDays(data: AppData): number {
  const goal = data.hydration.goal;
  if (goal <= 0) return 0;
  return data.hydration.history.filter((h) => h.amount >= goal).length;
}

/** Number of distinct cycles (period start dates). */
function cycleCount(data: AppData): number {
  return getPeriodStarts(data.cycleEntries).length;
}

// --- progress utility ----------------------------------------

function pct(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

// ============================================================
// computeAchievements — returns every achievement with
// current unlocked status + progress (0-100).
// ============================================================

export function computeAchievements(data: AppData): Achievement[] {
  const today = todayStr();

  // Pre-compute all the metrics once.
  const hStreak = hydrationStreak(data.hydration.history);
  const jStreak = journalStreak(data.journalEntries);
  const pwStreak = perfectWeekStreak(data.careTasks);
  const totalCompletions = totalCareCompletions(data.careTasks);
  const goalDays = hydrationGoalDays(data);
  const moodLogCount = data.moodLogs.length;
  const cycleN = cycleCount(data);
  const journalCount = data.journalEntries.length;

  const compute = (
    id: string
  ): { unlocked: boolean; progress: number } => {
    switch (id) {
      case "water-7":
        return { unlocked: hStreak >= 7, progress: pct(hStreak, 7) };
      case "water-30":
        return { unlocked: hStreak >= 30, progress: pct(hStreak, 30) };
      case "journal-7":
        return { unlocked: jStreak >= 7, progress: pct(jStreak, 7) };
      case "journal-30":
        return { unlocked: jStreak >= 30, progress: pct(jStreak, 30) };
      case "perfect-week":
        return { unlocked: pwStreak >= 7, progress: pct(pwStreak, 7) };
      case "routine-master":
        return {
          unlocked: totalCompletions >= 100,
          progress: pct(totalCompletions, 100),
        };
      case "hydration-goal":
        return { unlocked: goalDays >= 10, progress: pct(goalDays, 10) };
      case "mood-tracker":
        return {
          unlocked: moodLogCount >= 30,
          progress: pct(moodLogCount, 30),
        };
      case "cycle-tracker":
        return { unlocked: cycleN >= 3, progress: pct(cycleN, 3) };
      case "first-journal":
        return {
          unlocked: journalCount >= 1,
          progress: pct(journalCount, 1),
        };
      default:
        return { unlocked: false, progress: 0 };
    }
  };

  return ACHIEVEMENT_DEFS.map((def) => {
    const { unlocked, progress } = compute(def.id);
    return {
      ...def,
      unlocked,
      progress,
      // Set unlockedAt to today's ISO date when unlocked (computed on the fly,
      // not persisted — reflects "as of this render" status).
      unlockedAt: unlocked ? today : undefined,
    };
  });
}
