/**
 * ==============================================================================
 * LALATELIÊ - PAPELARIA AFETIVA & ARTESANAL
 * Módulo de Controle da Página de Checkout (checkout.js)
 * Arquitetura: Orientada a Estado, 3 Etapas Sequenciais & Validação E-commerce
 * ==============================================================================
 */

(function () {
  'use strict';

  // Configurações do Ateliê
  const ATELIE_CONFIG = {
    whatsappPhone: '5533999774017',
    pixKey: 'lalatelie.afetiva@gmail.com', // Chave Pix cadastrada para o Ateliê
    pixName: 'LALATELIE PAPELARIA AFETIVA',
    pixCity: 'IPATINGA',
    pixDiscountPercent: 0.05 // 5% de desconto à vista no Pix
  };

  // Estado Central do Checkout
  const CheckoutState = {
    currentStep: 1, // 1: Pedido, 2: Dados, 3: Pagamento, 4: Sucesso
    items: [],
    shippingOption: {
      id: 'combinar',
      name: 'A combinar no WhatsApp',
      price: 0,
      deadline: 'Combinado após confirmação'
    },
    customer: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      observacoes: ''
    },
    paymentMethod: 'combinar', // 'combinar' | 'pix' | 'credit_card'
    cardData: {
      number: '',
      name: '',
      expiry: '',
      cvv: '',
      installments: 1
    },
    lastOrder: null
  };

  // Funções Utilitárias Monetárias
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function roundMoney(num) {
    return Math.round((Number(num) || 0) * 100) / 100;
  }

  // --------------------------------------------------------------------------
  // 1. GERENCIADOR DE DADOS DO CARRINHO (SYNC COM LALATELIECART)
  // --------------------------------------------------------------------------
  const CartManager = {
    syncFromStorage() {
      try {
        let loadedItems = [];
        if (window.LalatelieCart && typeof window.LalatelieCart.getItems === 'function') {
          loadedItems = window.LalatelieCart.getItems() || [];
        }
        if (!loadedItems || loadedItems.length === 0) {
          const raw = localStorage.getItem('lalatelie_cart_v1');
          if (raw) loadedItems = JSON.parse(raw);
        }
        CheckoutState.items = Array.isArray(loadedItems) ? loadedItems : [];
      } catch (e) {
        console.warn('Erro ao ler carrinho do localStorage:', e);
        CheckoutState.items = [];
      }
    },

    updateItemQty(key, newQty) {
      if (window.LalatelieCart && typeof window.LalatelieCart.updateQuantity === 'function') {
        window.LalatelieCart.updateQuantity(key, newQty);
        this.syncFromStorage();
      } else {
        const item = CheckoutState.items.find(i => i.key === key);
        if (item) {
          if (newQty <= 0) {
            CheckoutState.items = CheckoutState.items.filter(i => i.key !== key);
          } else {
            item.quantity = newQty;
            item.subtotal = roundMoney(item.unitPrice * newQty);
          }
          localStorage.setItem('lalatelie_cart_v1', JSON.stringify(CheckoutState.items));
        }
      }
      CheckoutApp.render();
    },

    removeItem(key) {
      if (window.LalatelieCart && typeof window.LalatelieCart.removeItem === 'function') {
        window.LalatelieCart.removeItem(key);
        this.syncFromStorage();
      } else {
        CheckoutState.items = CheckoutState.items.filter(i => i.key !== key);
        localStorage.setItem('lalatelie_cart_v1', JSON.stringify(CheckoutState.items));
      }
      CheckoutApp.render();
    },

    getSubtotal() {
      return roundMoney(CheckoutState.items.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0));
    },

    getTotalCount() {
      return CheckoutState.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
    },

    clearCart() {
      if (window.LalatelieCart && typeof window.LalatelieCart.clear === 'function') {
        window.LalatelieCart.clear();
      } else {
        localStorage.removeItem('lalatelie_cart_v1');
      }
      CheckoutState.items = [];
    }
  };

  // --------------------------------------------------------------------------
  // 2. MÁSCARAS E VALIDADORES DE FORMULÁRIO (ETAPA 2)
  // --------------------------------------------------------------------------
  const FormValidators = {
    maskCEP(val) {
      return val.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
    },

    maskPhone(val) {
      let v = val.replace(/\D/g, '').slice(0, 11);
      if (v.length > 10) {
        return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      }
      return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    },

    maskCPF(val) {
      return val
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    },

    maskCardNumber(val) {
      return val
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ');
    },

    maskCardExpiry(val) {
      return val
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/^(\d{2})(\d)/, '$1/$2');
    },

    maskCardCVV(val) {
      return val.replace(/\D/g, '').slice(0, 4);
    },

    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    },

    isValidName(name) {
      const parts = String(name).trim().split(/\s+/);
      return parts.length >= 2 && parts.every(p => p.length >= 2);
    },

    isValidPhone(phone) {
      const nums = phone.replace(/\D/g, '');
      return nums.length === 10 || nums.length === 11;
    },

    isValidCEP(cep) {
      const nums = cep.replace(/\D/g, '');
      return nums.length === 8;
    },

    isValidCPF(cpf) {
      const clean = cpf.replace(/\D/g, '');
      if (clean.length === 0) return true; // CPF é opcional
      if (clean.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(clean)) return false;

      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i), 10) * (10 - i);
      let rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(clean.charAt(9), 10)) return false;

      sum = 0;
      for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i), 10) * (11 - i);
      rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;
      return rev === parseInt(clean.charAt(10), 10);
    },

    detectCardBrand(number) {
      const clean = number.replace(/\D/g, '');
      if (/^4/.test(clean)) return { name: 'Visa', icon: 'fa-brands fa-cc-visa' };
      if (/^5[1-5]/.test(clean)) return { name: 'Mastercard', icon: 'fa-brands fa-cc-mastercard' };
      if (/^(4011|438935|451416|4576|504175|627780|636297|636368)/.test(clean)) return { name: 'Elo', icon: 'fa-regular fa-credit-card' };
      if (/^3[47]/.test(clean)) return { name: 'Amex', icon: 'fa-brands fa-cc-amex' };
      return { name: 'Cartão', icon: 'fa-regular fa-credit-card' };
    }
  };

  // --------------------------------------------------------------------------
  // 3. CONSULTA INTEGRADA VIACEP (AUTO-PREENCHIMENTO DE ENDEREÇO)
  // --------------------------------------------------------------------------
  const ViaCepService = {
    async fetchAddress(cep) {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) return null;

      const indicator = document.getElementById('cepLoadingIndicator');
      if (indicator) indicator.classList.add('active');

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!res.ok) throw new Error('Falha na resposta do ViaCEP');
        const data = await res.json();
        if (data.erro) {
          return { error: 'CEP não encontrado. Por favor, preencha o endereço manualmente.' };
        }
        return {
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || ''
        };
      } catch (err) {
        console.warn('Erro ao consultar ViaCEP:', err);
        return { error: 'Não foi possível buscar o CEP automaticamente. Preencha os campos abaixo.' };
      } finally {
        if (indicator) indicator.classList.remove('active');
      }
    }
  };

  // --------------------------------------------------------------------------
  // 4. CÁLCULO GERAL DE VALORES E TOTAIS DO CHECKOUT
  // --------------------------------------------------------------------------
  const PricingEngine = {
    calculate() {
      const subtotal = CartManager.getSubtotal();
      const shippingPrice = 0; // Frete combinado no WhatsApp sem cobrança embutida
      
      let discountPix = 0;
      if (CheckoutState.paymentMethod === 'pix' && subtotal > 0) {
        // Desconto de 5% sobre o subtotal dos produtos no Pix
        discountPix = roundMoney(subtotal * ATELIE_CONFIG.pixDiscountPercent);
      }

      const total = roundMoney(Math.max(0, subtotal - discountPix));

      return {
        subtotal,
        shippingPrice,
        discountPix,
        total
      };
    }
  };

  // --------------------------------------------------------------------------
  // 5. CONTROLADOR DA APLICAÇÃO DE CHECKOUT
  // --------------------------------------------------------------------------
  const CheckoutApp = {
    init() {
      CartManager.syncFromStorage();
      this.restoreCustomerState();
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      // 5.1. Stepper Click
      document.querySelectorAll('.stepper-step').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetStep = parseInt(btn.getAttribute('data-step'), 10);
          if (targetStep < CheckoutState.currentStep) {
            this.goToStep(targetStep);
          } else if (targetStep === 2 && this.validateStep1()) {
            this.goToStep(2);
          } else if (targetStep === 3 && this.validateStep1() && this.validateStep2()) {
            this.goToStep(3);
          }
        });
      });

      // 5.2. Botões de Navegação Entre Etapas
      const btnStep1Next = document.getElementById('btnStep1Next');
      if (btnStep1Next) {
        btnStep1Next.addEventListener('click', () => {
          if (this.validateStep1()) this.goToStep(2);
        });
      }

      const btnStep2Prev = document.getElementById('btnStep2Prev');
      if (btnStep2Prev) {
        btnStep2Prev.addEventListener('click', () => this.goToStep(1));
      }

      const btnStep2Next = document.getElementById('btnStep2Next');
      if (btnStep2Next) {
        btnStep2Next.addEventListener('click', () => {
          if (this.validateStep2()) this.goToStep(3);
        });
      }

      const btnStep3Prev = document.getElementById('btnStep3Prev');
      if (btnStep3Prev) {
        btnStep3Prev.addEventListener('click', () => this.goToStep(2));
      }

      const btnStep3Finish = document.getElementById('btnStep3Finish');
      if (btnStep3Finish) {
        btnStep3Finish.addEventListener('click', () => this.handleFinishOrder());
      }

      // 5.3. Toggle do Resumo Mobile
      const mobileToggleBar = document.getElementById('mobileSummaryBar');
      if (mobileToggleBar) {
        mobileToggleBar.addEventListener('click', () => {
          mobileToggleBar.classList.toggle('is-open');
        });
      }

      // 5.4. Cálculo de Frete por CEP na Etapa 1
      const btnShippingCalc = document.getElementById('btnShippingCalc');
      const inputShippingCep = document.getElementById('shippingCepInput');
      if (btnShippingCalc && inputShippingCep) {
        inputShippingCep.addEventListener('input', (e) => {
          e.target.value = FormValidators.maskCEP(e.target.value);
        });

        btnShippingCalc.addEventListener('click', () => {
          this.handleCalculateShipping(inputShippingCep.value);
        });

        inputShippingCep.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleCalculateShipping(inputShippingCep.value);
          }
        });
      }

      // 5.5. Máscaras e Eventos do Formulário da Etapa 2
      this.bindCustomerFormEvents();

      // 5.6. Métodos de Pagamento na Etapa 3
      this.bindPaymentMethodEvents();
    },

    bindCustomerFormEvents() {
      const f = document.getElementById('checkoutCustomerForm');
      if (!f) return;

      const inputNome = document.getElementById('custNome');
      const inputEmail = document.getElementById('custEmail');
      const inputTelefone = document.getElementById('custTelefone');
      const inputCpf = document.getElementById('custCpf');
      const inputCep = document.getElementById('custCep');
      const inputRua = document.getElementById('custRua');
      const inputNumero = document.getElementById('custNumero');
      const inputComplemento = document.getElementById('custComplemento');
      const inputBairro = document.getElementById('custBairro');
      const inputCidade = document.getElementById('custCidade');
      const inputUf = document.getElementById('custUf');
      const inputObs = document.getElementById('custObs');

      if (inputTelefone) {
        inputTelefone.addEventListener('input', (e) => {
          e.target.value = FormValidators.maskPhone(e.target.value);
          this.saveCustomerState();
        });
      }

      if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
          e.target.value = FormValidators.maskCPF(e.target.value);
          this.saveCustomerState();
        });
      }

      if (inputCep) {
        inputCep.addEventListener('input', async (e) => {
          e.target.value = FormValidators.maskCEP(e.target.value);
          this.saveCustomerState();
          const clean = e.target.value.replace(/\D/g, '');
          if (clean.length === 8) {
            const addr = await ViaCepService.fetchAddress(clean);
            if (addr && !addr.error) {
              if (inputRua) inputRua.value = addr.rua;
              if (inputBairro) inputBairro.value = addr.bairro;
              if (inputCidade) inputCidade.value = addr.cidade;
              if (inputUf) inputUf.value = addr.uf;
              this.saveCustomerState();
              if (inputNumero) inputNumero.focus();
            }
          }
        });
      }

      // Salva estado a qualquer alteração de campos
      [inputNome, inputEmail, inputRua, inputNumero, inputComplemento, inputBairro, inputCidade, inputUf, inputObs].forEach(inp => {
        if (inp) {
          inp.addEventListener('input', () => this.saveCustomerState());
          inp.addEventListener('blur', () => this.validateField(inp));
        }
      });
    },

    bindPaymentMethodEvents() {
      document.querySelectorAll('.payment-method-card').forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        const method = card.getAttribute('data-method');

        const selectMethod = () => {
          document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          if (radio) radio.checked = true;
          CheckoutState.paymentMethod = method;
          this.renderTotals();
          this.renderReviewSummary();
        };

        card.addEventListener('click', (e) => {
          if (!e.target.closest('input') && !e.target.closest('select')) {
            selectMethod();
          }
        });

        if (radio) {
          radio.addEventListener('change', selectMethod);
        }
      });

      // Máscaras dos campos de Cartão de Crédito
      const inputCardNumber = document.getElementById('cardNumber');
      const inputCardExpiry = document.getElementById('cardExpiry');
      const inputCardCvv = document.getElementById('cardCvv');
      const cardBrandIcon = document.getElementById('cardBrandPreview');

      if (inputCardNumber) {
        inputCardNumber.addEventListener('input', (e) => {
          e.target.value = FormValidators.maskCardNumber(e.target.value);
          const brand = FormValidators.detectCardBrand(e.target.value);
          if (cardBrandIcon) {
            cardBrandIcon.className = `card-brand-preview ${brand.icon}`;
          }
        });
      }

      if (inputCardExpiry) {
        inputCardExpiry.addEventListener('input', (e) => {
          e.target.value = FormValidators.maskCardExpiry(e.target.value);
        });
      }

      if (inputCardCvv) {
        inputCardCvv.addEventListener('input', (e) => {
          e.target.value = FormValidators.maskCardCVV(e.target.value);
        });
      }
    },

    saveCustomerState() {
      const getVal = (id) => (document.getElementById(id)?.value || '').trim();
      CheckoutState.customer = {
        nome: getVal('custNome'),
        email: getVal('custEmail'),
        telefone: getVal('custTelefone'),
        cpf: getVal('custCpf'),
        cep: getVal('custCep'),
        rua: getVal('custRua'),
        numero: getVal('custNumero'),
        complemento: getVal('custComplemento'),
        bairro: getVal('custBairro'),
        cidade: getVal('custCidade'),
        uf: getVal('custUf'),
        observacoes: getVal('custObs')
      };

      try {
        sessionStorage.setItem('lalatelie_checkout_customer', JSON.stringify(CheckoutState.customer));
      } catch (e) {
        console.warn('Falha ao salvar customer no sessionStorage', e);
      }
    },

    restoreCustomerState() {
      try {
        const raw = sessionStorage.getItem('lalatelie_checkout_customer');
        if (raw) {
          CheckoutState.customer = JSON.parse(raw);
          const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val) el.value = val;
          };
          setVal('custNome', CheckoutState.customer.nome);
          setVal('custEmail', CheckoutState.customer.email);
          setVal('custTelefone', CheckoutState.customer.telefone);
          setVal('custCpf', CheckoutState.customer.cpf);
          setVal('custCep', CheckoutState.customer.cep);
          setVal('custRua', CheckoutState.customer.rua);
          setVal('custNumero', CheckoutState.customer.numero);
          setVal('custComplemento', CheckoutState.customer.complemento);
          setVal('custBairro', CheckoutState.customer.bairro);
          setVal('custCidade', CheckoutState.customer.cidade);
          setVal('custUf', CheckoutState.customer.uf);
          setVal('custObs', CheckoutState.customer.observacoes);
        }
      } catch (e) {
        console.warn('Falha ao restaurar dados do cliente:', e);
      }
    },

    validateField(el) {
      if (!el) return true;
      const group = el.closest('.form-group');
      const val = el.value.trim();
      let isValid = true;
      let errorMsg = '';

      switch (el.id) {
        case 'custNome':
          isValid = FormValidators.isValidName(val);
          errorMsg = 'Informe seu nome e sobrenome completos.';
          break;
        case 'custEmail':
          isValid = FormValidators.isValidEmail(val);
          errorMsg = 'Informe um e-mail válido.';
          break;
        case 'custTelefone':
          isValid = FormValidators.isValidPhone(val);
          errorMsg = 'Informe um WhatsApp com DDD (10 ou 11 dígitos).';
          break;
        case 'custCpf':
          if (val.length > 0) {
            isValid = FormValidators.isValidCPF(val);
            errorMsg = 'Número de CPF inválido.';
          }
          break;
        case 'custCep':
          isValid = FormValidators.isValidCEP(val);
          errorMsg = 'CEP deve conter 8 dígitos.';
          break;
        case 'custRua':
          isValid = val.length >= 3;
          errorMsg = 'Informe o logradouro / rua.';
          break;
        case 'custNumero':
          isValid = val.length >= 1;
          errorMsg = 'Informe o número da residência (ou S/N).';
          break;
        case 'custBairro':
          isValid = val.length >= 2;
          errorMsg = 'Informe o bairro.';
          break;
        case 'custCidade':
          isValid = val.length >= 2;
          errorMsg = 'Informe a cidade.';
          break;
        case 'custUf':
          isValid = val.length === 2;
          errorMsg = 'Selecione o estado (UF).';
          break;
      }

      if (group) {
        const msgEl = group.querySelector('.form-error-msg');
        if (isValid) {
          group.classList.remove('error');
          el.classList.remove('has-error');
          el.classList.add('has-success');
        } else {
          group.classList.add('error');
          el.classList.add('has-error');
          el.classList.remove('has-success');
          if (msgEl) msgEl.textContent = errorMsg;
        }
      }

      return isValid;
    },

    validateStep1() {
      if (CheckoutState.items.length === 0) {
        alert('Seu carrinho está vazio! Adicione algum produto antes de continuar.');
        return false;
      }
      return true;
    },

    validateStep2() {
      this.saveCustomerState();
      const requiredFields = [
        'custNome',
        'custEmail',
        'custTelefone',
        'custCep',
        'custRua',
        'custNumero',
        'custBairro',
        'custCidade',
        'custUf'
      ];

      let allValid = true;
      let firstInvalidEl = null;

      requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const ok = this.validateField(el);
          if (!ok) {
            allValid = false;
            if (!firstInvalidEl) firstInvalidEl = el;
          }
        }
      });

      // Validação do CPF caso preenchido
      const cpfEl = document.getElementById('custCpf');
      if (cpfEl && cpfEl.value.trim().length > 0) {
        if (!this.validateField(cpfEl)) {
          allValid = false;
          if (!firstInvalidEl) firstInvalidEl = cpfEl;
        }
      }

      if (!allValid && firstInvalidEl) {
        firstInvalidEl.focus();
      }

      return allValid;
    },

    validateStep3() {
      // O pagamento no cartão de crédito é combinado diretamente via WhatsApp (sem formulário no checkout).
      return true;
    },

    goToStep(stepNum) {
      CheckoutState.currentStep = stepNum;

      // Atualiza visual do Stepper
      document.querySelectorAll('.stepper-step').forEach(btn => {
        const s = parseInt(btn.getAttribute('data-step'), 10);
        btn.classList.remove('active', 'completed');
        if (s === stepNum) {
          btn.classList.add('active');
        } else if (s < stepNum) {
          btn.classList.add('completed');
        }
      });

      document.querySelectorAll('.stepper-line').forEach((line, idx) => {
        line.classList.toggle('completed', idx + 1 < stepNum);
      });

      // Alterna exibição das abas
      document.querySelectorAll('.checkout-step-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      if (stepNum === 1) {
        document.getElementById('stepOrder')?.classList.add('active');
      } else if (stepNum === 2) {
        document.getElementById('stepCustomer')?.classList.add('active');
      } else if (stepNum === 3) {
        document.getElementById('stepPayment')?.classList.add('active');
        this.renderReviewSummary();
        this.renderInstallmentsOptions();
      } else if (stepNum === 4) {
        document.getElementById('stepSuccess')?.classList.add('active');
      }

      // Atualiza o texto descritivo da etapa visível no mobile
      const mobileStatusEl = document.getElementById('mobileStepStatus');
      if (mobileStatusEl) {
        const stepLabels = {
          1: 'Etapa 1 de 3: Revisão do Pedido',
          2: 'Etapa 2 de 3: Seus Dados & Entrega',
          3: 'Etapa 3 de 3: Pagamento & Revisão',
          4: 'Pedido Finalizado com Sucesso'
        };
        const label = stepLabels[stepNum] || 'Finalização do Pedido';
        mobileStatusEl.innerHTML = `<i class="fa-solid fa-circle-dot"></i> <span>${label}</span>`;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    handleCalculateShipping(cepVal) {
      const clean = cepVal.replace(/\D/g, '');
      if (clean.length !== 8) {
        alert('Por favor, digite um CEP válido com 8 dígitos.');
        return;
      }

      CheckoutState.shippingCalculated = true;
      const optionsList = document.getElementById('shippingOptionsList');
      if (!optionsList) return;

      // Opções oficiais de envio da Lalateliê
      const options = [
        { id: 'retirada', name: 'Retirada no Ateliê (Ipatinga, MG)', price: 0, deadline: '1 dia útil após confecção' },
        { id: 'pac', name: 'PAC Correios', price: 24.90, deadline: '5 a 8 dias úteis' },
        { id: 'sedex', name: 'SEDEX Correios', price: 42.50, deadline: '2 a 4 dias úteis' }
      ];

      optionsList.innerHTML = options.map(opt => {
        const isSel = opt.id === CheckoutState.shippingOption.id;
        const priceLabel = opt.price === 0 ? '<span class="free">Grátis</span>' : formatMoney(opt.price);
        return `
          <label class="shipping-option-item ${isSel ? 'selected' : ''}" data-ship-id="${opt.id}">
            <div class="shipping-option-left">
              <input type="radio" name="shippingMethod" value="${opt.id}" ${isSel ? 'checked' : ''}>
              <div>
                <div class="shipping-option-name">${opt.name}</div>
                <div class="shipping-option-deadline"><i class="fa-regular fa-clock"></i> Prazo estimado: ${opt.deadline}</div>
              </div>
            </div>
            <div class="shipping-option-price">${priceLabel}</div>
          </label>
        `;
      }).join('');

      optionsList.querySelectorAll('.shipping-option-item').forEach(lbl => {
        lbl.addEventListener('click', () => {
          const shipId = lbl.getAttribute('data-ship-id');
          const found = options.find(o => o.id === shipId);
          if (found) {
            CheckoutState.shippingOption = found;
            optionsList.querySelectorAll('.shipping-option-item').forEach(l => l.classList.remove('selected'));
            lbl.classList.add('selected');
            const radio = lbl.querySelector('input');
            if (radio) radio.checked = true;
            this.renderTotals();
            this.renderReviewSummary();
          }
        });
      });

      this.renderTotals();
    },

    renderReviewSummary() {
      const reviewGrid = document.getElementById('checkoutReviewDataGrid');
      if (!reviewGrid) return;

      const c = CheckoutState.customer;
      const addrMain = `${c.rua || '—'}, Nº ${c.numero || 'S/N'}${c.complemento ? ' (' + c.complemento + ')' : ''}`;
      const addrCity = `${c.bairro || ''} — ${c.cidade || ''}/${c.uf || ''} (CEP ${c.cep || ''})`;
      
      let payName = 'A Combinar com a Vendedora (WhatsApp)';
      if (CheckoutState.paymentMethod === 'pix') {
        payName = 'PIX Instantâneo à Vista (5% de Desconto)';
      } else if (CheckoutState.paymentMethod === 'credit_card') {
        payName = 'Cartão de Crédito (Combinar link no WhatsApp)';
      }

      reviewGrid.innerHTML = `
        <div class="review-data-block">
          <strong><i class="fa-solid fa-user"></i> Destinatário</strong>
          <span class="review-data-primary">${c.nome || 'Nome não informado'}</span>
          <span class="review-data-secondary">${c.email || ''}${c.telefone ? ' • ' + c.telefone : ''}</span>
        </div>
        <div class="review-data-block">
          <strong><i class="fa-solid fa-truck"></i> Endereço de Entrega</strong>
          <span class="review-data-primary">${addrMain}</span>
          <span class="review-data-secondary">${addrCity}</span>
          <span class="review-shipping-badge"><i class="fa-solid fa-clock"></i> Frete: ${CheckoutState.shippingOption.name}</span>
        </div>
        <div class="review-data-block">
          <strong><i class="fa-solid fa-wallet"></i> Forma de Pagamento</strong>
          <span class="review-data-primary">${payName}</span>
        </div>
        <div class="review-data-block">
          <strong><i class="fa-solid fa-boxes-packing"></i> Quantidade de Itens</strong>
          <span class="review-data-primary">${CartManager.getTotalCount()} ${CartManager.getTotalCount() === 1 ? 'produto artesanal' : 'produtos artesanais'}</span>
        </div>
      `;
    },

    renderInstallmentsOptions() {
      const sel = document.getElementById('cardInstallments');
      if (!sel) return;

      const pricing = PricingEngine.calculate();
      const total = pricing.total;
      sel.innerHTML = '';

      for (let i = 1; i <= 6; i++) {
        const valParcela = roundMoney(total / i);
        const opt = document.createElement('option');
        opt.value = i;
        if (i <= 3) {
          opt.textContent = `${i}x de ${formatMoney(valParcela)} sem juros`;
        } else {
          opt.textContent = `${i}x de ${formatMoney(valParcela)} fixas`;
        }
        sel.appendChild(opt);
      }
    },

    renderTotals() {
      const pricing = PricingEngine.calculate();

      // Sidebar Totais (Desktop e Mobile)
      const subtotalEl = document.getElementById('sidebarSubtotal');
      const shippingEl = document.getElementById('sidebarShipping');
      const discountRow = document.getElementById('sidebarDiscountRow');
      const discountEl = document.getElementById('sidebarDiscount');
      const totalEl = document.getElementById('sidebarTotal');

      if (subtotalEl) subtotalEl.textContent = formatMoney(pricing.subtotal);
      if (shippingEl) {
        shippingEl.textContent = 'A combinar no WhatsApp';
      }

      if (discountRow && discountEl) {
        if (pricing.discountPix > 0) {
          discountRow.style.display = 'flex';
          discountEl.textContent = `- ${formatMoney(pricing.discountPix)}`;
        } else {
          discountRow.style.display = 'none';
        }
      }

      if (totalEl) totalEl.textContent = formatMoney(pricing.total);

      // Mobile Bar e Dropdown Totais
      const mobileTotalEl = document.getElementById('mobileSummaryTotal');
      const mobileCountEl = document.getElementById('mobileSummaryCount');
      const mobileSubtotalEl = document.getElementById('mobileSubtotal');
      const mobileDiscountRow = document.getElementById('mobileDiscountRow');
      const mobileDiscountEl = document.getElementById('mobileDiscount');
      const mobileDropdownTotal = document.getElementById('mobileDropdownTotal');

      if (mobileTotalEl) mobileTotalEl.textContent = formatMoney(pricing.total);
      if (mobileCountEl) mobileCountEl.textContent = `${CartManager.getTotalCount()} ${CartManager.getTotalCount() === 1 ? 'item' : 'itens'}`;
      if (mobileSubtotalEl) mobileSubtotalEl.textContent = formatMoney(pricing.subtotal);
      if (mobileDropdownTotal) mobileDropdownTotal.textContent = formatMoney(pricing.total);

      if (mobileDiscountRow && mobileDiscountEl) {
        if (pricing.discountPix > 0) {
          mobileDiscountRow.style.display = 'flex';
          mobileDiscountEl.textContent = `- ${formatMoney(pricing.discountPix)}`;
        } else {
          mobileDiscountRow.style.display = 'none';
        }
      }

      // Pix Destaque na Etapa 3
      const pixValEl = document.getElementById('pixHighlightVal');
      if (pixValEl) pixValEl.textContent = formatMoney(pricing.total);
    },

    renderStep1Items() {
      const listEl = document.getElementById('checkoutItemsList');
      const emptyEl = document.getElementById('checkoutEmptyState');
      const btnNext = document.getElementById('btnStep1Next');
      const items = CheckoutState.items;

      if (!listEl) return;

      if (items.length === 0) {
        listEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        if (btnNext) btnNext.disabled = true;
        return;
      }

      listEl.style.display = 'flex';
      if (emptyEl) emptyEl.style.display = 'none';
      if (btnNext) btnNext.disabled = false;

      listEl.innerHTML = items.map(item => {
        // Encontra se tem personalização de capa
        const capaCustom = item.customizations && item.customizations.find(c => c.isCapa || /Capa/i.test(c.group));
        const capaNum = capaCustom && capaCustom.capaNum ? capaCustom.capaNum : null;
        const thumbImg = item.image || (capaNum ? `assets/images/produtos/capas/capas${capaNum}.jpg` : 'assets/images/logo/logo.png');

        const tagsHtml = (item.customizations || []).map(c => {
          const isPaid = c.price > 0;
          return `
            <span class="checkout-addon-tag ${isPaid ? 'is-paid' : ''}">
              <i class="fa-solid fa-check" style="font-size: 0.65rem;"></i>
              ${c.group}: ${c.value}
              ${isPaid ? `<span class="addon-extra-price">(+${formatMoney(c.price)})</span>` : ''}
            </span>
          `;
        }).join('');

        return `
          <div class="checkout-item-card" data-key="${item.key}">
            <div class="checkout-item-thumb-wrapper">
              <img src="${thumbImg}" alt="${item.title}" class="checkout-item-thumb" onerror="this.src='assets/images/logo/logo.png'">
              ${capaNum ? `<span class="checkout-item-capa-badge">Capa ${capaNum}</span>` : ''}
            </div>
            <div class="checkout-item-info">
              <span class="checkout-item-cat">${item.categoryLabel || 'Papelaria'}</span>
              <h3 class="checkout-item-title">${item.title}</h3>
              <div class="checkout-item-customizations">
                ${tagsHtml || '<span class="checkout-addon-tag">Sem personalizações extras</span>'}
              </div>
            </div>
            <div class="checkout-item-prices-col">
              <div class="checkout-item-actions-group">
                <div class="checkout-qty-controls">
                  <button type="button" class="checkout-qty-btn btn-ck-minus" data-key="${item.key}" aria-label="Diminuir quantidade">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="checkout-qty-val">${item.quantity}</span>
                  <button type="button" class="checkout-qty-btn btn-ck-plus" data-key="${item.key}" aria-label="Aumentar quantidade">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <button type="button" class="checkout-item-remove-btn btn-ck-remove" data-key="${item.key}" title="Remover produto do pedido" aria-label="Remover produto do pedido">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
              <div class="checkout-item-price-info">
                <div class="checkout-item-subtotal">${formatMoney(item.subtotal)}</div>
                <div class="checkout-item-unit-price">${item.quantity}x ${formatMoney(item.unitPrice)} un.</div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Eventos dos botões de quantidade e exclusão
      listEl.querySelectorAll('.btn-ck-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const k = btn.getAttribute('data-key');
          const it = items.find(i => i.key === k);
          if (it) CartManager.updateItemQty(k, it.quantity - 1);
        });
      });

      listEl.querySelectorAll('.btn-ck-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const k = btn.getAttribute('data-key');
          const it = items.find(i => i.key === k);
          if (it) CartManager.updateItemQty(k, it.quantity + 1);
        });
      });

      listEl.querySelectorAll('.btn-ck-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const k = btn.getAttribute('data-key');
          if (confirm('Deseja remover este item do seu pedido?')) {
            CartManager.removeItem(k);
          }
        });
      });
    },

    renderSidebarPreview() {
      const sidebarList = document.getElementById('sidebarItemsPreview');
      const mobileList = document.getElementById('mobileSummaryItems');
      const items = CheckoutState.items;

      const html = items.map(it => `
        <div class="sidebar-item-row">
          <img src="${it.image || 'assets/images/logo/logo.png'}" alt="" class="sidebar-item-thumb">
          <div class="sidebar-item-details">
            <div class="sidebar-item-title">${it.title}</div>
            <div class="sidebar-item-meta">${it.quantity}x ${formatMoney(it.unitPrice)}</div>
          </div>
          <div class="sidebar-item-price">${formatMoney(it.subtotal)}</div>
        </div>
      `).join('');

      if (sidebarList) sidebarList.innerHTML = html || '<p style="font-size:0.85rem;color:#747f6a;">Nenhum item adicionado.</p>';
      if (mobileList) mobileList.innerHTML = html || '<p style="font-size:0.85rem;color:#747f6a;">Nenhum item adicionado.</p>';
    },

    render() {
      this.renderStep1Items();
      this.renderSidebarPreview();
      this.renderTotals();
      this.renderReviewSummary();
    },

    // ------------------------------------------------------------------------
    // 6. FINALIZAÇÃO DO PEDIDO (GERAÇÃO DE ID, PIX E CONFIRMAÇÃO)
    // ------------------------------------------------------------------------
    handleFinishOrder() {
      if (!this.validateStep1()) {
        this.goToStep(1);
        return;
      }
      if (!this.validateStep2()) {
        this.goToStep(2);
        return;
      }
      if (!this.validateStep3()) {
        return;
      }

      const btn = document.getElementById('btnStep3Finish');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processando seu pedido com segurança...`;
      }

      setTimeout(() => {
        const orderId = `LALA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const pricing = PricingEngine.calculate();
        const dateStr = new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const order = {
          orderId,
          date: dateStr,
          customer: { ...CheckoutState.customer },
          items: [...CheckoutState.items],
          shipping: { ...CheckoutState.shippingOption },
          paymentMethod: CheckoutState.paymentMethod,
          pricing,
          status: CheckoutState.paymentMethod === 'pix' 
            ? 'Aguardando Pagamento Pix' 
            : (CheckoutState.paymentMethod === 'credit_card' 
                ? 'A Combinar Cartão no WhatsApp' 
                : 'A Combinar com a Vendedora')
        };

        CheckoutState.lastOrder = order;

        // Salva pedido no histórico local
        try {
          const history = JSON.parse(localStorage.getItem('lalatelie_order_history') || '[]');
          history.unshift(order);
          localStorage.setItem('lalatelie_order_history', JSON.stringify(history));
        } catch (e) {
          console.warn('Erro ao salvar histórico de pedidos:', e);
        }

        // Limpa o carrinho de compras após compra confirmada
        CartManager.clearCart();

        // Renderiza tela de Sucesso
        this.renderSuccessScreen(order);
        this.goToStep(4);

        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-lock"></i> Finalizar Pedido`;
        }

        // Envia o pedido finalizado automaticamente para o WhatsApp da Lalateliê
        const whatsappUrl = this.buildWhatsAppOrderUrl(order);
        this.sendOrderToWhatsApp(whatsappUrl);
      }, 1000);
    },

    // ------------------------------------------------------------------------
    // 6.1. CONSTRUÇÃO E ENVIO DO PEDIDO PARA O WHATSAPP
    // ------------------------------------------------------------------------
    buildWhatsAppOrderMessage(order) {
      let payLabel = 'A Combinar com a Vendedora';
      let closingMsg = 'Gostaria de combinar a melhor forma de pagamento e entrega com você. Muito obrigada(o)!';

      if (order.paymentMethod === 'pix') {
        payLabel = 'PIX à Vista (5% de Desconto)';
        closingMsg = 'Já estou realizando o PIX! Segue o comprovante assim que concluir. Muito obrigada(o)!';
      } else if (order.paymentMethod === 'credit_card') {
        payLabel = 'Cartão de Crédito (Combinar link no WhatsApp)';
        closingMsg = 'Gostaria de receber o link oficial para pagamento com cartão de crédito. Muito obrigada(o)!';
      }

      const lines = [
        `🌸 *NOVO PEDIDO LALATELIÊ #${order.orderId}* 🌸`,
        `Olá, Lalateliê! Acabei de finalizar meu pedido pelo site e estou enviando os detalhes para confirmação:`,
        '',
        `👤 *DADOS DO CLIENTE:*`,
        `• *Nome:* ${order.customer.nome}`,
        `• *WhatsApp:* ${order.customer.telefone}`,
        `• *E-mail:* ${order.customer.email}`
      ];

      if (order.customer.cpf) {
        lines.push(`• *CPF:* ${order.customer.cpf}`);
      }

      lines.push('');
      lines.push(`📍 *ENDEREÇO DE ENTREGA:*`);
      const comp = order.customer.complemento ? ` (${order.customer.complemento})` : '';
      lines.push(`• *Rua:* ${order.customer.rua}, Nº ${order.customer.numero}${comp}`);
      lines.push(`• *Bairro:* ${order.customer.bairro}`);
      lines.push(`• *Cidade/UF:* ${order.customer.cidade}/${order.customer.uf}`);
      lines.push(`• *CEP:* ${order.customer.cep}`);
      lines.push(`• *Frete:* ${order.shipping.name || 'A combinar no WhatsApp'}`);

      lines.push('');
      lines.push(`💳 *FORMA DE PAGAMENTO:*`);
      lines.push(`• ${payLabel}`);
      if (order.paymentMethod === 'pix') {
        lines.push(`• *Chave Pix:* ${ATELIE_CONFIG.pixKey}`);
      }

      if (order.customer.observacoes && order.customer.observacoes.trim()) {
        lines.push('');
        lines.push(`📝 *OBSERVAÇÕES DO CLIENTE:*`);
        lines.push(`• ${order.customer.observacoes.trim()}`);
      }

      lines.push('');
      lines.push(`📦 *ITENS DO PEDIDO (${order.items.length} ${order.items.length === 1 ? 'item' : 'itens'}):*`);

      order.items.forEach((it, idx) => {
        lines.push(`*${idx + 1}. ${it.quantity}x ${it.title}* — ${formatMoney(it.subtotal)}`);
        if (Array.isArray(it.customizations) && it.customizations.length > 0) {
          it.customizations.forEach(c => {
            const p = Number(c.price) > 0 ? ` (+${formatMoney(c.price)})` : '';
            lines.push(`   ▫ ${c.group}: ${c.value}${p}`);
          });
        }
      });

      lines.push('');
      lines.push(`💰 *RESUMO FINANCEIRO:*`);
      lines.push(`• Subtotal dos produtos: ${formatMoney(order.pricing.subtotal)}`);
      lines.push(`• Frete: A combinar`);
      if (order.pricing.discountPix > 0) {
        lines.push(`• Desconto Pix (5% OFF): -${formatMoney(order.pricing.discountPix)}`);
      }
      lines.push(`👉 *VALOR TOTAL: ${formatMoney(order.pricing.total)}*`);
      lines.push('');
      lines.push(closingMsg);

      return lines.join('\n');
    },

    buildWhatsAppOrderUrl(order) {
      const msg = this.buildWhatsAppOrderMessage(order);
      return `https://wa.me/${ATELIE_CONFIG.whatsappPhone}?text=${encodeURIComponent(msg)}`;
    },

    sendOrderToWhatsApp(whatsappUrl) {
      if (!whatsappUrl) return;

      // Exibe/Destaca banner de redirecionamento no topo da tela de sucesso
      const banner = document.getElementById('successWhatsappRedirectBanner');
      if (banner) {
        banner.style.display = 'flex';
      }

      // Tenta abrir diretamente o WhatsApp em nova aba
      try {
        const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        // Se bloqueador de popups do navegador intervir ou em ambiente móvel
        if (!win || win.closed || typeof win.closed === 'undefined') {
          if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            setTimeout(() => {
              window.location.href = whatsappUrl;
            }, 600);
          }
        }
      } catch (err) {
        console.warn('Erro ao abrir WhatsApp automaticamente:', err);
      }
    },

    renderSuccessScreen(order) {
      const orderNumEl = document.getElementById('successOrderNumber');
      const statusPill = document.getElementById('successStatusPill');
      const pixBox = document.getElementById('successPixPaymentBox');
      const cardBox = document.getElementById('successCardPaymentBox');
      const combinarBox = document.getElementById('successCombinarPaymentBox');
      const pixCodeInput = document.getElementById('pixCodeInput');
      const btnCopyPix = document.getElementById('btnCopyPix');
      const btnWhatsapp = document.getElementById('btnSuccessWhatsapp');
      const summaryBox = document.getElementById('successOrderSummaryContent');

      if (orderNumEl) orderNumEl.textContent = `#${order.orderId}`;

      if (statusPill) {
        if (order.paymentMethod === 'pix') {
          statusPill.className = 'success-status-pill pix-pending';
          statusPill.innerHTML = `<i class="fa-solid fa-clock"></i> Aguardando Pagamento Pix (15 minutos)`;
        } else if (order.paymentMethod === 'credit_card') {
          statusPill.className = 'success-status-pill approved';
          statusPill.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Pagamento no Cartão a Combinar no WhatsApp`;
        } else {
          statusPill.className = 'success-status-pill approved';
          statusPill.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Pagamento a Combinar com a Vendedora`;
        }
      }

      // Exibe caixa de Pix se o pagamento for Pix
      if (pixBox) {
        if (order.paymentMethod === 'pix') {
          pixBox.style.display = 'block';
          // Código Pix Estático Didático do Ateliê
          const pixPayload = `00020126580014BR.GOV.BCB.PIX0136${ATELIE_CONFIG.pixKey}520400005303986540${order.pricing.total.toFixed(2)}5802BR5916LALATELIE AFETIV6008IPATINGA62070503***6304`;
          if (pixCodeInput) pixCodeInput.value = pixPayload;

          if (btnCopyPix) {
            btnCopyPix.onclick = () => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(pixPayload).then(() => {
                  btnCopyPix.innerHTML = `<i class="fa-solid fa-check"></i> Copiado!`;
                  setTimeout(() => {
                    btnCopyPix.innerHTML = `<i class="fa-regular fa-copy"></i> Copiar Código Pix`;
                  }, 2500);
                });
              } else {
                pixCodeInput.select();
                document.execCommand('copy');
                alert('Código Pix copiado com sucesso!');
              }
            };
          }
        } else {
          pixBox.style.display = 'none';
        }
      }

      // Exibe caixa de instrução de Cartão de Crédito se o pagamento for cartão
      if (cardBox) {
        cardBox.style.display = order.paymentMethod === 'credit_card' ? 'block' : 'none';
      }

      // Exibe caixa de instrução de A Combinar se o pagamento for combinar
      if (combinarBox) {
        combinarBox.style.display = order.paymentMethod === 'combinar' ? 'block' : 'none';
      }

      // Resumo dos Itens na tela de confirmação
      if (summaryBox) {
        summaryBox.innerHTML = `
          <div class="review-data-grid" style="text-align: left; margin-bottom: 20px;">
            <div class="review-data-block">
              <strong>Cliente</strong>
              <span>${order.customer.nome}</span>
              <span>${order.customer.email} • ${order.customer.telefone}</span>
            </div>
            <div class="review-data-block">
              <strong>Endereço de Entrega</strong>
              <span>${order.customer.rua}, ${order.customer.numero} ${order.customer.complemento || ''}</span>
              <span>${order.customer.bairro} — ${order.customer.cidade}/${order.customer.uf}</span>
              <span style="color: var(--color-olive-primary); font-weight: 600;">Frete: A combinar no WhatsApp</span>
            </div>
          </div>
          <div style="border-top: 1px dashed rgba(71,83,59,0.15); padding-top: 14px; text-align: left;">
            <strong style="color: var(--color-olive-dark); font-size: 0.85rem; text-transform: uppercase;">Itens Comprados:</strong>
            <ul style="list-style: none; padding: 0; margin-top: 8px; font-size: 0.9rem;">
              ${order.items.map(it => `
                <li style="margin-bottom: 6px;">
                  • <strong>${it.quantity}x ${it.title}</strong> — ${formatMoney(it.subtotal)}
                  ${(it.customizations || []).map(c => `<span style="font-size: 0.78rem; color:#747f6a;">(${c.group}: ${c.value})</span>`).join(' ')}
                </li>
              `).join('')}
            </ul>
            <div style="margin-top: 12px; font-size: 1.15rem; font-weight: 700; color: var(--color-olive-dark);">
              Total Final: ${formatMoney(order.pricing.total)}
            </div>
          </div>
        `;
      }

      // Link e Configuração do Botão do WhatsApp
      const whatsappUrl = this.buildWhatsAppOrderUrl(order);
      if (btnWhatsapp) {
        btnWhatsapp.href = whatsappUrl;
        btnWhatsapp.onclick = (e) => {
          // Garante abertura da conversa no WhatsApp
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          e.preventDefault();
        };
      }

      // Botão de Impressão
      const btnPrint = document.getElementById('btnSuccessPrint');
      if (btnPrint) {
        btnPrint.onclick = () => window.print();
      }

      // Oculta sidebar e stepper na tela de sucesso
      const sidebar = document.querySelector('.checkout-order-sidebar');
      if (sidebar) sidebar.style.display = 'none';

      const stepperWrapper = document.querySelector('.checkout-stepper-wrapper');
      if (stepperWrapper) stepperWrapper.style.display = 'none';

      const mobileSummary = document.getElementById('mobileSummaryBar');
      if (mobileSummary) mobileSummary.style.display = 'none';

      const mobileDropdown = document.getElementById('mobileSummaryDropdown');
      if (mobileDropdown) mobileDropdown.style.display = 'none';
    }
  };

  // Inicialização quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CheckoutApp.init());
  } else {
    CheckoutApp.init();
  }

  // Exporta globalmente para inspeção ou testes se necessário
  window.LalatelieCheckout = CheckoutApp;

})();
