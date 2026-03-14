// Mock data for the admin panel

export const clientes = [
  { id: "1", nome: "Tech Solutions Ltda", email: "contato@techsolutions.com", telefone: "(11) 98765-4321", documento: "12.345.678/0001-90", endereco: "Rua Augusta, 1500 - SP", status: "ativo" as const },
  { id: "2", nome: "Design Lab ME", email: "ola@designlab.com", telefone: "(21) 91234-5678", documento: "23.456.789/0001-01", endereco: "Av. Atlântica, 300 - RJ", status: "ativo" as const },
  { id: "3", nome: "Carlos Mendes", email: "carlos@email.com", telefone: "(31) 99876-5432", documento: "123.456.789-00", endereco: "Rua das Flores, 42 - BH", status: "inativo" as const },
  { id: "4", nome: "Startup Hub S.A.", email: "admin@startuphub.com", telefone: "(41) 93456-7890", documento: "34.567.890/0001-12", endereco: "Rua XV de Novembro, 100 - CWB", status: "ativo" as const },
  { id: "5", nome: "Marina Costa", email: "marina@costa.dev", telefone: "(71) 97654-3210", documento: "234.567.890-11", endereco: "Rua Chile, 55 - SSA", status: "ativo" as const },
];

export const projetos = [
  { id: "1", titulo: "Redesign E-commerce", descricao: "Novo layout e UX para loja virtual", clienteId: "1", cliente: "Tech Solutions Ltda", responsavel: "Ana Silva", inicio: "2026-01-15", prazo: "2026-04-15", status: "em_andamento" as const, valor: 45000 },
  { id: "2", titulo: "App Mobile Delivery", descricao: "Aplicativo de delivery completo", clienteId: "2", cliente: "Design Lab ME", responsavel: "Pedro Santos", inicio: "2026-02-01", prazo: "2026-06-30", status: "em_andamento" as const, valor: 78000 },
  { id: "3", titulo: "Landing Page Evento", descricao: "Página de captura para evento anual", clienteId: "4", cliente: "Startup Hub S.A.", responsavel: "Julia Mendes", inicio: "2025-11-01", prazo: "2025-12-15", status: "concluido" as const, valor: 12000 },
  { id: "4", titulo: "Sistema CRM Interno", descricao: "CRM personalizado para equipe", clienteId: "1", cliente: "Tech Solutions Ltda", responsavel: "Lucas Oliveira", inicio: "2026-03-01", prazo: "2026-08-01", status: "em_andamento" as const, valor: 95000 },
  { id: "5", titulo: "Portal do Cliente", descricao: "Área do cliente com dashboard", clienteId: "5", cliente: "Marina Costa", responsavel: "Ana Silva", inicio: "2026-01-10", prazo: "2026-03-10", status: "pausado" as const, valor: 32000 },
];

export const pedidos = [
  { id: "PED-001", clienteId: "1", cliente: "Tech Solutions Ltda", projetoId: "1", projeto: "Redesign E-commerce", tipo: "Design UI/UX", valor: 15000, data: "2026-03-10", status: "pendente" as const },
  { id: "PED-002", clienteId: "2", cliente: "Design Lab ME", projetoId: "2", projeto: "App Mobile Delivery", tipo: "Desenvolvimento", valor: 28000, data: "2026-03-08", status: "em_revisao" as const },
  { id: "PED-003", clienteId: "4", cliente: "Startup Hub S.A.", projetoId: "3", projeto: "Landing Page Evento", tipo: "Design", valor: 5000, data: "2026-03-05", status: "entregue" as const },
  { id: "PED-004", clienteId: "1", cliente: "Tech Solutions Ltda", projetoId: "4", projeto: "Sistema CRM Interno", tipo: "Consultoria", valor: 8000, data: "2026-03-12", status: "pendente" as const },
  { id: "PED-005", clienteId: "5", cliente: "Marina Costa", projetoId: "5", projeto: "Portal do Cliente", tipo: "Desenvolvimento", valor: 12000, data: "2026-03-01", status: "cancelado" as const },
];

