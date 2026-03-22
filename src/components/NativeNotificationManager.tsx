import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function NativeNotificationManager() {
  useEffect(() => {
    // Verificar se estamos no ambiente Electron
    const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
    if (!isElectron) return;

    console.log("NativeNotificationManager: Iniciando escuta em tempo real para Desktop...");
    
    // Notificação de teste ao iniciar para confirmar que o Electron está ouvindo
    (window as any).electron?.send('notify', {
      title: '🔋 Sistema de Notificações Ativo',
      body: 'Você receberá alertas em tempo real sobre novos leads e suporte.',
    });

    // 1. Escutar Novos Leads
    const leadChannel = supabase.channel("native-leads")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload: any) => {
        const lead = payload.new;
        (window as any).electron?.send('notify', {
          title: '🎯 Novo Lead Capturado!',
          body: `${lead.nome} tem interesse em: ${lead.segmento || 'Não informado'}`,
          url: '/admin/leads'
        });
      })
      .subscribe();

    // 2. Escutar Novos Tickets (Suporte)
    const ticketChannel = supabase.channel("native-tickets")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tickets" }, (payload: any) => {
        const ticket = payload.new;
        (window as any).electron?.send('notify', {
          title: '🆘 Novo Ticket de Suporte',
          body: `Ticket ${ticket.codigo}: ${ticket.titulo}`,
          url: '/admin/suporte'
        });
      })
      .subscribe();

    // 3. Escutar Novas Mensagens em Tickets (do Cliente)
    const msgChannel = supabase.channel("native-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_mensagens" }, (payload: any) => {
        const msg = payload.new;
        // Só notificar se a mensagem for do cliente
        if (msg.remetente === 'cliente') {
          (window as any).electron?.send('notify', {
            title: '💬 Nova Mensagem no Suporte',
            body: `${msg.nome}: ${msg.texto.slice(0, 60)}...`,
            url: '/admin/suporte'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadChannel);
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(msgChannel);
    };
  }, []);

  return null; // Componente invisível
}
