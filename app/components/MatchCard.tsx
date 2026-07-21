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

function TeamRow({ teams, id, score, dim }: { teams: Team[]; id: string | null; score: number | string; dim?: boolean }) {
  const logo = teamLogo(teams, id);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden bg-white p-0.5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[9px] font-black text-black">{teamName(teams, id).slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span className="font-label-md text-label-md no-uppercase text-on-surface">{teamName(teams, id)}</span>
      </div>
      <span
        className={`font-display text-headline-md font-black italic ${
          dim ? "text-outline-variant" : "text-secondary"
        }`}
      >
        {score}
      </span>
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

const STATUS_STYLES: Record<string, string> = {
  "In Corso": "bg-primary text-on-primary",
  Terminata: "bg-surface-container-highest text-on-surface-variant",
  Programmata: "bg-surface-container-low text-on-surface-variant",
};

export default function MatchCard({ match, teams, venues }: { match: Match; teams: Team[]; venues: Venue[] }) {
  const [open, setOpen] = useState(false);
  const venue = venues.find((v) => v.id === match.venue_id);
  const text = shareText(match, teams, venues);
  const isLive = match.status === "In Corso";
  const isDone = match.status === "Terminata";

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={`match-card-hover relative cursor-pointer overflow-hidden border-2 border-outline-variant border-l-4 bg-surface-container-lowest p-stack-md ${
          isLive ? "border-l-primary" : isDone ? "border-l-outline-variant opacity-80" : "border-l-secondary"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className={`px-2 py-0.5 text-[10px] font-black italic tracking-widest ${STATUS_STYLES[match.status]}`}>
            {match.status}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm italic text-on-surface-variant no-uppercase">
              {isLive && match.period_info
                ? match.period_info
                : match.status === "Programmata"
                ? match.match_time ?? ""
                : match.leg}
            </span>
            {isDone && <ShareButton text={text} variant="compact" />}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <TeamRow teams={teams} id={match.team_home_id} score={match.status === "Programmata" ? "--" : match.score_home ?? 0} dim={match.status === "Programmata"} />
          {match.status === "Programmata" ? (
            <div className="relative h-[2px] w-full bg-outline-variant">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-lowest px-2 text-[10px] font-black italic text-primary">
                VS
              </span>
            </div>
          ) : null}
          <TeamRow teams={teams} id={match.team_away_id} score={match.status === "Programmata" ? "--" : match.score_away ?? 0} dim={match.status === "Programmata"} />
        </div>

        {(isLive || match.status === "Programmata") && (
          <div className="mt-4 flex items-center justify-between border-t border-outline-variant/50 pt-3">
            <span className="font-label-sm text-label-sm no-uppercase text-on-surface-variant">{venue?.name ?? "Sede da definire"}</span>
            <ShareButton text={text} variant={isLive ? "footer" : "default"} />
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md border-t-2 border-primary bg-surface-container-low p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 bg-outline-variant" />
            <h3 className="mb-1 text-center font-label-sm text-label-sm italic text-secondary">
              {match.leg}
              {match.matchday ? ` · Giornata ${match.matchday}` : ""}
            </h3>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-white p-1">
                  {teamLogo(teams, match.team_home_id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={teamLogo(teams, match.team_home_id)!} alt="" className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <span className="font-label-md text-label-md no-uppercase">{teamName(teams, match.team_home_id)}</span>
              </div>
              <span className="font-display text-headline-md font-black italic text-secondary">
                {match.status === "Programmata" ? "VS" : `${match.score_home ?? 0} - ${match.score_away ?? 0}`}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2 text-right">
                <span className="font-label-md text-label-md no-uppercase">{teamName(teams, match.team_away_id)}</span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-white p-1">
                  {teamLogo(teams, match.team_away_id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={teamLogo(teams, match.team_away_id)!} alt="" className="h-full w-full object-contain" />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="space-y-2 border border-outline-variant bg-surface-container-lowest p-4 font-body-md text-body-md no-uppercase">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Stato</span>
                <span className="font-bold">{match.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Data</span>
                <span className="font-bold">{match.match_date ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Orario</span>
                <span className="font-bold">{match.match_time ?? "-"}</span>
              </div>
              {match.period_info && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tempo di gioco</span>
                  <span className="font-bold">{match.period_info}</span>
                </div>
              )}
              <div className="border-t border-outline-variant pt-2">
                <span className="text-on-surface-variant">Sede</span>
                <p className="mt-0.5 font-bold">{venue?.name ?? "Da definire"}</p>
                {venue?.address && <p className="text-xs text-on-surface-variant">{venue.address}</p>}
                {venue?.tags && venue.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {venue.tags.map((tag) => (
                      <span key={tag} className="bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {venue?.lat && venue?.lng && (
                  <a
                    className="mt-2 inline-block text-xs font-bold text-secondary underline"
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
