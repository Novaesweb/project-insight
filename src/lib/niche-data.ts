export interface NicheInfo {
  slug: string;
  nome: string;
  emoji: string;
  items: string[];
  slogan: string;
  incluso: string[];
  preco: string;
  faq: { q: string; a: string }[];
}

export const nicheData: NicheInfo[] = [
  {
    slug: "lanchonete",
    nome: "Lanchonete / Hamburgueria",
    emoji: "🍔",
    items: ["Cardápio visual com fotos", "Pedido direto pelo WhatsApp", "Status aberto/fechado"],
    slogan: "Site profissional para sua lanchonete",
    incluso: ["Cardápio digital com fotos e descrições", "Botão de pedido via WhatsApp", "Indicador de status aberto/fechado", "Galeria de produtos", "Localização e horário de funcionamento", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "O cliente consegue fazer pedido pelo site?", a: "Sim! O pedido é enviado direto para o WhatsApp da lanchonete com os itens escolhidos." },
      { q: "Posso atualizar o cardápio sozinho?", a: "Sim, você recebe acesso ao painel para editar preços, adicionar e remover itens a qualquer momento." },
      { q: "O site funciona bem no celular?", a: "100%! O site é totalmente responsivo e otimizado para a melhor experiência em qualquer dispositivo." },
    ],
  },
  {
    slug: "pizzaria",
    nome: "Pizzaria",
    emoji: "🍕",
    items: ["Cardápio por categoria e tamanho", "Promoção do dia em destaque", "Área de entrega por bairro"],
    slogan: "Site profissional para sua pizzaria",
    incluso: ["Cardápio separado por sabores e tamanhos", "Destaque de promoção do dia", "Mapa de área de entrega", "Pedido via WhatsApp", "Galeria de pizzas", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "Consigo mostrar preços por tamanho?", a: "Sim! O cardápio permite exibir preços diferentes para cada tamanho de pizza." },
      { q: "Dá para colocar promoção em destaque?", a: "Com certeza! Há uma seção especial para promoção do dia com destaque visual." },
      { q: "O cliente vê se está na área de entrega?", a: "Sim, o site pode exibir os bairros atendidos ou um mapa da área de entrega." },
    ],
  },
  {
    slug: "acai",
    nome: "Açaí / Gelateria",
    emoji: "🍧",
    items: ["Cardápio com adicionais", "Pedido via WhatsApp", "Status aberto/fechado"],
    slogan: "Seu açaí com sistema de pedidos profissional",
    incluso: ["Cardápio com fotos e combos", "Opcionais e adicionais ilimitados", "Botão de pedido WhatsApp", "Localização e horários", "Status aberto/fechado", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "Posso colocar adicionais pagos?", a: "Sim! O cliente seleciona o açaí e escolhe os acompanhamentos com preços automáticos." },
      { q: "O sistema avisa se a loja está fechada?", a: "Sim, há um indicador visual de status aberto/fechado em tempo real." },
      { q: "O pedido chega organizado?", a: "Chega completo no seu WhatsApp: tamanho, adicionais, endereço e forma de pagamento." },
    ],
  },
  {
    slug: "barbearia",
    nome: "Barbearia",
    emoji: "✂️",
    items: ["Galeria de cortes", "Agendamento pelo WhatsApp", "Serviços e preços"],
    slogan: "Site profissional para sua barbearia",
    incluso: ["Galeria de cortes realizados", "Tabela de serviços e preços", "Botão de agendamento via WhatsApp", "Perfil dos barbeiros", "Localização e horários", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "O cliente agenda direto pelo site?", a: "Sim! Ele clica em agendar e é direcionado ao WhatsApp com mensagem pré-preenchida." },
      { q: "Posso mostrar fotos dos cortes?", a: "Sim, há uma galeria dedicada para exibir seus melhores trabalhos." },
      { q: "Dá para listar os barbeiros?", a: "Claro! Cada barbeiro pode ter seu perfil com foto e especialidades." },
    ],
  },
  {
    slug: "salao-de-beleza",
    nome: "Salão de Beleza",
    emoji: "⭐",
    items: ["Serviços e preços", "Galeria antes e depois", "Promoções da semana"],
    slogan: "Site profissional para seu salão de beleza",
    incluso: ["Lista completa de serviços e preços", "Galeria antes e depois", "Promoções semanais em destaque", "Agendamento via WhatsApp", "Equipe e especialidades", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "Consigo mostrar antes e depois?", a: "Sim! A galeria permite comparação visual dos resultados do salão." },
      { q: "Dá para colocar promoções?", a: "Sim, há uma seção dedicada para promoções da semana com destaque visual." },
      { q: "O site funciona no celular?", a: "Perfeitamente! Design responsivo para qualquer tamanho de tela." },
    ],
  },
  {
    slug: "dentista",
    nome: "Dentista / Clínica",
    emoji: "🦷",
    items: ["Especialidades e equipe", "Agendamento online", "Planos aceitos"],
    slogan: "Site profissional para sua clínica odontológica",
    incluso: ["Apresentação de especialidades", "Perfil da equipe de dentistas", "Agendamento via WhatsApp", "Lista de convênios aceitos", "Depoimentos de pacientes", "Responsivo para celular"],
    preco: "R$ 597",
    faq: [
      { q: "Consigo listar os convênios?", a: "Sim! Há uma seção dedicada para exibir todos os planos e convênios aceitos." },
      { q: "Posso mostrar a equipe?", a: "Claro! Cada profissional pode ter perfil com foto, especialidade e currículo." },
      { q: "O paciente agenda pelo site?", a: "Sim, via botão de WhatsApp com mensagem personalizada por especialidade." },
    ],
  },
  {
    slug: "pet-shop",
    nome: "Pet Shop",
    emoji: "🐾",
    items: ["Banho, tosa e veterinário", "Agendamento pelo WhatsApp", "Galeria de pets"],
    slogan: "Site profissional para seu pet shop",
    incluso: ["Lista de serviços (banho, tosa, veterinário)", "Agendamento via WhatsApp", "Galeria de pets atendidos", "Produtos disponíveis", "Localização e horários", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "O cliente agenda banho pelo site?", a: "Sim! O botão de agendamento direciona para o WhatsApp com serviço pré-selecionado." },
      { q: "Posso mostrar fotos de pets?", a: "Sim, a galeria de pets é um diferencial que encanta os clientes." },
      { q: "Dá para listar produtos?", a: "Claro! Você pode exibir os produtos disponíveis na loja." },
    ],
  },
  {
    slug: "loja-de-roupas",
    nome: "Loja de Roupas",
    emoji: "👗",
    items: ["Vitrine de produtos", "Compra pelo WhatsApp", "Novidades e promoções"],
    slogan: "Site profissional para sua loja de roupas",
    incluso: ["Vitrine digital de produtos com fotos", "Compra via WhatsApp", "Seção de novidades e lançamentos", "Promoções em destaque", "Categorias de produtos", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "O cliente compra pelo site?", a: "O pedido é feito via WhatsApp para manter o atendimento pessoal e flexível." },
      { q: "Posso separar por categorias?", a: "Sim! Masculino, feminino, acessórios — organize como preferir." },
      { q: "Dá para destacar promoções?", a: "Com certeza! Há banner e seção exclusiva para promoções." },
    ],
  },
  {
    slug: "restaurante",
    nome: "Restaurante",
    emoji: "🍽️",
    items: ["Cardápio com fotos", "Reserva de mesa", "Galeria do ambiente"],
    slogan: "Site profissional para seu restaurante",
    incluso: ["Cardápio digital com fotos", "Reserva de mesa via WhatsApp", "Galeria do ambiente e pratos", "Horário de funcionamento", "Eventos e promoções", "Responsivo para celular"],
    preco: "R$ 597",
    faq: [
      { q: "O cliente reserva mesa pelo site?", a: "Sim! A reserva é feita via WhatsApp com data e número de pessoas pré-preenchidos." },
      { q: "O cardápio tem fotos?", a: "Sim, cada prato pode ter foto, descrição e preço para encantar o cliente." },
      { q: "Posso mostrar o ambiente?", a: "Claro! A galeria mostra seu espaço e cria expectativa no visitante." },
    ],
  },
  {
    slug: "advocacia",
    nome: "Advocacia",
    emoji: "⚖️",
    items: ["Áreas de atuação", "Consulta pelo WhatsApp", "Apresentação dos advogados"],
    slogan: "Site profissional para seu escritório de advocacia",
    incluso: ["Áreas de atuação detalhadas", "Perfil dos advogados", "Consulta via WhatsApp", "Artigos e publicações", "Depoimentos de clientes", "Responsivo para celular"],
    preco: "R$ 597",
    faq: [
      { q: "Posso listar as áreas de atuação?", a: "Sim! Cada área pode ter página dedicada com descrição detalhada." },
      { q: "Dá para ter blog?", a: "Sim, seção de artigos para demonstrar autoridade e ajudar no SEO." },
      { q: "O cliente agenda consulta pelo site?", a: "Sim, via WhatsApp com mensagem personalizada por área de interesse." },
    ],
  },
  {
    slug: "escola",
    nome: "Escola / Curso",
    emoji: "📚",
    items: ["Cursos e carga horária", "Matrícula pelo WhatsApp", "Depoimentos de alunos"],
    slogan: "Site profissional para sua escola ou curso",
    incluso: ["Catálogo de cursos com carga horária", "Matrícula via WhatsApp", "Depoimentos de alunos", "Equipe de professores", "Galeria e infraestrutura", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "Consigo listar todos os cursos?", a: "Sim! Com descrição, carga horária, valor e turmas disponíveis." },
      { q: "O aluno se matricula pelo site?", a: "Sim, o botão de matrícula direciona para WhatsApp com curso pré-selecionado." },
      { q: "Posso mostrar depoimentos?", a: "Claro! Seção de depoimentos com foto e texto dos alunos." },
    ],
  },
  {
    slug: "medico",
    nome: "Médico / Psicólogo",
    emoji: "❤️",
    items: ["Especialidade e planos", "Agendamento pelo WhatsApp", "Perguntas frequentes"],
    slogan: "Site profissional para seu consultório",
    incluso: ["Apresentação de especialidades", "Lista de convênios aceitos", "Agendamento via WhatsApp", "FAQ com perguntas frequentes", "Perfil profissional", "Responsivo para celular"],
    preco: "R$ 597",
    faq: [
      { q: "O paciente agenda consulta pelo site?", a: "Sim! Via WhatsApp com especialidade e preferência de horário." },
      { q: "Posso listar convênios?", a: "Sim, seção dedicada para todos os planos e convênios atendidos." },
      { q: "Tem seção de FAQ?", a: "Sim, perguntas frequentes organizadas por tema para agilizar o atendimento." },
    ],
  },
