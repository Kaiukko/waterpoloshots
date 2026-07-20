"use client";
import { useMemo, useState } from "react";
import { useTournamentData, teamById } from "@/lib/data";
import MatchCard from "@/components/MatchCard";

export default function CalendarioPage() {
  const { teams, venues, matches, loading } = useTournamentData();
  const [leg, setLeg] = useState<"all" | "Andata" | "Ritorno">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (leg !== "all" && m.leg !== leg) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const home = teamById(teams, m.team_home_id)?.name?.toLowerCase() || "";
        const away = teamById(teams, m.team_away_id)?.name?.toLowerCase() || "";
        if (!home.includes(q) && !away.includes(q)) return false;
      }
      return true;
    });
  }, [matches, leg, query, teams]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const m of filtered) {
      const key = m.matchday ? `${m.leg} · Giornata ${m.matchday}` : `${m.leg} · Giornata da definire`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    return Array.from(groups.entries()).sort((a, b) => {
      const [legA, gA] = a[0].split(" · Giornata ");
      const [legB, gB] = b[0].split(" · Giornata ");
      if (legA !== legB) return legA === "Andata" ? -1 : 1;
      const numA = parseInt(gA, 10);
      const numB = parseInt(gB, 10);
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      return numA - numB;
    });
  }, [filtered]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <h1 className="font-display mb-4 text-2xl font-bold">Calendario</h1>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Cerca una squadra…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 text-sm"
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {(["all", "Andata", "Ritorno"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLeg(l)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              leg === l ? "bg-primary text-white" : "card-surface text-[#B8B8BC]"
            }`}
          >
            {l === "all" ? "Tutte" : `Girone di ${l}`}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-sm text-[#8A8A8E]">Caricamento…</p>}

      <div className="space-y-6">
        {grouped.map(([label, group]) => (
          <div key={label}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gold">{label}</h2>
            <div className="space-y-3">
              {group.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-[#8A8A8E]">Nessuna partita trovata con questi filtri.</p>
      )}
    </main>
  );
}
