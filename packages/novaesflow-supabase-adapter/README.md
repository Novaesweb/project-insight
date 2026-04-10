# NovaesFlow Supabase Adapter

Camada opcional oficial para persistir payloads do `@novaesflow/ui` usando Supabase.

## Objetivo

O core `@novaesflow/ui` não conhece backend. Este adapter encapsula leitura e persistência com Supabase sem empurrar essa dependência para o pacote visual.

## Helpers públicos

- `saveDraftToSupabase`
- `saveProposalToSupabase`
- `loadProposalFromSupabase`

## Exemplo

```ts
import { createClient } from "@supabase/supabase-js";
import { saveProposalToSupabase } from "@novaesflow/supabase-adapter";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

await saveProposalToSupabase({
  client: supabase,
  table: "contratos",
  id: contractId,
  select: "*, clientes(nome)",
  record: payloadToPersist,
  applyFilters: (query) => query.eq("modelo", "novaesweb-contrato-mestre"),
});
```

## Versionamento opcional

Quando o consumidor precisa salvar snapshots antes de atualizar um registro principal, use `versioning`.
