/**
 * cookies.js — Banner de consentimiento de cookies / localStorage
 * ───────────────────────────────────────────────────────────────
 * - Se muestra solo si el usuario no ha decidido aún.
 * - Guarda la elección en localStorage bajo la clave os_cookie_consent.
 * - No bloquea ningún recurso ni cambia el comportamiento del sitio
 *   (los datos almacenados son todos de carácter técnico / accesibilidad).
 */

;(function () {
  'use strict'

  const CONSENT_KEY = 'os_cookie_consent'

  // Si ya hay una decisión guardada no mostramos nada
  if (localStorage.getItem(CONSENT_KEY)) return

  /* ── Estilos ──────────────────────────────────────────── */
  const style = document.createElement('style')
  style.textContent = `
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 99998;
      background: var(--bg-dark, #111);
      color: var(--text-light, #f2ede6);
      font-family: 'Inter', sans-serif;
      padding: 1.25rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
      border-top: 2px solid #e64a19;
      box-shadow: 0 -4px 24px rgba(0,0,0,.35);
      transform: translateY(100%);
      transition: transform .4s cubic-bezier(0.14, 1, 0.34, 1);
    }

    .cookie-banner.is-visible {
      transform: translateY(0);
    }

    .cookie-banner__text {
      flex: 1;
      min-width: 240px;
      font-size: .82rem;
      line-height: 1.65;
      color: rgba(242,237,230,.75);
    }

    .cookie-banner__text strong {
      display: block;
      font-size: .88rem;
      color: #f2ede6;
      margin-bottom: .3rem;
    }

    .cookie-banner__text a {
      color: #e64a19;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .cookie-banner__text a:hover { opacity: .8; }

    .cookie-banner__actions {
      display: flex;
      gap: .75rem;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .cookie-btn {
      font-family: 'Inter', sans-serif;
      font-size: .78rem;
      font-weight: 600;
      letter-spacing: .07em;
      text-transform: uppercase;
      padding: .65rem 1.5rem;
      border: none;
      transition: opacity .2s, background .2s;
      white-space: nowrap;
    }

    .cookie-btn--accept {
      background: #e64a19;
      color: #fff;
    }

    .cookie-btn--accept:hover { opacity: .85; }

    .cookie-btn--reject {
      background: transparent;
      color: rgba(242,237,230,.6);
      border: 1px solid rgba(242,237,230,.2);
    }

    .cookie-btn--reject:hover {
      color: #f2ede6;
      border-color: rgba(242,237,230,.5);
    }

    /* Empujar el contenido para que el banner no tape el footer */
    .cookie-offset { padding-bottom: 90px; }

    @media (max-width: 600px) {
      .cookie-banner { padding: 1rem 1.25rem; gap: 1rem; }
      .cookie-banner__actions { width: 100%; }
      .cookie-btn { flex: 1; text-align: center; }
    }

    /* Alto contraste */
    html.a11y-contrast .cookie-banner { background: #000; border-top-color: #fff; }
    html.a11y-contrast .cookie-btn--reject { border-color: #fff; color: #fff; }

    /* Reducir movimiento */
    @media (prefers-reduced-motion: reduce) {
      .cookie-banner { transition: none; }
    }
  `
  document.head.appendChild(style)

  /* ── HTML del banner ──────────────────────────────────── */
  const banner = document.createElement('div')
  banner.className = 'cookie-banner'
  banner.setAttribute('role', 'region')
  banner.setAttribute('aria-label', 'Aviso de cookies y privacidad')
  banner.innerHTML = `
    <p class="cookie-banner__text">
      <strong>Este sitio usa almacenamiento local</strong>
      Guardamos en tu dispositivo preferencias de accesibilidad y el contenido
      que publicas en la Comunidad. También cargamos fuentes y librerías de CDN externos
      (Google Fonts, Cloudflare, jsDelivr) que pueden registrar tu IP.
      <a href="privacidad.html">Más información</a>
    </p>
    <div class="cookie-banner__actions">
      <button class="cookie-btn cookie-btn--reject" id="cookieReject">Solo esenciales</button>
      <button class="cookie-btn cookie-btn--accept" id="cookieAccept">Aceptar</button>
    </div>
  `
  document.body.appendChild(banner)

  // Animar entrada tras un frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('is-visible'))
  })

  /* ── Lógica de botones ────────────────────────────────── */
  function dismiss (value) {
    localStorage.setItem(CONSENT_KEY, value)
    banner.classList.remove('is-visible')
    document.body.classList.remove('cookie-offset')
    // Eliminar del DOM tras la transición
    banner.addEventListener('transitionend', () => banner.remove(), { once: true })
  }

  document.getElementById('cookieAccept').addEventListener('click', () => dismiss('accepted'))
  document.getElementById('cookieReject').addEventListener('click', () => dismiss('essential'))

  // Trampa de teclado básica: Escape cierra con "solo esenciales"
  document.addEventListener('keydown', function handler (e) {
    if (e.key === 'Escape' && document.body.contains(banner)) {
      dismiss('essential')
      document.removeEventListener('keydown', handler)
    }
  })

  // Desplazar el footer para que no quede tapado
  document.body.classList.add('cookie-offset')

})()
