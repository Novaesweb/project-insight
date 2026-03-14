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

export type CategoriaExtra = "fixo" | "intermediario" | "mensal";

export interface ExtraCatalogo {
  id: string;
  nome: string;
  descricao?: string;
  categoria: CategoriaExtra;
  precoAtivacao: number;
  precoMensal: number;
  status: "ativo" | "inativo";
}

export interface ExtraCliente {
  id: string;
  clienteId: string;
  cliente: string;
  extraId: string;
  extraNome: string;
  categoria: CategoriaExtra;
  precoAtivacao: number;
  precoMensal: number;
  dataAtivacao: string;
  dataCancelamento?: string;
  observacao?: string;
  status: "ativo" | "pausado" | "cancelado";
}

export const extrasCatalogo: ExtraCatalogo[] = [
  // FIXOS
  { id: "f1", nome: "Botão WhatsApp", categoria: "fixo", precoAtivacao: 14.90, precoMensal: 0, status: "ativo" },
  { id: "f2", nome: "Página nova", categoria: "fixo", precoAtivacao: 39.00, precoMensal: 0, status: "ativo" },
  { id: "f3", nome: "Galeria fotos", categoria: "fixo", precoAtivacao: 34.90, precoMensal: 0, status: "ativo" },
  { id: "f4", nome: "Produtos destaque", categoria: "fixo", precoAtivacao: 24.90, precoMensal: 0, status: "ativo" },
  { id: "f5", nome: "Pedido mínimo", categoria: "fixo", precoAtivacao: 12.90, precoMensal: 0, status: "ativo" },
  { id: "f6", nome: "Combos produtos", categoria: "fixo", precoAtivacao: 24.90, precoMensal: 0, status: "ativo" },
  { id: "f7", nome: "Taxa entrega bairro", categoria: "fixo", precoAtivacao: 59.00, precoMensal: 0, status: "ativo" },
  { id: "f8", nome: "Landing promoção", categoria: "fixo", precoAtivacao: 49.90, precoMensal: 0, status: "ativo" },
  { id: "f9", nome: "Status aberto/fechado", categoria: "fixo", precoAtivacao: 19.90, precoMensal: 0, status: "ativo" },
  { id: "f10", nome: "Proteção login", categoria: "fixo", precoAtivacao: 59.00, precoMensal: 0, status: "ativo" },
  { id: "f11", nome: "Exportar Excel", categoria: "fixo", precoAtivacao: 14.90, precoMensal: 0, status: "ativo" },
  { id: "f12", nome: "Dashboard gráfico vendas", categoria: "fixo", precoAtivacao: 69.00, precoMensal: 0, status: "ativo" },
  { id: "f13", nome: "Animação abertura", categoria: "fixo", precoAtivacao: 19.90, precoMensal: 0, status: "ativo" },
  { id: "f14", nome: "Popup promoção", categoria: "fixo", precoAtivacao: 14.90, precoMensal: 0, status: "ativo" },
  { id: "f15", nome: "Página depoimentos", categoria: "fixo", precoAtivacao: 39.00, precoMensal: 0, status: "ativo" },
  { id: "f16", nome: "Mapa localização", categoria: "fixo", precoAtivacao: 9.90, precoMensal: 0, status: "ativo" },
  { id: "f17", nome: "Botão ligação", categoria: "fixo", precoAtivacao: 12.90, precoMensal: 0, status: "ativo" },
  { id: "f18", nome: "Galeria cardápio", categoria: "fixo", precoAtivacao: 19.90, precoMensal: 0, status: "ativo" },
  { id: "f19", nome: "Histórico pedidos", categoria: "fixo", precoAtivacao: 14.90, precoMensal: 0, status: "ativo" },
  { id: "f20", nome: "Promoção do dia", categoria: "fixo", precoAtivacao: 12.00, precoMensal: 0, status: "ativo" },
  { id: "f21", nome: "Cadastro funcionário", categoria: "fixo", precoAtivacao: 59.00, precoMensal: 0, status: "ativo" },
  { id: "f22", nome: "Cardápio digital PDF", categoria: "fixo", precoAtivacao: 19.90, precoMensal: 0, status: "ativo" },
  { id: "f23", nome: "Botão Telegram", categoria: "fixo", precoAtivacao: 12.90, precoMensal: 0, status: "ativo" },
  { id: "f24", nome: "Página FAQ", categoria: "fixo", precoAtivacao: 29.90, precoMensal: 0, status: "ativo" },
  { id: "f25", nome: "Contador de visitas", categoria: "fixo", precoAtivacao: 14.90, precoMensal: 0, status: "ativo" },
  { id: "f26", nome: "Botão voltar ao topo", categoria: "fixo", precoAtivacao: 9.90, precoMensal: 0, status: "ativo" },
  { id: "f27", nome: "Integração Pixel Facebook", categoria: "fixo", precoAtivacao: 39.00, precoMensal: 0, status: "ativo" },
  { id: "f28", nome: "Integração Google Analytics", categoria: "fixo", precoAtivacao: 34.90, precoMensal: 0, status: "ativo" },
  { id: "f29", nome: "Página de links (Linktree)", categoria: "fixo", precoAtivacao: 29.90, precoMensal: 0, status: "ativo" },
  { id: "f30", nome: "Formulário de orçamento", categoria: "fixo", precoAtivacao: 34.90, precoMensal: 0, status: "ativo" },
  { id: "f31", nome: "Chat ao vivo (widget)", categoria: "fixo", precoAtivacao: 49.00, precoMensal: 0, status: "ativo" },
  // INTERMEDIÁRIOS
  { id: "i1", nome: "Banner promoções", categoria: "intermediario", precoAtivacao: 39, precoMensal: 7, status: "ativo" },
  { id: "i2", nome: "Cupom desconto", categoria: "intermediario", precoAtivacao: 49, precoMensal: 9, status: "ativo" },
  { id: "i3", nome: "Área VIP", categoria: "intermediario", precoAtivacao: 59, precoMensal: 10, status: "ativo" },
  { id: "i4", nome: "Avaliação clientes", categoria: "intermediario", precoAtivacao: 49, precoMensal: 7, status: "ativo" },
  { id: "i5", nome: "Promoção automática", categoria: "intermediario", precoAtivacao: 24, precoMensal: 12, status: "ativo" },
  { id: "i6", nome: "Contador promoção", categoria: "intermediario", precoAtivacao: 12, precoMensal: 7, status: "ativo" },
  { id: "i7", nome: "Mensagem aniversário", categoria: "intermediario", precoAtivacao: 12, precoMensal: 7, status: "ativo" },
  { id: "i8", nome: "Ranking vendidos", categoria: "intermediario", precoAtivacao: 14, precoMensal: 0, status: "ativo" },
  { id: "i9", nome: "Relatório PDF", categoria: "intermediario", precoAtivacao: 12, precoMensal: 0, status: "ativo" },
  { id: "i10", nome: "Agendamento pedidos", categoria: "intermediario", precoAtivacao: 59, precoMensal: 0, status: "ativo" },
  { id: "i11", nome: "Sugestão produtos", categoria: "intermediario", precoAtivacao: 14.90, precoMensal: 0, status: "ativo" },
  { id: "i12", nome: "Cashback", categoria: "intermediario", precoAtivacao: 79, precoMensal: 15, status: "ativo" },
  { id: "i13", nome: "Fidelidade pontos", categoria: "intermediario", precoAtivacao: 99, precoMensal: 19, status: "ativo" },
  { id: "i14", nome: "Reserva atendimento", categoria: "intermediario", precoAtivacao: 69, precoMensal: 12, status: "ativo" },
  { id: "i15", nome: "Instagram Feed", categoria: "intermediario", precoAtivacao: 59, precoMensal: 7, status: "ativo" },
  { id: "i16", nome: "Ranking clientes", categoria: "intermediario", precoAtivacao: 24, precoMensal: 7, status: "ativo" },
  { id: "i17", nome: "Avaliação pedidos", categoria: "intermediario", precoAtivacao: 19, precoMensal: 7, status: "ativo" },
  { id: "i18", nome: "Pedido pronto automático", categoria: "intermediario", precoAtivacao: 49, precoMensal: 0, status: "ativo" },
  { id: "i19", nome: "Notificação push", categoria: "intermediario", precoAtivacao: 49, precoMensal: 12, status: "ativo" },
  { id: "i20", nome: "Newsletter automática", categoria: "intermediario", precoAtivacao: 59, precoMensal: 15, status: "ativo" },
  { id: "i21", nome: "Integração iFood", categoria: "intermediario", precoAtivacao: 79, precoMensal: 19, status: "ativo" },
  { id: "i22", nome: "Vitrine rotativa", categoria: "intermediario", precoAtivacao: 34, precoMensal: 9, status: "ativo" },
  { id: "i23", nome: "Programa indicação", categoria: "intermediario", precoAtivacao: 89, precoMensal: 19, status: "ativo" },
  { id: "i24", nome: "WhatsApp multiagente", categoria: "intermediario", precoAtivacao: 99, precoMensal: 25, status: "ativo" },
  { id: "i25", nome: "Relatório mensal acessos", categoria: "intermediario", precoAtivacao: 29, precoMensal: 12, status: "ativo" },
  { id: "i26", nome: "QR code cardápio", categoria: "intermediario", precoAtivacao: 24, precoMensal: 7, status: "ativo" },
  // MENSAIS
  { id: "m1", nome: "Manutenção", categoria: "mensal", precoAtivacao: 0, precoMensal: 59, status: "ativo" },
  { id: "m2", nome: "Rastreamento pedidos", categoria: "mensal", precoAtivacao: 69, precoMensal: 7, status: "ativo" },
  { id: "m3", nome: "Controle financeiro", categoria: "mensal", precoAtivacao: 89, precoMensal: 19, status: "ativo" },
  { id: "m4", nome: "Atualização sistema", categoria: "mensal", precoAtivacao: 0, precoMensal: 49, status: "ativo" },
  { id: "m5", nome: "Correção prioritária", categoria: "mensal", precoAtivacao: 0, precoMensal: 12, status: "ativo" },
  { id: "m6", nome: "Atualização banners", categoria: "mensal", precoAtivacao: 0, precoMensal: 12, status: "ativo" },
  { id: "m7", nome: "Domínio profissional", categoria: "mensal", precoAtivacao: 0, precoMensal: 59, status: "ativo" },
  { id: "m8", nome: "Backup semanal automático", categoria: "mensal", precoAtivacao: 0, precoMensal: 19, status: "ativo" },
  { id: "m9", nome: "Monitoramento uptime", categoria: "mensal", precoAtivacao: 0, precoMensal: 29, status: "ativo" },
  { id: "m10", nome: "SEO mensal básico", categoria: "mensal", precoAtivacao: 0, precoMensal: 79, status: "ativo" },
  { id: "m11", nome: "Gestão redes sociais", categoria: "mensal", precoAtivacao: 0, precoMensal: 149, status: "ativo" },
];

