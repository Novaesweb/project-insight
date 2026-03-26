import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UtensilsCrossed, Trash2, Edit2, LayoutGrid, Layers, Package, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AdminMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria_id: "",
    imagem: "",
    disponivel: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await (supabase.from("menu_categorias" as any) as any).select("*").order("ordem");
    const { data: itemData } = await (supabase.from("menu_itens" as any) as any).select("*").order("created_at", { ascending: false });
    
    if (catData) setCategories(catData);
    if (itemData) setItems(itemData);
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newCategoryName) return;
    const { error } = await (supabase.from("menu_categorias" as any) as any).insert({
      nome: newCategoryName,
      cliente_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível criar a categoria.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Categoria criada." });
      setNewCategoryName("");
      setIsCategoryDialogOpen(false);
      fetchData();
    }
  };

  const saveProduct = async () => {
    if (!productForm.nome || !productForm.preco) return;
    
    const payload = {
      ...productForm,
      preco: Number(productForm.preco),
      cliente_id: (await supabase.auth.getUser()).data.user?.id
    };

    let error;
    if (editingProduct) {
      const { error: err } = await (supabase.from("menu_itens" as any) as any)
        .update(payload)
        .eq("id", editingProduct.id);
      error = err;
    } else {
      const { error: err } = await (supabase.from("menu_itens" as any) as any).insert(payload);
      error = err;
    }

    if (error) {
      toast({ title: "Erro", description: "Ocorreu um erro ao salvar o produto.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Produto salvo com sucesso." });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({ nome: "", descricao: "", preco: "", categoria_id: "", imagem: "", disponivel: true });
      fetchData();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Todos os produtos nela serão movidos para 'Sem Categoria'.")) return;
    const { error } = await (supabase.from("menu_categorias" as any) as any).delete().eq("id", id);
    if (error) toast({ title: "Erro", description: "Ocorreu um erro ao excluir.", variant: "destructive" });
    else fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Deseja excluir este produto?")) return;
    const { error } = await (supabase.from("menu_itens" as any) as any).delete().eq("id", id);
    if (error) toast({ title: "Erro", description: "Ocorreu um erro ao excluir.", variant: "destructive" });
    else fetchData();
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      nome: product.nome,
      descricao: product.descricao || "",
      preco: String(product.preco),
      categoria_id: product.categoria_id || "",
      imagem: product.imagem || "",
      disponivel: product.disponivel
    });
    setIsProductDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Gestão de Cardápios
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure categorias e produtos para o menu interativo.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10">
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Nome da Categoria</Label>
                    <Input 
                      id="cat-name" 
                      placeholder="Ex: Pizzas, Bebidas, Sobremesas" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="bg-black/20"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button>
                  <Button className="gradient-primary" onClick={addCategory}>Salvar Categoria</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isProductDialogOpen} onOpenChange={(val) => {
              setIsProductDialogOpen(val);
              if (!val) { setEditingProduct(null); setProductForm({ nome: "", descricao: "", preco: "", categoria_id: "", imagem: "", disponivel: true }); }
            }}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10 max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Nome do Produto</Label>
                    <Input 
                      placeholder="Ex: Pizza de Calabresa Premium" 
                      value={productForm.nome}
                      onChange={(e) => setProductForm({...productForm, nome: e.target.value})}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Descrição</Label>
                    <Input 
                      placeholder="Ex: Molho de tomate rústico, calabresa artesanal..." 
                      value={productForm.descricao}
                      onChange={(e) => setProductForm({...productForm, descricao: e.target.value})}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input 
                      type="number"
                      placeholder="0.00" 
                      value={productForm.preco}
                      onChange={(e) => setProductForm({...productForm, preco: e.target.value})}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select 
                      onValueChange={(val) => setProductForm({...productForm, categoria_id: val})}
                      value={productForm.categoria_id}
                    >
                      <SelectTrigger className="bg-black/20">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <div className="space-y-0.5">
                      <Label>Disponível para venda</Label>
                      <p className="text-[10px] text-muted-foreground">O item aparecerá no cardápio publicamente.</p>
                    </div>
                    <Switch 
                      checked={productForm.disponivel}
                      onCheckedChange={(val) => setProductForm({...productForm, disponivel: val})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>Cancelar</Button>
                  <Button className="gradient-primary" onClick={saveProduct}>Salvar Produto</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="categorias" className="w-full">
          <TabsList className="bg-card border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="categorias" className="rounded-lg data-[state=active]:bg-primary/20">
              <Layers className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="produtos" className="rounded-lg data-[state=active]:bg-primary/20">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Card key={cat.id} className="bg-card/50 border-white/10 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <LayoutGrid className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{cat.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {items.filter(i => i.categoria_id === cat.id).length} itens
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive/50 hover:text-destructive"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {categories.length === 0 && !loading && (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-2xl text-muted-foreground">
                   Nenhuma categoria cadastrada.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="produtos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="bg-card/50 border-white/10 group overflow-hidden">
                  <div className="h-40 bg-white/5 relative">
                    <img 
                      src={item.imagem || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop"} 
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEditProduct(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteProduct(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {!item.disponivel && (
                      <Badge variant="destructive" className="absolute bottom-2 left-2">Pausado</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold leading-tight">{item.nome}</h3>
                       <span className="text-primary font-black text-sm">R$ {Number(item.preco).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.descricao}</p>
                    <Badge variant="outline" className="text-[10px] border-white/5">
                      {categories.find(c => c.id === item.categoria_id)?.nome || 'Sem Categoria'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              {items.length === 0 && !loading && (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-2xl text-muted-foreground">
                   Nenhum produto cadastrado. Clique em 'Novo Produto'.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}



