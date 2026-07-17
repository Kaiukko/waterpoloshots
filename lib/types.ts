export type GroupName = "A" | "B";
export type MatchStatus = "Programmata" | "In Corso" | "Terminata";
export type BracketRound =
  | "quarti"
  | "semifinali"
  | "finale_1_2"
  | "finale_3_4"
  | "finale_5_6"
  | "finale_7_8";

export interface Settings {
  id: boolean;
  tournament_title: string;
  tournament_subtitle: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  current_stage_number: number;
  current_stage_name: string;
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
  group_name: GroupName | null;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  cap_number: number | null;
  photo_url: string | null;
  role: string | null;
  goals: number;
}

export interface Match {
  id: string;
  stage_number: number;
  group_name: string | null; // 'A' | 'B' | 'Finali'
  bracket_round: BracketRound | null;
  bracket_slot: number | null;
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

export const STAGE_POINTS = [10, 8, 6, 5, 4, 3, 2, 1];
