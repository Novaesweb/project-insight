import { motion } from "framer-motion";
import { BriefingsPageHeader } from "@/features/briefings/admin/views";
import { ADMIN_BRIEFINGS_HOME } from "@/features/briefings/admin/routes";
import { useQuickBriefing } from "@/features/briefings/admin/hooks/useQuickBriefing";
import { ClientSelectionStep } from "@/features/briefings/admin/components/quick-briefing/ClientSelectionStep";
import { QuestionsSelectionStep } from "@/features/briefings/admin/components/quick-briefing/QuestionsSelectionStep";
import { BriefingActionSidebar } from "@/features/briefings/admin/components/quick-briefing/BriefingActionSidebar";

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function QuickBriefingPage() {
  const {
    loading,
    clients,
    templates,
    selectedClientId,
    setSelectedClientId,
    selectedTemplateIds,
    toggleTemplate,
    selectAllTemplates,
    selectedClient,
    isSending,
    handleSend
  } = useQuickBriefing();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[10px] font-black uppercase tracking-[0.5em] text-[#EC4899]"
        >
          Sincronizando Sistemas Elite...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-10 pb-20" 
      initial="hidden" 
      animate="show" 
      variants={stagger}
    >
      <BriefingsPageHeader
        title="Envio de Elite"
        description="Protocolo de envio instantâneo. Selecione o ecossistema e as diretrizes estratégicas."
        breadcrumbs={[
          { label: "Briefings", to: ADMIN_BRIEFINGS_HOME },
          { label: "Envio Rápido" },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <ClientSelectionStep 
            clients={clients} 
            selectedClientId={selectedClientId} 
            onSelect={setSelectedClientId} 
          />

          <QuestionsSelectionStep 
            templates={templates} 
            selectedTemplateIds={selectedTemplateIds} 
            onToggle={toggleTemplate} 
            onSelectAll={selectAllTemplates} 
          />
        </div>

        <BriefingActionSidebar 
          selectedClient={selectedClient} 
          selectedTemplateCount={selectedTemplateIds.length} 
          isSending={isSending} 
          onSend={handleSend} 
        />
      </div>
    </motion.div>
  );
}
