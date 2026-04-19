import { supabase } from "@/integrations/supabase/client";
import { notifyAdminPanel, notifyClientPanel } from "@/lib/user-notifications";

export type ExtraCategory = "fixo" | "intermediario" | "mensal";

export interface ExtraCatalogItem {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: ExtraCategory;
  preco_ativacao: number;
  preco_mensal: number;
  status: "ativo" | "inativo";
  created_at: string;
  subcategoria?: string | null;
}

export interface PackageItem {
  id: string;
  nome: string;
  descricao: string | null;
  preco_total: number | null;
  status: string | null;
  created_at: string | null;
}

export interface PackageLinkItem {
  id: string;
  pacote_id: string | null;
  extra_id: string | null;
  created_at: string | null;
}

export interface ClientOption {
  id: string;
  nome: string;
  email: string;
}

export interface ExtraFormInput {
  nome: string;
  descricao?: string | null;
  categoria: ExtraCategory;
  preco_ativacao?: number;
  preco_mensal?: number;
  status?: "ativo" | "inativo";
}

export interface PackageFormInput {
  nome: string;
  descricao?: string | null;
  preco_total?: number;
  itemIds: string[];
  status?: string | null;
}

export interface AssignExtraInput {
  clientId: string;
  item: ExtraCatalogItem | PackageItem;
  note?: string | null;
}

export interface AssignExtraResult {
  clientName: string;
  itemName: string;
  insertedCount: number;
  skippedCount: number;
  totalCharge: number;
  totalMonthly: number;
  financeCreated: boolean;
}

const categoryLabels: Record<ExtraCategory, string> = {
  fixo: "Único",
  intermediario: "Pro",
  mensal: "Assinatura",
};

