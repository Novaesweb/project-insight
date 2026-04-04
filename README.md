# Novaes Web - Painel Administrativo

Um painel administrativo completo para gestão de clientes, projetos, financeiro e muito mais. Construído com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Início Rápido

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/Novaesweb/novaesweb.git
cd novaesweb

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com hot reload |
| `npm run build` | Build para produção |
| `npm run build:dev` | Build em modo desenvolvimento |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa verificações de ESLint |
| `npm run test` | Executa suite de testes |
| `npm run test:watch` | Testes em modo watch |

## 🛠️ Tecnologias

- **Vite** - Build tool rápido e moderno
- **React 18+** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Utilitários CSS
- **shadcn/ui** - Componentes UI acessíveis
- **Supabase** - Backend e autenticação
- **React Query** - Gerenciamento de estado
- **PWA** - Aplicação web progressiva
## 🗂️ Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes shadcn/ui base
│   ├── site/           # Componentes específicos do site
│   └── [...]           # Outros componentes
├── pages/              # Páginas da aplicação
├── hooks/              # Custom React hooks
├── lib/                # Funções utilitárias
├── integrations/       # Integrações (Supabase, etc)
├── assets/             # Imagens e recursos estáticos
└── main.tsx            # Ponto de entrada da aplicação

supabase/
├── migrations/         # Migrações de banco de dados
└── functions/          # Edge functions serverless
```

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

## 💾 Integração com Supabase

A aplicação utiliza Supabase para:
- ✅ Autenticação (JWT)
- ✅ Banco de dados relacional em tempo real
- ✅ Funções serverless (Edge Functions)
- ✅ Notificações push
- ✅ Armazenamento de arquivos

## 📱 PWA (Progressive Web App)

O projeto inclui suporte completo a PWA:
- Offline-first com Service Worker
- Instalação na tela inicial
- Sincronização em background
- Notificações push nativas

## 🚀 Deployment

### Via Vercel, Netlify ou similar
1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático em cada push para main

```bash
# Build para produção
npm run build

# Testar build localmente
npm run preview
```

## 📖 Documentação Adicional

- [Documentação Vite](https://vitejs.dev/)
- [Documentação shadcn/ui](https://ui.shadcn.com/)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é propriedade de Novaes Web.

## 🆘 Suporte

Para dúvidas sobre:
- **Supabase**: visite https://supabase.com/docs
- **Projeto**: crie uma issue no GitHub

---

**Última atualização**: Março 2026
