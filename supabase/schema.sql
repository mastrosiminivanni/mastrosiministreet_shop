-- Archivio dei capi di Mastrosimini Street Shop.
-- Si incolla UNA volta nel pannello Supabase: SQL Editor -> New query -> incolla tutto -> Run.
-- Dopo, aggiungi le email che possono entrare nel pannello (vedi in fondo).

-- Chi può entrare nel pannello admin
create table if not exists public.admins (
  email text primary key
);

-- Vero se la persona collegata è un'admin abilitata
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- I capi
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text,
  price integer not null check (price >= 0),
  sizes text[] not null default '{}',
  measurements jsonb not null default '{}'::jsonb,
  images text[] not null default '{}',            -- percorsi nel bucket "capi" (la foto piccola ha il suffisso -s)
  alt_texts text[] not null default '{}',
  stock integer not null default 1 check (stock >= 0),
  initial_stock integer,
  market_pickup text[] not null default '{}',
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- Sicurezza: il pubblico vede solo i capi pubblicati o venduti; solo le admin scrivono
alter table public.admins enable row level security;
alter table public.products enable row level security;

drop policy if exists "admin vede la propria riga" on public.admins;
create policy "admin vede la propria riga" on public.admins for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "il pubblico vede i capi pubblicati" on public.products;
create policy "il pubblico vede i capi pubblicati" on public.products for select to anon, authenticated
  using (status in ('published', 'sold'));

drop policy if exists "le admin gestiscono i capi" on public.products;
create policy "le admin gestiscono i capi" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Foto: bucket pubblico "capi" (tutti le vedono, solo le admin caricano)
insert into storage.buckets (id, name, public) values ('capi', 'capi', true) on conflict (id) do nothing;

drop policy if exists "foto visibili a tutti" on storage.objects;
create policy "foto visibili a tutti" on storage.objects for select to anon, authenticated
  using (bucket_id = 'capi');

drop policy if exists "le admin caricano foto" on storage.objects;
create policy "le admin caricano foto" on storage.objects for insert to authenticated
  with check (bucket_id = 'capi' and public.is_admin());

drop policy if exists "le admin modificano foto" on storage.objects;
create policy "le admin modificano foto" on storage.objects for update to authenticated
  using (bucket_id = 'capi' and public.is_admin());

drop policy if exists "le admin cancellano foto" on storage.objects;
create policy "le admin cancellano foto" on storage.objects for delete to authenticated
  using (bucket_id = 'capi' and public.is_admin());

-- ULTIMO PASSO: scrivi qui sotto le email che possono entrare (togli i due trattini davanti e metti la tua), poi Run.
-- insert into public.admins (email) values ('la-tua-email@esempio.it');
