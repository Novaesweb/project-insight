import { useState, useEffect, useRef } from "react";

function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.max(16, Math.floor(duration / target));
        const timer = setInterval(() => {
          start++;
          setCount(start);
          if (start >= target) clearInterval(timer);
        }, step);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle, Zap, Shield, Smartphone, MessageCircle,
  Target, Eye, Heart, Users, Rocket, Car, UserCheck, UtensilsCrossed,
  Wrench, ShoppingBag, CalendarCheck, Menu, X, ChevronRight, Star,
  Globe, Layers, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NicheCarousel from "@/components/NicheCarousel";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import aboutPhoto from "@/assets/about-novaes.jpg";
import novaesSymbol from "@/assets/novaesweb-symbol.jpeg";
import bellaMassaDemo from "@/assets/bella-massa-demo.png";
import barbeariaDemo from "@/assets/barbearia-demo.png";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const heroWords = ["negócio", "futuro", "empresa", "projeto", "resultado"];

const extrasSlides = [
  { emoji: "🛒", title: "Sistema de Pedidos", desc: "Receba pedidos online organizados no painel." },
  { emoji: "📊", title: "Painel Administrativo", desc: "Controle total do seu negócio em um só lugar." },
  { emoji: "⭐", title: "Avaliação de Clientes", desc: "Seus clientes avaliam e você melhora sempre." },
  { emoji: "🎁", title: "Programa Fidelidade", desc: "Fidelize clientes com recompensas automáticas." },
];

// Testimonials data moved to AnimatedTestimonials component

function ExtrasCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % extrasSlides.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      <div className="overflow-hidden rounded-xl">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {extrasSlides.map((s, i) => (
            <div key={i} className="min-w-full px-2">
              <div className="glass-card rounded-xl p-8 text-center">
                <span className="text-5xl mb-4 block">{s.emoji}</span>
                <h4 className="font-bold text-[hsl(var(--foreground))] mb-2">{s.title}</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {extrasSlides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 gradient-primary" : "bg-[hsl(var(--muted))]"}`} />
        ))}
      </div>
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-4 font-medium">Entre muitos outros recursos disponíveis</p>
    </div>
  );
}

