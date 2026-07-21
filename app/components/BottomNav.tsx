"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/calendario", label: "Calendario", icon: "calendar_month" },
  { href: "/classifiche", label: "Classifiche", icon: "leaderboard" },
  { href: "/squadre", label: "Squadre", icon: "groups" },
  { href: "/admin", label: "Admin", icon: "settings_suggest" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-white/5 bg-surface-container-highest px-1 shadow-2xl">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-12 flex-1 flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
              active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-label-sm font-display text-[10px] font-black">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
