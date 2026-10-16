/**
 * ==============================================================================
 * LALATELIÊ - LÓGICA DO CATÁLOGO DE PRODUTOS
 * Arquivo: assets/js/catalogo.js
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. BASE DE DADOS DOS PRODUTOS DO CATÁLOGO
  // --------------------------------------------------------------------------
  // Obtém do arquivo compartilhado produtos-data.js (carregado via script tag)
  const PRODUTOS_CATALOGO = (Array.isArray(window.PRODUTOS_LALATELIE) && window.PRODUTOS_LALATELIE.length > 0)
    ? [...window.PRODUTOS_LALATELIE]
    : [];

  // Adiciona as 34 opções de capas se ainda não existirem
  if (PRODUTOS_CATALOGO.filter(p => p.category === 'capas').length === 0) {
    for (let i = 1; i <= 34; i++) {
      PRODUTOS_CATALOGO.push({
        id: `capa-${i}`,
        title: `Capa Modelo ${i}`,
        category: 'capas',
        categoryLabel: 'Capas',
        isCapa: true,
        capaNum: i,
        images: [`assets/images/produtos/capas/capas${i}.jpg`]
      });
    }
  }

  // --------------------------------------------------------------------------
  // 2. ELEMENTOS DO DOM
  // --------------------------------------------------------------------------
  const productsGrid = document.getElementById('catalogoGrid');
  const searchInput = document.getElementById('catalogoSearch');
  const clearSearchBtn = document.getElementById('clearSearch');
  const filterPills = document.querySelectorAll('.filter-pill');
  const sortSelect = document.getElementById('catalogoSort');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('catalogoEmpty');
  const btnResetSearch = document.getElementById('btnResetSearch');

  // Alternância de Visualização (Grade / Lista)
  const catalogoViewToggle = document.getElementById('catalogoViewToggle');
  const btnViewGrid = document.getElementById('btnViewGrid');
  const btnViewList = document.getElementById('btnViewList');

  // Navegação do Header
  const siteHeader = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // --------------------------------------------------------------------------
  // 3. ESTADO DA PÁGINA
  // --------------------------------------------------------------------------
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'popular';

  // Preferência de Visualização salva no localStorage ('grid' ou 'list')
  let currentViewMode = 'grid';
  try {
    const savedMode = localStorage.getItem('lalatelie_catalogo_view_mode');
    if (savedMode === 'list' || savedMode === 'grid') {
      currentViewMode = savedMode;
    }
  } catch (e) {
    currentViewMode = 'grid';
  }

  // --------------------------------------------------------------------------
  // 4. ATUALIZAR CONTADORES DOS FILTROS
  // --------------------------------------------------------------------------
  function updateCategoryCounters() {
    filterPills.forEach(pill => {
      const cat = pill.getAttribute('data-category');
      const counterEl = pill.querySelector('.pill-count');
      if (!counterEl) return;

      if (cat === 'all') {
        counterEl.textContent = PRODUTOS_CATALOGO.filter(p => !p.isCapa).length;
      } else if (cat === 'capas') {
        const count = PRODUTOS_CATALOGO.filter(p => p.isCapa || p.category === 'capas').length;
        counterEl.textContent = count;
      } else if (cat === 'cadernos' || cat === 'cadernos-personalizados') {
        const count = PRODUTOS_CATALOGO.filter(p => p.category === 'cadernos' || p.category === 'cadernos-personalizados').length;
        counterEl.textContent = count;
      } else {
        const count = PRODUTOS_CATALOGO.filter(p => p.category === cat).length;
        counterEl.textContent = count;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. RENDERIZAÇÃO DOS CARDS DE PRODUTO COM LINK PARA PÁGINA EXCLUSIVA
  // --------------------------------------------------------------------------
  function renderProducts() {
    if (!productsGrid) return;

    // Filtragem
    let filtered = PRODUTOS_CATALOGO.filter(item => {
      let matchCategory = false;
      if (currentCategory === 'all') {
        // Na aba "Todos", exibe os produtos principais
        matchCategory = !item.isCapa;
      } else if (currentCategory === 'capas') {
        matchCategory = item.isCapa || item.category === 'capas';
      } else if (currentCategory === 'cadernos' || currentCategory === 'cadernos-personalizados') {
        matchCategory = (item.category === 'cadernos' || item.category === 'cadernos-personalizados');
      } else {
        matchCategory = item.category === currentCategory;
      }

      const matchSearch = (
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery) ||
        (item.desc && item.desc.toLowerCase().includes(searchQuery)) ||
        (item.tag && item.tag.toLowerCase().includes(searchQuery)) ||
        (item.categoryLabel && item.categoryLabel.toLowerCase().includes(searchQuery))
      );
      return matchCategory && matchSearch;
    });

    // Ordem oficial das categorias do catálogo: (Agendas, Cadernos, Calendário e Tags)
    const CATEGORY_ORDER = {
      'planners': 1,
      'agendas': 1,
      'cadernos-personalizados': 2,
      'cadernos': 2,
      'calendarios': 3,
      'calendario': 3,
      'tags': 4,
      'capas': 5
    };

    const getCategoryPriority = (cat) => CATEGORY_ORDER[cat] || 99;

    // Ordenação dos produtos
    if (currentCategory === 'capas') {
      filtered.sort((a, b) => (a.capaNum || 0) - (b.capaNum || 0));
    } else if (currentCategory === 'all') {
      // Na aba Todos, organiza estritamente de acordo com as categorias: Agendas, Cadernos, Calendário e Tags
      filtered.sort((a, b) => {
        const priorityA = getCategoryPriority(a.category);
        const priorityB = getCategoryPriority(b.category);
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        // Dentro de cada categoria, mantém a hierarquia de relevância e popularidade
        return (b.popularity || 0) - (a.popularity || 0);
      });
    } else if (currentSort === 'popular') {
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (currentSort === 'price-asc') {
      filtered.sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
    } else if (currentSort === 'price-desc') {
      filtered.sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
    } else if (currentSort === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Atualiza contador de resultados
    if (resultsCount) {
      if (currentCategory === 'capas') {
        resultsCount.innerHTML = `Mostrando <strong>${filtered.length}</strong> opções de capas disponíveis`;
      } else if (currentCategory === 'all') {
        resultsCount.innerHTML = `Mostrando <strong>${filtered.length}</strong> produtos organizados por categoria`;
      } else {
        resultsCount.innerHTML = `Mostrando <strong>${filtered.length}</strong> produtos`;
      }
    }

    // Exibição do estado vazio
    if (filtered.length === 0) {
      productsGrid.innerHTML = '';
      if (emptyState) emptyState.classList.add('active');
      return;
    }

    if (emptyState) emptyState.classList.remove('active');

    let cardsHtml = '';

    // Se estiver na categoria Capas, adiciona o banner informativo exclusivo para Agendas
    if (currentCategory === 'capas') {
      cardsHtml += `
        <div class="capas-banner-aviso">
          <div class="capas-banner-content">
            <i class="fa-solid fa-sparkles"></i>
            <div>
              <strong>Catálogo de Capas para Agendas (34 Opções)</strong>
              <p>Escolha sua capa favorita para personalizar a sua <strong>Agenda</strong>. Clique na capa para ampliar em alta definição.</p>
            </div>
          </div>
          <div class="capas-banner-actions">
            <a href="produto.html?id=agenda-master&categoria=planners" class="btn-capa-action primary">
              <i class="fa-solid fa-book"></i> Personalizar Agenda
            </a>
          </div>
        </div>
      `;
    }

    // Construção do HTML dos cards
    cardsHtml += filtered.map((item, index) => {
      // Regra da Categoria Capas: Exibir SOMENTE a imagem da capa em card individual, sem preço, descrição ou botões
      if (item.isCapa || item.category === 'capas') {
        const capaNumero = item.capaNum || (index + 1);
        const imgSrc = item.images[0];
        return `
          <article class="catalogo-card catalogo-capa-card" data-id="${item.id}" data-capa-num="${capaNumero}" data-capa-img="${imgSrc}" data-capa-title="Capa Modelo ${capaNumero}" role="button" tabindex="0" aria-label="Visualizar Capa Modelo ${capaNumero}">
            <div class="catalogo-card-media catalogo-capa-media">
              <img src="${imgSrc}" alt="Opção de Capa ${capaNumero} - Lalateliê" class="catalogo-card-img catalogo-capa-img" loading="lazy">
            </div>
          </article>
        `;
      }

      // Demais produtos normais do catálogo (cards completos)
      const badgeClass = item.badgeType === 'gold' ? 'gold' : (item.badgeType === 'sage' ? 'sage' : '');
      const productPageUrl = `produto.html?id=${encodeURIComponent(item.id)}&categoria=${encodeURIComponent(currentCategory)}`;

      return `
        <article class="catalogo-card" data-id="${item.id}" data-category="${item.category}" data-url="${productPageUrl}" role="link" tabindex="0" aria-label="Ver detalhes de ${item.title}">
          <div class="catalogo-card-media">
            ${item.badge ? `<span class="card-badge ${badgeClass}">${item.badge}</span>` : ''}
            <a href="${productPageUrl}" class="catalogo-card-img-link" aria-label="Visualizar produto ${item.title}" tabindex="-1">
              <img src="${item.images[0]}" alt="${item.title}" class="catalogo-card-img" loading="lazy">
            </a>
          </div>

          <div class="catalogo-card-body">
            <div class="card-body-top">
              <span class="card-category-tag">${item.categoryLabel || ''}${item.tag ? ` • ${item.tag}` : ''}</span>
              <h3 class="card-product-title">
                <a href="${productPageUrl}">${window.formatProductTitle ? window.formatProductTitle(item) : item.title}</a>
              </h3>
              <p class="card-product-desc">${item.desc || ''}</p>
            </div>

            <div class="card-footer-row ${(item.consultPrice || item.category === 'tags') ? 'card-footer-row-consult' : ''}">
              <div class="card-price-box ${(item.consultPrice || item.category === 'tags') ? 'card-price-box-consult' : ''}">
                ${(item.consultPrice || item.category === 'tags') 
                  ? (window.formatProductPrice ? window.formatProductPrice(item, { withLink: false }) : item.price)
                  : `<span class="price-value">${window.formatProductPrice ? window.formatProductPrice(item, { withLink: false }) : item.price}</span>`
                }
              </div>
              <button type="button" class="card-btn-action card-btn-plus btn-card-add-cart" data-product-id="${item.id}" aria-label="Adicionar ${item.title} ao carrinho" title="Adicionar ao carrinho">
                <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    productsGrid.innerHTML = cardsHtml;
    productsGrid.classList.toggle('grid-capas', currentCategory === 'capas');

    // Associa eventos de adicionar ao carrinho nos cards
    productsGrid.querySelectorAll('.btn-card-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pId = btn.getAttribute('data-product-id');
        if (window.LalatelieCart) {
          window.LalatelieCart.handleProductAddClick(pId);
        }
      });
    });

    // Aplica o modo de visualização ativo (grade ou lista)
    const isListMode = (currentViewMode === 'list' && currentCategory !== 'capas');
    productsGrid.classList.toggle('view-mode-list', isListMode);
    productsGrid.classList.toggle('view-mode-grid', !isListMode);

    // Oculta o seletor na categoria capas (pois é uma galeria exclusiva de imagens)
    if (catalogoViewToggle) {
      catalogoViewToggle.classList.toggle('is-hidden', currentCategory === 'capas');
    }

    // Suporte ao clique e teclado em todo o card de produtos normais
    const normalCards = productsGrid.querySelectorAll('.catalogo-card:not(.catalogo-capa-card)');
    normalCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        const url = card.getAttribute('data-url');
        if (url) {
          window.location.href = url;
        }
      });
      card.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) {
          e.preventDefault();
          const url = card.getAttribute('data-url');
          if (url) {
            window.location.href = url;
          }
        }
      });
    });

    attachCapaLightboxEvents();
  }

  // --------------------------------------------------------------------------
  // 5.1. ALTERNÂNCIA DE VISUALIZAÇÃO (GRADE / LISTA) COM LOCALSTORAGE
  // --------------------------------------------------------------------------
  function setViewMode(mode, save = true) {
    currentViewMode = (mode === 'list') ? 'list' : 'grid';

    if (save) {
      try {
        localStorage.setItem('lalatelie_catalogo_view_mode', currentViewMode);
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
    }

    if (productsGrid) {
      const isListMode = (currentViewMode === 'list' && currentCategory !== 'capas');
      productsGrid.classList.toggle('view-mode-list', isListMode);
      productsGrid.classList.toggle('view-mode-grid', !isListMode);
    }

    if (btnViewGrid && btnViewList) {
      const isGrid = currentViewMode === 'grid';
      btnViewGrid.classList.toggle('active', isGrid);
      btnViewGrid.setAttribute('aria-pressed', isGrid ? 'true' : 'false');

      btnViewList.classList.toggle('active', !isGrid);
      btnViewList.setAttribute('aria-pressed', !isGrid ? 'true' : 'false');
    }
  }

  if (btnViewGrid) {
    btnViewGrid.addEventListener('click', () => {
      if (currentViewMode !== 'grid') {
        setViewMode('grid', true);
      }
    });
  }

  if (btnViewList) {
    btnViewList.addEventListener('click', () => {
      if (currentViewMode !== 'list') {
        setViewMode('list', true);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5.1. LIGHTBOX PARA VISUALIZAÇÃO AMPLIADA DAS CAPAS (GALERIA NAVEGÁVEL)
  // --------------------------------------------------------------------------
  function attachCapaLightboxEvents() {
    const capaCards = Array.from(document.querySelectorAll('.catalogo-capa-card'));
    const lightbox = document.getElementById('capaLightbox');
    const lightboxImg = document.getElementById('capaLightboxImg');
    const lightboxTitle = document.getElementById('capaLightboxTitle');
    const lightboxCounter = document.getElementById('capaLightboxCounter');
    const lightboxClose = document.getElementById('capaLightboxClose');
    const lightboxPrev = document.getElementById('capaLightboxPrev');
    const lightboxNext = document.getElementById('capaLightboxNext');
    const lightboxMedia = document.getElementById('capaLightboxMedia');
    const btnAgenda = document.getElementById('lightboxBtnAgenda');

    if (!lightbox) return;

    let currentIndex = 0;
    let isTransitioning = false;

    // Lista de dados das capas exibidas
    const capasList = capaCards.map((card, i) => {
      const capaNum = card.getAttribute('data-capa-num') || String(i + 1);
      return {
        index: i,
        imgSrc: card.getAttribute('data-capa-img'),
        title: card.getAttribute('data-capa-title') || `Capa Modelo ${capaNum}`,
        capaNum: capaNum
      };
    });

    const total = capasList.length;

    function applyMetadata(item, index) {
      if (!item) return;
      if (lightboxTitle) lightboxTitle.textContent = item.title;
      if (lightboxCounter) {
        const displayIdx = String(index + 1).padStart(2, '0');
        const displayTotal = String(total).padStart(2, '0');
        lightboxCounter.textContent = `${displayIdx} / ${displayTotal}`;
      }
      const currentCapa = item.capaNum || String(index + 1);
      const modelBtns = lightbox.querySelectorAll('.btn-capa-model-choice');
      modelBtns.forEach(btn => {
        const modelId = btn.getAttribute('data-model') || 'agenda-master';
        btn.href = `produto.html?id=${modelId}&categoria=planners&capa=${encodeURIComponent(currentCapa)}`;
      });
      if (btnAgenda) {
        btnAgenda.href = `produto.html?id=agenda-master&categoria=planners&capa=${encodeURIComponent(currentCapa)}`;
      }
    }

    let activeIncomingImg = null;
    let transitionTimer = null;

    function cleanIncoming() {
      if (activeIncomingImg && activeIncomingImg.parentNode) {
        activeIncomingImg.parentNode.removeChild(activeIncomingImg);
      }
      activeIncomingImg = null;
      if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = null;
      }
    }

    function resetImageTransform(animated = true) {
      if (!lightboxImg) return;
      if (animated) {
        lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
      } else {
        lightboxImg.style.transition = 'none';
      }
      lightboxImg.style.transform = 'translate3d(0, 0, 0)';
      lightboxImg.style.opacity = '1';
      if (lightboxMedia) {
        lightboxMedia.classList.remove('is-dragging', 'is-zooming');
      }
    }

    // ------------------------------------------------------------------------
    // ANIMAÇÃO MODERNA E FLUIDA DE DESLIZAMENTO LATERAL CONTÍNUO (420ms)
    // ------------------------------------------------------------------------
    function slideTo(direction) {
      if (!lightbox.classList.contains('active') || isTransitioning || total <= 1) return;

      const nextIndex = (currentIndex + direction + total) % total;
      const nextItem = capasList[nextIndex];
      if (!nextItem || !lightboxImg || !lightboxMedia) return;

      isTransitioning = true;
      cleanIncoming();

      // Acessibilidade: respeita preferências de movimento reduzido
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        lightboxImg.style.transition = 'opacity 220ms ease';
        lightboxImg.style.opacity = '0.2';
        setTimeout(() => {
          currentIndex = nextIndex;
          applyMetadata(nextItem, currentIndex);
          lightboxImg.src = nextItem.imgSrc;
          lightboxImg.alt = `${nextItem.title} Ampliada - Lalateliê`;
          lightboxImg.style.opacity = '1';
          setTimeout(() => {
            isTransitioning = false;
          }, 80);
        }, 220);
        return;
      }

      // Cria a nova imagem que deslizará para dentro da área visível
      const incomingImg = document.createElement('img');
      incomingImg.className = 'capa-lightbox-img capa-slide-incoming';
      incomingImg.src = nextItem.imgSrc;
      incomingImg.alt = `${nextItem.title} Ampliada - Lalateliê`;
      incomingImg.draggable = false;

      // Define ponto de partida e destino coordenados:
      // Ao avançar (direction > 0): a próxima entra pela direita (100%) e a atual sai pela esquerda (-100%)
      // Ao voltar (direction < 0): a anterior entra pela esquerda (-100%) e a atual sai pela direita (100%)
      const inStartX = direction > 0 ? '100%' : '-100%';
      const outTargetX = direction > 0 ? '-100%' : '100%';

      incomingImg.style.transform = `translate3d(${inStartX}, 0, 0)`;
      incomingImg.style.opacity = '1';

      // Insere antes dos botões de controle para que as setas fiquem sobrepostas
      const firstNav = lightboxMedia.querySelector('.capa-lightbox-nav') || lightboxMedia.firstChild;
      lightboxMedia.insertBefore(incomingImg, firstNav);
      activeIncomingImg = incomingImg;

      // Força reflow para aplicar o estado inicial no navegador
      void incomingImg.offsetWidth;

      // Atualiza textos do cabeçalho/rodapé da modal
      applyMetadata(nextItem, nextIndex);

      // Inicia o deslizamento contínuo coordenado das duas imagens
      requestAnimationFrame(() => {
        lightboxImg.classList.add('is-sliding');
        incomingImg.classList.add('is-sliding');

        lightboxImg.style.transform = `translate3d(${outTargetX}, 0, 0)`;
        incomingImg.style.transform = 'translate3d(0, 0, 0)';
      });

      // Ao término da transição de 420ms, consolida a nova imagem no elemento principal
      transitionTimer = setTimeout(() => {
        lightboxImg.src = nextItem.imgSrc;
        lightboxImg.alt = `${nextItem.title} Ampliada - Lalateliê`;

        lightboxImg.classList.remove('is-sliding');
        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = 'translate3d(0, 0, 0)';
        lightboxImg.style.opacity = '1';

        cleanIncoming();
        currentIndex = nextIndex;
        isTransitioning = false;
      }, 430);
    }

    function openLightbox(index) {
      if (total === 0) return;
      cleanIncoming();
      currentIndex = (index + total) % total;
      const current = capasList[currentIndex];
      if (current && lightboxImg) {
        lightboxImg.src = current.imgSrc;
        lightboxImg.alt = `${current.title} Ampliada - Lalateliê`;
        lightboxImg.classList.remove('is-sliding');
        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = 'translate3d(0, 0, 0)';
        lightboxImg.style.opacity = '1';
        applyMetadata(current, currentIndex);
      }

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      isTransitioning = false;

      if (lightboxClose) {
        setTimeout(() => lightboxClose.focus(), 60);
      }
    }

    function closeLightbox() {
      cleanIncoming();
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      resetImageTransform(false);
      isTransitioning = false;
    }

    function navigate(direction) {
      slideTo(direction);
    }

    capaCards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        openLightbox(idx);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.onclick = (e) => {
        e.preventDefault();
        closeLightbox();
      };
    }

    if (lightboxPrev) {
      lightboxPrev.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        slideTo(-1);
      };
    }

    if (lightboxNext) {
      lightboxNext.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        slideTo(1);
      };
    }

    lightbox.onclick = (e) => {
      if (e.target === lightbox) {
        e.preventDefault();
        closeLightbox();
      }
    };

    // Suporte a teclado
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        slideTo(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        slideTo(1);
      }
    });

    // ------------------------------------------------------------------------
    // FUNÇÃO SWIPE (TOUCH + MOUSE DRAG COM INTEGRAÇÃO AO SLIDE CONTÍNUO)
    // ------------------------------------------------------------------------
    if (lightboxMedia && lightboxImg) {
      let isPointerDown = false;
      let isDragging = false;
      let hasDragged = false;
      let startX = 0;
      let startY = 0;
      let currentDeltaX = 0;

      function startDrag(clientX, clientY) {
        if (!lightbox.classList.contains('active') || isTransitioning) return;
        isPointerDown = true;
        hasDragged = false;
        startX = clientX;
        startY = clientY;
        currentDeltaX = 0;
        lightboxImg.style.transformOrigin = 'center center';
      }

      function moveDrag(clientX, clientY, e) {
        if (!isPointerDown) return;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        // Ativa modo drag quando o movimento horizontal predomina
        if (!hasDragged && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
          hasDragged = true;
          isDragging = true;
          lightboxMedia.classList.add('is-dragging');
        }

        if (isDragging) {
          if (e && e.cancelable) e.preventDefault();
          currentDeltaX = deltaX;

          const rotateDeg = deltaX * 0.035;
          const scaleRatio = Math.max(0.9, 1 - Math.abs(deltaX) * 0.0004);
          const opacityRatio = Math.max(0.65, 1 - Math.abs(deltaX) * 0.0018);

          lightboxImg.style.transition = 'none';
          lightboxImg.style.transform = `translate3d(${deltaX}px, 0, 0) rotate(${rotateDeg}deg) scale(${scaleRatio})`;
          lightboxImg.style.opacity = String(opacityRatio);
        }
      }

      function endDrag() {
        if (!isPointerDown) return;
        isPointerDown = false;

        const wasDragging = isDragging;
        isDragging = false;
        lightboxMedia.classList.remove('is-dragging');

        if (wasDragging && Math.abs(currentDeltaX) > 50) {
          // Swipe concluído: transiciona suavemente na direção do arraste
          const direction = currentDeltaX < 0 ? 1 : -1;
          slideTo(direction);
        } else {
          // Volta suavemente ao centro
          resetImageTransform(true);
        }

        currentDeltaX = 0;
        hasDragged = false;
      }

      // Touch Events (Mobile)
      lightboxMedia.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      lightboxMedia.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        moveDrag(e.touches[0].clientX, e.touches[0].clientY, e);
      }, { passive: false });

      lightboxMedia.addEventListener('touchend', endDrag, { passive: true });
      lightboxMedia.addEventListener('touchcancel', endDrag, { passive: true });

      // Mouse Drag Events (Desktop)
      lightboxMedia.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('.capa-lightbox-nav') || e.target.closest('.capa-lightbox-close')) return;
        startDrag(e.clientX, e.clientY);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isPointerDown) return;
        moveDrag(e.clientX, e.clientY, e);
      });

      window.addEventListener('mouseup', () => {
        if (isPointerDown) {
          endDrag();
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // 6. FILTROS POR CATEGORIA COM ATUALIZAÇÃO DA URL
  // --------------------------------------------------------------------------
  function setCategory(categoryKey, updateUrl = true) {
    currentCategory = categoryKey;

    filterPills.forEach(pill => {
      if (pill.getAttribute('data-category') === categoryKey) {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });

    if (updateUrl && window.history && window.history.replaceState) {
      const newUrl = new URL(window.location);
      if (categoryKey !== 'all') {
        newUrl.searchParams.set('categoria', categoryKey);
      } else {
        newUrl.searchParams.delete('categoria');
      }
      window.history.replaceState({}, '', newUrl);
    }

    renderProducts();
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-category');
      setCategory(cat, true);
    });
  });

  // --------------------------------------------------------------------------
  // 7. BUSCA EM TEMPO REAL
  // --------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        if (searchQuery.length > 0) {
          clearSearchBtn.classList.add('active');
        } else {
          clearSearchBtn.classList.remove('active');
        }
      }
      renderProducts();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.remove('active');
        renderProducts();
        searchInput.focus();
      }
    });
  }

  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      if (clearSearchBtn) clearSearchBtn.classList.remove('active');
      setCategory('all', true);
    });
  }

  // --------------------------------------------------------------------------
  // 8. ORDENAÇÃO
  // --------------------------------------------------------------------------
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // --------------------------------------------------------------------------
  // 9. CABEÇALHO SCROLL E MENU MOBILE MODERNO
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
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && mobileMenu.classList.contains('is-active')) {
        closeMobileNav();
      }
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 10. INICIALIZAÇÃO E TRATAMENTO DE PARÂMETROS DA URL
  // --------------------------------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const targetProduct = urlParams.get('produto') || urlParams.get('id');
  const targetCategory = urlParams.get('categoria') || urlParams.get('cat');

  // Se a URL veio com parâmetro de produto antigo (?produto=id), redireciona para a página dedicada
  if (targetProduct) {
    const redirectUrl = `produto.html?id=${encodeURIComponent(targetProduct)}${targetCategory ? `&categoria=${encodeURIComponent(targetCategory)}` : ''}`;
    window.location.replace(redirectUrl);
    return;
  }

  // Se veio com parâmetro de categoria (?categoria=capas, cadernos, etc), ativa a categoria correspondente
  let activeCategoryParam = targetCategory;
  if (activeCategoryParam === 'cadernos' || activeCategoryParam === 'caderno') activeCategoryParam = 'cadernos-personalizados';
  if (activeCategoryParam === 'agendas' || activeCategoryParam === 'agenda') activeCategoryParam = 'planners';
  if (activeCategoryParam === 'calendario') activeCategoryParam = 'calendarios';

  updateCategoryCounters();
  setViewMode(currentViewMode, false);

  if (activeCategoryParam && ['planners', 'cadernos-personalizados', 'calendarios', 'tags', 'capas'].includes(activeCategoryParam)) {
    setCategory(activeCategoryParam, false);

    // Scroll suave até a seção de produtos preservando o contexto de navegação
    setTimeout(() => {
      const produtosSection = document.querySelector('.catalogo-produtos');
      if (produtosSection) {
        produtosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  } else {
    renderProducts();
  }
});
