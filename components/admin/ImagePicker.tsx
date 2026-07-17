"use client";
import { useState } from "react";
import { uploadImage } from "@/lib/upload";

export default function ImagePicker({
  bucket,
  value,
  onChange,
  label,
  round = false,
}: {
  bucket: "logos" | "players" | "branding";
  value: string | null;
  onChange: (url: string) => void;
  label: string;
  round?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(bucket, file);
    setUploading(false);
    if (url) onChange(url);
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#B8B8BC]">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-surface2 border border-line ${
            round ? "rounded-full" : "rounded-lg"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-[#8A8A8E]">—</span>
          )}
        </div>
        <label className="cursor-pointer rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold">
          {uploading ? "Caricamento…" : "Scegli immagine"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}
