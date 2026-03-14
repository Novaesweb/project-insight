// Rich mock data for NovaesWeb admin panel

export const clientes = [
  { id: "1", nome: "Tech Solutions Ltda", email: "contato@techsolutions.com", telefone: "(11) 98765-4321", documento: "12.345.678/0001-90", cidade: "São Paulo", estado: "SP", endereco: "Rua Augusta, 1500", status: "ativo" as const, dataCadastro: "2025-08-15", avatar: "TS" },
  { id: "2", nome: "Design Lab ME", email: "ola@designlab.com", telefone: "(21) 91234-5678", documento: "23.456.789/0001-01", cidade: "Rio de Janeiro", estado: "RJ", endereco: "Av. Atlântica, 300", status: "ativo" as const, dataCadastro: "2025-09-22", avatar: "DL" },
  { id: "3", nome: "Carlos Mendes", email: "carlos@email.com", telefone: "(31) 99876-5432", documento: "123.456.789-00", cidade: "Belo Horizonte", estado: "MG", endereco: "Rua das Flores, 42", status: "inativo" as const, dataCadastro: "2025-06-10", avatar: "CM" },
  { id: "4", nome: "Startup Hub S.A.", email: "admin@startuphub.com", telefone: "(41) 93456-7890", documento: "34.567.890/0001-12", cidade: "Curitiba", estado: "PR", endereco: "Rua XV de Novembro, 100", status: "ativo" as const, dataCadastro: "2025-10-05", avatar: "SH" },
  { id: "5", nome: "Marina Costa", email: "marina@costa.dev", telefone: "(71) 97654-3210", documento: "234.567.890-11", cidade: "Salvador", estado: "BA", endereco: "Rua Chile, 55", status: "ativo" as const, dataCadastro: "2025-11-18", avatar: "MC" },
  { id: "6", nome: "Loja Bella Moda", email: "contato@bellamoda.com", telefone: "(51) 92345-6789", documento: "45.678.901/0001-23", cidade: "Porto Alegre", estado: "RS", endereco: "Av. Moinhos de Vento, 200", status: "ativo" as const, dataCadastro: "2026-01-08", avatar: "BM" },
  { id: "7", nome: "Dr. Paulo Freitas", email: "paulo@clinicafreitas.com", telefone: "(61) 98765-1234", documento: "345.678.901-22", cidade: "Brasília", estado: "DF", endereco: "SQS 308, Bloco A", status: "ativo" as const, dataCadastro: "2026-02-14", avatar: "PF" },
  { id: "8", nome: "Construtora Alfa", email: "projetos@alfa.eng", telefone: "(48) 91234-0000", documento: "56.789.012/0001-34", cidade: "Florianópolis", estado: "SC", endereco: "Rua Bocaiuva, 500", status: "inativo" as const, dataCadastro: "2025-05-20", avatar: "CA" },
];

