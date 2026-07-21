import { Match, Team } from "./types";

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

function tally(teams: Team[], relevant: Match[]): Map<string, StandingRow> {
  const rows = new Map<string, StandingRow>();
  teams.forEach((team) =>
    rows.set(team.id, { team,  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0 })
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
  rows.forEach((r) => (r.gd = r.gf - r.ga));
  return rows;
}

/**
 * Classifica del campionato (girone all'italiana, andata + ritorno).
 * Criteri di spareggio in caso di parità di punti: 1) scontri diretti, 2) differenza reti generale.
 */
export function computeStandings(teams: Team[], matches: Match[]): StandingRow[] {
  const relevant = matches.filter(
    (m) => m.status === "Terminata" && m.score_home !== null && m.score_away !== null
  );
  const rows = tally(teams, relevant);
  const list = Array.from(rows.values());

  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const headToHead = relevant.filter(
      (m) =>
        (m.team_home_id === a.team.id && m.team_away_id === b.team.id) ||
        (m.team_home_id === b.team.id && m.team_away_id === a.team.id)
    );
    if (headToHead.length > 0) {
      const h2hRows = tally([a.team, b.team], headToHead);
      const aH2H = h2hRows.get(a.team.id)!;
      const bH2H = h2hRows.get(b.team.id)!;
      if (aH2H.points !== bH2H.points) return bH2H.points - aH2H.points;
      if (aH2H.gd !== bH2H.gd) return bH2H.gd - aH2H.gd;
    }

    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return list;
}
