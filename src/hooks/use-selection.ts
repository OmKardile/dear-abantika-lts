"use client";

import * as React from "react";

export function useSelection<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [mode, setMode] = React.useState(false);

  const toggle = React.useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const enterMode = React.useCallback((id: string) => {
    setMode(true);
    setSelected(new Set([id]));
  }, []);

  const selectAll = React.useCallback(() => {
    setSelected(new Set(items.map((i) => i.id)));
  }, [items]);

  const clearAll = React.useCallback(() => {
    setSelected(new Set());
    setMode(false);
  }, []);

  const ids = React.useMemo(() => Array.from(selected), [selected]);

  return {
    mode,
    setMode,
    selected: ids,
    selectedCount: ids.length,
    isSelected: (id: string) => selected.has(id),
    toggle,
    enterMode,
    selectAll,
    clearAll,
  };
}
