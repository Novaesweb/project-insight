import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService, FinanceEntry, FinanceStatus } from "../services/finance-service";
import { useToast } from "@/hooks/use-toast";

export function useFinance(filters?: { status?: string; start?: string; end?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const financeQuery = useQuery({
    queryKey: ["financeiro", filters],
    queryFn: () => financeService.getAll(filters),
  });

  const statsQuery = useQuery({
    queryKey: ["financeiro-stats", filters],
    queryFn: () => financeService.getStats(financeQuery.data || []),
    enabled: !!financeQuery.data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FinanceStatus }) =>
      financeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro"] });
      queryClient.invalidateQueries({ queryKey: ["financeiro-stats"] });
      toast({ title: "Status financeiro atualizado!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro"] });
      toast({ title: "Lançamento removido." });
    },
  });

  return {
    entries: financeQuery.data || [],
    stats: statsQuery.data || { recebido: 0, pendente: 0, atraso: 0, total: 0 },
    loading: financeQuery.isLoading || statsQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro"] });
    }
  };
}
