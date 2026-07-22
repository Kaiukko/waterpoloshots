"use client";
import Link from "next/link";
import { Calendar, Trophy, Users, Medal, ChevronRight } from "lucide-react";
import { useTournamentData } from "@/lib/data";
import MatchCard from "@/components/MatchCard";
import ShareButton from "@/components/ShareButton";

export default function HomePage() {
  const { settings, venues, teams, matches, loading } = useTournamentData();

  const upcoming = matches.filter((m) => m.status === "Programmata").slice(0, 4);
  const recent = matches
    .filter((m) => m.status === "Terminata")
    .slice(-4)
    .reverse();

  const title = settings?.tournament_title || "Campionato Serie B Pallanuoto Maschile";
  const subtitle = settings?.tournament_subtitle || "Sport Project Bari";
  const logo = settings?.logo_url;

  const links = [
    { href: "/calendario", label: "Calendario", sub: "Andata & ritorno", Icon: Calendar, color: "text-primary" },
    { href: "/classifiche", label: "Classifica", sub: "Punti · marcatori", Icon: Trophy, color: "text-secondary" },
    { href: "/squadre", label: "Squadre", sub: "Rosa e statistiche", Icon: Users, color: "text-primary" },
    { href: "/classifiche", label: "Marcatori", sub: "Top gol del campionato", Icon: Medal, color: "text-secondary" },
  ];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-gradient-to-br from-primary to-secondary">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">WS</span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">{subtitle}</p>
            <h1 className="font-display text-xl font-bold leading-tight text-on-surface">{title}</h1>
          </div>
        </div>
        <ShareButton text={`${title} — ${subtitle}`} />
      </div>

      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-2">
        <Trophy size={14} className="text-secondary" />
        Serie B · girone unico
      </div>

      <section className="mb-8 grid grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.label} href={l.href} className="rounded-2xl border border-border bg-surface p-4">
            <l.Icon size={22} className={l.color} />
            <div className="mt-3 text-sm font-bold text-on-surface">{l.label}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted">{l.sub}</div>
          </Link>
        ))}
      </section>

      {loading && <p className="text-center text-sm text-muted">Caricamento…</p>}

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-2">Prossime partite</h2>
          <Link href="/calendario" className="flex items-center gap-0.5 text-xs font-semibold text-primary">
            Vedi tutte <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {upcoming.map((m) => (
            <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
          ))}
          {!loading && upcoming.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Nessuna partita programmata al momento.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-2">Ultimi risultati · Finale</h2>
        <div className="space-y-3">
          {recent.map((m) => (
            <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
          ))}
          {!loading && recent.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              I risultati appariranno qui.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
