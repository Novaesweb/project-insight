import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Zap, Shield, Smartphone, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nicheData } from "@/lib/niche-data";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const diferenciais = [
  { icon: Zap, titulo: "Entrega rápida", desc: "Seu site pronto em até 7 dias úteis" },
  { icon: Shield, titulo: "Suporte incluso", desc: "30 dias de suporte técnico gratuito" },
  { icon: Smartphone, titulo: "Responsivo", desc: "Funciona perfeito em celular, tablet e PC" },
];

export default function NichePage() {
  const { slug } = useParams();
  const niche = nicheData.find((n) => n.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("5551991189293");

  useEffect(() => {
    supabase.from("app_config").select("value").eq("key", "whatsapp_number").single()
      .then(({ data }) => { if (data?.value) setWhatsappNumber(data.value.replace(/\D/g, "")); });
  }, []);

  if (!niche) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">Nicho não encontrado</h1>
          <Link to="/site"><Button variant="outline">Voltar ao site</Button></Link>
        </div>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(`Olá! Vi o modelo de site para ${niche.nome} e quero um para meu negócio!`);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <SEOHead
        title={`Site para ${niche.nome} | novaesweb`}
        description={`${niche.slogan}. ${niche.incluso.slice(0, 3).join(", ")}. A partir de ${niche.preco}.`}
        canonicalUrl={`https://novaesweb.site/nicho/${slug}`}
      />
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/site" className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">NW</span>
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">novaesweb</span>
              <span className="text-[hsl(var(--foreground))]">Web</span>
            </span>
          </div>
          <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
            <Button className="gradient-primary border-0 text-white text-sm h-9 rounded-lg">
              Quero esse site
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <motion.section className="pt-32 pb-16 px-4" initial="hidden" animate="show" variants={stagger}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} className="text-5xl mb-4">{niche.emoji}</motion.div>
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))]">
            {niche.slogan}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[hsl(var(--muted-foreground))] mt-3 text-lg">
            Modelo pronto e personalizado para o seu negócio
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">A partir de</span>
            <p className="text-4xl font-extrabold gradient-text mt-1">{niche.preco}</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Demo visual */}
      <motion.section className="pb-16 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="glass-card rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">Prévia do site — {niche.nome}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Exemplo de como ficaria o site do seu negócio</p>
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-xl">{niche.emoji}</div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{niche.nome} Exemplo</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Seu negócio no digital</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {niche.items.map((item, i) => (
                  <div key={i} className="glass-card rounded-lg p-3 text-center">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-2">
                <div className="px-4 py-2 rounded-lg gradient-primary text-white text-xs font-medium">
                  Botão de ação — WhatsApp
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* O que está incluso */}
      <motion.section className="pb-16 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-[hsl(var(--foreground))] text-center mb-8">O que está incluso</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {niche.incluso.map((item) => (
              <motion.div key={item} variants={fadeUp} className="flex items-center gap-3 glass-card rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--primary))] shrink-0" />
                <span className="text-sm text-[hsl(var(--foreground))]">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Diferenciais */}
      <motion.section className="pb-16 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {diferenciais.map((d) => (
            <motion.div key={d.titulo} variants={fadeUp} className="glass-card rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
                <d.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">{d.titulo}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section className="pb-16 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-[hsl(var(--foreground))] text-center mb-8">Perguntas frequentes</motion.h2>
          <div className="space-y-3">
            {niche.faq.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[hsl(var(--muted-foreground))] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Final */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">Gostou do modelo?</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">Fale com a gente e tenha seu site pronto em até 7 dias</p>
          <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-12 px-8 rounded-xl text-base font-semibold">
              <MessageCircle className="w-5 h-5 mr-2" /> Quero um site assim
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-primary py-4 px-4">
        <p className="text-center text-white text-sm font-medium tracking-wide">
          novaesweb © 2025 — Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}



