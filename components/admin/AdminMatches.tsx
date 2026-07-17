"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/upload";
import { Match, Team, Venue, BracketRound } from "@/lib/types";
import { generateQuarterfinalPairings } from "@/lib/standings";
import Modal from "./Modal";

const BRACKET_ROUNDS: { value: BracketRound; label: string }[] = [
  { value: "quarti", label: "Quarti di Finale" },
  { value: "semifinali", label: "Semifinali" },
  { value: "finale_1_2", label: "Finale 1°-2°" },
  { value: "finale_3_4", label: "Finale 3°-4°" },
  { value: "finale_5_6", label: "Finale 5°-6°" },
  { value: "finale_7_8", label: "Finale 7°-8°" },
];

export default function AdminMatches({
  matches,
  teams,
  venues,
  reload,
}: {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  reload: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Match> | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function save() {
    if (!editing?.team_home_id || !editing.team_away_id) return;
    setSaving(true);
    const payload = {
      stage_number: editing.stage_number ?? 1,
      group_name: editing.group_name ?? "A",
      bracket_round: editing.group_name === "Finali" ? editing.bracket_round ?? null : null,
      bracket_slot: editing.group_name === "Finali" ? editing.bracket_slot ?? null : null,
      team_home_id: editing.team_home_id,
      team_away_id: editing.team_away_id,
      venue_id: editing.venue_id ?? null,
      match_date: editing.match_date ?? null,
      match_time: editing.match_time ?? null,
      status: editing.status ?? "Programmata",
      score_home: editing.score_home ?? null,
      score_away: editing.score_away ?? null,
      period_info: editing.period_info ?? null,
    };
    if (editing.id) {
      await supabase.from("matches").update(payload).eq("id", editing.id);
      await logActivity(`Partita aggiornata`);
    } else {
      await supabase.from("matches").insert(payload);
      await logActivity(`Nuova partita programmata`);
    }
    setSaving(false);
    setEditing(null);
    reload();
  }

  async function remove(id: string) {
    if (!confirm("Eliminare questa partita?")) return;
    await supabase.from("matches").delete().eq("id", id);
    await logActivity(`Partita eliminata`);
    reload();
  }

  async function generateBracket() {
    const existing = matches.filter((m) => m.bracket_round === "quarti");
    if (existing.length > 0 && !confirm("I quarti di finale sono già stati generati. Rigenerarli?")) return;
    const pairings = generateQuarterfinalPairings(teams, matches);
    if (!pairings) {
      alert("Servono almeno 4 squadre classificate in ciascun girone per generare i quarti.");
      return;
    }
    setGenerating(true);
    if (existing.length > 0) {
      await supabase
        .from("matches")
        .delete()
        .eq("bracket_round", "quarti");
    }
    await supabase.from("matches").insert(
      pairings.map((p) => ({
        stage_number: 2,
        group_name: "Finali",
        bracket_round: "quarti",
        bracket_slot: p.slot,
        team_home_id: p.home.id,
        team_away_id: p.away.id,
        status: "Programmata",
      }))
    );
    await logActivity("Tabellone quarti di finale generato automaticamente");
    setGenerating(false);
    reload();
  }

  const teamName = (id: string | null | undefined) => teams.find((t) => t.id === id)?.name ?? "TBD";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Partite</h2>
        <div className="flex gap-2">
          <button
            onClick={generateBracket}
            disabled={generating}
            className="rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold text-black disabled:opacity-50"
          >
            {generating ? "Generazione…" : "Genera Tabellone"}
          </button>
          <button
            onClick={() => setEditing({ stage_number: 1, group_name: "A", status: "Programmata" })}
            disabled={teams.length < 2}
            className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            + Nuova
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {matches.map((m) => (
          <div key={m.id} className="card-surface rounded-xl p-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-[#8A8A8E]">
              <span>
                Tappa {m.stage_number} · {m.group_name === "Finali" ? BRACKET_ROUNDS.find(r => r.value === m.bracket_round)?.label ?? "Finali" : `Girone ${m.group_name}`}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 font-bold ${
                  m.status === "In Corso"
                    ? "bg-primary/20 text-primary"
                    : m.status === "Terminata"
                    ? "bg-gold/20 text-gold"
                    : "bg-white/10 text-[#B8B8BC]"
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
              <button onClick={() => setEditing(m)} className="text-xs font-semibold text-gold">
                Modifica
              </button>
              <button onClick={() => remove(m.id)} className="text-xs font-semibold text-primary">
                Elimina
              </button>
            </div>
          </div>
        ))}
        {matches.length === 0 && <p className="text-sm text-[#8A8A8E]">Nessuna partita ancora.</p>}
      </div>

      {editing && (
        <Modal title={editing.id ? "Modifica Partita" : "Nuova Partita"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Tappa</label>
                <select
                  value={editing.stage_number ?? 1}
                  onChange={(e) => setEditing({ ...editing, stage_number: Number(e.target.value) })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                >
                  <option value={1}>Tappa 1</option>
                  <option value={2}>Tappa 2</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Girone</label>
                <select
                  value={editing.group_name ?? "A"}
                  onChange={(e) => setEditing({ ...editing, group_name: e.target.value as any })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                >
                  <option value="A">Girone A</option>
                  <option value="B">Girone B</option>
                  <option value="Finali">Finali</option>
                </select>
              </div>
            </div>

            {editing.group_name === "Finali" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Turno tabellone</label>
                <select
                  value={editing.bracket_round ?? ""}
                  onChange={(e) => setEditing({ ...editing, bracket_round: e.target.value as BracketRound })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Seleziona turno</option>
                  {BRACKET_ROUNDS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Squadra Casa</label>
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
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Squadra Ospite</label>
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

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Sede</label>
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
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Data</label>
                <input
                  type="date"
                  value={editing.match_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, match_date: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Orario</label>
                <input
                  type="time"
                  value={editing.match_time ?? ""}
                  onChange={(e) => setEditing({ ...editing, match_time: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Stato</label>
              <div className="flex gap-2">
                {(["Programmata", "In Corso", "Terminata"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setEditing({ ...editing, status: s })}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                      editing.status === s ? "bg-primary text-white" : "bg-surface2 text-[#B8B8BC]"
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
                  <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Gol Casa</label>
                  <input
                    type="number"
                    value={editing.score_home ?? ""}
                    onChange={(e) => setEditing({ ...editing, score_home: Number(e.target.value) })}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Gol Ospite</label>
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
                <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Tempo di gioco</label>
                <input
                  value={editing.period_info ?? ""}
                  onChange={(e) => setEditing({ ...editing, period_info: e.target.value })}
                  placeholder="es. 3° Tempo, 05:12"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            <button
              onClick={save}
              disabled={saving || !editing.team_home_id || !editing.team_away_id}
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
