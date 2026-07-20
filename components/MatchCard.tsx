"use client";
import { useState } from "react";
import { Match, Team, Venue } from "@/lib/types";
import ShareButton from "./ShareButton";

function teamName(teams: Team[], id: string | null) {
  return teams.find((t) => t.id === id)?.name ?? "TBD";
}
function teamLogo(teams: Team[], id: string | null) {
  return teams.find((t) => t.id === id)?.logo_url ?? null;
}

function TeamBadge({ teams, id, align }: { teams: Team[]; id: string | null; align: "left" | "right" }) {
  const logo = teamLogo(teams, id);
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface2 border border-line">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-gold">{teamName(teams, id).slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="text-sm font-semibold leading-tight">{teamName(teams, id)}</span>
    </div>
  );
}

function shareText(m: Match, teams: Team[], venues: Venue[]) {
  const home = teamName(teams, m.team_home_id);
  const away = teamName(teams, m.team_away_id);
  const venue = venues.find((v) => v.id === m.venue_id)?.name ?? "";
  if (m.status === "Terminata") {
    return `🏆 Serie B Pallanuoto — Risultato finale\n${home} ${m.score_home} - ${m.score_away} ${away}\n📍 ${venue}`;
  }
  if (m.status === "In Corso") {
    return `🔴 IN CORSO — Serie B Pallanuoto\n${home} vs ${away}\n📍 ${venue}`;
  }
  return `🤽 Serie B Pallanuoto\n${home} vs ${away}\n📅 ${m.match_date ?? ""} ⏰ ${m.match_time ?? ""}\n📍 ${venue}`;
}

export default function MatchCard({ match, teams, venues }: { match: Match; teams: Team[]; venues: Venue[] }) {
  const [open, setOpen] = useState(false);
  const venue = venues.find((v) => v.id === match.venue_id);
  const text = shareText(match, teams, venues);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="card-surface cursor-pointer rounded-2xl p-4 transition hover:border-primary/40"
      >
        {match.status === "Terminata" && (
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8E]">
              {match.leg}
              {match.matchday ? ` · Giornata ${match.matchday}` : ""}
            </span>
            <ShareButton text={text} variant="compact" />
          </div>
        )}
        {match.status === "In Corso" && (
          <div className="mb-3 flex items-center gap-1.5">
            <span className="live-dot h-2 w-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">In Corso</span>
          </div>
        )}
        {match.status === "Programmata" && (
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#8A8A8E]">
            {match.match_date} · {match.match_time}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <TeamBadge teams={teams} id={match.team_home_id} align="left" />
          <div className="shrink-0 text-center">
            {match.status === "Programmata" ? (
              <span className="text-sm font-bold text-[#8A8A8E]">VS</span>
            ) : (
              <span className="font-display text-2xl font-bold tabular-nums">
                {match.score_home ?? 0}
                <span className="text-gold mx-1">-</span>
                {match.score_away ?? 0}
              </span>
            )}
          </div>
          <TeamBadge teams={teams} id={match.team_away_id} align="right" />
        </div>

        {match.status === "In Corso" && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-[#8A8A8E]">{venue?.name}</span>
            <ShareButton text={text} variant="footer" />
          </div>
        )}
        {match.status === "Programmata" && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-[#8A8A8E]">{venue?.name}</span>
            <ShareButton text={text} />
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="card-surface w-full max-w-md rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h3 className="mb-1 text-center text-[11px] font-bold uppercase tracking-wider text-gold">
              {match.leg}
              {match.matchday ? ` · Giornata ${match.matchday}` : ""}
            </h3>
            <div className="mb-4 flex items-center justify-between gap-3">
              <TeamBadge teams={teams} id={match.team_home_id} align="left" />
              <span className="font-display text-3xl font-bold tabular-nums">
                {match.status === "Programmata" ? "VS" : `${match.score_home ?? 0} - ${match.score_away ?? 0}`}
              </span>
              <TeamBadge teams={teams} id={match.team_away_id} align="right" />
            </div>
            <div className="space-y-2 rounded-xl bg-surface2 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8A8A8E]">Stato</span>
                <span className="font-semibold">{match.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8E]">Data</span>
                <span className="font-semibold">{match.match_date ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8E]">Orario</span>
                <span className="font-semibold">{match.match_time ?? "-"}</span>
              </div>
              {match.period_info && (
                <div className="flex justify-between">
                  <span className="text-[#8A8A8E]">Tempo di gioco</span>
                  <span className="font-semibold">{match.period_info}</span>
                </div>
              )}
              <div className="border-t border-line pt-2">
                <span className="text-[#8A8A8E]">Sede</span>
                <p className="mt-0.5 font-semibold">{venue?.name ?? "Da definire"}</p>
                {venue?.address && <p className="text-xs text-[#8A8A8E]">{venue.address}</p>}
                {venue?.tags && venue.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {venue.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {venue?.lat && venue?.lng && (
                  <a
                    className="mt-2 inline-block text-xs font-semibold text-gold underline"
                    href={`https://maps.google.com/?q=${venue.lat},${venue.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apri in Google Maps →
                  </a>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <ShareButton text={text} variant="footer" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
