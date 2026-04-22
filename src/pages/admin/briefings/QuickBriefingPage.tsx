import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, CheckCircle2, ChevronRight, LayoutList, Send, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BriefingsPageHeader } from "@/features/briefings/admin/views";
import { useAdminBriefingsOverview, useBriefingEditor } from "@/features/briefings/admin/hooks";
import { ADMIN_BRIEFINGS_HOME, getAdminBriefingSentDetailPath } from "@/features/briefings/admin/routes";
import { getClientDisplayName } from "@/features/briefings/admin/types";
import { buildTemplateFieldDraft } from "@/features/briefings/admin/api";

export default function QuickBriefingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, clients, templates, reload } = useAdminBriefingsOverview();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Reusing the editor logic for persistence
  const editorState = useBriefingEditor({
    mode: "draft",
    clients,
    briefings: [], 
    templates,
    reloadOverview: reload,
  });

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const handleToggleTemplate = (id: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(templates.map((t) => t.id));
    }
  };

  const handleSend = async () => {
    if (!selectedClientId) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }
    if (selectedTemplateIds.length === 0) {
      toast({ title: "Selecione pelo menos uma pergunta", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      // 1. Configura o editor com o cliente
      editorState.selectClient(selectedClientId);
      
      // 2. Monta os campos a partir dos templates selecionados
      const nextFields = selectedTemplateIds.map((id, index) => {
        const template = templates.find((t) => t.id === id)!;
        return buildTemplateFieldDraft(template, index);
      });

      // 3. Atualiza o estado interno do editor
      editorState.setFieldDrafts(nextFields);
      
      // 4. Salva e envia
      // Note: O persist usa o editorState.editor e fieldDrafts que acabamos de setar.
      // Como o state setter é assíncrono, vamos passar os dados atualizados para o persist se ele permitir,
      // mas o persist do hook usa o state interno. 
      // Então precisamos garantir que o state foi atualizado ou chamar o persist com os dados.
      
      // No hooks.tsx, o persist usa as variáveis locais (editor, fieldDrafts) que são capturadas no momento da criação da fn persist (useEffect/useCallback dependency).
      // Se chamarmos persist logo após setFieldDrafts, ele usará o valor antigo.
      
      // SOLUÇÃO: Vamos implementar a persistência aqui chamando diretamente a API saveAdminBriefing
      // para evitar problemas de race condition com o state do React.
      
      const { saveAdminBriefing } = await import("@/features/briefings/admin/api");
      
      const result = await saveAdminBriefing({
        mode: "send",
        editor: {
          ...editorState.editor,
          cliente_id: selectedClientId,
          titulo: `Briefing - ${getClientDisplayName(selectedClient)}`,
        },
        fieldDrafts: nextFields,
        persistedFieldIds: [],
        selectedClientId,
        client: selectedClient,
        snapshot: { briefing: "", references: "" },
      });

      toast({
        title: "Briefing enviado com sucesso!",
        description: `Enviado para ${getClientDisplayName(selectedClient)}`,
      });
      navigate(getAdminBriefingSentDetailPath(result.briefing.id));
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="p-10 text-white/40">Carregando modulo...</div>;

  return (
    <div className="space-y-6 pb-20">
      <BriefingsPageHeader
        title="Envio Rápido"
        description="Selecione um cliente e as perguntas prontas para enviar o briefing instantaneamente."
        breadcrumbs={[
          { label: "Briefings", to: ADMIN_BRIEFINGS_HOME },
          { label: "Envio Rápido" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Passo 1: Cliente */}
          <Card className="border-white/10 bg-white/[0.02] overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-white/[0.02] border-b border-white/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-white">1. Selecione o Cliente</CardTitle>
                <CardDescription>Defina o destinatário deste briefing</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="h-14 border-white/10 bg-black/20 text-white text-lg">
                  <SelectValue placeholder="Escolha um cliente na lista..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#120d18] text-white">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientDisplayName(client)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Passo 2: Perguntas */}
          <Card className="border-white/10 bg-white/[0.02] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
                  <LayoutList className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white">2. Perguntas Prontas</CardTitle>
                  <CardDescription>Selecione o conteúdo do briefing</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-8"
              >
                {selectedTemplateIds.length === templates.length ? "Desmarcar tudo" : "Selecionar todas"}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3 md:grid-cols-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleToggleTemplate(template.id)}
                    className={`
                      flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all group
                      ${selectedTemplateIds.includes(template.id) 
                        ? "border-fuchsia-500/50 bg-fuchsia-500/10 shadow-[0_0_20px_-10px_rgba(217,70,239,0.3)]" 
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                      }
                    `}
                  >
                    <div className="mt-1">
                      <Checkbox
                        checked={selectedTemplateIds.includes(template.id)}
                        onCheckedChange={() => handleToggleTemplate(template.id)}
                        className="h-5 w-5 border-white/20 data-[state=checked]:bg-fuchsia-500 data-[state=checked]:border-fuchsia-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white group-hover:text-fuchsia-200 transition-colors">{template.label}</p>
                      <p className="text-xs text-white/40 line-clamp-1">{template.help_text}</p>
                      <div className="mt-2 inline-flex rounded-md bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/30 border border-white/5">
                        {template.section_name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar de Ação */}
        <div className="space-y-6">
          <Card className="sticky top-6 overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-fuchsia-500 to-primary shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white">Resumo do Envio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 rounded-2xl bg-black/40 p-4 border border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Cliente Destino</span>
                  <span className={`text-sm font-bold ${selectedClient ? 'text-white' : 'text-white/20 italic'}`}>
                    {selectedClient ? getClientDisplayName(selectedClient) : "Nenhum selecionado"}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total de Perguntas</span>
                  <span className={`text-sm font-bold ${selectedTemplateIds.length > 0 ? 'text-fuchsia-400' : 'text-white/20 italic'}`}>
                    {selectedTemplateIds.length > 0 ? `${selectedTemplateIds.length} perguntas selecionadas` : "Nenhuma selecionada"}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-primary to-fuchsia-600 font-black text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
                disabled={!selectedClientId || selectedTemplateIds.length === 0 || isSending}
                onClick={handleSend}
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Send className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <>
                    <Send className="mr-3 h-5 w-5" />
                    ENVIAR AGORA
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2 justify-center py-2">
                <CheckCircle2 className="h-3 w-3 text-white/20" />
                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">
                  O cliente receberá notificação por email e whatsapp
                </p>
              </div>
            </CardContent>
          </Card>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-white/5 bg-black/40 p-6 space-y-4"
          >
             <div className="flex items-center gap-3 text-fuchsia-400">
               <div className="p-2 rounded-lg bg-fuchsia-500/10">
                 <CheckCircle2 className="h-4 w-4" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest">Atenção</span>
             </div>
             <p className="text-xs text-white/40 leading-relaxed font-medium">
               Esta ferramenta é otimizada para velocidade. Ao clicar em enviar, o briefing é criado, as perguntas são clonadas da biblioteca e o status é definido como <strong>ENVIADO</strong> imediatamente.
             </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
