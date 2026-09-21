import Link from "next/link";
import { Bell, ClipboardList, Home, MessageSquare, Stethoscope, UserRound } from "lucide-react";
import type { ReactNode } from "react";

const iconMap = { Home, Consultations: ClipboardList, Queue: ClipboardList, "Active reviews": Stethoscope, Messages: MessageSquare, Notifications: Bell, Profile: UserRound };

export function AppShell({ role, active, name, children }: { role: "patient" | "doctor"; active: string; name: string; children: ReactNode }) {
  const items = role === "patient" ? ["Home", "Consultations", "Messages", "Notifications", "Profile"] : ["Queue", "Active reviews", "Messages", "Notifications", "Profile"];
  const base = role === "patient" ? "/patient" : "/doctor";

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Link className="wordmark" href="/">Suga.Health</Link>
        <nav aria-label={`${role} navigation`}>
          {items.map((item) => {
            const Icon = iconMap[item as keyof typeof iconMap];
            return <Link key={item} className={active === item ? "active" : ""} href={item === items[0] ? base : `${base}/${item.toLowerCase().replaceAll(" ", "-")}`}><Icon size={18} strokeWidth={1.6} />{item}</Link>;
          })}
        </nav>
        <p className="sidebar-note">Care feels<br />better together.</p>
      </aside>
      <div className="app-main">
        <header className="app-topbar"><span>{role === "doctor" ? "Clinical workspace" : "Private patient space"}</span><span>{name}</span></header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
