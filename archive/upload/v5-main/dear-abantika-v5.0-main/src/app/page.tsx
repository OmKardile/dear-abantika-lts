"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AppShell, type TabId } from "@/components/app-shell";
import { Dashboard } from "@/components/pages/dashboard";
import { CycleTracker } from "@/components/pages/cycle-tracker";
import { Journal } from "@/components/pages/journal";
import { Hydration } from "@/components/pages/hydration";
import { Care } from "@/components/pages/care";
import { Settings } from "@/components/pages/settings";
import { Reminders } from "@/components/pages/reminders";
import { useHydrated } from "@/lib/store";

export default function Home() {
  const [tab, setTab] = React.useState<TabId>("home");
  const hydrated = useHydrated();

  // scroll to top on tab change
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [tab]);

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

  return (
    <div ref={ref}>
      <AppShell active={tab} onChange={setTab}>
        {tab === "home" && <Dashboard onNavigate={setTab} />}
        {tab === "cycle" && <CycleTracker />}
        {tab === "journal" && <Journal />}
        {tab === "hydration" && <Hydration />}
        {tab === "care" && <Care onNavigate={setTab} />}
        {tab === "reminders" && <Reminders />}
        {tab === "settings" && <Settings />}
      </AppShell>
    </div>
  );
}
