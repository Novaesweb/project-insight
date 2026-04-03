import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, CalendarDays, DollarSign, Eye, Filter, RefreshCw, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface ClienteComExtras {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  status: string;
  extras_ativos: Array<{
    id: string;
    nome: string;
    categoria: string;
    preco_ativacao: number;
    preco_mensal: number;
    observacao: string;
    data_ativacao: string;
    status: string;
  }>;
  total_ativacao: number;
  total_mensal: number;
  total_geral: number;
}

export default function ExtrasAtivos() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientesComExtras, setClientesComExtras] = useState<ClienteComExtras[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativos" | "inativos">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<"todos" | "fixo" | "intermediario" | "mensal">("todos");
  const [selectedCliente, setSelectedCliente] = useState<ClienteComExtras | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Carregar dados
  const loadClientesComExtras = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar todos os clientes com extras ativos
      const { data: extrasClientes, error: extrasError } = await supabase
        .from("extras_clientes")
        .select(`
          *,
          clientes!inner(id, nome, email, whatsapp, status),
          extras_catalogo!inner(nome, categoria, preco_ativacao, preco_mensal)
        `)
        .eq("status", "ativo")
        .order("created_at", { ascending: false });

      if (extrasError) {
        console.error("Erro ao buscar extras dos clientes:", extrasError);
        toast({ title: "Erro", description: "Não foi possível carregar os extras", variant: "destructive" });
        return;
      }

      // Agrupar por cliente
      const clientesMap = new Map<string, ClienteComExtras>();

      extrasClientes?.forEach((extra) => {
        const clienteId = extra.cliente_id;
        
        if (!clientesMap.has(clienteId)) {
          clientesMap.set(clienteId, {
            id: clienteId,
            nome: (extra.clientes as any).nome,
            email: (extra.clientes as any).email,
            whatsapp: (extra.clientes as any).whatsapp,
            status: (extra.clientes as any).status,
            extras_ativos: [],
            total_ativacao: 0,
            total_mensal: 0,
            total_geral: 0
          });
        }

        const cliente = clientesMap.get(clienteId)!;
        
        // Adicionar extra ao cliente
        cliente.extras_ativos.push({
          id: extra.id,
          nome: (extra.extras_catalogo as any).nome,
          categoria: (extra.extras_catalogo as any).categoria,
          preco_ativacao: extra.preco_ativacao,
          preco_mensal: extra.preco_mensal,
          observacao: extra.observacao || "",
          data_ativacao: extra.created_at,
          status: extra.status
        });

        // Atualizar totais
        cliente.total_ativacao += extra.preco_ativacao;
        cliente.total_mensal += extra.preco_mensal;
        cliente.total_geral += (extra.preco_ativacao + extra.preco_mensal);
      });

      setClientesComExtras(Array.from(clientesMap.values()));

    } catch (error) {
      console.error("Erro ao carregar clientes com extras:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadClientesComExtras();
  }, [loadClientesComExtras]);

  // Filtrar clientes
  const clientesFiltrados = clientesComExtras.filter(cliente => {
    // Filtro de busca
    const buscaMatch = busca === "" || 
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase());

    // Filtro de status do cliente
    const statusMatch = filtroStatus === "todos" || 
      (filtroStatus === "ativos" && cliente.status === "ativo") ||
      (filtroStatus === "inativos" && cliente.status === "inativo");

    // Filtro de categoria de extra
    const categoriaMatch = filtroCategoria === "todos" ||
      cliente.extras_ativos.some(extra => extra.categoria === filtroCategoria);

    return buscaMatch && statusMatch && categoriaMatch;
  });

  // Estatísticas
  const stats = {
    totalClientes: clientesFiltrados.length,
    clientesAtivos: clientesFiltrados.filter(c => c.status === "ativo").length,
    totalExtras: clientesFiltrados.reduce((acc, c) => acc + c.extras_ativos.length, 0),
    totalAtivacao: clientesFiltrados.reduce((acc, c) => acc + c.total_ativacao, 0),
    totalMensal: clientesFiltrados.reduce((acc, c) => acc + c.total_mensal, 0),
  };

  // Configurações de categoria
  const categoriaConfig = {
    fixo: { label: "Único", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    intermediario: { label: "Pro", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    mensal: { label: "Assinatura", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" }
  };

  return (
    <motion.div 
      className="space-y-6 p-6" 
      initial="hidden" 
      animate="show" 
      variants={fadeUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Extras Ativos</h1>
          <p className="text-white/60">Visualização de todos os clientes com extras ativados</p>
        </div>
        
        <Button 
          onClick={loadClientesComExtras}
          disabled={loading}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-purple-500/10 w-fit mx-auto mb-2">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalClientes}</p>
            <p className="text-sm text-white/60">Clientes com Extras</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mx-auto mb-2">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.clientesAtivos}</p>
            <p className="text-sm text-white/60">Clientes Ativos</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-blue-500/10 w-fit mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalExtras}</p>
            <p className="text-sm text-white/60">Totais de Extras</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-amber-500/10 w-fit mx-auto mb-2">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              R$ {stats.totalAtivacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/60">Total Ativações</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-green-500/10 w-fit mx-auto mb-2">
              <CalendarDays className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              R$ {stats.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/60">Mensalidades</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="glass-card border-[0.5px]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Buscar cliente por nome ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 glass-input border-white/10 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="todos">Todos Status</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>

              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="todos">Todas Categorias</option>
                <option value="fixo">Único</option>
                <option value="intermediario">Pro</option>
                <option value="mensal">Assinatura</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes com Extras */}
      <div className="space-y-4">
        {clientesFiltrados.length === 0 ? (
          <Card className="glass-card border-[0.5px]">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">
                {busca || filtroStatus !== "todos" || filtroCategoria !== "todos" 
                  ? "Nenhum cliente encontrado com os filtros aplicados" 
                  : "Nenhum cliente com extras ativados encontrado"}
              </p>
            </CardContent>
          </Card>
        ) : (
          clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="glass-card border-[0.5px] hover:border-white/20 transition-colors">
              <CardContent className="p-4">
                {/* Header do Cliente */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      cliente.status === "ativo" ? "bg-emerald-400" : "bg-red-400"
                    )} />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{cliente.nome}</h3>
                      <p className="text-sm text-white/60">{cliente.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        cliente.status === "ativo" 
                          ? "border-emerald-500/30 text-emerald-400" 
                          : "border-red-500/30 text-red-400"
                      )}
                    >
                      {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedCliente(cliente);
                        setShowDetails(true);
                      }}
                      className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Resumo dos Extras */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-2xl font-bold text-blue-400">{cliente.extras_ativos.length}</p>
                    <p className="text-xs text-white/60">Extras Ativos</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-2xl font-bold text-amber-400">
                      R$ {cliente.total_ativacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-white/60">Total Ativação</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-2xl font-bold text-green-400">
                      R$ {cliente.total_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-white/60">Mensalidade</p>
                  </div>
                </div>

                {/* Preview dos Extras */}
                <div className="flex flex-wrap gap-2">
                  {cliente.extras_ativos.slice(0, 3).map((extra) => (
                    <span key={extra.id}>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs border",
                          categoriaConfig[extra.categoria as keyof typeof categoriaConfig]?.border || "border-white/30",
                          categoriaConfig[extra.categoria as keyof typeof categoriaConfig]?.color || "text-white/60"
                        )}
                      >
                        {extra.nome}
                      </Badge>
                    </span>
                  ))}
                  {cliente.extras_ativos.length > 3 && (
                    <Badge variant="outline" className="text-xs border-white/30 text-white/60">
                      +{cliente.extras_ativos.length - 3} mais
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedCliente && (
        <div className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
          showDetails ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <div className={cn(
            "bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto",
            showDetails ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCliente.nome}</h2>
                  <p className="text-sm text-white/60">{selectedCliente.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(false)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Extras Ativos</h3>
                
                {selectedCliente.extras_ativos.map((extra) => (
                  <Card key={extra.id} className="glass-card border-[0.5px]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs border",
                              categoriaConfig[extra.categoria as keyof typeof categoriaConfig]?.border,
                              categoriaConfig[extra.categoria as keyof typeof categoriaConfig]?.color
                            )}
                          >
                            {categoriaConfig[extra.categoria as keyof typeof categoriaConfig]?.label}
                          </Badge>
                          <h4 className="text-lg font-semibold text-white">{extra.nome}</h4>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className="text-xs border-emerald-500/30 text-emerald-400"
                        >
                          {extra.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-white/60 mb-1">Ativação</p>
                          <p className="text-lg font-bold text-amber-400">
                            R$ {extra.preco_ativacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">Mensalidade</p>
                          <p className="text-lg font-bold text-green-400">
                            R$ {extra.preco_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">Total</p>
                          <p className="text-lg font-bold text-blue-400">
                            R$ {(extra.preco_ativacao + extra.preco_mensal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {extra.observacao && (
                        <div className="mt-3">
                          <p className="text-xs text-white/60 mb-1">Observação</p>
                          <p className="text-sm text-white/80">{extra.observacao}</p>
                        </div>
                      )}

                      <div className="mt-3">
                        <p className="text-xs text-white/60 mb-1">Data de Ativação</p>
                        <p className="text-sm text-white/80">
                          {new Date(extra.data_ativacao).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
