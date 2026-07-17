"use client";

// ============================================================
// Dear Abantika v6.0 — Global Search Hook
// Searches across every entity in the app and returns the top
// 20 results sorted by relevance. Empty query => empty array.
// ============================================================

import { useMemo } from "react";
import { useStore } from "@/lib/store";

export interface SearchResult {
  id: string;
  type:
    | "journal"
    | "reminder"
    | "task"
    | "symptom"
    | "routine"
    | "wishlist"
    | "mood";
  title: string;
  subtitle?: string;
  emoji?: string;
  date?: string;
}

interface ScoredResult extends SearchResult {
  score: number;
}

// --- emoji maps (mirror categories used across the app) ------

const REMINDER_EMOJI: Record<string, string> = {
  medication: "💊",
  water: "💧",
  skincare: "✨",
  brush: "🪥",
  period: "🌸",
  ovulation: "🥚",
  supplements: "🌿",
  journal: "📔",
  custom: "📌",
};

const WISHLIST_EMOJI: Record<string, string> = {
  "save-later": "📌",
  urgent: "⚡",
  dream: "✨",
  "for-him": "💙",
};

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

// --- scoring -------------------------------------------------

/** Return a 0-100 relevance score for a single haystack vs the query. */
function scoreMatch(haystack: string | undefined | null, query: string): number {
  if (!haystack) return 0;
  const lower = haystack.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 0;
  if (lower === q) return 100;
  if (lower.startsWith(q)) return 80;
  if (lower.includes(q)) return 60;
  const words = lower.split(/\s+/);
  for (const w of words) {
    if (w.startsWith(q)) return 50;
  }
  for (const w of words) {
    if (w.includes(q)) return 40;
  }
  return 0;
}

function maxScore(...scores: number[]): number {
  let m = 0;
  for (const s of scores) if (s > m) m = s;
  return m;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}

// --- the hook ------------------------------------------------

