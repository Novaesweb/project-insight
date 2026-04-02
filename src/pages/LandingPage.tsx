import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, MessageCircle, Smartphone, Users, Zap, Star, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.2 } }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* Botão Voltar */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff3366] via-[#a855f7] to-[#ec4899] text-white font-bold text-sm shadow-lg shadow-[#ff3366]/30 hover:shadow-[#a855f7]/40 hover:scale-105 transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </motion.button>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-6 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ff3366]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#ec4899]/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            Seu site não é só um site.<br />
            <span className="text-purple-500">É uma estrutura feita para gerar</span><br />
            <span className="text-red-500">clientes todos os dias.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Criamos sites de vitrine profissionais que direcionam seus clientes direto para o WhatsApp, de forma simples e eficiente.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-600/25"
              onClick={() => scrollToSection('contato')}
            >
              Quero meu site
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300"
              onClick={() => scrollToSection('como-funciona')}
            >
              Como funciona
            </Button>
          </motion.div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-8"
            >
              O <span className="text-purple-500">problema</span> que muitos negócios enfrentam
            </motion.h2>
            
            <motion.p 
              variants={fadeUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Hoje, muitos negócios perdem clientes por não terem um site profissional.<br />
              Dependem apenas de Instagram ou WhatsApp manual, o que gera demora no atendimento e falta de organização.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section id="solucao" className="py-24 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-8"
            >
              Nossa <span className="text-red-500">solução</span>
            </motion.h2>
            
            <motion.p 
              variants={fadeUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              A NovaesWeb cria sites de vitrine pensados para transformar visitantes em clientes.<br />
              Não é só um site bonito — é uma estrutura estratégica para facilitar o contato e aumentar suas conversões.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-8"
            >
              Como <span className="text-purple-500">funciona</span>
            </motion.h2>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "O cliente entra no seu site", desc: "Acesso rápido e profissional" },
              { step: "2", title: "Ele vê suas informações ou serviços", desc: "Conteúdo claro e direto" },
              { step: "3", title: "Clica no botão e chama direto no WhatsApp", desc: "Contato imediato" },
              { step: "4", title: "Você recebe o contato pronto para fechar", desc: "Venda facilitada" }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-purple-500/25">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="py-24 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-8"
            >
              <span className="text-red-500">Benefícios</span> para seu negócio
            </motion.h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Mais clientes entrando em contato", desc: "Aumento real de leads qualificados" },
              { icon: Zap, title: "Atendimento mais rápido", desc: "Resposta imediata via WhatsApp" },
              { icon: Star, title: "Mais profissionalismo", desc: "Imagem profissional digital" },
              { icon: Smartphone, title: "Mais organização", desc: "Contatos centralizados" },
              { icon: CheckCircle, title: "Mais conversão", desc: "Taxa de conversão maior" },
              { icon: MessageCircle, title: "Foco total em resultado", desc: "Sistema pensado para vender" }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
              >
                <item.icon className="w-12 h-12 text-purple-500 mb-6" />
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXEMPLO PRÁTICO */}
      <section id="exemplo" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-8"
            >
              <span className="text-purple-500">Exemplo prático</span>
            </motion.h2>
          </motion.div>
          
          <motion.div 
            variants={fadeUp}
            className="grid md:grid-cols-2 gap-12"
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-purple-500">👨‍⚖️ Advogado</h3>
              <p className="text-gray-300 mb-6">
                Site simples com suas informações, áreas de atuação e um botão direto para o WhatsApp. 
                Clientes marcam consultas facilmente.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Informações profissionais</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>WhatsApp direto</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Contato fácil</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-red-500">🛍️ Loja</h3>
              <p className="text-gray-300 mb-6">
                Mostra seus produtos, preços e recebe pedidos rapidamente pelo WhatsApp. 
                Tudo de forma prática e sem complicação.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Catálogo digital</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Pedidos via WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Atendimento rápido</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DIFERENCIAL */}
      <section id="diferencial" className="py-24 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-8"
            >
              Nosso <span className="text-purple-500">diferencial</span>
            </motion.h2>
            
            <motion.p 
              variants={fadeUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              A gente não cria apenas sites.<br />
              Criamos uma estrutura pensada para gerar clientes, com navegação simples, botão direto para ação e foco total em conversão.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FRASE DE IMPACTO */}
      <section className="py-24 px-6 bg-gradient-to-r from-purple-600 via-red-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-black leading-tight"
          >
            "A gente não cria só site.<br />
            <span className="text-yellow-300">A gente cria uma máquina de clientes.</span>"
          </motion.h2>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contato" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-8"
            >
              Quer ter um site profissional que <span className="text-purple-500">realmente traz clientes</span>?
            </motion.h2>
            
            <motion.p 
              variants={fadeUp}
              className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              Entre em contato agora e veja como podemos montar isso para o seu negócio.
            </motion.p>
            
            <motion.div 
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <a 
                href="https://wa.me/5551991189293?text=Olá! Vi a landing page e quero um site vitrine para meu negócio."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-green-600/25 inline-flex items-center gap-3"
              >
                <MessageCircle className="w-6 h-6" />
                Falar no WhatsApp
              </a>
              
              <Link 
                to="/contato"
                className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-600/25 inline-flex items-center gap-3"
              >
                <Phone className="w-6 h-6" />
                Fale Conosco
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
