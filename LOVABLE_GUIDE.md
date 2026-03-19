# Guia de Desenvolvimento - Novaes Web com Lovable

## Início Rápido

### Opção 1: Usar Lovable (Recomendado)
1. Acesse https://lovable.dev/projects/[SEU_PROJECT_ID]
2. Faça prompts em linguagem natural
3. As mudanças serão commitadas automaticamente

### Opção 2: Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/Novaesweb/novaesweb.git
cd novaesweb

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra no navegador
# O app estará disponível em http://localhost:8080
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento com hot reload
- `npm run build` - Build para produção
- `npm run build:dev` - Build em modo desenvolvimento
- `npm run preview` - Preview do build
- `npm run lint` - Verifica eslint
- `npm run test` - Roda testes
- `npm run test:watch` - Testes em modo watch

## Variáveis de Ambiente

Configure um arquivo `.env` na raiz do projeto:

```
VITE_SUPABASE_URL=seu_url_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
VITE_SUPABASE_PROJECT_ID=seu_project_id
```

## Estrutura do Projeto

```
src/
├── components/      # Componentes React reutilizáveis
│   ├── ui/         # Componentes shadcn/ui
│   └── site/       # Componentes específicos do site
├── pages/          # Páginas da aplicação
├── hooks/          # Custom React hooks
├── lib/            # Utilitários e helpers
├── assets/         # Imagens e outros assets
└── main.tsx        # Ponto de entrada
```

## Integração com Supabase

A aplicação utiliza Supabase para:
- Autenticação
- Banco de dados em tempo real
- Funções serverless
- Notificações push

## PWA (Progressive Web App)

O projeto inclui suporte a PWA com:
- Offline-first com Service Worker
- Instalação na tela inicial
- Sincronização em background

## Component Tagger

O plugin `lovable-tagger` está ativado em desenvolvimento para melhor integração com Lovable. Ele mantém rastreabilidade dos componentes editados.

## Fluxo de Trabalho Recomendado

1. **Planeje sua mudança** - Descreva o que você quer implementar
2. **Use Lovable** - Faça seu prompt
3. **Teste localmente** - Clone e teste as mudanças
4. **Push para GitHub** - As mudanças serão refletidas em Lovable

## Troubleshooting

### Porta 8080 já em uso?
```bash
npm run dev -- --port 3000
```

### Erro de dependências não instaladas?
```bash
npm install
# ou
npm ci
```

### Limpar cache
```bash
rm -rf node_modules dist
npm install
```

## Contato e Suporte

Para mais informações sobre Lovable, visite: https://lovable.dev
