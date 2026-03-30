/* ═══════════════════════════════════════════════════════
   comunidad.js — Lógica de la página de comunidad
   Sin GSAP · Sin Lenis · Sin dependencias externas
═══════════════════════════════════════════════════════ */

;(function () {
  'use strict'

  // ── Header: sombra al hacer scroll ──────────────────────
  function initHeader () {
    const header = document.getElementById('header')
    const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  // ── Menú hamburguesa ────────────────────────────────────
  function initMenu () {
    const btn     = document.getElementById('menuBtn')
    const overlay = document.getElementById('navOverlay')
    if (!btn || !overlay) return

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!open))
      overlay.setAttribute('aria-hidden', String(open))
      overlay.classList.toggle('is-open', !open)
      document.body.style.overflow = open ? '' : 'hidden'
    })

    // Cerrar al hacer clic en un enlace
    overlay.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        btn.setAttribute('aria-expanded', 'false')
        overlay.setAttribute('aria-hidden', 'true')
        overlay.classList.remove('is-open')
        document.body.style.overflow = ''
      })
    })

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        btn.setAttribute('aria-expanded', 'false')
        overlay.setAttribute('aria-hidden', 'true')
        overlay.classList.remove('is-open')
        document.body.style.overflow = ''
        btn.focus()
      }
    })
  }

  // ── Widget de accesibilidad ─────────────────────────────
  function initA11yWidget () {
    const KEYS = { contrast:'os_contrast', motion:'os_motion', readable:'os_readable', spacing:'os_spacing', fontSize:'os_fontsize' }
    const save = (k, v) => { try { localStorage.setItem(k, v) } catch(_){} }
    const load = (k)    => { try { return localStorage.getItem(k) } catch(_){ return null } }

    const toggleBtn  = document.getElementById('a11yToggle')
    const panel      = document.getElementById('a11yPanel')
    const closeBtn   = document.getElementById('a11yClose')
    const contrastBtn= document.getElementById('contrastToggle')
    const motionBtn  = document.getElementById('motionToggle')
    const readableBtn= document.getElementById('readableToggle')
    const spacingBtn = document.getElementById('spacingToggle')
    const fontDecBtn = document.getElementById('fontDecrease')
    const fontResBtn = document.getElementById('fontReset')
    const fontIncBtn = document.getElementById('fontIncrease')
    const resetBtn   = document.getElementById('a11yReset')

    if (!toggleBtn) return

    let fontSize = 0

    const openPanel = () => {
      panel.setAttribute('aria-hidden', 'false')
      toggleBtn.setAttribute('aria-expanded', 'true')
      closeBtn.focus()
    }
    const closePanel = () => {
      panel.setAttribute('aria-hidden', 'true')
      toggleBtn.setAttribute('aria-expanded', 'false')
      toggleBtn.focus()
    }

    toggleBtn.addEventListener('click', () =>
      panel.getAttribute('aria-hidden') === 'true' ? openPanel() : closePanel()
    )
    closeBtn.addEventListener('click', closePanel)

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.getAttribute('aria-hidden') === 'false') closePanel()
    })

    function applyContrast (on) {
      document.documentElement.classList.toggle('a11y-contrast', on)
      contrastBtn.setAttribute('aria-pressed', String(on))
      save(KEYS.contrast, on ? '1' : '0')
    }
    function applyMotion (on) {
      document.documentElement.classList.toggle('a11y-no-motion', on)
      motionBtn.setAttribute('aria-pressed', String(on))
      save(KEYS.motion, on ? '1' : '0')
    }
    function applyReadable (on) {
      document.documentElement.classList.toggle('a11y-readable', on)
      readableBtn.setAttribute('aria-pressed', String(on))
      save(KEYS.readable, on ? '1' : '0')
    }
    function applySpacing (on) {
      document.documentElement.classList.toggle('a11y-spacing', on)
      spacingBtn.setAttribute('aria-pressed', String(on))
      save(KEYS.spacing, on ? '1' : '0')
    }
    function applyFontSize (level) {
      fontSize = Math.max(-1, Math.min(2, level))
      document.documentElement.classList.remove('a11y-font-sm','a11y-font-lg','a11y-font-xl')
      ;[fontDecBtn, fontResBtn, fontIncBtn].forEach(b => b.classList.remove('a11y-size-btn--active'))
      if (fontSize === -1) { document.documentElement.classList.add('a11y-font-sm');  fontDecBtn.classList.add('a11y-size-btn--active') }
      if (fontSize ===  0) fontResBtn.classList.add('a11y-size-btn--active')
      if (fontSize >=  1) { document.documentElement.classList.add(fontSize === 1 ? 'a11y-font-lg' : 'a11y-font-xl'); fontIncBtn.classList.add('a11y-size-btn--active') }
      save(KEYS.fontSize, String(fontSize))
    }

    contrastBtn.addEventListener('click', () => applyContrast(contrastBtn.getAttribute('aria-pressed') !== 'true'))
    motionBtn.addEventListener('click',   () => applyMotion(motionBtn.getAttribute('aria-pressed') !== 'true'))
    readableBtn.addEventListener('click', () => applyReadable(readableBtn.getAttribute('aria-pressed') !== 'true'))
    spacingBtn.addEventListener('click',  () => applySpacing(spacingBtn.getAttribute('aria-pressed') !== 'true'))
    fontDecBtn.addEventListener('click',  () => applyFontSize(fontSize - 1))
    fontResBtn.addEventListener('click',  () => applyFontSize(0))
    fontIncBtn.addEventListener('click',  () => applyFontSize(fontSize + 1))
    resetBtn.addEventListener('click',    () => {
      applyContrast(false); applyMotion(false); applyReadable(false); applySpacing(false); applyFontSize(0)
    })

    if (load(KEYS.contrast) === '1') applyContrast(true)
    if (load(KEYS.motion)   === '1') applyMotion(true)
    if (load(KEYS.readable) === '1') applyReadable(true)
    if (load(KEYS.spacing)  === '1') applySpacing(true)
    const savedFont = parseInt(load(KEYS.fontSize) || '0', 10)
    if (savedFont !== 0) applyFontSize(savedFont)
    else fontResBtn.classList.add('a11y-size-btn--active')
  }

  // ── Foro ────────────────────────────────────────────────
  function initForum () {
    const STORE_KEY = 'openstages_forum_v1'

    const SEED = [
      {
        id: 's1',
        author: 'Lucía M.',
        tag: 'participar',
        text: '¿Cómo puedo apuntarme a los talleres? Tengo 22 años y estudié teatro durante tres años. Me interesa mucho el proyecto.',
        date: '2025-09-12T10:30:00',
        replies: [
          { author: 'Equipo OPENSTAGE(S)', text: '¡Hola Lucía! Puedes escribirnos a info@openstages.eu con tu nombre, edad y una pequeña presentación. Nos pondremos en contacto contigo con toda la información sobre el próximo proceso de selección.', date: '2025-09-12T15:45:00' }
        ]
      },
      {
        id: 's2',
        author: 'Massimo R.',
        tag: 'inclusión',
        text: '¿El proyecto está también adaptado para personas con discapacidad auditiva? Me pregunto si habrá intérpretes de lengua de signos en los talleres.',
        date: '2025-10-03T09:00:00',
        replies: []
      },
      {
        id: 's3',
        author: 'Sara G.',
        tag: 'proyecto',
        text: '¿Cuándo está previsto el taller internacional en Sevilla? ¿Ya hay fechas confirmadas?',
        date: '2025-11-20T18:10:00',
        replies: [
          { author: 'Barrio de Oportunidades', text: 'Las fechas exactas se anunciarán en los próximos meses. ¡Síguenos en redes para estar al tanto!', date: '2025-11-21T10:00:00' }
        ]
      }
    ]

    function loadData () {
      try {
        const raw = localStorage.getItem(STORE_KEY)
        if (raw) return JSON.parse(raw)
      } catch (_) {}
      const data = SEED.map(q => ({ ...q, replies: [...q.replies] }))
      saveData(data)
      return data
    }

    function saveData (data) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(data)) } catch (_) {}
    }

    let questions    = loadData()
    let activeFilter = 'all'

    const list        = document.getElementById('forumList')
    const empty       = document.getElementById('forumEmpty')
    const openFormBtn = document.getElementById('forumOpenForm')
    const formWrap    = document.getElementById('forumFormWrap')
    const form        = document.getElementById('forumForm')
    const cancelBtn   = document.getElementById('forumCancel')
    const charCount   = document.getElementById('fCharCount')
    const textarea    = document.getElementById('fQuestion')
    const filters     = document.querySelectorAll('.forum__filter')

    if (!list) return

    function relativeDate (iso) {
      const diff = Date.now() - new Date(iso).getTime()
      const m = Math.floor(diff / 60000)
      if (m < 1)   return 'ahora mismo'
      if (m < 60)  return `hace ${m} min`
      const h = Math.floor(m / 60)
      if (h < 24)  return `hace ${h} h`
      const d = Math.floor(h / 24)
      if (d < 30)  return `hace ${d} días`
      return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    function initials (name) {
      return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    }

    function escHtml (str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }

    function render () {
      const filtered = activeFilter === 'all'
        ? questions
        : questions.filter(q => q.tag === activeFilter)

      list.innerHTML = ''
      empty.hidden = filtered.length > 0

      filtered.forEach((q, idx) => {
        const card = document.createElement('article')
        card.className = 'fcard'
        card.dataset.id = q.id

        const repliesHtml = q.replies.map(r => `
          <div class="fcard__reply-item">
            <div class="fcard__reply-avatar" aria-hidden="true">${initials(r.author)}</div>
            <div class="fcard__reply-body">
              <span class="fcard__reply-author">${escHtml(r.author)}</span>
              <span class="fcard__reply-date">${relativeDate(r.date)}</span>
              <p class="fcard__reply-text">${escHtml(r.text)}</p>
            </div>
          </div>
        `).join('')

        card.innerHTML = `
          <div class="fcard__head">
            <div class="fcard__meta">
              <span class="fcard__author">${escHtml(q.author)}</span>
              <span class="fcard__tag">${escHtml(q.tag)}</span>
              <span class="fcard__date">${relativeDate(q.date)}</span>
            </div>
            <p class="fcard__text">${escHtml(q.text)}</p>
          </div>
          <div class="fcard__footer">
            <span class="fcard__reply-count">${q.replies.length} ${q.replies.length === 1 ? 'respuesta' : 'respuestas'}</span>
            <button class="fcard__reply-btn" aria-expanded="false" aria-controls="replies-${q.id}">
              Responder
            </button>
          </div>
          <div class="fcard__replies" id="replies-${q.id}">
            ${repliesHtml}
            <div class="fcard__reply-form-wrap" id="reply-form-${q.id}">
              <form class="fcard__reply-form" data-qid="${q.id}">
                <input type="text" name="author" maxlength="60" required placeholder="Tu nombre *" autocomplete="name" />
                <textarea name="reply" rows="3" maxlength="500" required placeholder="Tu respuesta…"></textarea>
                <div class="fcard__reply-form-actions">
                  <button type="button" class="fcard__reply-cancel">Cancelar</button>
                  <button type="submit" class="fcard__reply-submit">Publicar</button>
                </div>
              </form>
            </div>
          </div>
        `

        card.style.opacity = '0'
        card.style.transform = 'translateY(16px)'
        card.style.transition = `opacity .35s ease ${idx * .06}s, transform .35s var(--ease-out) ${idx * .06}s`
        list.appendChild(card)
        requestAnimationFrame(() => {
          card.style.opacity = '1'
          card.style.transform = 'none'
        })

        card.querySelector('.fcard__reply-btn').addEventListener('click', function () {
          const open = this.getAttribute('aria-expanded') === 'true'
          this.setAttribute('aria-expanded', String(!open))
          const fw = card.querySelector(`#reply-form-${q.id}`)
          fw.classList.toggle('is-open', !open)
          if (!open) fw.querySelector('input[name="author"]').focus()
        })

        card.querySelector('.fcard__reply-cancel').addEventListener('click', () => {
          const fw = card.querySelector(`#reply-form-${q.id}`)
          fw.classList.remove('is-open')
          card.querySelector('.fcard__reply-btn').setAttribute('aria-expanded', 'false')
        })

        card.querySelector('.fcard__reply-form').addEventListener('submit', function (e) {
          e.preventDefault()
          const rAuthor = this.author.value.trim()
          const rText   = this.reply.value.trim()
          if (!rAuthor || !rText) return
          const qObj = questions.find(x => x.id === q.id)
          if (!qObj) return
          qObj.replies.push({ author: rAuthor, text: rText, date: new Date().toISOString() })
          saveData(questions)
          render()
        })
      })
    }

    openFormBtn.addEventListener('click', () => {
      const open = openFormBtn.getAttribute('aria-expanded') === 'true'
      openFormBtn.setAttribute('aria-expanded', String(!open))
      formWrap.classList.toggle('is-open', !open)
      formWrap.setAttribute('aria-hidden', String(open))
      if (!open) document.getElementById('fAuthor').focus()
    })

    cancelBtn.addEventListener('click', () => {
      openFormBtn.setAttribute('aria-expanded', 'false')
      formWrap.classList.remove('is-open')
      formWrap.setAttribute('aria-hidden', 'true')
      form.reset()
      charCount.textContent = '0 / 800'
    })

    textarea.addEventListener('input', () => {
      charCount.textContent = `${textarea.value.length} / 800`
    })

    form.addEventListener('submit', e => {
      e.preventDefault()
      const author = form.author.value.trim()
      const text   = form.question.value.trim()
      const tag    = form.tag.value
      if (!author || !text) return
      questions.unshift({
        id:      'q' + Date.now(),
        author,
        tag,
        text,
        date:    new Date().toISOString(),
        replies: []
      })
      saveData(questions)
      cancelBtn.click()
      render()
      list.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('forum__filter--active'))
        btn.classList.add('forum__filter--active')
        activeFilter = btn.dataset.filter
        render()
      })
    })

    render()
  }

  // ── Init ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initHeader()
    initMenu()
    initA11yWidget()
    initForum()
  })

})()
