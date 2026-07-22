"use client";
import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTournamentData } from "@/lib/data";

export default function SquadrePage() {
  const { teams, loading } = useTournamentData();
  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Squadre</p>
      <h1 className="font-display mb-1 text-2xl font-bold text-on-surface">Le squadre del campionato</h1>
      <p className="mb-6 text-sm text-muted">Tocca una squadra per vedere logo, rosa e statistiche.</p>

      {loading && <p className="text-center text-sm text-muted">Caricamento…</p>}

      <div className="grid grid-cols-2 gap-3">
        {sortedTeams.map((team) => (
          <Link
            key={team.id}
            href={`/squadre/${team.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
              {team.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={team.logo_url} alt="" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-xs font-bold text-black">{team.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-on-surface">{team.name}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Serie B</div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
        ))}
      </div>

      {!loading && sortedTeams.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">Nessuna squadra ancora inserita.</p>
      )}
    </main>
  );
}