export const extrasClientes: ExtraCliente[] = [
  { id: "ec1", clienteId: "1", cliente: "Tech Solutions Ltda", extraId: "f1", extraNome: "Botão WhatsApp", categoria: "fixo", precoAtivacao: 14.90, precoMensal: 0, dataAtivacao: "2025-09-10", status: "ativo" },
  { id: "ec2", clienteId: "1", cliente: "Tech Solutions Ltda", extraId: "i2", extraNome: "Cupom desconto", categoria: "intermediario", precoAtivacao: 49, precoMensal: 9, dataAtivacao: "2025-10-01", status: "ativo" },
  { id: "ec3", clienteId: "1", cliente: "Tech Solutions Ltda", extraId: "m1", extraNome: "Manutenção", categoria: "mensal", precoAtivacao: 0, precoMensal: 59, dataAtivacao: "2025-08-20", status: "ativo" },
  { id: "ec4", clienteId: "2", cliente: "Design Lab ME", extraId: "f3", extraNome: "Galeria fotos", categoria: "fixo", precoAtivacao: 34.90, precoMensal: 0, dataAtivacao: "2025-10-15", status: "ativo" },
  { id: "ec5", clienteId: "2", cliente: "Design Lab ME", extraId: "i15", extraNome: "Instagram Feed", categoria: "intermediario", precoAtivacao: 59, precoMensal: 7, dataAtivacao: "2025-11-01", status: "ativo" },
  { id: "ec6", clienteId: "2", cliente: "Design Lab ME", extraId: "m7", extraNome: "Domínio profissional", categoria: "mensal", precoAtivacao: 0, precoMensal: 59, dataAtivacao: "2025-09-22", status: "ativo" },
  { id: "ec7", clienteId: "4", cliente: "Startup Hub S.A.", extraId: "f12", extraNome: "Dashboard gráfico vendas", categoria: "fixo", precoAtivacao: 69, precoMensal: 0, dataAtivacao: "2025-12-01", status: "ativo" },
  { id: "ec8", clienteId: "4", cliente: "Startup Hub S.A.", extraId: "i12", extraNome: "Cashback", categoria: "intermediario", precoAtivacao: 79, precoMensal: 15, dataAtivacao: "2026-01-10", status: "ativo" },
  { id: "ec9", clienteId: "5", cliente: "Marina Costa", extraId: "m10", extraNome: "SEO mensal básico", categoria: "mensal", precoAtivacao: 0, precoMensal: 79, dataAtivacao: "2026-01-15", status: "ativo" },
  { id: "ec10", clienteId: "5", cliente: "Marina Costa", extraId: "f27", extraNome: "Integração Pixel Facebook", categoria: "fixo", precoAtivacao: 39, precoMensal: 0, dataAtivacao: "2026-02-01", status: "ativo" },
  { id: "ec11", clienteId: "6", cliente: "Loja Bella Moda", extraId: "i1", extraNome: "Banner promoções", categoria: "intermediario", precoAtivacao: 39, precoMensal: 7, dataAtivacao: "2026-02-01", status: "ativo" },
  { id: "ec12", clienteId: "6", cliente: "Loja Bella Moda", extraId: "m1", extraNome: "Manutenção", categoria: "mensal", precoAtivacao: 0, precoMensal: 59, dataAtivacao: "2026-01-15", status: "ativo" },
  { id: "ec13", clienteId: "6", cliente: "Loja Bella Moda", extraId: "f4", extraNome: "Produtos destaque", categoria: "fixo", precoAtivacao: 24.90, precoMensal: 0, dataAtivacao: "2026-02-10", status: "ativo" },
  { id: "ec14", clienteId: "7", cliente: "Dr. Paulo Freitas", extraId: "f16", extraNome: "Mapa localização", categoria: "fixo", precoAtivacao: 9.90, precoMensal: 0, dataAtivacao: "2026-02-20", status: "ativo" },
  { id: "ec15", clienteId: "7", cliente: "Dr. Paulo Freitas", extraId: "m4", extraNome: "Atualização sistema", categoria: "mensal", precoAtivacao: 0, precoMensal: 49, dataAtivacao: "2026-02-14", status: "ativo" },
  { id: "ec16", clienteId: "1", cliente: "Tech Solutions Ltda", extraId: "i13", extraNome: "Fidelidade pontos", categoria: "intermediario", precoAtivacao: 99, precoMensal: 19, dataAtivacao: "2026-01-05", dataCancelamento: "2026-03-01", status: "cancelado" },
  { id: "ec17", clienteId: "4", cliente: "Startup Hub S.A.", extraId: "m1", extraNome: "Manutenção", categoria: "mensal", precoAtivacao: 0, precoMensal: 59, dataAtivacao: "2025-10-10", status: "pausado" },
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

export type StatusReuniao = "agendada" | "confirmada" | "realizada" | "cancelada" | "aguardando";
export type TipoReuniao = "apresentacao" | "alinhamento" | "suporte" | "fechamento";

export interface Reuniao {
  id: string;
  clienteId: string;
  cliente: string;
  tipo: TipoReuniao;
  data: string;
  horaInicio: string;
  horaFim: string;
  link?: string;
  observacoes?: string;
  status: StatusReuniao;
}

export const reunioes: Reuniao[] = [
  { id: "r1", clienteId: "1", cliente: "Tech Solutions Ltda", tipo: "alinhamento", data: "2026-03-14", horaInicio: "09:00", horaFim: "10:00", link: "https://meet.google.com/abc-defg-hij", observacoes: "Revisão do sprint 3", status: "confirmada" },
  { id: "r2", clienteId: "2", cliente: "Design Lab ME", tipo: "apresentacao", data: "2026-03-14", horaInicio: "11:00", horaFim: "12:00", link: "https://zoom.us/j/123456", status: "agendada" },
  { id: "r3", clienteId: "4", cliente: "Startup Hub S.A.", tipo: "fechamento", data: "2026-03-14", horaInicio: "14:00", horaFim: "15:00", link: "https://meet.google.com/xyz-uvwx", observacoes: "Proposta comercial final", status: "aguardando" },
  { id: "r4", clienteId: "5", cliente: "Marina Costa", tipo: "suporte", data: "2026-03-15", horaInicio: "10:00", horaFim: "10:30", status: "agendada" },
  { id: "r5", clienteId: "6", cliente: "Loja Bella Moda", tipo: "apresentacao", data: "2026-03-15", horaInicio: "14:00", horaFim: "15:30", link: "https://meet.google.com/lmn-opqr", observacoes: "Apresentação do layout do e-commerce", status: "confirmada" },
  { id: "r6", clienteId: "7", cliente: "Dr. Paulo Freitas", tipo: "alinhamento", data: "2026-03-16", horaInicio: "09:00", horaFim: "09:30", status: "agendada" },
  { id: "r7", clienteId: "1", cliente: "Tech Solutions Ltda", tipo: "suporte", data: "2026-03-17", horaInicio: "11:00", horaFim: "12:00", link: "https://zoom.us/j/789012", status: "agendada" },
  { id: "r8", clienteId: "2", cliente: "Design Lab ME", tipo: "fechamento", data: "2026-03-18", horaInicio: "15:00", horaFim: "16:00", status: "agendada" },
  { id: "r9", clienteId: "4", cliente: "Startup Hub S.A.", tipo: "alinhamento", data: "2026-03-10", horaInicio: "10:00", horaFim: "11:00", status: "realizada" },
  { id: "r10", clienteId: "5", cliente: "Marina Costa", tipo: "apresentacao", data: "2026-03-08", horaInicio: "14:00", horaFim: "15:00", status: "cancelada" },
];

export const tipoReuniaoLabels: Record<TipoReuniao, string> = {
  apresentacao: "Apresentação",
  alinhamento: "Alinhamento",
  suporte: "Suporte",
  fechamento: "Fechamento",
};

export const statusReuniaoLabels: Record<StatusReuniao, string> = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  aguardando: "Aguardando",
};

