import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { subscribeToPush, unsubscribeFromPush, isSubscribed, sendTestNotification, isPushSupported } from "@/lib/push-notifications";

const defaultEmpresa = {
  nome: "novaesweb",
  cnpj: "",
  email: "contato@novaesweb.com.br",
  telefone: "",
  endereco: "",
  logo: "",
};

export function useSettings() {
  const { toast } = useToast();
  const [empresa, setEmpresa] = useState(defaultEmpresa);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [integSaving, setIntegSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [integValues, setIntegValues] = useState({
    whatsapp_webhook: "",
    pix_key: "",
    google_analytics_id: "",
    primary_color: "#e8334a",
    urgency_active: "false",
    urgency_text: "",
    urgency_hours: "2",
    social_proof_active: "true",
  });

  const loadSettings = useCallback(async () => {
    isPushSupported().then(setPushSupported);
    isSubscribed().then(setPushEnabled);

    supabase.from("push_subscriptions").select("id", { count: "exact", head: true })
      .then(({ count }) => setSubCount(count || 0));

    const keys = [
      "nome", "cnpj", "email", "telefone", "endereco", "logo",
      "whatsapp_webhook", "pix_key", "google_analytics_id", "primary_color",
      "urgency_active", "urgency_text", "urgency_hours", "social_proof_active"
    ];

    const { data } = await supabase.from("app_config").select("key, value").in("key", keys);
    
    if (data) {
      const newEmpresa = { ...defaultEmpresa };
      const newIntegs = { ...integValues };
      data.forEach(row => {
        if ((newEmpresa as any)[row.key] !== undefined) (newEmpresa as any)[row.key] = row.value;
        if ((newIntegs as any)[row.key] !== undefined) (newIntegs as any)[row.key] = row.value;
      });
      setEmpresa(newEmpresa);
      setIntegValues(newIntegs);
    }
    setLoading(false);
  }, [integValues]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSaveEmpresa = async () => {
    setLoading(true);
    const updates = Object.entries(empresa).map(([key, value]) => ({ key, value: String(value) }));
    const { error } = await supabase.from("app_config").upsert(updates, { onConflict: "key" });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dados salvos!", description: "Informações da empresa sincronizadas." });
    }
  };

  const handleSaveInteg = async (key: string, value: string) => {
    setIntegSaving(key);
    await supabase.from("app_config").upsert({ key, value }, { onConflict: "key" });
    setIntegSaving(null);
    toast({ title: "Integração salva!" });
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast({ title: "Notificações desativadas" });
      } else {
        const session = await supabase.auth.getSession();
        const userId = session.data.session?.user?.id || "admin";
        const success = await subscribeToPush("admin", userId);
        if (success) {
          setPushEnabled(true);
          toast({ title: "Notificações ativadas!" });
        } else {
          toast({ title: "Falha na ativação", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Erro no push", variant: "destructive" });
    }
    setPushLoading(false);
  };

  const handleTestPush = async () => {
    setTestLoading(true);
    const result = await sendTestNotification();
    if (result.ok) {
      toast({ title: "Pulsar emitido!", description: "Verifique seu terminal de notificações." });
    } else {
      toast({ 
        title: "Falha no pulso", 
        description: result.message || (result.errors && result.errors.length > 0 ? result.errors[0] : "Erro na função de envio"),
        variant: "destructive" 
      });
    }
    setTestLoading(false);
  };

  return {
    empresa, setEmpresa, integValues, setIntegValues, loading, integSaving,
    pushSupported, pushEnabled, pushLoading, testLoading, subCount,
    handleSaveEmpresa, handleSaveInteg, handleTogglePush, handleTestPush,
    refresh: loadSettings
  };
}



