import { useState } from "react";
import { motion } from "motion/react";
import {
  Home, Flower2, BookOpen, Droplets, Settings,
  Plus, Search, Bell, ChevronLeft, ChevronRight,
  Star, Download, Upload, Check, Pencil,
  BarChart3, ShoppingBag, Smile, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip,
} from "recharts";

// ─── Theme Definitions ──────────────────────────────────────────────────────

interface ThemeConfig {
  name: string;
  emoji: string;
  bg: string;
  card: string;
  cardHigh: string;
  fg: string;
  fgMuted: string;
  accent: string;
  accentSoft: string;
  border: string;
  swatch: string;
}

const THEMES: Record<string, ThemeConfig> = {
  monoNoir: {
    name: "Mono Noir", emoji: "🖤",
    bg: "#090909", card: "#141414", cardHigh: "#1C1C1C",
    fg: "#F0F0F0", fgMuted: "#7A7A7A",
    accent: "#E8E8E8", accentSoft: "#222222",
    border: "rgba(255,255,255,0.08)",
    swatch: "#2A2A2A",
  },
  sage: {
    name: "Sage", emoji: "🌿",
    bg: "#0B1410", card: "#131E18", cardHigh: "#1A2C21",
    fg: "#DDEEE0", fgMuted: "#6E9977",
    accent: "#72C47E", accentSoft: "#172A1E",
    border: "rgba(114,196,126,0.12)",
    swatch: "#72C47E",
  },
  lavender: {
    name: "Lavender", emoji: "💜",
    bg: "#0F0F1A", card: "#16162C", cardHigh: "#1E1E3C",
    fg: "#E6E0FF", fgMuted: "#8484CC",
    accent: "#A07AF0", accentSoft: "#1E183A",
    border: "rgba(160,122,240,0.12)",
    swatch: "#A07AF0",
  },
  rose: {
    name: "Rose", emoji: "🌸",
    bg: "#150C10", card: "#201218", cardHigh: "#2C1820",
    fg: "#FFE0EC", fgMuted: "#CC8A9A",
    accent: "#FF7EB3", accentSoft: "#381626",
    border: "rgba(255,126,179,0.12)",
    swatch: "#FF7EB3",
  },
  ocean: {
    name: "Ocean", emoji: "🌊",
    bg: "#080E18", card: "#0D1826", cardHigh: "#132032",
    fg: "#D4E8F8", fgMuted: "#5A8AB0",
    accent: "#4AACF0", accentSoft: "#0E2038",
    border: "rgba(74,172,240,0.12)",
    swatch: "#4AACF0",
  },
  sand: {
    name: "Sand", emoji: "🏜️",
    bg: "#13100A", card: "#1C1810", cardHigh: "#261E0E",
    fg: "#F5ECD8", fgMuted: "#A89870",
    accent: "#EEC87A", accentSoft: "#32280E",
    border: "rgba(238,200,122,0.12)",
    swatch: "#EEC87A",
  },
};

// ─── Static Data ───────────────────────────────────────────────────────────

const MOODS = ["😊", "😌", "😐", "😔", "😤", "🥰", "😴", "😰"];
const MOOD_LABELS: Record<string, string> = {
  "😊": "Happy", "😌": "Calm", "😐": "Neutral", "😔": "Sad",
  "😤": "Frustrated", "🥰": "Loved", "😴": "Tired", "😰": "Anxious",
};
const SYMPTOMS = [
  "Cramps", "Bloating", "Acne", "Fatigue", "Headache",
  "Mood Swings", "Sugar Cravings", "Hair Thinning",
  "Hirsutism", "Sleep Issues", "Skin Darkening",
];
const FLOW_TYPES = ["Light", "Medium", "Heavy"];

const JOURNAL_ENTRIES = [
  { id: 1, title: "A gentle morning", mood: "😌", reflection: "Started the day with tea and stretching. Felt present and at ease with everything around me.", date: "Jun 28", sticker: "🌸" },
  { id: 2, title: "Processing feelings", mood: "😔", reflection: "Today was heavy but I made it through. Small wins count. I am proud of myself for showing up.", date: "Jun 26", sticker: "🌧️" },
  { id: 3, title: "So grateful today", mood: "🥰", reflection: "Called mom. Had a long walk. Cooked something nourishing. These simple things matter.", date: "Jun 24", sticker: "✨" },
];

