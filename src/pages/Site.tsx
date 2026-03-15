import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap, Shield, Smartphone, MessageCircle, Target, Eye, Heart, Users, Rocket, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import NicheCarousel from "@/components/NicheCarousel";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const servicos = [
  { titulo: "Sites Profissionais", desc: "Sites rápidos, modernos e otimizados para atrair clientes todos os dias.", icon: Zap },
  { titulo: "Lojas Virtuais", desc: "Venda seus produtos online com catálogo, carrinho e pagamento integrado.", icon: Shield },
  { titulo: "Aplicativos", desc: "Apps sob medida para seu negócio com foco em usabilidade e performance.", icon: Smartphone },
];

const diferenciais = [
  "Entrega em até 7 dias",
  "Suporte humanizado incluso",
  "100% responsivo para celular",
  "Painel de gestão exclusivo",
  "SEO otimizado para Google",
  "Hospedagem e domínio inclusos",
];

const valores = [
  { icon: CheckCircle, texto: "Transparência no trabalho" },
  { icon: Heart, texto: "Compromisso com os projetos" },
  { icon: Rocket, texto: "Evolução constante" },
  { icon: Zap, texto: "Soluções simples e funcionais" },
  { icon: Users, texto: "Crescimento junto com os clientes" },
];

export default function Site() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">NW</span>
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">Novaes</span>
              <span className="text-[hsl(var(--foreground))]">Web</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
            <a href="#servicos" className="hover:text-[hsl(var(--foreground))] transition-colors">Serviços</a>
            <a href="#nichos" className="hover:text-[hsl(var(--foreground))] transition-colors">Segmentos</a>
            <a href="#sobre" className="hover:text-[hsl(var(--foreground))] transition-colors">Sobre</a>
            <a href="#missao" className="hover:text-[hsl(var(--foreground))] transition-colors">Missão</a>
          </div>
          <Link to="/cadastro">
            <Button className="gradient-primary border-0 text-white text-sm h-9 rounded-lg">
              Começar agora <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        className="pt-32 pb-20 px-4"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-block mb-4 px-4 py-1.5 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium">
            🚀 Soluções digitais para cerca de 6 empresas e contando
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[hsl(var(--foreground))] leading-tight">
            Seu negócio merece um{" "}
            <span className="gradient-text">site profissional</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-[hsl(var(--muted-foreground))] mt-5 max-w-2xl mx-auto">
            Criamos sites, lojas virtuais e sistemas web para empresas que desejam melhorar sua presença na internet e organizar melhor seus serviços.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/cadastro">
              <Button className="gradient-primary border-0 text-white h-12 px-8 rounded-xl text-base font-semibold">
                Começar meu projeto <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="https://wa.me/5500000000000?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-12 px-8 rounded-xl text-base hover:bg-[hsl(var(--muted))]">
                <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
              </Button>
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Serviços */}
      <motion.section id="servicos" className="py-20 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-3">O que fazemos</span>
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Soluções digitais completas</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-2">Plataformas simples, modernas e funcionais para seu negócio</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {servicos.map((s) => (
              <motion.div key={s.titulo} variants={fadeUp} className="glass-card rounded-2xl p-6 hover:border-[hsl(var(--primary))] transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">{s.titulo}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Nichos Carousel */}
      <section id="nichos">
        <NicheCarousel />
      </section>

      {/* Sobre / Quem Somos */}
      <motion.section id="sobre" className="py-20 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-3">Quem somos</span>
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Sobre a NovaesWeb</h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">Nossa história</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                A NovaesWeb nasceu com a ideia de tornar a tecnologia mais acessível para pequenos e médios negócios, oferecendo ferramentas que realmente ajudam no dia a dia da empresa.
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                A ideia começou com o objetivo de desenvolver sites e sistemas simples para empresas locais, principalmente negócios que ainda não tinham presença digital. Com o tempo, o projeto evoluiu para criar sistemas mais completos, como painéis administrativos, sistemas de cadastro e controle de clientes.
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Hoje seguimos expandindo o projeto, criando novas soluções e aprimorando cada sistema desenvolvido.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">Quem somos</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                Somos um projeto independente que trabalha com desenvolvimento web e soluções digitais, utilizando tecnologia moderna e também o apoio de inteligência artificial para otimizar processos e acelerar o desenvolvimento.
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                A NovaesWeb surgiu da vontade de aprender, evoluir e criar soluções reais que possam ajudar empresas a crescer no ambiente digital.
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Estamos em constante evolução, sempre buscando melhorar nossos projetos e entregar soluções cada vez mais completas.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Missão, Visão, Valores */}
      <motion.section id="missao" className="py-20 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-3">Nossos pilares</span>
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Missão, Visão e Valores</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">Missão</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Criar soluções digitais simples, modernas e acessíveis que ajudem empresas a organizar seus serviços e melhorar sua presença online.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">Visão</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Crescer como uma empresa de tecnologia que desenvolve sistemas práticos e eficientes para negócios, sempre evoluindo junto com nossos clientes.
              </p>
            </motion.div>
          </div>
          <motion.div variants={fadeUp} className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-6 text-center">Nossos Valores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {valores.map((v) => (
                <div key={v.texto} className="flex flex-col items-center text-center gap-2 p-4">
                  <v.icon className="w-6 h-6 text-[hsl(var(--primary))]" />
                  <span className="text-sm text-[hsl(var(--foreground))] font-medium">{v.texto}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Diferenciais */}
      <motion.section className="py-20 px-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-3">Por que a NovaesWeb?</span>
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Diferenciais que importam</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {diferenciais.map((d) => (
              <motion.div key={d} variants={fadeUp} className="flex items-center gap-3 glass-card rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--primary))] shrink-0" />
                <span className="text-sm text-[hsl(var(--foreground))]">{d}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">Pronto para começar?</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">Preencha o cadastro e nossa equipe entra em contato em até 2 horas.</p>
          <Link to="/cadastro">
            <Button className="gradient-primary border-0 text-white h-12 px-10 rounded-xl text-base font-semibold">
              Começar agora <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-primary py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white text-sm font-medium tracking-wide">
            NovaesWeb © 2025 — Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}