export const statusReuniaoColors: Record<StatusReuniao, string> = {
  agendada: "#60a5fa",
  confirmada: "#4ade80",
  realizada: "#9ca3af",
  cancelada: "#ef4444",
  aguardando: "#facc15",
};

// Contratos
export interface Contrato {
  id: string;
  clienteId: string;
  cliente: string;
  titulo: string;
  descricao: string;
  valor: number;
  dataEnvio: string;
  dataAssinatura?: string;
  status: "aguardando" | "assinado" | "cancelado";
}

export const contratos: Contrato[] = [
  { id: "c1", clienteId: "1", cliente: "Tech Solutions Ltda", titulo: "Contrato Redesign E-commerce", descricao: "Desenvolvimento completo do novo e-commerce", valor: 45000, dataEnvio: "2026-01-10", dataAssinatura: "2026-01-14", status: "assinado" },
  { id: "c2", clienteId: "1", cliente: "Tech Solutions Ltda", titulo: "Contrato CRM Interno", descricao: "Sistema CRM personalizado", valor: 95000, dataEnvio: "2026-02-25", dataAssinatura: "2026-02-28", status: "assinado" },
  { id: "c3", clienteId: "2", cliente: "Design Lab ME", titulo: "Contrato App Delivery", descricao: "Aplicativo mobile de delivery", valor: 78000, dataEnvio: "2026-01-28", dataAssinatura: "2026-02-01", status: "assinado" },
  { id: "c4", clienteId: "5", cliente: "Marina Costa", titulo: "Contrato Portal do Cliente", descricao: "Área do cliente com dashboard", valor: 32000, dataEnvio: "2026-01-05", status: "aguardando" },
  { id: "c5", clienteId: "6", cliente: "Loja Bella Moda", titulo: "Contrato E-commerce Bella Moda", descricao: "Loja virtual completa", valor: 55000, dataEnvio: "2026-02-18", dataAssinatura: "2026-02-20", status: "assinado" },
  { id: "c6", clienteId: "7", cliente: "Dr. Paulo Freitas", titulo: "Contrato Site Clínica", descricao: "Site institucional com agendamento", valor: 28000, dataEnvio: "2025-11-28", dataAssinatura: "2025-12-01", status: "assinado" },
];

