"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, type TabId } from "@/components/app-shell";
import { Dashboard } from "@/components/pages/dashboard";
import { CycleTracker } from "@/components/pages/cycle-tracker";
import { Journal } from "@/components/pages/journal";
import { Hydration } from "@/components/pages/hydration";
import { Care } from "@/components/pages/care";
import { Settings } from "@/components/pages/settings";
import { Reminders } from "@/components/pages/reminders";
import { Timeline } from "@/components/pages/timeline";
import { Insights } from "@/components/pages/insights";
import { Achievements } from "@/components/pages/achievements";
import { Reports } from "@/components/pages/reports";
import { GlobalSearch } from "@/components/pages/global-search";
import { useHydrated } from "@/lib/store";
import { ChevronLeft } from "lucide-react";

type OverlayId =
  | "timeline"
  | "insights"
  | "achievements"
  | "reports"
  | "search"
  | null;

const OVERLAY_TITLES: Record<string, string> = {
  timeline: "Today's Timeline",
  insights: "Wellness Insights",
  achievements: "Achievements",
  reports: "Wellness Reports",
  search: "Search",
};

export default function Home() {
  const [tab, setTab] = React.useState<TabId>("home");
  const [overlay, setOverlay] = React.useState<OverlayId>(null);
  const hydrated = useHydrated();

  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [tab, overlay]);

  if (!hydrated) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center gradient-hero-bg">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-14 h-14 rounded-3xl gradient-primary-bg shadow-glow flex items-center justify-center"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-2xl">✨</span>
          </motion.div>
          <p className="text-caption text-text-secondary">Loading your space…</p>
        </div>
      </div>
    );
  }

  const openOverlay = (id: Exclude<OverlayId, null>) => setOverlay(id);

  return (
    <div ref={ref}>
      <AppShell active={tab} onChange={(t) => { setOverlay(null); setTab(t); }}>
        {tab === "home" && (
          <Dashboard onNavigate={setTab} onOpenOverlay={openOverlay} />
        )}
        {tab === "cycle" && <CycleTracker />}
        {tab === "journal" && <Journal />}
        {tab === "hydration" && <Hydration />}
        {tab === "care" && <Care onNavigate={setTab} />}
        {tab === "reminders" && <Reminders />}
        {tab === "settings" && <Settings />}
      </AppShell>

      {/* Full-screen overlay for secondary pages */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[80] gradient-hero-bg"
          >
            <div
              className="relative z-10 w-full max-w-md mx-auto h-[100dvh] overflow-y-auto scroll-area"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 2rem)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
              }}
            >
              {/* Overlay header */}
              <div className="flex items-center gap-3 px-4 mb-4 sticky top-0 z-10 gradient-hero-bg pb-2">
                <button
                  onClick={() => setOverlay(null)}
                  className="w-10 h-10 rounded-2xl surface-card flex items-center justify-center shrink-0"
                  aria-label="Back"
                >
                  <ChevronLeft size={20} className="text-text-primary" />
                </button>
                <h1 className="text-headline-serif text-text-primary">
                  {OVERLAY_TITLES[overlay]}
                </h1>
              </div>
              <div className="px-4">
                {overlay === "timeline" && <Timeline />}
                {overlay === "insights" && <Insights />}
                {overlay === "achievements" && <Achievements />}
                {overlay === "reports" && <Reports />}
                {overlay === "search" && <GlobalSearch />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
