import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  MoreVertical, 
  Trash2,
  ExternalLink,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { cn } from "@/lib/utils";

const kanbanColumns = [
  { key: "briefing", label: "📋 Briefing", color: "border-blue-500/50" },
  { key: "design", label: "🎨 Design & Branding", color: "border-purple-500/50" },
  { key: "desenvolvimento", label: "💻 Desenvolvimento", color: "border-amber-500/50" },
  { key: "homologacao", label: "🧪 Testes & SEO", color: "border-violet-500/50" },
  { key: "concluido", label: "🚀 Finalizado", color: "border-emerald-500/50" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProjectsKanban() {
  const navigate = useNavigate();
  const { projects, handleDragEnd, deleteProject, loading } = useProjects();
  const { requestDelete, dialogProps } = useDeleteConfirm();

  if (loading && projects.length === 0) {
    return <div className="p-10 text-white/40 animate-pulse">Sincronizando fluxo...</div>;
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
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Fluxo de Produção</h1>
            <p className="text-xs text-white/40">Visão Kanban de estágios do projeto</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 custom-scrollbar">
          {kanbanColumns.map((col) => {
            const items = projects.filter((p) => p.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-4 min-w-[260px]">
                <div className="flex items-center justify-between px-3 border-l-2 border-primary/30">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{col.label}</span>
                  <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{items.length}</span>
                </div>

                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex flex-col gap-3 min-h-[500px] p-2 rounded-2xl transition-colors",
                        snapshot.isDraggingOver ? "bg-white/[0.03] ring-1 ring-white/10" : "bg-transparent"
                      )}
                    >
                      {items.map((p, index) => (
                        <Draggable key={p.id} draggableId={p.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "group transition-all",
                                snapshot.isDragging ? "z-50" : ""
                              )}
                            >
                              <Card 
                                className={cn(
                                  "glass-card-premium border-white/5 hover:border-primary/20 cursor-grab active:cursor-grabbing transition-all",
                                  snapshot.isDragging ? "ring-2 ring-primary bg-black/60 shadow-2xl scale-[1.03]" : "hover:scale-[1.01]"
                                )}
                                onClick={() => !snapshot.isDragging && navigate(`/admin/projetos/${p.id}`)}
                              >
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                      {p.titulo}
                                    </h3>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        requestDelete(() => deleteProject(p.id, p.titulo), "Excluir Projeto", `Deseja remover "${p.titulo}"?`);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="text-white/40 truncate flex-1">{p.clientes?.nome_empresa || p.clientes?.nome || "Sem cliente"}</span>
                                      <span className={cn(
                                        "font-black",
                                        p.progresso === 100 ? "text-emerald-400" : "text-primary"
                                      )}>{p.progresso}%</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full gradient-primary transition-all duration-500" 
                                        style={{ width: `${p.progresso}%` }}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between">
                                      {p.data_entrega ? (
                                        <div className={cn(
                                          "flex items-center gap-1 text-[9px] font-bold",
                                          new Date(p.data_entrega) < new Date() ? "text-red-400" : "text-white/30"
                                        )}>
                                          <Clock className="h-2.5 w-2.5" />
                                          {new Date(p.data_entrega).toLocaleDateString('pt-BR')}
                                        </div>
                                      ) : <div />}
                                      
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-white/40 hover:text-white" asChild>
                                          <Link to={`/admin/projetos/${p.id}`} onClick={(e) => e.stopPropagation()}>
                                            <ExternalLink className="h-3 w-3" />
                                          </Link>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <DeleteConfirmDialog {...dialogProps} />
    </motion.div>
  );
}
