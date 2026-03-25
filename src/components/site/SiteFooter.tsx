import { Link } from "react-router-dom";
import { ShieldCheck, Star, Users, Target, Lock, FileText, Zap, Instagram, Linkedin, Facebook } from "lucide-react";
import codethioLogo from "@/assets/codethio-logo.jpeg";
import sealImg from "@/assets/novaesweb-seal-v9.png";
import { scrollTo } from "./SiteNavbar";

interface SiteFooterProps {
  onOpenModal: (id: string) => void;
}

export default function SiteFooter({ onOpenModal }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main Grid: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs uppercase">NW</span>
              </div>
              <span className="text-base font-bold text-white">
                Novaes<span className="text-white/40">Web</span>
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed max-w-xs">
              Arquitetando ativos digitais de alta fidelidade para empresas que buscam o topo do mercado.
            </p>
            {/* Partnership Integrated */}
            <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 w-fit">
              <img src={codethioLogo} alt="Codethio" className="w-6 h-6 rounded-full grayscale opacity-50" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Parceria CodeThio</span>
            </div>
          </div>

          {/* Menu Consolidado */}
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8">Ecossistema</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {["Serviços", "Soluções", "Processo", "Planos", "Resultados", "Privacidade", "Termos"].map((l, i) => (
                <button 
                  key={i} 
                  onClick={() => l === "Privacidade" || l === "Termos" ? onOpenModal(l.toLowerCase()) : scrollTo(`#${l.toLowerCase()}`)} 
                  className="text-[11px] text-white/40 hover:text-primary transition-all text-left flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-primary transition-colors" /> {l}
                </button>
              ))}
            </div>
          </div>

          {/* Call to Action & Support */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8">Engenharia</h4>
            <div className="space-y-4">
              <Link to="/cadastro" className="group block p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all">
                <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary mb-1">Solicitar Orçamento</p>
                <p className="text-[9px] text-white/40 font-medium tracking-tight">Análise técnica personalizada para seu negócio.</p>
              </Link>
              <button onClick={() => onOpenModal("demonstracao")} className="w-full text-center py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2">
                <Zap className="w-3 h-3" /> Ver Demonstração
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright | Seal | Social */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-[10px] text-white/20 font-medium">
              © {new Date().getFullYear()} <span className="text-white/40">NovaesWeb</span> • Brasil
            </p>
            <div className="hidden md:block h-3 w-px bg-white/5" />
            <div className="flex gap-4">
              {[
                { icon: Instagram, url: "https://www.instagram.com/novaesweb/" },
                { icon: Linkedin, url: "https://linkedin.com/company/novaesweb" },
                { icon: Facebook, url: "https://facebook.com/novaesweb" },
              ].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Compact Seal */}
          <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl border border-white/5 bg-white/[0.01]">
            <img src={sealImg} alt="Engenharia v9.0" className="w-8 h-8 object-contain opacity-60" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none">Certificação v9.0 Pro</span>
              <span className="text-[8px] text-white/20 uppercase tracking-tighter mt-1">Engenharia de Ativos Digitais</span>
            </div>
            <div className="h-4 w-px bg-white/5 mx-1" />
            <div className="flex items-center gap-1.5 opacity-40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Seguro</span>
            </div>
          </div>

          <p className="text-[8px] text-white/10 font-black uppercase tracking-[0.3em]">
            Developed by <span className="text-white/20">NovaesWeb Lab</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
