"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Users, Trophy, Shield } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/calendario", label: "Calendario", Icon: CalendarDays },
  { href: "/squadre", label: "Squadre", Icon: Users },
  { href: "/classifiche", label: "Classifiche", Icon: Trophy },
  { href: "/admin", label: "Admin", Icon: Shield },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  active ? "border border-primary/30 bg-primary-soft text-primary" : "text-muted"
                }`}
              >
                <Icon size={19} strokeWidth={2} />
              </span>
              <span className={active ? "font-semibold text-primary" : "text-muted"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
