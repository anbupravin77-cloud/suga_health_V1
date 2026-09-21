"use client";

import { useEffect } from "react";

const STORAGE_KEY = "suga:return-position";

export function rememberReturnPosition() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      path: window.location.pathname + window.location.search + window.location.hash,
      y: window.scrollY,
    }),
  );
}

export function useRestoreReturnPosition() {
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as { path?: string; y?: number };
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (saved.path !== currentPath || typeof saved.y !== "number") return;

      sessionStorage.removeItem(STORAGE_KEY);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.scrollTo({ top: saved.y, behavior: "auto" }));
      });
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);
}
