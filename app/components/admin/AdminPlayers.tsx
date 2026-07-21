"use client";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/upload";
import { goalsByPlayer } from "@/lib/data";
import { Player, Team, MatchScorer, WATERPOLO_ROLES } from "@/lib/types";
import Modal from "./Modal";
import ImagePicker from "./ImagePicker";

export default function AdminPlayers({
  players,
  teams,
  scorers,
  reload,
}: {
  players: Player[];
  teams: Team[];
  scorers: MatchScorer[];
  reload: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Player> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterTeam, setFilterTeam] = useState<string>("all");

  const goalsMap = useMemo(() => goalsByPlayer(scorers), [scorers]);

  async function save() {
    if (!editing?.name || !editing.team_id) return;
    setSaving(true);
    const payload = {
      name: editing.name,
      team_id: editing.team_id,
      cap_number: editing.cap_number ?? null,
      photo_url: editing.photo_url ?? null,
      role: editing.role ?? null,
    };
    if (editing.id) {
      await supabase.from("players").update(payload).eq("id", editing.id);
      await logActivity(`Giocatore modificato: ${editing.name}`);
    } else {
      await supabase.from("players").insert(payload);
      await logActivity(`Nuovo giocatore aggiunto: ${editing.name}`);
    }
    setSaving(false);
    setEditing(null);
    reload();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Eliminare il giocatore "${name}"?`)) return;
    await supabase.from("players").delete().eq("id", id);
    await logActivity(`Giocatore eliminato: ${name}`);
    reload();
  }

  const visible = players.filter((p) => filterTeam === "all" || p.team_id === filterTeam);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-black italic">Giocatori</h2>
        <button
          onClick={() => setEditing({ team_id: teams[0]?.id })}
          disabled={teams.length === 0}
          className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-40"
        >
          + Nuovo
        </button>
      </div>

      <select
        value={filterTeam}
        onChange={(e) => setFilterTeam(e.target.value)}
        className="mb-3 w-full rounded-lg px-3 py-2 text-sm"
      >
        <option value="all">Tutte le squadre</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <p className="mb-3 text-xs text-outline">
        I gol segnati si aggiornano automaticamente dai marcatori inseriti in ogni partita
        (scheda Partite) e non sono modificabili qui direttamente.
      </p>

      <div className="space-y-2">
        {visible.map((p) => (
          <div key={p.id} className="card-surface flex items-center gap-3 rounded-xl p-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-surface2">
              {p.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {p.cap_number ? `#${p.cap_number} ` : ""}
                {p.name}
              </div>
              <div className="text-xs text-outline">
                {teams.find((t) => t.id === p.team_id)?.name} · {p.role ?? "—"} · {goalsMap.get(p.id) ?? 0} gol
              </div>
            </div>
            <button onClick={() => setEditing(p)} className="text-xs font-semibold text-gold">
              Modifica
            </button>
            <button onClick={() => remove(p.id, p.name)} className="text-xs font-semibold text-primary">
              Elimina
            </button>
          </div>
        ))}
        {visible.length === 0 && <p className="text-sm text-outline">Nessun giocatore ancora.</p>}
      </div>

      {editing && (
        <Modal title={editing.id ? "Modifica Giocatore" : "Nuovo Giocatore"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <ImagePicker
              bucket="players"
              value={editing.photo_url ?? null}
              onChange={(url) => setEditing({ ...editing, photo_url: url })}
              label="Foto giocatore"
              round
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Nome e cognome</label>
              <input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Numero calottina</label>
              <input
                type="number"
                value={editing.cap_number ?? ""}
                onChange={(e) => setEditing({ ...editing, cap_number: Number(e.target.value) })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Ruolo</label>
              <select
                value={editing.role ?? ""}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Seleziona ruolo</option>
                {WATERPOLO_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Squadra</label>
              <select
                value={editing.team_id ?? ""}
                onChange={(e) => setEditing({ ...editing, team_id: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={save}
              disabled={saving || !editing.name || !editing.team_id}
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
