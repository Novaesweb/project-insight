import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Building2, ClipboardList, MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { subscribeToPush, unsubscribeFromPush, isSubscribed, isPushSupported } from "@/lib/push-notifications";
import {
  getStoredClientProfile,
  loadClientProfileById,
  persistClientProfile,
  sanitizeClientProfile,
} from "@/lib/client-portal-auth";
import {
  fetchAddressByCep,
  formatCep,
  formatCpfCnpj,
  formatPhone,
  getDocumentoProgressText,
  getPhoneProgressText,
  normalizeEmailSuggestion,
} from "@/lib/client-registration";
import {
  getChecklistStatusMeta,
  normalizeChecklistText,
} from "@/lib/client-checklist";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const emptyDados = {
  nome: "",
  nome_empresa: "",
  email: "",
  documento: "",
  whatsapp: "",
  telefone: "",
  instagram: "",
  site_url: "",
  cep: "",
  endereco: "",
  numero_endereco: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

const cadastroPessoalFields = [
  { label: "Nome completo", key: "nome" },
  { label: "Empresa / marca", key: "nome_empresa" },
  { label: "E-mail", key: "email", type: "email" },
  { label: "CPF / CNPJ", key: "documento" },
  { label: "WhatsApp", key: "whatsapp" },
  { label: "Telefone secundário", key: "telefone" },
  { label: "Instagram", key: "instagram" },
  { label: "Site", key: "site_url" },
] as const;

const enderecoFields = [
  { label: "CEP", key: "cep" },
  { label: "Endereço", key: "endereco" },
  { label: "Número", key: "numero_endereco" },
  { label: "Complemento", key: "complemento" },
  { label: "Bairro", key: "bairro" },
  { label: "Cidade", key: "cidade" },
  { label: "Estado", key: "estado" },
] as const;

type ClientChecklistItem = Tables<"cliente_checklist_items">;

function formatClientFieldValue(key: string, value: string) {
  if (key === "documento") return formatCpfCnpj(value);
  if (key === "whatsapp" || key === "telefone") return formatPhone(value);
  if (key === "cep") return formatCep(value);
  return value;
}

function getClientFieldHelperText(key: string, value: string) {
  if (key === "documento") return getDocumentoProgressText(value);
  if (key === "whatsapp" || key === "telefone") return getPhoneProgressText(value);
  return "";
}

export default function ClienteDados() {
  const cliente = getStoredClientProfile();
  const clienteId = cliente?.id ?? null;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupportedState] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [checklist, setChecklist] = useState<ClientChecklistItem[]>([]);
  const [checklistOriginal, setChecklistOriginal] = useState<Record<string, ClientChecklistItem>>({});
  const [dados, setDados] = useState({
    ...emptyDados,
    nome: cliente?.nome || "",
    email: cliente?.email || "",
  });

  useEffect(() => {
    isPushSupported().then(setPushSupportedState);
    isSubscribed().then(setPushEnabled);
  }, []);

  useEffect(() => {
    if (!clienteId) {
      setLoadingDados(false);
      return;
    }

    let active = true;

    const loadDados = async () => {
      try {
        const profile = await loadClientProfileById(clienteId);

        if (!active || !profile) return;

        setDados({
          nome: profile.nome || "",
          nome_empresa: profile.nome_empresa || "",
          email: profile.email || "",
          documento: profile.documento || "",
          whatsapp: profile.whatsapp || "",
          telefone: profile.telefone || "",
          instagram: profile.instagram || "",
          site_url: profile.site_url || "",
          cep: profile.cep || "",
          endereco: profile.endereco || "",
          numero_endereco: profile.numero_endereco || "",
          complemento: profile.complemento || "",
          bairro: profile.bairro || "",
          cidade: profile.cidade || "",
          estado: profile.estado || "",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao carregar cadastro",
          description: error?.message || "Não foi possível carregar seus dados.",
          variant: "destructive",
        });
      } finally {
        if (active) setLoadingDados(false);
      }
    };

    void loadDados();

    return () => {
      active = false;
    };
  }, [clienteId, toast]);

  useEffect(() => {
    if (!clienteId) {
      setLoadingChecklist(false);
      return;
    }

    let active = true;

    const loadChecklist = async () => {
      const { data, error } = await supabase
        .from("cliente_checklist_items")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("ordem", { ascending: true });

      if (!active) return;

      if (error) {
        toast({
          title: "Erro ao carregar checklist",
          description: error.message,
          variant: "destructive",
        });
        setLoadingChecklist(false);
        return;
      }

      const items = (data || []) as ClientChecklistItem[];
      setChecklist(items);
      setChecklistOriginal(Object.fromEntries(items.map((item) => [item.id, item])));
      setLoadingChecklist(false);
    };

    void loadChecklist();

    return () => {
      active = false;
    };
  }, [clienteId, toast]);

  const handleSave = async () => {
    if (!clienteId) return;

    setLoading(true);
    const payload = {
      nome: dados.nome.trim(),
      nome_empresa: dados.nome_empresa.trim() || null,
      email: dados.email.trim().toLowerCase(),
      documento: dados.documento.trim() || null,
      whatsapp: dados.whatsapp.trim() || null,
      telefone: dados.telefone.trim() || null,
      instagram: dados.instagram.trim() || null,
      site_url: dados.site_url.trim() || null,
      cep: dados.cep.trim() || null,
      endereco: dados.endereco.trim() || null,
      numero_endereco: dados.numero_endereco.trim() || null,
      complemento: dados.complemento.trim() || null,
      bairro: dados.bairro.trim() || null,
      cidade: dados.cidade.trim() || null,
      estado: dados.estado.trim() || null,
    };

    const { error } = await supabase.from("clientes").update(payload as never).eq("id", clienteId);

    if (!error) {
      persistClientProfile(sanitizeClientProfile({ ...cliente, ...payload, id: clienteId }));
      toast({ title: "Cadastro atualizado!", description: "Seus dados foram salvos com sucesso." });
    } else {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }

    setLoading(false);
  };

  const handleDadosChange = (key: string, value: string) => {
    setDados((prev) => ({
      ...prev,
      [key]: formatClientFieldValue(key, value),
    }));
  };

  const handleEmailBlur = (value: string) => {
    setDados((prev) => ({
      ...prev,
      email: normalizeEmailSuggestion(value),
    }));
  };

  const handleCepLookup = async (value: string) => {
    const normalizedCep = formatCep(value);

    setDados((prev) => ({
      ...prev,
      cep: normalizedCep,
    }));

    try {
      const address = await fetchAddressByCep(normalizedCep);
      if (!address) return;

      setDados((prev) => ({
        ...prev,
        cep: normalizedCep,
        endereco: address.endereco || prev.endereco,
        bairro: address.bairro || prev.bairro,
        cidade: address.cidade || prev.cidade,
        estado: address.estado || prev.estado,
        complemento: prev.complemento || address.complemento || "",
      }));

      toast({
        title: "CEP localizado",
        description: "Endereço preenchido automaticamente no seu cadastro.",
      });
    } catch (error: any) {
      toast({
        title: "Não foi possível buscar o CEP",
        description: error?.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const handleChecklistValueChange = (itemId: string, value: string) => {
    setChecklist((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        const normalizedValue = normalizeChecklistText(value);
        const nextStatus = normalizedValue
          ? item.status === "pendente"
            ? "preenchido"
            : item.status
          : "pendente";

        return {
          ...item,
          valor_texto: value,
          status: nextStatus,
        };
      })
    );
  };

  const handleSaveChecklist = async () => {
    if (!clienteId || !checklist.length) return;

    setSavingChecklist(true);

    const payload = checklist.map((item) => {
      const normalizedValue = normalizeChecklistText(item.valor_texto);
      const originalItem = checklistOriginal[item.id];
      const contentChanged = normalizeChecklistText(originalItem?.valor_texto) !== normalizedValue;

      let nextStatus = item.status;

      if (!normalizedValue) {
        nextStatus = "pendente";
      } else if (contentChanged || nextStatus === "pendente" || originalItem?.status === "aprovado") {
        nextStatus = "preenchido";
      }

      return {
        id: item.id,
        valor_texto: normalizedValue || null,
        status: nextStatus,
        updated_by: "cliente",
      };
    });

    const { error } = await supabase.from("cliente_checklist_items").upsert(payload as never[]);

    if (error) {
      toast({
        title: "Erro ao salvar checklist",
        description: error.message,
        variant: "destructive",
      });
      setSavingChecklist(false);
      return;
    }

    const refreshedChecklist = checklist.map((item) => {
      const normalizedValue = normalizeChecklistText(item.valor_texto);
      const originalItem = checklistOriginal[item.id];
      const contentChanged = normalizeChecklistText(originalItem?.valor_texto) !== normalizedValue;

      if (!normalizedValue) {
        return { ...item, valor_texto: null, status: "pendente", updated_by: "cliente" };
      }

      if (contentChanged || item.status === "pendente" || originalItem?.status === "aprovado") {
        return { ...item, valor_texto: normalizedValue, status: "preenchido", updated_by: "cliente" };
      }

      return { ...item, valor_texto: normalizedValue, updated_by: "cliente" };
    });

    setChecklist(refreshedChecklist);
    setChecklistOriginal(Object.fromEntries(refreshedChecklist.map((item) => [item.id, item])));
    setSavingChecklist(false);

    toast({
      title: "Checklist atualizado!",
      description: "Suas informações iniciais foram enviadas para a equipe da NovaesWeb.",
    });
  };

  const handleTogglePush = async () => {
    if (!clienteId) return;

    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast({ title: "Notificações desativadas" });
      } else {
        const success = await subscribeToPush("cliente", clienteId);
        if (success) {
          setPushEnabled(true);
          toast({ title: "Notificações ativadas!", description: "Você receberá alertas sobre seus projetos." });
        } else {
          toast({ title: "Não foi possível ativar", description: "Verifique se permitiu notificações no navegador.", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Erro ao configurar notificações", variant: "destructive" });
    }
    setPushLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!dados.email) {
      toast({ title: "E-mail indisponível", description: "Atualize seu e-mail antes de solicitar uma redefinição.", variant: "destructive" });
      return;
    }

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(dados.email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/cliente/reset-password`,
    });
    setResetLoading(false);

    if (error) {
      toast({ title: "Não foi possível enviar o link", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Link enviado", description: "Confira seu e-mail para redefinir a senha do portal." });
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6 pb-10">
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-white">Cadastro do Cliente</h1>
        <p className="text-sm text-white/45">Aqui você e a equipe da NovaesWeb podem manter sua ficha sempre atualizada.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Dados principais</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cadastroPessoalFields.map((field) => (
                  <div key={field.key}>
                    <Label className="text-xs text-white/50">{field.label}</Label>
                    <Input
                      type={field.type ?? "text"}
                      value={dados[field.key]}
                      onChange={(e) => handleDadosChange(field.key, e.target.value)}
                      onBlur={(e) => {
                        if (field.key === "email") {
                          handleEmailBlur(e.target.value);
                        }
                      }}
                      className="border-0 text-white mt-1 h-9 text-sm"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                    {getClientFieldHelperText(field.key, dados[field.key]) && (
                      <p className="text-[10px] text-white/25 mt-1">
                        {getClientFieldHelperText(field.key, dados[field.key])}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Endereço e localização</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enderecoFields.map((field) => (
                  <div key={field.key} className={field.key === "endereco" ? "md:col-span-2" : ""}>
                    <Label className="text-xs text-white/50">{field.label}</Label>
                    <Input
                      value={dados[field.key]}
                      onChange={(e) => handleDadosChange(field.key, e.target.value)}
                      onBlur={(e) => {
                        if (field.key === "cep") {
                          void handleCepLookup(e.target.value);
                        }
                      }}
                      className="border-0 text-white mt-1 h-9 text-sm"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                  </div>
                ))}
              </div>

              <Button disabled={loading || loadingDados || !clienteId} className="gradient-primary border-0 text-white" onClick={handleSave}>
                {loading ? "Salvando..." : loadingDados ? "Carregando..." : "Salvar cadastro"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Checklist Inicial</h2>
              </div>

              <p className="text-xs text-white/45">
                Preencha o máximo possível aqui. A equipe da NovaesWeb recebe tudo no admin e aprova os itens para iniciar seu projeto.
              </p>

              {loadingChecklist ? (
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-white/35">
                  Carregando checklist...
                </div>
              ) : checklist.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-white/35">
                  Nenhum item de checklist foi gerado para este cliente ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {checklist.map((item) => {
                    const statusMeta = getChecklistStatusMeta(item.status);

                    return (
                      <div key={item.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white">{item.titulo}</p>
                            <p className="text-xs text-white/40">{item.descricao}</p>
                          </div>
                          <Badge variant="outline" className={`border-[0.5px] rounded-full py-1 px-3 ${statusMeta.className}`}>
                            {statusMeta.label}
                          </Badge>
                        </div>
                        <Textarea
                          value={item.valor_texto || ""}
                          onChange={(event) => handleChecklistValueChange(item.id, event.target.value)}
                          className="border-0 min-h-[110px] text-white text-sm"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                          placeholder="Digite aqui as informações desse item..."
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                disabled={savingChecklist || loadingChecklist || !checklist.length}
                className="gradient-primary border-0 text-white"
                onClick={handleSaveChecklist}
              >
                {savingChecklist ? "Salvando checklist..." : "Salvar checklist"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Segurança do acesso</h2>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/50 leading-relaxed">
                  Sua senha é gerenciada pelo Supabase Auth. Se precisar trocar, envie um link de redefinição seguro para o seu e-mail.
                </p>
                <p className="text-[10px] text-white/30 italic">Nenhuma senha fica mais salva em texto puro no seu cadastro.</p>
              </div>
              <Button disabled={resetLoading} className="gradient-primary border-0 text-white" onClick={handlePasswordReset}>
                {resetLoading ? "Enviando..." : "Receber link para nova senha"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BellRing className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Notificações Push</h2>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">Receba alertas sobre atualizações de projetos, contratos e movimentações importantes — mesmo com o site fechado.</p>

              {!pushSupported ? (
                <p className="text-xs text-yellow-400">Seu navegador não suporta notificações push.</p>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 mt-4">
                  <div>
                    <p className="text-xs font-medium text-white">{pushEnabled ? "Ativadas" : "Desativadas"}</p>
                  </div>
                  <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} disabled={pushLoading || !clienteId} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
