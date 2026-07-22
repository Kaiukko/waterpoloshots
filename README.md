# Campionato di Serie B — Pallanuoto Maschile

App full-stack (Next.js + Supabase) per la gestione del campionato di Serie B di pallanuoto
maschile. Girone all'italiana (Andata + Ritorno), tema "Championship Dark" (nero, rosso, oro),
branding dinamico, calendario, classifiche, schede squadra e pannello admin completo.

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
  page.tsx                 → Home (hero, live, prossime partite, risultati)
  calendario/page.tsx      → Calendario raggruppato per Giornata (Andata/Ritorno) + ricerca
  classifiche/page.tsx     → Classifica di Campionato + Classifica Marcatori (tab separate)
  squadre/page.tsx         → Elenco squadre con rosa (link alla scheda di ciascuna)
  squadre/[id]/page.tsx    → Scheda squadra: logo, nome, rosa completa
  giocatori/[id]/page.tsx  → Scheda giocatore: nome in grande, foto, calottina, squadra, gol
  admin/page.tsx           → Pannello admin (login + gestione completa)
  layout.tsx, globals.css
components/
  MatchCard, BottomNav, ShareButton
  admin/                    → componenti CRUD (Squadre, Giocatori, Partite, Sedi, Impostazioni)
lib/
  supabase.ts               → client Supabase (URL + anon key)
  types.ts                  → tipi TypeScript condivisi
  standings.ts               → algoritmo classifica (3/1/0 punti, spareggi)
  data.ts                     → hook di fetching dati realtime + calcolo gol per giocatore
  upload.ts                   → upload immagini su Storage + log attività
supabase/
  schema.sql                 → schema SQL completo (tabelle, RLS, storage, utente admin)
```

## Regole del campionato

- **Formato:** girone all'italiana, tutte le squadre si affrontano due volte (Andata e Ritorno).
- **Punti:** 3 per la vittoria, 1 per il pareggio, 0 per la sconfitta.
- **Spareggi in classifica:** 1) scontri diretti tra le squadre a pari punti, 2) differenza reti generale.
- **Generazione automatica del ritorno:** quando l'amministratore crea una partita di andata
  (squadre, data, ora, piscina), il sistema genera automaticamente la partita di ritorno con
  casa/fuori invertiti. L'amministratore dovrà solo aggiungere data, ora e piscina quando
  modifica quella partita.
- **Marcatori per partita:** dalla scheda di modifica di ogni partita (Admin → Partite) si
  possono assegnare i gol ai singoli giocatori delle due squadre. I gol totali di ogni
  giocatore (mostrati sulla sua scheda e nella Classifica Marcatori) si aggiornano automaticamente.
- **Schede pubbliche:** ogni squadra e ogni giocatore ha una scheda dedicata, visibile da
  tutti (`/squadre/[id]`, `/giocatori/[id]`) ma modificabile solo dall'amministratore tramite
  il pannello `/admin`.

## Identità visiva

L'interfaccia adotta un tema scuro moderno ispirato al riferimento *"Waterpolo Shots"*:
sfondo quasi nero con un leggero bagliore rosso sfumato in alto, rosso primario (#e5142b) e
oro secondario (#f0b429) personalizzabili da Admin → Impostazioni, card scure con angoli
arrotondati e bordi sottili, tipografia pulita (maiuscolo solo per le piccole etichette
"eyebrow"), icone lucide-react e bottom bar con icona attiva evidenziata da un alone colorato.

## Note tecniche

- **Realtime:** tutte le pagine pubbliche e l'admin si aggiornano automaticamente via
  Supabase Realtime (nessun refresh manuale necessario).
- **Branding dinamico:** i colori impostati in Admin → Impostazioni vengono iniettati come
  variabili CSS (`--color-primary`, `--color-secondary`) e si applicano istantaneamente a
  tutta l'interfaccia pubblica.
- **Condivisione:** i pulsanti di condivisione usano la Web Share API dove disponibile,
  con fallback automatico a copia negli appunti + feedback "Copiato!".
