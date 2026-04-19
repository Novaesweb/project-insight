import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  ExternalLink, 
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle2,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { cn } from "@/lib/utils";

const statusMeta: Record<string, { label: string; tone: string }> = {
  briefing: { label: "Briefing", tone: "bg-blue-500/10 text-blue-400" },
  design: { label: "Design", tone: "bg-purple-500/10 text-purple-400" },
  desenvolvimento: { label: "Dev", tone: "bg-amber-500/10 text-amber-400" },
  homologacao: { label: "SEO/Testes", tone: "bg-violet-500/10 text-violet-400" },
  concluido: { label: "Finalizado", tone: "bg-emerald-500/10 text-emerald-400" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProjectsList() {
  const navigate = useNavigate();
  const { projects, loading, deleteProject } = useProjects();
  const { requestDelete, dialogProps } = useDeleteConfirm();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.clientes?.nome_empresa || p.clientes?.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && projects.length === 0) {
    return <div className="p-10 text-white/40 animate-pulse">Carregando lista de projetos...</div>;
  }

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-white/40 hover:text-white">
            <Link to="/admin/projetos"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Lista de Projetos</h1>
            <p className="text-xs text-white/40">Gerenciamento operacional da carteira</p>
          </div>
        </div>
        <Button asChild className="gradient-primary text-white font-bold h-10 px-6">
          <Link to="/admin/projetos/kanban">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Ver no Kanban
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card-premium border-white/5">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input 
              placeholder="Buscar por projeto ou cliente..." 
              className="pl-10 glass-card-premium border-white/5 text-white text-sm h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 border-white/10 text-white/60 hover:text-white px-5">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="glass-card-premium border-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/30 text-[10px] uppercase font-black">Projeto</TableHead>
              <TableHead className="text-white/30 text-[10px] uppercase font-black">Status</TableHead>
              <TableHead className="text-white/30 text-[10px] uppercase font-black">Progresso</TableHead>
              <TableHead className="text-white/30 text-[10px] uppercase font-black">Entrega</TableHead>
              <TableHead className="text-right text-white/30 text-[10px] uppercase font-black">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((p) => (
              <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => navigate(`/admin/projetos/${p.id}`)}>
                <TableCell>
                  <div>
                    <p className="text-sm font-bold text-white">{p.titulo}</p>
                    <p className="text-[10px] text-white/30 font-medium">{p.clientes?.nome_empresa || p.clientes?.nome || "Sem cliente"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("border-0 text-[10px] font-black uppercase tracking-widest", statusMeta[p.status]?.tone)}>
                    {statusMeta[p.status]?.label || p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 w-32">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full gradient-primary" style={{ width: `${p.progresso}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-white/60">{p.progresso}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {p.data_entrega ? (
                    <div className={cn(
                      "flex items-center gap-1.5 text-[10px] font-bold",
                      new Date(p.data_entrega) < new Date() && p.status !== 'concluido' ? "text-red-400" : "text-white/40"
                    )}>
                      <Clock className="h-3 w-3" />
                      {new Date(p.data_entrega).toLocaleDateString('pt-BR')}
                    </div>
                  ) : <span className="text-white/10 text-[10px]">Não agendado</span>}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                   <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-white/30 hover:text-white" asChild>
                        <Link to={`/admin/projetos/${p.id}`}><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-white/20 hover:text-red-500"
                        onClick={() => requestDelete(() => deleteProject(p.id, p.titulo), "Excluir Projeto", `Deseja remover "${p.titulo}"?`)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-white/20 italic">Nenhum projeto encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <DeleteConfirmDialog {...dialogProps} />
    </motion.div>
  );
}
