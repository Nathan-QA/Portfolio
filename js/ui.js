// ui.js - curtain OFF < 900px (robuste), toggle auto sur resize, particles clean
import { byId, el, $ } from './utils.js';
import { state } from './state.js';
import { CONFIG } from './config.js';

/* =========================
   Threshold & runtimes
========================= */
const CURTAIN_MIN_WIDTH = 900;

const curtainRuntime = {
  enabled: false,
  wrap: null,
  left: null,
  right: null,
  rafId: null,
  listeners: [], // [{target, type, fn, opts}]
  resetStyles() {
    if (!this.wrap) return;
    this.wrap.style.display = 'none';
    this.wrap.classList.remove('curtain-ready', 'curtain-out');
    this.wrap.style.removeProperty('--slidePct');
    this.wrap.style.removeProperty('--treeX');
    this.wrap.style.removeProperty('--treeY');
    this.wrap.style.removeProperty('--treeOpacity');
    this.left?.style.removeProperty('--leafScale');
    this.left?.style.removeProperty('--leafBright');
    this.left?.style.removeProperty('transform');
    this.left?.style.removeProperty('opacity');
    this.right?.style.removeProperty('--leafScale');
    this.right?.style.removeProperty('--leafBright');
    this.right?.style.removeProperty('transform');
    this.right?.style.removeProperty('opacity');
    this.right?.style.removeProperty('visibility');
  },
  off() {
    if (!this.enabled && !this.wrap) return;
    this.enabled = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    for (const L of this.listeners) L.target.removeEventListener(L.type, L.fn, L.opts);
    this.listeners.length = 0;
    this.resetStyles();
  }
};

const particlesRuntime = {
  running: false,
  spawnTimer: null,
  onKeyObs: null,
  onScrollRef: null,
  themeObserver: null,
  rafId: null,
  layerId: 'leafLayer',
  off() {
    this.running = false;
    if (this.spawnTimer) { clearInterval(this.spawnTimer); this.spawnTimer = null; }
    if (this.onScrollRef) { window.removeEventListener('scroll', this.onScrollRef); this.onScrollRef = null; }
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    if (this.themeObserver) { this.themeObserver.disconnect(); this.themeObserver = null; }
    byId(this.layerId)?.remove();
  }
};

/* =========================
   Helpers
========================= */
const nextFrame = () => new Promise(r => requestAnimationFrame(r));
function rect(el){
  const r = el.getBoundingClientRect();
  return { left:r.left, top:r.top, width:r.width, height:r.height };
}
function borderRadius(el){
  const cs = getComputedStyle(el);
  return cs.borderRadius || cs.borderTopLeftRadius || '12px';
}
function inDoc(el){ return !!(el && document.body.contains(el)); }
function pageScrollY(){
  const doc = document.scrollingElement || document.documentElement;
  return Math.max(
    0,
    window.pageYOffset || window.scrollY || doc?.scrollTop ||
    document.documentElement?.scrollTop || document.body?.scrollTop || 0
  );
}

