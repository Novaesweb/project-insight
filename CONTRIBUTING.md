# Guia de Contribuição - Novaes Web

## Bem-vindo! 👋

Obrigado por considerar contribuir para o Novaes Web. Este documento fornece diretrizes e instruções sobre como contribuir para o projeto.

## Como Funciona Nossa Integração com Lovable

Temos um fluxo de trabalho único que combina o melhor do Lovable com desenvolvimento local:

1. **Mudanças via Lovable** → Auto-commit no GitHub
2. **Mudanças via GitHub** → Refletidas em Lovable
3. **Desenvolvimento Local** → Push para GitHub → Refletidas em Lovable

## Fluxo de Contribuição

### Opção 1: Usando Lovable (Recomendado para Features)

```
1. Acesse https://lovable.dev/projects/[PROJECT_ID]
2. Use prompts em linguagem natural para descrever a feature
3. Revise as mudanças
4. Lovable faz auto-commit
5. Puxe as mudanças localmente: git pull
```

### Opção 2: Desenvolvimento Local

```bash
# 1. Clone e configure
git clone https://github.com/Novaesweb/novaesweb.git
cd novaesweb
npm install

# 2. Crie uma branch para sua feature
git checkout -b feature/sua-feature

# 3. Faça suas mudanças
npm run dev  # Teste em desenvolvimento

# 4. Verifique qualidade
npm run lint
npm run test

# 5. Commit e push
git add .
git commit -m "feat: descrição da mudança"
git push origin feature/sua-feature

# 6. Abra um Pull Request
```

## Padrões de Código

### Commit Messages

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: mudanças de formatação
refactor: refatora código
perf: melhora performance
test: adiciona ou atualiza testes
chore: atualizações de dependências
```

Exemplos:
- `feat: adiciona autenticação com Google`
- `fix: corrige bug de cálculo de fatura`
- `docs: atualiza guia de desploymnet`

### Nomenclatura de Branches

```
feature/nome-da-feature         # Nova funcionalidade
fix/nome-do-bug                 # Correção de bug
docs/nome-da-documentacao       # Documentação
refactor/nome-da-refatoracao    # Refatoração
```

## Desenvolvimento com TypeScript

- Use tipos explícitos quando possível
- Evite `any` tipo
- Documente tipos complexos com JSDoc
- Use interfaces para props de componentes

```typescript
// ✅ Bom
interface ButtonProps {
  /** Texto do botão */
  children: React.ReactNode;
  /** Função executada ao clicar */
  onClick: () => void;
  /** Variante de estilo */
  variant?: 'primary' | 'secondary';
}

// ❌ Evite
const Button = (props: any) => { ... }
```

## Componentes React

- Use functional components com hooks
- Coloque componentes em `src/components/`
- Use componentes shadcn/ui quando possível
- Exporte componentes em um arquivo `index.ts` 

```typescript
// src/components/MyComponent.tsx
export const MyComponent: React.FC<MyComponentProps> = ({ ... }) => {
  return (...)
}

// src/components/index.ts
export { MyComponent } from './MyComponent'
```

## Estilos

- Use Tailwind CSS para estilos
- Prefira utility classes ao invés de CSS customizado
- Use `@apply` apenas para componentes reutilizados

```typescript
// ✅ Bom - Use Tailwind utilities
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click me
</button>

// ❌ Evite - CSS puro quando Tailwind está disponível
const StyledButton = styled.button`
  padding: 8px 16px;
  background: blue;
`
```

## Testes

- Escreva testes para funções críticas
- Mantenha cobertura de testes >70%
- Use Vitest para testes unitários
- Use Playwright para testes E2E

```bash
# Rodar testes
npm run test

# Modo watch
npm run test:watch

# Com cobertura
npm run test -- --coverage
```

## Integração com Supabase

Se sua mudança envolve database:

1. Crie uma nova migration em `supabase/migrations/`
2. Use timestamps para nomes: `20260319_feature_name.sql`
3. Sempre escreva migration reversa (DOWN)
4. Documente as mudanças no SQL

```sql
-- supabase/migrations/20260319_add_new_field.sql
-- Create new field
ALTER TABLE users ADD COLUMN new_field TEXT;

-- Down
-- ALTER TABLE users DROP COLUMN new_field;
```

## Pull Request

### Template de PR

```markdown
## Descrição
Brief description of what this PR does.

## Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova feature
- [ ] 📚 Documentação
- [ ] ♻️ Refactor
- [ ] 🚀 Performance

## Mudanças
- Mudança 1
- Mudança 2

## Testes
- [ ] Testei localmente
- [ ] Novos testes adicionados
- [ ] Testes continuam passando

## Screenshots (se aplicável)
[Adicione screenshots]

## Checklist
- [ ] Meu código segue o guia de estilos
- [ ] Executei `npm run lint`
- [ ] Executei `npm run test`
- [ ] Adicionei documentação necessária
- [ ] Minhas mudanças não quebram testes existentes
```

## Checklist Antes de Submeter

- [ ] `npm run lint` sem erros
- [ ] `npm run test` passando
- [ ] `npm run build` sem erros de produção
- [ ] Documentação atualizada se necessário
- [ ] Commit messages seguem convenção
- [ ] Sem console.log ou debuggers deixados

## Code Review

Esperamos manter alta qualidade:

- Reviews se focam em código, não pessoa
- Sejam construtivos e respeitosos
- Peçam esclarecimentos se necessário
- Aproveitem para aprender

## Dúvidas?

- Abra uma issue com `[QUESTION]` no título
- Visite https://lovable.dev/docs
- Visite https://supabase.com/docs

## Respeito e Inclusão

Este espaço é dedicado a pessoas de todos os backgrounds. Assédio, abuso ou discriminação não será tolerado.

---

**Obrigado por contribuir! 🎉**
