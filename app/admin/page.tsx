"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useTournamentData } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminTeams from "@/components/admin/AdminTeams";
import AdminPlayers from "@/components/admin/AdminPlayers";
import AdminMatches from "@/components/admin/AdminMatches";
import AdminVenues from "@/components/admin/AdminVenues";
import AdminSettings from "@/components/admin/AdminSettings";

type Tab = "dashboard" | "squadre" | "giocatori" | "partite" | "sedi" | "impostazioni";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("dashboard");
  const { settings, venues, teams, players, matches, reload } = useTournamentData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <p className="mt-20 text-center text-sm text-[#8A8A8E]">Caricamento…</p>;
  }
  if (!session) {
    return <AdminLogin />;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "squadre", label: "Squadre" },
    { key: "giocatori", label: "Giocatori" },
    { key: "partite", label: "Partite" },
    { key: "sedi", label: "Piscine" },
    { key: "impostazioni", label: "Impostazioni" },
  ];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Pannello Admin</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold"
        >
          Esci
        </button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              tab === t.key ? "bg-primary text-white" : "card-surface text-[#B8B8BC]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <AdminDashboard teams={teams} players={players} venues={venues} matches={matches} />
      )}
      {tab === "squadre" && <AdminTeams teams={teams} reload={reload} />}
      {tab === "giocatori" && <AdminPlayers players={players} teams={teams} reload={reload} />}
      {tab === "partite" && (
        <AdminMatches matches={matches} teams={teams} venues={venues} reload={reload} />
      )}
      {tab === "sedi" && <AdminVenues venues={venues} reload={reload} />}
      {tab === "impostazioni" && <AdminSettings settings={settings} reload={reload} />}
    </main>
  );
}
