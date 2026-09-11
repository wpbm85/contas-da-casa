# CONTAS DA CASA — v11.0 VISUAL REDESIGN

Redesign visual inspirado no design system do app Roteiro:
- Plus Jakarta Sans
- paleta slate + azul
- cards limpos, bordas sutis
- botões, inputs e modais modernizados
- tema escuro alinhado
- Font Awesome nos ícones funcionais e categorias exibidas
- nenhuma alteração de Supabase ou lógica financeira

## Segurança (leia antes de subir novos arquivos)

Este repositório é público, como exige o GitHub Pages no plano gratuito.
Isso é normal para o **código do app** — mas nunca suba aqui arquivos com
dados financeiros reais (histórico, exports, backups).

- Scripts de importação de histórico (com valores reais de gastos/salário)
  rodam **uma única vez, direto no SQL Editor do Supabase**, a partir de um
  arquivo mantido só localmente. Nunca commitados.
- O `.gitignore` deste repositório bloqueia por nome (`*PRIVADO*`,
  `historico_*.json`, `historico_*.sql`, `contas_*.xlsx`, `.env`) qualquer
  arquivo desse tipo, mas a melhor proteção continua sendo nunca colocar
  esses arquivos dentro desta pasta.
- A chave do Supabase em `app.js` é a chave pública ("publishable"), feita
  para ser exposta — a segurança real vem do RLS habilitado nas tabelas
  `lancamentos` e `historico_mensal`, restrito a usuários autenticados, e do
  cadastro de novos usuários desativado no painel do Supabase.
