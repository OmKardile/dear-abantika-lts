# Abantika — Premium Wellness Companion

  

> A luxurious, private, offline-first wellness companion for hydration, mood, cycle tracking, journaling, reminders, and mindful daily rituals.

  

**Version 3.0** · Built with Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion, and Capacitor for native mobile packaging.

  

---

  

## ✨ Highlights

  

- **15 handcrafted premium themes** (light & dark) with full design-token systems

- **6 main destinations** in a floating glass bottom navigation

- **Complete data lifecycle** for every record — Create, View, Edit, Delete, Search, Filter, Sort, Archive, Restore

- **Premium UX patterns** — swipe-to-delete, long-press multi-select, undo snackbar, confirmation dialogs, animated counters, staggered lists, shared-element tab transitions

- **100% offline & private** — all data stays in the browser's localStorage; no servers, no accounts, no tracking

- **Mobile-first & responsive** — designed to fit 360px phone screens perfectly, wraps into a native APK via Capacitor

- **Accessibility-first** — reduced-motion support, ARIA labels, keyboard navigation, semantic HTML, high-contrast themes

  

---

  

## 📱 The Six Destinations

  

### 1. Home (Dashboard)

A warm animated greeting with the faded date/day, quick actions (Log Water, Log Mood, Cycle, Reminders), a vibrant wave hydration card, a compact **2×2 status grid** (Mood · Cycle · Streak · Next), and a rotating Daily Reflection moment card.

  

### 2. Cycle Tracker

Three views: **Calendar** (monthly grid with period & symptom markers), **List** (full lifecycle: search, 4 filter chips, sort, swipe-to-archive, multi-select, undo), and **Insights** (animated symptom bars, totals, recent entries). The entry form captures period toggle, flow intensity, 11 symptoms, weight, BBT, medication, and private notes.

  

### 3. Journal

Two tabs: **Diary** (search, mood filter chips, sort, animated entry cards with stickers) and **Wishlist** (4 luxury category boards — Save for Later, Urgent Need, Dream Cart, For Him — with image cards). Both support swipe-to-archive + undo, long-press multi-select, and a floating formatting toolbar in the diary editor.

  

### 4. Hydration

Animated circular progress ring with a droplet, ±250/+500ml quick-add, individual **log entries** (each editable/deletable with undo), a **recent mood** mini-section with full mood history, a weekly bar chart with today highlighted, and gentle hydration tips.

  

### 5. Reminders

A premium timeline with vertical rail and animated nodes. Each reminder has a category emoji, time, weekday chips, and a spring-animated enable/disable toggle. Full lifecycle: sort (newest/oldest/alpha/by-time), swipe-to-delete with confirmation, long-press multi-select with bulk delete.

  

### 6. Settings

Four tabs: **Theme** (gallery of 15 themes with mini device previews + color swatches + animated selection), **Backup** (export/import JSON, privacy banner, reset all data), **Archive** (restore or permanently delete any archived item across the whole app, grouped by type), and the About card.

  

---

  

## 🎨 The 15 Themes

  

We all know women are color sensitive !

Each theme ships a complete token set: background, elevated & surface colors, primary/secondary/accent, success/warning/error, border/divider, three-tier text hierarchy, 5 chart colors, hero/primary/accent/glass gradients, and soft/lifted/glow shadows — all in OKLCH for perceptually-uniform color.

  

---

  

## 🗂 Data Lifecycle Management

  

Every user-created record supports the full lifecycle:

  

| Operation | Where it's used |

|---|---|

| **Create** | FAB / "New" buttons, bottom-sheet forms |

| **View** | List, calendar, timeline views |

| **Edit** | Tap any card to open its form pre-filled |

| **Delete** | Swipe (soft archive + undo) or multi-select (permanent after confirm) |

| **Search** | Cycle list, Journal diary & wishlist |

| **Filter** | Cycle (period/symptoms/month), Journal (mood chips), Wishlist (categories) |

| **Sort** | Newest / Oldest / A→Z / Recently modified / by-time |

| **Archive** | Swipe left → Archive action (restorable from Settings → Archive) |

| **Restore** | Settings → Archive → Restore button per item |

| **Undo** | Auto-dismissing snackbar after soft deletes |

  

