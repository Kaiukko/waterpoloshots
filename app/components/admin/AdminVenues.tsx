"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/upload";
import { Venue } from "@/lib/types";
import Modal from "./Modal";

export default function AdminVenues({ venues, reload }: { venues: Venue[]; reload: () => void }) {
  const [editing, setEditing] = useState<(Partial<Venue> & { tagsText?: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing?.name) return;
    setSaving(true);
    const tags = (editing.tagsText ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      name: editing.name,
      tags,
      address: editing.address ?? null,
      lat: editing.lat ?? null,
      lng: editing.lng ?? null,
    };
    if (editing.id) {
      await supabase.from("venues").update(payload).eq("id", editing.id);
      await logActivity(`Sede modificata: ${editing.name}`);
    } else {
      await supabase.from("venues").insert(payload);
      await logActivity(`Nuova sede aggiunta: ${editing.name}`);
    }
    setSaving(false);
    setEditing(null);
    reload();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Eliminare la sede "${name}"?`)) return;
    await supabase.from("venues").delete().eq("id", id);
    await logActivity(`Sede eliminata: ${name}`);
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-black italic">Piscine &amp; Campi</h2>
        <button
          onClick={() => setEditing({})}
          className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white"
        >
          + Nuova
        </button>
      </div>

      <div className="space-y-2">
        {venues.map((v) => (
          <div key={v.id} className="card-surface rounded-xl p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold">{v.name}</div>
                {v.address && <div className="text-xs text-outline">{v.address}</div>}
                {v.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {v.tags.map((t) => (
                      <span key={t} className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => setEditing({ ...v, tagsText: v.tags.join(", ") })}
                  className="text-xs font-semibold text-gold"
                >
                  Modifica
                </button>
                <button onClick={() => remove(v.id, v.name)} className="text-xs font-semibold text-primary">
                  Elimina
                </button>
              </div>
            </div>
          </div>
        ))}
        {venues.length === 0 && <p className="text-sm text-outline">Nessuna sede ancora.</p>}
      </div>

      {editing && (
        <Modal title={editing.id ? "Modifica Sede" : "Nuova Sede"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Nome sede</label>
              <input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                placeholder="es. Stadio del Nuoto"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Indirizzo</label>
              <input
                value={editing.address ?? ""}
                onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Latitudine</label>
                <input
                  type="number"
                  step="any"
                  value={editing.lat ?? ""}
                  onChange={(e) => setEditing({ ...editing, lat: Number(e.target.value) })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Longitudine</label>
                <input
                  type="number"
                  step="any"
                  value={editing.lng ?? ""}
                  onChange={(e) => setEditing({ ...editing, lng: Number(e.target.value) })}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Tag (separati da virgola)</label>
              <input
                value={editing.tagsText ?? ""}
                onChange={(e) => setEditing({ ...editing, tagsText: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                placeholder="es. Piscina Olimpionica, Coperta"
              />
            </div>
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
