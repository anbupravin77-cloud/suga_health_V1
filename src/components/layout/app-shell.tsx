"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ClipboardList, Home, LogOut, MessageSquare, Stethoscope, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { signOut } from "@/app/actions";

const iconMap = { Home, Consultations: ClipboardList, Queue: ClipboardList, "Active reviews": Stethoscope, Messages: MessageSquare, Notifications: Bell, Profile: UserRound };

export function AppShell({ role, name, children }: { role: "patient" | "doctor"; active?: string; name: string; children: ReactNode }) {
  const pathname = usePathname();
  const items = role === "patient" ? ["Home", "Consultations", "Messages", "Notifications", "Profile"] : ["Queue", "Active reviews", "Messages", "Notifications", "Profile"];
  const base = role === "patient" ? "/patient" : "/doctor";

  function hrefFor(item: string) {
    return item === items[0] ? base : `${base}/${item.toLowerCase().replaceAll(" ", "-")}`;
  }

  function isActive(item: string) {
    const href = hrefFor(item);
    if (item === items[0]) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-brand"><Link className="wordmark" href="/">Suga.Health</Link><span>{role === "doctor" ? "DOCTOR" : "PATIENT"}</span></div>
        <nav aria-label={`${role} navigation`}>
          {items.map((item) => {
            const Icon = iconMap[item as keyof typeof iconMap];
            const href = hrefFor(item);
            return <Link key={item} prefetch className={isActive(item) ? "active" : ""} href={href}><Icon size={18} strokeWidth={1.6} />{item}</Link>;
          })}
        </nav>
        <div className="sidebar-foot"><p className="sidebar-note">Real care.<br />Clear next steps.</p><form action={signOut}><button className="sidebar-logout" type="submit"><LogOut size={16} /> Sign out</button></form></div>
      </aside>
      <div className="app-main">
        <header className="app-topbar"><Link className="mobile-app-brand" href="/">SUGA<span>.</span>HEALTH</Link><span>{role === "doctor" ? "Clinical workspace" : "Private patient space"}</span><strong>{name}</strong></header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
