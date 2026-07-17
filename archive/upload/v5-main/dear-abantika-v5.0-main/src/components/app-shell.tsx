"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Home,
  Flower2,
  BookHeart,
  Droplet,
  Sparkles,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/premium/primitives";

export type TabId =
  | "home"
  | "cycle"
  | "journal"
  | "hydration"
  | "care"
  | "reminders"
  | "settings";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "cycle", label: "Cycle", icon: Flower2 },
  { id: "journal", label: "Journal", icon: BookHeart },
  { id: "hydration", label: "Water", icon: Droplet },
  { id: "care", label: "Care", icon: Sparkles },
  { id: "reminders", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * Strict separated layout:
 * - Top status-bar safe spacing
 * - Scrollable content area (the "content box")
 * - Solid (non-floating, non-transparent) bottom nav fixed at the bottom
 * Content never overlaps the nav. The nav has its own opaque surface.
 */
export function AppShell({
  active,
  onChange,
  children,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  // CSS variable for the nav height, exposed so FABs/overlays can position above it.
  // 6 items at ~56px tall + 8px top padding + safe-area bottom.
  const NAV_HEIGHT = "4rem"; // 64px solid bar
  const NAV_TOTAL = `calc(${NAV_HEIGHT} + env(safe-area-inset-bottom))`;

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col items-center gradient-hero-bg"
      style={{ "--nav-h": NAV_TOTAL } as React.CSSProperties}
    >
      {/* Ambient decorative blobs (fixed, behind everything) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "var(--chart-1)" }}
        />
        <div
          className="absolute top-1/3 -left-20 w-64 h-64 rounded-full opacity-[0.10] blur-3xl"
          style={{ background: "var(--chart-3)" }}
        />
      </div>

      {/* ===== Content box: scrollable, strictly above the nav ===== */}
      <main
        className="relative z-10 w-full max-w-md flex-1 overflow-y-auto scroll-area"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 2.75rem)",
          paddingBottom: "calc(var(--nav-h) + 0.75rem)",
          minHeight: "100dvh",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="px-4">
          <PageTransition id={active}>{children}</PageTransition>
        </div>
      </main>

      {/* ===== Stylish solid bottom navigation ===== */}
      <motion.nav
        initial={reduce ? false : { y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        {/* Subtle gradient top edge for a premium finished look */}
        <div
          aria-hidden
          className="h-[2px] w-full opacity-60"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--border), transparent)",
          }}
        />
        <div className="glass-nav shadow-lifted">
          <div
            className="flex items-stretch justify-between px-1.5 py-1.5"
            style={{ minHeight: NAV_HEIGHT }}
          >
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChange(tab.id)}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                  className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0.5 rounded-[16px] gradient-primary-bg shadow-glow"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <motion.div
                      animate={
                        isActive ? { scale: 1, y: 0 } : { scale: 0.88, y: 0 }
                      }
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.6 : 2}
                        className={cn(
                          "transition-colors",
                          isActive
                            ? "text-primary-foreground"
                            : "text-text-tertiary"
                        )}
                      />
                    </motion.div>
                    <span
                      className={cn(
                        "text-[9px] font-semibold tracking-wide transition-colors",
                        isActive
                          ? "text-primary-foreground"
                          : "text-text-tertiary"
                      )}
                    >
                      {tab.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
