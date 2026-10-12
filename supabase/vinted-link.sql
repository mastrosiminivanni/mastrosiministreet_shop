-- LINK VINTED PER OGNI CAPO (facoltativo)
-- Nel pannello, ogni capo può avere il suo link Vinted: il pulsante "Acquista su Vinted" porta lì.
-- Se un capo non ha il link, il pulsante porta all'armadio generale (profilo Vinted).
--
-- Si incolla in Supabase: SQL Editor -> New query -> Run. Si fa una volta sola.
alter table public.products add column if not exists vinted_url text;
