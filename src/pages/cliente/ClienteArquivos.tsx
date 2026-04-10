import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, CheckCircle2, Circle, Upload, Info, Download, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getStoredClientProfile } from "@/lib/client-portal-auth";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const assetsRequired = [
  { key: "logo", label: "Logotipo da Empresa", desc: "Preferencialmente em vetor (AI, EPS, SVG) ou fundo transparente (PNG).", icon: FileText },
  { key: "fotos", label: "Fotos do Estabelecimento", desc: "Fotos de alta qualidade da fachada e interior para a galeria.", icon: ImageIcon },
  { key: "textos", label: "Textos das Páginas", desc: "Conteúdo institucional, descrição de serviços e história da marca.", icon: FileText },
  { key: "cores", label: "Paleta de Cores Preferida", desc: "Referência de cores que deseja utilizar no layout.", icon: ImageIcon },
];

export default function ClienteArquivos() {
  const { toast } = useToast();
  const cliente = getStoredClientProfile();
  const [projeto, setProjeto] = useState<any>(null);
  const [arquivos, setArquivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      if (!cliente?.id) return;

      // 1. Pegar o projeto ativo do cliente
      const { data: proj, error: projError } = await supabase
        .from("projetos")
        .select("*")
        .eq("cliente_id", cliente.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (projError && projError.code !== "PGRST116") throw projError;
      setProjeto(proj);

      if (proj) {
        // 2. Pegar os arquivos do projeto
        const { data: files, error: filesError } = await (supabase
          .from("projeto_arquivos" as any) as any)
          .select("*")
          .eq("projeto_id", proj.id);
        
        if (filesError) throw filesError;
        setArquivos(files || []);
      }
    } catch (error: any) {
      console.error("Erro ao carregar arquivos:", error);
    } finally {
      setLoading(false);
    }
  }, [cliente?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file || !projeto) return;

    setUploading(key);
    try {
      const extension = file.name.split(".").pop();
      const fileName = `${projeto.id}/${key}-${Date.now()}.${extension}`;
      
      // 1. Upload para Storage
      const { error: storageError } = await supabase.storage
        .from("projeto-arquivos")
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from("projeto-arquivos")
        .getPublicUrl(fileName);

      // 2. Salvar metadados no DB
      const { error: dbError } = await (supabase.from("projeto_arquivos" as any) as any).insert({
        projeto_id: projeto.id,
        nome: file.name,
        url: publicUrl,
        tipo: key,
        tamanho: file.size,
        enviado_por: "cliente"
      });

      if (dbError) throw dbError;

      toast({ title: "Arquivo enviado!", description: "O material já está disponível para a equipe." });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro no envio", description: error.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const getStatus = (key: string) => {
    return arquivos.some(a => a.tipo === key) ? 'recebido' : 'pendente';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-white">Carregando arquivos...</div>;
  if (!projeto) return <div className="flex items-center justify-center min-h-[400px] text-white">Nenhum projeto ativo encontrado.</div>;

  const recebidos = assetsRequired.filter(a => getStatus(a.key) === 'recebido').length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 ambient-glow min-h-screen pb-10">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Arquivos do Projeto</h1>
          <p className="text-sm text-white/50">Gerencie os materiais necessários para a criação do seu site.</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary px-3 py-1 font-bold">
          {recebidos} de {assetsRequired.length} Recebidos
        </Badge>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assetsRequired.map((asset) => {
          const status = getStatus(asset.key);
          const fileData = arquivos.find(a => a.tipo === asset.key);

          return (
            <Card key={asset.key} className="glass-card border-white/5 overflow-hidden group hover:border-white/10 transition-all">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    <asset.icon className={`w-6 h-6 ${status === 'recebido' ? 'text-emerald-400' : 'text-white/40'}`} />
                  </div>
                  {status === 'recebido' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-0 flex items-center gap-1 text-[10px] uppercase font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Recebido
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 flex items-center gap-1 text-[10px] uppercase font-bold">
                      <Circle className="w-3 h-3" /> Pendente
                    </Badge>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white mb-1">{asset.label}</h3>
                  <p className="text-[11px] text-white/40 leading-relaxed mb-6">{asset.desc}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                  {status === 'recebido' ? (
                    <Button 
                      asChild
                      variant="outline" 
                      className="flex-1 h-9 text-xs rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-white"
                    >
                      <a href={fileData?.url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-3.5 h-3.5 mr-2 text-white/50" /> Ver/Baixar {fileData?.nome.slice(-10)}
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1 h-9 text-xs rounded-xl border-white/5 bg-primary/5 text-primary-foreground pointer-events-none">
                      Aguardando Material
                    </Button>
                  )}
                  
                  <div className="flex-1 relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => handleUpload(e, asset.key)}
                      disabled={!!uploading}
                    />
                    <Button 
                      className={`w-full h-9 text-xs rounded-xl ${status === 'recebido' ? 'bg-white/5 hover:bg-white/10 text-white' : 'gradient-primary text-white'} border-0 shadow-lg`}
                      disabled={!!uploading}
                    >
                      {uploading === asset.key ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <><Upload className="w-3.5 h-3.5 mr-2" /> {status === 'recebido' ? 'Substituir' : 'Enviar'}</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-blue-500/10 bg-blue-500/5">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="mt-1 p-2 rounded-lg bg-blue-500/20">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Dica novaesweb</p>
              <p className="text-xs text-blue-400/80 leading-relaxed">
                Quanto mais rápido você nos enviar esses materiais, mais rápido poderemos avançar para a fase de **Desenvolvimento**. 
                Se tiver dúvidas sobre o formato, fale conosco pelo Suporte Prioritário.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}



