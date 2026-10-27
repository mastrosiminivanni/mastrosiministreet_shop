-- AGENTE VINTED: tiene il conto di quali annunci Vinted sono già nello shop.
-- Un capo dello shop può avere più annunci Vinted (lo stesso articolo caricato più volte, una taglia per annuncio).
--
-- Si incolla in Supabase: SQL Editor -> New query -> Run. Si fa una volta sola.
create table if not exists public.vinted_items (
  item_id bigint primary key,                                   -- numero dell'annuncio su Vinted
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  url text not null,
  price numeric,
  open boolean not null default true,                           -- false = venduto o tolto da Vinted
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index if not exists vinted_items_product on public.vinted_items(product_id);

-- Nessuna regola di lettura: la tabella la usa solo l'agente (chiave service_role), il pubblico non la vede.
alter table public.vinted_items enable row level security;
