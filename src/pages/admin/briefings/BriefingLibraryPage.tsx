import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBriefingLibrary } from "@/features/briefings/hooks/useBriefingLibrary";
import { BriefingLibraryCRUD } from "@/features/briefings/components/BriefingLibraryCRUD";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BriefingLibraryPage() {
  const { templates, sections, loading, upsertTemplate, deleteTemplate, toggleTemplateActive } = useBriefingLibrary();

  if (loading) return <div className="p-10 text-white/40">Carregando biblioteca...</div>;

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="mb-2 -ml-2 text-white/40 hover:text-white">
            <Link to="/admin/briefings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Painel
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Biblioteca de Perguntas</h1>
              <p className="text-sm text-white/55">Gerencie os modelos de perguntas para os briefings.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <BriefingLibraryCRUD 
          templates={templates}
          sections={sections}
          onUpsert={upsertTemplate}
          onDelete={deleteTemplate}
          onToggleActive={toggleTemplateActive}
        />
      </motion.div>
    </motion.div>
  );
}
