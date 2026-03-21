import React from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ResellerFinanceiro() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Financeiro e Saques</h1>
        <p className="text-white/40">Gerencie suas comissões e solicite seus pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0c0c14] border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/40">Saldo Disponível</CardDescription>
            <CardTitle className="text-2xl font-bold text-white">R$ 450,00</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white gap-2 mt-2">
              <ArrowUpRight className="w-4 h-4" /> Solicitar Saque
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0c0c14] border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/40">Total Recebido</CardDescription>
            <CardTitle className="text-2xl font-bold text-white text-green-500">R$ 1.250,00</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-[#0c0c14] border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/40">Próximo Pagamento</CardDescription>
            <CardTitle className="text-2xl font-bold text-white text-yellow-500">R$ 150,00</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-[#0c0c14] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5 text-red-500" /> Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                         <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="font-bold text-sm">Comissão: Venda Site Institucional</p>
                         <p className="text-xs text-white/30">Referente ao cliente: Loja de Roupas ABC</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-green-500 font-bold text-sm">+ R$ 150,00</p>
                      <p className="text-[10px] text-white/20">15 Mar 2024</p>
                   </div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
