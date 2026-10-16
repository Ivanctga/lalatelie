/**
 * ==============================================================================
 * LALATELIÊ - BOTÃO VOLTAR AO TOPO (SCROLL TO TOP)
 * Arquivo: assets/js/scroll-top.js
 * Funcionalidade autônoma e compatível com todas as páginas do site
 * ==============================================================================
 */

(function () {
  'use strict';

  function initScrollTop() {
    let btnScrollTop = document.getElementById('btnScrollTop');

    // Se o elemento não existir no HTML, cria automaticamente para garantir compatibilidade
    if (!btnScrollTop) {
      btnScrollTop = document.createElement('button');
      btnScrollTop.type = 'button';
      btnScrollTop.id = 'btnScrollTop';
      btnScrollTop.className = 'btn-scroll-top';
      btnScrollTop.setAttribute('aria-label', 'Voltar ao topo da página');
      btnScrollTop.setAttribute('title', 'Voltar ao topo');
      btnScrollTop.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
      document.body.appendChild(btnScrollTop);
    }

    // Limiar de rolagem para exibição do botão (em pixels)
    const SCROLL_THRESHOLD = 300;
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > SCROLL_THRESHOLD) {
            btnScrollTop.classList.add('is-visible');
          } else {
            btnScrollTop.classList.remove('is-visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    // Rolagem suave ao clicar
    btnScrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Retira foco para evitar outline residual após o clique
      btnScrollTop.blur();
    });

    // Escuta rolagem de forma passiva para máxima fluidez
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Verifica estado inicial na carga da página
    handleScroll();
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollTop);
  } else {
    initScrollTop();
  }
})();
