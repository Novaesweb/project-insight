import { ArrowLeft, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ContractsRebuildNoticeProps = {
  audienceLabel: string;
  backHref: string;
  backLabel: string;
};

export default function ContractsRebuildNotice({
  audienceLabel,
  backHref,
  backLabel,
}: ContractsRebuildNoticeProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <Card className="w-full max-w-2xl overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(123,31,162,0.14),rgba(232,51,74,0.08),rgba(255,255,255,0.03))] shadow-[0_24px_64px_rgba(14,7,22,0.34)]">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
            <Wrench className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.28em] text-primary/80">
            {audienceLabel}
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">Contratos em reconstrução</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            Este módulo foi desligado do painel atual para uma reconstrução completa. O acesso antigo continua
            disponível apenas como aviso, sem carregar o fluxo legado de contratos.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild className="rounded-xl border-0 text-white" style={{ background: "var(--gradient-primary)" }}>
              <Link to={backHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