export function useGlobalSearch(query: string): { results: SearchResult[] } {
  // Subscribe to each slice individually — stable references mean the
  // useMemo only recomputes when the actual data we care about changes.
  const journalEntries = useStore((s) => s.journalEntries);
  const reminders = useStore((s) => s.reminders);
  const dailyTasks = useStore((s) => s.dailyTasks);
  const cycleEntries = useStore((s) => s.cycleEntries);
  const careTasks = useStore((s) => s.careTasks);
  const wishlistItems = useStore((s) => s.wishlistItems);
  const moodLogs = useStore((s) => s.moodLogs);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (!q) return [];

    const candidates: ScoredResult[] = [];

    // --- Journal entries (title, reflection, tags) ----------
    for (const e of journalEntries) {
      if (e.archived) continue;
      const titleScore = scoreMatch(e.title, q);
      const refScore = scoreMatch(e.reflection, q);
      const tagScore = e.tags
        ? maxScore(...e.tags.map((t) => scoreMatch(t, q)))
        : 0;
      const best = maxScore(titleScore, refScore, tagScore);
      if (best > 0) {
        candidates.push({
          id: e.id,
          type: "journal",
          title: e.title || "Untitled entry",
          subtitle: e.reflection ? truncate(e.reflection, 80) : undefined,
          emoji: e.sticker || e.mood,
          date: e.date?.split("T")[0],
          score: best + (e.pinned ? 5 : 0) + (e.favorite ? 3 : 0),
        });
      }
    }

    // --- Reminders (title, category) ------------------------
    for (const r of reminders) {
      if (r.archived) continue;
      const titleScore = scoreMatch(r.title, q);
      const catScore = scoreMatch(r.category, q);
      const best = maxScore(titleScore, catScore);
      if (best > 0) {
        candidates.push({
          id: r.id,
          type: "reminder",
          title: r.title,
          subtitle: `${r.time} · ${r.category}`,
          emoji: REMINDER_EMOJI[r.category] ?? "🔔",
          score: best,
        });
      }
    }

    // --- Daily tasks (title) --------------------------------
    for (const t of dailyTasks) {
      if (t.archived) continue;
      const s = scoreMatch(t.title, q);
      if (s > 0) {
        candidates.push({
          id: t.id,
          type: "task",
          title: t.title,
          subtitle: `${t.priority} priority · ${t.completed ? "done" : "pending"}`,
          emoji: t.emoji || (t.completed ? "✅" : "📝"),
          date: t.date,
          score: s,
        });
      }
    }

    // --- Cycle entries (symptoms, notes, medication) -------
    for (const c of cycleEntries) {
      if (c.archived) continue;
      const notesScore = scoreMatch(c.notes, q);
      const medScore = scoreMatch(c.medication, q);
      const symptomScore =
        c.symptoms.length > 0
          ? maxScore(...c.symptoms.map((s) => scoreMatch(s, q)))
          : 0;
      const best = maxScore(notesScore, medScore, symptomScore);
      if (best > 0) {
        const matchedSymptom = c.symptoms.find((s) => scoreMatch(s, q) > 0);
        candidates.push({
          id: c.id,
          type: "symptom",
          title: matchedSymptom ?? (c.isPeriod ? "Period entry" : "Cycle entry"),
          subtitle:
            c.symptoms.length > 0
              ? c.symptoms.slice(0, 3).join(", ")
              : c.notes
                ? truncate(c.notes, 60)
                : undefined,
          emoji: c.isPeriod ? "🌸" : "🗓️",
          date: c.date?.split("T")[0],
          score: best,
        });
      }
    }

    // --- Care tasks / routines (title) ----------------------
    for (const t of careTasks) {
      if (t.archived) continue;
      const s = scoreMatch(t.title, q);
      if (s > 0) {
        candidates.push({
          id: t.id,
          type: "routine",
          title: t.title,
          subtitle: `${t.routine} routine`,
          emoji: t.emoji || "🧘",
          score: s,
        });
      }
    }

    // --- Wishlist items (title, description, notes) --------
    for (const w of wishlistItems) {
      if (w.archived) continue;
      const titleScore = scoreMatch(w.title, q);
      const descScore = scoreMatch(w.description, q);
      const notesScore = scoreMatch(w.notes, q);
      const catScore = scoreMatch(w.category, q);
      const best = maxScore(titleScore, descScore, notesScore, catScore);
      if (best > 0) {
        candidates.push({
          id: w.id,
          type: "wishlist",
          title: w.title,
          subtitle: w.description ? truncate(w.description, 80) : undefined,
          emoji: WISHLIST_EMOJI[w.category] ?? "💝",
          score: best,
        });
      }
    }

    // --- Mood logs (mood emoji, label, note) ---------------
    for (const m of moodLogs) {
      const emojiScore = scoreMatch(m.mood, q);
      const labelScore = scoreMatch(MOOD_LABELS[m.mood], q);
      const noteScore = scoreMatch(m.note, q);
      const best = maxScore(emojiScore, labelScore, noteScore);
      if (best > 0) {
        const label = MOOD_LABELS[m.mood];
        candidates.push({
          id: m.id,
          type: "mood",
          title: label ? `${m.mood} ${label}` : m.mood,
          subtitle: m.note ? truncate(m.note, 80) : undefined,
          emoji: m.mood,
          date: m.timestamp?.split("T")[0],
          score: best,
        });
      }
    }

    // Sort by score desc, then by date desc as a tiebreaker.
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const da = a.date ?? "";
      const db = b.date ?? "";
      return db.localeCompare(da);
    });

    return candidates.slice(0, 20).map(({ score: _s, ...rest }) => rest);
  }, [
    query,
    journalEntries,
    reminders,
    dailyTasks,
    cycleEntries,
    careTasks,
    wishlistItems,
    moodLogs,
  ]);

  return { results };
}
