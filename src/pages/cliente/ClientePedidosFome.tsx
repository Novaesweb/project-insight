import { useEffect, useState } from "react";

import ClienteLayout from "@/components/ClienteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStoredClientProfile } from "@/lib/client-portal-auth";
import { Printer } from "lucide-react";

export default function ClientePedidosFome() {
  const cliente = getStoredClientProfile();
  const clienteId = cliente?.id || null;
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    void fetchPedidos();

    if (!clienteId) {
      return;
    }

    const channel = supabase
      .channel(`menu-pedidos-cliente-${clienteId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_pedidos", filter: `cliente_id=eq.${clienteId}` },
        () => {
          void fetchPedidos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteId]);

  const fetchPedidos = async () => {
    setLoading(true);
    if (!clienteId) {
      setPedidos([]);
      setLoading(false);
      return;
    }

    const { data } = await (supabase.from("menu_pedidos" as any) as any)
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    setPedidos(data || []);
    setLoading(false);
  };

  const updateStatus = async (pedidoId: string, newStatus: string) => {
    if (!clienteId) return;

    const { error } = await (supabase.from("menu_pedidos" as any) as any)
      .update({ status: newStatus })
      .eq("id", pedidoId)
      .eq("cliente_id", clienteId);

    if (error) {
      toast({ title: "Erro", description: "Nao foi possivel atualizar o status.", variant: "destructive" });
      return;
    }

    toast({ title: "Sucesso!", description: `Pedido movido para ${newStatus}.` });
    void fetchPedidos();
  };

  const ordersByStatus = (status: string) => pedidos.filter((pedido) => pedido.status === status);

  return (
    <ClienteLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Gestao de Pedidos
            </h1>
            <p className="mt-1 text-muted-foreground">
              Acompanhe e gerencie os pedidos do seu cardapio em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/10">
              <Printer className="mr-2 h-4 w-4" />
              Configurar Impressora
            </Button>
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2">
              <div className="h-2 w-2 animate-ping rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Cozinha Online</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/40">
            Carregando pedidos...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <Badge className="border-0 bg-yellow-500 text-black">{ordersByStatus("pendente").length}</Badge>
                Pendentes
              </h2>
              {ordersByStatus("pendente").map((pedido) => (
                <Card key={pedido.id} className="relative overflow-hidden border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-bold">#{pedido.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">Cliente: {pedido.customer_nome}</p>
                      </div>
                      <span className="text-sm font-black text-yellow-500">R$ {Number(pedido.total).toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 border-0 bg-yellow-600 text-white hover:bg-yellow-700" onClick={() => updateStatus(pedido.id, "preparando")}>
                        Aceitar Pedido
                      </Button>
                      <Button variant="outline" size="sm" className="border-yellow-500/20 text-yellow-500" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <Badge className="border-0 bg-blue-500 text-white">{ordersByStatus("preparando").length}</Badge>
                Preparando
              </h2>
              {ordersByStatus("preparando").map((pedido) => (
                <Card key={pedido.id} className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
                  <CardContent className="space-y-4 p-4">
                    <p className="font-bold">#{pedido.id.slice(0, 8).toUpperCase()}</p>
                    <Button size="sm" className="w-full bg-blue-600" onClick={() => updateStatus(pedido.id, "em_rota")}>
                      Pronto p/ Entrega
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <Badge className="border-0 bg-purple-500 text-white">{ordersByStatus("em_rota").length}</Badge>
                Em Rota
              </h2>
              {ordersByStatus("em_rota").map((pedido) => (
                <Card key={pedido.id} className="border-purple-500/20 bg-purple-500/5 backdrop-blur-sm">
                  <CardContent className="space-y-4 p-4">
                    <p className="font-bold">#{pedido.id.slice(0, 8).toUpperCase()}</p>
                    <Button size="sm" className="w-full bg-purple-600" onClick={() => updateStatus(pedido.id, "finalizado")}>
                      Confirmar Entrega
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <Badge className="border-0 bg-green-500 text-white">{ordersByStatus("finalizado").length}</Badge>
                Finalizados
              </h2>
              <div className="space-y-2">
                {ordersByStatus("finalizado").slice(0, 3).map((pedido) => (
                  <div key={pedido.id} className="flex justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-xs">
                    <span>#{pedido.id.slice(0, 8).toUpperCase()}</span>
                    <span className="font-bold text-green-500">Concluido</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
