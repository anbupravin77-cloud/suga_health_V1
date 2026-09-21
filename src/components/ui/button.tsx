import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "text"; className?: string }) {
  return <Link className={`button button-${variant} ${className}`} href={href}>{children}</Link>;
}
