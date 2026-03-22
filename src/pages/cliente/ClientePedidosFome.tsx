import { useState, useEffect } from "react";
import ClienteLayout from "@/components/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, CheckCircle2, Utensils, Truck, XCircle, ChevronRight, 
  Printer, MoreVertical, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ClientePedidosFome() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPedidos();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_pedidos' },
        (payload) => {
          console.log('Change received!', payload);
          fetchPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await (supabase.from("menu_pedidos" as any) as any)
      .select("*")
      .eq("cliente_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (data) setPedidos(data);
    setLoading(false);
  };

  const updateStatus = async (pedidoId: string, newStatus: string) => {
    const { error } = await (supabase.from("menu_pedidos" as any) as any)
      .update({ status: newStatus })
      .eq("id", pedidoId);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Pedido movido para ${newStatus}.` });
      fetchPedidos();
    }
  };

  const ordersByStatus = (status: string) => pedidos.filter(p => p.status === status);

  return (
    <ClienteLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Gestão de Pedidos
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe e gerencie os pedidos do seu cardápio em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/10">
              <Printer className="w-4 h-4 mr-2" />
              Configurar Impressora
            </Button>
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Cozinha Online</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pendentes */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Badge className="bg-yellow-500 text-black border-0">{ordersByStatus('pendente').length}</Badge>
              Pendentes
            </h2>
            {ordersByStatus('pendente').map((pedido) => (
              <Card key={pedido.id} className="bg-yellow-500/5 border-yellow-500/20 backdrop-blur-sm relative overflow-hidden group">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">#{pedido.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">Cliente: {pedido.customer_nome}</p>
                    </div>
                    <span className="text-sm font-black text-yellow-500">R$ {Number(pedido.total).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white border-0" onClick={() => updateStatus(pedido.id, 'preparando')}>
                      Aceitar Pedido
                    </Button>
                    <Button variant="outline" size="sm" className="border-yellow-500/20 text-yellow-500" onClick={() => window.print()}>
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Preparando */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Badge className="bg-blue-500 text-white border-0">{ordersByStatus('preparando').length}</Badge>
              Preparando
            </h2>
            {ordersByStatus('preparando').map((pedido) => (
              <Card key={pedido.id} className="bg-blue-500/5 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  <p className="font-bold">#{pedido.id.slice(0, 8).toUpperCase()}</p>
                  <Button size="sm" className="w-full bg-blue-600" onClick={() => updateStatus(pedido.id, 'em_rota')}>
                    Pronto p/ Entrega
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Em Rota */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Badge className="bg-purple-500 text-white border-0">{ordersByStatus('em_rota').length}</Badge>
              Em Rota
            </h2>
            {ordersByStatus('em_rota').map((pedido) => (
              <Card key={pedido.id} className="bg-purple-500/5 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  <p className="font-bold">#{pedido.id.slice(0, 8).toUpperCase()}</p>
                  <Button size="sm" className="w-full bg-purple-600" onClick={() => updateStatus(pedido.id, 'finalizado')}>
                    Confirmar Entrega
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Finalizados */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Badge className="bg-green-500 text-white border-0">{ordersByStatus('finalizado').length}</Badge>
              Finalizados
            </h2>
            <div className="space-y-2">
              {ordersByStatus('finalizado').slice(0, 3).map((pedido) => (
                <div key={pedido.id} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-xs flex justify-between">
                   <span>#{pedido.id.slice(0, 8).toUpperCase()}</span>
                   <span className="text-green-500 font-bold">Concluído</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClienteLayout>
  );
}
