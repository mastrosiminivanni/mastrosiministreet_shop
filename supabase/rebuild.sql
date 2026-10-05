-- PUBBLICAZIONE AUTOMATICA DEL SITO
-- Quando nel pannello pubblichi, cambi o togli un capo, Supabase avvisa GitHub e il sito si ricostruisce da solo (circa 2 minuti).
--
-- Si incolla in Supabase: SQL Editor -> New query. Sono 3 pezzi, uno alla volta, ognuno con il suo Run.
-- Il token GitHub (github_pat_...) lo incolli SOLO nel PEZZO 2, al posto di INCOLLA-QUI-IL-TOKEN. Non mandarlo a nessuno.


-- ==================== PEZZO 1: abilita le chiamate verso GitHub ====================
create extension if not exists pg_net with schema extensions;


-- ==================== PEZZO 2: metti il token nel caveau di Supabase ====================
-- (cambia solo la parte tra apici; deve restare tra apici)
select vault.create_secret('INCOLLA-QUI-IL-TOKEN', 'github_dispatch_token');


-- ==================== PEZZO 3: il "pulsante" che avvia la pubblicazione ====================
create or replace function public.rebuild_site() returns trigger
language plpgsql security definer set search_path = public, extensions, vault as $$
declare
  tok text;
begin
  select decrypted_secret into tok from vault.decrypted_secrets where name = 'github_dispatch_token' limit 1;
  if tok is null then
    return null; -- niente token salvato: non fa nulla
  end if;
  perform net.http_post(
    url := 'https://api.github.com/repos/mastrosiminivanni/mastrosiministreet_shop/actions/workflows/pages.yml/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || tok,
      'Accept', 'application/vnd.github+json',
      'X-GitHub-Api-Version', '2022-11-28',
      'User-Agent', 'supabase-mastrosimini',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('ref', 'main')
  );
  return null;
end $$;

-- Nessuno dall'esterno può chiamarla a mano: la usano solo i trigger qui sotto
revoke all on function public.rebuild_site() from public, anon, authenticated;

-- Si pubblica solo quando cambia qualcosa che si vede sul sito (capi pubblicati o venduti); le bozze non fanno nulla
drop trigger if exists rebuild_on_insert on public.products;
create trigger rebuild_on_insert after insert on public.products
  for each row when (new.status <> 'draft') execute function public.rebuild_site();

drop trigger if exists rebuild_on_update on public.products;
create trigger rebuild_on_update after update on public.products
  for each row when (
    (old.status <> 'draft' or new.status <> 'draft')
    and (to_jsonb(old) - 'updated_at') is distinct from (to_jsonb(new) - 'updated_at')
  ) execute function public.rebuild_site();

drop trigger if exists rebuild_on_delete on public.products;
create trigger rebuild_on_delete after delete on public.products
  for each row when (old.status <> 'draft') execute function public.rebuild_site();

-- Se cambia il link Vinted nel pannello, anche il sito si ripubblica
drop trigger if exists rebuild_on_settings on public.settings;
create trigger rebuild_on_settings after insert or update or delete on public.settings
  for each row execute function public.rebuild_site();
