import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
};

function liquidVariant(variant: NonNullable<ButtonProps["variant"]>) {
  if (variant === "primary") return "suga-btn suga-btn-primary";
  if (variant === "secondary") return "suga-btn suga-btn-secondary";
  return "suga-btn suga-btn-utility";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button className={`button button-${variant} ${liquidVariant(variant)} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "text"; className?: string }) {
  return <Link className={`button button-${variant} ${liquidVariant(variant)} ${className}`} href={href}>{children}</Link>;
}
