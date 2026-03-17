import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
  type: string;
}

interface NotificationCenterProps {
  userType: "admin" | "cliente";
  userId: string;
}

export default function NotificationCenter({ userType, userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification-sound.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_type", userType)
      .order("created_at", { ascending: false })
      .limit(30);

    if (userType !== "admin") {
      query = query.eq("user_id", userId);
    }

    const { data } = await query;
    if (data) setNotifications(data as Notification[]);
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription for instant updates
    const channel = supabase
      .channel(`notifications-${userType}-${userId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_type=eq.${userType}`,
        },
        (payload) => {
          const n = payload.new as Notification;
          if (userType === "admin" || n.user_id === userId) {
            setNotifications(prev => {
              if (prev.some(existing => existing.id === n.id)) return prev;
              return [n, ...prev].slice(0, 30);
            });
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[NotificationCenter] Realtime ${userType}: ${status}`);
      });

    // Fallback polling every 15s
    const interval = setInterval(fetchNotifications, 15000);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userType, userId]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true } as any).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true } as any).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[0.6rem] text-white font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 border-[hsl(var(--border))]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <h3 className="text-sm font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-[hsl(var(--primary))] hover:underline">
              Marcar todas como lidas
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.url) window.location.href = n.url;
                }}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors",
                  !n.read && "bg-[hsl(var(--primary)/0.05)]"
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] mt-1.5 shrink-0" />}
                  <div className={cn(!n.read ? "" : "ml-4")}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[0.65rem] text-[hsl(var(--muted-foreground))] mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
