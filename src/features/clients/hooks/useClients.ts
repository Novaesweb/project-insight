import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService, type Client, type CreateClientInput } from "../services/client-service";
import { useToast } from "@/hooks/use-toast";

export function useClients() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Client> }) =>
      clientService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Dados do cliente atualizados com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente removido da base." });
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateClientInput) => clientService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
    },
  });

  return {
    clients: clientsQuery.data || [],
    loading: clientsQuery.isLoading,
    createClient: createMutation.mutate,
    createClientAsync: createMutation.mutateAsync,
    creating: createMutation.isPending,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["clients"] })
  };
}

export function useClientDetails(id?: string) {
  const clientQuery = useQuery({
    queryKey: ["client", id],
    queryFn: () => id ? clientService.getById(id) : null,
    enabled: !!id
  });

  const statsQuery = useQuery({
    queryKey: ["client-stats", id],
    queryFn: () => id ? clientService.getClientStats(id) : null,
    enabled: !!id
  });

  return {
    client: clientQuery.data,
    stats: statsQuery.data,
    loading: clientQuery.isLoading || statsQuery.isLoading,
  };
}
