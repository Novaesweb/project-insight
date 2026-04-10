import type { SupabaseClient } from "@supabase/supabase-js";

type GenericSupabaseClient = SupabaseClient<any, any, any>;
type QueryLike = any;

export interface NovaesFlowLoadOptions<TResult> {
  client: GenericSupabaseClient;
  table: string;
  select?: string;
  single?: boolean;
  maybeSingle?: boolean;
  limit?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  applyFilters?: (query: QueryLike) => QueryLike;
}

export interface NovaesFlowVersioningOptions<TResult> {
  table?: string;
  foreignKeyColumn?: string;
  versionColumn?: string;
  currentRecord?: TResult | null;
  buildSnapshot: (currentRecord: TResult, nextVersionNumber: number) => Record<string, unknown>;
}

export interface NovaesFlowSaveOptions<TResult> {
  client: GenericSupabaseClient;
  table: string;
  record: Record<string, unknown>;
  id?: string | null;
  idColumn?: string;
  select?: string;
  applyFilters?: (query: QueryLike) => QueryLike;
  versioning?: NovaesFlowVersioningOptions<TResult>;
}

function applyOptionalFilters(query: QueryLike, applyFilters?: (query: QueryLike) => QueryLike) {
  return applyFilters ? applyFilters(query) : query;
}

async function persistToSupabase<TResult>({
  client,
  table,
  record,
  id = null,
  idColumn = "id",
  select,
  applyFilters,
  versioning,
}: NovaesFlowSaveOptions<TResult>) {
  if (id && versioning?.currentRecord) {
    const versionTable = versioning.table ?? "contrato_versions";
    const foreignKeyColumn = versioning.foreignKeyColumn ?? "contrato_id";
    const versionColumn = versioning.versionColumn ?? "version_number";

    const latestVersionResponse = await client
      .from(versionTable)
      .select(versionColumn)
      .eq(foreignKeyColumn, id)
      .order(versionColumn, { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestVersionResponse.error) {
      throw latestVersionResponse.error;
    }

    const latestVersionNumber = Number((latestVersionResponse.data as Record<string, unknown> | null)?.[versionColumn] || 0);
    const snapshotPayload = versioning.buildSnapshot(versioning.currentRecord, latestVersionNumber + 1);
    const snapshotResponse = await client.from(versionTable).insert(snapshotPayload as any);

    if (snapshotResponse.error) {
      throw snapshotResponse.error;
    }
  }

  if (id) {
    let query = client.from(table).update(record as any).eq(idColumn, id);
    query = applyOptionalFilters(query, applyFilters);

    const response = select ? await query.select(select).single() : await query.select().single();
    if (response.error) throw response.error;
    return response.data as TResult;
  }

  const insertQuery = client.from(table).insert(record as any);
  const response = select ? await insertQuery.select(select).single() : await insertQuery.select().single();
  if (response.error) throw response.error;
  return response.data as TResult;
}

export async function saveDraftToSupabase<TResult>(options: NovaesFlowSaveOptions<TResult>) {
  return persistToSupabase(options);
}

export async function saveProposalToSupabase<TResult>(options: NovaesFlowSaveOptions<TResult>) {
  return persistToSupabase(options);
}

export async function loadProposalFromSupabase<TResult>({
  client,
  table,
  select = "*",
  single = false,
  maybeSingle = false,
  limit,
  orderBy,
  applyFilters,
}: NovaesFlowLoadOptions<TResult>) {
  let query = client.from(table).select(select);
  query = applyOptionalFilters(query, applyFilters);

  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  if (single) {
    const response = await query.single();
    if (response.error) throw response.error;
    return response.data as TResult;
  }

  if (maybeSingle) {
    const response = await query.maybeSingle();
    if (response.error) throw response.error;
    return response.data as TResult | null;
  }

  const response = await query;
  if (response.error) throw response.error;
  return response.data as TResult;
}
