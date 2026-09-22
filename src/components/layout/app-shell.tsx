"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ClipboardList, Home, LogOut, MessageSquare, Stethoscope, UserRound } from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";
import { signOut } from "@/app/actions";
import { ActionButton } from "@/components/ui/action-button";

const iconMap = {
  Home,
  Consultations: ClipboardList,
  Queue: ClipboardList,
  "Active reviews": Stethoscope,
  Messages: MessageSquare,
  Notifications: Bell,
  Profile: UserRound,
};

export function AppShell({
  role,
  name,
  children,
}: {
  role: "patient" | "doctor";
  active?: string;
  name: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [previousPathname, setPreviousPathname] = useState(pathname);
  const items =
    role === "patient"
      ? ["Home", "Consultations", "Messages", "Notifications", "Profile"]
      : ["Queue", "Active reviews", "Messages", "Notifications", "Profile"];
  const base = role === "patient" ? "/patient" : "/doctor";

  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setPendingHref(null);
  }

  function hrefFor(item: string) {
    return item === items[0] ? base : `${base}/${item.toLowerCase().replaceAll(" ", "-")}`;
  }

  function isActive(item: string) {
    if (role === "doctor" && item === "Active reviews" && pathname.startsWith("/doctor/consultations/")) return true;
    const href = hrefFor(item);
    if (item === items[0]) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function beginNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (href === pathname) return;
    if (pendingHref) {
      event.preventDefault();
      return;
    }
    setPendingHref(href);
  }

  return (
    <div className="app-layout" data-role={role} aria-busy={Boolean(pendingHref)}>
      <a className="skip-link" href="#care-content">Skip to care content</a>
      <div className={pendingHref ? "portal-route-progress is-active" : "portal-route-progress"} aria-hidden="true" />
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <Link className="wordmark" href="/">Suga.Health</Link>
          <span>{role === "doctor" ? "DOCTOR" : "PATIENT"}</span>
        </div>
        <nav aria-label={`${role} navigation`}>
          {items.map((item) => {
            const Icon = iconMap[item as keyof typeof iconMap];
            const href = hrefFor(item);
            const waiting = pendingHref === href;
            return (
              <Link
                key={item}
                prefetch
                className={`${isActive(item) ? "active" : ""} ${waiting ? "nav-pending" : ""}`}
                href={href}
                aria-current={isActive(item) ? "page" : undefined}
                onClick={(event) => beginNavigation(event, href)}
                aria-disabled={Boolean(pendingHref && !waiting)}
              >
                <Icon size={18} strokeWidth={1.6} />
                <span>{waiting ? "Opening…" : item}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <p className="sidebar-note">Real care.<br />Clear next steps.</p>
          <form action={signOut}>
            <ActionButton className="sidebar-logout" type="submit" pendingLabel="Signing out…">
              <LogOut size={16} /> Sign out
            </ActionButton>
          </form>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <Link className="mobile-app-brand" href="/">SUGA<span>.</span>HEALTH</Link>
          <span>{role === "doctor" ? "Clinical workspace" : "Private patient space"}</span>
          <strong>{name}</strong>
        </header>
        <main className="app-content" id="care-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
