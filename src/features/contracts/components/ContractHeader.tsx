import React from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "../types";

interface ContractHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onNewContract: () => void;
}

export function ContractHeader({ 
  searchTerm, 
  setSearchTerm, 
  onNewContract,
}: ContractHeaderProps) {
  return (
    <motion.div 
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
            Gestão de Documentos
          </Badge>
          <div className="h-1 w-1 rounded-full bg-white/20" />
          <span className="text-xs text-white/40">v3.0 Premium</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Cofre de <span className="text-primary">Contratos</span>
        </h1>
        <p className="max-w-2xl text-sm text-white/50 md:text-base">
          Gerencie, monitore e crie contratos inteligentes com a infraestrutura NovaesWeb.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Buscar contrato ou cliente..."
            className="h-10 w-64 border-white/10 bg-white/5 pl-9 text-sm text-white transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={onNewContract}
          className="h-10 gap-2 bg-primary px-5 font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </div>
    </motion.div>
  );
}