// Faturas
export interface Fatura {
  id: string;
  clienteId: string;
  cliente: string;
  descricao: string;
  valor: number;
  dataEmissao: string;
  vencimento: string;
  status: "paga" | "pendente" | "atrasada";
}

export const faturas: Fatura[] = [
  { id: "fat-001", clienteId: "1", cliente: "Tech Solutions Ltda", descricao: "Redesign E-commerce - Parcela 1/3", valor: 15000, dataEmissao: "2026-01-15", vencimento: "2026-02-15", status: "paga" },
  { id: "fat-002", clienteId: "1", cliente: "Tech Solutions Ltda", descricao: "Redesign E-commerce - Parcela 2/3", valor: 15000, dataEmissao: "2026-02-15", vencimento: "2026-03-15", status: "pendente" },
  { id: "fat-003", clienteId: "1", cliente: "Tech Solutions Ltda", descricao: "CRM Interno - Parcela 1/4", valor: 23750, dataEmissao: "2026-03-01", vencimento: "2026-03-15", status: "pendente" },
  { id: "fat-004", clienteId: "2", cliente: "Design Lab ME", descricao: "App Delivery - Parcela 2/4", valor: 19500, dataEmissao: "2026-02-28", vencimento: "2026-03-10", status: "paga" },
  { id: "fat-005", clienteId: "5", cliente: "Marina Costa", descricao: "Portal do Cliente - Pagamento Final", valor: 16000, dataEmissao: "2026-02-28", vencimento: "2026-03-10", status: "atrasada" },
  { id: "fat-006", clienteId: "6", cliente: "Loja Bella Moda", descricao: "E-commerce - Parcela 1/3", valor: 18333, dataEmissao: "2026-02-20", vencimento: "2026-03-20", status: "pendente" },
  { id: "fat-007", clienteId: "7", cliente: "Dr. Paulo Freitas", descricao: "Site Clínica - Pagamento Final", valor: 14000, dataEmissao: "2026-02-28", vencimento: "2026-03-05", status: "paga" },
];

