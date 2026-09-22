"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { rememberReturnPosition } from "./return-position";

const links = [
  { name: "About", path: "/about" },
  { name: "Weight Loss", path: "/weight-loss" },
  { name: "Hair Growth", path: "/hair-growth" },
  { name: "Sexual Health", path: "/sexual-health" },
];

export function MobilePublicMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      dialog?.close();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <dialog ref={dialogRef} aria-label="Site navigation" onCancel={onClose} className="legacy-public public-menu-dialog">
      <div className="max-w-xl mx-auto px-5 py-5 pb-10">
        <button type="button" className="public-menu-close" onClick={onClose}>Close menu <span aria-hidden="true">×</span></button>
        <nav className="grid gap-2.5" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={onClose}
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-5 text-lg font-bold tracking-tight text-neutral-950 hover:border-neutral-950 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-5 border-t border-neutral-200 grid gap-3">
          <Link
            href="/sign-in"
            onClick={onClose}
            className="legacy-action-light rounded-2xl border border-neutral-300 bg-white p-4 text-center text-sm font-bold"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            onClick={() => {
              rememberReturnPosition();
              onClose();
            }}
            className="legacy-action-dark rounded-full bg-neutral-950 p-4 text-center text-xs font-bold uppercase tracking-wider"
          >
            Start consultation
          </Link>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
