"use client";
import { useMemo, useState } from "react";
import { useTournamentData } from "@/lib/data";
import { computeGroupStandings, computeCircuitStandings } from "@/lib/standings";

type Tab = "gironi" | "circuito" | "marcatori";

function StandingsTable({ rows }: { rows: ReturnType<typeof computeGroupStandings> }) {
  return (
    <div className="card-surface overflow-hidden rounded-2xl">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-line text-[#8A8A8E]">
            <th className="px-3 py-2 text-left font-semibold">#</th>
            <th className="px-2 py-2 text-left font-semibold">Squadra</th>
            <th className="px-2 py-2 text-center font-semibold">PG</th>
            <th className="px-2 py-2 text-center font-semibold">DR</th>
            <th className="px-3 py-2 text-right font-semibold">Pt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team.id} className="border-b border-line/60 last:border-0">
              <td className="px-3 py-2.5 font-bold text-gold">{i + 1}</td>
              <td className="px-2 py-2.5 font-semibold">{r.team.name}</td>
              <td className="px-2 py-2.5 text-center text-[#B8B8BC]">{r.played}</td>
              <td className="px-2 py-2.5 text-center text-[#B8B8BC]">
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
              <td className="px-3 py-2.5 text-right font-display font-bold">{r.points}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-[#8A8A8E]">
                Nessun dato disponibile
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ClassifichePage() {
  const { teams, matches, players, loading } = useTournamentData();
  const [tab, setTab] = useState<Tab>("gironi");

  const groupA = useMemo(() => computeGroupStandings(teams, matches, "A"), [teams, matches]);
  const groupB = useMemo(() => computeGroupStandings(teams, matches, "B"), [teams, matches]);
  const circuit = useMemo(() => computeCircuitStandings(teams, matches), [teams, matches]);

  const scorers = useMemo(() => {
    return [...players]
      .filter((p) => p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .map((p) => ({ player: p, team: teams.find((t) => t.id === p.team_id) }));
  }, [players, teams]);

  const podium = scorers.slice(0, 3);
  const rest = scorers.slice(3);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <h1 className="font-display mb-4 text-2xl font-bold">Classifiche</h1>

      <div className="mb-5 flex gap-2">
        {([
          ["gironi", "Gironi"],
          ["circuito", "Circuito"],
          ["marcatori", "Marcatori"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold ${
              tab === key ? "bg-primary text-white" : "card-surface text-[#B8B8BC]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-sm text-[#8A8A8E]">Caricamento…</p>}

      {tab === "gironi" && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gold">Girone A</h2>
            <StandingsTable rows={groupA} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gold">Girone B</h2>
            <StandingsTable rows={groupB} />
          </div>
        </div>
      )}

      {tab === "circuito" && (
        <div className="card-surface overflow-hidden rounded-2xl">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line text-[#8A8A8E]">
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-2 py-2 text-left font-semibold">Squadra</th>
                <th className="px-3 py-2 text-right font-semibold">Punti Circuito</th>
              </tr>
            </thead>
            <tbody>
              {circuit.map((r, i) => (
                <tr key={r.team.id} className="border-b border-line/60 last:border-0">
                  <td className="px-3 py-2.5 font-bold text-gold">{i + 1}</td>
                  <td className="px-2 py-2.5 font-semibold">{r.team.name}</td>
                  <td className="px-3 py-2.5 text-right font-display font-bold">{r.points}</td>
                </tr>
              ))}
              {circuit.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-[#8A8A8E]">
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
                  <div key={p.player.id} className="flex flex-col items-center">
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
                    <span className="text-[10px] text-[#8A8A8E]">{p.team?.name}</span>
                    <span className="font-display text-lg font-bold text-gold">{p.player.goals}</span>
                  </div>
                ) : (
                  <div key={idx} />
                )
              )}
            </div>
          )}
          <div className="card-surface overflow-hidden rounded-2xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line text-[#8A8A8E]">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-2 py-2 text-left font-semibold">Giocatore</th>
                  <th className="px-2 py-2 text-left font-semibold">Squadra</th>
                  <th className="px-3 py-2 text-right font-semibold">Gol</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((p, i) => (
                  <tr key={p.player.id} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2.5 text-[#8A8A8E]">{i + 4}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-surface2">
                          {p.player.photo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.player.photo_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-semibold">{p.player.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-[#B8B8BC]">{p.team?.name}</td>
                    <td className="px-3 py-2.5 text-right font-display font-bold">{p.player.goals}</td>
                  </tr>
                ))}
                {scorers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[#8A8A8E]">
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