// Notificações do portal do cliente
export interface Notificacao {
  id: string;
  clienteId: string;
  titulo: string;
  descricao: string;
  tipo: "projeto" | "fatura" | "reuniao" | "suporte" | "contrato" | "extra";
  lida: boolean;
  data: string;
}

export const notificacoes: Notificacao[] = [
  { id: "n1", clienteId: "1", titulo: "Projeto atualizado", descricao: "Redesign E-commerce avançou para fase de desenvolvimento", tipo: "projeto", lida: false, data: "2026-03-14 09:00" },
  { id: "n2", clienteId: "1", titulo: "Nova fatura gerada", descricao: "Fatura CRM Interno - Parcela 1/4 disponível", tipo: "fatura", lida: false, data: "2026-03-13 14:00" },
  { id: "n3", clienteId: "1", titulo: "Reunião confirmada", descricao: "Alinhamento em 14/03 às 09:00 confirmado", tipo: "reuniao", lida: true, data: "2026-03-12 16:00" },
  { id: "n4", clienteId: "2", titulo: "Resposta no suporte", descricao: "Sua solicitação sobre cores do header foi respondida", tipo: "suporte", lida: false, data: "2026-03-13 15:00" },
  { id: "n5", clienteId: "5", titulo: "Fatura em atraso", descricao: "Portal do Cliente - Pagamento Final venceu em 10/03", tipo: "fatura", lida: false, data: "2026-03-11 08:00" },
  { id: "n6", clienteId: "6", titulo: "Contrato assinado", descricao: "Contrato E-commerce Bella Moda assinado com sucesso", tipo: "contrato", lida: true, data: "2026-02-20 10:00" },
];

