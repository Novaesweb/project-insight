import React from "react";
import { Package, Download, Image as ImageIcon, FileText, Share2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResellerMateriais() {
  const materiais = [
    { title: "Logotipos webnovax", desc: "Arquivos em PNG, SVG e PDF para uso em artes.", icon: ImageIcon },
    { title: "Banner: Redes Sociais", desc: "Formatos para Instagram (Feed e Stories).", icon: ImageIcon },
    { title: "Script de Vendas", desc: "PDF com abordagens sugeridas para fechar leads.", icon: FileText },
    { title: "Tabela de Preços", desc: "Tabela atualizada com todos os serviços e bônus.", icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Materiais de Divulgação</h1>
        <p className="text-white/40">Baixe artes e documentos para ajudar nas suas vendas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materiais.map((m, i) => (
          <Card key={i} className="bg-[#0c0c14] border-white/5 group hover:border-red-500/30 transition-all">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <m.icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">{m.title}</CardTitle>
                  <CardDescription className="text-white/40">{m.desc}</CardDescription>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="text-white/20 hover:text-white">
                <Download className="w-5 h-5" />
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-[#12091d] to-[#08080f] border-white/5 border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-white">Dica do Especialista</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/60 text-sm leading-relaxed italic">
            "Para ter mais sucesso na indicação, use seu link exclusivo sempre junto com o seu cupom. 
            Isso cria um senso de exclusividade e o cliente se sente motivado pelo desconto imediato."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



