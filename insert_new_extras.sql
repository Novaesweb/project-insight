-- SQL para adicionar os novos módulos ao catálogo de Extras
-- Execute isso no SQL Editor do seu Supabase

INSERT INTO extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
VALUES 
('Cardápio Virtual Interativo', 'Sistema completo com carrinho, categorias dinâmicas e integração com WhatsApp de pedidos.', 'mensal', 197.00, 49.90, 'ativo'),
('Moderação de Depoimentos & Prova Social', 'Painel administrativo para aprovar/rejeitar avaliações de clientes e exibir no site.', 'fixo', 97.00, 0, 'ativo');
