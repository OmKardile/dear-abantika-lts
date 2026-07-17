"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Trophy, Lock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import { computeAchievements } from "@/lib/achievements";
import type { AppData, Achievement } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  StaggerItem,
  AnimatedCounter,
} from "@/components/premium/primitives";

/* ============================================================
   Achievements — A celebration of milestones
   ============================================================ */

const CONFETTI_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--primary)",
  "var(--success)",
];

function Confetti({ id }: { id: string }) {
  const reduce = useReducedMotion();
  const pieces = React.useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        i,
        x: (Math.random() - 0.5) * 260,
        y: -30 - Math.random() * 70,
        rot: Math.random() * 540 - 270,
        delay: Math.random() * 0.12,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 4 + Math.random() * 4,
        round: Math.random() > 0.5,
      })),
    // re-randomize per celebration id
    [id]
  );
  if (reduce) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-start justify-center overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.i}
          className="absolute top-6"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "9999px" : "2px",
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y + 120,
            rotate: p.rot,
            opacity: 0,
            scale: 0.6,
          }}
          transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const p = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
      <motion.div
        className="h-full rounded-full gradient-primary-bg"
        initial={reduce ? { width: `${p}%` } : { width: 0 }}
        animate={{ width: `${p}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function AchievementCard({
  a,
  index,
  celebrating,
}: {
  a: Achievement;
  index: number;
  celebrating: boolean;
}) {
  return (
    <StaggerItem index={index}>
      <SurfaceCard
        glow={a.unlocked}
        className={cn(
          "relative overflow-hidden p-4 flex flex-col items-center text-center",
          !a.unlocked && "opacity-95"
        )}
      >
        <AnimatePresence>
          {celebrating && (
            <motion.div
              key="confetti"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Confetti id={a.id} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* glow halo on unlocked */}
        {a.unlocked && (
          <motion.div
            aria-hidden
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <motion.div
          className={cn(
            "text-4xl leading-none mb-2 relative",
            !a.unlocked && "grayscale opacity-45"
          )}
          animate={
            a.unlocked
              ? { scale: [1, 1.08, 1], y: [0, -2, 0] }
              : { scale: 1 }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {a.emoji}
        </motion.div>

        <h3 className="text-sm font-semibold text-text-primary leading-tight mb-1">
          {a.title}
        </h3>
        <p className="text-[11px] text-text-secondary leading-snug mb-3 min-h-[28px]">
          {a.description}
        </p>

        {a.unlocked ? (
          <div className="w-full">
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
              style={{
                background:
                  "color-mix(in oklch, var(--success) 16%, transparent)",
                color: "var(--success)",
              }}
            >
              <Sparkles size={10} />
              Unlocked!
            </div>
            {a.unlockedAt && (
              <p className="text-[10px] text-text-tertiary mt-1.5">
                {format(new Date(a.unlockedAt), "MMM d, yyyy")}
              </p>
            )}
          </div>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                <Lock size={9} />
                Locked
              </span>
              <span className="text-[10px] font-bold text-text-secondary">
                {Math.round(a.progress)}%
              </span>
            </div>
            <ProgressBar value={a.progress} />
          </div>
        )}
      </SurfaceCard>
    </StaggerItem>
  );
}

export function Achievements() {
  const reduce = useReducedMotion();
  const store = useStore();
  const data: AppData = store;

  const achievements = React.useMemo(() => computeAchievements(data), [data]);

  const sorted = React.useMemo(() => {
    const unlocked = achievements
      .filter((a) => a.unlocked)
      .sort(
        (a, b) =>
          new Date(b.unlockedAt ?? 0).getTime() -
          new Date(a.unlockedAt ?? 0).getTime()
      );
    const locked = achievements
      .filter((a) => !a.unlocked)
      .sort((a, b) => b.progress - a.progress);
    return [...unlocked, ...locked];
  }, [achievements]);

  const total = achievements.length;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const pct = total ? (unlockedCount / total) * 100 : 0;

  // detect newly-unlocked achievements for confetti
  const prevUnlockedRef = React.useRef<Set<string>>(new Set());
  const initRef = React.useRef(false);
  const [celebratingIds, setCelebratingIds] = React.useState<Set<string>>(
    new Set()
  );

  React.useEffect(() => {
    const current = new Set(
      achievements.filter((a) => a.unlocked).map((a) => a.id)
    );
    if (!initRef.current) {
      initRef.current = true;
      prevUnlockedRef.current = current;
      return;
    }
    const newOnes = [...current].filter(
      (id) => !prevUnlockedRef.current.has(id)
    );
    if (newOnes.length > 0) {
      setCelebratingIds(new Set(newOnes));
      const t = setTimeout(() => setCelebratingIds(new Set()), 2800);
      prevUnlockedRef.current = current;
      return () => clearTimeout(t);
    }
    prevUnlockedRef.current = current;
  }, [achievements]);

  return (
    <div className="space-y-5">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          title="Achievements"
          subtitle="Celebrate every milestone on your journey"
        />
      </motion.div>

      {/* Progress summary */}
      <SurfaceCard glow={unlockedCount > 0} className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg width={80} height={80} className="-rotate-90" viewBox="0 0 80 80">
              <circle
                cx={40}
                cy={40}
                r={32}
                fill="none"
                stroke="var(--surface-secondary)"
                strokeWidth={8}
              />
              <motion.circle
                cx={40}
                cy={40}
                r={32}
                fill="none"
                stroke="url(#ach-grad)"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                initial={reduce ? { strokeDashoffset: 0 } : { strokeDashoffset: 2 * Math.PI * 32 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 32 * (1 - pct / 100),
                }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="ach-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--chart-1)" />
                  <stop offset="100%" stopColor="var(--chart-4)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatedCounter
                value={unlockedCount}
                className="text-xl font-bold text-text-primary leading-none"
              />
              <span className="text-[10px] text-text-tertiary mt-0.5">
                / {total}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">
                {unlockedCount} of {total} unlocked
              </h3>
            </div>
            <p className="text-caption text-text-secondary leading-relaxed mb-2">
              {unlockedCount === 0
                ? "Log your wellness data to start earning badges."
                : unlockedCount === total
                ? "Every milestone unlocked. You're amazing!"
                : `${total - unlockedCount} more to discover — keep going!`}
            </p>
            <ProgressBar value={pct} />
          </div>
        </div>
      </SurfaceCard>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 gap-3">
        {sorted.map((a, i) => (
          <AchievementCard
            key={a.id}
            a={a}
            index={i}
            celebrating={celebratingIds.has(a.id)}
          />
        ))}
      </div>
    </div>
  );
}
