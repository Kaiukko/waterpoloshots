"use client";
import { useMemo } from "react";
import { useTournamentData, teamById } from "@/lib/data";
import { Match, BracketRound } from "@/lib/types";

const ROUND_LABELS: Record<BracketRound, string> = {
  quarti: "Quarti di Finale",
  semifinali: "Semifinali",
  finale_1_2: "Finale 1°-2° Posto",
  finale_3_4: "Finale 3°-4° Posto",
  finale_5_6: "Finale 5°-6° Posto",
  finale_7_8: "Finale 7°-8° Posto",
};

function BracketMatch({ m, teams }: { m: Match; teams: any[] }) {
  const home = teamById(teams, m.team_home_id);
  const away = teamById(teams, m.team_away_id);
  return (
    <div className="card-surface min-w-[220px] rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between text-[10px] text-[#8A8A8E]">
        <span>{m.match_date ? `${m.match_date} ${m.match_time ?? ""}` : "Da definire"}</span>
        {m.status === "In Corso" && <span className="font-bold text-primary">LIVE</span>}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{home?.name ?? "TBD"}</span>
        <span className="font-display font-bold text-gold">{m.score_home ?? "-"}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="font-semibold">{away?.name ?? "TBD"}</span>
        <span className="font-display font-bold text-gold">{m.score_away ?? "-"}</span>
      </div>
    </div>
  );
}

export default function FinaliPage() {
  const { teams, matches, loading } = useTournamentData();

  const finals = useMemo(() => matches.filter((m) => m.group_name === "Finali"), [matches]);

  const rounds: BracketRound[] = ["quarti", "semifinali", "finale_1_2", "finale_3_4", "finale_5_6", "finale_7_8"];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <h1 className="font-display mb-1 text-2xl font-bold">Finali</h1>
      <p className="mb-5 text-sm text-[#8A8A8E]">
        Tabellone a eliminazione diretta per i piazzamenti dal 1° all&apos;8° posto.
      </p>

      {loading && <p className="text-center text-sm text-[#8A8A8E]">Caricamento…</p>}

      {!loading && finals.length === 0 && (
        <p className="mt-10 text-center text-sm text-[#8A8A8E]">
          Il tabellone non è ancora stato generato. Torna a controllare dopo la fine della fase a gironi.
        </p>
      )}

      <div className="space-y-6 overflow-x-auto">
        {rounds.map((round) => {
          const roundMatches = finals
            .filter((m) => m.bracket_round === round)
            .sort((a, b) => (a.bracket_slot ?? 0) - (b.bracket_slot ?? 0));
          if (roundMatches.length === 0) return null;
          return (
            <div key={round}>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gold">
                {ROUND_LABELS[round]}
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {roundMatches.map((m) => (
                  <BracketMatch key={m.id} m={m} teams={teams} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
