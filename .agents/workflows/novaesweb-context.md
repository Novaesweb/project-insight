---
description: Contexto Geral e Regras de Negócio do Projeto WebNovaX
---

# Projeto: WebNovaX Premium Platform
Este documento serve como a **"memória central"** do agente. Leia isso antes de planejar novas funcionalidades ou refatorações para manter o padrão de engenharia e UI/UX da empresa.

## 1. Stack Tecnológico
- **Frontend**: React (Vite) com TypeScript.
- **Roteamento**: `react-router-dom` com divisão clara de Layouts (Admin, Cliente, Revenda, Público).
- **Estilização**: Tailwind CSS. Uso intenso de classes customizadas como `.glass-card` (efeito de vidro) e `.gradient-text`.
- **Animações**: `framer-motion` (Obrigatório para modais, transições de página e interações premium) e ícones dinâmicos com `lucide-react`.
- **Backend (BaaS)**: Supabase (PostgreSQL, Auth e Storage). 

## 2. Arquitetura e Roteamento (`App.tsx`)
A plataforma é dividida nestes pilares:
1.  **Site Público**: Orientado a altíssima conversão. Usa gatilhos mentais (escassez, prova social) e botões com chamadas diretas para o WhatsApp.
2.  **Painel Admin** (`/admin`): Onde a WebNovaX gerencia clientes, projetos, leads, configurações globais do site e a loja de "Extras".
3.  **Portal do Cliente** (`/cliente`): Área restrita do cliente final para verificar andamento do projeto, faturas, contratos e comprar novos Módulos/Extras.
4.  **Portal de Revenda** (`/revenda`): Dashboard para afiliados gerenciarem comissões e indicações.

## 3. Padrões de Interface e UX (A "Assinatura" WebNovaX)
- **Aparência Premium**: O design deve sempre parecer de alto valor. Use fundos escuros, brilhos de fundo (`ambient-glow`), bordas translúcidas (ex: `border-white/10`) e efeitos de "Hover" que interagem com o usuário (ex: borda vermelha suave ao passar o mouse).
- **Sem Códigos Fixos em Marketing**: Componentes de alta conversão (ex: UrgencyBanner, SocialProofPopup) devem sempre buscar a configuração em tempo real da tabela `app_config` do Supabase para que o dono do site possa alterar textos e ligar/desligar painéis sem alterar o código.
- **Integração WhatsApp**: Ao invés de formulários longos, a conversão padrão é criar CTAs que levam direto para o WhatsApp com mensagens pré-formatadas (`encodeURIComponent`).
- **Responsividade**: Todo código criado ou alterado **deve** usar os prefixos `sm:`, `md:` e `lg:` do Tailwind para garantir que a interface fique tão bonita no iPhone quanto no monitor Desktop. Use `flex-col sm:flex-row` com frequência.

## 4. Banco de Dados (Supabase)
- **Regras de Segurança (RLS)**: Sempre se atente que tabelas usadas na página inicial/pública (ex: `extras_catalogo`) precisam ter políticas ("Policies") que permitam `SELECT` para visitantes anônimos.
- **Tabelas Chave**:
  - `app_config`: Guarda pares de `key` / `value` para configurações universais do site.
  - `extras_catalogo`: O catálogo de módulos adicionais que podem ser vendidos aos clientes.

## 5. Instruções ao Agente (Antigravity AI)
- Toda vez que criar um componente novo, garanta que ele possua os imports do `framer-motion` e que a entrada não seja "seca" (adicione um `initial={{ opacity: 0 }}` e `animate={{ opacity: 1 }}`).
- Não altere as rotas do `App.tsx` sem extrema necessidade de negócio.
- Nunca limite dados estaticamente (hardcode) se for algo que a empresa queira controlar pelo backend.

## 6. Visão de Sócio (Estratégia de Crescimento)
Como "sócio" da WebNovaX, o foco de toda nova funcionalidade deve ser **Conversão**, **Agilidade** e **Customização**.
- **Nicho de Implementação Rápida**: Foco em Lanchonetes, Pizzarias, Dentistas e Comércio Local. O objetivo não é gastar horas em design artístico, mas sim em **ferramentas funcionais** que tragam dinheiro para o cliente.
- **O Diferencial Interativo**: Nosso carro-chefe é o **Cardápio Virtual/Catálogo Interativo com Carrinho**. 
  - *Diferença para os concorrentes*: Sites genéricos não permitem ajustes. O nosso é **100% adaptável**. O cliente pode acrescentar qualquer funcionalidade extra (Cashback, Fidelidade, etc.) de forma modular.
- **Site Ativo, não Passivo**: O site deve ter ferramentas que "pesquem" o lead (Calculadoras de ROI, Iscas Digitais, Exit-Intent).
- **Facilitação de Vendas no Admin**: O Admin deve ter ferramentas que ajudem a prospectar (Geradores de Auditoria, PDFs Automáticos).