// Récupère une image exploitable depuis un élément (img/vid/bg)
function mediaFromElement(el){
  if(!el) return {url:'', type:'none'};
  const img = el.tagName === 'IMG' ? el : el.querySelector('img');
  if(img && (img.currentSrc || img.src)) return {url: img.currentSrc || img.src, type:'img'};
  const vid = el.tagName === 'VIDEO' ? el : el.querySelector('video');
  if(vid && (vid.poster || vid.currentSrc)) return {url: vid.poster || vid.currentSrc, type:'video'};
  const bg = getComputedStyle(el).backgroundImage;
  if(bg && bg !== 'none'){
    const m = bg.match(/url\(["']?(.*?)["']?\)/);
    if(m && m[1]) return {url:m[1], type:'bg'};
  }
  return {url:'', type:'none'};
}

// Ghost fixed avec background cover (pas d’étirement)
function makeGhost(url, fromRect, radius){
  return el(`<div style="
    position:fixed; left:${Math.round(fromRect.left)}px; top:${Math.round(fromRect.top)}px;
    width:${Math.round(fromRect.width)}px; height:${Math.round(fromRect.height)}px;
    ${url ? `background:url('${url}') center/cover no-repeat;` : `background: var(--panel);`}
    border-radius:${radius};
    box-shadow:0 10px 28px rgba(0,0,0,.25);
    border:1px solid color-mix(in oklab, var(--ring) 80%, transparent);
    transform: translate3d(0,0,0) scale(1);
    will-change: transform, border-radius, opacity;
    z-index:2050; pointer-events:none;
  "></div>`);
}

// Anim uniforme centre→centre (scale isotrope)
function animateUniform(node, fromRect, toRect, rStart, rEnd, duration=300){
  const fcx = fromRect.left + fromRect.width/2;
  const fcy = fromRect.top  + fromRect.height/2;
  const tcx = toRect.left   + toRect.width/2;
  const tcy = toRect.top    + toRect.height/2;

  const scale = Math.min(toRect.width/fromRect.width, toRect.height/fromRect.height);
  const dx = tcx - fcx;
  const dy = tcy - fcy;

  // Force layout puis transition
  node.getBoundingClientRect();
  node.style.transition = `transform ${duration}ms cubic-bezier(.2,.8,.2,1), border-radius ${duration}ms cubic-bezier(.2,.8,.2,1), opacity 180ms cubic-bezier(.2,.8,.2,1)`;
  node.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  node.style.borderRadius = rEnd;

  return new Promise(res => setTimeout(res, duration));
}

/* =========================
   Modal & Lightbox
========================= */
export async function openModal(title, bodyHTML, {originEl=null, showBack=false, onBack=null, onReady, modalClass=''}={}){
  const root = byId('modalRoot'); if(!root) return;

  const backdrop = el(`<div class="modal-backdrop">
    <div class="modal ${modalClass}" role="dialog" aria-modal="true">
      <header>
        ${showBack?`<button class="back" aria-label="Back">←</button>`:''}
        <h3 style="margin:0">${title||''}</h3>
        <button class="x" aria-label="Close">✕</button>
      </header>
      <div class="modal-body">${bodyHTML||''}</div>
    </div>
  </div>`);
  root.innerHTML=''; 
  root.appendChild(backdrop);

  const modal = backdrop.querySelector('.modal');
  const shell = modal.querySelector('[data-media-shell]') || modal;

  const wire = ()=>{
    if (!backdrop.isConnected) return;
    document.body.classList.add('no-scroll');
    backdrop.addEventListener('click',e=>{ if(e.target===backdrop) closeModal({originEl}); }, {passive:true});
    modal.querySelector('.x')?.addEventListener('click',()=>closeModal({originEl}));
    if(showBack && onBack){ modal.querySelector('.back')?.addEventListener('click',()=>onBack()); }
    onReady && onReady(modal);
  };

  const canMorph = originEl && inDoc(originEl) && !state.prefersReduced;

  if(!canMorph){
    requestAnimationFrame(()=>{
      backdrop.classList.add('backdrop-show');
      wire();
    });
    return;
  }

  const fromRect = rect(originEl);
  const media    = mediaFromElement(originEl);
  const ghost    = makeGhost(media.url, fromRect, borderRadius(originEl));

  backdrop.classList.add('backdrop-show');
  modal.style.animation = 'none';
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';

  document.body.appendChild(ghost);

  await nextFrame();
  await nextFrame();

  const toRect = rect(shell);
  await animateUniform(ghost, fromRect, toRect, borderRadius(originEl), borderRadius(shell), 340);

  ghost.remove();
  if (!backdrop.isConnected) return;
  modal.style.opacity = '';
  modal.style.pointerEvents = '';
  modal.style.animation = '';
  wire();
}

export function closeModal({originEl=null}={}){
  const root = byId('modalRoot'); if(!root) return;
  const backdrop = root.firstChild;
  if(!backdrop){ root.innerHTML=''; return; }

  const modal = backdrop.querySelector('.modal');
  const shell = modal.querySelector('[data-media-shell]') || modal;

  const canMorph = originEl && inDoc(originEl) && !state.prefersReduced;

  if(!canMorph){
    root.innerHTML='';
    document.body.classList.remove('no-scroll');
    return;
  }

  const fromRect = rect(shell);
  const toRect   = rect(originEl);
  const media    = mediaFromElement(shell) || mediaFromElement(originEl);
  const ghost    = makeGhost(media.url, fromRect, borderRadius(shell));
  document.body.appendChild(ghost);

  root.innerHTML='';
  document.body.classList.remove('no-scroll');

  animateUniform(ghost, fromRect, toRect, borderRadius(shell), borderRadius(originEl), 300)
    .then(()=> ghost.remove());
}

export function openGallery(imgs,i=0){
  const root=byId('lightboxRoot'); if(!root) return;
  closeGallery(); 
  if(!imgs || (!Array.isArray(imgs) && typeof imgs !== 'string')) return;

  document.body.classList.add('no-scroll');
  const list = Array.isArray(imgs) ? imgs : [imgs];
  let k = i|0;

  const n = el(`<div class="lightbox" role="dialog" aria-modal="true">
    <button class="lb-btn x" aria-label="Close">✕</button>
    <button class="lb-prev" aria-label="Prev">‹</button>
    <img src="${list[Math.max(0,Math.min(k,list.length-1))]}" alt="">
    <button class="lb-next" aria-label="Next">›</button>
  </div>`);
  byId('lightboxRoot').appendChild(n); requestAnimationFrame(()=>n.classList.add('show'));

  const setImg = ()=> n.querySelector('img').setAttribute('src', list[k]);
  const prev   = ()=>{ k=(k-1+list.length)%list.length; setImg(); };
  const next   = ()=>{ k=(k+1)%list.length; setImg(); };

  n.addEventListener('click',e=>{ if(e.target===n) closeGallery(); });
  n.querySelector('.x')?.addEventListener('click', closeGallery);
  n.querySelector('.lb-prev')?.addEventListener('click', prev);
  n.querySelector('.lb-next')?.addEventListener('click', next);

  const onKey = (e)=>{ 
    if(e.key==='Escape') closeGallery();
    if(e.key==='ArrowLeft') prev();
    if(e.key==='ArrowRight') next();
  };
  window.addEventListener('keydown', onKey);
  n._onKey = onKey;
}
export function closeGallery(){
  const root=byId('lightboxRoot'); if(!root) return;
  const n=root.firstChild;
  if(n && n._onKey) window.removeEventListener('keydown', n._onKey);
  root.innerHTML='';
  if (!byId('modalRoot')?.firstChild) document.body.classList.remove('no-scroll');
}

function mediaAttr(v){
  return String(v ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
}
function youtubeEmbedId(v){
  const raw = String(v || '').trim();
  if(!/^https?:\/\//i.test(raw)) return raw;
  try{
    const u = new URL(raw);
    if(u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || raw;
    if(u.hostname.includes('youtube.com')){
      return u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || raw;
    }
  }catch{}
  return raw;
}
export const yt = (id,autoplay=false,muted=false)=>{
  const src = String(id || '').trim();
  const isUrl = /^https?:\/\//i.test(src);
  const isVideo = isUrl && /\.(mp4|webm)(\?|#|$)/i.test(src);
  if(isVideo){
    const type = /\.webm(\?|#|$)/i.test(src) ? 'video/webm' : 'video/mp4';
    const attrs = `${autoplay?' autoplay':''}${muted?' muted':''}${autoplay&&muted?' loop':''}${autoplay&&muted?'':' controls'}`;
    return `<video${attrs} playsinline preload="metadata" style="width:100%;height:100%;display:block;object-fit:cover">
      <source src="${mediaAttr(src)}" type="${type}">
    </video>`;
  }
  const embedId = youtubeEmbedId(src);
  return `<iframe src="https://www.youtube-nocookie.com/embed/${mediaAttr(embedId)}?rel=0${autoplay?'&autoplay=1':''}${muted?'&mute=1':''}"
    allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture; web-share"
    allowfullscreen style="width:100%;height:100%;display:block;border:0"></iframe>`;
};

export const mediaShellHtml = (inner='') =>
  `<div class="media-shell" data-media-shell>${inner}</div>`;

/* =========================
   Curtain (ouverture latérale)
========================= */
export function startCurtain(){
  const wrap = byId('curtain');
  if (!wrap) return;

  const underThreshold = window.innerWidth < CURTAIN_MIN_WIDTH;
  if (underThreshold) {
    curtainRuntime.off();
    particlesRuntime.off();
    return;
  }

  if (curtainRuntime.enabled) return;

  const left  = wrap.querySelector('.left');
  const right = wrap.querySelector('.right');
  if (!right) return;

  curtainRuntime.wrap = wrap;
  curtainRuntime.left = left;
  curtainRuntime.right = right;

  const {
    scaleDelta, darkDelta, easing, followHz,
    wobbleGain, wobbleFreq, wobbleDecay, desync
  } = CONFIG.CURTAIN;

  if (CONFIG.CURTAIN.leftImg)  left?.style.setProperty('--leaf-img', `url("${CONFIG.CURTAIN.leftImg}")`);
  if (CONFIG.CURTAIN.rightImg) right.style.setProperty('--leaf-img', `url("${CONFIG.CURTAIN.rightImg}")`);
  if (CONFIG.CURTAIN.leafSize) {
    left ?.style.setProperty('--leaf-size', CONFIG.CURTAIN.leafSize);
    right.style.setProperty('--leaf-size', CONFIG.CURTAIN.leafSize);
  }

  wrap.style.display = '';
  wrap.classList.add('curtain-ready');
  wrap.classList.remove('curtain-out');
  wrap.style.setProperty('--slidePct', '0px');
  wrap.style.setProperty('--treeX', '0px');
  wrap.style.setProperty('--treeY', '0px');
  left ?.style.setProperty('--leafScale', '1');
  right.style.setProperty('--leafScale', '1');
  left ?.style.setProperty('--leafBright', '1');
  right.style.setProperty('--leafBright', '1');
  right.style.opacity = '1';
  right.style.visibility = 'visible';

  const clamp01 = v => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
  const easeFn = (t)=>{
    t = clamp01(t);
    if (easing === 'easeOut')   return 1 - Math.pow(1 - t, 3);
    if (easing === 'easeInOut') return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    return t*t*t*(t*(t*6 - 15) + 10);
  };

  function travelPx(){
    const panelWidth = right.offsetWidth || right.getBoundingClientRect().width || window.innerWidth * 0.5;
    const buffer = Math.max(180, window.innerWidth * 0.14);
    return panelWidth + buffer;
  }

  function maxScrollPx(){
    // Distance de scroll utilisée pour faire sortir l'arbre.
    // Plus la valeur est haute, plus le mouvement est lent.
    // 150vh garde le mouvement progressif sans laisser l'arbre bloqué trop longtemps sur les sections.
    const vhDistance = Number(CONFIG.CURTAIN.maxScrollVh) || 150;
    return Math.max(1, window.innerHeight * (vhDistance / 100));
  }

  function readTarget(){
    return easeFn(pageScrollY() / maxScrollPx());
  }

  let target = readTarget();
  let cur = target;
  let lastT = performance.now();
  let wobbleA = 0;
  const maxWobble = 0.035;

  function apply(t){
    t = clamp01(t);

    const micro = desync * 0.06 * (1 - t);
    const x = travelPx() * t;
    const y = window.innerHeight * 0.08 * t;
    const leafScale  = 1 - t * scaleDelta;
    const leafBright = 1 - t * darkDelta;

    wrap.style.setProperty('--slidePct', `${x.toFixed(2)}px`);
    wrap.style.setProperty('--treeX', `${x.toFixed(2)}px`);
    wrap.style.setProperty('--treeY', `${y.toFixed(2)}px`);

    right.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    right.style.opacity = '1';
    right.style.visibility = 'visible';
    right.style.setProperty('--leafScale',  (leafScale * (1 - micro)).toFixed(4));
    right.style.setProperty('--leafBright', Math.max(0, leafBright * (1 - micro*0.4)).toFixed(4));
    left ?.style.setProperty('--leafScale',  (leafScale * (1 + micro)).toFixed(4));
    left ?.style.setProperty('--leafBright', Math.max(0, leafBright * (1 + micro*0.4)).toFixed(4));
  }

  function updateTarget(){
    if (!curtainRuntime.enabled) return;
    if (window.innerWidth < CURTAIN_MIN_WIDTH) {
      curtainRuntime.off();
      particlesRuntime.off();
      return;
    }
    const next = readTarget();
    const delta = Math.abs(next - target);
    wobbleA = Math.min(maxWobble, wobbleA + delta * wobbleGain * (1 - next));
    target = next;
  }

  function loop(ts){
    if (!curtainRuntime.enabled) return;
    if (window.innerWidth < CURTAIN_MIN_WIDTH) {
      curtainRuntime.off();
      particlesRuntime.off();
      return;
    }

    updateTarget();
    const dt = Math.min(0.033, (ts - lastT) / 1000);
    lastT = ts;

    const alpha = 1 - Math.exp(-dt * followHz);
    cur += (target - cur) * alpha;
    wobbleA *= Math.exp(-dt * wobbleDecay);

    const wobble = Math.sin(ts/1000 * wobbleFreq * 2*Math.PI) * wobbleA;
    apply(clamp01(cur + wobble));

    curtainRuntime.rafId = requestAnimationFrame(loop);
  }

  const addL = (targetEl, type, fn, opts)=> {
    targetEl.addEventListener(type, fn, opts);
    curtainRuntime.listeners.push({target: targetEl, type, fn, opts});
  };

  addL(window, 'scroll', updateTarget, {passive:true});
  addL(window, 'resize', updateTarget, {passive:true});
  addL(window, 'orientationchange', updateTarget, {passive:true});
  addL(window, 'load', updateTarget, {passive:true});

  curtainRuntime.enabled = true;
  apply(cur);
  curtainRuntime.rafId = requestAnimationFrame(loop);
}

/* =========================
   Particules feuilles (derrière curtain)
========================= */
export function initLeafParticles(){
  const underThreshold = window.innerWidth < CURTAIN_MIN_WIDTH;
  const banner = byId('hero-banner');
  const curtain = byId('curtain');
  const rightPanel = $('#curtain .right');

  if (underThreshold || !banner || !curtain || !rightPanel) {
    particlesRuntime.off();
    return;
  }
  if (particlesRuntime.running) return;

  // Crée/replace la couche de particules
  let layer = byId(particlesRuntime.layerId);
  if (!layer) {
    layer = document.createElement('div');
    layer.id = particlesRuntime.layerId;
    layer.className = 'leaf-layer';
    curtain.parentNode.insertBefore(layer, curtain);
  }
  layer.style.zIndex = '880';
  layer.style.pointerEvents = 'none';
  layer.style.position = 'fixed';
  layer.style.inset = '0';

  const SPRITE_COLS = 3, SPRITE_ROWS = 3;
  const SPRITE_DAY   = 'assets/leaf_cliff_particles_grid_export.png';
  const SPRITE_NIGHT = 'assets/leafN_cliff_particles_grid_export.png';
  const isDark = () => document.documentElement.dataset.theme === 'dark';
  const spritePos = (i)=>({
    bx:`${(i%SPRITE_COLS)/(SPRITE_COLS-1)*100}%`,
    by:`${Math.floor(i/SPRITE_COLS)/(SPRITE_ROWS-1)*100}%`
  });

  const IMG_DAY='assets/leaf_right.png', IMG_NIGHT='assets/leaf_rightN.png';
  let imgW=0,imgH=0,sample=[];
  const src = new Image(); src.crossOrigin='anonymous'; src.decoding='async';
  const maskURL = ()=> isDark()?IMG_NIGHT:IMG_DAY;

  async function rebuildSamples(){
    await new Promise(res=>{
      const u=maskURL();
      if(src.src && src.src.includes(u)) return res();
      src.onload=res; src.src=u;
    });
    const c = (typeof OffscreenCanvas!=='undefined')
      ? new OffscreenCanvas(src.naturalWidth||src.width, src.naturalHeight||src.height)
      : document.createElement('canvas');
    const ctx = c.getContext('2d',{willReadFrequently:true});
    imgW = c.width  = src.naturalWidth||src.width;
    imgH = c.height = src.naturalHeight||src.height;
    ctx.drawImage(src,0,0);
    const {data}=ctx.getImageData(0,0,imgW,imgH);
    sample.length=0;
    const STRIDE=Math.max(2, Math.round(Math.min(imgW,imgH)/160));
    for(let y=0;y<imgH;y+=STRIDE){
      for(let x=0;x<imgW;x+=STRIDE){
        const i=(y*imgW+x)*4, r=data[i], g=data[i+1], b=data[i+2];
        const Y=0.2126*r+0.7152*g+0.0722*b;
        if(Y>24) sample.push([x,y]);
      }
    }
  }

  function mapToPanel(x,y){
    const pr=rightPanel.getBoundingClientRect(), pw=pr.width, ph=pr.height;
    const ir=imgW/imgH, prr=pw/ph;
    let dw,dh,ox,oy;
    if(prr>=ir){ dh=ph; dw=dh*ir; ox=pr.right-dw; oy=pr.top+(ph-dh)/2; }
    else { dw=pw; dh=dw/ir; ox=pr.right-dw; oy=pr.top+(ph-dh)/2; }
    return { x: ox + (x/imgW)*dw, y: oy + (y/imgH)*dh };
  }

  let wind=-30, target=-30;
  function updateWind(dt){
    target += (Math.random()*20-10)*dt;
    target = Math.max(-120, Math.min(40, target));
    wind += (target - wind) * Math.min(1, dt*1.8);
  }

  const MAX=70;
  const leaves=[];

  function spawnOne(){
    if(sample.length===0 || leaves.length>=MAX) return;
    const pick = sample[(Math.random()*sample.length)|0];
    const {x,y}=mapToPanel(pick[0],pick[1]);

    const d=document.createElement('div');
    d.className='leaf';
    d.style.backgroundImage = `url("${isDark() ? SPRITE_NIGHT : SPRITE_DAY}")`;

    const size=16+Math.random()*26;
    const {bx,by}=spritePos((Math.random()*9)|0);
    d.style.setProperty('--w', size+'px');
    d.style.setProperty('--h', size+'px');
    d.style.setProperty('--bx', bx);
    d.style.setProperty('--by', by);
    d.style.opacity='1';
    layer.appendChild(d);

    leaves.push({
      el: d, x, y,
      vx: (-40 - Math.random()*60),
      vy: (30 + Math.random()*70),
      rot: (Math.random()*60-30)*Math.PI/180,
      spin:(80 + Math.random()*220)*(Math.random()<.5?-1:1)*Math.PI/180,
      swayA: 8 + Math.random()*18,
      swayF: 0.6 + Math.random()*0.9,
      life: 0, max: 7 + Math.random()*5,
      fade: 1.6,
      scroll0: pageScrollY(),
      fading: false,
      fadeStartLife: null
    });
  }

  let lastY=pageScrollY(), budget=0;
  function onScroll(){
    const y=pageScrollY(), dy=Math.abs(y-lastY); lastY=y;
    budget = Math.min(160, budget + dy*0.2);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  particlesRuntime.onScrollRef = onScroll;

  particlesRuntime.spawnTimer = setInterval(()=>{ if(Math.random()<.9) spawnOne(); }, 350);

  particlesRuntime.themeObserver = new MutationObserver(m=>{
    if(m.some(x=>x.type==='attributes'&&x.attributeName==='data-theme')){
      rebuildSamples().then(()=> {
        const url = isDark() ? SPRITE_NIGHT : SPRITE_DAY;
        document.querySelectorAll('.leaf').forEach(el => {
          el.style.backgroundImage = `url("${url}")`;
        });
      });
    }
  });
  particlesRuntime.themeObserver.observe(document.documentElement,{attributes:true});

  let prev = performance.now();
  particlesRuntime.running = true;

  function tick(t) {
    if (!particlesRuntime.running || window.innerWidth < CURTAIN_MIN_WIDTH) return;
    particlesRuntime.rafId = requestAnimationFrame(tick);
    const dt = Math.min(0.033, (t - prev) / 1000);
    prev = t;

    updateWind(dt);
    while (budget > 2) { spawnOne(); budget -= 2; }

    const vh = window.innerHeight;
    for (let i = leaves.length - 1; i >= 0; i--) {
      const L = leaves[i];
      L.vy += 240 * dt;
      const sway = L.swayA * Math.sin(t * 0.001 * L.swayF * 2 * Math.PI);
      L.vx += (wind - L.vx) * dt * 0.8;
      L.x += (L.vx + sway) * dt;
      L.y += L.vy * dt;
      L.rot += L.spin * dt;

      const dyScroll = pageScrollY() - L.scroll0;

      if ((L.max - L.life <= L.fade) || (L.y > vh && !L.fading)) {
        L.fading = true; L.fadeStartLife = L.life;
      }
      let scale=1, opacity=1;
      if (L.fading) {
        const progress = Math.min(1, (L.life - L.fadeStartLife) / L.fade);
        const eased = (1 - progress) ** 2;
        scale = eased; opacity = eased;
        if (progress >= 1) { L.el.remove(); leaves.splice(i,1); continue; }
      }
      L.el.style.opacity = opacity;
      L.el.style.transform = `translate(${L.x}px, ${L.y - dyScroll}px) rotate(${L.rot}rad) scale(${scale})`;
      L.life += dt;
    }
  }
  (async()=>{ await rebuildSamples(); particlesRuntime.rafId = requestAnimationFrame(tick); })();

  window.addEventListener('beforeunload', ()=> particlesRuntime.spawnTimer && clearInterval(particlesRuntime.spawnTimer), {once:true});
}

/* =========================
   Responsive toggle (auto)
========================= */
function onResizeToggle(){
  if (window.innerWidth < CURTAIN_MIN_WIDTH) {
    curtainRuntime.off();
    particlesRuntime.off();
  } else {
    // (Re)boot features si besoin
    if (!curtainRuntime.enabled) startCurtain();
    if (!particlesRuntime.running) initLeafParticles();
  }
}
// Debounce léger pour éviter le spam
let _resizeTick = null;
window.addEventListener('resize', ()=>{
  if (_resizeTick) cancelAnimationFrame(_resizeTick);
  _resizeTick = requestAnimationFrame(()=>{ _resizeTick = null; onResizeToggle(); });
}, {passive:true});
window.addEventListener('orientationchange', onResizeToggle, {passive:true});

// Boot initial (au cas où ce module est importé tôt)
queueMicrotask(onResizeToggle);
