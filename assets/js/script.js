/**
 * ==============================================================================
 * LALATELIÊ - PAPELARIA AFETIVA & ARTESANAL
 * Script Principal (JavaScript Moderno ES6+ Modular & Otimizado)
 * 
 * Módulos:
 * 1. Header & Scrollspy (cabeçalho fixo com sombra e link ativo)
 * 2. Mobile Navbar (menu hambúrguer acessível com animação e bloqueio de scroll)
 * 3. Hero Carousel (slideshow automático responsivo com pausa inteligente)
 * 4. Products Carousel (carrossel de produtos com filtros de categoria e drag)
 * 5. Capas Showcase (grade de 16 cards visíveis, autoplay e paginação)
 * 6. Capas Lightbox (modal ampliado acessível com navegação por toque e teclado)
 * 7. Testimonials Carousel (carrossel horizontal infinito exclusivo para mobile)
 * 8. Budget Form (máscara de telefone, validação acessível e feedback)
 * 9. Section Header Reveal (animação suave de entrada dos títulos no scroll)
 * 10. Toast Notification (mensagens flutuantes de feedback)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ========================================================================
  // 1. MÓDULO: CABEÇALHO & SCROLLSPY
  // ========================================================================
  const HeaderModule = (() => {
    const siteHeader = document.getElementById('siteHeader');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id], header[id]');

    if (!siteHeader) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Adiciona classe scrolled para efeito de vidro / elevação
          if (window.scrollY > 40) {
            siteHeader.classList.add('scrolled');
          } else {
            siteHeader.classList.remove('scrolled');
          }

          // Scrollspy: destaca o link ativo conforme a seção no viewport
          let currentSectionId = '';
          const scrollPosition = window.scrollY + 140;

          sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              currentSectionId = section.getAttribute('id');
            }
          });

          if (currentSectionId) {
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href === `#${currentSectionId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              } else if (href && href.startsWith('#')) {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
              }
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  // ========================================================================
  // 2. MÓDULO: MENU MOBILE (NAVBAR HAMBÚRGUER MODERNA & ACESSÍVEL)
  // ========================================================================
  const MobileNavModule = (() => {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileBackdrop = document.getElementById('mobileMenuBackdrop');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-menu-cta a');

    if (!mobileToggle || !mobileMenu) return;

    function isMenuOpen() {
      return mobileMenu.classList.contains('open');
    }

    function openMenu() {
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileToggle.setAttribute('aria-label', 'Fechar menu de navegação');
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');

      if (mobileBackdrop) {
        mobileBackdrop.classList.add('active');
        mobileBackdrop.setAttribute('aria-hidden', 'false');
      }

      document.body.classList.add('menu-open');

      // Foca o primeiro link para acessibilidade
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    }

    function closeMenu() {
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Abrir menu de navegação');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');

      if (mobileBackdrop) {
        mobileBackdrop.classList.remove('active');
        mobileBackdrop.setAttribute('aria-hidden', 'true');
      }

      document.body.classList.remove('menu-open');
    }

    function toggleMenu() {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Clique no botão hambúrguer
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Clique no backdrop fecha o menu
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMenu);
    }

    // Clique em qualquer link do menu móvel fecha o menu
    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Teclado: Escape fecha o menu móvel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen()) {
        closeMenu();
        mobileToggle.focus();
      }
    });

    // Fecha o menu caso a tela seja redimensionada para desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && isMenuOpen()) {
        closeMenu();
      }
    });

    return { open: openMenu, close: closeMenu, toggle: toggleMenu };
  })();

  // ========================================================================
  // 3. MÓDULO: HERO CAROUSEL (SLIDESHOW AUTOMÁTICO RESPONSIVO)
  // ========================================================================
  const HeroCarouselModule = (() => {
    const heroSection = document.getElementById('hero');
    const track = document.getElementById('heroCarouselTrack');

    if (!heroSection || !track) return;

    let slideElements = Array.from(track.querySelectorAll('.hero-slide'));
    const totalSlides = slideElements.length;
    if (totalSlides <= 1) return;

    const INTERVAL_MS = 4500;
    let currentIndex = 0;
    let timer = null;
    let isPaused = false;

    function goToSlide(nextIndex) {
      if (slideElements[currentIndex]) {
        slideElements[currentIndex].classList.remove('active');
        slideElements[currentIndex].setAttribute('aria-hidden', 'true');
      }

      currentIndex = (nextIndex + totalSlides) % totalSlides;

      if (slideElements[currentIndex]) {
        slideElements[currentIndex].classList.add('active');
        slideElements[currentIndex].setAttribute('aria-hidden', 'false');
      }
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(() => {
        if (!isPaused) {
          goToSlide(currentIndex + 1);
        }
      }, INTERVAL_MS);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Pausa quando a aba estiver em segundo plano
    document.addEventListener('visibilitychange', () => {
      isPaused = document.visibilityState === 'hidden';
    });

    // Pausa quando a seção Hero sair do viewport (IntersectionObserver)
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isPaused = !entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      heroObserver.observe(heroSection);
    }

    startTimer();
  })();

  // ========================================================================
  // 4. MÓDULO: GRADE DINÂMICA DE PRODUTOS DA HOME (ATUALIZAÇÃO AUTOMÁTICA)
  // ========================================================================
  const HomeProductsGridModule = (() => {
    const grid = document.getElementById('homeProductsGrid');
    const btnVerMais = document.getElementById('btnVerMaisProdutos');
    if (!grid) return;

    // Quantidade padrão de cards exibidos antes do botão "Ver mais produtos"
    const INITIAL_VISIBLE_COUNT = 6;

    // Conecta eventos de clique e teclado nos cards para navegação acessível
    function attachCardEvents(card) {
      if (card.dataset.hasAttachedEvents) return;
      card.dataset.hasAttachedEvents = 'true';

      card.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        const url = card.getAttribute('data-url');
        if (url) {
          window.location.href = url;
        }
      });

      card.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a') && !e.target.closest('button')) {
          e.preventDefault();
          const url = card.getAttribute('data-url');
          if (url) {
            window.location.href = url;
          }
        }
      });
    }

    // Renderiza dinamicamente os cards de produtos com base em window.PRODUTOS_LALATELIE
    function renderHomeProducts() {
      const produtos = Array.isArray(window.PRODUTOS_LALATELIE) ? window.PRODUTOS_LALATELIE : [];

      // Filtra produtos válidos: apenas produtos ativos, com título e que não sejam capas avulsas
      const validProducts = produtos.filter((prod) => {
        if (!prod || !prod.title) return false;
        if (prod.isCapa || prod.category === 'capas') return false;
        if (prod.active === false) return false;
        return true;
      });

      // Ordem prioritária das categorias para vitrine da Home
      const CATEGORY_ORDER = {
        'planners': 1,
        'agendas': 1,
        'cadernos-personalizados': 2,
        'cadernos': 2,
        'calendarios': 3,
        'tags': 4
      };

      // Ordenação: respeita campo 'order' / 'homeOrder' ou categorização oficial + popularidade
      const sortedProducts = [...validProducts].sort((a, b) => {
        const orderA = a.homeOrder ?? a.order;
        const orderB = b.homeOrder ?? b.order;
        if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
        if (orderA !== undefined) return -1;
        if (orderB !== undefined) return 1;

        const catA = CATEGORY_ORDER[a.category] || 99;
        const catB = CATEGORY_ORDER[b.category] || 99;
        if (catA !== catB) return catA - catB;

        return (b.popularity || 0) - (a.popularity || 0);
      });

      if (sortedProducts.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; color: var(--color-text-muted); padding: 40px 0;">Nenhum produto cadastrado no momento.</p>';
        if (btnVerMais) btnVerMais.style.display = 'none';
        return;
      }

      // Constrói os cards dinamicamente
      const cardsHtml = sortedProducts.map((prod, index) => {
        const isExtra = index >= INITIAL_VISIBLE_COUNT;
        const extraClass = isExtra ? ' card-extra' : '';
        const badgeClass = prod.badgeType === 'gold' ? 'gold' : (prod.badgeType === 'sage' ? 'sage' : (prod.badgeType || 'gold'));
        const productUrl = prod.url || `produto.html?id=${encodeURIComponent(prod.id)}&categoria=${encodeURIComponent(prod.category)}`;
        const imgSrc = (prod.images && prod.images.length > 0) ? prod.images[0] : 'assets/images/logo/logo.png';
        const imgAlt = prod.alt || `${prod.title} - Lalateliê`;
        const tagText = `${prod.categoryLabel || 'Artesanal'}${prod.tag ? ' • ' + prod.tag : ''}`;
        const priceText = prod.price || 'Sob Consulta';
        const descText = prod.desc || '';

        return `
          <article class="catalogo-card${extraClass}" data-id="${prod.id}" data-category="${prod.category}" data-url="${productUrl}" role="link" tabindex="0" aria-label="Ver detalhes de ${prod.title}">
            <div class="catalogo-card-media">
              ${prod.badge ? `<span class="card-badge ${badgeClass}">${prod.badge}</span>` : ''}
              <a href="${productUrl}" class="catalogo-card-img-link" aria-label="Visualizar produto ${prod.title}" tabindex="-1">
                <img src="${imgSrc}" alt="${imgAlt}" class="catalogo-card-img" loading="lazy" onerror="this.onerror=null;this.src='assets/images/logo/logo.png';">
              </a>
            </div>
            <div class="catalogo-card-body">
              <div class="card-body-top">
                <span class="card-category-tag">${tagText}</span>
                <h3 class="card-product-title">
                  <a href="${productUrl}">${window.formatProductTitle ? window.formatProductTitle(prod) : prod.title}</a>
                </h3>
                <p class="card-product-desc">${descText}</p>
              </div>
              <div class="card-footer-row ${(prod.consultPrice || prod.category === 'tags') ? 'card-footer-row-consult' : ''}">
                <div class="card-price-box ${(prod.consultPrice || prod.category === 'tags') ? 'card-price-box-consult' : ''}">
                  ${(prod.consultPrice || prod.category === 'tags')
                    ? (window.formatProductPrice ? window.formatProductPrice(prod, { withLink: false }) : priceText)
                    : `<span class="price-value">${window.formatProductPrice ? window.formatProductPrice(prod, { withLink: false }) : priceText}</span>`
                  }
                </div>
                <a href="${productUrl}" class="card-btn-action card-btn-plus" aria-label="Ver detalhes e pedir ${prod.title}" title="Ver detalhes do produto">
                  <i class="fa-solid fa-plus" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </article>
        `;
      }).join('');

      grid.innerHTML = cardsHtml;
      grid.querySelectorAll('.catalogo-card').forEach(attachCardEvents);

      // Gerencia visibilidade e texto do botão "Ver mais produtos"
      if (btnVerMais) {
        if (sortedProducts.length <= INITIAL_VISIBLE_COUNT) {
          btnVerMais.style.display = 'none';
        } else {
          btnVerMais.style.display = 'inline-flex';
          const remainingCount = sortedProducts.length - INITIAL_VISIBLE_COUNT;
          const textSpan = btnVerMais.querySelector('.btn-text');
          if (textSpan && !grid.classList.contains('is-expanded')) {
            textSpan.textContent = `Ver mais produtos (${remainingCount})`;
          }
        }
      }
    }

    // Configura evento de clique para alternar expansão ("Ver mais / Ver menos")
    if (btnVerMais) {
      btnVerMais.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = grid.classList.toggle('is-expanded');
        btnVerMais.classList.toggle('is-expanded', isExpanded);
        btnVerMais.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

        const textSpan = btnVerMais.querySelector('.btn-text');
        const icon = btnVerMais.querySelector('.btn-icon');
        const totalProducts = grid.querySelectorAll('.catalogo-card').length;
        const remainingCount = Math.max(0, totalProducts - INITIAL_VISIBLE_COUNT);

        if (isExpanded) {
          if (textSpan) textSpan.textContent = 'Ver menos produtos';
          if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
          }
        } else {
          if (textSpan) textSpan.textContent = remainingCount > 0 ? `Ver mais produtos (${remainingCount})` : 'Ver mais produtos';
          if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
          }

          // Ao recolher, rola suavemente para o topo da seção de produtos
          const produtosSec = document.getElementById('produtos');
          if (produtosSec) {
            produtosSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }

    // Renderiza os produtos inicialmente
    renderHomeProducts();

    // Exporta globalmente para permitir re-renderização dinâmica em runtime
    window.renderHomeProducts = renderHomeProducts;

    return {
      render: renderHomeProducts
    };
  })();

  // ========================================================================
  // 5. MÓDULO: MOSTRUÁRIO DE CAPAS & LIGHTBOX DE CAPAS
  // ========================================================================
  const CapasModule = (() => {
    const grid = document.getElementById('capasGrid16');
    const wrapper = document.getElementById('capasCarouselWrapper');
    const counterText = document.getElementById('capasCounterText');
    const footerPrevBtn = document.getElementById('capasFooterPrevBtn');
    const footerNextBtn = document.getElementById('capasFooterNextBtn');
    const footerIndicator = document.getElementById('capasFooterIndicator');

    // Elementos do Lightbox
    const lightbox = document.getElementById('capaLightbox');
    const lightboxImg = document.getElementById('capaLightboxImg');
    const lightboxTitle = document.getElementById('capaLightboxTitle');
    const lightboxCounter = document.getElementById('capaLightboxCounter');
    const lightboxClose = document.getElementById('capaLightboxClose');
    const lightboxPrev = document.getElementById('capaLightboxPrev');
    const lightboxNext = document.getElementById('capaLightboxNext');
    const lightboxMedia = document.getElementById('capaLightboxMedia');
    const lightboxBtnAgenda = document.getElementById('lightboxBtnAgenda');

    if (!grid || !wrapper) return;

    const CARDS_VISIBLE = 16;
    let capasPool = [];

    // Carrega capas de window.PRODUTOS_LALATELIE
    if (window.PRODUTOS_LALATELIE && Array.isArray(window.PRODUTOS_LALATELIE)) {
      const capasItems = window.PRODUTOS_LALATELIE.filter((p) => p.category === 'capas' || p.isCapa);
      if (capasItems.length > 0) {
        capasItems.sort((a, b) => (a.capaNum || 0) - (b.capaNum || 0));
        capasPool = capasItems.map((item) => item.images[0]);
      }
    }

    if (capasPool.length === 0) {
      for (let i = 1; i <= 34; i++) {
        capasPool.push(`assets/images/produtos/capas/capas${i}.jpg`);
      }
    }

    let currentPage = 0;
    const getTotalPages = () => Math.max(1, Math.ceil(capasPool.length / CARDS_VISIBLE));

    // Inicializa 16 slots fixos no DOM
    grid.innerHTML = '';
    const slotCards = [];

    for (let i = 0; i < CARDS_VISIBLE; i++) {
      const card = document.createElement('article');
      card.className = 'catalogo-card catalogo-capa-card capa-slot-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      const mediaDiv = document.createElement('div');
      mediaDiv.className = 'catalogo-card-media catalogo-capa-media capa-slot-media';

      const slotImg = document.createElement('img');
      slotImg.className = 'catalogo-card-img catalogo-capa-img capa-slot-img';
      slotImg.loading = i < 8 ? 'eager' : 'lazy';
      slotImg.draggable = false;

      mediaDiv.appendChild(slotImg);
      card.appendChild(mediaDiv);
      grid.appendChild(card);

      slotCards.push({ card, img: slotImg });
    }

    function updateSlotsContent(animate = true) {
      const total = capasPool.length;
      if (total === 0) return;

      const totalPages = getTotalPages();
      currentPage = ((currentPage % totalPages) + totalPages) % totalPages;

      const startIndex = currentPage * CARDS_VISIBLE;
      const startNum = startIndex + 1;
      const endNum = Math.min(startIndex + CARDS_VISIBLE, total);

      if (counterText) {
        counterText.innerHTML = `Exibindo capas <strong>${startNum} a ${endNum}</strong> de ${total}`;
      }

      if (footerIndicator) {
        footerIndicator.textContent = `Capas ${startNum} a ${endNum} de ${total} (Página ${currentPage + 1} de ${totalPages})`;
      }

      const applyData = () => {
        slotCards.forEach((slot, slotIdx) => {
          const capaIndex = (startIndex + slotIdx) % total;
          const capaSrc = capasPool[capaIndex];
          const match = capaSrc.match(/capas(\d+)\.jpg/i);
          const capaNum = match ? match[1] : (capaIndex + 1);
          const capaTitle = `Capa Modelo ${capaNum}`;

          slot.card.setAttribute('data-id', `capa-${capaNum}`);
          slot.card.setAttribute('data-capa-num', capaNum);
          slot.card.setAttribute('data-capa-img', capaSrc);
          slot.card.setAttribute('data-capa-title', capaTitle);
          slot.card.setAttribute('aria-label', `Visualizar ${capaTitle}`);

          slot.img.src = capaSrc;
          slot.img.alt = `Opção de Capa ${capaNum} - Lalateliê`;

          slot.card.onclick = (e) => {
            e.preventDefault();
            openLightbox(capaIndex);
          };

          slot.card.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openLightbox(capaIndex);
            }
          };
        });
      };

      if (animate) {
        grid.classList.add('is-updating');
        setTimeout(() => {
          applyData();
          grid.classList.remove('is-updating');
        }, 160);
      } else {
        applyData();
      }
    }

    function goToPage(pageIdx, animate = true) {
      currentPage = pageIdx;
      updateSlotsContent(animate);
    }

    function nextPage() {
      goToPage(currentPage + 1, true);
    }

    function prevPage() {
      goToPage(currentPage - 1, true);
    }

    // Autoplay
    const AUTOPLAY_INTERVAL = 5500;
    let autoplayTimer = null;
    let resumeTimeout = null;

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(nextPage, AUTOPLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function pauseTemporarily(ms = 7000) {
      stopAutoplay();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAutoplay, ms);
    }

    wrapper.addEventListener('mouseenter', stopAutoplay);
    wrapper.addEventListener('mouseleave', () => pauseTemporarily(4000));

    if (footerPrevBtn) {
      footerPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevPage();
        pauseTemporarily(7000);
      });
    }

    if (footerNextBtn) {
      footerNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextPage();
        pauseTemporarily(7000);
      });
    }

    // Touch Swipe na grade de capas
    let touchStartX = 0;
    let touchStartY = 0;
    wrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
          if (deltaX < 0) {
            nextPage();
          } else {
            prevPage();
          }
          pauseTemporarily(7000);
        }
      }
    }, { passive: true });

    // Lightbox de Capas
    let lightboxCurrentIndex = 0;
    let isLightboxTransitioning = false;

    function getCapaData(index) {
      const total = capasPool.length;
      if (total === 0) return null;
      const normalizedIdx = (index + total) % total;
      const src = capasPool[normalizedIdx] || '';
      const match = src.match(/capas(\d+)\.jpg/i);
      const capaNum = match ? match[1] : (normalizedIdx + 1);
      return {
        index: normalizedIdx,
        imgSrc: src,
        title: `Capa Modelo ${capaNum}`,
        capaNum: capaNum
      };
    }

    let activeIncomingImg = null;
    let transitionTimer = null;

    function applyLightboxMetadata(item, index) {
      if (!item) return;
      if (lightboxTitle) lightboxTitle.textContent = item.title;
      if (lightboxCounter) {
        const displayIdx = String(index + 1).padStart(2, '0');
        const displayTotal = String(capasPool.length).padStart(2, '0');
        lightboxCounter.textContent = `${displayIdx} / ${displayTotal}`;
      }
      const currentCapa = item.capaNum || String(index + 1);
      const modelBtns = document.querySelectorAll('#capaLightbox .btn-capa-model-choice');
      modelBtns.forEach(btn => {
        const modelId = btn.getAttribute('data-model') || 'agenda-master';
        btn.href = `produto.html?id=${modelId}&categoria=planners&capa=${encodeURIComponent(currentCapa)}`;
      });
      if (lightboxBtnAgenda) {
        lightboxBtnAgenda.href = `produto.html?id=agenda-master&categoria=planners&capa=${encodeURIComponent(currentCapa)}`;
      }
    }

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

    function resetLightboxImgTransform(animated = true) {
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
    function slideLightboxTo(direction) {
      if (!lightbox || !lightbox.classList.contains('active') || isLightboxTransitioning) return;
      const total = capasPool.length;
      if (total <= 1 || !lightboxImg || !lightboxMedia) return;

      const nextIndex = (lightboxCurrentIndex + direction + total) % total;
      const nextItem = getCapaData(nextIndex);
      if (!nextItem) return;

      isLightboxTransitioning = true;
      cleanIncoming();

      // Acessibilidade: respeita preferências de movimento reduzido
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        lightboxImg.style.transition = 'opacity 220ms ease';
        lightboxImg.style.opacity = '0.2';
        setTimeout(() => {
          lightboxCurrentIndex = nextIndex;
          applyLightboxMetadata(nextItem, lightboxCurrentIndex);
          lightboxImg.src = nextItem.imgSrc;
          lightboxImg.alt = `${nextItem.title} Ampliada - Lalateliê`;
          lightboxImg.style.opacity = '1';
          setTimeout(() => {
            isLightboxTransitioning = false;
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

      // Ponto de partida e destino coordenados
      const inStartX = direction > 0 ? '100%' : '-100%';
      const outTargetX = direction > 0 ? '-100%' : '100%';

      incomingImg.style.transform = `translate3d(${inStartX}, 0, 0)`;
      incomingImg.style.opacity = '1';

      // Insere antes dos controles de navegação
      const firstNav = lightboxMedia.querySelector('.capa-lightbox-nav') || lightboxMedia.firstChild;
      lightboxMedia.insertBefore(incomingImg, firstNav);
      activeIncomingImg = incomingImg;

      // Força recálculo do layout no navegador
      void incomingImg.offsetWidth;

      // Atualiza textos da modal
      applyLightboxMetadata(nextItem, nextIndex);

      // Inicia deslizamento contínuo coordenado de ambas as imagens
      requestAnimationFrame(() => {
        lightboxImg.classList.add('is-sliding');
        incomingImg.classList.add('is-sliding');

        lightboxImg.style.transform = `translate3d(${outTargetX}, 0, 0)`;
        incomingImg.style.transform = 'translate3d(0, 0, 0)';
      });

      // Consolida nova imagem ao fim da animação de 420ms
      transitionTimer = setTimeout(() => {
        lightboxImg.src = nextItem.imgSrc;
        lightboxImg.alt = `${nextItem.title} Ampliada - Lalateliê`;

        lightboxImg.classList.remove('is-sliding');
        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = 'translate3d(0, 0, 0)';
        lightboxImg.style.opacity = '1';

        cleanIncoming();
        lightboxCurrentIndex = nextIndex;
        isLightboxTransitioning = false;
      }, 430);
    }

    function openLightbox(index) {
      if (!lightbox) return;
      const total = capasPool.length;
      if (total === 0) return;
      cleanIncoming();
      lightboxCurrentIndex = (index + total) % total;
      const current = getCapaData(lightboxCurrentIndex);
      if (current && lightboxImg) {
        lightboxImg.src = current.imgSrc;
        lightboxImg.alt = `${current.title} Ampliada - Lalateliê`;
        lightboxImg.classList.remove('is-sliding');
        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = 'translate3d(0, 0, 0)';
        lightboxImg.style.opacity = '1';
        applyLightboxMetadata(current, lightboxCurrentIndex);
      }

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      isLightboxTransitioning = false;

      pauseTemporarily(60000);
      if (lightboxClose) setTimeout(() => lightboxClose.focus(), 60);
    }

    function closeLightbox() {
      if (!lightbox) return;
      cleanIncoming();
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      resetLightboxImgTransform(false);
      isLightboxTransitioning = false;
      pauseTemporarily(4500);
    }

    function navigateLightbox(dir) {
      slideLightboxTo(dir);
    }

    if (lightbox) {
      if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
      if (lightboxPrev) lightboxPrev.addEventListener('click', () => slideLightboxTo(-1));
      if (lightboxNext) lightboxNext.addEventListener('click', () => slideLightboxTo(1));

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });

      window.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') slideLightboxTo(-1);
        else if (e.key === 'ArrowRight') slideLightboxTo(1);
      });

      // ------------------------------------------------------------------------
      // RECURSO SWIPE (TOUCH + MOUSE DRAG COM INTEGRAÇÃO AO SLIDE CONTÍNUO)
      // ------------------------------------------------------------------------
      if (lightboxMedia && lightboxImg) {
        let isPointerDown = false;
        let isDragging = false;
        let hasDragged = false;
        let startX = 0;
        let startY = 0;
        let currentDeltaX = 0;

        function startDrag(clientX, clientY) {
          if (!lightbox.classList.contains('active') || isLightboxTransitioning) return;
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
            const direction = currentDeltaX < 0 ? 1 : -1;
            slideLightboxTo(direction);
          } else {
            resetLightboxImgTransform(true);
          }

          currentDeltaX = 0;
          hasDragged = false;
        }

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
          if (isPointerDown) endDrag();
        });
      }
    }

    updateSlotsContent(false);
    startAutoplay();
  })();

  // ========================================================================
  // 6. MÓDULO: CARROSSEL DE DEPOIMENTOS EXCLUSIVO PARA MOBILE
  // ========================================================================
  const TestimonialsCarouselModule = (() => {
    const wrapper = document.getElementById('testimonialsCarouselWrapper');
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialPrevBtn');
    const nextBtn = document.getElementById('testimonialNextBtn');
    const dotsContainer = document.getElementById('testimonialsDots');

    if (!wrapper || !track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const totalSlides = cards.length;
    if (totalSlides <= 1) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    let isTouchActive = false;
    let touchStartX = 0;
    let touchDiffX = 0;
    const AUTOPLAY_INTERVAL = 4500;

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonial-dot') : [];

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function updateDots() {
      dots.forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function goToSlide(index, animate = true) {
      if (!isMobile()) {
        track.style.transform = '';
        return;
      }

      if (index >= totalSlides) {
        currentIndex = 0;
      } else if (index < 0) {
        currentIndex = totalSlides - 1;
      } else {
        currentIndex = index;
      }

      track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots();
    }

    function startAutoplay() {
      stopAutoplay();
      if (!isMobile()) return;

      autoplayTimer = setInterval(() => {
        if (!isTouchActive) {
          goToSlide(currentIndex + 1);
        }
      }, AUTOPLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentIndex - 1);
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentIndex + 1);
        resetAutoplay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
        resetAutoplay();
      });
    });

    wrapper.addEventListener('touchstart', (e) => {
      if (!isMobile() || e.touches.length === 0) return;
      isTouchActive = true;
      touchStartX = e.touches[0].clientX;
      touchDiffX = 0;
      stopAutoplay();
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      if (!isTouchActive || e.touches.length === 0) return;
      touchDiffX = e.touches[0].clientX - touchStartX;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
      if (!isTouchActive) return;
      isTouchActive = false;

      if (touchDiffX < -40) {
        goToSlide(currentIndex + 1);
      } else if (touchDiffX > 40) {
        goToSlide(currentIndex - 1);
      }
      startAutoplay();
    });

    wrapper.addEventListener('mouseenter', stopAutoplay);
    wrapper.addEventListener('mouseleave', startAutoplay);

    window.addEventListener('resize', () => {
      if (isMobile()) {
        goToSlide(currentIndex, false);
        startAutoplay();
      } else {
        stopAutoplay();
        track.style.transform = '';
      }
    });

    if (isMobile()) {
      goToSlide(0, false);
      startAutoplay();
    }
  })();

  // ========================================================================
  // 7. MÓDULO: FORMULÁRIO DE CONTATO & ORÇAMENTO (ENVIO SEGURO DE E-MAILS)
  // ========================================================================
  const BudgetFormModule = (() => {
    const budgetForm = document.getElementById('budgetForm');
    if (!budgetForm) return;

    // Configuração do serviço de entrega de e-mails para a Lalateliê
    const EMAIL_CONFIG = {
      recipient: 'personalizadoslalatelie@gmail.com',
      endpoint: 'https://formsubmit.co/ajax/personalizadoslalatelie@gmail.com',
      requestTimeoutMs: 15000
    };

    // Campos do formulário
    const nameInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');
    const phoneInput = document.getElementById('clientPhone');
    const subjectInput = document.getElementById('clientSubject');
    const productInput = document.getElementById('productSelect');
    const quantityInput = document.getElementById('itemQuantity');
    const customTypeInput = document.getElementById('customType');
    const messageInput = document.getElementById('clientMessage');
    const pdfCatalogOpt = document.getElementById('pdfCatalogOpt');
    const honeyInput = document.getElementById('formHoney');

    // Elementos de status e botões
    const formErrorAlert = document.getElementById('formErrorAlert');
    const formErrorText = document.getElementById('formErrorText');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetFormBtn');

    // Máscara dinâmica de telefone / WhatsApp
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 6) {
          e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
          e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
          e.target.value = `(${value}`;
        } else {
          e.target.value = '';
        }
      });
    }

    function validateField(inputElement, errorElement, isValid) {
      const formGroup = inputElement?.closest('.form-group');
      if (!formGroup) return false;

      if (!isValid) {
        formGroup.classList.add('has-error');
        inputElement.setAttribute('aria-invalid', 'true');
        return false;
      } else {
        formGroup.classList.remove('has-error');
        inputElement.setAttribute('aria-invalid', 'false');
        return true;
      }
    }

    // Limpeza imediata do aviso de erro ao interagir com o campo
    [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach((input) => {
      if (!input) return;
      input.addEventListener('input', () => {
        const formGroup = input.closest('.form-group');
        if (formGroup && formGroup.classList.contains('has-error')) {
          formGroup.classList.remove('has-error');
          input.setAttribute('aria-invalid', 'false');
        }
        if (formErrorAlert && formErrorAlert.style.display !== 'none') {
          formErrorAlert.style.display = 'none';
        }
      });
    });

    // Regex RFC-compatível para validação de e-mail do cliente
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    budgetForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (formErrorAlert) formErrorAlert.style.display = 'none';

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const phoneDigits = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
      const subjectVal = subjectInput ? subjectInput.value.trim() : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';

      const isNameValid = validateField(
        nameInput,
        document.getElementById('nameError'),
        nameVal.length >= 3
      );

      const isEmailValid = validateField(
        emailInput,
        document.getElementById('emailError'),
        emailRegex.test(emailVal)
      );

      const isPhoneValid = validateField(
        phoneInput,
        document.getElementById('phoneError'),
        phoneDigits.length >= 10
      );

      const isSubjectValid = validateField(
        subjectInput,
        document.getElementById('subjectError'),
        subjectVal.length >= 3
      );

      const isMessageValid = validateField(
        messageInput,
        document.getElementById('messageError'),
        messageVal.length >= 10
      );

      const isFormValid = isNameValid && isEmailValid && isPhoneValid && isSubjectValid && isMessageValid;

      if (!isFormValid) {
        const firstError = budgetForm.querySelector('.form-group.has-error input, .form-group.has-error textarea');
        if (firstError) {
          firstError.focus();
        }
        showToast('Por favor, preencha todos os campos obrigatórios corretamente.', 4000, 'error');
        return;
      }

      // Proteção Honeypot Anti-Spam: se preenchido por robôs maliciosos, simula sucesso silencioso
      if (honeyInput && honeyInput.value.trim() !== '') {
        budgetForm.reset();
        budgetForm.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('show');
        return;
      }

      // Bloquear novos cliques e exibir feedback de carregamento
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> <span>Enviando mensagem...</span>`;

      // Desabilita controles temporariamente para evitar alterações durante o envio
      const formControls = budgetForm.querySelectorAll('input, select, textarea');
      formControls.forEach((el) => { el.disabled = true; });

      // Assunto estruturado com o nome do cliente em Português
      const emailSubject = nameVal
        ? `Novo contato pelo site - ${nameVal} | Papelaria Personalizada Lalatelie`
        : `Novo contato pelo site | Papelaria Personalizada Lalatelie`;

      // Data e hora de envio em português brasileiro (fuso horário de Brasília)
      const dataEnvioFormatada = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo'
      }).format(new Date());

      // Mensagem de confirmação automática (Auto-response) em português para o cliente
      const autoResponseMessage = `Olá! Agradecemos por entrar em contato com a Papelaria Personalizada Lalatelie.\n\nRecebemos sua mensagem com sucesso e agradecemos pelo interesse em nossos produtos personalizados.\n\nNossa equipe analisará sua solicitação e retornará assim que possível.\n\nAtenciosamente,\nEquipe Lalatelie\nPapelaria Personalizada`;

      // Dados estruturados para o serviço de e-mail (FormSubmit)
      // As chaves sem '_' definem exatamente os títulos exibidos na tabela do e-mail recebido
      const payload = {
        // Metadados de controle do serviço FormSubmit
        email: emailVal, // Necessário para direcionar a auto-resposta ao cliente
        _replyto: emailVal, // Configura o Reply-To diretamente para o e-mail do cliente
        _subject: emailSubject,
        _template: 'table', // Gera o e-mail formatado em tabela limpa e elegante
        _captcha: 'false',  // Retorna resposta limpa via AJAX JSON
        _honey: '',         // Campo honeypot anti-spam
        _autoresponse: autoResponseMessage, // Envia resposta automática ao cliente

        // Linhas da tabela identificadas 100% em português brasileiro
        'Nome do cliente': nameVal,
        'E-mail para resposta': emailVal,
        'Telefone ou WhatsApp': phoneInput ? phoneInput.value.trim() : 'Não informado',
        'Tipo de personalização desejado': customTypeInput && customTypeInput.value ? customTypeInput.value : 'Não informado',
        'Produto de interesse': productInput && productInput.value ? productInput.value : 'Não informado',
        'Quantidade estimada': quantityInput && quantityInput.value ? quantityInput.value : '1',
        'Assunto': subjectVal,
        'Mensagem enviada': messageVal,
        'Data do envio': dataEnvioFormatada
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), EMAIL_CONFIG.requestTimeoutMs);

      try {
        const response = await fetch(EMAIL_CONFIG.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        let data = null;
        try {
          data = await response.json();
        } catch {
          // Caso a resposta não seja JSON puro
        }

        const isSuccess = response.ok && (!data || data.success === 'true' || data.success === true || response.status === 200);

        if (isSuccess) {
          formControls.forEach((el) => { el.disabled = false; });
          budgetForm.reset();
          budgetForm.style.display = 'none';

          if (formSuccess) {
            formSuccess.classList.add('show');
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
          submitBtn.innerHTML = originalBtnHTML;

          showToast('Mensagem enviada com sucesso! Entraremos em contato em breve.', 4500, 'success');
        } else {
          const errorMsg = (data && data.message) ? data.message : 'Falha no processamento pelo servidor de e-mail.';
          throw new Error(errorMsg);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Erro no envio da mensagem de contato:', error);

        // Reabilitar controles e botão SEM apagar o que o cliente digitou
        formControls.forEach((el) => { el.disabled = false; });
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.innerHTML = originalBtnHTML;

        // Exibir alerta claro no topo do formulário
        if (formErrorAlert) {
          if (formErrorText) {
            if (error.name === 'AbortError') {
              formErrorText.textContent = 'Tempo limite de resposta excedido. Verifique sua conexão e tente novamente.';
            } else {
              formErrorText.textContent = 'Não conseguimos entregar sua mensagem no momento. Por favor, tente novamente ou fale conosco via WhatsApp.';
            }
          }
          formErrorAlert.style.display = 'flex';
          formErrorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        showToast('Não foi possível enviar sua mensagem. Tente novamente.', 5000, 'error');
      }
    });

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        budgetForm.reset();
        budgetForm.style.display = 'block';
        if (formSuccess) formSuccess.classList.remove('show');
        if (formErrorAlert) formErrorAlert.style.display = 'none';
        budgetForm.querySelectorAll('.form-group').forEach((g) => {
          g.classList.remove('has-error');
        });
        budgetForm.querySelectorAll('input, select, textarea').forEach((el) => {
          el.setAttribute('aria-invalid', 'false');
          el.disabled = false;
        });
        if (nameInput) nameInput.focus();
      });
    }
  })();

  // ========================================================================
  // 8. MÓDULO: REVEAL DE CABEÇALHOS NO SCROLL (ANIMAÇÃO SUAVE)
  // ========================================================================
  const ScrollRevealModule = (() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const revealHeaders = document.querySelectorAll('.section-header-reveal');
    if (!revealHeaders.length) return;

    document.documentElement.classList.add('reveal-animations-active');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            const rect = entry.boundingClientRect;
            if (rect.top > window.innerHeight || rect.bottom < 0) {
              entry.target.classList.remove('is-visible');
            }
          }
        });
      }, {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
      });

      revealHeaders.forEach((header) => observer.observe(header));
    } else {
      revealHeaders.forEach((header) => header.classList.add('is-visible'));
    }
  })();

  // ========================================================================
  // 9. MÓDULO: NOTIFICAÇÃO TOAST
  // ========================================================================
  const ToastModule = (() => {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = toast ? toast.querySelector('.toast-icon') : null;
    let timeoutId = null;

    function show(message, duration = 3500, type = 'success') {
      if (!toast || !toastMsg) return;
      toastMsg.textContent = message;

      if (toastIcon) {
        if (type === 'error') {
          toastIcon.className = 'fa-solid fa-circle-exclamation toast-icon';
          toast.classList.add('toast-error');
        } else {
          toastIcon.className = 'fa-solid fa-circle-check toast-icon';
          toast.classList.remove('toast-error');
        }
      }

      toast.classList.add('show');

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }

    window.showToast = show;
    return { show };
  })();
});
