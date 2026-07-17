"use client";
import { useState } from "react";

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

  const base =
    "inline-flex items-center gap-1.5 rounded-full font-semibold transition active:scale-95 shrink-0";
  const styles =
    variant === "footer"
      ? "px-3.5 py-1.5 text-xs bg-primary text-white"
      : variant === "compact"
      ? "px-2 py-1 text-[11px] bg-white/10 text-white"
      : "px-3 py-1.5 text-xs bg-white/10 text-white";

  return (
    <button onClick={handleShare} className={`${base} ${styles}`}>
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copiato!
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v9M8 8l4-4 4 4M5 15v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Condividi
        </>
      )}
    </button>
  );
}