export const projetos = [
  { id: "1", titulo: "Redesign E-commerce", descricao: "Novo layout e UX para loja virtual", clienteId: "1", cliente: "Tech Solutions Ltda", responsavel: "Ana Silva", inicio: "2026-01-15", prazo: "2026-04-15", status: "em_andamento" as const, valor: 45000 },
  { id: "2", titulo: "App Mobile Delivery", descricao: "Aplicativo de delivery completo", clienteId: "2", cliente: "Design Lab ME", responsavel: "Pedro Santos", inicio: "2026-02-01", prazo: "2026-06-30", status: "em_andamento" as const, valor: 78000 },
  { id: "3", titulo: "Landing Page Evento", descricao: "Página de captura para evento anual", clienteId: "4", cliente: "Startup Hub S.A.", responsavel: "Julia Mendes", inicio: "2025-11-01", prazo: "2025-12-15", status: "concluido" as const, valor: 12000 },
  { id: "4", titulo: "Sistema CRM Interno", descricao: "CRM personalizado para equipe", clienteId: "1", cliente: "Tech Solutions Ltda", responsavel: "Lucas Oliveira", inicio: "2026-03-01", prazo: "2026-08-01", status: "em_andamento" as const, valor: 95000 },
  { id: "5", titulo: "Portal do Cliente", descricao: "Área do cliente com dashboard", clienteId: "5", cliente: "Marina Costa", responsavel: "Ana Silva", inicio: "2026-01-10", prazo: "2026-03-10", status: "em_revisao" as const, valor: 32000 },
  { id: "6", titulo: "E-commerce Bella Moda", descricao: "Loja virtual completa com catálogo", clienteId: "6", cliente: "Loja Bella Moda", responsavel: "Pedro Santos", inicio: "2026-02-20", prazo: "2026-05-20", status: "em_aberto" as const, valor: 55000 },
  { id: "7", titulo: "Site Clínica Freitas", descricao: "Site institucional com agendamento", clienteId: "7", cliente: "Dr. Paulo Freitas", responsavel: "Julia Mendes", inicio: "2025-12-01", prazo: "2026-02-28", status: "concluido" as const, valor: 28000 },
  { id: "8", titulo: "App Gestão Obras", descricao: "Aplicativo para gestão de obras", clienteId: "8", cliente: "Construtora Alfa", responsavel: "Lucas Oliveira", inicio: "2025-09-01", prazo: "2026-01-30", status: "cancelado" as const, valor: 120000 },
];

export const pedidos = [
  { id: "PED-001", clienteId: "1", cliente: "Tech Solutions Ltda", projetoId: "1", projeto: "Redesign E-commerce", tipo: "Design UI/UX", valor: 15000, data: "2026-03-10", status: "pendente" as const },
  { id: "PED-002", clienteId: "2", cliente: "Design Lab ME", projetoId: "2", projeto: "App Mobile Delivery", tipo: "Desenvolvimento", valor: 28000, data: "2026-03-08", status: "em_revisao" as const },
  { id: "PED-003", clienteId: "4", cliente: "Startup Hub S.A.", projetoId: "3", projeto: "Landing Page Evento", tipo: "Design", valor: 5000, data: "2026-03-05", status: "entregue" as const },
  { id: "PED-004", clienteId: "1", cliente: "Tech Solutions Ltda", projetoId: "4", projeto: "Sistema CRM Interno", tipo: "Consultoria", valor: 8000, data: "2026-03-12", status: "pendente" as const },
  { id: "PED-005", clienteId: "5", cliente: "Marina Costa", projetoId: "5", projeto: "Portal do Cliente", tipo: "Desenvolvimento", valor: 12000, data: "2026-03-01", status: "cancelado" as const },
  { id: "PED-006", clienteId: "6", cliente: "Loja Bella Moda", projetoId: "6", projeto: "E-commerce Bella Moda", tipo: "E-commerce", valor: 22000, data: "2026-03-14", status: "pendente" as const },
  { id: "PED-007", clienteId: "7", cliente: "Dr. Paulo Freitas", projetoId: "7", projeto: "Site Clínica Freitas", tipo: "Site institucional", valor: 14000, data: "2026-02-28", status: "entregue" as const },
  { id: "PED-008", clienteId: "2", cliente: "Design Lab ME", projetoId: "2", projeto: "App Mobile Delivery", tipo: "Testes QA", valor: 6500, data: "2026-03-13", status: "pendente" as const },
];

export const extras = [
  { id: "1", descricao: "Página adicional de FAQ", projetoId: "1", projeto: "Redesign E-commerce", valor: 3500, data: "2026-03-05", status: "aprovado" as const },
  { id: "2", descricao: "Integração com gateway extra", projetoId: "2", projeto: "App Mobile Delivery", valor: 7000, data: "2026-03-08", status: "aguardando" as const },
  { id: "3", descricao: "Relatório customizado", projetoId: "4", projeto: "Sistema CRM Interno", valor: 4500, data: "2026-03-10", status: "aprovado" as const },
  { id: "4", descricao: "Animações premium", projetoId: "3", projeto: "Landing Page Evento", valor: 2000, data: "2025-12-01", status: "aprovado" as const },
  { id: "5", descricao: "Chat em tempo real", projetoId: "5", projeto: "Portal do Cliente", valor: 9000, data: "2026-03-12", status: "recusado" as const },
  { id: "6", descricao: "Módulo de cupons", projetoId: "6", projeto: "E-commerce Bella Moda", valor: 5500, data: "2026-03-14", status: "aguardando" as const },
];

