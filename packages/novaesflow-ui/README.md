# NovaesFlow UI

`NovaesFlow UI` é o core universal do builder interativo de propostas da NovaesWeb. O pacote é React-first, agnóstico de backend e pronto para uso em qualquer site com configuração via JSON/props.

## Instalação

```bash
npm install @novaesflow/ui
```

## Uso rápido

```tsx
import { NovaesFlowBuilder, type NovaesFlowConfig } from "@novaesflow/ui";

const config: NovaesFlowConfig = {
  theme: "cyber-neon",
  colors: ["#8A2BE2", "#FF0000", "#FF007F"],
  plans: [
    { id: "exp", name: "Express", price: 180, description: "Essencial para delivery" },
    { id: "pro", name: "Pro", price: 500, description: "Completo para expansão" },
    {
      id: "custom",
      name: "Sob Medida",
      price: 0,
      description: "Desenvolvimento exclusivo",
      emphasis: "exclusive",
    },
  ],
  extras: [
    { id: "ia", name: "Robô IA", price: 150, description: "Atendimento automático" },
    { id: "marketing", name: "Plano Marketing", price: 300, description: "Artes profissionais" },
  ],
  onFinish: async (payload) => {
    await fetch("/api/proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};

export function App() {
  return <NovaesFlowBuilder config={config} />;
}
```

## Exemplo com adapter Supabase

```tsx
import { NovaesFlowBuilder } from "@novaesflow/ui";
import { saveProposalToSupabase } from "@novaesflow/supabase-adapter";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

<NovaesFlowBuilder
  config={{
    plans,
    extras,
    onFinish: async (payload) => {
      await saveProposalToSupabase({
        client: supabase,
        table: "novaesflow_demo_submissions",
        record: {
          title: payload.selectedPlan?.name ?? "Sem plano",
          payload,
          status: "draft",
        },
      });
    },
  }}
/>;
```

## Configuração

### `NovaesFlowConfig`

- `theme`: string do tema.
- `colors`: `[roxo, vermelho, rosa]`.
- `plans`: catálogo do plano base.
- `extras`: catálogo de módulos extras.
- `fields`: campos livres configuráveis.
- `onChange`: callback de estado.
- `onFinish`: callback final para enviar o payload ao backend.

## Segurança

- O core não importa `supabase-js` e não lida com chaves sensíveis.
- Todo campo livre passa por sanitização básica contra XSS antes de sair no payload.
- O frontend deve enviar o payload final para uma rota segura de backend via `onFinish`.

## Demo local

Há um demo React em `packages/novaesflow-ui/demo` com dois modos:

- `mock/local`
- `supabase`

Comandos:

```bash
npm run dev:novaesflow-demo
npm run build:novaesflow-demo
```
