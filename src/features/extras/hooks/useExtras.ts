import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";

import {
  extraService,
  AssignExtraInput,
  ExtraCatalogItem,
  ExtraFormInput,
  PackageFormInput,
} from "../services/extra-service";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Ocorreu um erro inesperado.");
  }

  return "Ocorreu um erro inesperado.";
}

export function useExtras() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateExtrasData = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["extras-catalogo"] }),
    queryClient.invalidateQueries({ queryKey: ["extras-pacotes"] }),
    queryClient.invalidateQueries({ queryKey: ["extras-pacote-itens"] }),
    queryClient.invalidateQueries({ queryKey: ["extras-clientes-ativos"] }),
  ]);

  const catalogQuery = useQuery({
    queryKey: ["extras-catalogo"],
    queryFn: () => extraService.getCatalog(),
  });

  const packagesQuery = useQuery({
    queryKey: ["extras-pacotes"],
    queryFn: () => extraService.getPackages(),
  });

  const packageItemsQuery = useQuery({
    queryKey: ["extras-pacote-itens"],
    queryFn: () => extraService.getPackageItems(),
  });

  const clientsQuery = useQuery({
    queryKey: ["extras-clientes-lista"],
    queryFn: () => extraService.getClients(),
  });

  const clientExtrasQuery = useQuery({
    queryKey: ["extras-clientes-ativos"],
    queryFn: () => extraService.getClientExtras(),
  });

  const stats = {
    total: catalogQuery.data?.length || 0,
    fixos: catalogQuery.data?.filter((item) => item.categoria === "fixo").length || 0,
    assinaturas:
      catalogQuery.data?.filter(
        (item) => item.categoria === "mensal" || item.categoria === "intermediario",
      ).length || 0,
    receitaPotencialFixos:
      catalogQuery.data
        ?.filter((item) => item.categoria === "fixo")
        .reduce((sum, item) => sum + Number(item.preco_ativacao), 0) || 0,
    mrrPotencial:
      catalogQuery.data?.reduce((sum, item) => sum + Number(item.preco_mensal), 0) || 0,
  };

  const createMutation = useMutation({
    mutationFn: (extra: ExtraFormInput) => extraService.createExtra(extra),
    onSuccess: async () => {
      await invalidateExtrasData();
      toast({ title: "Item cadastrado com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível criar o item",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, extra }: { id: string; extra: Partial<ExtraFormInput> }) =>
      extraService.updateExtra(id, extra),
    onSuccess: async () => {
      await invalidateExtrasData();
      toast({ title: "Item atualizado!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível atualizar o item",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => extraService.deleteExtra(id),
    onSuccess: async () => {
      await invalidateExtrasData();
      toast({ title: "Item removido do catálogo." });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível excluir o item",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: (pkg: PackageFormInput) => extraService.createPackage(pkg),
    onSuccess: async () => {
      await invalidateExtrasData();
      toast({ title: "Pacote publicado no catálogo!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível criar o pacote",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, pkg }: { id: string; pkg: PackageFormInput }) =>
      extraService.updatePackage(id, pkg),
    onSuccess: async () => {
      await invalidateExtrasData();
      toast({ title: "Pacote atualizado!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível atualizar o pacote",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: string) => extraService.deletePackage(id),
    onSuccess: async () => {
      await invalidateExtrasData();
      toast({ title: "Pacote removido do catálogo." });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível excluir o pacote",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const addToPackageMutation = useMutation({
    mutationFn: ({ packageId, extraId }: { packageId: string; extraId: string }) =>
      extraService.addExtraToPackage(packageId, extraId),
    onSuccess: async (result) => {
      await invalidateExtrasData();
      toast({
        title: result.alreadyExists ? "Esse item já estava no pacote." : "Item adicionado ao pacote!",
      });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível atualizar o pacote",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (input: AssignExtraInput) => extraService.assignItemToClient(input),
    onSuccess: async (result) => {
      await invalidateExtrasData();

      const summary =
        result.insertedCount > 0
          ? `${result.itemName} foi liberado para ${result.clientName}.`
          : `${result.itemName} já estava ativo para ${result.clientName}.`;

      const billingNote =
        result.totalCharge > 0
          ? result.financeCreated
            ? ` Cobrança inicial: R$ ${result.totalCharge.toFixed(2)}.`
            : ` O extra foi liberado, mas a cobrança automática não pôde ser criada.`
          : "";

      const skippedNote =
        result.skippedCount > 0 && result.insertedCount > 0
          ? ` ${result.skippedCount} item(ns) já estavam ativos.`
          : "";

      toast({
        title: result.insertedCount > 0 ? "Cliente atualizado!" : "Nada para atualizar",
        description: `${summary}${billingNote}${skippedNote}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível atribuir o item",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return {
    catalog: catalogQuery.data || [],
    packages: packagesQuery.data || [],
    packageItems: packageItemsQuery.data || [],
    clients: clientsQuery.data || [],
    clientExtras: clientExtrasQuery.data || [],
    stats,
    loading:
      catalogQuery.isLoading ||
      packagesQuery.isLoading ||
      packageItemsQuery.isLoading ||
      clientsQuery.isLoading,
    createExtra: createMutation.mutateAsync,
    updateExtra: updateMutation.mutateAsync,
    deleteExtra: deleteMutation.mutateAsync,
    createPackage: createPackageMutation.mutateAsync,
    updatePackage: updatePackageMutation.mutateAsync,
    deletePackage: deletePackageMutation.mutateAsync,
    addExtraToPackage: addToPackageMutation.mutateAsync,
    assignItemToClient: assignMutation.mutateAsync,
    refresh: () => invalidateExtrasData(),
  };
}
