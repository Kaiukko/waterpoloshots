"use client";
import { useEffect, useState } from "react";
import { Users, UserRound, Trophy, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Team, Player, Venue, Match } from "@/lib/types";

export default function AdminDashboard({
  teams,
  players,
  venues,
  matches,
}: {
  teams: Team[];
  players: Player[];
  venues: Venue[];
  matches: Match[];
}) {
  const [log, setLog] = useState<{ id: string; message: string; created_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => data && setLog(data as any));

    const channel = supabase
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (payload) => {
        setLog((prev) => [payload.new as any, ...prev].slice(0, 10));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cards = [
    { label: "Squadre", value: teams.length, Icon: Users, color: "text-primary" },
    { label: "Giocatori", value: players.length, Icon: UserRound, color: "text-primary" },
    { label: "Partite", value: matches.length, Icon: Trophy, color: "text-secondary" },
    { label: "Piscine", value: venues.length, Icon: MapPin, color: "text-secondary" },
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <c.Icon size={13} className={c.color} />
              {c.label}
            </div>
            <div className="font-display text-2xl font-bold text-on-surface">{c.value}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-2">Registro Attività</h3>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {log.map((l) => (
          <div key={l.id} className="px-4 py-2.5 text-xs">
            <span className="text-on-surface">{l.message}</span>
            <div className="mt-0.5 text-[10px] text-muted">{new Date(l.created_at).toLocaleString("it-IT")}</div>
          </div>
        ))}
        {log.length === 0 && <div className="px-4 py-4 text-center text-xs text-muted">Nessuna attività recente</div>}
      </div>
    </div>
  );
}
