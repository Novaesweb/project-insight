import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Instagram, Linkedin, Facebook, Sparkles } from "lucide-react";
import codethioLogo from "@/assets/codethio-logo.webp";
import sealImg from "@/assets/novaesweb-v10-seal-final.webp";
import novaeswebSymbol from "@/assets/novaesweb-logo-glow.png";
import nwIcon from "@/assets/novaesweb-nw-icon.png";
import { scrollTo } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface SiteFooterProps {
  onOpenModal: (id: string) => void;
}

export default function SiteFooter({ onOpenModal }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/[0.04] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <OptimizedImage 
              src={novaeswebSymbol} 
              alt="NovaesWeb" 
              width={40}
              height={40}
              className="w-10 h-10 rounded-full shadow-lg shadow-purple-500/15" 
            />
            <span className="text-xl font-black text-white/85 tracking-tighter">
              novaesweb
            </span>
            <p className="text-sm text-white/30 leading-relaxed font-medium">
              Arquitetando ativos digitais de alta fidelidade para empresas que buscam o topo do mercado.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
              <div className="w-4 h-px bg-purple-500/30" /> Ecossistema
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {["Serviços", "Soluções", "Processo", "Planos", "Resultados", "Privacidade", "Termos"].map((l, i) => (
                <button 
                  key={i} 
                  onClick={() => l === "Privacidade" || l === "Termos" ? onOpenModal(l.toLowerCase()) : scrollTo(`#${l.toLowerCase()}`)} 
                  className="text-[12px] text-white/30 hover:text-white/60 transition-all text-left flex items-center gap-3 group font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/[0.06] group-hover:bg-purple-500/50 group-hover:scale-125 transition-all" /> {l}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
              <div className="w-4 h-px bg-pink-500/30" /> Engenharia
            </h4>
            <div className="space-y-5">
              <Link to="/cadastro" className="group block p-5 rounded-3xl border border-white/[0.05] bg-white/[0.02] hover:border-purple-500/15 hover:bg-white/[0.04] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-purple-400/80 mb-1">Solicitar Orçamento</p>
                <p className="text-[11px] text-white/25 font-medium tracking-tight leading-snug">Inicie sua transformação digital com um dossiê técnico especializado.</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Partnership cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          <div className="group p-6 rounded-[2.5rem] border border-emerald-500/[0.08] bg-emerald-500/[0.02] flex items-center justify-between hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden">
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <OptimizedImage 
                  src={codethioLogo} 
                  alt="CodeThio" 
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border-2 border-emerald-500/15 group-hover:border-emerald-500/30 transition-all p-1 bg-[hsl(var(--background))]" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[hsl(var(--background))]" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h5 className="text-xl font-black text-white/80 leading-none tracking-tighter">
                  Code<span className="text-emerald-400/80">Thio</span>
                </h5>
                <p className="text-[10px] text-emerald-400/40 uppercase font-black tracking-[0.2em] mt-2">Parceria Estratégica</p>
              </div>
            </div>
            <div className="hidden sm:block text-right pr-4">
              <span className="text-[10px] text-white/15 font-bold uppercase tracking-widest italic">Dev Ops & Cloud</span>
            </div>
          </div>

          <div className="group p-6 rounded-[2.5rem] border border-purple-500/[0.08] bg-purple-500/[0.02] flex items-center justify-between hover:border-purple-500/20 transition-all cursor-default relative overflow-hidden">
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <OptimizedImage 
                  src={sealImg} 
                  alt="Engenharia v9.0" 
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[hsl(var(--background))]" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h5 className="text-xl font-black text-white/80 leading-none tracking-tighter">
                  Architect<span className="gradient-text">v10.0</span>
                </h5>
                <p className="text-[10px] text-purple-400/40 uppercase font-black tracking-[0.2em] mt-2">Engenharia Certificada Pro</p>
              </div>
            </div>
            <div className="hidden sm:block text-right pr-4">
              <span className="text-[10px] text-white/15 font-bold uppercase tracking-widest italic">novaesweb Official</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-10 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[11px] text-white/15 font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} novaesweb
            </p>
            <div className="hidden md:block h-3 w-px bg-white/[0.04]" />
            <div className="flex gap-6">
              {[
                { icon: Instagram, url: "https://www.instagram.com/novaesweb.oficial/" },
                { icon: Linkedin, url: "https://linkedin.com/company/novaesweb" },
                { icon: Facebook, url: "https://facebook.com/novaesweb" },
              ].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-white/10 hover:text-purple-400/60 transition-all hover:-translate-y-1">
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Sistemas Ativos</span>
            </div>
            <OptimizedImage src={nwIcon} alt="NW" width={28} height={28} className="w-7 h-7 object-contain opacity-40 hover:opacity-80 transition-opacity" />
            <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.4em]">
              Architect <span className="text-white/15">Ecosystem</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
