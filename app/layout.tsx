import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const display = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Campionato di Serie B — Pallanuoto Maschile",
  description: "Il campionato di Serie B di pallanuoto maschile: calendario, risultati e classifiche live.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await supabase.from("app_settings").select("*").single();
  const primary = settings?.primary_color || "#E10600";
  const secondary = settings?.secondary_color || "#D4AF37";

  return (
    <html lang="it" className={`${display.variable} ${body.variable}`}>
      <body className="font-body pb-20">
        <style>{`:root{--color-primary:${primary};--color-secondary:${secondary};}`}</style>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
