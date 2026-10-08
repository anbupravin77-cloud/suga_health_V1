"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ClipboardList,
  Headphones,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Pill,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/app/actions";
import { ActionButton } from "@/components/ui/action-button";

const navItems = [
  { label: "Home", href: "/patient", icon: Home },
  { label: "New Consultation", href: "/consultation/start", icon: Plus },
  { label: "My Consultations", href: "/patient/consultations", icon: ClipboardList },
  { label: "Medications", href: "/patient/medications", icon: Pill },
  { label: "Messages", href: "/patient/messages", icon: MessageSquare },
  { label: "Profile", href: "/patient/profile", icon: UserRound },
];

function initials(name: string) {
  const value = name.trim();
  if (!value || value.toLowerCase() === "patient") return "PT";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PatientShell({
  name,
  unreadNotifications,
  children,
}: {
  name: string;
  unreadNotifications: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  function isActive(href: string) {
    if (href === "/patient") return pathname === href;
    if (href === "/patient/consultations/new") {
      return pathname === href || pathname.includes("/consultations/") && pathname.endsWith("/edit");
    }
    if (href === "/patient/consultations") {
      return pathname.startsWith("/patient/consultations") &&
        pathname !== "/patient/consultations/new" &&
        !pathname.endsWith("/edit");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebar = (
    <>
      <div className="patient-brand-block">
        <Link href="/" className="patient-wordmark">SUGA<span>.</span>HEALTH</Link>
        <small>live naturally</small>
      </div>

      <nav className="patient-nav" aria-label="Patient navigation">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={isActive(href) ? "is-active" : ""}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="patient-sidebar-bottom">
        <div className="patient-support-card">
          <Headphones size={22} />
          <div>
            <strong>Need help?</strong>
            <span>Your care team can help with portal questions.</span>
          </div>
        </div>
        <form action={signOut}>
          <ActionButton className="patient-signout" type="submit" pendingLabel="Signing out…">
            <LogOut size={17} /> Sign out
          </ActionButton>
        </form>
      </div>
    </>
  );

  return (
    <div className="patient-v2">
      <aside className="patient-sidebar">{sidebar}</aside>

      <div className={menuOpen ? "patient-mobile-drawer is-open" : "patient-mobile-drawer"} aria-hidden={!menuOpen}>
        <button className="patient-drawer-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
        <aside>{sidebar}</aside>
      </div>

      <div className="patient-main">
        <header className="patient-topbar">
          <button className="patient-menu-button" type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="patient-mobile-wordmark">SUGA<span>.</span>HEALTH</Link>

          <div className="patient-topbar-actions">
            <Link className="patient-bell" href="/patient/notifications" aria-label="Notifications">
              <Bell size={20} />
              {unreadNotifications > 0 && <span>{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
            </Link>
            <Link className="patient-account" href="/patient/profile">
              <span className="patient-avatar">{initials(name)}</span>
              <span className="patient-account-copy">
                <strong>{name || "Patient"}</strong>
                <small>Patient</small>
              </span>
            </Link>
          </div>
        </header>

        <main className="patient-content" id="patient-content">{children}</main>
      </div>
    </div>
  );
}
