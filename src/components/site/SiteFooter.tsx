import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import codethioLogo from "@/assets/codethio-logo.jpeg";
import { scrollTo } from "./SiteNavbar";

interface SiteFooterProps {
  onOpenModal: (id: string) => void;
}

export default function SiteFooter({ onOpenModal }: SiteFooterProps) {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">NW</span>
              </div>
              <span className="text-sm font-bold">
                <span className="gradient-text">Novaes</span>
                <span className="text-[hsl(var(--foreground))]">Web</span>
              </span>
            </div>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed max-w-[200px]">
              Soluções digitais para empresas que querem crescer na internet.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-3">Navegação</h4>
            <div className="flex flex-col gap-2">
              {["Serviços", "Soluções", "Processo", "Planos", "Resultados", "Contato"].map((l, i) => (
                <button key={i} onClick={() => scrollTo(`#${l.toLowerCase()}`)} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-left">
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-3">Acesso</h4>
            <div className="flex flex-col gap-2">
              <Link to="/cadastro" className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">Solicitar Orçamento</Link>
              <Link to="/agendar" className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">Agendar Reunião</Link>
              <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer" className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                Falar pelo WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => onOpenModal("privacidade")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-left">Política de Privacidade</button>
              <button onClick={() => onOpenModal("termos")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-left">Termos de Uso</button>
              <button onClick={() => onOpenModal("cookies")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-left">Política de Cookies</button>
            </div>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <img src={codethioLogo} alt="Codethio" className="w-7 h-7 rounded-full object-cover" />
            <p className="text-sm font-bold">
              <span className="text-[hsl(var(--foreground))]">Code</span><span className="text-green-500">thio</span>
            </p>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">— Parceria em Automação Inteligente</span>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            © {new Date().getFullYear()} NovaesWeb — Todos os direitos reservados
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">Ambiente 100% Seguro e Criptografado</span>
          </div>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            Desenvolvido por <span className="font-semibold gradient-text">NovaesWeb</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
