import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SystemCostsSection from "@/components/admin/financeiro/SystemCostsSection";
import { ServerCog } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CustosSistema() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
                <ServerCog className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base text-white">Custos do Sistema</CardTitle>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Área exclusiva para controlar hospedagem, domínio, ferramentas, programação e outros custos internos da operação.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
              Essa página separa as despesas internas da NovaesWeb do financeiro dos clientes, deixando o painel mais organizado para gestão operacional.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <SystemCostsSection />
    </motion.div>
  );
}
