/**
 * ==============================================================================
 * LALATELIÊ - BASE CENTRAL DE DADOS DOS PRODUTOS
 * Arquivo: assets/js/produtos-data.js
 * Compartilhado automaticamente entre index.html, catalogo.html e produto.html
 * ==============================================================================
 *
 * GUIA DE CADASTRO DE NOVOS PRODUTOS:
 * Para cadastrar um novo produto no site e fazer com que ele apareça automaticamente
 * tanto na página inicial (index.html) quanto no catálogo (catalogo.html) e na página
 * de detalhes (produto.html), basta adicionar um novo objeto ao array abaixo:
 *
 * {
 *   id: 'meu-produto-novo',               // (Obrigatório) Identificador único (slug em minúsculas)
 *   title: 'Nome do Meu Produto',         // (Obrigatório) Nome comercial do produto
 *   category: 'planners',                 // (Obrigatório) 'planners' (Agendas), 'cadernos-personalizados', 'calendarios' ou 'tags'
 *   categoryLabel: 'Agendas',             // (Obrigatório) 'Agendas', 'Cadernos', 'Calendários' ou 'Tags'
 *   tag: 'Capa Dura Wire-o',              // (Opcional) Especificação curta exibida abaixo do badge
 *   badge: 'Novidade',                    // (Opcional) Selo de destaque. Ex: 'Mais Vendido', '2 Dias por Página', 'Destaque'
 *   badgeType: 'gold',                    // (Opcional) 'gold' (dourado) ou 'sage' (verde artesanal)
 *   price: 'R$ 129,00',                   // (Obrigatório) Preço formatado para exibição
 *   priceNum: 129,                        // (Obrigatório) Valor numérico para filtros e ordenação
 *   popularity: 90,                       // (Opcional) Pontuação de 0 a 100 para ordenação por relevância
 *   active: true,                         // (Opcional) true para exibir (padrão), false para ocultar temporariamente
 *   order: 1,                             // (Opcional) Forçar ordem prioritária na vitrine da Home
 *   images: [                             // (Obrigatório) Caminhos reais das fotos na pasta assets/images/produtos/...
 *     'assets/images/produtos/agendas/minha-foto-1.jpg',
 *     'assets/images/produtos/agendas/minha-foto-2.jpg'
 *   ],
 *   alt: 'Nome do Produto Lalateliê',     // (Opcional) Texto alternativo da imagem principal
 *   desc: 'Descrição detalhada...',       // (Opcional) Descrição para os cards e página exclusiva
 *   specs: [                              // (Opcional) Lista de especificações técnicas do produto
 *     'Formato: 17 x 22 cm',
 *     'Miolo: Papel pólen 90g'
 *   ]
 * }
 * ==============================================================================
 */

