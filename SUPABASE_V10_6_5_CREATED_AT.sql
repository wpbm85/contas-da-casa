-- CONTAS DA CASA v10.6.5
-- Adiciona timestamp de criação para ordenar lançamentos do mesmo dia do mais novo para o mais antigo.
-- Seguro para rodar mais de uma vez.

alter table public.lancamentos
  add column if not exists created_at timestamptz not null default now();

create index if not exists lancamentos_data_created_at_idx
  on public.lancamentos (data desc, created_at desc);
