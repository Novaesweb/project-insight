-- Novos extras comerciais do catálogo NovaesWeb

update public.extras_catalogo
set
  descricao = 'Criação de artes promocionais, imagens profissionais e materiais visuais para divulgar o negócio nas redes sociais.',
  categoria = 'mensal',
  preco_ativacao = 0,
  preco_mensal = 197,
  status = 'ativo'
where nome = 'Área do Marketing';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Área do Marketing',
  'Criação de artes promocionais, imagens profissionais e materiais visuais para divulgar o negócio nas redes sociais.',
  'mensal',
  0,
  197,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Área do Marketing'
);

update public.extras_catalogo
set
  descricao = 'Atendimento automático com respostas rápidas, triagem comercial e direcionamento inteligente no WhatsApp.',
  categoria = 'intermediario',
  preco_ativacao = 297,
  preco_mensal = 97,
  status = 'ativo'
where nome = 'Bot de WhatsApp';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Bot de WhatsApp',
  'Atendimento automático com respostas rápidas, triagem comercial e direcionamento inteligente no WhatsApp.',
  'intermediario',
  297,
  97,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Bot de WhatsApp'
);

update public.extras_catalogo
set
  descricao = 'Página estratégica para um segmento específico com mensagem, estrutura e CTA voltados para esse nicho.',
  categoria = 'fixo',
  preco_ativacao = 247,
  preco_mensal = 0,
  status = 'ativo'
where nome = 'Página por Nicho';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Página por Nicho',
  'Página estratégica para um segmento específico com mensagem, estrutura e CTA voltados para esse nicho.',
  'fixo',
  247,
  0,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Página por Nicho'
);

update public.extras_catalogo
set
  descricao = 'Página focada em campanhas, ofertas e ações promocionais para aumentar conversão e gerar mais contatos.',
  categoria = 'fixo',
  preco_ativacao = 197,
  preco_mensal = 0,
  status = 'ativo'
where nome = 'Página de Promoções';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Página de Promoções',
  'Página focada em campanhas, ofertas e ações promocionais para aumentar conversão e gerar mais contatos.',
  'fixo',
  197,
  0,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Página de Promoções'
);

update public.extras_catalogo
set
  descricao = 'Módulo para agendamento de serviços com integração ao WhatsApp e organização do atendimento.',
  categoria = 'intermediario',
  preco_ativacao = 247,
  preco_mensal = 47,
  status = 'ativo'
where nome = 'Agendamento Online';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Agendamento Online',
  'Módulo para agendamento de serviços com integração ao WhatsApp e organização do atendimento.',
  'intermediario',
  247,
  47,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Agendamento Online'
);

update public.extras_catalogo
set
  descricao = 'Cardápio visual mais completo com destaques, combos, adicionais e apresentação premium para delivery.',
  categoria = 'fixo',
  preco_ativacao = 297,
  preco_mensal = 0,
  status = 'ativo'
where nome = 'Cardápio Digital Premium';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Cardápio Digital Premium',
  'Cardápio visual mais completo com destaques, combos, adicionais e apresentação premium para delivery.',
  'fixo',
  297,
  0,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Cardápio Digital Premium'
);

update public.extras_catalogo
set
  descricao = 'Módulo para visualizar, organizar e acompanhar leads recebidos pelo site e pelo WhatsApp.',
  categoria = 'intermediario',
  preco_ativacao = 247,
  preco_mensal = 57,
  status = 'ativo'
where nome = 'Painel de Leads';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Painel de Leads',
  'Módulo para visualizar, organizar e acompanhar leads recebidos pelo site e pelo WhatsApp.',
  'intermediario',
  247,
  57,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Painel de Leads'
);

update public.extras_catalogo
set
  descricao = 'Otimização da estrutura do site para fortalecer a presença local e melhorar o desempenho nas buscas.',
  categoria = 'fixo',
  preco_ativacao = 197,
  preco_mensal = 0,
  status = 'ativo'
where nome = 'SEO Local';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'SEO Local',
  'Otimização da estrutura do site para fortalecer a presença local e melhorar o desempenho nas buscas.',
  'fixo',
  197,
  0,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'SEO Local'
);

update public.extras_catalogo
set
  descricao = 'Área para exibir produtos ou serviços com fotos, descrições e botão de contato direto.',
  categoria = 'fixo',
  preco_ativacao = 227,
  preco_mensal = 0,
  status = 'ativo'
where nome = 'Catálogo de Produtos';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Catálogo de Produtos',
  'Área para exibir produtos ou serviços com fotos, descrições e botão de contato direto.',
  'fixo',
  227,
  0,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Catálogo de Produtos'
);

update public.extras_catalogo
set
  descricao = 'Área para organizar arquivos, logos, materiais, contratos e documentos importantes do cliente.',
  categoria = 'intermediario',
  preco_ativacao = 247,
  preco_mensal = 37,
  status = 'ativo'
where nome = 'Central de Arquivos';

insert into public.extras_catalogo (nome, descricao, categoria, preco_ativacao, preco_mensal, status)
select
  'Central de Arquivos',
  'Área para organizar arquivos, logos, materiais, contratos e documentos importantes do cliente.',
  'intermediario',
  247,
  37,
  'ativo'
where not exists (
  select 1 from public.extras_catalogo where nome = 'Central de Arquivos'
);
