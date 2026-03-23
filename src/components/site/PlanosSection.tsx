import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Globe, Layers, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function PlanosSection() {
  return (
    <motion.section id="planos" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div variants={fade} className="mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">Investimento Estratégico</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            Planos feitos para <br />
            <span className="gradient-text">escalar o seu negócio</span>
          </h2>
          <p className="text-lg text-white/40 mt-8 leading-relaxed max-w-xl mx-auto font-medium">
            Escolha o plano ideal para o momento da sua empresa. Cada projeto pode evoluir conforme sua demanda cresce.
          </p>
        </motion.div>

        <motion.div variants={fade} className="mt-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-white h-16 px-12 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(255,51,102,0.3)] hover:shadow-[0_25px_50px_rgba(255,51,102,0.5)] transition-all hover:-translate-y-1">
                Explorar Planos <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--background))] border-[hsl(var(--border))] p-6">
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6 text-center">Nossos Planos</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Site Express */}
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
  );
}
