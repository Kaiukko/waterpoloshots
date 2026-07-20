export type MatchStatus = "Programmata" | "In Corso" | "Terminata";
export type Leg = "Andata" | "Ritorno";

export interface Settings {
  id: boolean;
  tournament_title: string;
  tournament_subtitle: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  current_matchday: number;
  home_background_url: string | null;
  header_background_url: string | null;
}

export interface Venue {
  id: string;
  name: string;
  tags: string[];
  address: string | null;
  lat: number | null;
  lng: number | null;
}

export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  cap_number: number | null;
  photo_url: string | null;
  role: string | null;
}

export interface MatchScorer {
  id: string;
  match_id: string;
  player_id: string;
  goals: number;
}

export interface Match {
  id: string;
  leg: Leg;
  matchday: number | null;
  return_of: string | null;
  team_home_id: string | null;
  team_away_id: string | null;
  venue_id: string | null;
  match_date: string | null;
  match_time: string | null;
  status: MatchStatus;
  score_home: number | null;
  score_away: number | null;
  period_info: string | null;
}

export const WATERPOLO_ROLES = [
  "Portiere",
  "Centroboa",
  "Centrovasca",
  "Difensore",
  "Ala",
  "Attaccante",
];

