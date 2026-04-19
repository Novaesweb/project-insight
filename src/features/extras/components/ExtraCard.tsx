import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Star, 
  CalendarDays, 
  Pencil, 
  UserPlus, 
  Trash2, 
  Rocket, 
  MoreVertical,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const catConfig = {
  fixo: { label: "Único", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: Zap },
  intermediario: { label: "Pro", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", icon: Star },
  mensal: { label: "Assinatura", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", icon: CalendarDays },
  pacotes: { label: "Bundle", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10", icon: Rocket }
};

interface ExtraCardProps {
  item: any;
  isPkg?: boolean;
  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onAssign?: (item: any) => void;
  onEdit?: (item: any) => void;
}

export function ExtraCard({ 
  item, 
  isPkg = false, 
  onUpdate, 
  onDelete, 
  onAssign, 
  onEdit 
}: ExtraCardProps) {
  const category = isPkg ? "pacotes" : (item.categoria as keyof typeof catConfig || "fixo");
  const config = catConfig[category] || catConfig.fixo;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "glass-card-premium h-full group relative overflow-hidden flex flex-col",
        item.status === "inativo" && "opacity-60"
      )}>
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <config.icon className={cn("w-4 h-4", config.color)} />
            </div>
            {!isPkg && onUpdate && (
              <Switch 
                checked={item.status === "ativo"} 
                onCheckedChange={() => onUpdate(item.id, { status: item.status === "ativo" ? "inativo" : "ativo" })}
              />
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {item.nome}
          </h3>
          
          <p className="text-xs text-white/40 mb-6 line-clamp-2 min-h-[32px]">
            {item.descricao || "Sem descrição disponível."}
          </p>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Investimento</span>
                <span className={cn("text-xl font-black", config.color)}>
                  R$ {(item.preco_ativacao || item.preco_total || 0).toLocaleString()}
                  {item.preco_mensal > 0 && <span className="text-xs font-medium opacity-60"> + R$ {item.preco_mensal}/mês</span>}
                </span>
              </div>
              <Badge variant="outline" className={cn("text-[9px] uppercase tracking-tighter", config.color, config.border)}>
                {config.label}
              </Badge>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/5">
              <Button 
                onClick={() => onAssign?.(item)}
                className="flex-1 h-9 gradient-primary border-0 text-white font-black uppercase tracking-widest text-[9px]"
              >
                <UserPlus className="w-3.5 h-3.5 mr-2" /> Atribuir
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white/20 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0f0f1a] border-white/10 text-white shadow-2xl">
                  <DropdownMenuItem 
                    onClick={() => onEdit?.(item)}
                    className="text-[10px] font-bold uppercase tracking-widest gap-2 cursor-pointer py-3"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-400" /> Editar Item
                  </DropdownMenuItem>
                  {!isPkg && (
                    <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest gap-2 cursor-pointer py-3">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" /> Adicionar ao Pacote
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem 
                    className="text-[10px] font-bold uppercase tracking-widest gap-2 cursor-pointer py-3 text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                    onClick={() => onDelete?.(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remover Catálogo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