window.PRODUTOS_LALATELIE = [
  // ---------------- AGENDAS ----------------
  {
    id: 'agenda-master',
    title: 'Agenda Master 1 dia por página',
    category: 'planners',
    categoryLabel: 'Agendas',
    tag: 'Capa Dura Wire-o',
    badge: 'Mais Vendida',
    badgeType: 'gold',
    price: 'R$ 89,90',
    priceNum: 89.9,
    popularity: 100,
    images: [
      'assets/images/produtos/agendas/agendaMas-1.jpg',
      'assets/images/produtos/agendas/agendaMas-2.jpg',
      'assets/images/produtos/agendas/agendaMas-3.jpg',
      'assets/images/produtos/agendas/agendaMas-4.jpg',
      'assets/images/produtos/agendas/agendaMas-5.jpg'
    ],
    desc: 'Agenda no formato A5, com 1 dia por página e sábados e domingos agrupados na mesma página. Ideal para organizar compromissos, planejar tarefas e manter sua rotina em dia.',
    specs: [
      'Dimensões: 15,5 × 21,5 cm',
      'Capa: capa dura personalizada',
      'Acabamento da capa: laminação brilho',
      'Encadernação: Wire-o metálico de alta resistência',
      'Quantidade de páginas: 366 páginas',
      'Tipo de papel: Offset',
      'Gramatura do papel: 75 g/m²'
    ]
  },
  {
    id: 'agenda-minimalista',
    title: 'Agenda Mine 1 dia por página',
    category: 'planners',
    categoryLabel: 'Agendas',
    tag: 'Edição Especial',
    badge: 'Destaque',
    badgeType: 'sage',
    price: 'R$ 89,90',
    priceNum: 89.9,
    popularity: 92,
    images: [
      'assets/images/produtos/agendas/agendaMin-1.jpg',
      'assets/images/produtos/agendas/agendaMin-2.jpg',
      'assets/images/produtos/agendas/agendaMin-3.jpg',
      'assets/images/produtos/agendas/agendaMin-4.jpg',
      'assets/images/produtos/agendas/agendaMin-5.jpg'
    ],
    desc: 'Agenda no formato A6, com 1 dia por página e sábados e domingos agrupados na mesma página. Ideal para organizar compromissos, planejar tarefas e manter sua rotina em dia.',
    specs: [
      'Formato: A6 compacto e leve, ideal para transporte diário',
      'Papel: Papel pólen de alta qualidade que não vaza caneta',
      'Fechamento: Elástico acetinado colorido',
      'Cantoneiras: Proteção de metal nas pontas'
    ]
  },
  {
    id: 'agenda-master-2dias',
    title: 'Agenda Master 2 dias por página',
    category: 'planners',
    categoryLabel: 'Agendas',
    tag: 'Capa Dura Wire-o',
    badge: '2 Dias por Página',
    badgeType: 'gold',
    price: 'R$ 82,90',
    priceNum: 82.9,
    popularity: 96,
    images: [
      'assets/images/produtos/agendas/agendaMas_2dias-1.jpg',
      'assets/images/produtos/agendas/agendaMas_2dias-2.jpg',
      'assets/images/produtos/agendas/agendaMas_2dias-3.jpg',
      'assets/images/produtos/agendas/agendaMas_2dias-4.jpg',
      'assets/images/produtos/agendas/agendaMas_2dias-5.jpg'
    ],
    desc: 'Agenda Master 2 Dias por página, desenvolvida para facilitar a organização diária, o planejamento de compromissos e o registro de tarefas, com dois dias por página. Ideal para planejamento pessoal e profissional, unindo praticidade e acabamento sofisticado.',
    specs: [
      'Dimensões: 15,5 × 21,5 cm',
      'Capa: Dura e personalizada',
      'Acabamento da capa: Laminação brilho',
      'Encadernação: Wire-o metálico de alta resistência',
      'Quantidade de páginas: 238 páginas',
      'Tipo de papel: Offset',
      'Gramatura do papel: 75 g/m²'
    ]
  },
  {
    id: 'agenda-mine-2dias',
    title: 'Agenda Mine 2 dias por página',
    category: 'planners',
    categoryLabel: 'Agendas',
    tag: 'Edição Especial',
    badge: '2 Dias por Página',
    badgeType: 'sage',
    price: 'R$ 82,90',
    priceNum: 82.9,
    popularity: 90,
    images: [
      'assets/images/produtos/agendas/agendaMin_2dias-1.jpg',
      'assets/images/produtos/agendas/agendaMin_2dias-2.jpg',
      'assets/images/produtos/agendas/agendaMin_2dias-3.jpg',
      'assets/images/produtos/agendas/agendaMin_2dias-4.jpg',
      'assets/images/produtos/agendas/agendaMin_2dias-5.jpg'
    ],
    desc: 'Agenda no formato A6, com 2 dias por página e sábados e domingos agrupados na mesma página. Ideal para organizar compromissos, planejar tarefas e manter sua rotina em dia.',
    specs: [
      'Formato: A6 compacto e leve, ideal para transporte diário',
      'Miolo: Visão de 2 dias por página em papel pólen suave',
      'Fechamento: Elástico acetinado colorido',
      'Cantoneiras: Proteção de metal nas pontas'
    ]
  },

  // ---------------- CADERNO PERSONALIZADO ----------------
  {
    id: 'caderno-personalizado',
    title: 'Caderno Personalizado',
    category: 'cadernos-personalizados',
    categoryLabel: 'Cadernos',
    tag: 'Capa Dura & Personalização Exclusiva',
    badge: 'Mais Vendido',
    badgeType: 'gold',
    price: 'R$ 38,00',
    priceNum: 38,
    popularity: 98,
    images: [
      'assets/images/produtos/cadernos/caderno1.jpg',
      'assets/images/produtos/cadernos/caderno2.jpg',
      'assets/images/produtos/cadernos/caderno3.jpg',
      'assets/images/produtos/cadernos/caderno4.jpg',
      'assets/images/produtos/cadernos/caderno5.jpg'
    ],
    desc: 'Caderno com capa dura, ideal para anotações, estudos, atividades escolares e organização pessoal. Ideal para uso escolar, acadêmico ou profissional, oferecendo praticidade para escrever, organizar informações e registrar anotações no dia a dia.',
    specs: [
      'Capa: Dura personalizada',
      'Miolo: Folhas pautadas',
      'Quantidade de folhas: 80 folhas',
      'Formato: 200 × 275 mm (20 × 27,5 cm)',
      'Tipo de papel: Papel offset',
      'Gramatura do papel: 56 g/m²'
    ]
  },

  // ---------------- CALENDÁRIOS ----------------
  {
    id: 'calendario-grande',
    title: 'Calendário de Mesa Grande',
    category: 'calendarios',
    categoryLabel: 'Calendários',
    tag: 'Base Rígida Auto-Portante',
    badge: 'Mais Vendido',
    badgeType: 'gold',
    price: 'R$ 32,90',
    priceNum: 32.9,
    popularity: 94,
    images: [
      'assets/images/produtos/calendar/cal-Gran1.jpg',
      'assets/images/produtos/calendar/cal-Gran2.jpg',
      'assets/images/produtos/calendar/cal-Gran3.jpg',
      'assets/images/produtos/calendar/cal-Gran4.jpg',
      'assets/images/produtos/calendar/cal-Gran5.jpg'
    ],
    desc: 'Calendário de mesa com excelente espaço de visualização mensal e anotações rápidas. Estrutura rígida de apoio com encadernação wire-o superior.',
    specs: [
      'Lâminas: 12 meses + feriados e datas comemorativas',
      'Papel: Papel fosco texturizado 240g de alta resistência',
      'Base: Triângulo rígido empastado de alta firmeza',
      'Design: Ilustrações artísticas exclusivas do ateliê'
    ]
  },
  {
    id: 'calendario-medio',
    title: 'Calendário de Mesa Médio',
    category: 'calendarios',
    categoryLabel: 'Calendários',
    tag: 'Formato Equilibrado',
    badge: 'Prático',
    badgeType: 'sage',
    price: 'R$ 25,90',
    priceNum: 25.9,
    popularity: 90,
    images: [
      'assets/images/produtos/calendar/cal-med1.jpg',
      'assets/images/produtos/calendar/cal-med2.jpg',
      'assets/images/produtos/calendar/cal-med3.jpg',
      'assets/images/produtos/calendar/cal-med4.jpg',
      'assets/images/produtos/calendar/cal-med5.jpg'
    ],
    desc: 'Equilíbrio perfeito de tamanho para compor sua mesa de escritório ou cantinho de estudos sem ocupar espaço excessivo.',
    specs: [
      'Tamanho intermediário ideal para escrivaninhas',
      'Lâminas mensais destacáveis ou viráveis no wire-o',
      'Acabamento em espiral wire-o nobre',
      'Cores suaves e tipografia elegante e legível'
    ]
  },
  {
    id: 'calendario-pequeno',
    title: 'Mini Calendário de Mesa',
    category: 'calendarios',
    categoryLabel: 'Calendários',
    tag: 'Compacto & Delicado',
    badge: 'Mimo',
    badgeType: 'olive',
    price: 'R$ 17,90',
    priceNum: 17.9,
    popularity: 87,
    images: [
      'assets/images/produtos/calendar/cal-peq1.jpg',
      'assets/images/produtos/calendar/cal-peq2.jpg',
      'assets/images/produtos/calendar/cal-peq3.jpg',
      'assets/images/produtos/calendar/cal-peq4.jpg',
      'assets/images/produtos/calendar/cal-peq5.jpg'
    ],
    desc: 'Mini calendário de mesa delicado e charmoso. Uma ótima lembrancinha afetiva para presentear amigos, clientes e familiares.',
    specs: [
      'Tamanho mini compacto para qualquer espaço',
      'Lâminas encorpadas com impressão de alta qualidade',
      'Base auto-portante de fácil manuseio',
      'Embalado individualmente com carinho'
    ]
  },

  // ---------------- TAGS ----------------
  {
    id: 'tags-artesanais',
    title: 'Tags & Marcadores',
    category: 'tags',
    categoryLabel: 'Tags',
    tag: 'Papel Nobre & Acabamento Manual',
    badge: 'Coleção Exclusiva',
    badgeType: 'gold',
    price: 'Consulte valores e quantidades pelo nosso chat.',
    priceNum: 0,
    consultPrice: true,
    popularity: 91,
    images: [
      'assets/images/produtos/tags/tags1.jpg',
      'assets/images/produtos/tags/tags2.jpg',
      'assets/images/produtos/tags/tags3.jpg',
      'assets/images/produtos/tags/tags4.jpg',
      'assets/images/produtos/tags/tags5.jpg'
    ],
    desc: 'Conjunto de tags recortadas à mão com designs exclusivos, detalhes botânicos e cordão para amarração de presentes, convites e encomendas.',
    specs: [
      'Papel nobre encorpado de alta gramatura',
      'Fita / cordão rústico ou acetinado incluso',
      'Personalização com nomes, frases ou logotipo',
      'Kit com múltiplas unidades prontas para uso'
    ]
  },
  {
    id: 'tags-lembrancinhas',
    title: 'Etiquetas',
    category: 'tags',
    categoryLabel: 'Tags',
    tag: 'Eventos & Presentes',
    badge: 'Novidade',
    badgeType: 'sage',
    price: 'Consulte valores e quantidades pelo nosso chat.',
    priceNum: 0,
    consultPrice: true,
    popularity: 89,
    images: [
      'assets/images/produtos/tags/etiquetas1.jpg',
      'assets/images/produtos/tags/etiquetas2.jpg',
      'assets/images/produtos/tags/etiquetas3.jpg',
      'assets/images/produtos/tags/etiquetas4.jpg',
      'assets/images/produtos/tags/etiquetas5.jpg'
    ],
    desc: 'Tags com estampas afetuosas pensadas especialmente para fechar sacolas, pacotes de presente, mimos corporativos ou casamentos.',
    specs: [
      'Formatos e ilustrações afetivas variadas',
      'Furo padrão com acabamento reforçado',
      'Impressão de altíssima fidelidade de cores',
      'Embaladas com carinho em envelope kraft artesanal'
    ]
  }
];

