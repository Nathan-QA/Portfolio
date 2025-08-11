// Burger + header sticky (piloté par le bas du hero via un sentinel)
export function initHeader(){
  const header = document.querySelector('.header');
  const chk    = document.getElementById('navChk');
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('primaryNav');
  const doc    = document.documentElement;
  const body   = document.body;
  const hero   = document.getElementById('hero-banner');
  const sentinel = document.getElementById('afterHeroSentinel');

  /* ---------- NAV : burger / fermeture / ARIA ---------- */
  const syncExpanded = () => {
    if (toggle) toggle.setAttribute('aria-expanded', chk && chk.checked ? 'true' : 'false');
  };
  if (chk) {
    chk.addEventListener('change', () => {
      header?.classList.toggle('menu-open', chk.checked);
      syncExpanded();
    });
  }
  nav?.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      if (chk) chk.checked = false;
      header?.classList.remove('menu-open');
      syncExpanded();
    }, { passive: true });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && chk && chk.checked) {
      chk.checked = false;
      header?.classList.remove('menu-open');
      syncExpanded();
    }
  });
  document.addEventListener('click', e => {
    if (!header?.classList.contains('menu-open')) return;
    if (!header.contains(e.target)) {
      if (chk) chk.checked = false;
      header.classList.remove('menu-open');
      syncExpanded();
    }
  }, { capture: true });

  /* ---------- Sticky poussé par le hero ---------- */
  if (!header) return;

  // Met à jour --headerH (sert à la nav mobile + scroll-margin pour ancres)
  const setHeaderH = () => {
    // offsetHeight peut fluctuer -> arrondir pour éviter le "tremblement"
    const h = Math.round(header.offsetHeight || 0);
    doc.style.setProperty('--headerH', h + 'px');
  };

  // Calcul progressif : de -headerH à 0 pendant que le hero sort
  let raf = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const computeStick = () => {
    raf = 0;
    if (!hero) {                         // Fallback si pas de hero
      doc.style.setProperty('--stickTop', '0px');
      body.classList.add('after-hero');
      return;
    }
    const h = header.offsetHeight || 0;
    const H = hero.offsetHeight   || 1;
    const btm = hero.getBoundingClientRect().bottom; // bord bas du hero vs viewport top
    // progress 0 → 1, puis mappé sur [-h, 0]
    const t = clamp(1 - (btm / H), 0, 1);
    const topVal = -h * (1 - t);
    doc.style.setProperty('--stickTop', Math.round(topVal) + 'px');
    body.classList.toggle('after-hero', btm <= 0);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(computeStick); };

  // Sentinel : garantit l'accroche à 0 au moment exact où on dépasse le hero
  if (sentinel && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries)=>{
      const e = entries[0];
      // Quand le sentinel sort par le haut (intersection=false), on est "après hero"
      body.classList.toggle('after-hero', !e.isIntersecting && e.boundingClientRect.top <= 0);
      // Sécurise la valeur finale (évite rester à -1px sur certains moteurs)
      if (!e.isIntersecting && e.boundingClientRect.top <= 0) {
        doc.style.setProperty('--stickTop', '0px');
      }
    }, { root: null, threshold: 0, rootMargin: '0px' });
    io.observe(sentinel);
  }

  // Init + écouteurs
  setHeaderH();
  computeStick();

  addEventListener('resize', () => { setHeaderH(); schedule(); }, { passive:true });
  addEventListener('orientationchange', () => { setHeaderH(); schedule(); }, { passive:true });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { setHeaderH(); schedule(); }).observe(header);
    if (hero) new ResizeObserver(() => schedule()).observe(hero);
  }

  addEventListener('scroll', schedule, { passive:true });
  addEventListener('load',  () => { setHeaderH(); schedule(); }, { passive:true });
}
