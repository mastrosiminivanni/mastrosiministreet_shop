-- Si incolla UNA volta in Supabase: SQL Editor -> New query -> incolla tutto -> Run.

-- Impostazioni del sito modificabili dal pannello (per ora: link al profilo Vinted)
create table if not exists public.settings (
  key text primary key,
  value text not null
);
alter table public.settings enable row level security;

drop policy if exists "il pubblico legge le impostazioni" on public.settings;
create policy "il pubblico legge le impostazioni" on public.settings for select to anon, authenticated using (true);

drop policy if exists "le admin gestiscono le impostazioni" on public.settings;
create policy "le admin gestiscono le impostazioni" on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.settings (key, value) values ('vinted_url', 'https://www.vinted.it/member/261904496-mastrosiminishop')
  on conflict (key) do nothing;