const WISHLIST_ITEMS = {
  saveForLater: [
    { id: 1, title: "Silk pillowcase", desc: "25 momme mulberry silk, champagne color", notes: "For hair care routine", tag: "Self-care" },
    { id: 2, title: "Liforme yoga mat", desc: "Natural rubber, alignment lines, eco-friendly", notes: "Measure space first", tag: "Wellness" },
  ],
  urgentNeed: [
    { id: 3, title: "Evening primrose oil", desc: "1000mg capsules, 120 count, GLA-rich formula", notes: "Almost out of current bottle", tag: "Supplements" },
  ],
  dreamCart: [
    { id: 4, title: "Dyson Airwrap", desc: "Multi-styler complete, fine to medium hair", notes: "Wait for seasonal sale", tag: "Beauty" },
    { id: 5, title: "Weighted blanket", desc: "15 lbs cooling bamboo fabric, slate gray", notes: "For deeper sleep", tag: "Sleep" },
  ],
};

const REMINDERS = [
  { id: 1, label: "Evening supplements", time: "8:00 PM", category: "Medication", days: [0, 1, 2, 3, 4, 5, 6], active: true },
  { id: 2, label: "Drink water", time: "Every 2 hrs", category: "Water", days: [0, 1, 2, 3, 4], active: true },
  { id: 3, label: "Vitamin D & Iron", time: "9:00 AM", category: "Medication", days: [0, 2, 4], active: false },
  { id: 4, label: "Evening face massage", time: "10:00 PM", category: "Skincare", days: [5, 6], active: true },
];

const WEEK_WATER = [
  { day: "M", ml: 1800 }, { day: "T", ml: 2100 }, { day: "W", ml: 1400 },
  { day: "T", ml: 2000 }, { day: "F", ml: 1600 }, { day: "S", ml: 2200 },
  { day: "S", ml: 600 },
];

