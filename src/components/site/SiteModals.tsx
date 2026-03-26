import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Eye, Heart, Users, Globe, Shield, Zap, ArrowRight } from "lucide-react";
import aboutPhoto from "@/assets/about-webnovax.jpg";
import bellaMassaDemo from "@/assets/bella-massa-demo.png";
import barbeariaDemo from "@/assets/barbearia-demo.png";
import pizzariawebnovaxDemo from "@/assets/pizzaria-webnovax-demo.png";
import acaiDemo from "@/assets/acai-demo.png";
import StoryViewer from "./StoryViewer";

interface SiteModalsProps {
  modalOpen: string | null;
  onClose: () => void;
}

export default function SiteModals({ modalOpen, onClose }: SiteModalsProps) {
  // Se for um story, renderizamos o StoryViewer separadamente para manter a imersão
  if (modalOpen?.startsWith("story-")) {
    const storyId = modalOpen.replace("story-", "");
    return <StoryViewer storyId={storyId} onClose={onClose} />;
  }


  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
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
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))] z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {modalOpen === "sobre" && (
              <div className="p-8">
                <div className="mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Nossa história</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Sobre a webnovax</h2>
                </div>
                <div className="rounded-2xl overflow-hidden mb-6">
                  <img src={aboutPhoto} alt="webnovax" className="w-full h-48 object-cover" />
                </div>
                <div className="space-y-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  <p>A webnovax é um projeto focado no desenvolvimento de sites, sistemas web e soluções digitais para empresas que desejam melhorar sua presença na internet e organizar melhor seus serviços.</p>
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
                </div>
              </div>
            )}

            {modalOpen === "diferenciais" && (
              <div className="p-8">
                <div className="mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Diferenciais</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mt-2">Por que a webnovax?</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Zap, title: "Entrega rápida", desc: "Projetos entregues em até 7 dias úteis." },
                    { icon: Shield, title: "Tecnologia moderna", desc: "React, TypeScript e infraestrutura em nuvem." },
                    { icon: Users, title: "Atendimento humanizado", desc: "Comunicação direta e transparente." },
                    { icon: Target, title: "Foco em resultado", desc: "Cada projeto é pensado para gerar valor real." },
                  ].map((d, i) => (
                    <div key={i} className="glass-card rounded-xl p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                        <d.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-[hsl(var(--foreground))] block">{d.title}</span>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.desc}</span>
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
                  <p>A webnovax valoriza a privacidade dos seus usuários. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.</p>
                  <p><strong className="text-[hsl(var(--foreground))]">Coleta de dados:</strong> Coletamos informações fornecidas voluntariamente por você ao preencher formulários de contato, cadastro ou solicitação de orçamento, como nome, e-mail, telefone e dados do negócio.</p>
                  <p><strong className="text-[hsl(var(--foreground))]">Uso das informações:</strong> As informações são utilizadas exclusivamente para entrar em contato, fornecer orçamentos, desenvolver projetos e melhorar nossos serviços.</p>
                  <p><strong className="text-[hsl(var(--foreground))]">Compartilhamento:</strong> No vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando necessário para a prestação do serviço contratado.</p>
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
                  <p>Ao utilizar os serviços da webnovax, você concorda com os termos descritos abaixo.</p>
                  <p><strong className="text-[hsl(var(--foreground))]">Serviços:</strong> A webnovax oferece desenvolvimento de sites, sistemas web e soluções digitais personalizadas. Cada projeto é definido em comum acordo entre as partes.</p>
                  <p><strong className="text-[hsl(var(--foreground))]">Responsabilidades do cliente:</strong> O cliente é responsável por fornecer informações precisas e conteúdos necessários para o desenvolvimento do projeto dentro dos prazos acordados.</p>
                  <p><strong className="text-[hsl(var(--foreground))]">Propriedade intelectual:</strong> Após a quitação total do projeto, o cliente recebe os direitos de uso sobre o produto desenvolvido. O código-fonte e a tecnologia utilizada permanecem como propriedade da webnovax.</p>
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
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Conheça alguns dos projetos desenvolvidos pela webnovax.</p>
                </div>
                <div className="grid gap-4">
                  {[
                    { name: "Bella Massa", description: "Site completo para pizzaria com cardápio digital e pedidos online.", link: "https://bellamassa0.vercel.app/", image: bellaMassaDemo },
                    { name: "Barbearia", description: "Sistema de agendamento simples e profissional para barbearias.", link: "https://barber00.vercel.app/", image: barbeariaDemo },
                    { name: "Pizzaria webnovax", description: "Plataforma com pedidos integrados e painel administrativo.", link: "https://pizzariawebnovax.vercel.app/", image: pizzariawebnovaxDemo },
                    { name: "Açaí Delivery", description: "Loja online para venda de açaí com controle de pedidos.", link: "https://demoacai.vercel.app/", image: acaiDemo },
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
                        <motion.div className="w-full h-28 overflow-hidden" whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }}>
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

            {modalOpen === "conectividade" && (
              <div className="p-8">
                <div className="mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">Inteligência & Automação</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">Conectividade Estratégica</h2>
                  <p className="text-sm text-white/40 mt-2 italic">A ponte entre sua empresa e o faturamento no piloto automático.</p>
                </div>
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6 border-primary/20 bg-primary/5">
                    <Zap className="w-8 h-8 text-primary mb-3 animate-pulse" />
                    <h3 className="text-base font-bold text-white mb-2">Ecossistema de IA & WhatsApp</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Não é apenas um chat. É uma infraestrutura completa que utiliza IA para qualificar leads, responder dúvidas e fechar vendas 24h por dia diretamente no WhatsApp do seu cliente.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                      <span className="text-xs font-bold text-white block mb-1">Qualificação Automática</span>
                      <p className="text-[10px] text-white/40">Sua IA identifica se o cliente tem perfil antes de passar para o humano.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                      <span className="text-xs font-bold text-white block mb-1">Escalabilidade 24/7</span>
                      <p className="text-[10px] text-white/40">Atenda 10 ou 10.000 pessoas simultaneamente com a mesma precisão.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => window.open("https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20Conectividade%20Estratégica", "_blank")}
                    className="w-full py-4 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-primary/80 transition-all flex items-center justify-center gap-2 group"
                  >
                    Ativar minha Conectividade <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



