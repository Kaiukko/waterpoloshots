"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", icon: "M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" },
  { href: "/calendario", label: "Calendario", icon: "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" },
  { href: "/classifiche", label: "Classifiche", icon: "M5 21V10M12 21V4M19 21v-7" },
  { href: "/admin", label: "Admin", icon: "M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21a8 8 0 0 1 16 0" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium tracking-wide"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={active ? "var(--color-primary)" : "#8A8A8E"}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d={item.icon} />
              </svg>
              <span className={active ? "text-white" : "text-[#8A8A8E]"}>{item.label}</span>
              {active && <span className="h-0.5 w-5 rounded-full" style={{ background: "var(--color-primary)" }} />}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
