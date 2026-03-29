import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DemoSite {
  id: string;
  nome: string;
  descricao: string | null;
  link: string;
  imagem_url: string | null;
  ordem: number;
  ativo: boolean;
}

export function DemoSiteManager() {
  const [demos, setDemos] = useState<DemoSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", link: "", imagem_url: "" });

  const fetchDemos = async () => {
    const { data } = await supabase
      .from("demo_sites")
      .select("*")
      .order("ordem");
    if (data) setDemos(data as DemoSite[]);
    setLoading(false);
  };

  useEffect(() => { fetchDemos(); }, []);

  const addDemo = async () => {
    if (!form.nome || !form.link) {
      toast.error("Nome e link são obrigatórios");
      return;
    }
    const { error } = await supabase.from("demo_sites").insert({
      nome: form.nome,
      descricao: form.descricao || null,
      link: form.link,
      imagem_url: form.imagem_url || null,
      ordem: demos.length + 1,
    } as any);
    if (error) {
      toast.error("Erro ao adicionar: " + error.message);
    } else {
      toast.success("Demonstração adicionada!");
      setForm({ nome: "", descricao: "", link: "", imagem_url: "" });
      setShowForm(false);
      fetchDemos();
    }
  };

  const removeDemo = async (id: string) => {
    const { error } = await supabase.from("demo_sites").delete().eq("id", id);
    if (error) toast.error("Erro ao remover");
    else {
      toast.success("Removido!");
      fetchDemos();
    }
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from("demo_sites").update({ ativo: !ativo } as any).eq("id", id);
    fetchDemos();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      {demos.map((demo) => (
        <Card key={demo.id} className="border">
          <CardContent className="p-4 flex items-center gap-4">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
            {demo.imagem_url && (
              <img src={demo.imagem_url} alt={demo.nome} className="w-16 h-12 rounded object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{demo.nome}</h4>
              <p className="text-xs text-muted-foreground truncate">{demo.link}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={demo.ativo ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAtivo(demo.id, demo.ativo)}
              >
                {demo.ativo ? "Ativo" : "Inativo"}
              </Button>
              <a href={demo.link} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
              </a>
              <Button variant="ghost" size="sm" onClick={() => removeDemo(demo.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {showForm ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Nome do site" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Textarea placeholder="Descrição breve" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            <Input placeholder="Link (https://...)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            <Input placeholder="URL da imagem (opcional)" value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={addDemo}>Salvar</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Demonstração
        </Button>
      )}
    </div>
  );
}
