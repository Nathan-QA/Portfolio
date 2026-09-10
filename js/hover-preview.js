// One muted preview at a time. The original cover stays visible until playback.
// YouTube is contacted only after an intentional hover, never at page load.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let apiPromise;
function youtubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onYouTubeIframeAPIReady;
    const timer = setTimeout(() => fail(), 10000);
    function fail() { clearTimeout(timer); script.remove(); apiPromise = null; reject(new Error('YouTube unavailable')); }
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      try { previous?.(); } finally { resolve(window.YT); }
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = fail;
    document.head.append(script);
  });
  return apiPromise;
}
export function trailerSource(value) {
  const raw = String(value || '').trim();
  if (/^[\w-]{11}$/.test(raw)) return {type:'youtube', id:raw};
  try {
    const url = new URL(raw, location.href);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (/\.(mp4|webm)$/i.test(url.pathname)) return {type:'video', url:url.href};
    const host = url.hostname.replace(/^www\./, '');
    let id;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    if (['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)) {
      id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    }
    if (/^[\w-]{11}$/.test(id || '')) return {type:'youtube', id};
  } catch { /* Invalid content must leave the poster alone. */ }
  return null;
}
let dispose = () => {};
export function bindProjectPreviews(projects) {
  dispose();
  const abort = new AbortController(), {signal} = abort;
  let active = null, pending = null, timer, sequence = 0;
  const entries = [...document.querySelectorAll('#projectList .project-tile')].map((card, i) => ({
    card, media:card.querySelector('[data-media]'), source:trailerSource(projects[i]?.trailer)
  })).filter(x => x.media && x.source);
  const allowed = () => finePointer.matches && !reduced.matches && !navigator.connection?.saveData && !document.hidden && !document.querySelector('#modalRoot .modal');
  function stop() {
    clearTimeout(timer); pending = null; sequence++;
    if (!active) return;
    const current = active; active = null;
    clearTimeout(current.timeout);
    current.card.classList.remove('preview-playing');
    if (current.video) { current.video.pause(); current.video.removeAttribute('src'); current.video.load(); }
    try { current.player?.destroy(); } catch { /* A failed provider may already have removed its frame. */ }
    current.layer.remove();
  }
  async function start(entry, token) {
    if (token !== sequence || !allowed() || !entry.card.matches(':hover')) return;
    const layer = document.createElement('div'); layer.className = 'project-preview'; layer.setAttribute('aria-hidden','true');
    const current = {...entry, layer, timeout:null, player:null, video:null};
    active = current; entry.media.append(layer);
    const valid = () => token === sequence && active === current && allowed() && entry.card.isConnected;
    const playing = () => { if(valid()) { clearTimeout(current.timeout); entry.card.classList.add('preview-playing'); } };
    const fail = () => { if(active === current) stop(); };
    current.timeout = setTimeout(fail, 14000);
    if(entry.source.type === 'video') {
      const video = document.createElement('video'); current.video = video;
      video.muted = video.defaultMuted = true; video.playsInline = true; video.loop = true; video.preload = 'none'; video.tabIndex = -1;
      video.addEventListener('playing', playing, {signal}); video.addEventListener('error', fail, {signal});
      layer.append(video); video.src = entry.source.url;
      video.play().catch(fail); return;
    }
    try {
      const YT = await youtubeAPI(); if (!valid()) return;
      const mount = document.createElement('div'); layer.append(mount);
      const player = new YT.Player(mount, {
        host:'https://www.youtube-nocookie.com', videoId:entry.source.id,
        playerVars:{autoplay:0, controls:0, disablekb:1, fs:0, playsinline:1, rel:0, origin:location.origin},
        events:{
          onReady:event => { if(valid()) { event.target.mute(); event.target.playVideo(); } },
          onStateChange:event => { if(event.data === 1) playing(); else if(event.data === 0) fail(); },
          onError:fail, onAutoplayBlocked:fail
        }
      });
      current.player = player;
      const frame = player.getIframe();
      frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
      frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
      frame.setAttribute('title',entry.card.getAttribute('aria-label') + ' trailer');
      frame.setAttribute('aria-hidden','true'); frame.tabIndex = -1;
    } catch { fail(); }
  }
  for(const entry of entries) {
    entry.card.dataset.hasTrailer = 'true';
    entry.card.addEventListener('pointerenter', event => {
      if(event.pointerType === 'touch' || !allowed()) return;
      stop(); pending = entry; const token = sequence;
      timer = setTimeout(() => start(entry, token), 280);
    }, {signal});
    entry.card.addEventListener('pointerleave', () => { if(active?.card === entry.card || pending === entry) stop(); }, {signal});
    entry.card.addEventListener('pointerdown', stop, {signal});
    entry.card.addEventListener('click', stop, {signal, capture:true});
  }
  const observer = new IntersectionObserver(records => {
    const current = active || pending;
    if(records.some(r => r.target === current?.card && r.intersectionRatio < .45)) stop();
  }, {threshold:[0,.45]});
  entries.forEach(x => observer.observe(x.card));
  const modalObserver = new MutationObserver(() => { if(document.querySelector('#modalRoot .modal')) stop(); });
  modalObserver.observe(document.getElementById('modalRoot'), {childList:true});
  document.addEventListener('visibilitychange', stop, {signal});
  window.addEventListener('pagehide', stop, {signal});
  finePointer.addEventListener('change', stop, {signal}); reduced.addEventListener('change', stop, {signal});
  dispose = () => { stop(); abort.abort(); observer.disconnect(); modalObserver.disconnect(); };
}
