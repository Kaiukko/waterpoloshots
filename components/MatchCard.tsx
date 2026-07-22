"use client";
import { useState } from "react";
import { MapPin, Share2 } from "lucide-react";
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
  const name = teamName(teams, id);
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2.5 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <span className="text-[10px] font-bold text-black">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="truncate text-sm font-semibold text-on-surface">{name}</span>
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
  const isLive = match.status === "In Corso";
  const isDone = match.status === "Terminata";
  const isScheduled = match.status === "Programmata";

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="match-card-hover cursor-pointer rounded-2xl border border-border bg-surface p-4"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          {isScheduled && match.match_date && (
            <span>
              {match.match_date} · {match.match_time ?? ""}
            </span>
          )}
          {match.matchday && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold text-muted-2">
              Giornata {match.matchday}
            </span>
          )}
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold text-muted-2">{match.leg}</span>
          {isLive && (
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-0.5 font-bold text-primary">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-primary" />
              {match.period_info || "In corso"}
            </span>
          )}
          {isDone && (
            <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 font-bold text-muted-2">Finale</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <TeamBadge teams={teams} id={match.team_home_id} align="left" />
          <div className="shrink-0 text-center">
            {isScheduled ? (
              <span className="text-xs font-semibold text-muted">vs</span>
            ) : (
              <span className="font-display text-lg font-bold text-secondary">
                {match.score_home ?? 0} - {match.score_away ?? 0}
              </span>
            )}
          </div>
          <TeamBadge teams={teams} id={match.team_away_id} align="right" />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={13} />
            {venue?.name ?? "Sede da definire"}
          </span>
          <ShareButton text={text} variant="compact" />
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-8 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-3" />
            <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
              {match.leg}
              {match.matchday ? ` · Giornata ${match.matchday}` : ""}
            </p>
            <div className="mb-4 flex items-center gap-3">
              <TeamBadge teams={teams} id={match.team_home_id} align="left" />
              <span className="shrink-0 font-display text-2xl font-bold text-secondary">
                {isScheduled ? "vs" : `${match.score_home ?? 0} - ${match.score_away ?? 0}`}
              </span>
              <TeamBadge teams={teams} id={match.team_away_id} align="right" />
            </div>

            <div className="space-y-2 rounded-2xl border border-border bg-surface-2 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Stato</span>
                <span className="font-semibold">{match.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Data</span>
                <span className="font-semibold">{match.match_date ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Orario</span>
                <span className="font-semibold">{match.match_time ?? "-"}</span>
              </div>
              {match.period_info && (
                <div className="flex justify-between">
                  <span className="text-muted">Tempo di gioco</span>
                  <span className="font-semibold">{match.period_info}</span>
                </div>
              )}
              <div className="border-t border-border pt-2">
                <span className="text-muted">Sede</span>
                <p className="mt-0.5 font-semibold">{venue?.name ?? "Da definire"}</p>
                {venue?.address && <p className="text-xs text-muted">{venue.address}</p>}
                {venue?.tags && venue.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {venue.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {venue?.lat && venue?.lng && (
                  <a
                    className="mt-2 inline-block text-xs font-semibold text-secondary underline"
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
