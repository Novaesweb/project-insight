-- SQL para adicionar SLUG e garantir TRIAL nas tabelas
-- Esse campo permitirá URLs como novaesweb.com.br/cardapio/nome-do-cliente

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days');

-- Criar um índice para buscas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_clientes_slug ON clientes(slug);

-- Script para gerar slugs iniciais baseados no nome (opcional)
UPDATE clientes SET slug = LOWER(REPLACE(nome, ' ', '-')) WHERE slug IS NULL;
