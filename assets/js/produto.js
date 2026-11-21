/**
 * ==============================================================================
 * LALATELIÊ - LÓGICA DA PÁGINA EXCLUSIVA DE PRODUTO
 * Arquivo: assets/js/produto.js
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. OBTENÇÃO DOS DADOS DOS PRODUTOS
  // --------------------------------------------------------------------------
  const produtos = window.PRODUTOS_LALATELIE || [];

  // Mapeamento de categorias para nomes amigáveis de exibição
  const CATEGORY_NAMES = {
    'planners': 'Agendas',
    'cadernos-personalizados': 'Cadernos',
    'cadernos': 'Cadernos',
    'tags': 'Papelaria',
    'papelaria': 'Papelaria',
    'all': 'Catálogo'
  };

  // --------------------------------------------------------------------------
  // 2. PARÂMETROS DA URL
  // --------------------------------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || urlParams.get('produto');
  const fromCategory = urlParams.get('categoria') || urlParams.get('cat') || urlParams.get('from');
  const selectedCapa = urlParams.get('capa');
  let activeSelectedCapa = null;
  if (selectedCapa) {
    const capaInt = parseInt(selectedCapa, 10);
    if (capaInt >= 1 && capaInt <= 30) {
      activeSelectedCapa = String(capaInt);
    }
  }

  // Características da Agenda (Fechamento e Miolo/Horário)
  const VALID_FECHAMENTOS = ['Sem fechamento', 'Fechamento com elástico'];
  const VALID_HORARIOS = ['Com horário', 'Sem horário'];

  const rawFechamento = urlParams.get('fechamento');
  let activeSelectedFechamento = null;
  if (rawFechamento) {
    if (rawFechamento === 'SEM FECHAMENTO' || rawFechamento === 'Sem fechamento') {
      activeSelectedFechamento = 'Sem fechamento';
    } else if (rawFechamento === 'Fechamentos com elástico' || rawFechamento === 'Fechamento com elástico') {
      activeSelectedFechamento = 'Fechamento com elástico';
    }
  }

  const rawHorario = urlParams.get('horario') || urlParams.get('miolo');
  let activeSelectedHorario = VALID_HORARIOS.includes(rawHorario) ? rawHorario : null;

  // Personalização com Nome (Agendas)
  const rawNomeOpt = urlParams.get('personalizacao_nome');
  let activeSelectedNomeOption = (rawNomeOpt === 'sim' || rawNomeOpt === 'nao') ? rawNomeOpt : null;
  let activeCustomName = (urlParams.get('nome') || '').trim().slice(0, 30);

  let featureButtonsInitialized = false;
  let capaPickerInitialized = false;
  let addToCartHeroInitialized = false;

  // --------------------------------------------------------------------------
  // 3. ELEMENTOS DO DOM
  // --------------------------------------------------------------------------
  // Navegação e Breadcrumb
  const btnBackCatalog = document.getElementById('btnBackCatalog');
  const breadcrumbCategoryLink = document.getElementById('breadcrumbCategoryLink');
  const breadcrumbProductName = document.getElementById('breadcrumbProductName');

  // Containers de Layout e Estados
  const layoutGrid = document.getElementById('produtoLayoutGrid');
  const relatedSection = document.getElementById('relatedSection');
  const notFoundState = document.getElementById('produtoNotFound');

  // Galeria e Carrossel de Miniaturas
  const gallerySection = document.getElementById('produtoGallerySection');
  const mainImg = document.getElementById('produtoMainImg');
  const mainBadge = document.getElementById('produtoBadge');
  const counterBadge = document.getElementById('produtoCounter');
  const thumbnailsViewport = document.getElementById('produtoThumbnailsViewport');
  const thumbnailsTrack = document.getElementById('produtoThumbnailsTrack') || document.getElementById('produtoThumbnailsStrip');
  const thumbPrevBtn = document.getElementById('thumbCarouselPrevBtn');
  const thumbNextBtn = document.getElementById('thumbCarouselNextBtn');
  const galleryThumbsCounter = document.getElementById('galleryThumbsCounter');

  // Detalhes do Produto
  const metaTag = document.getElementById('produtoMetaTag');
  const productTitle = document.getElementById('produtoTitle');
  const priceAmount = document.getElementById('produtoPriceAmount');
  const descriptionText = document.getElementById('produtoDescriptionText');
  const specsList = document.getElementById('produtoSpecsList');
  const btnAddToCartHero = document.getElementById('btnAddToCartHero');
  const btnWhatsappHero = document.getElementById('btnWhatsappHero');
  const btnShareProduct = document.getElementById('btnShareProduct');
  const copyToast = document.getElementById('copyToast');

  // Produtos Relacionados
  const relatedGrid = document.getElementById('relatedGrid');

  // Header e Menu Mobile
  const siteHeader = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // Estado local da galeria
  let currentProduct = null;
  let currentImageIndex = 0;
  let currentThumbOffset = 0; // 0 = fotos 1..4 visíveis, 1 = fotos 2..5 visíveis

  // --------------------------------------------------------------------------
  // 4. VERIFICAÇÃO DO PRODUTO SELECIONADO
  // --------------------------------------------------------------------------
  if (!productId) {
    showNotFound();
    return;
  }

  currentProduct = produtos.find(p => p.id === productId);

  if (!currentProduct) {
    showNotFound();
    return;
  }

  // --------------------------------------------------------------------------
  // 5. RESOLUÇÃO GLOBAL DE 5 IMAGENS E CARREGAMENTO DOS DADOS DO PRODUTO
  // --------------------------------------------------------------------------
  /**
   * Garante globalmente 5 imagens correspondentes da pasta assets/images/produtos/[pasta]/
   * para todos os produtos existentes e futuros do catálogo.
   */
  function resolveProductFiveImages(prod) {
    if (!prod) return [];

    // Mapeamento automático das pastas e arquivos canônicos dos produtos do catálogo
    const PRODUCT_FOLDER_MAP = {
      'agenda-master': {
        folder: 'agendas',
        files: [
          'agendaMas-1.jpg',
          'agendaMas-2.jpg',
          'agendaMas-3.jpg',
          'agendaMas-4.jpg',
          'agendaMas-5.jpg'
        ]
      },
      'agenda-master-2dias': {
        folder: 'agendas',
        files: [
          'agendaMas_2dias-1.jpg',
          'agendaMas_2dias-2.jpg',
          'agendaMas_2dias-3.jpg',
          'agendaMas_2dias-4.jpg',
          'agendaMas_2dias-5.jpg'
        ]
      },
      'caderno-personalizado': {
        folder: 'cadernos',
        files: [
          'caderno1.jpg',
          'caderno2.jpg',
          'caderno3.jpg',
          'caderno4.jpg',
          'caderno5.jpg'
        ]
      },
      'tags-artesanais': {
        folder: 'tags',
        files: [
          'tags1.jpg',
          'tags2.jpg',
          'tags3.jpg',
          'tags4.jpg',
          'tags5.jpg'
        ]
      },
      'tags-lembrancinhas': {
        folder: 'tags',
        files: [
          'etiquetas1.jpg',
          'etiquetas2.jpg',
          'etiquetas3.jpg',
          'etiquetas4.jpg',
          'etiquetas5.jpg'
        ]
      }
    };

    // 1. Caso seja um dos produtos mapeados do catálogo:
    if (PRODUCT_FOLDER_MAP[prod.id]) {
      const mapping = PRODUCT_FOLDER_MAP[prod.id];
      return mapping.files.map(file => `assets/images/produtos/${mapping.folder}/${file}`);
    }

    // 2. Se o produto já possui exatamente 5 imagens válidas no array:
    if (Array.isArray(prod.images) && prod.images.length === 5) {
      return prod.images.map(src => src.startsWith('assets/') ? src : `assets/${src}`);
    }

    // 3. Regra genérica/futura: detecção automática da pasta e do padrão sequencial de 5 imagens
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const cleanImg = prod.images[0].replace(/^assets\//, '');
      const match = cleanImg.match(/^(?:.*\/)?images\/produtos\/([^\/]+)\/(.*?)(?:-?(\d+))?\.(jpg|jpeg|png|webp)$/i);
      if (match) {
        const folder = match[1];
        const prefix = match[2];
        const ext = match[4];
        const hasDash = cleanImg.includes(`${prefix}-`);
        const separator = hasDash ? '-' : '';

        return Array.from({ length: 5 }, (_, i) =>
          `assets/images/produtos/${folder}/${prefix}${separator}${i + 1}.${ext}`
        );
      }
    }

    // 4. Fallback padrão: busca na pasta do produto ou categoria
    const targetFolder = prod.folder || prod.category || 'produtos';
    return Array.from({ length: 5 }, (_, i) =>
      `assets/images/produtos/${targetFolder}/${prod.id || 'produto'}-${i + 1}.jpg`
    );
  }

  loadProductDetails(currentProduct);

  function loadProductDetails(prod) {
    // Normaliza globalmente o array de imagens para sempre conter exatamente 5 fotos
    prod.images = resolveProductFiveImages(prod);

    // 5.1. Atualizar Título da Página e Meta Tags
    document.title = `${prod.title} | Lalateliê Papelaria Afetiva`;

    // 5.2. Configurar Botão de Retorno e Contexto de Navegação
    // Se o usuário veio de uma categoria ou se usamos a categoria do produto:
    const returnCategory = (fromCategory && fromCategory !== 'all') ? fromCategory : prod.category;
    const returnCategoryLabel = CATEGORY_NAMES[returnCategory] || prod.categoryLabel || 'Catálogo';

    if (btnBackCatalog) {
      if (fromCategory && fromCategory !== 'all') {
        btnBackCatalog.href = `catalogo.html?categoria=${encodeURIComponent(returnCategory)}`;
        btnBackCatalog.innerHTML = `<i class="fa-solid fa-arrow-left"></i> <span>Voltar para ${returnCategoryLabel}</span>`;
      } else {
        btnBackCatalog.href = `catalogo.html?categoria=${encodeURIComponent(returnCategory)}`;
        btnBackCatalog.innerHTML = `<i class="fa-solid fa-arrow-left"></i> <span>Voltar ao Catálogo (${returnCategoryLabel})</span>`;
      }
    }

    // 5.3. Configurar Trilha Breadcrumb
    if (breadcrumbCategoryLink) {
      breadcrumbCategoryLink.href = `catalogo.html?categoria=${encodeURIComponent(prod.category)}`;
      breadcrumbCategoryLink.textContent = prod.categoryLabel;
    }
    if (breadcrumbProductName) {
      breadcrumbProductName.innerHTML = window.formatProductTitle ? window.formatProductTitle(prod) : prod.title;
    }

    // 5.4. Informações do Produto
    if (metaTag) {
      metaTag.innerHTML = `<span>${prod.categoryLabel}</span> <span class="tag-separator">•</span> <span>${prod.tag}</span>`;
    }

    if (productTitle) {
      if (window.formatProductTitle) {
        productTitle.innerHTML = window.formatProductTitle(prod);
      } else {
        productTitle.textContent = prod.title;
      }
    }

    const isConsult = prod.consultPrice === true || prod.category === 'tags' || prod.category === 'papelaria';
    if (priceAmount) {
      if (isConsult && window.formatProductPrice) {
        priceAmount.innerHTML = window.formatProductPrice(prod, { withLink: true });
        priceAmount.classList.add('price-amount-consult');
      } else {
        priceAmount.textContent = prod.price;
        priceAmount.classList.remove('price-amount-consult');
      }
    }

    const priceCurrency = document.querySelector('.product-currency');
    if (priceCurrency) {
      priceCurrency.textContent = isConsult ? 'Valores:' : 'Valor:';
    }

    const priceLabelIcon = document.getElementById('priceLabelIcon');
    if (priceLabelIcon) {
      priceLabelIcon.className = isConsult ? 'fa-solid fa-comments' : 'fa-solid fa-tag';
    }

    const paymentDetails = document.querySelector('.price-payment-details');
    if (paymentDetails) {
      if (isConsult) {
        paymentDetails.innerHTML = `
          <div class="payment-option-item">
            <i class="fa-solid fa-comments" aria-hidden="true"></i>
            <span>Orçamento sob medida conforme modelo e quantidade</span>
          </div>
          <div class="payment-option-item">
            <i class="fa-solid fa-credit-card" aria-hidden="true"></i>
            <span>Cartão de crédito e Pix aceitos</span>
          </div>
        `;
      } else {
        paymentDetails.innerHTML = `
          <div class="payment-option-item">
            <i class="fa-solid fa-credit-card" aria-hidden="true"></i>
            <span><strong>Cartão de crédito</strong></span>
          </div>
          <div class="payment-option-item">
            <i class="fa-brands fa-pix" aria-hidden="true"></i>
            <span><strong>Pix</strong> à vista</span>
          </div>
        `;
      }
    }

    if (descriptionText) {
      descriptionText.textContent = prod.desc;
    }

    // Badge
    if (mainBadge) {
      if (prod.badge) {
        mainBadge.textContent = prod.badge;
        const badgeColor = prod.badgeType === 'gold' ? 'gold' : (prod.badgeType === 'sage' ? 'sage' : 'olive');
        mainBadge.className = `produto-badge ${badgeColor}`;
        mainBadge.style.display = 'inline-block';
      } else {
        mainBadge.style.display = 'none';
      }
    }

    // Especificações
    if (specsList && prod.specs) {
      specsList.innerHTML = prod.specs.map(spec => `
        <div class="spec-line-item">
          <i class="fa-solid fa-circle-check"></i>
          <span>${spec}</span>
        </div>
      `).join('');
    }

    // 5.4.1. Exibir opções de características apenas se for Agenda (categoria planners)
    const isAgenda = prod.category === 'planners';
    const customizationCard = document.getElementById('agendaCustomizationCard');
    if (customizationCard) {
      customizationCard.style.display = isAgenda ? 'flex' : 'none';
    }
    if (isAgenda) {
      initFeatureButtons();
      syncFeatureButtonsUI();
    }

    // 5.5. Gestão de Itens Selecionados e Capa da Agenda
    updateWhatsappLink();
    initAddToCartHero();
    updateCapasCallout();
    renderSelectedItemsSection();

    // 5.6. Inicializar Galeria de Imagens
    initGallery(prod);

    // 5.7. Renderizar Produtos Relacionados
    renderRelatedProducts(prod);
  }

  // --------------------------------------------------------------------------
  // GESTÃO DE CARACTERÍSTICAS DA AGENDA (FECHAMENTO, MIOLO E PERSONALIZAÇÃO COM NOME)
  // --------------------------------------------------------------------------

  function initFeatureButtons() {
    const card = document.getElementById('agendaCustomizationCard');
    if (!card || featureButtonsInitialized) return;

    card.querySelectorAll('.btn-feature-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.getAttribute('data-group');
        const val = btn.getAttribute('data-value');

        if (group === 'fechamento') {
          if (activeSelectedFechamento === val) {
            // Clicar novamente na opção selecionada desmarca
            setFechamentoOption(null);
            showToast(`Opção "${val}" desmarcada.`);
          } else {
            // Seleciona nova opção e desmarca automaticamente a anterior do grupo
            setFechamentoOption(val);
            showToast(`Fechamento "${val}" selecionado!`);
          }
        } else if (group === 'horario') {
          if (activeSelectedHorario === val) {
            // Clicar novamente na opção selecionada desmarca
            setHorarioOption(null);
            showToast(`Opção "${val}" desmarcada.`);
          } else {
            // Seleciona nova opção e desmarca automaticamente a anterior do grupo
            setHorarioOption(val);
            showToast(`Miolo "${val}" selecionado!`);
          }
        } else if (group === 'personalizacao_nome') {
          if (activeSelectedNomeOption === val) {
            setNomeOption(null);
            showToast('Opção de personalização com nome desmarcada.');
          } else {
            setNomeOption(val);
            if (val === 'sim') {
              showToast('Opção com nome selecionada! Digite o nome desejado.');
            } else {
              showToast('Opção sem nome selecionada.');
            }
          }
        }
      });
    });

    // Eventos do campo de digitação do nome personalizado
    const inputCustomName = document.getElementById('agendaInputCustomName');
    if (inputCustomName) {
      inputCustomName.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val.length > 30) {
          val = val.slice(0, 30);
          e.target.value = val;
        }
        const counter = document.getElementById('agendaNameCharCounter');
        if (counter) {
          counter.textContent = `${val.length}/30`;
        }
        const trimmed = val.trim();
        if (trimmed.length > 0) {
          inputCustomName.classList.remove('has-error');
          const err = document.getElementById('agendaCustomNameError');
          if (err) err.style.display = 'none';
        }
        activeCustomName = trimmed;
        renderSelectedItemsSection();
        updateWhatsappLink();
        updateUrlCustomizationParams();
      });

      inputCustomName.addEventListener('blur', () => {
        const trimmed = inputCustomName.value.trim();
        if (inputCustomName.value !== trimmed) {
          inputCustomName.value = trimmed;
          const counter = document.getElementById('agendaNameCharCounter');
          if (counter) counter.textContent = `${trimmed.length}/30`;
        }
        activeCustomName = trimmed;
        renderSelectedItemsSection();
        updateWhatsappLink();
        updateUrlCustomizationParams();
      });
    }

    featureButtonsInitialized = true;
  }

  function setFechamentoOption(val) {
    activeSelectedFechamento = val;
    syncFeatureButtonsUI();
    renderSelectedItemsSection();
    updateWhatsappLink();
    updateUrlCustomizationParams();
  }

  function setHorarioOption(val) {
    activeSelectedHorario = val;
    syncFeatureButtonsUI();
    renderSelectedItemsSection();
    updateWhatsappLink();
    updateUrlCustomizationParams();
  }

  function setNomeOption(val) {
    activeSelectedNomeOption = val;
    const nameBox = document.getElementById('agendaCustomNameBox');
    const inputCustomName = document.getElementById('agendaInputCustomName');
    const nameError = document.getElementById('agendaCustomNameError');
    const charCounter = document.getElementById('agendaNameCharCounter');

    if (val === 'sim') {
      if (nameBox) nameBox.style.display = 'block';
      if (inputCustomName) {
        if (activeCustomName) {
          inputCustomName.value = activeCustomName;
          if (charCounter) charCounter.textContent = `${activeCustomName.length}/30`;
        }
        setTimeout(() => inputCustomName.focus(), 50);
      }
    } else {
      // Quando 'nao' ou null: fecha o campo, reseta valor e não envia nome preenchido
      if (nameBox) nameBox.style.display = 'none';
      if (inputCustomName) {
        inputCustomName.value = '';
        inputCustomName.classList.remove('has-error');
      }
      activeCustomName = '';
      if (charCounter) charCounter.textContent = '0/30';
      if (nameError) nameError.style.display = 'none';
    }

    syncFeatureButtonsUI();
    renderSelectedItemsSection();
    updateWhatsappLink();
    updateUrlCustomizationParams();
  }

  function syncFeatureButtonsUI() {
    const card = document.getElementById('agendaCustomizationCard');
    if (!card) return;

    // Grupo Fechamento
    const fechamentoBtns = card.querySelectorAll('.btn-feature-option[data-group="fechamento"]');
    fechamentoBtns.forEach(btn => {
      const val = btn.getAttribute('data-value');
      const isSelected = val === activeSelectedFechamento;
      btn.classList.toggle('is-selected', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const statusFechamento = document.getElementById('statusFechamento');
    if (statusFechamento) {
      if (activeSelectedFechamento) {
        statusFechamento.textContent = activeSelectedFechamento;
        statusFechamento.classList.add('has-selection');
      } else {
        statusFechamento.textContent = 'Nenhum selecionado';
        statusFechamento.classList.remove('has-selection');
      }
    }

    // Grupo Horário
    const horarioBtns = card.querySelectorAll('.btn-feature-option[data-group="horario"]');
    horarioBtns.forEach(btn => {
      const val = btn.getAttribute('data-value');
      const isSelected = val === activeSelectedHorario;
      btn.classList.toggle('is-selected', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const statusHorario = document.getElementById('statusHorario');
    if (statusHorario) {
      if (activeSelectedHorario) {
        statusHorario.textContent = activeSelectedHorario;
        statusHorario.classList.add('has-selection');
      } else {
        statusHorario.textContent = 'Nenhum selecionado';
        statusHorario.classList.remove('has-selection');
      }
    }

    // Grupo Personalização com Nome
    const nomeBtns = card.querySelectorAll('.btn-feature-option[data-group="personalizacao_nome"]');
    nomeBtns.forEach(btn => {
      const val = btn.getAttribute('data-value');
      const isSelected = val === activeSelectedNomeOption;
      btn.classList.toggle('is-selected', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const statusNome = document.getElementById('statusPersonalizacaoNome');
    if (statusNome) {
      if (activeSelectedNomeOption === 'sim') {
        statusNome.textContent = 'Com nome';
        statusNome.classList.add('has-selection');
      } else if (activeSelectedNomeOption === 'nao') {
        statusNome.textContent = 'Sem nome';
        statusNome.classList.add('has-selection');
      } else {
        statusNome.textContent = 'Nenhum selecionado';
        statusNome.classList.remove('has-selection');
      }
    }

    const nameBox = document.getElementById('agendaCustomNameBox');
    if (nameBox) {
      nameBox.style.display = activeSelectedNomeOption === 'sim' ? 'block' : 'none';
    }
  }

  // --------------------------------------------------------------------------
  // GESTÃO DE ITENS SELECIONADOS & SELEÇÃO DE CAPA
  // --------------------------------------------------------------------------

  function updateWhatsappLink() {
    if (!btnWhatsappHero || !currentProduct) return;
    const isAgenda = currentProduct.category === 'planners';
    const isConsult = currentProduct.consultPrice || currentProduct.category === 'tags' || currentProduct.category === 'papelaria';
    let msgText = isConsult
      ? `Olá, Lalateliê! Estava visualizando o produto "${currentProduct.title}" no catálogo e gostaria de consultar valores e quantidades para fazer um pedido.`
      : `Olá, Lalateliê! Estava visualizando o produto "${currentProduct.title}" (${currentProduct.price}) na página exclusiva e gostaria de tirar dúvidas e solicitar a personalização com vocês.`;

    if (isAgenda) {
      const customizations = [];
      if (activeSelectedCapa) {
        customizations.push(`Capa Modelo ${activeSelectedCapa}`);
      }
      if (activeSelectedFechamento) {
        customizations.push(`Fechamento: ${activeSelectedFechamento}`);
      }
      if (activeSelectedHorario) {
        customizations.push(`Miolo: ${activeSelectedHorario}`);
      }
      if (activeSelectedNomeOption === 'sim') {
        customizations.push(activeCustomName ? `Personalização: Com nome ("${activeCustomName}")` : 'Personalização: Com nome');
      } else if (activeSelectedNomeOption === 'nao') {
        customizations.push('Personalização: Sem nome');
      }

      if (customizations.length > 0) {
        msgText = `Olá, Lalateliê! Gostaria de encomendar a "${currentProduct.title}" (${currentProduct.price}) com as opções: ${customizations.join(' | ')}.`;
      }
    }
    btnWhatsappHero.href = `https://wa.me/5533999774017?text=${encodeURIComponent(msgText)}`;
  }

  function initAddToCartHero() {
    if (!btnAddToCartHero || !currentProduct) return;

    const isConsult = currentProduct.consultPrice || currentProduct.category === 'tags' || currentProduct.category === 'papelaria';
    if (isConsult) {
      btnAddToCartHero.style.display = 'none';
      return;
    }

    btnAddToCartHero.style.display = 'flex';

    if (!addToCartHeroInitialized) {
      btnAddToCartHero.addEventListener('click', () => {
        if (!currentProduct) return;
        const isAgenda = currentProduct.category === 'planners';

        if (isAgenda) {
          // Validação 1: Capa da agenda
          if (!activeSelectedCapa) {
            showToast('Por favor, selecione uma capa para sua agenda.');
            openCapaPickerModal();
            return;
          }

          // Validação 2: Opção de personalização com nome (Obrigatório selecionar Sim ou Não)
          if (!activeSelectedNomeOption) {
            showToast('Por favor, escolha se deseja personalizar sua agenda com nome.');
            const nomeGroup = document.getElementById('agendaPersonalizacaoNomeGroup');
            if (nomeGroup) {
              nomeGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
              nomeGroup.classList.add('highlight-attention');
              setTimeout(() => nomeGroup.classList.remove('highlight-attention'), 1600);
            }
            return;
          }

          // Validação 3: Se escolheu "Sim, quero personalizar com nome", o campo é obrigatório
          if (activeSelectedNomeOption === 'sim') {
            const inputName = document.getElementById('agendaInputCustomName');
            const cleanName = inputName ? inputName.value.trim() : '';
            if (!cleanName) {
              const errEl = document.getElementById('agendaCustomNameError');
              if (errEl) errEl.style.display = 'flex';
              if (inputName) {
                inputName.classList.add('has-error');
                inputName.focus();
              }
              const nomeGroup = document.getElementById('agendaPersonalizacaoNomeGroup');
              if (nomeGroup) {
                nomeGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              showToast('Por favor, digite o nome para personalização da sua agenda.');
              return;
            }
            activeCustomName = cleanName;
          }

          const fechamento = activeSelectedFechamento || 'Sem fechamento';
          const miolo = activeSelectedHorario || 'Com horário';

          const customizations = [
            {
              groupId: 'capa',
              group: 'Capa',
              value: `Capa Modelo ${activeSelectedCapa}`,
              price: 0,
              isCapa: true,
              capaNum: parseInt(activeSelectedCapa, 10)
            },
            {
              groupId: 'fechamento',
              group: 'Fechamento',
              value: fechamento,
              price: 0
            },
            {
              groupId: 'miolo',
              group: 'Miolo',
              value: miolo,
              price: 0
            }
          ];

          // Registro independente e limpo da personalização de nome
          if (activeSelectedNomeOption === 'sim') {
            customizations.push({
              groupId: 'personalizacao_nome',
              group: 'Personalização',
              value: 'Com nome',
              price: 0
            });
            customizations.push({
              groupId: 'nome_personalizado',
              group: 'Nome na Agenda',
              value: activeCustomName,
              price: 0
            });
          } else {
            // Se "Não, quero minha agenda sem nome": apenas a tag "Sem nome" é enviada
            customizations.push({
              groupId: 'personalizacao_nome',
              group: 'Personalização',
              value: 'Sem nome',
              price: 0
            });
          }

          if (window.LalatelieCart) {
            window.LalatelieCart.addItem(currentProduct, customizations, 1);
            window.LalatelieCart.showToast(`"${currentProduct.title}" adicionada ao carrinho!`);
            window.LalatelieCart.openDrawer();
          }
        } else {
          // Para outros produtos (cadernos)
          if (window.LalatelieCart) {
            window.LalatelieCart.handleProductAddClick(currentProduct);
          }
        }
      });
      addToCartHeroInitialized = true;
    }
  }

  function updateCapasCallout() {
    const capasCallout = document.querySelector('.personalization-capas-callout');
    if (!capasCallout || !currentProduct) return;
    const isAgenda = currentProduct.category === 'planners';
    if (!isAgenda) {
      capasCallout.style.display = 'none';
      return;
    }
    capasCallout.style.display = 'flex';
    if (activeSelectedCapa) {
      capasCallout.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color: #27ae60;"></i>
        <span><strong>Capa Selecionada para sua Agenda:</strong> Capa Modelo ${activeSelectedCapa} do catálogo. <button type="button" class="link-capas-inline-btn" id="btnCalloutChangeCapa">Deseja alterar?</button></span>
      `;
      capasCallout.style.borderColor = 'rgba(39, 174, 96, 0.4)';
      capasCallout.style.borderLeft = '3px solid #27ae60';
      capasCallout.style.backgroundColor = '#f4fbf6';
      const changeBtn = document.getElementById('btnCalloutChangeCapa');
      if (changeBtn) {
        changeBtn.addEventListener('click', openCapaPickerModal);
      }
    } else {
      capasCallout.innerHTML = `
        <i class="fa-solid fa-palette"></i>
        <span>Confira as <strong>30 opções de capas para Agendas</strong> e <button type="button" class="link-capas-inline-btn" id="btnCalloutOpenPicker">escolha seu modelo favorito</button> na encomenda!</span>
      `;
      capasCallout.style.borderColor = '';
      capasCallout.style.borderLeft = '';
      capasCallout.style.backgroundColor = '';
      const pickerBtn = document.getElementById('btnCalloutOpenPicker');
      if (pickerBtn) {
        pickerBtn.addEventListener('click', openCapaPickerModal);
      }
    }
  }

  function updateUrlCustomizationParams() {
    try {
      const url = new URL(window.location);
      if (activeSelectedCapa) {
        url.searchParams.set('capa', activeSelectedCapa);
      } else {
        url.searchParams.delete('capa');
      }
      if (activeSelectedFechamento) {
        url.searchParams.set('fechamento', activeSelectedFechamento);
      } else {
        url.searchParams.delete('fechamento');
      }
      if (activeSelectedHorario) {
        url.searchParams.set('horario', activeSelectedHorario);
      } else {
        url.searchParams.delete('horario');
      }
      if (activeSelectedNomeOption) {
        url.searchParams.set('personalizacao_nome', activeSelectedNomeOption);
        if (activeSelectedNomeOption === 'sim' && activeCustomName) {
          url.searchParams.set('nome', activeCustomName);
        } else {
          url.searchParams.delete('nome');
        }
      } else {
        url.searchParams.delete('personalizacao_nome');
        url.searchParams.delete('nome');
      }
      window.history.replaceState({}, '', url);
    } catch (err) {
      // Ignora erro se URL API falhar
    }
  }

  function updateUrlCapaParam() {
    updateUrlCustomizationParams();
  }

  function renderSelectedItemsSection() {
    const sectionCard = document.getElementById('produtoSelectedItemsSection');
    const itemsBody = document.getElementById('selectedItemsBody');
    const badge = document.getElementById('selectedItemsCountBadge');
    if (!sectionCard || !itemsBody || !currentProduct) return;

    const isAgenda = currentProduct.category === 'planners';

    if (!isAgenda) {
      sectionCard.style.display = 'none';
      return;
    }

    sectionCard.style.display = 'flex';

    // Calcula quantidade total de escolhas ativas
    let totalItems = 0;
    if (activeSelectedCapa) totalItems++;
    if (activeSelectedFechamento) totalItems++;
    if (activeSelectedHorario) totalItems++;
    if (activeSelectedNomeOption) totalItems++;

    if (badge) {
      badge.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
    }

    if (totalItems === 0) {
      itemsBody.innerHTML = `
        <div class="selected-items-empty">
          <div class="empty-icon-box">
            <i class="fa-regular fa-bookmark"></i>
          </div>
          <div class="empty-text-box">
            <p class="empty-title">Nenhum item selecionado</p>
            <p class="empty-subtext">Escolha a capa, o fechamento, o miolo e a personalização de nome para sua agenda.</p>
          </div>
          <button type="button" class="btn-select-capa-action" id="btnSelectedChooseCapa">
            <i class="fa-solid fa-palette"></i>
            <span>Escolher Capa</span>
          </button>
        </div>
      `;

      const btnChoose = document.getElementById('btnSelectedChooseCapa');
      if (btnChoose) {
        btnChoose.addEventListener('click', openCapaPickerModal);
      }
      return;
    }

    let rowsHtml = '';

    // 1. Capa Selecionada
    if (activeSelectedCapa) {
      const capaNum = activeSelectedCapa;
      const capaImgSrc = `assets/images/produtos/capas/capas${capaNum}.jpg`;

      rowsHtml += `
        <div class="selected-item-row" data-type="capa" data-capa="${capaNum}">
          <div class="selected-item-thumb">
            <img src="${capaImgSrc}" alt="Capa Modelo ${capaNum}" class="selected-item-img" onerror="this.onerror=null;this.src='assets/images/logo/logo.png';">
            <span class="selected-item-badge-pill">Capa</span>
          </div>
          <div class="selected-item-info">
            <span class="selected-item-tag">Personalização da Agenda</span>
            <h4 class="selected-item-title">Capa Modelo ${capaNum}</h4>
            <p class="selected-item-desc">Modelo de capa aplicado à ${window.formatProductTitle ? window.formatProductTitle(currentProduct) : currentProduct.title}.</p>
          </div>
          <div class="selected-item-actions">
            <button type="button" class="btn-selected-action btn-change" id="btnSelectedChangeCapa" title="Substituir por outra capa" aria-label="Trocar capa selecionada">
              <i class="fa-solid fa-arrows-rotate"></i>
              <span>Trocar</span>
            </button>
            <button type="button" class="btn-selected-action btn-remove" id="btnSelectedRemoveCapa" title="Remover capa selecionada" aria-label="Remover capa selecionada">
              <i class="fa-solid fa-trash-can"></i>
              <span>Remover</span>
            </button>
          </div>
        </div>
      `;
    }

    // 2. Fechamento Selecionado
    if (activeSelectedFechamento) {
      rowsHtml += `
        <div class="selected-item-row" data-type="fechamento">
          <div class="selected-item-thumb selected-item-thumb-icon">
            <i class="fa-solid fa-ribbon"></i>
            <span class="selected-item-badge-pill">Fecho</span>
          </div>
          <div class="selected-item-info">
            <span class="selected-item-tag">Personalização da Agenda</span>
            <h4 class="selected-item-title">Fechamento: ${activeSelectedFechamento}</h4>
            <p class="selected-item-desc">Opção de fechamento selecionada para sua agenda.</p>
          </div>
          <div class="selected-item-actions">
            <button type="button" class="btn-selected-action btn-remove" id="btnSelectedRemoveFechamento" title="Remover opção de fechamento" aria-label="Remover opção de fechamento">
              <i class="fa-solid fa-trash-can"></i>
              <span>Remover</span>
            </button>
          </div>
        </div>
      `;
    }

    // 3. Miolo / Horário Selecionado
    if (activeSelectedHorario) {
      rowsHtml += `
        <div class="selected-item-row" data-type="horario">
          <div class="selected-item-thumb selected-item-thumb-icon">
            <i class="fa-regular fa-clock"></i>
            <span class="selected-item-badge-pill">Miolo</span>
          </div>
          <div class="selected-item-info">
            <span class="selected-item-tag">Personalização da Agenda</span>
            <h4 class="selected-item-title">Miolo: ${activeSelectedHorario}</h4>
            <p class="selected-item-desc">Disposição das páginas internas selecionada para sua agenda.</p>
          </div>
          <div class="selected-item-actions">
            <button type="button" class="btn-selected-action btn-remove" id="btnSelectedRemoveHorario" title="Remover opção de miolo" aria-label="Remover opção de miolo">
              <i class="fa-solid fa-trash-can"></i>
              <span>Remover</span>
            </button>
          </div>
        </div>
      `;
    }

    // 4. Personalização com Nome Selecionada
    if (activeSelectedNomeOption) {
      const isComNome = activeSelectedNomeOption === 'sim';
      const titleText = isComNome
        ? (activeCustomName ? `Personalização: Com nome ("${activeCustomName}")` : 'Personalização: Com nome')
        : 'Personalização: Sem nome';
      const descText = isComNome
        ? (activeCustomName ? `Nome gravado na capa da agenda: "${activeCustomName}".` : 'Nome para personalização a ser gravado na capa da agenda.')
        : 'Agenda confeccionada sem nome gravado na capa.';

      rowsHtml += `
        <div class="selected-item-row" data-type="nome">
          <div class="selected-item-thumb selected-item-thumb-icon">
            <i class="fa-solid fa-signature"></i>
            <span class="selected-item-badge-pill">Nome</span>
          </div>
          <div class="selected-item-info">
            <span class="selected-item-tag">Personalização da Agenda</span>
            <h4 class="selected-item-title">${titleText}</h4>
            <p class="selected-item-desc">${descText}</p>
          </div>
          <div class="selected-item-actions">
            <button type="button" class="btn-selected-action btn-remove" id="btnSelectedRemoveNome" title="Remover opção de nome" aria-label="Remover opção de nome">
              <i class="fa-solid fa-trash-can"></i>
              <span>Remover</span>
            </button>
          </div>
        </div>
      `;
    }

    // Se nenhuma capa foi selecionada ainda, oferece sugestão para escolher capa
    if (!activeSelectedCapa) {
      rowsHtml += `
        <div class="selected-item-add-prompt">
          <div class="add-prompt-info">
            <i class="fa-solid fa-palette"></i>
            <span>Deseja adicionar uma capa do mostruário?</span>
          </div>
          <button type="button" class="btn-select-capa-action" id="btnSelectedChooseCapaInline">
            <i class="fa-solid fa-plus"></i>
            <span>Escolher Capa</span>
          </button>
        </div>
      `;
    }

    itemsBody.innerHTML = rowsHtml;

    // Vincular eventos dos botões de ação
    const btnChange = document.getElementById('btnSelectedChangeCapa');
    const btnRemoveCapa = document.getElementById('btnSelectedRemoveCapa');
    const btnRemoveFechamento = document.getElementById('btnSelectedRemoveFechamento');
    const btnRemoveHorario = document.getElementById('btnSelectedRemoveHorario');
    const btnRemoveNome = document.getElementById('btnSelectedRemoveNome');
    const btnChooseInline = document.getElementById('btnSelectedChooseCapaInline');

    if (btnChange) {
      btnChange.addEventListener('click', openCapaPickerModal);
    }
    if (btnRemoveCapa) {
      btnRemoveCapa.addEventListener('click', () => {
        activeSelectedCapa = null;
        updateUrlCustomizationParams();
        renderSelectedItemsSection();
        updateWhatsappLink();
        updateCapasCallout();
        showToast('Capa removida da seleção.');
      });
    }
    if (btnRemoveFechamento) {
      btnRemoveFechamento.addEventListener('click', () => {
        setFechamentoOption(null);
        showToast('Opção de fechamento desmarcada.');
      });
    }
    if (btnRemoveHorario) {
      btnRemoveHorario.addEventListener('click', () => {
        setHorarioOption(null);
        showToast('Opção de miolo desmarcada.');
      });
    }
    if (btnRemoveNome) {
      btnRemoveNome.addEventListener('click', () => {
        setNomeOption(null);
        showToast('Opção de personalização com nome desmarcada.');
      });
    }
    if (btnChooseInline) {
      btnChooseInline.addEventListener('click', openCapaPickerModal);
    }
  }

  function initCapaPickerModal() {
    const modal = document.getElementById('capaPickerModal');
    const grid = document.getElementById('capaPickerGrid');
    const closeBtn = document.getElementById('capaPickerClose');
    if (!modal || !grid) return;

    if (!capaPickerInitialized) {
      let capasHtml = '';
      for (let i = 1; i <= 30; i++) {
        capasHtml += `
          <button type="button" class="capa-picker-item" data-capa-num="${i}" aria-label="Selecionar Capa Modelo ${i}">
            <div class="capa-picker-thumb">
              <img src="assets/images/produtos/capas/capas${i}.jpg" alt="Capa Modelo ${i}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/logo/logo.png';">
              <span class="capa-picker-badge">Nº ${i}</span>
            </div>
            <span class="capa-picker-name">Capa Modelo ${i}</span>
          </button>
        `;
      }
      grid.innerHTML = capasHtml;

      grid.querySelectorAll('.capa-picker-item').forEach(itemBtn => {
        itemBtn.addEventListener('click', () => {
          const capaNum = itemBtn.getAttribute('data-capa-num');
          selectCapa(capaNum);
        });
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', closeCapaPickerModal);
      }

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCapaPickerModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeCapaPickerModal();
        }
      });

      capaPickerInitialized = true;
    }
  }

  function openCapaPickerModal() {
    const modal = document.getElementById('capaPickerModal');
    if (!modal) return;
    initCapaPickerModal();
    if (activeSelectedCapa) {
      modal.querySelectorAll('.capa-picker-item').forEach(btn => {
        const isCurrent = btn.getAttribute('data-capa-num') === String(activeSelectedCapa);
        btn.classList.toggle('selected', isCurrent);
      });
    }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCapaPickerModal() {
    const modal = document.getElementById('capaPickerModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function selectCapa(capaNum) {
    const num = parseInt(capaNum, 10);
    if (isNaN(num) || num < 1 || num > 30) return;
    activeSelectedCapa = String(num);
    updateUrlCapaParam();
    renderSelectedItemsSection();
    updateWhatsappLink();
    updateCapasCallout();
    closeCapaPickerModal();
    showToast(`Capa Modelo ${num} selecionada para sua agenda!`);
  }

  // --------------------------------------------------------------------------
  // 6. GALERIA & CARROSSEL DE IMAGENS (4 VISÍVEIS + 5ª NO CARROSSEL)
  // --------------------------------------------------------------------------
  function initGallery(prod) {
    if (!mainImg || !prod.images || prod.images.length === 0) return;

    currentImageIndex = 0;
    currentThumbOffset = 0;
    updateMainImage(0, prod);

    const totalImgs = prod.images.length; // 5 imagens correspondentes

    // Atualiza contador da foto principal (ex: 1 / 5)
    if (counterBadge) {
      counterBadge.textContent = `1 / ${totalImgs}`;
      counterBadge.style.display = 'inline-block';
    }

    if (totalImgs > 1) {
      if (thumbnailsTrack) {
        thumbnailsTrack.innerHTML = prod.images.map((imgUrl, index) => `
          <div class="produto-thumb-item ${index === 0 ? 'active' : ''}" data-index="${index}" role="button" tabindex="0" aria-label="Ver imagem ${index + 1} de ${prod.title}">
            <img src="${imgUrl}" alt="Miniatura ${index + 1} de ${prod.title}" loading="lazy">
          </div>
        `).join('');

        const thumbs = thumbnailsTrack.querySelectorAll('.produto-thumb-item');
        thumbs.forEach(thumb => {
          // Passar o mouse (hover): altera a imagem principal automaticamente
          thumb.addEventListener('mouseenter', () => {
            const idx = parseInt(thumb.getAttribute('data-index'), 10);
            goToImage(idx, prod);
          });

          // Clique: seleciona e foca a imagem
          thumb.addEventListener('click', () => {
            const idx = parseInt(thumb.getAttribute('data-index'), 10);
            goToImage(idx, prod);
          });

          // Toque no mobile: altera a imagem no primeiro toque
          thumb.addEventListener('touchend', (e) => {
            const idx = parseInt(thumb.getAttribute('data-index'), 10);
            goToImage(idx, prod);
          }, { passive: true });

          // Navegação por teclado (Enter / Espaço)
          thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const idx = parseInt(thumb.getAttribute('data-index'), 10);
              goToImage(idx, prod);
            }
          });
        });
      }

      // Controles do Carrossel de Miniaturas (Anterior e Próxima)
      if (thumbPrevBtn) {
        thumbPrevBtn.onclick = () => {
          updateCarouselOffset(currentThumbOffset - 1, totalImgs);
        };
      }

      if (thumbNextBtn) {
        thumbNextBtn.onclick = () => {
          updateCarouselOffset(currentThumbOffset + 1, totalImgs);
        };
      }

      // Inicializa a posição do carrossel exibindo as miniaturas
      updateCarouselOffset(0, totalImgs);

    } else {
      if (gallerySection) gallerySection.style.display = 'none';
      if (counterBadge) counterBadge.style.display = 'none';
    }
  }

  function updateCarouselOffset(newOffset, totalImgs) {
    if (thumbnailsTrack) {
      thumbnailsTrack.style.transform = 'none';
    }
  }

  function goToImage(index, prod) {
    if (index < 0 || index >= prod.images.length) return;
    currentImageIndex = index;
    updateMainImage(index, prod);

    // Atualiza miniaturas destacando a ativa
    if (thumbnailsTrack) {
      const thumbs = thumbnailsTrack.querySelectorAll('.produto-thumb-item');
      thumbs.forEach((thumb, idx) => {
        if (idx === index) {
          thumb.classList.add('active');
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          thumb.classList.remove('active');
        }
      });
    }

    // Atualiza contador da foto principal
    if (counterBadge) {
      counterBadge.textContent = `${index + 1} / ${prod.images.length}`;
    }
  }

  function updateMainImage(index, prod) {
    if (!mainImg) return;
    mainImg.style.opacity = '0.35';
    setTimeout(() => {
      mainImg.src = prod.images[index];
      mainImg.alt = `${prod.title} - Foto ${index + 1}`;
      mainImg.style.opacity = '1';
    }, 120);
  }

  // --------------------------------------------------------------------------
  // 7. COMPARTILHAR / COPIAR LINK DO PRODUTO
  // --------------------------------------------------------------------------
  if (btnShareProduct) {
    btnShareProduct.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link do produto copiado com sucesso!');
      } catch (err) {
        // Fallback para seleção de texto caso o clipboard seja bloqueado
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        showToast('Link do produto copiado com sucesso!');
      }
    });
  }

  function showToast(message) {
    if (!copyToast) return;
    const textSpan = copyToast.querySelector('span');
    if (textSpan) textSpan.textContent = message;
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // 8. PRODUTOS RELACIONADOS
  // --------------------------------------------------------------------------
  function renderRelatedProducts(current) {
    if (!relatedGrid) return;

    // Buscar produtos da mesma categoria primeiro, depois de outras categorias
    let related = produtos.filter(p => p.id !== current.id && p.category === current.category);
    if (related.length < 4) {
      const others = produtos.filter(p => p.id !== current.id && p.category !== current.category);
      related = [...related, ...others];
    }
    // Limitar a 4 produtos
    related = related.slice(0, 4);

    if (related.length === 0) {
      if (relatedSection) relatedSection.style.display = 'none';
      return;
    }

    const returnCatParam = fromCategory ? `&categoria=${encodeURIComponent(fromCategory)}` : `&categoria=${encodeURIComponent(current.category)}`;

    relatedGrid.innerHTML = related.map(item => {
      const productUrl = `produto.html?id=${encodeURIComponent(item.id)}${returnCatParam}`;
      const isConsult = item.consultPrice || item.category === 'tags' || item.category === 'papelaria';
      const formattedTitle = window.formatProductTitle ? window.formatProductTitle(item) : item.title;
      const formattedPrice = window.formatProductPrice ? window.formatProductPrice(item, { withLink: false }) : item.price;
      const descText = item.desc || '';

      return `
        <article class="related-card" data-id="${item.id}">
          <div class="related-card-media-wrapper">
            <a href="${productUrl}" class="related-card-media-link" aria-label="Visualizar produto ${item.title}" tabindex="-1">
              <img src="${item.images[0]}" alt="${item.title}" class="related-card-img" loading="lazy">
              <div class="related-card-overlay" aria-hidden="true">
                <span class="related-card-quick-pill">
                  <i class="fa-regular fa-eye" aria-hidden="true"></i>
                  <span>Ver detalhes</span>
                </span>
              </div>
            </a>
            <span class="related-card-badge">${item.categoryLabel || ''}</span>
          </div>

          <div class="related-card-body">
            <div class="related-card-content">
              <div class="related-card-meta">
                <span class="related-card-tag">${item.categoryLabel || ''}${item.tag ? ` • ${item.tag}` : ''}</span>
              </div>
              <h3 class="related-card-title">
                <a href="${productUrl}" title="${item.title}">${formattedTitle}</a>
              </h3>
              ${descText ? `<p class="related-card-desc">${descText}</p>` : ''}
            </div>

            <div class="related-card-footer ${isConsult ? 'related-card-footer-consult' : ''}">
              <div class="related-card-price-wrap">
                <span class="related-card-price-label">${isConsult ? 'Atendimento' : 'A partir de'}</span>
                <span class="related-card-price">${formattedPrice}</span>
              </div>
              <a href="${productUrl}" class="btn-related-view" aria-label="Visualizar produto ${item.title}">
                <span>Ver Produto</span>
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Adiciona interação acessível no card inteiro ao clicar fora de links existentes
    relatedGrid.querySelectorAll('.related-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        const mainLink = card.querySelector('.btn-related-view');
        if (mainLink && mainLink.href) {
          window.location.href = mainLink.href;
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. ESTADO QUANDO O PRODUTO NÃO É ENCONTRADO
  // --------------------------------------------------------------------------
  function showNotFound() {
    if (layoutGrid) layoutGrid.style.display = 'none';
    if (gallerySection) gallerySection.style.display = 'none';
    if (relatedSection) relatedSection.style.display = 'none';
    if (notFoundState) notFoundState.classList.add('active');
    if (btnBackCatalog) {
      btnBackCatalog.href = 'catalogo.html';
      btnBackCatalog.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>Voltar ao Catálogo</span>';
    }
    document.title = 'Produto não encontrado | Lalateliê Papelaria Afetiva';
  }

  // --------------------------------------------------------------------------
  // 10. CABEÇALHO SCROLL E MENU MOBILE MODERNO
  // --------------------------------------------------------------------------
  window.addEventListener('scroll', () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const mobileBackdrop = document.getElementById('mobileMenuBackdrop');

  function closeMobileNav() {
    if (!mobileToggle || !mobileMenu) return;
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.classList.remove('is-active');
    mobileMenu.classList.remove('is-active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileBackdrop?.classList.remove('is-active');
    document.body.classList.remove('menu-open');
  }

  function toggleMobileNav() {
    if (!mobileToggle || !mobileMenu) return;
    const isOpening = !mobileMenu.classList.contains('is-active');
    mobileToggle.setAttribute('aria-expanded', String(isOpening));
    mobileToggle.classList.toggle('is-active', isOpening);
    mobileMenu.classList.toggle('is-active', isOpening);
    mobileMenu.setAttribute('aria-hidden', String(!isOpening));
    mobileBackdrop?.classList.toggle('is-active', isOpening);
    document.body.classList.toggle('menu-open', isOpening);
  }

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', toggleMobileNav);
    mobileBackdrop?.addEventListener('click', closeMobileNav);

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-active')) {
        closeMobileNav();
        mobileToggle.focus();
      }
      // Atalhos de teclado para navegação de fotos
      if (currentProduct && currentProduct.images && currentProduct.images.length > 1) {
        const total = currentProduct.images.length;
        if (e.key === 'ArrowLeft') {
          const prevIdx = (currentImageIndex - 1 + total) % total;
          goToImage(prevIdx, currentProduct);
        } else if (e.key === 'ArrowRight') {
          const nextIdx = (currentImageIndex + 1) % total;
          goToImage(nextIdx, currentProduct);
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && mobileMenu.classList.contains('is-active')) {
        closeMobileNav();
      }
      if (currentProduct && currentProduct.images) {
        updateCarouselOffset(currentThumbOffset, currentProduct.images.length);
      }
    }, { passive: true });
  }
});
