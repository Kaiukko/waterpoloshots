"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/upload";
import { Settings } from "@/lib/types";
import ImagePicker from "./ImagePicker";

export default function AdminSettings({ settings, reload }: { settings: Settings | null; reload: () => void }) {
  const [form, setForm] = useState<Settings | null>(settings);
  const [saving, setSaving] = useState(false);

  if (!form) return <p className="text-sm text-muted">Caricamento impostazioni…</p>;

  async function save() {
    if (!form) return;
    setSaving(true);
    await supabase
      .from("app_settings")
      .update({
        tournament_title: form.tournament_title,
        tournament_subtitle: form.tournament_subtitle,
        logo_url: form.logo_url,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        home_background_url: form.home_background_url,
        header_background_url: form.header_background_url,
      })
      .eq("id", true);
    await logActivity("Impostazioni del torneo aggiornate");
    setSaving(false);
    reload();
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-bold">Personalizzazione &amp; Branding</h2>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted-2">Titolo torneo</label>
        <input
          value={form.tournament_title}
          onChange={(e) => setForm({ ...form, tournament_title: e.target.value })}
          className="w-full rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted-2">Sottotitolo</label>
        <input
          value={form.tournament_subtitle}
          onChange={(e) => setForm({ ...form, tournament_subtitle: e.target.value })}
          className="w-full rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <ImagePicker
        bucket="branding"
        value={form.logo_url}
        onChange={(url) => setForm({ ...form, logo_url: url })}
        label="Logo ufficiale Sport Project"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-2">Colore primario</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              className="h-9 w-12 rounded-lg border border-border bg-transparent"
            />
            <input
              value={form.primary_color}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-2">Colore secondario</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.secondary_color}
              onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
              className="h-9 w-12 rounded-lg border border-border bg-transparent"
            />
            <input
              value={form.secondary_color}
              onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <ImagePicker
        bucket="branding"
        value={form.home_background_url}
        onChange={(url) => setForm({ ...form, home_background_url: url })}
        label="Immagine sfondo Home"
      />
      <ImagePicker
        bucket="branding"
        value={form.header_background_url}
        onChange={(url) => setForm({ ...form, header_background_url: url })}
        label="Immagine sfondo Header"
      />

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
      >
        {saving ? "Salvataggio…" : "Salva Impostazioni"}
      </button>
    </div>
  );
}