/*
  {
    slug: "mecanica",
    nome: "Mecânica",
    emoji: "🔧",
    items: ["Serviços e preços", "Orçamento pelo WhatsApp", "Galeria de trabalhos"],
    slogan: "Site profissional para sua mecânica",
    incluso: ["Lista de serviços com preços", "Orçamento via WhatsApp", "Galeria de trabalhos realizados", "Depoimentos de clientes", "Localização e horários", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "O cliente pede orçamento pelo site?", a: "Sim! Via WhatsApp com o serviço desejado pré-selecionado na mensagem." },
      { q: "Posso mostrar trabalhos realizados?", a: "Sim, a galeria de trabalhos gera confiança e mostra a qualidade do serviço." },
      { q: "Dá para listar preços?", a: "Claro! Tabela de serviços com preços de referência." },
    ],
  },
*/
  {
    slug: "confeitaria",
    nome: "Confeitaria / Doceria",
    emoji: "🎂",
    items: ["Galeria de produtos", "Pedido pelo WhatsApp", "Sabores e personalização"],
    slogan: "Site profissional para sua confeitaria",
    incluso: ["Galeria de bolos, doces e sobremesas", "Pedido via WhatsApp", "Opções de sabores e personalização", "Encomendas com antecedência", "Depoimentos de clientes", "Responsivo para celular"],
    preco: "R$ 497",
    faq: [
      { q: "O cliente encomenda pelo site?", a: "Sim! O pedido vai direto para o WhatsApp com detalhes do produto desejado." },
      { q: "Posso mostrar opções de personalização?", a: "Sim, cada produto pode ter sabores, coberturas e opções de personalização." },
      { q: "A galeria aceita muitas fotos?", a: "Sim, sem limite! Quanto mais fotos bonitas, mais vendas." },
    ],
  },
];