export default function Site() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const heroWord = heroWords[heroWordIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroWordIndex(prev => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  const [showAllSolucoes, setShowAllSolucoes] = useState(false);
  const heroEmpresasCounter = useAnimatedCounter(36, 1500);
  const heroEntregaCounter = useAnimatedCounter(7, 800);
  const heroResponsivoCounter = useAnimatedCounter(100, 1200);
  const heroAtendimentoCounter = useAnimatedCounter(24, 1000);
  const metricEmpresasCounter = useAnimatedCounter(36, 1500);
  const metricSatisfacaoCounter = useAnimatedCounter(100, 1200);
  const metricPrazoCounter = useAnimatedCounter(7, 800);
  const metricRespostaCounter = useAnimatedCounter(24, 1000);

  const navLinks = [
    { href: "#servicos", label: "Serviços" },
    { href: "#solucoes", label: "Soluções" },
    { href: "#processo", label: "Processo" },
    { href: "#planos", label: "Planos" },
    { href: "#resultados", label: "Resultados" },
    { href: "#contato", label: "Contato" },
  ];

  const modalLinks = [
    { id: "sobre", label: "Sobre NovaesWeb" },
    { id: "quem-somos", label: "Quem Somos" },
    { id: "diferenciais", label: "Por que a NovaesWeb?" },
    { id: "demonstracao", label: "Demonstração" },
  ];

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(href.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] scroll-smooth ambient-glow">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={novaesSymbol} alt="NovaesWeb" className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-[hsl(var(--primary))]/20" />
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Novaes</span>
              <span className="text-[hsl(var(--foreground))]">Web</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/cadastro" className="hidden sm:block">
              <Button className="gradient-primary border-0 text-white text-sm h-10 px-6 rounded-xl font-semibold shadow-lg shadow-[hsl(var(--primary))]/20">
                Solicitar orçamento
              </Button>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--foreground))]"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(link.href)}
                    className="text-left text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors py-3 border-b border-[hsl(var(--border))] flex items-center justify-between"
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
                {modalLinks.map((link, i) => (
                  <button
                    key={`modal-${i}`}
                    onClick={() => { setMenuOpen(false); setTimeout(() => setModalOpen(link.id), 300); }}
                    className="text-left text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors py-3 border-b border-[hsl(var(--border))] last:border-0 flex items-center justify-between"
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
                <Link to="/cadastro" onClick={() => setMenuOpen(false)} className="mt-1">
                  <Button className="gradient-primary border-0 text-white text-sm h-10 rounded-xl w-full font-semibold">
                    Solicitar orçamento <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      {/* ─── SLIDE DESTAQUE ─── */}
      <motion.section
        className="relative pt-36 pb-20 px-6 overflow-hidden"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <div className="ambient-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={fade} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
            Nada de sites genéricos
          </motion.div>
          <motion.h2 variants={fade} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--foreground))] leading-[1.15] tracking-tight">
            Na NovaesWeb, seu site é desenvolvido{" "}
            <span className="gradient-text fx-glintReveal">de acordo com a necessidade</span>{" "}
            do seu negócio.
          </motion.h2>
          <motion.p variants={fade} className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] mt-6 leading-relaxed max-w-2xl mx-auto">
            Você escolhe o que quer, e nós transformamos em{" "}
            <span className="font-semibold text-[hsl(var(--foreground))]">solução digital</span>.
          </motion.p>
          <motion.div variants={fade} className="mt-10">
            <Link to="/cadastro">
              <Button className="gradient-primary border-0 text-white h-14 px-10 rounded-xl text-base font-semibold shadow-lg shadow-[hsl(var(--primary))]/20">
                Quero meu site personalizado <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── HERO ─── */}
      <motion.section
        className="pt-12 pb-24 px-6"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div variants={fade} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-6">
                <Star className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                Soluções digitais para empresas
              </motion.div>
              <motion.h1 variants={fade} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[hsl(var(--foreground))] leading-[1.1] tracking-tight">
                Tecnologia que{" "}
                <span className="gradient-text fx-glintReveal">transforma</span>
                {" "}seu{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={heroWord}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="inline-block gradient-text"
                  >
                    {heroWord}
                  </motion.span>
                </AnimatePresence>
              </motion.h1>
              <motion.p variants={fade} className="text-base text-[hsl(var(--muted-foreground))] mt-6 leading-relaxed max-w-lg">
                Desenvolvemos sites, sistemas e aplicativos sob medida para empresas que buscam organização, presença digital e resultados reais.
              </motion.p>
              <motion.div variants={fade} className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link to="/cadastro">
                  <Button className="gradient-primary border-0 text-white h-12 px-8 rounded-xl text-sm font-semibold shadow-lg shadow-[hsl(var(--primary))]/20">
                    Começar meu projeto <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-12 px-8 rounded-xl text-sm hover:bg-[hsl(var(--muted))]">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </Button>
                </a>
              </motion.div>
            </div>
            <motion.div variants={fade} className="hidden lg:grid grid-cols-2 gap-4">
              <div ref={heroEmpresasCounter.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
                <p className="text-2xl font-bold gradient-text">{heroEmpresasCounter.count}+</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Empresas atendidas</p>
              </div>
              <div ref={heroEntregaCounter.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
                <p className="text-2xl font-bold gradient-text">{heroEntregaCounter.count}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Dias de entrega</p>
              </div>
              <div ref={heroResponsivoCounter.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
                <p className="text-2xl font-bold gradient-text">{heroResponsivoCounter.count}%</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Responsivo</p>
              </div>
              <div ref={heroAtendimentoCounter.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
                <p className="text-2xl font-bold gradient-text">{heroAtendimentoCounter.count}h</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Atendimento rápido</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── SERVIÇOS ─── */}
      <motion.section id="servicos" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fade} className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Serviços</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3 leading-tight">
              Soluções digitais completas para seu negócio
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
              Do planejamento à entrega, cuidamos de cada etapa para garantir que sua empresa tenha a melhor presença digital possível.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Globe, titulo: "Sites Profissionais", desc: "Sites rápidos, modernos e otimizados para SEO. Design responsivo que se adapta a qualquer dispositivo. Inclui domínio personalizado, certificado SSL, hospedagem e painel de gestão de conteúdo." },
              { icon: ShoppingBag, titulo: "Lojas Virtuais", desc: "E-commerce completo com catálogo de produtos, carrinho de compras, checkout seguro e integração com meios de pagamento como Pix, cartão e boleto. Controle de estoque e relatórios de vendas." },
              { icon: Layers, titulo: "Sistemas Web", desc: "Sistemas sob medida para gerenciar clientes, pedidos, agendamentos, financeiro, relatórios e tudo que seu negócio precisa. Acesso de qualquer lugar, 100% na nuvem." },
              { icon: Smartphone, titulo: "Landing Pages", desc: "Páginas de alta conversão para campanhas de marketing digital. Design focado em capturar leads e gerar resultados rápidos para seu negócio com formulários inteligentes." },
              { icon: Shield, titulo: "Manutenção e Suporte", desc: "Suporte técnico contínuo, atualizações de segurança, backups automáticos e monitoramento 24h. Garantimos que seu site esteja sempre no ar e funcionando perfeitamente." },
              { icon: Zap, titulo: "Automação e Integrações", desc: "Automatize tarefas repetitivas e integre seu site com WhatsApp, e-mail marketing, redes sociais, Google Analytics e outras ferramentas que potencializam seus resultados.", badge: "Em desenvolvimento", badgeMsg: "🚀 Estamos construindo integrações poderosas para você automatizar tudo — em breve disponível!" },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="glass-card rounded-2xl p-8 group info-card-hover"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-[hsl(var(--primary))]/20 group-hover:scale-105 transition-transform">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">{s.titulo}</h3>
                  {'badge' in s && (s as any).badge && (
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      {(s as any).badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{s.desc}</p>
                {'badgeMsg' in s && (s as any).badgeMsg && (
                  <p className="text-xs text-amber-400/80 mt-3 italic">{(s as any).badgeMsg}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── SOLUÇÕES (Projetos) ─── */}
      <motion.section id="solucoes" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fade} className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Soluções</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3 leading-tight">
              Sistemas que podemos desenvolver para você
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
              Cada negócio tem suas necessidades. Desenvolvemos soluções personalizadas com tecnologia de ponta, sempre focando em usabilidade e resultados reais.
            </p>
          </motion.div>

          {(() => {
            const solucoes = [
              { icon: Car, titulo: "Controle de Aluguel", desc: "Gerencie aluguel de carros, motos ou imóveis com controle completo de contratos, pagamentos, vencimentos, multas e histórico de clientes." },
              { icon: UserCheck, titulo: "CRM - Gestão de Clientes", desc: "Organize clientes, leads e oportunidades de negócio. Pipeline de vendas visual, histórico de interações, follow-ups automáticos e relatórios de conversão." },
              { icon: UtensilsCrossed, titulo: "Pedidos para Restaurantes", desc: "Cardápio digital interativo, pedidos online com personalização, integração com delivery, controle de mesa e cozinha, e relatórios de vendas por período." },
              { icon: Wrench, titulo: "Gestão para Oficinas", desc: "Ordens de serviço digitais, agendamentos, controle de estoque de peças, histórico de veículos, orçamentos automáticos e notificação para clientes." },
              { icon: ShoppingBag, titulo: "Catálogo de Produtos", desc: "Vitrine digital organizada com fotos, descrições, preços e categorias. Compartilhável por link ou WhatsApp. Ideal para quem vende pelo Instagram ou redes sociais." },
              { icon: CalendarCheck, titulo: "Agendamento Online", desc: "Sistema de agenda com horários disponíveis em tempo real, confirmação automática por WhatsApp/e-mail, gestão de profissionais e relatório de atendimentos." },
              { icon: Target, titulo: "Gestão Financeira", desc: "Controle de contas a pagar e receber, fluxo de caixa, emissão de boletos, relatórios financeiros detalhados e dashboards com indicadores em tempo real." },
              { icon: Users, titulo: "Portal do Cliente", desc: "Área exclusiva onde seus clientes acompanham projetos, faturas, contratos, reuniões e abrem chamados de suporte. Tudo organizado em um painel moderno." },
              { icon: Rocket, titulo: "Painel Administrativo", desc: "Dashboard completo para gerenciar toda sua operação: clientes, pedidos, financeiro, equipe, relatórios e KPIs do negócio em um só lugar." },
            ];
            const visibleSolucoes = showAllSolucoes ? solucoes : solucoes.slice(0, 2);
            return (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleSolucoes.map((p, i) => (
                    <motion.div
                      key={p.titulo}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i >= 2 && showAllSolucoes ? (i - 2) * 0.08 : i * 0.08 }}
                      className="glass-card rounded-2xl p-6 flex gap-4 items-start info-card-hover"
                    >
                      <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-[hsl(var(--primary))]/15">
                        <p.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">{p.titulo}</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{p.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {!showAllSolucoes ? (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllSolucoes(true)}
                      className="glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl px-8 h-11 hover:bg-[hsl(var(--muted))]"
                    >
                      Ver todas as soluções ({solucoes.length - 2} mais) <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllSolucoes(false)}
                      className="glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl px-8 h-11 hover:bg-[hsl(var(--muted))]"
                    >
                      Ver menos <ChevronRight className="w-4 h-4 ml-2 rotate-90" />
                    </Button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </motion.section>

      {/* ─── SEGMENTOS (Carousel) ─── */}
      <section id="segmentos" className="py-8">
        <NicheCarousel />
      </section>

      {/* ─── PROCESSO ─── */}
      <motion.section id="processo" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fade} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Como funciona</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3">
              Do briefing à entrega em 4 etapas
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
              Nosso processo é transparente e colaborativo. Você participa de cada etapa e acompanha tudo em tempo real pelo portal do cliente.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", titulo: "Entendimento", desc: "Reunião inicial para entender seu negócio, público-alvo, concorrentes e objetivos. Definimos juntos o escopo, funcionalidades e prazo do projeto.", detail: "Duração: 1-2 dias" },
              { num: "02", titulo: "Desenvolvimento", desc: "Criamos o layout e desenvolvemos todas as funcionalidades com design moderno, responsivo e performance otimizada. Você recebe atualizações diárias.", detail: "Duração: 3-5 dias" },
              { num: "03", titulo: "Entrega e Testes", desc: "Você testa o projeto completo, valida cada funcionalidade e solicita ajustes ilimitados até ficar 100% satisfeito com o resultado final.", detail: "Duração: 1-2 dias" },
              { num: "04", titulo: "Evolução Contínua", desc: "Após a entrega, seu projeto continua evoluindo. Novas funcionalidades, melhorias e acompanhamento contínuo conforme sua empresa cresce.", detail: "Pós-entrega" },
            ].map((step, i) => (
              <motion.div key={i} variants={fade} className="relative">
                <div className="glass-card rounded-2xl p-8 h-full info-card-hover">
                  <span className="text-4xl font-extrabold gradient-text opacity-30">{step.num}</span>
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mt-4 mb-2">{step.titulo}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">{step.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> {step.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>


      {/* ─── PLANOS ─── */}
      <motion.section id="planos" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fade}>
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Planos</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3">
              Planos flexíveis para cada tipo de negócio
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
              Escolha o plano ideal para o momento da sua empresa. Cada projeto pode evoluir conforme seu negócio cresce.
            </p>
          </motion.div>

          <motion.div variants={fade} className="mt-10">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0 text-white h-14 px-10 rounded-xl font-semibold text-lg shadow-lg shadow-[hsl(var(--primary))]/20">
                  Ver nossos planos <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--background))] border-[hsl(var(--border))] p-6">
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6 text-center">Nossos Planos</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Site Express – Promoção Especial */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden border border-emerald-500/20">
                    <div className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-bold uppercase px-3 py-1 rounded-full animate-pulse">
                      🔥 Promoção
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Express</span>
                        <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mt-1">Site Express</h3>
                      </div>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-3">
                      Aproveite o Plano Site Express com uma promoção exclusiva só este mês!
                    </p>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Valor inicial</p>
                        <p className="text-xl font-bold text-emerald-400">R$180</p>
                      </div>
                      <div className="h-8 w-px bg-[hsl(var(--border))]" />
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Mensalidade</p>
                        <p className="text-xl font-bold text-emerald-400">R$60<span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">/mês</span></p>
                      </div>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-3">
                      Site moderno, funcional e totalmente personalizável.
                    </p>
                    <ul className="space-y-2 mb-4 flex-1">
                      {["Site moderno e responsivo", "Página de serviços", "Página de contato", "Integração com mapa", "Botão WhatsApp direto", "Otimização para celular"].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-emerald-400/80 italic mb-3">⚡ Não perca essa oportunidade!</p>
                    <a href="https://wa.me/5551981964238?text=Olá, vi a promoção do Plano Site Express da NovaesWeb e gostaria de aproveitar! Valor inicial R$180 e mensalidade R$60." target="_blank" rel="noopener noreferrer">
                      <Button className="w-full gradient-primary border-0 text-white h-10 rounded-xl font-semibold shadow-lg shadow-[hsl(var(--primary))]/20">
                        Aproveitar promoção <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>

                  {/* Gestão Pro */}
                  <div className="relative glass-card rounded-2xl p-6 border border-[hsl(var(--primary))]/40 flex flex-col">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-[hsl(var(--primary))] px-4 py-1 rounded-full shadow-lg shadow-[hsl(var(--primary))]/30">
                        Mais popular
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-[hsl(var(--primary))]" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-2 py-0.5 rounded-full">Pro</span>
                        <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mt-1">Gestão Pro</h3>
                      </div>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                      Indicado para empresas que precisam organizar clientes, pedidos e informações do negócio.
                    </p>
                    <ul className="space-y-2 mb-4 flex-1">
                      {["Site profissional completo", "Painel administrativo", "Cadastro de clientes", "Recebimento de pedidos", "Sistema de notificações", "Controle financeiro básico", "Histórico de informações"].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-[hsl(var(--primary))]/80 italic mb-3">💡 Ideal para empresas que querem mais controle e organização.</p>
                    <a href="https://wa.me/5551981964238?text=Olá, vi os planos da NovaesWeb e gostaria de receber um orçamento para o Plano Gestão Pro." target="_blank" rel="noopener noreferrer">
                      <Button className="w-full gradient-primary border-0 text-white h-10 rounded-xl font-semibold shadow-lg shadow-[hsl(var(--primary))]/20">
                        Falar com especialista <MessageCircle className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>

                  {/* Sistema Sob Medida */}
                  <div className="glass-card rounded-2xl p-6 border border-purple-500/20 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Sob Medida</span>
                        <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mt-1">Sistema Sob Medida</h3>
                      </div>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                      Para empresas que precisam de um sistema totalmente personalizado, desenvolvido sob demanda.
                    </p>
                    <ul className="space-y-2 mb-4 flex-1">
                      {["Sistemas de gestão", "Plataformas internas", "Portais para clientes", "Sistemas de pedidos", "Dashboards administrativos", "E muito mais..."].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-purple-400/80 italic mb-3">💡 Cada projeto é planejado conforme a necessidade da empresa.</p>
                    <a href="https://wa.me/5551981964238?text=Olá, vi os planos da NovaesWeb e gostaria de receber um orçamento para o Plano Sistema Sob Medida." target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 border-0 text-white h-10 rounded-xl font-semibold shadow-lg shadow-purple-600/20">
                        Solicitar orçamento <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="glass-card rounded-2xl p-4 max-w-2xl mx-auto">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      <span className="font-semibold text-[hsl(var(--foreground))]">⚠️ Informação importante:</span> Cada projeto pode receber novas funcionalidades conforme o crescimento da empresa. O domínio e alguns serviços externos podem ter custos separados pagos diretamente pelo cliente.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── FUNCIONALIDADE EXTRA ─── */}
      <motion.section className="py-16 sm:py-24 px-4 sm:px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fade}>
            <Dialog>
              <DialogTrigger asChild>
                <button className="group inline-flex items-center gap-2 sm:gap-3 glass-card rounded-2xl px-5 sm:px-8 py-4 sm:py-5 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 cursor-pointer">
                  <span className="text-2xl sm:text-3xl">⚙️</span>
                  <span className="text-base sm:text-xl font-bold text-[hsl(var(--foreground))] group-hover:gradient-text transition-all">Funcionalidade Extra</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-[hsl(var(--background))] border-[hsl(var(--border))] p-4 sm:p-8 rounded-2xl">
                {/* Header */}
                <div className="text-center mb-5 sm:mb-8">
                  <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">⚙️</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] mb-1 sm:mb-2">Funcionalidade Extra</h2>
                  <p className="text-sm sm:text-base text-[hsl(var(--primary))] font-medium">Personalize seu site conforme a necessidade do seu negócio</p>
                  <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-1 sm:mt-2">Ferramenta que permite adicionar novas funções ao seu site conforme sua empresa cresce.</p>
                </div>

                {/* Info blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {[
                    { icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />, title: "Sistema de Pedidos", desc: "Permite que seus clientes façam pedidos diretamente pelo site, organizando tudo no painel administrativo." },
                    { icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />, title: "Painel Administrativo", desc: "Gerencie produtos, pedidos, clientes e informações do site de forma simples e organizada." },
                    { icon: <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />, title: "Reservas e Agendamentos", desc: "Ideal para restaurantes, pizzarias e serviços que precisam organizar horários e reservas." },
                  ].map((item, i) => (
                    <div key={i} className="glass-card rounded-xl p-4 sm:p-5 text-left">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[hsl(var(--muted))]/50 flex items-center justify-center mb-2 sm:mb-3">{item.icon}</div>
                      <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1 text-xs sm:text-sm">{item.title}</h4>
                      <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Carousel de extras */}
                <div className="mb-4 sm:mb-6">
                  <ExtrasCarousel />
                </div>

                {/* Evolução */}
                <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
                  <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-[hsl(var(--primary))] mx-auto mb-2 sm:mb-3" />
                  <h4 className="font-bold text-[hsl(var(--foreground))] mb-1 sm:mb-2 text-sm sm:text-base">Seu site evolui com o seu negócio</h4>
                  <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">Você pode adicionar novos recursos sempre que precisar, construindo o site de acordo com a ideia e necessidade da sua empresa.</p>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── RESULTADOS / AVALIAÇÕES ─── */}
      <motion.section id="resultados" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fade} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Resultados</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3">
              O que nossos clientes dizem
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-4">
              Estamos em fase de crescimento, já atendendo cerca de 36 empresas com foco total em qualidade e satisfação. Cada projeto é tratado como único.
            </p>
          </motion.div>

          {/* Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <motion.div ref={metricEmpresasCounter.ref} variants={fade} className="glass-card rounded-2xl p-6 text-center">
              <p className="text-2xl font-bold gradient-text">{metricEmpresasCounter.count}+</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Empresas atendidas</p>
            </motion.div>
            <motion.div ref={metricSatisfacaoCounter.ref} variants={fade} className="glass-card rounded-2xl p-6 text-center">
              <p className="text-2xl font-bold gradient-text">{metricSatisfacaoCounter.count}%</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Satisfação dos clientes</p>
            </motion.div>
            <motion.div ref={metricPrazoCounter.ref} variants={fade} className="glass-card rounded-2xl p-6 text-center">
              <p className="text-2xl font-bold gradient-text">{metricPrazoCounter.count} dias</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Prazo médio de entrega</p>
            </motion.div>
            <motion.div ref={metricRespostaCounter.ref} variants={fade} className="glass-card rounded-2xl p-6 text-center">
              <p className="text-2xl font-bold gradient-text">{metricRespostaCounter.count}h</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Tempo de resposta suporte</p>
            </motion.div>
          </div>

          <AnimatedTestimonials
            data={[
              {
                description: "A Novaesweb transformou a presença digital do meu negócio. O site ficou moderno, rápido e muito mais profissional.",
                image: "https://images.unsplash.com/photo-1611558709798-e009c8fd7706?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
                name: "Mariana Souza",
                handle: "@marianasouza",
              },
              {
                description: "Gostei muito da facilidade no atendimento e da qualidade do site entregue. Ficou bonito, responsivo e passou mais confiança para meus clientes.",
                image: "https://plus.unsplash.com/premium_photo-1692340973636-6f2ff926af39?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
                name: "Lucas Ferreira",
                handle: "@lucasferreira",
              },
              {
                description: "A Novaesweb conseguiu criar um site que realmente representa minha empresa. Hoje recebo mais contatos e meu negócio parece muito mais valorizado.",
                image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
                name: "Carlos Henrique",
                handle: "@carlosh",
              },
              {
                description: "Além do visual bonito, o site ficou prático e fácil de usar no celular. Era exatamente isso que eu precisava para atender melhor meus clientes.",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
                name: "Fernanda Lima",
                handle: "@fernandalima",
              },
              {
                description: "O diferencial da Novaesweb é unir design moderno com funcionalidade. Meu site ficou profissional e pronto para divulgar meu trabalho.",
                image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
                name: "Juliana Martins",
                handle: "@julianamartins",
              },
              {
                description: "Recomendo a Novaesweb para qualquer empresa que queira crescer no digital. O trabalho ficou excelente e trouxe mais credibilidade para minha marca.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
                name: "Patrícia Alves",
                handle: "@patriciaalves",
              },
            ]}
          />
        </div>
      </motion.section>

      {/* ─── MODAIS (Sobre / Quem Somos) ─── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={() => setModalOpen(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalOpen(null)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))] z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {modalOpen === "sobre" && (
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Nossa história</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Sobre a NovaesWeb</h2>
                  </div>
                  <div className="rounded-2xl overflow-hidden mb-6">
                    <img src={aboutPhoto} alt="NovaesWeb" className="w-full h-48 object-cover" />
                  </div>
                  <div className="space-y-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    <p>A NovaesWeb é um projeto focado no desenvolvimento de sites, sistemas web e soluções digitais para empresas que desejam melhorar sua presença na internet e organizar melhor seus serviços.</p>
                    <p>Nosso trabalho é criar plataformas simples, modernas e funcionais, permitindo que empresas tenham mais controle sobre seus clientes, produtos e atendimento. Utilizamos tecnologias de ponta como React, TypeScript e bancos de dados em nuvem.</p>
                    <p>Nascemos com a ideia de tornar a tecnologia mais acessível para pequenos e médios negócios, oferecendo ferramentas que realmente ajudam no dia a dia da empresa. Mesmo sendo um projeto recente, já participamos do desenvolvimento de soluções utilizadas por cerca de 6 empresas.</p>
                    <p>Acreditamos que toda empresa, independente do tamanho, merece ter uma presença digital profissional e ferramentas de gestão que simplifiquem sua rotina. Nosso diferencial está no atendimento humanizado, na agilidade de entrega e na evolução contínua dos projetos.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Target className="w-6 h-6 text-[hsl(var(--primary))] mx-auto mb-2" />
                      <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1">Missão</h4>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Criar soluções digitais acessíveis para empresas</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Eye className="w-6 h-6 text-[hsl(var(--primary))] mx-auto mb-2" />
                      <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1">Visão</h4>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Referência em tecnologia para PMEs</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Heart className="w-6 h-6 text-[hsl(var(--primary))] mx-auto mb-2" />
                      <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1">Valores</h4>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Transparência, compromisso e evolução</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-[hsl(var(--border))]">
                    <div className="flex gap-6">
                      <div><span className="text-lg font-bold gradient-text">6+</span><p className="text-[10px] text-[hsl(var(--muted-foreground))]">Empresas</p></div>
                      <div><span className="text-lg font-bold gradient-text">2025</span><p className="text-[10px] text-[hsl(var(--muted-foreground))]">Fundação</p></div>
                    </div>
                  </div>
                </div>
              )}

              {modalOpen === "quem-somos" && (
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Nossa equipe</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Quem Somos</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6">
                      <Users className="w-8 h-8 text-[hsl(var(--primary))] mb-3" />
                      <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">Quem Somos</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                        Somos um projeto independente de tecnologia focado em criar soluções digitais para empresas reais. Utilizamos tecnologia moderna, inteligência artificial e metodologias ágeis para entregar projetos rápidos, eficientes e de qualidade. Nosso compromisso é com resultado.
                      </p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                      <Globe className="w-8 h-8 text-[hsl(var(--primary))] mb-3" />
                      <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">De Onde Viemos</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                        A ideia começou com o objetivo de desenvolver sites e sistemas simples para empresas locais. Com o tempo, evoluímos para criar sistemas mais completos como painéis administrativos, portais do cliente, CRMs e controle financeiro. Cada projeto nos ensinou algo novo.
                      </p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                      <Rocket className="w-8 h-8 text-[hsl(var(--primary))] mb-3" />
                      <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">Para Onde Vamos</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                        Seguimos expandindo, criando novas soluções e aprimorando cada sistema. Nosso objetivo é nos tornar referência em desenvolvimento web para PMEs, oferecendo plataformas completas com preço justo e evolução constante ao lado dos nossos clientes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalOpen === "diferenciais" && (
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Diferenciais</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Por que escolher a NovaesWeb?</h2>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                    Trabalhamos para criar sistemas que sejam simples, funcionais, adaptáveis e em constante evolução. Não entregamos apenas um site — entregamos uma solução completa.
                  </p>
                  <div className="space-y-3 mb-6">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      <strong className="text-[hsl(var(--foreground))]">Tecnologia moderna:</strong> Utilizamos React, TypeScript e bancos de dados em nuvem para garantir performance e segurança.
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      <strong className="text-[hsl(var(--foreground))]">Preço justo:</strong> Soluções acessíveis para pequenas e médias empresas, sem cobranças escondidas.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Entrega em até 7 dias", detail: "Projetos ágeis sem perder qualidade" },
                      { label: "Suporte humanizado", detail: "Atendimento direto, sem robôs" },
                      { label: "100% responsivo", detail: "Celular, tablet e desktop" },
                      { label: "Painel exclusivo", detail: "Gerencie tudo pelo navegador" },
                      { label: "Hospedagem incluída", detail: "Sem custos extras" },
                      { label: "Evolução contínua", detail: "Novas funcionalidades quando precisar" },
                      { label: "SSL e segurança", detail: "Dados protegidos" },
                      { label: "SEO otimizado", detail: "Apareça no Google" },
                    ].map((d, i) => (
                      <div key={i} className="flex items-start gap-2 glass-card rounded-xl p-3">
                        <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-[hsl(var(--foreground))] block">{d.label}</span>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalOpen === "privacidade" && (
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Legal</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Política de Privacidade</h2>
                  </div>
                  <div className="space-y-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    <p>A NovaesWeb valoriza a privacidade dos seus usuários. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Coleta de dados:</strong> Coletamos informações fornecidas voluntariamente por você ao preencher formulários de contato, cadastro ou solicitação de orçamento, como nome, e-mail, telefone e dados do negócio.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Uso das informações:</strong> As informações são utilizadas exclusivamente para entrar em contato, fornecer orçamentos, desenvolver projetos e melhorar nossos serviços.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Compartilhamento:</strong> Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando necessário para a prestação do serviço contratado.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Segurança:</strong> Utilizamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado, alteração ou destruição.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Seus direitos:</strong> Você pode solicitar a exclusão ou atualização dos seus dados a qualquer momento entrando em contato conosco.</p>
                  </div>
                </div>
              )}

              {modalOpen === "termos" && (
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Legal</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Termos de Uso</h2>
                  </div>
                  <div className="space-y-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    <p>Ao utilizar os serviços da NovaesWeb, você concorda com os termos descritos abaixo.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Serviços:</strong> A NovaesWeb oferece desenvolvimento de sites, sistemas web e soluções digitais personalizadas. Cada projeto é definido em comum acordo entre as partes.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Responsabilidades do cliente:</strong> O cliente é responsável por fornecer informações precisas e conteúdos necessários para o desenvolvimento do projeto dentro dos prazos acordados.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Propriedade intelectual:</strong> Após a quitação total do projeto, o cliente recebe os direitos de uso sobre o produto desenvolvido. O código-fonte e a tecnologia utilizada permanecem como propriedade da NovaesWeb.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Pagamento:</strong> Os valores e condições de pagamento são definidos no orçamento aprovado. Custos adicionais, como domínio e serviços externos, são de responsabilidade do cliente.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Cancelamento:</strong> O cliente pode cancelar o projeto a qualquer momento, porém valores já pagos referentes a etapas concluídas não serão reembolsados.</p>
                  </div>
                </div>
              )}

              {modalOpen === "demonstracao" && (
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Portfólio</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Sites de Demonstração</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Conheça alguns dos projetos desenvolvidos pela NovaesWeb.</p>
                  </div>
                  <div className="grid gap-4">
                    {[
                      { name: "Bella Massa", description: "Site completo para pizzaria com cardápio digital e pedidos online.", link: "https://bellamassa0.vercel.app/", image: bellaMassaDemo },
                      { name: "Barbearia", description: "Sistema de agendamento simples e profissional para barbearias.", link: "https://barber00.vercel.app/", image: barbeariaDemo },
                      { name: "Pizzaria Novaes", description: "Plataforma com pedidos integrados e painel administrativo.", link: "https://pizzarianovaes.vercel.app/" },
                      { name: "Açaí Delivery", description: "Loja online para venda de açaí com controle de pedidos.", link: "https://demoacai.vercel.app/" },
                    ].map((item, index) => (
                      <motion.a
                        key={index}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 hover:bg-[hsl(var(--muted))]/60 hover:border-[hsl(var(--primary))]/40 transition-all duration-300 overflow-hidden"
                      >
                        {item.image && (
                          <motion.div
                            className="w-full h-40 overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                          >
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </motion.div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">{item.name}</h3>
                            <ArrowRight className="w-4 h-4 text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{item.description}</p>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {modalOpen === "cookies" && (
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Legal</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Política de Cookies</h2>
                  </div>
                  <div className="space-y-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    <p>Este site utiliza cookies para melhorar sua experiência de navegação.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">O que são cookies:</strong> Cookies são pequenos arquivos de texto armazenados no seu navegador que nos ajudam a entender como você utiliza nosso site.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Cookies essenciais:</strong> Necessários para o funcionamento básico do site, como manter sua sessão ativa e preferências de tema.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Cookies de análise:</strong> Utilizados para entender como os visitantes interagem com o site, permitindo melhorias contínuas na experiência do usuário.</p>
                    <p><strong className="text-[hsl(var(--foreground))]">Gerenciamento:</strong> Você pode desativar cookies nas configurações do seu navegador, porém isso pode afetar algumas funcionalidades do site.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CTA FINAL / CONTATO ─── */}
      <section id="contato" className="py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto rounded-3xl gradient-primary p-12 sm:p-16 text-center shadow-2xl shadow-[hsl(var(--primary))]/20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Preencha o cadastro e nossa equipe entra em contato em até 2 horas para entender seu projeto. Sem compromisso — é só conversar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/cadastro">
              <Button className="bg-white text-[hsl(var(--primary))] hover:bg-white/90 h-12 px-10 rounded-xl text-base font-semibold shadow-lg">
                Solicitar orçamento <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer">
              <Button className="bg-white/20 text-white hover:bg-white/30 border border-white/30 h-12 px-10 rounded-xl text-base font-semibold">
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
              </Button>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-xs">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Resposta em até 2h</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Orçamento sem compromisso</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Suporte humanizado</span>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Grid principal */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
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

            {/* Navegação */}
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

            {/* Acesso */}
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

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-3">Legal</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => setModalOpen("privacidade")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-left">Política de Privacidade</button>
                <button onClick={() => setModalOpen("termos")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-left">Termos de Uso</button>
                <button onClick={() => setModalOpen("cookies")} className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-left">Política de Cookies</button>
              </div>
            </div>
          </div>

          {/* Separador + Bottom */}
          <div className="border-t border-[hsl(var(--border))] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
              © {new Date().getFullYear()} NovaesWeb — Todos os direitos reservados
            </p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
              Desenvolvido por <span className="font-semibold gradient-text">NovaesWeb</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}