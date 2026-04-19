import { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  Send, 
  Sparkles, 
  User2, 
  ClipboardList, 
  FilePlus2, 
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBriefings } from "@/features/briefings/hooks/useBriefings";
import { briefingStatusMeta } from "@/lib/project-briefings";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BriefingsDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientParam = searchParams.get("cliente");
  const { briefings, clients, loading, kpis, draftBriefings, sentBriefings } = useBriefings();

  useEffect(() => {
    if (loading || !clientParam) return;

    // Deep link logic
    const draft = draftBriefings.find(b => b.cliente_id === clientParam);
    if (draft) {
      navigate(`/admin/briefings/em-andamento/${draft.id}`);
      return;
    }

    const sent = sentBriefings.filter(b => b.cliente_id === clientParam).sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];
    
    if (sent) {
      navigate(`/admin/briefings/enviados/${sent.id}`);
      return;
    }

    navigate(`/admin/briefings/em-andamento/novo?cliente=${clientParam}`);
  }, [loading, clientParam, draftBriefings, sentBriefings, navigate]);

  const navigationItems = [
    {
      href: "/admin/briefings/em-andamento",
      label: "Em construção",
      description: "Monte e prepare briefings.",
      icon: Plus,
      count: kpis.drafts,
      color: "text-amber-400",
    },
    {
      href: "/admin/briefings/enviados",
      label: "Enviados",
      description: "Acompanhe respostas.",
      icon: Send,
      count: kpis.sent,
      color: "text-fuchsia-400",
    },
    {
      href: "/admin/briefings/biblioteca",
      label: "Biblioteca",
      description: "Gerencie perguntas.",
      icon: ClipboardList,
      iconColor: "text-cyan-400",
    },
  ];

  if (loading && !briefings.length) {
    return (
      <div className="flex h-[400px] items-center justify-center text-white/40">
        Carregando painel de briefings...
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-200">
            <Sparkles className="h-3.5 w-3.5" />
            Central de Estratégia
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Briefings</h1>
            <p className="max-w-2xl text-sm text-white/55">
              Gerencie a coleta de informações estratégicas para novos projetos.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild className="border-0 text-white" style={{ background: "var(--gradient-primary)" }}>
            <Link to="/admin/briefings/em-andamento/novo">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Novo Briefing
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white">
            <Link to="/admin/briefings/enviados">
              <History className="mr-2 h-4 w-4" />
              Acompanhar Respostas
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-3">
        {navigationItems.map((item) => (
          <Link key={item.href} to={item.href} className="group">
            <Card className="h-full border-white/10 bg-white/[0.03] transition-all hover:border-fuchsia-500/30 hover:bg-white/[0.06]">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30 group-hover:bg-fuchsia-500/10", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-black text-white">{item.label}</p>
                  <p className="text-sm text-white/45">{item.description}</p>
                </div>
                {item.count !== undefined && (
                  <div className="ml-auto text-2xl font-black text-white/20 group-hover:text-white/40">
                    {item.count}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp}>
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Em construção</CardTitle>
                <CardDescription className="text-white/45">Briefings sendo montados.</CardDescription>
              </div>
              <Button asChild variant="link" className="text-fuchsia-400">
                <Link to="/admin/briefings/em-andamento">Ver todos</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {draftBriefings.slice(0, 5).map((b) => (
                    <Link key={b.id} to={`/admin/briefings/em-andamento/${b.id}`} className="block">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">{b.titulo}</p>
                          <Badge variant="outline" className="border-amber-500/20 text-amber-300">Rascunho</Badge>
                        </div>
                        <p className="mt-1 text-xs text-white/40">Cliente: {b.clientes && !Array.isArray(b.clientes) ? b.clientes.nome_empresa || b.clientes.nome : "Não informado"}</p>
                      </div>
                    </Link>
                  ))}
                  {draftBriefings.length === 0 && (
                    <div className="py-10 text-center text-sm text-white/20">Nenhum briefing em construção.</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Últimos enviados</CardTitle>
                <CardDescription className="text-white/45">Acompanhamento de respostas recentes.</CardDescription>
              </div>
              <Button asChild variant="link" className="text-fuchsia-400">
                <Link to="/admin/briefings/enviados">Ver todos</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {sentBriefings.slice(0, 5).map((b) => (
                    <Link key={b.id} to={`/admin/briefings/enviados/${b.id}`} className="block">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">{b.titulo}</p>
                          <Badge className={cn("border", briefingStatusMeta[b.status].tone)}>{briefingStatusMeta[b.status].label}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-white/40">Cliente: {b.clientes && !Array.isArray(b.clientes) ? b.clientes.nome_empresa || b.clientes.nome : "Não informado"}</p>
                      </div>
                    </Link>
                  ))}
                  {sentBriefings.length === 0 && (
                    <div className="py-10 text-center text-sm text-white/20">Nenhum briefing enviado.</div>
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