const CYCLE_HISTORY = [
  { cycle: "Mar", length: 29 }, { cycle: "Apr", length: 27 },
  { cycle: "May", length: 31 }, { cycle: "Jun", length: 28 },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Shared Components ──────────────────────────────────────────────────────

function Chip({
  label, selected, onClick, theme,
}: {
  label: string; selected: boolean; onClick: () => void; theme: ThemeConfig;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0"
      style={{
        background: selected ? theme.accent : theme.accentSoft,
        color: selected ? "#000" : theme.fgMuted,
        border: `1px solid ${selected ? theme.accent : theme.border}`,
      }}
    >
      {label}
    </button>
  );
}

function SectionTitle({
  title, action, theme,
}: {
  title: string; action?: string; theme: ThemeConfig;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: theme.fgMuted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}
      >
        {title}
      </h2>
      {action && (
        <button className="text-xs font-medium" style={{ color: theme.fgMuted }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Water Wave SVG ─────────────────────────────────────────────────────────

function WaterAnimation({ percentage, color }: { percentage: number; color: string }) {
  const fillY = 128 - (128 * percentage / 100);
  return (
    <div className="mx-auto" style={{ width: 144, height: 144 }}>
      <style>{`
        @keyframes waveMove { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
      `}</style>
      <svg width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <clipPath id="wClip"><circle cx="72" cy="72" r="60" /></clipPath>
          <linearGradient id="wGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <circle cx="72" cy="72" r="65" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="72" cy="72" r="60" fill="rgba(255,255,255,0.03)" />
        <g clipPath="url(#wClip)">
          <rect x="0" y={fillY + 6} width="144" height={138 - fillY} fill="url(#wGrad)" />
          <g style={{ animation: "waveMove 3s linear infinite" }}>
            <path
              d={`M-144,${fillY + 8} C-108,${fillY} -72,${fillY + 16} -36,${fillY + 8} C0,${fillY} 36,${fillY + 16} 72,${fillY + 8} C108,${fillY} 144,${fillY + 16} 180,${fillY + 8} C216,${fillY} 252,${fillY + 16} 288,${fillY + 8} L288,144 L-144,144 Z`}
              fill={color}
              opacity="0.75"
            />
          </g>
        </g>
        <text x="72" y="68" textAnchor="middle" fill="white" fontSize="21" fontWeight="700" fontFamily="'Plus Jakarta Sans',sans-serif">
          {percentage}%
        </text>
        <text x="72" y="84" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="'DM Sans',sans-serif">
          of daily goal
        </text>
      </svg>
    </div>
  );
}

// ─── Calendar Widget ────────────────────────────────────────────────────────

function CalendarWidget({
  theme, periodDays, selectedDay, setSelectedDay,
}: {
  theme: ThemeConfig; periodDays: number[]; selectedDay: number; setSelectedDay: (d: number) => void;
}) {
  const [month, setMonth] = useState(5);
  const year = 2026;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div className="rounded-[20px] p-4" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonth((m) => Math.max(0, m - 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: theme.accentSoft, color: theme.fgMuted }}
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setMonth((m) => Math.min(11, m + 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: theme.accentSoft, color: theme.fgMuted }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold py-1" style={{ color: theme.fgMuted }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const isPeriod = periodDays.includes(day);
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-[11px] font-medium transition-all"
              style={{
                background: isSelected
                  ? theme.accent
                  : isPeriod
                  ? `${theme.accent}28`
                  : "transparent",
                color: isSelected ? "#000" : isPeriod ? theme.accent : theme.fg,
              }}
            >
              {day}
              {isPeriod && !isSelected && (
                <span className="sr-only">period</span>
              )}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: `${theme.accent}30` }} />
          <span className="text-[10px]" style={{ color: theme.fgMuted }}>Period</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: theme.accent }} />
          <span className="text-[10px]" style={{ color: theme.fgMuted }}>Selected</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Screen ────────────────────────────────────────────────────────

function DashboardScreen({
  theme, waterAmount, mood, setActiveTab,
}: {
  theme: ThemeConfig; waterAmount: number; mood: string; setActiveTab: (t: string) => void;
}) {
  const hydrationPct = Math.round((waterAmount / 2000) * 100);
  const quickActions = [
    { icon: Droplets, label: "Log Water", tab: "water", color: "#4AACF0" },
    { icon: Smile, label: "Log Mood", tab: "journal", color: "#F0C87A" },
    { icon: Flower2, label: "Cycle Entry", tab: "cycle", color: "#FF7EB3" },
    { icon: Bell, label: "Add Reminder", tab: "settings", color: "#A07AF0" },
  ];

  return (
    <div className="pb-32 px-4 pt-1 space-y-5">
      {/* Hero */}
      <div className="pt-3 pb-1">
        <p className="text-[10px] font-medium tracking-widest uppercase mb-2" style={{ color: theme.fgMuted, fontFamily: "'DM Mono',monospace" }}>
          Tuesday · July 1, 2026
        </p>
        <h1 className="text-[22px] font-bold leading-tight mb-1.5" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          ✨ Abantika Kardile ✨
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: theme.fgMuted, fontFamily: "'DM Sans',sans-serif" }}>
          Take care of yourself today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map(({ icon: Icon, label, tab, color }) => (
          <button
            key={label}
            onClick={() => setActiveTab(tab)}
            className="flex flex-col items-center gap-2 p-3 rounded-[18px] transition-all active:scale-95"
            style={{ background: theme.card, border: `1px solid ${theme.border}` }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}1A` }}>
              <Icon size={17} color={color} />
            </div>
            <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: theme.fgMuted }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Status Cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hydration */}
        <button
          onClick={() => setActiveTab("water")}
          className="p-4 rounded-[20px] text-left transition-all active:scale-[0.97]"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Droplets size={12} color="#4AACF0" />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.fgMuted }}>Hydration</span>
          </div>
          <div className="relative h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: theme.accentSoft }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${hydrationPct}%`, background: "#4AACF0" }} />
          </div>
          <div className="font-bold text-lg leading-none mb-0.5" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {waterAmount}
            <span className="text-[10px] font-normal ml-1" style={{ color: theme.fgMuted }}>/2000ml</span>
          </div>
          <div className="text-[10px]" style={{ color: theme.fgMuted }}>{hydrationPct}% of goal</div>
        </button>

        {/* Mood */}
        <button
          onClick={() => setActiveTab("journal")}
          className="p-4 rounded-[20px] text-left transition-all active:scale-[0.97]"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Smile size={12} color="#F0C87A" />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.fgMuted }}>Mood</span>
          </div>
          <div className="text-4xl mb-1.5">{mood}</div>
          <div className="text-sm font-semibold leading-none mb-0.5" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {MOOD_LABELS[mood]}
          </div>
          <div className="text-[10px]" style={{ color: theme.fgMuted }}>Today's feeling</div>
        </button>

        {/* Cycle */}
        <button
          onClick={() => setActiveTab("cycle")}
          className="p-4 rounded-[20px] text-left transition-all active:scale-[0.97]"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Flower2 size={12} color="#FF7EB3" />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.fgMuted }}>Cycle</span>
          </div>
          <div className="text-sm font-bold mb-1.5" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Day 18</div>
          <div className="text-[10px] px-2 py-0.5 rounded-full inline-block mb-0.5" style={{ background: "#FF7EB318", color: "#FF7EB3" }}>
            Follicular
          </div>
          <div className="text-[10px] block mt-1" style={{ color: theme.fgMuted }}>~10 days away</div>
        </button>

        {/* Reminder */}
        <button
          onClick={() => setActiveTab("settings")}
          className="p-4 rounded-[20px] text-left transition-all active:scale-[0.97]"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Bell size={12} color="#A07AF0" />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.fgMuted }}>Reminder</span>
          </div>
          <div className="text-sm font-bold mb-1.5" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Supplements</div>
          <div className="text-[10px] px-2 py-0.5 rounded-full inline-block mb-0.5" style={{ background: "#A07AF018", color: "#A07AF0" }}>
            8:00 PM
          </div>
          <div className="text-[10px] block mt-1" style={{ color: theme.fgMuted }}>Tonight</div>
        </button>
      </div>

      {/* Daily Advice Card */}
      <div className="rounded-[24px] overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
        <div className="h-28 relative flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${theme.accentSoft} 0%, ${theme.cardHigh} 100%)` }}>
          <svg viewBox="0 0 360 112" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="orb1" cx="25%" cy="50%" r="45%">
                <stop offset="0%" stopColor={theme.accent} stopOpacity="0.12" />
                <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="orb2" cx="75%" cy="50%" r="40%">
                <stop offset="0%" stopColor={theme.accent} stopOpacity="0.08" />
                <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="90" cy="56" rx="130" ry="90" fill="url(#orb1)" />
            <ellipse cx="270" cy="56" rx="110" ry="80" fill="url(#orb2)" />
          </svg>
          <span className="text-5xl relative z-10 drop-shadow-lg">🌷</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={11} color={theme.accent} fill={theme.accent} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.fgMuted }}>Daily Reflection</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed mb-2" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            "You are doing better than you think. Rest is not laziness — it is how you replenish yourself."
          </p>
          <p className="text-xs leading-relaxed" style={{ color: theme.fgMuted, fontFamily: "'DM Sans',sans-serif" }}>
            Your body works hard every day. A few moments of stillness can restore more than you expect.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Cycle Screen ────────────────────────────────────────────────────────────

