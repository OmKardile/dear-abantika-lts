"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as React from "react";
import type {
  AppData,
  AppSettings,
  CycleEntry,
  JournalEntry,
  WishlistItem,
  Reminder,
  HydrationLog,
  MoodLog,
  CareTask,
  DailyTask,
} from "./types";
import type { ThemeId } from "./themes";

const todayStr = () => new Date().toISOString().split("T")[0];
const nowIso = () => new Date().toISOString();

function seedHistory(): { date: string; amount: number }[] {
  const out: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toISOString().split("T")[0],
      amount: [1600, 1800, 1400, 2200, 1900, 1750][i - 1] ?? 1500,
    });
  }
  return out;
}

function seedHydrationLogs(): HydrationLog[] {
  const now = Date.now();
  return [
    { id: "seed-h1", timestamp: new Date(now - 7200000).toISOString(), amount: 250 },
    { id: "seed-h2", timestamp: new Date(now - 3600000).toISOString(), amount: 500 },
  ];
}

function seedMoodLogs(): MoodLog[] {
  const now = Date.now();
  return [
    { id: "seed-m1", timestamp: new Date(now - 86400000 * 2).toISOString(), mood: "😌" },
    { id: "seed-m2", timestamp: new Date(now - 86400000).toISOString(), mood: "🥰" },
    { id: "seed-m3", timestamp: new Date(now - 3600000).toISOString(), mood: "😊" },
  ];
}

const defaultSettings: AppSettings = {
  pcos: {
    enabled: false,
  },
  appearance: {
    fontSize: "medium",
    dynamicColors: true,
  },
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
};

function seedCareTasks(): CareTask[] {
  const now = nowIso();
  const today = todayStr();
  return [
    { id: "seed-c1", title: "Brush teeth", emoji: "🪥", routine: "morning", time: "07:30", days: [true,true,true,true,true,true,true], enabled: true, completion: { [today]: false }, createdAt: now },
    { id: "seed-c2", title: "Skincare", emoji: "✨", routine: "morning", time: "07:45", days: [true,true,true,true,true,true,true], enabled: true, completion: { [today]: false }, createdAt: now },
    { id: "seed-c3", title: "Sunscreen", emoji: "☀️", routine: "morning", time: "08:00", days: [true,true,true,true,true,true,true], enabled: true, completion: { [today]: false }, createdAt: now },
    { id: "seed-c4", title: "Take vitamins", emoji: "💊", routine: "morning", time: "08:30", days: [true,true,true,true,true,true,true], enabled: true, completion: { [today]: false }, createdAt: now },
    { id: "seed-c5", title: "Skincare", emoji: "🌙", routine: "night", time: "21:00", days: [true,true,true,true,true,true,true], enabled: true, completion: { [today]: false }, createdAt: now },
    { id: "seed-c6", title: "Brush teeth", emoji: "🪥", routine: "night", time: "22:00", days: [true,true,true,true,true,true,true], enabled: true, completion: { [today]: false }, createdAt: now },
  ];
}

function seedDailyTasks(): DailyTask[] {
  const today = todayStr();
  const now = nowIso();
  return [
    { id: "seed-t1", title: "Drink 8 glasses of water", emoji: "💧", priority: "medium", date: today, completed: false, recurring: "daily", createdAt: now },
    { id: "seed-t2", title: "10 min meditation", emoji: "🧘", priority: "low", date: today, completed: false, recurring: "none", createdAt: now },
    { id: "seed-t3", title: "Log today's mood", emoji: "😊", priority: "medium", date: today, completed: true, completedAt: now, recurring: "daily", createdAt: now },
  ];
}