// ---------------- 34 OPÇÕES DE CAPAS (EXCLUSIVAS PARA AGENDAS) ----------------
for (let i = 1; i <= 34; i++) {
  window.PRODUTOS_LALATELIE.push({
    id: `capa-${i}`,
    title: `Capa para Agenda Modelo ${i}`,
    category: 'capas',
    categoryLabel: 'Capas',
    tag: 'Opção de Capa para Agenda',
    isCapa: true,
    capaNum: i,
    images: [`assets/images/produtos/capas/capas${i}.jpg`]
  });
}

/**
 * Formata o título do produto para exibição visual nos cards e páginas.
 * Para a categoria Agendas, aplica destaque tipográfico específico aos números 1 e 2,
 * garantindo legibilidade nítida, formato clássico e proporção visual sem alterar
 * outros produtos ou atributos de acessibilidade.
 *
 * @param {Object|string} prod - Objeto do produto ou string do título
 * @param {string} [category] - Categoria opcional se prod for string
 * @returns {string} Título formatado em HTML
 */
window.formatProductTitle = function(prod, category) {
  if (!prod) return '';
  const title = typeof prod === 'object' ? (prod.title || '') : String(prod);
  const cat = (typeof prod === 'object' ? (prod.category || prod.categoryLabel) : category) || '';
  const isAgenda = cat === 'planners' || cat === 'Agendas' || /^agenda\b/i.test(title.trim());

  if (isAgenda) {
    // Envolve os números nos nomes das agendas com a classe de destaque tipográfico (.agenda-title-number)
    return title.replace(/\b(\d+)\b/g, '<span class="agenda-title-number">$1</span>');
  }
  return title;
};

