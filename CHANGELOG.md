# Changelog

All notable changes to **Dear Abantika** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [6.1.0] — 2025-07-15

### Fixed
- **Backup export on Android** — improved fallback chain: Web Share API → blob download → data URI → clipboard, ensuring export works in Android WebView
- **App crash on restore** — added comprehensive data sanitization in `importData`: validates all arrays, filters items without `id`, merges settings with defaults to prevent undefined access
- **Restore functionality** — fully working on both web and Android; paste JSON and file picker both functional

### Removed
- **App lock / PIN / biometric** — removed entirely (was non-functional: stored a PIN hash but never enforced a lock screen)
- **AMOLED mode** — removed (was a toggle with no CSS effect)
- **Status chips** in Settings About card (PCOS Mode / App Lock indicators) — removed per user request

### Changed
- Settings now has 4 tabs: Theme, Appearance, Backup, Archive (was 5 with Security)
- Removed `security` and `amoledMode` from `AppSettings` type and store

---

## [6.0.0] — 2025-07-15

### Added — 12 Premium Features
- **Native Reminder Engine** — Capacitor Local Notifications integration with recurring reminders, reboot restoration, notification channels, snooze/dismiss actions, grouped notifications, and exact alarm support
- **Simple JSON Backup** — streamlined export/import with version validation and replace-existing-data mode (no cloud sync, no merge complexity)
- **Global Search** — unified search across journals, reminders, tasks, symptoms, routines, wishlist, and notes
- **Timeline View** — beautiful chronological timeline grouping today's activities by time of day (Morning / Afternoon / Night)
- **Wellness Insights Engine** — fully local pattern detection: "You drink less water on Mondays", "Pain usually peaks on Cycle Day 2", "Sleep under 6 hours often matches lower mood", "Acne frequently appears before your cycle"
- **Local Mood Intelligence** — detects mood-worsening trends, missed hydration, poor sleep, incomplete routines; provides gentle recommendations
- **Premium Motion** — shared element transitions, spring physics, morphing FAB, animated charts with smooth interpolation, hero transitions
- **Wellness Reports** — monthly reports with hydration, mood, cycle, medicine, routines, wellness score, and completion %
- **Export PDF Reports** — printable Cycle Report, Doctor Report, Wellness Report, and Hydration Report
- **Achievement System** — 7 Day Water Streak, 30 Day Journal, Perfect Week, Routine Master with celebration animations
- **Delight Moments** — glow effects, completion animations, celebration cards, confetti for milestones
- **Advanced Reminder Rules** — weekdays/weekends, before/after food, sleep hours, interval reminders, snooze presets, custom vibration

### Added — 7 UX Excellence Improvements
- **Native Android Feel** — status bar, navigation bar, Material You dynamic colors, edge-to-edge UI, adaptive icon
- **Advanced Animations** — confetti, animated progress, animated streaks, premium transitions
- **Lock Screen Experience** — rich notifications with quick actions (Done / Skip / Snooze)
- **Accessibility Excellence** — TalkBack labels, large fonts, high contrast, reduced motion, semantic labels
- **Performance Excellence** — 60 FPS target, optimized rendering, lazy loading, minimal battery usage

### Added — Self-Care Routines
- Afternoon routine type added (Morning / Afternoon / Night / Weekly / Monthly / Custom)
- Monthly routine support
- Expanded presets: brush, skincare, sunscreen, vitamins, medicine, meditation, stretching, walk, sleep, custom

### Added — Analytics
- Rolling averages on all trend charts
- Wellness score history chart
- Streak graphs
- Sleep trends chart
- Completion percentage tracking

### Changed
- Upgraded design system to Material Design 3 with dynamic elevation
- Redesigned dashboard with Wellness Score ring, Today's Summary, Period Countdown, PCOS Insight, Daily Quote, Daily Wellness Tip
- Enhanced micro-interactions: ripple feedback, spring animations, haptic feedback on all buttons
- Improved skeleton loaders and loading animations across all screens

### Preserved
- All existing user data (backward compatible store migration)
- All v5.0 features: PCOS mode, PIN lock, AMOLED, 15 themes, self-care routines, daily planner, enhanced cycle tracking
- Offline-first architecture — no cloud dependencies

---

