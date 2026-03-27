import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquareQuote, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDepoimentos() {
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepoimentos();
  }, []);

  const fetchDepoimentos = async () => {
    setLoading(true);
    const { data } = await (supabase.from("depoimentos" as any) as any)
      .select("*, clientes(nome_unidade)")
      .order("created_at", { ascending: false });
    
    if (data) setDepoimentos(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase.from("depoimentos" as any) as any)
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Depoimento ${status === 'aprovado' ? 'aprovado' : 'rejeitado'}.` });
      fetchDepoimentos();
    }
  };

  const filterDepoimentos = (status: string) => depoimentos.filter(d => d.status === status);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
             <MessageSquareQuote className="w-8 h-8 text-primary" />
             Moderação de Depoimentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o que seus clientes estão falando e o que aparece no site.
          </p>
        </div>

        <Tabs defaultValue="pendente" className="w-full">
          <TabsList className="bg-card border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="pendente" className="rounded-lg data-[state=active]:bg-yellow-500/20">
              <Clock className="w-4 h-4 mr-2" />
              Pendentes ({filterDepoimentos('pendente').length})
            </TabsTrigger>
            <TabsTrigger value="aprovado" className="rounded-lg data-[state=active]:bg-green-500/20">
              <Check className="w-4 h-4 mr-2" />
              Aprovados
            </TabsTrigger>
            <TabsTrigger value="rejeitado" className="rounded-lg data-[state=active]:bg-red-500/20">
              <X className="w-4 h-4 mr-2" />
              Arquivados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendente" className="mt-6 space-y-4">
            {filterDepoimentos('pendente').map((dep) => (
              <Card key={dep.id} className="bg-card/50 border-white/10 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                         <div className="flex text-yellow-500">
                           {Array(dep.estrelas || 5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                         </div>
                         <span className="text-xs text-muted-foreground">• {new Date(dep.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-lg">"{dep.conteudo}"</h3>
                      <div className="flex items-center gap-2 text-sm text-primary font-medium">
                        <span className="bg-primary/10 px-2 py-0.5 rounded-md">{dep.nome}</span>
                        <span className="text-muted-foreground">de</span>
                        <span className="text-white">{dep.clientes?.nome_unidade || 'Cliente Parceiro'}</span>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 justify-center">
                      <Button className="bg-green-600 hover:bg-green-700 h-12 px-6" onClick={() => updateStatus(dep.id, 'aprovado')}>
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 h-12 px-6" onClick={() => updateStatus(dep.id, 'rejeitado')}>
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterDepoimentos('pendente').length === 0 && !loading && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl text-muted-foreground">
                 Tudo limpo! Não há depoimentos aguardando moderação.
              </div>
            )}
          </TabsContent>

          <TabsContent value="aprovado" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterDepoimentos('aprovado').map(dep => (
                  <Card key={dep.id} className="bg-green-500/5 border-green-500/10">
                    <CardContent className="p-4">
                       <p className="italic text-sm mb-2 opacity-80">"{dep.conteudo}"</p>
                       <p className="text-xs font-bold text-green-500">- {dep.nome}</p>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}



