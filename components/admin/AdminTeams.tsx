"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/upload";
import { Team } from "@/lib/types";
import Modal from "./Modal";
import ImagePicker from "./ImagePicker";

export default function AdminTeams({ teams, reload }: { teams: Team[]; reload: () => void }) {
  const [editing, setEditing] = useState<Partial<Team> | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing?.name) return;
    setSaving(true);
    if (editing.id) {
      await supabase
        .from("teams")
        .update({ name: editing.name, logo_url: editing.logo_url })
        .eq("id", editing.id);
      await logActivity(`Squadra modificata: ${editing.name}`);
    } else {
      await supabase.from("teams").insert({
        name: editing.name,
        logo_url: editing.logo_url ?? null,
      });
      await logActivity(`Nuova squadra aggiunta: ${editing.name}`);
    }
    setSaving(false);
    setEditing(null);
    reload();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Eliminare la squadra "${name}"? Verranno eliminati anche i suoi giocatori.`)) return;
    await supabase.from("teams").delete().eq("id", id);
    await logActivity(`Squadra eliminata: ${name}`);
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Squadre</h2>
        <button
          onClick={() => setEditing({})}
          className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white"
        >
          + Nuova
        </button>
      </div>

      <div className="space-y-2">
        {teams.map((t) => (
          <div key={t.id} className="card-surface flex items-center gap-3 rounded-xl p-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-surface2">
              {t.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.logo_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{t.name}</div>
            </div>
            <button onClick={() => setEditing(t)} className="text-xs font-semibold text-gold">
              Modifica
            </button>
            <button onClick={() => remove(t.id, t.name)} className="text-xs font-semibold text-primary">
              Elimina
            </button>
          </div>
        ))}
        {teams.length === 0 && <p className="text-sm text-[#8A8A8E]">Nessuna squadra ancora.</p>}
      </div>

      {editing && (
        <Modal title={editing.id ? "Modifica Squadra" : "Nuova Squadra"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">Nome squadra</label>
              <input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                placeholder="es. Como Nuoto"
              />
            </div>
            <ImagePicker
              bucket="logos"
              value={editing.logo_url ?? null}
              onChange={(url) => setEditing({ ...editing, logo_url: url })}
              label="Logo squadra"
            />
            <button
              onClick={save}
              disabled={saving || !editing.name}
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
