"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X } from "lucide-react";

interface UndoItem {
  id: string;
  message: string;
  undo: () => void;
}

interface UndoContextValue {
  showUndo: (message: string, undo: () => void, durationMs?: number) => void;
}

const UndoContext = React.createContext<UndoContextValue | null>(null);

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<UndoItem[]>([]);

  const showUndo = React.useCallback(
    (message: string, undo: () => void, durationMs = 5000) => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { id, message, undo }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, durationMs);
    },
    []
  );

  const dismiss = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <UndoContext.Provider value={{ showUndo }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 z-[120] flex flex-col items-center gap-2 px-4" style={{ bottom: "calc(var(--nav-h, 4rem) + 0.75rem)" }}>
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-sm flex items-center gap-3 rounded-2xl glass-sheet pl-4 pr-2 py-2.5 shadow-lifted"
            >
              <p className="flex-1 text-sm font-medium text-text-primary truncate">
                {item.message}
              </p>
              <button
                onClick={() => {
                  item.undo();
                  dismiss(item.id);
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-primary-bg text-primary-foreground text-sm font-bold"
              >
                <RotateCcw size={14} />
                Undo
              </button>
              <button
                onClick={() => dismiss(item.id)}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </UndoContext.Provider>
  );
}

export function useUndo() {
  const ctx = React.useContext(UndoContext);
  if (!ctx) throw new Error("useUndo must be used within UndoProvider");
  return ctx;
}
