import type { Metadata } from "next";
import { Anybody } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

const anybody = Anybody({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-anybody" });

export const metadata: Metadata = {
  title: "Campionato di Serie B — Pallanuoto Maschile",
  description: "Il campionato di Serie B di pallanuoto maschile: calendario, risultati e classifiche live.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await supabase.from("app_settings").select("*").single();
  const primary = settings?.primary_color || "#e60000";
  const secondary = settings?.secondary_color || "#ffb800";

  return (
    <html lang="it" className={anybody.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="phoenix-bg min-h-screen bg-background pb-24 text-on-background">
        <style>{`:root{--color-primary:${primary};--color-secondary:${secondary};}`}</style>
        <Header title={settings?.tournament_title || "Campionato di Serie B"} logoUrl={settings?.logo_url} />
        <div className="pt-16">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