Record types with full lifecycle: Cycle entries, Journal entries, Wishlist items, Reminders, Hydration logs, Mood logs.

  

---

  

## 🛠 Tech Stack

  

| Layer | Technology |

|---|---|

| Framework | Next.js 16 (App Router, Turbopack) |

| Language | TypeScript 5 |

| Styling | Tailwind CSS 4 + shadcn/ui (New York) |

| Animation | Framer Motion 12 |

| Charts | Recharts 2 |

| Icons | Lucide React |

| State | Zustand 5 (with localStorage persistence) |

| Dates | date-fns 4 |

| Fonts | Geist Sans & Geist Mono |

| Mobile | Capacitor 6 (Android & iOS) |

| Package manager | Bun |

  

---

  

## 📂 Project Structure

  

```

my-project/

├── prisma/                      # Prisma schema (SQLite, available but unused at runtime)

├── public/                      # Static assets

├── src/

│   ├── app/

│   │   ├── api/route.ts         # Scaffolding route (excluded from mobile build)

│   │   ├── globals.css          # Design system: 15 themes + tokens + utilities

│   │   ├── layout.tsx           # Root layout, metadata v3.0, ThemeApplier, UndoProvider

│   │   └── page.tsx             # Single "/" route, client-side tab state

│   ├── components/

│   │   ├── app-shell.tsx        # 6-tab floating glass bottom navigation

│   │   ├── forms/               # Bottom-sheet forms (cycle, diary, wishlist, reminder, hydration-log, mood-log, mood-dialog)

│   │   ├── pages/               # Dashboard, CycleTracker, Journal, Hydration, Reminders, Settings

│   │   ├── premium/             # SurfaceCard, GlassCard, IconBadge, ProgressRing, AnimatedCounter, EmptyState, SectionHeader, Chip, SwipeableRow, SelectionBar, SortMenu, ConfirmDialog

│   │   ├── providers/           # ThemeApplier, UndoProvider

│   │   └── ui/                  # shadcn/ui component library

│   ├── hooks/

│   │   ├── use-mobile.ts

│   │   ├── use-toast.ts

│   │   └── use-selection.ts     # Long-press multi-select hook

│   └── lib/

│       ├── helpers.ts           # greeting(), formatTime(), timeUntil(), downloadJson()

│       ├── store.ts             # Zustand store with persistence + archive/restore/bulk ops

│       ├── themes.ts            # 15 ThemeMeta definitions

│       ├── types.ts             # All TypeScript types + constants

│       └── utils.ts             # cn() classname merger

├── mobile/                      # Capacitor workspace (created when packaging for APK/IPA)

├── next.config.ts               # Web config (output: standalone)

└── package.json

```

  

---

  

## 🚀 Getting Started

  

### Prerequisites

- **Node.js 20+**

- **Bun** (package manager & runtime) — install from https://bun.sh

  

### Install & run

  

```bash

bun install

bun run dev

```

  

The app starts on **http://localhost:3000**. Open it in the **Preview Panel** (or your browser) — it's designed mobile-first, so use a narrow viewport or device emulation for the intended experience.

  

### Available scripts

  

| Script | Purpose |

|---|---|

| `bun run dev` | Start the dev server (Turbopack) on port 3000 |

| `bun run lint` | Run ESLint |

| `bun run build` | Production build (standalone output) |

| `bun run start` | Run the production standalone server |

| `bun run db:push` | Push Prisma schema to SQLite (optional, not used at runtime) |

  

---

  

## 💾 Data & Privacy

  

All data is stored in the browser's `localStorage` under the key `abantika-wellness-v2`. The app:

  

- ✅ Works fully offline after first load

- ✅ Never sends data anywhere — no analytics, no servers, no accounts

- ✅ Supports full JSON export/import for backups (Settings → Backup)

- ✅ Has a reset-all option for a fresh start

  

To wipe everything: clear site data in your browser, or use Settings → Backup → Reset all data.

  

---

  

## 📦 Packaging for Mobile (Android APK / iOS)

  

The web app can be wrapped as a native mobile app using **Capacitor**. A separate `mobile/` workspace is used so the web project stays untouched.

  

### Windows quick start (Android)

  

