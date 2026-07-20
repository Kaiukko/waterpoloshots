"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useTournamentData, goalsByPlayer } from "@/lib/data";
import { Team, Player } from "@/lib/types";

function TeamCard({ team, players, goalsMap }: { team: Team; players: Player[]; goalsMap: Map<string, number> }) {
  const roster = players
    .filter((p) => p.team_id === team.id)
    .sort((a, b) => (a.cap_number ?? 999) - (b.cap_number ?? 999));

  return (
    <div className="card-surface rounded-2xl p-4">
      <Link href={`/squadre/${team.id}`} className="mb-4 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface2">
          {team.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-gold">{team.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h2 className="font-display text-lg font-bold leading-tight">{team.name}</h2>
          <p className="text-xs text-[#8A8A8E]">{roster.length} giocatori in rosa</p>
        </div>
      </Link>

      {roster.length > 0 ? (
        <div className="space-y-1.5">
          {roster.map((p) => (
            <Link
              key={p.id}
              href={`/giocatori/${p.id}`}
              className="flex items-center gap-3 rounded-xl bg-surface2 px-3 py-2"
            >
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line bg-base">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gold">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="w-7 shrink-0 text-center font-display text-sm font-bold text-gold">
                {p.cap_number ?? "-"}
              </span>
              <span className="flex-1 text-sm font-semibold">{p.name}</span>
              <span className="shrink-0 text-xs font-bold text-[#B8B8BC]">{goalsMap.get(p.id) ?? 0} gol</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#8A8A8E]">Rosa non ancora inserita.</p>
      )}
    </div>
  );
}

export default function SquadrePage() {
  const { teams, players, scorers, loading } = useTournamentData();
  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
  const goalsMap = useMemo(() => goalsByPlayer(scorers), [scorers]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <h1 className="font-display mb-4 text-2xl font-bold">Squadre</h1>

      {loading && <p className="text-center text-sm text-[#8A8A8E]">Caricamento…</p>}

      <div className="space-y-4">
        {sortedTeams.map((team) => (
          <TeamCard key={team.id} team={team} players={players} goalsMap={goalsMap} />
        ))}
      </div>

      {!loading && sortedTeams.length === 0 && (
        <p className="mt-10 text-center text-sm text-[#8A8A8E]">Nessuna squadra ancora inserita.</p>
      )}
    </main>
  );
}