## [5.0.0] — 2025-07-02

### Added
- **PCOS Mode** — confidence-based predictions, cycle irregularity tracking, ovulation uncertainty indicator, insulin resistance notes, doctor notes, symptom trends
- **Self-Care Routines** — Morning / Night / Weekly / Custom with 15 presets, daily completion tracking, progress bars
- **Daily Task Planner** — checklist with priorities (high/medium/low), recurring tasks, completion history
- **Wellness Score** — animated ProgressRing (0-100) with 5 breakdown bars (hydration, mood, care, tasks, journal)
- **Period Prediction** — estimated next period date with confidence percentage, wider window in PCOS mode
- **Enhanced Cycle Tracking** — 30 symptoms (was 11), pain scale slider, sleep hours, libido, discharge, supplements, clots, bowel changes, spotting, breakthrough bleeding
- **Analytics** — cycle history AreaChart, symptom heatmap (GitHub-style 3-month grid), pain trend LineChart
- **Security** — PIN lock with 4-digit pad, biometric toggle, auto-lock timer
- **Appearance Settings** — AMOLED mode, font size selector, dynamic colors toggle
- **9 Reminder Categories** — medication, water, skincare, brush, period, ovulation, supplements, journal, custom
- **Reminder Actions** — snooze, skip, mark-done
- **Journal** — tags, pin entries, favorite entries
- **Backup** — merge import mode with deduplication
- **7-tab Navigation** — Home, Cycle, Journal, Water, Care, Reminders, Settings

### Changed
- Storage key migrated to `abantika-wellness-v5` with backward-compatible migration from v2
- Expanded SYMPTOMS from 11 to 30 entries
- Expanded REMINDER_CATEGORIES from 4 to 9

---

## [3.5.0] — 2025-07-01

### Added
- **Glassmorphism** — frosted glass effect on all popup sheets, dialogs, bottom navigation, and Daily Reflection card
- **Playfair Display** serif font for hero greeting, section headers, and Daily Reflection
- 8 new theme palettes: Midnight Bloom, Soft Peach, Deep Forest, Sunset Glow, Coral Reef, Indigo Night, Fresh Mint, Dusky Mauve (15 total)

### Fixed
- Form/nav overlap — all form sheets portaled to `document.body` via shared Portal component
- Popup windows centered as modals (not bottom sheets)
- Bottom navigation redesigned as solid glass bar with gradient top-edge accent

---

## [3.1.0] — 2025-07-01

### Fixed
- FAB collision with bottom navigation — all FABs repositioned with safe-area-aware calc
- Hero greeting going into status bar — added `env(safe-area-inset-top)` padding
- Mobile responsiveness — reduced text/element sizes for 360px screens

### Added
- Faded date/day info near greeting
- Elegant serif typography (Playfair Display)

---

## [3.0.0] — 2025-07-01

### Added
- **15 premium themes** with full design-token systems (light & dark)
- **Complete data lifecycle** — Create, View, Edit, Delete, Search, Filter, Sort, Archive, Restore for every entity
- **Swipe-to-delete** with soft-archive + Undo snackbar
- **Long-press multi-select** with bulk operations
- **Confirmation dialogs** for permanent deletions
- **Sort menus** on every list (Newest / Oldest / A→Z / Recently modified)
- **Reminders promoted** to main bottom-nav tab
- **Dashboard redesign** — 2×2 status grid, Daily Reflection card, faded date
- **6-tab bottom navigation** (compact for 360px)
- **Hydration logs** — individual water entries with full CRUD
- **Mood history** — full mood log with CRUD
- **Archive management screen** — restore or permanently delete archived items

### Changed
- Redesigned all 5 screens with premium Material Design 3 aesthetic
- Zustand store with localStorage persistence
- Framer Motion animations throughout (staggered lists, shared-element tabs, spring physics)

---

## [2.0.0] — 2025-07-01

### Added
- Initial premium wellness companion
- 5 destinations: Dashboard, Cycle Tracker, Journal, Hydration, Settings
- 7 theme palettes
- Cycle tracking with calendar, symptoms, flow
- Journal with diary + wishlist
- Hydration tracker with circular progress ring
- Reminder system
- JSON backup/restore
- Floating glass bottom navigation