export const extras = [
  { id: "1", descricao: "Página adicional de FAQ", projetoId: "1", projeto: "Redesign E-commerce", valor: 3500, data: "2026-03-05", aprovado: true },
  { id: "2", descricao: "Integração com gateway extra", projetoId: "2", projeto: "App Mobile Delivery", valor: 7000, data: "2026-03-08", aprovado: false },
  { id: "3", descricao: "Relatório customizado", projetoId: "4", projeto: "Sistema CRM Interno", valor: 4500, data: "2026-03-10", aprovado: true },
  { id: "4", descricao: "Animações premium", projetoId: "3", projeto: "Landing Page Evento", valor: 2000, data: "2025-12-01", aprovado: true },
];

export const tickets = [
  { id: "1", titulo: "Erro no checkout", descricao: "Botão de finalizar compra não responde", clienteId: "1", cliente: "Tech Solutions Ltda", prioridade: "critica" as const, status: "aberto" as const, data: "2026-03-14" },
  { id: "2", titulo: "Ajuste de cores", descricao: "Cores do header não estão conforme aprovado", clienteId: "2", cliente: "Design Lab ME", prioridade: "normal" as const, status: "em_atendimento" as const, data: "2026-03-13" },
  { id: "3", titulo: "Lentidão na listagem", descricao: "Listagem de produtos demora mais de 5s", clienteId: "4", cliente: "Startup Hub S.A.", prioridade: "normal" as const, status: "resolvido" as const, data: "2026-03-10" },
  { id: "4", titulo: "Problema no login social", descricao: "Google login retorna erro 403", clienteId: "5", cliente: "Marina Costa", prioridade: "critica" as const, status: "aberto" as const, data: "2026-03-14" },
];

export const usuarios = [
  { id: "1", nome: "Ana Silva", email: "ana@empresa.com", cargo: "Designer Sênior", acesso: "admin" as const, status: "ativo" as const },
  { id: "2", nome: "Pedro Santos", email: "pedro@empresa.com", cargo: "Desenvolvedor Full Stack", acesso: "editor" as const, status: "ativo" as const },
  { id: "3", nome: "Julia Mendes", email: "julia@empresa.com", cargo: "Project Manager", acesso: "admin" as const, status: "ativo" as const },
  { id: "4", nome: "Lucas Oliveira", email: "lucas@empresa.com", cargo: "Desenvolvedor Backend", acesso: "editor" as const, status: "ativo" as const },
  { id: "5", nome: "Mariana Souza", email: "mariana@empresa.com", cargo: "Estagiária", acesso: "visualizador" as const, status: "inativo" as const },
];

export const receitaMensal = [
  { mes: "Out", valor: 42000 },
  { mes: "Nov", valor: 55000 },
  { mes: "Dez", valor: 48000 },
  { mes: "Jan", valor: 62000 },
  { mes: "Fev", valor: 58000 },
  { mes: "Mar", valor: 71000 },
];

export const receitaCategoria = [
  { categoria: "Design", valor: 35000 },
  { categoria: "Desenvolvimento", valor: 85000 },
  { categoria: "Consultoria", valor: 22000 },
  { categoria: "Extras", valor: 17000 },
];

export const financeiro = [
  { id: "1", descricao: "Pagamento Redesign E-commerce - Parcela 1", tipo: "entrada" as const, valor: 15000, data: "2026-03-01", status: "pago" as const, clienteId: "1", cliente: "Tech Solutions Ltda" },
  { id: "2", descricao: "Pagamento App Delivery - Parcela 2", tipo: "entrada" as const, valor: 19500, data: "2026-03-05", status: "pago" as const, clienteId: "2", cliente: "Design Lab ME" },
  { id: "3", descricao: "Servidor e Infraestrutura", tipo: "saida" as const, valor: 3200, data: "2026-03-01", status: "pago" as const, clienteId: "", cliente: "" },
  { id: "4", descricao: "Pagamento CRM - Parcela 1", tipo: "entrada" as const, valor: 23750, data: "2026-03-15", status: "pendente" as const, clienteId: "1", cliente: "Tech Solutions Ltda" },
  { id: "5", descricao: "Licenças de Software", tipo: "saida" as const, valor: 1800, data: "2026-03-10", status: "pago" as const, clienteId: "", cliente: "" },
  { id: "6", descricao: "Portal do Cliente - Pagamento Final", tipo: "entrada" as const, valor: 16000, data: "2026-03-20", status: "em_atraso" as const, clienteId: "5", cliente: "Marina Costa" },
];
