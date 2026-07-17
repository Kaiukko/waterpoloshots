"use client";
import { useMemo, useState } from "react";
import { useTournamentData, teamById } from "@/lib/data";
import MatchCard from "@/components/MatchCard";

export default function CalendarioPage() {
  const { teams, venues, matches, loading } = useTournamentData();
  const [stage, setStage] = useState<"all" | 1 | 2>("all");
  const [group, setGroup] = useState<"all" | "A" | "B" | "Finali">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (stage !== "all" && m.stage_number !== stage) return false;
      if (group !== "all" && m.group_name !== group) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const home = teamById(teams, m.team_home_id)?.name?.toLowerCase() || "";
        const away = teamById(teams, m.team_away_id)?.name?.toLowerCase() || "";
        if (!home.includes(q) && !away.includes(q)) return false;
      }
      return true;
    });
  }, [matches, stage, group, query, teams]);

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

      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {(["all", 1, 2] as const).map((s) => (
          <button
            key={String(s)}
            onClick={() => setStage(s)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              stage === s ? "bg-primary text-white" : "card-surface text-[#B8B8BC]"
            }`}
          >
            {s === "all" ? "Tutte le Tappe" : `Tappa ${s}`}
          </button>
        ))}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {(["all", "A", "B", "Finali"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              group === g ? "bg-gold text-black" : "card-surface text-[#B8B8BC]"
            }`}
          >
            {g === "all" ? "Tutti i Gironi" : g === "Finali" ? "Finali" : `Girone ${g}`}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-sm text-[#8A8A8E]">Caricamento…</p>}

      <div className="space-y-3">
        {filtered.map((m) => (
          <MatchCard key={m.id} match={m} teams={teams} venues={venues} />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-[#8A8A8E]">Nessuna partita trovata con questi filtri.</p>
      )}
    </main>
  );
}
