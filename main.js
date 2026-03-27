/* ═══════════════════════════════════════════════════════
   OPENSTAGE(S) v3 — Main JS
   shed.design-inspired animations
═══════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger)

// ── Eases ──────────────────────────────────────────────
const EXPO    = 'cubic-bezier(0.9, 0, 0.1, 1)'
const STAGGER = 'cubic-bezier(0.3, 0.6, 0.9, 1)'
const EOUT    = 'cubic-bezier(0.14, 1, 0.34, 1)'

// ── Scroll Restoration (always top) ──────────────────────
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

// ── Smooth scroll (Lenis) ──────────────────────────────
const lenis = new Lenis({
  lerp: 0.085,
  wheelMultiplier: 1.1,
  smoothTouch: false,
})
lenis.stop() // locked during intro

;(function raf(t) {
  lenis.raf(t)
  requestAnimationFrame(raf)
})(0)

// sync ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update)

// ── Custom cursor ──────────────────────────────────────
const cursor    = document.getElementById('cursor')
const cursorDot = document.getElementById('cursorDot')
let mx = 0, my = 0, cx = 0, cy = 0

window.addEventListener('mousemove', e => {
  mx = e.clientX
  my = e.clientY
  cursorDot.style.left = mx + 'px'
  cursorDot.style.top  = my + 'px'
  cursor.classList.add('cursor--visible')
  cursorDot.classList.add('cursor__dot--visible')
})

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'))
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'))
})

;(function moveCursor() {
  cx += (mx - cx) * 0.08
  cy += (my - cy) * 0.08
  cursor.style.left = cx + 'px'
  cursor.style.top  = cy + 'px'
  requestAnimationFrame(moveCursor)
})()

// ── Nav menu ───────────────────────────────────────────
const header  = document.getElementById('header')
const menuBtn = document.getElementById('menuBtn')
const overlay = document.getElementById('navOverlay')
let menuOpen  = false

function toggleMenu(force) {
  menuOpen = force !== undefined ? force : !menuOpen
  overlay.classList.toggle('nav-overlay--open', menuOpen)
  header.classList.toggle('header--open', menuOpen)
  overlay.setAttribute('aria-hidden', String(!menuOpen))
  menuOpen ? lenis.stop() : lenis.start()
}

menuBtn.addEventListener('click', () => toggleMenu())

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false))
})

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) toggleMenu(false)
})

// ── Intro animation ────────────────────────────────────
function initIntro() {
  const ref    = document.querySelector('.intro-ref')
  const inners = [...document.querySelectorAll('.hero-asset__inner')]
  const titleWords = [...document.querySelectorAll('.hero-title .word')]
  const subWords   = [...document.querySelectorAll('.hero-sub .word')]
  const scrollEl   = document.getElementById('heroScroll')
  const headerBrand  = document.querySelector('.header__brand')
  const headerToggle = document.querySelector('.header__toggle')

  if (!ref || !inners.length) { lenis.start(); return }

  const refBox  = ref.getBoundingClientRect()
  const heroBox = inners[0].getBoundingClientRect()

  // Scale factor: how much to shrink images to fit the reference box
  const scaleL = refBox.height / heroBox.height

  // Clip percentage needed to center the scaled image in the ref box
  const clipX = 50 - (refBox.width / (window.innerWidth * scaleL)) * 50

  // Set initial state: all images scaled down and fully clipped (invisible), UI hidden
  gsap.set(inners, {
    scale: scaleL,
    '--cx': clipX + '%',
    '--cy': '100%',
  })
  gsap.set([headerBrand, headerToggle], { opacity: 0 })

  const tl = gsap.timeline({
    delay: 0.25,
    onComplete() {
      lenis.start()
      setupParallax()
      if (ref.parentNode) ref.remove()
      gsap.to(scrollEl, { opacity: 1, duration: 0.7, ease: EOUT })
      startHeroCarousel()
    }
  })

  // ── Phase 1: cascade reveal (reverse stagger) ────────
  tl.to(inners, {
    '--cx': clipX + '%',
    '--cy': '0%',
    ease: EXPO,
    duration: 1.15,
    stagger: { each: -0.28, ease: STAGGER }
  }, 0)

  // ── Phase 2: top image zooms to full screen ───────────
  const expandAt = 0.32 + 0.28 * (inners.length + 1)

  tl.to(inners[0], {
    scale: 1,
    '--cx': '0%',
    '--cy': '0%',
    ease: EXPO,
    duration: 1.2,
    clearProps: 'all'
  }, expandAt)

  // ── Phase 3: title words and UI reveal ────────────────
  tl.to([headerBrand, headerToggle], {
    opacity: 1,
    duration: 1.2,
    ease: EOUT,
  }, expandAt)

  tl.to(titleWords, {
    y: 0,
    duration: 1.2,
    stagger: 0.14,
    ease: EXPO,
  }, expandAt - 0.15)

  // ── Phase 4: subtitle ────────────────────────────────
  tl.to(subWords, {
    y: 0,
    duration: 0.9,
    stagger: 0.07,
    ease: EOUT,
  }, expandAt + 0.45)
}

// ── Hero Carousel (after intro) ────────────────────────
function startHeroCarousel() {
  const heroEl  = document.getElementById('hero')
  const assets  = [...document.querySelectorAll('.hero-asset')]
  if (assets.length < 2) return

  let current = 0

  // Clear any residual clip-path/scale left by the intro on non-top assets
  // and set their opacity ready for crossfade (the __inner clip will be reset)
  assets.forEach((asset, i) => {
    const inner = asset.querySelector('.hero-asset__inner')
    if (inner) gsap.set(inner, { clearProps: 'scale,--cx,--cy,clipPath' })
    gsap.set(asset, { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 })
  })

  // Build dot indicators
  const dotsWrap = document.createElement('div')
  dotsWrap.className = 'hero-dots'
  assets.forEach((_, i) => {
    const dot = document.createElement('button')
    dot.className = 'hero-dot' + (i === 0 ? ' hero-dot--active' : '')
    dot.setAttribute('aria-label', `Imagen ${i + 1}`)
    dot.addEventListener('click', () => { clearInterval(iv); goTo(i) })
    dotsWrap.appendChild(dot)
  })
  heroEl.appendChild(dotsWrap)

  function goTo(next) {
    if (next === current) return
    const prev = current
    current = next

    dotsWrap.querySelectorAll('.hero-dot').forEach((d, i) =>
      d.classList.toggle('hero-dot--active', i === current)
    )

    gsap.set(assets[next], { zIndex: 3, opacity: 0 })
    gsap.to(assets[next], {
      opacity: 1, duration: 1.4, ease: EOUT,
      onComplete() {
        gsap.set(assets[prev], { zIndex: 1, opacity: 0 })
        gsap.set(assets[next], { zIndex: 2 })
      }
    })
  }

  // Auto-advance every 4.5 s
  let iv = setInterval(() => goTo((current + 1) % assets.length), 4500)
}

// ── Menu button dynamic color ────────────────────────────
ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom 50px', // change color just before it leaves completely
  onEnter: () => menuBtn.classList.add('header__toggle--dark'),
  onLeaveBack: () => menuBtn.classList.remove('header__toggle--dark')
})

// ── Parallax (after intro) ─────────────────────────────
function setupParallax() {
  gsap.to('#heroAssets', {
    yPercent: 38,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  })
}

// ── Marquee ────────────────────────────────────────────
gsap.to('.marquee__track', {
  xPercent: -33.333,
  ease: 'none',
  duration: 22,
  repeat: -1,
})

// ── Title reveals (GSAP ScrollTrigger) ────────────────
document.querySelectorAll('.mission__title, .partners__title, .phases__title, .cta__title').forEach(el => {
  const rvs = el.querySelectorAll('.rv')
  if (!rvs.length) return
  gsap.to(rvs, {
    y: 0,
    duration: 1.05,
    stagger: 0.1,
    ease: EXPO,
    scrollTrigger: {
      trigger: el,
      start: 'top 82%',
    }
  })
})

// ── Partner Modals ─────────────────────────────────────
const pModal = document.getElementById('partnerModal')
const pModalBg = document.getElementById('partnerModalBg')
const pModalContent = document.getElementById('partnerModalContent')
const pModalClose = document.getElementById('partnerModalClose')
const pModalName = document.getElementById('partnerModalName')
const pModalRole = document.getElementById('partnerModalRole')
const pModalInfo = document.getElementById('partnerModalInfo')
const pModalLink = document.getElementById('partnerModalLink')

let partnerModalOpen = false

if (pModal) {
  document.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('click', () => {
      // Set text and link
      pModalName.textContent = card.dataset.name
      pModalRole.textContent = card.dataset.role
      pModalInfo.textContent = card.dataset.info
      
      if (pModalLink && card.dataset.url) {
        pModalLink.href = card.dataset.url
        // Barrio opens in same tab, others in new tab
        const name = (card.dataset.name || '').toLowerCase().trim()
        const isBarrio = name.includes('barrio')
        pModalLink.setAttribute('target', isBarrio ? '_self' : '_blank')
        console.log(`Modal opened for: ${name}. Target set to: ${isBarrio ? '_self' : '_blank'}`)
      }
      
      // Reveal modal
      partnerModalOpen = true
      pModal.classList.add('partner-modal--open')
      lenis.stop()

      gsap.killTweensOf([pModalBg, pModalContent])
      gsap.to(pModalBg, { opacity: 1, duration: 0.45, ease: 'power2.out' })
      gsap.fromTo(pModalContent, 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: EXPO, delay: 0.1 }
      )
    })
  })

  function closePartnerModal() {
    if (!partnerModalOpen) return
    partnerModalOpen = false
    lenis.start()
    
    gsap.killTweensOf([pModalBg, pModalContent])
    gsap.to(pModalContent, { y: 30, opacity: 0, duration: 0.35, ease: 'power2.in' })
    gsap.to(pModalBg, { 
      opacity: 0, 
      duration: 0.4, 
      ease: 'power2.in', 
      delay: 0.1, 
      onComplete: () => pModal.classList.remove('partner-modal--open') 
    })
  }

  pModalClose.addEventListener('click', closePartnerModal)
  pModalBg.addEventListener('click', closePartnerModal)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && partnerModalOpen) closePartnerModal()
  })
}

// ── Stats Animation (Carousel) ─────────────────────────
const statsSection = document.querySelector('.stats')
const statsTrack   = document.querySelector('.stats__track')
const statCards    = document.querySelectorAll('.stat')

if (statsSection && statsTrack && statCards.length) {
  // 1. Infinite Horizontal Loop
  const loop = gsap.to(statsTrack, {
    xPercent: -50,
    ease: 'none',
    duration: 20, // speed
    repeat: -1
  })

  // Pause on hover
  statsSection.addEventListener('mouseenter', () => loop.pause())
  statsSection.addEventListener('mouseleave', () => loop.play())

  // 2. Count-up effect on first reveal
  ScrollTrigger.create({
    trigger: statsSection,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      statCards.forEach((card, i) => {
        const nEl = card.querySelector('.stat__n')
        if (!nEl) return

        const originalText = nEl.textContent
        const targetValue = parseFloat(originalText.replace(/[^\d.]/g, ''))
        const suffix = originalText.replace(/[\d.]/g, '')

        if (isNaN(targetValue)) return

        const counter = { val: 0 }
        gsap.to(counter, {
          val: targetValue,
          duration: 2,
          delay: i * 0.1,
          ease: 'power3.out',
          onUpdate: () => {
            nEl.textContent = Math.floor(counter.val).toLocaleString() + suffix
          }
        })
      })
    }
  })
}

// ── Generic reveals (IntersectionObserver) ────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible')
      io.unobserve(e.target)
    }
  })
}, { threshold: 0.18 })

document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left').forEach(el => io.observe(el))


// ── Launch ─────────────────────────────────────────────
window.addEventListener('load', initIntro)
