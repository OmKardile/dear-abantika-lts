// ============================================================
// Dear Abantika v5.0 — Type definitions
// Backward-compatible: all existing fields preserved.
// ============================================================

export interface CycleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow?: "light" | "medium" | "heavy" | "spotting";
  symptoms: string[];
  weight?: number;
  bbt?: number; // basal body temperature °C
  medication?: string;
  notes?: string;
  // v5.0 expanded fields
  painScale?: number; // 0-10
  sleepHours?: number;
  moodTag?: string;
  libido?: "low" | "normal" | "high";
  discharge?: string;
  supplements?: string;
  clots?: boolean;
  bowelChanges?: boolean;
  // PCOS-specific
  isSpotting?: boolean;
  isBreakthrough?: boolean;
  archived?: boolean;
  archivedAt?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  mood: string;
  reflection: string;
  sticker?: string;
  // v5.0 expanded fields
  tags?: string[];
  pinned?: boolean;
  favorite?: boolean;
  image?: string;
  archived?: boolean;
  archivedAt?: string;
}

export type WishlistCategory =
  | "save-later"
  | "urgent"
  | "dream"
  | "for-him";

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  category: WishlistCategory;
  notes?: string;
  link?: string;
  image?: string;
  archived?: boolean;
  archivedAt?: string;
}

export type ReminderCategory =
  | "medication"
  | "water"
  | "skincare"
  | "brush"
  | "period"
  | "ovulation"
  | "supplements"
  | "journal"
  | "custom";

export type ReminderFrequency =
  | "once"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm
  category: ReminderCategory;
  days: boolean[]; // 7, Sunday=0
  enabled: boolean;
  // v5.0 expanded fields
  frequency?: ReminderFrequency;
  customIntervalDays?: number; // for custom frequency
  snoozedUntil?: string; // ISO timestamp
  lastCompleted?: string; // ISO timestamp of last mark-done
  lastSkipped?: string; // ISO timestamp of last skip
  archived?: boolean;
  archivedAt?: string;
}

export interface HydrationHistoryPoint {
  date: string;
  amount: number;
}

export interface HydrationLog {
  id: string;
  timestamp: string; // ISO
  amount: number; // ml (can be negative for removal)
}

export interface MoodLog {
  id: string;
  timestamp: string; // ISO
  mood: string;
  note?: string;
}

// ============================================================
// v5.0 NEW ENTITIES
// ============================================================

export type CareRoutineType = "morning" | "afternoon" | "night" | "weekly" | "monthly" | "custom";

export interface CareTask {
  id: string;
  title: string;
  emoji?: string;
  routine: CareRoutineType;
  time?: string; // HH:mm optional
  days: boolean[]; // 7, Sunday=0
  enabled: boolean;
  // completion tracking: map of date -> completed
  completion: Record<string, boolean>; // { "2026-07-02": true }
  createdAt: string;
  archived?: boolean;
  archivedAt?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  emoji?: string;
  priority: "low" | "medium" | "high";
  date: string; // YYYY-MM-DD the task is for
  completed: boolean;
  completedAt?: string;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  createdAt: string;
  archived?: boolean;
  archivedAt?: string;
}

export interface PCOSSettings {
  enabled: boolean;
  diagnosedDate?: string;
  cycleLengthAvg?: number; // override if irregular
  notes?: string;
  doctorNotes?: string;
  medications?: string;
  insulinResistance?: boolean;
  lastPeriodStart?: string;
}

