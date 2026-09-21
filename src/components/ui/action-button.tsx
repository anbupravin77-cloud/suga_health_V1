"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function ActionButton({
  children,
  pendingLabel = "Working…",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      className={className}
      disabled={pending || props.disabled}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <LoaderCircle size={16} className="action-spinner" />
          <span>{pendingLabel}</span>
        </>
      ) : children}
    </button>
  );
}