function CycleScreen({ theme }: { theme: ThemeConfig }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedFlow, setSelectedFlow] = useState("Medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Cramps", "Bloating"]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  return (
    <div className="pb-32 px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Cycle Tracker
        </h1>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
          style={{
            background: showAnalytics ? theme.accent : theme.accentSoft,
            color: showAnalytics ? "#000" : theme.fgMuted,
          }}
        >
          <BarChart3 size={12} />
          Analytics
        </button>
      </div>

      <CalendarWidget
        theme={theme}
        periodDays={[26, 27, 28, 29, 30]}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />

      {!showAnalytics ? (
        <>
          <div className="rounded-[20px] p-4 space-y-4" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
            <p className="text-sm font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Log for June {selectedDay}
            </p>

            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: theme.fgMuted }}>Flow Intensity</p>
              <div className="flex gap-2">
                {FLOW_TYPES.map((f) => (
                  <Chip key={f} label={f} selected={selectedFlow === f} onClick={() => setSelectedFlow(f)} theme={theme} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: theme.fgMuted }}>Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => (
                  <Chip key={s} label={s} selected={selectedSymptoms.includes(s)} onClick={() => toggleSymptom(s)} theme={theme} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: theme.fgMuted }}>Private Notes</p>
              <textarea
                placeholder="How are you feeling today?"
                className="w-full text-xs p-3 rounded-[12px] resize-none outline-none"
                rows={3}
                style={{
                  background: theme.accentSoft,
                  color: theme.fg,
                  border: `1px solid ${theme.border}`,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              />
            </div>

            <button
              className="w-full py-3 rounded-[14px] text-sm font-bold transition-all active:scale-95"
              style={{ background: theme.accent, color: "#000" }}
            >
              Save Entry
            </button>
          </div>

          <div className="rounded-[20px] p-4" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
            <SectionTitle title="Cycle Insight" theme={theme} />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Current Phase", value: "Follicular", color: "#72C47E" },
                { label: "Day of Cycle", value: "Day 18", color: theme.accent },
                { label: "Last Period", value: "Jun 26–30", color: "#FF7EB3" },
                { label: "Est. Next", value: "Jul 23–27", color: "#A07AF0" },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-[12px]" style={{ background: theme.accentSoft }}>
                  <div className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: theme.fgMuted }}>{label}</div>
                  <div className="text-sm font-bold" style={{ color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[20px] p-4" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
            <SectionTitle title="Cycle History (days)" theme={theme} />
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={CYCLE_HISTORY} barSize={30} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="cycle" tick={{ fill: theme.fgMuted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                <Bar dataKey="length" radius={[6, 6, 0, 0]}>
                  {CYCLE_HISTORY.map((_, i) => (
                    <Cell key={i} fill={i === 3 ? theme.accent : `${theme.accent}40`} />
                  ))}
                </Bar>
                <Tooltip
                  contentStyle={{ background: theme.cardHigh, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.fg, fontSize: 11 }}
                  formatter={(v: number) => [`${v} days`, "Length"]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Average Length", value: "28.8 days", icon: "📊" },
              { label: "Range", value: "27 – 31 days", icon: "📏" },
              { label: "Estimated Window", value: "Jul 23–27", icon: "📅" },
              { label: "Top Symptom", value: "Cramps", icon: "📌" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="p-3.5 rounded-[16px]" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
                <div className="text-xl mb-2">{icon}</div>
                <div className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: theme.fgMuted }}>{label}</div>
                <div className="text-sm font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Journal Screen ──────────────────────────────────────────────────────────

function JournalScreen({
  theme, mood, setMood,
}: {
  theme: ThemeConfig; mood: string; setMood: (m: string) => void;
}) {
  const [tab, setTab] = useState<"diary" | "wishlist">("diary");
  const [wishlistTab, setWishlistTab] = useState<"saveForLater" | "urgentNeed" | "dreamCart">("saveForLater");
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  const wishlistCategories = [
    { key: "saveForLater" as const, label: "Save for Later", emoji: "🔖" },
    { key: "urgentNeed" as const, label: "Urgent Need", emoji: "⚡" },
    { key: "dreamCart" as const, label: "Dream Cart", emoji: "✨" },
  ];

  return (
    <div className="pb-32 px-4 pt-4 space-y-4">
      <h1 className="text-xl font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Journal
      </h1>

      {/* Main tab bar */}
      <div className="flex gap-1.5 p-1 rounded-[14px]" style={{ background: theme.card }}>
        {[{ key: "diary", label: "📔 My Diary" }, { key: "wishlist", label: "🛍️ Wishlist" }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as "diary" | "wishlist")}
            className="flex-1 py-2 rounded-[10px] text-xs font-bold transition-all"
            style={{ background: tab === key ? theme.accent : "transparent", color: tab === key ? "#000" : theme.fgMuted }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "diary" ? (
        <>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[14px]" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
            <Search size={13} color={theme.fgMuted} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries…"
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: theme.fg, fontFamily: "'DM Sans',sans-serif" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}><X size={13} color={theme.fgMuted} /></button>
            )}
          </div>

          {/* Mood filter */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setMoodFilter(null)}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold shrink-0"
              style={{ background: !moodFilter ? theme.accent : theme.accentSoft, color: !moodFilter ? "#000" : theme.fgMuted }}
            >
              All
            </button>
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMoodFilter(moodFilter === m ? null : m)}
                className="w-8 h-8 rounded-full text-base flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: moodFilter === m ? theme.accent : theme.accentSoft,
                  border: `1px solid ${moodFilter === m ? theme.accent : theme.border}`,
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {JOURNAL_ENTRIES
              .filter((e) => !moodFilter || e.mood === moodFilter)
              .filter((e) => !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-[20px]"
                  style={{ background: theme.card, border: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{entry.sticker}</span>
                      <div>
                        <div className="text-sm font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                          {entry.title}
                        </div>
                        <div className="text-[10px]" style={{ color: theme.fgMuted }}>{entry.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-base">{entry.mood}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: theme.accentSoft, color: theme.fgMuted }}>
                        {MOOD_LABELS[entry.mood]}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: theme.fgMuted, fontFamily: "'DM Sans',sans-serif" }}>
                    {entry.reflection}
                  </p>
                </div>
              ))}

            <button
              className="w-full py-3 rounded-[16px] text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: theme.accentSoft, border: `1.5px dashed ${theme.border}`, color: theme.fgMuted }}
            >
              <Plus size={15} />
              Write today's entry
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
            {wishlistCategories.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setWishlistTab(key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0"
                style={{
                  background: wishlistTab === key ? theme.accent : theme.accentSoft,
                  color: wishlistTab === key ? "#000" : theme.fgMuted,
                  border: `1px solid ${wishlistTab === key ? theme.accent : theme.border}`,
                }}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {WISHLIST_ITEMS[wishlistTab].map((item) => (
              <div
                key={item.id}
                className="rounded-[20px] overflow-hidden"
                style={{ background: theme.card, border: `1px solid ${theme.border}` }}
              >
                <div
                  className="h-20 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.cardHigh})` }}
                >
                  <ShoppingBag size={26} color={theme.fgMuted} />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-sm font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      {item.title}
                    </div>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full ml-2 shrink-0"
                      style={{ background: `${theme.accent}1A`, color: theme.accent }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: theme.fgMuted, fontFamily: "'DM Sans',sans-serif" }}>{item.desc}</p>
                  {item.notes && (
                    <div className="flex items-center gap-1.5">
                      <Pencil size={9} color={theme.fgMuted} />
                      <span className="text-[10px]" style={{ color: theme.fgMuted }}>{item.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              className="w-full py-3 rounded-[16px] text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: theme.accentSoft, border: `1.5px dashed ${theme.border}`, color: theme.fgMuted }}
            >
              <Plus size={15} />
              Add to wishlist
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Hydration Screen ────────────────────────────────────────────────────────

function HydrationScreen({
  theme, waterAmount, setWaterAmount,
}: {
  theme: ThemeConfig; waterAmount: number; setWaterAmount: (n: number) => void;
}) {
  const dailyGoal = 2000;
  const percentage = Math.min(100, Math.round((waterAmount / dailyGoal) * 100));
  const waterColor = theme.accent === "#E8E8E8" ? "#4AACF0" : theme.accent;

  return (
    <div className="pb-32 px-4 pt-4 space-y-5">
      <h1 className="text-xl font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Hydration
      </h1>

      <div
        className="p-6 rounded-[28px] flex flex-col items-center gap-5"
        style={{ background: theme.card, border: `1px solid ${theme.border}` }}
      >
        <WaterAnimation percentage={percentage} color={waterColor} />

        <div className="text-center">
          <div className="text-3xl font-bold leading-none mb-1" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {waterAmount}
            <span className="text-sm font-normal ml-1.5" style={{ color: theme.fgMuted }}>ml</span>
          </div>
          <div className="text-xs" style={{ color: theme.fgMuted }}>of {dailyGoal}ml daily goal</div>
        </div>

        <div className="flex gap-3 w-full">
          {[250, 500].map((amount) => (
            <button
              key={amount}
              onClick={() => setWaterAmount(Math.min(dailyGoal, waterAmount + amount))}
              className="flex-1 py-3 rounded-[14px] text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ background: `${waterColor}18`, color: waterColor, border: `1.5px solid ${waterColor}30` }}
            >
              <Plus size={14} />
              {amount}ml
            </button>
          ))}
        </div>

        <button onClick={() => setWaterAmount(0)} className="text-xs" style={{ color: theme.fgMuted }}>
          Reset for today
        </button>
      </div>

      {/* Weekly chart */}
      <div className="rounded-[20px] p-4" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
        <SectionTitle title="This Week" theme={theme} />
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={WEEK_WATER} barSize={20} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fill: theme.fgMuted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
            <Bar dataKey="ml" radius={[5, 5, 0, 0]}>
              {WEEK_WATER.map((_, i) => (
                <Cell key={i} fill={i === 6 ? waterColor : `${waterColor}38`} />
              ))}
            </Bar>
            <Tooltip
              contentStyle={{ background: theme.cardHigh, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.fg, fontSize: 11 }}
              formatter={(v: number) => [`${v}ml`, "Intake"]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Reminders */}
      <div className="rounded-[20px] p-4" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
        <SectionTitle title="Water Reminders" action="Edit" theme={theme} />
        <div className="space-y-0">
          {["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"].map((time, i, arr) => (
            <div
              key={time}
              className="flex items-center justify-between py-2.5"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none" }}
            >
              <div className="flex items-center gap-2.5">
                <Droplets size={13} color={waterColor} />
                <span className="text-xs font-medium" style={{ color: theme.fg }}>Drink water</span>
              </div>
              <span className="text-xs font-medium" style={{ color: theme.fgMuted, fontFamily: "'DM Mono',monospace" }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Screen ─────────────────────────────────────────────────────────

function SettingsScreen({
  theme, activeTheme, setActiveTheme,
}: {
  theme: ThemeConfig; activeTheme: string; setActiveTheme: (t: string) => void;
}) {
  const [settingsTab, setSettingsTab] = useState<"reminders" | "themes" | "backup">("reminders");
  const [reminders, setReminders] = useState(REMINDERS);
  const [catFilter, setCatFilter] = useState("All");

  const categories = ["All", "Medication", "Water", "Skincare", "General Care"];
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const toggleReminder = (id: number) =>
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));

  const filtered = reminders.filter((r) => catFilter === "All" || r.category === catFilter);

  return (
    <div className="pb-32 px-4 pt-4 space-y-4">
      <h1 className="text-xl font-bold" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Settings
      </h1>

      {/* Settings tabs */}
      <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: theme.card }}>
        {[
          { key: "reminders", label: "🔔 Alerts" },
          { key: "themes", label: "🎨 Themes" },
          { key: "backup", label: "☁️ Backup" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSettingsTab(key as "reminders" | "themes" | "backup")}
            className="flex-1 py-2 rounded-[10px] text-[10px] font-bold transition-all"
            style={{ background: settingsTab === key ? theme.accent : "transparent", color: settingsTab === key ? "#000" : theme.fgMuted }}
          >
            {label}
          </button>
        ))}
      </div>

      {settingsTab === "reminders" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
                style={{
                  background: catFilter === cat ? theme.accent : theme.accentSoft,
                  color: catFilter === cat ? "#000" : theme.fgMuted,
                  border: `1px solid ${catFilter === cat ? theme.accent : theme.border}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((reminder) => (
              <div key={reminder.id} className="p-4 rounded-[20px]" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold mb-1" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      {reminder.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: theme.accentSoft, color: theme.fgMuted }}>
                        {reminder.category}
                      </span>
                      <span className="text-[10px]" style={{ color: theme.fgMuted, fontFamily: "'DM Mono',monospace" }}>
                        {reminder.time}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
                    style={{ background: reminder.active ? theme.accent : theme.accentSoft }}
                  >
                    <div
                      className="absolute top-[3px] transition-all duration-300 w-[18px] h-[18px] rounded-full bg-white shadow-sm"
                      style={{ left: reminder.active ? "calc(100% - 21px)" : "3px" }}
                    />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {dayLabels.map((d, i) => (
                    <div
                      key={i}
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: reminder.days.includes(i) ? `${theme.accent}28` : theme.accentSoft,
                        color: reminder.days.includes(i) ? theme.accent : theme.fgMuted,
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="w-full py-3 rounded-[16px] text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: theme.accent, color: "#000" }}
            >
              <Plus size={16} />
              Add Reminder
            </button>
          </div>
        </>
      )}

      {settingsTab === "themes" && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed" style={{ color: theme.fgMuted }}>
            Choose your personal wellness palette. Changes apply instantly.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setActiveTheme(key)}
                className="p-4 rounded-[22px] text-left transition-all active:scale-[0.97]"
                style={{
                  background: t.card,
                  border: `2px solid ${activeTheme === key ? t.accent : t.border}`,
                  boxShadow: activeTheme === key ? `0 0 0 1px ${t.accent}30` : "none",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: t.bg, border: `1.5px solid ${t.accent}` }}
                  >
                    {activeTheme === key
                      ? <Check size={13} color={t.accent} />
                      : <span className="text-base">{t.emoji}</span>}
                  </div>
                  <div className="w-4 h-4 rounded-full" style={{ background: t.swatch }} />
                  <div className="w-3 h-3 rounded-full opacity-60" style={{ background: t.accent }} />
                </div>
                <div className="text-sm font-bold mb-2" style={{ color: t.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {t.name}
                </div>
                <div className="space-y-1">
                  <div className="h-1 rounded-full" style={{ background: t.accent, width: "65%" }} />
                  <div className="h-1 rounded-full opacity-40" style={{ background: t.fgMuted, width: "85%" }} />
                  <div className="h-1 rounded-full opacity-20" style={{ background: t.fgMuted, width: "50%" }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {settingsTab === "backup" && (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed" style={{ color: theme.fgMuted }}>
            Your data stays private and on-device. Export anytime to back it up or move to a new device.
          </p>
          {[
            { icon: Download, title: "Export Data", desc: "Save all your entries, logs, and settings as a secure encrypted file.", action: "Export Now", color: theme.accent },
            { icon: Upload, title: "Restore Data", desc: "Import a backup file to restore your complete Abantika history.", action: "Choose File", color: theme.fgMuted },
          ].map(({ icon: Icon, title, desc, action, color }) => (
            <div key={title} className="p-5 rounded-[24px]" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} color={color} />
              </div>
              <div className="text-base font-bold mb-1.5" style={{ color: theme.fg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {title}
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: theme.fgMuted, fontFamily: "'DM Sans',sans-serif" }}>
                {desc}
              </p>
              <button
                className="w-full py-2.5 rounded-[12px] text-sm font-bold transition-all active:scale-95"
                style={{ background: `${color}18`, color: color, border: `1px solid ${color}28` }}
              >
                {action}
              </button>
            </div>
          ))}
          <div className="p-4 rounded-[16px] flex items-center gap-3" style={{ background: theme.accentSoft, border: `1px solid ${theme.border}` }}>
            <span className="text-xl">🔒</span>
            <p className="text-xs leading-relaxed" style={{ color: theme.fgMuted }}>
              Abantika never uploads your data. Everything is stored locally on your device only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bottom Navigation ───────────────────────────────────────────────────────

function BottomNav({
  active, onChange, theme,
}: {
  active: string; onChange: (t: string) => void; theme: ThemeConfig;
}) {
  const tabs = [
    { key: "home", icon: Home, label: "Home" },
    { key: "cycle", icon: Flower2, label: "Cycle" },
    { key: "journal", icon: BookOpen, label: "Journal" },
    { key: "water", icon: Droplets, label: "Water" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 px-3 pb-5 pt-2 z-50"
      style={{ background: `linear-gradient(to top, ${theme.bg} 65%, transparent)` }}
    >
      <div
        className="flex items-center justify-around p-2 rounded-[28px]"
        style={{
          background: `${theme.card}F0`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.45)`,
        }}
      >
        {tabs.map(({ key, icon: Icon, label }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-[18px] transition-all duration-200"
              style={{ background: isActive ? `${theme.accent}18` : "transparent" }}
            >
              <Icon size={20} color={isActive ? theme.accent : theme.fgMuted} strokeWidth={isActive ? 2.2 : 1.7} />
              <span className="text-[9px] font-bold" style={{ color: isActive ? theme.accent : theme.fgMuted }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Status Bar ──────────────────────────────────────────────────────────────

function StatusBar({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-2.5"
      style={{ background: "transparent" }}
    >
      <span className="text-[11px] font-bold" style={{ color: theme.fg, fontFamily: "'DM Mono',monospace" }}>
        9:41
      </span>
      <div className="flex items-center gap-2.5">
        <div className="flex gap-[2px] items-end h-3">
          {[3, 5, 7, 10].map((h, i) => (
            <div key={i} className="w-[3px] rounded-sm" style={{ height: h, background: i < 3 ? theme.fg : `${theme.fg}28` }} />
          ))}
        </div>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <circle cx="7" cy="9" r="1.2" fill={theme.fg} />
          <path d="M4 6.5 Q7 4.2 10 6.5" stroke={theme.fg} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M1.5 3.8 Q7 0.2 12.5 3.8" stroke={theme.fg} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        </svg>
        <div className="flex items-center gap-0.5">
          <div className="relative w-[22px] h-[11px] rounded-[3px]" style={{ border: `1.2px solid ${theme.fg}70` }}>
            <div className="absolute top-[2px] left-[2px] bottom-[2px] rounded-[1.5px]" style={{ background: theme.fg, width: "70%" }} />
          </div>
          <div className="w-[2px] h-[5px] rounded-r-sm" style={{ background: `${theme.fg}45` }} />
        </div>
      </div>
    </div>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeTheme, setActiveTheme] = useState("monoNoir");
  const [waterAmount, setWaterAmount] = useState(600);
  const [mood, setMood] = useState("😊");

  const theme = THEMES[activeTheme];

  const renderScreen = () => {
    switch (activeTab) {
      case "home": return <DashboardScreen theme={theme} waterAmount={waterAmount} mood={mood} setActiveTab={setActiveTab} />;
      case "cycle": return <CycleScreen theme={theme} />;
      case "journal": return <JournalScreen theme={theme} mood={mood} setMood={setMood} />;
      case "water": return <HydrationScreen theme={theme} waterAmount={waterAmount} setWaterAmount={setWaterAmount} />;
      case "settings": return <SettingsScreen theme={theme} activeTheme={activeTheme} setActiveTheme={setActiveTheme} />;
      default: return null;
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center"
      style={{ background: "#030303", fontFamily: "'DM Sans',sans-serif" }}
    >
      <div
        className="relative w-full max-w-[430px] overflow-hidden"
        style={{
          background: theme.bg,
          minHeight: "100svh",
          transition: "background 0.5s ease",
        }}
      >
        <StatusBar theme={theme} />

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="overflow-y-auto"
          style={{ height: "calc(100svh - 48px)", scrollbarWidth: "none" }}
        >
          {renderScreen()}
        </motion.div>

        <BottomNav active={activeTab} onChange={setActiveTab} theme={theme} />
      </div>
    </div>
  );
}
