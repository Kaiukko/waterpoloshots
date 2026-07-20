"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { Settings, Venue, Team, Player, Match, MatchScorer } from "./types";

export function useTournamentData() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scorers, setScorers] = useState<MatchScorer[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [s, v, t, p, m, sc] = await Promise.all([
      supabase.from("app_settings").select("*").single(),
      supabase.from("venues").select("*").order("name"),
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*").order("cap_number"),
      supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true }),
      supabase.from("match_scorers").select("*"),
    ]);
    if (s.data) setSettings(s.data as Settings);
    if (v.data) setVenues(v.data as Venue[]);
    if (t.data) setTeams(t.data as Team[]);
    if (p.data) setPlayers(p.data as Player[]);
    if (m.data) setMatches(m.data as Match[]);
    if (sc.data) setScorers(sc.data as MatchScorer[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel("public-tournament")
      .on("postgres_changes", { event: "*", schema: "public" }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { settings, venues, teams, players, matches, scorers, loading, reload };
}

export function teamById(teams: Team[], id: string | null) {
  return teams.find((t) => t.id === id) || null;
}

/** Somma i gol di ogni giocatore su tutte le partite (dai marcatori registrati). */
export function goalsByPlayer(scorers: MatchScorer[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of scorers) {
    map.set(s.player_id, (map.get(s.player_id) ?? 0) + s.goals);
  }
  return map;
}

/** Gol totali di un giocatore specifico. */
export function playerGoals(scorers: MatchScorer[], playerId: string): number {
  return scorers.filter((s) => s.player_id === playerId).reduce((sum, s) => sum + s.goals, 0);
}
