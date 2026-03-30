/**
 * wip.js — Indicadores de "Web en construcción"
 * ─────────────────────────────────────────────
 * Para desactivarlos cuando la web esté lista:
 *   1. Elimina este fichero.
 *   2. Quita la línea <script src="wip.js"></script> de index.html.
 *
 * Este script no modifica ningún fichero existente:
 * inyecta estilos y nodos en el DOM de forma dinámica.
 */

;(function () {
  'use strict'

  /* ── 1. Estilos ─────────────────────────────────────────── */
  const style = document.createElement('style')
  style.textContent = `
    /* ── Banner superior ── */
    .wip-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .75rem;
      padding: .55rem 1.25rem;
      background: #1a1a1a;
      color: #f2ede6;
      font-family: 'Inter', sans-serif;
      font-size: .78rem;
      font-weight: 500;
      letter-spacing: .05em;
      text-transform: uppercase;
      box-shadow: 0 2px 12px rgba(0,0,0,.35);
      pointer-events: none;
      user-select: none;
    }

    .wip-banner__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #e64a19;
      flex-shrink: 0;
      animation: wip-pulse 1.6s ease-in-out infinite;
    }

    @keyframes wip-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: .4; transform: scale(.7); }
    }

    /* Empujar el header para que el banner no lo tape */
    .wip-offset {
      padding-top: 36px !important;
    }

    /* ── Aviso de ejemplo en el foro ── */
    .wip-forum-notice {
      max-width: 1100px;
      margin: 0 auto 2rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border: 1px dashed rgba(230, 74, 25, .45);
      background: rgba(230, 74, 25, .05);
      font-family: 'Inter', sans-serif;
    }

    .wip-forum-notice__icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      line-height: 1.5;
    }

    .wip-forum-notice__text {
      font-size: .85rem;
      line-height: 1.6;
      color: #555;
    }

    .wip-forum-notice__text strong {
      display: block;
      color: #e64a19;
      font-size: .78rem;
      letter-spacing: .07em;
      text-transform: uppercase;
      margin-bottom: .2rem;
    }

    /* Alto contraste */
    html.a11y-contrast .wip-forum-notice {
      border-color: #fff;
      background: #000;
    }

    html.a11y-contrast .wip-forum-notice__text { color: #ccc; }

    /* Reducir movimiento */
    @media (prefers-reduced-motion: reduce) {
      .wip-banner__dot { animation: none; opacity: 1; }
    }
  `
  document.head.appendChild(style)

  /* ── 2. Banner superior ─────────────────────────────────── */
  const banner = document.createElement('div')
  banner.className = 'wip-banner'
  banner.setAttribute('role', 'status')
  banner.setAttribute('aria-label', 'Aviso: sitio web en construcción')
  banner.innerHTML = `
    <span class="wip-banner__dot" aria-hidden="true"></span>
    Web en construcción · Algunos contenidos son de ejemplo y pueden cambiar
    <span class="wip-banner__dot" aria-hidden="true"></span>
  `
  document.body.prepend(banner)

  // Empujar el body para no tapar el header fijo
  document.body.classList.add('wip-offset')

  /* ── 3. Aviso en la sección del foro ────────────────────── */
  function injectForumNotice () {
    const forumFilters = document.querySelector('.forum__filters')
    if (!forumFilters) return

    const notice = document.createElement('div')
    notice.className = 'wip-forum-notice'
    notice.setAttribute('role', 'note')
    notice.innerHTML = `
      <span class="wip-forum-notice__icon" aria-hidden="true">⚠️</span>
      <p class="wip-forum-notice__text">
        <strong>Contenido de ejemplo</strong>
        Las preguntas y respuestas que aparecen aquí son ficticias y se usan solo para ilustrar
        el funcionamiento de la comunidad. Cuando la web esté lista, este aviso y los datos de
        ejemplo desaparecerán y el foro mostrará conversaciones reales.
      </p>
    `
    forumFilters.before(notice)
  }

  // El foro se renderiza después del DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectForumNotice)
  } else {
    // Si el DOM ya está listo, esperar un tick para que initForum() haya corrido
    setTimeout(injectForumNotice, 0)
  }
})()
