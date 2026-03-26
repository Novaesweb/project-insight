import { Link } from "react-router-dom";
import { ShieldCheck, Star, Users, Target, Lock, FileText, Zap, Instagram, Linkedin, Facebook, Sparkles } from "lucide-react";
import codethioLogo from "@/assets/codethio-new-logo.jpg";
import sealImg from "@/assets/webnovax-v10-seal.png";
import { scrollTo } from "./SiteNavbar";

interface SiteFooterProps {
  onOpenModal: (id: string) => void;
}

export default function SiteFooter({ onOpenModal }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[hsl(var(--background))] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* Main Grid: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Brand & Mission */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-black text-sm uppercase">NW</span>
              </div>
              <span className="text-xl font-black text-white tracking-tighter">
                webnovax<span className="text-white/20 font-medium tracking-normal">Web</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              Arquitetando ativos digitais de alta fidelidade para empresas que buscam o topo do mercado.
            </p>
          </div>

          {/* Menu Consolidado */}
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
              <div className="w-4 h-px bg-primary/40" /> Ecossistema
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {["Serviços", "Soluções", "Processo", "Planos", "Resultados", "Privacidade", "Termos"].map((l, i) => (
                <button 
                  key={i} 
                  onClick={() => l === "Privacidade" || l === "Termos" ? onOpenModal(l.toLowerCase()) : scrollTo(`#${l.toLowerCase()}`)} 
                  className="text-[12px] text-white/40 hover:text-white transition-all text-left flex items-center gap-3 group font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-primary group-hover:scale-125 transition-all" /> {l}
                </button>
              ))}
            </div>
          </div>

          {/* Call to Action & Support */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
              <div className="w-4 h-px bg-primary/40" /> Engenharia
            </h4>
            <div className="space-y-5">
              <Link to="/cadastro" className="group block p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary mb-1">Solicitar Orçamento</p>
                <p className="text-[11px] text-white/40 font-medium tracking-tight leading-snug">Inicie sua transformação digital com um dossiê técnico especializado.</p>
              </Link>
            </div>
          </div>
        </div>

        {/* FEATURED: Authority & Partnership Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {/* Partnership Card */}
          <div className="group p-6 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 flex items-center justify-between hover:border-emerald-500/30 transition-all cursor-default relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <img src={codethioLogo} alt="CodeThio" className="w-16 h-16 rounded-full border-2 border-emerald-500/20 group-hover:border-emerald-500/50 transition-all p-1 bg-[hsl(var(--background))]" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[hsl(var(--background))]">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h5 className="text-xl font-black text-white leading-none tracking-tighter">
                  Code<span className="text-emerald-500">Thio</span>
                </h5>
                <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-[0.2em] mt-2">Parceria Estratégica</p>
              </div>
            </div>
            <div className="hidden sm:block text-right pr-4">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">Dev Ops & Cloud</span>
            </div>
          </div>

          {/* Certified Seal Card */}
          <div className="group p-6 rounded-[2.5rem] bg-primary/[0.03] border border-primary/10 flex items-center justify-between hover:border-primary/30 transition-all cursor-default relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <img src={sealImg} alt="Engenharia v9.0" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-[hsl(var(--background))]">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h5 className="text-xl font-black text-white leading-none tracking-tighter">
                  Architect<span className="text-primary">v10.0</span>
                </h5>
                <p className="text-[10px] text-primary/60 uppercase font-black tracking-[0.2em] mt-2">Engenharia Certificada Pro</p>
              </div>
            </div>
            <div className="hidden sm:block text-right pr-4">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">webnovax Official</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[11px] text-white/20 font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} webnovax
            </p>
            <div className="hidden md:block h-3 w-px bg-white/5" />
            <div className="flex gap-6">
              {[
                { icon: Instagram, url: "https://www.instagram.com/webnovax/" },
                { icon: Linkedin, url: "https://linkedin.com/company/webnovax" },
                { icon: Facebook, url: "https://facebook.com/webnovax" },
              ].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-white/10 hover:text-primary transition-all hover:-translate-y-1">
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Sistemas Ativos</span>
            </div>
            <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.4em]">
              Architect <span className="text-white/20">Ecosystem</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}



