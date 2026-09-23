"use client";

import { useLayoutEffect } from "react";

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
  useLayoutEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as { path?: string; y?: number };
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (saved.path !== currentPath || typeof saved.y !== "number") return;

      sessionStorage.removeItem(STORAGE_KEY);

      const root = document.documentElement;
      const body = document.body;
      const previousRootScrollBehavior = root.style.scrollBehavior;
      const previousBodyScrollBehavior = body.style.scrollBehavior;
      const previousScrollRestoration = window.history.scrollRestoration;

      // Return navigation must be instantaneous even though the site normally
      // uses smooth scrolling for intentional in-page navigation.
      root.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";
      window.history.scrollRestoration = "manual";

      const restore = () => window.scrollTo(0, saved.y as number);
      restore();

      let secondFrame = 0;
      const firstFrame = window.requestAnimationFrame(() => {
        restore();
        secondFrame = window.requestAnimationFrame(() => {
          restore();
          root.style.scrollBehavior = previousRootScrollBehavior;
          body.style.scrollBehavior = previousBodyScrollBehavior;
          window.history.scrollRestoration = previousScrollRestoration;
        });
      });

      return () => {
        window.cancelAnimationFrame(firstFrame);
        if (secondFrame) window.cancelAnimationFrame(secondFrame);
        root.style.scrollBehavior = previousRootScrollBehavior;
        body.style.scrollBehavior = previousBodyScrollBehavior;
        window.history.scrollRestoration = previousScrollRestoration;
      };
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);
}
