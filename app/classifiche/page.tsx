"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Trophy, Medal } from "lucide-react";
import { useTournamentData, goalsByPlayer } from "@/lib/data";
import { computeStandings } from "@/lib/standings";

export default function ClassifichePage() {
  const { teams, matches, players, scorers: matchScorers, loading } = useTournamentData();

  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);
  const goalsMap = useMemo(() => goalsByPlayer(matchScorers), [matchScorers]);

  const scorers = useMemo(() => {
    return [...players]
      .map((p) => ({ player: p, goals: goalsMap.get(p.id) ?? 0, team: teams.find((t) => t.id === p.team_id) }))
      .filter((p) => p.goals > 0)
      .sort((a, b) => b.goals - a.goals);
  }, [players, teams, goalsMap]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Classifica</p>
      <h1 className="font-display mb-1 text-2xl font-bold text-on-surface">Serie B — Girone unico</h1>
      <p className="mb-6 text-xs text-muted">
        3 punti vittoria · 1 pareggio · 0 sconfitta. Parità: scontri diretti, poi differenza reti.
      </p>

      {loading && <p className="text-center text-sm text-muted">Caricamento…</p>}

      <div className="mb-3 flex items-center gap-2">
        <Trophy size={16} className="text-primary" />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-2">Classifica Generale</h2>
      </div>
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-3 py-2.5 text-left font-semibold">#</th>
              <th className="px-2 py-2.5 text-left font-semibold">Squadra</th>
              <th className="px-1.5 py-2.5 text-center font-semibold">G</th>
              <th className="px-1.5 py-2.5 text-center font-semibold">V</th>
              <th className="px-1.5 py-2.5 text-center font-semibold">N</th>
              <th className="px-1.5 py-2.5 text-center font-semibold">P</th>
              <th className="px-1.5 py-2.5 text-center font-semibold">GF</th>
              <th className="px-1.5 py-2.5 text-center font-semibold">GS</th>
              <th className="px-1.5 py-2.5 text-center font-semibold">DR</th>
              <th className="px-3 py-2.5 text-right font-semibold">PT</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => (
              <tr key={r.team.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2.5 font-semibold text-on-surface">{i + 1}</td>
                <td className="px-2 py-2.5">
                  <Link href={`/squadre/${r.team.id}`} className="flex items-center gap-2 font-semibold text-on-surface">
                    <div className="h-5 w-5 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                      {r.team.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.team.logo_url} alt="" className="h-full w-full object-contain" />
                      )}
                    </div>
                    {r.team.name}
                  </Link>
                </td>
                <td className="px-1.5 py-2.5 text-center text-muted">{r.played}</td>
                <td className="px-1.5 py-2.5 text-center text-muted">{r.won}</td>
                <td className="px-1.5 py-2.5 text-center text-muted">{r.drawn}</td>
                <td className="px-1.5 py-2.5 text-center text-muted">{r.lost}</td>
                <td className="px-1.5 py-2.5 text-center text-muted">{r.gf}</td>
                <td className="px-1.5 py-2.5 text-center text-muted">{r.ga}</td>
                <td className="px-1.5 py-2.5 text-center text-muted">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                <td className="px-3 py-2.5 text-right font-display font-bold text-secondary">{r.points}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-muted">
                  Nessun dato disponibile
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Medal size={16} className="text-secondary" />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-2">Capocannonieri</h2>
      </div>
      {scorers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Nessun gol registrato.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-3 py-2.5 text-left font-semibold">#</th>
                <th className="px-2 py-2.5 text-left font-semibold">Giocatore</th>
                <th className="px-2 py-2.5 text-left font-semibold">Squadra</th>
                <th className="px-3 py-2.5 text-right font-semibold">Gol</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((p, i) => (
                <tr key={p.player.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 text-muted">{i + 1}</td>
                  <td className="px-2 py-2.5">
                    <Link href={`/giocatori/${p.player.id}`} className="flex items-center gap-2">
                      <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-surface-2">
                        {p.player.photo_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.player.photo_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="font-semibold text-on-surface">{p.player.name}</span>
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-muted">{p.team?.name}</td>
                  <td className="px-3 py-2.5 text-right font-display font-bold text-secondary">{p.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
