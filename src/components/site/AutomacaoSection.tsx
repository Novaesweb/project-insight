import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, MessageCircle, Sparkles, CheckCircle, Zap, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import codethioLogo from "@/assets/codethio-logo.jpeg";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function AutomacaoSection() {
  const [showAutomacao, setShowAutomacao] = useState(false);

  return (
    <motion.section className="py-16 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => setShowAutomacao(!showAutomacao)}
          className="w-full h-14 rounded-2xl text-base font-bold gradient-primary text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/35 transition-all"
        >
          🚀 {showAutomacao ? "Fechar Automação Inteligente" : "Ver Automação Inteligente"}
        </Button>

        <AnimatePresence>
          {showAutomacao && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="mt-6 glass-card rounded-2xl p-8 space-y-6">
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-[hsl(var(--primary))]" /> NOVAESWEB + AUTOMAÇÃO INTELIGENTE
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Na NovaesWeb, desenvolvemos sites completos, sistemas de pedidos e soluções digitais estruturadas.
                </p>

                <div className="border-t border-[hsl(var(--border))] pt-5">
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-[hsl(var(--primary))]" /> POSICIONAMENTO
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                    Criamos seu site, organizamos pedidos e automatizamos atendimento.
                  </p>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-5">
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" /> COMO FUNCIONA
                  </h3>
                  <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Desenvolvimento do site</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sistema de pedidos</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Painel administrativo</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Controle completo</li>
                  </ul>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] mt-4 mb-2">+ Automação:</p>
                  <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-[hsl(var(--primary))]" /> WhatsApp automatizado</li>
                    <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[hsl(var(--primary))]" /> Atendimento automático</li>
                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-[hsl(var(--primary))]" /> Respostas rápidas</li>
                  </ul>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-5">
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-3">
                    <ArrowRight className="w-5 h-5 text-[hsl(var(--primary))]" /> RESULTADO
                  </h3>
                  <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <li>👉 Cliente entra no site</li>
                    <li>👉 WhatsApp responde automaticamente</li>
                    <li>👉 Direciona com link pro site</li>
                  </ul>
                  <p className="text-sm font-bold text-[hsl(var(--foreground))] mt-3">🔥 Mais vendas e organização</p>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-5">
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-3">
                    💰 PLANO ESSENCIAL
                  </h3>
                  <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 space-y-4">
                    <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                      A partir de R$ 60<span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">/mês</span>
                    </p>
                    <p className="text-sm text-green-400 font-medium">
                      👉 Ideal para automatizar o atendimento de forma simples e eficiente
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Inclui:</p>
                      <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                        <li className="flex items-start gap-2">🤖 Resposta automática no WhatsApp</li>
                        <li className="flex items-start gap-2">💬 Mensagem inicial de boas-vindas</li>
                        <li className="flex items-start gap-2">📌 Direcionamento para o site (link automático)</li>
                        <li className="flex items-start gap-2">📦 Informações básicas sobre pedidos</li>
                        <li className="flex items-start gap-2">⏱ Respostas rápidas para perguntas frequentes</li>
                        <li className="flex items-start gap-2">🔄 Atendimento inicial organizado</li>
                      </ul>
                    </div>
                    <div className="border-t border-green-500/20 pt-4">
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">⚙️ PERSONALIZAÇÃO</p>
                      <p className="text-xs text-green-400 font-medium mb-3">💡 O valor pode variar de acordo com:</p>
                      <ul className="space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                        <li>📊 Volume de mensagens (ex: 50, 100, 300 por dia)</li>
                        <li>🧠 Complexidade do atendimento</li>
                        <li>🔁 Quantidade de fluxos automatizados</li>
                        <li>📦 Tipo de operação do cliente</li>
                      </ul>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-3">
                        👉 Cada projeto é ajustado conforme a necessidade do negócio
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-5">
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-2">
                    📌 IMPORTANTE
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    Para projetos que utilizam apenas automação no WhatsApp, sem o site, os valores são definidos diretamente pela Codethio.
                  </p>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-5">
                  <p className="text-sm italic text-[hsl(var(--muted-foreground))] leading-relaxed">
                    A NovaesWeb estrutura o sistema. A automação potencializa o atendimento.
                  </p>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-6 flex flex-col items-center text-center gap-3">
                  <p className="text-xs uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Automação desenvolvida por</p>
                  <div className="flex items-center gap-3">
                    <img src={codethioLogo} alt="Codethio" className="w-10 h-10 rounded-full object-cover" />
                    <p className="text-2xl font-bold">
                      <span className="text-[hsl(var(--foreground))]">Code</span><span className="text-green-500">thio</span>
                    </p>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md leading-relaxed">
                    Transformando atendimento em resultado através da automação inteligente.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
