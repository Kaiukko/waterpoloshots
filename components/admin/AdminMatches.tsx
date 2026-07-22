"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, RotateCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/upload";
import { Match, Team, Venue, Player, MatchScorer } from "@/lib/types";
import Modal from "./Modal";

const STATUS_BADGE: Record<string, string> = {
  Programmata: "bg-surface-2 text-muted-2",
  "In Corso": "bg-primary-soft text-primary",
  Terminata: "bg-secondary-soft text-secondary",
};

export default function AdminMatches({
  matches,
  teams,
  venues,
  players,
  matchScorers,
  reload,
}: {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  players: Player[];
  matchScorers: MatchScorer[];
  reload: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Match> | null>(null);
  const [scorerInputs, setScorerInputs] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const isRitornoEdit = !!editing?.id && editing?.leg === "Ritorno";

  function openEdit(m: Partial<Match> | null) {
    setEditing(m);
    if (m?.id) {
      const map: Record<string, number> = {};
      matchScorers.filter((s) => s.match_id === m.id).forEach((s) => (map[s.player_id] = s.goals));
      setScorerInputs(map);
    } else {
      setScorerInputs({});
    }
  }

  async function save() {
    if (!editing) return;
    if (!isRitornoEdit && (!editing.team_home_id || !editing.team_away_id)) return;
    setSaving(true);

    const payload = {
      leg: editing.leg ?? "Andata",
      matchday: editing.matchday ?? null,
      team_home_id: editing.team_home_id ?? null,
      team_away_id: editing.team_away_id ?? null,
      venue_id: editing.venue_id ?? null,
      match_date: editing.match_date ?? null,
      match_time: editing.match_time ?? null,
      status: editing.status ?? "Programmata",
      score_home: editing.score_home ?? null,
      score_away: editing.score_away ?? null,
      period_info: editing.period_info ?? null,
    };

    let matchId = editing.id ?? null;

    if (editing.id) {
      await supabase.from("matches").update(payload).eq("id", editing.id);
      await logActivity("Partita aggiornata");
    } else {
      const { data: inserted } = await supabase.from("matches").insert(payload).select().single();
      await logActivity("Nuova partita programmata (andata)");
      matchId = inserted?.id ?? null;

      if (inserted) {
        await supabase.from("matches").insert({
          leg: "Ritorno",
          return_of: inserted.id,
          matchday: null,
          team_home_id: payload.team_away_id,
          team_away_id: payload.team_home_id,
          venue_id: null,
          match_date: null,
          match_time: null,
          status: "Programmata",
        });
        await logActivity("Partita di ritorno generata automaticamente");
      }
    }

    if (matchId) {
      await supabase.from("match_scorers").delete().eq("match_id", matchId);
      const entries = Object.entries(scorerInputs).filter(([, goals]) => goals > 0);
      if (entries.length > 0) {
        await supabase.from("match_scorers").insert(
          entries.map(([player_id, goals]) => ({ match_id: matchId, player_id, goals }))
        );
      }
      if (entries.length > 0) await logActivity("Marcatori della partita aggiornati");
    }

    setSaving(false);
    setEditing(null);
    reload();
  }

  async function remove(id: string) {
    if (!confirm("Eliminare questa partita? Se è una partita di andata verrà eliminato anche il suo ritorno collegato.")) return;
    await supabase.from("matches").delete().eq("id", id);
    await supabase.from("matches").delete().eq("return_of", id);
    await logActivity("Partita eliminata");
    reload();
  }

  const teamShort = (id: string | null | undefined) => {
    const n = teams.find((t) => t.id === id)?.name ?? "TBD";
    return n;
  };

  const sorted = [...matches].sort((a, b) => {
    if (a.leg !== b.leg) return a.leg === "Andata" ? -1 : 1;
    return (a.matchday ?? 999) - (b.matchday ?? 999);
  });

  const rosterForModal = editing
    ? players.filter((p) => p.team_id === editing.team_home_id || p.team_id === editing.team_away_id)
    : [];

  const showScorers =
    editing && (editing.status === "In Corso" || editing.status === "Terminata") && editing.team_home_id && editing.team_away_id;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-on-surface">Partite</h2>
        <button
          onClick={() => openEdit({ leg: "Andata", status: "Programmata" })}
          disabled={teams.length < 2}
          className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-on-primary disabled:opacity-40"
        >
          <Plus size={14} /> Nuova
        </button>
      </div>
      <p className="mb-4 text-xs text-muted">
        Ogni partita di andata genera automaticamente il ritorno con le squadre invertite: dovrai solo
        aggiungere data, ora e piscina quando lo modifichi.
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-3 py-2.5 font-semibold">Quando</th>
              <th className="px-2 py-2.5 font-semibold">Giornata</th>
              <th className="px-2 py-2.5 font-semibold">Match</th>
              <th className="px-2 py-2.5 text-center font-semibold">Score</th>
              <th className="px-2 py-2.5 font-semibold">Stato</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2.5 text-muted">
                  {m.match_date ?? "—"}
                  {m.match_time ? `, ${m.match_time}` : ""}
                </td>
                <td className="px-2 py-2.5 text-muted">
                  {m.matchday ? `G${m.matchday}` : "-"} · {m.leg}
                </td>
                <td className="px-2 py-2.5 font-semibold text-on-surface">
                  {teamShort(m.team_home_id)} vs {teamShort(m.team_away_id)}
                </td>
                <td className="px-2 py-2.5 text-center font-display font-bold text-secondary">
                  {m.score_home ?? 0} - {m.score_away ?? 0}
                </td>
                <td className="px-2 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE[m.status]}`}>
                    {m.status === "Programmata" ? "Programm." : m.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-2 text-muted">
                    {m.leg === "Andata" && <RotateCw size={13} className="text-muted-2" />}
                    <button onClick={() => openEdit(m)} className="hover:text-on-surface">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => remove(m.id)} className="hover:text-primary">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted">
                  Nessuna partita ancora.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal
          title={editing.id ? `Modifica Partita (${editing.leg})` : "Nuova Partita di Andata"}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-2">Giornata</label>
              <input
                type="number"
                value={editing.matchday ?? ""}
                onChange={(e) => setEditing({ ...editing, matchday: Number(e.target.value) })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                placeholder="es. 1"
              />
            </div>

            {isRitornoEdit ? (
              <div className="rounded-lg bg-surface-2 p-3 text-sm font-semibold text-on-surface">
                {teamShort(editing.team_home_id)} vs {teamShort(editing.team_away_id)}
                <p className="mt-1 text-xs font-normal text-muted">
                  Squadre invertite automaticamente dall&apos;andata. Aggiungi solo data, ora e piscina.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-2">Squadra Casa</label>
                  <select
                    value={editing.team_home_id ?? ""}
                    onChange={(e) => setEditing({ ...editing, team_home_id: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Seleziona</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-2">Squadra Ospite</label>
                  <select
                    value={editing.team_away_id ?? ""}
                    onChange={(e) => setEditing({ ...editing, team_away_id: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Seleziona</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-2">Piscina</label>
              <select
                value={editing.venue_id ?? ""}
                onChange={(e) => setEditing({ ...editing, venue_id: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Da definire</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-2">Data</label>
                <input
                  type="date"
                  value={editing.match_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, match_date: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-2">Orario</label>
                <input
                  type="time"
                  value={editing.match_time ?? ""}
                  onChange={(e) => setEditing({ ...editing, match_time: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-2">Stato</label>
              <div className="flex gap-2">
                {(["Programmata", "In Corso", "Terminata"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setEditing({ ...editing, status: s })}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                      editing.status === s ? "bg-primary text-on-primary" : "bg-surface-2 text-muted-2"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {(editing.status === "In Corso" || editing.status === "Terminata") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-2">Gol Casa</label>
                  <input
                    type="number"
                    value={editing.score_home ?? ""}
                    onChange={(e) => setEditing({ ...editing, score_home: Number(e.target.value) })}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-2">Gol Ospite</label>
                  <input
                    type="number"
                    value={editing.score_away ?? ""}
                    onChange={(e) => setEditing({ ...editing, score_away: Number(e.target.value) })}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {editing.status === "In Corso" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-2">Tempo di gioco</label>
                <input
                  value={editing.period_info ?? ""}
                  onChange={(e) => setEditing({ ...editing, period_info: e.target.value })}
                  placeholder="es. 3° Tempo, 05:12"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            {showScorers && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-2">Marcatori</label>
                {rosterForModal.length === 0 ? (
                  <p className="text-xs text-muted">
                    Nessun giocatore in rosa per le squadre selezionate. Aggiungili dalla scheda Giocatori.
                  </p>
                ) : (
                  <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg bg-surface-2 p-2">
                    {rosterForModal.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 rounded-lg bg-surface px-2 py-1.5">
                        <span className="flex-1 text-xs font-semibold text-on-surface">
                          {p.cap_number ? `#${p.cap_number} ` : ""}
                          {p.name}
                          <span className="ml-1 text-[10px] font-normal text-muted">({teamShort(p.team_id)})</span>
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={scorerInputs[p.id] ?? ""}
                          onChange={(e) =>
                            setScorerInputs({ ...scorerInputs, [p.id]: Number(e.target.value) })
                          }
                          className="w-16 rounded-md px-2 py-1 text-center text-xs"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={save}
              disabled={saving || (!isRitornoEdit && (!editing.team_home_id || !editing.team_away_id))}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
            >
              {saving ? "Salvataggio…" : "Salva"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
