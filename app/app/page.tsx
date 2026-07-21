"use client";
import Link from "next/link";
import { useTournamentData } from "@/lib/data";
import MatchCard from "@/components/MatchCard";

export default function HomePage() {
  const { settings, venues, teams, matches, loading } = useTournamentData();

  const live = matches.filter((m) => m.status === "In Corso");
  const upcoming = matches.filter((m) => m.status === "Programmata").slice(0, 4);
  const recent = matches
    .filter((m) => m.status === "Terminata")
    .slice(-4)
    .reverse();

  const bg = settings?.home_background_url;

  return (
    <main className="mx-auto max-w-md pb-8">
      {/* Hero */}
      <section className="relative flex h-[340px] items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: bg
                ? `url(${bg})`
                : "radial-gradient(circle at 30% 20%, rgba(230,0,0,0.35), transparent 60%), #131313",
            }}
          />
          <div className="hero-gradient absolute inset-0" />
        </div>
        <div className="relative z-10 w-full px-4 pb-6">
          {live.length > 0 && (
            <span className="live-dot mb-3 inline-block bg-primary px-4 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-on-primary">
              Live Now
            </span>
          )}
          <h1 className="font-display text-4xl font-black italic leading-[0.95] text-white">
            {settings?.tournament_title || "Campionato di Serie B"}
          </h1>
          <p className="mt-1 text-sm font-bold uppercase tracking-wide text-white/70">
            {settings?.tournament_subtitle || "Pallanuoto Maschile"}
          </p>
        </div>
      </section>

      <div className="px-4 pt-4">
        {/* Bento quick links */}
        <section className="mb-6 grid grid-cols-2 gap-3">
          <Link
            href="/classifiche"
            className="flex flex-col items-center justify-center gap-2 bg-primary p-4 text-on-primary transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined text-3xl">leaderboard</span>
            <span className="font-display text-[11px] font-black uppercase">Classifica</span>
          </Link>
          <Link
            href="/calendario"
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-high p-4 text-white transition-all hover:bg-surface-bright"
          >
            <span className="material-symbols-outlined text-3xl">calendar_month</span>
            <span className="font-display text-[11px] font-black uppercase">Calendario</span>
          </Link>
          <Link
            href="/squadre"
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-high p-4 text-white transition-all hover:bg-surface-bright"
          >
            <span className="material-symbols-outlined text-3xl">groups</span>
            <span className="font-display text-[11px] font-black uppercase">Squadre</span>
          </Link>
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-high p-4 text-white transition-all hover:bg-surface-bright"
          >
            <span className="material-symbols-outlined text-3xl">settings_suggest</span>
            <span className="font-display text-[11px] font-black uppercase">Admin</span>
          </Link>
        </section>

        {loading && <p className="text-center text-sm text-on-surface-variant">Caricamento…</p>}

        {live.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="accent-bar h-6" />
              <h2 className="font-display text-lg font-black italic uppercase text-white">In Corso</h2>
            </div>
            <div className="space-y-3">
              {live.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="accent-bar h-6 bg-secondary" />
              <h2 className="font-display text-lg font-black italic uppercase text-white">Prossime Partite</h2>
            </div>
            <div className="space-y-3">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
              ))}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="accent-bar h-6 bg-outline-variant" />
              <h2 className="font-display text-lg font-black italic uppercase text-white">Ultimi Risultati</h2>
            </div>
            <div className="space-y-3">
              {recent.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
              ))}
            </div>
          </section>
        )}

        {!loading && matches.length === 0 && (
          <p className="mt-10 text-center text-sm text-on-surface-variant no-uppercase">
            Nessuna partita in calendario. Accedi all&apos;area Admin per iniziare a configurare il torneo.
          </p>
        )}
      </div>
    </main>
  );
}