export const tickets = [
  { id: "TK-001", titulo: "Erro no checkout", descricao: "Botão de finalizar compra não responde ao clicar", clienteId: "1", cliente: "Tech Solutions Ltda", prioridade: "critica" as const, status: "aberto" as const, data: "2026-03-14", mensagens: [
    { autor: "Tech Solutions", data: "2026-03-14 09:30", texto: "O botão de finalizar compra não responde quando clico. Já tentei em diferentes navegadores." },
    { autor: "Suporte NovaesWeb", data: "2026-03-14 10:15", texto: "Recebemos seu ticket. Estamos analisando o problema e retornamos em breve." },
  ]},
  { id: "TK-002", titulo: "Ajuste de cores", descricao: "Cores do header não estão conforme aprovado no mockup", clienteId: "2", cliente: "Design Lab ME", prioridade: "normal" as const, status: "em_atendimento" as const, data: "2026-03-13", mensagens: [
    { autor: "Design Lab", data: "2026-03-13 14:00", texto: "As cores do header estão diferentes do que aprovamos no Figma." },
  ]},
  { id: "TK-003", titulo: "Lentidão na listagem", descricao: "Listagem de produtos demora mais de 5 segundos para carregar", clienteId: "4", cliente: "Startup Hub S.A.", prioridade: "normal" as const, status: "resolvido" as const, data: "2026-03-10", mensagens: [] },
  { id: "TK-004", titulo: "Problema no login social", descricao: "Google login retorna erro 403 ao tentar autenticar", clienteId: "5", cliente: "Marina Costa", prioridade: "critica" as const, status: "aberto" as const, data: "2026-03-14", mensagens: [] },
  { id: "TK-005", titulo: "Imagens não carregam", descricao: "As imagens do catálogo não aparecem na versão mobile", clienteId: "6", cliente: "Loja Bella Moda", prioridade: "normal" as const, status: "aberto" as const, data: "2026-03-13", mensagens: [] },
];

export const usuarios = [
  { id: "1", nome: "Novaes", email: "novaes@novaesweb.com.br", cargo: "CEO & Fundador", acesso: "admin" as const, status: "ativo" as const, avatar: "NV" },
  { id: "2", nome: "Ana Silva", email: "ana@novaesweb.com.br", cargo: "Designer Sênior", acesso: "editor" as const, status: "ativo" as const, avatar: "AS" },
  { id: "3", nome: "Pedro Santos", email: "pedro@novaesweb.com.br", cargo: "Desenvolvedor Full Stack", acesso: "editor" as const, status: "ativo" as const, avatar: "PS" },
  { id: "4", nome: "Julia Mendes", email: "julia@novaesweb.com.br", cargo: "Project Manager", acesso: "admin" as const, status: "ativo" as const, avatar: "JM" },
  { id: "5", nome: "Lucas Oliveira", email: "lucas@novaesweb.com.br", cargo: "Desenvolvedor Backend", acesso: "editor" as const, status: "ativo" as const, avatar: "LO" },
  { id: "6", nome: "Mariana Souza", email: "mariana@novaesweb.com.br", cargo: "Estagiária Design", acesso: "visualizador" as const, status: "inativo" as const, avatar: "MS" },
];

export const receitaMensal = [
  { mes: "Out", valor: 42000 },
  { mes: "Nov", valor: 55000 },
  { mes: "Dez", valor: 48000 },
  { mes: "Jan", valor: 62000 },
  { mes: "Fev", valor: 58000 },
  { mes: "Mar", valor: 47000 },
];

