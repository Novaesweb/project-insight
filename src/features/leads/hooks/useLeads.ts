import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadService, Lead, LeadStatus } from "../services/lead-service";
import { useToast } from "@/hooks/use-toast";

export function useLeads() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadService.getAll(),
  });

  const statsQuery = useQuery({
    queryKey: ["leads-stats"],
    queryFn: () => leadService.getStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, extra }: { id: string; status: LeadStatus; extra?: Partial<Lead> }) =>
      leadService.updateStatus(id, status, extra),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
      toast({ title: "Status do lead atualizado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar lead", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
      toast({ title: "Lead removido com sucesso." });
    },
  });

  return {
    leads: leadsQuery.data || [],
    stats: statsQuery.data || { total: 0, new: 0, unvisited: 0, converted: 0, todayCount: 0 },
    loading: leadsQuery.isLoading || statsQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    deleteLead: deleteMutation.mutate,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
    }
  };
}
