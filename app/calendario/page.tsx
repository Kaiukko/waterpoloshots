"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTournamentData, teamById } from "@/lib/data";
import MatchCard from "@/components/MatchCard";

export default function CalendarioPage() {
  const { teams, venues, matches, loading } = useTournamentData();
  const [leg, setLeg] = useState<"all" | "Andata" | "Ritorno">("all");
  const [matchday, setMatchday] = useState<"all" | number>("all");
  const [query, setQuery] = useState("");

  const matchdays = useMemo(
    () => Array.from(new Set(matches.map((m) => m.matchday).filter((n): n is number => !!n))).sort((a, b) => a - b),
    [matches]
  );

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (leg !== "all" && m.leg !== leg) return false;
      if (matchday !== "all" && m.matchday !== matchday) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const home = teamById(teams, m.team_home_id)?.name?.toLowerCase() || "";
        const away = teamById(teams, m.team_away_id)?.name?.toLowerCase() || "";
        if (!home.includes(q) && !away.includes(q)) return false;
      }
      return true;
    });
  }, [matches, leg, matchday, query, teams]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const m of filtered) {
      const key = m.matchday ? `Giornata ${m.matchday}` : "Giornata da definire";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    return Array.from(groups.entries()).sort((a, b) => {
      const numA = parseInt(a[0].replace("Giornata ", ""), 10);
      const numB = parseInt(b[0].replace("Giornata ", ""), 10);
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      return numA - numB;
    });
  }, [filtered]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Calendario</p>
      <h1 className="font-display mb-4 text-2xl font-bold text-on-surface">Partite</h1>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Cerca una squadra…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full py-2.5 pl-10 pr-4 text-sm"
        />
      </div>

      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {(["all", "Andata", "Ritorno"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLeg(l)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              leg === l ? "bg-primary text-on-primary" : "border border-border bg-surface text-muted-2"
            }`}
          >
            {l === "all" ? "Tutte" : l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setMatchday("all")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
            matchday === "all" ? "bg-primary text-on-primary" : "border border-border bg-surface text-muted-2"
          }`}
        >
          Tutte le giornate
        </button>
        {matchdays.map((n) => (
          <button
            key={n}
            onClick={() => setMatchday(n)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              matchday === n ? "bg-primary text-on-primary" : "border border-border bg-surface text-muted-2"
            }`}
          >
            Giornata {n}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-sm text-muted">Caricamento…</p>}

      <div className="space-y-6">
        {grouped.map(([label, group]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">{label}</h2>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                {group[0].leg} · {group.length} {group.length === 1 ? "partita" : "partite"}
              </span>
            </div>
            <div className="space-y-3">
              {group.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">Nessuna partita corrisponde ai filtri.</p>
      )}
    </main>
  );
}
