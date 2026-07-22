"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTournamentData } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminTeams from "@/components/admin/AdminTeams";
import AdminPlayers from "@/components/admin/AdminPlayers";
import AdminMatches from "@/components/admin/AdminMatches";
import AdminVenues from "@/components/admin/AdminVenues";
import AdminSettings from "@/components/admin/AdminSettings";

type Tab = "partite" | "squadre" | "giocatori" | "sedi" | "impostazioni";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("partite");
  const [showWelcome, setShowWelcome] = useState(false);
  const { settings, venues, teams, players, matches, scorers, reload } = useTournamentData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setShowWelcome(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) setShowWelcome(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <p className="mt-20 text-center text-sm text-muted">Caricamento…</p>;
  }
  if (!session) {
    return <AdminLogin />;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "partite", label: "Partite" },
    { key: "squadre", label: "Squadre" },
    { key: "giocatori", label: "Giocatori" },
    { key: "sedi", label: "Piscine" },
    { key: "impostazioni", label: "Impostazioni" },
  ];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Pannello di controllo</p>
          <h1 className="font-display text-2xl font-bold text-on-surface">Admin</h1>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface"
        >
          <LogOut size={13} /> Esci
        </button>
      </div>

      {showWelcome && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-800/50 bg-emerald-950/40 px-4 py-2.5 text-sm font-semibold text-emerald-400">
          <CheckCircle2 size={16} />
          Bentornato!
        </div>
      )}

      <AdminDashboard teams={teams} players={players} venues={venues} matches={matches} />

      <div className="my-5 flex gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              tab === t.key ? "bg-primary text-on-primary" : "text-muted-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "squadre" && <AdminTeams teams={teams} reload={reload} />}
      {tab === "giocatori" && (
        <AdminPlayers players={players} teams={teams} scorers={scorers} reload={reload} />
      )}
      {tab === "partite" && (
        <AdminMatches
          matches={matches}
          teams={teams}
          venues={venues}
          players={players}
          matchScorers={scorers}
          reload={reload}
        />
      )}
      {tab === "sedi" && <AdminVenues venues={venues} reload={reload} />}
      {tab === "impostazioni" && <AdminSettings settings={settings} reload={reload} />}

      <p className="mt-6 text-center text-xs text-muted">
        Suggerimento: la classifica e i marcatori si aggiornano automaticamente quando salvi punteggi e gol.{" "}
        <a href="/" className="font-semibold text-secondary">
          Torna al sito pubblico
        </a>
      </p>
    </main>
  );
}
