import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle, Zap, Shield, Smartphone, MessageCircle,
  Target, Eye, Heart, Users, Rocket, Car, UserCheck, UtensilsCrossed,
  Wrench, ShoppingBag, CalendarCheck, Menu, X, ChevronRight, Star,
  Globe, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NicheCarousel from "@/components/NicheCarousel";
import aboutPhoto from "@/assets/about-novaes.jpg";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Site() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#servicos", label: "Serviços" },
    { href: "#solucoes", label: "Soluções" },
    { href: "#processo", label: "Processo" },
    { href: "#resultados", label: "Resultados" },
    { href: "#contato", label: "Contato" },
  ];

  const mobileLinks = [
    ...navLinks,
    { href: "#sobre", label: "Sobre NovaesWeb" },
    { href: "#quem-somos", label: "Quem Somos" },
  ];

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.getElementById(href.replace("#", ""));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] scroll-smooth">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[hsl(var(--primary))]/20">
              <span className="text-white font-bold text-sm">NW</span>
            </div>
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
                {mobileLinks.map((link, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(link.href)}
                    className="text-left text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors py-3 border-b border-[hsl(var(--border))] last:border-0 flex items-center justify-between"
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
                <Link to="/cadastro" onClick={() => setMenuOpen(false)} className="mt-3">
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
      <motion.section
        className="pt-36 pb-24 px-6"
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
                <span className="gradient-text">transforma</span>
                {" "}seu negócio
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
                <a href="https://wa.me/5500000000000?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-12 px-8 rounded-xl text-sm hover:bg-[hsl(var(--muted))]">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </Button>
                </a>
              </motion.div>
            </div>
            <motion.div variants={fade} className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { num: "6+", label: "Empresas atendidas" },
                { num: "7", label: "Dias de entrega" },
                { num: "100%", label: "Responsivo" },
                { num: "24h", label: "Suporte incluso" },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 text-center hover:border-[hsl(var(--primary))]/30 transition-colors">
                  <p className="text-2xl font-bold gradient-text">{stat.num}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
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
              { icon: Zap, titulo: "Automação e Integrações", desc: "Automatize tarefas repetitivas e integre seu site com WhatsApp, e-mail marketing, redes sociais, Google Analytics e outras ferramentas que potencializam seus resultados." },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="glass-card rounded-2xl p-8 group hover:border-[hsl(var(--primary))]/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-[hsl(var(--primary))]/20 group-hover:scale-105 transition-transform">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">{s.titulo}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{s.desc}</p>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Car, titulo: "Controle de Aluguel", desc: "Gerencie aluguel de carros, motos ou imóveis com controle completo de contratos, pagamentos, vencimentos, multas e histórico de clientes." },
              { icon: UserCheck, titulo: "CRM - Gestão de Clientes", desc: "Organize clientes, leads e oportunidades de negócio. Pipeline de vendas visual, histórico de interações, follow-ups automáticos e relatórios de conversão." },
              { icon: UtensilsCrossed, titulo: "Pedidos para Restaurantes", desc: "Cardápio digital interativo, pedidos online com personalização, integração com delivery, controle de mesa e cozinha, e relatórios de vendas por período." },
              { icon: Wrench, titulo: "Gestão para Oficinas", desc: "Ordens de serviço digitais, agendamentos, controle de estoque de peças, histórico de veículos, orçamentos automáticos e notificação para clientes." },
              { icon: ShoppingBag, titulo: "Catálogo de Produtos", desc: "Vitrine digital organizada com fotos, descrições, preços e categorias. Compartilhável por link ou WhatsApp. Ideal para quem vende pelo Instagram ou redes sociais." },
              { icon: CalendarCheck, titulo: "Agendamento Online", desc: "Sistema de agenda com horários disponíveis em tempo real, confirmação automática por WhatsApp/e-mail, gestão de profissionais e relatório de atendimentos." },
              { icon: Target, titulo: "Gestão Financeira", desc: "Controle de contas a pagar e receber, fluxo de caixa, emissão de boletos, relatórios financeiros detalhados e dashboards com indicadores em tempo real." },
              { icon: Users, titulo: "Portal do Cliente", desc: "Área exclusiva onde seus clientes acompanham projetos, faturas, contratos, reuniões e abrem chamados de suporte. Tudo organizado em um painel moderno." },
              { icon: Rocket, titulo: "Painel Administrativo", desc: "Dashboard completo para gerenciar toda sua operação: clientes, pedidos, financeiro, equipe, relatórios e KPIs do negócio em um só lugar." },
            ].map((p, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="glass-card rounded-2xl p-6 flex gap-4 items-start hover:border-[hsl(var(--primary))]/30 transition-all duration-300"
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
              { num: "04", titulo: "Evolução Contínua", desc: "Após a entrega, seu projeto continua evoluindo. Novas funcionalidades, melhorias e suporte técnico contínuo conforme sua empresa cresce.", detail: "Suporte incluso" },
            ].map((step, i) => (
              <motion.div key={i} variants={fade} className="relative">
                <div className="glass-card rounded-2xl p-8 h-full">
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

      {/* ─── DIFERENCIAIS ─── */}
      <motion.section className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fade}>
              <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Diferenciais</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3 leading-tight">
                Por que escolher a NovaesWeb?
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
                Trabalhamos para criar sistemas que sejam simples, funcionais, adaptáveis e em constante evolução. Não entregamos apenas um site — entregamos uma solução completa.
              </p>
              <div className="mt-6 space-y-3">
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  <strong className="text-[hsl(var(--foreground))]">Tecnologia moderna:</strong> Utilizamos as tecnologias mais recentes do mercado como React, TypeScript e bancos de dados em nuvem para garantir performance e segurança.
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  <strong className="text-[hsl(var(--foreground))]">Preço justo:</strong> Soluções acessíveis para pequenas e médias empresas, sem cobranças escondidas. Planos flexíveis que cabem no seu orçamento.
                </p>
              </div>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Entrega em até 7 dias", detail: "Projetos ágeis sem perder qualidade" },
                { label: "Suporte humanizado incluso", detail: "Atendimento direto, sem robôs" },
                { label: "100% responsivo", detail: "Funciona em celular, tablet e desktop" },
                { label: "Painel de gestão exclusivo", detail: "Gerencie tudo pelo navegador" },
                { label: "Hospedagem incluída", detail: "Sem custos extras com servidor" },
                { label: "Evolução contínua", detail: "Novas funcionalidades quando precisar" },
                { label: "SSL e segurança", detail: "Dados protegidos e site seguro" },
                { label: "SEO otimizado", detail: "Apareça no Google de forma orgânica" },
              ].map((d, i) => (
                <motion.div key={i} variants={fade} className="flex items-start gap-3 glass-card rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-[hsl(var(--foreground))] block">{d.label}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{d.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
      </motion.section>

      {/* ─── RESULTADOS / AVALIAÇÕES ─── */}
      <motion.section id="resultados" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fade} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Resultados</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3">
              O que nossos clientes dizem
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-4">
              Estamos em fase de crescimento, já atendendo cerca de 6 empresas com foco total em qualidade.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { texto: "Sistema simples e funcional, ajudou a organizar melhor nosso atendimento.", autor: "Cliente NovaesWeb" },
              { texto: "Site rápido e fácil de usar, ficou muito bom para nosso negócio.", autor: "Cliente NovaesWeb" },
            ].map((depo, i) => (
              <motion.div key={i} variants={fade} className="glass-card rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-[hsl(var(--primary))] fill-[hsl(var(--primary))]" />)}
                </div>
                <p className="text-[hsl(var(--foreground))] leading-relaxed mb-4">"{depo.texto}"</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">— {depo.autor}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── MISSÃO / VISÃO / VALORES ─── */}
      <motion.section className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fade} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Nossos pilares</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3">
              Missão, Visão e Valores
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div variants={fade} className="glass-card rounded-2xl p-8">
              <Target className="w-8 h-8 text-[hsl(var(--primary))] mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">Missão</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Criar soluções digitais simples, modernas e acessíveis que ajudem empresas a organizar seus serviços e melhorar sua presença online.
              </p>
            </motion.div>
            <motion.div variants={fade} className="glass-card rounded-2xl p-8">
              <Eye className="w-8 h-8 text-[hsl(var(--primary))] mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">Visão</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Crescer como uma empresa de tecnologia que desenvolve sistemas práticos e eficientes, sempre evoluindo junto com nossos clientes.
              </p>
            </motion.div>
            <motion.div variants={fade} className="glass-card rounded-2xl p-8">
              <Heart className="w-8 h-8 text-[hsl(var(--primary))] mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">Valores</h3>
              <ul className="space-y-2">
                {["Transparência", "Compromisso", "Evolução constante", "Soluções funcionais", "Crescimento mútuo"].map((v, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))] shrink-0" />
                    {v}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── SOBRE (acessível pelo menu mobile) ─── */}
      <motion.section id="sobre" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div variants={fade}>
              <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Nossa história</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3 leading-tight">
                Sobre a NovaesWeb
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mt-5">
                A NovaesWeb é um projeto focado no desenvolvimento de sites, sistemas web e soluções digitais para empresas que desejam melhorar sua presença na internet e organizar melhor seus serviços.
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mt-3">
                Nosso trabalho é criar plataformas simples, modernas e funcionais, permitindo que empresas tenham mais controle sobre seus clientes, produtos e atendimento.
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mt-3">
                Nascemos com a ideia de tornar a tecnologia mais acessível para pequenos e médios negócios, oferecendo ferramentas que realmente ajudam no dia a dia da empresa. Mesmo sendo um projeto recente, já participamos do desenvolvimento de soluções utilizadas por cerca de 6 empresas.
              </p>
            </motion.div>
            <motion.div variants={fade} className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[hsl(var(--primary))]/10">
                <img src={aboutPhoto} alt="Ambiente de trabalho NovaesWeb - desenvolvimento de soluções digitais" className="w-full h-auto object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 glass-card rounded-xl p-4 shadow-lg">
                <p className="text-2xl font-bold gradient-text">6+</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Empresas atendidas</p>
              </div>
            </motion.div>
          </div>

          <div id="quem-somos" className="grid md:grid-cols-3 gap-6">
            <motion.div variants={fade} className="glass-card rounded-2xl p-8">
              <Users className="w-8 h-8 text-[hsl(var(--primary))] mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">Quem Somos</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Somos um projeto independente que trabalha com desenvolvimento web e soluções digitais, utilizando tecnologia moderna e também o apoio de inteligência artificial para otimizar processos e acelerar o desenvolvimento de novos sistemas.
              </p>
            </motion.div>
            <motion.div variants={fade} className="glass-card rounded-2xl p-8">
              <Globe className="w-8 h-8 text-[hsl(var(--primary))] mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">De Onde Viemos</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                A ideia começou com o objetivo de desenvolver sites e sistemas simples para empresas locais. Com o tempo, evoluímos para criar sistemas mais completos como painéis administrativos, cadastro e controle de clientes.
              </p>
            </motion.div>
            <motion.div variants={fade} className="glass-card rounded-2xl p-8">
              <Rocket className="w-8 h-8 text-[hsl(var(--primary))] mb-4" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">Para Onde Vamos</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Seguimos expandindo o projeto, criando novas soluções e aprimorando cada sistema. Surgimos da vontade de aprender, evoluir e criar soluções reais que ajudem empresas a crescer no digital.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── CTA FINAL ─── */}
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
            Preencha o cadastro e nossa equipe entra em contato em até 2 horas para entender seu projeto.
          </p>
          <Link to="/cadastro">
            <Button className="bg-white text-[hsl(var(--primary))] hover:bg-white/90 h-12 px-10 rounded-xl text-base font-semibold shadow-lg">
              Solicitar orçamento <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[hsl(var(--border))] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">NW</span>
            </div>
            <span className="text-sm font-semibold">
              <span className="gradient-text">Novaes</span>
              <span className="text-[hsl(var(--foreground))]">Web</span>
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            © 2025 NovaesWeb — Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}