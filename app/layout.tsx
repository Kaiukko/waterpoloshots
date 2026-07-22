import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Campionato di Serie B — Pallanuoto Maschile",
  description: "Il campionato di Serie B di pallanuoto maschile: calendario, risultati e classifiche live.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await supabase.from("app_settings").select("*").single();
  const primary = settings?.primary_color || "#e5142b";
  const secondary = settings?.secondary_color || "#f0b429";

  return (
    <html lang="it" className={inter.variable}>
      <body className="ambient-glow min-h-screen bg-background pb-24 text-on-surface">
        <style>{`:root{--color-primary:${primary};--color-secondary:${secondary};}`}</style>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
