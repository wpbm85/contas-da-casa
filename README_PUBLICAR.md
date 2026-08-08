# CONTAS DA CASA — v6 FINAL / PWA PÚBLICA SEM DADOS

## O que esta versão já resolve
- Nenhum histórico financeiro pessoal está embutido no código público.
- Descrição do gasto é opcional.
- O app funciona em computador e celular pelo mesmo endereço.
- Navegação mensal é contínua: dez/2026 → jan/2027 → fev/2027 e assim por diante.
- O bloco 6 · GRÁFICOS é dinâmico por ano:
  - estando em qualquer mês de 2026, mostra JAN–DEZ/2026;
  - estando em qualquer mês de 2027, mostra JAN–DEZ/2027;
  - e assim sucessivamente, sem limite de ano.
- O filtro do gráfico continua oferecendo TOTAL FAMÍLIA, CONTAS, ALICE, CASAL, W, C e FATURAS.
- Meses sem dados simplesmente ficam sem ponto no gráfico.
- PWA preparada para instalação no Android.
- Service worker com cache para uso básico após a primeira carga.

## PRIVACIDADE
Este ZIP pode ser publicado em um repositório público porque NÃO contém os valores históricos JAN–JUL.

NÃO publique:
`historico_2026_PRIVADO_nao_publicar.json`

Esse arquivo será usado posteriormente para importar JAN–JUL ao banco privado.

## AMANHÃ — PASSO A PASSO PARA PUBLICAR

### 1. Criar o repositório
No GitHub:
- New repository
- Nome sugerido: `contas-da-casa`
- Public
- Create repository

### 2. Enviar os arquivos
Extraia este ZIP no computador.
No repositório vazio:
- Add file > Upload files
- Arraste TODOS os arquivos extraídos deste ZIP para a página
- Commit changes

Importante: envie os arquivos diretamente para a raiz.
O `index.html` deve aparecer na página inicial do repositório, e não dentro de uma pasta.

### 3. Ligar o GitHub Pages
No repositório:
- Settings
- Pages
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)
- Save

Aguarde a URL HTTPS aparecer nessa mesma tela.

### 4. Testar no computador
Abra a URL fornecida pelo GitHub Pages.
Navegue entre os meses e teste um lançamento descartável.

### 5. Instalar no Android
Abra a mesma URL no Chrome do celular.
Menu ⋮ > Instalar app / Adicionar à tela inicial.
Confirme.

## IMPORTANTE: NESTA ETAPA AINDA NÃO HÁ SINCRONIZAÇÃO
A v6 pública ainda grava lançamentos no `localStorage` do navegador/aparelho.

Portanto:
- o PC terá sua própria base local;
- o celular W terá sua própria base local;
- o celular C terá sua própria base local.

Isso é apenas para confirmar que o PWA publicado e instalado funciona corretamente.

## PRÓXIMA ETAPA: BANCO PRIVADO
Depois do teste de instalação:
1. Criar o banco privado gratuito.
2. Criar autenticação para W e C.
3. Fazer PC + celular W + celular C usarem a mesma base.
4. Importar JAN–JUL/2026 do JSON privado.
5. Deixar o histórico fora do repositório público.
6. Manter as parcelas, recorrências, faturas e gráficos funcionando sobre a base compartilhada.


## AJUSTES v7
- Editar/excluir com botões.
- Categorias alfabéticas fora de CASAL.
- Exportar mês em CSV na ordem da planilha.
