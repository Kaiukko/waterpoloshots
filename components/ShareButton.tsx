"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({
  text,
  variant = "default",
}: {
  text: string;
  variant?: "default" | "footer" | "compact";
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? window.location.href : "";
    const payload = `${text}\n\n${url}`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ text: payload });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const base = "inline-flex items-center gap-1.5 rounded-full font-semibold transition active:scale-95 shrink-0";
  const styles =
    variant === "footer"
      ? "px-4 py-2 text-xs bg-primary text-on-primary"
      : variant === "compact"
      ? "p-1.5 text-muted hover:text-on-surface"
      : "px-3 py-1.5 text-xs bg-surface-2 text-on-surface border border-border";

  return (
    <button onClick={handleShare} className={`${base} ${styles}`}>
      {copied ? (
        <>
          <Check size={14} />
          {variant !== "compact" && "Copiato!"}
        </>
      ) : (
        <>
          <Share2 size={14} />
          {variant !== "compact" && "Condividi"}
        </>
      )}
    </button>
  );
}
