"use client";
import Link from "next/link";

export default function Header({
  title,
  logoUrl,
}: {
  title: string;
  logoUrl?: string | null;
}) {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b-2 border-primary bg-surface-container-highest">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden border border-on-surface bg-primary">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white">sports_kabaddi</span>
            )}
          </div>
          <h1 className="font-display text-headline-md font-black tracking-tighter text-on-surface no-uppercase">
            {title}
          </h1>
        </Link>
        <Link
          href="/admin"
          className="flex h-10 w-10 items-center justify-center text-on-surface transition-colors duration-200 hover:text-primary"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </Link>
      </div>
    </header>
  );
}
