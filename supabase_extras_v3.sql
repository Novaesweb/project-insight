-- Tabelas para Pacotes de Extras
CREATE TABLE IF NOT EXISTS public.pacotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    descricao text,
    preco_total numeric,
    status text DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pacote_itens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pacote_id uuid REFERENCES public.pacotes(id) ON DELETE CASCADE,
    extra_id uuid REFERENCES public.extras_catalogo(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar pacote_id a extras_clientes para rastrear origem
ALTER TABLE public.extras_clientes ADD COLUMN IF NOT EXISTS pacote_id uuid REFERENCES public.pacotes(id) ON DELETE SET NULL;

-- 1. EXTRAS ÚNICOS (Categoria: fixo)
INSERT INTO public.extras_catalogo (nome, descricao, categoria, subcategoria, preco_ativacao, preco_mensal, status) VALUES
('Botão WhatsApp', 'Botão flutuante para contato direto', 'fixo', 'Comunicação', 14.90, 0, 'ativo'),
('Botão ligação', 'Botão para chamadas diretas', 'fixo', 'Comunicação', 12.90, 0, 'ativo'),
('Popup promoção', 'Janela flutuante de ofertas', 'fixo', 'Vendas e UI', 14.90, 0, 'ativo'),
('Animação abertura', 'Intro animada premium', 'fixo', 'Vendas e UI', 19.90, 0, 'ativo'),
('Página nova', 'Adição de uma página extra', 'fixo', 'Páginas e conteúdo', 39.00, 0, 'ativo'),
('Página depoimentos', 'Seção dedicada a reviews', 'fixo', 'Páginas e conteúdo', 39.00, 0, 'ativo'),
('Galeria fotos', 'Exibição premium de imagens', 'fixo', 'Produtos', 34.90, 0, 'ativo'),
('Galeria cardápio', 'Visualização de itens de menu', 'fixo', 'Produtos', 19.90, 0, 'ativo'),
('Produtos destaque', 'Seção de campeões de venda', 'fixo', 'Produtos', 24.90, 0, 'ativo'),
('Combos produtos', 'Agrupamento de itens com desconto', 'fixo', 'Produtos', 24.90, 0, 'ativo'),
('Pedido mínimo', 'Regra de valor base para venda', 'fixo', 'Pedidos', 12.90, 0, 'ativo'),
('Histórico pedidos', 'Visualização de compras passadas', 'fixo', 'Pedidos', 14.90, 0, 'ativo'),
('Mapa localização', 'Integração com Google Maps', 'fixo', 'Localização', 9.90, 0, 'ativo'),
('Taxa entrega por bairro', 'Cálculo dinâmico de frete', 'fixo', 'Localização', 59.00, 0, 'ativo'),
('Status aberto/fechado', 'Indicador em tempo real', 'fixo', 'Sistema', 19.90, 0, 'ativo'),
('Proteção login', 'Segurança avançada de acesso', 'fixo', 'Sistema', 59.00, 0, 'ativo'),
('Exportar Excel', 'Extração de dados de planilhas', 'fixo', 'Sistema', 14.90, 0, 'ativo'),
('Dashboard vendas', 'Gráficos e KPIs avançados', 'fixo', 'Sistema', 69.00, 0, 'ativo'),
('Cadastro funcionário', 'Gestão de acessos da equipe', 'fixo', 'Sistema', 59.00, 0, 'ativo');

-- 2. EXTRAS PRO (Categoria: intermediario)
INSERT INTO public.extras_catalogo (nome, descricao, categoria, subcategoria, preco_ativacao, preco_mensal, status) VALUES
('Banner promoções', 'Banners dinâmicos gerenciáveis', 'intermediario', 'Marketing', 39.00, 7.00, 'ativo'),
('Instagram Feed', 'Integração com feed real-time', 'intermediario', 'Marketing', 59.00, 7.00, 'ativo'),
('Contador promoção', 'Relógio de escassez (countdown)', 'intermediario', 'Marketing', 12.00, 7.00, 'ativo'),
('Cupom desconto', 'Sistema de geração de códigos', 'intermediario', 'Vendas', 49.00, 9.00, 'ativo'),
('Cashback', 'Retorno de crédito para o cliente', 'intermediario', 'Vendas', 79.00, 15.00, 'ativo'),
('Fidelidade pontos', 'Acúmulo de pontos por compra', 'intermediario', 'Vendas', 99.00, 19.00, 'ativo'),
('Área VIP', 'Conteúdo exclusivo para assinantes', 'intermediario', 'Cliente', 59.00, 10.00, 'ativo'),
('Avaliação clientes', 'Sistema de estrelas e comentários', 'intermediario', 'Cliente', 49.00, 7.00, 'ativo'),
('Ranking clientes', 'Gamificação do consumo', 'intermediario', 'Cliente', 24.00, 7.00, 'ativo'),
('Mensagem aniversário', 'Disparo automático de parabéns', 'intermediario', 'Cliente', 12.00, 7.00, 'ativo'),
('Promoção automática', 'Regras de desconto por horário', 'intermediario', 'Automação', 24.00, 12.00, 'ativo'),
('Pedido pronto automático', 'Notificação via WhatsApp/Push', 'intermediario', 'Automação', 49.00, 0, 'ativo'),
('Relatório PDF', 'Geração automática de relatórios', 'intermediario', 'Gestão', 12.00, 0, 'ativo'),
('Agendamento pedidos', 'Permite marcar entrega futura', 'intermediario', 'Gestão', 59.00, 0, 'ativo'),
('Reserva atendimento', 'Sistema de reserva de horários', 'intermediario', 'Gestão', 69.00, 12.00, 'ativo');

-- 3. ASSINATURAS (Categoria: mensal)
INSERT INTO public.extras_catalogo (nome, descricao, categoria, subcategoria, preco_ativacao, preco_mensal, status) VALUES
('Manutenção Mensal', 'Prevenção de erros e estabilidade', 'mensal', 'Manutenção', 0, 59.00, 'ativo'),
('Atualização sistema', 'Novas funcionalidades inclusas', 'mensal', 'Manutenção', 0, 49.00, 'ativo'),
('Correção prioritária', 'SLA de resposta de 2 horas', 'mensal', 'Manutenção', 0, 12.00, 'ativo'),
('Atualização banners', 'Troca mensal de artes visuais', 'mensal', 'Crescimento', 0, 12.00, 'ativo'),
('Controle financeiro', 'Gestão completa de fluxo de caixa', 'mensal', 'Crescimento', 89.00, 19.00, 'ativo'),
('Rastreamento pedidos', 'Informações de entrega em tempo real', 'mensal', 'Crescimento', 69.00, 7.00, 'ativo'),
('Domínio profissional', 'Gestão de .com ou .com.br', 'mensal', 'Infraestrutura', 0, 59.00, 'ativo');

-- PACOTES (EXEMPLO)
INSERT INTO public.pacotes (nome, descricao, preco_total) VALUES
('Pacote Vendas', 'Combo essencial: WhatsApp + Destaques + Popup', 49.00),
('Pacote Pro', 'Combo avançado: Cupons + Avaliações + Ranking', 99.00);
