-- ============================================================
-- Waterpolo Summer Cup — Schema Supabase completo
-- Esegui questo file nel SQL Editor di Supabase (o via CLI)
-- su un progetto nuovo per replicare l'ambiente.
-- ============================================================

-- Impostazioni torneo (riga singola, branding dinamico)
create table if not exists app_settings (
  id boolean primary key default true,
  tournament_title text default 'Waterpolo Summer Cup',
  tournament_subtitle text default 'Sport Project Bari',
  logo_url text,
  primary_color text default '#E10600',
  secondary_color text default '#D4AF37',
  home_background_url text,
  header_background_url text,
  current_stage_number int default 1,
  current_stage_name text default 'Fase a Gironi',
  updated_at timestamptz default now(),
  constraint single_row check (id = true)
);
insert into app_settings (id) values (true) on conflict do nothing;

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tags text[] default '{}',
  address text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  group_name text check (group_name in ('A','B')) not null default 'A',
  created_at timestamptz default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  cap_number int,
  photo_url text,
  role text,
  goals int default 0,
  created_at timestamptz default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  stage_number int not null default 1,
  group_name text check (group_name in ('A','B','Finali')) not null default 'A',
  bracket_round text check (bracket_round in ('quarti','semifinali','finale_1_2','finale_3_4','finale_5_6','finale_7_8')),
  bracket_slot int,
  team_home_id uuid references teams(id),
  team_away_id uuid references teams(id),
  venue_id uuid references venues(id),
  match_date date,
  match_time time,
  status text check (status in ('Programmata','In Corso','Terminata')) default 'Programmata',
  score_home int,
  score_away int,
  period_info text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table app_settings enable row level security;
alter table venues enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table activity_log enable row level security;

-- Lettura pubblica (frontend senza login)
create policy "public read app_settings" on app_settings for select using (true);
create policy "public read venues" on venues for select using (true);
create policy "public read teams" on teams for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read activity_log" on activity_log for select using (true);

-- Scrittura riservata agli utenti autenticati (admin)
create policy "auth write app_settings" on app_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write venues" on venues for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write teams" on teams for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write players" on players for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write matches" on matches for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write activity_log" on activity_log for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage: bucket pubblici per loghi, foto giocatori, immagini branding
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('players', 'players', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('branding', 'branding', true) on conflict do nothing;

drop policy if exists "public read logos" on storage.objects;
drop policy if exists "auth write logos" on storage.objects;
drop policy if exists "auth update logos" on storage.objects;
drop policy if exists "auth delete logos" on storage.objects;

create policy "public read logos" on storage.objects for select using (bucket_id in ('logos','players','branding'));
create policy "auth write logos" on storage.objects for insert with check (bucket_id in ('logos','players','branding') and auth.role() = 'authenticated');
create policy "auth update logos" on storage.objects for update using (bucket_id in ('logos','players','branding') and auth.role() = 'authenticated');
create policy "auth delete logos" on storage.objects for delete using (bucket_id in ('logos','players','branding') and auth.role() = 'authenticated');

-- ============================================================
-- Utente amministratore (email/password, Supabase Auth)
-- Sostituisci email e password prima di eseguire, poi esegui
-- questo blocco UNA SOLA VOLTA.
-- ============================================================
do $$
declare
  new_user_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
    'admin@example.com', crypt('CAMBIA-QUESTA-PASSWORD', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', ''
  );

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_user_id, new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'admin@example.com'),
    'email', now(), now(), now()
  );
end $$;
