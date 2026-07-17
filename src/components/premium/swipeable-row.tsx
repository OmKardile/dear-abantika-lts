"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Trash2, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";

interface Action {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  label: string;
  onClick: () => void;
}

interface Props {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: (archived: boolean) => void;
  archived?: boolean;
  className?: string;
  /** disable interactions when in selection mode */
  disabled?: boolean;
}

export function SwipeableRow({
  children,
  onDelete,
  onArchive,
  archived,
  className,
  disabled,
}: Props) {
  const x = useMotionValue(0);
  const [dragging, setDragging] = React.useState(false);

  const actions: Action[] = [];
  if (onArchive) {
    actions.push({
      icon: archived ? ArchiveRestore : Archive,
      color: "text-white",
      bg: "var(--chart-3)",
      label: archived ? "Restore" : "Archive",
      onClick: () => onArchive(!archived),
    });
  }
  if (onDelete) {
    actions.push({
      icon: Trash2,
      color: "text-white",
      bg: "var(--error)",
      label: "Delete",
      onClick: () => onDelete(),
    });
  }

  const ACTION_W = 76;
  const maxDrag = actions.length * ACTION_W;

  const handleDragEnd = () => {
    setDragging(false);
    if (x.get() < -maxDrag * 0.6) {
      // trigger last action (delete) fully
      animate(x, -maxDrag, { type: "spring", stiffness: 400, damping: 35, onComplete: () => {
        // snap back; the action triggers on tap normally
      }});
      animate(x, 0, { delay: 0.25, type: "spring", stiffness: 400, damping: 35 });
    } else if (x.get() < -ACTION_W * 0.5 && actions.length > 1) {
      animate(x, -ACTION_W, { type: "spring", stiffness: 400, damping: 35 });
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 35 });
    }
  };

  if (disabled || actions.length === 0) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Action buttons behind */}
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={() => {
              a.onClick();
              animate(x, 0, { type: "spring", stiffness: 400, damping: 35 });
            }}
            className="flex items-center justify-center shrink-0"
            style={{ width: ACTION_W, backgroundColor: a.bg }}
            aria-label={a.label}
          >
            <div className="flex flex-col items-center gap-1">
              <a.icon size={20} className={a.color} />
              <span className="text-[10px] font-bold text-white">{a.label}</span>
            </div>
          </button>
        ))}
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -maxDrag, right: 0 }}
        dragElastic={0.08}
        style={{ x }}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        className="relative bg-surface"
        data-dragging={dragging}
      >
        {children}
      </motion.div>
    </div>
  );
}
