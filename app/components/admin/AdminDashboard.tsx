"use client";
import { useEffect, useState } from "react";
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
      .limit(15)
      .then(({ data }) => data && setLog(data as any));

    const channel = supabase
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (payload) => {
        setLog((prev) => [payload.new as any, ...prev].slice(0, 15));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const liveCount = matches.filter((m) => m.status === "In Corso").length;

  const cards = [
    { label: "Squadre", value: teams.length, icon: "🏊" },
    { label: "Incontri Attivi", value: liveCount, icon: "🔴" },
    { label: "Giocatori", value: players.length, icon: "🤽" },
    { label: "Sedi", value: venues.length, icon: "📍" },
  ];

  return (
    <div>
      <h2 className="font-display mb-4 text-lg font-bold">Dashboard</h2>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card-surface rounded-2xl p-4">
            <div className="text-xl">{c.icon}</div>
            <div className="font-display mt-2 text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-outline">{c.label}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-on-surface-variant">Registro Attività</h3>
      <div className="card-surface divide-y divide-line rounded-2xl">
        {log.map((l) => (
          <div key={l.id} className="px-4 py-2.5 text-xs">
            <span className="text-on-surface-variant">{l.message}</span>
            <div className="mt-0.5 text-[10px] text-outline">
              {new Date(l.created_at).toLocaleString("it-IT")}
            </div>
          </div>
        ))}
        {log.length === 0 && <div className="px-4 py-4 text-center text-xs text-outline">Nessuna attività recente</div>}
      </div>
    </div>
  );
}