export const receitaCategoria = [
  { categoria: "Sites", valor: 42000, fill: "#e8334a" },
  { categoria: "E-commerce", valor: 55000, fill: "#c2185b" },
  { categoria: "Apps", valor: 78000, fill: "#7b1fa2" },
  { categoria: "Marketing", valor: 22000, fill: "#9c27b0" },
  { categoria: "Design", valor: 17000, fill: "#e91e63" },
];

export const financeiro = [
  { id: "1", descricao: "Pagamento Redesign E-commerce - Parcela 1", tipo: "entrada" as const, valor: 15000, data: "2026-03-01", vencimento: "2026-03-01", status: "pago" as const, clienteId: "1", cliente: "Tech Solutions Ltda" },
  { id: "2", descricao: "Pagamento App Delivery - Parcela 2", tipo: "entrada" as const, valor: 19500, data: "2026-03-05", vencimento: "2026-03-05", status: "pago" as const, clienteId: "2", cliente: "Design Lab ME" },
  { id: "3", descricao: "Servidor e Infraestrutura", tipo: "saida" as const, valor: 3200, data: "2026-03-01", vencimento: "2026-03-01", status: "pago" as const, clienteId: "", cliente: "" },
  { id: "4", descricao: "Pagamento CRM - Parcela 1", tipo: "entrada" as const, valor: 23750, data: "2026-03-15", vencimento: "2026-03-15", status: "pendente" as const, clienteId: "1", cliente: "Tech Solutions Ltda" },
  { id: "5", descricao: "Licenças de Software", tipo: "saida" as const, valor: 1800, data: "2026-03-10", vencimento: "2026-03-10", status: "pago" as const, clienteId: "", cliente: "" },
  { id: "6", descricao: "Portal do Cliente - Pagamento Final", tipo: "entrada" as const, valor: 16000, data: "2026-03-20", vencimento: "2026-03-10", status: "em_atraso" as const, clienteId: "5", cliente: "Marina Costa" },
  { id: "7", descricao: "Pagamento Site Clínica - Final", tipo: "entrada" as const, valor: 14000, data: "2026-03-02", vencimento: "2026-03-02", status: "pago" as const, clienteId: "7", cliente: "Dr. Paulo Freitas" },
  { id: "8", descricao: "Freelancer Design", tipo: "saida" as const, valor: 4500, data: "2026-03-08", vencimento: "2026-03-08", status: "pago" as const, clienteId: "", cliente: "" },
];

export const evolucaoFinanceira = [
  { mes: "Out", recebido: 38000, pendente: 12000, atrasado: 5000 },
  { mes: "Nov", recebido: 48000, pendente: 8000, atrasado: 3000 },
  { mes: "Dez", recebido: 42000, pendente: 15000, atrasado: 4000 },
  { mes: "Jan", recebido: 55000, pendente: 10000, atrasado: 2000 },
  { mes: "Fev", recebido: 51000, pendente: 9000, atrasado: 6000 },
  { mes: "Mar", recebido: 48500, pendente: 23750, atrasado: 16000 },
];

export const pageInfo: Record<string, { titulo: string; subtitulo: string }> = {
  "/": { titulo: "Dashboard", subtitulo: "Visão geral do seu negócio" },
  "/clientes": { titulo: "Clientes", subtitulo: "Gerencie sua base de clientes" },
  "/projetos": { titulo: "Projetos", subtitulo: "Gerenciamento de projetos" },
  "/pedidos": { titulo: "Pedidos", subtitulo: "Controle de pedidos e solicitações" },
  "/extras": { titulo: "Extras", subtitulo: "Serviços e cobranças adicionais" },
  "/relatorios": { titulo: "Relatórios", subtitulo: "Gere e exporte relatórios" },
  "/financeiro": { titulo: "Financeiro", subtitulo: "Visão financeira do negócio" },
  "/suporte": { titulo: "Suporte", subtitulo: "Gestão de tickets de suporte" },
  "/usuarios": { titulo: "Usuários", subtitulo: "Equipe interna do sistema" },
  "/configuracoes": { titulo: "Configurações", subtitulo: "Configurações do sistema" },
};
