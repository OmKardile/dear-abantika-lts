"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search";
import { SurfaceCard, StaggerItem, EmptyState } from "@/components/premium/primitives";

const TYPE_META: Record<SearchResult["type"], { label: string; color: string }> = {
  journal: { label: "Journal", color: "var(--chart-3)" },
  reminder: { label: "Reminder", color: "var(--chart-4)" },
  task: { label: "Task", color: "var(--chart-2)" },
  symptom: { label: "Symptom", color: "var(--chart-1)" },
  routine: { label: "Routine", color: "var(--chart-5)" },
  wishlist: { label: "Wishlist", color: "var(--chart-3)" },
  mood: { label: "Mood", color: "var(--chart-4)" },
};

export function GlobalSearch() {
  const [query, setQuery] = React.useState("");
  const { results } = useGlobalSearch(query);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <SurfaceCard className="flex items-center gap-3 px-4 py-3">
        <Search size={20} className="text-text-tertiary shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything…"
          className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-text-tertiary shrink-0"
            aria-label="Clear"
          >
            <X size={18} />
          </button>
        )}
      </SurfaceCard>

      {/* Results */}
      {query.trim() === "" ? (
        <EmptyState
          emoji="🔍"
          title="Search across everything"
          description="Find journals, reminders, tasks, symptoms, routines, wishlist items and mood logs."
        />
      ) : results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No results found"
          description={`Nothing matches "${query}". Try a different search.`}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-caption text-text-secondary px-1">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <AnimatePresence>
            {results.map((r, i) => {
              const meta = TYPE_META[r.type];
              return (
                <StaggerItem key={`${r.type}-${r.id}`} index={i}>
                  <SurfaceCard className="p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-lg"
                      style={{ backgroundColor: `${meta.color}1a` }}
                    >
                      {r.emoji || "📄"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-text-primary font-semibold truncate">
                        {r.title}
                      </p>
                      {r.subtitle && (
                        <p className="text-caption text-text-secondary truncate">
                          {r.subtitle}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shrink-0"
                      style={{ color: meta.color, backgroundColor: `${meta.color}14` }}
                    >
                      {meta.label}
                    </span>
                  </SurfaceCard>
                </StaggerItem>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
