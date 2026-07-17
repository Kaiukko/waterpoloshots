"use client";
import Link from "next/link";
import { useTournamentData } from "@/lib/data";
import MatchCard from "@/components/MatchCard";

export default function HomePage() {
  const { settings, venues, teams, matches, loading } = useTournamentData();

  const live = matches.filter((m) => m.status === "In Corso");
  const upcoming = matches
    .filter((m) => m.status === "Programmata")
    .slice(0, 4);
  const recent = matches
    .filter((m) => m.status === "Terminata")
    .slice(-4)
    .reverse();

  const bg = settings?.home_background_url;

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      {/* Hero */}
      <section
        className="relative mb-6 overflow-hidden rounded-3xl border border-line p-6"
        style={{
          backgroundImage: bg
            ? `linear-gradient(180deg, rgba(10,10,11,0.55), rgba(10,10,11,0.95)), url(${bg})`
            : "radial-gradient(circle at 30% 20%, rgba(225,6,0,0.25), transparent 60%), #141416",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {live.length > 0 && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1">
            <span className="live-dot h-2 w-2 rounded-full bg-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Live Now</span>
          </div>
        )}
        <h1 className="font-display text-3xl font-bold leading-tight">
          {settings?.tournament_title || "Waterpolo Summer Cup"}
        </h1>
        <p className="mt-1 text-sm text-[#B8B8BC]">{settings?.tournament_subtitle || "Sport Project Bari"}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-black/40 px-3 py-1.5 text-xs font-semibold">
          <span className="text-gold">Tappa {settings?.current_stage_number ?? 1}</span>
          <span className="text-[#8A8A8E]">·</span>
          <span>{settings?.current_stage_name || "Fase a Gironi"}</span>
        </div>
      </section>

      {/* Bento quick links */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        <Link href="/calendario" className="card-surface rounded-2xl p-4">
          <div className="text-2xl">📅</div>
          <div className="mt-2 text-sm font-bold">Calendario</div>
          <div className="text-xs text-[#8A8A8E]">Tutte le partite</div>
        </Link>
        <Link href="/classifiche" className="card-surface rounded-2xl p-4">
          <div className="text-2xl">🏆</div>
          <div className="mt-2 text-sm font-bold">Classifiche</div>
          <div className="text-xs text-[#8A8A8E]">Gironi &amp; circuito</div>
        </Link>
        <Link href="/finali" className="card-surface rounded-2xl p-4">
          <div className="text-2xl">🥇</div>
          <div className="mt-2 text-sm font-bold">Finali</div>
          <div className="text-xs text-[#8A8A8E]">Tabellone 1°-8°</div>
        </Link>
        <Link href="/admin" className="card-surface rounded-2xl p-4">
          <div className="text-2xl">⚙️</div>
          <div className="mt-2 text-sm font-bold">Admin</div>
          <div className="text-xs text-[#8A8A8E]">Gestione torneo</div>
        </Link>
      </section>

      {loading && <p className="text-center text-sm text-[#8A8A8E]">Caricamento…</p>}

      {live.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <span className="live-dot h-2 w-2 rounded-full bg-primary" /> In Corso
          </h2>
          <div className="space-y-3">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#B8B8BC]">Prossime Partite</h2>
          <div className="space-y-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#B8B8BC]">Ultimi Risultati</h2>
          <div className="space-y-3">
            {recent.map((m) => (
              <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
            ))}
          </div>
        </section>
      )}

      {!loading && matches.length === 0 && (
        <p className="mt-10 text-center text-sm text-[#8A8A8E]">
          Nessuna partita in calendario. Accedi all&apos;area Admin per iniziare a configurare il torneo.
        </p>
      )}
    </main>
  );
}