// Progresso de projetos e atualizações
export interface ProjetoAtualizacao {
  id: string;
  projetoId: string;
  descricao: string;
  data: string;
  visivelCliente: boolean;
}

export const projetoAtualizacoes: ProjetoAtualizacao[] = [
  { id: "pa1", projetoId: "1", descricao: "Layout da home page aprovado pelo cliente", data: "2026-02-10", visivelCliente: true },
  { id: "pa2", projetoId: "1", descricao: "Iniciado desenvolvimento frontend com React", data: "2026-02-20", visivelCliente: true },
  { id: "pa3", projetoId: "1", descricao: "Revisão interna de código - ajustes de performance", data: "2026-03-05", visivelCliente: false },
  { id: "pa4", projetoId: "1", descricao: "Integração com gateway de pagamento concluída", data: "2026-03-12", visivelCliente: true },
  { id: "pa5", projetoId: "2", descricao: "Wireframes aprovados e design iniciado", data: "2026-02-15", visivelCliente: true },
  { id: "pa6", projetoId: "2", descricao: "App disponível em versão beta para testes", data: "2026-03-08", visivelCliente: true },
  { id: "pa7", projetoId: "5", descricao: "Dashboard do cliente entregue para revisão", data: "2026-03-01", visivelCliente: true },
  { id: "pa8", projetoId: "6", descricao: "Catálogo de produtos importado com sucesso", data: "2026-03-10", visivelCliente: true },
];

