import { Match, Team, STAGE_POINTS } from "./types";

export interface StandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

/** Classifica di un girone (A o B) basata solo sulle partite Terminata. */
export function computeGroupStandings(
  teams: Team[],
  matches: Match[],
  group: "A" | "B",
  stageNumber?: number
): StandingRow[] {
  const groupTeams = teams.filter((t) => t.group_name === group);
  const rows = new Map<string, StandingRow>();
  groupTeams.forEach((team) =>
    rows.set(team.id, { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 })
  );

  const relevant = matches.filter(
    (m) =>
      m.status === "Terminata" &&
      m.group_name === group &&
      m.score_home !== null &&
      m.score_away !== null &&
      (stageNumber === undefined || m.stage_number === stageNumber)
  );

  for (const m of relevant) {
    const home = m.team_home_id ? rows.get(m.team_home_id) : undefined;
    const away = m.team_away_id ? rows.get(m.team_away_id) : undefined;
    if (!home || !away) continue;
    const sh = m.score_home as number;
    const sa = m.score_away as number;
    home.played++;
    away.played++;
    home.gf += sh;
    home.ga += sa;
    away.gf += sa;
    away.ga += sh;
    if (sh > sa) {
      home.won++;
      away.lost++;
      home.points += 3;
    } else if (sh < sa) {
      away.won++;
      home.lost++;
      away.points += 3;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  const list = Array.from(rows.values());
  list.forEach((r) => (r.gd = r.gf - r.ga));
  list.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  return list;
}

/** Classifica generale cumulativa del circuito: punti 10-8-6-5-4-3-2-1 per ogni tappa disputata. */
export function computeCircuitStandings(teams: Team[], matches: Match[]): { team: Team; points: number }[] {
  const stageNumbers = Array.from(new Set(matches.map((m) => m.stage_number))).sort((a, b) => a - b);
  const totals = new Map<string, number>();
  teams.forEach((t) => totals.set(t.id, 0));

  for (const stage of stageNumbers) {
    const a = computeGroupStandings(teams, matches, "A", stage);
    const b = computeGroupStandings(teams, matches, "B", stage);
    const combined = [...a, ...b].sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf);
    combined.forEach((row, idx) => {
      const pts = STAGE_POINTS[idx] ?? 0;
      totals.set(row.team.id, (totals.get(row.team.id) ?? 0) + pts);
    });
  }

  return teams
    .map((team) => ({ team, points: totals.get(team.id) ?? 0 }))
    .sort((a, b) => b.points - a.points);
}

/** Genera gli accoppiamenti dei quarti di finale incrociando i primi 4 di A con i primi 4 di B. */
export function generateQuarterfinalPairings(teams: Team[], matches: Match[]) {
  const a = computeGroupStandings(teams, matches, "A").slice(0, 4);
  const b = computeGroupStandings(teams, matches, "B").slice(0, 4);
  if (a.length < 4 || b.length < 4) return null;

  return [
    { slot: 1, home: a[0].team, away: b[3].team, label: "1A vs 4B" },
    { slot: 2, home: a[1].team, away: b[2].team, label: "2A vs 3B" },
    { slot: 3, home: b[1].team, away: a[2].team, label: "2B vs 3A" },
    { slot: 4, home: b[0].team, away: a[3].team, label: "1B vs 4A" },
  ];
}
