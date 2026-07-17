"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------------- SurfaceCard ---------------- */
export const SurfaceCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    elevated?: boolean;
    glow?: boolean;
  }
>(({ className, elevated, glow, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[24px] border",
      elevated ? "surface-elevated" : "surface-card",
      glow && "shadow-glow",
      className
    )}
    {...props}
  />
));
SurfaceCard.displayName = "SurfaceCard";

/* ---------------- GlassCard ---------------- */
export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/10 glass shadow-lifted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------- IconBadge ---------------- */
export function IconBadge({
  icon: Icon,
  size = 44,
  variant = "soft",
  className,
  gradient,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  size?: number;
  variant?: "soft" | "solid" | "glass" | "outline";
  className?: string;
  gradient?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center shrink-0",
        variant === "soft" && "bg-surface-secondary text-primary",
        variant === "solid" && "gradient-primary-bg text-primary-foreground",
        variant === "glass" && "glass text-primary border border-white/10",
        variant === "outline" && "border border-border text-primary",
        className
      )}
      style={{
        width: size,
        height: size,
        ...(gradient ? { backgroundImage: gradient } : {}),
      }}
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={2} />
    </div>
  );
}

/* ---------------- ProgressRing ---------------- */
export function ProgressRing({
  progress,
  size = 180,
  stroke = 14,
  children,
  trackOpacity = 1,
  gradientId = "ring-grad",
}: {
  progress: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  trackOpacity?: number;
  gradientId?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--chart-1)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-secondary)"
          strokeWidth={stroke}
          opacity={trackOpacity}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * p }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ---------------- AnimatedCounter ---------------- */
export function AnimatedCounter({
  value,
  duration = 1,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(reduce ? value : 0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const to = value;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / (duration * 1000));
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(to * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "rounded-[28px] border border-dashed border-border bg-surface/50 p-8 text-center flex flex-col items-center",
        className
      )}
    >
      {emoji ? (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl mb-4"
        >
          {emoji}
        </motion.div>
      ) : (
        Icon && (
          <div className="w-16 h-16 rounded-3xl bg-surface-secondary flex items-center justify-center mb-4">
            <Icon size={28} className="text-primary" />
          </div>
        )
      )}
      <h3 className="text-title text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-caption text-text-secondary max-w-[16rem]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

/* ---------------- SectionHeader ---------------- */
export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-headline-serif text-text-primary truncate">{title}</h2>
        {subtitle && (
          <p className="text-caption text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Chip / Pill ---------------- */
export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-colors border",
        active
          ? "gradient-primary-bg text-primary-foreground border-transparent shadow-glow"
          : "bg-surface text-text-secondary border-border",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

/* ---------------- PageTransition ---------------- */
export function PageTransition({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------- StaggerItem ---------------- */
export function StaggerItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.06, 0.5),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Pressable ---------------- */
export function Pressable({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
