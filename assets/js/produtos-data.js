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
 *   category: 'planners',                 // (Obrigatório) 'planners' (Agendas), 'cadernos-personalizados' ou 'tags'
 *   categoryLabel: 'Agendas',             // (Obrigatório) 'Agendas', 'Cadernos' ou 'Tags'
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
    title: 'Agenda A5, 1 dia por página',
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
      'Dimensões: 15,5 × 22 cm',
      'Capa: capa dura personalizada',
      'Acabamento da capa: laminação brilho, fosco ou holográfico',
      'Encadernação: Wire-o metálico',
      'Quantidade de páginas: 366 páginas',
      'Tipo de papel: Offset',
      'Gramatura do papel: 75 g/m²'
    ]
  },
  {
    id: 'agenda-master-2dias',
    title: 'Agenda A5, 2 dias por página',
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
    desc: 'Agenda A5 2 Dias por página, desenvolvida para facilitar a organização diária, o planejamento de compromissos e o registro de tarefas, com dois dias por página. Ideal para planejamento pessoal e profissional, unindo praticidade e acabamento sofisticado.',
    specs: [
      'Dimensões: 15,5 × 22 cm',
      'Capa: capa dura e personalizada',
      'Acabamento da capa: Laminação brilho, fosco ou holográfico',
      'Encadernação: Wire-o metálico',
      'Quantidade de páginas: 238 páginas',
      'Tipo de papel: Offset',
      'Gramatura do papel: 90 g/m²'
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
    desc: 'Caderno com capa dura, ideal para anotações, estudos, atividades escolares e organização pessoal, oferecendo praticidade para escrever, organizar informações e registrar anotações no dia a dia.',
    specs: [
      'Capa: Dura personalizada',
      'Miolo: Folhas pautadas',
      'Quantidade de folhas: 80 folhas',
      'Formato: 200 × 275 mm (20 × 27,5 cm)',
      'Tipo de papel: Papel offset',
      'Gramatura do papel: 56 g/m²'
    ]
  },

  // ---------------- PAPELARIA ----------------
  {
    id: 'tags-artesanais',
    title: 'Tags & Marcadores',
    category: 'tags',
    categoryLabel: 'Papelaria',
    tag: 'Papel & Acabamento Manual',
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
    desc: 'Tags personalizadas que agregam charme e sofisticação às suas embalagens, perfeitas para fechar sacolas, valorizar presentes e destacar a identidade da sua marca.',
    specs: [
      'Papel fotográfico de alta gramatura',
      'Acabamento de acordo com a sua necessidade',
      'Impressão de alta qualidade',
      'Arte e modelos personalizados'
    ]
  },
  {
    id: 'tags-lembrancinhas',
    title: 'Etiquetas',
    category: 'tags',
    categoryLabel: 'Papelaria',
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
    desc: 'Ideais para complementar embalagens, fechar sacolas, decorar lembrancinhas e valorizar mimos corporativos. Uma solução versátil para transformar detalhes simples em apresentações especiais.',
    specs: [
      'Papéis de gramaturas variadas',
      'Acabamento de acordo com a sua necessidade',
      'Impressão de alta qualidade',
      'Arte e modelos personalizados'
    ]
  }
];

// ---------------- 30 OPÇÕES DE CAPAS (EXCLUSIVAS PARA AGENDAS) ----------------
for (let i = 1; i <= 30; i++) {
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
 * Retorna o título íntegro garantindo uniformidade tipográfica total entre letras,
 * números e caracteres especiais com uma única família tipográfica moderna (Plus Jakarta Sans).
 *
 * @param {Object|string} prod - Objeto do produto ou string do título
 * @param {string} [category] - Categoria opcional se prod for string
 * @returns {string} Título formatado em texto uniforme
 */
window.formatProductTitle = function(prod, category) {
  if (!prod) return '';
  const title = typeof prod === 'object' ? (prod.title || '') : String(prod);
  return title;
};

/**
 * Formata o valor do produto para exibição visual nos cards e páginas.
 * Para produtos sob consulta (como itens de Papelaria), exibe a mensagem acompanhada
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
    ? (prod.consultPrice === true || prod.category === 'tags' || prod.category === 'papelaria' || /consulte valores/i.test(priceStr))
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
      description: 'Selecione uma das 30 opções de capa em alta definição:',
      type: 'capa_selector', // tipo especial com grid visual das 30 capas
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
    },
    {
      id: 'personalizacao_nome',
      name: 'Deseja personalizar sua agenda com nome?',
      description: 'Escolha se deseja colocar seu nome com gravação especial na capa da agenda:',
      type: 'name_customizer',
      required: true,
      price: 0,
      options: [
        { id: 'sim', name: 'Sim, quero personalizar com nome.', value: 'sim' },
        { id: 'nao', name: 'Não, quero minha agenda sem nome.', value: 'nao' }
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
  ]
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
  // Itens de Papelaria (Tags e Etiquetas) são sob consulta no WhatsApp
  if (prod.consultPrice || prod.category === 'tags' || prod.category === 'papelaria') return [];

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

  return [];
};