/**
 * Formata o valor do produto para exibição visual nos cards e páginas.
 * Para produtos sob consulta (como Tags e Etiquetas), exibe a mensagem acompanhada
 * do ícone oficial do WhatsApp, permitindo consulta ágil pelo chat do ateliê.
 *
 * @param {Object|string} prod - Objeto do produto ou string do preço
 * @param {Object} [options] - Opções de formatação (ex: withLink: boolean)
 * @returns {string} Preço formatado ou chamada de consulta com ícone em HTML
 */
window.formatProductPrice = function(prod, options = {}) {
  if (!prod) return '';
  const priceStr = typeof prod === 'object' ? (prod.price || '') : String(prod);
  const isConsult = typeof prod === 'object'
    ? (prod.consultPrice === true || prod.category === 'tags' || /consulte valores/i.test(priceStr))
    : /consulte valores/i.test(priceStr);

  if (isConsult) {
    const text = 'Consulte valores e quantidades pelo nosso chat.';
    const icon = '<i class="fa-brands fa-whatsapp price-whatsapp-icon" aria-hidden="true"></i>';

    if (options.withLink && typeof prod === 'object') {
      const whatsappNumber = '5533999774017';
      const msg = encodeURIComponent(`Olá, Lalateliê! Gostaria de consultar valores e quantidades para "${prod.title}".`);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${msg}`;
      return `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="price-consult-chat price-consult-link" title="Consultar valores e quantidades no WhatsApp">${icon} <span>${text}</span></a>`;
    }

    return `<span class="price-consult-chat">${icon} <span>${text}</span></span>`;
  }

  return priceStr;
};

/**
 * ==============================================================================
 * SISTEMA DE ITENS ADICIONAIS E PERSONALIZAÇÃO POR PRODUTO / CATEGORIA
 * ==============================================================================
 * Define os grupos de opções, regras de obrigatoriedade, valores extras e
 * tipos de seleção (única vs múltipla) para cada categoria do catálogo.
 */
window.LALATELIE_ADDON_CONFIG = {
  // 1. Regras para Agendas (planners)
  planners: [
    {
      id: 'capa',
      name: 'Capa da Agenda (Mostruário Exclusivo)',
      description: 'Selecione uma das 34 opções de capa em alta definição:',
      type: 'capa_selector', // tipo especial com grid visual das 34 capas
      required: true,
      price: 0
    },
    {
      id: 'fechamento',
      name: 'Fechamento da Agenda',
      description: 'Escolha o tipo de fechamento desejado:',
      type: 'single', // seleção única
      required: true,
      options: [
        { id: 'sem-fechamento', name: 'Sem fechamento', price: 0, default: true },
        { id: 'fechamento-elastico', name: 'Fechamento com elástico', price: 0 }
      ]
    },
    {
      id: 'miolo',
      name: 'Disposição do Miolo (Horário)',
      description: 'Escolha a visualização interna das páginas:',
      type: 'single', // seleção única
      required: true,
      options: [
        { id: 'com-horario', name: 'Com horário', price: 0, default: true },
        { id: 'sem-horario', name: 'Sem horário', price: 0 }
      ]
    }
  ],

  // 2. Regras para Cadernos (cadernos-personalizados)
  cadernos: [
    {
      id: 'miolo_caderno',
      name: 'Tipo de Folhas do Miolo',
      description: 'Selecione a pauta de sua preferência:',
      type: 'single',
      required: true,
      options: [
        { id: 'pautado', name: 'Folhas Pautadas (com linhas)', price: 0, default: true },
        { id: 'pontilhado', name: 'Folhas Pontilhadas (bullet journal)', price: 0 },
        { id: 'liso', name: 'Folhas Lisas (sem pauta)', price: 0 }
      ]
    }
  ],

  // 3. Regras para Calendários (calendarios)
  calendarios: []
};

/**
 * Retorna a lista de grupos de personalização e adicionais disponíveis para um determinado produto.
 * 
 * @param {Object} prod - Objeto do produto
 * @returns {Array} Array de grupos de adicionais ou vazio caso não possua
 */
window.getProductAddonGroups = function(prod) {
  if (!prod) return [];
  // Capas são mostruário, não possuem adicionais
  if (prod.isCapa || prod.category === 'capas') return [];
  // Tags e Etiquetas são sob consulta no WhatsApp
  if (prod.consultPrice || prod.category === 'tags') return [];

  // Se o próprio produto já declarar addonGroups customizados
  if (Array.isArray(prod.addonGroups)) {
    return prod.addonGroups;
  }

  // Mapeia pela categoria
  const cat = prod.category;
  if (cat === 'planners' || cat === 'agendas') {
    return window.LALATELIE_ADDON_CONFIG.planners || [];
  }
  if (cat === 'cadernos-personalizados' || cat === 'cadernos') {
    return window.LALATELIE_ADDON_CONFIG.cadernos || [];
  }
  if (cat === 'calendarios' || cat === 'calendario') {
    return window.LALATELIE_ADDON_CONFIG.calendarios || [];
  }

  return [];
};

