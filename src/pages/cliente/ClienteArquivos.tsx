import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, CheckCircle2, Circle, Upload, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const assetsRequired = [
  { id: 1, label: "Logotipo da Empresa", desc: "Preferencialmente em vetor (AI, EPS, SVG) ou fundo transparente (PNG).", icon: FileText, status: "recebido" },
  { id: 2, label: "Fotos do Estabelecimento", desc: "Fotos de alta qualidade da fachada e interior para a galeria.", icon: ImageIcon, status: "pendente" },
  { id: 3, label: "Textos das Páginas", desc: "Conteúdo institucional, descrição de serviços e história da marca.", icon: FileText, status: "pendente" },
  { id: 4, label: "Paleta de Cores Preferida", desc: "Referência de cores que deseja utilizar no layout.", icon: ImageIcon, status: "recebido" },
];

export default function ClienteArquivos() {
  const [assets, setAssets] = useState(assetsRequired);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 ambient-glow min-h-screen pb-10">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Arquivos do Projeto</h1>
          <p className="text-sm text-white/50">Gerencie os materiais necessários para a criação do seu site.</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary px-3 py-1 font-bold">
          2 de {assets.length} Recebidos
        </Badge>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id} className="glass-card border-white/5 overflow-hidden group hover:border-white/10 transition-all">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  <asset.icon className={`w-6 h-6 ${asset.status === 'recebido' ? 'text-emerald-400' : 'text-white/40'}`} />
                </div>
                {asset.status === 'recebido' ? (
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
                <Button variant="outline" className="flex-1 h-9 text-xs rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-white">
                  {asset.status === 'recebido' ? 'Ver Arquivo' : 'Instruções'}
                </Button>
                {asset.status === 'pendente' && (
                  <Button className="flex-1 h-9 text-xs rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/20 hover:shadow-primary/40">
                    <Upload className="w-3.5 h-3.5 mr-2" /> Enviar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-blue-500/10 bg-blue-500/5">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="mt-1 p-2 rounded-lg bg-blue-500/20">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Dica Novaesweb</p>
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