const defaultData: AppData = {
  hydration: {
    current: 750,
    goal: 2000,
    history: seedHistory(),
  },
  hydrationLogs: seedHydrationLogs(),
  moodLogs: seedMoodLogs(),
  mood: { current: "😊", date: todayStr() },
  cycleEntries: [],
  journalEntries: [
    {
      id: "seed-j1",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      title: "A slow, gentle morning",
      mood: "😌",
      reflection:
        "Woke up without an alarm and let the light pour in slowly. Sometimes the simplest mornings are the ones I needed most.",
      sticker: "🌙",
      tags: ["gratitude", "reflection"],
    },
    {
      id: "seed-j2",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      title: "Grateful for small things",
      mood: "🥰",
      reflection:
        "Warm tea, a good book, and quiet — I'm learning that rest is productive too.",
      sticker: "✨",
      tags: ["joy"],
      favorite: true,
    },
  ],
  wishlistItems: [
    {
      id: "seed-w1",
      title: "Silk pillowcase",
      description: "Mulberry silk, blush pink — kinder to skin and hair.",
      category: "dream",
      notes: "King size",
    },
    {
      id: "seed-w2",
      title: "Ceramic pour-over set",
      description: "Hand-thrown stoneware for slow weekend rituals.",
      category: "save-later",
    },
  ],
  reminders: [
    {
      id: "seed-r1",
      title: "Morning vitamins",
      time: "08:00",
      category: "supplements",
      days: [false, true, true, true, true, true, false],
      enabled: true,
      frequency: "daily",
    },
    {
      id: "seed-r2",
      title: "Drink water",
      time: "10:00",
      category: "water",
      days: [false, true, true, true, true, true, false],
      enabled: true,
      frequency: "hourly",
    },
    {
      id: "seed-r3",
      title: "Evening skincare",
      time: "21:00",
      category: "skincare",
      days: [true, true, true, true, true, true, true],
      enabled: false,
      frequency: "daily",
    },
  ],
  careTasks: seedCareTasks(),
  dailyTasks: seedDailyTasks(),
  settings: defaultSettings,
};

