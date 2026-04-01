import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentActivityProps {
  activity: Array<{
    id: string;
    title: string;
    body: string;
    created_at: string;
    read: boolean;
  }>;
}

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function RecentActivity({ activity }: RecentActivityProps) {
  const items = activity.slice(0, 8);

  return (
    <motion.div variants={fadeUp}>
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Atividade Recente</h3>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma atividade recente.</p>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{
                    background: item.read ? 'hsl(var(--muted-foreground) / 0.3)' : 'hsl(var(--primary))',
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.body}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                    <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
