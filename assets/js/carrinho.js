/**
 * ==============================================================================
 * LALATELIÊ - MÓDULO DO CARRINHO DE COMPRAS E PERSONALIZAÇÃO DE ADICIONAIS
 * Arquivo: assets/js/carrinho.js
 * ==============================================================================
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'lalatelie_cart_v1';
  const WHATSAPP_PHONE = '5533999774017';

  // --------------------------------------------------------------------------
  // 1. HELPERS MONETÁRIOS E DE FORMATAÇÃO
  // --------------------------------------------------------------------------
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function roundMoney(amount) {
    return Math.round((Number(amount) || 0) * 100) / 100;
  }

  // --------------------------------------------------------------------------
  // 2. GERENCIADOR DE ESTADO DO CARRINHO (CART STATE)
  // --------------------------------------------------------------------------
  const CartStore = {
    items: [],

    init() {
      this.load();
    },

    load() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.items = this.validateItems(parsed);
          }
        }
      } catch (err) {
        console.warn('Lalateliê Cart: Erro ao carregar carrinho do localStorage', err);
        this.items = [];
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      } catch (err) {
        console.warn('Lalateliê Cart: Erro ao salvar carrinho no localStorage', err);
      }
    },

    validateItems(rawItems) {
      const produtos = window.PRODUTOS_LALATELIE || [];
      return rawItems.filter(item => {
        if (!item || !item.productId) return false;
        const prod = produtos.find(p => p.id === item.productId);
        if (!prod) return false;

        // Atualiza preço base e título caso tenham mudado no catálogo
        item.basePrice = Number(prod.priceNum) || 0;
        item.title = prod.title;
        item.category = prod.category;
        item.categoryLabel = prod.categoryLabel || 'Produto';

        // Recalcula unitPrice e subtotal
        let addonsSum = 0;
        if (Array.isArray(item.customizations)) {
          addonsSum = item.customizations.reduce((acc, c) => acc + (Number(c.price) || 0), 0);
        }
        item.unitPrice = roundMoney(item.basePrice + addonsSum);
        item.quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        item.subtotal = roundMoney(item.unitPrice * item.quantity);
        return true;
      });
    },

    generateKey(productId, customizations) {
      const normalized = (customizations || []).map(c => `${c.group}:${c.value}:${c.price || 0}`).sort().join('|');
      return `${productId}::${normalized}`;
    },

    addItem(product, customizations, quantity = 1) {
      if (!product || !product.id) return null;
      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      const basePrice = Number(product.priceNum) || 0;

      const addonsSum = (customizations || []).reduce((acc, c) => acc + (Number(c.price) || 0), 0);
      const unitPrice = roundMoney(basePrice + addonsSum);
      const itemKey = this.generateKey(product.id, customizations);

      // Determina a foto mais representativa (se tiver capa selecionada, usa a capa)
      let itemImage = (product.images && product.images.length > 0) ? product.images[0] : 'assets/images/logo/logo.png';
      const capaSelection = (customizations || []).find(c => c.isCapa || c.capaNum);
      if (capaSelection && capaSelection.capaNum) {
        itemImage = `assets/images/produtos/capas/capas${capaSelection.capaNum}.jpg`;
      }

      const existingIndex = this.items.findIndex(it => it.key === itemKey);
      if (existingIndex > -1) {
        // Agrupa itens somente quando produto e personalizações forem idênticos
        this.items[existingIndex].quantity += qty;
        this.items[existingIndex].subtotal = roundMoney(this.items[existingIndex].unitPrice * this.items[existingIndex].quantity);
      } else {
        // Mantém personalizações diferentes em itens separados
        const newItem = {
          key: itemKey,
          productId: product.id,
          title: product.title,
          category: product.category,
          categoryLabel: product.categoryLabel || 'Produto',
          image: itemImage,
          basePrice: basePrice,
          unitPrice: unitPrice,
          quantity: qty,
          customizations: customizations || [],
          subtotal: roundMoney(unitPrice * qty),
          createdAt: Date.now()
        };
        this.items.push(newItem);
      }

      this.save();
      this.dispatchUpdate();
      return itemKey;
    },

    updateItem(oldKey, product, newCustomizations, newQuantity) {
      const index = this.items.findIndex(it => it.key === oldKey);
      if (index === -1) return;

      this.items.splice(index, 1);
      this.addItem(product, newCustomizations, newQuantity);
    },

    updateQuantity(itemKey, newQuantity) {
      const index = this.items.findIndex(it => it.key === itemKey);
      if (index === -1) return;

      const qty = parseInt(newQuantity, 10);
      if (qty <= 0) {
        this.items.splice(index, 1);
      } else {
        this.items[index].quantity = qty;
        this.items[index].subtotal = roundMoney(this.items[index].unitPrice * qty);
      }

      this.save();
      this.dispatchUpdate();
    },

    removeItem(itemKey) {
      const index = this.items.findIndex(it => it.key === itemKey);
      if (index === -1) return;

      const removed = this.items.splice(index, 1)[0];
      this.save();
      this.dispatchUpdate();
      return removed;
    },

    clear() {
      this.items = [];
      this.save();
      this.dispatchUpdate();
    },

    getTotalCount() {
      return this.items.reduce((acc, it) => acc + (it.quantity || 0), 0);
    },

    getSubtotal() {
      return roundMoney(this.items.reduce((acc, it) => acc + (it.subtotal || 0), 0));
    },

    dispatchUpdate() {
      window.dispatchEvent(new CustomEvent('lalatelie:cart-updated', {
        detail: {
          items: this.items,
          count: this.getTotalCount(),
          subtotal: this.getSubtotal()
        }
      }));
    }
  };

  // --------------------------------------------------------------------------
  // 3. INJEÇÃO DOS COMPONENTES NO DOM (DRAWER, MODAL DE ADICIONAIS, TOAST)
  // --------------------------------------------------------------------------
  function injectCartDOM() {
    // 3.1. Drawer Lateral do Carrinho
    if (!document.getElementById('cartDrawer')) {
      const drawerHtml = `
        <div class="cart-drawer-backdrop" id="cartDrawerBackdrop" aria-hidden="true"></div>
        <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartDrawerTitle" aria-hidden="true">
          <header class="cart-drawer-header">
            <div class="cart-drawer-title-group">
              <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
              <h2 class="cart-drawer-title" id="cartDrawerTitle">Seu Carrinho</h2>
              <span class="cart-drawer-count" id="cartDrawerCount">0 itens</span>
            </div>
            <button type="button" class="cart-drawer-close" id="cartDrawerCloseBtn" aria-label="Fechar carrinho">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </header>

          <div class="cart-drawer-body" id="cartDrawerBody">
            <!-- Itens injetados dinamicamente via JS -->
          </div>

          <footer class="cart-drawer-footer" id="cartDrawerFooter">
            <div class="cart-summary-row">
              <span class="cart-summary-label">Total do Pedido:</span>
              <span class="cart-summary-total" id="cartSummaryTotal">R$ 0,00</span>
            </div>
            <p class="cart-footer-note"><i class="fa-solid fa-shield-heart"></i> Produção artesanal afetiva • Frete e entrega combinados no WhatsApp</p>
            <a href="checkout.html" class="btn-cart-checkout" id="btnCartCheckout">
              <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
              <span>Finalizar Compra Segura</span>
            </a>
            <button type="button" class="btn-cart-whatsapp-secondary" id="btnCartWhatsappSecondary">
              <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
              <span>Ou pedir direto pelo WhatsApp</span>
            </button>
            <div class="cart-footer-secondary-actions">
              <button type="button" class="btn-cart-continue" id="btnCartContinue">Continuar comprando</button>
              <button type="button" class="btn-cart-clear" id="btnCartClear">
                <i class="fa-regular fa-trash-can" aria-hidden="true"></i> Limpar carrinho
              </button>
            </div>
          </footer>
        </aside>
      `;
      document.body.insertAdjacentHTML('beforeend', drawerHtml);
    }

    // 3.2. Modal de Personalização e Itens Adicionais
    if (!document.getElementById('addonModalBackdrop')) {
      const modalHtml = `
        <div class="addon-modal-backdrop" id="addonModalBackdrop" aria-hidden="true">
          <div class="addon-modal" id="addonModal" role="dialog" aria-modal="true" aria-labelledby="addonModalTitle">
            <header class="addon-modal-header">
              <div class="addon-product-preview">
                <img src="" alt="" class="addon-product-thumb" id="addonProductThumb">
                <div class="addon-product-info">
                  <span class="addon-product-cat" id="addonProductCat">Categoria</span>
                  <h3 class="addon-product-title" id="addonModalTitle">Personalizar Produto</h3>
                  <span class="addon-product-base-price" id="addonProductBasePrice">A partir de R$ 0,00</span>
                </div>
              </div>
              <button type="button" class="addon-modal-close" id="addonModalCloseBtn" aria-label="Fechar modal">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>

            <form class="addon-modal-body" id="addonModalForm" onsubmit="return false;">
              <!-- Grupos de opções gerados dinamicamente via JS -->
            </form>

            <footer class="addon-modal-footer">
              <div class="addon-modal-qty-price">
                <div class="cart-qty-control">
                  <button type="button" class="btn-qty-step" id="btnModalQtyMinus" aria-label="Diminuir quantidade">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="cart-qty-value" id="modalQtyValue">1</span>
                  <button type="button" class="btn-qty-step" id="btnModalQtyPlus" aria-label="Aumentar quantidade">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <div class="addon-modal-price-calc">
                  <span class="addon-modal-calc-label">Preço Total Desta Peça:</span>
                  <span class="addon-modal-total-amount" id="modalTotalAmount">R$ 0,00</span>
                </div>
              </div>
              <button type="button" class="btn-addon-confirm" id="btnAddonConfirm">
                <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                <span id="btnAddonConfirmText">Adicionar ao Carrinho</span>
              </button>
            </footer>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // 3.3. Toast Flutuante de Sucesso
    if (!document.getElementById('cartToast')) {
      const toastHtml = `
        <div class="cart-toast" id="cartToast" role="status" aria-live="polite">
          <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
          <span id="cartToastMessage">Produto adicionado ao carrinho!</span>
          <button type="button" class="btn-cart-toast-open" id="btnCartToastOpen">Ver Carrinho</button>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', toastHtml);
    }
  }

  // --------------------------------------------------------------------------
  // 4. CONTROLADOR DA INTERFACE DO CARRINHO (CART UI CONTROLLER)
  // --------------------------------------------------------------------------
  const CartUI = {
    toastTimeout: null,

    init() {
      injectCartDOM();
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      // Abre/Fecha Drawer
      const backdrop = document.getElementById('cartDrawerBackdrop');
      const closeBtn = document.getElementById('cartDrawerCloseBtn');
      const continueBtn = document.getElementById('btnCartContinue');
      const clearBtn = document.getElementById('btnCartClear');
      const checkoutBtn = document.getElementById('btnCartCheckout');
      const toastOpenBtn = document.getElementById('btnCartToastOpen');

      if (backdrop) backdrop.addEventListener('click', () => this.closeDrawer());
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
      if (continueBtn) continueBtn.addEventListener('click', () => this.closeDrawer());
      if (toastOpenBtn) toastOpenBtn.addEventListener('click', () => {
        this.hideToast();
        this.openDrawer();
      });

      // Limpar Carrinho
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (CartStore.items.length === 0) return;
          const confirmClear = window.confirm('Deseja realmente esvaziar todos os itens do seu carrinho?');
          if (confirmClear) {
            CartStore.clear();
            this.showToast('Carrinho esvaziado com sucesso!');
          }
        });
      }

      // Finalizar Compra Segura (checkout.html)
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
          if (CartStore.items.length === 0) {
            e.preventDefault();
            this.showToast('Seu carrinho está vazio! Adicione algum produto antes de finalizar.');
          }
        });
      }

      // Pedir direto pelo WhatsApp (opção rápida)
      const whatsappSecondaryBtn = document.getElementById('btnCartWhatsappSecondary');
      if (whatsappSecondaryBtn) {
        whatsappSecondaryBtn.addEventListener('click', () => this.checkoutWhatsApp());
      }

      // Botões do Header existentes ou futuros
      document.querySelectorAll('.btn-header-cart, .btn-open-cart-drawer').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleDrawer();
        });
      });

      // Fechar com tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeDrawer();
          AddonModal.close();
        }
      });

      // Atualizações de Estado
      window.addEventListener('lalatelie:cart-updated', () => {
        this.render();
      });
    },

    openDrawer() {
      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartDrawerBackdrop');
      if (drawer && backdrop) {
        drawer.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        backdrop.classList.add('active');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    },

    closeDrawer() {
      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartDrawerBackdrop');
      if (drawer && backdrop) {
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        backdrop.classList.remove('active');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    },

    toggleDrawer() {
      const drawer = document.getElementById('cartDrawer');
      if (drawer && drawer.classList.contains('active')) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },

    render() {
      const items = CartStore.items;
      const count = CartStore.getTotalCount();
      const total = CartStore.getSubtotal();

      // Atualiza badges no cabeçalho e menu mobile
      document.querySelectorAll('.cart-count-badge').forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
          badge.classList.add('has-items');
          badge.classList.remove('is-animating');
          void badge.offsetWidth; // trigger reflow
          badge.classList.add('is-animating');
        } else {
          badge.classList.remove('has-items');
        }
      });

      // Atualiza cabeçalho do Drawer
      const countEl = document.getElementById('cartDrawerCount');
      if (countEl) {
        countEl.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
      }

      // Atualiza rodapé do Drawer
      const totalEl = document.getElementById('cartSummaryTotal');
      const footerEl = document.getElementById('cartDrawerFooter');
      if (totalEl) totalEl.textContent = formatMoney(total);

      // Renderiza corpo do Drawer
      const bodyEl = document.getElementById('cartDrawerBody');
      if (!bodyEl) return;

      if (items.length === 0) {
        if (footerEl) footerEl.style.display = 'none';
        bodyEl.innerHTML = `
          <div class="cart-empty-state">
            <div class="cart-empty-icon">
              <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
            </div>
            <h3 class="cart-empty-title">Seu carrinho está vazio</h3>
            <p class="cart-empty-desc">Explore nossas criações de papelaria afetiva e personalize peças exclusivas para o seu dia a dia.</p>
            <a href="catalogo.html" class="btn-cart-explore" id="btnEmptyExplore">
              <i class="fa-solid fa-book-open" aria-hidden="true"></i>
              <span>Ver Catálogo</span>
            </a>
          </div>
        `;
        const exploreBtn = document.getElementById('btnEmptyExplore');
        if (exploreBtn) {
          exploreBtn.addEventListener('click', () => this.closeDrawer());
        }
        return;
      }

      if (footerEl) footerEl.style.display = 'flex';

      bodyEl.innerHTML = items.map(item => {
        const prod = (window.PRODUTOS_LALATELIE || []).find(p => p.id === item.productId);
        const prodLink = `produto.html?id=${encodeURIComponent(item.productId)}`;

        // Renderiza lista de personalizações do item
        let customHtml = '';
        if (Array.isArray(item.customizations) && item.customizations.length > 0) {
          customHtml = `
            <div class="cart-item-customizations">
              ${item.customizations.map(c => `
                <div class="cart-custom-line">
                  <i class="fa-solid fa-sparkles" aria-hidden="true"></i>
                  <span><strong>${c.group}:</strong> ${c.value}</span>
                  ${(Number(c.price) > 0) ? `<span class="cart-custom-price-badge">+ ${formatMoney(c.price)}</span>` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }

        return `
          <article class="cart-item-card" data-key="${item.key}">
            <div class="cart-item-img-wrap">
              <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.onerror=null;this.src='assets/images/logo/logo.png';">
              <span class="cart-item-badge-corner">${item.quantity} un</span>
            </div>

            <div class="cart-item-content">
              <div class="cart-item-top">
                <span class="cart-item-category">${item.categoryLabel}</span>
                <h4 class="cart-item-title">
                  <a href="${prodLink}">${window.formatProductTitle ? window.formatProductTitle({ title: item.title, category: item.category }) : item.title}</a>
                </h4>
                ${customHtml}
              </div>

              <div class="cart-item-bottom">
                <div class="cart-item-prices">
                  <span class="cart-item-unit-price">${formatMoney(item.unitPrice)} un</span>
                  <span class="cart-item-subtotal">${formatMoney(item.subtotal)}</span>
                </div>

                <div class="cart-item-actions-group">
                  <div class="cart-qty-control">
                    <button type="button" class="btn-qty-step btn-item-minus" data-key="${item.key}" aria-label="Diminuir quantidade">
                      <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="cart-qty-value">${item.quantity}</span>
                    <button type="button" class="btn-qty-step btn-item-plus" data-key="${item.key}" aria-label="Aumentar quantidade">
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>

                  ${(item.customizations && item.customizations.length > 0) ? `
                    <button type="button" class="btn-cart-edit-item" data-key="${item.key}" title="Editar opções deste produto" aria-label="Editar opções">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                  ` : ''}

                  <button type="button" class="btn-cart-remove-item" data-key="${item.key}" title="Remover item do carrinho" aria-label="Remover item">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');

      // Associa eventos de clique nos controles de cada item
      bodyEl.querySelectorAll('.btn-item-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-key');
          const it = items.find(i => i.key === key);
          if (it) CartStore.updateQuantity(key, it.quantity - 1);
        });
      });

      bodyEl.querySelectorAll('.btn-item-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-key');
          const it = items.find(i => i.key === key);
          if (it) CartStore.updateQuantity(key, it.quantity + 1);
        });
      });

      bodyEl.querySelectorAll('.btn-cart-remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-key');
          CartStore.removeItem(key);
          this.showToast('Item removido do carrinho.');
        });
      });

      bodyEl.querySelectorAll('.btn-cart-edit-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-key');
          AddonModal.openForEdit(key);
        });
      });
    },

    showToast(message) {
      const toast = document.getElementById('cartToast');
      const msgEl = document.getElementById('cartToastMessage');
      if (!toast || !msgEl) return;

      msgEl.textContent = message;
      toast.classList.add('active');

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.hideToast();
      }, 4000);
    },

    hideToast() {
      const toast = document.getElementById('cartToast');
      if (toast) toast.classList.remove('active');
    },

    checkoutWhatsApp() {
      const items = CartStore.items;
      if (items.length === 0) return;

      const total = CartStore.getSubtotal();
      let lines = [];

      lines.push('🌸 *Olá, Lalateliê! Gostaria de fazer meu pedido através do site:*');
      lines.push('');

      items.forEach((item, idx) => {
        lines.push(`*${idx + 1}. ${item.quantity}x ${item.title}* — ${formatMoney(item.subtotal)}`);
        if (item.customizations && item.customizations.length > 0) {
          item.customizations.forEach(c => {
            const priceTag = c.price > 0 ? ` (+${formatMoney(c.price)})` : '';
            lines.push(`   • ${c.group}: ${c.value}${priceTag}`);
          });
        }
        lines.push('');
      });

      lines.push(`💰 *VALOR TOTAL DO PEDIDO: ${formatMoney(total)}*`);
      lines.push('');
      lines.push('Poderiam me confirmar a disponibilidade e o valor do frete? Muito obrigada(o)!');

      const messageEncoded = encodeURIComponent(lines.join('\n'));
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${messageEncoded}`;

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // --------------------------------------------------------------------------
  // 5. MODAL DE PERSONALIZAÇÃO DE ADICIONAIS (ADDON MODAL CONTROLLER)
  // --------------------------------------------------------------------------
  const AddonModal = {
    currentProduct: null,
    editingItemKey: null,
    currentQuantity: 1,

    init() {
      this.bindEvents();
    },

    bindEvents() {
      const backdrop = document.getElementById('addonModalBackdrop');
      const closeBtn = document.getElementById('addonModalCloseBtn');
      const minusBtn = document.getElementById('btnModalQtyMinus');
      const plusBtn = document.getElementById('btnModalQtyPlus');
      const confirmBtn = document.getElementById('btnAddonConfirm');

      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) this.close();
        });
      }

      if (closeBtn) closeBtn.addEventListener('click', () => this.close());

      if (minusBtn) {
        minusBtn.addEventListener('click', () => {
          if (this.currentQuantity > 1) {
            this.currentQuantity--;
            this.updateQtyAndPrice();
          }
        });
      }

      if (plusBtn) {
        plusBtn.addEventListener('click', () => {
          this.currentQuantity++;
          this.updateQtyAndPrice();
        });
      }

      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => this.confirmAndAddToCart());
      }
    },

    open(product, initialOptions = null) {
      if (!product) return;
      this.currentProduct = product;
      this.editingItemKey = null;
      this.currentQuantity = 1;

      this.populateHeader(product);
      this.buildForm(product, initialOptions);
      this.updateQtyAndPrice();

      const confirmText = document.getElementById('btnAddonConfirmText');
      if (confirmText) confirmText.textContent = 'Adicionar ao Carrinho';

      const backdrop = document.getElementById('addonModalBackdrop');
      if (backdrop) {
        backdrop.classList.add('active');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    },

    openForEdit(itemKey) {
      const item = CartStore.items.find(i => i.key === itemKey);
      if (!item) return;

      const product = (window.PRODUTOS_LALATELIE || []).find(p => p.id === item.productId);
      if (!product) return;

      this.currentProduct = product;
      this.editingItemKey = itemKey;
      this.currentQuantity = item.quantity;

      this.populateHeader(product);
      this.buildForm(product, item.customizations);
      this.updateQtyAndPrice();

      const confirmText = document.getElementById('btnAddonConfirmText');
      if (confirmText) confirmText.textContent = 'Salvar Alterações';

      const backdrop = document.getElementById('addonModalBackdrop');
      if (backdrop) {
        backdrop.classList.add('active');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    },

    close() {
      const backdrop = document.getElementById('addonModalBackdrop');
      if (backdrop) {
        backdrop.classList.remove('active');
        backdrop.setAttribute('aria-hidden', 'true');
        if (!document.getElementById('cartDrawer').classList.contains('active')) {
          document.body.style.overflow = '';
        }
      }
    },

    populateHeader(product) {
      const thumb = document.getElementById('addonProductThumb');
      const cat = document.getElementById('addonProductCat');
      const title = document.getElementById('addonModalTitle');
      const basePrice = document.getElementById('addonProductBasePrice');

      if (thumb) thumb.src = (product.images && product.images[0]) || 'assets/images/logo/logo.png';
      if (cat) cat.textContent = product.categoryLabel || 'Produto';
      if (title) title.textContent = product.title;
      if (basePrice) basePrice.textContent = `Preço base: ${formatMoney(product.priceNum)}`;
    },

    buildForm(product, preselected = null) {
      const form = document.getElementById('addonModalForm');
      if (!form) return;

      const groups = window.getProductAddonGroups ? window.getProductAddonGroups(product) : [];

      if (!groups || groups.length === 0) {
        form.innerHTML = `
          <div class="addon-group-section">
            <p>Este produto não requer itens adicionais. Você pode adicioná-lo diretamente com a quantidade desejada.</p>
          </div>
        `;
        return;
      }

      form.innerHTML = groups.map(group => {
        const isRequired = group.required === true;
        const reqBadge = isRequired
          ? '<span class="addon-group-req-badge required">Obrigatório</span>'
          : '<span class="addon-group-req-badge optional">Opcional</span>';

        // Caso Especial 1: Seletor de 34 Capas para Agendas
        if (group.type === 'capa_selector') {
          let selectedCapaNum = 1;
          if (preselected) {
            const foundCapa = preselected.find(c => c.isCapa || c.capaNum || /Capa/i.test(c.group));
            if (foundCapa && foundCapa.capaNum) selectedCapaNum = foundCapa.capaNum;
          }

          let capasCards = '';
          for (let i = 1; i <= 34; i++) {
            const isSel = i === selectedCapaNum;
            capasCards += `
              <div class="addon-capa-card ${isSel ? 'is-selected' : ''}" data-capa-num="${i}">
                <img src="assets/images/produtos/capas/capas${i}.jpg" alt="Capa Modelo ${i}" class="addon-capa-img" loading="lazy">
                <span class="addon-capa-num-badge">Modelo ${i}</span>
              </div>
            `;
          }

          return `
            <div class="addon-group-section" data-group-id="${group.id}" data-type="capa_selector" data-required="${isRequired}">
              <div class="addon-group-header">
                <h4 class="addon-group-title"><i class="fa-solid fa-palette"></i> ${group.name}</h4>
                ${reqBadge}
              </div>
              <p class="addon-group-desc">${group.description}</p>
              <div class="addon-capas-viewport">
                <div class="addon-capas-grid">
                  ${capasCards}
                </div>
              </div>
              <input type="hidden" name="capa_num" id="addonSelectedCapaInput" value="${selectedCapaNum}">
            </div>
          `;
        }

        // Caso 2: Seleção Única (Single Radio)
        if (group.type === 'single') {
          return `
            <div class="addon-group-section" data-group-id="${group.id}" data-type="single" data-required="${isRequired}">
              <div class="addon-group-header">
                <h4 class="addon-group-title"><i class="fa-solid fa-check"></i> ${group.name}</h4>
                ${reqBadge}
              </div>
              ${group.description ? `<p class="addon-group-desc">${group.description}</p>` : ''}
              <div class="addon-options-grid-single">
                ${group.options.map(opt => {
                  let isChecked = false;
                  if (preselected) {
                    isChecked = preselected.some(c => c.groupId === group.id ? c.optionId === opt.id : c.value === opt.name);
                  } else {
                    isChecked = opt.default === true;
                  }

                  return `
                    <label class="addon-radio-card ${isChecked ? 'is-selected' : ''}">
                      <input type="radio" name="addon_group_${group.id}" value="${opt.id}" data-name="${opt.name}" data-price="${opt.price || 0}" ${isChecked ? 'checked' : ''}>
                      <span class="addon-radio-name">${opt.name}</span>
                      ${(opt.price > 0) ? `<span class="addon-radio-price">+ ${formatMoney(opt.price)}</span>` : ''}
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }

        // Caso 3: Múltipla Escolha (Checkboxes)
        if (group.type === 'multiple') {
          return `
            <div class="addon-group-section" data-group-id="${group.id}" data-type="multiple" data-required="${isRequired}">
              <div class="addon-group-header">
                <h4 class="addon-group-title"><i class="fa-solid fa-gift"></i> ${group.name}</h4>
                ${reqBadge}
              </div>
              ${group.description ? `<p class="addon-group-desc">${group.description}</p>` : ''}
              <div class="addon-options-list-multiple">
                ${group.options.map(opt => {
                  let isChecked = false;
                  if (preselected) {
                    isChecked = preselected.some(c => c.optionId === opt.id || c.value === opt.name);
                  }

                  return `
                    <label class="addon-checkbox-card ${isChecked ? 'is-selected' : ''}">
                      <div class="addon-checkbox-left">
                        <input type="checkbox" name="addon_multi_${group.id}" value="${opt.id}" data-name="${opt.name}" data-price="${opt.price || 0}" ${isChecked ? 'checked' : ''}>
                        <div class="addon-checkbox-text">
                          <span class="addon-checkbox-name">${opt.name}</span>
                          ${opt.desc ? `<span class="addon-checkbox-desc">${opt.desc}</span>` : ''}
                        </div>
                      </div>
                      <span class="addon-checkbox-price">+ ${formatMoney(opt.price)}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }

        return '';
      }).join('');

      // Eventos dinâmicos dentro do form:
      // Clique em capas
      form.querySelectorAll('.addon-capa-card').forEach(card => {
        card.addEventListener('click', () => {
          form.querySelectorAll('.addon-capa-card').forEach(c => c.classList.remove('is-selected'));
          card.classList.add('is-selected');
          const num = card.getAttribute('data-capa-num');
          const input = document.getElementById('addonSelectedCapaInput');
          if (input) input.value = num;

          // Atualiza miniatura no topo
          const thumb = document.getElementById('addonProductThumb');
          if (thumb) thumb.src = `assets/images/produtos/capas/capas${num}.jpg`;

          this.updateQtyAndPrice();
        });
      });

      // Clique em rádios
      form.querySelectorAll('.addon-radio-card input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
          const parentGroup = radio.closest('.addon-group-section');
          if (parentGroup) {
            parentGroup.querySelectorAll('.addon-radio-card').forEach(l => l.classList.remove('is-selected'));
          }
          radio.closest('.addon-radio-card').classList.add('is-selected');
          this.updateQtyAndPrice();
        });
      });

      // Clique em checkboxes
      form.querySelectorAll('.addon-checkbox-card input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', () => {
          chk.closest('.addon-checkbox-card').classList.toggle('is-selected', chk.checked);
          this.updateQtyAndPrice();
        });
      });
    },

    getSelectedOptions() {
      const form = document.getElementById('addonModalForm');
      if (!form || !this.currentProduct) return [];

      const customizations = [];
      const groups = window.getProductAddonGroups ? window.getProductAddonGroups(this.currentProduct) : [];

      groups.forEach(group => {
        if (group.type === 'capa_selector') {
          const capaInput = document.getElementById('addonSelectedCapaInput');
          const capaNum = capaInput ? parseInt(capaInput.value, 10) : 1;
          customizations.push({
            groupId: group.id,
            group: 'Capa',
            value: `Capa Modelo ${capaNum}`,
            price: 0,
            isCapa: true,
            capaNum: capaNum
          });
        } else if (group.type === 'single') {
          const selectedRadio = form.querySelector(`input[name="addon_group_${group.id}"]:checked`);
          if (selectedRadio) {
            customizations.push({
              groupId: group.id,
              group: group.name.replace(/\s*\(.*?\)/, '').trim(),
              optionId: selectedRadio.value,
              value: selectedRadio.getAttribute('data-name'),
              price: Number(selectedRadio.getAttribute('data-price')) || 0
            });
          }
        } else if (group.type === 'multiple') {
          const checkedBoxes = form.querySelectorAll(`input[name="addon_multi_${group.id}"]:checked`);
          checkedBoxes.forEach(chk => {
            customizations.push({
              groupId: group.id,
              group: 'Adicional',
              optionId: chk.value,
              value: chk.getAttribute('data-name'),
              price: Number(chk.getAttribute('data-price')) || 0
            });
          });
        }
      });

      return customizations;
    },

    validate() {
      if (!this.currentProduct) return false;
      const groups = window.getProductAddonGroups ? window.getProductAddonGroups(this.currentProduct) : [];
      const form = document.getElementById('addonModalForm');
      if (!form) return false;

      for (const group of groups) {
        if (group.required) {
          if (group.type === 'single') {
            const hasChecked = form.querySelector(`input[name="addon_group_${group.id}"]:checked`);
            if (!hasChecked) {
              alert(`Por favor, selecione uma opção para o campo obrigatório "${group.name}".`);
              return false;
            }
          }
        }
      }
      return true;
    },

    updateQtyAndPrice() {
      const qtyEl = document.getElementById('modalQtyValue');
      const totalEl = document.getElementById('modalTotalAmount');
      if (qtyEl) qtyEl.textContent = this.currentQuantity;

      if (!this.currentProduct) return;
      const basePrice = Number(this.currentProduct.priceNum) || 0;
      const customs = this.getSelectedOptions();
      const addonsSum = customs.reduce((acc, c) => acc + (Number(c.price) || 0), 0);
      const unitPrice = roundMoney(basePrice + addonsSum);
      const totalAmount = roundMoney(unitPrice * this.currentQuantity);

      if (totalEl) totalEl.textContent = formatMoney(totalAmount);
    },

    confirmAndAddToCart() {
      if (!this.validate()) return;

      const customizations = this.getSelectedOptions();
      if (this.editingItemKey) {
        CartStore.updateItem(this.editingItemKey, this.currentProduct, customizations, this.currentQuantity);
        CartUI.showToast('Personalização atualizada com sucesso!');
      } else {
        CartStore.addItem(this.currentProduct, customizations, this.currentQuantity);
        CartUI.showToast(`"${this.currentProduct.title}" adicionado ao carrinho!`);
      }

      this.close();
      CartUI.openDrawer();
    }
  };

  // --------------------------------------------------------------------------
  // 6. INTERFACE GLOBAL EXPOSTA (window.LalatelieCart)
  // --------------------------------------------------------------------------
  window.LalatelieCart = {
    // Métodos de dados
    getItems: () => {
      if (!CartStore.items || CartStore.items.length === 0) {
        CartStore.load();
      }
      return CartStore.items;
    },
    getItemCount: () => CartStore.getTotalCount(),
    getSubtotal: () => CartStore.getSubtotal(),
    addItem: (prod, customs, qty) => CartStore.addItem(prod, customs, qty),
    removeItem: (key) => CartStore.removeItem(key),
    updateQuantity: (key, qty) => CartStore.updateQuantity(key, qty),
    clear: () => CartStore.clear(),

    // Métodos de UI
    openDrawer: () => CartUI.openDrawer(),
    closeDrawer: () => CartUI.closeDrawer(),
    toggleDrawer: () => CartUI.toggleDrawer(),
    showToast: (msg) => CartUI.showToast(msg),

    // Modal de Personalização
    openAddonModal: (productOrId, initialOptions) => {
      let product = productOrId;
      if (typeof productOrId === 'string') {
        product = (window.PRODUTOS_LALATELIE || []).find(p => p.id === productOrId);
      }
      if (!product) return;

      // Se for produto sob consulta
      if (product.consultPrice || product.category === 'tags') {
        const msg = encodeURIComponent(`Olá, Lalateliê! Gostaria de consultar valores e quantidades para "${product.title}".`);
        window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`, '_blank', 'noopener,noreferrer');
        return;
      }

      AddonModal.open(product, initialOptions);
    },

    // Ação inteligente de adicionar (usada pelos cards do catálogo e home)
    handleProductAddClick: (productOrId) => {
      let product = productOrId;
      if (typeof productOrId === 'string') {
        product = (window.PRODUTOS_LALATELIE || []).find(p => p.id === productOrId);
      }
      if (!product) return;

      // Se for produto sob consulta (tags/etiquetas)
      if (product.consultPrice || product.category === 'tags') {
        const msg = encodeURIComponent(`Olá, Lalateliê! Gostaria de consultar valores e quantidades para "${product.title}".`);
        window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`, '_blank', 'noopener,noreferrer');
        return;
      }

      const groups = window.getProductAddonGroups ? window.getProductAddonGroups(product) : [];
      const hasRequired = groups.some(g => g.required);

      // Se possuir grupos ou opcionais, abre modal de personalização
      if (groups.length > 0) {
        AddonModal.open(product);
      } else {
        // Se não tiver adicionais, adiciona direto
        CartStore.addItem(product, [], 1);
        CartUI.showToast(`"${product.title}" adicionado ao carrinho!`);
        CartUI.openDrawer();
      }
    }
  };

  // Inicialização no DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      CartStore.init();
      CartUI.init();
      AddonModal.init();
    });
  } else {
    CartStore.init();
    CartUI.init();
    AddonModal.init();
  }

})();