interface StoreState extends AppData {
  theme: ThemeId;
  // theme
  setTheme: (t: ThemeId) => void;
  // hydration
  addWater: (amount: number) => void;
  resetWater: () => void;
  setHydrationGoal: (goal: number) => void;
  // hydration logs
  addHydrationLog: (amount: number, timestamp?: string) => void;
  updateHydrationLog: (id: string, patch: Partial<HydrationLog>) => void;
  deleteHydrationLog: (id: string) => void;
  // mood
  setMood: (mood: string) => void;
  // mood logs
  addMoodLog: (mood: string, note?: string) => void;
  updateMoodLog: (id: string, patch: Partial<MoodLog>) => void;
  deleteMoodLog: (id: string) => void;
  // cycle
  addCycleEntry: (e: Omit<CycleEntry, "id">) => void;
  updateCycleEntry: (id: string, e: Partial<CycleEntry>) => void;
  deleteCycleEntry: (id: string) => void;
  archiveCycleEntry: (id: string, archived: boolean) => void;
  bulkDeleteCycleEntries: (ids: string[]) => void;
  bulkArchiveCycleEntries: (ids: string[], archived: boolean) => void;
  // journal
  addJournalEntry: (e: Omit<JournalEntry, "id">) => void;
  updateJournalEntry: (id: string, e: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  archiveJournalEntry: (id: string, archived: boolean) => void;
  toggleJournalPin: (id: string) => void;
  toggleJournalFavorite: (id: string) => void;
  bulkDeleteJournalEntries: (ids: string[]) => void;
  bulkArchiveJournalEntries: (ids: string[], archived: boolean) => void;
  // wishlist
  addWishlistItem: (i: Omit<WishlistItem, "id">) => void;
  updateWishlistItem: (id: string, i: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;
  archiveWishlistItem: (id: string, archived: boolean) => void;
  bulkDeleteWishlistItems: (ids: string[]) => void;
  bulkArchiveWishlistItems: (ids: string[], archived: boolean) => void;
  // reminders
  addReminder: (r: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, r: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  archiveReminder: (id: string, archived: boolean) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  completeReminder: (id: string) => void;
  skipReminder: (id: string) => void;
  bulkDeleteReminders: (ids: string[]) => void;
  // care tasks (self-care routines)
  addCareTask: (t: Omit<CareTask, "id" | "createdAt" | "completion">) => void;
  updateCareTask: (id: string, t: Partial<CareTask>) => void;
  deleteCareTask: (id: string) => void;
  archiveCareTask: (id: string, archived: boolean) => void;
  toggleCareTaskCompletion: (id: string, date: string) => void;
  // daily tasks (planner)
  addDailyTask: (t: Omit<DailyTask, "id" | "createdAt">) => void;
  updateDailyTask: (id: string, t: Partial<DailyTask>) => void;
  deleteDailyTask: (id: string) => void;
  toggleDailyTask: (id: string) => void;
  archiveDailyTask: (id: string, archived: boolean) => void;
  // settings
  updateSettings: (patch: Partial<AppSettings>) => void;
  setPCOS: (patch: Partial<AppSettings["pcos"]>) => void;
  setAppearance: (patch: Partial<AppSettings["appearance"]>) => void;
  // backup
  exportData: () => string;
  importData: (json: string, mode?: "overwrite" | "merge") => boolean;
  resetAll: () => void;
}

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Deduplicate an array of objects by their `id` field (last wins). */
function dedupe<T extends { id: string }>(arr: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of arr) map.set(item.id, item);
  return Array.from(map.values());
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...defaultData,
      theme: "linen",

      setTheme: (theme) => set({ theme }),

      addWater: (amount) =>
        set((s) => {
          const today = todayStr();
          const next = Math.max(0, s.hydration.current + amount);
          const history = [...s.hydration.history];
          const idx = history.findIndex((h) => h.date === today);
          if (idx >= 0) history[idx] = { date: today, amount: next };
          else history.push({ date: today, amount: next });
          const log: HydrationLog = {
            id: uid(),
            timestamp: nowIso(),
            amount,
          };
          return {
            hydration: {
              ...s.hydration,
              current: next,
              history: history.slice(-14),
            },
            hydrationLogs: [log, ...s.hydrationLogs].slice(0, 200),
          };
        }),

      resetWater: () =>
        set((s) => ({ hydration: { ...s.hydration, current: 0 } })),

      setHydrationGoal: (goal) =>
        set((s) => ({ hydration: { ...s.hydration, goal } })),

      addHydrationLog: (amount, timestamp) =>
        set((s) => {
          const log: HydrationLog = {
            id: uid(),
            timestamp: timestamp ?? nowIso(),
            amount,
          };
          const today = todayStr();
          const isToday = (timestamp ?? nowIso()).startsWith(today);
          let current = s.hydration.current;
          let history = s.hydration.history;
          if (isToday) {
            current = Math.max(0, current + amount);
            const idx = history.findIndex((h) => h.date === today);
            if (idx >= 0) history = history.map((h, i) => i === idx ? { ...h, amount: current } : h);
            else history = [...history, { date: today, amount: current }];
          }
          return {
            hydrationLogs: [log, ...s.hydrationLogs].slice(0, 200),
            hydration: { ...s.hydration, current, history: history.slice(-14) },
          };
        }),

      updateHydrationLog: (id, patch) =>
        set((s) => {
          const logs = s.hydrationLogs.map((l) => (l.id === id ? { ...l, ...patch } : l));
          // recompute today's total
          const today = todayStr();
          const todays = logs.filter((l) => l.timestamp.startsWith(today));
          const current = Math.max(0, todays.reduce((a, b) => a + b.amount, 0));
          let history = s.hydration.history;
          const idx = history.findIndex((h) => h.date === today);
          if (idx >= 0) history = history.map((h, i) => i === idx ? { ...h, amount: current } : h);
          else history = [...history, { date: today, amount: current }];
          return { hydrationLogs: logs, hydration: { ...s.hydration, current, history: history.slice(-14) } };
        }),

      deleteHydrationLog: (id) =>
        set((s) => {
          const logs = s.hydrationLogs.filter((l) => l.id !== id);
          const today = todayStr();
          const todays = logs.filter((l) => l.timestamp.startsWith(today));
          const current = Math.max(0, todays.reduce((a, b) => a + b.amount, 0));
          let history = s.hydration.history;
          const idx = history.findIndex((h) => h.date === today);
          if (idx >= 0) history = history.map((h, i) => i === idx ? { ...h, amount: current } : h);
          else history = [...history, { date: today, amount: current }];
          return { hydrationLogs: logs, hydration: { ...s.hydration, current, history: history.slice(-14) } };
        }),

      setMood: (mood) =>
        set((s) => ({
          mood: { current: mood, date: todayStr() },
          moodLogs: [
            { id: uid(), timestamp: nowIso(), mood },
            ...s.moodLogs,
          ].slice(0, 200),
        })),

      addMoodLog: (mood, note) =>
        set((s) => ({
          moodLogs: [
            { id: uid(), timestamp: nowIso(), mood, note },
            ...s.moodLogs,
          ].slice(0, 200),
          mood: { current: mood, date: todayStr() },
        })),

      updateMoodLog: (id, patch) =>
        set((s) => ({
          moodLogs: s.moodLogs.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      deleteMoodLog: (id) =>
        set((s) => ({
          moodLogs: s.moodLogs.filter((m) => m.id !== id),
        })),

      addCycleEntry: (e) =>
        set((s) => ({
          cycleEntries: [...s.cycleEntries, { ...e, id: uid() }],
        })),
      updateCycleEntry: (id, e) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.map((x) =>
            x.id === id ? { ...x, ...e } : x
          ),
        })),
      deleteCycleEntry: (id) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.filter((x) => x.id !== id),
        })),
      archiveCycleEntry: (id, archived) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      bulkDeleteCycleEntries: (ids) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.filter((x) => !ids.includes(x.id)),
        })),
      bulkArchiveCycleEntries: (ids, archived) =>
        set((s) => ({
          cycleEntries: s.cycleEntries.map((x) =>
            ids.includes(x.id) ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),

      addJournalEntry: (e) =>
        set((s) => ({
          journalEntries: [{ ...e, id: uid() }, ...s.journalEntries],
        })),
      updateJournalEntry: (id, e) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            x.id === id ? { ...x, ...e } : x
          ),
        })),
      deleteJournalEntry: (id) =>
        set((s) => ({
          journalEntries: s.journalEntries.filter((x) => x.id !== id),
        })),
      archiveJournalEntry: (id, archived) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      toggleJournalPin: (id) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            x.id === id ? { ...x, pinned: !x.pinned } : x
          ),
        })),
      toggleJournalFavorite: (id) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            x.id === id ? { ...x, favorite: !x.favorite } : x
          ),
        })),
      bulkDeleteJournalEntries: (ids) =>
        set((s) => ({
          journalEntries: s.journalEntries.filter((x) => !ids.includes(x.id)),
        })),
      bulkArchiveJournalEntries: (ids, archived) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((x) =>
            ids.includes(x.id) ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),

      addWishlistItem: (i) =>
        set((s) => ({
          wishlistItems: [...s.wishlistItems, { ...i, id: uid() }],
        })),
      updateWishlistItem: (id, i) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.map((x) =>
            x.id === id ? { ...x, ...i } : x
          ),
        })),
      deleteWishlistItem: (id) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.filter((x) => x.id !== id),
        })),
      archiveWishlistItem: (id, archived) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      bulkDeleteWishlistItems: (ids) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.filter((x) => !ids.includes(x.id)),
        })),
      bulkArchiveWishlistItems: (ids, archived) =>
        set((s) => ({
          wishlistItems: s.wishlistItems.map((x) =>
            ids.includes(x.id) ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),

      addReminder: (r) =>
        set((s) => ({
          reminders: [...s.reminders, { ...r, id: uid() }],
        })),
      updateReminder: (id, r) =>
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id ? { ...x, ...r } : x
          ),
        })),
      deleteReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.filter((x) => x.id !== id),
        })),
      archiveReminder: (id, archived) =>
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      bulkDeleteReminders: (ids) =>
        set((s) => ({
          reminders: s.reminders.filter((x) => !ids.includes(x.id)),
        })),

      snoozeReminder: (id, minutes) =>
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id
              ? { ...x, snoozedUntil: new Date(Date.now() + minutes * 60000).toISOString() }
              : x
          ),
        })),
      completeReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id ? { ...x, lastCompleted: nowIso(), snoozedUntil: undefined } : x
          ),
        })),
      skipReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((x) =>
            x.id === id ? { ...x, lastSkipped: nowIso(), snoozedUntil: undefined } : x
          ),
        })),

      // ===== Care tasks (self-care routines) =====
      addCareTask: (t) =>
        set((s) => ({
          careTasks: [...s.careTasks, { ...t, id: uid(), createdAt: nowIso(), completion: {} }],
        })),
      updateCareTask: (id, t) =>
        set((s) => ({
          careTasks: s.careTasks.map((x) => (x.id === id ? { ...x, ...t } : x)),
        })),
      deleteCareTask: (id) =>
        set((s) => ({ careTasks: s.careTasks.filter((x) => x.id !== id) })),
      archiveCareTask: (id, archived) =>
        set((s) => ({
          careTasks: s.careTasks.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),
      toggleCareTaskCompletion: (id, date) =>
        set((s) => ({
          careTasks: s.careTasks.map((x) =>
            x.id === id
              ? { ...x, completion: { ...x.completion, [date]: !x.completion[date] } }
              : x
          ),
        })),

      // ===== Daily tasks (planner) =====
      addDailyTask: (t) =>
        set((s) => ({
          dailyTasks: [...s.dailyTasks, { ...t, id: uid(), createdAt: nowIso() }],
        })),
      updateDailyTask: (id, t) =>
        set((s) => ({
          dailyTasks: s.dailyTasks.map((x) => (x.id === id ? { ...x, ...t } : x)),
        })),
      deleteDailyTask: (id) =>
        set((s) => ({ dailyTasks: s.dailyTasks.filter((x) => x.id !== id) })),
      toggleDailyTask: (id) =>
        set((s) => ({
          dailyTasks: s.dailyTasks.map((x) =>
            x.id === id
              ? { ...x, completed: !x.completed, completedAt: !x.completed ? nowIso() : undefined }
              : x
          ),
        })),
      archiveDailyTask: (id, archived) =>
        set((s) => ({
          dailyTasks: s.dailyTasks.map((x) =>
            x.id === id ? { ...x, archived, archivedAt: archived ? nowIso() : undefined } : x
          ),
        })),

      // ===== Settings =====
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      setPCOS: (patch) =>
        set((s) => ({ settings: { ...s.settings, pcos: { ...s.settings.pcos, ...patch } } })),
      setAppearance: (patch) =>
        set((s) => ({ settings: { ...s.settings, appearance: { ...s.settings.appearance, ...patch } } })),

      exportData: () => {
        const s = get();
        const payload = {
          version: "5.0",
          hydration: s.hydration,
          hydrationLogs: s.hydrationLogs,
          moodLogs: s.moodLogs,
          mood: s.mood,
          cycleEntries: s.cycleEntries,
          journalEntries: s.journalEntries,
          wishlistItems: s.wishlistItems,
          reminders: s.reminders,
          careTasks: s.careTasks,
          dailyTasks: s.dailyTasks,
          settings: s.settings,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(payload, null, 2);
      },

      importData: (json, mode = "overwrite") => {
        try {
          const parsed = JSON.parse(json);
          // Sanitize: ensure all arrays are arrays, filter items without id
          const safeArr = <T extends { id?: string }>(v: unknown): T[] =>
            Array.isArray(v) ? v.filter((x): x is T => x && typeof x === "object" && "id" in x) : [];
          // Sanitize settings: merge with defaults to ensure all fields exist
          const safeSettings = (raw: unknown): AppSettings => {
            if (!raw || typeof raw !== "object") return defaultSettings;
            const r = raw as Record<string, unknown>;
            return {
              pcos: { ...defaultSettings.pcos, ...(r.pcos as object ?? {}) },
              appearance: { ...defaultSettings.appearance, ...(r.appearance as object ?? {}) },
              notifications: { ...defaultSettings.notifications, ...(r.notifications as object ?? {}) },
            };
          };
          // Sanitize hydration
          const safeHydration = (raw: unknown) => {
            if (!raw || typeof raw !== "object") return { current: 0, goal: 2000, history: [] as { date: string; amount: number }[] };
            const r = raw as Record<string, unknown>;
            return {
              current: typeof r.current === "number" ? r.current : 0,
              goal: typeof r.goal === "number" ? r.goal : 2000,
              history: Array.isArray(r.history) ? r.history : [],
            };
          };
          const safeMood = (raw: unknown) => {
            if (!raw || typeof raw !== "object") return { current: "😊", date: todayStr() };
            const r = raw as Record<string, unknown>;
            return {
              current: typeof r.current === "string" ? r.current : "😊",
              date: typeof r.date === "string" ? r.date : todayStr(),
            };
          };

          if (mode === "merge") {
            // Merge: keep existing, add new (dedupe by id)
            set((s) => ({
              cycleEntries: dedupe([...s.cycleEntries, ...safeArr<CycleEntry>(parsed.cycleEntries)]),
              journalEntries: dedupe([...s.journalEntries, ...safeArr<JournalEntry>(parsed.journalEntries)]),
              wishlistItems: dedupe([...s.wishlistItems, ...safeArr<WishlistItem>(parsed.wishlistItems)]),
              reminders: dedupe([...s.reminders, ...safeArr<Reminder>(parsed.reminders)]),
              careTasks: dedupe([...s.careTasks, ...safeArr<CareTask>(parsed.careTasks)]),
              dailyTasks: dedupe([...s.dailyTasks, ...safeArr<DailyTask>(parsed.dailyTasks)]),
              hydrationLogs: dedupe([...s.hydrationLogs, ...safeArr<HydrationLog>(parsed.hydrationLogs)]),
              moodLogs: dedupe([...s.moodLogs, ...safeArr<MoodLog>(parsed.moodLogs)]),
              hydration: safeHydration(parsed.hydration),
              mood: safeMood(parsed.mood),
              settings: safeSettings(parsed.settings),
            }));
          } else {
            // Overwrite (default)
            set(() => ({
              hydration: safeHydration(parsed.hydration),
              hydrationLogs: safeArr<HydrationLog>(parsed.hydrationLogs),
              moodLogs: safeArr<MoodLog>(parsed.moodLogs),
              mood: safeMood(parsed.mood),
              cycleEntries: safeArr<CycleEntry>(parsed.cycleEntries),
              journalEntries: safeArr<JournalEntry>(parsed.journalEntries),
              wishlistItems: safeArr<WishlistItem>(parsed.wishlistItems),
              reminders: safeArr<Reminder>(parsed.reminders),
              careTasks: safeArr<CareTask>(parsed.careTasks),
              dailyTasks: safeArr<DailyTask>(parsed.dailyTasks),
              settings: safeSettings(parsed.settings),
            }));
          }
          return true;
        } catch {
          return false;
        }
      },

      resetAll: () =>
        set(() => ({
          ...defaultData,
          theme: get().theme,
          settings: defaultSettings,
        })),
    }),
    {
      name: "abantika-wellness-v5",
      storage: createJSONStorage(() => localStorage),
      version: 5,
      // Migrate from v2 storage key
      migrate: (persisted: any, version: number) => {
        if (!persisted) return persisted;
        // Ensure new fields exist for older data
        return {
          ...persisted,
          careTasks: persisted.careTasks ?? [],
          dailyTasks: persisted.dailyTasks ?? [],
          settings: persisted.settings
            ? { ...defaultSettings, ...persisted.settings }
            : defaultSettings,
        };
      },
      partialize: (s) => ({
        theme: s.theme,
        hydration: s.hydration,
        hydrationLogs: s.hydrationLogs,
        moodLogs: s.moodLogs,
        mood: s.mood,
        cycleEntries: s.cycleEntries,
        journalEntries: s.journalEntries,
        wishlistItems: s.wishlistItems,
        reminders: s.reminders,
        careTasks: s.careTasks,
        dailyTasks: s.dailyTasks,
        settings: s.settings,
      }),
    }
  )
);

/** Hook that tracks whether the persisted store has hydrated on the client. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
