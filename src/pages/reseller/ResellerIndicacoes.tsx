import React from "react";
import { Users, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ResellerIndicacoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Minhas Indicações</h1>
        <p className="text-white/40">Acompanhe o status de cada lead e cliente que você indicou.</p>
      </div>

      <Card className="bg-[#0c0c14] border-white/5">
        <CardHeader className="border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
              <Input placeholder="Buscar por nome ou empresa..." className="pl-9 bg-white/5 border-white/10" />
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="bg-white/5 border-white/10">Todos</Badge>
               <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Convertidos</Badge>
               <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Em negociação</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30">
                  <th className="px-6 py-4 font-bold">Empresa/Lead</th>
                  <th className="px-6 py-4 font-bold">Data</th>
                  <th className="px-6 py-4 font-bold">Origem</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Comissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-sm">Lead Exemplo {i}</p>
                      <p className="text-xs text-white/30">contato@exemplo.com.br</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-white/50">21/03/2024</td>
                    <td className="px-6 py-4">
                       <Badge variant="secondary" className="bg-white/5 text-white/40 text-[10px]">CUPOM</Badge>
                    </td>
                    <td className="px-6 py-4">
                       <Badge className={i % 2 === 0 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
                          {i % 2 === 0 ? "Projeto Ativo" : "Aguardando"}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                       {i % 2 === 0 ? "R$ 150,00" : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
