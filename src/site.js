/* Progressive enhancement: all content and links work before this file runs. */
(() => {
  'use strict';
  const root = document.documentElement;
  const fr = root.lang === 'fr';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const storage = { get(key) { try { return localStorage.getItem(key); } catch { return null; } }, set(key, value) { try { localStorage.setItem(key, value); } catch {} } };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const darkOS = matchMedia('(prefers-color-scheme: dark)');
  const narrow = matchMedia('(max-width: 900px)');
  let userTheme = storage.get('pref-theme');
  let motionPreference = storage.get('pref-motion') !== 'off';
  let toastTimeout;

  function toast(message) {
    const element = $('.toast');
    if (!element) return;
    clearTimeout(toastTimeout);
    element.textContent = message;
    element.classList.add('is-visible');
    toastTimeout = setTimeout(() => element.classList.remove('is-visible'), 3200);
  }
  async function copy(text, message) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      toast(message);
    } catch {
      // Keep failure explicit rather than claiming a successful copy.
      toast(fr ? `Copie indisponible. À sélectionner : ${text}` : `Copy unavailable. Select this text: ${text}`);
    }
  }
  $$('[data-copy]').forEach(button => button.addEventListener('click', () => copy(button.dataset.copy, fr ? 'Adresse copiée' : 'Address copied')));
  $$('[data-share]').forEach(button => button.addEventListener('click', () => copy(location.href, fr ? 'Lien copié' : 'Link copied')));

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const night = theme === 'dark';
    const button = $('.theme-toggle');
    button?.setAttribute('aria-pressed', String(night));
    const label = fr ? `Passer en mode ${night ? 'jour' : 'nuit'}` : `Switch to ${night ? 'day' : 'night'} mode`;
    button?.setAttribute('aria-label', label);
    button?.setAttribute('title', label);
    if ($('.theme-label')) $('.theme-label').textContent = fr ? (night ? 'Nuit' : 'Jour') : (night ? 'Night' : 'Day');
    if ($('.scene-caption-number')) $('.scene-caption-number').textContent = night ? '02 / 02' : '01 / 02';
    $('meta[name="theme-color"]')?.setAttribute('content', night ? '#14282d' : '#f6f3ea');
  }
  applyTheme(userTheme === 'dark' || userTheme === 'light' ? userTheme : darkOS.matches ? 'dark' : 'light');
  $('.theme-toggle')?.addEventListener('click', () => {
    userTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.set('pref-theme', userTheme);
    applyTheme(userTheme);
  });
  darkOS.addEventListener('change', () => { if (!userTheme) applyTheme(darkOS.matches ? 'dark' : 'light'); });

  const menu = $('.menu-toggle');
  function closeMenu(returnFocus = false) {
    root.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', fr ? 'Ouvrir le menu' : 'Open menu');
    if (returnFocus) menu?.focus();
  }
  menu?.addEventListener('click', () => {
    const open = root.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', fr ? (open ? 'Fermer le menu' : 'Ouvrir le menu') : (open ? 'Close menu' : 'Open menu'));
  });
  $('#primary-nav')?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && root.classList.contains('menu-open')) closeMenu(true); });
  narrow.addEventListener('change', () => { closeMenu(); if ($('.toc')) $('.toc').open = !narrow.matches; });
  if ($('.toc') && narrow.matches) $('.toc').open = false;

  // Keep old shared links functional without resetting normal anchors or history.
  const legacy = location.hash.match(/^#(?:project|kase|case)=([a-z0-9-]+)$/);
  if (legacy) {
    const known = window.PORTFOLIO_ROUTES || {};
    const kind = location.hash.startsWith('#project=') ? 'projects' : 'articles';
    if (known[kind]?.includes(legacy[1])) {
      const base = fr ? (kind === 'projects' ? '/projets/' : '/carnet/') : (kind === 'projects' ? '/en/projects/' : '/en/journal/');
      location.replace(base + legacy[1] + '/');
      return;
    }
  }
  if (document.body.dataset.page === 'home') {
    const aliases = { '#cases': '#journal', '#about': '#skills' };
    if (aliases[location.hash]) {
      const hash = aliases[location.hash];
      history.replaceState(null, '', location.pathname + location.search + hash);
      $(hash)?.scrollIntoView();
    }
    $('.lang-link')?.addEventListener('click', event => {
      if (/^#(projects|journal|skills|contact)$/.test(location.hash)) event.currentTarget.hash = location.hash;
    });
  }

  // Filters are optional enhancement; the HTML contains the complete collection.
  const form = $('[data-filter-form]');
  if (form) {
    const collection = $$('[data-filter-item]');
    const normal = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const params = new URLSearchParams(location.search);
    const q = form.elements.namedItem('q'), type = form.elements.namedItem('type'), project = form.elements.namedItem('project');
    q.value = params.get('q') || '';
    const allowed = $$('[data-filter]', form).map(button => button.dataset.filter);
    type.value = allowed.includes(params.get('type')) ? params.get('type') : '';
    if (project) project.value = [...project.options].some(option => option.value === params.get('project')) ? params.get('project') : '';
    function filter(updateURL = true) {
      const words = normal(q.value).split(/\s+/).filter(Boolean);
      let count = 0;
      for (const card of collection) {
        const search = normal(card.dataset.search);
        const match = words.every(word => search.includes(word)) && (!type.value || card.dataset.categories.split(' ').includes(type.value)) && (!project?.value || (card.dataset.projects || '').split(' ').includes(project.value));
        card.hidden = !match;
        if (match) count++;
      }
      $$('[data-filter]', form).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === type.value)));
      $('.result-count', form).textContent = `${count} ${fr ? `résultat${count === 1 ? '' : 's'}` : `result${count === 1 ? '' : 's'}`}`;
      if ($('.empty-state')) $('.empty-state').hidden = count !== 0;
      if (updateURL) {
        const url = new URL(location.href);
        for (const key of ['q', 'type', 'project']) {
          const value = form.elements.namedItem(key)?.value.trim();
          if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
        }
        history.replaceState(null, '', url);
      }
    }
    form.addEventListener('submit', event => { event.preventDefault(); filter(); });
    form.addEventListener('input', () => filter());
    form.addEventListener('change', () => filter());
    $$('[data-filter]', form).forEach(button => button.addEventListener('click', () => { type.value = button.dataset.filter; filter(); }));
    $('[data-reset-filters]')?.addEventListener('click', () => { q.value = ''; type.value = ''; if (project) project.value = ''; filter(); q.focus(); });
    filter(false);
  }

  // Native dialog supplies focus trapping and Escape. Each thumbnail remains a real image link.
  const dialog = $('#lightbox');
  if (dialog?.showModal) {
    let gallery = [], current = 0, trigger = null, oldOverflow = '';
    function showImage(index) {
      current = (index + gallery.length) % gallery.length;
      const a = gallery[current], img = $('figure img', dialog);
      img.src = a.href;
      img.alt = a.dataset.caption || $('img', a)?.alt || '';
      $('figcaption', dialog).textContent = img.alt;
      $('.lightbox-counter', dialog).textContent = `${current + 1} / ${gallery.length}`;
      $('[data-lightbox-prev]', dialog).hidden = gallery.length <= 1;
      $('[data-lightbox-next]', dialog).hidden = gallery.length <= 1;
    }
    document.addEventListener('click', event => {
      const a = event.target.closest('a[data-gallery]');
      if (!a || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      trigger = a;
      gallery = $$('a[data-gallery]').filter(x => x.dataset.gallery === a.dataset.gallery);
      showImage(gallery.indexOf(a));
      oldOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      $('[data-lightbox-close]', dialog).focus();
    });
    $('[data-lightbox-close]', dialog).addEventListener('click', () => dialog.close());
    $('[data-lightbox-prev]', dialog).addEventListener('click', () => showImage(current - 1));
    $('[data-lightbox-next]', dialog).addEventListener('click', () => showImage(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showImage(current + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.style.overflow = oldOverflow; trigger?.focus({ preventScroll: true }); });
  }

  let y = window.scrollY, maxScroll = 1, height = innerHeight, width = innerWidth;
  let scrollPending = false;
  const tree = $('.tree'), bar = $('.reading-progress span');
  function scrollUpdate() {
    scrollPending = false;
    y = window.scrollY;
    const progress = Math.max(0, Math.min(1, y / maxScroll));
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (tree) {
      const offset = root.dataset.motion === 'on' ? Math.min(height * .4, y * .18) : height * .12;
      tree.style.transform = `translate3d(${Math.min(72, y * .04)}px,${offset}px,0)`;
    }
    $('.site-header')?.classList.toggle('is-scrolled', y > 40);
  }
  function scheduleScroll() { if (!scrollPending) { scrollPending = true; requestAnimationFrame(scrollUpdate); } }
  addEventListener('scroll', scheduleScroll, { passive: true });
  const resize = () => { width = innerWidth; height = innerHeight; maxScroll = Math.max(1, document.documentElement.scrollHeight - height); scheduleScroll(); resizeCanvas(); };
  addEventListener('resize', resize, { passive: true });
  addEventListener('pageshow', () => { resize(); syncMotion(); });
  if (window.ResizeObserver) new ResizeObserver(() => { maxScroll = Math.max(1, root.scrollHeight - innerHeight); scheduleScroll(); }).observe(document.body);

  if (window.IntersectionObserver) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (root.dataset.motion === 'on') entry.target.setAttribute('data-enter', '');
      reveal.unobserve(entry.target);
    }), { threshold: .12 });
    $$('[data-reveal]').forEach(element => reveal.observe(element));
    const anchorLinks = document.body.dataset.page === 'home' ? $$('[data-nav]') : $$('.toc a');
    const targets = new Map();
    for (const a of anchorLinks) {
      const target = document.getElementById(a.hash.slice(1));
      if (target) targets.set(target, a);
    }
    const active = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        anchorLinks.forEach(a => a.removeAttribute('aria-current'));
        targets.get(entry.target)?.setAttribute('aria-current', 'location');
      }
    }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 });
    targets.forEach((a, target) => active.observe(target));
  }

  // Decorative sprites only, bounded count and DPR, suspended when hidden/disabled.
  const canvas = $('#leaf-canvas'), ctx = canvas?.getContext('2d');
  const sprites = {};
  if (canvas) for (const key of ['day', 'night']) { const img = new Image(); img.src = canvas.dataset[key]; sprites[key] = img; }
  const leaves = Array.from({ length: 18 }, () => ({ x: Math.random(), y: Math.random(), speed: .016 + Math.random() * .02, size: 10 + Math.random() * 13, turn: Math.random() * Math.PI * 2, tile: Math.floor(Math.random() * 9) }));
  let frame = 0, previous = 0;
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const animateAllowed = () => root.dataset.motion === 'on' && !document.hidden;
  function animate(now) {
    if (!animateAllowed() || !ctx) { frame = 0; return; }
    frame = requestAnimationFrame(animate);
    if (now - previous < 32) return;
    const dt = Math.min((now - previous) / 1000, .06); previous = now;
    ctx.clearRect(0, 0, width, height);
    const sprite = sprites[root.dataset.theme === 'dark' ? 'night' : 'day'];
    if (!sprite?.complete || !sprite.naturalWidth) return;
    const tileWidth = sprite.naturalWidth / 3, tileHeight = sprite.naturalHeight / 3;
    for (const leaf of (width <= 640 ? leaves.slice(0, 6) : leaves)) {
      leaf.y += dt * leaf.speed; leaf.x -= dt * .012; leaf.turn += dt * .3;
      if (leaf.y > 1.06 || leaf.x < -.1) { leaf.y = -.08; leaf.x = .5 + Math.random() * .6; }
      ctx.save(); ctx.globalAlpha = .52;
      ctx.translate(leaf.x * width + Math.sin(leaf.turn * 2) * 28, leaf.y * height);
      ctx.rotate(leaf.turn);
      ctx.drawImage(sprite, (leaf.tile % 3) * tileWidth, Math.floor(leaf.tile / 3) * tileHeight, tileWidth, tileHeight, -leaf.size / 2, -leaf.size / 2, leaf.size, leaf.size);
      ctx.restore();
    }
  }
  function syncMotion() {
    root.dataset.motion = motionPreference && !reduced.matches ? 'on' : 'off';
    const active = root.dataset.motion === 'on';
    $('.motion-toggle')?.setAttribute('aria-pressed', String(active));
    if ($('.motion-state')) $('.motion-state').textContent = active ? 'On' : 'Off';
    $('.motion-toggle')?.setAttribute('title', reduced.matches ? (fr ? 'Animations réduites dans les réglages de votre appareil' : 'Reduced motion is enabled on your device') : (fr ? 'Activer ou suspendre les animations' : 'Enable or pause motion'));
    if (!animateAllowed()) { if (frame) cancelAnimationFrame(frame); frame = 0; ctx?.clearRect(0, 0, width, height); }
    else if (!frame) { previous = performance.now(); frame = requestAnimationFrame(animate); }
    scheduleScroll();
  }
  $('.motion-toggle')?.addEventListener('click', () => {
    if (reduced.matches) { toast(fr ? 'Les animations suivent le réglage de réduction des mouvements de votre appareil' : 'Motion follows your device’s reduced-motion setting'); return; }
    motionPreference = !motionPreference;
    storage.set('pref-motion', motionPreference ? 'on' : 'off'); syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  addEventListener('resize', syncMotion, { passive: true });
  resize(); syncMotion();
})();
