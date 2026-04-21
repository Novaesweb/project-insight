import type { Cliente, Contrato, ExtraCatalogo } from "./types";

export const EMPTY_CONTRATOS: Contrato[] = [];
export const EMPTY_CLIENTES: Cliente[] = [];
export const EMPTY_EXTRAS_CATALOGO: ExtraCatalogo[] = [];

export function ensureArray<T>(value: T[] | null | undefined): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is T => item != null);
}

export const noop = () => undefined;
export const noopAsyncBoolean = async () => false;
export const noopContractAction = (_contrato?: Contrato) => undefined;
export const noopTabChange = (_tab: string) => undefined;
export const noopSearchChange = (_term: string) => undefined;
export const noopCofreFilterChange = (_filter: "ativos" | "arquivados") => undefined;
