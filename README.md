# Waterpolo Summer Cup — Sport Project Bari

App full-stack (Next.js + Supabase) per la gestione del torneo Waterpolo Summer Cup.
Tema "Championship Dark" (nero, rosso, oro), branding dinamico, calendario, classifiche,
tabellone finali 1°-8°, e pannello admin completo.

## Stato attuale

Il progetto **è già collegato e funzionante** su un progetto Supabase reale:

- **URL progetto:** `https://bcyeeduhgdcxblkuknyx.supabase.co`
- **Chiave anon (pubblica):** già inserita in `lib/supabase.ts` (sicura da esporre, protetta da Row Level Security)
- **Schema database:** già applicato (tabelle, RLS, storage bucket)
- **Utente admin già creato:**
  - Email: `kaiuk@libero.it`
  - Password: `kaiuk2026`
  - ⚠️ Consigliato cambiarla dal pannello Supabase → Authentication → Users, dopo il primo accesso.

Se invece vuoi ripartire da un **progetto Supabase nuovo**, trovi lo schema completo pronto
in `supabase/schema.sql`: incollalo nello SQL Editor di Supabase (modificando email/password
dell'admin in fondo al file), poi aggiorna `SUPABASE_URL` e `SUPABASE_ANON_KEY` in `lib/supabase.ts`
con quelli del tuo nuovo progetto (Project Settings → API).

## Deploy su Vercel

1. Estrai lo zip e apri un terminale nella cartella del progetto
2. `npm install`
3. `npm run build` (verifica che compili senza errori)
4. Collega il progetto a Vercel:
   - Via CLI: `npx vercel` (segui la procedura guidata, poi `npx vercel --prod`)
   - Oppure: carica la cartella su GitHub e importa il repo da vercel.com/new
5. Non servono variabili d'ambiente aggiuntive: le chiavi Supabase sono già nel codice
   (`lib/supabase.ts`), essendo la chiave anon pubblica per design.

## Struttura del progetto

```
app/
  page.tsx              → Home (hero, live, prossime partite, risultati)
  calendario/page.tsx    → Calendario filtrabile per tappa/girone + ricerca
  classifiche/page.tsx   → Classifiche gironi, circuito, marcatori
  finali/page.tsx        → Tabellone eliminazione diretta 1°-8°
  admin/page.tsx         → Pannello admin (login + gestione completa)
  layout.tsx, globals.css
components/
  MatchCard, BottomNav, ShareButton
  admin/                 → componenti CRUD (Squadre, Giocatori, Partite, Sedi, Impostazioni)
lib/
  supabase.ts            → client Supabase (URL + anon key)
  types.ts                → tipi TypeScript condivisi
  standings.ts            → algoritmo classifiche + generazione tabellone quarti
  data.ts                  → hook di fetching dati realtime
  upload.ts                → upload immagini su Storage + log attività
supabase/
  schema.sql              → schema SQL completo (tabelle, RLS, storage, utente admin)
```

## Note tecniche

- **Realtime:** tutte le pagine pubbliche e l'admin si aggiornano automaticamente via
  Supabase Realtime (nessun refresh manuale necessario).
- **Tabellone finali:** dal pannello admin (tab "Partite") il pulsante "Genera Tabellone"
  crea automaticamente i quarti di finale incrociando i primi 4 classificati di ciascun
  girone (1A-4B, 2A-3B, 2B-3A, 1B-4A). Semifinali e finali di piazzamento (1°-2°, 3°-4°,
  5°-6°, 7°-8°) si aggiungono manualmente selezionando "Finali" come girone e il turno
  corrispondente, una volta noti i vincitori dei turni precedenti.
- **Branding dinamico:** i colori impostati in Admin → Impostazioni vengono iniettati come
  variabili CSS (`--color-primary`, `--color-secondary`) e si applicano istantaneamente a
  tutta l'interfaccia pubblica.
- **Condivisione:** i pulsanti di condivisione usano la Web Share API dove disponibile,
  con fallback automatico a copia negli appunti + feedback "Copiato!".