export interface AppSettings {
  pcos: PCOSSettings;
  appearance: {
    fontSize: "small" | "medium" | "large";
    dynamicColors: boolean; // Material You
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
}

export interface AppData {
  // Existing (preserved)
  hydration: {
    current: number;
    goal: number;
    history: HydrationHistoryPoint[];
  };
  hydrationLogs: HydrationLog[];
  moodLogs: MoodLog[];
  mood: {
    current: string;
    date: string;
  };
  cycleEntries: CycleEntry[];
  journalEntries: JournalEntry[];
  wishlistItems: WishlistItem[];
  reminders: Reminder[];
  // v5.0 NEW
  careTasks: CareTask[];
  dailyTasks: DailyTask[];
  settings: AppSettings;
}

export type SortOption =
  | "newest"
  | "oldest"
  | "alpha"
  | "modified";

// ============================================================
// Expanded symptoms for v5.0 (preserves original 11 + adds many)
// ============================================================
export const SYMPTOMS = [
  // Original
  "Cramps",
  "Bloating",
  "Acne",
  "Fatigue",
  "Headache",
  "Mood Swings",
  "Sugar Cravings",
  "Hair Thinning",
  "Hirsutism",
  "Sleep Issues",
  "Skin Darkening",
  // v5.0 additions
  "Nausea",
  "Breast Tenderness",
  "Back Pain",
  "Joint Pain",
  "Dizziness",
  "Anxiety",
  "Irritability",
  "Brain Fog",
  "Hot Flashes",
  "Night Sweats",
  "Constipation",
  "Diarrhea",
  "Increased Appetite",
  "Low Libido",
  "High Libido",
  "Spotting",
  "Breakthrough Bleeding",
  "Clots",
  "Migraine",
] as const;

// PCOS-flagged symptoms for trend tracking
export const PCOS_SYMPTOMS = [
  "Irregular Cycles",
  "Hair Thinning",
  "Hirsutism",
  "Acne",
  "Weight Gain",
  "Skin Darkening",
  "Sugar Cravings",
  "Fatigue",
  "Brain Fog",
  "Mood Swings",
];

export const MOODS = [
  "😊", "😄", "😌", "😔", "😢", "😴", "🥰", "😤", "🤗", "😇",
];

export const MOOD_FILTERS = [
  "All", "😊", "😌", "😔", "😤", "😴", "🥰", "😰", "😎",
];

export const STICKERS = [
  "🌟", "🌸", "💫", "🦋", "🌙", "✨", "🌷", "🍃", "🌈", "💝",
];

export const JOURNAL_TAGS = [
  "gratitude",
  "reflection",
  "goal",
  "memory",
  "dream",
  "stress",
  "joy",
  "healing",
];

export const WISHLIST_CATEGORIES: {
  id: WishlistCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "save-later", label: "Save for Later", emoji: "📌" },
  { id: "urgent", label: "Urgent Need", emoji: "⚡" },
  { id: "dream", label: "Dream Cart", emoji: "✨" },
  { id: "for-him", label: "For Him", emoji: "💙" },
];

export const REMINDER_CATEGORIES: {
  id: ReminderCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "medication", label: "Medication", emoji: "💊" },
  { id: "water", label: "Water", emoji: "💧" },
  { id: "skincare", label: "Skincare", emoji: "✨" },
  { id: "brush", label: "Brush", emoji: "🪥" },
  { id: "period", label: "Period", emoji: "🌸" },
  { id: "ovulation", label: "Ovulation", emoji: "🥚" },
  { id: "supplements", label: "Supplements", emoji: "🌿" },
  { id: "journal", label: "Journal", emoji: "📔" },
  { id: "custom", label: "Custom", emoji: "📌" },
];

export const CARE_ROUTINES: {
  id: CareRoutineType;
  label: string;
  emoji: string;
}[] = [
  { id: "morning", label: "Morning", emoji: "🌅" },
  { id: "afternoon", label: "Afternoon", emoji: "☀️" },
  { id: "night", label: "Night", emoji: "🌙" },
  { id: "weekly", label: "Weekly", emoji: "📅" },
  { id: "monthly", label: "Monthly", emoji: "🗓️" },
  { id: "custom", label: "Custom", emoji: "✨" },
];

export const CARE_TASK_PRESETS: { title: string; emoji: string; routine: CareRoutineType }[] = [
  { title: "Brush teeth", emoji: "🪥", routine: "morning" },
  { title: "Skincare", emoji: "✨", routine: "morning" },
  { title: "Sunscreen", emoji: "☀️", routine: "morning" },
  { title: "Take vitamins", emoji: "💊", routine: "morning" },
  { title: "Meditation", emoji: "🧘", routine: "morning" },
  { title: "Stretching", emoji: "🤸", routine: "morning" },
  { title: "Morning walk", emoji: "🚶", routine: "morning" },
  { title: "Skincare", emoji: "🌙", routine: "night" },
  { title: "Brush teeth", emoji: "🪥", routine: "night" },
  { title: "Take medicine", emoji: "💊", routine: "night" },
  { title: "Journal", emoji: "📔", routine: "night" },
  { title: "Read", emoji: "📖", routine: "night" },
  { title: "Exercise", emoji: "🏃", routine: "weekly" },
  { title: "Meal prep", emoji: "🥗", routine: "weekly" },
  { title: "Self-care bath", emoji: "🛁", routine: "weekly" },
];

