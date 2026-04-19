import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { extraService, ExtraCatalogItem, PackageItem } from "../services/extra-service";
import { useToast } from "@/hooks/use-toast";

export function useExtras() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const catalogQuery = useQuery({
    queryKey: ["extras-catalogo"],
    queryFn: () => extraService.getCatalog(),
  });

  const packagesQuery = useQuery({
    queryKey: ["extras-pacotes"],
    queryFn: () => extraService.getPackages(),
  });

  const clientExtrasQuery = useQuery({
    queryKey: ["extras-clientes-ativos"],
    queryFn: () => extraService.getClientExtras(),
  });

  const stats = {
    total: catalogQuery.data?.length || 0,
    fixos: catalogQuery.data?.filter(e => e.categoria === "fixo").length || 0,
    assinaturas: catalogQuery.data?.filter(e => e.categoria === "mensal" || e.categoria === "intermediario").length || 0,
    receitaPotencialFixos: catalogQuery.data?.filter(e => e.categoria === "fixo").reduce((s, e) => s + Number(e.preco_ativacao), 0) || 0,
    mrrPotencial: catalogQuery.data?.reduce((s, e) => s + Number(e.preco_mensal), 0) || 0,
  };

  const createMutation = useMutation({
    mutationFn: (extra: Partial<ExtraCatalogItem>) => extraService.createExtra(extra),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extras-catalogo"] });
      toast({ title: "Extra criado com sucesso!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, extra }: { id: string, extra: Partial<ExtraCatalogItem> }) =>
      extraService.updateExtra(id, extra),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extras-catalogo"] });
      toast({ title: "Extra atualizado!" });
    },
  });

  return {
    catalog: catalogQuery.data || [],
    packages: packagesQuery.data || [],
    clientExtras: clientExtrasQuery.data || [],
    stats,
    loading: catalogQuery.isLoading || packagesQuery.isLoading,
    createExtra: createMutation.mutate,
    updateExtra: updateMutation.mutate,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["extras-catalogo"] });
      queryClient.invalidateQueries({ queryKey: ["extras-pacotes"] });
    }
  };
}
