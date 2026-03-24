import { Link } from "react-router-dom";
import { ShieldCheck, Star, Users, Target, Lock, FileText } from "lucide-react";
import codethioLogo from "@/assets/codethio-logo.jpeg";
import { scrollTo } from "./SiteNavbar";

interface SiteFooterProps {
  onOpenModal: (id: string) => void;
}

export default function SiteFooter({ onOpenModal }: SiteFooterProps) {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs uppercase">NW</span>
              </div>
              <span className="text-base font-bold">
                <span className="gradient-text">Novaes</span>
                <span className="text-[hsl(var(--foreground))]">Web</span>
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              Transformando a presença digital de empresas locais com tecnologia de alta performance e design premium.
            </p>
          </div>

          {/* Navegação Col */}
          <div>
            <h4 className="text-[10px] font-black text-[hsl(var(--foreground))] uppercase tracking-[0.2em] mb-6">Navegação</h4>
            <div className="flex flex-col gap-3">
              {["Serviços", "Soluções", "Processo", "Planos", "Resultados", "Contato"].map((l, i) => (
                <button key={i} onClick={() => scrollTo(`#${l.toLowerCase()}`)} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all text-left flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" /> {l}
                </button>
              ))}
            </div>
          </div>

          {/* Institucional Col */}
          <div>
            <h4 className="text-[10px] font-black text-[hsl(var(--foreground))] uppercase tracking-[0.2em] mb-6">Institucional</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Sobre a NovaesWeb", id: "sobre", icon: Star },
                { label: "Quem Somos", id: "quem-somos", icon: Users },
                { label: "Diferenciais", id: "diferenciais", icon: Target },
                { label: "Demonstração", id: "demonstracao", icon: Zap },
              ].map((l, i) => (
                <button key={i} onClick={() => onOpenModal(l.id)} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all text-left flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" /> {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suporte Col */}
          <div>
            <h4 className="text-[10px] font-black text-[hsl(var(--foreground))] uppercase tracking-[0.2em] mb-6">Suporte & Legal</h4>
            <div className="flex flex-col gap-3">
              <button onClick={() => onOpenModal("privacidade")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all text-left flex items-center gap-2 group">
                <Lock className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Privacidade
              </button>
              <button onClick={() => onOpenModal("termos")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all text-left flex items-center gap-2 group">
                <FileText className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" /> Termos de Uso
              </button>
              <Link to="/cadastro" className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all flex items-center gap-2 group">
                 <div className="w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" /> Solicitar Orçamento
              </Link>
            </div>
          </div>

          {/* Social Col */}
          <div>
            <h4 className="text-[10px] font-black text-[hsl(var(--foreground))] uppercase tracking-[0.2em] mb-6">Siga-nos</h4>
            <div className="flex gap-3">
              {[
                { name: "IG", url: "https://www.instagram.com/novaesweb/" },
                { name: "IN", url: "https://linkedin.com/company/novaesweb" },
                { name: "FB", url: "https://facebook.com/novaesweb" },
              ].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary/20 hover:border-primary/20 transition-all font-bold text-[10px] text-white/50 hover:text-white">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Parceria */}
        <div className="border-t border-[hsl(var(--border))] pt-8 mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 grayscale hover:grayscale-0 transition-all">
            <img src={codethioLogo} alt="Codethio" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex flex-col">
              <p className="text-xs font-bold leading-none">
                <span className="text-[hsl(var(--foreground))]">Code</span><span className="text-green-500">thio</span>
              </p>
              <span className="text-[9px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest mt-1">Parceria Estratégica</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[hsl(var(--border))] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            © {new Date().getFullYear()} <span className="font-bold text-[hsl(var(--foreground))]">NovaesWeb</span> — Todos os direitos reservados.
          </p>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ambiente 100% Seguro</span>
          </div>

          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            Desenvolvido com ❤️ por <span className="font-bold gradient-text">NovaesWeb</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Helper mock to avoid import issue if Zap is missing
const Zap = ({ className }: { className?: string }) => <span className={className}>⚡</span>;
