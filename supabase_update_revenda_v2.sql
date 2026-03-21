-- Atualizar tabela de revendedores com novos campos de controle
ALTER TABLE revendedores ADD COLUMN IF NOT EXISTS tipo_comissao TEXT DEFAULT 'porcentagem' CHECK (tipo_comissao IN ('fixo', 'porcentagem'));
ALTER TABLE revendedores ADD COLUMN IF NOT EXISTS valor_comissao DECIMAL DEFAULT 10;
ALTER TABLE revendedores ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT DEFAULT 'unico' CHECK (metodo_pagamento IN ('unico', 'recorrente'));
ALTER TABLE revendedores ADD COLUMN IF NOT EXISTS senha TEXT;