export const TASK_PRIORITY_META: {
  id: "low" | "medium" | "high";
  label: string;
  color: string;
}[] = [
  { id: "low", label: "Low", color: "var(--text-tertiary)" },
  { id: "medium", label: "Medium", color: "var(--warning)" },
  { id: "high", label: "High", color: "var(--error)" },
];

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  alpha: "A → Z",
  modified: "Recently updated",
};

export const FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  once: "One time",
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom interval",
};

// Disclaimer shown with predictions
export const MEDICAL_DISCLAIMER =
  "Predictions are estimates based on your logged data. They are not medical advice. Always consult your healthcare provider.";

// ============================================================
// v6.0 NEW — Achievements, Insights, Reports
// ============================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
}

export interface WellnessInsight {
  id: string;
  type: "pattern" | "warning" | "positive" | "tip";
  title: string;
  description: string;
  emoji: string;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  hydrationAvg: number;
  moodAvg: string;
  cycleDays: number;
  careCompletion: number;
  taskCompletion: number;
  journalCount: number;
  wellnessScore: number;
}

export const ACHIEVEMENT_DEFS: Omit<Achievement, "unlocked" | "unlockedAt" | "progress">[] = [
  { id: "water-7", title: "7 Day Water Streak", description: "Drink water 7 days in a row", emoji: "💧" },
  { id: "water-30", title: "30 Day Water Streak", description: "Drink water 30 days in a row", emoji: "🏆" },
  { id: "journal-7", title: "Week of Words", description: "Journal 7 days in a row", emoji: "📔" },
  { id: "journal-30", title: "30 Day Journal", description: "Journal 30 days in a row", emoji: "✨" },
  { id: "perfect-week", title: "Perfect Week", description: "Complete all routines for 7 days", emoji: "🌟" },
  { id: "routine-master", title: "Routine Master", description: "Complete 100 care tasks", emoji: "🧘" },
  { id: "hydration-goal", title: "Hydration Hero", description: "Hit your water goal 10 times", emoji: "🌊" },
  { id: "mood-tracker", title: "Mood Mindful", description: "Log mood 30 times", emoji: "😊" },
  { id: "cycle-tracker", title: "Cycle Aware", description: "Log 3 cycles", emoji: "🌸" },
  { id: "first-journal", title: "First Words", description: "Write your first journal entry", emoji: "✏️" },
];

export const DAILY_QUOTES = [
  "You are allowed to rest. You are allowed to be soft. You are allowed to take up space.",
  "Your body is not a machine. Treat it like a garden — patience, water, sunlight.",
  "Healing is not linear. Every step forward counts, even the small ones.",
  "You don't have to be perfect to be worthy of love and care.",
  "Today, choose gentleness. With yourself, with your body, with your pace.",
  "Your worth is not measured by productivity. You are enough as you are.",
  "Listen to your body. It knows what it needs, even when your mind is loud.",
  "Small habits, repeated daily, create extraordinary change.",
  "You are not behind. You are exactly where you need to be.",
  "Be the kind of friend to yourself that you are to others.",
];

export const DAILY_WELLNESS_TIPS = [
  "Drink a glass of water right now — your future self will thank you. (Unt banja)",
  "Take 3 deep breaths. Let your shoulders drop away from your ears. (sans le bhidu)",
  "Stand up and stretch for 30 seconds. Your body craves movement. (hil ja thoda moti)",
  "Step outside for 2 minutes of fresh air and natural light. (kabhi hota to nahi h)",
  "Put your phone down and look at something 20 feet away for 20 seconds. (bhut dikehga)",
  "Write down one thing you're grateful for, right now. (mera naam liko)",
  "Have you eaten something nourishing in the last 3 hours? (chiliChiken nahi dryfruits bolra)",
  "Check your posture — ears over shoulders, shoulders over hips. (bhensa)",
  "Splash cold water on your face for an instant reset. (Ankh ko baraf laga lo)",
  "Send a kind message to someone you love (omkar❤️). Connection is wellness.",
];

