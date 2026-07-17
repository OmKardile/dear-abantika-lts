"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/**
 * SSR-safe portal to document.body.
 * Escapes any ancestor stacking context so overlays (sheets, dialogs)
 * always render above the app shell and bottom nav.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
