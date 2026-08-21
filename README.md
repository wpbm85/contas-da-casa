# CONTAS DA CASA — v10.6.5

Mudanças:
- LANÇAMENTOS agora são ordenados por data decrescente;
- dentro do mesmo dia, o lançamento criado mais recentemente aparece primeiro;
- cada DESPESA mostra uma segunda linha: TOTAL <CATEGORIA> · R$ ...
  usando o total mensal da categoria no item 3;
- receitas e terceiros não exibem essa linha de categoria;
- privacidade continua mascarando também o novo total.

Para garantir a ordem de criação dentro do mesmo dia, execute UMA VEZ:
`SUPABASE_V10_6_5_CREATED_AT.sql`

O SQL apenas adiciona `created_at` se ainda não existir e cria um índice.
