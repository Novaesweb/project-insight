# Novaes Web - Painel Administrativo

Painel administrativo para gestao de clientes, projetos, financeiro, contratos e operacao digital. O projeto usa React, TypeScript, Tailwind CSS e Supabase.

## Inicio rapido

### Desenvolvimento local

```bash
# 1. Clone o repositorio
git clone https://github.com/Novaesweb/project-insight.git
cd project-insight

# 2. Instale as dependencias
npm install

# 3. Configure o ambiente
cp .env.example .env

# 4. Inicie o projeto
npm run dev
```

O app fica disponivel em `http://localhost:8080`.

## Variaveis de ambiente

Copie `.env.example` para `.env` e confirme estes valores publicos do Supabase:

```env
VITE_SUPABASE_PROJECT_ID=mvxlbvfryzmocrafhfjp
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Xw4VPjd7bgJXobOqmfL4Gw_lf4IbGC_
VITE_SUPABASE_URL=https://mvxlbvfryzmocrafhfjp.supabase.co
SUPABASE_URL=https://mvxlbvfryzmocrafhfjp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Use a `SUPABASE_SERVICE_ROLE_KEY` somente em ambientes seguros de backend e Edge Functions.

## Scripts

| Script | Descricao |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera o build de producao |
| `npm run preview` | Abre o preview do build |
| `npm run lint` | Executa o ESLint |
| `npm run test` | Executa os testes |
| `npm run test:e2e` | Executa os testes end-to-end |

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase
- TanStack Query
- PWA
- Electron

## Estrutura do projeto

```text
src/
  components/      Componentes reutilizaveis
  features/        Fluxos e modulos principais
  hooks/           Hooks customizados
  integrations/    Integracoes externas
  lib/             Regras de negocio e utilitarios
  pages/           Paginas da aplicacao

supabase/
  functions/       Edge Functions
  migrations/      Migracoes do banco
```

## Supabase

O projeto usa Supabase para:

- autenticacao
- banco relacional e realtime
- Edge Functions
- notificacoes push
- armazenamento de arquivos

## Deploy

1. Conecte o repositorio no provedor de deploy.
2. Configure as variaveis de ambiente.
3. Gere o build com `npm run build`.
4. Publique a branch desejada.

## Documentacao util

- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## Suporte

Para ajustes de infraestrutura do projeto, abra uma issue no repositorio ou continue a manutencao a partir deste workspace.

Ultima atualizacao: Abril 2026
