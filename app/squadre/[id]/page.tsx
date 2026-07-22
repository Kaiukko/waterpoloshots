"use client";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTournamentData, goalsByPlayer } from "@/lib/data";

export default function SquadraDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { teams, players, scorers, loading } = useTournamentData();

  const team = teams.find((t) => t.id === id);
  const goalsMap = useMemo(() => goalsByPlayer(scorers), [scorers]);
  const roster = useMemo(
    () =>
      players
        .filter((p) => p.team_id === id)
        .sort((a, b) => (a.cap_number ?? 999) - (b.cap_number ?? 999)),
    [players, id]
  );

  if (loading) {
    return <p className="mt-20 text-center text-sm text-muted">Caricamento…</p>;
  }
  if (!team) {
    return (
      <main className="mx-auto max-w-md px-4 pb-8 pt-6">
        <p className="mt-10 text-center text-sm text-muted">Squadra non trovata.</p>
        <div className="mt-4 text-center">
          <Link href="/squadre" className="text-sm font-semibold text-secondary">
            ← Torna alle squadre
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-muted">
        <ArrowLeft size={15} /> Indietro
      </button>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white">
          {team.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo_url} alt="" className="h-full w-full object-contain p-2" />
          ) : (
            <span className="text-2xl font-bold text-black">{team.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-on-surface">{team.name}</h1>
        <p className="mt-1 text-xs text-muted">{roster.length} giocatori in rosa</p>
      </div>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-2">Rosa</h2>
      <div className="space-y-2">
        {roster.map((p) => (
          <Link
            key={p.id}
            href={`/giocatori/${p.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
          >
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-surface-2">
              {p.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-secondary">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className="w-8 shrink-0 text-center font-display text-base font-bold text-secondary">
              {p.cap_number ?? "-"}
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-on-surface">{p.name}</div>
              <div className="text-xs text-muted">{p.role ?? "—"}</div>
            </div>
            <span className="shrink-0 text-xs font-bold text-muted-2">{goalsMap.get(p.id) ?? 0} gol</span>
          </Link>
        ))}
        {roster.length === 0 && <p className="text-sm text-muted">Rosa non ancora inserita.</p>}
      </div>
    </main>
  );
}
