import { motion } from "framer-motion";
import { Globe, ShoppingBag, Layers, Smartphone, Shield, Zap } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const servicos = [
  { icon: Globe, titulo: "Sites Profissionais", desc: "Sites rápidos, modernos e otimizados para SEO. Design responsivo que se adapta a qualquer dispositivo. Inclui domínio personalizado, certificado SSL, hospedagem e painel de gestão de conteúdo." },
  { icon: ShoppingBag, titulo: "Lojas Virtuais", desc: "E-commerce completo com catálogo de produtos, carrinho de compras, checkout seguro e integração com meios de pagamento como Pix, cartão e boleto. Controle de estoque e relatórios de vendas." },
  { icon: Layers, titulo: "Sistemas Web", desc: "Sistemas sob medida para gerenciar clientes, pedidos, agendamentos, financeiro, relatórios e tudo que seu negócio precisa. Acesso de qualquer lugar, 100% na nuvem." },
  { icon: Smartphone, titulo: "Landing Pages", desc: "Páginas de alta conversão para campanhas de marketing digital. Design focado em capturar leads e gerar resultados rápidos para seu negócio com formulários inteligentes." },
  { icon: Shield, titulo: "Manutenção e Suporte", desc: "Suporte técnico contínuo, atualizações de segurança, backups automáticos e monitoramento 24h. Garantimos que seu site esteja sempre no ar e funcionando perfeitamente." },
  { icon: Zap, titulo: "Automação e Integrações", desc: "Automatize tarefas repetitivas e integre seu site com WhatsApp, e-mail marketing, redes sociais, Google Analytics e outras ferramentas que potencializam seus resultados." },
];

export default function ServicosSection() {
  return (
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
          {servicos.map((s, i) => (
            <motion.div key={i} variants={fade} className="glass-card rounded-2xl p-8 group info-card-hover">
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
  );
}
