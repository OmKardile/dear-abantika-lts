"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  Brain,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { generateInsights, getMoodIntelligence } from "@/lib/insights";
import {
  MEDICAL_DISCLAIMER,
  type AppData,
  type WellnessInsight,
} from "@/lib/types";
import {
  SurfaceCard,
  SectionHeader,
  StaggerItem,
  EmptyState,
} from "@/components/premium/primitives";

/* ============================================================
   Insights — Personalized wellness patterns & mood intelligence
   ============================================================ */

type InsightType = WellnessInsight["type"];

const TYPE_META: Record<
  InsightType,
  {
    color: string;
    bg: string;
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  pattern: {
    color: "var(--chart-5)",
    bg: "color-mix(in oklch, var(--chart-5) 14%, transparent)",
    label: "Pattern",
    Icon: TrendingUp,
  },
  warning: {
    color: "var(--warning)",
    bg: "color-mix(in oklch, var(--warning) 16%, transparent)",
    label: "Heads up",
    Icon: AlertTriangle,
  },
  positive: {
    color: "var(--success)",
    bg: "color-mix(in oklch, var(--success) 14%, transparent)",
    label: "Win",
    Icon: Sparkles,
  },
  tip: {
    color: "var(--primary)",
    bg: "color-mix(in oklch, var(--primary) 10%, transparent)",
    label: "Tip",
    Icon: Lightbulb,
  },
};

const CYCLE_RE = /\b(cycle|period|ovulat|fertile|pms|menstrual|flow|cramp)\b/i;

function isCycleRelated(i: WellnessInsight): boolean {
  return CYCLE_RE.test(i.title) || CYCLE_RE.test(i.description);
}

function InsightCard({
  insight,
  index,
}: {
  insight: WellnessInsight;
  index: number;
}) {
  const meta = TYPE_META[insight.type];
  const cycle = isCycleRelated(insight);
  return (
    <StaggerItem index={index}>
      <SurfaceCard
        className="relative overflow-hidden p-4"
        style={{ borderLeft: `4px solid ${meta.color}` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{ background: meta.bg }}
            aria-hidden
          >
            <span>{insight.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-text-primary leading-tight mb-1">
              {insight.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {insight.description}
            </p>
          </div>
        </div>
        {cycle && (
          <div className="mt-3 pt-3 border-t border-dashed border-border flex items-start gap-2">
            <AlertTriangle
              size={12}
              className="text-text-tertiary shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-text-tertiary leading-snug">
              {MEDICAL_DISCLAIMER}
            </p>
          </div>
        )}
      </SurfaceCard>
    </StaggerItem>
  );
}

function SectionShell({
  title,
  subtitle,
  Icon,
  insights,
  start,
}: {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  insights: WellnessInsight[];
  start: number;
}) {
  if (insights.length === 0) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl gradient-primary-bg flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary-foreground" />
        </div>
        <SectionHeader title={title} subtitle={subtitle} className="flex-1" />
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} index={start + i} />
        ))}
      </div>
    </motion.section>
  );
}

export function Insights() {
  const reduce = useReducedMotion();
  const store = useStore();
  const data: AppData = store;

  const patterns = React.useMemo(() => generateInsights(data), [data]);
  const moods = React.useMemo(() => getMoodIntelligence(data), [data]);
  const hasAny = patterns.length > 0 || moods.length > 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          title="Insights"
          subtitle="Personalized patterns from your wellness data"
        />
      </motion.div>

      {!hasAny ? (
        <EmptyState
          emoji="🔮"
          title="No insights yet"
          description="Keep logging to unlock personalized insights. The more you track, the more patterns we can find."
        />
      ) : (
        <>
          <SectionShell
            title="Wellness Patterns"
            subtitle="Trends we noticed in your routine"
            Icon={TrendingUp}
            insights={patterns}
            start={0}
          />
          <SectionShell
            title="Mood Intelligence"
            subtitle="What your emotions are telling you"
            Icon={Brain}
            insights={moods}
            start={patterns.length}
          />
        </>
      )}
    </div>
  );
}