export const projetoProgresso: Record<string, number> = {
  "1": 65,
  "2": 45,
  "3": 100,
  "4": 15,
  "5": 85,
  "6": 25,
  "7": 100,
  "8": 30,
};

// Acesso portal dos clientes
export const clientePortalAccess: Record<string, { ativo: boolean; ultimoAcesso?: string; senha?: string }> = {
  "1": { ativo: true, ultimoAcesso: "2026-03-14 08:45" },
  "2": { ativo: true, ultimoAcesso: "2026-03-13 16:20" },
  "5": { ativo: true, ultimoAcesso: "2026-03-12 10:00" },
  "6": { ativo: true, ultimoAcesso: "2026-03-10 14:30" },
  "7": { ativo: false },
};

// Chat messages for support
export interface MensagemChat {
  id: string;
  ticketId: string;
  remetente: "cliente" | "admin";
  nome: string;
  texto: string;
  data: string;
}

export const mensagensChat: MensagemChat[] = [
  { id: "msg1", ticketId: "TK-001", remetente: "cliente", nome: "Tech Solutions", texto: "O botão de finalizar compra não responde quando clico. Já tentei em diferentes navegadores.", data: "2026-03-14 09:30" },
  { id: "msg2", ticketId: "TK-001", remetente: "admin", nome: "Suporte NovaesWeb", texto: "Recebemos seu ticket. Estamos analisando o problema e retornamos em breve.", data: "2026-03-14 10:15" },
  { id: "msg3", ticketId: "TK-001", remetente: "admin", nome: "Suporte NovaesWeb", texto: "Identificamos o problema. Era um conflito de JavaScript no checkout. Já foi corrigido!", data: "2026-03-14 11:00" },
  { id: "msg4", ticketId: "TK-002", remetente: "cliente", nome: "Design Lab", texto: "As cores do header estão diferentes do que aprovamos no Figma.", data: "2026-03-13 14:00" },
  { id: "msg5", ticketId: "TK-002", remetente: "admin", nome: "Suporte NovaesWeb", texto: "Vamos verificar e ajustar conforme o mockup aprovado. Obrigado por avisar!", data: "2026-03-13 15:30" },
];

export const pageInfo: Record<string, { titulo: string; subtitulo: string }> = {
  "/": { titulo: "Dashboard", subtitulo: "Visão geral do seu negócio" },
  "/clientes": { titulo: "Clientes", subtitulo: "Gerencie sua base de clientes" },
  "/projetos": { titulo: "Projetos", subtitulo: "Gerenciamento de projetos" },
  "/pedidos": { titulo: "Pedidos", subtitulo: "Controle de pedidos e solicitações" },
  "/extras": { titulo: "Extras & Serviços", subtitulo: "Catálogo de extras e serviços adicionais" },
  "/relatorios": { titulo: "Relatórios", subtitulo: "Gere e exporte relatórios" },
  "/financeiro": { titulo: "Financeiro", subtitulo: "Visão financeira do negócio" },
  "/suporte": { titulo: "Suporte", subtitulo: "Gestão de tickets de suporte" },
  "/usuarios": { titulo: "Usuários", subtitulo: "Equipe interna do sistema" },
  "/configuracoes": { titulo: "Configurações", subtitulo: "Configurações do sistema" },
  "/agenda": { titulo: "Agenda", subtitulo: "Gerencie suas reuniões e agendamentos" },
};