function isPackage(item: ExtraCatalogItem | PackageItem): item is PackageItem {
  return !("categoria" in item);
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getPackageTable() {
  return (supabase.from as any)("pacotes");
}

function getPackageItemsTable() {
  return (supabase.from as any)("pacote_itens");
}

async function getPackageExtras(packageId: string) {
  const { data: links, error: linksError } = await getPackageItemsTable()
    .select("extra_id")
    .eq("pacote_id", packageId);

  if (linksError) throw linksError;

  const extraIds = Array.from(
    new Set(
      (links as Array<{ extra_id: string | null }> | null)
        ?.map((link) => link.extra_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    ),
  );

  if (extraIds.length === 0) {
    return [] as ExtraCatalogItem[];
  }

  const { data, error } = await supabase
    .from("extras_catalogo")
    .select("*")
    .in("id", extraIds);

  if (error) throw error;

  return (data ?? []) as ExtraCatalogItem[];
}

async function createFinanceEntry(clientId: string, description: string, amount: number) {
  if (amount <= 0) return null;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const { data, error } = await supabase
    .from("financeiro")
    .insert({
      cliente_id: clientId,
      descricao: description,
      tipo: "entrada",
      valor: amount,
      vencimento: dueDate.toISOString().split("T")[0],
      status: "pendente",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export const extraService = {
  async getCatalog() {
    const { data, error } = await supabase
      .from("extras_catalogo")
      .select("*")
      .order("nome");

    if (error) throw error;

    return (data ?? []) as ExtraCatalogItem[];
  },

  async getPackages() {
    const { data, error } = await getPackageTable()
      .select("*")
      .order("nome");

    if (error) throw error;

    return (data ?? []) as PackageItem[];
  },

  async getPackageItems() {
    const { data, error } = await getPackageItemsTable().select("*");

    if (error) throw error;

    return (data ?? []) as PackageLinkItem[];
  },

  async getClients() {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, email")
      .eq("status", "ativo")
      .order("nome");

    if (error) throw error;

    return (data ?? []) as ClientOption[];
  },

  async getClientExtras() {
    const { data, error } = await supabase
      .from("extras_clientes")
      .select("id, cliente_id, extra_id, pacote_id, status")
      .eq("status", "ativo");

    if (error) throw error;

    return data ?? [];
  },

  async createExtra(extra: ExtraFormInput) {
    const payload = {
      nome: extra.nome,
      descricao: extra.descricao || null,
      categoria: extra.categoria,
      preco_ativacao: toNumber(extra.preco_ativacao),
      preco_mensal: extra.categoria === "fixo" ? 0 : toNumber(extra.preco_mensal),
      status: extra.status ?? "ativo",
    };

    const { data, error } = await supabase
      .from("extras_catalogo")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data as ExtraCatalogItem;
  },

  async updateExtra(id: string, extra: Partial<ExtraFormInput>) {
    const payload = {
      ...(extra.nome !== undefined ? { nome: extra.nome } : {}),
      ...(extra.descricao !== undefined ? { descricao: extra.descricao || null } : {}),
      ...(extra.categoria !== undefined ? { categoria: extra.categoria } : {}),
      ...(extra.preco_ativacao !== undefined ? { preco_ativacao: toNumber(extra.preco_ativacao) } : {}),
      ...(extra.preco_mensal !== undefined ? { preco_mensal: toNumber(extra.preco_mensal) } : {}),
      ...(extra.status !== undefined ? { status: extra.status } : {}),
    };

    if (extra.categoria === "fixo" && extra.preco_mensal === undefined) {
      Object.assign(payload, { preco_mensal: 0 });
    }

    const { error } = await supabase
      .from("extras_catalogo")
      .update(payload)
      .eq("id", id);

    if (error) throw error;
  },

  async deleteExtra(id: string) {
    const [{ count: activeAssignments, error: assignmentsError }, { count: packageUsage, error: packagesError }] =
      await Promise.all([
        supabase
          .from("extras_clientes")
          .select("id", { count: "exact", head: true })
          .eq("extra_id", id)
          .eq("status", "ativo"),
        getPackageItemsTable()
          .select("id", { count: "exact", head: true })
          .eq("extra_id", id),
      ]);

    if (assignmentsError) throw assignmentsError;
    if (packagesError) throw packagesError;

    if ((activeAssignments ?? 0) > 0) {
      throw new Error("Este item já está atribuído a clientes. Inative ou remova as atribuições antes de excluir.");
    }

    if ((packageUsage ?? 0) > 0) {
      throw new Error("Este item faz parte de um pacote. Remova-o dos pacotes antes de excluir.");
    }

    const { error } = await supabase
      .from("extras_catalogo")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async createPackage(pkg: PackageFormInput) {
    const itemIds = Array.from(new Set(pkg.itemIds)).filter(Boolean);

    const { data, error } = await getPackageTable()
      .insert({
        nome: pkg.nome,
        descricao: pkg.descricao || null,
        preco_total: toNumber(pkg.preco_total),
        status: pkg.status ?? "ativo",
      })
      .select()
      .single();

    if (error) throw error;

    if (itemIds.length > 0) {
      const { error: linksError } = await getPackageItemsTable().insert(
        itemIds.map((itemId) => ({
          pacote_id: (data as PackageItem).id,
          extra_id: itemId,
        })),
      );

      if (linksError) throw linksError;
    }

    return data as PackageItem;
  },

  async updatePackage(id: string, pkg: PackageFormInput) {
    const itemIds = Array.from(new Set(pkg.itemIds)).filter(Boolean);

    const { error: packageError } = await getPackageTable()
      .update({
        nome: pkg.nome,
        descricao: pkg.descricao || null,
        preco_total: toNumber(pkg.preco_total),
        status: pkg.status ?? "ativo",
      })
      .eq("id", id);

    if (packageError) throw packageError;

    const { error: clearItemsError } = await getPackageItemsTable()
      .delete()
      .eq("pacote_id", id);

    if (clearItemsError) throw clearItemsError;

    if (itemIds.length > 0) {
      const { error: insertItemsError } = await getPackageItemsTable().insert(
        itemIds.map((itemId) => ({
          pacote_id: id,
          extra_id: itemId,
        })),
      );

      if (insertItemsError) throw insertItemsError;
    }
  },

  async deletePackage(id: string) {
    const { count, error: usageError } = await supabase
      .from("extras_clientes")
      .select("id", { count: "exact", head: true })
      .eq("pacote_id", id)
      .eq("status", "ativo");

    if (usageError) throw usageError;

    if ((count ?? 0) > 0) {
      throw new Error("Este pacote já foi atribuído a clientes. Remova as ativações antes de excluir do catálogo.");
    }

    const { error: clearItemsError } = await getPackageItemsTable()
      .delete()
      .eq("pacote_id", id);

    if (clearItemsError) throw clearItemsError;

    const { error } = await getPackageTable()
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async addExtraToPackage(packageId: string, extraId: string) {
    const { data: existing, error: existingError } = await getPackageItemsTable()
      .select("id")
      .eq("pacote_id", packageId)
      .eq("extra_id", extraId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return { alreadyExists: true };
    }

    const { error } = await getPackageItemsTable().insert({
      pacote_id: packageId,
      extra_id: extraId,
    });

    if (error) throw error;

    return { alreadyExists: false };
  },

  async assignItemToClient({ clientId, item, note }: AssignExtraInput) {
    const { data: client, error: clientError } = await supabase
      .from("clientes")
      .select("id, nome, email")
      .eq("id", clientId)
      .single();

    if (clientError) throw clientError;

    const extrasToAssign = isPackage(item)
      ? await getPackageExtras(item.id)
      : [item];

    if (extrasToAssign.length === 0) {
      throw new Error("Esse pacote ainda não possui itens para atribuir.");
    }

    const extraIds = extrasToAssign.map((extra) => extra.id);
    const { data: existingAssignments, error: existingAssignmentsError } = await supabase
      .from("extras_clientes")
      .select("extra_id")
      .eq("cliente_id", clientId)
      .eq("status", "ativo")
      .in("extra_id", extraIds);

    if (existingAssignmentsError) throw existingAssignmentsError;

    const existingIds = new Set(
      (existingAssignments ?? []).map((assignment) => assignment.extra_id),
    );

    const rows = extrasToAssign
      .filter((extra) => !existingIds.has(extra.id))
      .map((extra) => ({
        cliente_id: clientId,
        extra_id: extra.id,
        pacote_id: isPackage(item) ? item.id : null,
        categoria: extra.categoria,
        preco_ativacao: toNumber(extra.preco_ativacao),
        preco_mensal: toNumber(extra.preco_mensal),
        observacao: note || null,
        status: "ativo",
      }));

    if (rows.length === 0) {
      return {
        clientName: client.nome,
        itemName: item.nome,
        insertedCount: 0,
        skippedCount: extrasToAssign.length,
        totalCharge: 0,
        totalMonthly: 0,
        financeCreated: false,
      } satisfies AssignExtraResult;
    }

    const { error: insertError } = await supabase
      .from("extras_clientes")
      .insert(rows as any[]);

    if (insertError) throw insertError;

    const totalActivation = rows.reduce((sum, row) => sum + toNumber(row.preco_ativacao), 0);
    const totalMonthly = rows.reduce((sum, row) => sum + toNumber(row.preco_mensal), 0);
    const totalCharge = totalActivation + totalMonthly;

    let financeCreated = false;

    if (totalCharge > 0) {
      try {
        const billingLabel = isPackage(item)
          ? `Pacote de extras: ${item.nome}`
          : `Extra: ${item.nome} - ${categoryLabels[item.categoria]}`;

        await createFinanceEntry(clientId, billingLabel, totalCharge);
        financeCreated = true;
      } catch (error) {
        console.error("[Extras] failed to create finance entry", error);
      }
    }

    await notifyAdminPanel({
      title: "Extra atribuído",
      body: `${item.nome} foi liberado para ${client.nome}.`,
      url: "/admin/extras/lista",
    });

    await notifyClientPanel(clientId, {
      title: "Novo extra liberado",
      body:
        totalCharge > 0
          ? `${item.nome} já está disponível no seu portal. Uma cobrança foi lançada no financeiro.`
          : `${item.nome} já está disponível no seu portal.`,
      url: totalCharge > 0 ? "/cliente/faturas" : "/cliente/extras",
    });

    return {
      clientName: client.nome,
      itemName: item.nome,
      insertedCount: rows.length,
      skippedCount: extrasToAssign.length - rows.length,
      totalCharge,
      totalMonthly,
      financeCreated,
    } satisfies AssignExtraResult;
  },
};