1. **Install prerequisites:**

   - [Android Studio](https://developer.android.com/studio) (includes SDK + emulator)

   - [Java JDK 17](https://adoptium.net/) (Temurin 17)

   - Capacitor packages: `bun add @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar @capacitor/splash-screen @capacitor/app @capacitor/keyboard`

  

2. **Set environment variables** (PowerShell, run once):

   ```powershell

   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

   setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools;%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin"

   ```

   Restart your terminal afterwards.

  

3. **Accept SDK licenses:**

   ```powershell

   sdkmanager --licenses

   ```

  

4. **Create the mobile workspace:**

   ```powershell

   mkdir mobile

   cd mobile

   bunx cap init Abantika com.abantika.wellness --web-dir out

   bunx cap add android

   ```

  

5. **Create `mobile/next.config.mobile.ts`** with `output: "export"`, `distDir: "out"`, `images: { unoptimized: true }`, `trailingSlash: true`.

  

6. **Build & sync** (PowerShell script `mobile/build.ps1`):

   ```powershell

   # Temporarily move the unused api route so static export succeeds

   if (Test-Path ../src/app/api/route.ts) {

     Move-Item ../src/app/api/route.ts ../src/app/api/route.ts.bak

   }

   try {

     bunx next build -c mobile/next.config.mobile.ts

     bunx cap sync android

   } finally {

     if (Test-Path ../src/app/api/route.ts.bak) {

       Move-Item ../src/app/api/route.ts.bak ../src/app/api/route.ts

     }

   }

   ```

  

7. **Open in Android Studio & build APK:**

   ```powershell

   bunx cap open android

   ```

   In Android Studio: **Build → Generate Signed Bundle / APK → APK** → create a keystore → release → finish. The APK lands at `mobile/android/app/release/app-release.apk`.

  

### iOS (macOS only)

  

```bash

cd mobile

bun add @capacitor/ios

bunx cap add ios

bunx cap sync ios

bunx cap open ios   # opens Xcode

```

In Xcode: set signing team, run on device, or **Product → Archive** for TestFlight/App Store.

  

> A Mac with Xcode 15+ is required. A free Apple ID works for on-device testing; a paid Apple Developer account ($99/yr) is needed for App Store / TestFlight.

  

---

  

## ♿ Accessibility

  

- **Reduced motion**: all animations respect `prefers-reduced-motion`

- **Keyboard navigation**: all interactive elements are reachable & operable

- **Screen readers**: semantic HTML, ARIA labels, `aria-pressed` on toggles

- **Contrast**: every theme passes WCAG AA on body text

- **Touch targets**: minimum 44×44px on all interactive elements

  

---

  

## 🎯 Performance

  

- 60 FPS animations via Framer Motion + GPU-accelerated transforms

- Staggered list entrances capped to avoid jank on long lists

- `AnimatePresence` with `initial={false}` on sorted/filtered lists to prevent re-animation

- Zustand selectors prevent unnecessary re-renders

- Static export for instant mobile app cold-start

- Bundle kept lean — no heavy runtime dependencies

  

---

  

## 🔒 Privacy Promise

  

Abantika is private by design. There are no accounts, no analytics, no telemetry, no network calls from your data. Everything you log lives only on your device. Export a backup any time, import it on a new device, and you're home.

  

---

  

## 📜 Credits

  

- **Design inspiration**: Headspace, Stoic, Calm, Reflectly, Finch, Apple Health, Notion Calendar, Linear

- **UI primitives**: [shadcn/ui](https://ui.shadcn.com/) (New York style)

- **Icons**: [Lucide](https://lucide.dev/)

- **Fonts**: [Geist](https://vercel.com/font) by Vercel

- **Charts**: [Recharts](https://recharts.org/)

- **Animation**: [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License

Private project. All rights reserved.

---

**Made with 💝 for gentle days.**

---

# ignore below

## my personal notes

npm install @capacitor/core @capacitor/cli @capacitor/android

npm install @capacitor/app
npm install @capacitor/share

npm install @capacitor/status-bar

npm install @capacitor/splash-screen

npm install @capacitor/keyboard

npm install @capacitor/haptics

npm install @capacitor/local-notifications