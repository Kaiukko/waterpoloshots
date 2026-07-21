"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/upload";
import { Match, Team, Venue, Player, MatchScorer } from "@/lib/types";
import Modal from "./Modal";

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

      // Genera automaticamente la partita di ritorno con squadre invertite
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

    // Salva i marcatori: sostituisce le righe esistenti per questa partita
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

  const teamName = (id: string | null | undefined) => teams.find((t) => t.id === id)?.name ?? "TBD";

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
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-black italic">Partite</h2>
        <button
          onClick={() => openEdit({ leg: "Andata", status: "Programmata" })}
          disabled={teams.length < 2}
          className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-40"
        >
          + Nuova (Andata)
        </button>
      </div>
      <p className="mb-4 text-xs text-outline">
        Ogni partita di andata genera automaticamente il ritorno con le squadre invertite: dovrai solo
        aggiungere data, ora e piscina quando lo modifichi.
      </p>

      <div className="space-y-2">
        {sorted.map((m) => (
          <div key={m.id} className="card-surface rounded-xl p-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-outline">
              <span>
                {m.leg}
                {m.matchday ? ` · Giornata ${m.matchday}` : ""}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 font-bold ${
                  m.status === "In Corso"
                    ? "bg-primary/20 text-primary"
                    : m.status === "Terminata"
                    ? "bg-gold/20 text-gold"
                    : "bg-white/10 text-on-surface-variant"
                }`}
              >
                {m.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{teamName(m.team_home_id)}</span>
              <span className="font-display text-gold">
                {m.score_home ?? "-"} : {m.score_away ?? "-"}
              </span>
              <span>{teamName(m.team_away_id)}</span>
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <button onClick={() => openEdit(m)} className="text-xs font-semibold text-gold">
                Modifica
              </button>
              <button onClick={() => remove(m.id)} className="text-xs font-semibold text-primary">
                Elimina
              </button>
            </div>
          </div>
        ))}
        {matches.length === 0 && <p className="text-sm text-outline">Nessuna partita ancora.</p>}
      </div>

      {editing && (
        <Modal
          title={editing.id ? `Modifica Partita (${editing.leg})` : "Nuova Partita di Andata"}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Giornata</label>
              <input
                type="number"
                value={editing.matchday ?? ""}
                onChange={(e) => setEditing({ ...editing, matchday: Number(e.target.value) })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                placeholder="es. 1"
              />
            </div>

            {isRitornoEdit ? (
              <div className="rounded-lg bg-surface2 p-3 text-sm font-semibold">
                {teamName(editing.team_home_id)} vs {teamName(editing.team_away_id)}
                <p className="mt-1 text-xs font-normal text-outline">
                  Squadre invertite automaticamente dall&apos;andata. Aggiungi solo data, ora e piscina.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Squadra Casa</label>
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
                  <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Squadra Ospite</label>
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
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Piscina</label>
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
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Data</label>
                <input
                  type="date"
                  value={editing.match_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, match_date: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Orario</label>
                <input
                  type="time"
                  value={editing.match_time ?? ""}
                  onChange={(e) => setEditing({ ...editing, match_time: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Stato</label>
              <div className="flex gap-2">
                {(["Programmata", "In Corso", "Terminata"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setEditing({ ...editing, status: s })}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                      editing.status === s ? "bg-primary text-white" : "bg-surface2 text-on-surface-variant"
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
                  <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Gol Casa</label>
                  <input
                    type="number"
                    value={editing.score_home ?? ""}
                    onChange={(e) => setEditing({ ...editing, score_home: Number(e.target.value) })}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Gol Ospite</label>
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
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Tempo di gioco</label>
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
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Marcatori</label>
                {rosterForModal.length === 0 ? (
                  <p className="text-xs text-outline">
                    Nessun giocatore in rosa per le squadre selezionate. Aggiungili dalla scheda Giocatori.
                  </p>
                ) : (
                  <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg bg-surface2 p-2">
                    {rosterForModal.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 rounded-lg bg-base px-2 py-1.5">
                        <span className="flex-1 text-xs font-semibold">
                          {p.cap_number ? `#${p.cap_number} ` : ""}
                          {p.name}
                          <span className="ml-1 text-[10px] font-normal text-outline">
                            ({teamName(p.team_id)})
                          </span>
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
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "Salvataggio…" : "Salva"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
