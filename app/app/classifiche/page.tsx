"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useTournamentData, goalsByPlayer } from "@/lib/data";
import { computeStandings } from "@/lib/standings";

type Tab = "classifica" | "marcatori";

export default function ClassifichePage() {
  const { teams, matches, players, scorers: matchScorers, loading } = useTournamentData();
  const [tab, setTab] = useState<Tab>("classifica");

  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);

  const goalsMap = useMemo(() => goalsByPlayer(matchScorers), [matchScorers]);

  const scorers = useMemo(() => {
    return [...players]
      .map((p) => ({ player: p, goals: goalsMap.get(p.id) ?? 0, team: teams.find((t) => t.id === p.team_id) }))
      .filter((p) => p.goals > 0)
      .sort((a, b) => b.goals - a.goals);
  }, [players, teams, goalsMap]);

  const podium = scorers.slice(0, 3);
  const rest = scorers.slice(3);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <h1 className="font-display mb-4 text-2xl font-black italic">Classifiche</h1>

      <div className="mb-5 flex gap-2">
        {([
          ["classifica", "Classifica"],
          ["marcatori", "Marcatori"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold ${
              tab === key ? "bg-primary text-white" : "card-surface text-on-surface-variant"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-sm text-outline">Caricamento…</p>}

      {tab === "classifica" && (
        <div className="card-surface overflow-hidden rounded-2xl">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line text-outline">
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-2 py-2 text-left font-semibold">Squadra</th>
                <th className="px-2 py-2 text-center font-semibold">PG</th>
                <th className="px-2 py-2 text-center font-semibold">V</th>
                <th className="px-2 py-2 text-center font-semibold">N</th>
                <th className="px-2 py-2 text-center font-semibold">P</th>
                <th className="px-2 py-2 text-center font-semibold">DR</th>
                <th className="px-3 py-2 text-right font-semibold">Pt</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((r, i) => (
                <tr key={r.team.id} className="border-b border-line/60 last:border-0">
                  <td className="px-3 py-2.5 font-bold text-gold">{i + 1}</td>
                  <td className="px-2 py-2.5 font-semibold">{r.team.name}</td>
                  <td className="px-2 py-2.5 text-center text-on-surface-variant">{r.played}</td>
                  <td className="px-2 py-2.5 text-center text-on-surface-variant">{r.won}</td>
                  <td className="px-2 py-2.5 text-center text-on-surface-variant">{r.drawn}</td>
                  <td className="px-2 py-2.5 text-center text-on-surface-variant">{r.lost}</td>
                  <td className="px-2 py-2.5 text-center text-on-surface-variant">
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="px-3 py-2.5 text-right font-display font-bold">{r.points}</td>
                </tr>
              ))}
              {standings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-outline">
                    Nessun dato disponibile
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "marcatori" && (
        <div>
          {podium.length > 0 && (
            <div className="mb-6 flex items-end justify-center gap-3">
              {[podium[1], podium[0], podium[2]].map((p, idx) =>
                p ? (
                  <Link key={p.player.id} href={`/giocatori/${p.player.id}`} className="flex flex-col items-center">
                    <div
                      className={`overflow-hidden rounded-full border-2 ${
                        idx === 1 ? "h-16 w-16 border-gold" : "h-12 w-12 border-line"
                      }`}
                    >
                      {p.player.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.player.photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface2 text-sm font-bold text-gold">
                          {p.player.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="mt-1.5 text-center text-[11px] font-bold">{p.player.name}</span>
                    <span className="text-[10px] text-outline">{p.team?.name}</span>
                    <span className="font-display text-lg font-bold text-gold">{p.goals}</span>
                  </Link>
                ) : (
                  <div key={idx} />
                )
              )}
            </div>
          )}
          <div className="card-surface overflow-hidden rounded-2xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line text-outline">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-2 py-2 text-left font-semibold">Giocatore</th>
                  <th className="px-2 py-2 text-left font-semibold">Squadra</th>
                  <th className="px-3 py-2 text-right font-semibold">Gol</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((p, i) => (
                  <tr
                    key={p.player.id}
                    className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-surface2"
                  >
                    <td className="px-3 py-2.5 text-outline">{i + 4}</td>
                    <td className="px-2 py-2.5">
                      <Link href={`/giocatori/${p.player.id}`} className="flex items-center gap-2">
                        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-surface2">
                          {p.player.photo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.player.photo_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-semibold">{p.player.name}</span>
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-on-surface-variant">{p.team?.name}</td>
                    <td className="px-3 py-2.5 text-right font-display font-bold">{p.goals}</td>
                  </tr>
                ))}
                {scorers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-outline">
                      Nessun marcatore registrato
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
