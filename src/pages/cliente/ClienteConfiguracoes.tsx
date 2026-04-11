import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BellRing,
  CheckCircle2,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStoredClientProfile } from "@/lib/client-portal-auth";
import {
  getPushSupportDetails,
  isPushSupported,
  isSubscribed,
  sendPushTestNotification,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-notifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type ClientNotificationRow = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const notificationScopes = [
  "Contrato enviado, visualizado e reassinatura pendente",
  "Briefing do site liberado, reaberto e concluído",
  "Novo extra liberado e mudança relevante no escopo",
  "Projeto criado, atualização publicada e link do site disponível",
  "Nova cobrança ou movimentação importante no financeiro",
];

export default function ClienteConfiguracoes() {
  const cliente = getStoredClientProfile();
  const { toast } = useToast();
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [notifications, setNotifications] = useState<ClientNotificationRow[]>([]);
  const [supportMessage, setSupportMessage] = useState("Verificando suporte de push neste navegador.");

  const loadStatus = useCallback(async () => {
    const [support, subscribed, sessionResult] = await Promise.all([
      getPushSupportDetails(),
      isSubscribed(),
      supabase.auth.getSession(),
    ]);

    setPushSupported(support.supported);
    setSupportMessage(support.message);
    setPushEnabled(subscribed);

    const session = sessionResult.data.session;
    const isMirror =
      session?.user?.user_metadata?.tipo === "admin" ||
      session?.user?.app_metadata?.role === "admin";
    setMirrorMode(Boolean(isMirror));
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!cliente?.id) return;

    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, read, created_at")
      .eq("user_type", "cliente")
      .eq("user_id", cliente.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setNotifications((data as ClientNotificationRow[]) || []);
  }, [cliente?.id]);

  useEffect(() => {
    void loadStatus();
    void loadNotifications();
  }, [loadNotifications, loadStatus]);

  useEffect(() => {
    if (!cliente?.id) return;

    const channel = supabase
      .channel(`cliente-settings-notifications-${cliente.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${cliente.id}`,
        },
        () => {
          void loadNotifications();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cliente?.id, loadNotifications]);

  const handleTogglePush = async () => {
    if (!cliente?.id) return;
    if (mirrorMode) {
      toast({
        title: "Push indisponível no espelhamento",
        description: "Ative notificações usando a conta real do cliente, não no modo espelhado do admin.",
        variant: "destructive",
      });
      return;
    }

    setPushLoading(true);
    try {
      if (pushEnabled) {
        const success = await unsubscribeFromPush();
        if (!success) throw new Error("Não foi possível desativar o push neste navegador.");
        setPushEnabled(false);
        toast({ title: "Notificações desativadas" });
      } else {
        const success = await subscribeToPush("cliente", cliente.id);
        if (!success) throw new Error("O navegador recusou ou falhou ao registrar as notificações.");
        setPushEnabled(true);
        toast({ title: "Notificações ativadas!" });
      }
    } catch (error) {
      toast({
        title: "Falha ao atualizar notificações",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o push.",
        variant: "destructive",
      });
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (!cliente?.id) return;
    setTestLoading(true);
    const result = await sendPushTestNotification("cliente", cliente.id, "/cliente/configuracoes");
    setTestLoading(false);

    if (result.ok) {
      toast({ title: "Teste enviado", description: "Verifique a notificação neste navegador." });
      return;
    }

    toast({
      title: "Falha no teste",
      description: result.message || "O push não respondeu como esperado.",
      variant: "destructive",
    });
  };

  if (!cliente) {
    return (
      <div className="min-h-[320px] flex items-center justify-center">
        <Card className="w-full max-w-xl border-white/10 bg-white/[0.04]">
          <CardContent className="p-8 text-center text-white/70">
            Não foi possível identificar o perfil do cliente para configurar notificações.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 min-h-screen pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-200">
          <Sparkles className="h-3.5 w-3.5" />
          Configurações do portal
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Notificações do cliente</h1>
        <p className="max-w-2xl text-sm text-white/60">
          Controle o push deste navegador e acompanhe os avisos mais recentes sobre contratos, extras, projetos e financeiro.
        </p>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={fadeUp} className="space-y-6">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.14),rgba(194,24,91,0.16))]">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-2 text-white">
                <BellRing className="h-5 w-5 text-fuchsia-200" />
                Push em tempo real
              </CardTitle>
              <CardDescription className="text-white/50">
                Ative alertas nativos para receber novidade mesmo fora da aba do portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-black/20 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black uppercase tracking-wide text-white">Status do terminal</p>
                    {pushEnabled ? (
                      <Badge className="border-0 bg-emerald-500/20 text-emerald-300">Ativo</Badge>
                    ) : (
                      <Badge className="border-0 bg-white/10 text-white/60">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/50">
                    {mirrorMode
                      ? "Modo espelhado do admin detectado. O push deve ser ativado pela conta real do cliente."
                      : supportMessage}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={pushEnabled}
                    onCheckedChange={handleTogglePush}
                    disabled={pushLoading || !pushSupported || mirrorMode}
                    className="data-[state=checked]:bg-fuchsia-600"
                  />
                  <span className="text-xs font-semibold text-white/70">
                    {pushLoading ? "Atualizando..." : pushEnabled ? "Push ligado" : "Push desligado"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="border-0 text-white"
                  style={{ background: "linear-gradient(135deg, #7b1fa2, #e8334a, #c2185b)" }}
                  onClick={handleTestPush}
                  disabled={!pushEnabled || testLoading || mirrorMode}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  {testLoading ? "Enviando teste..." : "Testar notificação"}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => void loadNotifications()}
                >
                  Atualizar histórico
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-fuchsia-200" />
                Eventos que disparam alerta
              </CardTitle>
              <CardDescription className="text-white/50">
                Os avisos mais importantes do portal do cliente ficam concentrados aqui.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {notificationScopes.map((scope) => (
                <div
                  key={scope}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75"
                >
                  {scope}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5 text-fuchsia-200" />
                Histórico recente
              </CardTitle>
              <CardDescription className="text-white/50">
                Últimos avisos enviados para este cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[460px] pr-4">
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center text-sm text-white/45">
                      Nenhuma notificação registrada ainda.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white">{notification.title}</p>
                            <p className="text-xs leading-relaxed text-white/60">{notification.body}</p>
                          </div>
                          {!notification.read && (
                            <Badge className="border-0 bg-fuchsia-500/20 text-fuchsia-200">Nova</Badge>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-white/35">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
