"use client";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTournamentData, playerGoals } from "@/lib/data";

export default function GiocatoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { players, teams, scorers, loading } = useTournamentData();

  const player = players.find((p) => p.id === id);
  const team = player ? teams.find((t) => t.id === player.team_id) : null;
  const goals = useMemo(() => (player ? playerGoals(scorers, player.id) : 0), [scorers, player]);

  if (loading) {
    return <p className="mt-20 text-center text-sm text-muted">Caricamento…</p>;
  }
  if (!player) {
    return (
      <main className="mx-auto max-w-md px-4 pb-8 pt-6">
        <p className="mt-10 text-center text-sm text-muted">Giocatore non trovato.</p>
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

      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border border-border bg-surface-2">
          {player.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-secondary">
              {player.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight text-on-surface">{player.name}</h1>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 font-display text-lg font-bold text-primary">
            #{player.cap_number ?? "-"}
          </span>
          {player.role && (
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted-2">
              {player.role}
            </span>
          )}
        </div>

        {team && (
          <Link
            href={`/squadre/${team.id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-on-surface"
          >
            <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-white">
              {team.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={team.logo_url} alt="" className="h-full w-full object-contain" />
              )}
            </div>
            {team.name}
          </Link>
        )}

        <div className="mt-6 rounded-2xl bg-surface-2 py-4">
          <div className="font-display text-4xl font-bold text-secondary">{goals}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">Gol Segnati</div>
        </div>
      </div>
    </main>
  );
}
