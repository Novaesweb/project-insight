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
  briefing: { label: "Briefing", tone: "bg-blue-50 text-blue-600 border-blue-100" },
  design: { label: "Design", tone: "bg-purple-50 text-purple-600 border-purple-100" },
  desenvolvimento: { label: "Dev", tone: "bg-amber-50 text-amber-600 border-amber-100" },
  homologacao: { label: "SEO/Testes", tone: "bg-violet-50 text-violet-600 border-violet-100" },
  concluido: { label: "Finalizado", tone: "bg-emerald-50 text-emerald-600 border-emerald-100" },
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
    return <div className="p-10 text-slate-400 animate-pulse">Carregando lista de projetos...</div>;
  }

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
            <Link to="/admin/projetos"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-5xl font-light tracking-tight text-slate-900 md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Base de <span className="text-brand-gradient italic">Projetos</span>
            </h1>
            <p className="text-sm text-slate-500 mt-2">Gerenciamento operacional da carteira</p>
          </div>
        </div>
        <Button asChild className="bg-brand-gradient text-white font-black h-12 rounded-2xl px-8 text-[10px] uppercase tracking-widest shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.02] transition-all">
          <Link to="/admin/projetos/kanban">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Ver no Kanban
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-premium border-slate-200 p-1">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#EC4899] transition-colors" />
            <Input 
              placeholder="Buscar por projeto ou cliente..." 
              className="pl-10 bg-white/50 border-slate-100 text-slate-900 text-sm h-11 rounded-2xl focus:ring-[#7C3AED]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 border-slate-200 text-slate-500 hover:text-slate-900 px-6 rounded-2xl bg-white/50">
            <Filter className="h-4 w-4 mr-2" /> <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
          </Button>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="glass-premium border-slate-200 overflow-hidden shadow-sm bg-white/80">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="text-slate-400 text-[10px] uppercase font-black tracking-wider pl-8">Projeto</TableHead>
              <TableHead className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Status</TableHead>
              <TableHead className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Progresso</TableHead>
              <TableHead className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Entrega</TableHead>
              <TableHead className="text-right text-slate-400 text-[10px] uppercase font-black tracking-wider pr-8">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((p) => (
              <TableRow key={p.id} className="border-slate-100 hover:bg-slate-50 cursor-pointer group transition-colors" onClick={() => navigate(`/admin/projetos/${p.id}`)}>
                <TableCell className="pl-8 py-6">
                  <div>
                    <p className="text-sm font-black text-slate-900 group-hover:text-[#EC4899] transition-colors">{p.titulo}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{p.clientes?.nome_empresa || p.clientes?.nome || "Sem cliente"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1", statusMeta[p.status]?.tone)}>
                    {statusMeta[p.status]?.label || p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 w-32">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-brand-gradient" style={{ width: `${p.progresso}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{p.progresso}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {p.data_entrega ? (
                    <div className={cn(
                      "flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                      new Date(p.data_entrega) < new Date() && p.status !== 'concluido' ? "text-rose-500" : "text-slate-400"
                    )}>
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(p.data_entrega).toLocaleDateString('pt-BR')}
                    </div>
                  ) : <span className="text-slate-200 text-[10px] font-black uppercase tracking-widest">Não agendado</span>}
                </TableCell>
                <TableCell className="text-right pr-8" onClick={(e) => e.stopPropagation()}>
                   <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" asChild>
                        <Link to={`/admin/projetos/${p.id}`}><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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
                <TableCell colSpan={5} className="text-center py-20 text-slate-300 italic">Nenhum projeto encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <DeleteConfirmDialog {...dialogProps} />
    </motion.div>
  );
}
