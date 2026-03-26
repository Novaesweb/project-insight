import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Utensils, Search, ChevronRight, X, Plus, Minus, Send, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MenuInterativo() {
  const { slug } = useParams();
  const [cliente, setCliente] = useState<any>(null);
  const [cart, setCart] = useState<{ id: string; nome: string; preco: number; qtd: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Client by Slug
        const { data: clientData, error: clientError } = await supabase
          .from("clientes")
          .select("id, nome, trial_ends_at, site_url")
          .eq("slug", slug)
          .single();

        if (clientError || !clientData) {
           setLoading(false);
           return;
        }

        setCliente(clientData);

        // 2. Check Trial
        if (clientData.trial_ends_at && new Date() > new Date(clientData.trial_ends_at)) {
          setIsTrialExpired(true);
          setLoading(false);
          return;
        }

        // 3. Fetch Menu Data filtered by Client
        const [catRes, itemRes] = await Promise.all([
          (supabase.from("menu_categorias" as any) as any).select("*").eq("cliente_id", clientData.id).order("ordem"),
          (supabase.from("menu_itens" as any) as any).select("*").eq("cliente_id", clientData.id).eq("status", "ativo")
        ]);
        
        if (catRes.data) setCategories(catRes.data);
        if (itemRes.data) setItems(itemRes.data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const total = cart.reduce((acc, item) => acc + item.preco * item.qtd, 0);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.categoria_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: { id: string; nome: string; preco: number }) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qtd: i.qtd + 1 } : i);
      }
      return [...prev, { ...item, qtd: 1 }];
    });
    toast({ title: "Adicionado!", description: `${item.nome} no carrinho.` });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id === id) {
        if (item.qtd > 1) acc.push({ ...item, qtd: item.qtd - 1 });
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as any[]));
  };

  const finalizeOrder = () => {
    const message = `*Novo Pedido - ${cliente?.nome || "webnovax"}*\n\n` + 
      cart.map(i => `- ${i.qtd}x ${i.nome} (R$ ${(i.preco * i.qtd).toFixed(2)})`).join('\n') + 
      `\n\n*Total: R$ ${total.toFixed(2)}*`;
    
    // In production, this would use the real WhatsApp from the client
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5551984444444?text=${encoded}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md space-y-6 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Acesso Suspenso</h1>
            <p className="text-muted-foreground text-sm">
              O período de demonstração para <span className="text-white font-bold">{cliente?.nome}</span> expirou.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 text-xs text-left border border-white/5 space-y-3">
            <p>Se você é o proprietário desta empresa:</p>
            <ul className="space-y-1 text-white/60">
              <li className="flex items-center gap-2">• Efetue o pagamento da sua mensalidade</li>
              <li className="flex items-center gap-2">• Entre em contato com o suporte webnovax</li>
            </ul>
          </div>
          <Button className="w-full gradient-primary h-12 rounded-xl font-bold gap-2" asChild>
            <a href="https://wa.me/5551984444444" target="_blank">
              Ativar Agora <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">webnovax Digital Solutions</p>
        </motion.div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-black opacity-20 italic underline decoration-primary">404</h1>
          <p className="text-muted-foreground">Ops! Esse cardápio não existe ou foi removido.</p>
          <Button variant="outline" className="border-white/10" asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Cardápio Interativo</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">webnovax Experience</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cart.reduce((a, b) => a + b.qtd, 0)}
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
        {/* Banner */}
        <div className="relative h-48 rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop" 
            alt="Pizza" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-6 left-6 z-20">
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 backdrop-blur-md">Aberto Agora</Badge>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase italic text-white">Delivery Express</h2>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button 
            variant={activeCategory === "all" ? "default" : "outline"}
            className="rounded-full border-white/10"
            onClick={() => setActiveCategory("all")}
          >
            Todos
          </Button>
          {categories.map(cat => (
            <Button 
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className="rounded-full border-white/10"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.nome}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="O que você quer comer hoje?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 pl-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20"
          />
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
             Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
             ))
          ) : filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-white/10 overflow-hidden relative">
                    <img 
                      src={item.imagem || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop"} 
                      className="w-full h-full object-cover" 
                    />
                    {!item.disponivel && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold uppercase text-red-500">
                        Esgotado
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{item.nome}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">R$ {Number(item.preco).toFixed(2)}</span>
                      <Button 
                        size="sm" 
                        disabled={!item.disponivel}
                        className="rounded-full w-8 h-8 p-0 gradient-primary disabled:opacity-50"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 opacity-50">Nenhum item encontrado.</div>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" 
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Seu Carrinho
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-10 opacity-50">Carrinho vazio</div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center group">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.nome}</p>
                          <p className="text-[10px] text-muted-foreground">R$ {item.preco.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="w-6 h-6 rounded-md" onClick={() => removeFromCart(item.id)}>-</Button>
                          <span className="text-sm w-4 text-center">{item.qtd}</span>
                          <Button variant="outline" size="icon" className="w-6 h-6 rounded-md" onClick={() => addToCart(item)}>+</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full gradient-primary h-12 rounded-xl text-lg font-bold"
                  disabled={cart.length === 0}
                  onClick={finalizeOrder}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar via WhatsApp
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}



